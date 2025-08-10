---
title: Bug Fix Recipe
description: Strategic recipe for systematic bug resolution with root cause analysis
type: recipe
category: maintenance
tags: [bug, fix, debugging, testing, maintenance]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: test
---

# Bug Fix Recipe

## Overview
Strategic recipe for systematic bug resolution. Focuses on root cause analysis, comprehensive testing, and regression prevention. Self-contained with pre-condition validation.

## Philosophy
"Fix the cause, not the symptom" - Understand the true source of bugs and implement robust solutions that prevent recurrence.

---

## Phase 1: Pre-condition Validation

**Goal:** Ensure bug report is complete and actionable

**Checks:**
1. Bug report includes reproduction steps
2. Error messages or logs are available
3. Expected vs. actual behavior documented
4. Environment details specified
5. Priority and severity assessed

**Process:**
- If bug report incomplete:
  - Gather missing information from reporter
  - Attempt reproduction in test environment
  - Document findings in bug report
- If cannot reproduce:
  - Request additional context
  - Check environment-specific factors
  - Consider closing as "Cannot Reproduce"

**Output:** Complete, reproducible bug report

---

## Phase 2: Root Cause Analysis

**Goal:** Identify the true source of the bug

**Agent:** `/agent:tester`

**Context Package:**
- Complete bug report with reproduction steps
- Related code areas (identified through error messages)
- Recent commits to affected code
- System logs and error traces
- Related test cases (passing and failing)

**Analysis Strategy:**
- Reproduce bug consistently
- Trace execution flow
- Identify point of failure
- Determine why failure occurs
- Check for related issues

**Output:** Root cause identification with evidence

---

## Phase 3: Fix Design

**Goal:** Design a robust solution that addresses root cause

**Agent:** `/agent:architect`

**Context Package:**
- Root cause analysis results
- Current implementation details
- Architecture constraints from PROJECT_CONTEXT.md
- Related code patterns
- Performance and security requirements

**Design Considerations:**
- Minimal change principle
- Backward compatibility
- Performance impact
- Security implications
- Potential side effects

**Output:** Solution design with implementation approach

---

## Phase 4: Fix Implementation

**Goal:** Implement the solution with comprehensive testing

**Agent:** `/agent:coder`

**Context Package:**
- Solution design from architect
- Root cause analysis details
- Existing code patterns to follow
- Test cases to satisfy
- Regression prevention requirements

**Implementation Requirements:**
- Write tests that reproduce the bug (Red)
- Implement fix to pass tests (Green)
- Add regression tests
- Ensure no new bugs introduced
- Follow existing code patterns

**Output:** Bug fix with comprehensive test coverage

---

## Phase 5: Validation & Testing

**Goal:** Ensure fix completely resolves issue without regressions

**Agent:** `/agent:tester`

**Validation Process:**
1. Verify original bug is fixed
2. Run all existing tests (regression check)
3. Test edge cases around the fix
4. Performance impact assessment
5. Security implications review

**Test Coverage:**
- Original bug scenario
- Related functionality
- Edge cases
- Performance benchmarks
- Integration points

**Output:** Validation report confirming fix effectiveness

---

## Phase 6: Documentation & Tracking

**Goal:** Update documentation and project tracking

**Documentation Updates:**
1. Update bug report with:
   - Root cause explanation
   - Solution implemented
   - Tests added
   - Validation results

2. Update PROJECT_PLAN.md:
   - Mark bug ticket as DONE
   - Add resolution notes

3. Update PROJECT_CONTEXT.md if:
   - Bug revealed architectural issues
   - New patterns established
   - Constraints identified

4. Create knowledge base entry if:
   - Bug likely to recur
   - Solution establishes new pattern
   - Learning opportunity identified

**Output:** Complete documentation and tracking

---

## Phase 7: Commit & Communication

**Goal:** Commit fix and communicate resolution

**Commit Process:**
1. Stage all changes including tests
2. Create descriptive commit message
3. Reference bug ticket ID

**Commit Message Format:**
```
fix(BUG-ID): [Brief description of fix]

Root cause: [What caused the bug]
Solution: [How it was fixed]
Tests: [What tests were added]

Closes #BUG-ID
```

**Communication:**
- Notify bug reporter of resolution
- Update any affected documentation
- Share learnings with team if applicable

**Output:** Bug fixed, committed, and communicated

---

## Quality Gates

- [ ] Bug is reproducible before starting
- [ ] Root cause identified with evidence
- [ ] Fix includes regression tests
- [ ] All existing tests still pass
- [ ] No performance degradation
- [ ] Bug report updated with resolution
- [ ] PROJECT_PLAN.md updated
- [ ] Proper commit message with context

---

## Notes
- Focus on understanding "why" before fixing
- Tests are as important as the fix itself
- Document learnings for future reference
- Consider broader implications of bugs