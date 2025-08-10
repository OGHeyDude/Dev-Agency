/**
 * Production Health System - Main entry point
 * 
 * @file index.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { HealthCheckManager } from './health/HealthCheckManager';
import { CircuitBreakerManager } from './reliability/CircuitBreakerManager';
import { DegradationManager } from './degradation/DegradationManager';
import { MonitoringDashboard } from './monitoring/MonitoringDashboard';

// Health monitoring exports
export { HealthCheckManager } from './health/HealthCheckManager';
export { SystemHealthEndpoint } from './health/endpoints/SystemHealthEndpoint';
export { AgentHealthEndpoint } from './health/endpoints/AgentHealthEndpoint';
export { ResourceHealthEndpoint } from './health/endpoints/ResourceHealthEndpoint';
export { DependencyHealthEndpoint } from './health/endpoints/DependencyHealthEndpoint';

// Circuit breaker exports
export { CircuitBreakerManager } from './reliability/CircuitBreakerManager';
export { AgentCircuitBreaker } from './reliability/patterns/AgentCircuitBreaker';
export { ResourceCircuitBreaker } from './reliability/patterns/ResourceCircuitBreaker';
export { TimeoutCircuitBreaker } from './reliability/patterns/TimeoutCircuitBreaker';
export { ErrorRateCircuitBreaker } from './reliability/patterns/ErrorRateCircuitBreaker';

// Graceful degradation exports
export { DegradationManager, DegradationLevel, DegradationReason } from './degradation/DegradationManager';
export { CachedResponseStrategy } from './degradation/strategies/CachedResponseStrategy';
export { SimplifiedResponseStrategy } from './degradation/strategies/SimplifiedResponseStrategy';
export { FallbackAgentStrategy } from './degradation/strategies/FallbackAgentStrategy';
export { OfflineResponseStrategy } from './degradation/strategies/OfflineResponseStrategy';

// Monitoring dashboard exports
export { MonitoringDashboard } from './monitoring/MonitoringDashboard';

// Notification system exports
export {
  NotificationManager,
  getNotificationManager,
  NotificationConfigManager,
  createDefaultChannelMappings,
  SlackService,
  TeamsService,
  NotificationServer,
  DEFAULT_SERVER_CONFIG,
  SlashCommandHandler,
  AgentNotificationIntegration,
  getAgentNotificationIntegration,
  withNotifications,
  setupNotificationSystem
} from './notifications';

// Planning system exports
export {
  PredictivePlanner,
  DataParser,
  StatisticalAnalyzer,
  analyzeSprint,
  validateProjectPlanStructure
} from './planning';

// Type exports
export * from './health/models/HealthStatus';
export * from './health/models/SystemMetrics';
export * from './health/models/HealthEvent';
export * from './reliability/states/CircuitBreakerState';
export * from './planning/types';

export interface ProductionHealthSystemConfig {
  healthChecks?: {
    enabled?: boolean;
    interval?: number;
    timeout?: number;
  };
  circuitBreakers?: {
    defaultFailureThreshold?: number;
    defaultTimeout?: number;
    enableAutoRecovery?: boolean;
  };
  degradation?: {
    autoRecoveryEnabled?: boolean;
    maxDegradationHistory?: number;
  };
  monitoring?: {
    enabled?: boolean;
    port?: number;
    enableDashboard?: boolean;
  };
  integration?: {
    agentManager?: any;
    executionEngine?: any;
    performanceCache?: any;
  };
}

/**
 * Main Production Health System class
 * Orchestrates all health monitoring, circuit breaking, and degradation components
 */
export class ProductionHealthSystem {
  private healthCheckManager: HealthCheckManager;
  private circuitBreakerManager: CircuitBreakerManager;
  private degradationManager: DegradationManager;
  private monitoringDashboard: MonitoringDashboard;
  private config: ProductionHealthSystemConfig;
  private isStarted: boolean = false;

  constructor(config: ProductionHealthSystemConfig = {}) {
    this.config = {
      healthChecks: {
        enabled: true,
        interval: 30000,
        timeout: 5000,
        ...config.healthChecks
      },
      circuitBreakers: {
        defaultFailureThreshold: 5,
        defaultTimeout: 60000,
        enableAutoRecovery: true,
        ...config.circuitBreakers
      },
      degradation: {
        autoRecoveryEnabled: true,
        maxDegradationHistory: 1000,
        ...config.degradation
      },
      monitoring: {
        enabled: true,
        port: 3001,
        enableDashboard: true,
        ...config.monitoring
      },
      integration: config.integration || {}
    };

    this.initializeComponents();
    this.setupIntegrations();
  }

  /**
   * Initialize all system components
   */
  private initializeComponents(): void {
    // Initialize health check manager
    this.healthCheckManager = new HealthCheckManager({
      config: this.config.healthChecks,
      ...this.config.integration
    });

    // Initialize circuit breaker manager
    this.circuitBreakerManager = new CircuitBreakerManager({
      defaultFailureThreshold: this.config.circuitBreakers?.defaultFailureThreshold,
      defaultTimeout: this.config.circuitBreakers?.defaultTimeout,
      enableAutoRecovery: this.config.circuitBreakers?.enableAutoRecovery
    });

    // Initialize degradation manager
    this.degradationManager = new DegradationManager();

    // Initialize monitoring dashboard
    this.monitoringDashboard = new MonitoringDashboard({
      port: this.config.monitoring?.port,
      enabled: this.config.monitoring?.enabled,
      healthCheckManager: this.healthCheckManager,
      circuitBreakerManager: this.circuitBreakerManager,
      degradationManager: this.degradationManager
    });
  }

  /**
   * Setup integrations between components
   */
  private setupIntegrations(): void {
    // Connect circuit breaker events to degradation manager
    this.circuitBreakerManager.on('circuitOpened', (event) => {
      this.degradationManager.triggerDegradation({
        trigger: 'circuit_breaker_open' as any,
        component: event.circuitName,
        severity: 'significant' as any,
        timestamp: new Date().toISOString(),
        metadata: { circuitBreakerEvent: event }
      });
    });

    this.circuitBreakerManager.on('circuitClosed', (event) => {
      this.degradationManager.resolveDegradation(event.circuitName, 'circuit_breaker_open' as any);
    });

    // Connect health check failures to circuit breakers
    this.healthCheckManager.on('statusChange', (event) => {
      if (event.newStatus === 'critical' || event.newStatus === 'unhealthy') {
        // Trigger appropriate circuit breaker actions
        const circuitBreaker = this.circuitBreakerManager.getAgentCircuitBreaker(event.component);
        // Circuit breaker will handle the failure internally
      }
    });

    // Connect degradation events to monitoring
    this.degradationManager.on('degradationTriggered', (context) => {
      this.monitoringDashboard.recordEvent({
        type: 'degradation_triggered',
        component: context.component,
        severity: context.severity === 'critical' ? 'critical' : 'warning',
        message: `Degradation triggered: ${context.trigger}`,
        timestamp: context.timestamp
      });
    });

    this.degradationManager.on('degradationResolved', (event) => {
      this.monitoringDashboard.recordEvent({
        type: 'degradation_resolved',
        component: event.component,
        severity: 'info',
        message: `Degradation resolved after ${event.duration}ms`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the production health system
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      console.log('Production Health System is already running');
      return;
    }

    console.log('Starting Production Health System...');

    try {
      // Start components in order
      if (this.config.healthChecks?.enabled) {
        await this.healthCheckManager.start();
      }

      await this.circuitBreakerManager.start();
      await this.degradationManager.start();

      if (this.config.monitoring?.enabled) {
        await this.monitoringDashboard.start();
      }

      this.isStarted = true;
      console.log('Production Health System started successfully');

      // Log system status
      const status = await this.getSystemStatus();
      console.log('System Status:', JSON.stringify(status, null, 2));

    } catch (error) {
      console.error('Failed to start Production Health System:', error);
      throw error;
    }
  }

  /**
   * Stop the production health system
   */
  async stop(): Promise<void> {
    if (!this.isStarted) {
      console.log('Production Health System is not running');
      return;
    }

    console.log('Stopping Production Health System...');

    try {
      // Stop components in reverse order
      if (this.config.monitoring?.enabled) {
        await this.monitoringDashboard.stop();
      }

      await this.degradationManager.stop();
      await this.circuitBreakerManager.stop();

      if (this.config.healthChecks?.enabled) {
        await this.healthCheckManager.stop();
      }

      this.isStarted = false;
      console.log('Production Health System stopped successfully');

    } catch (error) {
      console.error('Failed to stop Production Health System:', error);
      throw error;
    }
  }

  /**
   * Get overall system status
   */
  async getSystemStatus(): Promise<{
    healthy: boolean;
    components: {
      healthChecks: any;
      circuitBreakers: any;
      degradation: any;
      monitoring: any;
    };
    summary: {
      totalIssues: number;
      criticalIssues: number;
      recommendations: string[];
    };
  }> {
    const healthCheckStatus = this.config.healthChecks?.enabled ? 
      await this.healthCheckManager.getSystemHealth() : null;
    
    const circuitBreakerStatus = this.circuitBreakerManager.healthCheck();
    const degradationStatus = this.degradationManager.healthCheck();
    const monitoringStatus = this.config.monitoring?.enabled ? 
      this.monitoringDashboard.getStatus() : null;

    // Determine overall health
    const componentHealths = [
      circuitBreakerStatus.healthy,
      degradationStatus.healthy,
      healthCheckStatus ? healthCheckStatus.status === 'healthy' : true,
      monitoringStatus ? monitoringStatus.healthy : true
    ];

    const overallHealthy = componentHealths.every(h => h);

    // Collect issues and recommendations
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!circuitBreakerStatus.healthy) {
      issues.push(...circuitBreakerStatus.issues);
      recommendations.push('Review circuit breaker configurations and thresholds');
    }

    if (!degradationStatus.healthy) {
      issues.push(...degradationStatus.issues);
      recommendations.push('Investigate active degradations and recovery processes');
    }

    if (healthCheckStatus && healthCheckStatus.status !== 'healthy') {
      issues.push(`System health is ${healthCheckStatus.status}`);
      recommendations.push('Check system resources and component health');
    }

    // Count critical issues
    const criticalIssues = issues.filter(issue => 
      issue.toLowerCase().includes('critical') || 
      issue.toLowerCase().includes('severe')
    ).length;

    return {
      healthy: overallHealthy,
      components: {
        healthChecks: healthCheckStatus,
        circuitBreakers: circuitBreakerStatus,
        degradation: degradationStatus,
        monitoring: monitoringStatus
      },
      summary: {
        totalIssues: issues.length,
        criticalIssues,
        recommendations
      }
    };
  }

  /**
   * Get component instances for advanced usage
   */
  getComponents(): {
    healthCheckManager: HealthCheckManager;
    circuitBreakerManager: CircuitBreakerManager;
    degradationManager: DegradationManager;
    monitoringDashboard: MonitoringDashboard;
  } {
    return {
      healthCheckManager: this.healthCheckManager,
      circuitBreakerManager: this.circuitBreakerManager,
      degradationManager: this.degradationManager,
      monitoringDashboard: this.monitoringDashboard
    };
  }

  /**
   * Health check endpoint for external monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
    timestamp: string;
    uptime: number;
    version: string;
    components: Record<string, any>;
  }> {
    const systemStatus = await this.getSystemStatus();
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' | 'critical' = 'healthy';
    
    if (systemStatus.summary.criticalIssues > 0) {
      overallStatus = 'critical';
    } else if (systemStatus.summary.totalIssues > 3) {
      overallStatus = 'unhealthy';
    } else if (systemStatus.summary.totalIssues > 0) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      components: systemStatus.components
    };
  }

  /**
   * Force recovery of all degraded components
   */
  async forceRecovery(): Promise<void> {
    console.log('Forcing recovery of all degraded components...');
    
    // Force close all open circuit breakers
    const circuitBreakers = this.circuitBreakerManager.getAllCircuitBreakers();
    for (const { name } of circuitBreakers) {
      this.circuitBreakerManager.forceCloseCircuitBreaker(name);
    }

    // Force resolution of all degradations
    await this.degradationManager.forceRecoveryAll();

    console.log('Forced recovery completed');
  }

  /**
   * Update system configuration
   */
  updateConfig(newConfig: Partial<ProductionHealthSystemConfig>): void {
    Object.assign(this.config, newConfig);
    
    // Update component configurations
    if (newConfig.circuitBreakers) {
      this.circuitBreakerManager.updateConfig(newConfig.circuitBreakers as any);
    }

    console.log('Production Health System configuration updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): ProductionHealthSystemConfig {
    return { ...this.config };
  }

  /**
   * Check if system is running
   */
  isRunning(): boolean {
    return this.isStarted;
  }
}