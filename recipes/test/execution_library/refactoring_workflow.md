---
title: Refactoring Workflow Recipe
description: Strategic recipe for systematic technical debt reduction and code quality improvement
type: recipe
category: maintenance
tags: [refactoring, technical-debt, code-quality, optimization]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: test
---

# Refactoring Workflow Recipe

## Overview
Strategic recipe for systematic refactoring and technical debt reduction. Focuses on improving code quality, maintainability, and performance while ensuring zero functional regression. Self-contained with impact analysis.

## Philosophy
"Leave the code better than you found it" - Improve structure, readability, and maintainability without changing external behavior.

---

## Phase 1: Technical Debt Assessment

**Goal:** Identify and prioritize refactoring opportunities

**Process:**
1. Analyze code metrics (complexity, duplication, coupling)
2. Review accumulated TODOs and FIXMEs
3. Identify performance bottlenecks
4. Assess maintainability issues
5. Calculate refactoring ROI

**Context Sources:**
- Code quality reports
- Performance profiles
- Team feedback on pain points
- PROJECT_CONTEXT.md for architectural goals
- Recent bug patterns

**Output:** Prioritized refactoring targets with impact scores

---

## Phase 2: Impact Analysis & Safety Net

**Goal:** Understand scope and ensure safe refactoring

**Agent:** `/agent:architect`

**Context Package:**
- Refactoring targets with current implementation
- Dependency graph showing affected components
- Existing test coverage analysis
- Performance baselines
- Architecture constraints from PROJECT_CONTEXT.md

**Analysis Requirements:**
- Map all dependencies and consumers
- Identify missing test coverage
- Assess breaking change risks
- Determine rollback strategy
- Plan incremental approach

**Output:** Refactoring plan with safety measures

---

## Phase 3: Test Harness Creation

**Goal:** Build comprehensive safety net before refactoring

**Agent:** `/agent:tester`

**Context Package:**
- Current implementation to be refactored
- Existing test examples from codebase
- Edge cases and boundary conditions
- Performance benchmarks
- Integration points

**Test Coverage Strategy:**
- Characterization tests for current behavior
- Edge case coverage
- Performance benchmarks
- Integration tests
- Regression test suite

**Output:** Complete test harness with baseline metrics

---

## Phase 4: Incremental Refactoring

**Goal:** Improve code systematically while maintaining green tests

**Agent:** `/agent:coder`

**Context Package:**
- Refactoring plan from architect
- Complete test harness
- Target patterns and best practices
- Performance requirements
- Code style guidelines

**Refactoring Techniques:**
- Extract methods/classes
- Eliminate duplication
- Simplify complex logic
- Improve naming
- Apply design patterns
- Optimize algorithms

**Constraints:**
- All tests must remain green
- No external API changes
- Performance must not degrade
- Incremental commits

**Output:** Refactored code with improved quality metrics

---

## Phase 5: Performance Validation

**Goal:** Ensure refactoring maintains or improves performance

**Agent:** `/agent:performance`

**Validation Process:**
1. Run performance benchmarks
2. Compare with baseline metrics
3. Profile memory usage
4. Check response times
5. Validate resource consumption

**Performance Criteria:**
- No regression in critical paths
- Memory usage stable or improved
- Response times within SLA
- Resource efficiency maintained
- Scalability characteristics preserved

**Output:** Performance validation report

---

## Phase 6: Code Review & Documentation

**Goal:** Ensure quality and document improvements

**Review Focus:**
1. **Design Review - Agent:** `/agent:architect`
   - Validate architectural improvements
   - Check pattern applications
   - Review abstraction levels

2. **Documentation Updates:**
   - Update inline documentation
   - Document design decisions
   - Update PROJECT_CONTEXT.md with new patterns
   - Create ADR if significant changes

**Output:** Reviewed code with complete documentation

---

## Phase 7: Tracking & Knowledge Capture

**Goal:** Update project tracking and preserve learnings

**Process:**
1. Update PROJECT_PLAN.md:
   - Mark refactoring ticket as DONE
   - Document improvements achieved
   - Record metrics improvements

2. Knowledge capture:
   - Document refactoring patterns used
   - Record before/after metrics
   - Share learnings for future

3. Memory sync:
   - Sync improved patterns
   - Update knowledge graph

**Commit Message Format:**
```
refactor(TICKET-ID): [Component refactored]

- Reduced complexity from X to Y
- Eliminated code duplication
- Improved performance by Z%
- Added comprehensive tests

Technical debt reduced: [Description]
```

**Output:** Complete tracking and knowledge preservation

---

## Quality Gates

- [ ] All existing tests still passing
- [ ] New characterization tests added
- [ ] Code complexity reduced
- [ ] No performance regression
- [ ] Zero functional changes
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Metrics improved

---

## Common Refactoring Patterns

### Code Smells to Address
- Long methods → Extract method
- Large classes → Extract class
- Duplicate code → Extract shared component
- Complex conditionals → Polymorphism/Strategy
- Feature envy → Move method
- Data clumps → Extract parameter object

### Improvement Metrics
- Cyclomatic complexity reduction
- Test coverage increase
- Duplication percentage decrease
- Coupling reduction
- Cohesion improvement

---

## Notes
- Always refactor with tests as safety net
- Make incremental, reversible changes
- Focus on high-impact improvements
- Document the "why" behind changes
- Consider team familiarity with patterns