/**
 * Base VCS adapter interface for GitHub and GitLab integration
 */

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
  IssueUpdateResult,
  IssueSyncResult,
  IssueSyncConfig,
  BulkIssueOperation,
  BulkIssueResult
} from '../models/Issue';
import { 
  Pipeline, 
  PipelineMetrics,
  FailureAnalysis,
  RetryStrategy
} from '../models/Pipeline';
import { 
  ConflictAnalysis, 
  AutoResolutionConfig,
  ConflictResolutionHistory 
} from '../models/ConflictAnalysis';
import { VCSEvent, EventProcessingResult } from '../models/VCSEvent';

export interface VCSAdapter {
  // Platform identification
  readonly platform: 'github' | 'gitlab';
  readonly apiVersion: string;
  
  // Authentication and configuration
  initialize(config: VCSConfig): Promise<void>;
  validateConnection(): Promise<boolean>;
  getCurrentUser(): Promise<VCSUser>;
  
  // Pull Request / Merge Request operations
  createPullRequest(config: PRConfig): Promise<PRCreationResult>;
  updatePullRequest(prId: string | number, updates: Partial<PRConfig>): Promise<PRUpdateResult>;
  getPullRequest(prId: string | number): Promise<PullRequest>;
  listPullRequests(filters?: PRFilters): Promise<PullRequest[]>;
  mergePullRequest(prId: string | number, options?: MergeOptions): Promise<PRMergeResult>;
  closePullRequest(prId: string | number, reason?: string): Promise<PRUpdateResult>;
  
  // Review operations
  requestReviewers(prId: string | number, reviewers: string[]): Promise<boolean>;
  approveReview(prId: string | number, comment?: string): Promise<boolean>;
  requestChanges(prId: string | number, comment: string): Promise<boolean>;
  dismissReview(prId: string | number, reviewId: string | number): Promise<boolean>;
  
  // Issue operations
  createIssue(config: IssueCreationConfig): Promise<IssueCreationResult>;
  updateIssue(issueId: string | number, updates: Partial<IssueCreationConfig>): Promise<IssueUpdateResult>;
  getIssue(issueId: string | number): Promise<Issue>;
  listIssues(filters?: IssueFilters): Promise<Issue[]>;
  closeIssue(issueId: string | number, reason?: string): Promise<IssueUpdateResult>;
  assignIssue(issueId: string | number, assignees: string[]): Promise<boolean>;
  labelIssue(issueId: string | number, labels: string[]): Promise<boolean>;
  
  // Issue synchronization
  syncIssues(config: IssueSyncConfig): Promise<IssueSyncResult>;
  bulkIssueOperation(operation: BulkIssueOperation): Promise<BulkIssueResult>;
  
  // Pipeline/CI operations
  getPipeline(pipelineId: string | number): Promise<Pipeline>;
  listPipelines(filters?: PipelineFilters): Promise<Pipeline[]>;
  retryPipeline(pipelineId: string | number): Promise<boolean>;
  cancelPipeline(pipelineId: string | number): Promise<boolean>;
  getPipelineMetrics(timeRange?: TimeRange): Promise<PipelineMetrics>;
  analyzeFailure(pipelineId: string | number): Promise<FailureAnalysis>;
  getRetryStrategy(pipelineId: string | number): Promise<RetryStrategy>;
  
  // Branch operations
  createBranch(name: string, source: string): Promise<BranchInfo>;
  deleteBranch(name: string): Promise<boolean>;
  getBranch(name: string): Promise<BranchInfo>;
  listBranches(filters?: BranchFilters): Promise<BranchInfo[]>;
  protectBranch(name: string, protection: BranchProtection): Promise<boolean>;
  
  // Conflict resolution
  analyzeConflicts(prId: string | number): Promise<ConflictAnalysis>;
  resolveConflicts(conflictId: string, resolution: ConflictResolutionRequest): Promise<ConflictResolutionHistory>;
  getConflictHistory(repository?: string, timeRange?: TimeRange): Promise<ConflictResolutionHistory[]>;
  
  // Repository operations
  getRepository(owner: string, repo: string): Promise<RepositoryInfo>;
  listRepositories(filters?: RepositoryFilters): Promise<RepositoryInfo[]>;
  createWebhook(config: WebhookConfig): Promise<WebhookInfo>;
  deleteWebhook(webhookId: string | number): Promise<boolean>;
  
  // Security operations
  scanSecurity(target: SecurityScanTarget): Promise<SecurityScanResult>;
  getDependencyAlerts(severity?: SecuritySeverity[]): Promise<DependencyAlert[]>;
  getSecretAlerts(): Promise<SecretAlert[]>;
  
  // Release operations
  createRelease(config: ReleaseConfig): Promise<ReleaseResult>;
  updateRelease(releaseId: string | number, updates: Partial<ReleaseConfig>): Promise<ReleaseResult>;
  listReleases(filters?: ReleaseFilters): Promise<ReleaseInfo[]>;
  
  // Event handling
  processWebhook(event: VCSEvent): Promise<EventProcessingResult>;
  validateWebhookSignature(payload: string, signature: string): boolean;
  
  // Rate limiting and error handling
  getRateLimitStatus(): Promise<RateLimitInfo>;
  handleRateLimit(): Promise<void>;
  retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
}

export interface VCSConfig {
  token?: string;
  appId?: number;
  privateKey?: string;
  installationId?: number;
  baseUrl?: string;
  webhookSecret?: string;
  timeout?: number;
  retryConfig?: RetryConfig;
  rateLimitConfig?: RateLimitConfig;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface RateLimitConfig {
  respectLimits: boolean;
  reserveQuota: number;
  burstAllowance: number;
  trackUsage: boolean;
}

export interface VCSUser {
  id: string | number;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  type: 'user' | 'bot' | 'organization';
  permissions: string[];
}

export interface PRFilters {
  state?: 'open' | 'closed' | 'merged';
  author?: string;
  assignee?: string;
  reviewer?: string;
  label?: string;
  milestone?: string;
  branch?: string;
  createdSince?: Date;
  updatedSince?: Date;
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  direction?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface IssueFilters {
  state?: 'open' | 'closed';
  author?: string;
  assignee?: string;
  label?: string;
  milestone?: string;
  since?: Date;
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface PipelineFilters {
  status?: string;
  ref?: string;
  source?: string;
  since?: Date;
  until?: Date;
  sort?: 'created' | 'updated' | 'status';
  direction?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface BranchFilters {
  protected?: boolean;
  merged?: boolean;
  stale?: boolean;
  pattern?: string;
  sort?: 'name' | 'updated' | 'activity';
  direction?: 'asc' | 'desc';
  limit?: number;
}

export interface RepositoryFilters {
  visibility?: 'public' | 'private' | 'internal';
  type?: 'source' | 'fork' | 'mirror';
  language?: string;
  topic?: string;
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  limit?: number;
}

export interface ReleaseFilters {
  prerelease?: boolean;
  draft?: boolean;
  since?: Date;
  sort?: 'created' | 'published';
  direction?: 'asc' | 'desc';
  limit?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface MergeOptions {
  mergeMethod: 'merge' | 'squash' | 'rebase';
  commitTitle?: string;
  commitMessage?: string;
  deleteSourceBranch?: boolean;
  requireStatusChecks?: boolean;
}

export interface BranchInfo {
  name: string;
  sha: string;
  protected: boolean;
  default: boolean;
  ahead?: number;
  behind?: number;
  lastCommit: {
    sha: string;
    message: string;
    author: string;
    date: Date;
  };
  protection?: BranchProtection;
}

export interface BranchProtection {
  requiredStatusChecks: {
    strict: boolean;
    contexts: string[];
  };
  enforceAdmins: boolean;
  requiredPullRequestReviews: {
    requireCodeOwnerReviews: boolean;
    requiredApprovingReviewCount: number;
    dismissStaleReviews: boolean;
    restrictDismissals: boolean;
    dismissalUsers: string[];
  };
  restrictions?: {
    users: string[];
    teams: string[];
    apps: string[];
  };
  allowForcePushes: boolean;
  allowDeletions: boolean;
  blockCreations: boolean;
}

export interface RepositoryInfo {
  id: string | number;
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  language?: string;
  topics: string[];
  size: number;
  starCount: number;
  forkCount: number;
  issuesCount: number;
  openIssuesCount: number;
  hasIssues: boolean;
  hasProjects: boolean;
  hasWiki: boolean;
  archived: boolean;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  pushedAt: Date;
  url: string;
  cloneUrl: string;
  sshUrl: string;
  license?: {
    key: string;
    name: string;
    url: string;
  };
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
  insecure_ssl?: boolean;
}

export interface WebhookInfo {
  id: string | number;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityScanTarget {
  type: 'repository' | 'pull_request' | 'commit';
  target: string;
  ref?: string;
}

export interface SecurityScanResult {
  scanId: string;
  target: SecurityScanTarget;
  status: 'completed' | 'failed' | 'in_progress';
  vulnerabilities: Vulnerability[];
  dependencyAlerts: DependencyAlert[];
  secretAlerts: SecretAlert[];
  riskScore: number; // 0-10
  recommendations: SecurityRecommendation[];
  complianceStatus: ComplianceCheck[];
  scanDuration: number; // milliseconds
  scannedAt: Date;
}

export interface Vulnerability {
  id: string;
  severity: SecuritySeverity;
  title: string;
  description: string;
  package?: string;
  version?: string;
  fixedVersion?: string;
  cwe?: string[];
  cvss?: number;
  references: string[];
  publishedAt?: Date;
  updatedAt?: Date;
}

export interface DependencyAlert {
  id: string;
  severity: SecuritySeverity;
  package: string;
  version: string;
  vulnerableVersions: string;
  patchedVersions?: string;
  advisory: {
    id: string;
    title: string;
    description: string;
    references: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  dismissedAt?: Date;
  dismissalReason?: string;
}

export interface SecretAlert {
  id: string;
  type: string;
  secret: string; // masked
  file: string;
  line?: number;
  column?: number;
  commit: string;
  author: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface SecuritySeverity {
  level: 'low' | 'medium' | 'high' | 'critical';
  score?: number;
}

export interface SecurityRecommendation {
  type: 'update' | 'patch' | 'configuration' | 'policy';
  title: string;
  description: string;
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface ComplianceCheck {
  rule: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable';
  description: string;
  recommendation?: string;
}

export interface ReleaseConfig {
  tagName: string;
  targetCommitish?: string;
  name: string;
  description: string;
  draft: boolean;
  prerelease: boolean;
  makeLatest?: boolean;
  assets?: ReleaseAsset[];
}

export interface ReleaseAsset {
  name: string;
  label?: string;
  contentType: string;
  data: Buffer | string;
}

export interface ReleaseResult {
  success: boolean;
  release?: ReleaseInfo;
  error?: string;
  warnings: string[];
}

export interface ReleaseInfo {
  id: string | number;
  tagName: string;
  name: string;
  description: string;
  draft: boolean;
  prerelease: boolean;
  createdAt: Date;
  publishedAt?: Date;
  author: VCSUser;
  assets: Array<{
    id: string | number;
    name: string;
    size: number;
    downloadCount: number;
    downloadUrl: string;
  }>;
  url: string;
  targetCommitish: string;
}

export interface ConflictResolutionRequest {
  strategy: string;
  files?: Array<{
    path: string;
    resolution: 'current' | 'incoming' | 'manual';
    content?: string;
  }>;
  message?: string;
  createBackup: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  usedPercent: number;
  isNearLimit: boolean; // > 90%
}

export abstract class BaseVCSAdapter implements VCSAdapter {
  abstract readonly platform: 'github' | 'gitlab';
  abstract readonly apiVersion: string;

  protected config!: VCSConfig;
  protected rateLimiter?: any;
  protected logger?: any;

  async initialize(config: VCSConfig): Promise<void> {
    this.config = config;
    await this.setupRateLimiting();
    await this.validateConnection();
  }

  protected abstract setupRateLimiting(): Promise<void>;
  
  async retryWithBackoff<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3
  ): Promise<T> {
    const config = this.config.retryConfig || {
      maxRetries,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
    };

    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (attempt === config.maxRetries) {
          break;
        }
        
        if (!this.isRetryableError(error, config.retryableErrors)) {
          break;
        }
        
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  protected isRetryableError(error: any, retryableErrors: string[]): boolean {
    if (error.status && error.status >= 500) return true;
    if (error.code && retryableErrors.includes(error.code)) return true;
    if (error.message && error.message.includes('rate limit')) return false; // Handle separately
    return false;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Abstract methods that must be implemented by concrete adapters
  abstract validateConnection(): Promise<boolean>;
  abstract getCurrentUser(): Promise<VCSUser>;
  abstract createPullRequest(config: PRConfig): Promise<PRCreationResult>;
  abstract updatePullRequest(prId: string | number, updates: Partial<PRConfig>): Promise<PRUpdateResult>;
  abstract getPullRequest(prId: string | number): Promise<PullRequest>;
  abstract listPullRequests(filters?: PRFilters): Promise<PullRequest[]>;
  abstract mergePullRequest(prId: string | number, options?: MergeOptions): Promise<PRMergeResult>;
  abstract closePullRequest(prId: string | number, reason?: string): Promise<PRUpdateResult>;
  abstract requestReviewers(prId: string | number, reviewers: string[]): Promise<boolean>;
  abstract approveReview(prId: string | number, comment?: string): Promise<boolean>;
  abstract requestChanges(prId: string | number, comment: string): Promise<boolean>;
  abstract dismissReview(prId: string | number, reviewId: string | number): Promise<boolean>;
  abstract createIssue(config: IssueCreationConfig): Promise<IssueCreationResult>;
  abstract updateIssue(issueId: string | number, updates: Partial<IssueCreationConfig>): Promise<IssueUpdateResult>;
  abstract getIssue(issueId: string | number): Promise<Issue>;
  abstract listIssues(filters?: IssueFilters): Promise<Issue[]>;
  abstract closeIssue(issueId: string | number, reason?: string): Promise<IssueUpdateResult>;
  abstract assignIssue(issueId: string | number, assignees: string[]): Promise<boolean>;
  abstract labelIssue(issueId: string | number, labels: string[]): Promise<boolean>;
  abstract syncIssues(config: IssueSyncConfig): Promise<IssueSyncResult>;
  abstract bulkIssueOperation(operation: BulkIssueOperation): Promise<BulkIssueResult>;
  abstract getPipeline(pipelineId: string | number): Promise<Pipeline>;
  abstract listPipelines(filters?: PipelineFilters): Promise<Pipeline[]>;
  abstract retryPipeline(pipelineId: string | number): Promise<boolean>;
  abstract cancelPipeline(pipelineId: string | number): Promise<boolean>;
  abstract getPipelineMetrics(timeRange?: TimeRange): Promise<PipelineMetrics>;
  abstract analyzeFailure(pipelineId: string | number): Promise<FailureAnalysis>;
  abstract getRetryStrategy(pipelineId: string | number): Promise<RetryStrategy>;
  abstract createBranch(name: string, source: string): Promise<BranchInfo>;
  abstract deleteBranch(name: string): Promise<boolean>;
  abstract getBranch(name: string): Promise<BranchInfo>;
  abstract listBranches(filters?: BranchFilters): Promise<BranchInfo[]>;
  abstract protectBranch(name: string, protection: BranchProtection): Promise<boolean>;
  abstract analyzeConflicts(prId: string | number): Promise<ConflictAnalysis>;
  abstract resolveConflicts(conflictId: string, resolution: ConflictResolutionRequest): Promise<ConflictResolutionHistory>;
  abstract getConflictHistory(repository?: string, timeRange?: TimeRange): Promise<ConflictResolutionHistory[]>;
  abstract getRepository(owner: string, repo: string): Promise<RepositoryInfo>;
  abstract listRepositories(filters?: RepositoryFilters): Promise<RepositoryInfo[]>;
  abstract createWebhook(config: WebhookConfig): Promise<WebhookInfo>;
  abstract deleteWebhook(webhookId: string | number): Promise<boolean>;
  abstract scanSecurity(target: SecurityScanTarget): Promise<SecurityScanResult>;
  abstract getDependencyAlerts(severity?: SecuritySeverity[]): Promise<DependencyAlert[]>;
  abstract getSecretAlerts(): Promise<SecretAlert[]>;
  abstract createRelease(config: ReleaseConfig): Promise<ReleaseResult>;
  abstract updateRelease(releaseId: string | number, updates: Partial<ReleaseConfig>): Promise<ReleaseResult>;
  abstract listReleases(filters?: ReleaseFilters): Promise<ReleaseInfo[]>;
  abstract processWebhook(event: VCSEvent): Promise<EventProcessingResult>;
  abstract validateWebhookSignature(payload: string, signature: string): boolean;
  abstract getRateLimitStatus(): Promise<RateLimitInfo>;
  abstract handleRateLimit(): Promise<void>;
}