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
Standard 5-step process with agents:
1. `/research` - Explore codebase and requirements
2. `/plan` - Technical planning (use `/agent:architect` for complex designs)
3. `/build` - Implementation (use appropriate agents)
4. `/test` - Validation (use `/agent:tester` and `/agent:security`)
5. `/document` - Documentation (use `/agent:documenter` for user docs)

---

## 📁 Project Structure

```
/[project-root]/
├── CLAUDE.md                 # This file (minimal, references Dev-Agency)
├── /Project_Management/       # Project-specific planning
│   ├── PROJECT_PLAN.md      # Project backlog and tickets
│   ├── /Specs/              # Ticket specifications
│   └── /Releases/           # Release documentation
├── /src/                     # [Adjust based on project]
├── /tests/                   # [Adjust based on project]
└── /docs/                    # [Adjust based on project]
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

## 🚀 Quick Start

```bash
# Project-specific setup commands
[npm install | pip install -r requirements.txt | go mod download]
[npm run dev | python main.py | go run .]
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