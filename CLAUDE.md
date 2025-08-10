# CLAUDE.md - Dev-Agency Central System

**Project:** Dev-Agency - Centralized Agentic Development System  
**Type:** Central Development Infrastructure (Single Source of Truth)  
**Status:** Production - Serving All Projects

## 🎯 CRITICAL: This is the CENTRAL SYSTEM

**Dev-Agency is the single source of truth for ALL development projects.**

### How It Works:
1. **All agents live HERE** - Never copy to projects
2. **All templates live HERE** - Projects reference them
3. **All standards live HERE** - One place to manage

### For Other Projects:
1. **DO NOT COPY files from here**
2. **Use the template:** `PROJECT_CLAUDE_TEMPLATE.md`
3. **Projects reference this location:** `/home/hd/Desktop/LAB/Dev-Agency/`

### Central System Documentation:
- **Architecture:** See `CENTRAL_SYSTEM.md`
- **Integration:** See `INTEGRATION_GUIDE.md` (v2.0 - Reference Only)
- **Template:** See `PROJECT_CLAUDE_TEMPLATE.md`

**This Location:** `/home/hd/Desktop/LAB/Dev-Agency/`

---

## Quick Commands

### Standard Workflow
**Workflow:** `/cmd` → select ticket → `/research` → `/plan` → `/build` → `/test` → `/document` → `/done`

### Agent-Enhanced Workflow
**With Agents:** `/cmd` → `/research` → `/plan` + `/agent:architect` → `/build` + `/agent:coder` → `/test` + `/agent:tester` → `/document` + `/agent:documenter` → `/done`

### Agent Invocation Commands
```bash
# Core Development Agents
/agent:architect     # System design and architecture
/agent:coder        # General code implementation  
/agent:tester       # QA testing and debugging
/agent:security     # Security review
/agent:documenter   # User-facing documentation
/agent:memory-sync  # Sync code changes to knowledge graph

# Specialist Agents  
/agent:mcp-dev      # MCP protocol specialist
/agent:performance  # Performance optimization
/agent:integration  # Service integration
/agent:hooks        # Hooks and middleware
```

### Memory Sync Commands
```bash
# Manual sync commands
/sync-memory                    # Sync all changed files
/sync-memory [path]            # Sync specific directory
/sync-memory --types "py,ts"   # Sync specific file types
/sync-memory --force           # Force full resync

# Status commands
/sync-memory --status          # Show sync status
/sync-memory --pending         # Show pending changes
```

---

## Reference Shortcuts

### Standard Guides
- `$STANDARDS` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Standards Guide.md`
- `$WORKFLOW` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development Workflow Guide.md`
- `$DOCS_GUIDE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Documentation Guide.md`
- `$DONE` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Definition of Done.md`
- `$GUIDES_DIR` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/`

### Agent System Documentation
- `$AGENT_SYSTEM` = `/home/hd/Desktop/LAB/Dev-Agency/AGENT_SYSTEM.md`
- `$AGENT_PROMPTS` = `/home/hd/Desktop/LAB/Dev-Agency/AGENT_PROMPTS.md`
- `$WORKFLOW_INT` = `/home/hd/Desktop/LAB/Dev-Agency/WORKFLOW_INTEGRATION.md`
- `$AGENTS_DIR` = `/home/hd/Desktop/LAB/Dev-Agency/Agents/`

### Agent Recipes
- `$RECIPES` = `/home/hd/Desktop/LAB/Dev-Agency/recipes/`
- `$PROMPTS` = `/home/hd/Desktop/LAB/Dev-Agency/prompts/`
- `$METRICS` = `/home/hd/Desktop/LAB/Dev-Agency/metrics/`

### Templates
- `$PROJECT_PLAN` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md`
- `$SPEC` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/SPECS_Template.md`
- `$CHANGELOG` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md`
- `$BUG_REPORT` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Persistent Bug Report.md`
- `$HANDOFF` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Handoff report.md`
- `$NOTES` = `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Release_Notes_Template.md`
- `$FEEDBACK` = `/home/hd/Desktop/LAB/Dev-Agency/feedback/agent_feedback_form.md`

---

## Session Management with Agents

### Standard Commands (Enhanced)
- `/cmd` - Initialize session, read CLAUDE.md, check PROJECT_PLAN
- `/standards` - Review standards + agent guidelines
- `/reflect` - Review implementation with agent output analysis
- `/done` - Complete checklist including agent performance review

### Agent-Specific Commands
- `/agent-status` - Show current agent invocations and results
- `/agent-metrics` - Display agent performance metrics
- `/agent-recipe [name]` - Load proven agent combination recipe
- `/agent-feedback` - Record feedback for agent improvement

---

## 5-Step Development Process with Agents

### 1. `/research` - Discovery Phase
- **Main Claude**: Search codebase, analyze patterns
- **Optional**: `/agent:architect` for complex system questions
- **Output**: Research findings for planning context

### 2. `/plan` - Planning Phase  
- **Main Claude**: Read `$WORKFLOW`, prepare context
- **Required**: `/agent:architect` for system design
- **Output**: Technical specification in `$SPEC`
- **Status**: `BACKLOG` → `TODO`

### 3. `/build` - Implementation Phase
- **Main Claude**: Read `$STANDARDS`, orchestrate implementation
- **Required**: Select appropriate agent(s):
  - `/agent:coder` - Standard features
  - `/agent:mcp-dev` - MCP implementations
  - `/agent:hooks` - Middleware/plugins
  - `/agent:integration` - Service connections
- **Status**: `TODO` → `IN_PROGRESS` → `CODE_REVIEW`

### 4. `/test` - Validation Phase
- **Main Claude**: Coordinate testing
- **Required**: `/agent:tester` for test creation/execution
- **Optional**: 
  - `/agent:security` for security review
  - `/agent:performance` for optimization
- **Status**: `CODE_REVIEW` → `QA_TESTING`

### 5. `/document` - Documentation Phase
- **Main Claude**: Update technical docs
- **Optional**: `/agent:documenter` for user-facing docs
- **Output**: Complete documentation
- **Status**: `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE`

---

## Agent Usage Guidelines

### Context Preparation Rules
1. **Always pre-process standards** into agent prompts
2. **Include relevant code examples** from codebase
3. **Provide clear success criteria**
4. **Never reference external files** (embed content directly)

### Agent Selection Matrix

| Task Type | Primary Agent | Support Agents |
|-----------|--------------|----------------|
| System Design | `/agent:architect` | `/agent:integration` |
| API Development | `/agent:coder` | `/agent:tester`, `/agent:documenter` |
| MCP Implementation | `/agent:mcp-dev` | `/agent:integration` |
| Bug Fix | `/agent:tester` → `/agent:coder` | `/agent:security` |
| Performance Issue | `/agent:performance` | `/agent:coder` |
| Security Audit | `/agent:security` | `/agent:coder` for fixes |

### Parallel Agent Execution
When tasks are independent, run agents in parallel:
```
- Security review + Performance analysis
- Multiple component implementations
- Different documentation types
```

---

## Project Management Structure

### Required Folders
```
/Dev-Agency/
├── CLAUDE.md                    # This file
├── PROJECT_PLAN.md              # Central planning
├── /Project_Management/
│   ├── PROJECT_PLAN.md         # Tickets and epics
│   ├── /Specs/                 # Ticket specifications
│   ├── /Bug_Reports/           # Bug tracking
│   └── /Releases/              # Release docs
├── /Agents/                     # Agent definitions
├── /metrics/                    # Performance tracking
├── /recipes/                    # Agent combinations
├── /prompts/                    # Prompt libraries
└── /feedback/                   # Improvement tracking
```

---

## Critical Principles (Agent-Enhanced)

### 🎯 CORE VALUES
**"Quality, Efficiency, Security, and Documentation OVER Speed"**
- We build enterprise-grade software worthy of production
- Every line of code should be secure and maintainable
- Documentation is NOT optional - it's part of the deliverable
- Take the time needed to do it RIGHT the first time

### 📋 PLANNING & TRACKING PHILOSOPHY
**"The better you plan, the better the outcome"**
- ALWAYS read documentation before starting
- ALWAYS write detailed plans before coding
- ALWAYS track progress against plans
- ALWAYS update plans based on learnings
- Tracking progress is the KEY to achieving goals

### System Principles
1. **Hub-and-Spoke Architecture** - Main Claude orchestrates all agents
2. **No Agent-to-Agent Communication** - All coordination through main
3. **Stateless Agent Invocations** - Each call is independent
4. **Complete Context Required** - Agents receive self-contained prompts
5. **Track Agent Performance** - Log metrics for continuous improvement

### Agent-Specific Principles
1. **Quality First** - Use multiple agents to ensure excellence
2. **Plan Thoroughly** - `/agent:architect` creates detailed plans BEFORE coding
3. **Security Always** - `/agent:security` reviews ALL production code
4. **Document Everything** - `/agent:documenter` for comprehensive docs
5. **Track Meticulously** - Update metrics and progress after EVERY step
6. **Use specialists for complex domains** (MCP, security, performance)
7. **Version control successful prompts** for reuse
8. **Continuously refine** based on feedback

---

## 🚫 ANTI-CLUTTER DIRECTIVES (MANDATORY)

### Before ANY Action
1. **Search First, Create Second**
   - ALWAYS search for existing implementations
   - NEVER create without checking for duplicates
   - ALWAYS reuse before recreating

2. **Single Source of Truth**
   - ONE file per concept
   - ONE location per type of content
   - ONE documentation per feature

3. **DRY Enforcement**
   - Don't Repeat Yourself
   - Extract common patterns
   - Create reusable components

### Agent Responsibilities
- `/agent:architect` - MUST check for existing designs
- `/agent:coder` - MUST search for reusable code
- `/agent:documenter` - MUST update existing docs (not create new)
- `/agent:tester` - MUST check for existing test patterns
- `/agent:clutter-detector` - MUST run periodically for cleanup

### Mandatory Pre-Implementation Checks
```bash
# Before creating ANY file:
ls [target_directory]  # Check what exists
Grep "similar_function" # Search for existing implementations
Read existing_files    # Understand current structure
```

### Quality Gates
- Pre-implementation: Duplicate check REQUIRED
- Post-implementation: Consolidation review REQUIRED
- Weekly: Clutter detection scan REQUIRED

### File Creation Rules
1. **Check First**: Does this file/function already exist?
2. **Location Verify**: Is this the CORRECT directory?
3. **Consolidate**: Can this be added to an existing file?
4. **Justify**: Is this separation truly necessary?

---

## ⏰ Date and Time Accuracy (MANDATORY)

### Before Writing ANY Date
```bash
# ALWAYS run these commands - NEVER guess dates:
date +"%m-%d-%Y"        # For US format: 08-09-2025
date +"%Y-%m-%d"        # For ISO/frontmatter: 2025-08-09
date +"%Y-%m-%d %H:%M"  # With time: 2025-08-09 14:30
```

### Date Usage Rules
- **Documentation text**: Use `MM-DD-YYYY` format (08-09-2025)
- **Frontmatter fields**: Use `YYYY-MM-DD` format (2025-08-09)
- **File names**: Use `YYYYMMDD` or `YYYY-MM-DD`
- **NEVER write dates without checking actual system time**
- **ALWAYS update the 'updated' field in frontmatter when modifying docs**

---

## Ticket Status Transitions with Agents

```
BACKLOG 
  ↓ (research phase)
TODO (after /agent:architect in planning)
  ↓
IN_PROGRESS (with /agent:coder or specialists)
  ↓
CODE_REVIEW (main Claude review)
  ↓
QA_TESTING (with /agent:tester)
  ↓
DOCUMENTATION (with /agent:documenter if needed)
  ↓
READY_FOR_RELEASE
  ↓
DONE (with metrics recorded)
```

---

## Performance Tracking

After each agent invocation, record:
- Agent used
- Token count (input/output)
- Success/failure
- Time taken
- Quality of output
- Context improvements needed

Store in: `/Dev-Agency/metrics/agent_performance_log.md`

---

## Continuous Improvement

1. **After each sprint**: Review agent performance metrics
2. **Identify patterns**: Which contexts work best
3. **Update prompts**: Refine based on successes
4. **Share recipes**: Document winning combinations
5. **Evolve system**: Adjust based on real usage

---

## Project Context

- **Project Type**: Development Infrastructure / Agent System
- **Primary Language**: Markdown (Documentation), Multi-language (Examples)
- **Key Components**: Agent definitions, Prompt templates, Workflow integration
- **Goal**: Build enterprise-grade agentic development system

---

*This CLAUDE.md extends the master system with agent-specific enhancements for the Dev-Agency project.*