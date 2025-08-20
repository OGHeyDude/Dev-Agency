---
title: Project CLAUDE.md Template
description: Minimal template for project-specific CLAUDE.md that references the central Dev-Agency system
type: template
category: development
tags: [template, project-setup, claude-md, centralized-system]
created: 2025-08-09
updated: 2025-08-20
version: 1.0
status: stable
---

# Project: [PROJECT_NAME]

**Type**: [Web App | CLI Tool | Library | Service | Other]  
**Primary Language**: [TypeScript | Python | Go | Other]  
**Status**: [Planning | Active Development | Maintenance]

---

## 📂 Project Context

### This Project (from CLAUDE.env)
- **Project Root:** `$PWD`
- **Project Name:** `$PROJECT_NAME`
- **Type:** `$PROJECT_TYPE`
- **Language:** `$PRIMARY_LANGUAGE`
- **Git Repository:** `$GIT_REPO_URL`
- **GitHub Board:** `$GITHUB_PROJECT_BOARD`
- **Active Sprint:** `$ACTIVE_SPRINT`

### Configuration
This project uses `CLAUDE.env` for configuration:
- **Setup:** Run `/home/hd/Desktop/LAB/Dev-Agency/scripts/setup-claude-env.sh`
- **Update:** Edit `CLAUDE.env` directly (keep in .gitignore)
- **Sprint Progress:** Update `ACTIVE_SPRINT` variable as you advance

### Project Structure
```
[PROJECT_ROOT]/
├── CLAUDE.env              # Project configuration (in .gitignore)
├── CLAUDE.md               # This file - project context
├── /Project_Management/    # This project's management files
├── /docs/                  # This project's documentation
├── /src/                   # This project's source code
├── /tests/                 # This project's tests
└── /Archive/               # This project's archived files
```

### Central Dev-Agency Reference
- **Agents & Standards:** `/home/hd/Desktop/LAB/Dev-Agency/`
- **Never copy Dev-Agency files to this project**

---

## 🎯 Central Agent System

**All agents, guides, templates, and development standards are centrally managed at:**
`/home/hd/Desktop/LAB/Dev-Agency/`

**DO NOT COPY these files here.** Claude will automatically read from Dev-Agency when needed.

### Available Commands (8 Commands Only)

#### STAD Sprint Commands
```bash
/sprint-plan <additional instructions>  # Stage 1: Sprint Planning
/execute                                # Stage 2: Sprint Execution  
/validate                               # Stage 3: Sprint Validation
/sprint-approved                        # Stage 4: Release & Retrospective
```

#### Utility Commands
```bash
/cmd                                    # Initialize Session
/standards <Subject>                    # Read Standards
/sync-memory                            # Knowledge Graph Sync
/sprint-status                          # Progress Report
```

**Note**: Agents work internally through the system. You don't need to invoke them directly.

---

## 📁 Project Setup

**For complete project setup instructions, see:**
`/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/New Project Setup Guide.md`

Quick setup reference:
```bash
# 1. Create structure
mkdir -p Project_Management/{Specs,Bug_Reports,temp,"Sprint Retrospectives",Archive,Releases}
mkdir -p docs/{features,guides,api,tutorials,integrations,agents,development/{architecture,patterns,testing,deployment}}
mkdir -p src

# 2. Copy templates (see setup guide for details)
# 3. Customize this CLAUDE.md file
```

---

## 🔧 Project-Specific Configuration

### Environment Setup
[Project-specific environment requirements]

### Key Dependencies
[List main frameworks/libraries used in THIS project]

### Development Guidelines
[Any project-specific rules that override or extend Dev-Agency standards]

### API/Service Endpoints
[If applicable, list key endpoints or services]

---

## 📋 Project Context

### Business Requirements
[Brief description of what this project does and why]

### Technical Constraints
[Any specific technical limitations or requirements]

### Integration Points
[External systems, APIs, or services this project connects to]

---

## 🧪 Development Approach

### Test-First Development (MANDATORY)
This project follows Test-Driven Development:

1. **Write tests FIRST** in `/src/[module]/__tests__/`
2. **Run tests to see them FAIL** (Red)
3. **Implement minimum code** to pass tests (Green)
4. **Refactor** while keeping tests passing
5. **Cannot mark tickets DONE** without passing tests

### Quality Requirements
- Test coverage >80%
- All tests must pass
- Lint and typecheck must pass
- Documentation must be updated

---

## 📄 File Organization

### Where Files Go
- **Temporary files** → `/Project_Management/temp/`
- **Feature docs** → `/docs/features/[feature-name].md`
- **API docs** → `/docs/api/[module]-api.md`
- **Development docs** → `/docs/development/[category]/`
- **Test files** → `/src/[module]/__tests__/`

### Documentation Rules
- ALWAYS use appropriate category folder
- ALWAYS create inter-links to related docs
- NEVER create docs in random locations
- Use temp folder for drafts

---

## 🚀 Development Commands

```bash
# Project-specific development commands
[npm install | pip install -r requirements.txt | go mod download]
[npm run dev | python main.py | go run .]
[npm test | pytest | go test]
```

---

## 📊 Project Metrics (Optional)

If tracking project-specific metrics:
```bash
mkdir -p ./metrics ./feedback
```

Then track agent performance locally while using central definitions.

---

## Notes

- All development standards from Dev-Agency apply unless explicitly overridden above
- All templates are read from Dev-Agency - do not duplicate here
- All agents are defined in Dev-Agency - do not copy here
- This file should remain minimal and project-specific

---

*This project uses the centralized Dev-Agency system at `/home/hd/Desktop/LAB/Dev-Agency/`*