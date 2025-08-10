#!/usr/bin/env python3
"""
MCP Memory Integration for Memory Sync Agent
Interfaces with MCP memory tool to update knowledge graph
"""

import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path


@dataclass
class MemoryUpdate:
    """Represents an update to the memory graph"""
    entities_to_create: List[Dict]
    relations_to_create: List[Dict]
    observations_to_add: List[Dict]
    entities_to_delete: List[str]
    
    def summary(self) -> str:
        return (f"Entities: {len(self.entities_to_create)} new, "
                f"Relations: {len(self.relations_to_create)} new, "
                f"Observations: {len(self.observations_to_add)} additions")


class MCPMemoryInterface:
    """Interface to MCP Memory Tool"""
    
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.existing_entities = {}
        self.existing_relations = set()
        
    def search_entities_by_file(self, file_path: str) -> List[Dict]:
        """
        Search for existing entities from a specific file
        In production, this would call: mcp__memory__search_nodes
        """
        # Mock implementation - in production would call MCP tool
        query = f"file:{file_path}"
        
        if self.dry_run:
            print(f"[DRY RUN] Would search for entities with query: {query}")
            return []
            
        # In production:
        # return mcp__memory__search_nodes(query=query)
        return []
    
    def get_entity(self, entity_name: str) -> Optional[Dict]:
        """
        Get specific entity from memory
        In production, this would call: mcp__memory__open_nodes
        """
        if self.dry_run:
            print(f"[DRY RUN] Would fetch entity: {entity_name}")
            return None
            
        # In production:
        # result = mcp__memory__open_nodes(names=[entity_name])
        # return result[0] if result else None
        return self.existing_entities.get(entity_name)
    
    def create_entities(self, entities: List[Dict]) -> bool:
        """
        Create new entities in memory graph
        In production, this would call: mcp__memory__create_entities
        """
        if not entities:
            return True
            
        if self.dry_run:
            print(f"[DRY RUN] Would create {len(entities)} entities:")
            for entity in entities[:3]:
                print(f"  - {entity['name']} ({entity['entityType']})")
            if len(entities) > 3:
                print(f"  ... and {len(entities) - 3} more")
            return True
            
        # In production:
        # mcp__memory__create_entities(entities=entities)
        
        # Mock storage
        for entity in entities:
            self.existing_entities[entity['name']] = entity
            
        return True
    
    def create_relations(self, relations: List[Dict]) -> bool:
        """
        Create new relations in memory graph
        In production, this would call: mcp__memory__create_relations
        """
        if not relations:
            return True
            
        if self.dry_run:
            print(f"[DRY RUN] Would create {len(relations)} relations:")
            for rel in relations[:3]:
                print(f"  - {rel['from']} {rel['relationType']} {rel['to']}")
            if len(relations) > 3:
                print(f"  ... and {len(relations) - 3} more")
            return True
            
        # In production:
        # mcp__memory__create_relations(relations=relations)
        
        # Mock storage
        for rel in relations:
            key = (rel['from'], rel['relationType'], rel['to'])
            self.existing_relations.add(key)
            
        return True
    
    def add_observations(self, observations: List[Dict]) -> bool:
        """
        Add observations to existing entities
        In production, this would call: mcp__memory__add_observations
        """
        if not observations:
            return True
            
        if self.dry_run:
            print(f"[DRY RUN] Would add observations to {len(observations)} entities")
            return True
            
        # In production:
        # mcp__memory__add_observations(observations=observations)
        
        # Mock update
        for obs in observations:
            entity_name = obs['entityName']
            if entity_name in self.existing_entities:
                entity = self.existing_entities[entity_name]
                entity['observations'].extend(obs['contents'])
                
        return True
    
    def delete_entities(self, entity_names: List[str]) -> bool:
        """
        Delete entities from memory graph
        In production, this would call: mcp__memory__delete_entities
        """
        if not entity_names:
            return True
            
        if self.dry_run:
            print(f"[DRY RUN] Would delete {len(entity_names)} entities")
            return True
            
        # In production:
        # mcp__memory__delete_entities(entityNames=entity_names)
        
        # Mock deletion
        for name in entity_names:
            self.existing_entities.pop(name, None)
            
        return True


class MemoryBatchProcessor:
    """Processes entity and relation updates in batches"""
    
    def __init__(self, mcp_interface: MCPMemoryInterface):
        self.mcp = mcp_interface
        self.batch_size = 50  # Max entities per batch
        
    def process_entities(self, entities: List[Dict], file_path: str) -> MemoryUpdate:
        """Process entities for a file, determining what needs updating"""
        # Search for existing entities from this file
        existing = self.mcp.search_entities_by_file(file_path)
        existing_names = {e['name'] for e in existing}
        
        # Convert entity format for MCP
        mcp_entities = []
        for entity in entities:
            mcp_entity = {
                "name": entity['name'],
                "entityType": entity['entity_type'],
                "observations": entity['observations'].copy()
            }
            
            # Add file path as observation
            mcp_entity['observations'].append(f"Source: {entity['file_path']}")
            
            # Add line numbers if available
            if 'line_start' in entity and 'line_end' in entity:
                mcp_entity['observations'].append(
                    f"Lines: {entity['line_start']}-{entity['line_end']}"
                )
                
            mcp_entities.append(mcp_entity)
        
        # Separate new and existing entities
        new_entities = []
        observations_to_add = []
        
        for mcp_entity in mcp_entities:
            if mcp_entity['name'] not in existing_names:
                new_entities.append(mcp_entity)
            else:
                # Add as new observations to existing entity
                observations_to_add.append({
                    "entityName": mcp_entity['name'],
                    "contents": [f"Updated: {obs}" for obs in mcp_entity['observations']]
                })
        
        # Find entities that no longer exist in the file
        current_names = {e['name'] for e in entities}
        entities_to_delete = []
        
        for existing_entity in existing:
            if existing_entity['name'] not in current_names:
                # Mark as archived instead of deleting
                observations_to_add.append({
                    "entityName": existing_entity['name'],
                    "contents": ["Status: Archived - no longer in source file"]
                })
        
        return MemoryUpdate(
            entities_to_create=new_entities,
            relations_to_create=[],  # Will be set separately
            observations_to_add=observations_to_add,
            entities_to_delete=entities_to_delete
        )
    
    def process_relations(self, relations: List[Dict]) -> List[Dict]:
        """Process relations, converting format for MCP"""
        mcp_relations = []
        
        for relation in relations:
            # Check if relation already exists
            key = (relation['from_entity'], relation['relation_type'], relation['to_entity'])
            if key not in self.mcp.existing_relations:
                mcp_relations.append({
                    "from": relation['from_entity'],
                    "to": relation['to_entity'],
                    "relationType": relation['relation_type']
                })
                
        return mcp_relations
    
    def apply_update(self, update: MemoryUpdate) -> bool:
        """Apply a memory update in batches"""
        success = True
        
        # Process entities in batches
        if update.entities_to_create:
            for i in range(0, len(update.entities_to_create), self.batch_size):
                batch = update.entities_to_create[i:i+self.batch_size]
                success = success and self.mcp.create_entities(batch)
                
        # Process relations in batches
        if update.relations_to_create:
            for i in range(0, len(update.relations_to_create), self.batch_size):
                batch = update.relations_to_create[i:i+self.batch_size]
                success = success and self.mcp.create_relations(batch)
                
        # Add observations
        if update.observations_to_add:
            success = success and self.mcp.add_observations(update.observations_to_add)
            
        # Delete entities (usually we archive instead)
        if update.entities_to_delete:
            success = success and self.mcp.delete_entities(update.entities_to_delete)
            
        return success


class MemorySyncIntegration:
    """Main integration class for memory sync"""
    
    def __init__(self, dry_run: bool = False):
        self.mcp = MCPMemoryInterface(dry_run=dry_run)
        self.processor = MemoryBatchProcessor(self.mcp)
        
    def sync_file(self, file_path: str, entities: List[Dict], relations: List[Dict]) -> Dict:
        """Sync a single file to memory"""
        # Process entities
        update = self.processor.process_entities(entities, file_path)
        
        # Process relations
        update.relations_to_create = self.processor.process_relations(relations)
        
        # Apply update
        success = self.processor.apply_update(update)
        
        return {
            "success": success,
            "summary": update.summary(),
            "entities_created": len(update.entities_to_create),
            "relations_created": len(update.relations_to_create),
            "observations_added": len(update.observations_to_add)
        }
    
    def sync_batch(self, files: List[Tuple[str, List[Dict], List[Dict]]]) -> Dict:
        """Sync multiple files in a batch"""
        total_entities = 0
        total_relations = 0
        total_observations = 0
        failed_files = []
        
        for file_path, entities, relations in files:
            try:
                result = self.sync_file(file_path, entities, relations)
                if result["success"]:
                    total_entities += result["entities_created"]
                    total_relations += result["relations_created"]
                    total_observations += result["observations_added"]
                else:
                    failed_files.append(file_path)
            except Exception as e:
                print(f"Error syncing {file_path}: {e}")
                failed_files.append(file_path)
                
        return {
            "success": len(failed_files) == 0,
            "files_processed": len(files),
            "failed_files": failed_files,
            "total_entities_created": total_entities,
            "total_relations_created": total_relations,
            "total_observations_added": total_observations
        }


def main():
    """CLI interface for memory integration testing"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python memory_integration.py <command> [options]")
        print("Commands: test, dry-run")
        sys.exit(1)
        
    command = sys.argv[1]
    
    if command == "test":
        # Test with mock data
        integration = MemorySyncIntegration(dry_run=False)
        
        test_entities = [
            {
                "name": "TestClass",
                "entity_type": "PythonClass",
                "file_path": "test.py",
                "observations": ["Test class for demo", "Has 3 methods"]
            }
        ]
        
        test_relations = [
            {
                "from_entity": "TestClass",
                "to_entity": "BaseClass",
                "relation_type": "extends"
            }
        ]
        
        result = integration.sync_file("test.py", test_entities, test_relations)
        print(f"Test sync result: {json.dumps(result, indent=2)}")
        
    elif command == "dry-run":
        # Dry run mode
        integration = MemorySyncIntegration(dry_run=True)
        
        test_entities = [
            {
                "name": "DemoModule",
                "entity_type": "PythonModule",
                "file_path": "demo.py",
                "observations": ["Demo module", "Contains utilities"]
            }
        ]
        
        test_relations = [
            {
                "from_entity": "DemoModule",
                "to_entity": "os",
                "relation_type": "imports"
            }
        ]
        
        print("Running in DRY RUN mode...")
        result = integration.sync_file("demo.py", test_entities, test_relations)
        print(f"Dry run result: {json.dumps(result, indent=2)}")
        
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()