"""
Base classes for pruning strategies.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass

@dataclass
class PruningResult:
    """Result of a pruning operation."""
    
    original_content: str
    pruned_content: str
    original_size: int
    pruned_size: int
    reduction_bytes: int
    reduction_percentage: float
    operations_applied: List[str]
    quality_score: float
    warnings: List[str]
    
    @classmethod
    def create(cls, original: str, pruned: str, operations: List[str], 
               quality_score: float = 0.9, warnings: List[str] = None) -> 'PruningResult':
        """Create a PruningResult with calculated metrics."""
        original_size = len(original.encode('utf-8'))
        pruned_size = len(pruned.encode('utf-8'))
        reduction_bytes = original_size - pruned_size
        reduction_percentage = (reduction_bytes / original_size * 100) if original_size > 0 else 0
        
        return cls(
            original_content=original,
            pruned_content=pruned,
            original_size=original_size,
            pruned_size=pruned_size,
            reduction_bytes=reduction_bytes,
            reduction_percentage=reduction_percentage,
            operations_applied=operations or [],
            quality_score=quality_score,
            warnings=warnings or []
        )


class PruningStrategy(ABC):
    """Abstract base class for all pruning strategies."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize pruning strategy with configuration."""
        self.config = config or {}
        self.name = self.__class__.__name__
    
    @abstractmethod
    def can_prune(self, content: str, content_type: str) -> bool:
        """Check if this strategy can be applied to the given content."""
        pass
    
    @abstractmethod
    def prune(self, content: str, target_reduction: float = 0.3) -> PruningResult:
        """
        Apply pruning strategy to content.
        
        Args:
            content: Content to prune
            target_reduction: Target reduction as percentage (0.0 to 1.0)
            
        Returns:
            PruningResult with original and pruned content
        """
        pass
    
    @abstractmethod
    def estimate_reduction(self, content: str) -> float:
        """Estimate potential reduction percentage for this strategy."""
        pass
    
    def get_priority(self, content: str) -> int:
        """
        Get priority for this strategy (lower number = higher priority).
        
        Used to determine order of application when multiple strategies are available.
        """
        return 50  # Default medium priority
    
    def validate_pruned_content(self, original: str, pruned: str) -> Tuple[bool, List[str]]:
        """
        Validate that pruned content maintains essential structure.
        
        Returns:
            Tuple of (is_valid, list_of_warnings)
        """
        warnings = []
        
        # Basic validation: ensure content isn't empty
        if not pruned.strip():
            warnings.append("Pruned content is empty")
            return False, warnings
        
        # Check for excessive reduction
        reduction = 1 - (len(pruned) / len(original)) if len(original) > 0 else 0
        if reduction > 0.9:
            warnings.append("Excessive reduction (>90%) may have removed critical content")
        
        return True, warnings