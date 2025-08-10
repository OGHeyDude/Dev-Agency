"""
Context Size Optimizer Tool

Intelligent context optimization for agent invocations with support for:
- Token counting and prediction
- Content analysis and classification  
- Intelligent pruning strategies
- Context prioritization
- Performance caching
- Real-time optimization
"""

from .optimizer import ContextOptimizer, OptimizationResult
from .config import OptimizationConfig, get_default_config
from .token_counter import TokenCounter, TokenCountResult
from .content_analyzer import ContextAnalyzer, ContentAnalysis, ContentType
from .prioritization import ContextPrioritizer, PrioritizationResult
from .cache_manager import ContextCache, CacheStats

__version__ = "1.0.0"
__author__ = "Dev-Agency"

__all__ = [
    "ContextOptimizer",
    "OptimizationResult", 
    "OptimizationConfig",
    "get_default_config",
    "TokenCounter",
    "TokenCountResult",
    "ContextAnalyzer",
    "ContentAnalysis",
    "ContentType",
    "ContextPrioritizer",
    "PrioritizationResult",
    "ContextCache",
    "CacheStats",
]