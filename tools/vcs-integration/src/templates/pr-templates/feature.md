# 🚀 Feature: {{ticketId}} - {{title}}

## Summary
{{summary}}

## Changes Made
{{#changes}}
- [ ] {{description}}
{{/changes}}
{{^changes}}
- [ ] New component/module: [Description]
- [ ] API endpoints: [List endpoints]
- [ ] Database changes: [Schema updates if applicable]
- [ ] Configuration updates: [Config changes if applicable]
{{/changes}}

## Testing
{{#testing}}
- [ ] {{description}}
{{/testing}}
{{^testing}}
- [ ] Unit tests added/updated
- [ ] Integration tests verified
- [ ] Manual testing completed
- [ ] Performance impact assessed
- [ ] Edge cases tested
{{/testing}}

## Documentation
{{#documentation}}
- [ ] {{description}}
{{/documentation}}
{{^documentation}}
- [ ] Code comments updated
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] README changes if needed
{{/documentation}}

## Screenshots/Demo
{{#screenshots}}
![{{alt}}]({{url}})
{{description}}
{{/screenshots}}
{{^screenshots}}
<!-- Add screenshots or GIFs demonstrating the feature -->
{{/screenshots}}

## Performance Impact
{{#performance}}
- **Impact Level**: {{level}}
- **Metrics**: {{metrics}}
- **Optimization Notes**: {{notes}}
{{/performance}}
{{^performance}}
- **Impact Level**: Minimal/Low/Medium/High
- **Metrics**: [Performance metrics if applicable]
- **Load Testing**: [Results if applicable]
{{/performance}}

## Security Considerations
{{#security}}
- **Security Review**: {{review}}
- **Vulnerabilities**: {{vulnerabilities}}
- **Compliance**: {{compliance}}
{{/security}}
{{^security}}
- **Security Review**: [Required for user-facing features]
- **Data Privacy**: [Impact on user data]
- **Authentication**: [Changes to auth flow]
{{/security}}

## Breaking Changes
{{#breakingChanges}}
- ⚠️ **{{type}}**: {{description}}
  - **Migration**: {{migration}}
  - **Timeline**: {{timeline}}
{{/breakingChanges}}
{{^breakingChanges}}
- [ ] No breaking changes
- [ ] Breaking changes documented with migration guide
{{/breakingChanges}}

## Dependencies
{{#dependencies}}
- **{{name}}**: {{version}} - {{reason}}
{{/dependencies}}
{{^dependencies}}
- [ ] No new dependencies added
- [ ] Existing dependencies updated (list if applicable)
{{/dependencies}}

## Rollback Plan
{{#rollback}}
{{plan}}
{{/rollback}}
{{^rollback}}
- [ ] Feature flag available for quick disable
- [ ] Database migrations are reversible
- [ ] Configuration changes documented
- [ ] Monitoring alerts configured
{{/rollback}}

## Post-Deploy Actions
{{#postDeploy}}
- [ ] {{action}}
{{/postDeploy}}
{{^postDeploy}}
- [ ] Monitor error rates and performance metrics
- [ ] Verify feature flags are working correctly  
- [ ] Update team documentation
- [ ] Announce feature to stakeholders
{{/postDeploy}}

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is well-commented and documented
- [ ] Tests cover new functionality
- [ ] All tests pass locally
- [ ] No console errors or warnings
- [ ] Performance impact assessed
- [ ] Security review completed (if required)
- [ ] Breaking changes documented
- [ ] Database migrations tested
- [ ] Feature flags configured correctly

## Related Issues
{{#relatedIssues}}
- {{type}} #{{number}}: {{title}}
{{/relatedIssues}}
{{^relatedIssues}}
Closes #[issue-number]
Related to {{ticketId}}
{{/relatedIssues}}

---
**Dev-Agency Ticket**: [{{ticketId}}]({{specLink}})
**Review Required**: {{#criticalFeature}}🔴 Critical{{/criticalFeature}}{{^criticalFeature}}✅ Standard{{/criticalFeature}}
**Deployment**: {{deploymentType}}