---
title: Stage 1 Sprint Preparation Context
description: Context template for agents operating in STAD Stage 1 (Sprint Preparation)
type: context
category: stad
tags: [context, stage-1, sprint, preparation, planning]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# Stage 1: Sprint Preparation Context

## Stage Overview
**Stage 1** is the comprehensive planning phase where epics are translated into detailed technical specifications and execution plans. This stage creates all context needed for zero-intervention execution in Stage 2.

## Agent Role in Stage 1
Agents in this stage act as **technical planners** and **specification writers**, creating:
- Detailed technical specifications
- Dependency-aware execution plans (DAGs)
- Edge case handling strategies
- Fallback approaches for common issues

## Required Context Elements

### 1. Pre-Flight Check Results
```yaml
preflight_context:
  recent_changes:
    - commit: [hash]
      impact: [files/modules affected]
      decisions: [architectural choices made]
  recent_bugs:
    - ticket: [ID]
      root_cause: [...]
      fix: [...]
      regression_risk: [areas to watch]
  performance_baseline:
    - metric: [response_time|memory|cpu]
      current: [value]
      target: [value]
```

### 2. Sprint Scope
```yaml
sprint_scope:
  epic: [Epic name and ID]
  feature: [Specific feature to implement]
  story_points: [Total for sprint, typically 30-35]
  sprint_goal: [One clear objective]
  acceptance_criteria:
    - [ ] [Testable condition 1]
    - [ ] [Testable condition 2]
    - [ ] [Testable condition 3]
```

### 3. Technical Decisions
```yaml
technical_decisions:
  architecture:
    pattern: [Pattern to use]
    rationale: [Why this pattern]
  technology:
    libraries: [New dependencies]
    justification: [Why needed]
  data:
    schema_changes: [If any]
    migration_strategy: [How to migrate]
```

## Stage 1 Deliverables

### Technical Specification Template
```markdown
## Technical Specification: [Feature Name]

### Problem Statement
[Clear description of what we're solving]

### Solution Approach
[High-level technical approach]

### Implementation Details
#### Component Structure
- [Component A]: [Purpose and design]
- [Component B]: [Purpose and design]

#### Data Flow
1. [Step 1]: [What happens]
2. [Step 2]: [What happens]
3. [Step 3]: [What happens]

#### API Design
- Endpoint: [Method] /path
- Request: [Schema]
- Response: [Schema]
- Errors: [Error cases]

### Edge Cases
| Scenario | Handling Strategy | Fallback |
|----------|------------------|----------|
| [Edge case 1] | [Primary approach] | [If fails] |
| [Edge case 2] | [Primary approach] | [If fails] |

### Dependencies
- Internal: [Components this depends on]
- External: [Services, APIs, libraries]
- Order: [What must be built first]
```

### Execution Plan (DAG) Template
```markdown
## Execution Plan: Sprint [N]

### Dependency Graph
\```mermaid
graph TD
    TICKET-001 --> TICKET-003
    TICKET-002 --> TICKET-003
    TICKET-003 --> TICKET-004
    TICKET-001 -.parallel.-> TICKET-002
\```

### Execution Batches
#### Batch 1 (Parallel Safe)
- [ ] TICKET-001: Database schema (3 points)
- [ ] TICKET-002: Auth service (5 points)

#### Batch 2 (Sequential)
- [ ] TICKET-003: User API (5 points)
- [ ] TICKET-004: Profile API (3 points)

### Context Package per Batch
Each batch includes:
- Required files to read
- Patterns to follow
- Dependencies available
- Decisions already made
```

## Quality Gates for Stage 1 → Stage 2

Before proceeding to Stage 2 (Sprint Execution), ensure:
- [ ] All tickets have complete specifications
- [ ] No ticket exceeds 5 story points
- [ ] Dependencies mapped in DAG format
- [ ] Edge cases documented with strategies
- [ ] Fallback approaches defined
- [ ] Agent assignments determined
- [ ] Context packages prepared
- [ ] GitHub tickets created
- [ ] Project board configured

## Agent Instructions

### For Architect Agent (Primary)
In Stage 1, you must:
1. Run pre-flight checks for context
2. Create comprehensive technical specifications
3. Generate dependency-aware execution plan
4. Document all edge cases and fallbacks
5. Split any ticket >5 points
6. Prepare context packages for Stage 2

### For Scrum Master Agent
In Stage 1, validate:
1. Specification completeness
2. Story point accuracy
3. Dependency clarity
4. Resource availability
5. Stage gate criteria met

## Communication Protocols

### Input Format
```yaml
stage_1_request:
  epic: [Epic ID]
  sprint_goal: [Clear objective]
  constraints:
    story_points: [30-35]
    timeline: [Sprint duration]
    resources: [Available agents]
  preflight_data:
    recent_changes: [...]
    recent_bugs: [...]
    performance: [...]
```

### Output Format
```yaml
stage_1_deliverables:
  specifications:
    - ticket: [ID]
      spec_location: /Project_Management/Specs/[TICKET]_spec.md
      story_points: [1-5]
  execution_plan:
    location: /Project_Management/Sprint_Plans/Sprint_[N]_plan.md
    batches: [...]
    dependencies: [...]
  context_packages:
    - batch: [1]
      context: [...]
  github_tickets: [Created ticket IDs]
  project_board: [Board URL]
```

## Stage Transition

### Moving to Stage 2
When Stage 1 is complete:
1. All specifications written
2. Execution plan with DAG created
3. Edge cases and fallbacks documented
4. GitHub tickets created
5. Project board configured
6. Context packages ready

### Handoff to Stage 2
Location: `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/stage1_to_stage2_sprint_[N].md`

Must include:
- Complete specification links
- Execution plan with dependencies
- Context packages per batch
- Decision log
- Risk assessment

## Special Considerations

### Ticket Splitting Rules
If ticket >5 points:
1. Identify logical separation points
2. Ensure each sub-ticket is independent
3. Maintain clear dependencies
4. Update execution plan

### Context Package Contents
Each package must include:
1. Files to read (with paths)
2. Patterns to follow (with examples)
3. Dependencies available
4. Decisions made (no choices needed)
5. Edge case handlers
6. Fallback strategies

---

*Context for STAD Protocol Stage 1 - Sprint Preparation*