---
title: Blocker Escalation Template
description: Template for escalating blockers in STAD development workflow
type: template
category: project-management
tags: [blocker, escalation, stad, sprint, workflow]
created: 2025-08-15
updated: 2025-08-15
---

# Blocker Escalation - [TICKET-ID]

**Blocker ID:** BLOCK-[YYYY-MM-DD]-[NUMBER]  
**Date Created:** [YYYY-MM-DD]  
**Reporter:** [Name/Agent]  
**Status:** OPEN | ESCALATED | RESOLVED | BYPASSED  
**Priority:** CRITICAL | HIGH | MEDIUM | LOW  

---

## 🚨 Blocker Summary

### Type of Blocker
- [ ] **Bug/Technical Issue** - Code defect preventing progress
- [ ] **Tool/Infrastructure Issue** - System/dependency problem
- [ ] **Design Decision** - Architectural choice needed
- [ ] **Dependency Blocker** - Waiting on external input
- [ ] **Resource Constraint** - Missing access/permissions
- [ ] **Requirement Clarification** - Ambiguous requirements

### One-Line Description
[Brief description of what is blocked and why]

---

## 📊 Impact Assessment

### Immediate Impact
**Tickets Blocked:**
- [TICKET-ID-1] - [Brief description] - [Story Points]
- [TICKET-ID-2] - [Brief description] - [Story Points]
- **Total Story Points Affected:** [X points]

**Current Sprint Impact:**
- **Sprint Goal Affected:** YES | NO
- **Sprint Completion Risk:** LOW | MEDIUM | HIGH | CRITICAL
- **Estimated Delay:** [X hours/days]

### Cascade Impact
**Dependent Tickets:**
- [List tickets that depend on blocked tickets]
- **Additional Points at Risk:** [X points]

**Team Impact:**
- **Developers Affected:** [Number]
- **Agents Blocked:** [List agent types]
- **Alternative Work Available:** YES | NO

---

## 🔍 Blocker Details

### What Exactly is Blocked
[Detailed description of the specific issue preventing progress]

### Current State
[Describe the current situation - what works, what doesn't]

### Expected State
[Describe what should be happening if not blocked]

### Error Messages/Evidence
```
[Include any error messages, logs, screenshots, or other evidence]
```

---

## 🛠️ Investigation & Attempted Solutions

### Research Conducted
- [x] [Investigation step 1 - outcome]
- [x] [Investigation step 2 - outcome]
- [ ] [Investigation step 3 - planned]

### Solutions Attempted
1. **Attempt 1:** [Description]
   - **Result:** [Success/Failure/Partial]
   - **Why it didn't work:** [Explanation]

2. **Attempt 2:** [Description]
   - **Result:** [Success/Failure/Partial]
   - **Why it didn't work:** [Explanation]

### Resources Consulted
- [x] Documentation: [Link/Reference]
- [x] Previous similar tickets: [TICKET-IDs]
- [x] Team knowledge: [Who consulted]
- [x] External resources: [Links/References]

---

## 🎯 Escalation Request

### Why Escalation is Needed
[Explain why this cannot be resolved at the current level]

### Decision Required
[If design decision blocker, specify what needs to be decided]

### Expertise Needed
[What specific knowledge/authority is required to resolve this]

### Urgency Justification
**Timeline Impact:**
- **Sprint Deadline:** [Date]
- **Days Remaining:** [X days]
- **Critical Path:** YES | NO

**Business Impact:**
- **User-facing feature:** YES | NO
- **Security implications:** YES | NO
- **Performance impact:** YES | NO

---

## 💡 Recommended Resolution Approach

### Primary Recommendation
**Approach:** [Recommended solution]
**Rationale:** [Why this is the best approach]
**Estimated Effort:** [Time/complexity]
**Success Probability:** HIGH | MEDIUM | LOW

### Alternative Options
1. **Option 1:** [Alternative approach]
   - **Pros:** [Benefits]
   - **Cons:** [Drawbacks]
   - **Effort:** [Time/complexity]

2. **Option 2:** [Alternative approach]
   - **Pros:** [Benefits]
   - **Cons:** [Drawbacks]
   - **Effort:** [Time/complexity]

### Workaround Possibilities
- **Temporary Workaround:** [Description]
- **Risk of Workaround:** [Technical debt/implications]
- **Cleanup Required:** [Future work needed]

---

## 🔄 Alternative Work Available

### Can Progress Continue Elsewhere?
- [ ] **Other tickets can proceed independently**
- [ ] **Parallel work possible on same feature**
- [ ] **No alternative work - complete blocker**

### Suggested Alternative Tasks
1. [TICKET-ID] - [Description] - [Story Points]
2. [TICKET-ID] - [Description] - [Story Points]

### Resource Reallocation Options
- **Agents:** [Which agents can work on alternatives]
- **Developers:** [Who can be reassigned]
- **Timeline:** [How long alternatives will take]

---

## ⏱️ Timeline & Urgency

### Urgency Classification
- [ ] **CRITICAL** - Sprint goal cannot be met
- [ ] **HIGH** - Major sprint impact, delay likely
- [ ] **MEDIUM** - Some impact, manageable delay
- [ ] **LOW** - Minimal impact, alternatives available

### Response Time Needed
- **Resolution Required By:** [Date/Time]
- **Daily Updates Required:** YES | NO
- **Escalation Path:** [Who to escalate to next]

### Communication Plan
- **Status Updates To:** [Stakeholders]
- **Update Frequency:** [How often]
- **Resolution Notification:** [Who to notify]

---

## 📋 Resolution Tracking

### Owner Assignment
- **Assigned To:** [Name/Role]
- **Escalated To:** [Name/Role]
- **Date Assigned:** [YYYY-MM-DD]

### Resolution Steps
- [ ] Step 1: [Action item]
- [ ] Step 2: [Action item]
- [ ] Step 3: [Action item]

### Success Criteria
[How will we know this blocker is resolved?]

---

## 📝 Status Updates

### [DATE] - [TIME]
**Status:** [Current status]
**Progress:** [What was done]
**Next Steps:** [What's happening next]
**Updated By:** [Name]

### [DATE] - [TIME]
**Status:** [Current status]
**Progress:** [What was done]
**Next Steps:** [What's happening next]
**Updated By:** [Name]

---

## ✅ Resolution Summary

**Resolution Date:** [YYYY-MM-DD]
**Resolution Method:** [How it was resolved]
**Total Time Blocked:** [X hours/days]
**Final Impact:** [Actual impact on sprint]

### What Worked
[What solution ultimately resolved the blocker]

### Lessons Learned
[What we learned to prevent similar blockers]

### Process Improvements
[Suggested improvements to prevent/handle similar blockers]

---

## 📚 Related Information

### Related Tickets
- [TICKET-ID] - [Relationship]
- [TICKET-ID] - [Relationship]

### Documentation References
- [Link to relevant docs]
- [Link to specifications]

### Communication Log
- **Slack/Discord:** [Links to relevant conversations]
- **GitHub Issues:** [Related issue numbers]
- **Email Threads:** [If applicable]

---

## 🏷️ Classification Tags

**Stage:** [STAD Stage 0-4]
**Sprint:** [Sprint Number]
**Epic:** [Epic Name]
**Component:** [System component affected]
**Severity:** [How severe the impact]
**Root Cause:** [Ultimate cause category]

---

*Use this template to ensure comprehensive blocker documentation and efficient escalation within the STAD protocol framework.*