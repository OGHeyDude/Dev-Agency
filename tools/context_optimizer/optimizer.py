"""
Context Optimizer - Main optimization engine
"""

import json
import hashlib
from typing import Dict, List, Optional, Tuple
from pathlib import Path

from .analyzer import ContextAnalyzer
from .cache import ContextCache
from .strategies import PruningStrategies
from .config import OptimizerConfig


class ContextOptimizer:
    """
    Intelligent context optimization for agent invocations.
    
    Provides token counting, content pruning, and caching for optimized contexts.
    """
    
    def __init__(self, config: Optional[OptimizerConfig] = None):
        self.config = config or OptimizerConfig()
        self.analyzer = ContextAnalyzer()
        self.cache = ContextCache(max_size=self.config.cache_size)
        self.strategies = PruningStrategies(self.config)
        self.metrics = {
            "optimizations_count": 0,
            "total_size_reduction": 0,
            "cache_hits": 0,
            "cache_misses": 0
        }
    
    def optimize_context(
        self, 
        content: str, 
        agent_type: str, 
        task_description: str,
        target_size: Optional[int] = None
    ) -> Tuple[str, Dict]:
        """
        Optimize context content for specific agent and task.
        
        Args:
            content: Raw content to optimize
            agent_type: Type of agent (architect, coder, etc.)
            task_description: Description of the task
            target_size: Target token count (optional)
            
        Returns:
            Tuple of (optimized_content, optimization_stats)
        """
        # Generate cache key
        cache_key = self._generate_cache_key(content, agent_type, task_description)
        
        # Check cache first
        cached_result = self.cache.get(cache_key)
        if cached_result:
            self.metrics["cache_hits"] += 1
            return cached_result["content"], cached_result["stats"]
        
        self.metrics["cache_misses"] += 1
        
        # Analyze original content
        original_stats = self.analyzer.analyze_content(content)
        target_size = target_size or self.config.default_target_size
        
        # Determine if optimization is needed
        if original_stats["token_count"] <= target_size:
            return content, {"optimization_needed": False, **original_stats}
        
        # Apply optimization strategies
        optimized_content = content
        optimization_steps = []
        
        # Strategy 1: Remove comments and docstrings (if configured)
        if self.config.remove_comments:
            optimized_content, step_stats = self.strategies.remove_comments(
                optimized_content, 
                original_stats["file_type"]
            )
            optimization_steps.append(("remove_comments", step_stats))
        
        # Strategy 2: Remove dead code
        if self.config.remove_dead_code:
            optimized_content, step_stats = self.strategies.remove_dead_code(
                optimized_content,
                original_stats["file_type"]
            )
            optimization_steps.append(("remove_dead_code", step_stats))
        
        # Strategy 3: Compress whitespace
        optimized_content, step_stats = self.strategies.compress_whitespace(
            optimized_content
        )
        optimization_steps.append(("compress_whitespace", step_stats))
        
        # Strategy 4: Smart truncation if still too large
        final_stats = self.analyzer.analyze_content(optimized_content)
        if final_stats["token_count"] > target_size:
            optimized_content, step_stats = self.strategies.smart_truncate(
                optimized_content,
                target_size,
                agent_type,
                task_description
            )
            optimization_steps.append(("smart_truncate", step_stats))
            final_stats = self.analyzer.analyze_content(optimized_content)
        
        # Compile optimization results
        size_reduction = original_stats["token_count"] - final_stats["token_count"]
        reduction_percentage = (size_reduction / original_stats["token_count"]) * 100
        
        result_stats = {
            "optimization_needed": True,
            "original_size": original_stats["token_count"],
            "optimized_size": final_stats["token_count"],
            "size_reduction": size_reduction,
            "reduction_percentage": reduction_percentage,
            "optimization_steps": optimization_steps,
            "quality_preserved": self._assess_quality_preservation(
                content, optimized_content, agent_type
            )
        }
        
        # Cache the result
        self.cache.set(cache_key, {
            "content": optimized_content,
            "stats": result_stats
        })
        
        # Update metrics
        self.metrics["optimizations_count"] += 1
        self.metrics["total_size_reduction"] += size_reduction
        
        return optimized_content, result_stats
    
    def predict_token_count(self, content: str) -> int:
        """
        Predict token count for content without full analysis.
        Fast estimation for token limit prevention.
        """
        return self.analyzer.estimate_tokens(content)
    
    def get_optimization_metrics(self) -> Dict:
        """Get current optimization metrics."""
        if self.metrics["optimizations_count"] > 0:
            avg_reduction = (
                self.metrics["total_size_reduction"] / 
                self.metrics["optimizations_count"]
            )
        else:
            avg_reduction = 0
            
        cache_hit_rate = (
            self.metrics["cache_hits"] / 
            (self.metrics["cache_hits"] + self.metrics["cache_misses"])
        ) if (self.metrics["cache_hits"] + self.metrics["cache_misses"]) > 0 else 0
        
        return {
            **self.metrics,
            "average_size_reduction": avg_reduction,
            "cache_hit_rate": cache_hit_rate
        }
    
    def clear_cache(self):
        """Clear the optimization cache."""
        self.cache.clear()
    
    def _generate_cache_key(
        self, 
        content: str, 
        agent_type: str, 
        task_description: str
    ) -> str:
        """Generate unique cache key for optimization request."""
        key_string = f"{agent_type}:{task_description}:{hashlib.md5(content.encode()).hexdigest()}"
        return hashlib.sha256(key_string.encode()).hexdigest()[:16]
    
    def _assess_quality_preservation(
        self, 
        original: str, 
        optimized: str, 
        agent_type: str
    ) -> Dict:
        """
        Assess whether optimization preserved content quality.
        Simple heuristics-based assessment.
        """
        original_lines = len(original.splitlines())
        optimized_lines = len(optimized.splitlines())
        
        # Check for critical content preservation based on agent type
        if agent_type == "architect":
            # Architect needs class/function structure
            original_functions = original.count("def ") + original.count("class ")
            optimized_functions = optimized.count("def ") + optimized.count("class ")
            structure_preserved = optimized_functions >= (original_functions * 0.9)
        elif agent_type == "security":
            # Security needs imports and authentication patterns
            structure_preserved = ("import " in optimized) and \
                                 (any(keyword in optimized for keyword in ["auth", "token", "secure"]))
        else:
            # General quality check - ensure major structure remains
            structure_preserved = (optimized_lines >= original_lines * 0.5)
        
        return {
            "structure_preserved": structure_preserved,
            "line_reduction_ratio": (original_lines - optimized_lines) / original_lines,
            "content_coherence": len(optimized.strip()) > 0
        }


class OptimizationResult:
    """Container for optimization results with helpful methods."""
    
    def __init__(self, content: str, stats: Dict):
        self.content = content
        self.stats = stats
    
    @property
    def was_optimized(self) -> bool:
        return self.stats.get("optimization_needed", False)
    
    @property
    def reduction_percentage(self) -> float:
        return self.stats.get("reduction_percentage", 0.0)
    
    @property
    def quality_preserved(self) -> bool:
        quality = self.stats.get("quality_preserved", {})
        return quality.get("structure_preserved", False)
    
    def __str__(self) -> str:
        if self.was_optimized:
            return f"Optimized content (reduced by {self.reduction_percentage:.1f}%)"
        return "Content required no optimization"