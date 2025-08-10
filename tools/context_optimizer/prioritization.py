"""
Context prioritization system for intelligent content ranking.

This module implements algorithms to rank content by relevance to specific
agent tasks, enabling smart truncation and optimization decisions.
"""

import re
import math
from typing import Dict, List, Tuple, Optional, Any, Set
from pathlib import Path
from dataclasses import dataclass
import logging

from .content_analyzer import ContentSection, ContentAnalysis, ContextAnalyzer

logger = logging.getLogger(__name__)


@dataclass
class PriorityScore:
    """Represents a priority score for content with detailed breakdown."""
    
    content_id: str
    total_score: float
    relevance_score: float
    importance_score: float
    recency_score: float
    file_type_score: float
    context_score: float
    task_alignment_score: float
    
    def __post_init__(self):
        """Calculate total score if not provided."""
        if self.total_score == 0.0:
            self.total_score = (
                self.relevance_score * 0.3 +
                self.importance_score * 0.25 +
                self.task_alignment_score * 0.2 +
                self.context_score * 0.15 +
                self.file_type_score * 0.05 +
                self.recency_score * 0.05
            )


@dataclass
class PrioritizationResult:
    """Result of content prioritization with ranked items."""
    
    ranked_sections: List[Tuple[ContentSection, PriorityScore]]
    total_sections: int
    prioritization_strategy: str
    agent_type: str
    task_description: str
    processing_time_ms: float
    
    def get_top_sections(self, count: int) -> List[ContentSection]:
        """Get top N sections by priority score."""
        return [section for section, _ in self.ranked_sections[:count]]
    
    def get_sections_above_threshold(self, threshold: float) -> List[ContentSection]:
        """Get sections with priority score above threshold."""
        return [section for section, score in self.ranked_sections 
                if score.total_score >= threshold]


class ContextPrioritizer:
    """
    Intelligent context prioritization system.
    
    Ranks content sections by relevance to specific agent types and tasks,
    enabling smart content selection and optimization decisions.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """Initialize the prioritization system."""
        self.config = config or {}
        
        # Agent-specific keyword mappings
        self.agent_keywords = {
            'architect': {
                'high': ['class', 'interface', 'module', 'component', 'structure', 'design', 
                        'pattern', 'architecture', 'system', 'relationship', 'dependency'],
                'medium': ['function', 'method', 'api', 'endpoint', 'service', 'model'],
                'low': ['test', 'example', 'debug', 'temp', 'todo']
            },
            'coder': {
                'high': ['function', 'method', 'class', 'implementation', 'algorithm', 
                        'logic', 'code', 'variable', 'parameter'],
                'medium': ['import', 'module', 'library', 'framework', 'api'],
                'low': ['comment', 'documentation', 'readme', 'license']
            },
            'tester': {
                'high': ['test', 'spec', 'assertion', 'mock', 'fixture', 'validation',
                        'verify', 'expect', 'should', 'coverage'],
                'medium': ['function', 'method', 'class', 'behavior', 'scenario'],
                'low': ['documentation', 'readme', 'comment']
            },
            'security': {
                'high': ['auth', 'security', 'encryption', 'hash', 'token', 'password',
                        'permission', 'access', 'vulnerability', 'attack', 'protect'],
                'medium': ['user', 'role', 'session', 'login', 'validation', 'input'],
                'low': ['ui', 'display', 'format', 'style']
            },
            'documenter': {
                'high': ['documentation', 'readme', 'guide', 'tutorial', 'example',
                        'usage', 'api', 'reference', 'manual', 'help'],
                'medium': ['description', 'parameter', 'return', 'note', 'warning'],
                'low': ['implementation', 'debug', 'test', 'temp']
            },
            'performance': {
                'high': ['performance', 'optimization', 'speed', 'memory', 'cache',
                        'benchmark', 'profile', 'efficient', 'fast', 'slow'],
                'medium': ['algorithm', 'complexity', 'resource', 'cpu', 'io'],
                'low': ['documentation', 'comment', 'example']
            }
        }
        
        # File type importance weights
        self.file_type_weights = self.config.get('file_type_weights', {
            'py': 1.0, 'js': 1.0, 'ts': 1.0, 'java': 1.0,
            'md': 0.7, 'txt': 0.5, 'json': 0.8, 'yaml': 0.8,
            'xml': 0.6, 'html': 0.6, 'css': 0.6, 'sql': 0.9
        })
        
        # Task-specific patterns
        self.task_patterns = {
            'code_review': ['function', 'method', 'class', 'logic', 'algorithm'],
            'documentation': ['readme', 'doc', 'guide', 'manual', 'reference'],
            'debugging': ['error', 'exception', 'bug', 'issue', 'problem', 'fix'],
            'refactoring': ['structure', 'design', 'pattern', 'clean', 'improve'],
            'testing': ['test', 'spec', 'validation', 'verification', 'assertion'],
            'security_review': ['security', 'auth', 'permission', 'vulnerability'],
            'performance_analysis': ['performance', 'optimization', 'benchmark', 'profile']
        }
    
    def prioritize_content(self, content_analysis: ContentAnalysis, 
                          agent_type: str, task_description: str,
                          file_metadata: Dict[str, Any] = None) -> PrioritizationResult:
        """
        Prioritize content sections based on agent type and task.
        
        Args:
            content_analysis: Analyzed content with sections
            agent_type: Type of agent requesting prioritization
            task_description: Description of the task to be performed
            file_metadata: Optional metadata about the file
            
        Returns:
            PrioritizationResult with ranked sections
        """
        import time
        start_time = time.time()
        
        try:
            file_metadata = file_metadata or {}
            
            # Score each section
            scored_sections = []
            for section in content_analysis.sections:
                priority_score = self._calculate_section_priority(
                    section, agent_type, task_description, 
                    content_analysis, file_metadata
                )
                scored_sections.append((section, priority_score))
            
            # Sort by total score (highest first)
            scored_sections.sort(key=lambda x: x[1].total_score, reverse=True)
            
            processing_time = (time.time() - start_time) * 1000  # Convert to ms
            
            return PrioritizationResult(
                ranked_sections=scored_sections,
                total_sections=len(content_analysis.sections),
                prioritization_strategy=self._get_strategy_name(agent_type, task_description),
                agent_type=agent_type,
                task_description=task_description,
                processing_time_ms=processing_time
            )
            
        except Exception as e:
            logger.error(f"Content prioritization failed: {e}")
            # Return sections in original order with default scores
            default_sections = [
                (section, PriorityScore(
                    content_id=section.name,
                    total_score=0.5,
                    relevance_score=0.5, importance_score=0.5, recency_score=0.5,
                    file_type_score=0.5, context_score=0.5, task_alignment_score=0.5
                ))
                for section in content_analysis.sections
            ]
            
            return PrioritizationResult(
                ranked_sections=default_sections,
                total_sections=len(content_analysis.sections),
                prioritization_strategy="fallback",
                agent_type=agent_type,
                task_description=task_description,
                processing_time_ms=0.0
            )
    
    def prioritize_files(self, file_analyses: List[Tuple[str, ContentAnalysis]], 
                        agent_type: str, task_description: str) -> List[Tuple[str, float]]:
        """
        Prioritize entire files based on agent type and task.
        
        Args:
            file_analyses: List of (file_path, content_analysis) tuples
            agent_type: Type of agent requesting prioritization
            task_description: Description of the task
            
        Returns:
            List of (file_path, priority_score) tuples, sorted by priority
        """
        try:
            scored_files = []
            
            for file_path, analysis in file_analyses:
                file_score = self._calculate_file_priority(
                    file_path, analysis, agent_type, task_description
                )
                scored_files.append((file_path, file_score))
            
            # Sort by score (highest first)
            scored_files.sort(key=lambda x: x[1], reverse=True)
            
            return scored_files
            
        except Exception as e:
            logger.error(f"File prioritization failed: {e}")
            # Return files in original order with default scores
            return [(path, 0.5) for path, _ in file_analyses]
    
    def get_priority_explanation(self, priority_score: PriorityScore) -> Dict[str, str]:
        """Get human-readable explanation of priority score components."""
        explanations = {}
        
        if priority_score.relevance_score > 0.7:
            explanations['relevance'] = "High relevance to agent type"
        elif priority_score.relevance_score > 0.4:
            explanations['relevance'] = "Medium relevance to agent type"
        else:
            explanations['relevance'] = "Low relevance to agent type"
        
        if priority_score.task_alignment_score > 0.7:
            explanations['task_alignment'] = "Strong alignment with task description"
        elif priority_score.task_alignment_score > 0.4:
            explanations['task_alignment'] = "Moderate alignment with task description"
        else:
            explanations['task_alignment'] = "Weak alignment with task description"
        
        if priority_score.importance_score > 0.7:
            explanations['importance'] = "High structural importance"
        elif priority_score.importance_score > 0.4:
            explanations['importance'] = "Medium structural importance"
        else:
            explanations['importance'] = "Low structural importance"
        
        return explanations
    
    def _calculate_section_priority(self, section: ContentSection, agent_type: str,
                                  task_description: str, content_analysis: ContentAnalysis,
                                  file_metadata: Dict[str, Any]) -> PriorityScore:
        """Calculate priority score for a content section."""
        
        # 1. Relevance score based on agent type
        relevance_score = self._calculate_agent_relevance(section, agent_type)
        
        # 2. Task alignment score
        task_alignment_score = self._calculate_task_alignment(section, task_description)
        
        # 3. Importance score (from content analysis)
        importance_score = section.importance_score
        
        # 4. File type score
        file_type_score = self._calculate_file_type_score(content_analysis.file_extension)
        
        # 5. Context score (position and relationships)
        context_score = self._calculate_context_score(section, content_analysis.sections)
        
        # 6. Recency score (if available in metadata)
        recency_score = self._calculate_recency_score(file_metadata)
        
        return PriorityScore(
            content_id=section.name,
            total_score=0.0,  # Will be calculated in __post_init__
            relevance_score=relevance_score,
            importance_score=importance_score,
            recency_score=recency_score,
            file_type_score=file_type_score,
            context_score=context_score,
            task_alignment_score=task_alignment_score
        )
    
    def _calculate_agent_relevance(self, section: ContentSection, agent_type: str) -> float:
        """Calculate how relevant a section is to a specific agent type."""
        agent_keywords = self.agent_keywords.get(agent_type.lower(), {})
        
        if not agent_keywords:
            return 0.5  # Default relevance for unknown agents
        
        content_lower = section.content.lower()
        name_lower = section.name.lower()
        
        # Score based on keyword matches
        high_matches = sum(1 for keyword in agent_keywords.get('high', [])
                          if keyword in content_lower or keyword in name_lower)
        medium_matches = sum(1 for keyword in agent_keywords.get('medium', [])
                            if keyword in content_lower or keyword in name_lower)
        low_matches = sum(1 for keyword in agent_keywords.get('low', [])
                         if keyword in content_lower or keyword in name_lower)
        
        # Calculate weighted score
        total_keywords = len(agent_keywords.get('high', [])) + len(agent_keywords.get('medium', [])) + len(agent_keywords.get('low', []))
        if total_keywords == 0:
            return 0.5
        
        relevance_score = (
            (high_matches * 1.0 + medium_matches * 0.6 + low_matches * 0.2) / 
            (total_keywords * 0.6)  # Normalize against average keyword weight
        )
        
        return min(1.0, relevance_score)
    
    def _calculate_task_alignment(self, section: ContentSection, task_description: str) -> float:
        """Calculate how well a section aligns with the task description."""
        task_lower = task_description.lower()
        content_lower = section.content.lower()
        name_lower = section.name.lower()
        
        # Extract key terms from task description
        task_words = set(re.findall(r'\b\w{3,}\b', task_lower))
        
        # Remove common words
        common_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                       'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 
                       'during', 'before', 'after', 'above', 'below', 'between', 'this', 
                       'that', 'these', 'those', 'any', 'some', 'all', 'each', 'every'}
        task_words = task_words - common_words
        
        if not task_words:
            return 0.5  # Default if no meaningful words
        
        # Check for task pattern matches
        alignment_score = 0.0
        for pattern_name, keywords in self.task_patterns.items():
            if any(keyword in task_lower for keyword in keywords):
                # This task matches a known pattern
                pattern_matches = sum(1 for keyword in keywords
                                    if keyword in content_lower or keyword in name_lower)
                alignment_score = max(alignment_score, pattern_matches / len(keywords))
        
        # Direct word matching
        direct_matches = sum(1 for word in task_words
                           if word in content_lower or word in name_lower)
        direct_score = direct_matches / len(task_words)
        
        # Combine scores
        final_score = max(alignment_score, direct_score * 0.7)  # Prefer pattern matching
        
        return min(1.0, final_score)
    
    def _calculate_file_type_score(self, file_extension: str) -> float:
        """Calculate score based on file type importance."""
        ext = file_extension.lower().lstrip('.')
        return self.file_type_weights.get(ext, 0.5)
    
    def _calculate_context_score(self, section: ContentSection, 
                                all_sections: List[ContentSection]) -> float:
        """Calculate contextual importance of a section."""
        context_score = 0.5  # Base score
        
        # Position-based scoring
        section_index = None
        for i, s in enumerate(all_sections):
            if s.name == section.name:
                section_index = i
                break
        
        if section_index is not None:
            total_sections = len(all_sections)
            
            # Sections at the beginning or end are often more important
            if section_index == 0:
                context_score += 0.2  # First section bonus
            elif section_index == total_sections - 1:
                context_score += 0.1  # Last section bonus
            elif section_index < total_sections * 0.2:
                context_score += 0.15  # Early section bonus
        
        # Size-based scoring (larger sections might be more important)
        if section.token_count > 0:
            avg_size = sum(s.token_count for s in all_sections) / len(all_sections)
            if section.token_count > avg_size:
                size_bonus = min(0.2, (section.token_count / avg_size - 1) * 0.1)
                context_score += size_bonus
        
        # Section type scoring
        if section.section_type in ['function_def', 'class_def']:
            context_score += 0.2
        elif section.section_type in ['import_stmt', 'module_level']:
            context_score += 0.1
        
        return min(1.0, context_score)
    
    def _calculate_recency_score(self, file_metadata: Dict[str, Any]) -> float:
        """Calculate score based on file recency."""
        # If we have modification time information
        modified_time = file_metadata.get('modified_time')
        if modified_time:
            import time
            current_time = time.time()
            age_days = (current_time - modified_time) / (24 * 3600)
            
            # More recent files get higher scores
            if age_days < 1:
                return 1.0
            elif age_days < 7:
                return 0.8
            elif age_days < 30:
                return 0.6
            elif age_days < 90:
                return 0.4
            else:
                return 0.2
        
        return 0.5  # Default if no recency information
    
    def _calculate_file_priority(self, file_path: str, content_analysis: ContentAnalysis,
                               agent_type: str, task_description: str) -> float:
        """Calculate priority score for an entire file."""
        
        # File name analysis
        file_name = Path(file_path).name.lower()
        
        # Agent-specific file name patterns
        agent_file_patterns = {
            'architect': ['design', 'structure', 'model', 'schema', 'interface'],
            'coder': ['main', 'core', 'lib', 'src', 'impl'],
            'tester': ['test', 'spec', 'mock', 'fixture'],
            'security': ['auth', 'security', 'crypto', 'permission'],
            'documenter': ['readme', 'doc', 'guide', 'manual'],
            'performance': ['perf', 'benchmark', 'optimize', 'profile']
        }
        
        file_name_score = 0.0
        patterns = agent_file_patterns.get(agent_type.lower(), [])
        for pattern in patterns:
            if pattern in file_name:
                file_name_score = max(file_name_score, 0.8)
            elif pattern in file_path.lower():
                file_name_score = max(file_name_score, 0.6)
        
        # Content-based scoring
        if content_analysis.sections:
            avg_importance = sum(s.importance_score for s in content_analysis.sections) / len(content_analysis.sections)
            avg_relevance = sum(
                self._calculate_agent_relevance(s, agent_type) 
                for s in content_analysis.sections
            ) / len(content_analysis.sections)
            content_score = (avg_importance * 0.6 + avg_relevance * 0.4)
        else:
            content_score = 0.5
        
        # File type scoring
        file_type_score = self._calculate_file_type_score(content_analysis.file_extension)
        
        # Complexity scoring (more complex files might be more important)
        complexity_score = min(1.0, content_analysis.complexity_score * 2)
        
        # Combine scores
        total_score = (
            file_name_score * 0.2 +
            content_score * 0.5 +
            file_type_score * 0.15 +
            complexity_score * 0.15
        )
        
        return min(1.0, total_score)
    
    def _get_strategy_name(self, agent_type: str, task_description: str) -> str:
        """Get a descriptive name for the prioritization strategy used."""
        task_lower = task_description.lower()
        
        # Identify task type
        task_type = "general"
        for pattern_name, keywords in self.task_patterns.items():
            if any(keyword in task_lower for keyword in keywords):
                task_type = pattern_name
                break
        
        return f"{agent_type}_{task_type}_prioritization"
    
    def batch_prioritize_content(self, content_items: List[Tuple[str, ContentAnalysis]], 
                               agent_type: str, task_description: str) -> Dict[str, PrioritizationResult]:
        """
        Prioritize multiple content items in batch for efficiency.
        
        Args:
            content_items: List of (identifier, content_analysis) tuples
            agent_type: Type of agent
            task_description: Task description
            
        Returns:
            Dictionary mapping identifiers to prioritization results
        """
        results = {}
        
        for identifier, content_analysis in content_items:
            try:
                result = self.prioritize_content(
                    content_analysis, agent_type, task_description
                )
                results[identifier] = result
            except Exception as e:
                logger.error(f"Failed to prioritize content {identifier}: {e}")
                # Create default result
                default_sections = [
                    (section, PriorityScore(
                        content_id=section.name, total_score=0.5,
                        relevance_score=0.5, importance_score=0.5, recency_score=0.5,
                        file_type_score=0.5, context_score=0.5, task_alignment_score=0.5
                    ))
                    for section in content_analysis.sections
                ]
                
                results[identifier] = PrioritizationResult(
                    ranked_sections=default_sections,
                    total_sections=len(content_analysis.sections),
                    prioritization_strategy="error_fallback",
                    agent_type=agent_type,
                    task_description=task_description,
                    processing_time_ms=0.0
                )
        
        return results