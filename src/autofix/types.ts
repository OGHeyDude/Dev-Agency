/**
 * Auto-fix Agent Type Definitions
 * Core types and interfaces for the auto-fix system
 */

export type IssueType = 'compilation' | 'test' | 'dependency' | 'performance' | 'lint' | 'security';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high';
export type FixStatus = 'pending' | 'applying' | 'applied' | 'failed' | 'rolled_back';
export type PredictionTimeframe = '1-6h' | '6-24h' | '1-3d' | '3-7d';

export interface AutoFixIssue {
  id: string;
  type: IssueType;
  severity: SeverityLevel;
  title: string;
  description: string;
  location: IssueLocation;
  context: Record<string, any>;
  detected: Date;
  predicted?: boolean;
  confidence: number;
  tags: string[];
  relatedIssues?: string[];
}

export interface IssueLocation {
  file: string;
  line?: number;
  column?: number;
  function?: string;
  class?: string;
  module?: string;
}

export interface FixStrategy {
  id: string;
  name: string;
  description: string;
  issueTypes: IssueType[];
  steps: FixStep[];
  riskLevel: RiskLevel;
  confidence: number;
  estimatedTime: number;
  prerequisites: string[];
  rollbackSteps: FixStep[];
  successCriteria: string[];
  tags: string[];
}

export interface FixStep {
  id: string;
  type: 'file_edit' | 'command' | 'config_update' | 'dependency_update' | 'test_run';
  description: string;
  action: FixAction;
  rollbackAction?: FixAction;
  optional: boolean;
  timeout?: number;
}

export interface FixAction {
  type: string;
  target: string;
  parameters: Record<string, any>;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'file_exists' | 'test_passes' | 'build_succeeds' | 'performance_check';
  target: string;
  expected: any;
  timeout?: number;
}

export interface FixResult {
  strategy: FixStrategy;
  issue: AutoFixIssue;
  status: FixStatus;
  applied: boolean;
  success: boolean;
  executionTime: number;
  startTime: Date;
  endTime?: Date;
  changes: FileChange[];
  testsRun: TestResult[];
  rollbackRequired: boolean;
  error?: FixError;
  metrics: FixMetrics;
}

export interface FileChange {
  file: string;
  type: 'created' | 'modified' | 'deleted' | 'moved';
  before?: string;
  after?: string;
  diff?: string;
}

export interface TestResult {
  testSuite: string;
  testName?: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface FixError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  recoverable: boolean;
}

export interface FixMetrics {
  detectionTime: number;
  analysisTime: number;
  fixTime: number;
  validationTime: number;
  totalTime: number;
  linesChanged: number;
  filesAffected: number;
  testsRun: number;
}

export interface PredictiveInsight {
  id: string;
  issueType: IssueType;
  title: string;
  description: string;
  probability: number;
  confidence: number;
  timeframe: PredictionTimeframe;
  triggers: PredictionTrigger[];
  preventionSuggestions: string[];
  impactAssessment: ImpactAssessment;
  created: Date;
  expiresAt: Date;
}

export interface PredictionTrigger {
  type: 'code_change' | 'dependency_update' | 'performance_trend' | 'historical_pattern';
  source: string;
  description: string;
  weight: number;
}

export interface ImpactAssessment {
  severity: SeverityLevel;
  affectedComponents: string[];
  estimatedDowntime?: number;
  businessImpact: 'minimal' | 'moderate' | 'significant' | 'critical';
  technicalDebt: number;
}

export interface AutoFixConfig {
  enabled: boolean;
  autoApplyThreshold: number; // Minimum confidence for auto-apply
  riskTolerance: RiskLevel;
  enabledIssueTypes: IssueType[];
  testValidationRequired: boolean;
  rollbackOnFailure: boolean;
  maxConcurrentFixes: number;
  retryAttempts: number;
  timeouts: {
    detection: number;
    analysis: number;
    fixing: number;
    validation: number;
  };
}

export interface FixPattern {
  id: string;
  name: string;
  issueType: IssueType;
  pattern: RegExp | string;
  template: string;
  variables: string[];
  conditions: PatternCondition[];
  confidence: number;
  successRate: number;
  usage: number;
  lastUsed: Date;
}

export interface PatternCondition {
  type: 'file_exists' | 'content_matches' | 'dependency_present' | 'config_value';
  target: string;
  operator: '==' | '!=' | 'matches' | 'contains' | 'exists';
  value: any;
}

export interface FixHistory {
  id: string;
  issue: AutoFixIssue;
  strategy: FixStrategy;
  result: FixResult;
  timestamp: Date;
  user?: string;
  feedback?: FixFeedback;
}

export interface FixFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  comments?: string;
  improvements?: string[];
  timestamp: Date;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  issueType: IssueType;
  pattern: string | RegExp;
  severity: SeverityLevel;
  confidence: number;
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan';
  value: any;
  negate?: boolean;
}

export interface RuleAction {
  type: 'create_issue' | 'notify' | 'auto_fix' | 'escalate';
  parameters: Record<string, any>;
}

export interface MonitoringState {
  enabled: boolean;
  lastCheck: Date;
  issuesDetected: number;
  fixesApplied: number;
  successRate: number;
  averageFixTime: number;
  activeMonitors: string[];
  healthStatus: 'healthy' | 'degraded' | 'critical' | 'offline';
}