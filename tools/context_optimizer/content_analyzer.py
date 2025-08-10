"""
Content Analyzer for Context Size Optimizer Tool.

This module provides intelligent analysis of content types, complexity scoring,
and relevance assessment for optimization strategies.
"""

import re
import ast
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
from dataclasses import dataclass
from enum import Enum

# Configure logging
logger = logging.getLogger(__name__)


class ContentType(Enum):
    """Content type classifications."""
    CODE = "code"
    DOCUMENTATION = "documentation"
    CONFIG = "config"
    DATA = "data"
    MARKUP = "markup"
    UNKNOWN = "unknown"


@dataclass
class ContentSection:
    """Represents a section of content with metadata."""
    
    name: str
    content: str
    start_line: int
    end_line: int
    section_type: str
    complexity_score: float
    token_count: int
    importance_score: float


@dataclass
class ContentAnalysis:
    """Complete analysis result for content."""
    
    content_type: ContentType
    file_extension: str
    total_lines: int
    total_tokens: int
    complexity_score: float
    sections: List[ContentSection]
    metadata: Dict[str, Any]
    optimization_opportunities: List[str]


class ContextAnalyzer:
    """Advanced content analyzer for optimization strategies."""
    
    # File extension mappings
    EXTENSION_MAPPING = {
        # Code files
        ".py": ContentType.CODE, ".pyx": ContentType.CODE,
        ".js": ContentType.CODE, ".ts": ContentType.CODE, ".jsx": ContentType.CODE, ".tsx": ContentType.CODE,
        ".java": ContentType.CODE, ".kt": ContentType.CODE, ".scala": ContentType.CODE,
        ".cpp": ContentType.CODE, ".c": ContentType.CODE, ".h": ContentType.CODE, ".hpp": ContentType.CODE,
        ".cs": ContentType.CODE, ".vb": ContentType.CODE,
        ".go": ContentType.CODE, ".rs": ContentType.CODE, ".rb": ContentType.CODE,
        ".php": ContentType.CODE, ".swift": ContentType.CODE,
        ".sql": ContentType.CODE,
        
        # Documentation files
        ".md": ContentType.DOCUMENTATION, ".rst": ContentType.DOCUMENTATION,
        ".txt": ContentType.DOCUMENTATION, ".tex": ContentType.DOCUMENTATION,
        ".adoc": ContentType.DOCUMENTATION, ".org": ContentType.DOCUMENTATION,
        
        # Config files
        ".json": ContentType.CONFIG, ".yaml": ContentType.CONFIG, ".yml": ContentType.CONFIG,
        ".toml": ContentType.CONFIG, ".ini": ContentType.CONFIG, ".cfg": ContentType.CONFIG,
        ".conf": ContentType.CONFIG, ".properties": ContentType.CONFIG,
        
        # Markup files
        ".html": ContentType.MARKUP, ".htm": ContentType.MARKUP,
        ".xml": ContentType.MARKUP, ".svg": ContentType.MARKUP,
        ".xhtml": ContentType.MARKUP,
        
        # Data files
        ".csv": ContentType.DATA, ".tsv": ContentType.DATA,
        ".parquet": ContentType.DATA, ".avro": ContentType.DATA,
    }
    
    def __init__(self):
        """Initialize the content analyzer."""
        self.code_patterns = {
            "function_def": [
                r"^def\s+\w+\s*\(",  # Python
                r"function\s+\w+\s*\(",  # JavaScript
                r"public\s+\w+\s+\w+\s*\(",  # Java
                r"fn\s+\w+\s*\(",  # Rust
            ],
            "class_def": [
                r"^class\s+\w+",  # Python, Java, C#
                r"struct\s+\w+",  # C++, Rust
                r"interface\s+\w+",  # TypeScript, Java
            ],
            "import_stmt": [
                r"^import\s+",  # Python
                r"^from\s+\w+\s+import",  # Python
                r"^#include\s+",  # C/C++
                r"import\s+.*from",  # JavaScript/TypeScript
            ],
            "comment": [
                r"^\s*#",  # Python, shell
                r"^\s*//",  # C-style
                r"^\s*/\*",  # C-style block start
                r"^\s*\*",  # C-style block continuation
            ],
            "docstring": [
                r'^\s*"""',  # Python docstring
                r"^\s*'''",  # Python docstring alt
                r"^\s*/\*\*",  # JSDoc
            ]
        }
    
    def analyze_content(self, content: str, file_path: Optional[str] = None) -> ContentAnalysis:
        """
        Perform comprehensive content analysis.
        
        Args:
            content: The content to analyze
            file_path: Optional file path for context
            
        Returns:
            Complete analysis result
        """
        try:
            # Determine content type
            content_type = self._detect_content_type(content, file_path)
            file_ext = Path(file_path).suffix if file_path else ""
            
            # Basic metrics
            lines = content.splitlines()
            total_lines = len(lines)
            
            # Estimate token count (lightweight)
            total_tokens = self._estimate_token_count(content)
            
            # Analyze sections
            sections = self._analyze_sections(content, content_type)
            
            # Calculate complexity score
            complexity_score = self._calculate_complexity_score(content, content_type, sections)
            
            # Identify optimization opportunities
            optimization_opportunities = self._identify_optimization_opportunities(
                content, content_type, sections
            )
            
            # Gather metadata
            metadata = self._extract_metadata(content, content_type, file_path)
            
            return ContentAnalysis(
                content_type=content_type,
                file_extension=file_ext,
                total_lines=total_lines,
                total_tokens=total_tokens,
                complexity_score=complexity_score,
                sections=sections,
                metadata=metadata,
                optimization_opportunities=optimization_opportunities
            )
            
        except Exception as e:
            logger.error(f"Content analysis failed: {e}")
            # Return minimal analysis on error
            return ContentAnalysis(
                content_type=ContentType.UNKNOWN,
                file_extension=file_ext if file_path else "",
                total_lines=len(content.splitlines()),
                total_tokens=len(content.split()) * 1.3,  # Rough estimation
                complexity_score=0.5,
                sections=[],
                metadata={},
                optimization_opportunities=[]
            )
    
    def _detect_content_type(self, content: str, file_path: Optional[str]) -> ContentType:
        """Detect content type from file extension and content analysis."""
        if file_path:
            ext = Path(file_path).suffix.lower()
            if ext in self.EXTENSION_MAPPING:
                return self.EXTENSION_MAPPING[ext]
        
        # Fallback to content-based detection
        return self._detect_type_from_content(content)
    
    def _detect_type_from_content(self, content: str) -> ContentType:
        """Detect content type from content patterns."""
        content_lower = content.lower()
        lines = content.splitlines()[:50]  # Check first 50 lines
        
        code_indicators = 0
        doc_indicators = 0
        config_indicators = 0
        
        for line in lines:
            line_stripped = line.strip().lower()
            
            # Code indicators
            if any(re.search(pattern, line, re.IGNORECASE) for patterns in self.code_patterns.values() for pattern in patterns):
                code_indicators += 1
            
            # Documentation indicators
            if any(indicator in line_stripped for indicator in ["#", "##", "###", "documentation", "readme"]):
                doc_indicators += 1
            
            # Config indicators
            if any(indicator in line_stripped for indicator in ["{", "}", "[", "]", ":", "="]):
                config_indicators += 1
        
        # Determine type based on indicators
        if code_indicators > max(doc_indicators, config_indicators):
            return ContentType.CODE
        elif doc_indicators > config_indicators:
            return ContentType.DOCUMENTATION
        elif config_indicators > 0:
            return ContentType.CONFIG
        else:
            return ContentType.UNKNOWN
    
    def _estimate_token_count(self, content: str) -> int:
        """Quick token count estimation."""
        # Simple heuristic: average 4 characters per token
        return max(1, len(content) // 4)
    
    def _analyze_sections(self, content: str, content_type: ContentType) -> List[ContentSection]:
        """Analyze content into logical sections."""
        sections = []
        
        if content_type == ContentType.CODE:
            sections = self._analyze_code_sections(content)
        elif content_type == ContentType.DOCUMENTATION:
            sections = self._analyze_doc_sections(content)
        elif content_type == ContentType.CONFIG:
            sections = self._analyze_config_sections(content)
        else:
            # Generic section analysis
            sections = self._analyze_generic_sections(content)
        
        return sections
    
    def _analyze_code_sections(self, content: str) -> List[ContentSection]:
        """Analyze code into functions, classes, and other sections."""
        sections = []
        lines = content.splitlines()
        
        current_section = None
        section_lines = []
        section_start = 0
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Detect function or class definitions
            for section_type, patterns in self.code_patterns.items():
                if section_type in ["function_def", "class_def"]:
                    for pattern in patterns:
                        if re.match(pattern, line_stripped):
                            # Save previous section
                            if current_section and section_lines:
                                sections.append(self._create_section(
                                    current_section, "\n".join(section_lines),
                                    section_start, i-1, section_type
                                ))
                            
                            # Start new section
                            current_section = self._extract_name_from_definition(line_stripped, section_type)
                            section_lines = [line]
                            section_start = i
                            break
                    else:
                        continue
                    break
            else:
                # Continue current section or start generic section
                if current_section:
                    section_lines.append(line)
                elif line_stripped and not line_stripped.startswith('#'):
                    # Start module-level section
                    if not current_section:
                        current_section = "module_level"
                        section_lines = [line]
                        section_start = i
                    else:
                        section_lines.append(line)
        
        # Add final section
        if current_section and section_lines:
            sections.append(self._create_section(
                current_section, "\n".join(section_lines),
                section_start, len(lines)-1, "code_block"
            ))
        
        return sections
    
    def _analyze_doc_sections(self, content: str) -> List[ContentSection]:
        """Analyze documentation into sections by headers."""
        sections = []
        lines = content.splitlines()
        
        current_section = "introduction"
        section_lines = []
        section_start = 0
        
        for i, line in enumerate(lines):
            # Detect markdown headers
            if re.match(r'^#{1,6}\s+', line):
                # Save previous section
                if section_lines:
                    sections.append(self._create_section(
                        current_section, "\n".join(section_lines),
                        section_start, i-1, "documentation"
                    ))
                
                # Start new section
                current_section = line.strip('#').strip().lower().replace(' ', '_')
                section_lines = [line]
                section_start = i
            else:
                section_lines.append(line)
        
        # Add final section
        if section_lines:
            sections.append(self._create_section(
                current_section, "\n".join(section_lines),
                section_start, len(lines)-1, "documentation"
            ))
        
        return sections
    
    def _analyze_config_sections(self, content: str) -> List[ContentSection]:
        """Analyze configuration files into logical sections."""
        sections = []
        
        try:
            # Try to parse as JSON
            if content.strip().startswith('{'):
                data = json.loads(content)
                for key, value in data.items():
                    section_content = json.dumps({key: value}, indent=2)
                    sections.append(ContentSection(
                        name=key,
                        content=section_content,
                        start_line=0, end_line=0,  # JSON doesn't have clear line boundaries
                        section_type="config_section",
                        complexity_score=0.3,
                        token_count=self._estimate_token_count(section_content),
                        importance_score=0.7
                    ))
        except:
            # Fall back to generic analysis
            sections = self._analyze_generic_sections(content)
        
        return sections
    
    def _analyze_generic_sections(self, content: str) -> List[ContentSection]:
        """Generic section analysis for unknown content types."""
        lines = content.splitlines()
        
        # Split into paragraphs/blocks
        sections = []
        current_block = []
        block_start = 0
        
        for i, line in enumerate(lines):
            if line.strip():
                current_block.append(line)
            else:
                # Empty line - end of block
                if current_block:
                    block_content = "\n".join(current_block)
                    sections.append(self._create_section(
                        f"block_{len(sections)+1}", block_content,
                        block_start, i-1, "generic"
                    ))
                    current_block = []
                    block_start = i + 1
        
        # Add final block
        if current_block:
            block_content = "\n".join(current_block)
            sections.append(self._create_section(
                f"block_{len(sections)+1}", block_content,
                block_start, len(lines)-1, "generic"
            ))
        
        return sections
    
    def _create_section(self, name: str, content: str, start_line: int, 
                       end_line: int, section_type: str) -> ContentSection:
        """Create a ContentSection with calculated metrics."""
        complexity_score = self._calculate_section_complexity(content, section_type)
        token_count = self._estimate_token_count(content)
        importance_score = self._calculate_importance_score(name, content, section_type)
        
        return ContentSection(
            name=name,
            content=content,
            start_line=start_line,
            end_line=end_line,
            section_type=section_type,
            complexity_score=complexity_score,
            token_count=token_count,
            importance_score=importance_score
        )
    
    def _calculate_complexity_score(self, content: str, content_type: ContentType, 
                                  sections: List[ContentSection]) -> float:
        """Calculate overall complexity score (0.0 to 1.0)."""
        if content_type == ContentType.CODE:
            return self._calculate_code_complexity(content)
        elif content_type == ContentType.DOCUMENTATION:
            return self._calculate_doc_complexity(content)
        else:
            return 0.5  # Default complexity for other types
    
    def _calculate_code_complexity(self, content: str) -> float:
        """Calculate code complexity based on various metrics."""
        lines = content.splitlines()
        
        # Count various complexity indicators
        nesting_level = 0
        max_nesting = 0
        function_count = 0
        class_count = 0
        control_flow_count = 0
        
        for line in lines:
            stripped = line.strip()
            
            # Count nesting (rough estimate from indentation)
            if stripped:
                indent = len(line) - len(line.lstrip())
                current_nesting = indent // 4  # Assume 4-space indentation
                max_nesting = max(max_nesting, current_nesting)
            
            # Count functions and classes
            if re.match(r'^(def|function|class)\s+', stripped):
                if stripped.startswith('def') or stripped.startswith('function'):
                    function_count += 1
                elif stripped.startswith('class'):
                    class_count += 1
            
            # Count control flow statements
            if re.match(r'^(if|for|while|switch|try|except|catch)\s+', stripped):
                control_flow_count += 1
        
        # Normalize complexity score
        line_factor = min(len(lines) / 100, 1.0)  # Normalize by 100 lines
        nesting_factor = min(max_nesting / 10, 1.0)  # Normalize by 10 levels
        structure_factor = min((function_count + class_count) / 20, 1.0)  # Normalize by 20 structures
        control_factor = min(control_flow_count / 30, 1.0)  # Normalize by 30 control statements
        
        complexity = (line_factor * 0.3 + nesting_factor * 0.3 + 
                     structure_factor * 0.2 + control_factor * 0.2)
        
        return min(complexity, 1.0)
    
    def _calculate_doc_complexity(self, content: str) -> float:
        """Calculate documentation complexity."""
        lines = content.splitlines()
        word_count = len(content.split())
        
        # Count structure elements
        headers = len([line for line in lines if line.strip().startswith('#')])
        lists = len([line for line in lines if re.match(r'^\s*[-*+]\s+', line)])
        code_blocks = content.count('```')
        links = len(re.findall(r'\[.*?\]\(.*?\)', content))
        
        # Normalize complexity
        length_factor = min(word_count / 2000, 1.0)  # Normalize by 2000 words
        structure_factor = min((headers + lists + code_blocks + links) / 50, 1.0)
        
        return (length_factor * 0.7 + structure_factor * 0.3)
    
    def _calculate_section_complexity(self, content: str, section_type: str) -> float:
        """Calculate complexity for individual section."""
        lines = len(content.splitlines())
        words = len(content.split())
        
        # Base complexity from size
        size_complexity = min(lines / 50, 1.0)
        
        # Adjust based on section type
        if section_type in ["function_def", "class_def"]:
            # Code sections get additional complexity from control structures
            control_keywords = ["if", "for", "while", "try", "except", "switch"]
            control_count = sum(content.lower().count(keyword) for keyword in control_keywords)
            control_complexity = min(control_count / 10, 0.5)
            return min(size_complexity + control_complexity, 1.0)
        
        elif section_type == "documentation":
            # Documentation complexity from word count
            return min(words / 500, 1.0)
        
        else:
            return size_complexity
    
    def _calculate_importance_score(self, name: str, content: str, section_type: str) -> float:
        """Calculate importance score for section (0.0 to 1.0)."""
        importance = 0.5  # Base importance
        
        # Adjust based on name patterns
        if "main" in name.lower() or "init" in name.lower():
            importance += 0.3
        elif "test" in name.lower():
            importance -= 0.2
        elif "util" in name.lower() or "helper" in name.lower():
            importance -= 0.1
        
        # Adjust based on section type
        if section_type in ["function_def", "class_def"]:
            importance += 0.2
        elif section_type == "import_stmt":
            importance -= 0.3
        elif section_type == "comment":
            importance -= 0.4
        
        # Adjust based on content characteristics
        if "TODO" in content or "FIXME" in content:
            importance -= 0.2
        if "deprecated" in content.lower():
            importance -= 0.3
        
        return max(0.0, min(importance, 1.0))
    
    def _extract_name_from_definition(self, line: str, section_type: str) -> str:
        """Extract name from function or class definition."""
        if section_type == "function_def":
            # Try different function patterns
            patterns = [
                r'def\s+(\w+)',  # Python
                r'function\s+(\w+)',  # JavaScript
                r'fn\s+(\w+)',  # Rust
            ]
        elif section_type == "class_def":
            patterns = [
                r'class\s+(\w+)',  # Python, Java, C#
                r'struct\s+(\w+)',  # C++, Rust
                r'interface\s+(\w+)',  # TypeScript, Java
            ]
        else:
            return "unknown"
        
        for pattern in patterns:
            match = re.search(pattern, line)
            if match:
                return match.group(1)
        
        return "unnamed"
    
    def _identify_optimization_opportunities(self, content: str, content_type: ContentType, 
                                          sections: List[ContentSection]) -> List[str]:
        """Identify specific optimization opportunities."""
        opportunities = []
        
        # Comment removal opportunities
        comment_lines = sum(1 for line in content.splitlines() if line.strip().startswith('#'))
        if comment_lines > 10:
            opportunities.append("remove_comments")
        
        # Blank line compression
        blank_lines = sum(1 for line in content.splitlines() if not line.strip())
        if blank_lines > 20:
            opportunities.append("compress_whitespace")
        
        # Long documentation sections
        long_doc_sections = [s for s in sections if s.section_type == "documentation" and s.token_count > 500]
        if long_doc_sections:
            opportunities.append("summarize_documentation")
        
        # Unused imports (basic detection)
        if content_type == ContentType.CODE:
            import_lines = [line for line in content.splitlines() if re.match(r'^(import|from)\s+', line.strip())]
            if len(import_lines) > 20:
                opportunities.append("remove_unused_imports")
        
        # Large test sections
        test_sections = [s for s in sections if "test" in s.name.lower() and s.token_count > 300]
        if test_sections:
            opportunities.append("compress_test_code")
        
        return opportunities
    
    def _extract_metadata(self, content: str, content_type: ContentType, 
                         file_path: Optional[str]) -> Dict[str, Any]:
        """Extract metadata about the content."""
        metadata = {
            "has_imports": bool(re.search(r'^(import|from|#include)', content, re.MULTILINE)),
            "has_functions": bool(re.search(r'(def|function|fn)\s+\w+', content)),
            "has_classes": bool(re.search(r'(class|struct|interface)\s+\w+', content)),
            "has_comments": bool(re.search(r'^\s*[#//]', content, re.MULTILINE)),
            "has_docstrings": bool(re.search(r'""".*?"""', content, re.DOTALL)),
            "language": self._detect_language(content, file_path),
        }
        
        # Add file-specific metadata
        if file_path:
            path = Path(file_path)
            metadata.update({
                "file_name": path.name,
                "file_extension": path.suffix,
                "file_size_bytes": len(content.encode('utf-8'))
            })
        
        return metadata
    
    def _detect_language(self, content: str, file_path: Optional[str]) -> str:
        """Detect programming language from content and file path."""
        if file_path:
            ext = Path(file_path).suffix.lower()
            language_map = {
                ".py": "python", ".pyx": "python",
                ".js": "javascript", ".ts": "typescript",
                ".java": "java", ".kt": "kotlin", ".scala": "scala",
                ".cpp": "cpp", ".c": "c", ".h": "c",
                ".cs": "csharp", ".go": "go", ".rs": "rust",
                ".rb": "ruby", ".php": "php", ".swift": "swift"
            }
            if ext in language_map:
                return language_map[ext]
        
        # Content-based detection
        if "def " in content and "import " in content:
            return "python"
        elif "function " in content and "var " in content:
            return "javascript"
        elif "class " in content and "public " in content:
            return "java"
        
        return "unknown"
    
    def get_optimization_priority(self, sections: List[ContentSection], 
                                target_reduction: float) -> List[ContentSection]:
        """
        Get sections ordered by optimization priority.
        
        Lower importance, higher token count sections are prioritized for optimization.
        """
        # Calculate optimization score (lower is better for optimization)
        for section in sections:
            # Sections with low importance and high token count are good candidates
            section.optimization_priority = (
                (1.0 - section.importance_score) * 0.6 +
                (section.token_count / 1000) * 0.4  # Normalize token count
            )
        
        # Sort by optimization priority (descending - highest priority first)
        return sorted(sections, key=lambda s: s.optimization_priority, reverse=True)