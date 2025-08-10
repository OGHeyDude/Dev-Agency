/**
 * Conflict analysis and resolution models for VCS integration
 */

export interface ConflictAnalysis {
  conflictId: string;
  repository: string;
  pullRequestId?: string | number;
  mergeRequestId?: string | number;
  sourceBranch: string;
  targetBranch: string;
  conflictType: 'merge' | 'content' | 'structural' | 'semantic' | 'binary';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedFiles: ConflictFile[];
  conflictMarkers: ConflictMarker[];
  resolutionSuggestions: ResolutionStrategy[];
  autoResolvable: boolean;
  requiresHumanReview: boolean;
  estimatedResolutionTime: number; // minutes
  riskAssessment: RiskAssessment;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: ConflictResolution;
}

export interface ConflictFile {
  path: string;
  changeType: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied';
  isBinary: boolean;
  conflictRegions: ConflictRegion[];
  originalSize: number;
  modifiedSize: number;
  language?: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  testFile: boolean;
  configFile: boolean;
}

export interface ConflictRegion {
  startLine: number;
  endLine: number;
  baseContent: string;
  currentContent: string;
  incomingContent: string;
  conflictType: 'content' | 'whitespace' | 'line_ending' | 'binary';
  contextLines: ContextLine[];
}

export interface ContextLine {
  lineNumber: number;
  content: string;
  type: 'before' | 'after';
}

export interface ConflictMarker {
  file: string;
  startLine: number;
  middleLine: number;
  endLine: number;
  baseMarker?: number;
  currentBranch: string;
  incomingBranch: string;
  currentContent: string;
  incomingContent: string;
  baseContent?: string;
  markerStyle: 'standard' | 'diff3';
}

export interface ResolutionStrategy {
  id: string;
  strategy: 'accept-incoming' | 'accept-current' | 'manual-merge' | 'three-way-merge' | 'semantic-merge' | 'interactive';
  confidence: number; // 0-1
  reasoning: string;
  previewDiff: string;
  potentialIssues: string[];
  safeguards: string[];
  rollbackPlan?: string;
  requiredTests: string[];
  estimatedEffort: number; // minutes
  automatable: boolean;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  requiredApprovals: string[];
  testingRequirements: string[];
  rollbackComplexity: 'simple' | 'moderate' | 'complex';
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  probability: number; // 0-1
  impact: 'minimal' | 'low' | 'medium' | 'high' | 'severe';
}

export interface ConflictResolution {
  resolvedBy: 'auto' | 'human' | 'assisted';
  strategy: string;
  resolutionDetails: ResolutionDetails;
  appliedAt: Date;
  approvedBy?: string;
  testResults?: TestResults;
  reviewComments?: string[];
}

export interface ResolutionDetails {
  strategy: string;
  filesModified: string[];
  linesChanged: number;
  backupCreated: boolean;
  rollbackAvailable: boolean;
  changesDescription: string;
  preResolutionHash: string;
  postResolutionHash: string;
}

export interface TestResults {
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  coverage?: number;
  criticalTestsPassed: boolean;
  regressionTestsPassed: boolean;
  performanceImpact?: PerformanceImpact;
}

export interface PerformanceImpact {
  cpuImpact: number; // percentage change
  memoryImpact: number; // percentage change
  responseTimeImpact: number; // milliseconds change
  throughputImpact: number; // percentage change
  significance: 'negligible' | 'minor' | 'moderate' | 'significant';
}

export interface ConflictPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  frequency: number;
  resolutionStrategies: string[];
  commonCauses: string[];
  preventionTips: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface ConflictResolutionHistory {
  conflictId: string;
  repository: string;
  resolutionDate: Date;
  strategy: string;
  success: boolean;
  timeTaken: number; // minutes
  filesAffected: number;
  testResults?: TestResults;
  rollbackRequired: boolean;
  lessonsLearned: string[];
  similarConflicts: string[];
}

export interface AutoResolutionConfig {
  enabled: boolean;
  maxRiskLevel: 'low' | 'medium' | 'high';
  allowedStrategies: string[];
  requiredTests: string[];
  backupRequired: boolean;
  humanApprovalThreshold: number; // risk score 0-1
  filePatterns: {
    autoResolve: string[];
    requireReview: string[];
    neverAutoResolve: string[];
  };
  conflictTypes: {
    whitespace: 'auto' | 'review' | 'block';
    lineEndings: 'auto' | 'review' | 'block';
    imports: 'auto' | 'review' | 'block';
    formatting: 'auto' | 'review' | 'block';
    documentation: 'auto' | 'review' | 'block';
  };
}

export interface ConflictPreventionSuggestion {
  type: 'workflow' | 'tooling' | 'practice' | 'training';
  title: string;
  description: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  applicableTeams: string[];
  resources: string[];
}

export interface ConflictMetrics {
  totalConflicts: number;
  avgResolutionTime: number; // minutes
  autoResolutionRate: number; // 0-1
  conflictsByType: Record<string, number>;
  conflictsByFile: Record<string, number>;
  resolutionsByStrategy: Record<string, number>;
  successRateByStrategy: Record<string, number>;
  trendsOverTime: ConflictTrend[];
  hotspotFiles: Array<{ file: string; conflicts: number; avgResolutionTime: number }>;
}

export interface ConflictTrend {
  period: Date;
  totalConflicts: number;
  autoResolved: number;
  avgResolutionTime: number;
  successRate: number;
  riskDistribution: Record<string, number>;
}