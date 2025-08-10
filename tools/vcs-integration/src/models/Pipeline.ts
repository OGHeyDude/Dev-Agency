/**
 * CI/CD Pipeline data models for VCS integration
 */

export interface Pipeline {
  id: string | number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped';
  stages: PipelineStage[];
  ref: string; // branch or tag
  sha: string;
  url: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  queuedDuration?: number;
  coverage?: CoverageReport;
  artifacts: Artifact[];
  environment?: string;
  triggeredBy: PipelineTrigger;
  variables: Record<string, string>;
  repository: PipelineRepository;
}

export interface PipelineStage {
  id: string | number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped' | 'manual';
  jobs: PipelineJob[];
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  allowFailure: boolean;
  retryCount: number;
}

export interface PipelineJob {
  id: string | number;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped' | 'manual';
  stage: string;
  url: string;
  logUrl?: string;
  artifacts: Artifact[];
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  queuedDuration?: number;
  retryCount: number;
  runner?: PipelineRunner;
  failureReason?: string;
  allowFailure: boolean;
  coverage?: number;
}

export interface PipelineRunner {
  id: string | number;
  name: string;
  os: string;
  architecture: string;
  tags: string[];
  online: boolean;
}

export interface CoverageReport {
  lineRate: number; // 0-100
  branchRate: number; // 0-100  
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  reportUrl?: string;
  format: 'cobertura' | 'jacoco' | 'lcov' | 'simplecov';
}

export interface Artifact {
  id: string | number;
  name: string;
  size: number; // bytes
  url: string;
  downloadUrl: string;
  type: 'build' | 'test' | 'coverage' | 'documentation' | 'package' | 'logs';
  expiresAt?: Date;
  createdAt: Date;
}

export interface PipelineTrigger {
  type: 'push' | 'pull_request' | 'schedule' | 'manual' | 'api' | 'webhook';
  actor: PipelineActor;
  event?: string;
  ref?: string;
  scheduleName?: string;
}

export interface PipelineActor {
  id: string | number;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export interface PipelineRepository {
  id: string | number;
  name: string;
  fullName: string;
  url: string;
}

export interface FailureAnalysis {
  pipelineId: string | number;
  failureType: 'test' | 'build' | 'deploy' | 'security' | 'infrastructure' | 'timeout' | 'resource' | 'dependency';
  failedStage: string;
  failedJob?: string;
  errorMessage: string;
  errorCode?: string;
  logExcerpt: string;
  stackTrace?: string;
  suggestedFix: string;
  documentationLink?: string;
  similarFailures: SimilarFailure[];
  retryRecommended: boolean;
  autoFixAvailable: boolean;
  impactedServices: string[];
  estimatedResolutionTime?: number; // minutes
}

export interface SimilarFailure {
  pipelineId: string | number;
  failureDate: Date;
  resolution?: string;
  resolutionTime?: number; // minutes
  similarity: number; // 0-1
}

export interface RetryStrategy {
  recommended: boolean;
  reason: string;
  maxRetries: number;
  backoffStrategy: 'immediate' | 'linear' | 'exponential';
  backoffMultiplier: number;
  conditions: RetryCondition[];
  estimatedSuccess: number; // 0-1 probability
}

export interface RetryCondition {
  condition: string;
  required: boolean;
  description: string;
  autoCheck: boolean;
}

export interface PipelineMonitorConfig {
  repositories: string[];
  events: PipelineEvent[];
  notifications: NotificationConfig[];
  failureAnalysis: boolean;
  retryRecommendations: boolean;
  historicalAnalysis: boolean;
  realTimeUpdates: boolean;
  webhookEndpoints: string[];
}

export interface PipelineEvent {
  event: 'started' | 'completed' | 'failed' | 'cancelled' | 'stage_started' | 'stage_completed' | 'job_started' | 'job_completed';
  repositories?: string[];
  branches?: string[];
  stages?: string[];
  minDuration?: number;
}

export interface NotificationConfig {
  type: 'slack' | 'email' | 'webhook' | 'teams';
  target: string;
  events: string[];
  conditions?: NotificationCondition[];
}

export interface NotificationCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'matches';
  value: any;
}

export interface PipelineMetrics {
  successRate: number; // 0-1
  averageDuration: number; // milliseconds
  averageQueueTime: number; // milliseconds
  totalRuns: number;
  failuresByType: Record<string, number>;
  mostFailedStages: Array<{ stage: string; failures: number }>;
  trendsOverTime: PipelineTrend[];
  deploymentFrequency: number; // per day
  leadTime: number; // commit to deploy (minutes)
  mttr: number; // mean time to recovery (minutes)
  changeFailureRate: number; // 0-1
}

export interface PipelineTrend {
  date: Date;
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  deployments: number;
}

export interface PipelineStatusUpdate {
  pipelineId: string | number;
  previousStatus: string;
  currentStatus: string;
  timestamp: Date;
  changes: PipelineChange[];
  triggeredNotifications: string[];
}

export interface PipelineChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}