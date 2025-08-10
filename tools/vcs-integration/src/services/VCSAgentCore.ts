/**
 * VCS Integration Agent Core - Main orchestrator for VCS operations
 */

import { VCSAdapter, VCSConfig } from '../adapters/BaseVCSAdapter';
import { GitHubAdapter } from '../adapters/GitHubAdapter';
import { 
  PullRequest, 
  PRConfig, 
  PRCreationResult, 
  PRUpdateResult, 
  PRMergeResult 
} from '../models/PullRequest';
import { 
  Issue, 
  IssueCreationConfig, 
  IssueCreationResult,
  IssueSyncResult,
  IssueSyncConfig
} from '../models/Issue';
import { 
  Pipeline,
  PipelineMetrics,
  FailureAnalysis,
  RetryStrategy
} from '../models/Pipeline';
import { 
  ConflictAnalysis,
  ConflictResolutionHistory
} from '../models/ConflictAnalysis';
import { VCSEvent, EventProcessingResult } from '../models/VCSEvent';

export interface VCSAgentConfig {
  platform: 'github' | 'gitlab';
  repositories: RepositoryConfig[];
  webhooks: WebhookConfig[];
  automation: AutomationConfig;
  security: SecurityConfig;
  notifications: NotificationConfig[];
}

export interface RepositoryConfig {
  id: string;
  owner: string;
  name: string;
  platform: 'github' | 'gitlab';
  credentials: VCSConfig;
  settings: RepositorySettings;
}

export interface RepositorySettings {
  prAutomation: {
    enabled: boolean;
    autoAssignReviewers: boolean;
    autoLabeling: boolean;
    templateMapping: Record<string, string>;
    defaultReviewers: string[];
  };
  issueSync: {
    enabled: boolean;
    bidirectional: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    statusMapping: Record<string, string>;
  };
  branchProtection: {
    enabled: boolean;
    requireReviews: boolean;
    requiredChecks: string[];
    enforceAdmins: boolean;
  };
  conflictResolution: {
    autoResolve: boolean;
    maxRiskLevel: 'low' | 'medium' | 'high';
    requireApproval: boolean;
  };
}

export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  repositories: string[];
}

export interface AutomationConfig {
  prCreation: boolean;
  issueSync: boolean;
  pipelineMonitoring: boolean;
  conflictResolution: boolean;
  securityScanning: boolean;
  releaseManagement: boolean;
}

export interface SecurityConfig {
  scanOnPR: boolean;
  blockOnVulnerabilities: boolean;
  allowedSeverities: string[];
  secretScanning: boolean;
  dependencyScanning: boolean;
}

export interface NotificationConfig {
  type: 'slack' | 'email' | 'webhook' | 'teams';
  target: string;
  events: string[];
  filters?: NotificationFilter[];
}

export interface NotificationFilter {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt';
  value: any;
}

export interface VCSOperationResult {
  success: boolean;
  operation: string;
  target: string;
  result?: any;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface VCSMetrics {
  totalOperations: number;
  successRate: number;
  averageResponseTime: number;
  operationsByType: Record<string, number>;
  errorsByType: Record<string, number>;
  repositoryActivity: Record<string, RepositoryMetrics>;
  webhookActivity: WebhookMetrics;
  rateLimit: RateLimitMetrics;
}

export interface RepositoryMetrics {
  pullRequests: {
    created: number;
    merged: number;
    closed: number;
    averageTimeToMerge: number; // hours
  };
  issues: {
    created: number;
    closed: number;
    synced: number;
    averageTimeToClose: number; // hours
  };
  conflicts: {
    total: number;
    autoResolved: number;
    manualResolution: number;
    averageResolutionTime: number; // minutes
  };
  security: {
    scansPerformed: number;
    vulnerabilitiesFound: number;
    secretsFound: number;
    averageScanTime: number; // seconds
  };
}

export interface WebhookMetrics {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  averageProcessingTime: number; // milliseconds
  eventsByType: Record<string, number>;
}

export interface RateLimitMetrics {
  currentUsage: number;
  limit: number;
  resetTime: Date;
  rateLimitHits: number;
}

export class VCSAgentCore {
  private adapters: Map<string, VCSAdapter> = new Map();
  private repositories: Map<string, RepositoryConfig> = new Map();
  private webhooks: Map<string, WebhookConfig> = new Map();
  private config: VCSAgentConfig;
  private metrics: VCSMetrics;
  private operationHistory: VCSOperationResult[] = [];

  constructor(config: VCSAgentConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  async initialize(): Promise<void> {
    // Initialize platform adapters
    for (const repo of this.config.repositories) {
      const adapterId = `${repo.platform}_${repo.id}`;
      
      let adapter: VCSAdapter;
      switch (repo.platform) {
        case 'github':
          adapter = new GitHubAdapter();
          break;
        case 'gitlab':
          // adapter = new GitLabAdapter(); // TODO: Implement GitLab adapter
          throw new Error('GitLab adapter not implemented yet');
        default:
          throw new Error(`Unsupported platform: ${repo.platform}`);
      }

      await adapter.initialize(repo.credentials);
      this.adapters.set(adapterId, adapter);
      this.repositories.set(repo.id, repo);
    }

    // Initialize webhooks
    for (const webhook of this.config.webhooks) {
      this.webhooks.set(webhook.id, webhook);
    }

    console.log(`VCS Agent initialized with ${this.adapters.size} adapters and ${this.webhooks.size} webhooks`);
  }

  // Pull Request Operations
  async createPullRequest(repositoryId: string, config: PRConfig): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'createPullRequest';

    try {
      const adapter = this.getAdapter(repositoryId);
      const repo = this.getRepository(repositoryId);
      
      // Apply repository-specific settings
      if (repo.settings.prAutomation.enabled) {
        if (repo.settings.prAutomation.autoAssignReviewers && config.reviewers.length === 0) {
          config.reviewers = repo.settings.prAutomation.defaultReviewers;
        }
        
        if (repo.settings.prAutomation.autoLabeling) {
          const templateLabels = this.getTemplateLabels(config.template, repo);
          config.labels = [...config.labels, ...templateLabels];
        }
      }

      const result = await adapter.createPullRequest(config);
      
      const operationResult: VCSOperationResult = {
        success: result.success,
        operation,
        target: `${repositoryId}/PR`,
        result: result.pullRequest,
        error: result.error,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      
      // Trigger post-creation automation
      if (result.success && result.pullRequest) {
        await this.handlePRCreated(repositoryId, result.pullRequest);
      }

      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/PR`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  async updatePullRequest(
    repositoryId: string, 
    prId: string | number, 
    updates: Partial<PRConfig>
  ): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'updatePullRequest';

    try {
      const adapter = this.getAdapter(repositoryId);
      const result = await adapter.updatePullRequest(prId, updates);

      const operationResult: VCSOperationResult = {
        success: result.success,
        operation,
        target: `${repositoryId}/PR/${prId}`,
        result: result.pullRequest,
        error: result.error,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/PR/${prId}`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  async mergePullRequest(
    repositoryId: string, 
    prId: string | number, 
    options?: any
  ): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'mergePullRequest';

    try {
      const adapter = this.getAdapter(repositoryId);
      const repo = this.getRepository(repositoryId);

      // Check branch protection and required status checks
      if (repo.settings.branchProtection.enabled) {
        const canMerge = await this.validateMergeRequirements(repositoryId, prId);
        if (!canMerge.allowed) {
          throw new Error(`Merge blocked: ${canMerge.reasons.join(', ')}`);
        }
      }

      const result = await adapter.mergePullRequest(prId, options);

      const operationResult: VCSOperationResult = {
        success: result.success,
        operation,
        target: `${repositoryId}/PR/${prId}`,
        result: {
          merged: result.success,
          mergedAt: result.mergedAt,
          mergeCommitSha: result.mergeCommitSha
        },
        error: result.error,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);

      // Post-merge automation
      if (result.success) {
        await this.handlePRMerged(repositoryId, prId, result);
      }

      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/PR/${prId}`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  // Issue Operations
  async createIssue(repositoryId: string, config: IssueCreationConfig): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'createIssue';

    try {
      const adapter = this.getAdapter(repositoryId);
      const result = await adapter.createIssue(config);

      const operationResult: VCSOperationResult = {
        success: result.success,
        operation,
        target: `${repositoryId}/Issue`,
        result: result.issue,
        error: result.error,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);

      // Trigger issue sync if enabled
      if (result.success && result.issue) {
        await this.handleIssueCreated(repositoryId, result.issue);
      }

      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/Issue`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  async syncIssues(repositoryId: string): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'syncIssues';

    try {
      const adapter = this.getAdapter(repositoryId);
      const repo = this.getRepository(repositoryId);

      if (!repo.settings.issueSync.enabled) {
        throw new Error('Issue sync is disabled for this repository');
      }

      const syncConfig: IssueSyncConfig = {
        enabled: true,
        bidirectionalSync: repo.settings.issueSync.bidirectional,
        autoCreateIssues: true,
        autoCreateTickets: true,
        syncFrequency: repo.settings.issueSync.syncFrequency,
        statusMapping: repo.settings.issueSync.statusMapping,
        fieldMapping: {
          title: 'title',
          description: 'description',
          assignee: 'assignee',
          labels: 'labels',
          milestone: 'milestone',
          priority: 'priority'
        },
        conflictResolution: 'manual'
      };

      const result = await adapter.syncIssues(syncConfig);

      const operationResult: VCSOperationResult = {
        success: result.success,
        operation,
        target: `${repositoryId}/Issues`,
        result: {
          synced: result.synced.length,
          failed: result.failed.length,
          conflicts: result.conflicts.length,
          summary: result.summary
        },
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/Issues`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  // Pipeline Operations
  async monitorPipelines(repositoryId: string): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'monitorPipelines';

    try {
      const adapter = this.getAdapter(repositoryId);
      
      // Get recent pipelines
      const pipelines = await adapter.listPipelines({
        since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        limit: 50
      });

      // Analyze failed pipelines
      const failedPipelines = pipelines.filter(p => p.status === 'failed');
      const analyses: FailureAnalysis[] = [];

      for (const pipeline of failedPipelines) {
        try {
          const analysis = await adapter.analyzeFailure(pipeline.id);
          analyses.push(analysis);
        } catch (error) {
          // Continue with other pipelines if one fails
          console.warn(`Failed to analyze pipeline ${pipeline.id}:`, error);
        }
      }

      const operationResult: VCSOperationResult = {
        success: true,
        operation,
        target: `${repositoryId}/Pipelines`,
        result: {
          totalPipelines: pipelines.length,
          failedPipelines: failedPipelines.length,
          analyses: analyses.length,
          recentFailures: analyses
        },
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);

      // Send notifications for critical failures
      await this.handlePipelineFailures(repositoryId, analyses);

      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/Pipelines`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  // Conflict Resolution
  async analyzeConflicts(repositoryId: string, prId: string | number): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'analyzeConflicts';

    try {
      const adapter = this.getAdapter(repositoryId);
      const analysis = await adapter.analyzeConflicts(prId);

      const operationResult: VCSOperationResult = {
        success: true,
        operation,
        target: `${repositoryId}/PR/${prId}/Conflicts`,
        result: analysis,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);

      // Auto-resolve if enabled and safe
      if (analysis.autoResolvable) {
        const repo = this.getRepository(repositoryId);
        if (repo.settings.conflictResolution.autoResolve && 
            analysis.riskAssessment.overallRisk === 'low') {
          await this.autoResolveConflicts(repositoryId, analysis.conflictId);
        }
      }

      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/PR/${prId}/Conflicts`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  // Webhook Processing
  async processWebhook(event: VCSEvent): Promise<EventProcessingResult> {
    try {
      const webhook = this.findWebhookForEvent(event);
      if (!webhook) {
        return {
          success: false,
          processed: false,
          actions: [],
          errors: ['No matching webhook configuration found'],
          processingTime: 0,
          retryRequired: false
        };
      }

      const repositoryId = this.findRepositoryForEvent(event);
      if (!repositoryId) {
        return {
          success: false,
          processed: false,
          actions: [],
          errors: ['No matching repository found'],
          processingTime: 0,
          retryRequired: false
        };
      }

      const adapter = this.getAdapter(repositoryId);
      const result = await adapter.processWebhook(event);

      // Update metrics
      this.updateWebhookMetrics(event, result);

      return result;
    } catch (error: any) {
      return {
        success: false,
        processed: false,
        actions: [],
        errors: [error.message],
        processingTime: 0,
        retryRequired: true
      };
    }
  }

  // Security Operations
  async performSecurityScan(repositoryId: string, target: any): Promise<VCSOperationResult> {
    const startTime = Date.now();
    const operation = 'securityScan';

    try {
      const adapter = this.getAdapter(repositoryId);
      const result = await adapter.scanSecurity(target);

      const operationResult: VCSOperationResult = {
        success: result.status === 'completed',
        operation,
        target: `${repositoryId}/${target.type}/${target.target}`,
        result,
        error: result.status === 'failed' ? 'Security scan failed' : undefined,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);

      // Handle critical vulnerabilities
      if (result.riskScore > 7) {
        await this.handleCriticalVulnerabilities(repositoryId, result);
      }

      return operationResult;
    } catch (error: any) {
      const operationResult: VCSOperationResult = {
        success: false,
        operation,
        target: `${repositoryId}/${target.type}/${target.target}`,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.recordOperation(operationResult);
      return operationResult;
    }
  }

  // Metrics and Reporting
  getMetrics(): VCSMetrics {
    return { ...this.metrics };
  }

  getRepositoryMetrics(repositoryId: string): RepositoryMetrics {
    return this.metrics.repositoryActivity[repositoryId] || this.initializeRepositoryMetrics();
  }

  getOperationHistory(limit: number = 100): VCSOperationResult[] {
    return this.operationHistory.slice(-limit);
  }

  // Private helper methods
  private getAdapter(repositoryId: string): VCSAdapter {
    const repo = this.repositories.get(repositoryId);
    if (!repo) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }

    const adapterId = `${repo.platform}_${repositoryId}`;
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter not found: ${adapterId}`);
    }

    return adapter;
  }

  private getRepository(repositoryId: string): RepositoryConfig {
    const repo = this.repositories.get(repositoryId);
    if (!repo) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }
    return repo;
  }

  private getTemplateLabels(template: string, repo: RepositoryConfig): string[] {
    const mapping = repo.settings.prAutomation.templateMapping;
    return mapping[template]?.split(',') || [];
  }

  private async validateMergeRequirements(repositoryId: string, prId: string | number): Promise<{ allowed: boolean; reasons: string[] }> {
    // TODO: Implement merge validation logic
    return { allowed: true, reasons: [] };
  }

  private async handlePRCreated(repositoryId: string, pr: PullRequest): Promise<void> {
    // TODO: Implement post-PR creation automation
  }

  private async handlePRMerged(repositoryId: string, prId: string | number, result: PRMergeResult): Promise<void> {
    // TODO: Implement post-merge automation
  }

  private async handleIssueCreated(repositoryId: string, issue: Issue): Promise<void> {
    // TODO: Implement post-issue creation automation
  }

  private async handlePipelineFailures(repositoryId: string, analyses: FailureAnalysis[]): Promise<void> {
    // TODO: Implement pipeline failure notification
  }

  private async autoResolveConflicts(repositoryId: string, conflictId: string): Promise<void> {
    // TODO: Implement auto-conflict resolution
  }

  private async handleCriticalVulnerabilities(repositoryId: string, scanResult: any): Promise<void> {
    // TODO: Implement critical vulnerability handling
  }

  private findWebhookForEvent(event: VCSEvent): WebhookConfig | undefined {
    return Array.from(this.webhooks.values()).find(webhook => 
      webhook.events.includes(event.eventType) &&
      webhook.repositories.includes(event.repository.fullName)
    );
  }

  private findRepositoryForEvent(event: VCSEvent): string | undefined {
    return Array.from(this.repositories.values()).find(repo => 
      `${repo.owner}/${repo.name}` === event.repository.fullName
    )?.id;
  }

  private recordOperation(operation: VCSOperationResult): void {
    this.operationHistory.push(operation);
    
    // Keep only last 1000 operations
    if (this.operationHistory.length > 1000) {
      this.operationHistory = this.operationHistory.slice(-1000);
    }

    this.updateMetrics(operation);
  }

  private updateMetrics(operation: VCSOperationResult): void {
    this.metrics.totalOperations++;
    
    if (operation.success) {
      this.metrics.successRate = (this.metrics.successRate * (this.metrics.totalOperations - 1) + 1) / this.metrics.totalOperations;
    } else {
      this.metrics.successRate = (this.metrics.successRate * (this.metrics.totalOperations - 1)) / this.metrics.totalOperations;
      this.metrics.errorsByType[operation.error || 'unknown'] = (this.metrics.errorsByType[operation.error || 'unknown'] || 0) + 1;
    }

    this.metrics.averageResponseTime = (this.metrics.averageResponseTime * (this.metrics.totalOperations - 1) + operation.duration) / this.metrics.totalOperations;
    this.metrics.operationsByType[operation.operation] = (this.metrics.operationsByType[operation.operation] || 0) + 1;
  }

  private updateWebhookMetrics(event: VCSEvent, result: EventProcessingResult): void {
    this.metrics.webhookActivity.totalEvents++;
    
    if (result.success) {
      this.metrics.webhookActivity.processedEvents++;
    } else {
      this.metrics.webhookActivity.failedEvents++;
    }

    this.metrics.webhookActivity.averageProcessingTime = (
      this.metrics.webhookActivity.averageProcessingTime * (this.metrics.webhookActivity.totalEvents - 1) + 
      result.processingTime
    ) / this.metrics.webhookActivity.totalEvents;

    this.metrics.webhookActivity.eventsByType[event.eventType] = (this.metrics.webhookActivity.eventsByType[event.eventType] || 0) + 1;
  }

  private initializeMetrics(): VCSMetrics {
    return {
      totalOperations: 0,
      successRate: 0,
      averageResponseTime: 0,
      operationsByType: {},
      errorsByType: {},
      repositoryActivity: {},
      webhookActivity: {
        totalEvents: 0,
        processedEvents: 0,
        failedEvents: 0,
        averageProcessingTime: 0,
        eventsByType: {}
      },
      rateLimit: {
        currentUsage: 0,
        limit: 5000,
        resetTime: new Date(),
        rateLimitHits: 0
      }
    };
  }

  private initializeRepositoryMetrics(): RepositoryMetrics {
    return {
      pullRequests: {
        created: 0,
        merged: 0,
        closed: 0,
        averageTimeToMerge: 0
      },
      issues: {
        created: 0,
        closed: 0,
        synced: 0,
        averageTimeToClose: 0
      },
      conflicts: {
        total: 0,
        autoResolved: 0,
        manualResolution: 0,
        averageResolutionTime: 0
      },
      security: {
        scansPerformed: 0,
        vulnerabilitiesFound: 0,
        secretsFound: 0,
        averageScanTime: 0
      }
    };
  }
}