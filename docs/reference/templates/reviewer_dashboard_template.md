---
title: Reviewer Dashboard Template
description: Comprehensive reviewer dashboard for efficient work validation and decision making
type: template
category: development
tags: [review, dashboard, validation, stad-protocol, quality-assurance]
created: 2025-08-15
updated: 2025-08-20
---

# **`🔍 Reviewer Dashboard: [Ticket Title]`**

**`Ticket ID:`** `[ID from Project Plan, e.g., AUTH-01] | Developer: [Name] | Review Date: YYYY-MM-DD`  
**`Reviewer:`** `[Your Name] | Sprint: [Sprint Number] | Story Points: [Original Estimate]`  
**`Review Type:`** `[Code Review | QA Testing | Final Validation | Security Review]`

---

## **`📊 Quick Status Overview`**

| **Component** | **Status** | **Score** | **Critical Issues** |
|---------------|------------|-----------|-------------------|
| **Feature Functionality** | `🟢 PASS / 🟡 PARTIAL / 🔴 FAIL` | `[X/10]` | `[0 Critical]` |
| **Code Quality** | `🟢 PASS / 🟡 PARTIAL / 🔴 FAIL` | `[X/10]` | `[0 Critical]` |
| **Test Coverage** | `🟢 PASS / 🟡 PARTIAL / 🔴 FAIL` | `[X/10]` | `[0 Critical]` |
| **Security** | `🟢 PASS / 🟡 PARTIAL / 🔴 FAIL` | `[X/10]` | `[0 Critical]` |
| **Performance** | `🟢 PASS / 🟡 PARTIAL / 🔴 FAIL` | `[X/10]` | `[0 Critical]` |
| **Documentation** | `🟢 PASS / 🟡 PARTIAL / 🔴 FAIL` | `[X/10]` | `[0 Critical]` |

**`Overall Grade:`** `[A/B/C/D/F] | Recommendation: [APPROVE/REVISE/REJECT]`

---

## **`⚡ Quick Decision Section`**

### **`🎯 Executive Summary (30-second read)`**
**`What was delivered:`** `[One sentence describing the completed work]`  
**`Quality level:`** `[Production-ready | Needs minor fixes | Requires significant work | Not acceptable]`  
**`Immediate action:`** `[/validate | /sprint-approved | /standards review]`

### **`🚀 Instant Actions`**
* **`/validate`** - `Run comprehensive validation checks`
* **`/sprint-approved`** - `Ready for production deployment (approval complete)`
* **`/standards`** - `Review relevant standards before final decision`

**`Selected Action:`** `[Choose one above]`

---

## **`🎯 Feature Summary & Acceptance Criteria`**

### **`Feature Overview`**
* **`Business Goal:`** `[What problem this solves for users/business]`
* **`User Story:`** `[As a X, I want Y, so that Z]`
* **`Expected Behavior:`** `[High-level description of what should work]`

### **`Acceptance Criteria Validation`**
| **Criteria** | **Status** | **Evidence** | **Notes** |
|--------------|------------|--------------|-----------|
| `[ ] [Criterion 1: e.g., User can log in with valid credentials]` | `🟢 PASS / 🔴 FAIL` | `[Test result/screenshot]` | `[Any issues or notes]` |
| `[ ] [Criterion 2: e.g., Error shown for invalid credentials]` | `🟢 PASS / 🔴 FAIL` | `[Test result/screenshot]` | `[Any issues or notes]` |
| `[ ] [Criterion 3: e.g., User session persists across page refresh]` | `🟢 PASS / 🔴 FAIL` | `[Test result/screenshot]` | `[Any issues or notes]` |

**`Acceptance Criteria Summary:`** `[X/Y criteria passed] | Overall: 🟢 PASS / 🔴 FAIL`

---

## **`🧪 Test Results Summary`**

### **`Automated Testing`**
| **Test Type** | **Total Tests** | **Passed** | **Failed** | **Coverage** | **Status** |
|---------------|-----------------|------------|------------|--------------|------------|
| **Unit Tests** | `[e.g., 25]` | `[e.g., 24]` | `[e.g., 1]` | `[e.g., 85%]` | `🟢 PASS / 🔴 FAIL` |
| **Integration Tests** | `[e.g., 12]` | `[e.g., 12]` | `[e.g., 0]` | `[e.g., 90%]` | `🟢 PASS / 🔴 FAIL` |
| **End-to-End Tests** | `[e.g., 8]` | `[e.g., 7]` | `[e.g., 1]` | `[e.g., 70%]` | `🟢 PASS / 🔴 FAIL` |
| **API Tests** | `[e.g., 15]` | `[e.g., 15]` | `[e.g., 0]` | `[e.g., 95%]` | `🟢 PASS / 🔴 FAIL` |

### **`Manual Testing Results`**
* **`Functional Testing:`** `🟢 All core functions work as expected`
* **`UI/UX Testing:`** `🟡 Minor visual inconsistencies on mobile`
* **`Browser Compatibility:`** `🟢 Works on Chrome, Firefox, Safari`
* **`Edge Cases:`** `🔴 Crashes with empty input fields`

### **`Test Issues Found`**
| **Severity** | **Issue** | **Impact** | **Required Fix** |
|--------------|-----------|------------|------------------|
| **Critical** | `[e.g., App crashes on invalid input]` | `[e.g., Blocks user workflow]` | `[e.g., Add input validation]` |
| **High** | `[e.g., Slow response on large datasets]` | `[e.g., Poor user experience]` | `[e.g., Optimize database query]` |
| **Medium** | `[e.g., Button color doesn't match design]` | `[e.g., Visual inconsistency]` | `[e.g., Update CSS color value]` |
| **Low** | `[e.g., Console warning messages]` | `[e.g., Development noise]` | `[e.g., Clean up debug logs]` |

---

## **`⚡ Performance Metrics`**

### **`Performance Requirements vs Actual`**
| **Metric** | **Requirement** | **Actual** | **Status** | **Notes** |
|------------|-----------------|------------|------------|-----------|
| **Page Load Time** | `< 2 seconds` | `[e.g., 1.8s]` | `🟢 PASS` | `[Meets requirement]` |
| **API Response Time** | `< 500ms` | `[e.g., 350ms]` | `🟢 PASS` | `[Well under limit]` |
| **Database Query Time** | `< 100ms` | `[e.g., 75ms]` | `🟢 PASS` | `[Optimized queries]` |
| **Memory Usage** | `< 512MB` | `[e.g., 480MB]` | `🟢 PASS` | `[Within limits]` |
| **Bundle Size** | `< 2MB` | `[e.g., 2.3MB]` | `🔴 FAIL` | `[Exceeds limit - needs optimization]` |

### **`Performance Issues`**
* **`Critical:`** `[e.g., Bundle size 15% over limit]`
* **`High:`** `[e.g., Memory leak detected in component cleanup]`
* **`Medium:`** `[e.g., Unoptimized images causing slow load]`
* **`Low:`** `[e.g., Unused CSS imports increasing bundle size]`

---

## **`🔒 Security Validation Status`**

### **`Security Checklist`**
| **Security Area** | **Status** | **Issues Found** | **Risk Level** |
|-------------------|------------|------------------|----------------|
| **Input Validation** | `🟢 PASS / 🔴 FAIL` | `[e.g., 0 issues]` | `LOW / MED / HIGH / CRITICAL` |
| **Authentication** | `🟢 PASS / 🔴 FAIL` | `[e.g., 1 issue]` | `LOW / MED / HIGH / CRITICAL` |
| **Authorization** | `🟢 PASS / 🔴 FAIL` | `[e.g., 0 issues]` | `LOW / MED / HIGH / CRITICAL` |
| **Data Protection** | `🟢 PASS / 🔴 FAIL` | `[e.g., 0 issues]` | `LOW / MED / HIGH / CRITICAL` |
| **SQL Injection** | `🟢 PASS / 🔴 FAIL` | `[e.g., 0 issues]` | `LOW / MED / HIGH / CRITICAL` |
| **XSS Protection** | `🟢 PASS / 🔴 FAIL` | `[e.g., 0 issues]` | `LOW / MED / HIGH / CRITICAL` |
| **CSRF Protection** | `🟢 PASS / 🔴 FAIL` | `[e.g., 0 issues]` | `LOW / MED / HIGH / CRITICAL` |

### **`Security Issues Found`**
| **Severity** | **Vulnerability** | **Location** | **Fix Required** | **Priority** |
|--------------|-------------------|--------------|------------------|--------------|
| **Critical** | `[e.g., Hardcoded API key in source]` | `[e.g., auth.js:45]` | `[e.g., Move to environment variables]` | **Immediate** |
| **High** | `[e.g., Unvalidated user input]` | `[e.g., login.js:23]` | `[e.g., Add input sanitization]` | **Before deploy** |
| **Medium** | `[e.g., Weak password requirements]` | `[e.g., validation.js:12]` | `[e.g., Enforce stronger policy]` | **Next sprint** |

---

## **`💼 Code Quality Metrics`**

### **`Code Quality Assessment`**
| **Quality Factor** | **Score (1-10)** | **Status** | **Issues** |
|-------------------|------------------|------------|------------|
| **Code Readability** | `[e.g., 8/10]` | `🟢 GOOD` | `[Minor: Some functions need better naming]` |
| **Code Complexity** | `[e.g., 7/10]` | `🟡 ACCEPTABLE` | `[Medium: Few functions too complex]` |
| **Code Reusability** | `[e.g., 9/10]` | `🟢 EXCELLENT` | `[None: Good abstraction patterns]` |
| **Error Handling** | `[e.g., 6/10]` | `🟡 NEEDS WORK` | `[High: Missing error cases]` |
| **Documentation** | `[e.g., 8/10]` | `🟢 GOOD` | `[Low: Some functions undocumented]` |
| **Testing** | `[e.g., 7/10]` | `🟡 ACCEPTABLE` | `[Medium: Edge cases not covered]` |

### **`Code Quality Issues`**
| **Type** | **Issue** | **Location** | **Priority** | **Effort** |
|----------|-----------|--------------|--------------|------------|
| **Critical** | `[e.g., No error handling for API failures]` | `[e.g., api.js:67]` | **Must Fix** | `[2 hours]` |
| **High** | `[e.g., Function too complex (15+ lines)]` | `[e.g., utils.js:45]` | **Should Fix** | `[1 hour]` |
| **Medium** | `[e.g., Magic numbers not explained]` | `[e.g., config.js:23]` | **Nice to Fix** | `[30 min]` |
| **Low** | `[e.g., Inconsistent code formatting]` | `[e.g., Multiple files]` | **Optional** | `[15 min]` |

---

## **`📚 Documentation Completeness`**

### **`Documentation Checklist`**
| **Documentation Type** | **Required** | **Exists** | **Quality** | **Status** |
|------------------------|--------------|------------|-------------|------------|
| **API Documentation** | `✓ Yes` | `✓ Yes / ✗ No` | `🟢 Good / 🟡 Basic / 🔴 Poor` | `COMPLETE / INCOMPLETE` |
| **User Guide** | `✓ Yes` | `✓ Yes / ✗ No` | `🟢 Good / 🟡 Basic / 🔴 Poor` | `COMPLETE / INCOMPLETE` |
| **Technical Spec** | `✓ Yes` | `✓ Yes / ✗ No` | `🟢 Good / 🟡 Basic / 🔴 Poor` | `COMPLETE / INCOMPLETE` |
| **Code Comments** | `✓ Yes` | `✓ Yes / ✗ No` | `🟢 Good / 🟡 Basic / 🔴 Poor` | `COMPLETE / INCOMPLETE` |
| **README Updates** | `✓ Yes` | `✓ Yes / ✗ No` | `🟢 Good / 🟡 Basic / 🔴 Poor` | `COMPLETE / INCOMPLETE` |
| **Deployment Guide** | `✓ Yes` | `✓ Yes / ✗ No` | `🟢 Good / 🟡 Basic / 🔴 Poor` | `COMPLETE / INCOMPLETE` |

### **`Documentation Issues`**
* **`Missing:`** `[e.g., "API endpoint examples not provided"]`
* **`Incomplete:`** `[e.g., "User guide missing error scenarios"]`
* **`Outdated:`** `[e.g., "README doesn't reflect new installation steps"]`
* **`Poor Quality:`** `[e.g., "Technical terms not explained for users"]`

---

## **`🚀 Deployment Readiness Checklist`**

### **`Pre-Deployment Requirements`**
| **Requirement** | **Status** | **Owner** | **Due Date** | **Notes** |
|-----------------|------------|-----------|--------------|-----------|
| `[ ] All tests passing` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[Developer]` | `[YYYY-MM-DD]` | `[Any blockers]` |
| `[ ] Security review complete` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[Security Team]` | `[YYYY-MM-DD]` | `[Any issues]` |
| `[ ] Performance validated` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[QA Team]` | `[YYYY-MM-DD]` | `[Metrics met]` |
| `[ ] Documentation updated` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[Developer]` | `[YYYY-MM-DD]` | `[User and tech docs]` |
| `[ ] Database migrations tested` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[DevOps]` | `[YYYY-MM-DD]` | `[Migration scripts ready]` |
| `[ ] Rollback plan prepared` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[DevOps]` | `[YYYY-MM-DD]` | `[Recovery procedures]` |
| `[ ] Monitoring configured` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[DevOps]` | `[YYYY-MM-DD]` | `[Alerts and dashboards]` |
| `[ ] Stakeholder approval` | `🟢 DONE / 🟡 IN PROGRESS / 🔴 NOT STARTED` | `[Product Owner]` | `[YYYY-MM-DD]` | `[Business sign-off]` |

### **`Deployment Risk Assessment`**
* **`High Risk:`** `[e.g., "Database schema changes affect multiple services"]`
* **`Medium Risk:`** `[e.g., "New authentication flow may confuse existing users"]`
* **`Low Risk:`** `[e.g., "UI changes are minor and well-tested"]`

### **`Post-Deployment Monitoring Plan`**
* **`Immediate (0-2 hours):`** `[e.g., "Monitor login success rates and error logs"]`
* **`Short-term (24 hours):`** `[e.g., "Track user behavior and performance metrics"]`
* **`Long-term (1 week):`** `[e.g., "Analyze user feedback and system stability"]`

---

## **`🎯 Visual Status Indicators`**

### **`Traffic Light System`**
```
🟢 GREEN (PASS)     - Ready to proceed / Meets all requirements
🟡 YELLOW (CAUTION) - Minor issues / Needs attention but not blocking
🔴 RED (STOP)       - Critical issues / Must be fixed before proceeding
⚪ WHITE (N/A)      - Not applicable / Not tested yet
```

### **`Overall Project Health`**
```
🟢🟢🟢🟢🟢🟢🟢🟢⚪⚪  (8/10 components ready)

Features:    🟢🟢🟢🟢🟢 (100% complete)
Quality:     🟢🟢🟢🟢🟡 (90% acceptable)
Security:    🟢🟢🟢🟢🟢 (100% secure)
Performance: 🟢🟢🟢🟡🔴 (70% meeting targets)
Docs:        🟢🟢🟢🟢🟢 (100% complete)
```

---

## **`📋 Action Items & Next Steps`**

### **`Immediate Actions (Must Fix Before Approval)`**
| **Priority** | **Action Item** | **Owner** | **Estimated Time** | **Due Date** |
|--------------|-----------------|-----------|-------------------|--------------|
| **P0 (Critical)** | `[e.g., Fix SQL injection vulnerability]` | `[Developer]` | `[2 hours]` | `[Today]` |
| **P1 (High)** | `[e.g., Add error handling for API failures]` | `[Developer]` | `[4 hours]` | `[Tomorrow]` |
| **P2 (Medium)** | `[e.g., Optimize bundle size]` | `[Developer]` | `[6 hours]` | `[This week]` |

### **`Future Improvements (Next Sprint)`**
* `[e.g., "Implement caching for better performance"]`
* `[e.g., "Add more comprehensive error messages"]`
* `[e.g., "Enhance mobile responsiveness"]`

### **`Follow-up Reviews Required`**
* `[ ] Code re-review after fixes (Estimated: [Date])`
* `[ ] Security re-scan after vulnerability fixes`
* `[ ] Performance re-test after optimizations`
* `[ ] Final stakeholder demo before deployment`

---

## **`📊 Review Summary & Recommendation`**

### **`Executive Summary`**
**`Overall Assessment:`** `[Production Ready / Needs Minor Fixes / Requires Major Work / Not Acceptable]`

**`Key Strengths:`**
* `[e.g., "Excellent test coverage and code quality"]`
* `[e.g., "Well-documented API with clear examples"]`
* `[e.g., "Strong security implementation"]`

**`Key Concerns:`**
* `[e.g., "Performance issues with large datasets"]`
* `[e.g., "Missing error handling in critical paths"]`
* `[e.g., "Documentation lacks user examples"]`

### **`Final Recommendation`**
**`Decision:`** `[/sprint-approved | /validate (needs more checks)]`

**`Actions for Completion (if applicable):`**
* `[e.g., "Use /validate to check security"]`
* `[e.g., "Add missing error handling ticket to PROJECT_PLAN.md manually"]`
* `[e.g., "Use /standards to review documentation requirements"]`

**`Next Review Date:`** `[YYYY-MM-DD (if re-review needed)]`

---

## **`👥 Reviewer Information`**

**`Primary Reviewer:`** `[Your Name] | Role: [Title] | Date: [YYYY-MM-DD]`  
**`Additional Reviewers:`** `[Names of other reviewers if applicable]`  
**`Review Duration:`** `[X hours/days spent on review]`  
**`Review Method:`** `[Code review tool, manual testing, automated scans, etc.]`

**`Contact for Questions:`** `[Email/Slack handle]`  
**`Review Feedback Location:`** `[Link to detailed feedback if in separate system]`

---

> **🎯 Reviewer Dashboard Usage Notes:**
> - Use this template for consistent review standards across all tickets
> - Fill out all applicable sections; mark N/A for irrelevant items
> - Focus on objective, measurable criteria rather than subjective opinions
> - Provide specific, actionable feedback with examples and locations
> - Use the traffic light system for quick visual status assessment
> - Always include specific next steps and deadlines for any required changes
> - Link to supporting evidence (test results, screenshots, logs) when possible