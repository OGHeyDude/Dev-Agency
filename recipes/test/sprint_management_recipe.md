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

## Phase 6: Sprint Execution & Management (DETAILED)

**Goal:** Execute entire sprint automatically after user approval with full development cycle enforcement

**Trigger:** User approves sprint plan from Phase 5

### File Management Guidelines
```markdown
## File Organization During Sprint
- Temporary/working files → `/Project_Management/temp/`
- Test files → `/src/[module]/__tests__/`
- User documentation → `/docs/[category]/`
- Development docs → `/docs/development/[category]/`
- Sprint artifacts → `/Project_Management/Sprint Retrospectives/`
```

### Recipe Selection Matrix
| Ticket Type/Keywords | Recipe to Use | Test Location | Doc Location |
|---------------------|---------------|---------------|--------------|
| Agent Development | tdd_feature_recipe | /src/agents/__tests__/ | /docs/agents/ |
| Analytics/Dashboard | tdd_feature_recipe | /src/analytics/__tests__/ | /docs/features/analytics/ |
| Intelligence/Learning | tdd_feature_recipe | /src/learning/__tests__/ | /docs/development/ai/ |
| Integration | tdd_feature_recipe | /src/integrations/__tests__/ | /docs/integrations/ |
| Orchestration/System | tdd_feature_recipe | /src/system/__tests__/ | /docs/development/architecture/ |
| Bug Fix | bug_fix_recipe | Near bug location | Update existing docs |
| Refactoring | refactoring_workflow | Existing test location | Update affected docs |
| Database | database_migration_recipe | /src/database/__tests__/ | /docs/development/deployment/ |
| Documentation | documentation_standardization | N/A | /docs/[appropriate category]/ |

### Detailed Execution Process

**FOR EACH TICKET IN SPRINT:**

#### Step 1: Initialize Ticket
```bash
# Read ticket specification
Read /Project_Management/Specs/[TICKET-ID]_spec.md

# Update status: TODO → IN_PROGRESS
Edit PROJECT_PLAN.md

# Create workspace
mkdir -p /Project_Management/temp/[TICKET-ID]/

# Report: "Starting [TICKET-ID]: [Title]"
```

#### Step 2: Test Creation Phase (BLOCKING CHECKPOINT)
```bash
# Select test location based on ticket type
# Create test file BEFORE implementation
Write /src/[module]/__tests__/[ticket-id].test.ts

# Test structure MUST include:
- At least one test per acceptance criteria
- Clear test descriptions
- Proper setup and teardown

# Run tests to confirm they FAIL
Bash npm test [module]

# Save output
Bash npm test > /Project_Management/temp/[TICKET-ID]/test-red.log
```

🛑 **BLOCKING VALIDATION - CANNOT PROCEED WITHOUT:**
- [ ] Test file exists at `/src/[module]/__tests__/[ticket-id].test.ts`
- [ ] Tests written for ALL acceptance criteria from spec
- [ ] Tests run and FAIL (Red state confirmed)
- [ ] Test failure output saved to temp folder
- [ ] No syntax errors in test file

**Validation Command:** Internal validation (no user command)

#### Step 3: Implementation Phase
```bash
# Create implementation based on failing tests
Write /src/[module]/[implementation].ts

# Follow TDD principle: Write minimum code to pass tests
# Use existing patterns from codebase
# Store any working files in /Project_Management/temp/[TICKET-ID]/

# MANDATORY: Commit checkpoint after implementation
Bash git add -A
Bash git commit -m "feat([TICKET-ID]): implement core functionality

- Add [key implementation details]
- Tests still failing, ready for validation

WIP: Implementation phase complete"
```

🛑 **COMMIT CHECKPOINT - CANNOT PROCEED WITHOUT:**
- [ ] Implementation code written and functional
- [ ] Code follows existing project patterns
- [ ] Working files stored in temp directory
- [ ] Implementation committed to git
- [ ] Commit message follows format

**Validation Command:** Internal validation (no user command)

**Status Update:** IN_PROGRESS → CODE_REVIEW

#### Step 4: Test Execution Phase (BLOCKING CHECKPOINT)
```bash
# Run tests again - they should now PASS
Bash npm test [module]

# Save results
Bash npm test > /Project_Management/temp/[TICKET-ID]/test-green.log

# Check test coverage
Bash npm run test:coverage [module]

# Run performance validation if specified
[If performance requirements exist, validate them]
```

🛑 **BLOCKING VALIDATION - CANNOT PROCEED WITHOUT:**
- [ ] ALL tests PASS (Green state confirmed)
- [ ] Test coverage >80% verified
- [ ] No test dependency issues
- [ ] Performance requirements met (if specified)
- [ ] Test output saved showing success
- [ ] No failing tests anywhere in module

**If Tests Fail:** Debug and fix until ALL pass - CANNOT proceed with failed tests

**Validation Command:** Internal validation (no user command)

**Status Update:** CODE_REVIEW → QA_TESTING

#### Step 5: Quality Checks (BLOCKING CHECKPOINT)
```bash
# Run linting
Bash npm run lint

# Run type checking  
Bash npm run typecheck

# Run security checks if available
Bash npm audit --audit-level=high

# Save quality check results
echo "Quality checks completed for [TICKET-ID]" > /Project_Management/temp/[TICKET-ID]/quality-check.log
```

🛑 **BLOCKING VALIDATION - CANNOT PROCEED WITHOUT:**
- [ ] Linting passes with zero errors
- [ ] Type checking passes with zero errors
- [ ] No high-severity security vulnerabilities
- [ ] Code follows project style guidelines
- [ ] Quality check results saved

**If Quality Checks Fail:** Fix ALL issues before proceeding - NO exceptions

**Validation Command:** Internal validation (no user command)

**Status Update:** QA_TESTING → DOCUMENTATION

#### Step 6: Documentation Phase (BLOCKING CHECKPOINT)
```bash
# Determine required documentation based on ticket type
# (See Documentation Requirements Matrix below)

# MANDATORY for all tickets:
Edit /Project_Management/Releases/Release_Notes.md
- Add ticket completion with key changes

# Create required docs based on ticket type
[Follow Documentation Requirements Matrix]

# Update README if API changes
IF public API changed:
  Update README.md with new features
```

🛑 **DOCUMENTATION REQUIREMENTS BY TICKET TYPE:**

### New Feature Tickets (PRIV-*, FEAT-*, AGENT-*):
**MANDATORY docs to create:**
- [ ] `/docs/api/[feature]-api.md` - API documentation
- [ ] `/docs/features/[feature]-guide.md` - User guide  
- [ ] Configuration section in relevant guide
- [ ] Integration example in `/docs/tutorials/`
- [ ] Update `/docs/guides/` index with links

### Integration Tickets (INTEG-*, CONNECT-*):
**MANDATORY docs to create:**
- [ ] `/docs/integrations/[service]-integration.md`
- [ ] Configuration guide
- [ ] Setup instructions
- [ ] Troubleshooting section

### Bug Fix Tickets (BUG-*, FIX-*):
**MANDATORY docs to update:**
- [ ] Update existing docs affected by fix
- [ ] Add troubleshooting section if needed
- [ ] Update configuration if changed

### Performance/System Tickets (PERF-*, SYSTEM-*):
**MANDATORY docs to create:**
- [ ] `/docs/development/performance/[topic].md`
- [ ] Update deployment guides
- [ ] Add monitoring instructions

🛑 **BLOCKING VALIDATION - CANNOT PROCEED WITHOUT:**
- [ ] ALL required docs created per ticket type above
- [ ] Inter-links added to related documentation
- [ ] Documentation follows project style guide
- [ ] Code examples tested and working
- [ ] Release notes updated with key changes
- [ ] No broken internal links

**Validation Command:** Internal validation (no user command)

**Status Update:** DOCUMENTATION → READY_FOR_RELEASE

#### Step 7: Ticket Completion (ULTIMATE BLOCKING CHECKPOINT)
```bash
# MANDATORY: Run complete validation before marking DONE
/validate-done [TICKET-ID]

# After validation passes, final commit
Bash git add -A
Bash git commit -m "feat([TICKET-ID]): complete [feature name]

✅ All acceptance criteria met
✅ Tests passing with [X]% coverage
✅ Documentation complete
✅ Quality gates passed

Closes #[TICKET-ID]

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

🛑 **ULTIMATE VALIDATION - CANNOT MARK DONE WITHOUT ALL:**

### Code Completeness
- [ ] Implementation complete and functional
- [ ] ALL acceptance criteria met from spec
- [ ] Code follows project patterns and standards
- [ ] No TODOs or debug code remaining

### Testing Requirements  
- [ ] Test files exist and ALL pass
- [ ] Test coverage >80% verified
- [ ] Performance requirements met (if specified)
- [ ] Integration tests pass
- [ ] No test dependency issues

### Documentation Requirements
- [ ] ALL required docs created per ticket type
- [ ] API docs exist (if new endpoints)
- [ ] User guides updated (if user-facing features)
- [ ] Configuration documented
- [ ] Inter-links added and working
- [ ] Release notes updated

### Version Control
- [ ] ALL code committed to git
- [ ] Commit messages follow proper format
- [ ] No uncommitted changes
- [ ] Final completion commit made

### Status Progression
- [ ] ALL intermediate statuses completed:
  - TODO → IN_PROGRESS → CODE_REVIEW → QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE
- [ ] PROJECT_PLAN.md updated
- [ ] Spec marked as implemented

**ONLY after ALL validations pass:**
```bash
Edit PROJECT_PLAN.md
Status: READY_FOR_RELEASE → DONE

# Progress report
"✅ Completed [TICKET-ID]: [Title] ([X] points)"
"Tests: [Y] passing | Coverage: [Z]% | All docs created | Fully committed"
```

**Validation Command:** Internal validation (no user command)

### Progress Tracking Template
```markdown
## Sprint Execution Log

### Current Ticket: [TICKET-ID]
- ✅ Spec reviewed
- ✅ Tests written: [file paths]
- ✅ Implementation complete: [file paths]  
- ✅ Tests passing: X/Y tests
- ✅ Quality checks passed
- ✅ Documentation updated: [files]
- ✅ Status: DONE

### Sprint Progress
- Completed: X/Y tickets (A/B points)
- Current velocity: On track/Behind/Ahead
- Tests written: X files, Y test cases
- Test coverage: Z%
- Blockers: None/[List]
```

### Mandatory Checkpoints
🛑 **CHECKPOINT 1: Before Implementation**
- Confirm: Spec exists and is complete
- Confirm: Test files created with failing tests
- Show: Test file paths and failure output

🛑 **CHECKPOINT 2: After Implementation**
- Confirm: Implementation complete
- Run: Test suite
- Show: All tests passing
- Cannot proceed if tests fail

🛑 **CHECKPOINT 3: Before marking DONE**
- Confirm: Quality checks passed (lint, typecheck)
- Confirm: Documentation updated
- Confirm: All status transitions complete
- Show: Updated PROJECT_PLAN.md entry

### Sprint Completion Checklist (BLOCKING)
🛑 **SPRINT CANNOT BE MARKED COMPLETE UNTIL ALL VALIDATED:**

#### Ticket Validation
- [ ] ALL tickets show complete status progression (no TODO→DONE jumps)
- [ ] `/validate-done` passed for every ticket
- [ ] No tickets marked DONE without full validation
- [ ] All specs marked as implemented

#### Code Quality Validation
- [ ] ALL test suites passing (no exceptions)
- [ ] Test coverage >80% for all new code
- [ ] No dependency issues in any tests
- [ ] Performance benchmarks met for all tickets

#### Documentation Validation
- [ ] ALL required docs created per ticket type
- [ ] User-facing docs exist for all new features
- [ ] API docs complete for all new endpoints
- [ ] Configuration guides updated
- [ ] Integration examples provided
- [ ] No broken documentation links

#### Version Control Validation
- [ ] ALL changes committed with proper messages
- [ ] No uncommitted files anywhere
- [ ] All commit messages follow format
- [ ] Final sprint commit prepared

#### Process Compliance Validation
- [ ] Definition of Done verified for ALL tickets
- [ ] All quality gates passed
- [ ] All validation commands ran successfully

**Validation Command:** Internal validation (no user command)

**ONLY after ALL validations pass:** Execute sprint commit and retrospective

**Output:** Fully executed sprint with complete development cycle for all tickets

---

## Phase 7: Sprint Retrospective & Closure

**Goal:** Capture learnings, celebrate successes, and prepare for next sprint

**Trigger:** All sprint tickets marked as DONE

### Sprint Commit
```bash
# Review all changes
Bash git status
Bash git diff --stat

# Prepare commit message from Release Notes
Read /Project_Management/Releases/Release_Notes.md

# Create comprehensive sprint commit
Bash git add -A
Bash git commit -m "feat(Sprint-[N]): [Sprint theme and summary]

[List of completed tickets and key features]

Co-Authored-By: Claude <noreply@anthropic.com>"

# Clear Release Notes for next sprint
Edit /Project_Management/Releases/Release_Notes.md
```

### Generate Retrospective
```bash
# Copy retrospective template
cp /docs/reference/templates/Sprint\ Retrospective\ Template.md \
   /Project_Management/Sprint\ Retrospectives/Sprint_[N]_Retrospective.md

# Fill in retrospective with:
- Sprint metrics (velocity, test coverage, etc.)
- Completed tickets and their impact
- Process compliance checklist
- Identified improvements
- Lessons learned
```

### Retrospective Contents to Capture
1. **What Went Well:**
   - Successful patterns used
   - Process improvements that worked
   - Technical achievements

2. **What Didn't Go Well:**
   - Skipped steps (if any)
   - Blockers encountered
   - Process gaps identified

3. **Metrics Analysis:**
   - Planned vs Actual velocity
   - Test coverage achieved
   - Documentation completeness
   - Status transition compliance

4. **Action Items:**
   - Recipe improvements needed
   - Process adjustments
   - Tool/automation opportunities

### Archive Sprint Artifacts
```bash
# Move temp files to archive
mv /Project_Management/temp/[TICKET-*] \
   /Project_Management/Sprint\ Retrospectives/Sprint_[N]_artifacts/

# Update PROJECT_PLAN.md
- Move current sprint to "Previous Sprints"
- Clear current sprint section
- Update velocity metrics
```

**Output:** Complete sprint with retrospective, commit, and archived artifacts

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
- [ ] All tests written and passing
- [ ] Documentation complete
- [ ] Sprint committed to git
- [ ] Retrospective captured

---

## Usage

```bash
/sprint-plan <instructions>  # Sprint planning with optional instructions
  → Phases 1-5: Planning & preparation
  → User approval checkpoint
  → Ready for execution

/execute                    # Sprint execution (autonomous)
  → Automatic sprint execution
  → Continuous progress updates
  → Complete until 100% done

/sprint-status             # View current sprint progress
  → Shows completed/in-progress/blocked
  → Displays velocity tracking
  → Lists remaining work

/validate                  # Sprint validation
  → Check all tickets against Definition of Done
  → Complete any unfinished work
  → Prepare for approval

/sprint-approved           # Release & retrospective
  → Final quality checks
  → Generate retrospective
  → Commit and sync memory
```

---

## Notes
- This recipe orchestrates the ENTIRE sprint after approval
- No manual intervention needed between tickets
- Each execution recipe is self-contained
- Theme selection drives entire sprint character
- Quality enforcement through strategic phases, not tactical commands
- Clear separation between sprint work and ad-hoc tasks