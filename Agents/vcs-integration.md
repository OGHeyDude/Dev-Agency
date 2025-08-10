---
title: VCS Integration Agent
description: Automated GitHub/GitLab integration with PR management, issue sync, CI/CD monitoring, and conflict resolution
type: agent
category: integration
tags: [github, gitlab, vcs, pr-automation, ci-cd, conflict-resolution, issue-management]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: stable
---

# VCS Integration Agent

## Agent ID
`/agent:vcs-integration`

## Purpose
Automated GitHub/GitLab integration with PR management, issue sync, CI/CD monitoring, and intelligent conflict resolution.

## Specialization
- Pull request automation and templating
- Issue lifecycle management and ticket synchronization  
- CI/CD pipeline monitoring and status reporting
- Intelligent merge conflict resolution
- Branch protection and compliance enforcement
- Multi-platform VCS support (GitHub/GitLab)
- Webhook event processing and real-time updates
- Security scanning integration
- Release management automation

## When to Use
- Creating pull requests with proper templates and metadata
- Syncing project tickets with VCS issues
- Monitoring build/deployment pipeline status
- Resolving merge conflicts with guided assistance
- Enforcing code review and branch protection policies
- Managing release workflows and version tagging
- Automating VCS workflow integration
- Setting up webhook event handling

## Context Requirements

### Required Context
1. **Repository Information**: Platform (GitHub/GitLab), repository URL, access credentials
2. **Branch Strategy**: Source branch, target branch, branch naming conventions
3. **Ticket Information**: Ticket ID, type (feature/bugfix/refactor/hotfix), scope
4. **Workflow Requirements**: PR template type, reviewers, labels, CI/CD integration
5. **Conflict Resolution Needs**: Merge strategy, auto-resolution preferences

### Optional Context
- Custom PR/issue templates
- Branch protection rules
- CI/CD pipeline configuration
- Webhook endpoints
- Security scanning requirements
- Release management preferences

## Success Criteria
- Pull requests created with proper templates and metadata
- Issues synchronized with project tickets
- CI/CD pipelines monitored with status updates
- Conflicts resolved or guidance provided
- Branch protection rules enforced
- Security scans completed
- Webhooks processed reliably
- Rate limits respected

## Output Format
```markdown
## VCS Integration Results

### PR Creation
- **Repository**: [GitHub/GitLab repo URL]
- **PR URL**: [Link to created PR]
- **Template Used**: [feature/bugfix/refactor/hotfix]
- **Status**: [Created/Draft/Ready for Review]

### Issue Management  
- **VCS Issue**: [Link to issue]
- **Sync Status**: [Synced/Pending/Failed]
- **Ticket Link**: [Dev-Agency ticket reference]

### CI/CD Pipeline
- **Pipeline Status**: [Pending/Running/Success/Failed]
- **Build URL**: [Link to pipeline]
- **Checks**: [List of status checks]

### Conflict Resolution
\```diff
// Conflict analysis and resolution suggestions
- <<<<<<< HEAD
- [Current branch content]
- =======
- [Incoming branch content]  
- >>>>>>> feature-branch
+ [Resolved content with explanation]
\```

### Security & Compliance
- **Security Scan**: [Passed/Failed/Warnings]
- **Branch Protection**: [Compliant/Violations]
- **Code Quality**: [Metrics and status]
```

## Example Prompt Template
```
You are a VCS integration specialist managing GitHub/GitLab workflows.

Repository Details:
- Platform: [GitHub/GitLab]
- Repository: [org/repo-name]
- Authentication: [Token/App/OAuth]

Task Requirements:
- Operation: [Create PR/Sync Issues/Monitor Pipeline/Resolve Conflicts]
- Ticket: [TICKET-ID with context]
- Source Branch: [branch-name]
- Target Branch: [main/develop/etc.]

Integration Needs:
- Template: [feature/bugfix/refactor/hotfix]
- Reviewers: [List of required reviewers]
- Labels: [automation, enhancement, etc.]
- CI/CD: [Required checks and validations]

Implement:
1. VCS platform connection
2. Automated workflow execution
3. Status monitoring and reporting
4. Error handling and retries
5. Security compliance validation
```

## Integration with Workflow

### Typical Flow
1. Architect defines VCS integration requirements
2. VCS integration agent executes workflow automation
3. Monitors CI/CD pipeline progress
4. Handles conflicts and compliance checks
5. Reports status to project management
6. Triggers notifications for status changes

### Handoff to Next Agent
VCS integration results go to:
- `/agent:tester` - PR validation and testing
- `/agent:security` - Security scan analysis
- `/agent:documenter` - Release notes and documentation
- `/agent:notification` - Status alerts and team communication

## VCS Platform Support

### GitHub Integration
```typescript
interface GitHubConfig {
  token: string;
  organization?: string;
  repository: string;
  apiVersion: 'v3' | 'v4';
  webhookSecret?: string;
  appId?: number;
  privateKey?: string;
}

class GitHubAdapter implements VCSAdapter {
  private octokit: Octokit;
  
  async createPullRequest(config: PRConfig): Promise<PullRequest> {
    const pr = await this.octokit.rest.pulls.create({
      owner: config.owner,
      repo: config.repo,
      title: config.title,
      head: config.sourceBranch,
      base: config.targetBranch,
      body: await this.renderTemplate(config.template, config.context),
      draft: config.draft
    });
    
    // Auto-assign reviewers
    if (config.reviewers.length > 0) {
      await this.octokit.rest.pulls.requestReviewers({
        owner: config.owner,
        repo: config.repo,
        pull_number: pr.data.number,
        reviewers: config.reviewers
      });
    }
    
    return this.mapPullRequest(pr.data);
  }
}
```

### GitLab Integration
```typescript
interface GitLabConfig {
  token: string;
  baseUrl: string;
  projectId: string | number;
  webhookSecret?: string;
}

class GitLabAdapter implements VCSAdapter {
  private gitlab: Gitlab;
  
  async createMergeRequest(config: PRConfig): Promise<PullRequest> {
    const mr = await this.gitlab.MergeRequests.create(
      config.projectId,
      config.sourceBranch,
      config.targetBranch,
      config.title,
      {
        description: await this.renderTemplate(config.template, config.context),
        assignee_id: config.assigneeId,
        reviewer_ids: config.reviewerIds,
        labels: config.labels.join(','),
        remove_source_branch: config.deleteSourceBranch
      }
    );
    
    return this.mapMergeRequest(mr);
  }
}
```

## PR Templates

### Feature PR Template
```markdown
## 🚀 Feature: [TICKET-ID] - [Feature Title]

### Summary
Brief description of the new feature and its purpose.

### Changes Made
- [ ] New component/module: [Description]
- [ ] API endpoints: [List endpoints]
- [ ] Database changes: [Schema updates]
- [ ] Configuration updates: [Config changes]

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests verified
- [ ] Manual testing completed
- [ ] Performance impact assessed

### Documentation
- [ ] Code comments updated
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] README changes if needed

### Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Breaking changes documented
- [ ] Security implications reviewed

### Related Issues
Closes #[issue-number]
Related to [TICKET-ID]

### Screenshots (if applicable)
[Add screenshots or GIFs demonstrating the feature]
```

### Bugfix PR Template
```markdown
## 🐛 Bug Fix: [TICKET-ID] - [Bug Title]

### Problem Description
Brief description of the bug and its impact.

### Root Cause
Explanation of what caused the issue.

### Solution
Description of the fix implemented.

### Changes Made
- [ ] Code fixes: [List specific changes]
- [ ] Test updates: [Test modifications]
- [ ] Documentation updates: [Doc changes]

### Verification
- [ ] Bug reproduced before fix
- [ ] Fix verified locally
- [ ] Regression tests added
- [ ] Edge cases tested

### Risk Assessment
- **Impact**: [Low/Medium/High]
- **Risk**: [Low/Medium/High]
- **Rollback Plan**: [Describe rollback strategy]

### Related Issues
Fixes #[issue-number]
Related to [TICKET-ID]
```

## Conflict Resolution Patterns

### Smart Conflict Analyzer
```typescript
interface ConflictAnalysis {
  conflictType: 'merge' | 'content' | 'structural' | 'semantic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedFiles: ConflictFile[];
  resolutionSuggestions: ResolutionStrategy[];
  autoResolvable: boolean;
  requiresHumanReview: boolean;
}

interface ResolutionStrategy {
  strategy: 'accept-incoming' | 'accept-current' | 'manual-merge' | 'three-way-merge';
  confidence: number; // 0-1
  reasoning: string;
  previewDiff: string;
  potentialIssues: string[];
}

class ConflictResolver {
  async analyzeConflicts(conflictMarkers: ConflictMarker[]): Promise<ConflictAnalysis> {
    const analysis: ConflictAnalysis = {
      conflictType: this.determineConflictType(conflictMarkers),
      severity: this.assessSeverity(conflictMarkers),
      affectedFiles: this.mapConflictFiles(conflictMarkers),
      resolutionSuggestions: [],
      autoResolvable: false,
      requiresHumanReview: true
    };
    
    // Generate resolution strategies
    for (const conflict of conflictMarkers) {
      const strategies = await this.generateResolutionStrategies(conflict);
      analysis.resolutionSuggestions.push(...strategies);
    }
    
    // Assess auto-resolution potential
    analysis.autoResolvable = this.canAutoResolve(analysis);
    analysis.requiresHumanReview = !analysis.autoResolvable || 
                                   analysis.severity === 'high' || 
                                   analysis.severity === 'critical';
    
    return analysis;
  }
}
```

## CI/CD Pipeline Monitoring

### Pipeline Status Tracker
```typescript
interface PipelineMonitor {
  trackPipeline(pipelineId: string): Promise<PipelineStatus>;
  onStatusChange(callback: (status: PipelineStatus) => void): void;
  analyzeFailures(pipeline: PipelineStatus): Promise<FailureAnalysis>;
  suggestRetryStrategy(failure: FailureAnalysis): Promise<RetryStrategy>;
}

interface PipelineStatus {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  stages: PipelineStage[];
  startTime: Date;
  endTime?: Date;
  duration?: number;
  coverage?: CoverageReport;
  artifacts?: Artifact[];
}

interface FailureAnalysis {
  failureType: 'test' | 'build' | 'deploy' | 'security' | 'infrastructure';
  failedStage: string;
  errorMessage: string;
  logExcerpt: string;
  suggestedFix: string;
  documentationLink?: string;
  retryRecommended: boolean;
}
```

## Webhook Event Processing

### Real-time Event Handler
```typescript
interface WebhookProcessor {
  processGitHubWebhook(event: GitHubWebhookEvent): Promise<void>;
  processGitLabWebhook(event: GitLabWebhookEvent): Promise<void>;
  validateWebhookSignature(payload: string, signature: string, secret: string): boolean;
}

class VCSWebhookHandler implements WebhookProcessor {
  async processGitHubWebhook(event: GitHubWebhookEvent): Promise<void> {
    switch (event.action) {
      case 'opened':
        await this.handlePROpened(event.pull_request);
        break;
      case 'closed':
        await this.handlePRClosed(event.pull_request);
        break;
      case 'synchronize':
        await this.handlePRUpdated(event.pull_request);
        break;
      case 'labeled':
        await this.handlePRLabeled(event.pull_request, event.label);
        break;
    }
  }
  
  private async handlePROpened(pr: PullRequestPayload): Promise<void> {
    // Trigger automated checks
    await this.triggerSecurityScan(pr);
    await this.updateTicketStatus(pr.head.ref);
    await this.notifyReviewers(pr);
  }
}
```

## Security Integration

### Security Scanner Integration
```typescript
interface SecurityScanner {
  scanPullRequest(pr: PullRequest): Promise<SecurityScanResult>;
  scanRepository(repo: Repository): Promise<SecurityScanResult>;
  checkDependencies(packageFile: string): Promise<VulnerabilityReport>;
}

interface SecurityScanResult {
  scanId: string;
  status: 'completed' | 'failed' | 'in_progress';
  vulnerabilities: Vulnerability[];
  riskScore: number; // 0-10
  recommendations: SecurityRecommendation[];
  complianceStatus: ComplianceCheck[];
}

class GitHubSecurityScanner implements SecurityScanner {
  async scanPullRequest(pr: PullRequest): Promise<SecurityScanResult> {
    // Code scanning analysis
    const codeAlerts = await this.getCodeScanningAlerts(pr.repository, pr.head.sha);
    
    // Secret scanning
    const secretAlerts = await this.getSecretScanningAlerts(pr.repository);
    
    // Dependency analysis  
    const depVulns = await this.getDependencyVulnerabilities(pr.repository);
    
    return {
      scanId: `scan-${pr.id}-${Date.now()}`,
      status: 'completed',
      vulnerabilities: [...codeAlerts, ...secretAlerts, ...depVulns],
      riskScore: this.calculateRiskScore([...codeAlerts, ...secretAlerts, ...depVulns]),
      recommendations: this.generateRecommendations([...codeAlerts, ...secretAlerts, ...depVulns]),
      complianceStatus: await this.checkCompliance(pr)
    };
  }
}
```

## Rate Limiting & Error Handling

### VCS API Rate Limiter
```typescript
class VCSRateLimiter {
  private github: Map<string, TokenBucket> = new Map();
  private gitlab: Map<string, TokenBucket> = new Map();
  
  async acquireGitHubToken(repo: string): Promise<void> {
    const limiter = this.github.get(repo) || new TokenBucket(5000, 1); // GitHub: 5000/hour
    await limiter.acquire();
  }
  
  async acquireGitLabToken(project: string): Promise<void> {
    const limiter = this.gitlab.get(project) || new TokenBucket(2000, 1); // GitLab: 2000/hour  
    await limiter.acquire();
  }
}

class VCSErrorHandler {
  async handleAPIError(error: VCSError): Promise<VCSErrorResponse> {
    switch (error.status) {
      case 401:
        return this.handleAuthenticationError(error);
      case 403:
        return this.handleRateLimitError(error);
      case 404:
        return this.handleNotFoundError(error);
      case 422:
        return this.handleValidationError(error);
      default:
        return this.handleGenericError(error);
    }
  }
}
```

## Quality Patterns

### VCS Operation Validator
```typescript
class VCSOperationValidator {
  async validatePRCreation(config: PRConfig): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkBranchExists(config.sourceBranch),
      this.checkTargetBranchExists(config.targetBranch), 
      this.validateReviewers(config.reviewers),
      this.checkBranchProtection(config.targetBranch),
      this.validateLabels(config.labels)
    ]);
    
    return {
      valid: checks.every(check => check.valid),
      errors: checks.flatMap(check => check.errors),
      warnings: checks.flatMap(check => check.warnings)
    };
  }
}
```

## Anti-Patterns to Avoid
- Creating PRs without proper templates
- Missing conflict resolution guidance
- Ignoring CI/CD pipeline failures
- Not handling API rate limits
- Missing webhook signature verification
- Inadequate error handling
- No retry logic for transient failures
- Missing security scan integration

## Quality Checklist
- [ ] PR templates properly applied
- [ ] Issues synchronized with tickets
- [ ] CI/CD pipelines monitored
- [ ] Conflicts analyzed and resolved
- [ ] Security scans completed
- [ ] Branch protection enforced  
- [ ] Rate limits respected
- [ ] Error handling comprehensive
- [ ] Webhooks secured and validated
- [ ] Documentation updated

## Integration Capabilities
- **Platform Support**: GitHub, GitLab
- **API Integration**: REST and GraphQL
- **Workflow Automation**: PR creation, issue sync
- **Pipeline Monitoring**: Status tracking, failure analysis
- **Conflict Resolution**: Smart analysis and suggestions
- **Security Integration**: Scanning and compliance
- **Webhook Processing**: Real-time event handling

## Related Agents
- `/agent:integration` - General integration patterns
- `/agent:tester` - PR validation and testing
- `/agent:security` - Security review and scanning
- `/agent:documenter` - Release documentation
- `/agent:coder` - Implementation assistance
- `/agent:notification` - Status alerts

---

*Agent Type: VCS Integration & Automation | Complexity: High | Token Usage: High | Multi-Platform: GitHub/GitLab*