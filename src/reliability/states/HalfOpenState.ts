/**
 * Half-Open State - Recovery testing state for circuit breaker
 * 
 * @file HalfOpenState.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { CircuitBreakerState, CircuitState, StateTransitionFactory } from './CircuitBreakerState';

/**
 * Half-Open State - Recovery testing
 * 
 * In this state:
 * - Limited number of calls are allowed through to test recovery
 * - If calls succeed, transitions to CLOSED
 * - If calls fail, transitions back to OPEN
 */
export class HalfOpenState extends CircuitBreakerState {
  private halfOpenCallsAttempted: number = 0;
  private halfOpenCallsSuccessful: number = 0;
  private enteredAt: number;

  constructor(config: any, metrics: any) {
    super(config, metrics);
    this.enteredAt = Date.now();
    this.halfOpenCallsAttempted = 0;
    this.halfOpenCallsSuccessful = 0;
  }

  /**
   * Attempt to execute a call
   * In HALF_OPEN state, allow limited calls for testing
   */
  async attemptCall(): Promise<boolean> {
    // Check if we've reached the maximum number of half-open calls
    if (this.halfOpenCallsAttempted >= this.config.halfOpenMaxCalls) {
      return false; // No more test calls allowed
    }

    this.halfOpenCallsAttempted++;
    return true; // Allow the test call
  }

  /**
   * Handle successful execution
   * Track success and potentially transition to CLOSED
   */
  onSuccess(): CircuitBreakerState | null {
    this.updateMetrics(true, 0); // Response time would be provided by caller
    this.halfOpenCallsSuccessful++;

    // If all test calls were successful, close the circuit
    if (this.halfOpenCallsSuccessful >= this.config.halfOpenMaxCalls) {
      this.resetFailures();
      return StateTransitionFactory.createState(CircuitState.CLOSED, this.config, this.metrics);
    }

    // Continue testing in HALF_OPEN state
    return null;
  }

  /**
   * Handle failed execution
   * Immediately transition back to OPEN on any failure
   */
  onFailure(): CircuitBreakerState | null {
    this.updateMetrics(false, 0); // Response time would be provided by caller

    // Any failure in HALF_OPEN state should open the circuit again
    return StateTransitionFactory.createState(CircuitState.OPEN, this.config, this.metrics);
  }

  /**
   * Handle timeout
   * Treat timeout as failure and transition to OPEN
   */
  onTimeout(): CircuitBreakerState | null {
    this.updateMetrics(false, this.config.timeout, true);

    // Any timeout in HALF_OPEN state should open the circuit again
    return StateTransitionFactory.createState(CircuitState.OPEN, this.config, this.metrics);
  }

  /**
   * Get current state name
   */
  getStateName(): CircuitState {
    return CircuitState.HALF_OPEN;
  }

  /**
   * Check if call is allowed
   * In HALF_OPEN state, allow calls until max is reached
   */
  isCallAllowed(): boolean {
    return this.halfOpenCallsAttempted < this.config.halfOpenMaxCalls;
  }

  /**
   * Get state-specific information
   */
  getStateInfo(): Record<string, any> {
    const commonInfo = this.getCommonStateInfo();
    const now = Date.now();
    const timeInHalfOpenState = now - this.enteredAt;
    
    return {
      ...commonInfo,
      description: 'Circuit breaker is half-open - testing recovery',
      enteredAt: new Date(this.enteredAt).toISOString(),
      timeInHalfOpenState: this.formatDuration(timeInHalfOpenState),
      testCallsAttempted: this.halfOpenCallsAttempted,
      testCallsSuccessful: this.halfOpenCallsSuccessful,
      testCallsRemaining: Math.max(0, this.config.halfOpenMaxCalls - this.halfOpenCallsAttempted),
      maxTestCalls: this.config.halfOpenMaxCalls,
      successRate: this.getTestSuccessRate(),
      testingProgress: this.getTestingProgress(),
      nextAction: this.getNextAction()
    };
  }

  /**
   * Get success rate of test calls
   */
  private getTestSuccessRate(): string {
    if (this.halfOpenCallsAttempted === 0) {
      return 'N/A';
    }
    const rate = (this.halfOpenCallsSuccessful / this.halfOpenCallsAttempted) * 100;
    return `${rate.toFixed(1)}%`;
  }

  /**
   * Get testing progress information
   */
  private getTestingProgress(): Record<string, any> {
    const progress = (this.halfOpenCallsAttempted / this.config.halfOpenMaxCalls) * 100;
    
    return {
      percentComplete: `${progress.toFixed(1)}%`,
      callsCompleted: this.halfOpenCallsAttempted,
      callsTotal: this.config.halfOpenMaxCalls,
      successfulCalls: this.halfOpenCallsSuccessful,
      failedCalls: this.halfOpenCallsAttempted - this.halfOpenCallsSuccessful
    };
  }

  /**
   * Get next action description
   */
  private getNextAction(): string {
    const remaining = this.config.halfOpenMaxCalls - this.halfOpenCallsAttempted;
    
    if (remaining > 0) {
      return `Waiting for ${remaining} more test call${remaining === 1 ? '' : 's'}`;
    } else if (this.halfOpenCallsSuccessful === this.config.halfOpenMaxCalls) {
      return 'All test calls successful - ready to close circuit';
    } else {
      return 'Test calls completed with failures - will reopen circuit';
    }
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
   * Get detailed test call statistics
   */
  getTestCallStatistics(): Record<string, any> {
    return {
      totalTestCalls: this.halfOpenCallsAttempted,
      successfulTestCalls: this.halfOpenCallsSuccessful,
      failedTestCalls: this.halfOpenCallsAttempted - this.halfOpenCallsSuccessful,
      remainingTestCalls: Math.max(0, this.config.halfOpenMaxCalls - this.halfOpenCallsAttempted),
      testSuccessRate: this.getTestSuccessRate(),
      requiredSuccessfulCalls: this.config.halfOpenMaxCalls,
      timeInTesting: this.formatDuration(Date.now() - this.enteredAt)
    };
  }

  /**
   * Check if testing is complete
   */
  isTestingComplete(): boolean {
    return this.halfOpenCallsAttempted >= this.config.halfOpenMaxCalls;
  }

  /**
   * Check if all test calls were successful
   */
  areAllTestCallsSuccessful(): boolean {
    return this.isTestingComplete() && 
           this.halfOpenCallsSuccessful === this.config.halfOpenMaxCalls;
  }

  /**
   * Get recovery probability based on current test results
   */
  getRecoveryProbability(): number {
    if (this.halfOpenCallsAttempted === 0) {
      return 0.5; // 50% unknown
    }
    
    return this.halfOpenCallsSuccessful / this.halfOpenCallsAttempted;
  }

  /**
   * Force the circuit to close (manual intervention)
   */
  forceClose(): CircuitBreakerState {
    this.resetFailures();
    return StateTransitionFactory.createState(CircuitState.CLOSED, this.config, this.metrics);
  }

  /**
   * Force the circuit to open (manual intervention)
   */
  forceOpen(): CircuitBreakerState {
    return StateTransitionFactory.createState(CircuitState.OPEN, this.config, this.metrics);
  }

  /**
   * Reset test call counters (for debugging/testing purposes)
   */
  resetTestCalls(): void {
    this.halfOpenCallsAttempted = 0;
    this.halfOpenCallsSuccessful = 0;
  }
}