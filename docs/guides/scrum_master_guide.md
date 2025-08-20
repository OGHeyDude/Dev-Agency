---
title: Scrum Master Agent Guide
description: Best practices and procedures for STAD Protocol enforcement
type: guide
category: management
tags: [scrum-master, stad, protocol, validation, enforcement]
created: 2025-08-15
updated: 2025-08-15
---

# Scrum Master Agent Guide

## Overview

The Scrum Master Agent is responsible for enforcing STAD Protocol compliance across all stages of the sprint lifecycle. This guide provides best practices, procedures, and guidelines for effective protocol management.

## Core Responsibilities

### 1. Protocol Enforcement
- Validate all stage transitions
- Ensure gate requirements are met
- Block non-compliant progressions
- Escalate violations immediately

### 2. Handoff Validation
- Check completeness of agent handoffs
- Verify required sections present
- Ensure context adequacy
- Block incomplete transfers

### 3. Sprint Health Monitoring
- Track velocity continuously
- Monitor blocker age and impact
- Assess risk levels
- Report status daily

## Stage-Specific Validation

### Stage 0 → Stage 1
- Epic has business value
- Success metrics defined
- Resources allocated
- Stakeholder approval documented

### Stage 1 → Stage 2
- All tickets have complete specs
- No ticket exceeds 5 story points
- Dependencies mapped in DAG
- Agent assignments complete
- Fallback strategies documented

### Stage 2 → Stage 3
- All code committed with semantic messages
- Tests passing (unit and integration)
- Lint and typecheck clean
- Handoff documents created
- Work reports submitted

### Stage 3 → Stage 4
- Backend QA validation passed
- Review dashboard approved
- All bugs have regression tests
- Performance benchmarks met
- Security scan clean

### Stage 4 → Complete
- Deployment successful
- Documentation updated
- Retrospective complete
- Knowledge graph synchronized
- Templates updated with learnings

## Validation Procedures

### Daily Validation Routine
1. Check all active tickets for status accuracy
2. Verify handoffs for completeness
3. Review blockers and escalate if needed
4. Generate daily standup report
5. Update sprint health metrics

### Gate Validation Process
1. Receive gate transition request
2. Run validation checklist
3. Document any failures
4. Make go/no-go decision
5. Notify relevant parties

### Handoff Validation Steps
1. Check handoff document exists
2. Verify all required sections
3. Assess context completeness
4. Validate knowledge transfer
5. Approve or request revision

## Escalation Protocols

### Warning Level
- Minor deviations from process
- Document in daily report
- Notify team in standup

### Blocker Level
- Gate requirements not met
- Create decision request
- Notify stakeholders

### Critical Level
- Multiple gate failures
- Sprint at risk
- Immediate stakeholder escalation

### Emergency Level
- Complete process breakdown
- Data integrity at risk
- Halt sprint and notify all parties

## Reporting Requirements

### Daily Reports
- Sprint health status
- Handoff chain status
- Blocker summary
- Velocity tracking
- Risk assessment

### Gate Reports
- Validation results
- Pass/fail decision
- Blocking issues
- Required remediation
- Timeline impact

### Compliance Reports
- Protocol adherence metrics
- Violation trends
- Process improvements needed
- Agent performance
- Recommendation summary

## Best Practices

### Consistency
- Apply rules uniformly
- No exceptions without documentation
- Maintain audit trail
- Regular process review

### Communication
- Clear, direct feedback
- Timely escalation
- Comprehensive documentation
- Proactive risk identification

### Continuous Improvement
- Track patterns in violations
- Identify process gaps
- Suggest improvements
- Update procedures regularly

## Common Issues and Solutions

### Issue: Incomplete Handoffs
**Solution:** Block receiving agent, require revision, provide template guidance

### Issue: Gate Failures
**Solution:** Document specific failures, provide remediation steps, set deadline

### Issue: Velocity Deviation
**Solution:** Analyze root causes, adjust planning, escalate if needed

### Issue: Repeated Violations
**Solution:** Additional training, process clarification, escalation if persistent

## Tools and Resources

### Validation Scripts
- `/scripts/stad-validator.sh`
- `/scripts/handoff-checker.sh`
- `/scripts/gate-validator.sh`

### Templates
- Stage gate checklists
- Handoff validation forms
- Compliance report templates
- Escalation templates

### Documentation
- STAD Protocol North Star
- Agent Playbook
- Implementation Plan
- Migration guides

## Metrics to Track

- Gate pass rate
- Handoff success rate
- Blocker resolution time
- Velocity accuracy
- Compliance score
- Violation frequency
- Escalation rate

## Integration Points

- GitHub Project boards
- Git commit validation
- CI/CD pipelines
- Knowledge graph
- Work report system

---

*This guide ensures consistent and effective STAD Protocol enforcement throughout the development lifecycle.*