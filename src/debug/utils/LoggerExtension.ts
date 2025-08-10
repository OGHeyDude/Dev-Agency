/**
 * Logger Extension - Enhanced logging with trace collection hooks
 * 
 * @file LoggerExtension.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { Logger, LogLevel, LogEntry } from '../../../tools/agent-cli/src/utils/Logger';
import { TraceCollector } from '../collectors/TraceCollector';
import { ExecutionTrace, DebugAnnotation } from '../models/TraceModels';

export interface TraceLogEntry extends LogEntry {
  executionId?: string;
  stepId?: string;
  traceLevel: 'trace' | 'step' | 'decision' | 'performance' | 'error';
  debugContext?: Record<string, any>;
}

export interface LoggerTraceOptions {
  enableTraceCollection: boolean;
  traceCollector?: TraceCollector;
  maxContextSize: number;
  includeStackTrace: boolean;
  traceFilters: string[];
}

export class TracingLogger extends Logger {
  private traceOptions: LoggerTraceOptions;
  private traceCollector?: TraceCollector;
  private currentExecutionId?: string;
  private currentStepId?: string;

  constructor(
    loggerOptions?: Parameters<typeof Logger.create>[0],
    traceOptions: Partial<LoggerTraceOptions> = {}
  ) {
    super(loggerOptions);
    
    this.traceOptions = {
      enableTraceCollection: false,
      maxContextSize: 1024,
      includeStackTrace: false,
      traceFilters: [],
      ...traceOptions
    };
    
    this.traceCollector = traceOptions.traceCollector;
  }

  /**
   * Set trace collector for enhanced logging
   */
  setTraceCollector(collector: TraceCollector): void {
    this.traceCollector = collector;
    this.traceOptions.enableTraceCollection = true;
  }

  /**
   * Set current execution context
   */
  setExecutionContext(executionId: string, stepId?: string): void {
    this.currentExecutionId = executionId;
    this.currentStepId = stepId;
  }

  /**
   * Clear execution context
   */
  clearExecutionContext(): void {
    this.currentExecutionId = undefined;
    this.currentStepId = undefined;
  }

  /**
   * Log trace-level information
   */
  trace(message: string, data?: any, context?: Record<string, any>): void {
    this.logWithTrace('debug', message, data, 'trace', context);
  }

  /**
   * Log step execution information
   */
  step(message: string, data?: any, context?: Record<string, any>): void {
    this.logWithTrace('info', message, data, 'step', context);
  }

  /**
   * Log decision information
   */
  decision(message: string, data?: any, context?: Record<string, any>): void {
    this.logWithTrace('info', message, data, 'decision', context);
  }

  /**
   * Log performance information
   */
  performance(message: string, data?: any, context?: Record<string, any>): void {
    this.logWithTrace('info', message, data, 'performance', context);
  }

  /**
   * Log execution error with trace context
   */
  traceError(message: string, error: Error, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: this.traceOptions.includeStackTrace ? error.stack : undefined
      }
    };
    
    this.logWithTrace('error', message, error, 'error', errorContext);
  }

  /**
   * Enhanced logging with trace collection
   */
  private logWithTrace(
    level: LogLevel,
    message: string,
    data?: any,
    traceLevel: TraceLogEntry['traceLevel'] = 'trace',
    debugContext?: Record<string, any>
  ): void {
    // Standard logging
    this.log(level, message, data);

    // Trace collection if enabled
    if (this.traceOptions.enableTraceCollection && 
        this.traceCollector && 
        this.currentExecutionId) {
      
      this.collectTraceData(level, message, data, traceLevel, debugContext);
    }
  }

  private collectTraceData(
    level: LogLevel,
    message: string,
    data: any,
    traceLevel: TraceLogEntry['traceLevel'],
    debugContext?: Record<string, any>
  ): void {
    if (!this.traceCollector || !this.currentExecutionId) return;

    try {
      // Create debug annotation
      const annotation: DebugAnnotation = {
        id: this.generateAnnotationId(),
        type: this.mapLogLevelToAnnotationType(level),
        message: this.truncateMessage(message),
        timestamp: new Date().toISOString(),
        stepId: this.currentStepId,
        userId: 'system' // Could be extended to include actual user
      };

      // Add annotation to current trace
      const trace = this.traceCollector.getTrace(this.currentExecutionId);
      if (trace) {
        if (!trace.debugInfo.annotations) {
          trace.debugInfo.annotations = [];
        }
        trace.debugInfo.annotations.push(annotation);

        // Add context to current step if available
        if (this.currentStepId && debugContext) {
          const currentStep = trace.steps.find(s => s.stepId === this.currentStepId);
          if (currentStep) {
            if (!currentStep.annotations) {
              currentStep.annotations = [];
            }
            currentStep.annotations.push(annotation);
          }
        }

        // Emit trace event for real-time updates
        this.traceCollector.emit('trace:log-entry', {
          executionId: this.currentExecutionId,
          stepId: this.currentStepId,
          level,
          message,
          traceLevel,
          timestamp: new Date().toISOString(),
          context: this.sanitizeContext(debugContext)
        });
      }

    } catch (error) {
      // Avoid recursive logging issues
      console.error('Failed to collect trace data:', error);
    }
  }

  private mapLogLevelToAnnotationType(level: LogLevel): DebugAnnotation['type'] {
    const mapping: Record<LogLevel, DebugAnnotation['type']> = {
      debug: 'info',
      info: 'info',
      warn: 'warning',
      error: 'error'
    };
    return mapping[level];
  }

  private truncateMessage(message: string): string {
    if (message.length <= this.traceOptions.maxContextSize) {
      return message;
    }
    return message.substring(0, this.traceOptions.maxContextSize) + '... [TRUNCATED]';
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(context)) {
      // Skip sensitive keys
      if (this.traceOptions.traceFilters.some(filter => 
        key.toLowerCase().includes(filter.toLowerCase()))) {
        sanitized[key] = '[FILTERED]';
        continue;
      }

      // Limit size of values
      if (typeof value === 'string' && value.length > this.traceOptions.maxContextSize) {
        sanitized[key] = value.substring(0, this.traceOptions.maxContextSize) + '... [TRUNCATED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.slice(0, 10).map(item => this.sanitizeObject(item)); // Limit array size
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      let keyCount = 0;
      
      for (const [key, value] of Object.entries(obj)) {
        if (keyCount >= 20) break; // Limit object keys
        
        if (typeof value === 'function') continue;
        
        sanitized[key] = this.sanitizeObject(value);
        keyCount++;
      }
      
      return sanitized;
    }

    return obj;
  }

  private generateAnnotationId(): string {
    return `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  }
}

// Factory function to create tracing logger
export function createTracingLogger(
  loggerOptions?: Parameters<typeof Logger.create>[0],
  traceOptions?: Partial<LoggerTraceOptions>
): TracingLogger {
  return new TracingLogger(loggerOptions, traceOptions);
}

// Extension methods for existing Logger instances
export function extendLoggerWithTracing(
  logger: Logger,
  traceCollector: TraceCollector,
  options: Partial<LoggerTraceOptions> = {}
): TracingLogger {
  // Create new tracing logger with same configuration
  const tracingLogger = new TracingLogger(undefined, {
    traceCollector,
    ...options
  });

  // Copy configuration from existing logger
  // Note: This is a simplified approach - in practice, you'd need access to private properties
  return tracingLogger;
}

// Utility functions for trace-aware logging
export class TraceLoggingUtils {
  /**
   * Create execution logger bound to specific execution context
   */
  static createExecutionLogger(
    baseLogger: TracingLogger,
    executionId: string,
    stepId?: string
  ): TracingLogger {
    const logger = new TracingLogger();
    logger.setExecutionContext(executionId, stepId);
    return logger;
  }

  /**
   * Log timing information with trace context
   */
  static logTiming(
    logger: TracingLogger,
    operation: string,
    startTime: number,
    endTime?: number
  ): void {
    const duration = (endTime || Date.now()) - startTime;
    logger.performance(`${operation} completed in ${duration}ms`, {
      operation,
      duration,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime || Date.now()).toISOString()
    });
  }

  /**
   * Log memory usage with trace context
   */
  static logMemoryUsage(
    logger: TracingLogger,
    operation: string
  ): void {
    const memUsage = process.memoryUsage();
    logger.performance(`Memory usage for ${operation}`, {
      operation,
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      rss: Math.round(memUsage.rss / 1024 / 1024) // MB
    });
  }

  /**
   * Log token usage with trace context
   */
  static logTokenUsage(
    logger: TracingLogger,
    operation: string,
    inputTokens: number,
    outputTokens: number,
    cost?: number
  ): void {
    logger.performance(`Token usage for ${operation}`, {
      operation,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCost: cost
    });
  }

  /**
   * Log decision with reasoning
   */
  static logDecision(
    logger: TracingLogger,
    decision: string,
    options: string[],
    chosen: string,
    reasoning: string,
    confidence: number
  ): void {
    logger.decision(`Decision: ${decision}`, {
      decision,
      options,
      chosen,
      reasoning,
      confidence
    });
  }
}