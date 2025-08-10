# FINAL DRAFT: Global CLAUDE.md Updates - Centralized Dev-Agency System

**NOTE: This is a DRAFT for review. When ready, add these sections to your global ~/.claude/CLAUDE.md**

---

## 🎯 CENTRAL AGENT SYSTEM (ADD AT TOP OF GLOBAL CLAUDE.md)

```markdown
## IMPORTANT: Centralized Dev-Agency System

**All agents, guides, templates, and development standards are managed centrally at:**
`/home/hd/Desktop/LAB/Dev-Agency/`

**NEVER COPY these files to projects!** The global CLAUDE.md works out of the box:
1. Agent commands automatically read from Dev-Agency
2. Templates are used directly from Dev-Agency  
3. Standards are referenced from Dev-Agency

Single source of truth = Edit once in Dev-Agency, applies everywhere instantly.
No copying, no syncing, no duplication.
```

---

## Additions for Global CLAUDE.md

### 1. Add to Quick Commands Section

```markdown
### Agent System Commands (Read from Dev-Agency)
When any of these commands are used, read the agent definition from Dev-Agency:
- `/agent:architect` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/architect.md`
- `/agent:coder` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/coder.md`
- `/agent:tester` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/tester.md`
- `/agent:security` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/security.md`
- `/agent:documenter` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/documenter.md`
- `/agent:clutter-detector` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/clutter-detector.md`
- `/agent:mcp-dev` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/mcp-dev.md`
- `/agent:performance` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/performance.md`
- `/agent:integration` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/integration.md`
- `/agent:hooks` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/hooks.md`
- `/agent-recipe [name]` - Read from `/home/hd/Desktop/LAB/Dev-Agency/recipes/[name].md`
```

### 2. Update Reference Shortcuts (REPLACE OLD REFERENCES)

```markdown
### Central Dev-Agency System (Single Source of Truth)
- `$AGENT_BASE` = `/home/hd/Desktop/LAB/Dev-Agency/`
- `$AGENTS` = `/home/hd/Desktop/LAB/Dev-Agency/Agents/`
- `$RECIPES` = `/home/hd/Desktop/LAB/Dev-Agency/recipes/`
- `$PROMPTS` = `/home/hd/Desktop/LAB/Dev-Agency/prompts/`
- `$AGENT_SYSTEM` = `/home/hd/Desktop/LAB/Dev-Agency/AGENT_SYSTEM.md`
- `$AGENT_PROMPTS` = `/home/hd/Desktop/LAB/Dev-Agency/AGENT_PROMPTS.md`
- `$WORKFLOW_INT` = `/home/hd/Desktop/LAB/Dev-Agency/WORKFLOW_INTEGRATION.md`

### Development Standards (Centralized in Dev-Agency)
- `$STANDARDS` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Standards Guide.md`
- `$WORKFLOW` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Workflow Guide.md`
- `$DOCS_GUIDE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Documentation Guide.md`
- `$DONE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Definition of Done.md`
- `$GUIDES_DIR` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/`

### Templates (Centralized in Dev-Agency)
- `$PROJECT_PLAN` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md`
- `$SPEC` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/SPECS_Template.md`
- `$CHANGELOG` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md`
- `$BUG_REPORT` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Persistent Bug Report.md`
- `$HANDOFF` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Handoff report.md`
- `$NOTES` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Release_Notes_Template.md`
```

### 3. Add Core Philosophy Section

```markdown
## 🎯 UNIVERSAL CORE PHILOSOPHY

### Quality First Principle
**"Quality, Efficiency, Security, and Documentation OVER Speed"**
- We build enterprise-grade software
- Take time to do it RIGHT the first time
- Documentation is part of the deliverable

### Planning Philosophy  
**"The better you plan, the better the outcome"**
- ALWAYS read documentation first
- ALWAYS write plans before coding
- ALWAYS track progress
- Tracking is KEY to achieving goals
- We use Story Points, NOT time to plan our work.

### Anti-Clutter Principle
**"Single Source of Truth - No Clutter, No Redundancy"**
- SEARCH before creating
- UPDATE instead of duplicating
- CONSOLIDATE scattered content
- ARCHIVE obsolete files (never delete)
```

### 4. Add Universal Anti-Clutter Directives

```markdown
## 🚫 UNIVERSAL ANTI-CLUTTER DIRECTIVES

### Before Creating ANYTHING
1. **Search First**: Check if it already exists
2. **Extend Second**: Can you add to existing?
3. **Create Last**: Only if truly needed

### File Management Rules
- ONE file per concept
- ONE location per file type
- ONE documentation per feature
- UPDATE > CREATE
- CONSOLIDATE > SCATTER
- ARCHIVE obsolete files to /Archive/ folder
- Within code files: Remove dead code (but archive whole files)

### Agent Enforcement
- `/agent:clutter-detector` runs weekly
- All agents check for duplicates BEFORE creating
- Documentation updates existing files
- Code reuses existing components
```

### 5. Add to 5-Step Process Enhancement

```markdown
### Enhanced 5-Step Process with Anti-Clutter

1. `/research` - INCLUDES: Check for existing solutions
2. `/plan` - INCLUDES: Identify reusable components  
3. `/build` - INCLUDES: Mandatory duplicate checks
4. `/test` - INCLUDES: Clean code validation
5. `/document` - INCLUDES: Update existing docs only
```

### 6. Update Project Integration Instructions (NO COPYING!)

```markdown
## Centralized Agent System Usage

For ANY new project:
1. Create minimal project CLAUDE.md with:
   ```markdown
   # Project: [PROJECT_NAME]
   
   ## Central Agent System
   All agents, guides, and templates are managed centrally at:
   `/home/hd/Desktop/LAB/Dev-Agency/`
   
   ## Project-Specific Configuration
   [Only project-specific overrides here]
   ```

2. When using agents in this project:
   - Claude will automatically read from Dev-Agency
   - No copying needed - direct reference
   - Updates in Dev-Agency apply immediately

3. For project-specific tracking (optional):
   ```bash
   mkdir -p ./{metrics,feedback}
   ```

IMPORTANT: Never copy Dev-Agency files to projects. Always reference centrally.
```

### 7. Add Quality Gates

```markdown
## Mandatory Quality Gates

Before ANY commit:
1. Run `/agent:clutter-detector`
2. Check: Zero duplicate code
3. Check: Documentation updated (not created)
4. Check: Dead code removed
5. Check: Tests passing
6. Check: Security review done
```

---

## 📁 Archive Principle (ADD TO GLOBAL)

### NEVER Delete Files - Always Archive
```markdown
When removing files or folders:
1. Move to `/Archive/` folder (create if needed)
2. Add reason file: `[SUBJECT]_archive_reason_[DATE].md`
3. Include: Why archived, Date, Related ticket, Migration notes

Note: Within code files, remove dead code. But for whole files, ALWAYS archive.
```

---

## ⏰ Date and Time Accuracy (ADD TO GLOBAL)

### MANDATORY: Always Get Real Date/Time
```bash
# Before writing ANY date in documentation:
date +"%m-%d-%Y"        # For docs text: 08-09-2025
date +"%Y-%m-%d"        # For frontmatter: 2025-08-09
date +"%Y-%m-%d %H:%M"  # With time: 2025-08-09 14:30
```

**NEVER write dates without checking actual system time!**

### Documentation Frontmatter (MANDATORY)
All .md files MUST include frontmatter:
```yaml
---
title: [Clear title]
description: [One-line purpose]
type: [guide|template|spec|recipe|agent]
category: [development|documentation|testing|architecture]
tags: [relevant, terms]
created: [YYYY-MM-DD from date command]
updated: [YYYY-MM-DD from date command]
---
```

---

## How to Apply These Updates

1. **Review this draft** carefully
2. **Open your global CLAUDE.md**: `~/.claude/CLAUDE.md`
3. **Add these sections** to establish centralized Dev-Agency system
4. **Remove old references** to Development_Standards in /LAB/
5. **Test** with a new project to verify central references work

## ⚠️ CRITICAL: Centralized System Benefits

### What Changes:
- **BEFORE**: Copy agent files to each project (duplication)
- **AFTER**: Reference agents directly from Dev-Agency (single source)

### How It Works:
1. You edit agents/guides/templates ONLY in Dev-Agency
2. Claude reads them from Dev-Agency for ALL projects
3. Changes apply immediately everywhere
4. No syncing, no copying, no version conflicts

### Example Usage:
```markdown
User: /agent:coder implement the API
Claude: [Reads /home/hd/Desktop/LAB/Dev-Agency/Agents/coder.md]
        [Uses agent with project context]
```

## Important Notes

- **Single Source of Truth**: Dev-Agency is THE central system
- **No Duplication**: Never copy Dev-Agency files to projects
- **Automatic Updates**: Edit once, applies everywhere
- **Project Independence**: Each project only needs minimal CLAUDE.md
- **Centralized Management**: All improvements happen in Dev-Agency

## Benefits of Centralized System

1. **Zero Duplication** - No agent files in individual projects
2. **Instant Updates** - Changes in Dev-Agency apply immediately
3. **Version Control** - One version, no conflicts
4. **Easier Maintenance** - Single location to manage
5. **Consistent Quality** - Same agents/standards everywhere
6. **Reduced Clutter** - Projects stay clean and focused

---

*Final Draft Created: 2025-08-09*
*Establishes Dev-Agency as the permanent central agent system*
*Review carefully before applying to global configuration*