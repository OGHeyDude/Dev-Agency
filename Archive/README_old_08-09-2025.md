# Dev-Agency: Agentic Development System

## Overview

Dev-Agency is an advanced agentic development system built on Claude Code's hub-and-spoke architecture. It leverages specialized AI agents as on-demand tools within a structured 5-step development workflow.

## 🎯 Core Philosophy

**"Quality, Efficiency, Security, and Documentation OVER Speed"**  
**"The better you plan, the better the outcome"**  
**"Single Source of Truth - No Clutter, No Redundancy"**

## Quick Start

### Agent Invocation Commands

```bash
# Core Development Agents
/agent:architect     # System design and architecture planning
/agent:coder        # General code implementation
/agent:tester       # QA testing and debugging
/agent:security     # Security review and vulnerability assessment
/agent:documenter   # API docs and user guides

# Specialist Agents
/agent:mcp-dev      # Model Context Protocol specialist
/agent:performance  # Performance optimization
/agent:integration  # System integration specialist
/agent:hooks        # Hooks and middleware expert
```

### Workflow Integration

Agents operate within the 5-step development process:

1. **Research** → Main Claude analyzes codebase
2. **Plan** → Main Claude + `/agent:architect` create technical specs
3. **Build** → `/agent:coder` or specialists implement
4. **Test** → `/agent:tester` validates + `/agent:security` reviews
5. **Document** → `/agent:documenter` creates user-facing docs

## Core Principles

### Hub-and-Spoke Architecture
- **Hub**: Main Claude (orchestrator)
- **Spokes**: Specialized agents (tools)
- **No agent-to-agent communication**: All coordination through main Claude
- **Stateless agents**: Each invocation is independent

### Key Features
- ✅ Parallel agent execution when beneficial
- ✅ Pre-processed context in agent prompts
- ✅ Specialist agents for complex domains
- ✅ Main Claude maintains memory between calls

## 📁 Complete Folder Structure (Clean & Organized)

```
/Dev-Agency/
├── 📚 Root Files (Minimal - Only 2!)
│   ├── README.md                    # This file - Main navigation
│   └── CLAUDE.md                    # Central system instructions
│
├── 📖 /docs/                        # All system documentation
│   ├── CENTRAL_SYSTEM.md           # Central architecture explanation
│   ├── AGENT_SYSTEM.md             # Agent system architecture
│   ├── AGENT_PROMPTS.md            # Prompt templates and patterns
│   ├── WORKFLOW_INTEGRATION.md     # 5-step process integration
│   ├── INTEGRATION_GUIDE.md        # How to use in projects
│   ├── SYSTEM_IMPROVEMENTS.md      # Enhancement tracking
│   └── SYSTEM_IMPROVEMENTS.md      # Enhancement tracking
│
├── 📋 /Development_Standards/        # Centralized standards and templates
│   ├── /Guides/                     # Methodology and process guides
│   │   ├── Development Standards Guide.md
│   │   ├── Development Workflow Guide.md
│   │   ├── Documentation Guide.md
│   │   └── Definition of Done.md
│   └── /Templates/                  # ALL templates (including CLAUDE templates)
│       ├── PROJECT_CLAUDE_TEMPLATE.md  # For new project setup
│       ├── DRAFT_GLOBAL_CLAUDE.md     # For global config updates
│       ├── PROJECT_PLAN_Template.md   # Project planning
│       ├── SPECS_Template.md          # Ticket specifications
│       ├── CHANGELOG_Template.md      # Release documentation
│       └── [Other templates...]
│
├── 🤖 /Agents/                      # Agent definitions (9 specialists)
│   ├── architect.md                 # System design specialist
│   ├── coder.md                     # Implementation specialist
│   ├── tester.md                    # QA and debugging specialist
│   ├── security.md                  # Security review specialist
│   ├── performance.md               # Optimization specialist
│   ├── documenter.md                # Documentation specialist
│   ├── mcp-dev.md                   # MCP protocol specialist
│   ├── integration.md               # System integration specialist
│   ├── hooks.md                     # Hooks/middleware specialist
│   └── clutter-detector.md          # Anti-redundancy specialist (NEW)
│
├── 📊 /Project_Management/          # Project tracking and planning
│   ├── PROJECT_PLAN.md              # Central planning document
│   ├── /Specs/                      # Ticket specifications
│   ├── /Bug_Reports/                # Issue tracking
│   ├── /Archive/                    # Archived files (never delete)
│   └── /Releases/                   # Release documentation
│
├── 📖 /recipes/                     # Proven workflow patterns
│   ├── api_feature_recipe.md        # REST API development
│   ├── bug_fix_recipe.md            # Debugging workflow
│   ├── mcp_server_recipe.md         # MCP implementation
│   ├── security_audit_recipe.md     # Security review process
│   ├── quality_first_recipe.md      # Quality-focused workflow
│   └── clean_code_enforcement.md    # Anti-clutter workflow (NEW)
│
├── 💬 /prompts/                     # Domain-specific prompt libraries
│   ├── /web-api/                    # REST API prompts
│   ├── /mcp/                        # MCP-specific prompts
│   ├── /frontend/                   # UI/Frontend prompts
│   └── /backend/                    # Server-side prompts
│
├── 🔄 /feedback/                    # Continuous improvement
│   ├── agent_feedback_form.md       # Session feedback template
│   ├── context_improvements.md      # Context optimization tracking
│   └── prompt_evolution.md          # Prompt version control
│
└── 🗄️ /Archive/                     # Archived files (never delete)
    ├── [Archived files and directories]
    └── *_archive_reason_*.md         # Archive documentation
```

## 📝 Content Organization Rules

### What Goes Where

| Content Type | Location | Naming Convention |
|-------------|----------|-------------------|
| Agent definitions | `/Agents/` | `[agent-name].md` (lowercase, hyphenated) |
| Workflow recipes | `/recipes/` | `[workflow]_recipe.md` |
| Project specs | `/Project_Management/Specs/` | `[TICKET-ID]_spec.md` |
| Bug reports | `/Project_Management/Bug_Reports/` | `[DATE]_[issue].md` |
| Prompt versions | `/prompts/[domain]/` | `[agent]_v[version].md` |
| Feedback forms | `/feedback/` | `[date]_[session].md` |

### Anti-Clutter Principles

#### ❌ DON'T
- Create duplicate documentation (search first!)
- Mix concerns (specs stay in `/Specs/`, not root)
- Create agent definitions outside `/Agents/`
- Put project-specific code here (this is infrastructure only)
- Create new files without checking for existing ones
- Split related content across multiple files
- Create unnecessary abstractions

#### ✅ DO
- Search for existing content before creating new
- Update existing documentation rather than create new
- Keep single source of truth for each concept
- Consolidate related content in one place
- Use clear, descriptive naming
- Follow the established directory structure
- Archive old files instead of deleting

### When to Create New Subdirectories

Only create new subdirectories when:
1. You have 5+ related files of the same type
2. The files form a logical grouping
3. The grouping will be reused across projects
4. It improves navigation and reduces clutter

## Documentation Structure

| Document | Purpose | Location |
|----------|---------|----------|
| [`CENTRAL_SYSTEM.md`](./docs/CENTRAL_SYSTEM.md) | How Dev-Agency serves as central hub | /docs/ |
| [`AGENT_SYSTEM.md`](./docs/AGENT_SYSTEM.md) | Complete system architecture and theory | /docs/ |
| [`WORKFLOW_INTEGRATION.md`](./docs/WORKFLOW_INTEGRATION.md) | How agents fit into the 5-step process | /docs/ |
| [`AGENT_PROMPTS.md`](./docs/AGENT_PROMPTS.md) | Prompt templates and context passing | /docs/ |
| [`INTEGRATION_GUIDE.md`](./docs/INTEGRATION_GUIDE.md) | Using the system in other projects | /docs/ |
| [`/Agents/`](./Agents/) | Individual agent specifications | /Agents/ |

## Quick Reference

### When to Use Which Agent

| Task | Primary Agent | Support Agents |
|------|--------------|----------------|
| New feature design | `/agent:architect` | `/agent:integration` |
| Implementation | `/agent:coder` | Domain specialists |
| Bug fixing | `/agent:tester` | `/agent:coder` |
| Security audit | `/agent:security` | - |
| Performance issues | `/agent:performance` | `/agent:coder` |
| Documentation | `/agent:documenter` | - |

### Agent Context Requirements

Each agent needs:
1. **Task specification** from current ticket/spec
2. **Relevant standards** (pre-processed into prompt)
3. **Example code/tests** from existing codebase
4. **Clear success criteria**

## Integration with CLAUDE.md

This system integrates seamlessly with your existing workflow:
- Follows all Development Standards
- Uses PROJECT_PLAN.md ticket system
- Creates/updates Spec documents
- Maintains strict status transitions

## 📑 Documentation Standards

### Frontmatter Requirements
All markdown files MUST include frontmatter with these fields:
```yaml
---
title: [Clear, descriptive title]
description: [One-line purpose statement]
type: [guide|template|spec|recipe|agent|metric]
category: [development|documentation|testing|architecture|security|quality]
tags: [relevant, searchable, terms]
created: [YYYY-MM-DD from date +"%Y-%m-%d"]
updated: [YYYY-MM-DD from date +"%Y-%m-%d"]
---
```

### Date Accuracy Rules
- **ALWAYS run** `date +"%m-%d-%Y"` for documentation dates (08-09-2025)
- **ALWAYS run** `date +"%Y-%m-%d"` for frontmatter dates (2025-08-09)
- **NEVER guess** or assume the current date
- **UPDATE** the 'updated' field whenever modifying a document

### Document Lifecycle
Every document progresses through: **Draft → Review → Stable → Deprecated**
- Track status in frontmatter (optional 'status' field)
- Archive deprecated docs with reason and date
- Maintain version history through git

## 🚀 New Project Setup Guide

### Step 1: Create Your Project Structure

Every new project MUST follow this directory structure:

```bash
/YourProject/
├── CLAUDE.md                        # Copy from Dev-Agency/Development_Standards/Templates/PROJECT_CLAUDE_TEMPLATE.md
├── README.md                         # Your project documentation
├── /src/                            # Source code
├── /tests/                          # Test files
├── /docs/                           # Project-specific documentation
└── /Project_Management/             # REQUIRED - Project tracking
    ├── PROJECT_PLAN.md              # Copy from Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md
    ├── /Specs/                      # Ticket specifications
    ├── /Bug_Reports/                # Issue tracking
    ├── /Archive/                    # Archived files (never delete)
    └── /Releases/                   # Release documentation
        ├── CHANGELOG.md             # Copy from Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md
        └── Release_Notes.md         # For commit notes
```

### Step 2: Copy Essential Templates

```bash
# From your project root:
cp /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_CLAUDE_TEMPLATE.md ./CLAUDE.md
cp /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md ./Project_Management/PROJECT_PLAN.md
cp /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md ./Project_Management/Releases/CHANGELOG.md
cp /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/SPECS_Template.md ./Project_Management/Specs/TICKET-001_spec.md
```

### Step 3: Initialize Dev-Agency Integration

1. Review [`CENTRAL_SYSTEM.md`](./docs/CENTRAL_SYSTEM.md) to understand the centralized approach
2. Check [`AGENT_SYSTEM.md`](./docs/AGENT_SYSTEM.md) for complete architecture
3. Read [`WORKFLOW_INTEGRATION.md`](./docs/WORKFLOW_INTEGRATION.md) for process details
4. Your CLAUDE.md now references all Dev-Agency agents and standards
5. Refer to [`/Agents/`](./Agents/) for specific agent capabilities

### Step 4: Connect MCP Tools (MANDATORY)

These three MCP tools are **REQUIRED** for all projects:

#### Mandatory Tools Setup
```bash
# These THREE tools MUST be added to every project:
claude mcp add memory node /home/hd/Desktop/LAB/MCP_Tools/memory/dist/index.js
claude mcp add filesystem node /home/hd/Desktop/LAB/MCP_Tools/filesystem/dist/index.js  
claude mcp add fetch python /home/hd/Desktop/LAB/MCP_Tools/fetch/server.py

# Optional but recommended:
claude mcp add git python /home/hd/Desktop/LAB/MCP_Tools/git/server.py
```

#### Why These Are Mandatory
- **memory**: Maintains project-specific knowledge graphs and context
- **filesystem**: Required for secure file operations and project navigation
- **fetch**: Essential for web content retrieval and API interactions

#### Additional Optional Tools
- **git**: Advanced repository operations
- **ui-browser**: Browser automation
- **And 15+ more tools...**

See [`/home/hd/Desktop/LAB/MCP_Tools/README.md`](file:///home/hd/Desktop/LAB/MCP_Tools/README.md) for complete MCP Tools documentation.

### Step 5: Start Development

With everything connected, you now have:
- ✅ **Specialized AI agents** from Dev-Agency for every development phase
- ✅ **External integrations** via mandatory MCP Tools
- ✅ **Structured workflow** with the 5-step process
- ✅ **Enterprise standards** built into every operation

## 📚 Essential Resources

### Development Guides (Reference from Dev-Agency)
All guides are centrally maintained - DO NOT copy, just reference:

| Guide | Purpose | Location |
|-------|---------|----------|
| **Development Standards** | Core coding principles | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Standards Guide.md` |
| **Development Workflow** | 5-step process details | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Workflow Guide.md` |
| **Documentation Guide** | How to document properly | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Documentation Guide.md` |
| **Definition of Done** | Completion criteria | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Definition of Done.md` |

### Templates (Copy to Your Project)
These templates should be copied and customized per project:

| Template | Use For | Source Location |
|----------|---------|-----------------|
| **PROJECT_CLAUDE_TEMPLATE** | Project CLAUDE.md | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_CLAUDE_TEMPLATE.md` |
| **PROJECT_PLAN** | Sprint planning | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md` |
| **SPECS** | Ticket specifications | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/SPECS_Template.md` |
| **CHANGELOG** | Release tracking | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md` |
| **Bug Report** | Issue documentation | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Persistent Bug Report.md` |
| **Handoff Report** | Session transfers | `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Handoff report.md` |

### Agents (Use via Commands)
Invoke these specialized agents as needed:

```bash
# Core Development Agents
/agent:architect     # System design and architecture planning
/agent:coder        # General code implementation
/agent:tester       # QA testing and debugging
/agent:security     # Security review and vulnerability assessment
/agent:documenter   # API docs and user guides

# Specialist Agents
/agent:mcp-dev      # Model Context Protocol specialist
/agent:performance  # Performance optimization
/agent:integration  # System integration specialist
/agent:hooks        # Hooks and middleware expert
```

---

*Built for Claude Code's architecture | Optimized for enterprise development*