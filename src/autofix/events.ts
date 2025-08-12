/**
 * AGENT-027: Auto-fix Agent Event Infrastructure
 * Event-driven architecture for loose coupling between components
 */

import { EventEmitter } from 'events';
import {
  AutoFixIssue,
  FixStrategy,
  FixResult,
  PredictiveInsight,
  IssueType,
  SeverityLevel,
  FixStatus,
} from './types';

/**
 * Event types emitted by the Auto-fix system
 */
export enum AutoFixEvent {
  // Detection events
  IssueDetected = 'issue.detected',
  IssueAnalyzed = 'issue.analyzed',
  IssuePredicted = 'issue.predicted',
  
  // Fix events
  FixStarted = 'fix.started',
  FixStrategySelected = 'fix.strategy.selected',
  FixApplied = 'fix.applied',
  FixValidating = 'fix.validating',
  FixCompleted = 'fix.completed',
  FixFailed = 'fix.failed',
  
  // Rollback events
  RollbackStarted = 'rollback.started',
  RollbackCompleted = 'rollback.completed',
  RollbackFailed = 'rollback.failed',
  
  // Learning events
  PatternLearned = 'pattern.learned',
  ModelUpdated = 'model.updated',
  FeedbackReceived = 'feedback.received',
  
  // System events
  SystemStarted = 'system.started',
  SystemStopped = 'system.stopped',
  SystemError = 'system.error',
  SystemHealthCheck = 'system.health',
  
  // Monitoring events
  MetricsCollected = 'metrics.collected',
  PerformanceAlert = 'performance.alert',
  ThresholdExceeded = 'threshold.exceeded',
}

/**
 * Event payload interfaces
 */
export interface IssueDetectedPayload {
  issue: AutoFixIssue;
  source: string;
  timestamp: Date;
}

export interface FixStartedPayload {
  issueId: string;
  strategy: FixStrategy;
  timestamp: Date;
}

export interface FixCompletedPayload {
  issueId: string;
  result: FixResult;
  duration: number;
  timestamp: Date;
}

export interface PredictionGeneratedPayload {
  prediction: PredictiveInsight;
  confidence: number;
  timestamp: Date;
}

export interface SystemErrorPayload {
  error: Error;
  context: string;
  severity: SeverityLevel;
  timestamp: Date;
}

export interface MetricsPayload {
  issuesDetected: number;
  issuesFixed: number;
  issuesFailed: number;
  averageFixTime: number;
  successRate: number;
  timestamp: Date;
}

/**
 * Logger interface for the event system
 */
export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Default console logger implementation
 */
class ConsoleLogger implements ILogger {
  debug(message: string, ...args: any[]): void {
    console.debug(`[AUTOFIX DEBUG] ${message}`, ...args);
  }
  
  info(message: string, ...args: any[]): void {
    console.info(`[AUTOFIX INFO] ${message}`, ...args);
  }
  
  warn(message: string, ...args: any[]): void {
    console.warn(`[AUTOFIX WARN] ${message}`, ...args);
  }
  
  error(message: string, ...args: any[]): void {
    console.error(`[AUTOFIX ERROR] ${message}`, ...args);
  }
}

/**
 * Central event bus for the Auto-fix system
 * Implements pub/sub pattern with logging and error handling
 */
export class AutoFixEventBus extends EventEmitter {
  private static instance: AutoFixEventBus;
  private logger: ILogger;
  private eventHistory: Map<string, any[]> = new Map();
  private maxHistorySize = 100;
  private eventSubscriptions: Map<string, Set<string>> = new Map();

  private constructor(logger?: ILogger) {
    super();
    this.logger = logger || new ConsoleLogger();
    this.setMaxListeners(100); // Increase max listeners for complex systems
    
    // Set up error handling
    this.on('error', (error) => {
      this.logger.error('EventBus error:', error);
    });
  }

  /**
   * Get singleton instance of EventBus
   */
  public static getInstance(logger?: ILogger): AutoFixEventBus {
    if (!AutoFixEventBus.instance) {
      AutoFixEventBus.instance = new AutoFixEventBus(logger);
    }
    return AutoFixEventBus.instance;
  }

  /**
   * Emit an event with logging and history tracking
   */
  public emitEvent<T = any>(event: AutoFixEvent | string, payload: T): boolean {
    const timestamp = new Date();
    const eventData = { event, payload, timestamp };
    
    // Log event
    this.logger.debug(`Event emitted: ${event}`, payload);
    
    // Track in history
    this.addToHistory(event, eventData);
    
    // Emit the event
    return this.emit(event, payload);
  }

  /**
   * Subscribe to an event with automatic cleanup
   */
  public subscribe<T = any>(
    subscriberId: string,
    event: AutoFixEvent | string,
    handler: (payload: T) => void
  ): void {
    // Track subscription
    if (!this.eventSubscriptions.has(subscriberId)) {
      this.eventSubscriptions.set(subscriberId, new Set());
    }
    this.eventSubscriptions.get(subscriberId)!.add(event);
    
    // Wrap handler with error handling
    const safeHandler = (payload: T) => {
      try {
        handler(payload);
      } catch (error) {
        this.logger.error(`Error in event handler for ${event}:`, error);
        this.emitEvent(AutoFixEvent.SystemError, {
          error,
          context: `Handler error for event: ${event}`,
          severity: 'medium',
          timestamp: new Date(),
        });
      }
    };
    
    this.on(event, safeHandler);
    this.logger.debug(`Subscriber ${subscriberId} registered for event: ${event}`);
  }

  /**
   * Unsubscribe from an event
   */
  public unsubscribe(
    subscriberId: string,
    event: AutoFixEvent | string,
    handler: Function
  ): void {
    this.removeListener(event, handler);
    
    // Update tracking
    const subscriptions = this.eventSubscriptions.get(subscriberId);
    if (subscriptions) {
      subscriptions.delete(event);
      if (subscriptions.size === 0) {
        this.eventSubscriptions.delete(subscriberId);
      }
    }
    
    this.logger.debug(`Subscriber ${subscriberId} unregistered from event: ${event}`);
  }

  /**
   * Unsubscribe from all events for a subscriber
   */
  public unsubscribeAll(subscriberId: string): void {
    const subscriptions = this.eventSubscriptions.get(subscriberId);
    if (subscriptions) {
      subscriptions.forEach(event => {
        this.removeAllListeners(event);
      });
      this.eventSubscriptions.delete(subscriberId);
      this.logger.debug(`All subscriptions removed for: ${subscriberId}`);
    }
  }

  /**
   * Wait for an event to occur (Promise-based)
   */
  public waitForEvent<T = any>(
    event: AutoFixEvent | string,
    timeout?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = timeout
        ? setTimeout(() => {
            this.removeListener(event, handler);
            reject(new Error(`Timeout waiting for event: ${event}`));
          }, timeout)
        : null;
      
      const handler = (payload: T) => {
        if (timer) clearTimeout(timer);
        this.removeListener(event, handler);
        resolve(payload);
      };
      
      this.once(event, handler);
    });
  }

  /**
   * Get event history for analysis
   */
  public getEventHistory(event?: AutoFixEvent | string): any[] {
    if (event) {
      return this.eventHistory.get(event) || [];
    }
    
    // Return all history
    const allHistory: any[] = [];
    this.eventHistory.forEach(history => {
      allHistory.push(...history);
    });
    return allHistory.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  /**
   * Clear event history
   */
  public clearHistory(event?: AutoFixEvent | string): void {
    if (event) {
      this.eventHistory.delete(event);
    } else {
      this.eventHistory.clear();
    }
  }

  /**
   * Get current subscriptions for monitoring
   */
  public getSubscriptions(): Map<string, Set<string>> {
    return new Map(this.eventSubscriptions);
  }

  /**
   * Set custom logger
   */
  public setLogger(logger: ILogger): void {
    this.logger = logger;
  }

  /**
   * Emit issue detected event
   */
  public emitIssueDetected(issue: AutoFixIssue, source: string): void {
    this.emitEvent<IssueDetectedPayload>(AutoFixEvent.IssueDetected, {
      issue,
      source,
      timestamp: new Date(),
    });
  }

  /**
   * Emit fix started event
   */
  public emitFixStarted(issueId: string, strategy: FixStrategy): void {
    this.emitEvent<FixStartedPayload>(AutoFixEvent.FixStarted, {
      issueId,
      strategy,
      timestamp: new Date(),
    });
  }

  /**
   * Emit fix completed event
   */
  public emitFixCompleted(issueId: string, result: FixResult, duration: number): void {
    this.emitEvent<FixCompletedPayload>(AutoFixEvent.FixCompleted, {
      issueId,
      result,
      duration,
      timestamp: new Date(),
    });
  }

  /**
   * Emit prediction generated event
   */
  public emitPrediction(prediction: PredictiveInsight, confidence: number): void {
    this.emitEvent<PredictionGeneratedPayload>(AutoFixEvent.IssuePredicted, {
      prediction,
      confidence,
      timestamp: new Date(),
    });
  }

  /**
   * Emit system error event
   */
  public emitError(error: Error, context: string, severity: SeverityLevel = 'medium'): void {
    this.emitEvent<SystemErrorPayload>(AutoFixEvent.SystemError, {
      error,
      context,
      severity,
      timestamp: new Date(),
    });
  }

  /**
   * Emit metrics event
   */
  public emitMetrics(metrics: Omit<MetricsPayload, 'timestamp'>): void {
    this.emitEvent<MetricsPayload>(AutoFixEvent.MetricsCollected, {
      ...metrics,
      timestamp: new Date(),
    });
  }

  // Private methods

  private addToHistory(event: string, data: any): void {
    if (!this.eventHistory.has(event)) {
      this.eventHistory.set(event, []);
    }
    
    const history = this.eventHistory.get(event)!;
    history.push(data);
    
    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }
}

/**
 * Global event bus instance
 */
export const eventBus = AutoFixEventBus.getInstance();

/**
 * Decorator for automatic event emission
 */
export function EmitEvent(eventType: AutoFixEvent) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        
        // Emit success event
        eventBus.emitEvent(eventType, {
          method: propertyName,
          args,
          result,
          duration: Date.now() - startTime,
          timestamp: new Date(),
        });
        
        return result;
      } catch (error) {
        // Emit error event
        eventBus.emitError(
          error as Error,
          `Error in ${propertyName}`,
          'high'
        );
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Helper function to create typed event handlers
 */
export function createEventHandler<T>(
  event: AutoFixEvent,
  handler: (payload: T) => void | Promise<void>
): (payload: T) => void {
  return (payload: T) => {
    const result = handler(payload);
    if (result instanceof Promise) {
      result.catch(error => {
        eventBus.emitError(
          error,
          `Error handling event ${event}`,
          'medium'
        );
      });
    }
  };
}