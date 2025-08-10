/**
 * Open State - Failure state with fallback for circuit breaker
 * 
 * @file OpenState.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { CircuitBreakerState, CircuitState, StateTransitionFactory } from './CircuitBreakerState';

/**
 * Open State - Failure state
 * 
 * In this state:
 * - All calls are blocked (short-circuited)
 * - After timeout period, transitions to HALF_OPEN to test recovery
 * - Fallback responses may be provided
 */
export class OpenState extends CircuitBreakerState {
  private openedAt: number;

  constructor(config: any, metrics: any) {
    super(config, metrics);
    this.openedAt = Date.now();
    this.setNextAttemptTime();
  }

  /**
   * Attempt to execute a call
   * In OPEN state, calls are blocked until timeout period elapses
   */
  async attemptCall(): Promise<boolean> {
    // Increment short circuit counter
    this.metrics.shortCircuits++;

    // Check if timeout period has elapsed
    if (this.isTimeoutElapsed()) {
      // Don't allow the call, but signal that we should transition to HALF_OPEN
      return false;
    }

    // Block the call - circuit is open
    return false;
  }

  /**
   * Handle successful execution
   * Should not occur in OPEN state as calls are blocked
   */
  onSuccess(): CircuitBreakerState | null {
    // This should not happen in OPEN state
    console.warn('Success reported in OPEN state - this should not happen');
    return null;
  }

  /**
   * Handle failed execution
   * Should not occur in OPEN state as calls are blocked
   */
  onFailure(): CircuitBreakerState | null {
    // This should not happen in OPEN state as calls are blocked
    console.warn('Failure reported in OPEN state - calls should be blocked');
    return null;
  }

  /**
   * Handle timeout
   * Should not occur in OPEN state as calls are blocked
   */
  onTimeout(): CircuitBreakerState | null {
    // This should not happen in OPEN state
    console.warn('Timeout reported in OPEN state - calls should be blocked');
    return null;
  }

  /**
   * Get current state name
   */
  getStateName(): CircuitState {
    return CircuitState.OPEN;
  }

  /**
   * Check if call is allowed
   * In OPEN state, check if timeout has elapsed for transition to HALF_OPEN
   */
  isCallAllowed(): boolean {
    return false; // Never allow calls in OPEN state
  }

  /**
   * Check if ready to attempt recovery
   */
  isReadyForRecoveryAttempt(): boolean {
    return this.isTimeoutElapsed();
  }

  /**
   * Attempt to transition to HALF_OPEN state
   */
  attemptRecovery(): CircuitBreakerState | null {
    if (this.isTimeoutElapsed()) {
      return StateTransitionFactory.createState(CircuitState.HALF_OPEN, this.config, this.metrics);
    }
    return null;
  }

  /**
   * Get state-specific information
   */
  getStateInfo(): Record<string, any> {
    const commonInfo = this.getCommonStateInfo();
    const now = Date.now();
    const timeInOpenState = now - this.openedAt;
    const timeUntilRetry = this.metrics.nextAttemptAt ? 
      Math.max(0, this.metrics.nextAttemptAt - now) : 0;
    
    return {
      ...commonInfo,
      description: 'Circuit breaker is open - all calls blocked',
      openedAt: new Date(this.openedAt).toISOString(),
      timeInOpenState: this.formatDuration(timeInOpenState),
      timeUntilRetry: this.formatDuration(timeUntilRetry),
      readyForRecovery: this.isReadyForRecoveryAttempt(),
      shortCircuits: this.metrics.shortCircuits,
      reasonForOpening: this.getReasonForOpening(),
      recoveryStrategy: this.getRecoveryStrategy()
    };
  }

  /**
   * Get reason why circuit was opened
   */
  private getReasonForOpening(): string {
    if (this.metrics.consecutiveFailures >= this.config.failureThreshold) {
      return `Consecutive failures exceeded threshold (${this.metrics.consecutiveFailures} >= ${this.config.failureThreshold})`;
    } else if (this.metrics.errorRate >= this.config.errorThresholdPercentage) {
      return `Error rate exceeded threshold (${this.metrics.errorRate.toFixed(1)}% >= ${this.config.errorThresholdPercentage}%)`;
    } else {
      return 'Threshold exceeded';
    }
  }

  /**
   * Get recovery strategy information
   */
  private getRecoveryStrategy(): Record<string, any> {
    return {
      timeout: this.config.timeout,
      halfOpenMaxCalls: this.config.halfOpenMaxCalls,
      nextStep: this.isReadyForRecoveryAttempt() ? 
        'Ready to transition to HALF_OPEN state' : 
        'Waiting for timeout period to elapse'
    };
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(durationMs: number): string {
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    } else if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    } else if (durationMs < 3600000) {
      return `${(durationMs / 60000).toFixed(1)}m`;
    } else {
      return `${(durationMs / 3600000).toFixed(1)}h`;
    }
  }

  /**
   * Get time remaining until recovery attempt
   */
  getTimeUntilRecovery(): number {
    if (!this.metrics.nextAttemptAt) {
      return 0;
    }
    return Math.max(0, this.metrics.nextAttemptAt - Date.now());
  }

  /**
   * Get failure statistics that led to opening
   */
  getFailureStatistics(): Record<string, any> {
    return {
      totalRequests: this.metrics.totalRequests,
      failedRequests: this.metrics.failedRequests,
      successfulRequests: this.metrics.successfulRequests,
      consecutiveFailures: this.metrics.consecutiveFailures,
      errorRate: this.metrics.errorRate,
      timeouts: this.metrics.timeouts,
      lastFailureTime: this.metrics.lastFailureTime ? 
        new Date(this.metrics.lastFailureTime).toISOString() : null,
      averageResponseTime: this.metrics.averageResponseTime
    };
  }

  /**
   * Force close the circuit (for manual intervention)
   */
  forceClose(): CircuitBreakerState {
    // Reset failure counters
    this.resetFailures();
    this.metrics.shortCircuits = 0;
    
    return StateTransitionFactory.createState(CircuitState.CLOSED, this.config, this.metrics);
  }

  /**
   * Extend the timeout period
   */
  extendTimeout(additionalMs: number): void {
    if (this.metrics.nextAttemptAt) {
      this.metrics.nextAttemptAt += additionalMs;
    } else {
      this.setNextAttemptTime();
      this.metrics.nextAttemptAt! += additionalMs;
    }
  }
}