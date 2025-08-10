# VCS Integration Agent

Automated GitHub/GitLab integration with PR management, issue sync, CI/CD monitoring, and intelligent conflict resolution.

## Features

### 🚀 Pull Request Automation
- **Automated PR Creation** with templated descriptions, labels, and reviewers
- **Smart Template Selection** based on ticket type and scope
- **Auto-Assignment** of reviewers and assignees based on code changes
- **Label Management** with automatic categorization
- **Merge Automation** with branch protection enforcement

### 🔄 Issue Synchronization  
- **Bidirectional Sync** between VCS issues and Dev-Agency tickets
- **Real-time Updates** with webhook-driven synchronization
- **Status Mapping** with configurable field mapping
- **Bulk Operations** for managing multiple issues
- **Conflict Resolution** for sync conflicts

### 📊 CI/CD Pipeline Monitoring
- **Pipeline Status Tracking** with real-time updates
- **Failure Analysis** with intelligent root cause detection
- **Retry Strategies** with automated retry recommendations
- **Performance Metrics** and trend analysis
- **Alert Management** for critical pipeline failures

### ⚡ Smart Conflict Resolution
- **Conflict Detection** with detailed analysis
- **Resolution Suggestions** based on conflict patterns
- **Auto-Resolution** for low-risk conflicts
- **Risk Assessment** with safety validation
- **Resolution History** and pattern learning

### 🛡️ Security Integration
- **Vulnerability Scanning** on pull requests
- **Dependency Analysis** with security alerts
- **Secret Detection** and remediation
- **Compliance Checking** with policy enforcement
- **Security Metrics** and reporting

### 🔌 Multi-Platform Support
- **GitHub Integration** with REST and GraphQL APIs
- **GitLab Integration** with comprehensive API coverage
- **Webhook Processing** for real-time events
- **Rate Limiting** with intelligent quota management
- **Error Handling** with retry mechanisms

## Installation

```bash
cd tools/vcs-integration
npm install
npm run build
```

## Quick Start

### Basic Configuration

```typescript
import { VCSAgentCore, createVCSAgentConfig, createRepositoryConfig } from '@dev-agency/vcs-integration';

// Create repository configuration
const repoConfig = createRepositoryConfig(
  'my-repo',
  'my-org', 
  'my-project',
  'github',
  {
    token: process.env.GITHUB_TOKEN,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET
  }
);

// Create agent configuration
const agentConfig = createVCSAgentConfig([repoConfig], {
  automation: {
    prCreation: true,
    issueSync: true,
    pipelineMonitoring: true,
    conflictResolution: true,
    securityScanning: true,
    releaseManagement: true
  }
});

// Initialize VCS agent
const vcsAgent = new VCSAgentCore(agentConfig);
await vcsAgent.initialize();
```

### Creating a Pull Request

```typescript
import { PRConfig } from '@dev-agency/vcs-integration';

const prConfig: PRConfig = {
  repository: 'my-repo',
  owner: 'my-org',
  repo: 'my-project',
  sourceBranch: 'feature/TICKET-123',
  targetBranch: 'main',
  title: 'Add user authentication feature',
  template: 'feature',
  ticketId: 'TICKET-123',
  draft: false,
  autoAssignReviewers: true,
  reviewers: ['senior-dev', 'tech-lead'],
  assignees: ['feature-author'],
  labels: ['enhancement', 'authentication'],
  context: {
    summary: 'Implements OAuth 2.0 authentication with JWT tokens',
    changes: [
      { description: 'Added authentication middleware' },
      { description: 'Implemented JWT token validation' },
      { description: 'Added user session management' }
    ]
  }
};

const result = await vcsAgent.createPullRequest('my-repo', prConfig);

if (result.success) {
  console.log('PR created:', result.result.url);
} else {
  console.error('PR creation failed:', result.error);
}
```

### Issue Synchronization

```typescript
// Enable automatic issue sync
const syncResult = await vcsAgent.syncIssues('my-repo');

console.log(`Synced ${syncResult.result.synced} issues`);
console.log(`Failed: ${syncResult.result.failed}`);
console.log(`Conflicts: ${syncResult.result.conflicts}`);
```

### Pipeline Monitoring

```typescript
// Monitor recent pipelines
const monitorResult = await vcsAgent.monitorPipelines('my-repo');

if (monitorResult.success) {
  const { totalPipelines, failedPipelines, recentFailures } = monitorResult.result;
  
  console.log(`Monitored ${totalPipelines} pipelines`);
  console.log(`Found ${failedPipelines} failures`);
  
  recentFailures.forEach(failure => {
    console.log(`Pipeline ${failure.pipelineId}: ${failure.errorMessage}`);
    console.log(`Suggested fix: ${failure.suggestedFix}`);
  });
}
```

### Conflict Analysis

```typescript
// Analyze conflicts in a pull request
const conflictResult = await vcsAgent.analyzeConflicts('my-repo', 123);

if (conflictResult.success) {
  const analysis = conflictResult.result;
  
  console.log(`Conflict type: ${analysis.conflictType}`);
  console.log(`Severity: ${analysis.severity}`);
  console.log(`Auto-resolvable: ${analysis.autoResolvable}`);
  
  analysis.resolutionSuggestions.forEach(suggestion => {
    console.log(`Strategy: ${suggestion.strategy} (${suggestion.confidence}% confidence)`);
    console.log(`Reasoning: ${suggestion.reasoning}`);
  });
}
```

## Configuration

### Repository Settings

```typescript
const repositorySettings = {
  prAutomation: {
    enabled: true,
    autoAssignReviewers: true,
    autoLabeling: true,
    templateMapping: {
      'feature': 'enhancement,feature',
      'bugfix': 'bug,fix',
      'refactor': 'refactor,improvement',
      'hotfix': 'hotfix,urgent,bug'
    },
    defaultReviewers: ['senior-dev-1', 'senior-dev-2']
  },
  issueSync: {
    enabled: true,
    bidirectional: true,
    syncFrequency: 'realtime',
    statusMapping: {
      'open': 'TODO',
      'in_progress': 'IN_PROGRESS',
      'closed': 'DONE'
    }
  },
  branchProtection: {
    enabled: true,
    requireReviews: true,
    requiredChecks: ['ci/tests', 'ci/lint', 'ci/security'],
    enforceAdmins: false
  },
  conflictResolution: {
    autoResolve: true,
    maxRiskLevel: 'low',
    requireApproval: false
  }
};
```

### Security Configuration

```typescript
const securityConfig = {
  scanOnPR: true,
  blockOnVulnerabilities: true,
  allowedSeverities: ['low', 'medium'],
  secretScanning: true,
  dependencyScanning: true
};
```

### Webhook Configuration

```typescript
const webhookConfig = {
  id: 'main-webhook',
  url: 'https://your-domain.com/webhooks/vcs',
  events: [
    'pull_request',
    'issues', 
    'push',
    'check_run',
    'check_suite'
  ],
  secret: process.env.WEBHOOK_SECRET,
  repositories: ['my-org/my-project']
};
```

## Templates

### PR Templates

The agent supports customizable PR templates for different types of changes:

- **Feature Template** (`feature.md`) - For new features and enhancements
- **Bug Fix Template** (`bugfix.md`) - For bug fixes and patches
- **Refactor Template** (`refactor.md`) - For code refactoring
- **Hotfix Template** (`hotfix.md`) - For urgent production fixes
- **Release Template** (`release.md`) - For release preparations

Templates use Mustache syntax for variable substitution:

```markdown
# 🚀 Feature: {{ticketId}} - {{title}}

## Summary
{{summary}}

## Changes Made
{{#changes}}
- [ ] {{description}}
{{/changes}}

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests verified
- [ ] Manual testing completed
```

### Issue Templates

Similar template system for issues:

- **Bug Report** (`bug-report.md`) - For bug reports
- **Feature Request** (`feature-request.md`) - For feature requests
- **Task** (`task.md`) - For general tasks
- **Epic** (`epic.md`) - For large initiatives

## Webhook Processing

### Real-time Event Handling

The agent processes webhooks for real-time integration:

```typescript
// Process incoming webhook
app.post('/webhooks/vcs', async (req, res) => {
  const event: VCSEvent = {
    id: req.headers['x-delivery-id'],
    eventType: req.headers['x-event-type'],
    platform: 'github',
    timestamp: new Date(),
    repository: req.body.repository,
    sender: req.body.sender,
    payload: req.body,
    signature: req.headers['x-hub-signature-256'],
    processed: false,
    processingErrors: [],
    retryCount: 0
  };

  const result = await vcsAgent.processWebhook(event);
  
  if (result.success) {
    res.status(200).json({ status: 'processed' });
  } else {
    res.status(500).json({ error: result.errors });
  }
});
```

### Supported Events

**GitHub Events:**
- `pull_request` - PR opened, closed, merged, etc.
- `issues` - Issue opened, closed, assigned, etc.
- `push` - Code pushed to repository
- `check_run` / `check_suite` - CI/CD status updates
- `deployment` - Deployment status changes
- `release` - Release created or published

**GitLab Events:**
- `merge_request` - MR opened, closed, merged, etc.
- `issues` - Issue events
- `push` - Push events
- `pipeline` - Pipeline status changes
- `job` - Job completion events
- `deployment` - Deployment events

## API Reference

### VCSAgentCore

Main orchestrator class for VCS operations.

#### Methods

##### `createPullRequest(repositoryId: string, config: PRConfig): Promise<VCSOperationResult>`

Creates a new pull request with automated template application and reviewer assignment.

##### `updatePullRequest(repositoryId: string, prId: string | number, updates: Partial<PRConfig>): Promise<VCSOperationResult>`

Updates an existing pull request.

##### `mergePullRequest(repositoryId: string, prId: string | number, options?: MergeOptions): Promise<VCSOperationResult>`

Merges a pull request with branch protection validation.

##### `syncIssues(repositoryId: string): Promise<VCSOperationResult>`

Synchronizes issues between VCS and Dev-Agency tickets.

##### `monitorPipelines(repositoryId: string): Promise<VCSOperationResult>`

Monitors recent pipeline executions and analyzes failures.

##### `analyzeConflicts(repositoryId: string, prId: string | number): Promise<VCSOperationResult>`

Analyzes merge conflicts and provides resolution suggestions.

##### `processWebhook(event: VCSEvent): Promise<EventProcessingResult>`

Processes incoming webhook events for real-time integration.

### VCSAdapter Interface

Base interface for platform-specific adapters.

#### GitHub Adapter

Implements GitHub-specific API integration with rate limiting and error handling.

#### GitLab Adapter  

Implements GitLab-specific API integration (planned).

## Monitoring & Metrics

### Operation Metrics

```typescript
const metrics = vcsAgent.getMetrics();

console.log(`Total operations: ${metrics.totalOperations}`);
console.log(`Success rate: ${metrics.successRate * 100}%`);
console.log(`Average response time: ${metrics.averageResponseTime}ms`);
```

### Repository Metrics

```typescript
const repoMetrics = vcsAgent.getRepositoryMetrics('my-repo');

console.log('Pull Requests:', repoMetrics.pullRequests);
console.log('Issues:', repoMetrics.issues);
console.log('Conflicts:', repoMetrics.conflicts);
console.log('Security:', repoMetrics.security);
```

### Operation History

```typescript
const history = vcsAgent.getOperationHistory(50);

history.forEach(op => {
  console.log(`${op.timestamp}: ${op.operation} ${op.target} - ${op.success ? 'SUCCESS' : 'FAILED'} (${op.duration}ms)`);
});
```

## Error Handling

The agent provides comprehensive error handling with specific error types:

```typescript
import { 
  VCSIntegrationError,
  VCSAuthenticationError, 
  VCSRateLimitError,
  VCSNotFoundError,
  VCSValidationError
} from '@dev-agency/vcs-integration';

try {
  await vcsAgent.createPullRequest('my-repo', prConfig);
} catch (error) {
  if (error instanceof VCSAuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof VCSRateLimitError) {
    console.error('Rate limit exceeded, retry at:', error.details.resetTime);
  } else if (error instanceof VCSValidationError) {
    console.error('Validation errors:', error.details.validationErrors);
  }
}
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Coverage Report

```bash
npm run test:coverage
```

## Development

### Building

```bash
npm run build        # Compile TypeScript
npm run build:watch  # Watch mode
```

### Linting

```bash
npm run lint         # Check linting
npm run lint:fix     # Fix linting issues
```

### Formatting

```bash
npm run format       # Format code with Prettier
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**Part of the Dev-Agency ecosystem** - Enterprise-grade development automation and workflow management.