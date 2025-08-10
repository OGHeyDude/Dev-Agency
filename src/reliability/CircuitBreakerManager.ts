/**
 * Circuit Breaker Manager - Main orchestrator for circuit breaker patterns
 * 
 * @file CircuitBreakerManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';
import { 
  CircuitBreakerState, 
  CircuitBreakerConfig, 
  CircuitBreakerMetrics, 
  CircuitState,
  StateTransitionFactory 
} from './states/CircuitBreakerState';
import { AgentCircuitBreaker } from './patterns/AgentCircuitBreaker';
import { ResourceCircuitBreaker } from './patterns/ResourceCircuitBreaker';
import { TimeoutCircuitBreaker } from './patterns/TimeoutCircuitBreaker';
import { ErrorRateCircuitBreaker } from './patterns/ErrorRateCircuitBreaker';

export interface CircuitBreakerManagerConfig {
  defaultFailureThreshold: number;
  defaultTimeout: number;
  defaultHalfOpenMaxCalls: number;
  defaultVolumeThreshold: number;
  defaultErrorThresholdPercentage: number;
  defaultMonitoringPeriod: number;
  configPath: string;
  metricsRetentionDays: number;
  enableMetricsCollection: boolean;
  enableAutoRecovery: boolean;
}

export interface CircuitBreakerEvent {
  circuitName: string;
  previousState: CircuitState;
  newState: CircuitState;
  timestamp: string;
  reason: string;
  metrics: CircuitBreakerMetrics;
}

export class CircuitBreakerManager extends EventEmitter {
  private config: CircuitBreakerManagerConfig;
  private circuitBreakers: Map<string, any> = new Map();
  private circuitConfigs: Map<string, CircuitBreakerConfig> = new Map();
  private circuitMetrics: Map<string, CircuitBreakerMetrics> = new Map();
  private isRunning: boolean = false;

  constructor(config?: Partial<CircuitBreakerManagerConfig>) {
    super();
    
    this.config = {
      defaultFailureThreshold: 5,
      defaultTimeout: 60000, // 60 seconds
      defaultHalfOpenMaxCalls: 3,
      defaultVolumeThreshold: 10,
      defaultErrorThresholdPercentage: 50,
      defaultMonitoringPeriod: 60000, // 60 seconds
      configPath: path.join(__dirname, 'config', 'circuit-breaker-rules.json'),
      metricsRetentionDays: 7,
      enableMetricsCollection: true,
      enableAutoRecovery: true,
      ...config
    };

    this.loadConfigurations();
    this.setupEventListeners();
  }

  /**
   * Start the circuit breaker manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Start monitoring and auto-recovery
    if (this.config.enableAutoRecovery) {
      this.startAutoRecovery();
    }

    this.emit('manager:started');
    console.log('Circuit Breaker Manager started');
  }

  /**
   * Stop the circuit breaker manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.emit('manager:stopped');
    console.log('Circuit Breaker Manager stopped');
  }

  /**
   * Create or get a circuit breaker for an agent
   */
  getAgentCircuitBreaker(agentName: string, customConfig?: Partial<CircuitBreakerConfig>): AgentCircuitBreaker {
    const circuitName = `agent:${agentName}`;
    
    if (!this.circuitBreakers.has(circuitName)) {
      const config = this.createCircuitConfig(circuitName, customConfig);
      const metrics = this.createInitialMetrics(circuitName);
      
      const circuitBreaker = new AgentCircuitBreaker(agentName, config, metrics);
      this.setupCircuitBreakerEvents(circuitBreaker, circuitName);
      
      this.circuitBreakers.set(circuitName, circuitBreaker);
      this.circuitConfigs.set(circuitName, config);
      this.circuitMetrics.set(circuitName, metrics);
    }

    return this.circuitBreakers.get(circuitName);
  }

  /**
   * Create or get a circuit breaker for a resource
   */
  getResourceCircuitBreaker(resourceName: string, customConfig?: Partial<CircuitBreakerConfig>): ResourceCircuitBreaker {
    const circuitName = `resource:${resourceName}`;
    
    if (!this.circuitBreakers.has(circuitName)) {
      const config = this.createCircuitConfig(circuitName, customConfig);
      const metrics = this.createInitialMetrics(circuitName);
      
      const circuitBreaker = new ResourceCircuitBreaker(resourceName, config, metrics);
      this.setupCircuitBreakerEvents(circuitBreaker, circuitName);
      
      this.circuitBreakers.set(circuitName, circuitBreaker);
      this.circuitConfigs.set(circuitName, config);
      this.circuitMetrics.set(circuitName, metrics);
    }

    return this.circuitBreakers.get(circuitName);
  }

  /**
   * Create or get a timeout-based circuit breaker
   */
  getTimeoutCircuitBreaker(name: string, customConfig?: Partial<CircuitBreakerConfig>): TimeoutCircuitBreaker {
    const circuitName = `timeout:${name}`;
    
    if (!this.circuitBreakers.has(circuitName)) {
      const config = this.createCircuitConfig(circuitName, customConfig);
      const metrics = this.createInitialMetrics(circuitName);
      
      const circuitBreaker = new TimeoutCircuitBreaker(name, config, metrics);
      this.setupCircuitBreakerEvents(circuitBreaker, circuitName);
      
      this.circuitBreakers.set(circuitName, circuitBreaker);
      this.circuitConfigs.set(circuitName, config);
      this.circuitMetrics.set(circuitName, metrics);
    }

    return this.circuitBreakers.get(circuitName);
  }

  /**
   * Create or get an error rate-based circuit breaker
   */
  getErrorRateCircuitBreaker(name: string, customConfig?: Partial<CircuitBreakerConfig>): ErrorRateCircuitBreaker {
    const circuitName = `error-rate:${name}`;
    
    if (!this.circuitBreakers.has(circuitName)) {
      const config = this.createCircuitConfig(circuitName, customConfig);
      const metrics = this.createInitialMetrics(circuitName);
      
      const circuitBreaker = new ErrorRateCircuitBreaker(name, config, metrics);
      this.setupCircuitBreakerEvents(circuitBreaker, circuitName);
      
      this.circuitBreakers.set(circuitName, circuitBreaker);
      this.circuitConfigs.set(circuitName, config);
      this.circuitMetrics.set(circuitName, metrics);
    }

    return this.circuitBreakers.get(circuitName);
  }

  /**
   * Get all circuit breakers
   */
  getAllCircuitBreakers(): Array<{ name: string; circuitBreaker: any; status: any }> {
    const results = [];
    
    for (const [name, circuitBreaker] of this.circuitBreakers.entries()) {
      results.push({
        name,
        circuitBreaker,
        status: circuitBreaker.getStatus()
      });
    }

    return results;
  }

  /**
   * Get circuit breaker status by name
   */
  getCircuitBreakerStatus(name: string): any | null {
    const circuitBreaker = this.circuitBreakers.get(name);
    return circuitBreaker ? circuitBreaker.getStatus() : null;
  }

  /**
   * Get all circuit breaker statuses
   */
  getAllStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};
    
    for (const [name, circuitBreaker] of this.circuitBreakers.entries()) {
      statuses[name] = circuitBreaker.getStatus();
    }

    return statuses;
  }

  /**
   * Force close a circuit breaker
   */
  forceCloseCircuitBreaker(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker && typeof circuitBreaker.forceClose === 'function') {
      circuitBreaker.forceClose();
      return true;
    }
    return false;
  }

  /**
   * Force open a circuit breaker
   */
  forceOpenCircuitBreaker(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker && typeof circuitBreaker.forceOpen === 'function') {
      circuitBreaker.forceOpen();
      return true;
    }
    return false;
  }

  /**
   * Reset circuit breaker metrics
   */
  resetCircuitBreakerMetrics(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker && typeof circuitBreaker.resetMetrics === 'function') {
      circuitBreaker.resetMetrics();
      return true;
    }
    return false;
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitBreakerMetrics(name: string): CircuitBreakerMetrics | null {
    return this.circuitMetrics.get(name) || null;
  }

  /**
   * Get aggregated metrics for all circuit breakers
   */
  getAggregatedMetrics(): {
    totalCircuitBreakers: number;
    openCircuits: number;
    closedCircuits: number;
    halfOpenCircuits: number;
    totalRequests: number;
    totalFailures: number;
    totalSuccesses: number;
    overallSuccessRate: number;
  } {
    let totalRequests = 0;
    let totalFailures = 0;
    let totalSuccesses = 0;
    let openCircuits = 0;
    let closedCircuits = 0;
    let halfOpenCircuits = 0;

    for (const [name, circuitBreaker] of this.circuitBreakers.entries()) {
      const metrics = this.circuitMetrics.get(name);
      if (metrics) {
        totalRequests += metrics.totalRequests;
        totalFailures += metrics.failedRequests;
        totalSuccesses += metrics.successfulRequests;

        switch (metrics.state) {
          case CircuitState.OPEN:
            openCircuits++;
            break;
          case CircuitState.CLOSED:
            closedCircuits++;
            break;
          case CircuitState.HALF_OPEN:
            halfOpenCircuits++;
            break;
        }
      }
    }

    const overallSuccessRate = totalRequests > 0 ? (totalSuccesses / totalRequests) * 100 : 0;

    return {
      totalCircuitBreakers: this.circuitBreakers.size,
      openCircuits,
      closedCircuits,
      halfOpenCircuits,
      totalRequests,
      totalFailures,
      totalSuccesses,
      overallSuccessRate
    };
  }

  /**
   * Create circuit breaker configuration
   */
  private createCircuitConfig(circuitName: string, customConfig?: Partial<CircuitBreakerConfig>): CircuitBreakerConfig {
    return {
      name: circuitName,
      failureThreshold: customConfig?.failureThreshold ?? this.config.defaultFailureThreshold,
      timeout: customConfig?.timeout ?? this.config.defaultTimeout,
      halfOpenMaxCalls: customConfig?.halfOpenMaxCalls ?? this.config.defaultHalfOpenMaxCalls,
      volumeThreshold: customConfig?.volumeThreshold ?? this.config.defaultVolumeThreshold,
      errorThresholdPercentage: customConfig?.errorThresholdPercentage ?? this.config.defaultErrorThresholdPercentage,
      monitoringPeriod: customConfig?.monitoringPeriod ?? this.config.defaultMonitoringPeriod
    };
  }

  /**
   * Create initial circuit breaker metrics
   */
  private createInitialMetrics(circuitName: string): CircuitBreakerMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      shortCircuits: 0,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      errorRate: 0,
      averageResponseTime: 0,
      state: CircuitState.CLOSED,
      stateChangedAt: Date.now()
    };
  }

  /**
   * Set up event listeners for a circuit breaker
   */
  private setupCircuitBreakerEvents(circuitBreaker: any, circuitName: string): void {
    circuitBreaker.on('stateChange', (event: CircuitBreakerEvent) => {
      this.handleCircuitBreakerStateChange(circuitName, event);
    });

    circuitBreaker.on('callExecuted', (event: any) => {
      this.handleCircuitBreakerCall(circuitName, event);
    });
  }

  /**
   * Handle circuit breaker state changes
   */
  private handleCircuitBreakerStateChange(circuitName: string, event: CircuitBreakerEvent): void {
    console.log(`Circuit breaker ${circuitName} changed from ${event.previousState} to ${event.newState}: ${event.reason}`);
    
    // Update stored metrics
    this.circuitMetrics.set(circuitName, event.metrics);
    
    // Emit manager-level event
    this.emit('stateChange', {
      circuitName,
      ...event
    });

    // Handle specific state changes
    switch (event.newState) {
      case CircuitState.OPEN:
        this.emit('circuitOpened', { circuitName, event });
        break;
      case CircuitState.CLOSED:
        this.emit('circuitClosed', { circuitName, event });
        break;
      case CircuitState.HALF_OPEN:
        this.emit('circuitHalfOpen', { circuitName, event });
        break;
    }
  }

  /**
   * Handle circuit breaker call events
   */
  private handleCircuitBreakerCall(circuitName: string, event: any): void {
    // Update metrics
    const metrics = this.circuitMetrics.get(circuitName);
    if (metrics) {
      this.circuitMetrics.set(circuitName, metrics);
    }

    this.emit('callExecuted', {
      circuitName,
      ...event
    });
  }

  /**
   * Load configuration from file
   */
  private async loadConfigurations(): Promise<void> {
    try {
      if (await fs.pathExists(this.config.configPath)) {
        const config = await fs.readJson(this.config.configPath);
        // Apply loaded configuration
        Object.assign(this.config, config);
      }
    } catch (error) {
      console.warn('Failed to load circuit breaker configuration:', error);
    }
  }

  /**
   * Set up manager event listeners
   */
  private setupEventListeners(): void {
    this.on('circuitOpened', this.handleCircuitOpened.bind(this));
    this.on('circuitClosed', this.handleCircuitClosed.bind(this));
  }

  /**
   * Handle circuit opened event
   */
  private handleCircuitOpened(event: { circuitName: string; event: CircuitBreakerEvent }): void {
    console.log(`Circuit ${event.circuitName} opened - implementing fallback strategies`);
    // Trigger degradation mechanisms
    this.emit('degradationRequired', event);
  }

  /**
   * Handle circuit closed event
   */
  private handleCircuitClosed(event: { circuitName: string; event: CircuitBreakerEvent }): void {
    console.log(`Circuit ${event.circuitName} closed - normal operation restored`);
    // Trigger recovery mechanisms
    this.emit('recoveryCompleted', event);
  }

  /**
   * Start auto-recovery monitoring
   */
  private startAutoRecovery(): void {
    setInterval(() => {
      if (!this.isRunning) return;

      for (const [name, circuitBreaker] of this.circuitBreakers.entries()) {
        if (typeof circuitBreaker.attemptRecovery === 'function') {
          circuitBreaker.attemptRecovery();
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get manager configuration
   */
  getConfig(): CircuitBreakerManagerConfig {
    return { ...this.config };
  }

  /**
   * Update manager configuration
   */
  updateConfig(newConfig: Partial<CircuitBreakerManagerConfig>): void {
    Object.assign(this.config, newConfig);
    console.log('Circuit breaker manager configuration updated');
  }

  /**
   * Health check for the circuit breaker manager
   */
  healthCheck(): {
    healthy: boolean;
    activeCircuitBreakers: number;
    openCircuits: number;
    issues: string[];
  } {
    const issues: string[] = [];
    const aggregated = this.getAggregatedMetrics();
    
    // Check for too many open circuits
    if (aggregated.openCircuits > aggregated.totalCircuitBreakers * 0.5) {
      issues.push(`High number of open circuits: ${aggregated.openCircuits}/${aggregated.totalCircuitBreakers}`);
    }

    // Check overall success rate
    if (aggregated.overallSuccessRate < 80) {
      issues.push(`Low overall success rate: ${aggregated.overallSuccessRate.toFixed(1)}%`);
    }

    return {
      healthy: issues.length === 0,
      activeCircuitBreakers: aggregated.totalCircuitBreakers,
      openCircuits: aggregated.openCircuits,
      issues
    };
  }
}