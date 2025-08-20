---
title: Agents Directory
description: Specialized agent definitions for the Dev-Agency system
type: guide
category: documentation
tags: [agents, definitions, specialization, system-design, development, stad]
created: 2025-08-09
updated: 2025-08-17
version: 2.0
status: stable
stad_alignment: complete
---

# Agent Definitions Directory

## Purpose
This directory contains all specialized agent definitions for the Dev-Agency system.

## STAD Protocol Alignment Status

As of 2025-08-17, all agents have been aligned with STAD Protocol v5.1:

### Alignment Categories

#### ✅ Core STAD Agents (Fully Integrated)
- **architect.md** - Stage 1 primary agent with comprehensive MCP tools
- **coder.md** - Stage 2 primary agent with complete handoff protocols
- **tester.md** - Stage 2 primary agent with quality gate enforcement
- **documenter.md** - Stages 2-4 continuous documentation
- **backend-qa.md** - Stage 3 validation specialist
- **debug.md** - Stages 2-3 rapid issue resolution
- **retrospective.md** - Stage 4 sprint analysis
- **scrum_master.md** - All stages protocol enforcement

#### ✅ Supporting Agents (STAD-Aware)
- **security.md** - Stages 2-3 security validation
- **performance.md** - Stages 2-3 performance optimization
- **integration.md** - Stage 2 service integration
- **hooks.md** - Stage 2 middleware implementation
- **mcp-dev.md** - Stage 2 MCP protocol specialist
- **memory-sync.md** - Stages 2-4 knowledge graph sync

#### ✅ Tool Agents (Light Integration)
- **auto-fix.md** - All stages automated fixes
- **code-intelligence.md** - All stages code analysis
- **predictive-planner.md** - Stage 1 planning assistance
- **clutter-detector.md** - All stages anti-redundancy
- **vcs-integration.md** - All stages version control

#### ✅ Domain Agents (Basic Awareness)
- **vue-ui.md** - Vue.js specialist
- **websocket.md** - WebSocket specialist
- **sqlite.md** - SQLite specialist
- **github-cli.md** - GitHub operations specialist

### Key Updates Made
1. **Universal Context References** - All agents reference `/prompts/agent_contexts/universal_context.md`
2. **Stage Context Integration** - Core agents include stage-specific contexts
3. **MCP Tools Documentation** - Complete MCP tool listings with examples
4. **Knowledge Graph Patterns** - Entity types and update patterns defined
5. **Handoff Requirements** - Input/output specifications for agent coordination
6. **Blocker Handling Protocols** - Type 1 (Bugs) vs Type 2 (Design Decisions)
7. **Work Report Requirements** - Standardized locations and templates

## 🚫 Anti-Clutter Rules

### Before Creating a New Agent
1. **Check if agent already exists** - We might have one that does similar work
2. **Can existing agent be enhanced?** - Better to improve than duplicate
3. **Is this truly specialized?** - Don't create agents for trivial tasks
4. **Will this be reused?** - One-off tasks don't need agents

### Agent Creation Criteria
Only create a new agent when:
- Specialized expertise is required
- Will be used repeatedly
- Significantly different from existing agents
- Complex enough to warrant isolation

## Current Agents

| Agent | Purpose | Automatic Activation |
|-------|---------|----------------------|
| `architect.md` | System design | `/sprint-plan` stage |
| `coder.md` | Implementation | `/execute` stage |
| `tester.md` | Quality assurance | `/execute` and `/validate` stages |
| `security.md` | Security review | `/validate` stage |
| `performance.md` | Optimization | `/execute` and `/validate` stages |
| `documenter.md` | Documentation | All stages (continuous) |
| `mcp-dev.md` | MCP specialist | `/execute` for MCP work |
| `integration.md` | Integration | `/execute` for service work |
| `hooks.md` | Hooks/middleware | `/execute` for middleware |
| `clutter-detector.md` | Clean code | All stages (anti-redundancy) |
| `vue-ui.md` | Vue.js debugging | `/execute` for Vue work |

## File Naming Convention
- **Format**: `[agent-name].md`
- **Style**: lowercase, hyphenated
- **Examples**: `security.md`, `mcp-dev.md`, `clutter-detector.md`

## Required Sections for New Agents
Every agent definition MUST include:

1. **Internal Agent Reference** - The agent name for internal coordination
2. **Purpose** - Clear, single responsibility
3. **Core Principle** - Philosophy driving this agent
4. **Specialization** - Specific expertise areas
5. **Automatic Activation** - When system invokes this agent
6. **Context Requirements** - What the agent needs
7. **Success Criteria** - How to measure success
8. **Anti-Clutter Checks** - Prevent duplication
9. **Output Format** - Expected deliverables
10. **Integration with Workflow** - How it fits in STAD stages

## Template for New Agent
```markdown
# [Agent Name] Agent

## Internal Agent Reference
[name] (automatically invoked by system, not user command)

## Purpose
[Single sentence description]

## Core Principle
[Philosophy - quality over speed, etc.]

## Anti-Clutter Checks (MANDATORY)
Before [action]:
1. Search for existing [thing]
2. Check for reusable [components]
3. Verify no redundancy
4. Consolidation opportunities?

[Rest of template...]
```

## Maintenance

### Regular Review (Monthly)
- Remove unused agents
- Consolidate similar agents
- Update outdated sections
- Improve based on feedback

### Quality Checks
- [ ] No duplicate agents
- [ ] Clear differentiation between agents
- [ ] All agents have anti-clutter checks
- [ ] Documentation is current

---

*Remember: Fewer, better agents > Many, mediocre agents*