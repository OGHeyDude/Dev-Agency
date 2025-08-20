---
title: Risk Assessment Template
description: Comprehensive template for identifying, analyzing, and managing project risks
type: template
category: project-management
tags: [risk-management, assessment, planning, mitigation, enterprise]
created: 2025-08-15
updated: 2025-08-15
version: 1.0
---

# Risk Assessment Template

**Project:** [Project Name]  
**Version:** [Version Number]  
**Date:** [Assessment Date]  
**Prepared By:** [Risk Assessor Name/Team]  
**Review Date:** [Next Review Date]  
**Status:** [Draft/Under Review/Approved/Active]

---

## Executive Summary

**Overall Risk Level:** [Low/Medium/High/Critical]  
**Key Risk Areas:** [List top 3-5 risk categories]  
**Immediate Actions Required:** [Critical mitigation steps needed]  
**Risk Owner:** [Primary responsible party]

---

## 1. Risk Identification

### 1.1 Technical Risks
| Risk ID | Risk Description | Source/Trigger | Category |
|---------|------------------|----------------|----------|
| TR-001 | [e.g., Legacy system integration failure] | [e.g., API deprecation] | Integration |
| TR-002 | [e.g., Performance degradation under load] | [e.g., Increased user volume] | Performance |
| TR-003 | [e.g., Third-party service dependency] | [e.g., Service outage] | External |

### 1.2 Business Risks
| Risk ID | Risk Description | Source/Trigger | Category |
|---------|------------------|----------------|----------|
| BR-001 | [e.g., Budget overrun due to scope creep] | [e.g., Changing requirements] | Financial |
| BR-002 | [e.g., Delayed market entry] | [e.g., Development delays] | Timeline |
| BR-003 | [e.g., Competitor advantage] | [e.g., Similar product launch] | Market |

### 1.3 Operational Risks
| Risk ID | Risk Description | Source/Trigger | Category |
|---------|------------------|----------------|----------|
| OR-001 | [e.g., Key personnel unavailability] | [e.g., Illness, resignation] | Resources |
| OR-002 | [e.g., Infrastructure failure] | [e.g., Server outage] | Infrastructure |
| OR-003 | [e.g., Process breakdown] | [e.g., Communication gaps] | Process |

### 1.4 Security Risks
| Risk ID | Risk Description | Source/Trigger | Category |
|---------|------------------|----------------|----------|
| SR-001 | [e.g., Data breach exposure] | [e.g., Inadequate encryption] | Data Security |
| SR-002 | [e.g., Unauthorized access] | [e.g., Weak authentication] | Access Control |
| SR-003 | [e.g., Code injection attacks] | [e.g., Input validation gaps] | Application Security |

---

## 2. Risk Probability Matrix

### Probability Levels
| Level | Description | Likelihood |
|-------|-------------|------------|
| **High (5)** | Very likely to occur (>70%) | Almost certain |
| **Medium-High (4)** | Likely to occur (50-70%) | Probable |
| **Medium (3)** | May occur (30-50%) | Possible |
| **Medium-Low (2)** | Unlikely to occur (10-30%) | Unlikely |
| **Low (1)** | Very unlikely to occur (<10%) | Rare |

### Assessment Criteria
- **Historical Data:** Past project experiences
- **Expert Judgment:** Team and stakeholder input
- **Environmental Factors:** Current market/technical conditions
- **Trend Analysis:** Industry and technology trends

---

## 3. Risk Impact Analysis

### Impact Severity Levels
| Level | Cost Impact | Schedule Impact | Quality Impact | Scope Impact |
|-------|-------------|-----------------|----------------|--------------|
| **Critical (5)** | >50% budget increase | >6 months delay | System unusable | Major scope reduction |
| **High (4)** | 25-50% budget increase | 3-6 months delay | Significant defects | Moderate scope reduction |
| **Medium (3)** | 10-25% budget increase | 1-3 months delay | Minor defects | Small scope changes |
| **Low (2)** | 5-10% budget increase | 2-4 weeks delay | Cosmetic issues | Minimal scope impact |
| **Minimal (1)** | <5% budget increase | <2 weeks delay | No significant impact | No scope impact |

### Business Impact Categories
- **Financial:** Revenue loss, cost overruns, ROI reduction
- **Reputation:** Brand damage, customer trust, market position
- **Operational:** Service disruption, productivity loss
- **Compliance:** Regulatory violations, legal exposure
- **Strategic:** Competitive disadvantage, missed opportunities

---

## 4. Risk Score Calculation

**Formula:** Risk Score = Probability × Impact

### Risk Score Matrix
|  | Impact Level |  |  |  |  |
|--|--------------|--|--|--|--|
| **Probability** | **1 (Minimal)** | **2 (Low)** | **3 (Medium)** | **4 (High)** | **5 (Critical)** |
| **5 (High)** | 5 (Medium) | 10 (High) | 15 (High) | 20 (Critical) | 25 (Critical) |
| **4 (Medium-High)** | 4 (Low) | 8 (Medium) | 12 (High) | 16 (High) | 20 (Critical) |
| **3 (Medium)** | 3 (Low) | 6 (Medium) | 9 (Medium) | 12 (High) | 15 (High) |
| **2 (Medium-Low)** | 2 (Low) | 4 (Low) | 6 (Medium) | 8 (Medium) | 10 (High) |
| **1 (Low)** | 1 (Low) | 2 (Low) | 3 (Low) | 4 (Low) | 5 (Medium) |

### Risk Level Classifications
- **Critical (20-25):** Immediate action required
- **High (12-19):** Urgent attention needed
- **Medium (6-11):** Monitor and plan mitigation
- **Low (1-5):** Accept or minimal mitigation

---

## 5. Risk Categories

### 5.1 Performance Risks
- **Load/Stress:** System performance under peak usage
- **Scalability:** Ability to handle growth
- **Response Time:** User experience degradation
- **Resource Utilization:** CPU, memory, storage constraints

### 5.2 Security Risks
- **Authentication:** Identity verification weaknesses
- **Authorization:** Access control failures
- **Data Protection:** Encryption and privacy gaps
- **Vulnerability:** Known security flaws

### 5.3 Data Risks
- **Data Loss:** Backup and recovery failures
- **Data Corruption:** Integrity issues
- **Data Privacy:** Compliance violations
- **Data Migration:** Transfer and transformation errors

### 5.4 Integration Risks
- **API Changes:** Third-party service modifications
- **Protocol Compatibility:** Communication standard mismatches
- **Data Format:** Schema or structure conflicts
- **Service Dependencies:** External system failures

### 5.5 User Experience Risks
- **Usability:** Interface confusion or difficulty
- **Accessibility:** Compliance with accessibility standards
- **Browser Compatibility:** Cross-platform functionality
- **Mobile Responsiveness:** Device-specific issues

---

## 6. Mitigation Strategies

### 6.1 Preventive Measures
| Risk Category | Strategy Type | Actions |
|---------------|---------------|---------|
| Technical | **Design Reviews** | Architecture validation, code reviews, security audits |
| Process | **Quality Gates** | Checkpoints, approvals, testing requirements |
| Resources | **Contingency Planning** | Backup personnel, cross-training, documentation |
| External | **Vendor Management** | SLAs, backup providers, contract terms |

### 6.2 Reactive Measures
| Risk Category | Response Type | Actions |
|---------------|---------------|---------|
| Critical | **Emergency Response** | Incident team activation, rollback procedures |
| High | **Rapid Response** | Quick fixes, temporary workarounds |
| Medium | **Planned Response** | Scheduled mitigation, resource allocation |
| Low | **Monitoring Response** | Increased observation, trend analysis |

---

## 7. Contingency Plans

### 7.1 Critical Risk Scenarios
| Scenario | Trigger Conditions | Response Team | Actions |
|----------|-------------------|---------------|---------|
| [e.g., Database Failure] | [e.g., >30 min downtime] | [DBA, DevOps, PM] | [Activate backup, notify users, assess damage] |
| [e.g., Security Breach] | [e.g., Unauthorized access detected] | [Security, Legal, Communications] | [Isolate systems, assess impact, notify authorities] |
| [e.g., Key Personnel Loss] | [e.g., Lead developer resignation] | [HR, PM, Team Lead] | [Knowledge transfer, temporary assignment, recruitment] |

### 7.2 Decision Trees
```
Risk Event Occurs
├── Assess Severity
│   ├── Critical → Emergency Response
│   ├── High → Rapid Response
│   └── Medium/Low → Standard Response
├── Activate Response Team
├── Execute Mitigation Plan
├── Monitor Results
└── Document Lessons Learned
```

---

## 8. Risk Owners and Responsibilities

### 8.1 Risk Governance Structure
| Role | Responsibilities | Authority Level |
|------|------------------|-----------------|
| **Risk Owner** | Overall accountability for risk management | Strategic decisions |
| **Risk Manager** | Day-to-day risk monitoring and reporting | Operational decisions |
| **Risk Assessor** | Risk identification and analysis | Assessment and recommendation |
| **Mitigation Owner** | Execute specific mitigation actions | Implementation authority |

### 8.2 RACI Matrix
| Activity | Risk Owner | Risk Manager | Team Lead | Developer | Stakeholder |
|----------|------------|--------------|-----------|-----------|-------------|
| Risk Identification | A | R | C | I | I |
| Risk Assessment | A | R | C | C | I |
| Mitigation Planning | A | R | C | C | C |
| Implementation | A | C | R | R | I |
| Monitoring | A | R | C | I | I |

**Legend:** R=Responsible, A=Accountable, C=Consulted, I=Informed

---

## 9. Risk Monitoring and Triggers

### 9.1 Key Risk Indicators (KRIs)
| Risk Category | Indicator | Threshold | Measurement Frequency |
|---------------|-----------|-----------|----------------------|
| Performance | Response time | >2 seconds | Continuous |
| Security | Failed login attempts | >100/hour | Real-time |
| Quality | Bug count | >10 critical bugs | Weekly |
| Schedule | Task completion rate | <80% on time | Daily |

### 9.2 Trigger Events
| Risk ID | Early Warning Signals | Escalation Triggers |
|---------|----------------------|-------------------|
| [TR-001] | [e.g., API response degradation] | [e.g., >5% failure rate] |
| [BR-001] | [e.g., Budget variance >10%] | [e.g., Projected overrun >20%] |
| [OR-001] | [e.g., Team member workload >100%] | [e.g., Key person unavailable >3 days] |

### 9.3 Monitoring Schedule
- **Daily:** Critical risk indicators review
- **Weekly:** Risk register update and trend analysis
- **Monthly:** Risk assessment review and mitigation progress
- **Quarterly:** Comprehensive risk review and strategy adjustment

---

## 10. Escalation Procedures

### 10.1 Escalation Levels
| Level | Criteria | Response Time | Stakeholders |
|-------|----------|---------------|--------------|
| **Level 1** | Medium risk materialization | 4 hours | Team Lead, Risk Manager |
| **Level 2** | High risk materialization | 2 hours | Project Manager, Risk Owner |
| **Level 3** | Critical risk materialization | 1 hour | Executive Team, Stakeholders |
| **Level 4** | Project-threatening event | Immediate | C-Level, Board of Directors |

### 10.2 Communication Protocol
1. **Initial Notification:** Risk Manager to immediate stakeholders
2. **Assessment Update:** Detailed impact analysis within 2 hours
3. **Action Plan:** Mitigation steps communicated within 4 hours
4. **Progress Updates:** Regular status updates every 2-4 hours
5. **Resolution Report:** Final summary within 24 hours of resolution

---

## 11. Risk Register Table

| Risk ID | Risk Description | Category | Probability | Impact | Risk Score | Current Status | Owner | Due Date | Mitigation Actions | Residual Risk |
|---------|------------------|----------|-------------|--------|------------|----------------|-------|----------|-------------------|---------------|
| [TR-001] | [Description] | [Technical] | [3] | [4] | [12-High] | [Active] | [Name] | [Date] | [Actions taken] | [Medium] |
| [BR-001] | [Description] | [Business] | [2] | [5] | [10-High] | [Monitoring] | [Name] | [Date] | [Actions planned] | [Low] |
| [OR-001] | [Description] | [Operational] | [4] | [3] | [12-High] | [Mitigating] | [Name] | [Date] | [In progress] | [Medium] |

### Risk Register Status Definitions
- **Identified:** Risk recognized but not yet analyzed
- **Analyzing:** Risk assessment in progress
- **Planning:** Mitigation strategy development
- **Active:** Risk present and being monitored
- **Mitigating:** Actions being taken to reduce risk
- **Monitoring:** Risk reduced but still being watched
- **Closed:** Risk no longer applicable or fully mitigated

---

## 12. Residual Risk Assessment

### 12.1 Post-Mitigation Risk Levels
| Original Risk ID | Pre-Mitigation Score | Mitigation Effectiveness | Post-Mitigation Score | Residual Risk Level |
|------------------|---------------------|-------------------------|----------------------|-------------------|
| [TR-001] | [12-High] | [60% reduction] | [5-Medium] | [Acceptable] |
| [BR-001] | [10-High] | [40% reduction] | [6-Medium] | [Monitor] |
| [OR-001] | [12-High] | [75% reduction] | [3-Low] | [Acceptable] |

### 12.2 Residual Risk Acceptance Criteria
- **Acceptable:** Risk level within organizational tolerance
- **Monitor:** Risk level requires ongoing attention
- **Mitigate Further:** Additional actions needed
- **Transfer:** Consider insurance or outsourcing
- **Avoid:** Change approach to eliminate risk

### 12.3 Risk Appetite Statement
"[Organization/Project] accepts [Low to Medium] residual risks in [specific areas] to achieve [business objectives], provided that [specific conditions are met] and [monitoring procedures are in place]."

---

## 13. Action Items and Next Steps

### Immediate Actions (Next 7 Days)
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

### Short-term Actions (Next 30 Days)
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

### Long-term Actions (Next 90 Days)
- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

---

## 14. Review and Approval

### Review History
| Version | Date | Reviewer | Changes | Approval Status |
|---------|------|----------|---------|-----------------|
| [1.0] | [Date] | [Name] | [Initial draft] | [Pending] |
| [1.1] | [Date] | [Name] | [Updates] | [Approved] |

### Approval Signatures
- **Risk Owner:** [Name] - [Date] - [Signature]
- **Project Manager:** [Name] - [Date] - [Signature]
- **Stakeholder Representative:** [Name] - [Date] - [Signature]

---

## 15. Appendices

### Appendix A: Risk Assessment Methodologies
- **Qualitative Analysis:** Expert judgment, workshops, interviews
- **Quantitative Analysis:** Monte Carlo simulation, decision trees
- **Hybrid Approach:** Combination of qualitative and quantitative methods

### Appendix B: Risk Categories Reference
- **Strategic Risks:** Market, competitive, regulatory
- **Operational Risks:** Process, people, systems
- **Financial Risks:** Budget, cash flow, investment
- **Compliance Risks:** Legal, regulatory, contractual

### Appendix C: Risk Mitigation Strategies Reference
- **Avoid:** Eliminate the risk entirely
- **Mitigate:** Reduce probability or impact
- **Transfer:** Share or shift risk to others
- **Accept:** Acknowledge and monitor
- **Exploit:** Leverage positive risks (opportunities)

### Appendix D: Related Documents
- [Project Plan]
- [Technical Specifications]
- [Business Requirements]
- [Security Assessment]
- [Quality Assurance Plan]

---

## Usage Instructions

1. **Customize:** Replace all placeholder text in [brackets] with project-specific information
2. **Assess:** Complete all risk identification and analysis sections
3. **Prioritize:** Focus on high and critical risks first
4. **Plan:** Develop detailed mitigation strategies for priority risks
5. **Monitor:** Establish regular review cycles and update procedures
6. **Communicate:** Share with all stakeholders and maintain transparency
7. **Update:** Keep the assessment current as project conditions change

---

**Document Control:**
- **File Location:** [Document repository path]
- **Access Level:** [Confidential/Internal/Public]
- **Retention Period:** [Duration]
- **Next Review:** [Date]

---

*This template is part of the Dev-Agency Development Standards system. For questions or improvements, contact the Risk Management team.*