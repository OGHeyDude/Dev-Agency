---
title: Definition of Done
description: Blocking validation checklist - ticket cannot be marked DONE without ALL criteria met
type: guide
category: documentation
tags: [documentation, done, workflow, test, specs, commit, validation, enforcement]
created: 08-03-2025
updated: 2025-08-10
---

# **Definition of Done - BLOCKING VALIDATION**

🛑 **A ticket CANNOT be marked "DONE" until it passes ALL validation criteria below.**

**Use command: `/validate-done [TICKET-ID]` to verify ALL requirements before marking DONE.**

---

## 🛑 **BLOCKING VALIDATION CHECKLIST**

### **✅ Implementation Completeness**
- [ ] ALL tasks from ticket's Spec document complete
- [ ] ALL acceptance criteria met and verified
- [ ] Feature works exactly as specified
- [ ] Code is clean (no debug code, TODOs, or unused files)
- [ ] Follows existing project patterns and standards

### **✅ Test Requirements (MANDATORY)**
- [ ] Test files exist at `/src/[module]/__tests__/[ticket].test.ts`
- [ ] Tests written for ALL acceptance criteria
- [ ] ALL tests PASS (no exceptions)
- [ ] Test coverage >80% minimum (>95% for critical systems)
- [ ] No test dependency issues
- [ ] Performance requirements met (if specified)
- [ ] No broken existing functionality

### **✅ Documentation Requirements (BY TICKET TYPE)**

#### For New Features (PRIV-*, FEAT-*, AGENT-*):
- [ ] `/docs/api/[feature]-api.md` created
- [ ] `/docs/features/[feature]-guide.md` created
- [ ] Configuration guide updated
- [ ] Integration example provided
- [ ] Index files updated with links

#### For Integration Tickets (INTEG-*, CONNECT-*):
- [ ] `/docs/integrations/[service]-integration.md` created
- [ ] Setup instructions provided
- [ ] Configuration documented
- [ ] Troubleshooting section added

#### For Bug Fixes (BUG-*, FIX-*):
- [ ] Existing docs updated with fix details
- [ ] Troubleshooting section updated if needed

#### For ALL Tickets (Universal Requirements):
- [ ] Release_Notes.md updated with changes
- [ ] PROJECT_CONTEXT.md updated if architecture changed
- [ ] README.md updated if API changed
- [ ] All documentation links work

### **✅ Version Control (MANDATORY)**
- [ ] ALL code changes committed to git
- [ ] Commit messages follow proper format
- [ ] No uncommitted changes anywhere
- [ ] Final completion commit includes:
  - Proper commit message format
  - Reference to ticket ID
  - Summary of what was completed

### **✅ Quality Gates (MUST PASS)**
- [ ] Linting passes with zero errors
- [ ] Type checking passes with zero errors
- [ ] Security scan passes (no high-severity issues)
- [ ] Performance benchmarks met
- [ ] Code review completed (if required)

### **✅ Status Progression (ENFORCED)**
- [ ] Ticket progressed through ALL required states:
  - `TODO` → `IN_PROGRESS` → `CODE_REVIEW` → `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE`
- [ ] No status jumps (e.g., TODO → DONE)
- [ ] PROJECT_PLAN.md updated with DONE status
- [ ] Spec document marked as implemented

---

## 🚨 **ENFORCEMENT MECHANISM**

**BEFORE marking any ticket DONE:**

1. **MANDATORY:** Run `/validate-done [TICKET-ID]`
2. **ALL checkboxes above MUST be checked**
3. **System will BLOCK DONE status until validation passes**
4. **If ANY criteria fail:** Return to IN_PROGRESS and fix

---

## **Validation Commands**

```bash
# Primary validation (run before marking DONE)
/validate-done [TICKET-ID]           # Complete validation

# Phase-specific validations
/validate-phase test-creation [TICKET]   # Validate tests written
/validate-phase test-execution [TICKET]  # Validate tests pass
/validate-phase documentation [TICKET]   # Validate docs complete
/validate-phase quality-checks [TICKET]  # Validate quality gates

# Documentation validation
/validate-docs [TICKET]              # Check required docs exist
```

---

## **Common Failures**

❌ **"Tests are failing"** → Cannot proceed - fix all tests first  
❌ **"Missing API documentation"** → Create required docs per ticket type  
❌ **"No commits made"** → Commit all changes before marking DONE  
❌ **"Skipped CODE_REVIEW state"** → Return to proper status progression  
❌ **"Coverage below 80%"** → Add more tests to meet coverage requirement  

---

## **Remember**
- **No exceptions:** ALL criteria must be met
- **No shortcuts:** Cannot skip validation steps
- **No partial completion:** Fix everything or stay IN_PROGRESS
- **Archive, don't delete:** Move obsolete files to `/Archive/` with reason
- **Follow workflow:** Complete ALL status transitions

---

**🎯 Goal: Zero defects, complete documentation, full test coverage, and proper version control for EVERY ticket.**

