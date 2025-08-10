"""
Generic pruning strategies for unknown or mixed content types.
"""

import re
from typing import Dict, List, Tuple, Optional, Any
import logging

from .base import PruningStrategy, PruningResult

logger = logging.getLogger(__name__)


class GenericPruner(PruningStrategy):
    """Generic pruning strategy for unknown content types."""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        
        # Configuration options
        self.compress_whitespace = config.get('compress_whitespace', True)
        self.remove_empty_lines = config.get('remove_empty_lines', True)
        self.remove_repetitive_content = config.get('remove_repetitive_content', True)
        self.max_line_length = config.get('max_line_length', 200)
        self.preserve_structure = config.get('preserve_structure', True)
    
    def can_prune(self, content: str, content_type: str) -> bool:
        """Generic pruner can handle any content type as fallback."""
        return True  # Always available as fallback
    
    def prune(self, content: str, target_reduction: float = 0.3) -> PruningResult:
        """Apply generic pruning strategies that work for any content type."""
        operations = []
        pruned_content = content
        warnings = []
        
        try:
            # Apply safe, generic pruning strategies
            
            # 1. Compress whitespace (very safe)
            if self.compress_whitespace:
                original_size = len(pruned_content)
                pruned_content = self._compress_whitespace(pruned_content)
                if len(pruned_content) < original_size:
                    operations.append(f"compressed_whitespace_{original_size - len(pruned_content)}_chars")
            
            # 2. Remove excessive empty lines (safe)
            if self.remove_empty_lines:
                original_lines = len(pruned_content.splitlines())
                pruned_content = self._remove_excessive_empty_lines(pruned_content)
                new_lines = len(pruned_content.splitlines())
                if new_lines < original_lines:
                    operations.append(f"removed_{original_lines - new_lines}_empty_lines")
            
            # 3. Remove repetitive content (moderately safe)
            if self.remove_repetitive_content:
                pruned_content, removed_count = self._remove_repetitive_content(pruned_content)
                if removed_count > 0:
                    operations.append(f"removed_{removed_count}_repetitive_blocks")
            
            # 4. Truncate very long lines (less safe)
            if self.max_line_length > 0:
                pruned_content, truncated_lines = self._truncate_long_lines(
                    pruned_content, self.max_line_length
                )
                if truncated_lines > 0:
                    operations.append(f"truncated_{truncated_lines}_long_lines")
                    warnings.append("Some long lines were truncated - content may be incomplete")
            
            # Check if we need more aggressive pruning
            current_reduction = 1 - (len(pruned_content) / len(content))
            if current_reduction < target_reduction:
                pruned_content, extra_ops = self._apply_aggressive_generic_pruning(
                    pruned_content, target_reduction - current_reduction
                )
                operations.extend(extra_ops)
            
            # Validate the pruned content
            is_valid, validation_warnings = self.validate_pruned_content(content, pruned_content)
            warnings.extend(validation_warnings)
            
            if not is_valid:
                warnings.append("Aggressive pruning failed validation, using safer approach")
                pruned_content = self._safe_generic_prune(content)
                operations = ["safe_generic_pruning_fallback"]
            
            # Calculate quality score
            quality_score = self._calculate_generic_quality_score(content, pruned_content, operations)
            
            return PruningResult.create(
                original=content,
                pruned=pruned_content,
                operations=operations,
                quality_score=quality_score,
                warnings=warnings
            )
            
        except Exception as e:
            logger.error(f"Generic pruning failed: {e}")
            return PruningResult.create(
                original=content,
                pruned=content,  # Return original on error
                operations=["generic_pruning_failed"],
                quality_score=1.0,
                warnings=[f"Generic pruning failed: {e}"]
            )
    
    def estimate_reduction(self, content: str) -> float:
        """Estimate potential reduction for generic content."""
        lines = content.splitlines()
        
        # Count different types of reducible content
        empty_lines = sum(1 for line in lines if not line.strip())
        whitespace_chars = sum(len(line) - len(line.strip()) for line in lines)
        repetitive_blocks = self._count_repetitive_blocks(content)
        very_long_lines = sum(1 for line in lines if len(line) > self.max_line_length)
        
        total_chars = len(content)
        if total_chars == 0:
            return 0.0
        
        # Calculate potential reductions
        empty_line_reduction = (empty_lines * 10) / total_chars  # Assume 10 chars per line
        whitespace_reduction = whitespace_chars / total_chars
        repetitive_reduction = (repetitive_blocks * 100) / total_chars  # Assume 100 chars per block
        long_line_reduction = (very_long_lines * 50) / total_chars  # Conservative estimate
        
        # Conservative total estimate
        estimated_reduction = min(0.4, 
            empty_line_reduction + whitespace_reduction + repetitive_reduction + long_line_reduction
        )
        return max(0.0, estimated_reduction)
    
    def get_priority(self, content: str) -> int:
        """Generic pruner has lowest priority (fallback)."""
        return 100  # Lowest priority - used as fallback
    
    def _compress_whitespace(self, content: str) -> str:
        """Compress excessive whitespace while preserving basic structure."""
        lines = content.splitlines()
        compressed_lines = []
        
        for line in lines:
            # Preserve some indentation but compress excessive spaces/tabs
            leading_whitespace = len(line) - len(line.lstrip())
            
            if leading_whitespace > 0:
                # Preserve some indentation (convert tabs to 2 spaces max)
                indent_level = leading_whitespace // 4  # Assume 4-space indentation
                preserved_indent = '  ' * min(indent_level, 8)  # Max 16 spaces indentation
                
                # Compress internal whitespace
                compressed_content = re.sub(r'[ \t]+', ' ', line.strip())
                compressed_lines.append(preserved_indent + compressed_content)
            else:
                # No leading whitespace - just compress internal
                compressed_lines.append(re.sub(r'[ \t]+', ' ', line.strip()))
        
        return '\n'.join(compressed_lines)
    
    def _remove_excessive_empty_lines(self, content: str) -> str:
        """Remove excessive empty lines while preserving document structure."""
        lines = content.splitlines()
        cleaned_lines = []
        empty_count = 0
        
        for line in lines:
            if not line.strip():
                empty_count += 1
                # Keep at most 2 consecutive empty lines
                if empty_count <= 2:
                    cleaned_lines.append(line)
            else:
                empty_count = 0
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _remove_repetitive_content(self, content: str) -> Tuple[str, int]:
        """Remove repetitive blocks of text."""
        lines = content.splitlines()
        
        # Find repetitive line patterns
        line_counts = {}
        for line in lines:
            stripped = line.strip()
            if stripped and len(stripped) > 10:  # Only consider non-empty, substantial lines
                line_counts[stripped] = line_counts.get(stripped, 0) + 1
        
        # Identify lines that appear more than 3 times
        repetitive_lines = {line: count for line, count in line_counts.items() if count > 3}
        
        if not repetitive_lines:
            return content, 0
        
        # Remove excess occurrences (keep first 2 occurrences of each repetitive line)
        cleaned_lines = []
        line_occurrences = {line: 0 for line in repetitive_lines}
        removed_count = 0
        
        for line in lines:
            stripped = line.strip()
            
            if stripped in repetitive_lines:
                line_occurrences[stripped] += 1
                if line_occurrences[stripped] <= 2:
                    cleaned_lines.append(line)
                else:
                    removed_count += 1
            else:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines), removed_count
    
    def _truncate_long_lines(self, content: str, max_length: int) -> Tuple[str, int]:
        """Truncate very long lines to reasonable lengths."""
        lines = content.splitlines()
        truncated_lines = []
        truncation_count = 0
        
        for line in lines:
            if len(line) > max_length:
                # Try to truncate at word boundaries
                truncated = line[:max_length]
                
                # Find last space before truncation point
                last_space = truncated.rfind(' ')
                if last_space > max_length * 0.8:  # If we found a space in the last 20%
                    truncated = truncated[:last_space] + '...'
                else:
                    truncated = truncated + '...'
                
                truncated_lines.append(truncated)
                truncation_count += 1
            else:
                truncated_lines.append(line)
        
        return '\n'.join(truncated_lines), truncation_count
    
    def _apply_aggressive_generic_pruning(self, content: str, additional_target: float) -> Tuple[str, List[str]]:
        """Apply more aggressive generic pruning strategies."""
        operations = []
        
        # Remove all empty lines
        if additional_target > 0.1:
            content = re.sub(r'\n\s*\n', '\n', content)
            operations.append("removed_all_empty_lines")
        
        # Truncate to shorter line lengths
        if additional_target > 0.2:
            lines = content.splitlines()
            truncated_lines = []
            for line in lines:
                if len(line) > 100:
                    truncated_lines.append(line[:100] + '...')
                else:
                    truncated_lines.append(line)
            content = '\n'.join(truncated_lines)
            operations.append("aggressive_line_truncation")
        
        # Remove lines with only punctuation or symbols
        if additional_target > 0.3:
            lines = content.splitlines()
            filtered_lines = []
            for line in lines:
                # Keep lines that have at least some alphanumeric content
                if re.search(r'[a-zA-Z0-9]', line):
                    filtered_lines.append(line)
            content = '\n'.join(filtered_lines)
            operations.append("removed_non_content_lines")
        
        return content, operations
    
    def _safe_generic_prune(self, content: str) -> str:
        """Apply only the safest generic pruning operations."""
        # Only compress whitespace and remove excessive empty lines
        content = self._compress_whitespace(content)
        content = self._remove_excessive_empty_lines(content)
        return content
    
    def _calculate_generic_quality_score(self, original: str, pruned: str, operations: List[str]) -> float:
        """Calculate quality score for generic pruning."""
        base_score = 1.0
        
        # Penalty for aggressive operations
        if "aggressive_line_truncation" in operations:
            base_score -= 0.3
        if "removed_non_content_lines" in operations:
            base_score -= 0.2
        if "removed_all_empty_lines" in operations:
            base_score -= 0.1
        
        # Bonus for safe operations
        safe_operations = ["compressed_whitespace", "removed_empty_lines"]
        safe_count = sum(1 for op in operations if any(safe in op for safe in safe_operations))
        base_score += safe_count * 0.05
        
        # Check that content structure is roughly preserved
        original_lines = len(original.splitlines())
        pruned_lines = len(pruned.splitlines())
        
        if original_lines > 0:
            line_preservation = pruned_lines / original_lines
            base_score *= (0.6 + 0.4 * line_preservation)
        
        return max(0.0, min(1.0, base_score))
    
    def _count_repetitive_blocks(self, content: str) -> int:
        """Count blocks of repetitive content."""
        lines = content.splitlines()
        
        # Simple heuristic: count lines that appear multiple times
        line_counts = {}
        for line in lines:
            stripped = line.strip()
            if stripped and len(stripped) > 10:
                line_counts[stripped] = line_counts.get(stripped, 0) + 1
        
        # Count repetitive occurrences (beyond the first 2)
        repetitive_count = 0
        for count in line_counts.values():
            if count > 2:
                repetitive_count += count - 2
        
        return repetitive_count
    
    def validate_pruned_content(self, original: str, pruned: str) -> Tuple[bool, List[str]]:
        """Validate that pruned content maintains basic integrity."""
        is_valid, warnings = super().validate_pruned_content(original, pruned)
        
        # Additional generic validation
        if not is_valid:
            return False, warnings
        
        # Check that we haven't removed too much content
        reduction = 1 - (len(pruned) / len(original)) if len(original) > 0 else 0
        if reduction > 0.8:
            warnings.append("Excessive reduction (>80%) - may have removed critical content")
        
        # Check that basic structure is maintained (some lines preserved)
        original_lines = len(original.splitlines())
        pruned_lines = len(pruned.splitlines())
        
        if original_lines > 10 and pruned_lines < original_lines * 0.3:
            warnings.append("Significant structure loss - too many lines removed")
        
        return True, warnings