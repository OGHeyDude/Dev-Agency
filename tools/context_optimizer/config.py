"""
Configuration management for Context Size Optimizer Tool.

This module provides centralized configuration management with support for
multiple optimization strategies and customizable parameters.
"""

import os
import yaml
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from pathlib import Path


@dataclass
class PruningConfig:
    """Configuration for content pruning strategies."""
    
    # Code pruning settings
    remove_comments: bool = True
    remove_docstrings: bool = False
    remove_blank_lines: bool = True
    remove_debug_prints: bool = True
    preserve_function_signatures: bool = True
    compress_whitespace: bool = True
    
    # Documentation pruning settings
    summarize_long_sections: bool = True
    remove_redundant_examples: bool = True
    preserve_api_references: bool = True
    max_section_length: int = 500
    
    # General pruning settings
    remove_imports_unused: bool = False  # Requires static analysis
    remove_dead_code: bool = False  # Requires sophisticated analysis


@dataclass
class TokenCountConfig:
    """Configuration for token counting."""
    
    model_name: str = "gpt-4"
    encoding_name: str = "cl100k_base"
    max_tokens: int = 128000
    safety_margin: int = 5000
    accurate_counting: bool = True


@dataclass
class CacheConfig:
    """Configuration for context caching."""
    
    enabled: bool = True
    cache_dir: str = ".context_cache"
    max_size_mb: int = 100
    ttl_hours: int = 24
    compression_enabled: bool = True


@dataclass
class PrioritizationConfig:
    """Configuration for content prioritization."""
    
    # File type weights
    file_type_weights: Dict[str, float] = field(default_factory=lambda: {
        "py": 1.0,
        "js": 1.0,
        "ts": 1.0,
        "java": 1.0,
        "md": 0.7,
        "txt": 0.5,
        "json": 0.8,
        "yaml": 0.8,
        "yml": 0.8,
        "xml": 0.6,
        "html": 0.6,
        "css": 0.6,
        "sql": 0.9,
    })
    
    # Content type weights
    content_type_weights: Dict[str, float] = field(default_factory=lambda: {
        "function_definition": 1.0,
        "class_definition": 0.9,
        "import_statement": 0.6,
        "comment": 0.3,
        "docstring": 0.5,
        "variable_declaration": 0.7,
        "test_code": 0.8,
    })
    
    # Recency weight (higher for recent changes)
    recency_weight: float = 0.2
    
    # Task relevance weight
    task_relevance_weight: float = 0.5


@dataclass
class OptimizationConfig:
    """Main optimization configuration."""
    
    # Strategy selection
    strategy: str = "balanced"  # balanced, aggressive, conservative
    target_reduction_percent: int = 30
    
    # Component configurations
    pruning: PruningConfig = field(default_factory=PruningConfig)
    token_counting: TokenCountConfig = field(default_factory=TokenCountConfig)
    caching: CacheConfig = field(default_factory=CacheConfig)
    prioritization: PrioritizationConfig = field(default_factory=PrioritizationConfig)
    
    # Performance settings
    max_processing_time_seconds: int = 30
    parallel_processing: bool = True
    max_workers: int = 4
    
    # Quality settings
    preserve_critical_content: bool = True
    validate_syntax: bool = False  # Expensive operation
    maintain_context_coherence: bool = True


class ConfigManager:
    """Manages configuration loading and strategy selection."""
    
    STRATEGY_PRESETS = {
        "balanced": {
            "target_reduction_percent": 30,
            "pruning": {
                "remove_comments": True,
                "remove_docstrings": False,
                "remove_blank_lines": True,
                "compress_whitespace": True,
            }
        },
        
        "aggressive": {
            "target_reduction_percent": 50,
            "pruning": {
                "remove_comments": True,
                "remove_docstrings": True,
                "remove_blank_lines": True,
                "compress_whitespace": True,
                "summarize_long_sections": True,
                "max_section_length": 300,
            }
        },
        
        "conservative": {
            "target_reduction_percent": 15,
            "pruning": {
                "remove_comments": False,
                "remove_docstrings": False,
                "remove_blank_lines": True,
                "compress_whitespace": True,
                "summarize_long_sections": False,
            }
        },
        
        "code_focused": {
            "target_reduction_percent": 35,
            "pruning": {
                "remove_comments": True,
                "remove_docstrings": True,
                "preserve_function_signatures": True,
                "compress_whitespace": True,
            },
            "prioritization": {
                "file_type_weights": {
                    "py": 1.0, "js": 1.0, "ts": 1.0, "java": 1.0,
                    "md": 0.3, "txt": 0.2
                }
            }
        },
        
        "documentation_focused": {
            "target_reduction_percent": 25,
            "pruning": {
                "remove_comments": False,
                "remove_docstrings": False,
                "summarize_long_sections": True,
                "preserve_api_references": True,
                "max_section_length": 600,
            },
            "prioritization": {
                "file_type_weights": {
                    "md": 1.0, "txt": 1.0, "rst": 1.0,
                    "py": 0.6, "js": 0.6
                }
            }
        }
    }
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize configuration manager."""
        self.config_path = config_path
        self._config = None
    
    def load_config(self, strategy: str = "balanced") -> OptimizationConfig:
        """Load configuration with optional strategy override."""
        if self._config is None:
            self._config = self._load_base_config()
        
        # Apply strategy preset if specified
        if strategy in self.STRATEGY_PRESETS:
            self._apply_strategy_preset(self._config, strategy)
        
        return self._config
    
    def _load_base_config(self) -> OptimizationConfig:
        """Load base configuration from file or defaults."""
        if self.config_path and os.path.exists(self.config_path):
            return self._load_from_file(self.config_path)
        else:
            return OptimizationConfig()
    
    def _load_from_file(self, config_path: str) -> OptimizationConfig:
        """Load configuration from YAML file."""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config_data = yaml.safe_load(f)
            
            # Convert nested dictionaries to dataclass instances
            return self._dict_to_config(config_data)
        
        except Exception as e:
            print(f"Warning: Could not load config from {config_path}: {e}")
            print("Using default configuration.")
            return OptimizationConfig()
    
    def _dict_to_config(self, config_dict: Dict[str, Any]) -> OptimizationConfig:
        """Convert dictionary to OptimizationConfig dataclass."""
        # This is a simplified conversion - in production, use a proper
        # serialization library like cattrs or dataclasses-json
        config = OptimizationConfig()
        
        if 'strategy' in config_dict:
            config.strategy = config_dict['strategy']
        if 'target_reduction_percent' in config_dict:
            config.target_reduction_percent = config_dict['target_reduction_percent']
        
        # Update nested configurations
        if 'pruning' in config_dict:
            for key, value in config_dict['pruning'].items():
                if hasattr(config.pruning, key):
                    setattr(config.pruning, key, value)
        
        if 'token_counting' in config_dict:
            for key, value in config_dict['token_counting'].items():
                if hasattr(config.token_counting, key):
                    setattr(config.token_counting, key, value)
        
        if 'caching' in config_dict:
            for key, value in config_dict['caching'].items():
                if hasattr(config.caching, key):
                    setattr(config.caching, key, value)
        
        return config
    
    def _apply_strategy_preset(self, config: OptimizationConfig, strategy: str):
        """Apply strategy preset to configuration."""
        preset = self.STRATEGY_PRESETS.get(strategy, {})
        
        # Apply top-level settings
        if 'target_reduction_percent' in preset:
            config.target_reduction_percent = preset['target_reduction_percent']
        
        # Apply pruning settings
        if 'pruning' in preset:
            for key, value in preset['pruning'].items():
                if hasattr(config.pruning, key):
                    setattr(config.pruning, key, value)
        
        # Apply prioritization settings
        if 'prioritization' in preset:
            prioritization_settings = preset['prioritization']
            if 'file_type_weights' in prioritization_settings:
                config.prioritization.file_type_weights.update(
                    prioritization_settings['file_type_weights']
                )
    
    def save_config(self, config: OptimizationConfig, path: str):
        """Save configuration to YAML file."""
        # Convert dataclass to dictionary
        config_dict = self._config_to_dict(config)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with open(path, 'w', encoding='utf-8') as f:
            yaml.dump(config_dict, f, default_flow_style=False, sort_keys=False)
    
    def _config_to_dict(self, config: OptimizationConfig) -> Dict[str, Any]:
        """Convert OptimizationConfig to dictionary for serialization."""
        # This is a simplified conversion - in production, use proper serialization
        return {
            'strategy': config.strategy,
            'target_reduction_percent': config.target_reduction_percent,
            'pruning': {
                'remove_comments': config.pruning.remove_comments,
                'remove_docstrings': config.pruning.remove_docstrings,
                'remove_blank_lines': config.pruning.remove_blank_lines,
                'compress_whitespace': config.pruning.compress_whitespace,
                'summarize_long_sections': config.pruning.summarize_long_sections,
                'preserve_api_references': config.pruning.preserve_api_references,
                'max_section_length': config.pruning.max_section_length,
            },
            'token_counting': {
                'model_name': config.token_counting.model_name,
                'max_tokens': config.token_counting.max_tokens,
                'safety_margin': config.token_counting.safety_margin,
            },
            'caching': {
                'enabled': config.caching.enabled,
                'cache_dir': config.caching.cache_dir,
                'max_size_mb': config.caching.max_size_mb,
                'ttl_hours': config.caching.ttl_hours,
            }
        }


# Default configuration instance
def get_default_config(strategy: str = "balanced") -> OptimizationConfig:
    """Get default configuration with optional strategy."""
    manager = ConfigManager()
    return manager.load_config(strategy)


# Configuration validation
def validate_config(config: OptimizationConfig) -> List[str]:
    """Validate configuration and return list of issues."""
    issues = []
    
    if config.target_reduction_percent < 0 or config.target_reduction_percent > 90:
        issues.append("target_reduction_percent must be between 0 and 90")
    
    if config.token_counting.max_tokens <= config.token_counting.safety_margin:
        issues.append("max_tokens must be greater than safety_margin")
    
    if config.caching.max_size_mb <= 0:
        issues.append("cache max_size_mb must be positive")
    
    if config.caching.ttl_hours <= 0:
        issues.append("cache ttl_hours must be positive")
    
    return issues