/**
 * Trace Collector - Captures detailed execution data from agent runs
 * 
 * @file TraceCollector.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as os from 'os';
import { 
  ExecutionTrace, 
  ExecutionStep, 
  ExecutionContext, 
  PerformanceMetrics, 
  TokenUsageData,
  DecisionNode,
  ResourceUsage,
  DebugInfo,
  WorkflowTrace,
  ExecutionDependency
} from '../models/TraceModels';
import { ExecutionEngine, ExecutionResult } from '../../../tools/agent-cli/src/core/ExecutionEngine';
import { Logger } from '../../../tools/agent-cli/src/utils/Logger';

export interface TraceCollectorConfig {
  enablePerformanceCollection: boolean;
  enableTokenTracking: boolean;
  enableDecisionTracking: boolean;
  enableResourceMonitoring: boolean;
  
  // Storage configuration
  maxTraceHistory: number;
  traceRetentionHours: number;
  enablePersistence: boolean;
  persistencePath?: string;
  
  // Performance settings
  samplingRate: number; // 0-1, how often to collect detailed traces
  resourceSamplingInterval: number; // milliseconds
  
  // Security settings
  sanitizeContext: boolean;
  maxContextSize: number;
  excludePatterns: string[];
}

export interface TraceCollectorStats {
  totalTracesCollected: number;
  activeTraces: number;
  storageUsedMB: number;
  averageTraceSize: number;
  collectionOverhead: number;
  lastCleanupTime: string;
}

export class TraceCollector extends EventEmitter {
  private config: TraceCollectorConfig;
  private logger: Logger;
  
  // Storage
  private activeTraces = new Map<string, ExecutionTrace>();
  private completedTraces = new Map<string, ExecutionTrace>();
  private workflowTraces = new Map<string, WorkflowTrace>();
  
  // Performance monitoring
  private resourceMonitor?: NodeJS.Timer;
  private performanceBaseline?: ResourceUsage;
  
  // Execution engine integration
  private executionEngine?: ExecutionEngine;
  private isAttached = false;
  
  // Statistics
  private stats: TraceCollectorStats = {
    totalTracesCollected: 0,
    activeTraces: 0,
    storageUsedMB: 0,
    averageTraceSize: 0,
    collectionOverhead: 0,
    lastCleanupTime: new Date().toISOString()
  };

  constructor(config: Partial<TraceCollectorConfig> = {}) {
    super();
    
    this.config = {
      enablePerformanceCollection: true,
      enableTokenTracking: true,
      enableDecisionTracking: true,
      enableResourceMonitoring: true,
      maxTraceHistory: 1000,
      traceRetentionHours: 24,
      enablePersistence: false,
      samplingRate: 1.0,
      resourceSamplingInterval: 1000,
      sanitizeContext: true,
      maxContextSize: 10 * 1024, // 10KB
      excludePatterns: ['password', 'token', 'secret', 'key', 'auth'],
      ...config
    };
    
    this.logger = Logger.create({ 
      component: 'TraceCollector',
      level: 'info'
    });
    
    this.setupCleanupInterval();
    this.logger.info('TraceCollector initialized', { config: this.config });
  }

  /**
   * Attach to ExecutionEngine for automatic trace collection
   */
  async attachToExecutionEngine(executionEngine: ExecutionEngine): Promise<void> {
    if (this.isAttached) {
      throw new Error('TraceCollector is already attached to an ExecutionEngine');
    }

    this.executionEngine = executionEngine;
    this.isAttached = true;

    // Listen to execution events
    this.executionEngine.on('execution:started', (data) => {
      if (this.shouldSample()) {
        this.handleExecutionStarted(data);
      }
    });

    this.executionEngine.on('execution:completed', (data) => {
      this.handleExecutionCompleted(data);
    });

    this.executionEngine.on('execution:failed', (data) => {
      this.handleExecutionFailed(data);
    });

    // Start resource monitoring if enabled
    if (this.config.enableResourceMonitoring) {
      this.startResourceMonitoring();
    }

    this.logger.info('TraceCollector attached to ExecutionEngine');
    this.emit('collector:attached', { executionEngine: !!executionEngine });
  }

  /**
   * Detach from ExecutionEngine
   */
  detach(): void {
    if (this.executionEngine) {
      this.executionEngine.removeAllListeners();
      this.executionEngine = undefined;
    }
    
    if (this.resourceMonitor) {
      clearInterval(this.resourceMonitor);
      this.resourceMonitor = undefined;
    }
    
    this.isAttached = false;
    this.logger.info('TraceCollector detached from ExecutionEngine');
    this.emit('collector:detached');
  }

  /**
   * Start a new trace manually
   */
  startTrace(executionId: string, agentName: string, context: any): ExecutionTrace {
    const trace: ExecutionTrace = {
      executionId,
      workflowId: this.generateWorkflowId(executionId),
      agentName,
      startTime: new Date().toISOString(),
      status: 'running',
      currentStep: 0,
      totalSteps: 0,
      
      inputContext: this.sanitizeContext(context),
      parameters: {},
      steps: [],
      
      performance: this.initializePerformanceMetrics(),
      tokenUsage: this.initializeTokenUsage(),
      decisions: [],
      
      debugInfo: this.initializeDebugInfo()
    };

    this.activeTraces.set(executionId, trace);
    this.stats.activeTraces = this.activeTraces.size;
    this.stats.totalTracesCollected++;

    this.emit('trace:started', trace);
    this.logger.debug('Trace started', { executionId, agentName });

    return trace;
  }

  /**
   * Add a step to an active trace
   */
  addStep(executionId: string, stepData: Partial<ExecutionStep>): void {
    const trace = this.activeTraces.get(executionId);
    if (!trace) {
      this.logger.warn('Attempted to add step to non-existent trace', { executionId });
      return;
    }

    const step: ExecutionStep = {
      stepId: stepData.stepId || this.generateStepId(executionId, trace.steps.length),
      stepIndex: trace.steps.length,
      stepName: stepData.stepName || `Step ${trace.steps.length + 1}`,
      stepType: stepData.stepType || 'execution',
      startTime: stepData.startTime || new Date().toISOString(),
      status: stepData.status || 'running',
      
      contextBefore: stepData.contextBefore || {},
      subSteps: stepData.subSteps || [],
      annotations: stepData.annotations || [],
      
      resourceUsage: this.getCurrentResourceUsage()
    };

    trace.steps.push(step);
    trace.currentStep = trace.steps.length - 1;
    trace.totalSteps = Math.max(trace.totalSteps, trace.steps.length);

    this.emit('trace:step-added', { executionId, step });
  }

  /**
   * Complete a step in an active trace
   */
  completeStep(executionId: string, stepId: string, result: any): void {
    const trace = this.activeTraces.get(executionId);
    if (!trace) return;

    const step = trace.steps.find(s => s.stepId === stepId);
    if (!step) {
      this.logger.warn('Step not found for completion', { executionId, stepId });
      return;
    }

    step.endTime = new Date().toISOString();
    step.duration = new Date(step.endTime).getTime() - new Date(step.startTime).getTime();
    step.status = 'completed';
    step.output = this.sanitizeOutput(result);
    step.contextAfter = this.sanitizeContext(result.context || {});

    // Update performance metrics
    if (this.config.enablePerformanceCollection) {
      this.updateStepPerformanceMetrics(trace, step);
    }

    // Update token usage if available
    if (this.config.enableTokenTracking && result.tokens_used) {
      this.updateTokenUsage(trace, step, result.tokens_used);
    }

    this.emit('trace:step-completed', { executionId, step });
  }

  /**
   * Record a decision in the trace
   */
  recordDecision(executionId: string, decision: Partial<DecisionNode>): void {
    const trace = this.activeTraces.get(executionId);
    if (!trace || !this.config.enableDecisionTracking) return;

    const decisionNode: DecisionNode = {
      nodeId: decision.nodeId || this.generateDecisionId(executionId),
      parentNodeId: decision.parentNodeId,
      decisionPoint: decision.decisionPoint || 'Unknown',
      timestamp: new Date().toISOString(),
      agentName: trace.agentName,
      question: decision.question || '',
      options: decision.options || [],
      chosenOption: decision.chosenOption || '',
      confidence: decision.confidence || 0,
      reasoning: decision.reasoning || {
        primaryFactors: [],
        secondaryFactors: [],
        constraintsConsidered: [],
        assumptionsMade: [],
        logicalSteps: [],
        confidenceFactors: {
          dataQuality: 0,
          contextCompleteness: 0,
          historicalAccuracy: 0,
          expertKnowledge: 0
        }
      },
      context: decision.context || {
        availableData: {},
        constraints: {},
        goals: [],
        priorities: [],
        historicalOutcomes: []
      },
      childNodes: [],
      alternativePaths: decision.alternativePaths || []
    };

    trace.decisions.push(decisionNode);
    this.emit('trace:decision-recorded', { executionId, decision: decisionNode });
  }

  /**
   * Complete a trace
   */
  completeTrace(executionId: string, result: ExecutionResult): void {
    const trace = this.activeTraces.get(executionId);
    if (!trace) return;

    trace.endTime = new Date().toISOString();
    trace.duration = new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime();
    trace.status = result.success ? 'completed' : 'failed';
    
    if (result.output) {
      trace.outputContext = this.sanitizeContext(result.output);
    }

    if (result.error) {
      trace.error = {
        errorId: this.generateErrorId(),
        errorType: 'system',
        errorCode: 'EXECUTION_FAILED',
        message: result.error,
        timestamp: new Date().toISOString(),
        severity: 'high',
        recoverable: false,
        retryAttempts: 0,
        relatedTraces: [],
        similarErrors: []
      };
    }

    // Finalize performance metrics
    if (this.config.enablePerformanceCollection) {
      this.finalizePerformanceMetrics(trace);
    }

    // Move to completed traces
    this.activeTraces.delete(executionId);
    this.completedTraces.set(executionId, trace);
    
    this.stats.activeTraces = this.activeTraces.size;
    this.updateStorageStats();

    this.emit('trace:completed', trace);
    this.logger.debug('Trace completed', { 
      executionId, 
      duration: trace.duration,
      status: trace.status 
    });
  }

  /**
   * Get a trace by execution ID
   */
  getTrace(executionId: string): ExecutionTrace | undefined {
    return this.activeTraces.get(executionId) || this.completedTraces.get(executionId);
  }

  /**
   * Get all traces matching criteria
   */
  getTraces(criteria?: {
    agentName?: string;
    status?: string;
    timeRange?: { start: string; end: string };
    limit?: number;
  }): ExecutionTrace[] {
    const allTraces = [
      ...Array.from(this.activeTraces.values()),
      ...Array.from(this.completedTraces.values())
    ];

    let filteredTraces = allTraces;

    if (criteria) {
      if (criteria.agentName) {
        filteredTraces = filteredTraces.filter(t => t.agentName === criteria.agentName);
      }
      
      if (criteria.status) {
        filteredTraces = filteredTraces.filter(t => t.status === criteria.status);
      }
      
      if (criteria.timeRange) {
        const start = new Date(criteria.timeRange.start);
        const end = new Date(criteria.timeRange.end);
        filteredTraces = filteredTraces.filter(t => {
          const traceTime = new Date(t.startTime);
          return traceTime >= start && traceTime <= end;
        });
      }
    }

    // Sort by start time (newest first)
    filteredTraces.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    if (criteria?.limit) {
      filteredTraces = filteredTraces.slice(0, criteria.limit);
    }

    return filteredTraces;
  }

  /**
   * Get workflow trace
   */
  getWorkflowTrace(workflowId: string): WorkflowTrace | undefined {
    return this.workflowTraces.get(workflowId);
  }

  /**
   * Get collector statistics
   */
  getStats(): TraceCollectorStats {
    return { ...this.stats };
  }

  /**
   * Clear all traces (for memory management)
   */
  clearTraces(): void {
    this.activeTraces.clear();
    this.completedTraces.clear();
    this.workflowTraces.clear();
    
    this.stats.activeTraces = 0;
    this.stats.storageUsedMB = 0;
    this.stats.lastCleanupTime = new Date().toISOString();
    
    this.emit('traces:cleared');
    this.logger.info('All traces cleared');
  }

  // Private methods

  private handleExecutionStarted(data: { executionId: string; agent: string }): void {
    this.startTrace(data.executionId, data.agent, {});
  }

  private handleExecutionCompleted(data: { executionId: string; result: ExecutionResult }): void {
    this.completeTrace(data.executionId, data.result);
  }

  private handleExecutionFailed(data: { executionId: string; error: string }): void {
    this.completeTrace(data.executionId, {
      success: false,
      error: data.error,
      agent: 'unknown',
      timestamp: new Date().toISOString(),
      metrics: {
        duration: 0,
        context_size: 0
      }
    });
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.samplingRate;
  }

  private sanitizeContext(context: any): ExecutionContext {
    if (!context || typeof context !== 'object') {
      return {
        contextId: this.generateContextId(),
        contextType: 'system',
        size: 0,
        hash: '',
        preview: String(context || ''),
        variables: {},
        metadata: {}
      };
    }

    let sanitized = { ...context };
    
    if (this.config.sanitizeContext) {
      sanitized = this.recursiveSanitize(sanitized);
    }

    const contextString = JSON.stringify(sanitized);
    const preview = contextString.length > 200 
      ? contextString.substring(0, 200) + '...' 
      : contextString;

    return {
      contextId: this.generateContextId(),
      contextType: 'agent',
      size: contextString.length,
      hash: crypto.createHash('sha256').update(contextString).digest('hex'),
      preview,
      variables: typeof sanitized === 'object' ? sanitized : {},
      metadata: {}
    };
  }

  private recursiveSanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.recursiveSanitize(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches exclude patterns
      const shouldExclude = this.config.excludePatterns.some(pattern => 
        key.toLowerCase().includes(pattern.toLowerCase())
      );

      if (shouldExclude) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.recursiveSanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeOutput(output: any): any {
    if (typeof output === 'string' && output.length > this.config.maxContextSize) {
      return output.substring(0, this.config.maxContextSize) + '... [TRUNCATED]';
    }
    return this.recursiveSanitize(output);
  }

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      totalDuration: 0,
      cpuTime: 0,
      memoryUsage: {
        peak: 0,
        average: 0,
        final: 0
      },
      ioOperations: {
        reads: 0,
        writes: 0,
        networkRequests: 0
      },
      cacheHitRatio: 0,
      bottlenecks: [],
      optimizationSuggestions: []
    };
  }

  private initializeTokenUsage(): TokenUsageData {
    return {
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      estimatedCost: 0,
      costBreakdown: {
        inputCost: 0,
        outputCost: 0
      },
      tokensPerStep: [],
      peakUsage: {
        stepId: '',
        tokens: 0,
        timestamp: ''
      },
      efficiencyScore: 0,
      wasteAnalysis: {
        redundantTokens: 0,
        unusedContext: 0,
        inefficientPrompts: 0,
        suggestions: []
      }
    };
  }

  private initializeDebugInfo(): DebugInfo {
    return {
      breakpointsHit: [],
      watchedVariables: [],
      annotations: [],
      sessionId: crypto.randomUUID(),
      debuggerVersion: '1.0.0'
    };
  }

  private getCurrentResourceUsage(): ResourceUsage {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      cpu: 0, // CPU percentage would need more complex calculation
      memory: memUsage.heapUsed / 1024 / 1024, // Convert to MB
      disk: 0, // Would need file system monitoring
      network: 0, // Would need network monitoring
      timestamp: new Date().toISOString()
    };
  }

  private updateStepPerformanceMetrics(trace: ExecutionTrace, step: ExecutionStep): void {
    if (!step.duration) return;

    // Update overall performance metrics
    trace.performance.totalDuration += step.duration;
    
    const currentMemory = step.resourceUsage.memory;
    if (currentMemory > trace.performance.memoryUsage.peak) {
      trace.performance.memoryUsage.peak = currentMemory;
    }
  }

  private updateTokenUsage(trace: ExecutionTrace, step: ExecutionStep, tokensUsed: number): void {
    trace.tokenUsage.totalTokens += tokensUsed;
    
    // Rough estimation - assume 70% input, 30% output
    const inputTokens = Math.floor(tokensUsed * 0.7);
    const outputTokens = tokensUsed - inputTokens;
    
    trace.tokenUsage.inputTokens += inputTokens;
    trace.tokenUsage.outputTokens += outputTokens;
    
    // Track per-step usage
    trace.tokenUsage.tokensPerStep.push({
      stepId: step.stepId,
      stepName: step.stepName,
      inputTokens,
      outputTokens,
      contextTokens: 0,
      timestamp: new Date().toISOString()
    });
    
    // Update peak usage
    if (tokensUsed > trace.tokenUsage.peakUsage.tokens) {
      trace.tokenUsage.peakUsage = {
        stepId: step.stepId,
        tokens: tokensUsed,
        timestamp: new Date().toISOString()
      };
    }
  }

  private finalizePerformanceMetrics(trace: ExecutionTrace): void {
    if (trace.steps.length === 0) return;
    
    // Calculate averages
    const totalMemory = trace.steps.reduce((sum, step) => sum + step.resourceUsage.memory, 0);
    trace.performance.memoryUsage.average = totalMemory / trace.steps.length;
    trace.performance.memoryUsage.final = trace.steps[trace.steps.length - 1].resourceUsage.memory;
    
    // Analyze bottlenecks
    trace.performance.bottlenecks = this.analyzeBottlenecks(trace);
    
    // Generate optimization suggestions
    trace.performance.optimizationSuggestions = this.generateOptimizationSuggestions(trace);
  }

  private analyzeBottlenecks(trace: ExecutionTrace): any[] {
    // Identify steps that took significantly longer than average
    if (trace.steps.length < 2) return [];
    
    const durations = trace.steps.map(s => s.duration || 0);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const threshold = avgDuration * 2; // 2x average is considered a bottleneck
    
    return trace.steps
      .filter(step => (step.duration || 0) > threshold)
      .map(step => ({
        id: `bottleneck-${step.stepId}`,
        type: 'duration' as const,
        severity: (step.duration || 0) > threshold * 2 ? 'high' as const : 'medium' as const,
        description: `Step '${step.stepName}' took ${step.duration}ms (${Math.round((step.duration || 0) / avgDuration)}x average)`,
        location: {
          stepId: step.stepId,
          stepName: step.stepName,
          timeRange: { start: step.startTime, end: step.endTime || step.startTime }
        },
        impact: {
          durationIncrease: (step.duration || 0) - avgDuration,
          resourceCost: step.resourceUsage.memory
        },
        suggestions: [
          'Consider optimizing this step',
          'Check for unnecessary computations',
          'Evaluate caching opportunities'
        ]
      }));
  }

  private generateOptimizationSuggestions(trace: ExecutionTrace): any[] {
    const suggestions = [];
    
    // High token usage suggestion
    if (trace.tokenUsage.totalTokens > 10000) {
      suggestions.push({
        id: 'token-optimization',
        type: 'token-usage',
        priority: 'medium',
        description: 'High token usage detected. Consider context optimization.',
        estimatedImprovement: {
          durationReduction: 0,
          resourceSaving: trace.tokenUsage.totalTokens * 0.2
        },
        implementation: {
          effort: 'medium',
          risk: 'low',
          details: 'Review prompt engineering and context management'
        }
      });
    }
    
    return suggestions;
  }

  private startResourceMonitoring(): void {
    this.performanceBaseline = this.getCurrentResourceUsage();
    
    this.resourceMonitor = setInterval(() => {
      const usage = this.getCurrentResourceUsage();
      this.emit('resource:update', usage);
    }, this.config.resourceSamplingInterval);
  }

  private setupCleanupInterval(): void {
    // Clean up old traces every hour
    setInterval(() => {
      this.cleanupOldTraces();
    }, 60 * 60 * 1000);
  }

  private cleanupOldTraces(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - this.config.traceRetentionHours);
    
    let removedCount = 0;
    
    for (const [id, trace] of this.completedTraces.entries()) {
      if (new Date(trace.startTime) < cutoffTime) {
        this.completedTraces.delete(id);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      this.updateStorageStats();
      this.logger.info(`Cleaned up ${removedCount} old traces`);
    }
    
    this.stats.lastCleanupTime = new Date().toISOString();
  }

  private updateStorageStats(): void {
    const allTraces = [
      ...Array.from(this.activeTraces.values()),
      ...Array.from(this.completedTraces.values())
    ];
    
    const totalSize = allTraces.reduce((sum, trace) => {
      return sum + JSON.stringify(trace).length;
    }, 0);
    
    this.stats.storageUsedMB = totalSize / (1024 * 1024);
    this.stats.averageTraceSize = allTraces.length > 0 ? totalSize / allTraces.length : 0;
  }

  // ID generation methods
  private generateWorkflowId(executionId: string): string {
    return `workflow-${executionId.split('-')[0]}-${Date.now()}`;
  }

  private generateStepId(executionId: string, stepIndex: number): string {
    return `${executionId}-step-${stepIndex}`;
  }

  private generateDecisionId(executionId: string): string {
    return `${executionId}-decision-${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateContextId(): string {
    return `ctx-${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateErrorId(): string {
    return `error-${crypto.randomBytes(6).toString('hex')}`;
  }
}