---
title: Sprint Management Recipe
description: Master strategic playbook for themed sprint planning and orchestration
type: recipe
category: orchestration
tags: [sprint, management, planning, themes, orchestration]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: test
---

# Sprint Management Recipe

## Overview
Master strategic playbook for sprint planning and orchestration. Enforces complete development cycle: Research → Plan → Develop → Test → Document → Track → Commit. Supports themed sprints for focused, quality-driven development.

## Philosophy
"Strategic focus with tactical flexibility" - Define sprint themes for clarity while letting agents use their capabilities to achieve goals.

## Sprint Themes
- **Development:** Mix of features (70%) and critical bugs (30%)
- **Bug Bash:** Focused bug resolution sprint
- **Refactoring:** Technical debt reduction
- **Database:** Schema changes and migrations
- **Documentation:** Documentation improvement and standardization

---

## Phase 1: Theme Selection & Context Loading

**Goal:** Determine sprint focus and load complete project context

**Process:**
1. Present theme selection to user:
   - Development Sprint (standard feature/bug mix)
   - Bug Bash Sprint (stability focus)
   - Refactoring Sprint (technical debt)
   - Database Sprint (schema/migration work)
   - Documentation Sprint (doc improvement)

2. Load essential context:
   - Read PROJECT_CONTEXT.md for technical landscape
   - Review PROJECT_PLAN.md for backlog and velocity
   - Check previous sprint metrics and patterns
   - Establish theme-specific success criteria

**Output:** Sprint theme with constraints and full context

---

## Phase 2: Intelligent Ticket Selection

**Goal:** Curate tickets matching theme and capacity

**Agent:** `/agent:architect`

**Context Package:**
- Sprint theme and its constraints
- Complete PROJECT_CONTEXT.md (tech stack, architecture, business goals)
- Current backlog from PROJECT_PLAN.md
- Velocity data (target: 30-35 story points)
- Previous sprint patterns and blockers

**Selection Strategy by Theme:**
- **Development:** Balance features (70%) with critical bugs (30%), prioritize business value
- **Bug Bash:** Only bug tickets, ordered by severity and user impact
- **Refactoring:** Technical debt tickets ranked by ROI and risk reduction
- **Database:** Schema changes and migrations with dependency ordering
- **Documentation:** Doc tickets prioritized by user impact and completeness gaps

**Output:** Curated ticket list with selection rationale

---

## Phase 3: Comprehensive Spec Validation

**Goal:** Ensure all selected tickets have complete specifications

**Process:**
1. Check each ticket for existing spec in /Project_Management/Specs/
2. For tickets without complete specs:
   - **Agent:** `/agent:documenter`
   - **Context:** Ticket requirements, acceptance criteria template, existing patterns
   - **Generate:** Complete spec with testable criteria
3. Validate all specs include:
   - Clear acceptance criteria
   - Technical approach notes
   - Integration requirements
   - Success metrics

**Output:** All tickets have validated, complete specifications

---

## Phase 4: Strategic Implementation Planning

**Goal:** Create optimal execution sequence with parallelization

**Agent:** `/agent:architect`

**Context Package:**
- All tickets with complete specs
- Technical dependencies from PROJECT_CONTEXT.md
- Risk assessment for each ticket
- Available agent specializations
- Parallelization opportunities

**Planning Considerations:**
- Dependency ordering (blockers first)
- Risk balancing (mix high/low risk)
- Resource optimization (parallel where possible)
- Quality gate scheduling

**Output:** Implementation sequence with agent assignments

---

## Phase 5: Sprint Plan Generation

**Goal:** Produce executable sprint plan document

**Format:**
```markdown
# Sprint [N] Execution Plan
Theme: [Selected Theme]
Points: [Total Story Points]
Duration: [Start Date] - [End Date]

## Execution Sequence
| Priority | Ticket ID | Title | Points | Recipe | Dependencies | Primary Agent |
|----------|-----------|-------|--------|--------|--------------|---------------|
| 1 | TICKET-001 | [Title] | 5 | tdd_feature_recipe | None | coder |
| 2 | BUG-001 | [Title] | 3 | bug_fix_recipe | None | tester→coder |
| 3 | TICKET-002 | [Title] | 8 | tdd_feature_recipe | TICKET-001 | coder |

## Quality Gates
- [ ] All specs validated before development
- [ ] Test coverage >80% for new code
- [ ] Documentation updated for all changes
- [ ] PROJECT_CONTEXT.md updated if architecture changes
- [ ] All tickets tracked in PROJECT_PLAN.md
```

**Output:** Complete sprint plan ready for execution

---

## Phase 6: Sprint Execution & Management

**Goal:** Execute entire sprint automatically after user approval

**Trigger:** User approves sprint plan from Phase 5

**Execution Process:**
1. **Load Sprint Plan**
   - Parse execution sequence from Phase 5
   - Initialize progress tracking
   - Set up sprint dashboard

2. **Automatic Ticket Orchestration**
   ```
   For each ticket in priority order:
     a. Verify dependencies complete
     b. Select appropriate recipe:
        - Feature tickets → tdd_feature_recipe.md
        - Bug tickets → bug_fix_recipe.md
        - Refactoring → refactoring_workflow.md
        - Database → database_migration_recipe.md
        - Documentation → documentation_standardization.md
     c. Execute recipe phases automatically
     d. Update PROJECT_PLAN.md status
     e. Report progress to user
     f. Handle any blockers
   ```

3. **Progress Management**
   - Update ticket status in real-time
   - Track story points completed
   - Monitor velocity against plan
   - Report blockers immediately

4. **Blocker Handling**
   - If blocked: Pause ticket, document issue, move to next
   - If critical blocker: Alert user for intervention
   - If dependencies fail: Re-sequence remaining tickets

**Progress Reporting Format:**
```markdown
## Sprint Progress Update
Completed: 3/8 tickets (12/31 points)
Current: TICKET-004 (Phase 3: Implementation)
Next: TICKET-005
Blockers: None
Velocity: On track
```

**Output:** Fully executed sprint with all tickets complete

---

## Success Criteria

- [ ] Theme-appropriate tickets selected
- [ ] All tickets within capacity (30-35 points)
- [ ] Complete specs for every ticket
- [ ] Dependencies properly sequenced
- [ ] Recipe assignments match ticket types
- [ ] Quality gates clearly defined
- [ ] Automatic execution after approval
- [ ] Progress tracked and reported

---

## Usage

```bash
/sprint-themed             # Complete sprint workflow
  → Phases 1-5: Planning & preparation
  → User approval checkpoint
  → Phase 6: Automatic sprint execution
  → Continuous progress updates
  → Sprint completion report

/sprint-execute [TICKET]   # Ad-hoc ticket execution (outside sprint)
  → For urgent fixes or unplanned work
  → Uses same strategic recipes
  → Standalone execution

/sprint-status             # View current sprint progress
  → Shows completed/in-progress/blocked
  → Displays velocity tracking
  → Lists remaining work

/sprint-complete           # Validate and close sprint
  → Final quality checks
  → Generate sprint report
  → Archive sprint artifacts
```

---

## Notes
- This recipe orchestrates the ENTIRE sprint after approval
- No manual intervention needed between tickets
- Each execution recipe is self-contained
- Theme selection drives entire sprint character
- Quality enforcement through strategic phases, not tactical commands
- Clear separation between sprint work and ad-hoc tasks