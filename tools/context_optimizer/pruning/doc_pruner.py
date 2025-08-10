"""
Documentation-specific pruning strategies for markdown, text, and other documentation files.
"""

import re
from typing import Dict, List, Tuple, Optional, Any
import logging

from .base import PruningStrategy, PruningResult

logger = logging.getLogger(__name__)


class DocumentationPruner(PruningStrategy):
    """Advanced pruning strategy for documentation files."""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        
        # Configuration options
        self.summarize_long_sections = config.get('summarize_long_sections', True)
        self.remove_redundant_examples = config.get('remove_redundant_examples', True) 
        self.preserve_api_references = config.get('preserve_api_references', True)
        self.max_section_length = config.get('max_section_length', 500)
        self.preserve_headers = config.get('preserve_headers', True)
        self.remove_excessive_formatting = config.get('remove_excessive_formatting', True)
        
        # Patterns for different documentation elements
        self.header_patterns = [
            r'^#{1,6}\s+.*$',  # Markdown headers
            r'^=+$',           # RST-style underlines
            r'^-+$',           # RST-style underlines
        ]
        
        self.code_block_patterns = [
            r'```[\s\S]*?```',    # Markdown code blocks
            r'`[^`]+`',           # Inline code
            r'::.*?\n\n',         # RST code blocks
        ]
        
        self.list_patterns = [
            r'^\s*[-*+]\s+.*$',   # Markdown lists
            r'^\s*\d+\.\s+.*$',   # Numbered lists
        ]
        
        # API reference keywords to preserve
        self.api_keywords = [
            'api', 'endpoint', 'method', 'parameter', 'response', 'request',
            'function', 'class', 'module', 'library', 'interface', 'schema'
        ]
    
    def can_prune(self, content: str, content_type: str) -> bool:
        """Check if this is documentation content that can be pruned."""
        return content_type.lower() in ['documentation', 'markdown', 'text', 'rst']
    
    def prune(self, content: str, target_reduction: float = 0.3) -> PruningResult:
        """Apply documentation-specific pruning strategies."""
        operations = []
        pruned_content = content
        warnings = []
        
        try:
            # Analyze document structure
            sections = self._analyze_document_structure(content)
            logger.debug(f"Found {len(sections)} documentation sections")
            
            # Apply pruning strategies in order of safety
            
            # 1. Remove excessive whitespace and formatting (safe)
            if self.remove_excessive_formatting:
                original_size = len(pruned_content)
                pruned_content = self._remove_excessive_formatting(pruned_content)
                if len(pruned_content) < original_size:
                    operations.append(f"removed_formatting_{original_size - len(pruned_content)}_chars")
            
            # 2. Remove redundant examples (moderately safe)
            if self.remove_redundant_examples:
                pruned_content, removed_count = self._remove_redundant_examples(pruned_content)
                if removed_count > 0:
                    operations.append(f"removed_{removed_count}_redundant_examples")
            
            # 3. Summarize long sections (less safe)
            if self.summarize_long_sections:
                pruned_content, summarized_sections = self._summarize_long_sections(
                    pruned_content, sections
                )
                if summarized_sections > 0:
                    operations.append(f"summarized_{summarized_sections}_long_sections")
                    warnings.append("Long sections were summarized - some detail may be lost")
            
            # Check if we've achieved target reduction
            current_reduction = 1 - (len(pruned_content) / len(content))
            if current_reduction < target_reduction:
                # Apply more aggressive strategies
                pruned_content, extra_ops = self._apply_aggressive_doc_pruning(
                    pruned_content, target_reduction - current_reduction
                )
                operations.extend(extra_ops)
            
            # Validate the pruned content
            is_valid, validation_warnings = self.validate_pruned_content(content, pruned_content)
            warnings.extend(validation_warnings)
            
            if not is_valid:
                warnings.append("Aggressive pruning failed validation, using safer approach")
                pruned_content = self._safe_doc_prune(content)
                operations = ["safe_doc_pruning_fallback"]
            
            # Calculate quality score
            quality_score = self._calculate_doc_quality_score(content, pruned_content, operations)
            
            return PruningResult.create(
                original=content,
                pruned=pruned_content,
                operations=operations,
                quality_score=quality_score,
                warnings=warnings
            )
            
        except Exception as e:
            logger.error(f"Documentation pruning failed: {e}")
            return PruningResult.create(
                original=content,
                pruned=content,  # Return original on error
                operations=["doc_pruning_failed"],
                quality_score=1.0,
                warnings=[f"Documentation pruning failed: {e}"]
            )
    
    def estimate_reduction(self, content: str) -> float:
        """Estimate potential reduction for documentation content."""
        lines = content.splitlines()
        
        # Count different types of content
        blank_lines = sum(1 for line in lines if not line.strip())
        example_lines = self._count_example_lines(content)
        redundant_formatting = self._count_redundant_formatting(content)
        long_sections = self._count_long_sections(content)
        
        total_chars = len(content)
        
        # Estimate reduction potential
        blank_reduction = (blank_lines * 10) / total_chars if total_chars > 0 else 0  # Avg line length
        example_reduction = (example_lines * 50) / total_chars if total_chars > 0 else 0
        formatting_reduction = redundant_formatting / total_chars if total_chars > 0 else 0
        section_reduction = long_sections * 0.3  # 30% reduction from long sections
        
        # Conservative estimate
        estimated_reduction = min(0.6, blank_reduction + example_reduction + formatting_reduction + section_reduction)
        return max(0.0, estimated_reduction)
    
    def get_priority(self, content: str) -> int:
        """Documentation pruner has high priority for documentation content."""
        return 15  # High priority for documentation
    
    def _analyze_document_structure(self, content: str) -> List[Dict[str, Any]]:
        """Analyze document structure and identify sections."""
        sections = []
        lines = content.splitlines()
        
        current_section = None
        section_content = []
        section_start = 0
        
        for i, line in enumerate(lines):
            # Check if this is a header
            is_header = any(re.match(pattern, line) for pattern in self.header_patterns)
            
            if is_header:
                # Save previous section
                if current_section and section_content:
                    sections.append({
                        'title': current_section,
                        'content': '\n'.join(section_content),
                        'start_line': section_start,
                        'end_line': i - 1,
                        'length': len('\n'.join(section_content)),
                        'type': 'section'
                    })
                
                # Start new section
                current_section = line.strip('#').strip()
                section_content = [line]
                section_start = i
            else:
                if current_section:
                    section_content.append(line)
                else:
                    # Content before first header
                    if not sections:
                        sections.append({
                            'title': 'Introduction',
                            'content': line,
                            'start_line': i,
                            'end_line': i,
                            'length': len(line),
                            'type': 'intro'
                        })
        
        # Add final section
        if current_section and section_content:
            sections.append({
                'title': current_section,
                'content': '\n'.join(section_content),
                'start_line': section_start,
                'end_line': len(lines) - 1,
                'length': len('\n'.join(section_content)),
                'type': 'section'
            })
        
        return sections
    
    def _remove_excessive_formatting(self, content: str) -> str:
        """Remove excessive formatting while preserving structure."""
        # Remove excessive emphasis
        content = re.sub(r'\*{3,}(.*?)\*{3,}', r'**\1**', content)  # Reduce excessive bold
        content = re.sub(r'_{3,}(.*?)_{3,}', r'_\1_', content)      # Reduce excessive italic
        
        # Remove excessive horizontal rules
        content = re.sub(r'^-{4,}$', '---', content, flags=re.MULTILINE)
        content = re.sub(r'^={4,}$', '===', content, flags=re.MULTILINE)
        
        # Compress multiple blank lines
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Remove trailing whitespace
        content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
        
        # Compress multiple spaces (except in code blocks)
        lines = content.splitlines()
        cleaned_lines = []
        in_code_block = False
        
        for line in lines:
            if '```' in line:
                in_code_block = not in_code_block
                cleaned_lines.append(line)
            elif in_code_block:
                cleaned_lines.append(line)  # Preserve code block formatting
            else:
                # Compress multiple spaces in regular text
                cleaned_line = re.sub(r'  +', ' ', line)
                cleaned_lines.append(cleaned_line)
        
        return '\n'.join(cleaned_lines)
    
    def _remove_redundant_examples(self, content: str) -> Tuple[str, int]:
        """Remove redundant code examples while keeping diverse ones."""
        # Find all code blocks
        code_blocks = re.findall(r'```[\s\S]*?```', content)
        
        if len(code_blocks) <= 2:
            return content, 0  # Keep all if only a few examples
        
        # Simple similarity check - remove very similar examples
        unique_blocks = []
        removed_count = 0
        
        for block in code_blocks:
            # Extract actual code content
            code_content = re.sub(r'```[\w]*\n?', '', block).strip('`').strip()
            
            # Check if this is similar to existing blocks
            is_similar = False
            for existing in unique_blocks:
                existing_content = re.sub(r'```[\w]*\n?', '', existing).strip('`').strip()
                
                # Simple similarity check based on lines
                similarity = self._calculate_text_similarity(code_content, existing_content)
                if similarity > 0.8:  # Very similar
                    is_similar = True
                    removed_count += 1
                    break
            
            if not is_similar:
                unique_blocks.append(block)
        
        # Replace redundant blocks in content
        for block in code_blocks:
            if block not in unique_blocks:
                content = content.replace(block, '', 1)
        
        return content, removed_count
    
    def _summarize_long_sections(self, content: str, sections: List[Dict[str, Any]]) -> Tuple[str, int]:
        """Summarize sections that exceed the maximum length."""
        summarized_count = 0
        
        for section in sections:
            if section['length'] > self.max_section_length:
                # Check if this section contains API references (preserve these)
                section_content = section['content']
                if self.preserve_api_references:
                    has_api_content = any(keyword in section_content.lower() 
                                        for keyword in self.api_keywords)
                    if has_api_content:
                        continue  # Don't summarize API documentation
                
                # Summarize the section
                summarized = self._summarize_text_section(section_content)
                if summarized != section_content:
                    content = content.replace(section_content, summarized)
                    summarized_count += 1
        
        return content, summarized_count
    
    def _summarize_text_section(self, section_content: str) -> str:
        """Summarize a text section while preserving key information."""
        lines = section_content.splitlines()
        
        # Keep header if present
        header_lines = [line for line in lines if any(re.match(p, line) for p in self.header_patterns)]
        
        # Keep important paragraphs (first and last, plus any with key terms)
        paragraphs = []
        current_paragraph = []
        
        for line in lines:
            if line.strip():
                current_paragraph.append(line)
            else:
                if current_paragraph:
                    paragraphs.append('\n'.join(current_paragraph))
                    current_paragraph = []
        
        # Add final paragraph if exists
        if current_paragraph:
            paragraphs.append('\n'.join(current_paragraph))
        
        if not paragraphs:
            return section_content
        
        # Select key paragraphs
        key_paragraphs = []
        
        # Always keep first paragraph (introduction)
        if paragraphs:
            key_paragraphs.append(paragraphs[0])
        
        # Keep paragraphs with important keywords
        important_keywords = ['important', 'note', 'warning', 'critical', 'required', 'must', 'api', 'usage']
        for paragraph in paragraphs[1:-1]:  # Skip first and last for now
            if any(keyword in paragraph.lower() for keyword in important_keywords):
                key_paragraphs.append(paragraph)
        
        # Keep last paragraph if it's different from first and not too long
        if len(paragraphs) > 1 and paragraphs[-1] != paragraphs[0] and len(paragraphs[-1]) < 300:
            key_paragraphs.append(paragraphs[-1])
        
        # Reconstruct section
        result_lines = header_lines + key_paragraphs
        
        # Add summary note if significant content was removed
        if len(paragraphs) > len(key_paragraphs):
            result_lines.append(f"\n*[Summary: {len(paragraphs) - len(key_paragraphs)} paragraphs condensed]*")
        
        return '\n\n'.join(result_lines)
    
    def _apply_aggressive_doc_pruning(self, content: str, additional_target: float) -> Tuple[str, List[str]]:
        """Apply more aggressive documentation pruning."""
        operations = []
        
        # Remove all examples if target reduction is high
        if additional_target > 0.2:
            content = re.sub(r'```[\s\S]*?```', '', content)
            operations.append("removed_all_code_examples")
        
        # Remove lists if target is very high
        if additional_target > 0.3:
            content = re.sub(r'^\s*[-*+]\s+.*$', '', content, flags=re.MULTILINE)
            operations.append("removed_lists")
        
        # Compress to single sentences per paragraph
        if additional_target > 0.4:
            paragraphs = content.split('\n\n')
            compressed_paragraphs = []
            
            for paragraph in paragraphs:
                sentences = paragraph.split('. ')
                if sentences:
                    compressed_paragraphs.append(sentences[0] + ('.' if not sentences[0].endswith('.') else ''))
            
            content = '\n\n'.join(compressed_paragraphs)
            operations.append("compressed_to_first_sentences")
        
        return content, operations
    
    def _safe_doc_prune(self, content: str) -> str:
        """Apply only the safest documentation pruning."""
        # Only remove excessive formatting and whitespace
        content = self._remove_excessive_formatting(content)
        return content
    
    def _calculate_doc_quality_score(self, original: str, pruned: str, operations: List[str]) -> float:
        """Calculate quality score for documentation pruning."""
        base_score = 1.0
        
        # Penalty for aggressive operations
        if "removed_all_code_examples" in operations:
            base_score -= 0.3
        if "removed_lists" in operations:
            base_score -= 0.2
        if "compressed_to_first_sentences" in operations:
            base_score -= 0.4
        
        # Check structure preservation
        original_headers = len(re.findall(r'^#{1,6}\s+', original, re.MULTILINE))
        pruned_headers = len(re.findall(r'^#{1,6}\s+', pruned, re.MULTILINE))
        
        if original_headers > 0:
            header_preservation = pruned_headers / original_headers
            base_score *= (0.8 + 0.2 * header_preservation)
        
        return max(0.0, min(1.0, base_score))
    
    def _count_example_lines(self, content: str) -> int:
        """Count lines that appear to be examples."""
        return len(re.findall(r'```[\s\S]*?```', content))
    
    def _count_redundant_formatting(self, content: str) -> int:
        """Count redundant formatting characters."""
        excessive_bold = len(re.findall(r'\*{3,}', content))
        excessive_italic = len(re.findall(r'_{3,}', content))
        excessive_rules = len(re.findall(r'^[-=]{4,}$', content, re.MULTILINE))
        return excessive_bold + excessive_italic + excessive_rules
    
    def _count_long_sections(self, content: str) -> int:
        """Count sections that exceed maximum length."""
        sections = self._analyze_document_structure(content)
        return sum(1 for section in sections if section['length'] > self.max_section_length)
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate simple similarity between two text blocks."""
        if not text1 or not text2:
            return 0.0
        
        # Simple word-based similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def validate_pruned_content(self, original: str, pruned: str) -> Tuple[bool, List[str]]:
        """Validate that pruned documentation maintains essential structure."""
        is_valid, warnings = super().validate_pruned_content(original, pruned)
        
        # Additional documentation-specific validation
        if not is_valid:
            return False, warnings
        
        # Check that main headers are preserved
        original_headers = re.findall(r'^#{1,3}\s+(.*)', original, re.MULTILINE)
        pruned_headers = re.findall(r'^#{1,3}\s+(.*)', pruned, re.MULTILINE)
        
        missing_headers = set(original_headers) - set(pruned_headers)
        if missing_headers and len(missing_headers) > len(original_headers) * 0.3:
            warnings.append(f"Significant header loss detected: {list(missing_headers)[:3]}...")
        
        # Check for API reference preservation
        original_api_refs = sum(1 for keyword in self.api_keywords if keyword in original.lower())
        pruned_api_refs = sum(1 for keyword in self.api_keywords if keyword in pruned.lower())
        
        if original_api_refs > 0 and pruned_api_refs < original_api_refs * 0.7:
            warnings.append("Significant API reference content may have been removed")
        
        return True, warnings