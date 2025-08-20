---
title: STAD Agent Registry
description: Complete mapping of agents to STAD stages with roles and responsibilities
type: registry
category: architecture
tags: [stad, agents, registry, stages, roles]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# STAD Agent Registry

## Overview
This registry maps all Dev-Agency agents to their roles within the STAD Protocol's 5-stage lifecycle. It defines primary responsibilities, supporting roles, and stage-specific mandates.

---

## Agent-to-Stage Mapping

### Stage 0: Strategic Planning

| Agent | Role | Responsibility | Priority |
|-------|------|---------------|----------|
| **Architect** | Primary | Technical feasibility, epic estimation, risk assessment | Critical |
| **Scrum Master** | Supporting | Resource validation, capacity planning | High |
| Human/Claude | Lead | Business strategy, vision setting | Critical |

### Stage 1: Sprint Preparation

| Agent | Role | Responsibility | Priority |
|-------|------|---------------|----------|
| **Architect** | Primary | Create specs, dependency mapping, execution planning | Critical |
| **Scrum Master** | Supporting | Gate validation, ticket creation, board setup | High |
| **Documenter** | Supporting | Spec review, documentation planning | Medium |
| Human/Claude | Reviewer | Approve specs, clarify requirements | Critical |

### Stage 2: Sprint Execution

| Agent | Role | Responsibility | Priority |
|-------|------|---------------|----------|
| **Coder** | Primary | Feature implementation, code standards | Critical |
| **Tester** | Primary | Test creation, coverage validation | Critical |
| **Documenter** | Continuous | Update docs throughout execution | High |
| **Debug** | On-Demand | Fix issues, root cause analysis | High |
| **Security** | Supporting | Security validation, vulnerability scanning | Medium |
| **Performance** | Supporting | Performance optimization, benchmarking | Medium |
| **Integration** | Specialist | Service connections, API integration | As Needed |
| **Hooks** | Specialist | Middleware, plugin development | As Needed |
| **MCP-Dev** | Specialist | MCP protocol implementation | As Needed |
| **Memory-Sync** | Continuous | Knowledge graph updates | Medium |
| **Scrum Master** | Monitor | Progress tracking, blocker detection | High |

### Stage 3: Sprint Validation

| Agent | Role | Responsibility | Priority |
|-------|------|---------------|----------|
| **Backend QA** | Primary | Comprehensive validation, quality gates | Critical |
| **Debug** | Primary | Bug resolution, fix validation | Critical |
| **Tester** | Supporting | Regression testing, test updates | High |
| **Security** | Supporting | Final security scan | High |
| **Performance** | Supporting | Performance validation | Medium |
| **Scrum Master** | Coordinator | Gate enforcement, status tracking | High |
| Human/Claude | Reviewer | Functional validation, approval decision | Critical |

### Stage 4: Release & Retrospective

| Agent | Role | Responsibility | Priority |
|-------|------|---------------|----------|
| **Retrospective** | Primary | Sprint analysis, metrics, learnings | Critical |
| **Documenter** | Supporting | Release notes, final documentation | High |
| **Memory-Sync** | Supporting | Knowledge capture, pattern recognition | Medium |
| **Scrum Master** | Coordinator | Sprint closure, metrics recording | High |
| Human/Claude | Participant | Review insights, approve improvements | High |

---

## Agent Categories

### Core STAD Agents (Must Have STAD Context)
These agents are essential to the STAD workflow and require full context:

1. **Architect** - Stages 0, 1
2. **Coder** - Stage 2
3. **Tester** - Stages 2, 3
4. **Documenter** - Stages 1, 2, 3, 4
5. **Backend QA** - Stage 3
6. **Debug** - Stages 2, 3
7. **Retrospective** - Stage 4
8. **Scrum Master** - All Stages

### Supporting Agents (Should Have STAD Context)
These agents enhance the STAD workflow:

1. **Security** - Stages 2, 3
2. **Performance** - Stages 2, 3
3. **Integration** - Stage 2
4. **Hooks** - Stage 2
5. **MCP-Dev** - Stage 2
6. **Memory-Sync** - All Stages

### Tool Agents (STAD-Aware but Independent)
These agents provide utilities across stages:

1. **Auto-Fix** - Automated issue resolution
2. **Code-Intelligence** - Code analysis and suggestions
3. **Predictive-Planner** - Planning assistance
4. **Clutter-Detector** - Code cleanup
5. **VCS-Integration** - Version control operations

### Domain-Specific Agents (No STAD Context Needed)
These agents handle specific technologies:

1. **Vue-UI** - Vue.js development
2. **Websocket** - WebSocket implementation
3. **SQLite** - SQLite database operations

---

## Agent Selection Matrix

### By Task Type

| Task Type | Primary Agent | Supporting Agents | Stage |
|-----------|--------------|-------------------|-------|
| Epic Definition | Architect | Scrum Master | 0 |
| Sprint Planning | Architect | Documenter, Scrum Master | 1 |
| Feature Implementation | Coder | Tester, Documenter | 2 |
| Bug Fixing | Debug | Tester, Coder | 2, 3 |
| API Development | Coder | Integration, Documenter | 2 |
| Security Review | Security | Coder, Backend QA | 2, 3 |
| Performance Tuning | Performance | Coder, Tester | 2, 3 |
| Quality Validation | Backend QA | Tester, Debug | 3 |
| Release Preparation | Documenter | Retrospective | 4 |
| Sprint Analysis | Retrospective | Scrum Master | 4 |

### By Complexity

| Complexity | Agents Required | Parallel Possible |
|------------|----------------|-------------------|
| Simple (1-2 points) | Coder, Tester | No |
| Medium (3-5 points) | Coder, Tester, Documenter | Partial |
| Complex (5+ points) | Architect (to split), then multiple | Yes |
| Integration | Coder, Integration, Tester | No |
| Security-Critical | Coder, Security, Tester | No |

---

## Communication Patterns

### Handoff Requirements

| From Agent | To Agent | Stage Transition | Handoff Location |
|------------|----------|------------------|------------------|
| Architect | Coder | Stage 1 → 2 | `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/architect_to_coder_[TICKET].md` |
| Coder | Tester | Within Stage 2 | `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/coder_to_tester_[TICKET].md` |
| Tester | Backend QA | Stage 2 → 3 | `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/tester_to_backend-qa_[TICKET].md` |
| Backend QA | Debug | Within Stage 3 | `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/backend-qa_to_debug_[TICKET].md` |
| All Agents | Retrospective | Stage 3 → 4 | Work reports aggregated |

### Work Report Requirements

All agents must file work reports in:
`/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/[agent]_[TICKET]_report.md`

Required sections:
- Work completed
- Decisions made
- Issues encountered
- Time spent
- Recommendations

---

## Agent Invocation Guidelines

### Stage-Based Invocation

```bash
# Stage 0: Strategic Planning
/agent:architect "Assess feasibility of [epic]"

# Stage 1: Sprint Preparation
/sprint-plan              # Automatically invokes Architect
/agent:architect "Create specs for Sprint [N]"

# Stage 2: Sprint Execution
/sprint-execute           # Orchestrates multiple agents
/agent:coder "Implement [TICKET] per spec"
/agent:tester "Create tests for [TICKET]"

# Stage 3: Sprint Validation
/validate-stage 3         # Invokes Backend QA
/agent:backend-qa "Validate Sprint [N]"
/agent:debug "Fix [issue] found in validation"

# Stage 4: Release & Retrospective
/approve                  # Triggers release and retrospective
/agent:retrospective "Analyze Sprint [N]"
```

### Parallel Agent Execution

When tasks are independent, agents can work in parallel:

```yaml
parallel_safe:
  batch_1:
    - agent: coder
      ticket: STAD-001
    - agent: coder
      ticket: STAD-002
  
sequential_required:
  - agent: coder
    ticket: STAD-003
  - agent: tester
    ticket: STAD-003
  - agent: documenter
    ticket: STAD-003
```

---

## Quality Standards by Agent

| Agent | Coverage Requirement | Quality Gate | Success Metric |
|-------|---------------------|--------------|----------------|
| Coder | Implementation 100% | Linting, Types | Zero errors |
| Tester | Test coverage >80% | All tests pass | Zero skipped |
| Documenter | All features documented | Frontmatter valid | Single source |
| Backend QA | All acceptance criteria | Quality gates pass | Ready for release |
| Debug | Issue resolved + test | Root cause fixed | No regression |
| Security | Zero high/critical | OWASP compliance | Clean scan |
| Performance | Meet benchmarks | <200ms response | No degradation |

---

## Agent Context Requirements

### Universal Context
All STAD agents must include:
`/prompts/agent_contexts/universal_context.md`

### Stage-Specific Context
Agents should also include their stage context:
- Stage 0: `/prompts/agent_contexts/stage_0_context.md`
- Stage 1: `/prompts/agent_contexts/stage_1_context.md`
- Stage 2: `/prompts/agent_contexts/stage_2_context.md`
- Stage 3: `/prompts/agent_contexts/stage_3_context.md`
- Stage 4: `/prompts/agent_contexts/stage_4_context.md`

---

## Continuous Improvement

### Metrics to Track
- Agent success rate by stage
- Handoff completeness
- Work report quality
- Time per stage
- Rework rate by agent

### Feedback Loop
1. Retrospective Agent analyzes performance
2. Patterns identified in Stage 4
3. Agent prompts refined
4. Context templates updated
5. Registry updated with learnings

---

*This registry is the authoritative source for agent roles in the STAD Protocol*