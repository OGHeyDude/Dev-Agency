# 🐛 Bug Fix: {{ticketId}} - {{title}}

## Problem Description
{{#problem}}
{{description}}
{{/problem}}
{{^problem}}
**Bug Summary**: Brief description of the bug and its impact

**Affected Users**: Who is impacted by this bug
**Severity**: Critical/High/Medium/Low
**Frequency**: How often does this occur
{{/problem}}

## Root Cause Analysis
{{#rootCause}}
**Primary Cause**: {{primary}}

**Contributing Factors**:
{{#factors}}
- {{description}}
{{/factors}}

**Timeline**: {{timeline}}
{{/rootCause}}
{{^rootCause}}
**Primary Cause**: [What specifically caused this bug]

**Contributing Factors**:
- [Environmental factors]
- [Code/design issues]
- [Process gaps]

**Why wasn't this caught earlier**: [Testing/review gaps]
{{/rootCause}}

## Solution Implemented
{{#solution}}
{{description}}

**Changes Made**:
{{#changes}}
- {{file}}: {{change}}
{{/changes}}
{{/solution}}
{{^solution}}
**Fix Description**: [Detailed explanation of the fix]

**Code Changes**:
- [File/module modified]
- [Logic changes made]
- [Error handling improvements]

**Approach Considered**: [Alternative solutions considered]
{{/solution}}

## Testing & Verification
{{#testing}}
**Reproduction Steps** (Before Fix):
{{#reproductionSteps}}
1. {{step}}
{{/reproductionSteps}}

**Verification Steps** (After Fix):
{{#verificationSteps}}
1. {{step}}
{{/verificationSteps}}

**Test Results**: {{results}}
{{/testing}}
{{^testing}}
**Bug Reproduction** (Before Fix):
1. [Steps to reproduce the original bug]
2. [Expected vs actual behavior]

**Fix Verification** (After Fix):
1. [Steps to verify the fix works]
2. [Confirmed expected behavior]

**Test Coverage**:
- [ ] Unit tests added for the bug scenario
- [ ] Integration tests updated
- [ ] Manual testing in staging environment
- [ ] Regression testing completed
{{/testing}}

## Risk Assessment
{{#risk}}
- **Change Risk**: {{changeRisk}}
- **Business Impact**: {{businessImpact}}  
- **Technical Risk**: {{technicalRisk}}
- **Rollback Complexity**: {{rollbackComplexity}}
{{/risk}}
{{^risk}}
- **Change Risk**: Low/Medium/High
- **Business Impact**: [Impact if fix fails or causes regression]
- **Technical Risk**: [Potential for side effects]
- **Rollback Complexity**: Simple/Moderate/Complex
{{/risk}}

## Regression Prevention
{{#prevention}}
**Process Improvements**:
{{#processImprovements}}
- {{improvement}}
{{/processImprovements}}

**Monitoring Enhancements**:
{{#monitoring}}
- {{enhancement}}
{{/monitoring}}

**Testing Improvements**:
{{#testingImprovements}}
- {{improvement}}
{{/testingImprovements}}
{{/prevention}}
{{^prevention}}
**New Tests Added**:
- [ ] Unit test covering this bug scenario
- [ ] Integration test for the affected workflow
- [ ] Edge case testing enhanced

**Monitoring/Alerting**:
- [ ] Error monitoring improved for this scenario
- [ ] Performance metrics added if applicable
- [ ] User impact tracking enhanced

**Process Changes**:
- [ ] Code review checklist updated
- [ ] Testing procedures enhanced
- [ ] Documentation improved
{{/prevention}}

## Performance Impact
{{#performance}}
- **Before Fix**: {{before}}
- **After Fix**: {{after}}
- **Impact**: {{impact}}
{{/performance}}
{{^performance}}
- **Performance Impact**: Positive/Neutral/Negative
- **Metrics**: [Any performance changes observed]
- **Monitoring**: [Performance metrics to watch post-deploy]
{{/performance}}

## Security Implications
{{#security}}
- **Security Risk**: {{risk}}
- **Vulnerabilities Fixed**: {{vulnerabilities}}
- **New Attack Vectors**: {{attackVectors}}
{{/security}}
{{^security}}
- **Security Impact**: [Any security implications of this fix]
- **Vulnerabilities**: [Security issues resolved]
- **New Risks**: [Any new security considerations]
{{/security}}

## Rollback Plan
{{#rollback}}
**Rollback Strategy**: {{strategy}}

**Rollback Steps**:
{{#steps}}
1. {{step}}
{{/steps}}

**Rollback Timeline**: {{timeline}}
**Rollback Testing**: {{testing}}
{{/rollback}}
{{^rollback}}
**Quick Rollback Available**: Yes/No

**Rollback Steps**:
1. [Immediate actions to revert the change]
2. [Database rollback if needed]
3. [Configuration reset steps]

**Monitoring During Rollback**:
- [ ] Error rates return to baseline
- [ ] Performance metrics stabilize
- [ ] User reports decrease
{{/rollback}}

## Deployment Considerations
{{#deployment}}
**Deployment Type**: {{type}}
**Special Instructions**: {{instructions}}
**Timing Requirements**: {{timing}}
**Coordination Required**: {{coordination}}
{{/deployment}}
{{^deployment}}
**Deployment Strategy**: [Immediate/Scheduled/Canary/Blue-Green]
**Pre-deployment Checklist**:
- [ ] Staging environment tested
- [ ] Database migrations ready (if applicable)
- [ ] Monitoring dashboard prepared
- [ ] Team notifications sent

**Post-deployment Monitoring**:
- [ ] Error rates within normal range
- [ ] User feedback monitoring
- [ ] Performance metrics stable
{{/deployment}}

## Communication Plan
{{#communication}}
**Internal Teams**: {{internal}}
**External Stakeholders**: {{external}}
**User Communication**: {{user}}
{{/communication}}
{{^communication}}
**Team Notifications**:
- [ ] Engineering team informed
- [ ] QA team notified
- [ ] Product/Support team updated

**User Communication** (if applicable):
- [ ] User-facing change requires notification
- [ ] Support team prepared for potential inquiries
- [ ] Documentation updated
{{/communication}}

## Checklist
- [ ] Root cause clearly identified and documented
- [ ] Fix addresses the root cause, not just symptoms
- [ ] Bug reproduction steps verified
- [ ] Fix verification completed
- [ ] Regression tests added
- [ ] Code review focused on bug fix logic
- [ ] Performance impact assessed
- [ ] Security implications reviewed
- [ ] Rollback plan documented and tested
- [ ] Monitoring/alerting enhanced
- [ ] Team and stakeholders informed

## Related Issues
{{#relatedIssues}}
- {{type}} #{{number}}: {{title}}
{{/relatedIssues}}
{{^relatedIssues}}
Fixes #[issue-number]
Related to {{ticketId}}
{{/relatedIssues}}

---
**Dev-Agency Ticket**: [{{ticketId}}]({{specLink}})
**Bug Severity**: {{severity}}
**Fix Complexity**: {{complexity}}
**Hotfix Required**: {{#hotfix}}🚨 Yes{{/hotfix}}{{^hotfix}}❌ No{{/hotfix}}