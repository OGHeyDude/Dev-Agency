---
title: TDD Feature Recipe
description: Strategic recipe for test-driven feature development with full cycle enforcement
type: recipe
category: development
tags: [tdd, feature, development, testing, quality]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: test
---

# TDD Feature Recipe

## Overview
Strategic recipe for test-driven feature development. Enforces complete development cycle: Research → Plan → Develop → Test → Document → Track → Commit. Self-contained with pre-condition validation.

## Philosophy
"Red-Green-Refactor with strategic focus" - Define behavior through tests, implement minimally, then optimize for quality.

---

## Phase 1: Pre-condition Validation

**Goal:** Ensure ticket is ready for TDD development

**Checks:**
1. Complete spec exists in `/Project_Management/Specs/[TICKET-ID]_spec.md`
2. Acceptance criteria are testable and clear
3. Dependencies are resolved and accessible
4. PROJECT_CONTEXT.md is current

**Process:**
- If spec missing or incomplete:
  - **Agent:** `/agent:documenter`
  - **Context:** Ticket details, acceptance criteria template, project standards
  - **Action:** Generate complete spec before proceeding
- If dependencies blocked:
  - Return to sprint management for re-sequencing
  - Document blocker in PROJECT_PLAN.md

**Output:** Ticket validated and ready for development

---

## Phase 2: Research & Context Gathering

**Goal:** Understand existing patterns, constraints, and integration points

**Process:**
1. Analyze feature requirements from spec
2. Identify related code patterns in codebase
3. Review existing test structures and conventions
4. Understand integration requirements from PROJECT_CONTEXT.md
5. Identify potential risks and edge cases

**Context to Gather:**
- Feature spec with acceptance criteria
- Architecture patterns from PROJECT_CONTEXT.md
- Related code examples to follow
- Testing framework conventions
- Performance and security requirements

**Output:** Complete understanding of implementation context

---

## Phase 3: Test Design (Red Phase)

**Goal:** Create comprehensive failing tests that define feature behavior

**Agent:** `/agent:tester`

**Context Package:**
- Complete feature spec with acceptance criteria
- Existing test patterns from codebase (provide 2-3 examples)
- Testing framework and assertion libraries in use
- Edge cases and error scenarios to cover
- Performance benchmarks if applicable

**Test Coverage Requirements:**
- Happy path scenarios
- Edge cases and boundary conditions
- Error handling and validation
- Integration points
- Performance criteria (if specified)

**Output:** Comprehensive test suite with all tests failing (Red state)

---

## Phase 4: Implementation (Green Phase)

**Goal:** Write minimal code to make all tests pass

**Agent:** `/agent:coder`

**Context Package:**
- Failing test suite as behavioral specification
- Code patterns from similar features (provide examples)
- Architecture constraints from PROJECT_CONTEXT.md
- Performance and security standards
- Integration requirements

**Implementation Principles:**
- Write only enough code to pass tests
- Follow existing patterns consistently
- Maintain architectural boundaries
- Handle errors gracefully
- Consider performance implications

**Output:** Working implementation with all tests passing (Green state)

---

## Phase 5: Refactoring & Optimization

**Goal:** Improve code quality while maintaining all tests passing

**Process:**
1. **Design Review - Agent:** `/agent:architect`
   - Identify code smells and improvement opportunities
   - Suggest design patterns and abstractions
   - Review performance characteristics

2. **Refactoring Implementation - Agent:** `/agent:coder`
   - Apply architectural improvements
   - Eliminate duplication
   - Improve naming and clarity
   - Optimize performance hotspots

**Constraints:**
- All tests must remain passing
- No change to external behavior
- Maintain or improve performance
- Follow project coding standards

**Output:** Clean, maintainable, optimized code

---

## Phase 6: Documentation

**Goal:** Update all relevant documentation

**Agent:** `/agent:documenter`

**Documentation Updates:**
1. Mark spec as implemented in `/Project_Management/Specs/`
2. Update README.md if API or usage changed
3. Update PROJECT_CONTEXT.md if:
   - New architectural patterns introduced
   - Technology stack expanded
   - Integration points added
4. Add inline documentation for complex logic
5. Update user-facing documentation if applicable

**Output:** Complete, current documentation

---

## Phase 7: Progress Tracking & Commit

**Goal:** Update project tracking and commit changes

**Process:**
1. Update PROJECT_PLAN.md:
   - Change ticket status to DONE
   - Add completion notes
   - Update velocity metrics

2. Memory sync for knowledge preservation:
   - Sync implementation decisions
   - Capture patterns for future reference

3. Git commit:
   - Stage all changes
   - Create descriptive commit message
   - Reference ticket ID

**Commit Message Format:**
```
feat(TICKET-ID): [Brief description]

- Implemented [key functionality]
- Added comprehensive test coverage
- Updated documentation
- Follows TDD cycle

Closes #TICKET-ID
```

**Output:** Feature complete, tracked, and committed

---

## Quality Gates

- [ ] All tests passing with >80% coverage
- [ ] Code follows existing patterns
- [ ] No performance degradation
- [ ] Security standards met
- [ ] Documentation complete and current
- [ ] PROJECT_CONTEXT.md updated if needed
- [ ] Definition of Done satisfied
- [ ] Commit includes all changes

---

## Notes
- Pre-conditions ensure readiness before starting
- Each phase has clear goals without micromanaging tactics
- Agents receive context packages, not step-by-step instructions
- Quality gates enforce standards without prescribing implementation