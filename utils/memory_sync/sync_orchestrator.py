#!/usr/bin/env python3
"""
Sync Orchestrator for Memory Sync Agent
Main orchestration logic that coordinates all components
"""

import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

# Import our components
from change_detector import ChangeDetector
from code_parser import CodeParser
from memory_integration import MemorySyncIntegration


class SyncOrchestrator:
    """Orchestrates the complete memory sync process"""
    
    def __init__(self, base_directory: str = ".", dry_run: bool = False, verbose: bool = False):
        self.base_directory = Path(base_directory).resolve()
        self.dry_run = dry_run
        self.verbose = verbose
        
        # Initialize components
        self.detector = ChangeDetector()
        self.parser = CodeParser()
        self.memory = MemorySyncIntegration(dry_run=dry_run)
        
        # Stats tracking
        self.stats = {
            "files_processed": 0,
            "entities_created": 0,
            "relations_created": 0,
            "errors": [],
            "duration_ms": 0
        }
        
    def sync_all(self, force: bool = False) -> Dict:
        """Perform a complete sync of all tracked files"""
        start_time = time.time()
        
        print(f"Starting {'DRY RUN ' if self.dry_run else ''}sync for: {self.base_directory}")
        
        # Detect changes
        if force:
            print("Force sync - processing all files")
            # Get all tracked files
            current_hashes = self.detector.scan_directory(str(self.base_directory))
            added = list(current_hashes.keys())
            modified = []
            deleted = []
        else:
            added, modified, deleted = self.detector.detect_changes(str(self.base_directory))
            
        total_changes = len(added) + len(modified) + len(deleted)
        
        if total_changes == 0:
            print("No changes detected")
            return {
                "success": True,
                "message": "No changes to sync",
                "stats": self.stats
            }
            
        print(f"Changes detected: {len(added)} added, {len(modified)} modified, {len(deleted)} deleted")
        
        # Queue changes
        self.detector.queue_changes(added, modified, deleted)
        
        # Process changes in batches
        batch_size = 10
        pending = self.detector.get_pending_changes()
        
        for i in range(0, len(pending), batch_size):
            batch = pending[i:i+batch_size]
            self._process_batch(batch)
            
        # Update state
        if not self.dry_run:
            processed_files = [change['file'] for change in pending]
            self.detector.update_hashes(str(self.base_directory), processed_files)
            self.detector.mark_processed(processed_files)
            
            # Record sync
            duration_ms = int((time.time() - start_time) * 1000)
            self.stats["duration_ms"] = duration_ms
            self.detector.add_sync_record(
                files_processed=self.stats["files_processed"],
                entities_created=self.stats["entities_created"],
                relations_created=self.stats["relations_created"],
                duration_ms=duration_ms
            )
            self.detector.save_state()
            
        # Final report
        self._print_summary()
        
        return {
            "success": len(self.stats["errors"]) == 0,
            "stats": self.stats
        }
    
    def sync_file(self, file_path: str) -> Dict:
        """Sync a specific file"""
        start_time = time.time()
        full_path = self.base_directory / file_path
        
        if not full_path.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}"
            }
            
        print(f"Syncing file: {file_path}")
        
        # Parse file
        entities, relations = self._parse_file(str(full_path))
        
        if entities is None:
            return {
                "success": False,
                "error": f"Failed to parse: {file_path}"
            }
            
        # Sync to memory
        result = self.memory.sync_file(file_path, entities, relations)
        
        # Update stats
        self.stats["files_processed"] += 1
        self.stats["entities_created"] += result.get("entities_created", 0)
        self.stats["relations_created"] += result.get("relations_created", 0)
        self.stats["duration_ms"] = int((time.time() - start_time) * 1000)
        
        return result
    
    def sync_directory(self, directory: str, file_types: Optional[List[str]] = None) -> Dict:
        """Sync all files in a directory"""
        start_time = time.time()
        dir_path = self.base_directory / directory
        
        if not dir_path.exists():
            return {
                "success": False,
                "error": f"Directory not found: {directory}"
            }
            
        print(f"Syncing directory: {directory}")
        
        # Find files to sync
        files_to_sync = []
        for file_path in dir_path.rglob("*"):
            if file_path.is_file():
                if file_types:
                    if file_path.suffix not in file_types:
                        continue
                        
                relative_path = file_path.relative_to(self.base_directory)
                if not self.detector._should_ignore(relative_path):
                    files_to_sync.append(str(relative_path))
                    
        print(f"Found {len(files_to_sync)} files to sync")
        
        # Process files
        for file_path in files_to_sync:
            self.sync_file(file_path)
            
        self.stats["duration_ms"] = int((time.time() - start_time) * 1000)
        
        return {
            "success": len(self.stats["errors"]) == 0,
            "stats": self.stats
        }
    
    def _process_batch(self, batch: List[Dict]) -> None:
        """Process a batch of file changes"""
        files_to_sync = []
        
        for change in batch:
            file_path = change["file"]
            change_type = change["change_type"]
            
            if change_type == "deleted":
                # Handle deleted files
                self._handle_deleted_file(file_path)
            else:
                # Parse and prepare for sync
                full_path = self.base_directory / file_path
                entities, relations = self._parse_file(str(full_path))
                
                if entities is not None:
                    files_to_sync.append((file_path, entities, relations))
                    
        # Batch sync to memory
        if files_to_sync:
            result = self.memory.sync_batch(files_to_sync)
            self.stats["files_processed"] += result["files_processed"]
            self.stats["entities_created"] += result["total_entities_created"]
            self.stats["relations_created"] += result["total_relations_created"]
            
            if result["failed_files"]:
                self.stats["errors"].extend(result["failed_files"])
    
    def _parse_file(self, file_path: str) -> Tuple[Optional[List[Dict]], Optional[List[Dict]]]:
        """Parse a file based on its type"""
        try:
            path = Path(file_path)
            extension = path.suffix.lower()
            
            if extension in ['.ts', '.tsx', '.js', '.jsx']:
                # Use TypeScript parser
                return self._parse_typescript_file(file_path)
            else:
                # Use Python parser (handles Python and Markdown)
                entities, relations = self.parser.parse_file(file_path)
                
                # Convert to dict format
                entities_dict = [e.to_dict() for e in entities]
                relations_dict = [r.to_dict() for r in relations]
                
                if self.verbose:
                    print(f"  Parsed {path.name}: {len(entities_dict)} entities, {len(relations_dict)} relations")
                    
                return entities_dict, relations_dict
                
        except Exception as e:
            print(f"  Error parsing {file_path}: {e}")
            self.stats["errors"].append(f"{file_path}: {str(e)}")
            return None, None
    
    def _parse_typescript_file(self, file_path: str) -> Tuple[Optional[List[Dict]], Optional[List[Dict]]]:
        """Parse TypeScript/JavaScript file using Node.js parser"""
        try:
            # Call TypeScript parser
            parser_path = Path(__file__).parent / "ts_parser.js"
            result = subprocess.run(
                ["node", str(parser_path), file_path],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                print(f"  TypeScript parser error: {result.stderr}")
                return None, None
                
            # Parse JSON output
            output = json.loads(result.stdout)
            entities = output.get("entities", [])
            relations = output.get("relations", [])
            
            if self.verbose:
                file_name = Path(file_path).name
                print(f"  Parsed {file_name}: {len(entities)} entities, {len(relations)} relations")
                
            return entities, relations
            
        except subprocess.TimeoutExpired:
            print(f"  TypeScript parser timeout for: {file_path}")
            return None, None
        except json.JSONDecodeError as e:
            print(f"  Invalid JSON from TypeScript parser: {e}")
            return None, None
        except Exception as e:
            print(f"  Error calling TypeScript parser: {e}")
            return None, None
    
    def _handle_deleted_file(self, file_path: str) -> None:
        """Handle a deleted file by archiving its entities"""
        if self.verbose:
            print(f"  Archiving entities from deleted file: {file_path}")
            
        # In production, would mark entities as archived
        # For now, we'll just track it
        pass
    
    def _print_summary(self) -> None:
        """Print sync summary"""
        print("\n" + "="*50)
        print("SYNC SUMMARY")
        print("="*50)
        print(f"Files processed: {self.stats['files_processed']}")
        print(f"Entities created: {self.stats['entities_created']}")
        print(f"Relations created: {self.stats['relations_created']}")
        print(f"Duration: {self.stats['duration_ms']}ms")
        
        if self.stats["errors"]:
            print(f"\nErrors ({len(self.stats['errors'])}):")
            for error in self.stats["errors"][:5]:
                print(f"  - {error}")
            if len(self.stats["errors"]) > 5:
                print(f"  ... and {len(self.stats['errors']) - 5} more")
                
        print("="*50)
    
    def get_status(self) -> Dict:
        """Get current sync status"""
        status = self.detector.get_status()
        status["base_directory"] = str(self.base_directory)
        status["dry_run"] = self.dry_run
        return status


def main():
    """CLI interface for sync orchestrator"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Memory Sync Orchestrator")
    parser.add_argument("directory", help="Directory to sync", nargs="?", default=".")
    parser.add_argument("--command", choices=["sync", "status", "file", "dir"], default="sync")
    parser.add_argument("--file", help="Specific file to sync")
    parser.add_argument("--types", help="File types to sync (comma-separated)", default="")
    parser.add_argument("--force", action="store_true", help="Force full sync")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode")
    parser.add_argument("--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    # Create orchestrator
    orchestrator = SyncOrchestrator(
        base_directory=args.directory,
        dry_run=args.dry_run,
        verbose=args.verbose
    )
    
    # Execute command
    if args.command == "status":
        status = orchestrator.get_status()
        print(json.dumps(status, indent=2))
        
    elif args.command == "file":
        if not args.file:
            print("Error: --file required for file command")
            sys.exit(1)
        result = orchestrator.sync_file(args.file)
        print(json.dumps(result, indent=2))
        
    elif args.command == "dir":
        file_types = args.types.split(",") if args.types else None
        result = orchestrator.sync_directory(args.directory, file_types)
        print(json.dumps(result, indent=2))
        
    else:  # sync
        result = orchestrator.sync_all(force=args.force)
        sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()