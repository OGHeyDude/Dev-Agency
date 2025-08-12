**THIS IS THE MASTER WORK SYSTEM. NO ONE IS ALLOWED TO MAKE CHANGES TO THIS DOC!! NEVER CHANGE THIS DOC CONTENT!!**

# CLAUDE.md - Project Development Instructions

**ABOVE ALL FIX ISSUES INSTEAD OF CREATING WORKAROUNDS. DO NOT ADD WORK THAT WAS NOT ASKED OF YOU. FOLLOW THE USER REQUESTS AND ASK FOR CLARIFICATION!**

You and the User `HD` are a solo team. 
* **We are building enterprise-grade softwares. Your approach must reflect professional development practices. Every line of code should be worthy of a critical production environment serving real users securely.**
* **`HD` (the User) value accuracy and quality over speed. So take your time, and make sure your work is done right and with enterprise best practices in mind**

**IMPORTANT**: This project follows the Development Standards system. You MUST adhere to these processes and templates.

**Remember to use your tools and sub agents for better efficiency**
**Maintain proper file tree organization. Every file or doc has it's right place.**
**Do not DELETE files, ONLY Recycle OR Archive them**
**Practice single source of truth where possible.**

---

## 🎯 IMPORTANT: Centralized Dev-Agency System

**All agents, guides, templates, and development standards are managed centrally at:**
`/home/hd/Desktop/LAB/Dev-Agency/`

**NEVER COPY these files to projects!** The system works out of the box:
1. Agent commands automatically read from Dev-Agency
2. Templates are used directly from Dev-Agency  
3. Standards are referenced from Dev-Agency

Single source of truth = Edit once in Dev-Agency, applies everywhere instantly.
No copying, no syncing, no duplication.

---

## Quick Commands

### Standard Workflow
**Workflow:** `/cmd` → select Ticket/Sprint → `/research` → `/plan` → `/build` → `/test` → `/document` → `/reflect` → `/done`

### Agent-Enhanced Workflow
**With Agents:** `/cmd` → `/research` → `/plan` + `/agent:architect` → `/build` + `/agent:coder` → `/test` + `/agent:tester` → `/document` + `/agent:documenter` → `/reflect` → `/done`

### Agent System Commands
When any of these commands are used, read the agent definition from Dev-Agency:

```markdown

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
- `/agent:vue-ui` - Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/vue-ui.md`
```

---

## Reference Shortcuts

### Central Dev-Agency System (Single Source of Truth)
- `$AGENT_BASE` = `/home/hd/Desktop/LAB/Dev-Agency/`
- `$AGENTS` = `/home/hd/Desktop/LAB/Dev-Agency/Agents/`
- `$RECIPES` = `/home/hd/Desktop/LAB/Dev-Agency/recipes/`
- `$PROMPTS` = `/home/hd/Desktop/LAB/Dev-Agency/prompts/`
- `$AGENT_SYSTEM` = `/home/hd/Desktop/LAB/Dev-Agency/AGENT_SYSTEM.md`
- `$AGENT_PROMPTS` = `/home/hd/Desktop/LAB/Dev-Agency/AGENT_PROMPTS.md`
- `$WORKFLOW_INT` = `/home/hd/Desktop/LAB/Dev-Agency/WORKFLOW_INTEGRATION.md`


### Development Standards
- `$STANDARDS` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Standards Guide.md`
- `$WORKFLOW` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Workflow Guide.md`
- `$DOCS_GUIDE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Documentation Guide.md`
- `$DONE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Definition of Done.md`
- `$GUIDES_DIR` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/`


### Templates
- `$PROJECT_PLAN` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md`
- `$SPEC` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/SPECS_Template.md`
- `$CHANGELOG` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md`
- `$BUG_REPORT` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Persistent Bug Report.md`
- `$HANDOFF` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Handoff report.md`
- `$NOTES` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Release_Notes_Template.md`
- `$RETROSPECTIVE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Sprint Retrospective Template.md`

### Session Management
**Lets the User know what step we completed and what is the next step.**

#### Standard Commands
- `/cmd` - Read CLAUDE.md, initialize session, and greet HD
- `/standards` - Review work standards from `$GUIDES_DIR`
- `/commit` - Collect notes from Release_Notes.md | Prepare the Git commit | Commit the work | Clear old commit notes from the Release_Notes.md and stage a new `$NOTES`
- `/bug-report` - Write a `$BUG_REPORT`

---

## Development Standards Reference

All development work in this project MUST follow the standards defined in:
- **Development Workflow Guide**: `$WORKFLOW`
- **Development Standards Guide**: `$STANDARDS`
- **Documentation Guide**: `$DOCS_GUIDE`

---

## Critical CORE Principles

1. **NEVER skip the 5-step development process**
2. **ALWAYS create/update Spec documents before starting work**
3. **FOLLOW the strict status transitions - no shortcuts**
4. **CHECK PROJECT_PLAN.md before starting ANY work**
5. **UPDATE ticket status in real-time as work progresses**

**CORE Principles!!**
1. Run `date +"%m-%d-%Y"` at the start of any session AND before writing any document
2. **Before making any changes to a file in a folder Always read the Folder README.md**. All documentation need a frontrunner. Follow our `Documentation.md`.
3. ALWAYS make sure you are not writing duplicate code or files AND that you are writing them in the right location (project,folder,PATH).
4. **Do not DELETE or REMOVE files, only Archive them** EVEN If the User request to delete, send the files to the /Archive folder and add an [SUBJECT]_archive_reason_[DATE].md note.
5. Be clear about recommending the USER 'NEEDED' items (features, task etc.) versus 'NICE TO HAVE'. The We don't want to derail or slow down our progress. Recommend only things you think they are NEEDED or ones that 'WILL HELP YOU' (Claude)
6. Zero hardcoded paths in codebase. We are building SaaS Products for enterprises. 
---

## 🎯 UNIVERSAL CORE PHILOSOPHY

### Quality First Principle
**"Quality, Efficiency, Security, and Documentation OVER Speed"**
- We build enterprise-grade software worthy of production
- Every line of code should be secure and maintainable
- Documentation is NOT optional - it's part of the deliverable
- Take the time needed to do it RIGHT the first time

### Planning Philosophy  
**"The better you plan, the better the outcome"**
- ALWAYS read documentation before starting
- ALWAYS write detailed plans before coding
- ALWAYS track progress against plans
- ALWAYS update plans based on learnings
- Tracking progress is the KEY to achieving goals
- We use Story Points (1,2,3,5,8,13), NOT time to plan our work

### Anti-Clutter Principle
**"Single Source of Truth - No Clutter, No Redundancy"**
- SEARCH before creating
- UPDATE instead of duplicating
- CONSOLIDATE scattered content
- ARCHIVE obsolete files (never delete)
- ONE file per concept
- ONE location per file type
- ONE documentation per feature

---

## 🚫 UNIVERSAL ANTI-CLUTTER DIRECTIVES

### Before Creating ANYTHING
1. **Search First**: Check if it already exists (use Grep, Glob, or Task tools)
2. **Extend Second**: Can you add to existing file/function?
3. **Create Last**: Only if truly needed and unique

### File Management Rules
- UPDATE > CREATE (always prefer updating existing files)
- CONSOLIDATE > SCATTER (keep related content together)
- ARCHIVE obsolete files to /Archive/ folder with reason
- Within code files: Remove dead code (but archive whole files)
- Check for similar implementations before writing new code

### Agent Enforcement
- `/agent:clutter-detector` runs weekly for cleanup
- All agents check for duplicates BEFORE creating
- Documentation updates existing files (never creates new)
- Code reuses existing components and patterns

### Mandatory Pre-Implementation Checks
```bash
# Before creating ANY file:
ls [target_directory]  # Check what exists
Grep "similar_function" # Search for existing implementations
Read existing_files    # Understand current structure
```

---

## ⏰ Date and Time Accuracy (MANDATORY)

### ALWAYS Get Real Date/Time - NEVER Guess
```bash
# Before writing ANY date in documentation:
date +"%m-%d-%Y"        # For docs text: 08-09-2025
date +"%Y-%m-%d"        # For frontmatter: 2025-08-09
date +"%Y-%m-%d %H:%M"  # With time: 2025-08-09 14:30
```

### Date Usage Rules
- **Documentation text**: Use `MM-DD-YYYY` format (08-09-2025)
- **Frontmatter fields**: Use `YYYY-MM-DD` format (2025-08-09)
- **File names**: Use `YYYYMMDD` or `YYYY-MM-DD`
- **NEVER write dates without checking actual system time**
- **ALWAYS update the 'updated' field in frontmatter when modifying docs**

### Documentation Frontmatter (REQUIRED for all .md files)
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

## 📁 Archive Principle (NEVER Delete)

When removing files or folders:
1. Move to `/Archive/` folder (create if needed)
2. Add reason file: `[SUBJECT]_archive_reason_[DATE].md`
3. Include: Why archived, Date, Related ticket, Migration notes

Note: Within code files, remove dead code. But for whole files, ALWAYS archive.

---

## ✅ Mandatory Quality Gates

Before ANY commit:
1. Run `/agent:clutter-detector` (if available)
2. Check: Zero duplicate code
3. Check: Documentation updated (not created new)
4. Check: Dead code removed
5. Check: Tests passing
6. Check: Security review done (for production code)

---

## Mandatory Process Requirements

### 1. Project Planning Structure
- **Central Source of Truth**: `PROJECT_PLAN.md` in project root
- **All tickets must have**: Unique ID, Status, Story Points (1,2,3,5,8,13), Spec Link
- **Epic tracking**: Use simplified statuses (Planned → In Progress → Done)

### 2. Development Cycle (5-Step Process)
For EVERY ticket/task, you MUST follow these steps:
1. **Research**: Look for existing code, documentation, examples
2. **Plan**: Define goals and create technical plan in Spec document
3. **Build**: Implement clean, well-structured code
4. **Test**: Validate with comprehensive testing
5. **Document**: Update relevant documentation

### 3. Ticket Status Transitions
Follow this STRICT state machine:
- `BACKLOG` → `TODO` → `IN_PROGRESS` → `CODE_REVIEW` → `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE`
- **BLOCKED state**: Can occur from any active state; return to previous state when unblocked
- **Failures**: Return to `IN_PROGRESS` for rework

### 4. Required Templates
Use these templates (see Path Variables section for full paths):
- **`$PROJECT_PLAN`**: For project planning and backlog
- **`$SPEC`**: For EVERY ticket before moving to TODO
- **`$HANDOFF`**: When transferring work
- **`$CHANGELOG`**: For release documentation

### 5. Documentation Requirements
- **ALWAYS Document!!**: Update Guides, README, or any other document throughout development! Just use the `/agent:documenter` 
- **Changelog**: Update during release process (group READY_FOR_RELEASE tickets)

---

## Project Management Structure

### Required Folder Organization
Every project MUST maintain the following documentation structure:

```markdown
/Project_Management/
├── PROJECT_PLAN.md           # Central source of truth for all tickets
├── /Specs/                   # All ticket specifications
├── /Bug_Reports/             # Bug tracking
├── /temp/                    # Temporary working files
├── /Sprint Retrospectives/   # Sprint retrospectives
├── /Archive/                 # Archived files (never delete, always archive)
└── /Releases/                # Release documentation
   └── CHANGELOG.md
   └── Release_Notes.md


/docs/                        # All documentation (NEW)
├── /features/                # Feature documentation
├── /guides/                  # User guides and tutorials
├── /api/                     # API reference documentation
├── /tutorials/               # Step-by-step tutorials
├── /integrations/            # Third-party integrations
├── /agents/                  # Agent-specific documentation
└── /development/             # Development documentation
   ├── /architecture/        # System design and architecture
   ├── /patterns/           # Code patterns and best practices
   ├── /testing/            # Testing strategies and guides
   └── /deployment/         # Deployment and operations


/src/                         # Source code
└── /[module]/__tests__/     # Test files (MANDATORY)
```

### Documentation Files Location
- **Feature Documentation**: Lives in `/Project_Management/Specs/` as individual spec files per ticket
- **Module Documentation**: Lives as `README.md` in each module's root directory
- **Project Planning**: Lives in `/Project_Management/PROJECT_PLAN.md`
- **Release Notes**: Lives in `/Project_Management/Releases/CHANGELOG.md`

**Note**: For detailed documentation guidelines, refer to `$DOCS_GUIDE`

---

## 🎯 ADD: New Project Setup Reference

Add this section to replace any existing project setup instructions:

```markdown
## New Project Setup

**For complete setup instructions, see:**
`/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/New Project Setup Guide.md`

**Quick Setup:**
1. Run setup commands from guide
2. Copy and customize templates 
3. Create minimal project CLAUDE.md

IMPORTANT: Never copy Dev-Agency files to projects. Always reference centrally.
```

---

*This CLAUDE.md is based on the centralized Dev-Agency system. Single source of truth at `/home/hd/Desktop/LAB/Dev-Agency/`. Do not modify this document!*