"""
Code-specific pruning strategies for various programming languages.
"""

import re
import ast
from typing import Dict, List, Tuple, Optional, Any
import logging

from .base import PruningStrategy, PruningResult

logger = logging.getLogger(__name__)


class CodePruner(PruningStrategy):
    """Advanced pruning strategy for code files."""
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        
        # Configuration options
        self.remove_comments = config.get('remove_comments', True)
        self.remove_docstrings = config.get('remove_docstrings', False)
        self.remove_blank_lines = config.get('remove_blank_lines', True)
        self.remove_debug_prints = config.get('remove_debug_prints', True)
        self.preserve_function_signatures = config.get('preserve_function_signatures', True)
        self.compress_whitespace = config.get('compress_whitespace', True)
        self.remove_unused_imports = config.get('remove_unused_imports', False)  # Requires analysis
        
        # Language-specific patterns
        self.comment_patterns = {
            'python': [r'^\s*#.*$', r'""".*?"""', r"'''.*?'''"],
            'javascript': [r'^\s*//.*$', r'/\*.*?\*/'],
            'java': [r'^\s*//.*$', r'/\*.*?\*/', r'/\*\*.*?\*/'],
            'cpp': [r'^\s*//.*$', r'/\*.*?\*/'],
            'generic': [r'^\s*#.*$', r'^\s*//.*$']
        }
        
        self.docstring_patterns = {
            'python': [r'""".*?"""', r"'''.*?'''"],
            'javascript': [r'/\*\*.*?\*/'],
            'java': [r'/\*\*.*?\*/'],
        }
        
        self.debug_patterns = [
            r'print\s*\(',  # Python print
            r'console\.log\s*\(',  # JavaScript console.log
            r'System\.out\.println\s*\(',  # Java println
            r'printf\s*\(',  # C printf
            r'cout\s*<<',  # C++ cout
            r'debugger;',  # JavaScript debugger
            r'pdb\.set_trace\(\)',  # Python debugger
        ]
    
    def can_prune(self, content: str, content_type: str) -> bool:
        """Check if this is code content that can be pruned."""
        return content_type.lower() in ['code', 'python', 'javascript', 'java', 'cpp', 'c', 'typescript']
    
    def prune(self, content: str, target_reduction: float = 0.3) -> PruningResult:
        """Apply code-specific pruning strategies."""
        operations = []
        pruned_content = content
        warnings = []
        
        try:
            # Detect programming language
            language = self._detect_language(content)
            logger.debug(f"Detected language: {language}")
            
            # Apply pruning strategies in order of safety
            
            # 1. Remove debug prints (safe)
            if self.remove_debug_prints:
                pruned_content, removed_count = self._remove_debug_statements(pruned_content)
                if removed_count > 0:
                    operations.append(f"removed_{removed_count}_debug_statements")
            
            # 2. Compress whitespace (safe)
            if self.compress_whitespace:
                original_lines = len(pruned_content.splitlines())
                pruned_content = self._compress_whitespace(pruned_content)
                new_lines = len(pruned_content.splitlines())
                if new_lines < original_lines:
                    operations.append(f"compressed_whitespace_{original_lines - new_lines}_lines")
            
            # 3. Remove comments (mostly safe)
            if self.remove_comments:
                pruned_content, removed_count = self._remove_comments(pruned_content, language)
                if removed_count > 0:
                    operations.append(f"removed_{removed_count}_comments")
            
            # 4. Remove blank lines (safe)
            if self.remove_blank_lines:
                original_lines = len(pruned_content.splitlines())
                pruned_content = self._remove_excessive_blank_lines(pruned_content)
                new_lines = len(pruned_content.splitlines())
                if new_lines < original_lines:
                    operations.append(f"removed_{original_lines - new_lines}_blank_lines")
            
            # 5. Remove docstrings (less safe, preserve important ones)
            if self.remove_docstrings:
                pruned_content, removed_count = self._remove_docstrings(pruned_content, language)
                if removed_count > 0:
                    operations.append(f"removed_{removed_count}_docstrings")
                    warnings.append("Docstrings removed - may affect code documentation")
            
            # 6. Remove unused imports (requires analysis, less safe)
            if self.remove_unused_imports and language == 'python':
                try:
                    pruned_content, removed_count = self._remove_unused_imports_python(pruned_content)
                    if removed_count > 0:
                        operations.append(f"removed_{removed_count}_unused_imports")
                except Exception as e:
                    warnings.append(f"Could not remove unused imports: {e}")
            
            # Check if we've achieved target reduction
            current_reduction = 1 - (len(pruned_content) / len(content))
            if current_reduction < target_reduction:
                # Apply more aggressive strategies if needed
                pruned_content, extra_ops = self._apply_aggressive_pruning(
                    pruned_content, target_reduction - current_reduction, language
                )
                operations.extend(extra_ops)
            
            # Validate the pruned content
            is_valid, validation_warnings = self.validate_pruned_content(content, pruned_content)
            warnings.extend(validation_warnings)
            
            if not is_valid:
                # Fall back to safer pruning
                warnings.append("Aggressive pruning failed validation, using safer approach")
                pruned_content = self._safe_prune(content, language)
                operations = ["safe_pruning_fallback"]
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(content, pruned_content, operations)
            
            return PruningResult.create(
                original=content,
                pruned=pruned_content,
                operations=operations,
                quality_score=quality_score,
                warnings=warnings
            )
            
        except Exception as e:
            logger.error(f"Code pruning failed: {e}")
            return PruningResult.create(
                original=content,
                pruned=content,  # Return original on error
                operations=["pruning_failed"],
                quality_score=1.0,
                warnings=[f"Pruning failed: {e}"]
            )
    
    def estimate_reduction(self, content: str) -> float:
        """Estimate potential reduction for code content."""
        lines = content.splitlines()
        
        # Count different types of content
        comment_lines = 0
        blank_lines = 0
        docstring_chars = 0
        debug_statements = 0
        
        in_multiline_comment = False
        multiline_delim = None
        
        for line in lines:
            stripped = line.strip()
            
            # Count blank lines
            if not stripped:
                blank_lines += 1
                continue
            
            # Handle multiline comments/docstrings
            if in_multiline_comment:
                docstring_chars += len(line)
                if multiline_delim in line:
                    in_multiline_comment = False
                    multiline_delim = None
                continue
            
            # Check for start of multiline comment
            for delim in ['"""', "'''", '/*']:
                if delim in stripped:
                    in_multiline_comment = True
                    multiline_delim = '"""' if delim.startswith('"') else "'''" if delim.startswith("'") else '*/'
                    docstring_chars += len(line)
                    break
            else:
                # Single line comment
                if re.match(r'^\s*[#//]', line):
                    comment_lines += 1
                # Debug statements
                elif any(re.search(pattern, line) for pattern in self.debug_patterns):
                    debug_statements += 1
        
        # Estimate reduction potential
        total_lines = len(lines)
        reducible_lines = comment_lines + max(0, blank_lines - total_lines * 0.05)  # Keep some blank lines
        reducible_chars = docstring_chars
        
        # Calculate potential reduction
        line_reduction = reducible_lines / total_lines if total_lines > 0 else 0
        char_reduction = reducible_chars / len(content) if len(content) > 0 else 0
        debug_reduction = debug_statements * 20 / len(content) if len(content) > 0 else 0  # Assume 20 chars per debug statement
        
        # Conservative estimate
        estimated_reduction = min(0.8, line_reduction * 0.4 + char_reduction * 0.3 + debug_reduction * 0.1)
        return max(0.0, estimated_reduction)
    
    def get_priority(self, content: str) -> int:
        """Code pruner has high priority for code content."""
        return 10  # High priority
    
    def _detect_language(self, content: str) -> str:
        """Detect programming language from content patterns."""
        # Simple heuristic-based detection
        if re.search(r'def\s+\w+.*:', content) and 'import ' in content:
            return 'python'
        elif 'function ' in content and ('var ' in content or 'let ' in content or 'const ' in content):
            return 'javascript'
        elif 'public class ' in content or 'private ' in content or 'package ' in content:
            return 'java'
        elif '#include ' in content and ('int main' in content or 'void ' in content):
            return 'cpp'
        else:
            return 'generic'
    
    def _remove_comments(self, content: str, language: str) -> Tuple[str, int]:
        """Remove comments while preserving important ones."""
        lines = content.splitlines()
        cleaned_lines = []
        removed_count = 0
        
        # Patterns for comments that should be preserved
        preserve_patterns = [
            r'@\w+',  # Decorators/annotations
            r'#!',    # Shebang
            r'# -*- coding:',  # Encoding declarations
            r'# type:',  # Type hints
            r'#.*TODO.*IMPORTANT',  # Important TODOs
            r'#.*FIXME.*CRITICAL',  # Critical fixes
            r'#.*SECURITY',  # Security comments
            r'#.*LICENSE',  # License comments
        ]
        
        in_multiline = False
        multiline_end = None
        
        for line in lines:
            stripped = line.strip()
            
            # Handle multiline comments
            if in_multiline:
                if multiline_end in line:
                    in_multiline = False
                    multiline_end = None
                removed_count += 1
                continue
            
            # Check for multiline comment start
            multiline_starts = {
                'python': ['"""', "'''"],
                'javascript': ['/*'],
                'java': ['/*'],
                'cpp': ['/*'],
                'generic': ['/*']
            }
            
            for start in multiline_starts.get(language, []):
                if start in stripped and not any(re.search(p, line, re.IGNORECASE) for p in preserve_patterns):
                    in_multiline = True
                    multiline_end = '"""' if start == '"""' else "'''" if start == "'''" else '*/'
                    removed_count += 1
                    break
            else:
                # Handle single-line comments
                comment_prefixes = {
                    'python': '#',
                    'javascript': '//',
                    'java': '//',
                    'cpp': '//',
                    'generic': '#'
                }
                
                prefix = comment_prefixes.get(language, '#')
                if stripped.startswith(prefix):
                    # Check if this comment should be preserved
                    if any(re.search(pattern, line, re.IGNORECASE) for pattern in preserve_patterns):
                        cleaned_lines.append(line)
                    else:
                        removed_count += 1
                        # Don't add the line (remove it)
                else:
                    cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines), removed_count
    
    def _remove_docstrings(self, content: str, language: str) -> Tuple[str, int]:
        """Remove docstrings while preserving critical documentation."""
        if language != 'python':
            return content, 0  # Only handle Python docstrings for now
        
        try:
            # Parse AST to find docstrings
            tree = ast.parse(content)
            docstring_positions = []
            
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Module)):
                    if (ast.get_docstring(node) and 
                        hasattr(node, 'body') and 
                        len(node.body) > 0 and
                        isinstance(node.body[0], ast.Expr) and
                        isinstance(node.body[0].value, ast.Constant)):
                        
                        docstring_node = node.body[0]
                        docstring_content = docstring_node.value.s
                        
                        # Preserve important docstrings
                        preserve_keywords = ['api', 'public', 'interface', 'important', 'critical', 'security']
                        if not any(keyword in docstring_content.lower() for keyword in preserve_keywords):
                            docstring_positions.append((docstring_node.lineno, docstring_node.end_lineno))
            
            # Remove docstrings by line numbers
            lines = content.splitlines()
            cleaned_lines = []
            removed_count = 0
            
            for i, line in enumerate(lines, 1):
                should_remove = any(start <= i <= end for start, end in docstring_positions)
                if should_remove:
                    removed_count += 1
                else:
                    cleaned_lines.append(line)
            
            return '\n'.join(cleaned_lines), removed_count
        
        except Exception as e:
            logger.warning(f"Could not parse Python AST for docstring removal: {e}")
            return content, 0
    
    def _remove_debug_statements(self, content: str) -> Tuple[str, int]:
        """Remove debug print statements and similar debugging code."""
        lines = content.splitlines()
        cleaned_lines = []
        removed_count = 0
        
        for line in lines:
            is_debug = False
            for pattern in self.debug_patterns:
                if re.search(pattern, line):
                    is_debug = True
                    removed_count += 1
                    break
            
            if not is_debug:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines), removed_count
    
    def _compress_whitespace(self, content: str) -> str:
        """Compress excessive whitespace while preserving structure."""
        lines = content.splitlines()
        compressed_lines = []
        
        prev_blank = False
        for line in lines:
            stripped = line.strip()
            
            if not stripped:  # Blank line
                if not prev_blank:  # Only keep one blank line
                    compressed_lines.append('')
                    prev_blank = True
            else:
                # Compress internal whitespace
                # Preserve indentation but compress multiple spaces to single
                leading_spaces = len(line) - len(line.lstrip())
                compressed_content = re.sub(r'[ \t]+', ' ', stripped)
                compressed_lines.append(' ' * leading_spaces + compressed_content)
                prev_blank = False
        
        return '\n'.join(compressed_lines)
    
    def _remove_excessive_blank_lines(self, content: str) -> str:
        """Remove excessive blank lines, keeping at most 2 consecutive blank lines."""
        lines = content.splitlines()
        cleaned_lines = []
        blank_count = 0
        
        for line in lines:
            if not line.strip():
                blank_count += 1
                if blank_count <= 2:  # Keep at most 2 blank lines
                    cleaned_lines.append(line)
            else:
                blank_count = 0
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _remove_unused_imports_python(self, content: str) -> Tuple[str, int]:
        """Remove unused imports in Python code (basic implementation)."""
        try:
            lines = content.splitlines()
            import_lines = []
            other_lines = []
            
            # Separate imports from other code
            for i, line in enumerate(lines):
                if re.match(r'^(import|from)\s+', line.strip()):
                    import_lines.append((i, line))
                else:
                    other_lines.append(line)
            
            # Simple usage check (not comprehensive)
            code_content = '\n'.join(other_lines)
            kept_imports = []
            removed_count = 0
            
            for line_num, import_line in import_lines:
                # Extract imported names
                if import_line.strip().startswith('import '):
                    # import module or import module as alias
                    match = re.match(r'import\s+([\w.]+)(?:\s+as\s+(\w+))?', import_line.strip())
                    if match:
                        module = match.group(1)
                        alias = match.group(2) or module.split('.')[-1]
                        
                        # Check if alias is used in code
                        if re.search(rf'\b{re.escape(alias)}\b', code_content):
                            kept_imports.append((line_num, import_line))
                        else:
                            removed_count += 1
                
                elif import_line.strip().startswith('from '):
                    # from module import name1, name2
                    match = re.match(r'from\s+[\w.]+\s+import\s+(.+)', import_line.strip())
                    if match:
                        imports = [name.strip() for name in match.group(1).split(',')]
                        used_imports = []
                        
                        for imp in imports:
                            # Handle "import as" syntax
                            if ' as ' in imp:
                                name = imp.split(' as ')[1].strip()
                            else:
                                name = imp.strip()
                            
                            if re.search(rf'\b{re.escape(name)}\b', code_content):
                                used_imports.append(imp)
                        
                        if used_imports:
                            # Reconstruct the import line with only used imports
                            base_import = import_line.split('import')[0] + 'import '
                            kept_imports.append((line_num, base_import + ', '.join(used_imports)))
                        else:
                            removed_count += 1
                else:
                    # Keep unknown import formats
                    kept_imports.append((line_num, import_line))
            
            # Reconstruct content
            result_lines = [''] * len(lines)
            
            # Place kept imports
            for line_num, import_line in kept_imports:
                result_lines[line_num] = import_line
            
            # Place other lines
            other_index = 0
            for i, line in enumerate(lines):
                if not re.match(r'^(import|from)\s+', line.strip()):
                    result_lines[i] = line
            
            # Filter out empty strings from removed imports
            final_lines = [line for line in result_lines if line is not None]
            
            return '\n'.join(final_lines), removed_count
        
        except Exception as e:
            logger.warning(f"Unused import removal failed: {e}")
            return content, 0
    
    def _apply_aggressive_pruning(self, content: str, additional_target: float, 
                                language: str) -> Tuple[str, List[str]]:
        """Apply more aggressive pruning strategies to reach target reduction."""
        operations = []
        
        # More aggressive comment removal (remove ALL comments)
        if additional_target > 0.1:
            content = re.sub(r'^\s*#.*$', '', content, flags=re.MULTILINE)
            content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
            operations.append("aggressive_comment_removal")
        
        # Remove all docstrings
        if additional_target > 0.15:
            content = re.sub(r'""".*?"""', '', content, flags=re.DOTALL)
            content = re.sub(r"'''.*?'''", '', content, flags=re.DOTALL)
            operations.append("all_docstring_removal")
        
        # Compress all whitespace more aggressively
        if additional_target > 0.2:
            content = re.sub(r'\n\s*\n', '\n', content)  # Remove all blank lines
            content = re.sub(r'[ \t]+', ' ', content)    # Single spaces only
            operations.append("aggressive_whitespace_compression")
        
        return content, operations
    
    def _safe_prune(self, content: str, language: str) -> str:
        """Apply only the safest pruning operations."""
        # Only remove blank lines and compress whitespace
        content = self._remove_excessive_blank_lines(content)
        content = self._compress_whitespace(content)
        return content
    
    def _calculate_quality_score(self, original: str, pruned: str, operations: List[str]) -> float:
        """Calculate quality score for the pruning operation."""
        base_score = 1.0
        
        # Penalty for aggressive operations
        if "aggressive_comment_removal" in operations:
            base_score -= 0.1
        if "all_docstring_removal" in operations:
            base_score -= 0.2
        if "aggressive_whitespace_compression" in operations:
            base_score -= 0.05
        
        # Bonus for safe operations
        safe_operations = ["removed_debug_statements", "compressed_whitespace", "removed_blank_lines"]
        safe_count = sum(1 for op in operations if any(safe in op for safe in safe_operations))
        base_score += safe_count * 0.02
        
        # Check structure preservation
        original_functions = len(re.findall(r'def\s+\w+', original))
        pruned_functions = len(re.findall(r'def\s+\w+', pruned))
        
        if original_functions > 0:
            function_preservation = pruned_functions / original_functions
            base_score *= (0.7 + 0.3 * function_preservation)
        
        return max(0.0, min(1.0, base_score))
    
    def validate_pruned_content(self, original: str, pruned: str) -> Tuple[bool, List[str]]:
        """Validate that pruned code maintains essential structure."""
        is_valid, warnings = super().validate_pruned_content(original, pruned)
        
        # Additional code-specific validation
        if not is_valid:
            return False, warnings
        
        # Check that function definitions are preserved
        original_functions = set(re.findall(r'def\s+(\w+)', original))
        pruned_functions = set(re.findall(r'def\s+(\w+)', pruned))
        
        missing_functions = original_functions - pruned_functions
        if missing_functions and len(missing_functions) > len(original_functions) * 0.1:
            warnings.append(f"Significant function loss detected: {missing_functions}")
        
        # Check for basic syntax preservation (Python)
        if 'def ' in original:
            try:
                ast.parse(pruned)
            except SyntaxError as e:
                warnings.append(f"Syntax error in pruned code: {e}")
                return False, warnings
        
        return True, warnings