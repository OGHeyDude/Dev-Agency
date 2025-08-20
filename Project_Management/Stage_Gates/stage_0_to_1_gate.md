---
title: Stage 0 to Stage 1 Gate Criteria
description: Quality gate requirements for transitioning from Strategic Planning to Sprint Preparation
type: gate-criteria
category: stad
tags: [stage-gate, validation, stage-0, stage-1]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# Stage Gate: Stage 0 → Stage 1

## Gate Purpose
Ensure strategic planning is complete and resources are ready before beginning detailed sprint preparation.

## Mandatory Criteria (All Must Pass)

### ✅ Epic Definition
- [ ] Epic clearly defined with business value
- [ ] User stories written in standard format
- [ ] Success metrics defined and measurable
- [ ] Acceptance criteria documented
- [ ] Story point estimate complete (13, 21, 34, 55+ points)

### ✅ Stakeholder Alignment
- [ ] Product owner approval documented
- [ ] Stakeholder priorities confirmed
- [ ] Budget/resource allocation approved
- [ ] Timeline expectations set
- [ ] Success criteria agreed upon

### ✅ Technical Feasibility
- [ ] Technical approach validated
- [ ] Major risks identified and assessed
- [ ] Dependencies mapped
- [ ] Required skills available
- [ ] Infrastructure requirements known

### ✅ Resource Readiness
- [ ] Team capacity confirmed
- [ ] Sprint timeline agreed
- [ ] Required tools/access available
- [ ] Knowledge gaps identified
- [ ] Training needs addressed

## Optional Criteria (Should Have)

### 📋 Documentation
- [ ] High-level architecture documented
- [ ] Integration points identified
- [ ] Security requirements noted
- [ ] Compliance needs assessed
- [ ] Performance targets set

### 📊 Planning Artifacts
- [ ] Roadmap updated
- [ ] Release plan drafted
- [ ] Risk mitigation strategies defined
- [ ] Communication plan established
- [ ] Success metrics tracking setup

## Gate Validation Process

### Automated Checks
```bash
# Check epic exists in PROJECT_PLAN.md
grep -q "Epic:" PROJECT_PLAN.md || exit 1

# Verify story points estimated
grep -q "Story Points:" PROJECT_PLAN.md || exit 1

# Confirm resources allocated
test -f .stad/resources.yml || exit 1
```

### Manual Review Checklist
1. **Business Review**
   - Value proposition clear?
   - ROI justifiable?
   - Strategic alignment confirmed?

2. **Technical Review**
   - Architecture sound?
   - Technology choices appropriate?
   - Scalability considered?

3. **Resource Review**
   - Team available?
   - Skills adequate?
   - Timeline realistic?

## Gate Decision Matrix

| Criteria Met | Action | Next Step |
|-------------|--------|-----------|
| All Mandatory + All Optional | **PROCEED** | Start Stage 1 immediately |
| All Mandatory + Some Optional | **PROCEED WITH NOTES** | Document gaps, start Stage 1 |
| Missing Mandatory | **BLOCKED** | Address gaps before proceeding |
| Major Risks Identified | **REVIEW REQUIRED** | Escalate to stakeholders |

## Blocker Resolution

### If Gate Fails
1. **Document gaps** in `/Project_Management/Gate_Failures/stage_0_gaps.md`
2. **Create action items** for each gap
3. **Assign owners** to resolve blockers
4. **Set target date** for re-validation
5. **Notify stakeholders** of delay

### Common Blockers
| Blocker | Resolution | Typical Duration |
|---------|------------|-----------------|
| Unclear requirements | Stakeholder workshop | 1-2 days |
| Missing resources | Resource allocation meeting | 1-3 days |
| Technical uncertainty | Proof of concept | 3-5 days |
| Budget constraints | Scope adjustment | 2-4 days |

## Gate Artifacts

### Required Outputs
1. **Epic Definition Document**
   - Location: `/Project_Management/Epics/[EPIC_ID].md`
   - Must include all mandatory sections

2. **Resource Allocation**
   - Location: `.stad/resources.yml`
   - Must list team members and capacity

3. **Approval Record**
   - Location: `/Project_Management/Approvals/stage_0_approval.md`
   - Must have stakeholder sign-off

### Success Metrics
- Gate validation time: <2 hours
- First-pass success rate: >80%
- Blocker resolution time: <3 days
- Rework rate: <10%

## Escalation Path

### Severity Levels
1. **Low**: Optional criteria missing → Document and proceed
2. **Medium**: One mandatory criterion missing → Fix within 24 hours
3. **High**: Multiple mandatory missing → Escalate to Product Owner
4. **Critical**: Fundamental issues → Stop and replan

### Escalation Contacts
- **Technical Issues**: Tech Lead / Architect
- **Resource Issues**: Project Manager
- **Business Issues**: Product Owner
- **Budget Issues**: Stakeholder Committee

---

*This gate ensures strategic alignment before tactical planning begins*