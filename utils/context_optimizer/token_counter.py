"""
Token counting module for Context Size Optimizer Tool.

This module provides accurate token counting for various language models
with support for different encodings and file types.
"""

import tiktoken
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
import logging
import re

# Configure logging
logger = logging.getLogger(__name__)


@dataclass
class TokenCountResult:
    """Result of token counting operation."""
    
    total_tokens: int
    tokens_by_section: Dict[str, int]
    tokens_by_file: Dict[str, int]
    encoding_used: str
    model_name: str
    estimated: bool = False
    
    def get_remaining_capacity(self, max_tokens: int, safety_margin: int = 1000) -> int:
        """Calculate remaining token capacity."""
        return max_tokens - self.total_tokens - safety_margin
    
    def is_within_limits(self, max_tokens: int, safety_margin: int = 1000) -> bool:
        """Check if token count is within limits."""
        return self.total_tokens + safety_margin <= max_tokens


class TokenCounter:
    """Advanced token counter with model-specific accuracy."""
    
    # Model encoding mappings
    MODEL_ENCODINGS = {
        "gpt-4": "cl100k_base",
        "gpt-4-turbo": "cl100k_base", 
        "gpt-3.5-turbo": "cl100k_base",
        "claude-3": "cl100k_base",  # Approximation
        "claude-sonnet": "cl100k_base",  # Approximation
        "text-davinci-003": "p50k_base",
        "text-davinci-002": "p50k_base",
    }
    
    # Estimated tokens per character for fallback counting
    CHARS_PER_TOKEN_ESTIMATES = {
        "code": 3.5,  # Code is more token-dense
        "documentation": 4.0,  # Natural language
        "json": 3.0,  # Structured data
        "xml": 2.5,   # Verbose markup
        "default": 4.0
    }
    
    def __init__(self, model_name: str = "gpt-4", encoding_name: Optional[str] = None):
        """Initialize token counter for specific model."""
        self.model_name = model_name
        self.encoding_name = encoding_name or self.MODEL_ENCODINGS.get(model_name, "cl100k_base")
        
        try:
            self.encoding = tiktoken.get_encoding(self.encoding_name)
            self.tiktoken_available = True
            logger.info(f"Initialized token counter with encoding: {self.encoding_name}")
        except Exception as e:
            logger.warning(f"Could not initialize tiktoken with {self.encoding_name}: {e}")
            self.encoding = None
            self.tiktoken_available = False
    
    def count_tokens(self, content: str, content_type: str = "default") -> int:
        """Count tokens in content with fallback estimation."""
        if not content:
            return 0
        
        if self.tiktoken_available and self.encoding:
            try:
                return len(self.encoding.encode(content))
            except Exception as e:
                logger.warning(f"Tiktoken encoding failed: {e}, falling back to estimation")
        
        # Fallback to character-based estimation
        return self._estimate_tokens_from_chars(content, content_type)
    
    def _estimate_tokens_from_chars(self, content: str, content_type: str) -> int:
        """Estimate token count from character count."""
        char_count = len(content)
        chars_per_token = self.CHARS_PER_TOKEN_ESTIMATES.get(content_type, 4.0)
        return int(char_count / chars_per_token) + 1  # +1 for safety
    
    def count_tokens_in_files(self, file_paths: List[str]) -> TokenCountResult:
        """Count tokens across multiple files."""
        total_tokens = 0
        tokens_by_file = {}
        tokens_by_section = {}
        
        for file_path in file_paths:
            try:
                path = Path(file_path)
                if not path.exists():
                    logger.warning(f"File not found: {file_path}")
                    continue
                
                with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                # Determine content type from file extension
                content_type = self._get_content_type(path.suffix)
                
                # Count tokens
                file_tokens = self.count_tokens(content, content_type)
                tokens_by_file[file_path] = file_tokens
                total_tokens += file_tokens
                
                # Count tokens by section (for code files)
                if content_type == "code":
                    section_tokens = self._count_tokens_by_section(content, path.suffix)
                    for section, count in section_tokens.items():
                        section_key = f"{path.name}:{section}"
                        tokens_by_section[section_key] = count
                
            except Exception as e:
                logger.error(f"Error processing file {file_path}: {e}")
                continue
        
        return TokenCountResult(
            total_tokens=total_tokens,
            tokens_by_section=tokens_by_section,
            tokens_by_file=tokens_by_file,
            encoding_used=self.encoding_name,
            model_name=self.model_name,
            estimated=not self.tiktoken_available
        )
    
    def _get_content_type(self, file_extension: str) -> str:
        """Determine content type from file extension."""
        extension = file_extension.lower().lstrip('.')
        
        code_extensions = {'py', 'js', 'ts', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt'}
        doc_extensions = {'md', 'txt', 'rst', 'tex'}
        data_extensions = {'json', 'yaml', 'yml', 'toml', 'ini'}
        markup_extensions = {'xml', 'html', 'htm', 'svg'}
        
        if extension in code_extensions:
            return "code"
        elif extension in doc_extensions:
            return "documentation"
        elif extension in data_extensions:
            return "json"
        elif extension in markup_extensions:
            return "xml"
        else:
            return "default"
    
    def _count_tokens_by_section(self, content: str, file_extension: str) -> Dict[str, int]:
        """Count tokens by code sections (functions, classes, etc.)."""
        sections = {}
        
        try:
            if file_extension.lower() in ['.py']:
                sections = self._parse_python_sections(content)
            elif file_extension.lower() in ['.js', '.ts']:
                sections = self._parse_javascript_sections(content)
            # Add more parsers as needed
            
        except Exception as e:
            logger.warning(f"Section parsing failed for {file_extension}: {e}")
        
        # Count tokens for each section
        token_sections = {}
        for section_name, section_content in sections.items():
            token_sections[section_name] = self.count_tokens(section_content, "code")
        
        return token_sections
    
    def _parse_python_sections(self, content: str) -> Dict[str, str]:
        """Parse Python code into sections."""
        sections = {}
        lines = content.split('\n')
        current_section = None
        current_content = []
        indent_level = 0
        
        for line in lines:
            stripped = line.strip()
            
            # Detect function or class definitions
            if re.match(r'^(def|class|async def)\s+\w+', stripped):
                # Save previous section
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Start new section
                match = re.match(r'^(def|class|async def)\s+(\w+)', stripped)
                if match:
                    section_type = match.group(1)
                    section_name = match.group(2)
                    current_section = f"{section_type}:{section_name}"
                    current_content = [line]
                    indent_level = len(line) - len(line.lstrip())
                
            elif current_section:
                # Continue current section if properly indented
                line_indent = len(line) - len(line.lstrip()) if line.strip() else indent_level + 1
                if line_indent > indent_level or not line.strip():
                    current_content.append(line)
                else:
                    # End of current section
                    if current_content:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = None
                    current_content = []
        
        # Save last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content)
        
        # Add imports and module-level code
        module_lines = []
        for line in lines:
            if line.strip().startswith(('import ', 'from ')) or (
                not re.match(r'^(def|class|async def)\s+\w+', line.strip()) and
                line.strip() and not line.strip().startswith('#')
            ):
                if not any(line in section for section in sections.values()):
                    module_lines.append(line)
        
        if module_lines:
            sections["module_level"] = '\n'.join(module_lines)
        
        return sections
    
    def _parse_javascript_sections(self, content: str) -> Dict[str, str]:
        """Parse JavaScript/TypeScript code into sections."""
        sections = {}
        
        # Simple regex-based parsing for functions
        # This is a basic implementation - production code would use AST parsing
        function_pattern = r'(function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|class\s+\w+)'
        
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if re.search(function_pattern, line):
                # Extract function name
                match = re.search(r'(function\s+(\w+)|const\s+(\w+)|class\s+(\w+))', line)
                if match:
                    name = match.group(2) or match.group(3) or match.group(4)
                    # Simple heuristic: include next 20 lines or until next function
                    section_lines = [line]
                    for j in range(i + 1, min(i + 20, len(lines))):
                        if re.search(function_pattern, lines[j]):
                            break
                        section_lines.append(lines[j])
                    
                    sections[f"function:{name}"] = '\n'.join(section_lines)
        
        return sections
    
    def predict_optimized_tokens(self, original_count: int, reduction_percent: int) -> int:
        """Predict token count after optimization."""
        reduction_factor = 1.0 - (reduction_percent / 100.0)
        return int(original_count * reduction_factor)
    
    def get_optimization_headroom(self, current_tokens: int, max_tokens: int, 
                                  safety_margin: int) -> Dict[str, int]:
        """Calculate optimization headroom and requirements."""
        available_tokens = max_tokens - safety_margin
        excess_tokens = max(0, current_tokens - available_tokens)
        required_reduction_percent = int((excess_tokens / current_tokens) * 100) if current_tokens > 0 else 0
        
        return {
            "available_tokens": available_tokens,
            "excess_tokens": excess_tokens,
            "required_reduction_percent": required_reduction_percent,
            "current_utilization_percent": int((current_tokens / max_tokens) * 100) if max_tokens > 0 else 0
        }
    
    def analyze_token_distribution(self, token_result: TokenCountResult) -> Dict[str, any]:
        """Analyze token distribution across files and sections."""
        analysis = {
            "total_files": len(token_result.tokens_by_file),
            "total_sections": len(token_result.tokens_by_section),
            "average_tokens_per_file": 0,
            "largest_files": [],
            "smallest_files": [],
            "token_hotspots": []
        }
        
        if token_result.tokens_by_file:
            # Calculate statistics
            token_counts = list(token_result.tokens_by_file.values())
            analysis["average_tokens_per_file"] = sum(token_counts) / len(token_counts)
            
            # Sort files by token count
            sorted_files = sorted(token_result.tokens_by_file.items(), 
                                key=lambda x: x[1], reverse=True)
            
            analysis["largest_files"] = sorted_files[:5]  # Top 5 largest
            analysis["smallest_files"] = sorted_files[-5:]  # Bottom 5 smallest
            
            # Identify token hotspots (files with >10% of total tokens)
            threshold = token_result.total_tokens * 0.1
            analysis["token_hotspots"] = [
                (file_path, tokens) for file_path, tokens in sorted_files
                if tokens > threshold
            ]
        
        return analysis