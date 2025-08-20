---
title: Agent Handoff Template
description: Comprehensive template for context transfer between agents
type: template
category: development
tags: [agents, handoff, context-transfer, documentation]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# Agent Handoff Report

## 📋 Sprint & Ticket Information

**Sprint ID:** [Sprint number/name]  
**Ticket ID:** [TICKET-XXX]  
**Ticket Title:** [Brief descriptive title]  
**Story Points:** [1,2,3,5,8,13]  
**Priority:** [Critical/High/Medium/Low]  
**Epic:** [Related epic if applicable]  

**Current Status:** [BACKLOG/TODO/IN_PROGRESS/CODE_REVIEW/QA_TESTING/DOCUMENTATION/READY_FOR_RELEASE/DONE]  
**Previous Status:** [Previous state]  
**Status Change Reason:** [Why status changed]  

**Handoff From:** [Agent name/role]  
**Handoff To:** [Target agent name/role]  
**Handoff Date:** [YYYY-MM-DD HH:MM]  
**Session ID:** [If applicable]  

---

## ✅ Work Completed

### Files Modified
```
[List all files with modification type]
- ✏️ MODIFIED: /path/to/file.ext - [Brief description of changes]
- ➕ CREATED: /path/to/new-file.ext - [Purpose and content summary]
- 🗑️ ARCHIVED: /path/to/old-file.ext → /Archive/old-file_YYYYMMDD.ext
- 🔄 RENAMED: /old/path.ext → /new/path.ext
- 🧪 TESTED: /path/to/test-file.ext - [Test results summary]
```

### Code Changes Summary
```typescript
// Example: Key functions/classes added or modified
class NewFeature {
  // Brief description of implementation approach
}

function criticalFunction() {
  // Note any complex logic or important patterns
}
```

### Tasks Accomplished
- [ ] **Task 1:** [Detailed description] ✅ COMPLETE
- [ ] **Task 2:** [Detailed description] ✅ COMPLETE  
- [ ] **Task 3:** [Detailed description] 🔄 IN PROGRESS (70% complete)
- [ ] **Task 4:** [Detailed description] ❌ BLOCKED (see Blockers section)

### Acceptance Criteria Status
- [ ] **AC1:** [Criteria description] ✅ MET
- [ ] **AC2:** [Criteria description] ✅ MET
- [ ] **AC3:** [Criteria description] ⏳ PENDING
- [ ] **AC4:** [Criteria description] ❌ NOT MET (reason)

---

## 🧠 Critical Information for Next Agent

### ⚠️ Important Insights & Warnings
- **Security Concern:** [Any security implications discovered]
- **Performance Impact:** [Performance considerations or bottlenecks]
- **Breaking Changes:** [Any changes that might affect other components]
- **Dependencies:** [New dependencies added or version changes]
- **Database Changes:** [Schema modifications, migrations needed]

### 🔍 Technical Gotchas
- **Edge Case:** [Specific scenarios that need special handling]
- **Browser Compatibility:** [Any compatibility issues discovered]
- **Environment Differences:** [Dev vs staging vs prod considerations]
- **Third-party Limitations:** [API limitations, rate limits, etc.]

### 💡 Implementation Insights
- **Pattern Used:** [Design patterns, architectural decisions]
- **Why This Approach:** [Rationale for technical choices made]
- **Alternative Considered:** [Other approaches evaluated but not chosen]
- **Optimization Opportunities:** [Areas for future improvement]

---

## 🎯 Decisions Made and Rationale

### Architecture Decisions
| Decision | Rationale | Impact | Alternatives Considered |
|----------|-----------|--------|------------------------|
| [Tech choice] | [Why chosen] | [What it affects] | [What else was considered] |
| [Pattern used] | [Benefits] | [Scope of impact] | [Other patterns evaluated] |

### Code Structure Decisions
- **File Organization:** [How files are structured and why]
- **Naming Conventions:** [Any specific naming decisions made]
- **Error Handling:** [Error handling strategy implemented]
- **Logging Strategy:** [What logging was added and why]

### Configuration Decisions
- **Environment Variables:** [New env vars added, format chosen]
- **Build Process:** [Any build configuration changes]
- **Dependencies:** [Why specific versions were chosen]

---

## ❓ Open Questions & Concerns

### Questions for Next Agent
1. **[Category]:** [Specific question about implementation/approach]
2. **[Category]:** [Decision that needs to be made]
3. **[Category]:** [Clarification needed from stakeholder]

### Technical Concerns
- **Scalability:** [Concerns about how solution will scale]
- **Maintainability:** [Areas that might be hard to maintain]
- **Testing Gaps:** [Areas that need more test coverage]
- **Documentation Debt:** [Documentation that needs to be created/updated]

### Integration Concerns
- **Upstream Dependencies:** [Services/components this depends on]
- **Downstream Impact:** [What this change might break]
- **API Compatibility:** [Backward compatibility considerations]

---

## 🚀 Suggested Next Steps

### Immediate Actions (Next 1-2 hours)
1. **[Action]:** [Specific task with context]
2. **[Action]:** [Another immediate task]
3. **[Action]:** [Verification step]

### Short-term Goals (Next session)
- **Primary Focus:** [Main objective for next agent]
- **Secondary Tasks:** [Supporting tasks that can be done in parallel]
- **Validation Needed:** [What needs to be tested/verified]

### Long-term Considerations
- **Future Enhancements:** [Features that could be added later]
- **Refactoring Opportunities:** [Areas for future improvement]
- **Monitoring Needs:** [What should be monitored in production]

---

## 🧮 Knowledge Graph Updates

### New Entities Created
```yaml
Entity: [Entity Name]
Type: [code_component/feature/service/configuration]
Description: [What this entity represents]
Relationships:
  - depends_on: [Other Entity]
  - implements: [Interface/Pattern]
  - used_by: [Consumer Entity]
```

### Relations Added
- **[Entity A]** `implements` **[Pattern/Interface]**
- **[Feature X]** `depends_on` **[Service Y]**
- **[Component Z]** `integrates_with` **[External API]**

### Key Observations
- **Performance:** [Benchmark data, response times]
- **Usage Patterns:** [How the feature is expected to be used]
- **Error Patterns:** [Common error scenarios discovered]
- **Configuration:** [Important configuration values/patterns]

---

## 📊 Performance Observations

### Metrics Collected
- **Build Time:** [Time taken for builds]
- **Test Execution:** [Test suite runtime]
- **Memory Usage:** [Memory consumption patterns]
- **Response Times:** [API/function response times]

### Benchmarks
```
Function/Feature: [Name]
- Average Response: [XXXms]
- Peak Memory: [XXXmb]
- Throughput: [XXX ops/sec]
- Error Rate: [X.XX%]
```

### Performance Bottlenecks
- **Identified:** [Specific slow areas]
- **Root Cause:** [Why it's slow]
- **Mitigation:** [What was done to address]
- **Future Optimization:** [Additional improvements possible]

---

## 🏗️ Technical Context

### Code Patterns Used
```typescript
// Pattern: [Pattern name]
// Use case: [When to use this pattern]
// Location: [Where implemented]

interface ExamplePattern {
  // Example of pattern structure
}
```

### Libraries & Dependencies Added
| Library | Version | Purpose | Configuration |
|---------|---------|---------|---------------|
| [name] | [version] | [why added] | [how configured] |

### Architecture Patterns
- **Design Pattern:** [Pattern used] - [Why chosen]
- **Integration Pattern:** [How services communicate]
- **Data Flow:** [How data moves through system]
- **Error Handling:** [Error handling strategy]

### Configuration Changes
```yaml
# New configuration added
new_config:
  setting: value
  environment_specific:
    dev: dev_value
    prod: prod_value
```

---

## 🧪 Test Coverage Achieved

### Tests Created
- **Unit Tests:** [X tests] covering [Y% of new code]
- **Integration Tests:** [X tests] covering [critical paths]
- **E2E Tests:** [X tests] covering [user journeys]
- **Performance Tests:** [Load/stress test results]

### Test Files
```
/tests/unit/new-feature.test.ts - [Coverage: XX%]
/tests/integration/api-integration.test.ts - [Coverage: XX%]
/tests/e2e/user-workflow.test.ts - [Status: PASSING]
```

### Test Coverage Gaps
- **Uncovered Scenarios:** [What still needs testing]
- **Edge Cases:** [Boundary conditions not yet tested]
- **Error Scenarios:** [Error conditions that need test coverage]

---

## 🚧 Blockers Encountered

### Current Blockers
| Blocker | Impact | Workaround | Owner | ETA |
|---------|--------|------------|--------|-----|
| [Issue] | [High/Med/Low] | [Temp solution] | [Who's fixing] | [When] |

### Resolved Blockers
- **[Issue]:** [How it was resolved] - [Time to resolution]
- **[Issue]:** [Solution implemented] - [Lessons learned]

### Potential Future Blockers
- **[Risk]:** [Why it might become a blocker] - [Mitigation strategy]
- **[Dependency]:** [External dependency risk] - [Contingency plan]

---

## 📎 Attachments & References

### Code Snippets
```typescript
// Critical code segment that next agent should understand
function criticalImplementation() {
  // Implementation with detailed comments
}
```

### Configuration Files
```yaml
# Important configuration
key_setting: value
# This setting controls [behavior]
```

### Documentation Links
- **Internal Docs:** [Link to relevant project documentation]
- **External References:** [Links to API docs, libraries, standards]
- **Design Documents:** [Links to design decisions, RFCs]

### Screenshots/Diagrams
- **UI Changes:** [Path to screenshots if applicable]
- **Architecture Diagrams:** [Path to updated system diagrams]
- **Flow Charts:** [Path to process flow documentation]

### Related Tickets
- **Dependencies:** [TICKET-XXX] - [How it relates]
- **Blocked By:** [TICKET-XXX] - [What's blocking progress]
- **Blocks:** [TICKET-XXX] - [What this blocks]

---

## 🔄 Handoff Checklist

### Pre-Handoff Verification
- [ ] All code changes committed and pushed
- [ ] Tests are passing in CI/CD
- [ ] Documentation updated
- [ ] Knowledge graph synced
- [ ] Performance metrics recorded
- [ ] Security review completed (if applicable)

### Context Transfer Verification
- [ ] Next agent has access to all necessary files
- [ ] Dependencies and environment setup documented
- [ ] Critical decisions and rationale clearly explained
- [ ] All blockers and concerns clearly identified
- [ ] Success criteria for next phase defined

### Post-Handoff Actions
- [ ] Next agent confirmed receipt of handoff
- [ ] Handoff discussion completed if needed
- [ ] PROJECT_PLAN.md status updated
- [ ] Sprint board updated with progress

---

## 📝 Additional Notes

### Lessons Learned
- **What Worked Well:** [Successful approaches]
- **What Could Be Improved:** [Areas for enhancement]
- **Time Estimates:** [Accuracy of original estimates]

### Recommendations
- **For Next Agent:** [Specific advice for continuation]
- **For Process:** [Process improvements identified]
- **For Architecture:** [Architectural improvements suggested]

### Contact Information
- **Handoff Agent:** [Agent name/identifier]
- **Session Context:** [How to reference this work session]
- **Priority Escalation:** [Who to contact for urgent issues]

---

*Handoff completed on [DATE] at [TIME] by [AGENT]*  
*Next agent: [TARGET_AGENT] - Expected start: [TIME]*