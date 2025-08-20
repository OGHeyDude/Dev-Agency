---
title: Slash Commands
description: Essential commands for STAD Protocol development workflow
type: guide
category: commands
tags: [commands, stad, workflow, simple]
created: 2025-08-18
updated: 2025-08-19
---

# Slash Commands

**Dev-Agency provides 9 essential commands for streamlined development workflow.**

---

## STAD Sprint Commands (4 commands)

### 1. `/sprint-plan <additional instructions>`
**Stage 1: Sprint Planning**
- Confirm the previous sprint is complete and committed
- Execute recipe: `/home/hd/Desktop/LAB/Dev-Agency/recipes/sprint_preparation_recipe.md`
- Plan the sprint with any additional instructions provided

### 2. `/execute`
**Stage 2: Sprint Execution**
- Follow recipe: `/home/hd/Desktop/LAB/Dev-Agency/recipes/sprint_execution_recipe.md`
- Execute the planned sprint
- Complete autonomously until 100% of the tasks complete

### 3. `/validate`
**Stage 3: Sprint Validation**
- Check all sprint tickets against Definition of Done:
  `/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/Definition of Done.md`
- If any tickets are NOT done, COMPLETE them to meet the definition
- Don't just report - actually finish the work

### 4. `/sprint-approved`
**Stage 4: Release & Retrospective**
- After HD approves the sprint
- Generate retrospective using:
  `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/Sprint Retrospective Template.md`
- Verify tickets and sprint status are accurately tracked
- Commit everything to GitHub
- Sync-Memory with the memory-sync agent

---

## Utility Commands (5 commands)

### 5. `/cmd`
**Initialize Session**
- Read main CLAUDE.md (`/home/hd/.claude/CLAUDE.md`)
- Read project CLAUDE.md (if exists)
- Read North-Star.md & PROJECT_PLAN.md
- Read `/home/hd/Desktop/LAB/Dev-Agency/docs/architecture/STAD_CLAUDE.md`
- Greet HD

### 6. `/standards <Subject>`
**Read Standards**
- Find and read the relevant work standards guide
- Look in `$GUIDES_DIR` (`/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/`)

### 7. `/sync-memory`
**Knowledge Graph Sync**
- Execute with memory-sync agent
- Sync codebase to knowledge graph
- (Note: Still uses `/agent:memory-sync` internally)

### 8. `/sprint-status`
**Progress Report**
- Report active sprint progress
- Show ticket statuses and completion percentage

### 9. `/folder-cleanup [target_folder]`
**Systematic Folder Organization**
- Analyze any folder for cleanup opportunities
- Follow recipe: `/home/hd/Desktop/LAB/Dev-Agency/recipes/folder_cleanup_recipe.md`
- Use up to 4 parallel agents for analysis
- Generate detailed report with recommendations
- User review checkpoint before any changes


---

## Workflow Integration

The 9 commands support the complete STAD Protocol:

```bash
# Initialize session
/cmd

# Plan sprint (Stage 1)
/sprint-plan "Focus on security improvements"

# Execute sprint (Stage 2)
/execute

# Check progress
/sprint-status

# Validate completion (Stage 3)
/validate

# Release and retrospective (Stage 4)
/sprint-approved

# Utility commands as needed
/standards "Documentation"
/sync-memory
/folder-cleanup /Project_Management
```

---

## Behind the Scenes

While users see only 9 commands, the system internally uses:
- **Agents:** Architecture, coding, testing, security, documentation agents
- **Recipes:** Detailed implementation workflows for each command
- **Quality Gates:** Automated validation and testing
- **Memory Sync:** Knowledge graph updates
- **Parallel Processing:** Up to 4 agents working simultaneously

The simplified interface provides enterprise-grade functionality without complexity.

---

*Last Updated: 2025-08-19 - Added folder cleanup command for systematic organization*