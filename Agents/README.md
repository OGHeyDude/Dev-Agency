---
title: Agents Directory
description: Specialized agent definitions for the Dev-Agency system
type: guide
category: documentation
tags: [agents, definitions, specialization, system-design, development]
created: 2025-08-09
updated: 2025-08-10
version: 1.0
status: stable
---

# Agent Definitions Directory

## Purpose
This directory contains all specialized agent definitions for the Dev-Agency system.

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

| Agent | Purpose | Specialty |
|-------|---------|-----------|
| `architect.md` | System design | Architecture planning |
| `coder.md` | Implementation | Code writing |
| `tester.md` | Quality assurance | Testing & debugging |
| `security.md` | Security review | Vulnerability assessment |
| `performance.md` | Optimization | Performance analysis |
| `documenter.md` | Documentation | User-facing docs |
| `mcp-dev.md` | MCP specialist | Protocol implementation |
| `integration.md` | Integration | System coordination |
| `hooks.md` | Hooks/middleware | Event systems |
| `clutter-detector.md` | Clean code | Anti-redundancy |
| `vue-ui.md` | Vue.js debugging | Frontend/UI specialist |

## File Naming Convention
- **Format**: `[agent-name].md`
- **Style**: lowercase, hyphenated
- **Examples**: `security.md`, `mcp-dev.md`, `clutter-detector.md`

## Required Sections for New Agents
Every agent definition MUST include:

1. **Agent ID** - The `/agent:name` command
2. **Purpose** - Clear, single responsibility
3. **Core Principle** - Philosophy driving this agent
4. **Specialization** - Specific expertise areas
5. **When to Use** - Clear usage scenarios
6. **Context Requirements** - What the agent needs
7. **Success Criteria** - How to measure success
8. **Anti-Clutter Checks** - Prevent duplication
9. **Output Format** - Expected deliverables
10. **Integration with Workflow** - How it fits

## Template for New Agent
```markdown
# [Agent Name] Agent

## Agent ID
`/agent:[name]`

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