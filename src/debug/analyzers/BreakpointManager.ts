/**
 * Breakpoint Manager - Handle debugging breakpoints and step execution
 * 
 * @file BreakpointManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { Logger } from '../../../tools/agent-cli/src/utils/Logger';
import { ExecutionTrace, ExecutionStep, BreakpointHit } from '../models/TraceModels';

export interface Breakpoint {
  id: string;
  name: string;
  
  // Trigger conditions
  agentName?: string;
  stepName?: string;
  condition?: string; // JavaScript expression to evaluate
  
  // State
  enabled: boolean;
  hitCount: number;
  maxHits?: number; // Disable after N hits
  
  // Metadata
  createdAt: string;
  lastHit?: string;
  description?: string;
  tags: string[];
}

export interface StepExecution {
  executionId: string;
  currentStepIndex: number;
  mode: 'step-over' | 'step-into' | 'step-out' | 'continue';
  pausedAt?: string;
  variables: Record<string, any>;
}

export interface BreakpointManagerConfig {
  maxBreakpoints: number;
  enableConditionalBreakpoints: boolean;
  enableWatchExpressions: boolean;
  maxWatchExpressions: number;
  evaluationTimeout: number; // milliseconds
}

export interface WatchExpression {
  id: string;
  expression: string;
  enabled: boolean;
  lastValue: any;
  lastEvaluation: string;
  evaluationCount: number;
}

export interface BreakpointManagerStats {
  totalBreakpoints: number;
  enabledBreakpoints: number;
  totalHits: number;
  activeStepExecutions: number;
  watchExpressions: number;
  averageEvaluationTime: number;
}

export class BreakpointManager extends EventEmitter {
  private config: BreakpointManagerConfig;
  private logger: Logger;
  
  // Storage
  private breakpoints = new Map<string, Breakpoint>();
  private stepExecutions = new Map<string, StepExecution>();
  private watchExpressions = new Map<string, WatchExpression>();
  
  // Evaluation context
  private evaluationCache = new Map<string, any>();
  
  // Statistics
  private stats: BreakpointManagerStats = {
    totalBreakpoints: 0,
    enabledBreakpoints: 0,
    totalHits: 0,
    activeStepExecutions: 0,
    watchExpressions: 0,
    averageEvaluationTime: 0
  };

  constructor(config: Partial<BreakpointManagerConfig> = {}) {
    super();
    
    this.config = {
      maxBreakpoints: 100,
      enableConditionalBreakpoints: true,
      enableWatchExpressions: true,
      maxWatchExpressions: 50,
      evaluationTimeout: 5000,
      ...config
    };
    
    this.logger = Logger.create({ 
      component: 'BreakpointManager',
      level: 'info'
    });
    
    this.logger.info('BreakpointManager initialized', { config: this.config });
  }

  /**
   * Add a new breakpoint
   */
  addBreakpoint(breakpointData: {
    name?: string;
    agentName?: string;
    stepName?: string;
    condition?: string;
    enabled?: boolean;
    description?: string;
    maxHits?: number;
    tags?: string[];
  }): Breakpoint {
    if (this.breakpoints.size >= this.config.maxBreakpoints) {
      throw new Error('Maximum number of breakpoints reached');
    }

    if (breakpointData.condition && !this.config.enableConditionalBreakpoints) {
      throw new Error('Conditional breakpoints are disabled');
    }

    const breakpoint: Breakpoint = {
      id: this.generateBreakpointId(),
      name: breakpointData.name || this.generateBreakpointName(breakpointData),
      agentName: breakpointData.agentName,
      stepName: breakpointData.stepName,
      condition: breakpointData.condition,
      enabled: breakpointData.enabled !== false,
      hitCount: 0,
      maxHits: breakpointData.maxHits,
      createdAt: new Date().toISOString(),
      description: breakpointData.description,
      tags: breakpointData.tags || []
    };

    this.breakpoints.set(breakpoint.id, breakpoint);
    this.updateStats();

    this.emit('breakpoint:added', breakpoint);
    this.logger.info('Breakpoint added', { 
      id: breakpoint.id, 
      name: breakpoint.name,
      condition: breakpoint.condition 
    });

    return breakpoint;
  }

  /**
   * Remove a breakpoint
   */
  removeBreakpoint(breakpointId: string): boolean {
    const breakpoint = this.breakpoints.get(breakpointId);
    if (!breakpoint) {
      return false;
    }

    this.breakpoints.delete(breakpointId);
    this.updateStats();

    this.emit('breakpoint:removed', { id: breakpointId, breakpoint });
    this.logger.info('Breakpoint removed', { id: breakpointId });

    return true;
  }

  /**
   * Enable or disable a breakpoint
   */
  setBreakpointEnabled(breakpointId: string, enabled: boolean): boolean {
    const breakpoint = this.breakpoints.get(breakpointId);
    if (!breakpoint) {
      return false;
    }

    breakpoint.enabled = enabled;
    this.updateStats();

    this.emit('breakpoint:toggled', { id: breakpointId, enabled });
    this.logger.info('Breakpoint toggled', { id: breakpointId, enabled });

    return true;
  }

  /**
   * Update breakpoint condition
   */
  updateBreakpointCondition(breakpointId: string, condition: string): boolean {
    if (!this.config.enableConditionalBreakpoints) {
      throw new Error('Conditional breakpoints are disabled');
    }

    const breakpoint = this.breakpoints.get(breakpointId);
    if (!breakpoint) {
      return false;
    }

    breakpoint.condition = condition;
    this.emit('breakpoint:updated', breakpoint);
    
    return true;
  }

  /**
   * Get all breakpoints
   */
  getAllBreakpoints(): Breakpoint[] {
    return Array.from(this.breakpoints.values());
  }

  /**
   * Get breakpoint by ID
   */
  getBreakpoint(breakpointId: string): Breakpoint | undefined {
    return this.breakpoints.get(breakpointId);
  }

  /**
   * Check if execution should break at this step
   */
  async shouldBreak(trace: ExecutionTrace, step: ExecutionStep): Promise<{ shouldBreak: boolean; breakpoint?: Breakpoint; reason?: string }> {
    // Find matching breakpoints
    const matchingBreakpoints = Array.from(this.breakpoints.values())
      .filter(bp => bp.enabled && this.matchesBreakpoint(bp, trace, step));

    if (matchingBreakpoints.length === 0) {
      return { shouldBreak: false };
    }

    // Evaluate conditions
    for (const breakpoint of matchingBreakpoints) {
      try {
        if (await this.evaluateBreakpointCondition(breakpoint, trace, step)) {
          // Update hit count
          breakpoint.hitCount++;
          breakpoint.lastHit = new Date().toISOString();
          
          // Check max hits
          if (breakpoint.maxHits && breakpoint.hitCount >= breakpoint.maxHits) {
            breakpoint.enabled = false;
            this.logger.info('Breakpoint disabled after max hits', { 
              id: breakpoint.id, 
              hitCount: breakpoint.hitCount 
            });
          }

          this.stats.totalHits++;
          
          const breakpointHit: BreakpointHit = {
            breakpointId: breakpoint.id,
            stepId: step.stepId,
            timestamp: new Date().toISOString(),
            condition: breakpoint.condition,
            hitCount: breakpoint.hitCount,
            variables: this.extractVariables(trace, step)
          };

          this.emit('breakpoint:hit', {
            breakpoint,
            breakpointHit,
            trace,
            step
          });

          return { 
            shouldBreak: true, 
            breakpoint,
            reason: `Breakpoint '${breakpoint.name}' hit`
          };
        }
      } catch (error) {
        this.logger.error('Error evaluating breakpoint condition', {
          breakpointId: breakpoint.id,
          condition: breakpoint.condition,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return { shouldBreak: false };
  }

  /**
   * Start step-through execution
   */
  startStepExecution(executionId: string, mode: StepExecution['mode'] = 'step-over'): void {
    const stepExecution: StepExecution = {
      executionId,
      currentStepIndex: 0,
      mode,
      pausedAt: new Date().toISOString(),
      variables: {}
    };

    this.stepExecutions.set(executionId, stepExecution);
    this.stats.activeStepExecutions = this.stepExecutions.size;

    this.emit('step-execution:started', stepExecution);
    this.logger.info('Step execution started', { executionId, mode });
  }

  /**
   * Continue step execution
   */
  continueStepExecution(executionId: string, mode?: StepExecution['mode']): void {
    const stepExecution = this.stepExecutions.get(executionId);
    if (!stepExecution) {
      throw new Error('Step execution not found');
    }

    if (mode) {
      stepExecution.mode = mode;
    }

    stepExecution.pausedAt = undefined;
    
    this.emit('step-execution:continued', stepExecution);
    this.logger.info('Step execution continued', { executionId, mode: stepExecution.mode });
  }

  /**
   * Stop step execution
   */
  stopStepExecution(executionId: string): void {
    const stepExecution = this.stepExecutions.get(executionId);
    if (!stepExecution) {
      return;
    }

    this.stepExecutions.delete(executionId);
    this.stats.activeStepExecutions = this.stepExecutions.size;

    this.emit('step-execution:stopped', { executionId });
    this.logger.info('Step execution stopped', { executionId });
  }

  /**
   * Add watch expression
   */
  addWatchExpression(expression: string): WatchExpression {
    if (!this.config.enableWatchExpressions) {
      throw new Error('Watch expressions are disabled');
    }

    if (this.watchExpressions.size >= this.config.maxWatchExpressions) {
      throw new Error('Maximum number of watch expressions reached');
    }

    const watch: WatchExpression = {
      id: this.generateWatchId(),
      expression,
      enabled: true,
      lastValue: undefined,
      lastEvaluation: '',
      evaluationCount: 0
    };

    this.watchExpressions.set(watch.id, watch);
    this.stats.watchExpressions = this.watchExpressions.size;

    this.emit('watch:added', watch);
    return watch;
  }

  /**
   * Remove watch expression
   */
  removeWatchExpression(watchId: string): boolean {
    const success = this.watchExpressions.delete(watchId);
    if (success) {
      this.stats.watchExpressions = this.watchExpressions.size;
      this.emit('watch:removed', { id: watchId });
    }
    return success;
  }

  /**
   * Evaluate watch expressions
   */
  async evaluateWatchExpressions(trace: ExecutionTrace, step: ExecutionStep): Promise<void> {
    const context = this.buildEvaluationContext(trace, step);
    
    for (const watch of this.watchExpressions.values()) {
      if (!watch.enabled) continue;
      
      try {
        const startTime = Date.now();
        const value = await this.evaluateExpression(watch.expression, context);
        const evaluationTime = Date.now() - startTime;
        
        watch.lastValue = value;
        watch.lastEvaluation = new Date().toISOString();
        watch.evaluationCount++;
        
        // Update average evaluation time
        this.stats.averageEvaluationTime = 
          (this.stats.averageEvaluationTime + evaluationTime) / 2;
        
        this.emit('watch:evaluated', {
          watch,
          value,
          evaluationTime
        });
        
      } catch (error) {
        this.logger.warn('Watch expression evaluation failed', {
          id: watch.id,
          expression: watch.expression,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Get statistics
   */
  getStats(): BreakpointManagerStats {
    return { ...this.stats };
  }

  /**
   * Clear all breakpoints
   */
  clearAllBreakpoints(): void {
    this.breakpoints.clear();
    this.stepExecutions.clear();
    this.watchExpressions.clear();
    this.updateStats();
    
    this.emit('breakpoints:cleared');
    this.logger.info('All breakpoints cleared');
  }

  // Private methods

  private matchesBreakpoint(breakpoint: Breakpoint, trace: ExecutionTrace, step: ExecutionStep): boolean {
    // Agent name match
    if (breakpoint.agentName && breakpoint.agentName !== trace.agentName) {
      return false;
    }

    // Step name match
    if (breakpoint.stepName && breakpoint.stepName !== step.stepName) {
      return false;
    }

    return true;
  }

  private async evaluateBreakpointCondition(breakpoint: Breakpoint, trace: ExecutionTrace, step: ExecutionStep): Promise<boolean> {
    // If no condition, always break
    if (!breakpoint.condition) {
      return true;
    }

    if (!this.config.enableConditionalBreakpoints) {
      return true;
    }

    try {
      const context = this.buildEvaluationContext(trace, step);
      const result = await this.evaluateExpression(breakpoint.condition, context);
      return Boolean(result);
    } catch (error) {
      this.logger.error('Breakpoint condition evaluation failed', {
        breakpointId: breakpoint.id,
        condition: breakpoint.condition,
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }

  private buildEvaluationContext(trace: ExecutionTrace, step: ExecutionStep): Record<string, any> {
    return {
      // Trace context
      trace: {
        executionId: trace.executionId,
        agentName: trace.agentName,
        status: trace.status,
        duration: trace.duration,
        currentStep: trace.currentStep,
        totalSteps: trace.totalSteps
      },
      
      // Step context
      step: {
        stepId: step.stepId,
        stepName: step.stepName,
        stepType: step.stepType,
        status: step.status,
        duration: step.duration,
        input: step.input,
        output: step.output
      },
      
      // Performance context
      performance: {
        memory: step.resourceUsage.memory,
        cpu: step.resourceUsage.cpu,
        totalDuration: trace.performance?.totalDuration || 0
      },
      
      // Token context
      tokens: {
        total: trace.tokenUsage?.totalTokens || 0,
        input: trace.tokenUsage?.inputTokens || 0,
        output: trace.tokenUsage?.outputTokens || 0
      },
      
      // Variables from context
      ...this.extractVariables(trace, step)
    };
  }

  private extractVariables(trace: ExecutionTrace, step: ExecutionStep): Record<string, any> {
    const variables: Record<string, any> = {};
    
    // Extract from input context
    if (trace.inputContext?.variables) {
      Object.assign(variables, trace.inputContext.variables);
    }
    
    // Extract from step context
    if (step.contextBefore?.variables) {
      Object.assign(variables, step.contextBefore.variables);
    }
    
    if (step.contextAfter?.variables) {
      Object.assign(variables, step.contextAfter.variables);
    }
    
    return variables;
  }

  private async evaluateExpression(expression: string, context: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Expression evaluation timeout'));
      }, this.config.evaluationTimeout);

      try {
        // Create a safe evaluation context
        const safeContext = this.createSafeContext(context);
        
        // Use Function constructor for safer evaluation than eval
        const func = new Function(...Object.keys(safeContext), `return (${expression})`);
        const result = func(...Object.values(safeContext));
        
        clearTimeout(timeout);
        resolve(result);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private createSafeContext(context: Record<string, any>): Record<string, any> {
    // Filter out dangerous properties and functions
    const safeContext: Record<string, any> = {};
    const dangerousKeys = ['__proto__', 'constructor', 'prototype', 'process', 'global', 'require'];
    
    for (const [key, value] of Object.entries(context)) {
      if (dangerousKeys.includes(key)) {
        continue;
      }
      
      if (typeof value === 'function') {
        continue;
      }
      
      // Recursively sanitize objects
      if (typeof value === 'object' && value !== null) {
        safeContext[key] = this.sanitizeObject(value);
      } else {
        safeContext[key] = value;
      }
    }
    
    return safeContext;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'function') {
          continue;
        }
        sanitized[key] = typeof value === 'object' ? this.sanitizeObject(value) : value;
      }
      return sanitized;
    }
    
    return obj;
  }

  private updateStats(): void {
    this.stats.totalBreakpoints = this.breakpoints.size;
    this.stats.enabledBreakpoints = Array.from(this.breakpoints.values())
      .filter(bp => bp.enabled).length;
    this.stats.activeStepExecutions = this.stepExecutions.size;
    this.stats.watchExpressions = this.watchExpressions.size;
  }

  private generateBreakpointName(data: { agentName?: string; stepName?: string; condition?: string }): string {
    if (data.agentName && data.stepName) {
      return `${data.agentName}:${data.stepName}`;
    } else if (data.agentName) {
      return `${data.agentName}:*`;
    } else if (data.stepName) {
      return `*:${data.stepName}`;
    } else if (data.condition) {
      return `Condition: ${data.condition.substring(0, 30)}${data.condition.length > 30 ? '...' : ''}`;
    } else {
      return `Breakpoint ${this.breakpoints.size + 1}`;
    }
  }

  private generateBreakpointId(): string {
    return `bp-${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateWatchId(): string {
    return `watch-${crypto.randomBytes(6).toString('hex')}`;
  }
}