---
title: Project CLAUDE.md Template
description: Minimal template for project-specific CLAUDE.md that references the central Dev-Agency system
type: template
category: development
tags: [template, project-setup, claude-md, centralized-system]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Project: [PROJECT_NAME]

**Type**: [Web App | CLI Tool | Library | Service | Other]  
**Primary Language**: [TypeScript | Python | Go | Other]  
**Status**: [Planning | Active Development | Maintenance]

---

## 🎯 Central Agent System

**All agents, guides, templates, and development standards are centrally managed at:**
`/home/hd/Desktop/LAB/Dev-Agency/`

**DO NOT COPY these files here.** Claude will automatically read from Dev-Agency when needed.

### Available Commands
All agent commands work in this project by reading from Dev-Agency:
- `/agent:architect` - System design and architecture
- `/agent:coder` - Implementation 
- `/agent:tester` - Testing and QA
- `/agent:security` - Security review
- `/agent:documenter` - Documentation
- `/agent:performance` - Performance optimization
- `/agent:mcp-dev` - MCP protocol specialist
- `/agent:integration` - System integration
- `/agent:hooks` - Hooks and middleware
- `/agent:clutter-detector` - Find redundancy

### Workflow Commands
Enhanced workflow process with test-first development:
1. `/research` - Explore codebase and check for existing solutions
2. `/plan` - Technical planning (use `/agent:architect` for complex designs)
3. `/build` - **TEST-FIRST Implementation** (write tests before code)
4. `/test` - Validation (use `/agent:tester` and `/agent:security`)
5. `/document` - Documentation (use `/agent:documenter` for user docs)
6. `/reflect` - Review implementation accuracy and validate completion
7. `/done` - Complete Definition of Done checklist and mark ticket complete

### Sprint Management (NEW)
```bash
# For sprint-based development
/sprint-themed           # Start themed sprint planning and execution
/sprint-execute [TICKET] # Handle individual tickets outside sprint
/sprint-status          # Check current sprint progress
```

---

## 📁 Project Setup

**For complete project setup instructions, see:**
`/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/New Project Setup Guide.md`

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