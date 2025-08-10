/**
 * Agent Circuit Breaker - Specialized circuit breaker for agent execution
 * 
 * @file AgentCircuitBreaker.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import {
  CircuitBreakerState,
  CircuitBreakerConfig,
  CircuitBreakerMetrics,
  CircuitState,
  StateTransitionFactory
} from '../states/CircuitBreakerState';

export interface AgentExecutionContext {
  agentName: string;
  task?: string;
  contextPath?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  timestamp: string;
  fromCache?: boolean;
}

export interface FallbackStrategy {
  type: 'cache' | 'simplified' | 'error' | 'alternative_agent';
  handler: (context: AgentExecutionContext) => Promise<AgentExecutionResult>;
}

export class AgentCircuitBreaker extends EventEmitter {
  private agentName: string;
  private config: CircuitBreakerConfig;
  private metrics: CircuitBreakerMetrics;
  private currentState: CircuitBreakerState;
  private fallbackStrategies: FallbackStrategy[] = [];
  private executionHistory: Array<{
    timestamp: number;
    success: boolean;
    duration: number;
    error?: string;
  }> = [];

  constructor(agentName: string, config: CircuitBreakerConfig, metrics: CircuitBreakerMetrics) {
    super();
    
    this.agentName = agentName;
    this.config = config;
    this.metrics = metrics;
    this.currentState = StateTransitionFactory.createState(CircuitState.CLOSED, config, metrics);
    
    this.setupDefaultFallbackStrategies();
  }

  /**
   * Execute agent with circuit breaker protection
   */
  async execute<T>(
    executionFunction: (context: AgentExecutionContext) => Promise<T>,
    context: AgentExecutionContext
  ): Promise<T | AgentExecutionResult> {
    const startTime = Date.now();
    let result: T | AgentExecutionResult;
    let success = false;
    let error: string | undefined;
    let isTimeout = false;

    try {
      // Check if call is allowed by current state
      if (!this.currentState.isCallAllowed()) {
        this.metrics.shortCircuits++;
        this.emit('callBlocked', {
          agentName: this.agentName,
          reason: 'Circuit breaker is open',
          state: this.currentState.getStateName(),
          timestamp: new Date().toISOString()
        });

        // Try fallback strategies
        const fallbackResult = await this.attemptFallback(context);
        if (fallbackResult) {
          return fallbackResult as T;
        }

        throw new Error(`Circuit breaker is ${this.currentState.getStateName()} for agent ${this.agentName}`);
      }

      // Attempt to allow call through state
      const callAllowed = await this.currentState.attemptCall();
      if (!callAllowed) {
        this.metrics.shortCircuits++;
        const fallbackResult = await this.attemptFallback(context);
        if (fallbackResult) {
          return fallbackResult as T;
        }
        throw new Error(`Call not allowed by circuit breaker state for agent ${this.agentName}`);
      }

      // Execute the function with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          isTimeout = true;
          reject(new Error(`Agent execution timeout after ${context.timeout || this.config.timeout}ms`));
        }, context.timeout || this.config.timeout);
      });

      const executionPromise = executionFunction(context);
      result = await Promise.race([executionPromise, timeoutPromise]);

      success = true;

    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : String(err);
      
      // Try fallback on failure if not already tried
      if (!isTimeout || this.fallbackStrategies.length > 0) {
        try {
          const fallbackResult = await this.attemptFallback(context);
          if (fallbackResult) {
            // Still record the failure but return fallback result
            this.recordExecution(success, Date.now() - startTime, error);
            this.handleStateTransition(success, isTimeout);
            return fallbackResult as T;
          }
        } catch (fallbackError) {
          // Fallback also failed, continue with original error
        }
      }

      result = {
        success: false,
        error,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      } as AgentExecutionResult;
    }

    // Record execution metrics
    const duration = Date.now() - startTime;
    this.recordExecution(success, duration, error);

    // Handle state transitions
    this.handleStateTransition(success, isTimeout);

    // Emit execution event
    this.emit('callExecuted', {
      agentName: this.agentName,
      success,
      duration,
      error,
      state: this.currentState.getStateName(),
      timestamp: new Date().toISOString()
    });

    if (!success && !result) {
      throw new Error(error || 'Agent execution failed');
    }

    return result!;
  }

  /**
   * Add fallback strategy
   */
  addFallbackStrategy(strategy: FallbackStrategy): void {
    this.fallbackStrategies.push(strategy);
  }

  /**
   * Remove fallback strategy
   */
  removeFallbackStrategy(type: FallbackStrategy['type']): void {
    this.fallbackStrategies = this.fallbackStrategies.filter(s => s.type !== type);
  }

  /**
   * Attempt fallback strategies
   */
  private async attemptFallback(context: AgentExecutionContext): Promise<AgentExecutionResult | null> {
    for (const strategy of this.fallbackStrategies) {
      try {
        const fallbackResult = await strategy.handler(context);
        
        this.emit('fallbackUsed', {
          agentName: this.agentName,
          strategyType: strategy.type,
          success: fallbackResult.success,
          timestamp: new Date().toISOString()
        });

        return fallbackResult;
      } catch (fallbackError) {
        console.warn(`Fallback strategy ${strategy.type} failed for agent ${this.agentName}:`, fallbackError);
      }
    }

    return null;
  }

  /**
   * Set up default fallback strategies
   */
  private setupDefaultFallbackStrategies(): void {
    // Error response fallback
    this.addFallbackStrategy({
      type: 'error',
      handler: async (context) => ({
        success: false,
        error: `Agent ${this.agentName} is currently unavailable due to circuit breaker protection`,
        duration: 0,
        timestamp: new Date().toISOString()
      })
    });
  }

  /**
   * Record execution in history
   */
  private recordExecution(success: boolean, duration: number, error?: string): void {
    // Add to execution history
    this.executionHistory.push({
      timestamp: Date.now(),
      success,
      duration,
      error
    });

    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory.shift();
    }

    // Update metrics (this would be handled by the state)
    // But we keep a local copy for faster access
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.consecutiveSuccesses++;
      this.metrics.consecutiveFailures = 0;
    } else {
      this.metrics.failedRequests++;
      this.metrics.consecutiveFailures++;
      this.metrics.consecutiveSuccesses = 0;
    }

    // Update average response time
    const alpha = 0.1;
    this.metrics.averageResponseTime = 
      this.metrics.averageResponseTime * (1 - alpha) + duration * alpha;

    // Update error rate
    this.metrics.errorRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.failedRequests / this.metrics.totalRequests) * 100 : 0;
  }

  /**
   * Handle state transitions
   */
  private handleStateTransition(success: boolean, isTimeout: boolean): void {
    const previousState = this.currentState.getStateName();
    let newState: CircuitBreakerState | null = null;

    if (success) {
      newState = this.currentState.onSuccess();
    } else if (isTimeout) {
      newState = this.currentState.onTimeout();
    } else {
      newState = this.currentState.onFailure();
    }

    if (newState) {
      this.currentState = newState;
      const currentStateName = this.currentState.getStateName();

      this.emit('stateChange', {
        circuitName: this.config.name,
        agentName: this.agentName,
        previousState,
        newState: currentStateName,
        timestamp: new Date().toISOString(),
        reason: this.getStateChangeReason(success, isTimeout),
        metrics: { ...this.metrics }
      });

      console.log(`Agent circuit breaker ${this.agentName} changed from ${previousState} to ${currentStateName}`);
    }
  }

  /**
   * Get reason for state change
   */
  private getStateChangeReason(success: boolean, isTimeout: boolean): string {
    if (success) {
      return 'Successful execution';
    } else if (isTimeout) {
      return 'Execution timeout';
    } else {
      return 'Execution failure';
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    agentName: string;
    state: CircuitState;
    metrics: CircuitBreakerMetrics;
    config: CircuitBreakerConfig;
    stateInfo: Record<string, any>;
    recentExecutions: Array<{ timestamp: number; success: boolean; duration: number; error?: string }>;
    fallbackStrategies: string[];
  } {
    return {
      agentName: this.agentName,
      state: this.currentState.getStateName(),
      metrics: { ...this.metrics },
      config: { ...this.config },
      stateInfo: this.currentState.getStateInfo(),
      recentExecutions: this.executionHistory.slice(-10),
      fallbackStrategies: this.fallbackStrategies.map(s => s.type)
    };
  }

  /**
   * Force close the circuit
   */
  forceClose(): void {
    const previousState = this.currentState.getStateName();
    this.currentState = StateTransitionFactory.createState(CircuitState.CLOSED, this.config, this.metrics);
    
    // Reset failure counters
    this.metrics.consecutiveFailures = 0;
    this.metrics.consecutiveSuccesses = 0;
    
    this.emit('stateChange', {
      circuitName: this.config.name,
      agentName: this.agentName,
      previousState,
      newState: CircuitState.CLOSED,
      timestamp: new Date().toISOString(),
      reason: 'Manually forced closed',
      metrics: { ...this.metrics }
    });

    console.log(`Agent circuit breaker ${this.agentName} manually closed`);
  }

  /**
   * Force open the circuit
   */
  forceOpen(): void {
    const previousState = this.currentState.getStateName();
    this.currentState = StateTransitionFactory.createState(CircuitState.OPEN, this.config, this.metrics);
    
    this.emit('stateChange', {
      circuitName: this.config.name,
      agentName: this.agentName,
      previousState,
      newState: CircuitState.OPEN,
      timestamp: new Date().toISOString(),
      reason: 'Manually forced open',
      metrics: { ...this.metrics }
    });

    console.log(`Agent circuit breaker ${this.agentName} manually opened`);
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      shortCircuits: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      errorRate: 0,
      averageResponseTime: 0,
      state: this.currentState.getStateName(),
      stateChangedAt: Date.now()
    };

    this.executionHistory = [];

    this.emit('metricsReset', {
      agentName: this.agentName,
      timestamp: new Date().toISOString()
    });

    console.log(`Metrics reset for agent circuit breaker ${this.agentName}`);
  }

  /**
   * Attempt recovery (for auto-recovery)
   */
  attemptRecovery(): void {
    if (this.currentState.getStateName() === CircuitState.OPEN) {
      const openState = this.currentState as any;
      if (openState.isReadyForRecoveryAttempt && openState.isReadyForRecoveryAttempt()) {
        const previousState = this.currentState.getStateName();
        this.currentState = StateTransitionFactory.createState(CircuitState.HALF_OPEN, this.config, this.metrics);
        
        this.emit('stateChange', {
          circuitName: this.config.name,
          agentName: this.agentName,
          previousState,
          newState: CircuitState.HALF_OPEN,
          timestamp: new Date().toISOString(),
          reason: 'Automatic recovery attempt',
          metrics: { ...this.metrics }
        });

        console.log(`Agent circuit breaker ${this.agentName} attempting recovery (OPEN -> HALF_OPEN)`);
      }
    }
  }

  /**
   * Get execution statistics
   */
  getExecutionStatistics(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    successRate: number;
    recentSuccessRate: number;
    shortCircuits: number;
    timeouts: number;
  } {
    const recentExecutions = this.executionHistory.slice(-10);
    const recentSuccesses = recentExecutions.filter(e => e.success).length;
    const recentSuccessRate = recentExecutions.length > 0 ? 
      (recentSuccesses / recentExecutions.length) * 100 : 0;

    return {
      totalExecutions: this.metrics.totalRequests,
      successfulExecutions: this.metrics.successfulRequests,
      failedExecutions: this.metrics.failedRequests,
      averageDuration: this.metrics.averageResponseTime,
      successRate: this.metrics.totalRequests > 0 ? 
        (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 0,
      recentSuccessRate,
      shortCircuits: this.metrics.shortCircuits,
      timeouts: this.metrics.timeouts
    };
  }
}