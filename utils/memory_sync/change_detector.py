#!/usr/bin/env python3
"""
Change Detection System for Memory Sync Agent
Tracks file changes using hash comparison and maintains state
"""

import hashlib
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Optional, Tuple
import fnmatch


class ChangeDetector:
    """Detects file changes using hash comparison and timestamp tracking"""
    
    def __init__(self, state_file: str = ".mcp-data/memory_sync_state.json"):
        self.state_file = Path(state_file)
        self.state = self._load_state()
        self.ignore_patterns = self._load_ignore_patterns()
        
    def _load_state(self) -> Dict:
        """Load existing state or create new"""
        if self.state_file.exists():
            try:
                with open(self.state_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                return self._create_initial_state()
        return self._create_initial_state()
    
    def _create_initial_state(self) -> Dict:
        """Create initial state structure"""
        return {
            "last_sync": None,
            "file_hashes": {},
            "pending_changes": [],
            "sync_history": [],
            "config": {
                "tracked_extensions": [".py", ".ts", ".js", ".jsx", ".tsx", ".md", ".go"],
                "max_file_size_mb": 10,
                "exclude_dirs": ["node_modules", ".git", "__pycache__", "dist", "build", ".mcp-data"]
            }
        }
    
    def _load_ignore_patterns(self) -> List[str]:
        """Load patterns from .gitignore if exists"""
        patterns = [
            "*.pyc", "*.pyo", "__pycache__/",
            "node_modules/", ".git/", ".mcp-data/",
            "*.log", "*.tmp", ".DS_Store",
            "dist/", "build/", "*.min.js"
        ]
        
        gitignore_path = Path(".gitignore")
        if gitignore_path.exists():
            try:
                with open(gitignore_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            patterns.append(line)
            except IOError:
                pass
                
        return patterns
    
    def _should_ignore(self, file_path: Path) -> bool:
        """Check if file should be ignored"""
        # Check extension
        if file_path.suffix not in self.state["config"]["tracked_extensions"]:
            return True
            
        # Check file size
        try:
            size_mb = file_path.stat().st_size / (1024 * 1024)
            if size_mb > self.state["config"]["max_file_size_mb"]:
                return True
        except OSError:
            return True
            
        # Check exclude directories
        parts = file_path.parts
        for exclude_dir in self.state["config"]["exclude_dirs"]:
            if exclude_dir in parts:
                return True
                
        # Check ignore patterns
        str_path = str(file_path)
        for pattern in self.ignore_patterns:
            if fnmatch.fnmatch(str_path, pattern):
                return True
            if fnmatch.fnmatch(file_path.name, pattern):
                return True
                
        return False
    
    def _calculate_file_hash(self, file_path: Path) -> Optional[str]:
        """Calculate MD5 hash of file content"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except (IOError, OSError):
            return None
    
    def scan_directory(self, directory: str) -> Dict[str, str]:
        """Scan directory and calculate hashes for all tracked files"""
        dir_path = Path(directory)
        file_hashes = {}
        
        if not dir_path.exists():
            return file_hashes
            
        for file_path in dir_path.rglob("*"):
            if file_path.is_file() and not self._should_ignore(file_path):
                relative_path = str(file_path.relative_to(dir_path))
                file_hash = self._calculate_file_hash(file_path)
                if file_hash:
                    file_hashes[relative_path] = file_hash
                    
        return file_hashes
    
    def detect_changes(self, directory: str) -> Tuple[List[str], List[str], List[str]]:
        """
        Detect changes in directory compared to saved state
        Returns: (added_files, modified_files, deleted_files)
        """
        current_hashes = self.scan_directory(directory)
        saved_hashes = self.state["file_hashes"]
        
        added = []
        modified = []
        deleted = []
        
        # Find added and modified files
        for file_path, current_hash in current_hashes.items():
            if file_path not in saved_hashes:
                added.append(file_path)
            elif saved_hashes[file_path] != current_hash:
                modified.append(file_path)
                
        # Find deleted files
        for file_path in saved_hashes:
            if file_path not in current_hashes:
                deleted.append(file_path)
                
        return added, modified, deleted
    
    def queue_changes(self, added: List[str], modified: List[str], deleted: List[str]) -> None:
        """Queue detected changes for processing"""
        timestamp = datetime.now().isoformat()
        
        for file_path in added:
            self._add_to_pending(file_path, "added", timestamp)
            
        for file_path in modified:
            self._add_to_pending(file_path, "modified", timestamp)
            
        for file_path in deleted:
            self._add_to_pending(file_path, "deleted", timestamp)
            
    def _add_to_pending(self, file_path: str, change_type: str, timestamp: str) -> None:
        """Add file to pending changes if not already present"""
        # Remove existing entry for this file if present
        self.state["pending_changes"] = [
            change for change in self.state["pending_changes"]
            if change["file"] != file_path
        ]
        
        # Add new entry
        self.state["pending_changes"].append({
            "file": file_path,
            "change_type": change_type,
            "detected_at": timestamp
        })
    
    def get_pending_changes(self, limit: Optional[int] = None) -> List[Dict]:
        """Get pending changes for processing"""
        if limit:
            return self.state["pending_changes"][:limit]
        return self.state["pending_changes"]
    
    def mark_processed(self, file_paths: List[str]) -> None:
        """Mark files as processed and update hashes"""
        self.state["pending_changes"] = [
            change for change in self.state["pending_changes"]
            if change["file"] not in file_paths
        ]
        
    def update_hashes(self, directory: str, file_paths: List[str]) -> None:
        """Update hashes for specific files"""
        dir_path = Path(directory)
        
        for file_path in file_paths:
            full_path = dir_path / file_path
            if full_path.exists():
                file_hash = self._calculate_file_hash(full_path)
                if file_hash:
                    self.state["file_hashes"][file_path] = file_hash
            else:
                # File was deleted
                self.state["file_hashes"].pop(file_path, None)
                
    def save_state(self) -> None:
        """Save current state to file"""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)
            
    def add_sync_record(self, files_processed: int, entities_created: int,
                       relations_created: int, duration_ms: int) -> None:
        """Add record of completed sync"""
        self.state["last_sync"] = datetime.now().isoformat()
        self.state["sync_history"].append({
            "timestamp": self.state["last_sync"],
            "files_processed": files_processed,
            "entities_created": entities_created,
            "relations_created": relations_created,
            "duration_ms": duration_ms
        })
        
        # Keep only last 100 sync records
        if len(self.state["sync_history"]) > 100:
            self.state["sync_history"] = self.state["sync_history"][-100:]
            
    def get_status(self) -> Dict:
        """Get current status of change detection"""
        return {
            "last_sync": self.state["last_sync"],
            "tracked_files": len(self.state["file_hashes"]),
            "pending_changes": len(self.state["pending_changes"]),
            "sync_history_count": len(self.state["sync_history"])
        }


def main():
    """CLI interface for change detection"""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python change_detector.py <directory> [command]")
        print("Commands: scan, detect, status")
        sys.exit(1)
        
    directory = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "detect"
    
    detector = ChangeDetector()
    
    if command == "scan":
        hashes = detector.scan_directory(directory)
        print(f"Found {len(hashes)} tracked files")
        for file_path in sorted(hashes.keys())[:10]:
            print(f"  - {file_path}")
        if len(hashes) > 10:
            print(f"  ... and {len(hashes) - 10} more")
            
    elif command == "detect":
        added, modified, deleted = detector.detect_changes(directory)
        print(f"Changes detected:")
        print(f"  Added: {len(added)} files")
        print(f"  Modified: {len(modified)} files")
        print(f"  Deleted: {len(deleted)} files")
        
        if added or modified or deleted:
            detector.queue_changes(added, modified, deleted)
            detector.save_state()
            print("Changes queued for processing")
            
    elif command == "status":
        status = detector.get_status()
        print(f"Change Detection Status:")
        print(f"  Last sync: {status['last_sync'] or 'Never'}")
        print(f"  Tracked files: {status['tracked_files']}")
        print(f"  Pending changes: {status['pending_changes']}")
        print(f"  Sync history: {status['sync_history_count']} records")
        
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()