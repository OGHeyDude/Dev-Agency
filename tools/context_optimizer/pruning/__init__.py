"""
Pruning strategies for Context Size Optimizer.

This package provides intelligent content removal strategies that preserve
critical information while achieving significant size reductions.
"""

from .base import PruningStrategy
from .code_pruner import CodePruner  
from .doc_pruner import DocumentationPruner
from .generic_pruner import GenericPruner
from .strategies import PruningStrategies

__all__ = [
    'PruningStrategy',
    'CodePruner',
    'DocumentationPruner', 
    'GenericPruner',
    'PruningStrategies'
]