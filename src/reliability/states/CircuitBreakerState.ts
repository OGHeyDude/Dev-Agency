/**
 * Circuit Breaker State Machine - Core state management for circuit breakers
 * 
 * @file CircuitBreakerState.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;        // Number of failures before opening
  timeout: number;                 // Time to wait before attempting recovery (ms)
  halfOpenMaxCalls: number;        // Max calls to test in half-open state
  volumeThreshold: number;         // Minimum calls before considering failure rate
  errorThresholdPercentage: number; // Error percentage to trigger opening
  monitoringPeriod: number;        // Time window to monitor (ms)
  name: string;                    // Circuit breaker identifier
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeouts: number;
  shortCircuits: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  errorRate: number;
  averageResponseTime: number;
  state: CircuitState;
  stateChangedAt: number;
  nextAttemptAt?: number;
}

export abstract class CircuitBreakerState {
  protected config: CircuitBreakerConfig;
  protected metrics: CircuitBreakerMetrics;

  constructor(config: CircuitBreakerConfig, metrics: CircuitBreakerMetrics) {
    this.config = config;
    this.metrics = metrics;
  }

  /**
   * Attempt to execute a call through the circuit breaker
   */
  abstract attemptCall(): Promise<boolean>;

  /**
   * Handle successful execution
   */
  abstract onSuccess(): CircuitBreakerState | null;

  /**
   * Handle failed execution
   */
  abstract onFailure(): CircuitBreakerState | null;

  /**
   * Handle timeout
   */
  abstract onTimeout(): CircuitBreakerState | null;

  /**
   * Get current state name
   */
  abstract getStateName(): CircuitState;

  /**
   * Check if call is allowed in current state
   */
  abstract isCallAllowed(): boolean;

  /**
   * Get state-specific information
   */
  abstract getStateInfo(): Record<string, any>;

  /**
   * Update metrics with request result
   */
  protected updateMetrics(success: boolean, responseTime: number, isTimeout: boolean = false): void {
    const now = Date.now();
    
    this.metrics.totalRequests++;
    this.metrics.averageResponseTime = this.calculateAverageResponseTime(responseTime);

    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.consecutiveSuccesses++;
      this.metrics.consecutiveFailures = 0;
      this.metrics.lastSuccessTime = now;
    } else {
      this.metrics.failedRequests++;
      this.metrics.consecutiveFailures++;
      this.metrics.consecutiveSuccesses = 0;
      this.metrics.lastFailureTime = now;

      if (isTimeout) {
        this.metrics.timeouts++;
      }
    }

    // Calculate error rate for recent requests
    this.metrics.errorRate = this.calculateErrorRate();
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(newResponseTime: number): number {
    const alpha = 0.1; // Exponential moving average factor
    return this.metrics.averageResponseTime * (1 - alpha) + newResponseTime * alpha;
  }

  /**
   * Calculate current error rate
   */
  private calculateErrorRate(): number {
    if (this.metrics.totalRequests === 0) {
      return 0;
    }

    // Simple error rate calculation
    return (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
  }

  /**
   * Check if volume threshold is met
   */
  protected isVolumeThresholdMet(): boolean {
    return this.metrics.totalRequests >= this.config.volumeThreshold;
  }

  /**
   * Check if failure threshold is exceeded
   */
  protected isFailureThresholdExceeded(): boolean {
    return this.metrics.consecutiveFailures >= this.config.failureThreshold ||
           (this.isVolumeThresholdMet() && this.metrics.errorRate >= this.config.errorThresholdPercentage);
  }

  /**
   * Check if timeout period has elapsed
   */
  protected isTimeoutElapsed(): boolean {
    if (!this.metrics.nextAttemptAt) {
      return true;
    }
    return Date.now() >= this.metrics.nextAttemptAt;
  }

  /**
   * Set next attempt time
   */
  protected setNextAttemptTime(): void {
    this.metrics.nextAttemptAt = Date.now() + this.config.timeout;
  }

  /**
   * Reset failure counters
   */
  protected resetFailures(): void {
    this.metrics.consecutiveFailures = 0;
    this.metrics.consecutiveSuccesses = 0;
  }

  /**
   * Get common state information
   */
  protected getCommonStateInfo(): Record<string, any> {
    return {
      state: this.getStateName(),
      totalRequests: this.metrics.totalRequests,
      successfulRequests: this.metrics.successfulRequests,
      failedRequests: this.metrics.failedRequests,
      consecutiveFailures: this.metrics.consecutiveFailures,
      consecutiveSuccesses: this.metrics.consecutiveSuccesses,
      errorRate: this.metrics.errorRate.toFixed(2) + '%',
      averageResponseTime: Math.round(this.metrics.averageResponseTime) + 'ms',
      stateChangedAt: new Date(this.metrics.stateChangedAt).toISOString(),
      nextAttemptAt: this.metrics.nextAttemptAt ? 
        new Date(this.metrics.nextAttemptAt).toISOString() : null
    };
  }
}

/**
 * State transition factory
 */
export class StateTransitionFactory {
  static createState(
    targetState: CircuitState, 
    config: CircuitBreakerConfig, 
    metrics: CircuitBreakerMetrics
  ): CircuitBreakerState {
    // Update metrics for state change
    metrics.state = targetState;
    metrics.stateChangedAt = Date.now();

    switch (targetState) {
      case CircuitState.CLOSED:
        return new (require('./ClosedState').ClosedState)(config, metrics);
      case CircuitState.OPEN:
        return new (require('./OpenState').OpenState)(config, metrics);
      case CircuitState.HALF_OPEN:
        return new (require('./HalfOpenState').HalfOpenState)(config, metrics);
      default:
        throw new Error(`Unknown circuit breaker state: ${targetState}`);
    }
  }
}