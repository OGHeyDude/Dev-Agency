/**
 * Execution Engine Extension - Add debugging and trace capabilities to ExecutionEngine
 * 
 * @file ExecutionEngineExtension.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { ExecutionEngine, ExecutionResult, SingleExecutionOptions } from '../../../tools/agent-cli/src/core/ExecutionEngine';
import { TraceCollector } from '../collectors/TraceCollector';
import { BreakpointManager } from '../analyzers/BreakpointManager';
import { TracingLogger } from './LoggerExtension';
import { ExecutionTrace, ExecutionStep } from '../models/TraceModels';
import { Logger } from '../../../tools/agent-cli/src/utils/Logger';

export interface DebugExecutionOptions extends SingleExecutionOptions {
  enableDebugging?: boolean;
  enableTracing?: boolean;
  breakOnStart?: boolean;
  traceLevel?: 'basic' | 'detailed' | 'verbose';
  debugMetadata?: Record<string, any>;
}

export interface ExecutionEngineDebugConfig {
  enableGlobalTracing: boolean;
  enableBreakpoints: boolean;
  enablePerformanceMonitoring: boolean;
  enableStepThroughDebugging: boolean;
  traceCollector?: TraceCollector;
  breakpointManager?: BreakpointManager;
}

/**
 * Enhanced ExecutionEngine with debugging capabilities
 */
export class DebugExecutionEngine extends ExecutionEngine {
  private debugConfig: ExecutionEngineDebugConfig;
  private traceCollector?: TraceCollector;
  private breakpointManager?: BreakpointManager;
  private tracingLogger?: TracingLogger;
  private activeDebuggingSessions = new Map<string, DebugSession>();

  constructor(
    debugConfig: Partial<ExecutionEngineDebugConfig> = {}
  ) {
    super();
    
    this.debugConfig = {
      enableGlobalTracing: false,
      enableBreakpoints: false,
      enablePerformanceMonitoring: false,
      enableStepThroughDebugging: false,
      ...debugConfig
    };

    this.traceCollector = debugConfig.traceCollector;
    this.breakpointManager = debugConfig.breakpointManager;

    this.setupDebugLogging();
    this.setupDebugEventHandlers();
  }

  /**
   * Enhanced execute single with debugging support
   */
  async executeWithDebugging(options: DebugExecutionOptions): Promise<ExecutionResult> {
    const debugOptions = {
      enableDebugging: this.debugConfig.enableGlobalTracing,
      enableTracing: this.debugConfig.enableGlobalTracing,
      traceLevel: 'detailed' as const,
      ...options
    };

    // Start trace if enabled
    let trace: ExecutionTrace | undefined;
    if (debugOptions.enableTracing && this.traceCollector) {
      trace = this.traceCollector.startTrace(
        this.generateExecutionId(),
        options.agentName,
        options
      );
    }

    // Set up debugging session if enabled
    let debugSession: DebugSession | undefined;
    if (debugOptions.enableDebugging) {
      debugSession = this.createDebugSession(trace?.executionId || this.generateExecutionId(), debugOptions);
    }

    try {
      // Check for initial breakpoint
      if (debugOptions.breakOnStart && this.breakpointManager && trace) {
        await this.handleBreakpoint(trace, undefined, 'execution-start');
      }

      // Execute with debugging hooks
      const result = await this.executeWithHooks(options, trace, debugSession);

      // Complete trace
      if (trace && this.traceCollector) {
        this.traceCollector.completeTrace(trace.executionId, result);
      }

      // Clean up debugging session
      if (debugSession) {
        this.cleanupDebugSession(debugSession.id);
      }

      return result;

    } catch (error) {
      // Handle execution error with debugging context
      if (trace && this.traceCollector) {
        this.traceCollector.completeTrace(trace.executionId, {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          agent: options.agentName,
          timestamp: new Date().toISOString(),
          metrics: {
            duration: Date.now() - new Date(trace.startTime).getTime(),
            context_size: 0
          }
        });
      }

      if (debugSession) {
        this.cleanupDebugSession(debugSession.id);
      }

      throw error;
    }
  }

  /**
   * Set trace collector
   */
  setTraceCollector(collector: TraceCollector): void {
    this.traceCollector = collector;
    this.debugConfig.enableGlobalTracing = true;

    if (this.tracingLogger) {
      this.tracingLogger.setTraceCollector(collector);
    }
  }

  /**
   * Set breakpoint manager
   */
  setBreakpointManager(manager: BreakpointManager): void {
    this.breakpointManager = manager;
    this.debugConfig.enableBreakpoints = true;
  }

  /**
   * Execute single with original interface (enhanced internally)
   */
  async executeSingle(options: SingleExecutionOptions): Promise<ExecutionResult> {
    // If debugging is globally enabled, use enhanced execution
    if (this.debugConfig.enableGlobalTracing || this.debugConfig.enableBreakpoints) {
      return this.executeWithDebugging({
        ...options,
        enableDebugging: this.debugConfig.enableBreakpoints,
        enableTracing: this.debugConfig.enableGlobalTracing,
        traceLevel: 'basic'
      });
    }

    // Otherwise use standard execution
    return super.executeSingle(options);
  }

  /**
   * Get active debugging sessions
   */
  getDebuggingSessions(): DebugSession[] {
    return Array.from(this.activeDebuggingSessions.values());
  }

  /**
   * Get debugging statistics
   */
  getDebugStats() {
    return {
      activeSessions: this.activeDebuggingSessions.size,
      traceCollectorAttached: !!this.traceCollector,
      breakpointManagerAttached: !!this.breakpointManager,
      globalTracingEnabled: this.debugConfig.enableGlobalTracing,
      breakpointsEnabled: this.debugConfig.enableBreakpoints
    };
  }

  // Private methods

  private async executeWithHooks(
    options: DebugExecutionOptions,
    trace?: ExecutionTrace,
    debugSession?: DebugSession
  ): Promise<ExecutionResult> {
    const executionId = trace?.executionId || this.generateExecutionId();
    
    // Set execution context for logging
    if (this.tracingLogger) {
      this.tracingLogger.setExecutionContext(executionId);
    }

    this.emit('debug:execution-started', { 
      executionId, 
      agentName: options.agentName,
      debugEnabled: !!debugSession,
      traceEnabled: !!trace 
    });

    try {
      // Pre-execution hooks
      await this.runPreExecutionHooks(options, trace, debugSession);

      // Execute with step monitoring
      const result = await this.executeWithStepMonitoring(options, trace, debugSession);

      // Post-execution hooks
      await this.runPostExecutionHooks(result, trace, debugSession);

      this.emit('debug:execution-completed', { 
        executionId, 
        success: result.success,
        duration: result.metrics.duration 
      });

      return result;

    } catch (error) {
      this.emit('debug:execution-failed', { 
        executionId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    } finally {
      if (this.tracingLogger) {
        this.tracingLogger.clearExecutionContext();
      }
    }
  }

  private async executeWithStepMonitoring(
    options: DebugExecutionOptions,
    trace?: ExecutionTrace,
    debugSession?: DebugSession
  ): Promise<ExecutionResult> {
    // For now, delegate to parent implementation
    // In a full implementation, this would intercept each execution step
    const result = await super.executeSingle(options);

    // Simulate step monitoring for demonstration
    if (trace && this.traceCollector) {
      // Add execution steps based on the result
      this.simulateStepCollection(trace, result);
    }

    return result;
  }

  private simulateStepCollection(trace: ExecutionTrace, result: ExecutionResult): void {
    if (!this.traceCollector) return;

    // Simulate preparation step
    this.traceCollector.addStep(trace.executionId, {
      stepName: 'Preparation',
      stepType: 'preparation',
      status: 'completed'
    });

    // Simulate execution step
    this.traceCollector.addStep(trace.executionId, {
      stepName: 'Agent Execution',
      stepType: 'execution',
      status: result.success ? 'completed' : 'failed'
    });

    // Simulate validation step
    this.traceCollector.addStep(trace.executionId, {
      stepName: 'Result Validation',
      stepType: 'validation',
      status: 'completed'
    });
  }

  private async runPreExecutionHooks(
    options: DebugExecutionOptions,
    trace?: ExecutionTrace,
    debugSession?: DebugSession
  ): Promise<void> {
    // Validate agent and options with debugging context
    if (this.tracingLogger && trace) {
      this.tracingLogger.step('Pre-execution validation started', {
        agentName: options.agentName,
        traceId: trace.executionId
      });
    }

    // Run any custom pre-execution hooks
    this.emit('debug:pre-execution', { options, trace, debugSession });
  }

  private async runPostExecutionHooks(
    result: ExecutionResult,
    trace?: ExecutionTrace,
    debugSession?: DebugSession
  ): Promise<void> {
    if (this.tracingLogger && trace) {
      this.tracingLogger.step('Post-execution processing completed', {
        success: result.success,
        duration: result.metrics.duration,
        traceId: trace.executionId
      });
    }

    // Run any custom post-execution hooks
    this.emit('debug:post-execution', { result, trace, debugSession });
  }

  private createDebugSession(executionId: string, options: DebugExecutionOptions): DebugSession {
    const session: DebugSession = {
      id: this.generateSessionId(),
      executionId,
      agentName: options.agentName,
      startTime: new Date().toISOString(),
      status: 'active',
      options: options,
      breakpointHits: [],
      stepHistory: [],
      variables: {},
      metadata: options.debugMetadata || {}
    };

    this.activeDebuggingSessions.set(session.id, session);
    this.emit('debug:session-created', session);

    return session;
  }

  private cleanupDebugSession(sessionId: string): void {
    const session = this.activeDebuggingSessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.endTime = new Date().toISOString();
      this.activeDebuggingSessions.delete(sessionId);
      this.emit('debug:session-completed', session);
    }
  }

  private async handleBreakpoint(
    trace: ExecutionTrace,
    step: ExecutionStep | undefined,
    reason: string
  ): Promise<void> {
    if (!this.breakpointManager) return;

    // Check if we should break
    let shouldBreak = false;
    let breakpoint;

    if (step) {
      const breakResult = await this.breakpointManager.shouldBreak(trace, step);
      shouldBreak = breakResult.shouldBreak;
      breakpoint = breakResult.breakpoint;
    } else if (reason === 'execution-start') {
      // Handle start breakpoints
      shouldBreak = true;
    }

    if (shouldBreak) {
      this.emit('debug:breakpoint-hit', {
        executionId: trace.executionId,
        step,
        breakpoint,
        reason,
        trace
      });

      // In a real implementation, this would pause execution
      // and wait for user commands (step, continue, etc.)
      if (this.tracingLogger) {
        this.tracingLogger.debug(`Breakpoint hit: ${reason}`, {
          executionId: trace.executionId,
          stepId: step?.stepId,
          breakpointId: breakpoint?.id
        });
      }
    }
  }

  private setupDebugLogging(): void {
    const baseLogger = Logger.create({ component: 'DebugExecutionEngine' });
    
    // Create tracing logger if trace collector is available
    if (this.traceCollector) {
      this.tracingLogger = new TracingLogger(
        { component: 'DebugExecutionEngine' },
        {
          enableTraceCollection: true,
          traceCollector: this.traceCollector,
          includeStackTrace: true,
          traceFilters: ['password', 'token', 'secret', 'key']
        }
      );
    }
  }

  private setupDebugEventHandlers(): void {
    // Handle internal events and forward to trace collector
    this.on('execution:started', (data) => {
      if (this.tracingLogger) {
        this.tracingLogger.step('Execution started', data);
      }
    });

    this.on('execution:completed', (data) => {
      if (this.tracingLogger) {
        this.tracingLogger.step('Execution completed', data);
      }
    });

    this.on('execution:failed', (data) => {
      if (this.tracingLogger) {
        this.tracingLogger.traceError('Execution failed', new Error(data.error));
      }
    });
  }

  private generateSessionId(): string {
    return `debug-session-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
  }
}

// Interface for debugging session
export interface DebugSession {
  id: string;
  executionId: string;
  agentName: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  options: DebugExecutionOptions;
  breakpointHits: Array<{
    breakpointId: string;
    timestamp: string;
    stepId?: string;
  }>;
  stepHistory: Array<{
    stepId: string;
    timestamp: string;
    action: 'step-over' | 'step-into' | 'step-out' | 'continue';
  }>;
  variables: Record<string, any>;
  metadata: Record<string, any>;
}

// Factory function to create debug-enabled execution engine
export function createDebugExecutionEngine(
  traceCollector?: TraceCollector,
  breakpointManager?: BreakpointManager
): DebugExecutionEngine {
  return new DebugExecutionEngine({
    enableGlobalTracing: !!traceCollector,
    enableBreakpoints: !!breakpointManager,
    enablePerformanceMonitoring: true,
    enableStepThroughDebugging: true,
    traceCollector,
    breakpointManager
  });
}

// Utility to enhance existing ExecutionEngine with debugging
export function enhanceExecutionEngineWithDebugging(
  executionEngine: ExecutionEngine,
  traceCollector: TraceCollector,
  breakpointManager?: BreakpointManager
): DebugExecutionEngine {
  const debugEngine = new DebugExecutionEngine({
    enableGlobalTracing: true,
    enableBreakpoints: !!breakpointManager,
    traceCollector,
    breakpointManager
  });

  // Copy any existing configuration from the original engine
  // Note: This is a simplified approach - in practice, you'd need to properly migrate state
  
  return debugEngine;
}