/**
 * Closed State - Normal operation state for circuit breaker
 * 
 * @file ClosedState.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { CircuitBreakerState, CircuitState, StateTransitionFactory } from './CircuitBreakerState';

/**
 * Closed State - Normal operation
 * 
 * In this state:
 * - All calls are allowed through
 * - Failures are tracked
 * - When failure threshold is exceeded, transitions to OPEN
 */
export class ClosedState extends CircuitBreakerState {
  /**
   * Attempt to execute a call
   * In CLOSED state, all calls are allowed
   */
  async attemptCall(): Promise<boolean> {
    return true; // Allow all calls in closed state
  }

  /**
   * Handle successful execution
   * Reset failure counters on success
   */
  onSuccess(): CircuitBreakerState | null {
    this.updateMetrics(true, 0); // Response time would be provided by caller
    
    // Reset failure counters on success
    if (this.metrics.consecutiveFailures > 0) {
      this.resetFailures();
    }

    // Stay in CLOSED state
    return null;
  }

  /**
   * Handle failed execution
   * Track failures and potentially transition to OPEN
   */
  onFailure(): CircuitBreakerState | null {
    this.updateMetrics(false, 0); // Response time would be provided by caller

    // Check if we should transition to OPEN state
    if (this.isFailureThresholdExceeded()) {
      return StateTransitionFactory.createState(CircuitState.OPEN, this.config, this.metrics);
    }

    // Stay in CLOSED state
    return null;
  }

  /**
   * Handle timeout
   * Treat timeouts as failures
   */
  onTimeout(): CircuitBreakerState | null {
    this.updateMetrics(false, this.config.timeout, true);

    // Check if we should transition to OPEN state
    if (this.isFailureThresholdExceeded()) {
      return StateTransitionFactory.createState(CircuitState.OPEN, this.config, this.metrics);
    }

    // Stay in CLOSED state
    return null;
  }

  /**
   * Get current state name
   */
  getStateName(): CircuitState {
    return CircuitState.CLOSED;
  }

  /**
   * Check if call is allowed
   * In CLOSED state, all calls are allowed
   */
  isCallAllowed(): boolean {
    return true;
  }

  /**
   * Get state-specific information
   */
  getStateInfo(): Record<string, any> {
    const commonInfo = this.getCommonStateInfo();
    
    return {
      ...commonInfo,
      description: 'Circuit breaker is closed - all calls allowed',
      failuresUntilOpen: Math.max(0, this.config.failureThreshold - this.metrics.consecutiveFailures),
      volumeThresholdMet: this.isVolumeThresholdMet(),
      healthStatus: this.getHealthStatus()
    };
  }

  /**
   * Get health status based on current metrics
   */
  private getHealthStatus(): string {
    if (this.metrics.consecutiveFailures === 0) {
      return 'healthy';
    } else if (this.metrics.consecutiveFailures < this.config.failureThreshold / 2) {
      return 'warning';
    } else {
      return 'critical';
    }
  }

  /**
   * Check if close to threshold
   */
  isCloseToThreshold(): boolean {
    const threshold = this.config.failureThreshold;
    const current = this.metrics.consecutiveFailures;
    return current >= (threshold * 0.7); // 70% of threshold
  }

  /**
   * Get threshold information
   */
  getThresholdInfo(): Record<string, any> {
    return {
      failureThreshold: this.config.failureThreshold,
      currentFailures: this.metrics.consecutiveFailures,
      remainingFailures: Math.max(0, this.config.failureThreshold - this.metrics.consecutiveFailures),
      errorThresholdPercentage: this.config.errorThresholdPercentage,
      currentErrorRate: this.metrics.errorRate,
      volumeThreshold: this.config.volumeThreshold,
      currentVolume: this.metrics.totalRequests
    };
  }
}