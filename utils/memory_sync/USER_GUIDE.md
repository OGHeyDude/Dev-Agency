# Memory Sync Agent User Guide

## Overview

The Memory Sync Agent automatically maintains a knowledge graph of your codebase in the MCP memory tool, providing intelligent code understanding and relationship tracking.

## Quick Start

### 1. Check Installation
```bash
# Verify Python components
python3 change_detector.py . status

# Verify TypeScript parser
node ts_parser.js test.ts

# Check orchestrator
python3 sync_orchestrator.py . --dry-run
```

### 2. Initial Setup
```bash
# Create state directory
mkdir -p .mcp-data

# Run initial scan
python3 change_detector.py . scan

# Perform first sync (dry run)
python3 sync_orchestrator.py . --dry-run
```

### 3. Production Sync
```bash
# Full sync
python3 sync_orchestrator.py .

# Check results
python3 sync_orchestrator.py . --command status
```

## Commands

### Basic Sync Commands

#### Sync All Changes
```bash
python3 sync_orchestrator.py .
```
Syncs all detected changes since last sync.

#### Force Full Sync
```bash
python3 sync_orchestrator.py . --force
```
Processes all files regardless of changes.

#### Dry Run Mode
```bash
python3 sync_orchestrator.py . --dry-run
```
Shows what would be synced without making changes.

### Targeted Sync

#### Sync Specific Directory
```bash
python3 sync_orchestrator.py . --command dir --directory /path/to/dir
```

#### Sync Specific File
```bash
python3 sync_orchestrator.py . --command file --file path/to/file.py
```

#### Sync File Types
```bash
python3 sync_orchestrator.py . --types "py,ts,js"
```

### Status Commands

#### Check Sync Status
```bash
python3 sync_orchestrator.py . --command status
```

#### View Pending Changes
```bash
python3 change_detector.py . detect
```

## Integration with Claude

### Manual Commands
When using Claude Code, use these commands:

```bash
# In Claude session
/sync-memory                    # Sync all changes
/sync-memory /src              # Sync specific path
/sync-memory --status          # Check status
/sync-memory --force           # Force full sync
```

### Workflow Integration
The Memory Sync Agent integrates into the development workflow:

1. **During Development**: Optional incremental syncs
2. **After Testing**: Sync completed features
3. **In /done Workflow**: Automatic sync before completion
4. **Before Refactoring**: Capture current state

## Configuration

### File: `.mcp-data/memory_sync_state.json`

```json
{
  "config": {
    "tracked_extensions": [".py", ".ts", ".js", ".jsx", ".tsx", ".md", ".go"],
    "max_file_size_mb": 10,
    "exclude_dirs": ["node_modules", ".git", "__pycache__", "dist", "build"]
  }
}
```

### Customizing Tracked Files

Edit the config section to:
- Add/remove file extensions
- Adjust file size limits
- Modify excluded directories

## Understanding Output

### Entity Types

| Type | Description | Example |
|------|-------------|---------|
| PythonClass | Python class definition | `class UserService` |
| PythonFunction | Python function | `def calculate_total()` |
| PythonModule | Python file/module | `utils.py` |
| TypeScriptClass | TypeScript/JS class | `class Component` |
| ReactComponent | React component | `const Button = () => {}` |
| TypeScriptInterface | TS interface | `interface User` |
| Documentation | Markdown file | `README.md` |

### Relationship Types

| Type | Description | Example |
|------|-------------|---------|
| imports | Module import | `UserService imports datetime` |
| extends | Inheritance | `AdminUser extends User` |
| implements | Interface implementation | `Service implements Cache` |
| references | Documentation link | `README references API` |
| calls | Function invocation | `main calls processData` |

### Granularity Levels

The agent automatically determines granularity:

- **Simple Files** (≤100 lines, few components): Single module entity
- **Complex Files** (>100 lines, many components): Individual entities per class/function
- **Documentation**: Always single entity per file

## Best Practices

### 1. Regular Sync Schedule

**Active Development**
```bash
# Morning sync
python3 sync_orchestrator.py .

# After major changes
python3 sync_orchestrator.py /src/feature

# End of day
python3 sync_orchestrator.py .
```

**Maintenance Mode**
```bash
# Weekly sync
python3 sync_orchestrator.py . --force
```

### 2. Performance Optimization

**Large Codebases**
```bash
# Sync in batches
python3 sync_orchestrator.py /src/components
python3 sync_orchestrator.py /src/services
python3 sync_orchestrator.py /tests
```

**Specific Changes**
```bash
# Only Python files
python3 sync_orchestrator.py . --types "py"

# Only documentation
python3 sync_orchestrator.py /docs
```

### 3. Troubleshooting

**Issue: Sync Failing**
```bash
# Check for syntax errors
python3 code_parser.py problem_file.py

# Try dry run
python3 sync_orchestrator.py . --dry-run --verbose

# Check state file
cat .mcp-data/memory_sync_state.json
```

**Issue: Missing Entities**
```bash
# Force resync
python3 sync_orchestrator.py . --force

# Check ignore patterns
grep "tracked_extensions" .mcp-data/memory_sync_state.json
```

**Issue: Too Many Entities**
- Review file complexity thresholds
- Check for over-granular parsing
- Consider coarse-grained mode for simple files

## Advanced Usage

### Custom Parsers

Add support for new languages by:
1. Creating a parser following the Entity/Relation pattern
2. Integrating into `code_parser.py`
3. Adding to tracked extensions

### Automation

**Git Hook Integration**
```bash
# .git/hooks/post-commit
#!/bin/bash
cd $(git rev-parse --show-toplevel)
python3 utils/memory_sync/sync_orchestrator.py .
```

**CI/CD Integration**
```yaml
# GitHub Actions
- name: Sync to Memory
  run: |
    python3 utils/memory_sync/sync_orchestrator.py . --dry-run
    python3 utils/memory_sync/sync_orchestrator.py .
```

**Scheduled Sync**
```bash
# Crontab entry
0 */4 * * * cd /project && python3 utils/memory_sync/sync_orchestrator.py .
```

## Metrics and Monitoring

### Success Indicators
- **Sync Speed**: <5 seconds for 10 files
- **Entity Density**: 5-15 entities per file
- **Relationship Density**: 3-10 relations per entity
- **Error Rate**: <1% parsing failures

### Performance Metrics
```bash
# Check sync history
python3 -c "import json; print(json.load(open('.mcp-data/memory_sync_state.json'))['sync_history'][-1])"
```

## FAQ

**Q: Can I sync while Claude is running?**
A: Yes, the sync is independent and can run anytime.

**Q: Does sync affect existing knowledge?**
A: No, it only adds/updates. Existing observations are preserved.

**Q: How often should I sync?**
A: Daily for active development, weekly for maintenance.

**Q: Can I exclude specific files?**
A: Yes, add patterns to `.gitignore` or config exclude_dirs.

**Q: What happens to deleted files?**
A: Entities are marked as archived, not deleted.

## Support

For issues or questions:
1. Check this guide
2. Review error messages with `--verbose`
3. Test with `--dry-run`
4. Check the recipe at `/recipes/memory_sync_recipe.md`

---

*Memory Sync Agent v1.0 - Part of Dev-Agency System*