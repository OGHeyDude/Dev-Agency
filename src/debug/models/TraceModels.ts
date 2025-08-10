/**
 * Trace Models - Type definitions for debugging and trace visualization
 * 
 * @file TraceModels.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

export interface ExecutionTrace {
  executionId: string;
  workflowId: string;
  parentExecutionId?: string;
  
  // Basic metadata
  agentName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  
  // Execution state
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  
  // Context and parameters
  inputContext: ExecutionContext;
  outputContext?: ExecutionContext;
  parameters: Record<string, any>;
  
  // Execution steps
  steps: ExecutionStep[];
  
  // Performance metrics
  performance: PerformanceMetrics;
  
  // Token usage tracking
  tokenUsage: TokenUsageData;
  
  // Decision tree data
  decisions: DecisionNode[];
  
  // Error information
  error?: ExecutionError;
  
  // Debugging metadata
  debugInfo: DebugInfo;
}

export interface ExecutionContext {
  contextId: string;
  contextType: 'agent' | 'workflow' | 'system';
  size: number;
  hash: string;
  preview: string; // Sanitized preview of content
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ExecutionStep {
  stepId: string;
  stepIndex: number;
  stepName: string;
  stepType: 'preparation' | 'execution' | 'validation' | 'cleanup';
  
  // Timing
  startTime: string;
  endTime?: string;
  duration?: number;
  
  // Status
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  
  // Input/Output
  input?: any;
  output?: any;
  
  // Context changes
  contextBefore: Partial<ExecutionContext>;
  contextAfter?: Partial<ExecutionContext>;
  
  // Performance data
  resourceUsage: ResourceUsage;
  
  // Sub-steps for complex operations
  subSteps: ExecutionSubStep[];
  
  // Error information
  error?: StepError;
  
  // Debug annotations
  annotations: DebugAnnotation[];
}

export interface ExecutionSubStep {
  subStepId: string;
  name: string;
  duration: number;
  resourceUsage: ResourceUsage;
  status: 'completed' | 'failed';
  error?: string;
}

export interface PerformanceMetrics {
  totalDuration: number;
  cpuTime: number;
  memoryUsage: {
    peak: number;
    average: number;
    final: number;
  };
  ioOperations: {
    reads: number;
    writes: number;
    networkRequests: number;
  };
  cacheHitRatio: number;
  
  // Performance analysis
  bottlenecks: PerformanceBottleneck[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface PerformanceBottleneck {
  id: string;
  type: 'cpu' | 'memory' | 'io' | 'network' | 'wait';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    stepId: string;
    stepName: string;
    timeRange: { start: string; end: string };
  };
  impact: {
    durationIncrease: number;
    resourceCost: number;
  };
  suggestions: string[];
}

export interface OptimizationSuggestion {
  id: string;
  type: 'caching' | 'parallelization' | 'algorithm' | 'resource-allocation';
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedImprovement: {
    durationReduction: number;
    resourceSaving: number;
  };
  implementation: {
    effort: 'low' | 'medium' | 'high';
    risk: 'low' | 'medium' | 'high';
    details: string;
  };
}

export interface ResourceUsage {
  cpu: number; // CPU usage percentage
  memory: number; // Memory usage in MB
  disk: number; // Disk I/O in MB
  network: number; // Network I/O in MB
  timestamp: string;
}

export interface TokenUsageData {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  
  // Cost analysis
  estimatedCost: number;
  costBreakdown: {
    inputCost: number;
    outputCost: number;
  };
  
  // Usage patterns
  tokensPerStep: TokenStepUsage[];
  peakUsage: {
    stepId: string;
    tokens: number;
    timestamp: string;
  };
  
  // Efficiency metrics
  efficiencyScore: number;
  wasteAnalysis: TokenWasteAnalysis;
}

export interface TokenStepUsage {
  stepId: string;
  stepName: string;
  inputTokens: number;
  outputTokens: number;
  contextTokens: number;
  timestamp: string;
}

export interface TokenWasteAnalysis {
  redundantTokens: number;
  unusedContext: number;
  inefficientPrompts: number;
  suggestions: TokenOptimizationSuggestion[];
}

export interface TokenOptimizationSuggestion {
  type: 'context-reduction' | 'prompt-optimization' | 'caching' | 'batching';
  description: string;
  potentialSaving: number;
  implementation: string;
}

export interface DecisionNode {
  nodeId: string;
  parentNodeId?: string;
  
  // Decision metadata
  decisionPoint: string;
  timestamp: string;
  agentName: string;
  
  // Decision data
  question: string;
  options: DecisionOption[];
  chosenOption: string;
  confidence: number;
  
  // Reasoning
  reasoning: DecisionReasoning;
  
  // Context at decision time
  context: DecisionContext;
  
  // Child decisions
  childNodes: string[];
  
  // Alternative paths
  alternativePaths: AlternativePath[];
}

export interface DecisionOption {
  optionId: string;
  label: string;
  description: string;
  confidence: number;
  expectedOutcome: string;
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface DecisionReasoning {
  primaryFactors: string[];
  secondaryFactors: string[];
  constraintsConsidered: string[];
  assumptionsMade: string[];
  
  // Reasoning chain
  logicalSteps: ReasoningStep[];
  
  // Confidence factors
  confidenceFactors: {
    dataQuality: number;
    contextCompleteness: number;
    historicalAccuracy: number;
    expertKnowledge: number;
  };
}

export interface ReasoningStep {
  stepNumber: number;
  description: string;
  evidence: string[];
  conclusion: string;
  confidence: number;
}

export interface DecisionContext {
  availableData: Record<string, any>;
  constraints: Record<string, any>;
  goals: string[];
  priorities: Priority[];
  historicalOutcomes: HistoricalOutcome[];
}

export interface Priority {
  name: string;
  weight: number;
  description: string;
}

export interface HistoricalOutcome {
  similarDecision: string;
  outcome: 'success' | 'failure' | 'partial';
  lessons: string[];
  relevanceScore: number;
}

export interface AlternativePath {
  pathId: string;
  description: string;
  probability: number;
  expectedDuration: number;
  riskAssessment: string;
  potentialOutcomes: string[];
}

export interface ExecutionError {
  errorId: string;
  errorType: 'system' | 'validation' | 'timeout' | 'resource' | 'user';
  errorCode: string;
  message: string;
  
  // Error context
  stepId?: string;
  timestamp: string;
  stackTrace?: string;
  
  // Impact assessment
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  retryAttempts: number;
  
  // Resolution
  resolution?: ErrorResolution;
  
  // Related data
  relatedTraces: string[];
  similarErrors: SimilarError[];
}

export interface ErrorResolution {
  resolutionId: string;
  strategy: 'retry' | 'fallback' | 'manual' | 'ignore';
  actionsTaken: string[];
  outcome: 'resolved' | 'partial' | 'failed';
  lessons: string[];
}

export interface SimilarError {
  errorId: string;
  similarity: number;
  resolution?: ErrorResolution;
  outcome: string;
}

export interface StepError {
  message: string;
  type: string;
  code?: string;
  retryable: boolean;
  context: Record<string, any>;
}

export interface DebugInfo {
  breakpointsHit: BreakpointHit[];
  watchedVariables: WatchedVariable[];
  annotations: DebugAnnotation[];
  sessionId: string;
  debuggerVersion: string;
}

export interface BreakpointHit {
  breakpointId: string;
  stepId: string;
  timestamp: string;
  condition?: string;
  hitCount: number;
  variables: Record<string, any>;
}

export interface WatchedVariable {
  variableName: string;
  values: VariableValue[];
  type: string;
}

export interface VariableValue {
  value: any;
  timestamp: string;
  stepId: string;
  changeType: 'created' | 'modified' | 'deleted';
}

export interface DebugAnnotation {
  id: string;
  type: 'note' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  stepId?: string;
  userId?: string;
}

export interface WorkflowTrace {
  workflowId: string;
  name: string;
  description: string;
  
  // Workflow metadata
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  
  // Execution chain
  executionTraces: ExecutionTrace[];
  dependencies: ExecutionDependency[];
  
  // Workflow performance
  overallPerformance: WorkflowPerformanceMetrics;
  
  // Workflow decisions
  workflowDecisions: WorkflowDecision[];
}

export interface ExecutionDependency {
  fromExecutionId: string;
  toExecutionId: string;
  dependencyType: 'data' | 'sequential' | 'conditional' | 'parallel';
  description: string;
  satisfied: boolean;
  satisfiedAt?: string;
}

export interface WorkflowPerformanceMetrics {
  totalDuration: number;
  parallelizationEfficiency: number;
  resourceUtilization: number;
  bottlenecks: WorkflowBottleneck[];
  criticalPath: string[];
}

export interface WorkflowBottleneck {
  type: 'sequential' | 'resource' | 'dependency';
  description: string;
  impact: number;
  affectedExecutions: string[];
}

export interface WorkflowDecision {
  decisionId: string;
  type: 'routing' | 'parallelization' | 'resource-allocation' | 'error-handling';
  timestamp: string;
  description: string;
  impact: string;
}

// Visualization-specific types

export interface FlowDiagramNode {
  id: string;
  label: string;
  type: 'agent' | 'decision' | 'data' | 'error' | 'start' | 'end';
  status: 'pending' | 'running' | 'completed' | 'failed';
  metadata: Record<string, any>;
  position: { x: number; y: number };
  style: NodeStyle;
}

export interface FlowDiagramEdge {
  id: string;
  source: string;
  target: string;
  type: 'execution' | 'data' | 'dependency' | 'error';
  label?: string;
  metadata: Record<string, any>;
  style: EdgeStyle;
}

export interface NodeStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'hexagon';
}

export interface EdgeStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  animated: boolean;
}

export interface VisualizationConfig {
  layout: 'hierarchical' | 'force-directed' | 'circular' | 'grid';
  nodeSize: 'small' | 'medium' | 'large';
  showLabels: boolean;
  showMetrics: boolean;
  enableInteraction: boolean;
  
  // Color schemes
  colorScheme: 'default' | 'dark' | 'high-contrast' | 'colorblind-friendly';
  
  // Animation settings
  animationSpeed: number;
  enableAnimations: boolean;
  
  // Filtering
  filters: VisualizationFilters;
}

export interface VisualizationFilters {
  showOnlyErrors: boolean;
  showOnlyLongRunning: boolean;
  hideSuccessful: boolean;
  agentFilter: string[];
  timeRangeFilter: { start: string; end: string };
  performanceThreshold: number;
}