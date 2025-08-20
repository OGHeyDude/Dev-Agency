---
title: Stage 0 Strategic Planning Context
description: Context template for agents operating in STAD Stage 0 (Strategic Planning)
type: context
category: stad
tags: [context, stage-0, strategic, planning, roadmap]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# Stage 0: Strategic Planning Context

## Stage Overview
**Stage 0** is the strategic planning phase where high-level vision and roadmap are defined. This is primarily human-driven with AI assistance for research and brainstorming.

## Agent Role in Stage 0
Agents in this stage act as **strategic advisors** and **research assistants**, helping to:
- Research technologies and approaches
- Analyze feasibility
- Estimate complexity
- Identify risks and dependencies

## Required Context Elements

### 1. Project Vision
```yaml
project_vision:
  purpose: [Why this project exists]
  target_users: [Who will use this]
  success_metrics: [How we measure success]
  constraints: [Technical, time, resource limits]
```

### 2. Current State Analysis
```yaml
current_state:
  existing_systems: [What already exists]
  pain_points: [Problems to solve]
  opportunities: [Areas for improvement]
  technical_debt: [Known issues to address]
```

### 3. Strategic Goals
```yaml
strategic_goals:
  short_term: [3-6 month objectives]
  medium_term: [6-12 month objectives]
  long_term: [12+ month vision]
  non_goals: [What we won't do]
```

## Stage 0 Deliverables

### Epic Definition Template
```markdown
## Epic: [Epic Name]

### Business Value
[Why this epic matters to the business]

### User Story
As a [user type]
I want [capability]
So that [benefit]

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

### Story Point Estimate
[13, 21, 34, 55+ points]

### Dependencies
- [Other epics or systems]

### Risks
- [Technical risks]
- [Business risks]
- [Resource risks]
```

## Quality Gates for Stage 0 → Stage 1

Before proceeding to Stage 1 (Sprint Preparation), ensure:
- [ ] Epic has clear business value
- [ ] Success metrics are defined and measurable
- [ ] Story point estimation completed
- [ ] Dependencies identified
- [ ] Stakeholder approval documented
- [ ] Resources allocated
- [ ] Technical feasibility validated

## Agent Instructions

### For Architect Agent
In Stage 0, focus on:
1. Technology stack recommendations
2. High-level architecture proposals
3. Risk assessment
4. Dependency analysis
5. Complexity estimation

### For Scrum Master Agent
In Stage 0, validate:
1. Epic completeness
2. Story point reasonableness
3. Resource availability
4. Dependency clarity
5. Stakeholder alignment

## Communication Protocols

### Input Format
```yaml
stage_0_request:
  type: [research|estimation|risk_analysis|feasibility]
  context:
    business_goals: [...]
    constraints: [...]
    existing_systems: [...]
  deliverable: [epic|roadmap|risk_assessment]
```

### Output Format
```yaml
stage_0_response:
  recommendations:
    - option: [...]
      pros: [...]
      cons: [...]
      effort: [story_points]
  risks:
    - risk: [...]
      probability: [high|medium|low]
      impact: [high|medium|low]
      mitigation: [...]
  dependencies:
    - system: [...]
      type: [hard|soft]
      notes: [...]
```

## Stage Transition

### Moving to Stage 1
When Stage 0 is complete:
1. Epic is fully defined with acceptance criteria
2. Story points estimated (Fibonacci scale)
3. Sprint can be carved from epic
4. Resources are available
5. Technical approach is clear

### Handoff to Stage 1
Location: `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/stage0_to_stage1_[EPIC].md`

Must include:
- Epic definition and goals
- Architectural recommendations
- Risk assessment
- Dependency map
- Resource allocation

---

*Context for STAD Protocol Stage 0 - Strategic Planning*