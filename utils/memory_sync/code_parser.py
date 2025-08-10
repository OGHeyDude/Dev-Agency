#!/usr/bin/env python3
"""
Code Parser for Memory Sync Agent
Parses code files into semantic chunks with relationship extraction
"""

import ast
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict


@dataclass
class Entity:
    """Represents a code entity for the knowledge graph"""
    name: str
    entity_type: str
    file_path: str
    observations: List[str]
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    
    def to_dict(self) -> Dict:
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class Relation:
    """Represents a relationship between entities"""
    from_entity: str
    to_entity: str
    relation_type: str
    
    def to_dict(self) -> Dict:
        return asdict(self)


class PythonParser:
    """Parser for Python code files"""
    
    def __init__(self):
        self.entities = []
        self.relations = []
        self.imports = {}
        
    def parse_file(self, file_path: str) -> Tuple[List[Entity], List[Relation]]:
        """Parse Python file into entities and relations"""
        self.entities = []
        self.relations = []
        self.imports = {}
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                source = f.read()
        except (IOError, UnicodeDecodeError):
            return [], []
            
        try:
            tree = ast.parse(source)
        except SyntaxError:
            # If parsing fails, create a simple file entity
            return self._create_file_entity(file_path, source), []
            
        # Extract imports first
        self._extract_imports(tree)
        
        # Process the AST
        self._process_node(tree, file_path)
        
        return self.entities, self.relations
    
    def _create_file_entity(self, file_path: str, source: str) -> List[Entity]:
        """Create a simple file entity when parsing fails"""
        file_name = Path(file_path).name
        lines = source.split('\n')
        
        observations = [
            f"Python file with {len(lines)} lines",
            "Could not parse AST - may contain syntax errors"
        ]
        
        # Try to extract docstring
        docstring = self._extract_module_docstring(source)
        if docstring:
            observations.append(f"Purpose: {docstring[:200]}")
            
        return [Entity(
            name=file_name,
            entity_type="PythonFile",
            file_path=file_path,
            observations=observations
        )]
    
    def _extract_module_docstring(self, source: str) -> Optional[str]:
        """Extract module-level docstring"""
        try:
            # Simple regex to find module docstring
            match = re.match(r'^["\'][\"\'][\"\'](.+?)["\'][\"\'][\"\']', source, re.DOTALL)
            if match:
                return match.group(1).strip()
        except:
            pass
        return None
    
    def _extract_imports(self, tree: ast.AST) -> None:
        """Extract all imports from the module"""
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    module_name = alias.name
                    as_name = alias.asname or alias.name
                    self.imports[as_name] = module_name
                    
            elif isinstance(node, ast.ImportFrom):
                module = node.module or ''
                for alias in node.names:
                    imported_name = alias.name
                    as_name = alias.asname or alias.name
                    full_name = f"{module}.{imported_name}" if module else imported_name
                    self.imports[as_name] = full_name
    
    def _process_node(self, tree: ast.AST, file_path: str) -> None:
        """Process AST nodes to extract entities"""
        file_name = Path(file_path).stem
        
        # Get module-level docstring
        module_doc = ast.get_docstring(tree)
        
        # Determine file complexity
        classes = [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
        functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and not self._is_method(n, tree)]
        
        # Decide on granularity
        if len(classes) > 3 or len(functions) > 10:
            # Complex file - use fine-grained entities
            self._process_complex_file(tree, file_path)
        else:
            # Simple file - use coarse-grained entities
            self._process_simple_file(tree, file_path)
    
    def _is_method(self, func_node: ast.FunctionDef, tree: ast.AST) -> bool:
        """Check if a function is a method inside a class"""
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                if func_node in node.body:
                    return True
        return False
    
    def _process_simple_file(self, tree: ast.AST, file_path: str) -> None:
        """Process simple file as a single or few entities"""
        file_name = Path(file_path).stem
        module_doc = ast.get_docstring(tree) or "Python module"
        
        # Collect all components
        classes = []
        functions = []
        constants = []
        
        for node in tree.body:
            if isinstance(node, ast.ClassDef):
                classes.append(self._get_class_summary(node))
            elif isinstance(node, ast.FunctionDef):
                functions.append(self._get_function_summary(node))
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name) and target.id.isupper():
                        constants.append(target.id)
        
        # Create module entity
        observations = [module_doc[:200] if len(module_doc) > 200 else module_doc]
        
        if classes:
            observations.append(f"Classes: {', '.join([c['name'] for c in classes])}")
        if functions:
            observations.append(f"Functions: {', '.join([f['name'] for f in functions])}")
        if constants:
            observations.append(f"Constants: {', '.join(constants)}")
        if self.imports:
            key_imports = list(self.imports.values())[:5]
            observations.append(f"Imports: {', '.join(key_imports)}")
            
        module_entity = Entity(
            name=file_name,
            entity_type="PythonModule",
            file_path=file_path,
            observations=observations
        )
        self.entities.append(module_entity)
        
        # Create relationships for imports
        for imported in set(self.imports.values()):
            base_module = imported.split('.')[0]
            self.relations.append(Relation(
                from_entity=file_name,
                to_entity=base_module,
                relation_type="imports"
            ))
    
    def _process_complex_file(self, tree: ast.AST, file_path: str) -> None:
        """Process complex file with fine-grained entities"""
        file_name = Path(file_path).stem
        
        # Process classes
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                self._process_class(node, file_path)
                
        # Process module-level functions
        for node in tree.body:
            if isinstance(node, ast.FunctionDef):
                self._process_function(node, file_path, file_name)
    
    def _process_class(self, node: ast.ClassDef, file_path: str) -> None:
        """Process a class definition"""
        class_name = node.name
        docstring = ast.get_docstring(node) or f"Class {class_name}"
        
        # Collect class information
        methods = []
        properties = []
        class_vars = []
        
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                methods.append(self._get_function_summary(item))
            elif isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        class_vars.append(target.id)
                        
        # Check for inheritance
        base_classes = []
        for base in node.bases:
            if isinstance(base, ast.Name):
                base_classes.append(base.id)
            elif isinstance(base, ast.Attribute):
                base_classes.append(f"{base.value.id if isinstance(base.value, ast.Name) else '?'}.{base.attr}")
                
        # Create observations
        observations = [docstring[:200] if len(docstring) > 200 else docstring]
        
        if base_classes:
            observations.append(f"Inherits from: {', '.join(base_classes)}")
        if methods:
            method_names = [m['name'] for m in methods]
            observations.append(f"Methods: {', '.join(method_names[:10])}")
            if len(method_names) > 10:
                observations.append(f"... and {len(method_names) - 10} more methods")
        if class_vars:
            observations.append(f"Class variables: {', '.join(class_vars)}")
            
        # Check for special methods
        special_methods = [m['name'] for m in methods if m['name'].startswith('__') and m['name'].endswith('__')]
        if special_methods:
            observations.append(f"Special methods: {', '.join(special_methods)}")
            
        entity = Entity(
            name=class_name,
            entity_type="PythonClass",
            file_path=file_path,
            observations=observations,
            line_start=node.lineno,
            line_end=node.end_lineno
        )
        self.entities.append(entity)
        
        # Create inheritance relationships
        for base in base_classes:
            self.relations.append(Relation(
                from_entity=class_name,
                to_entity=base,
                relation_type="extends"
            ))
    
    def _process_function(self, node: ast.FunctionDef, file_path: str, module_name: str) -> None:
        """Process a function definition"""
        func_name = f"{module_name}.{node.name}"
        summary = self._get_function_summary(node)
        
        observations = []
        if summary['docstring']:
            observations.append(summary['docstring'][:200])
        
        observations.append(f"Parameters: {', '.join(summary['params']) if summary['params'] else 'none'}")
        
        if summary['return_type']:
            observations.append(f"Returns: {summary['return_type']}")
            
        if summary['decorators']:
            observations.append(f"Decorators: {', '.join(summary['decorators'])}")
            
        if summary['is_async']:
            observations.append("Async function")
            
        entity = Entity(
            name=func_name,
            entity_type="PythonFunction",
            file_path=file_path,
            observations=observations,
            line_start=node.lineno,
            line_end=node.end_lineno
        )
        self.entities.append(entity)
    
    def _get_class_summary(self, node: ast.ClassDef) -> Dict:
        """Get summary of a class"""
        return {
            'name': node.name,
            'docstring': ast.get_docstring(node),
            'methods': [m.name for m in node.body if isinstance(m, ast.FunctionDef)],
            'bases': [self._get_name(b) for b in node.bases]
        }
    
    def _get_function_summary(self, node: ast.FunctionDef) -> Dict:
        """Get summary of a function"""
        params = []
        for arg in node.args.args:
            param_name = arg.arg
            if arg.annotation:
                param_type = self._get_annotation(arg.annotation)
                params.append(f"{param_name}: {param_type}")
            else:
                params.append(param_name)
                
        return_type = None
        if node.returns:
            return_type = self._get_annotation(node.returns)
            
        decorators = []
        for dec in node.decorator_list:
            if isinstance(dec, ast.Name):
                decorators.append(dec.id)
            elif isinstance(dec, ast.Attribute):
                decorators.append(f"{self._get_name(dec.value)}.{dec.attr}")
                
        return {
            'name': node.name,
            'docstring': ast.get_docstring(node),
            'params': params,
            'return_type': return_type,
            'decorators': decorators,
            'is_async': isinstance(node, ast.AsyncFunctionDef)
        }
    
    def _get_annotation(self, node: ast.AST) -> str:
        """Get string representation of type annotation"""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Constant):
            return str(node.value)
        elif isinstance(node, ast.Subscript):
            base = self._get_name(node.value)
            if isinstance(node.slice, ast.Index):
                # Python < 3.9
                index = self._get_name(node.slice.value)
            else:
                index = self._get_name(node.slice)
            return f"{base}[{index}]"
        else:
            return "Any"
    
    def _get_name(self, node: ast.AST) -> str:
        """Get name from various AST node types"""
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_name(node.value)}.{node.attr}"
        elif isinstance(node, ast.Constant):
            return str(node.value)
        else:
            return "?"


class MarkdownParser:
    """Parser for Markdown documentation files"""
    
    def parse_file(self, file_path: str) -> Tuple[List[Entity], List[Relation]]:
        """Parse Markdown file into entities and relations"""
        entities = []
        relations = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except (IOError, UnicodeDecodeError):
            return [], []
            
        file_name = Path(file_path).stem
        
        # Extract metadata from frontmatter if present
        frontmatter = self._extract_frontmatter(content)
        
        # Extract structure
        headers = self._extract_headers(content)
        code_blocks = self._extract_code_blocks(content)
        links = self._extract_links(content)
        
        # Create observations
        observations = []
        
        if frontmatter:
            if 'title' in frontmatter:
                observations.append(f"Title: {frontmatter['title']}")
            if 'description' in frontmatter:
                observations.append(f"Description: {frontmatter['description']}")
            if 'tags' in frontmatter:
                observations.append(f"Tags: {', '.join(frontmatter.get('tags', []))}")
                
        if headers:
            observations.append(f"Sections: {', '.join(headers[:5])}")
            if len(headers) > 5:
                observations.append(f"... and {len(headers) - 5} more sections")
                
        if code_blocks:
            languages = list(set([cb['language'] for cb in code_blocks if cb['language']]))
            if languages:
                observations.append(f"Code examples: {', '.join(languages)}")
                
        # Determine entity type
        entity_type = "Documentation"
        if 'spec' in file_name.lower():
            entity_type = "Specification"
        elif 'readme' in file_name.lower():
            entity_type = "README"
        elif 'guide' in file_name.lower():
            entity_type = "Guide"
        elif 'template' in file_name.lower():
            entity_type = "Template"
            
        entity = Entity(
            name=file_name,
            entity_type=entity_type,
            file_path=file_path,
            observations=observations
        )
        entities.append(entity)
        
        # Create relationships for internal links
        for link in links:
            if link.startswith('/') or link.startswith('./'):
                target = Path(link).stem
                relations.append(Relation(
                    from_entity=file_name,
                    to_entity=target,
                    relation_type="references"
                ))
                
        return entities, relations
    
    def _extract_frontmatter(self, content: str) -> Optional[Dict]:
        """Extract YAML frontmatter from markdown"""
        if content.startswith('---'):
            try:
                end_index = content.index('---', 3)
                frontmatter_text = content[3:end_index].strip()
                # Simple parsing - would use yaml.safe_load in production
                frontmatter = {}
                for line in frontmatter_text.split('\n'):
                    if ':' in line:
                        key, value = line.split(':', 1)
                        frontmatter[key.strip()] = value.strip()
                return frontmatter
            except:
                pass
        return None
    
    def _extract_headers(self, content: str) -> List[str]:
        """Extract headers from markdown"""
        headers = []
        for match in re.finditer(r'^#+\s+(.+)$', content, re.MULTILINE):
            headers.append(match.group(1))
        return headers
    
    def _extract_code_blocks(self, content: str) -> List[Dict]:
        """Extract code blocks from markdown"""
        code_blocks = []
        for match in re.finditer(r'```(\w+)?\n(.*?)\n```', content, re.DOTALL):
            language = match.group(1) or 'plain'
            code = match.group(2)
            code_blocks.append({
                'language': language,
                'code': code,
                'lines': len(code.split('\n'))
            })
        return code_blocks
    
    def _extract_links(self, content: str) -> List[str]:
        """Extract links from markdown"""
        links = []
        # Extract markdown links
        for match in re.finditer(r'\[.*?\]\((.*?)\)', content):
            links.append(match.group(1))
        return links


class CodeParser:
    """Main parser that delegates to language-specific parsers"""
    
    def __init__(self):
        self.python_parser = PythonParser()
        self.markdown_parser = MarkdownParser()
        
    def parse_file(self, file_path: str) -> Tuple[List[Entity], List[Relation]]:
        """Parse file based on extension"""
        path = Path(file_path)
        extension = path.suffix.lower()
        
        if extension == '.py':
            return self.python_parser.parse_file(file_path)
        elif extension in ['.md', '.markdown']:
            return self.markdown_parser.parse_file(file_path)
        else:
            # Default to simple file entity
            return self._create_simple_entity(file_path), []
            
    def _create_simple_entity(self, file_path: str) -> List[Entity]:
        """Create simple entity for unsupported file types"""
        file_name = Path(file_path).name
        extension = Path(file_path).suffix
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = len(f.readlines())
        except:
            lines = 0
            
        observations = [
            f"File type: {extension}",
            f"Lines: {lines}"
        ]
        
        return [Entity(
            name=file_name,
            entity_type="File",
            file_path=file_path,
            observations=observations
        )]


def main():
    """CLI interface for code parsing"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python code_parser.py <file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    parser = CodeParser()
    
    entities, relations = parser.parse_file(file_path)
    
    print(f"Parsed {file_path}:")
    print(f"  Entities: {len(entities)}")
    for entity in entities:
        print(f"    - {entity.name} ({entity.entity_type})")
        
    print(f"  Relations: {len(relations)}")
    for relation in relations[:5]:
        print(f"    - {relation.from_entity} {relation.relation_type} {relation.to_entity}")
    if len(relations) > 5:
        print(f"    ... and {len(relations) - 5} more")


if __name__ == "__main__":
    main()