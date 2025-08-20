---
title: STAD Stage Gate Checklist Template
description: Quality gates and validation checklists for STAD protocol stage transitions
type: template
category: development
tags: [stad, stage-gate, quality, validation, checklist]
created: 2025-08-15
updated: 2025-08-15
---

# STAD Stage Gate Checklist - [TICKET-ID]

**Ticket:** [TICKET-ID] - [Title]  
**Epic:** [Epic Name]  
**Sprint:** [Sprint Number]  
**Story Points:** [X points]  
**Current Stage:** [Stage Number]  
**Target Stage:** [Stage Number]  

---

## 🎯 Stage Gate Overview

This checklist ensures quality and completeness before advancing between STAD protocol stages. Each gate must PASS before proceeding to the next stage.

**Gate Result:** PASS | FAIL | BLOCKED  
**Reviewer:** [Name/Agent]  
**Review Date:** [YYYY-MM-DD]  

---

## 📋 Stage 0 → Stage 1: Epic Ready for Sprint Planning

### Epic Definition Validation
- [ ] **Epic Title** - Clear, concise, and descriptive
- [ ] **Epic Description** - Comprehensive problem statement
- [ ] **Business Value** - Clearly articulated user/business benefit
- [ ] **Success Criteria** - Measurable definition of done
- [ ] **Story Points Estimate** - High-level sizing (13, 21, 34+ points)

### Strategic Alignment
- [ ] **Product Roadmap Alignment** - Fits with strategic goals
- [ ] **Architecture Compatibility** - No major architecture conflicts
- [ ] **Resource Availability** - Team capacity exists for implementation
- [ ] **Technical Feasibility** - No obvious technical blockers
- [ ] **Dependency Assessment** - External dependencies identified

### Documentation Completeness
- [ ] **POLICY.md Updated** - Project principles reflect new work
- [ ] **Epic Template Complete** - All sections filled appropriately
- [ ] **Stakeholder Approval** - Required approvals obtained
- [ ] **Backlog Prioritization** - Epic properly prioritized

### Gate Criteria
- [ ] **Epic can be broken into manageable tickets**
- [ ] **Effort estimation is confident (not wild guess)**
- [ ] **No immediate architectural blockers identified**

**Gate Decision:** PASS | FAIL  
**If FAIL, reason:** [Explanation]  
**Blocker Ticket:** [BLOCK-YYYY-MM-DD-X if blocked]

---

## 📋 Stage 1 → Stage 2: Plan Ready for Execution

### Ticket Decomposition Quality
- [ ] **Individual Tickets Created** - Epic broken into ≤8 point tickets
- [ ] **Ticket Titles** - Clear, actionable, and specific
- [ ] **Acceptance Criteria** - Testable and comprehensive
- [ ] **Story Points Assigned** - Each ticket appropriately sized
- [ ] **Dependencies Mapped** - Inter-ticket dependencies defined

### Technical Planning Completeness
- [ ] **Specifications Written** - Each ticket has detailed spec
- [ ] **STAD Stage Assignment** - Each ticket mapped to appropriate stage (0-4)
- [ ] **Agent Assignments** - Recommended agents identified
- [ ] **Architecture Design** - Technical approach documented
- [ ] **Integration Points** - System touchpoints identified

### Execution Readiness
- [ ] **Dependency DAG Created** - Visual dependency mapping
- [ ] **Critical Path Identified** - Longest path through work
- [ ] **Parallel Opportunities** - Concurrent work identified
- [ ] **Risk Assessment** - Potential issues documented
- [ ] **Fallback Strategies** - Mitigation approaches defined

### Resource Allocation
- [ ] **Sprint Capacity Calculated** - Available points vs. planned work
- [ ] **Agent Availability** - Required specialist agents available
- [ ] **Tool Requirements** - Necessary tools and access confirmed
- [ ] **Environment Setup** - Development environment ready

### Quality Preparation
- [ ] **Test Strategy Defined** - Approach for validation
- [ ] **Quality Gates Identified** - Checkpoints and criteria
- [ ] **Review Process Planned** - Code review strategy
- [ ] **Documentation Plan** - What docs need creation/updates

### Gate Criteria
- [ ] **All tickets are executable without clarification**
- [ ] **Dependencies are clearly defined and manageable**
- [ ] **Technical approach is sound and complete**
- [ ] **Resource allocation is realistic**

**Gate Decision:** PASS | FAIL  
**If FAIL, reason:** [Explanation]  
**Blocker Ticket:** [BLOCK-YYYY-MM-DD-X if blocked]

---

## 📋 Stage 2 → Stage 3: Code Ready for Validation

### Implementation Completeness
- [ ] **All Acceptance Criteria Met** - Every criterion satisfied
- [ ] **Code Implementation Complete** - All planned features implemented
- [ ] **Integration Points Connected** - System connections working
- [ ] **Error Handling Added** - Graceful failure modes
- [ ] **Performance Considerations** - Efficiency requirements met

### Code Quality Standards
- [ ] **Coding Standards Followed** - Style guide compliance
- [ ] **Code Review Completed** - Peer review conducted
- [ ] **Security Review Done** - Security agent review if applicable
- [ ] **Documentation Updated** - Code comments and docs current
- [ ] **Refactoring Complete** - Code cleanup finished

### Testing Validation
- [ ] **Unit Tests Written** - Component-level tests created
- [ ] **Unit Tests Passing** - All tests execute successfully
- [ ] **Integration Tests Added** - System-level tests created
- [ ] **Test Coverage Adequate** - Meets project coverage standards
- [ ] **Edge Cases Tested** - Boundary conditions validated

### Build and CI/CD
- [ ] **Build Successful** - Code compiles/builds without errors
- [ ] **CI Pipeline Passing** - Automated checks successful
- [ ] **Linting Clean** - Code style validation passed
- [ ] **Security Scans Clean** - No security vulnerabilities detected
- [ ] **Dependency Updates** - Package/dependency changes documented

### Documentation Updates
- [ ] **Technical Docs Updated** - Architecture docs reflect changes
- [ ] **API Docs Current** - Interface documentation updated
- [ ] **User Docs Updated** - End-user documentation current
- [ ] **README Updated** - Project README reflects changes
- [ ] **Changelog Updated** - Changes documented for release

### Git and Versioning
- [ ] **Semantic Commits Used** - Proper commit message format
- [ ] **Branch Up to Date** - Latest main branch merged
- [ ] **No Merge Conflicts** - Clean merge possible
- [ ] **Commit History Clean** - Logical commit progression
- [ ] **Tags Applied** - Version tags if applicable

### Gate Criteria
- [ ] **Feature is functionally complete**
- [ ] **Code quality meets team standards**
- [ ] **All automated tests pass**
- [ ] **Documentation is current and accurate**

**Gate Decision:** PASS | FAIL  
**If FAIL, reason:** [Explanation]  
**Blocker Ticket:** [BLOCK-YYYY-MM-DD-X if blocked]

---

## 📋 Stage 3 → Stage 4: Feature Approved for Release

### User Acceptance Testing
- [ ] **Manual Testing Complete** - Human validation performed
- [ ] **User Scenarios Tested** - Real-world usage patterns validated
- [ ] **Browser/Platform Testing** - Cross-platform compatibility confirmed
- [ ] **Accessibility Testing** - Accessibility standards met
- [ ] **Performance Testing** - Performance requirements satisfied

### Business Validation
- [ ] **Acceptance Criteria Verified** - All criteria confirmed working
- [ ] **Business Logic Correct** - Rules and workflows accurate
- [ ] **Data Integrity Maintained** - No data corruption or loss
- [ ] **User Experience Approved** - UX meets design requirements
- [ ] **Error Messages Appropriate** - User-friendly error handling

### Security and Compliance
- [ ] **Security Review Passed** - Security vulnerabilities addressed
- [ ] **Data Privacy Compliant** - Privacy requirements met
- [ ] **Audit Trail Complete** - Change tracking appropriate
- [ ] **Permissions Correct** - Access controls working properly
- [ ] **Compliance Verified** - Regulatory requirements met

### Integration Validation
- [ ] **System Integration Working** - All system connections functional
- [ ] **API Compatibility Maintained** - No breaking changes to APIs
- [ ] **Database Changes Applied** - Schema updates successful
- [ ] **Third-party Services Working** - External integrations functional
- [ ] **Monitoring and Logging** - Observability tools configured

### Release Readiness
- [ ] **Deployment Scripts Ready** - Automated deployment prepared
- [ ] **Rollback Plan Prepared** - Reversion strategy documented
- [ ] **Release Notes Written** - Change documentation complete
- [ ] **Stakeholder Notification** - Relevant parties informed
- [ ] **Training Materials Updated** - User training current

### Quality Assurance
- [ ] **No Critical Bugs** - No severity 1 issues remain
- [ ] **Performance Baseline Met** - Performance targets achieved
- [ ] **Memory Leaks Checked** - Resource usage appropriate
- [ ] **Load Testing Passed** - System handles expected load
- [ ] **Monitoring Alerts Configured** - Error detection in place

### Gate Criteria
- [ ] **Feature works correctly in production-like environment**
- [ ] **All stakeholders approve the implementation**
- [ ] **No blocking issues remain**
- [ ] **Release process is ready to execute**

**Gate Decision:** PASS | FAIL  
**If FAIL, reason:** [Explanation]  
**Blocker Ticket:** [BLOCK-YYYY-MM-DD-X if blocked]

---

## 🚨 Blocker Escalation Triggers

### Automatic Escalation Conditions
- [ ] **Gate fails twice consecutively**
- [ ] **Critical severity issue discovered**
- [ ] **External dependency blocking progress**
- [ ] **Resource constraint preventing completion**

### Escalation Actions Required
- [ ] **Create blocker ticket using blocker escalation template**
- [ ] **Notify sprint lead and stakeholders**
- [ ] **Document impact on sprint goals**
- [ ] **Identify alternative work if available**

---

## 📊 Gate Performance Metrics

### Quality Metrics
- **Defects Found:** [Number]
- **Test Coverage:** [Percentage]
- **Code Review Comments:** [Number]
- **Security Issues:** [Number]

### Efficiency Metrics
- **Gate Review Time:** [Hours]
- **Rework Required:** [Yes/No]
- **Additional Clarifications Needed:** [Number]
- **Dependencies Blocking:** [Number]

### Process Metrics
- **First Pass Success:** [Yes/No]
- **Escalations Required:** [Number]
- **Reviewer Confidence Level:** [High/Medium/Low]
- **Process Improvement Suggestions:** [Notes]

---

## 📝 Gate Review Notes

### Strengths Observed
[What went well in this stage/transition]

### Areas for Improvement
[What could be better next time]

### Process Insights
[Learnings about the stage gate process itself]

### Recommendations
[Suggestions for future similar work]

---

## ✅ Gate Approval

**Final Gate Decision:** PASS | FAIL | CONDITIONAL PASS

**Reviewer Signature:** [Name] - [Date]
**Role:** [Reviewer Role/Agent Type]
**Review Duration:** [Time spent]

### If CONDITIONAL PASS
**Conditions to be met:**
1. [Condition 1]
2. [Condition 2]
3. [Condition 3]

**Re-review Required:** [Yes/No]
**Follow-up Date:** [Date]

### If FAIL
**Primary Reasons for Failure:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

**Required Actions:**
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Next Review Date:** [Date]

---

## 📚 Related Documentation

**Stage Documentation:**
- [Link to stage-specific guides]
- [Link to quality standards]

**Project Documentation:**
- [Link to project standards]
- [Link to architecture docs]

**Process Documentation:**
- [Link to STAD protocol guide]
- [Link to development workflow]

---

*This stage gate checklist ensures quality and completeness at each transition point in the STAD protocol, maintaining high standards while enabling efficient development flow.*