---
title: Stage 2 to Stage 3 Gate Criteria
description: Quality gate requirements for transitioning from Sprint Execution to Sprint Validation
type: gate-criteria
category: stad
tags: [stage-gate, validation, stage-2, stage-3]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# Stage Gate: Stage 2 → Stage 3

## Gate Purpose
Ensure all development work is complete and technically validated before human review and quality assurance.

## Mandatory Criteria (All Must Pass)

### ✅ Implementation Complete
- [ ] All sprint tickets implemented
- [ ] All code committed to feature branch
- [ ] No incomplete work items
- [ ] All TODOs resolved
- [ ] Debug code removed

### ✅ Automated Testing (Frontend & Backend)
- [ ] Frontend unit tests passing (100%)
- [ ] Frontend integration tests passing
- [ ] Frontend coverage >85%
- [ ] Backend unit tests passing (100%)
- [ ] Backend integration tests passing
- [ ] Backend coverage >85%
- [ ] No skipped tests
- [ ] Regression tests for all bugs

### ✅ Code Quality
- [ ] Linting: 0 errors, 0 warnings
- [ ] Type checking passes (if applicable)
- [ ] No hardcoded values
- [ ] Code follows project standards
- [ ] Security scan clean (no high/critical)

### ✅ Documentation
- [ ] Code comments for complex logic
- [ ] API documentation current
- [ ] README updated if needed
- [ ] Configuration documented
- [ ] Migration guides if required

### ✅ Handoff Completeness
- [ ] All agent handoffs documented
- [ ] Work reports filed for each ticket
- [ ] Decision requests resolved
- [ ] Known issues documented
- [ ] Performance metrics recorded

## Technical Validation Checks

### 🔍 Build Validation
```bash
# Clean build from scratch
rm -rf node_modules dist
npm install
npm run build
# Must complete without errors
```

### 🔍 Test Suite Validation
```bash
# Full test suite with coverage
npm run test:coverage

# Expected output:
# - All tests passing
# - Coverage >80%
# - No console errors
# - No unhandled promises
```

### 🔍 Security Validation
```bash
# Security audit
npm audit

# Expected: 
# 0 critical vulnerabilities
# 0 high vulnerabilities
# <5 moderate vulnerabilities

# OWASP scan (if configured)
npm run security:scan
```

### 🔍 Performance Validation
```bash
# Performance benchmarks
npm run benchmark

# Criteria:
# - API response <200ms
# - Memory usage <500MB
# - CPU usage <70%
# - Bundle size within limits
```

## Commit Quality Standards

### Semantic Commit Validation
All commits must follow format:
```
type(scope): TICKET-XXX: Description

- type: feat|fix|docs|style|refactor|test|chore
- scope: Component/module affected
- TICKET-XXX: Valid ticket reference
- Description: Clear and concise
```

### Commit Checklist
- [ ] All commits reference tickets
- [ ] Commit messages descriptive
- [ ] No merge commits in feature branch
- [ ] Linear history maintained
- [ ] No experimental commits

## Integration Validation

### Cross-Ticket Dependencies
- [ ] Shared components working
- [ ] API contracts honored
- [ ] Database migrations clean
- [ ] No breaking changes
- [ ] Backward compatibility maintained

### End-to-End Flows
- [ ] User workflows functional
- [ ] Data persistence working
- [ ] Error handling effective
- [ ] Performance acceptable
- [ ] Security measures active

## Gate Validation Process

### Automated Pipeline
```yaml
# GitHub Actions workflow
validation_pipeline:
  - step: lint
    must_pass: true
    command: npm run lint
    
  - step: typecheck
    must_pass: true
    command: npm run typecheck
    
  - step: test
    must_pass: true
    command: npm test
    
  - step: coverage
    must_pass: true
    threshold: 80
    
  - step: security
    must_pass: true
    command: npm audit
    
  - step: build
    must_pass: true
    command: npm run build
```

### Manual Checklist
1. **Code Review**
   - Logic correct?
   - Patterns followed?
   - No obvious bugs?

2. **Documentation Review**
   - User-facing docs updated?
   - Technical docs current?
   - Examples working?

3. **Integration Review**
   - Features integrated?
   - No conflicts?
   - Clean merges possible?

## Common Failures and Resolutions

### Test Failures
| Issue | Cause | Resolution |
|-------|-------|------------|
| Flaky tests | Timing/async issues | Add proper waits/mocks |
| Coverage drops | New code untested | Add missing tests |
| Integration fails | Dependency changes | Update test fixtures |
| Snapshot fails | UI changes | Update snapshots if valid |

### Build Failures
| Issue | Cause | Resolution |
|-------|-------|------------|
| Type errors | API changes | Update type definitions |
| Import errors | Moved files | Update import paths |
| Lint errors | Style violations | Run auto-fix |
| Bundle too large | New dependencies | Optimize imports |

## Stage 3 Preparation

### Review Package Creation
```yaml
validation_package:
  summary:
    tickets_complete: 12/12
    points_delivered: 32
    test_coverage: 87%
    performance: "Meets targets"
    
  automated_results:
    linting: PASS
    tests: "142/142 passing"
    security: "Clean"
    build: "Success"
    
  manual_checklist:
    - [ ] Feature A works
    - [ ] Feature B works
    - [ ] Edge cases handled
    - [ ] Performance good
    
  artifacts:
    staging_url: "https://staging.example.com"
    test_report: "/reports/test-results.html"
    coverage_report: "/reports/coverage.html"
```

### Handoff to Backend QA
Location: `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/stage2_to_stage3_summary.md`

Must include:
- Implementation summary
- Test results
- Known issues
- Performance data
- Areas needing validation

## Gate Decision Matrix

| Criteria Met | Action | Next Step |
|-------------|--------|-----------|
| All Pass | **PROCEED** | Start Stage 3 validation |
| Minor Issues (<3 low) | **FIX AND PROCEED** | Quick fixes, then validate |
| Test Failures | **DEBUG** | Activate Debug Agent |
| Major Issues | **ITERATE** | Return to Stage 2 |

## Success Metrics

### Quality Metrics
- First-pass success: >85%
- Defect escape rate: <5%
- Test coverage: >80%
- Code review findings: <5 per 1000 LOC

### Efficiency Metrics
- Gate validation time: <30 minutes
- Auto-fix rate: >60%
- Rework rate: <10%
- Handoff completeness: 100%

## Escalation Protocol

### Severity Assessment
1. **Low**: Style/documentation issues → Fix and proceed
2. **Medium**: Minor bugs/test failures → Debug Agent fixes
3. **High**: Integration failures → Team review required
4. **Critical**: Security/data issues → Stop and escalate

### Debug Activation
When issues found:
1. Create bug report
2. Run git bisect to find cause
3. Activate Debug Agent
4. Fix with proper solution
5. Add regression test
6. Re-validate gate

---

*This gate ensures technical readiness before human validation*