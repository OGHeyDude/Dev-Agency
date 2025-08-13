/**
 * Auto-fix Agent Type Definitions
 * 
 * Comprehensive type definitions for AGENT-027 - Auto-fix Agent with Predictive Capabilities
 * 
 * This module provides all necessary types, interfaces, and utilities for:
 * - Issue detection and classification
 * - Fix strategy generation and execution
 * - Predictive analysis and insights
 * - Learning and pattern recognition
 * - Validation and rollback mechanisms
 * 
 * @version 1.0.0
 * @author Dev-Agency Auto-fix System
 * @created 2025-08-12
 * @updated 2025-08-12
 */

// ============================================================================
// ENUMS AND PRIMITIVE TYPES
// ============================================================================

/**
 * Supported issue types for auto-fix detection and resolution
 */
export enum IssueType {
  COMPILATION = 'compilation',
  TEST = 'test',
  DEPENDENCY = 'dependency',
  PERFORMANCE = 'performance',
  LINT = 'lint',
  SECURITY = 'security'
}

/**
 * Severity levels for issues, affecting priority and auto-fix behavior
 */
export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Risk levels for fix strategies, determining approval requirements
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Fix execution status tracking
 */
export enum FixStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  APPLYING = 'applying',
  VALIDATING = 'validating',
  APPLIED = 'applied',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
  SKIPPED = 'skipped'
}

/**
 * Prediction timeframes for predictive insights
 */
export enum PredictionTimeframe {
  IMMEDIATE = '1-6h',
  SHORT_TERM = '6-24h',
  MEDIUM_TERM = '1-3d',
  LONG_TERM = '3-7d'
}

/**
 * Fix step action types
 */
export enum FixStepType {
  FILE_EDIT = 'file_edit',
  COMMAND = 'command',
  CONFIG_UPDATE = 'config_update',
  DEPENDENCY_UPDATE = 'dependency_update',
  TEST_RUN = 'test_run',
  RESTART_SERVICE = 'restart_service',
  CLEAR_CACHE = 'clear_cache'
}

/**
 * File change operation types
 */
export enum FileChangeType {
  CREATED = 'created',
  MODIFIED = 'modified',
  DELETED = 'deleted',
  MOVED = 'moved',
  RENAMED = 'renamed'
}

/**
 * Test execution results
 */
export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  TIMEOUT = 'timeout',
  ERROR = 'error'
}

/**
 * Business impact levels for predictive insights
 */
export enum BusinessImpact {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  SIGNIFICANT = 'significant',
  CRITICAL = 'critical'
}

/**
 * System health status levels
 */
export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

/**
 * Dependency information for issues
 */
export interface DependencyInfo {
  name: string;
  version?: string;
  type: 'direct' | 'dev' | 'peer' | 'optional';
  vulnerable?: boolean;
  outdated?: boolean;
  licenses?: string[];
  repository?: string;
}

/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

/**
 * Performance metrics data
 */
export interface PerformanceMetrics {
  memory?: MemoryMetrics;
  cpu?: number;
  responseTime?: number;
  throughput?: number;
  errorRate?: number;
  custom?: Record<string, number>;
}

/**
 * Git context information
 */
export interface GitContext {
  branch: string;
  commit: string;
  author?: string;
  timestamp?: Date;
  message?: string;
  modifiedFiles?: string[];
}

/**
 * External reference to issue trackers
 */
export interface ExternalReference {
  type: 'github' | 'jira' | 'linear' | 'custom';
  id: string;
  url?: string;
  title?: string;
  status?: string;
}

/**
 * Strategy prerequisite condition
 */
export interface StrategyPrerequisite {
  type: 'tool_available' | 'permission' | 'dependency' | 'environment';
  description: string;
  checker: string; // Function name or command to check
  required: boolean;
}

/**
 * Success criterion for strategy validation
 */
export interface SuccessCriterion {
  type: 'test_passes' | 'build_succeeds' | 'metric_improved' | 'error_resolved';
  description: string;
  target: string;
  threshold?: number;
  validator: string; // Function name or command
}

/**
 * Strategy-specific configuration
 */
export interface StrategyConfig {
  aggressive?: boolean;
  dryRun?: boolean;
  backupBeforeChange?: boolean;
  parallelExecution?: boolean;
  customSettings?: Record<string, any>;
}

/**
 * Condition for executing a step
 */
export interface StepCondition {
  type: 'file_exists' | 'env_var' | 'command_succeeds' | 'custom';
  target: string;
  expected?: any;
  operator?: '==' | '!=' | '>' | '<' | 'contains' | 'matches';
}

/**
 * Retry configuration for steps
 */
export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
  retryOn?: string[]; // Error codes to retry on
}

/**
 * Backup configuration
 */
export interface BackupConfig {
  enabled: boolean;
  location?: string;
  keepVersions?: number;
  includeMetadata?: boolean;
}

/**
 * Test assertion information
 */
export interface TestAssertion {
  type: string;
  actual: any;
  expected: any;
  passed: boolean;
  message?: string;
}

/**
 * Code coverage information
 */
export interface CoverageInfo {
  lines: number;
  functions: number;
  branches: number;
  statements: number;
  percentage: number;
}

/**
 * Test performance metrics
 */
export interface TestPerformanceMetrics {
  setupTime: number;
  executionTime: number;
  teardownTime: number;
  memoryUsage: number;
}

/**
 * Cache performance metrics
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

/**
 * Resource utilization metrics
 */
export interface ResourceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

/**
 * Performance comparison data
 */
export interface PerformanceComparison {
  baselineTime: number;
  currentTime: number;
  improvement: number;
  degradation: boolean;
}

/**
 * Historical evidence for predictions
 */
export interface HistoricalEvidence {
  occurrenceDate: Date;
  similarity: number;
  outcome: string;
  resolution?: string;
  timeTaken?: number;
}

/**
 * Feedback on prediction accuracy
 */
export interface PredictionFeedback {
  accurate: boolean;
  actualOutcome?: string;
  actualTimeframe?: string;
  comments?: string;
  timestamp: Date;
}

/**
 * Security implications of an issue
 */
export interface SecurityImplication {
  type: 'vulnerability' | 'exposure' | 'compliance';
  severity: SeverityLevel;
  description: string;
  cveId?: string;
  affectedVersions?: string[];
}

/**
 * Performance impact assessment
 */
export interface PerformanceImpact {
  responseTimeIncrease?: number;
  throughputDecrease?: number;
  memoryIncrease?: number;
  cpuIncrease?: number;
  customMetrics?: Record<string, number>;
}

/**
 * Recovery time estimates
 */
export interface RecoveryTimeEstimate {
  minimum: number;
  maximum: number;
  average: number;
  confidence: number;
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Location information for where an issue was detected
 * 
 * Provides precise location context including file, line, and
 * structural information to help with targeted fixes.
 * 
 * @interface IssueLocation
 */
export interface IssueLocation {
  /** File path where the issue was detected */
  file: string;
  
  /** Line number (1-based) */
  line?: number;
  
  /** Column number (1-based) */
  column?: number;
  
  /** Function or method name containing the issue */
  function?: string;
  
  /** Class name containing the issue */
  class?: string;
  
  /** Module or namespace containing the issue */
  module?: string;
  
  /** Repository or workspace root */
  repository?: string;
  
  /** Branch or commit where issue was detected */
  branch?: string;
  
  /** Additional location context */
  context?: Record<string, string>;
}

/**
 * Context-specific data for different issue types
 */
export interface IssueContext {
  /** Error messages or logs */
  errorMessage?: string;
  
  /** Stack trace information */
  stackTrace?: string;
  
  /** Compilation output */
  compilationOutput?: string;
  
  /** Test output and failures */
  testOutput?: string;
  
  /** Dependency information */
  dependencies?: DependencyInfo[];
  
  /** Performance metrics */
  performanceData?: PerformanceMetrics;
  
  /** Git information */
  gitContext?: GitContext;
  
  /** Environment variables */
  environment?: Record<string, string>;
  
  /** Configuration values */
  config?: Record<string, any>;
  
  /** Custom context data */
  custom?: Record<string, any>;
}

/**
 * Issue metadata for tracking and analysis
 */
export interface IssueMetadata {
  /** Times this issue has been seen */
  occurrenceCount?: number;
  
  /** First time this issue was detected */
  firstSeen?: Date;
  
  /** Last time this issue was detected */
  lastSeen?: Date;
  
  /** User who reported or triggered the issue */
  reportedBy?: string;
  
  /** External issue tracker references */
  externalRefs?: ExternalReference[];
  
  /** Issue labels or categories */
  labels?: string[];
  
  /** Custom metadata fields */
  custom?: Record<string, any>;
}

/**
 * Central issue representation for the auto-fix system
 * 
 * Represents a detected or predicted development issue that can be
 * automatically analyzed and potentially resolved.
 * 
 * @interface AutoFixIssue
 */
export interface AutoFixIssue {
  /** Unique identifier for the issue */
  id: string;
  
  /** Type classification of the issue */
  type: IssueType;
  
  /** Severity level affecting priority and handling */
  severity: SeverityLevel;
  
  /** Human-readable title summarizing the issue */
  title: string;
  
  /** Detailed description of the issue */
  description: string;
  
  /** Location information where the issue was detected */
  location: IssueLocation;
  
  /** Additional context data specific to the issue type */
  context: IssueContext;
  
  /** Timestamp when the issue was detected */
  detected: Date;
  
  /** Whether this issue was predicted rather than directly detected */
  predicted?: boolean;
  
  /** Confidence score (0-1) in the issue detection accuracy */
  confidence: number;
  
  /** Categorical tags for filtering and organization */
  tags: string[];
  
  /** IDs of related or dependent issues */
  relatedIssues?: string[];
  
  /** Hash of issue characteristics for deduplication */
  fingerprint?: string;
  
  /** Estimated time to fix in minutes */
  estimatedFixTime?: number;
  
  /** Whether this issue blocks other development work */
  blocking?: boolean;
  
  /** Source system or tool that detected the issue */
  source?: string;
  
  /** Issue metadata for tracking and analysis */
  metadata?: IssueMetadata;
}

/**
 * Validation context for custom validators
 */
export interface ValidationContext {
  issue: AutoFixIssue;
  strategy: FixStrategy;
  changes: FileChange[];
  environment: Record<string, string>;
  workingDirectory: string;
}

/**
 * Rule for validating the success of a fix action
 * 
 * Defines conditions to check whether an action completed
 * successfully and achieved its intended effect.
 * 
 * @interface ValidationRule
 */
export interface ValidationRule {
  /** Type of validation to perform */
  type: 'file_exists' | 'file_contains' | 'test_passes' | 'build_succeeds' | 'performance_check' | 'service_healthy' | 'custom';
  
  /** Target to validate (file path, test suite, etc.) */
  target: string;
  
  /** Expected result or condition */
  expected: any;
  
  /** Maximum time to wait for validation in milliseconds */
  timeout?: number;
  
  /** Whether this validation is required for success */
  required?: boolean;
  
  /** Custom validation function for 'custom' type */
  customValidator?: (context: ValidationContext) => Promise<boolean>;
  
  /** Additional validation parameters */
  parameters?: Record<string, any>;
  
  /** Error message if validation fails */
  errorMessage?: string;
}

/**
 * Specific action to execute within a fix step
 * 
 * Defines the actual operation to perform, including
 * parameters and validation rules.
 * 
 * @interface FixAction
 */
export interface FixAction {
  /** Type of action (e.g., 'edit_file', 'run_command', 'update_package') */
  type: string;
  
  /** Target of the action (file path, command name, etc.) */
  target: string;
  
  /** Action-specific parameters */
  parameters: Record<string, any>;
  
  /** Validation rules to check after action execution */
  validation?: ValidationRule[];
  
  /** Working directory for the action */
  workingDirectory?: string;
  
  /** Environment variables for the action */
  environment?: Record<string, string>;
  
  /** Whether the action requires elevated privileges */
  requiresElevation?: boolean;
  
  /** Expected exit code for command actions */
  expectedExitCode?: number;
  
  /** Input data for interactive commands */
  input?: string;
  
  /** Backup configuration before making changes */
  backup?: BackupConfig;
}

/**
 * Individual step in a fix strategy
 * 
 * Represents a single, atomic operation that can be executed
 * as part of a larger fix strategy.
 * 
 * @interface FixStep
 */
export interface FixStep {
  /** Unique identifier for the step */
  id: string;
  
  /** Type of operation this step performs */
  type: FixStepType;
  
  /** Human-readable description of what this step does */
  description: string;
  
  /** The main action to execute */
  action: FixAction;
  
  /** Action to execute if rollback is needed */
  rollbackAction?: FixAction;
  
  /** Whether this step can be skipped if it fails */
  optional: boolean;
  
  /** Maximum execution time in milliseconds */
  timeout?: number;
  
  /** Order/priority within the strategy (lower = earlier) */
  order?: number;
  
  /** Conditions that must be true to execute this step */
  conditions?: StepCondition[];
  
  /** Dependencies on other steps */
  dependencies?: string[];
  
  /** Whether to continue on failure */
  continueOnFailure?: boolean;
  
  /** Retry configuration */
  retryConfig?: RetryConfig;
}

/**
 * Strategy for resolving a specific issue or class of issues
 * 
 * Defines a comprehensive approach to fixing an issue including
 * steps, risk assessment, and rollback procedures.
 * 
 * @interface FixStrategy
 */
export interface FixStrategy {
  /** Unique identifier for the strategy */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Detailed description of what the strategy does */
  description: string;
  
  /** Issue types this strategy can handle */
  issueTypes: IssueType[];
  
  /** Ordered sequence of fix steps */
  steps: FixStep[];
  
  /** Risk level of applying this strategy */
  riskLevel: RiskLevel;
  
  /** Confidence score (0-1) in strategy success */
  confidence: number;
  
  /** Estimated execution time in seconds */
  estimatedTime: number;
  
  /** Prerequisites that must be met before applying */
  prerequisites: StrategyPrerequisite[];
  
  /** Steps to rollback if the fix fails */
  rollbackSteps: FixStep[];
  
  /** Criteria to determine if the fix was successful */
  successCriteria: SuccessCriterion[];
  
  /** Categorical tags for organization */
  tags: string[];
  
  /** Strategy version for tracking changes */
  version?: string;
  
  /** Author or source of the strategy */
  author?: string;
  
  /** Creation and update timestamps */
  created?: Date;
  updated?: Date;
  
  /** Historical success rate (0-1) */
  successRate?: number;
  
  /** Number of times this strategy has been used */
  usageCount?: number;
  
  /** Average execution time from historical data */
  averageExecutionTime?: number;
  
  /** Strategy-specific configuration */
  config?: StrategyConfig;
}

/**
 * Record of a file system change made during fix execution
 * 
 * Tracks all modifications to help with rollback and audit trails.
 * 
 * @interface FileChange
 */
export interface FileChange {
  /** File path that was changed */
  file: string;
  
  /** Type of change performed */
  type: FileChangeType;
  
  /** File content before the change */
  before?: string;
  
  /** File content after the change */
  after?: string;
  
  /** Unified diff of the changes */
  diff?: string;
  
  /** File permissions before change */
  permissionsBefore?: string;
  
  /** File permissions after change */
  permissionsAfter?: string;
  
  /** Backup location if file was backed up */
  backupPath?: string;
  
  /** Timestamp when change was made */
  timestamp?: Date;
  
  /** Size change in bytes */
  sizeChange?: number;
  
  /** Checksum of content before change */
  checksumBefore?: string;
  
  /** Checksum of content after change */
  checksumAfter?: string;
  
  /** Whether this change can be safely rolled back */
  rollbackable?: boolean;
}

/**
 * Result of executing a test during fix validation
 * 
 * Provides detailed information about test execution to
 * validate that fixes don't break existing functionality.
 * 
 * @interface TestResult
 */
export interface TestResult {
  /** Test suite or framework name */
  testSuite: string;
  
  /** Specific test name or description */
  testName?: string;
  
  /** Test execution status */
  status: TestStatus;
  
  /** Execution duration in milliseconds */
  duration: number;
  
  /** Error message if test failed */
  error?: string;
  
  /** Detailed test output */
  output?: string;
  
  /** Stack trace for failed tests */
  stackTrace?: string;
  
  /** Test file path */
  file?: string;
  
  /** Assertions made in the test */
  assertions?: TestAssertion[];
  
  /** Coverage information if available */
  coverage?: CoverageInfo;
  
  /** Performance metrics for the test */
  performance?: TestPerformanceMetrics;
  
  /** Test configuration used */
  config?: Record<string, any>;
}

/**
 * Error information when a fix fails
 * 
 * Provides comprehensive error details to help with
 * debugging and improving fix strategies.
 * 
 * @interface FixError
 */
export interface FixError {
  /** Error code for categorization */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Stack trace if available */
  stack?: string;
  
  /** Additional error context */
  context?: Record<string, any>;
  
  /** Whether the error is recoverable with retry */
  recoverable: boolean;
  
  /** Which step failed (if applicable) */
  failedStep?: string;
  
  /** Original underlying error */
  cause?: Error;
  
  /** Suggested resolution actions */
  suggestions?: string[];
  
  /** Related documentation or help links */
  helpLinks?: string[];
  
  /** Error severity */
  severity?: SeverityLevel;
  
  /** Timestamp when error occurred */
  timestamp?: Date;
  
  /** Whether this error requires human intervention */
  requiresHumanIntervention?: boolean;
}

/**
 * Performance and operational metrics for fix execution
 * 
 * Tracks detailed timing and resource usage metrics
 * for performance analysis and optimization.
 * 
 * @interface FixMetrics
 */
export interface FixMetrics {
  /** Time spent detecting the issue in milliseconds */
  detectionTime: number;
  
  /** Time spent analyzing the issue in milliseconds */
  analysisTime: number;
  
  /** Time spent applying the fix in milliseconds */
  fixTime: number;
  
  /** Time spent validating the fix in milliseconds */
  validationTime: number;
  
  /** Total end-to-end time in milliseconds */
  totalTime: number;
  
  /** Number of code lines changed */
  linesChanged: number;
  
  /** Number of files affected */
  filesAffected: number;
  
  /** Number of tests executed */
  testsRun: number;
  
  /** Memory usage during fix execution */
  memoryUsage?: MemoryMetrics;
  
  /** CPU usage during fix execution */
  cpuUsage?: number;
  
  /** Network requests made (if any) */
  networkRequests?: number;
  
  /** Disk I/O operations performed */
  diskOperations?: number;
  
  /** Cache hit/miss ratios */
  cacheMetrics?: CacheMetrics;
  
  /** Resource utilization summary */
  resourceUtilization?: ResourceMetrics;
  
  /** Performance comparison with baseline */
  performanceComparison?: PerformanceComparison;
}

/**
 * Result of executing a single step
 */
export interface StepResult {
  stepId: string;
  status: 'success' | 'failure' | 'skipped';
  startTime: Date;
  endTime: Date;
  output?: string;
  error?: string;
  changes?: FileChange[];
  metrics?: Record<string, number>;
}

/**
 * Result of validation checks
 */
export interface ValidationResult {
  ruleId?: string;
  type: string;
  target: string;
  success: boolean;
  message?: string;
  actualValue?: any;
  expectedValue?: any;
  duration?: number;
}

/**
 * Execution context for fix operations
 */
export interface ExecutionContext {
  userId?: string;
  sessionId?: string;
  environment: 'development' | 'staging' | 'production';
  triggeredBy: 'automatic' | 'manual' | 'scheduled';
  dryRun?: boolean;
  settings?: Record<string, any>;
}

/**
 * Individual rollback step result
 */
export interface RollbackStep {
  action: string;
  target: string;
  success: boolean;
  error?: string;
}

/**
 * Result of rollback operations
 */
export interface RollbackResult {
  success: boolean;
  steps: RollbackStep[];
  duration: number;
  error?: string;
  restoredFiles?: string[];
}

/**
 * Complete result of executing a fix strategy
 * 
 * Contains comprehensive information about the fix execution
 * including success status, changes made, and performance metrics.
 * 
 * @interface FixResult
 */
export interface FixResult {
  /** Strategy that was executed */
  strategy: FixStrategy;
  
  /** Issue that was being fixed */
  issue: AutoFixIssue;
  
  /** Current status of the fix */
  status: FixStatus;
  
  /** Whether the fix was actually applied */
  applied: boolean;
  
  /** Whether the fix was successful */
  success: boolean;
  
  /** Total execution time in milliseconds */
  executionTime: number;
  
  /** When fix execution started */
  startTime: Date;
  
  /** When fix execution completed */
  endTime?: Date;
  
  /** File changes made during the fix */
  changes: FileChange[];
  
  /** Test results from validation */
  testsRun: TestResult[];
  
  /** Whether rollback is required */
  rollbackRequired: boolean;
  
  /** Error information if the fix failed */
  error?: FixError;
  
  /** Detailed performance metrics */
  metrics: FixMetrics;
  
  /** Step-by-step execution results */
  stepResults?: StepResult[];
  
  /** Validation results */
  validationResults?: ValidationResult[];
  
  /** User who triggered the fix (if manual) */
  triggeredBy?: string;
  
  /** Additional context about the execution */
  executionContext?: ExecutionContext;
  
  /** Rollback results if rollback was performed */
  rollbackResult?: RollbackResult;
}

// ============================================================================
// PREDICTIVE ANALYSIS INTERFACES
// ============================================================================

/**
 * Factor that contributes to a predictive insight
 * 
 * Represents a specific condition or trend that increases
 * the likelihood of a predicted issue occurring.
 * 
 * @interface PredictionTrigger
 */
export interface PredictionTrigger {
  /** Type of trigger condition */
  type: 'code_change' | 'dependency_update' | 'performance_trend' | 'historical_pattern' | 'environmental_change' | 'user_behavior';
  
  /** Source of the trigger data */
  source: string;
  
  /** Human-readable description */
  description: string;
  
  /** Weight/importance of this trigger (0-1) */
  weight: number;
  
  /** Current value of the trigger metric */
  currentValue?: any;
  
  /** Threshold value that indicates risk */
  threshold?: any;
  
  /** Trend direction (increasing, decreasing, stable) */
  trend?: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  
  /** When this trigger was last updated */
  lastUpdated?: Date;
  
  /** Additional trigger-specific data */
  metadata?: Record<string, any>;
}

/**
 * Assessment of the potential impact of a predicted issue
 * 
 * Provides comprehensive analysis of how an issue might
 * affect the system, users, and business operations.
 * 
 * @interface ImpactAssessment
 */
export interface ImpactAssessment {
  /** Severity level of the potential issue */
  severity: SeverityLevel;
  
  /** System components that would be affected */
  affectedComponents: string[];
  
  /** Estimated downtime in minutes */
  estimatedDowntime?: number;
  
  /** Level of business impact */
  businessImpact: BusinessImpact;
  
  /** Technical debt score (0-100) */
  technicalDebt: number;
  
  /** Estimated cost of the issue in dollars */
  estimatedCost?: number;
  
  /** Number of users potentially affected */
  affectedUsers?: number;
  
  /** Data loss risk assessment */
  dataLossRisk?: 'none' | 'low' | 'medium' | 'high';
  
  /** Security implications */
  securityImplications?: SecurityImplication[];
  
  /** Performance impact metrics */
  performanceImpact?: PerformanceImpact;
  
  /** Compliance or regulatory risks */
  complianceRisks?: string[];
  
  /** Recovery time estimates */
  recoveryTimeEstimate?: RecoveryTimeEstimate;
}

/**
 * Predictive insight about potential future issues
 * 
 * Represents an AI-generated prediction about likely problems
 * based on historical data and current trends.
 * 
 * @interface PredictiveInsight
 */
export interface PredictiveInsight {
  /** Unique identifier for the insight */
  id: string;
  
  /** Type of issue being predicted */
  issueType: IssueType;
  
  /** Human-readable title */
  title: string;
  
  /** Detailed description of the predicted issue */
  description: string;
  
  /** Probability of occurrence (0-1) */
  probability: number;
  
  /** Confidence in the prediction (0-1) */
  confidence: number;
  
  /** Expected timeframe for issue occurrence */
  timeframe: PredictionTimeframe;
  
  /** Factors that contribute to this prediction */
  triggers: PredictionTrigger[];
  
  /** Suggested preventive actions */
  preventionSuggestions: string[];
  
  /** Assessed impact if the issue occurs */
  impactAssessment: ImpactAssessment;
  
  /** When the prediction was generated */
  created: Date;
  
  /** When the prediction expires */
  expiresAt: Date;
  
  /** Historical data supporting the prediction */
  historicalEvidence?: HistoricalEvidence[];
  
  /** Model version used for prediction */
  modelVersion?: string;
  
  /** Prediction algorithm used */
  algorithm?: string;
  
  /** Whether this prediction has been acted upon */
  actionTaken?: boolean;
  
  /** User feedback on prediction accuracy */
  feedback?: PredictionFeedback;
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

/**
 * Notification configuration
 */
export interface NotificationConfig {
  enabled: boolean;
  channels: ('slack' | 'email' | 'webhook')[];
  onSuccess: boolean;
  onFailure: boolean;
  onPrediction: boolean;
  thresholds: {
    criticalIssues: boolean;
    highRiskFixes: boolean;
    bulkOperations: boolean;
  };
}

/**
 * Learning system configuration
 */
export interface LearningConfig {
  enabled: boolean;
  collectMetrics: boolean;
  updateModels: boolean;
  shareAnonymizedData: boolean;
  modelUpdateInterval: number;
}

/**
 * Safety configuration
 */
export interface SafetyConfig {
  requireBackups: boolean;
  confirmHighRiskFixes: boolean;
  preventProductionChanges: boolean;
  maxFilesPerFix: number;
  maxLinesPerFix: number;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  realTimeMonitoring: boolean;
  metricCollection: boolean;
  performanceTracking: boolean;
  healthChecks: boolean;
  alerting: boolean;
}

/**
 * Health monitoring integration config
 */
export interface HealthIntegrationConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  pollInterval?: number;
}

/**
 * Version control integration config
 */
export interface VCSIntegrationConfig {
  provider: 'git' | 'svn' | 'mercurial';
  autoCommit: boolean;
  branchStrategy: 'main' | 'feature' | 'hotfix';
  commitMessageTemplate?: string;
}

/**
 * Testing integration config
 */
export interface TestIntegrationConfig {
  framework: 'jest' | 'mocha' | 'pytest' | 'junit' | 'custom';
  runBeforeFix: boolean;
  runAfterFix: boolean;
  testTimeout: number;
  coverageThreshold?: number;
}

/**
 * Deployment integration config
 */
export interface DeploymentIntegrationConfig {
  enabled: boolean;
  autoDeployOnSuccess: boolean;
  environment: string;
  rollbackOnFailure: boolean;
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  healthMonitoring?: HealthIntegrationConfig;
  versionControl?: VCSIntegrationConfig;
  testing?: TestIntegrationConfig;
  deployment?: DeploymentIntegrationConfig;
}

/**
 * Configuration for the auto-fix system
 * 
 * Central configuration controlling all aspects of
 * the auto-fix system behavior and policies.
 * 
 * @interface AutoFixConfig
 */
export interface AutoFixConfig {
  /** Whether the auto-fix system is enabled */
  enabled: boolean;
  
  /** Minimum confidence threshold (0-1) for automatic application */
  autoApplyThreshold: number;
  
  /** Maximum risk level for automatic fixes */
  riskTolerance: RiskLevel;
  
  /** Issue types that auto-fix should handle */
  enabledIssueTypes: IssueType[];
  
  /** Whether test validation is required before applying fixes */
  testValidationRequired: boolean;
  
  /** Whether to automatically rollback failed fixes */
  rollbackOnFailure: boolean;
  
  /** Maximum number of concurrent fix operations */
  maxConcurrentFixes: number;
  
  /** Number of retry attempts for failed operations */
  retryAttempts: number;
  
  /** Timeout values in milliseconds */
  timeouts: {
    detection: number;
    analysis: number;
    fixing: number;
    validation: number;
    total: number;
  };
  
  /** Notification settings */
  notifications: NotificationConfig;
  
  /** Learning system configuration */
  learning: LearningConfig;
  
  /** Backup and safety settings */
  safety: SafetyConfig;
  
  /** Performance monitoring settings */
  monitoring: MonitoringConfig;
  
  /** Integration-specific settings */
  integrations: IntegrationConfig;
}

// ============================================================================
// PATTERN AND HISTORY INTERFACES
// ============================================================================

/**
 * Condition that must be met to apply a fix pattern
 * 
 * Defines requirements that must be satisfied before
 * a pattern can be safely applied to an issue.
 * 
 * @interface PatternCondition
 */
export interface PatternCondition {
  /** Type of condition to check */
  type: 'file_exists' | 'content_matches' | 'dependency_present' | 'config_value' | 'environment_var' | 'tool_available';
  
  /** Target to check (file path, dependency name, etc.) */
  target: string;
  
  /** Comparison operator */
  operator: '==' | '!=' | 'matches' | 'contains' | 'exists' | '>' | '<' | '>=' | '<=';
  
  /** Expected value to compare against */
  value: any;
  
  /** Whether to negate the condition */
  negate?: boolean;
  
  /** Description of what this condition checks */
  description?: string;
}

/**
 * Example of a successful pattern application
 */
export interface PatternExample {
  issueDescription: string;
  appliedFix: string;
  outcome: string;
  timestamp: Date;
  successMetrics?: Record<string, number>;
}

/**
 * Reusable pattern for issue detection and fixing
 * 
 * Represents a learned pattern that can be applied
 * to similar issues in the future.
 * 
 * @interface FixPattern
 */
export interface FixPattern {
  /** Unique identifier for the pattern */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Type of issue this pattern addresses */
  issueType: IssueType;
  
  /** Pattern to match against issue descriptions or code */
  pattern: RegExp | string;
  
  /** Template for generating fixes */
  template: string;
  
  /** Variables extracted from the pattern match */
  variables: string[];
  
  /** Conditions that must be met to apply this pattern */
  conditions: PatternCondition[];
  
  /** Confidence score (0-1) in pattern accuracy */
  confidence: number;
  
  /** Historical success rate (0-1) */
  successRate: number;
  
  /** Number of times this pattern has been used */
  usage: number;
  
  /** When this pattern was last used */
  lastUsed: Date;
  
  /** Pattern creation date */
  created: Date;
  
  /** Pattern version */
  version: string;
  
  /** Tags for categorization */
  tags: string[];
  
  /** Whether this pattern is enabled */
  enabled: boolean;
  
  /** Pattern author or source */
  author?: string;
  
  /** Examples of successful applications */
  examples?: PatternExample[];
}

/**
 * User feedback on fix quality and effectiveness
 * 
 * Collects human feedback to improve fix strategies
 * and pattern recognition over time.
 * 
 * @interface FixFeedback
 */
export interface FixFeedback {
  /** Overall rating of the fix (1-5) */
  rating: 1 | 2 | 3 | 4 | 5;
  
  /** Whether the fix was helpful */
  helpful: boolean;
  
  /** Free-form comments */
  comments?: string;
  
  /** Suggested improvements */
  improvements?: string[];
  
  /** When feedback was provided */
  timestamp: Date;
  
  /** Specific aspects rated */
  aspects?: {
    accuracy: number;
    speed: number;
    safety: number;
    completeness: number;
  };
  
  /** Whether user would recommend auto-fix for similar issues */
  wouldRecommend?: boolean;
  
  /** Tags for categorizing feedback */
  tags?: string[];
}

/**
 * Cost-benefit analysis for fix operations
 */
export interface CostBenefitAnalysis {
  timeSaved: number; // in minutes
  riskReduced: number; // 0-1 scale
  qualityImproved: number; // 0-1 scale
  resourcesUsed: number; // in dollars or arbitrary units
  userSatisfaction: number; // 0-1 scale
}

/**
 * Historical record of a fix operation
 * 
 * Maintains a complete audit trail of all fix operations
 * for learning, debugging, and compliance purposes.
 * 
 * @interface FixHistory
 */
export interface FixHistory {
  /** Unique identifier for this history record */
  id: string;
  
  /** Issue that was fixed */
  issue: AutoFixIssue;
  
  /** Strategy that was applied */
  strategy: FixStrategy;
  
  /** Result of the fix operation */
  result: FixResult;
  
  /** When the fix was performed */
  timestamp: Date;
  
  /** User who triggered the fix (if manual) */
  user?: string;
  
  /** User feedback on the fix quality */
  feedback?: FixFeedback;
  
  /** Environment where fix was applied */
  environment?: string;
  
  /** Git commit hash after the fix */
  commitHash?: string;
  
  /** Related issues that were also affected */
  relatedFixes?: string[];
  
  /** Cost/benefit analysis of the fix */
  costBenefit?: CostBenefitAnalysis;
  
  /** Lessons learned from this fix */
  lessonsLearned?: string[];
}

// ============================================================================
// DETECTION AND MONITORING INTERFACES
// ============================================================================

/**
 * Condition for rule evaluation
 * 
 * Additional criteria that must be met for a
 * detection rule to trigger an action.
 * 
 * @interface RuleCondition
 */
export interface RuleCondition {
  /** Field or property to evaluate */
  field: string;
  
  /** Comparison operator */
  operator: 'equals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan' | 'in' | 'notIn' | 'startsWith' | 'endsWith';
  
  /** Value to compare against */
  value: any;
  
  /** Whether to negate the condition result */
  negate?: boolean;
  
  /** Optional description */
  description?: string;
  
  /** Data type of the field */
  dataType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
}

/**
 * Condition for action execution
 */
export interface ActionCondition {
  type: 'time_window' | 'rate_limit' | 'dependency' | 'approval';
  parameters: Record<string, any>;
}

/**
 * Action to take when a detection rule triggers
 * 
 * Defines what should happen when an issue is detected
 * by a monitoring rule.
 * 
 * @interface RuleAction
 */
export interface RuleAction {
  /** Type of action to perform */
  type: 'create_issue' | 'notify' | 'auto_fix' | 'escalate' | 'log' | 'block' | 'custom';
  
  /** Action-specific parameters */
  parameters: Record<string, any>;
  
  /** Priority of this action */
  priority?: number;
  
  /** Whether this action can run concurrently with others */
  concurrent?: boolean;
  
  /** Timeout for action execution */
  timeout?: number;
  
  /** Retry configuration */
  retry?: RetryConfig;
  
  /** Conditions for action execution */
  conditions?: ActionCondition[];
}

/**
 * Performance metrics for detection rules
 */
export interface RuleMetrics {
  totalMatches: number;
  truePositives: number;
  falsePositives: number;
  averageProcessingTime: number;
  lastTriggered?: Date;
}

/**
 * Rule for detecting specific types of issues
 * 
 * Defines how to identify and classify issues
 * automatically from various sources.
 * 
 * @interface DetectionRule
 */
export interface DetectionRule {
  /** Unique identifier for the rule */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description of what this rule detects */
  description: string;
  
  /** Type of issue this rule detects */
  issueType: IssueType;
  
  /** Pattern to match against logs, errors, or code */
  pattern: string | RegExp;
  
  /** Severity level assigned to detected issues */
  severity: SeverityLevel;
  
  /** Confidence in detection accuracy (0-1) */
  confidence: number;
  
  /** Whether this rule is active */
  enabled: boolean;
  
  /** Additional conditions for rule activation */
  conditions: RuleCondition[];
  
  /** Actions to take when rule matches */
  actions: RuleAction[];
  
  /** Rule creation and update timestamps */
  created: Date;
  updated: Date;
  
  /** Rule version */
  version: string;
  
  /** Tags for organization */
  tags: string[];
  
  /** Performance metrics for this rule */
  metrics?: RuleMetrics;
}

// ============================================================================
// SYSTEM STATE AND MONITORING
// ============================================================================

/**
 * System performance metrics
 */
export interface SystemPerformanceMetrics {
  throughput: number; // operations per second
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  availability: number;
}

/**
 * System load information
 */
export interface SystemLoad {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  concurrentOperations: number;
}

/**
 * Resource usage tracking
 */
export interface ResourceUsage {
  memoryMB: number;
  cpuPercent: number;
  diskSpaceMB: number;
  networkBytesPerSec: number;
  openFileDescriptors: number;
}

/**
 * Active alert information
 */
export interface ActiveAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

/**
 * Recent activity summary
 */
export interface ActivitySummary {
  lastHour: {
    issuesDetected: number;
    fixesApplied: number;
    errorsOccurred: number;
  };
  lastDay: {
    issuesDetected: number;
    fixesApplied: number;
    errorsOccurred: number;
  };
  trends: {
    issueDetectionTrend: 'increasing' | 'decreasing' | 'stable';
    fixSuccessTrend: 'improving' | 'declining' | 'stable';
  };
}

/**
 * Configuration status information
 */
export interface ConfigurationStatus {
  valid: boolean;
  lastUpdated: Date;
  activeRules: number;
  enabledMonitors: number;
  configurationErrors: string[];
}

/**
 * Integration health status
 */
export interface IntegrationHealth {
  name: string;
  type: string;
  status: HealthStatus;
  lastCheck: Date;
  responseTime?: number;
  errorMessage?: string;
}

/**
 * Current state of the monitoring system
 * 
 * Provides real-time visibility into the auto-fix
 * system's operational status and performance.
 * 
 * @interface MonitoringState
 */
export interface MonitoringState {
  /** Whether monitoring is currently enabled */
  enabled: boolean;
  
  /** Last time monitoring performed a check */
  lastCheck: Date;
  
  /** Total issues detected since last reset */
  issuesDetected: number;
  
  /** Total fixes applied since last reset */
  fixesApplied: number;
  
  /** Overall success rate (0-1) */
  successRate: number;
  
  /** Average fix time in milliseconds */
  averageFixTime: number;
  
  /** List of currently active monitors */
  activeMonitors: string[];
  
  /** Overall system health status */
  healthStatus: HealthStatus;
  
  /** Detailed performance metrics */
  performanceMetrics: SystemPerformanceMetrics;
  
  /** Current system load */
  systemLoad: SystemLoad;
  
  /** Resource utilization */
  resourceUsage: ResourceUsage;
  
  /** Alert status */
  alerts: ActiveAlert[];
  
  /** Recent activity summary */
  recentActivity: ActivitySummary;
  
  /** Configuration status */
  configurationStatus: ConfigurationStatus;
  
  /** Integration health */
  integrationHealth: IntegrationHealth[];
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

/**
 * Type guard to check if an object is an AutoFixIssue
 */
export function isAutoFixIssue(obj: any): obj is AutoFixIssue {
  return obj &&
    typeof obj.id === 'string' &&
    Object.values(IssueType).includes(obj.type) &&
    Object.values(SeverityLevel).includes(obj.severity) &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    obj.location &&
    typeof obj.location.file === 'string' &&
    obj.detected instanceof Date &&
    typeof obj.confidence === 'number' &&
    Array.isArray(obj.tags);
}

/**
 * Type guard to check if an object is a FixStrategy
 */
export function isFixStrategy(obj: any): obj is FixStrategy {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    Array.isArray(obj.issueTypes) &&
    Array.isArray(obj.steps) &&
    Object.values(RiskLevel).includes(obj.riskLevel) &&
    typeof obj.confidence === 'number' &&
    typeof obj.estimatedTime === 'number';
}

/**
 * Type guard to check if an object is a FixResult
 */
export function isFixResult(obj: any): obj is FixResult {
  return obj &&
    isFixStrategy(obj.strategy) &&
    isAutoFixIssue(obj.issue) &&
    Object.values(FixStatus).includes(obj.status) &&
    typeof obj.applied === 'boolean' &&
    typeof obj.success === 'boolean' &&
    typeof obj.executionTime === 'number' &&
    obj.startTime instanceof Date &&
    Array.isArray(obj.changes) &&
    Array.isArray(obj.testsRun);
}

/**
 * Type guard to check if an object is a PredictiveInsight
 */
export function isPredictiveInsight(obj: any): obj is PredictiveInsight {
  return obj &&
    typeof obj.id === 'string' &&
    Object.values(IssueType).includes(obj.issueType) &&
    typeof obj.title === 'string' &&
    typeof obj.probability === 'number' &&
    typeof obj.confidence === 'number' &&
    Object.values(PredictionTimeframe).includes(obj.timeframe) &&
    obj.created instanceof Date &&
    obj.expiresAt instanceof Date;
}

/**
 * Type guard to check if an object is a valid configuration
 */
export function isAutoFixConfig(obj: any): obj is AutoFixConfig {
  return obj &&
    typeof obj.enabled === 'boolean' &&
    typeof obj.autoApplyThreshold === 'number' &&
    Object.values(RiskLevel).includes(obj.riskTolerance) &&
    Array.isArray(obj.enabledIssueTypes) &&
    typeof obj.testValidationRequired === 'boolean' &&
    typeof obj.rollbackOnFailure === 'boolean' &&
    typeof obj.maxConcurrentFixes === 'number' &&
    obj.timeouts &&
    typeof obj.timeouts.detection === 'number';
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Union type of all possible issue contexts
 */
export type IssueContextUnion = IssueContext;

/**
 * Union type of all fix step types
 */
export type FixStepTypeUnion = keyof typeof FixStepType;

/**
 * Union type of all validation rule types
 */
export type ValidationRuleType = 'file_exists' | 'file_contains' | 'test_passes' | 'build_succeeds' | 'performance_check' | 'service_healthy' | 'custom';

/**
 * Utility type for partial configuration updates
 */
export type PartialAutoFixConfig = Partial<AutoFixConfig>;

/**
 * Utility type for creating new issues (omits computed fields)
 */
export type CreateIssueInput = Omit<AutoFixIssue, 'id' | 'detected' | 'fingerprint'>;

/**
 * Utility type for strategy templates (omits computed fields)
 */
export type StrategyTemplate = Omit<FixStrategy, 'id' | 'created' | 'updated' | 'successRate' | 'usageCount' | 'averageExecutionTime'>;

/**
 * Result type for async operations
 */
export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}>;

/**
 * Event payload for system events
 */
export interface SystemEvent {
  id: string;
  type: 'issue_detected' | 'fix_applied' | 'prediction_generated' | 'error_occurred' | 'config_updated';
  timestamp: Date;
  source: string;
  data: Record<string, any>;
  severity: SeverityLevel;
}

/**
 * Callback function type for event listeners
 */
export type EventCallback<T = any> = (event: SystemEvent & { data: T }) => void | Promise<void>;

/**
 * Filter criteria for querying historical data
 */
export interface HistoryFilter {
  issueTypes?: IssueType[];
  severityLevels?: SeverityLevel[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  success?: boolean;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Search criteria for finding similar issues
 */
export interface SimilaritySearch {
  issue: AutoFixIssue;
  threshold?: number;
  includeResolved?: boolean;
  maxResults?: number;
}

/**
 * Batch operation request
 */
export interface BatchOperation<T> {
  items: T[];
  concurrency?: number;
  continueOnError?: boolean;
  timeout?: number;
}

/**
 * Batch operation result
 */
export interface BatchResult<T, R> {
  results: (R | Error)[];
  successful: number;
  failed: number;
  totalTime: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// CONSTANTS AND DEFAULTS
// ============================================================================

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AutoFixConfig = {
  enabled: true,
  autoApplyThreshold: 0.9,
  riskTolerance: RiskLevel.MEDIUM,
  enabledIssueTypes: [IssueType.COMPILATION, IssueType.TEST, IssueType.LINT],
  testValidationRequired: true,
  rollbackOnFailure: true,
  maxConcurrentFixes: 3,
  retryAttempts: 2,
  timeouts: {
    detection: 30000,
    analysis: 60000,
    fixing: 300000,
    validation: 120000,
    total: 600000
  },
  notifications: {
    enabled: true,
    channels: ['slack'],
    onSuccess: false,
    onFailure: true,
    onPrediction: true,
    thresholds: {
      criticalIssues: true,
      highRiskFixes: true,
      bulkOperations: true
    }
  },
  learning: {
    enabled: true,
    collectMetrics: true,
    updateModels: true,
    shareAnonymizedData: false,
    modelUpdateInterval: 86400000 // 24 hours
  },
  safety: {
    requireBackups: true,
    confirmHighRiskFixes: true,
    preventProductionChanges: false,
    maxFilesPerFix: 10,
    maxLinesPerFix: 1000
  },
  monitoring: {
    realTimeMonitoring: true,
    metricCollection: true,
    performanceTracking: true,
    healthChecks: true,
    alerting: true
  },
  integrations: {
    healthMonitoring: {
      enabled: false
    },
    versionControl: {
      provider: 'git',
      autoCommit: false,
      branchStrategy: 'feature'
    },
    testing: {
      framework: 'jest',
      runBeforeFix: true,
      runAfterFix: true,
      testTimeout: 30000
    },
    deployment: {
      enabled: false,
      autoDeployOnSuccess: false,
      environment: 'development',
      rollbackOnFailure: true
    }
  }
};

/**
 * Supported issue type mappings
 */
export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  [IssueType.COMPILATION]: 'Compilation Error',
  [IssueType.TEST]: 'Test Failure',
  [IssueType.DEPENDENCY]: 'Dependency Issue',
  [IssueType.PERFORMANCE]: 'Performance Problem',
  [IssueType.LINT]: 'Code Quality Issue',
  [IssueType.SECURITY]: 'Security Vulnerability'
};

/**
 * Severity level mappings
 */
export const SEVERITY_LEVEL_LABELS: Record<SeverityLevel, string> = {
  [SeverityLevel.LOW]: 'Low',
  [SeverityLevel.MEDIUM]: 'Medium',
  [SeverityLevel.HIGH]: 'High',
  [SeverityLevel.CRITICAL]: 'Critical'
};

/**
 * Risk level mappings
 */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Low Risk',
  [RiskLevel.MEDIUM]: 'Medium Risk',
  [RiskLevel.HIGH]: 'High Risk'
};

/**
 * Fix status mappings
 */
export const FIX_STATUS_LABELS: Record<FixStatus, string> = {
  [FixStatus.PENDING]: 'Pending',
  [FixStatus.ANALYZING]: 'Analyzing',
  [FixStatus.APPLYING]: 'Applying',
  [FixStatus.VALIDATING]: 'Validating',
  [FixStatus.APPLIED]: 'Applied',
  [FixStatus.FAILED]: 'Failed',
  [FixStatus.ROLLED_BACK]: 'Rolled Back',
  [FixStatus.SKIPPED]: 'Skipped'
};

/**
 * Maximum values for various operations
 */
export const LIMITS = {
  MAX_CONCURRENT_FIXES: 10,
  MAX_FIX_TIME_MS: 900000, // 15 minutes
  MAX_FILE_SIZE_BYTES: 10485760, // 10MB
  MAX_ROLLBACK_DEPTH: 10,
  MAX_RETRY_ATTEMPTS: 5,
  MAX_PREDICTION_HORIZON_DAYS: 30
} as const;