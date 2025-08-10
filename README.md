# Dev-Agency: Centralized Agentic Development System

## Overview

Dev-Agency is the **single source of truth** for AI-powered development. It provides specialized agents, proven workflows, and enterprise standards that all projects reference directly - no copying, no duplication, just centralized excellence.

## 🎯 Core Philosophy

**"Quality, Efficiency, Security, and Documentation OVER Speed"**  
**"The better you plan, the better the outcome"**  
**"Single Source of Truth - No Clutter, No Redundancy"**

## 🏗️ System Architecture

### Hub-and-Spoke Model

```
                    Main Claude (Hub)
                          |
        +-----------------+-----------------+
        |                 |                 |
   /agent:coder    /agent:tester    /agent:security
   [Stateless]      [Stateless]      [Stateless]
        |                 |                 |
   [Reports Back]    [Reports Back]    [Reports Back]
        |                 |                 |
        +-----------------+-----------------+
                          |
                    Main Claude
                    [Maintains Context & Orchestrates]
```

### Key Architectural Principles

1. **Stateless Agents**: Each agent invocation is completely independent
2. **No Agent Memory**: Agents cannot access previous invocations
3. **No Inter-Agent Communication**: All coordination through Main Claude
4. **Main Claude as Orchestrator**: Maintains context and coordinates all agents
5. **Pre-Processed Context**: All necessary context embedded in agent prompts

### How It Works as Central System

```
                Dev-Agency (Central Hub)
                /home/hd/Desktop/LAB/Dev-Agency/
                        |
    +-------------------+-------------------+
    |                   |                   |
Project A          Project B           Project C
(references)       (references)        (references)
```

**No Copying Required**: Projects reference Dev-Agency directly, ensuring:
- Edit once, apply everywhere
- Zero duplication
- Instant updates across all projects
- Consistent standards

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

### Step 3: Connect MCP Tools (MANDATORY)

These three MCP tools are **REQUIRED** for all projects:

```bash
# These THREE tools MUST be added to every project:
claude mcp add memory node /home/hd/Desktop/LAB/MCP_Tools/memory/dist/index.js
claude mcp add filesystem node /home/hd/Desktop/LAB/MCP_Tools/filesystem/dist/index.js  
claude mcp add fetch python /home/hd/Desktop/LAB/MCP_Tools/fetch/server.py

# Optional but recommended:
claude mcp add git python /home/hd/Desktop/LAB/MCP_Tools/git/server.py
```

### Step 4: Start Development

With everything connected, you now have:
- ✅ **Specialized AI agents** from Dev-Agency for every development phase
- ✅ **External integrations** via mandatory MCP Tools
- ✅ **Structured workflow** with the 5-step process
- ✅ **Enterprise standards** built into every operation

## 🤖 Agent System

### Available Agents

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

### Agent Invocation Process

1. **Main Claude prepares context** - Gathers all necessary information
2. **Agent launches** - Runs autonomously with provided context
3. **Single response** - Agent completes task and reports back
4. **Main Claude processes** - Integrates results and decides next steps

### Critical Constraints

- **No File Access**: Agents cannot read files or variables directly
- **Token Limits**: Agent prompts must fit within model constraints
- **Single Message**: Agents return only one message (no follow-up)
- **Stateless**: Each invocation starts fresh

## 📖 Workflow Recipes

Recipes are proven workflow patterns that combine agents for common tasks. Each recipe is self-contained with:
- Agent sequence
- Step-by-step process
- Any specialized prompts needed
- Success criteria
- Time estimates

### Available Recipes

| Recipe | Purpose | Complexity |
|--------|---------|------------|
| `api_feature_recipe.md` | REST API development | Medium |
| `bug_fix_recipe.md` | Systematic debugging | Low-Medium |
| `mcp_server_recipe.md` | MCP implementation | High |
| `security_audit_recipe.md` | Security review | High |
| `quality_first_recipe.md` | Quality-focused workflow | High |
| `clean_code_enforcement.md` | Anti-clutter workflow | Medium |

### 5-Step Development Process

All recipes follow this core workflow:

1. **Research** → Main Claude analyzes codebase
2. **Plan** → Main Claude + `/agent:architect` create technical specs
3. **Build** → `/agent:coder` or specialists implement
4. **Test** → `/agent:tester` validates + `/agent:security` reviews
5. **Document** → `/agent:documenter` creates user-facing docs

## 📁 Dev-Agency Structure

```
/Dev-Agency/
├── 📚 Root Files
│   ├── README.md                    # This file - Complete system guide
│   └── CLAUDE.md                    # Central system instructions
│
├── 📋 /Development_Standards/        # Centralized standards and templates
│   ├── /Guides/                     # Methodology guides (reference only)
│   │   ├── Development Standards Guide.md
│   │   ├── Development Workflow Guide.md
│   │   ├── Documentation Guide.md
│   │   └── Definition of Done.md
│   └── /Templates/                  # Copy these to projects
│       ├── PROJECT_CLAUDE_TEMPLATE.md
│       ├── DRAFT_GLOBAL_CLAUDE.md
│       ├── PROJECT_PLAN_Template.md
│       ├── SPECS_Template.md
│       ├── CHANGELOG_Template.md
│       └── [Other templates...]
│
├── 🤖 /Agents/                      # Agent definitions
│   └── [9 specialist agents]
│
├── 📖 /recipes/                     # Self-contained workflow patterns
│   └── [6 proven recipes with embedded prompts]
│
├── 📊 /Project_Management/          # Dev-Agency's own project tracking
│   ├── PROJECT_PLAN.md
│   ├── /Specs/
│   ├── /Bug_Reports/
│   └── /Releases/
│
├── 🔄 /feedback/                    # Continuous improvement
│   └── [Feedback forms and tracking]
│
└── 🗄️ /Archive/                     # Archived files (never delete)
    └── [Archived content with reason notes]
```

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

## 📝 Content Organization Rules

### What Goes Where

| Content Type | Location | Naming Convention |
|-------------|----------|-------------------|
| Agent definitions | `/Agents/` | `[agent-name].md` (lowercase, hyphenated) |
| Workflow recipes | `/recipes/` | `[workflow]_recipe.md` |
| Project specs | `/Project_Management/Specs/` | `[TICKET-ID]_spec.md` |
| Bug reports | `/Project_Management/Bug_Reports/` | `[DATE]_[issue].md` |
| Feedback forms | `/feedback/` | `[date]_[session].md` |

### Anti-Clutter Principles

#### ❌ DON'T
- Create duplicate documentation (search first!)
- Mix concerns (specs stay in `/Specs/`, not root)
- Create agent definitions outside `/Agents/`
- Put project-specific code here (this is infrastructure only)
- Create new files without checking for existing ones
- Split related content across multiple files

#### ✅ DO
- Search for existing content before creating new
- Update existing documentation rather than create new
- Keep single source of truth for each concept
- Consolidate related content in one place
- Use clear, descriptive naming
- Archive old files instead of deleting

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

## System Improvements & Tracking

### Performance Metrics
- Agent invocation success rate > 90%
- Average context size optimization of 30%
- Time savings of 40% on complex tasks
- Zero agent-to-agent communication violations

### Continuous Improvement Process
1. **Feedback Collection**: After each agent use
2. **Recipe Refinement**: Based on success patterns
3. **Agent Evolution**: Improving prompts and capabilities
4. **Anti-Clutter Reviews**: Monthly consolidation checks

## Integration with CLAUDE.md

This system integrates seamlessly with your existing workflow:
- Follows all Development Standards
- Uses PROJECT_PLAN.md ticket system
- Creates/updates Spec documents
- Maintains strict status transitions

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

---

*Built for Claude Code's architecture | Optimized for enterprise development*
*Single Source of Truth | No Duplication | Centralized Excellence*