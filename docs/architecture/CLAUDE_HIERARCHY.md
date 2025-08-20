---
title: CLAUDE.md File Hierarchy and Relationships
description: Documentation of CLAUDE.md file structure and inheritance
type: architecture
category: documentation
tags: [claude, hierarchy, configuration, architecture]
created: 2025-08-17
updated: 2025-08-17
version: 1.0
---

# CLAUDE.md File Hierarchy and Relationships

## Overview

This document clarifies the relationship between various CLAUDE.md files in the Dev-Agency ecosystem and establishes the authoritative hierarchy.

---

## File Hierarchy

```
Level 0: Global Master (User's System)
└── ~/.claude/CLAUDE.md
    └── Master instructions for ALL projects
    └── NEVER modified by projects
    └── Contains user preferences and standards

Level 1: Dev-Agency Central System (Single Source of Truth)
└── /home/hd/Desktop/LAB/Dev-Agency/CLAUDE.md
    └── Central configuration for Dev-Agency
    └── Defines agents, workflows, and STAD Protocol
    └── Referenced by all projects (not copied)

Level 2: Project Templates (Reference Dev-Agency)
├── PROJECT_CLAUDE_TEMPLATE.md
│   └── Minimal template for new projects
│   └── References Dev-Agency location
│   └── Does NOT duplicate Dev-Agency content
└── Observability_PROJECT_CLAUDE_TEMPLATE.md
    └── Specialized for monitoring projects
    └── Extends base template

Level 3: Project Instances (Created from templates)
└── [Project]/CLAUDE.md
    └── Created from template
    └── References Dev-Agency
    └── Contains project-specific additions only
```

---

## Key Principles

### 1. Single Source of Truth
- **Dev-Agency System**: `/home/hd/Desktop/LAB/Dev-Agency/CLAUDE.md`
- All agents, recipes, and standards live HERE
- Projects reference this location, never copy

### 2. No Duplication
- Templates are minimal pointers
- Projects inherit from Dev-Agency
- Updates in Dev-Agency apply everywhere instantly

### 3. Clear Inheritance
```
Global CLAUDE.md (user preferences)
    ↓
Dev-Agency CLAUDE.md (system configuration)
    ↓
Project CLAUDE.md (project specifics only)
```

---

## File Purposes

### `/home/hd/Desktop/LAB/Dev-Agency/CLAUDE.md`
**Purpose**: Central system configuration
- Agent definitions and commands
- STAD Protocol implementation
- Development workflows
- Quality standards
- **Status**: AUTHORITATIVE SOURCE

### `PROJECT_CLAUDE_TEMPLATE.md`
**Purpose**: Template for new projects
- Minimal configuration
- References Dev-Agency location
- Project-specific sections
- **Status**: TEMPLATE

### `Observability_PROJECT_CLAUDE_TEMPLATE.md`
**Purpose**: Specialized template
- Extends base template
- Monitoring-specific configurations
- Observability standards
- **Status**: SPECIALIZED TEMPLATE

---

## Usage Guidelines

### For New Projects
1. Copy `PROJECT_CLAUDE_TEMPLATE.md` to project root
2. Rename to `CLAUDE.md`
3. Fill in project-specific sections
4. DO NOT copy Dev-Agency content

### For Updates
1. Update ONLY in Dev-Agency
2. Changes apply to all projects immediately
3. No synchronization needed

### For Specialized Projects
1. Use appropriate specialized template
2. Maintain reference to Dev-Agency
3. Add only domain-specific content

---

## Maintenance

### Version Control
- Dev-Agency CLAUDE.md tracks versions
- Templates reference Dev-Agency version
- Projects note which template version used

### Updates Flow
```
Dev-Agency (update here) → All Projects (automatic)
```

### Archive Policy
- Old versions archived with date
- Never delete, always archive
- Document reason for changes

---

## Common Mistakes to Avoid

1. ❌ **Copying Dev-Agency content to projects**
   - ✅ Reference Dev-Agency location instead

2. ❌ **Creating duplicate CLAUDE.md files**
   - ✅ Maintain single authoritative source

3. ❌ **Modifying templates directly**
   - ✅ Update Dev-Agency, templates inherit

4. ❌ **Forgetting to update version numbers**
   - ✅ Track versions for compatibility

---

## Validation

To verify correct setup:
```bash
# Check for single Dev-Agency CLAUDE.md
ls -la /home/hd/Desktop/LAB/Dev-Agency/CLAUDE.md

# Verify no duplicates in CORE
ls -la /home/hd/Desktop/LAB/Dev-Agency/CORE/

# Check templates reference Dev-Agency
grep "Dev-Agency" **/PROJECT_CLAUDE_TEMPLATE.md
```

---

*This hierarchy ensures clean, maintainable configuration management across all projects.*