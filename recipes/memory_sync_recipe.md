---
title: Memory Sync Recipe
description: Pattern for syncing code changes to the MCP memory knowledge graph
type: recipe
category: integration
tags: [memory, sync, knowledge-graph, mcp, automation]
created: 2025-08-09
updated: 2025-08-09
---

# Memory Sync Recipe

## Purpose
Automatically maintain an up-to-date knowledge graph of your codebase in the MCP memory tool, enabling better context awareness and code understanding.

## When to Use
- After significant code changes
- After sprint completion (integrated into `/sprint-approved`)
- Before major refactoring (to capture current state)
- When onboarding new team members (knowledge transfer)
- Regular scheduled syncs (weekly/daily)

## Recipe Pattern

### 1. Initial Full Sync (First Time)
```bash
# Check current status
/sync-memory --status

# Perform initial full sync
/sync-memory --force

# Verify sync completed
/sync-memory --status
```

### 2. Incremental Sync (Regular Updates)
```bash
# Check pending changes
/sync-memory --pending

# Sync only changed files
/sync-memory

# Review results in memory graph
/agent:memory-sync
```

### 3. Targeted Sync (Specific Areas)
```bash
# Sync specific directory
/sync-memory /Agents

# Sync specific file types
/sync-memory --types "py,ts"

# Sync after major feature
/sync-memory /src/features/new-feature
```

## Integration Patterns

### Pattern A: STAD Workflow Integration
```
/sprint-plan → /execute → /validate → /sprint-approved (includes /sync-memory)
```

### Pattern B: Automated in Sprint Approved
```
/sprint-approved
  ├── Generate retrospective
  ├── Verify tickets status
  ├── /sync-memory (automatic)
  └── Commit everything
```

### Pattern C: Pre-Refactoring Snapshot
```
# Capture current state before changes
/sync-memory --force

# Perform refactoring
# (Use appropriate recipe for refactoring)

# Sync new structure
/sync-memory

# Compare knowledge graph changes
```

## Agent Combinations

### Memory Sync + Architect
```
# Sync current state
/sync-memory

# Use architect with full context
/agent:architect
"Design new feature with awareness of existing codebase structure"
```

### Memory Sync + Documenter
```
# Ensure knowledge graph is current
/sync-memory

# Generate documentation with full context
/agent:documenter
"Create comprehensive API documentation based on current codebase"
```

### Memory Sync + Clutter Detector
```
# Sync to identify all entities
/sync-memory

# Run clutter detection
/agent:clutter-detector
"Find duplicate code patterns and redundant implementations"
```

## Best Practices

### 1. Regular Sync Schedule
- **Daily**: For active development
- **Weekly**: For maintenance mode
- **Per-Sprint**: For team projects

### 2. Granularity Control
- Let the agent determine optimal chunking
- Don't force fine-grained for simple files
- Don't force coarse-grained for complex files

### 3. Sync Hygiene
```bash
# Before major work
/sync-memory --status

# After completing feature
/sync-memory /path/to/feature

# End of day
/sync-memory
```

### 4. Performance Optimization
- Sync incrementally, not force unless needed
- Batch related changes together
- Use type filters for large codebases

## Common Scenarios

### Scenario 1: New Feature Development
```bash
# Start of feature
/sync-memory --status

# During development (optional)
/sync-memory /src/new-feature

# After completion
/sync-memory
/agent:documenter  # Now has full context
```

### Scenario 2: Bug Investigation
```bash
# Sync current state
/sync-memory

# Use knowledge for debugging
"What entities interact with UserService?"
"Show relationships for AuthModule"
```

### Scenario 3: Code Review Preparation
```bash
# Sync branch changes
/sync-memory

# Generate review summary
/agent:architect
"Analyze the architectural impact of recent changes"
```

## Troubleshooting

### Issue: Sync Taking Too Long
```bash
# Sync in smaller batches
/sync-memory /src/components
/sync-memory /src/services
/sync-memory /src/utils
```

### Issue: Too Many Entities Created
```bash
# Check current entity count
/sync-memory --status

# Review agent chunking strategy
/agent:memory-sync
"Optimize chunking for large files"
```

### Issue: Missing Relationships
```bash
# Force resync for relationship detection
/sync-memory --force /path/to/module
```

## Success Metrics

### Good Sync Indicators
- 5-15 entities per file average
- 3-10 relationships per entity
- <5 seconds for 10 files
- Zero parsing errors

### Warning Signs
- >30 entities per file (too granular)
- <2 entities per file (too coarse)
- Many parsing errors
- Sync taking >1 minute for small changes

## Advanced Patterns

### Pattern: CI/CD Integration
```yaml
# In CI pipeline
steps:
  - name: Sync to Memory
    run: |
      python /utils/memory_sync/sync_orchestrator.py --dry-run
      python /utils/memory_sync/sync_orchestrator.py
```

### Pattern: Git Hook Integration
```bash
# .git/hooks/post-commit
#!/bin/bash
echo "Syncing changes to memory..."
/sync-memory
```

### Pattern: Scheduled Sync
```bash
# Cron job for daily sync
0 2 * * * cd /project && /sync-memory
```

## Related Recipes
- `/recipes/api_feature_recipe.md` - API development with memory context
- `/recipes/bug_fix_recipe.md` - Debugging with knowledge graph
- `/recipes/clean_code_enforcement.md` - Using memory for code quality

## Notes
- Memory persists across sessions
- Sync is incremental by default
- Force sync only when necessary
- Agent learns from sync patterns over time

---

*Recipe tested with: Python 3.9+, TypeScript 5.0+, Node.js 16+*