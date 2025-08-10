"""
Main pruning strategies orchestrator that coordinates different pruning approaches.
"""

import re
from typing import Dict, List, Tuple, Optional, Any
import logging

from .base import PruningStrategy, PruningResult
from .code_pruner import CodePruner
from .doc_pruner import DocumentationPruner
from .generic_pruner import GenericPruner

logger = logging.getLogger(__name__)


class PruningStrategies:
    """
    Orchestrates different pruning strategies based on content type and requirements.
    
    This class coordinates the application of specialized pruning strategies
    and provides a unified interface for content optimization.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize with configuration for all pruning strategies."""
        self.config = config or {}
        
        # Initialize specialized pruners
        self.code_pruner = CodePruner(config)
        self.doc_pruner = DocumentationPruner(config)
        self.generic_pruner = GenericPruner(config)
        
        # Strategy selection preferences
        self.strategy_preferences = {
            'code': [self.code_pruner, self.generic_pruner],
            'documentation': [self.doc_pruner, self.generic_pruner],
            'config': [self.generic_pruner],
            'data': [self.generic_pruner],
            'markup': [self.doc_pruner, self.generic_pruner],
            'unknown': [self.generic_pruner]
        }
    
    def prune_content(self, content: str, content_type: str, 
                     target_reduction: float = 0.3) -> PruningResult:
        """
        Apply the best pruning strategy for the given content.
        
        Args:
            content: Content to prune
            content_type: Type of content (code, documentation, etc.)
            target_reduction: Target reduction percentage (0.0 to 1.0)
            
        Returns:
            PruningResult with optimized content and statistics
        """
        try:
            # Get available strategies for this content type
            available_strategies = self.strategy_preferences.get(
                content_type.lower(), [self.generic_pruner]
            )
            
            # Try strategies in order of preference
            best_result = None
            best_score = -1
            
            for strategy in available_strategies:
                if strategy.can_prune(content, content_type):
                    try:
                        result = strategy.prune(content, target_reduction)
                        
                        # Score this result
                        score = self._score_pruning_result(result, target_reduction)
                        
                        if score > best_score:
                            best_result = result
                            best_score = score
                            
                    except Exception as e:
                        logger.warning(f"Strategy {strategy.name} failed: {e}")
                        continue
            
            if best_result:
                return best_result
            else:
                # Fallback to safe generic pruning
                logger.warning("All strategies failed, using safe fallback")
                return self.generic_pruner.prune(content, min(target_reduction, 0.1))
                
        except Exception as e:
            logger.error(f"Pruning orchestration failed: {e}")
            # Return original content on complete failure
            return PruningResult.create(
                original=content,
                pruned=content,
                operations=["pruning_completely_failed"],
                quality_score=1.0,
                warnings=[f"All pruning attempts failed: {e}"]
            )
    
    def estimate_best_reduction(self, content: str, content_type: str) -> float:
        """Estimate the best possible reduction for the given content."""
        available_strategies = self.strategy_preferences.get(
            content_type.lower(), [self.generic_pruner]
        )
        
        best_estimate = 0.0
        for strategy in available_strategies:
            if strategy.can_prune(content, content_type):
                try:
                    estimate = strategy.estimate_reduction(content)
                    best_estimate = max(best_estimate, estimate)
                except Exception as e:
                    logger.warning(f"Estimation failed for {strategy.name}: {e}")
                    continue
        
        return best_estimate
    
    def get_recommended_strategy(self, content: str, content_type: str) -> Optional[PruningStrategy]:
        """Get the recommended strategy for the given content."""
        available_strategies = self.strategy_preferences.get(
            content_type.lower(), [self.generic_pruner]
        )
        
        for strategy in available_strategies:
            if strategy.can_prune(content, content_type):
                return strategy
        
        return self.generic_pruner
    
    def prune_with_multiple_strategies(self, content: str, content_type: str,
                                     target_reduction: float = 0.3) -> List[PruningResult]:
        """
        Try multiple strategies and return results from all applicable ones.
        
        Useful for comparing different approaches or combining results.
        """
        results = []
        available_strategies = self.strategy_preferences.get(
            content_type.lower(), [self.generic_pruner]
        )
        
        for strategy in available_strategies:
            if strategy.can_prune(content, content_type):
                try:
                    result = strategy.prune(content, target_reduction)
                    results.append(result)
                except Exception as e:
                    logger.warning(f"Strategy {strategy.name} failed: {e}")
                    continue
        
        return results
    
    def _score_pruning_result(self, result: PruningResult, target_reduction: float) -> float:
        """
        Score a pruning result based on multiple criteria.
        
        Higher scores indicate better results.
        """
        # Base score from quality
        score = result.quality_score * 100
        
        # Bonus for achieving target reduction
        reduction_achieved = result.reduction_percentage / 100
        if reduction_achieved >= target_reduction:
            score += 20  # Bonus for meeting target
        else:
            # Penalty for not meeting target
            shortfall = target_reduction - reduction_achieved
            score -= shortfall * 50
        
        # Penalty for warnings
        score -= len(result.warnings) * 5
        
        # Bonus for safe operations
        safe_operations = ['compressed_whitespace', 'removed_empty_lines', 'removed_debug_statements']
        safe_count = sum(1 for op in result.operations_applied 
                        if any(safe in op for safe in safe_operations))
        score += safe_count * 2
        
        # Penalty for aggressive operations
        aggressive_operations = ['aggressive', 'removed_all', 'truncated']
        aggressive_count = sum(1 for op in result.operations_applied
                             if any(agg in op for agg in aggressive_operations))
        score -= aggressive_count * 5
        
        return max(0, score)
    
    def remove_comments(self, content: str, file_type: str) -> Tuple[str, Dict[str, Any]]:
        """Remove comments from content based on file type."""
        if file_type.lower() in ['python', 'py', 'javascript', 'js', 'java', 'cpp', 'c']:
            result = self.code_pruner.prune(content, 0.1)  # Light pruning focused on comments
            return result.pruned_content, {
                "reduction_percentage": result.reduction_percentage,
                "operations": result.operations_applied
            }
        else:
            # Generic comment removal
            result = self.generic_pruner.prune(content, 0.05)
            return result.pruned_content, {
                "reduction_percentage": result.reduction_percentage,
                "operations": result.operations_applied
            }
    
    def remove_dead_code(self, content: str, file_type: str) -> Tuple[str, Dict[str, Any]]:
        """Remove dead code (basic implementation)."""
        if file_type.lower() in ['python', 'py', 'javascript', 'js', 'java', 'cpp', 'c']:
            # Use code pruner with focus on dead code removal
            config = {**self.config, 'remove_debug_prints': True, 'remove_unused_imports': True}
            pruner = CodePruner(config)
            result = pruner.prune(content, 0.2)
            return result.pruned_content, {
                "reduction_percentage": result.reduction_percentage,
                "operations": result.operations_applied
            }
        else:
            # For non-code files, just remove repetitive content
            result = self.generic_pruner.prune(content, 0.1)
            return result.pruned_content, {
                "reduction_percentage": result.reduction_percentage,
                "operations": result.operations_applied
            }
    
    def compress_whitespace(self, content: str) -> Tuple[str, Dict[str, Any]]:
        """Compress whitespace in content."""
        # Use generic pruner for whitespace compression
        config = {**self.config, 'compress_whitespace': True, 'remove_empty_lines': True}
        pruner = GenericPruner(config)
        result = pruner.prune(content, 0.05)  # Light compression
        
        return result.pruned_content, {
            "reduction_percentage": result.reduction_percentage,
            "operations": result.operations_applied
        }
    
    def smart_truncate(self, content: str, target_size: int, agent_type: str, 
                      task_description: str) -> Tuple[str, Dict[str, Any]]:
        """
        Smart truncation that preserves important content based on agent needs.
        
        This is the most aggressive pruning strategy, used when other methods
        haven't achieved the required size reduction.
        """
        try:
            current_size = len(content.encode('utf-8'))
            if current_size <= target_size:
                return content, {"no_truncation_needed": True}
            
            # Calculate how much we need to reduce
            reduction_needed = 1 - (target_size / current_size)
            
            # Apply agent-specific smart truncation
            if agent_type == 'architect':
                # Preserve class/function definitions, remove implementations
                truncated = self._truncate_for_architect(content, reduction_needed)
            elif agent_type == 'security':
                # Preserve imports, auth patterns, remove examples
                truncated = self._truncate_for_security(content, reduction_needed)
            elif agent_type == 'documenter':
                # Preserve headers and key sections, remove examples
                truncated = self._truncate_for_documenter(content, reduction_needed)
            else:
                # Generic smart truncation
                truncated = self._generic_smart_truncate(content, reduction_needed)
            
            # Ensure we've met the target
            if len(truncated.encode('utf-8')) > target_size:
                # Final hard truncation if needed
                max_chars = int(target_size * 0.8)  # Leave some safety margin
                truncated = truncated[:max_chars] + '\n\n[... content truncated ...]'
            
            final_size = len(truncated.encode('utf-8'))
            reduction_percentage = (1 - final_size / current_size) * 100
            
            return truncated, {
                "reduction_percentage": reduction_percentage,
                "operations": [f"smart_truncate_for_{agent_type}"],
                "original_size": current_size,
                "final_size": final_size
            }
            
        except Exception as e:
            logger.error(f"Smart truncation failed: {e}")
            # Fallback to simple truncation
            max_chars = int(target_size * 0.8)
            simple_truncated = content[:max_chars] + '\n[... truncated ...]'
            return simple_truncated, {
                "reduction_percentage": 50.0,
                "operations": ["simple_truncation_fallback"],
                "error": str(e)
            }
    
    def _truncate_for_architect(self, content: str, reduction_needed: float) -> str:
        """Truncate content preserving architectural information."""
        lines = content.splitlines()
        
        # Preserve: class definitions, function signatures, imports, docstrings
        important_lines = []
        regular_lines = []
        
        in_function = False
        function_indent = 0
        
        for line in lines:
            stripped = line.strip()
            current_indent = len(line) - len(line.lstrip())
            
            # Always preserve these patterns
            if (stripped.startswith(('class ', 'def ', 'import ', 'from ')) or
                stripped.startswith(('"""', "'''")) or
                stripped.startswith('#') and any(keyword in stripped.lower() 
                                               for keyword in ['todo', 'fixme', 'note', 'important'])):
                important_lines.append(line)
                
                if stripped.startswith('def '):
                    in_function = True
                    function_indent = current_indent
            elif in_function:
                # In a function - only keep signature and first few lines
                if current_indent > function_indent:
                    # Function body - only keep first line or docstring
                    if (len(important_lines) == 1 or 
                        stripped.startswith(('"""', "'''", 'return', 'raise'))):
                        important_lines.append(line)
                else:
                    # End of function
                    in_function = False
                    regular_lines.append(line)
            else:
                regular_lines.append(line)
        
        # Calculate how many regular lines to keep
        total_important = len(important_lines)
        total_regular = len(regular_lines)
        
        if total_important + total_regular == 0:
            return content
        
        lines_to_remove = int((total_important + total_regular) * reduction_needed)
        regular_lines_to_keep = max(0, total_regular - lines_to_remove)
        
        # Keep most important regular lines (beginning and end)
        if regular_lines_to_keep > 0:
            keep_start = regular_lines_to_keep // 2
            keep_end = regular_lines_to_keep - keep_start
            kept_regular = regular_lines[:keep_start] + regular_lines[-keep_end:]
        else:
            kept_regular = []
        
        # Combine and return
        result_lines = important_lines + kept_regular
        return '\n'.join(result_lines)
    
    def _truncate_for_security(self, content: str, reduction_needed: float) -> str:
        """Truncate content preserving security-relevant information."""
        lines = content.splitlines()
        
        # Security-relevant patterns
        security_patterns = [
            r'import.*auth', r'import.*security', r'import.*crypto',
            r'def.*auth', r'def.*login', r'def.*secure',
            r'password', r'token', r'key', r'secret', r'hash',
            r'permission', r'access', r'role', r'admin'
        ]
        
        important_lines = []
        regular_lines = []
        
        for line in lines:
            line_lower = line.lower()
            
            # Check if this line contains security-relevant content
            is_security_relevant = any(
                re.search(pattern, line_lower) for pattern in security_patterns
            )
            
            if is_security_relevant or line.strip().startswith(('import ', 'from ')):
                important_lines.append(line)
            else:
                regular_lines.append(line)
        
        # Keep all important lines and reduce regular lines
        lines_to_remove = int(len(regular_lines) * reduction_needed)
        regular_lines_to_keep = max(0, len(regular_lines) - lines_to_remove)
        
        if regular_lines_to_keep > 0:
            kept_regular = regular_lines[:regular_lines_to_keep]
        else:
            kept_regular = []
        
        result_lines = important_lines + kept_regular
        return '\n'.join(result_lines)
    
    def _truncate_for_documenter(self, content: str, reduction_needed: float) -> str:
        """Truncate content preserving documentation structure."""
        lines = content.splitlines()
        
        important_lines = []
        regular_lines = []
        
        for line in lines:
            stripped = line.strip()
            
            # Preserve headers, API references, and structural elements
            if (stripped.startswith('#') or  # Headers
                any(keyword in stripped.lower() for keyword in 
                    ['api', 'usage', 'example', 'parameter', 'return', 'note', 'warning']) or
                stripped.startswith(('```', ':::')) or  # Code blocks
                stripped.startswith(('*', '-', '+', '1.')) or  # Lists
                re.match(r'^\w+:', stripped)):  # Definition lists
                important_lines.append(line)
            else:
                regular_lines.append(line)
        
        # Reduce regular lines
        lines_to_remove = int(len(regular_lines) * reduction_needed)
        regular_lines_to_keep = max(0, len(regular_lines) - lines_to_remove)
        
        if regular_lines_to_keep > 0:
            # Keep paragraphs that are closer to important sections
            kept_regular = regular_lines[:regular_lines_to_keep]
        else:
            kept_regular = []
        
        result_lines = important_lines + kept_regular
        return '\n'.join(result_lines)
    
    def _generic_smart_truncate(self, content: str, reduction_needed: float) -> str:
        """Generic smart truncation that preserves structure."""
        lines = content.splitlines()
        
        # Score lines by importance
        scored_lines = []
        for i, line in enumerate(lines):
            score = self._score_line_importance(line, i, len(lines))
            scored_lines.append((score, i, line))
        
        # Sort by score (highest first)
        scored_lines.sort(reverse=True)
        
        # Keep top-scored lines based on reduction needed
        lines_to_keep = int(len(lines) * (1 - reduction_needed))
        kept_lines = sorted(scored_lines[:lines_to_keep], key=lambda x: x[1])  # Sort by original position
        
        return '\n'.join(line for _, _, line in kept_lines)
    
    def _score_line_importance(self, line: str, line_number: int, total_lines: int) -> float:
        """Score a line's importance for preservation during truncation."""
        score = 0.0
        stripped = line.strip()
        
        # Empty lines have low importance
        if not stripped:
            return 0.1
        
        # Position-based scoring
        if line_number < total_lines * 0.1:  # First 10%
            score += 0.3
        elif line_number > total_lines * 0.9:  # Last 10%
            score += 0.2
        
        # Content-based scoring
        if any(keyword in stripped.lower() for keyword in 
               ['important', 'note', 'warning', 'todo', 'fixme', 'critical']):
            score += 0.5
        
        if stripped.startswith(('#', '//', '/*', '"""', "'''")):
            score += 0.2  # Comments might be important
        
        if re.match(r'^(def|class|function|import|from)\s+', stripped):
            score += 0.4  # Structural elements
        
        if len(stripped) > 100:
            score += 0.1  # Longer lines might have more content
        
        return score