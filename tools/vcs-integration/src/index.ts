/**
 * VCS Integration Agent - Main Entry Point
 */

export { VCSAgentCore } from './services/VCSAgentCore';
export { GitHubAdapter } from './adapters/GitHubAdapter';
export { BaseVCSAdapter } from './adapters/BaseVCSAdapter';

// Models
export * from './models/PullRequest';
export * from './models/Issue';
export * from './models/Pipeline';
export * from './models/ConflictAnalysis';
export * from './models/VCSEvent';

// Configuration types
export type {
  VCSConfig,
  VCSUser,
  VCSAdapter,
  PRFilters,
  IssueFilters,
  PipelineFilters,
  BranchFilters,
  RepositoryFilters,
  ReleaseFilters,
  TimeRange,
  MergeOptions,
  BranchInfo,
  BranchProtection,
  RepositoryInfo,
  WebhookConfig,
  WebhookInfo,
  SecurityScanTarget,
  SecurityScanResult,
  RateLimitInfo
} from './adapters/BaseVCSAdapter';

export type {
  VCSAgentConfig,
  RepositoryConfig,
  RepositorySettings,
  AutomationConfig,
  SecurityConfig,
  NotificationConfig,
  VCSOperationResult,
  VCSMetrics,
  RepositoryMetrics
} from './services/VCSAgentCore';

// Default configurations
export const DEFAULT_VCS_CONFIG = {
  timeout: 30000,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND']
  },
  rateLimitConfig: {
    respectLimits: true,
    reserveQuota: 100,
    burstAllowance: 10,
    trackUsage: true
  }
};

export const DEFAULT_REPOSITORY_SETTINGS = {
  prAutomation: {
    enabled: true,
    autoAssignReviewers: true,
    autoLabeling: true,
    templateMapping: {
      'feature': 'enhancement,feature',
      'bugfix': 'bug,fix',
      'refactor': 'refactor,improvement',
      'hotfix': 'hotfix,urgent,bug',
      'release': 'release,deployment'
    },
    defaultReviewers: []
  },
  issueSync: {
    enabled: true,
    bidirectional: true,
    syncFrequency: 'realtime' as const,
    statusMapping: {
      'open': 'TODO',
      'in_progress': 'IN_PROGRESS', 
      'closed': 'DONE',
      'resolved': 'DONE'
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
    maxRiskLevel: 'low' as const,
    requireApproval: false
  }
};

export const DEFAULT_AUTOMATION_CONFIG: AutomationConfig = {
  prCreation: true,
  issueSync: true,
  pipelineMonitoring: true,
  conflictResolution: true,
  securityScanning: true,
  releaseManagement: true
};

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  scanOnPR: true,
  blockOnVulnerabilities: true,
  allowedSeverities: ['low', 'medium'],
  secretScanning: true,
  dependencyScanning: true
};

// Utility functions
export function createVCSAgentConfig(
  repositories: RepositoryConfig[],
  overrides: Partial<VCSAgentConfig> = {}
): VCSAgentConfig {
  return {
    platform: repositories[0]?.platform || 'github',
    repositories,
    webhooks: [],
    automation: { ...DEFAULT_AUTOMATION_CONFIG, ...overrides.automation },
    security: { ...DEFAULT_SECURITY_CONFIG, ...overrides.security },
    notifications: overrides.notifications || [],
    ...overrides
  };
}

export function createRepositoryConfig(
  id: string,
  owner: string,
  name: string,
  platform: 'github' | 'gitlab',
  credentials: VCSConfig,
  settingsOverride: Partial<RepositorySettings> = {}
): RepositoryConfig {
  return {
    id,
    owner,
    name,
    platform,
    credentials: { ...DEFAULT_VCS_CONFIG, ...credentials },
    settings: {
      prAutomation: { ...DEFAULT_REPOSITORY_SETTINGS.prAutomation, ...settingsOverride.prAutomation },
      issueSync: { ...DEFAULT_REPOSITORY_SETTINGS.issueSync, ...settingsOverride.issueSync },
      branchProtection: { ...DEFAULT_REPOSITORY_SETTINGS.branchProtection, ...settingsOverride.branchProtection },
      conflictResolution: { ...DEFAULT_REPOSITORY_SETTINGS.conflictResolution, ...settingsOverride.conflictResolution }
    }
  };
}

// Template helpers
export const TEMPLATE_TYPES = ['feature', 'bugfix', 'refactor', 'hotfix', 'release'] as const;
export type TemplateType = typeof TEMPLATE_TYPES[number];

export function getTemplateLabels(templateType: TemplateType): string[] {
  const mapping = DEFAULT_REPOSITORY_SETTINGS.prAutomation.templateMapping;
  return mapping[templateType]?.split(',') || [];
}

// Validation helpers
export function validateVCSConfig(config: VCSConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.token && !config.appId) {
    errors.push('Either token or appId is required for authentication');
  }

  if (config.appId && !config.privateKey) {
    errors.push('privateKey is required when using appId authentication');
  }

  if (config.timeout && config.timeout < 1000) {
    errors.push('timeout must be at least 1000ms');
  }

  if (config.retryConfig) {
    if (config.retryConfig.maxRetries < 0 || config.retryConfig.maxRetries > 10) {
      errors.push('maxRetries must be between 0 and 10');
    }
    
    if (config.retryConfig.baseDelay < 100) {
      errors.push('baseDelay must be at least 100ms');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateRepositoryConfig(config: RepositoryConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.id || !config.owner || !config.name) {
    errors.push('id, owner, and name are required');
  }

  if (!['github', 'gitlab'].includes(config.platform)) {
    errors.push('platform must be either "github" or "gitlab"');
  }

  const vcsValidation = validateVCSConfig(config.credentials);
  if (!vcsValidation.valid) {
    errors.push(...vcsValidation.errors.map(e => `credentials.${e}`));
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Error classes
export class VCSIntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VCSIntegrationError';
  }
}

export class VCSAuthenticationError extends VCSIntegrationError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', details);
    this.name = 'VCSAuthenticationError';
  }
}

export class VCSRateLimitError extends VCSIntegrationError {
  constructor(message: string, resetTime?: Date) {
    super(message, 'RATE_LIMIT_ERROR', { resetTime });
    this.name = 'VCSRateLimitError';
  }
}

export class VCSNotFoundError extends VCSIntegrationError {
  constructor(resource: string, id: string | number) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND_ERROR', { resource, id });
    this.name = 'VCSNotFoundError';
  }
}

export class VCSValidationError extends VCSIntegrationError {
  constructor(message: string, validationErrors: string[]) {
    super(message, 'VALIDATION_ERROR', { validationErrors });
    this.name = 'VCSValidationError';
  }
}

// Version information
export const VERSION = '1.0.0';
export const SUPPORTED_PLATFORMS = ['github', 'gitlab'] as const;
export const SUPPORTED_WEBHOOK_EVENTS = [
  'pull_request',
  'issues',
  'push',
  'release',
  'check_run',
  'check_suite',
  'deployment',
  'deployment_status',
  'workflow_run'
] as const;