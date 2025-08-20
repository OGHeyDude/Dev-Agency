# STAD-003 Specification: Align Tester Agent with STAD Stage 2 (Sprint Execution)

**Ticket ID:** STAD-003  
**Story Points:** 3  
**Epic:** Prompt Engineering  
**Sprint:** 8  
**Created:** 08-12-2025  
**Updated:** 08-17-2025  
**STAD Stage Focus:** Stage 1 (Sprint Preparation)

---

## Description

Update the Tester Agent to focus specifically on Stage 2 (Sprint Execution) of STAD Protocol v5.1. The agent must work alongside the Coder Agent, understand test organization rules, coverage requirements, and create agent handoff reports for comprehensive test coverage and quality assurance.

## Current State

The Tester Agent currently handles testing tasks but lacks:
- Specific STAD Stage 2 focus for parallel execution with Coder Agent
- Clear STAD test organization rules and folder structure
- Agent handoff report templates for Stage 2 collaboration
- Understanding of Stage 1 specification-driven testing
- Autonomous testing execution without clarification needs

## Acceptance Criteria

- [ ] Tester Agent prompt updated to focus on STAD Stage 2 (Sprint Execution)
- [ ] Agent works in parallel with Coder Agent based on Stage 1 specifications
- [ ] Agent understands STAD test file organization (`/tests/` structure)
- [ ] Agent knows coverage requirements (enterprise-grade standards)
- [ ] Agent creates standardized agent handoff reports
- [ ] Agent knows where to save handoffs (`/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`)
- [ ] Agent identifies and documents test scenarios from Stage 1 specs
- [ ] Agent operates autonomously without Stage 1 clarification
- [ ] Updated prompt enables Stage 2 autonomous test execution

## STAD Implementation Approach

This ticket implements changes to align the Tester Agent with STAD Protocol v5.1 Stage 2 (Sprint Execution). The implementation focuses on:

1. **Parallel Execution**: Agent works alongside Coder Agent in Stage 2
2. **Specification-Driven Testing**: Creates tests based on Stage 1 comprehensive specs
3. **Agent Handoff Generation**: Creates reports for Stage 3 validation
4. **STAD Compliance**: Follows folder structure and enterprise testing standards

### Implementation Tasks
- Review current tester.md file and identify STAD alignment gaps
- Design new prompt structure for STAD Stage 2 parallel execution
- Update tester.md with STAD-aligned prompt for autonomous testing
- Create agent handoff report templates for test results
- Add STAD test organization rules and folder structure
- Implement enterprise-grade coverage requirements
- Test with sample testing scenario to validate autonomous execution
- Validate handoff report quality and Stage 3 readiness
- Update agent documentation with STAD Stage 2 focus

## Dependencies

### Depends On:
- STAD-005 (Templates must be created first)
- STAD-006 (Folder organization rules must be defined)

### Blocks:
- None directly

## Agent Assignment

**Recommended Agent:** Coder Agent (with Main Claude orchestration)  
**Reason:** This is primarily a prompt engineering task

## Template Structure to Include

```markdown
# Test Results - [TICKET-ID]

## Input Received from Build
[Summary of implementation to test]

## Test Strategy
[Approach taken for testing]

## Tests Created
### Unit Tests
- `__tests__/[feature].test.ts` - [What it tests]
- Test cases: [number]
- Assertions: [number]

### Integration Tests
- `__tests__/[feature].integration.test.ts` - [What it tests]
- Scenarios covered: [list]

## Coverage Report
```
File             | % Stmts | % Branch | % Funcs | % Lines |
-----------------|---------|----------|---------|---------|
[module]/file.ts |   95.0  |   88.0   |  100.0  |   95.0  |
Overall          |   87.5  |   82.0   |   91.0  |   87.5  |
```

## Edge Cases Tested
1. **Edge Case**: [Description]
   - Input: [What was tested]
   - Expected: [Behavior]
   - Result: [Pass/Fail]

2. **Edge Case**: [Description]
   - Input: [What was tested]
   - Expected: [Behavior]
   - Result: [Pass/Fail]

## Test Execution Results
- Total Tests: [number]
- Passed: [number]
- Failed: [number]
- Skipped: [number]
- Duration: [time]

## Micro-Reflection
### Testing Insights
- [What was learned about the feature through testing]
- [Unexpected behavior discovered]

### Coverage Gaps
- [Areas that need more testing]
- [Why coverage target wasn't met, if applicable]

### Edge Cases Discovered
- [Edge cases found during testing]
- [Edge cases that should be tested in future]

### Test Quality Assessment
- Test maintainability: [Assessment]
- Test clarity: [Assessment]
- Test value: [Assessment]

### Recommendations
- [Testing patterns that worked well]
- [Areas needing better test strategies]
```

## Success Metrics

- Tester Agent consistently achieves 80%+ coverage
- Tests are organized in correct folders
- Edge cases are identified and tested
- Test results include all required sections
- Micro-reflections provide testing insights
- No implementation work done by Tester

## Notes

- Focus on test quality over quantity
- Emphasize edge case discovery
- Keep agent focused on testing only
- Coverage is important but not the only metric