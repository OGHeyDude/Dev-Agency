/**
 * Health Check Manager - Main orchestrator for system health monitoring
 * 
 * @file HealthCheckManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as cron from 'node-cron';
import { 
  SystemHealth, 
  ComponentHealth, 
  HealthLevel, 
  ComponentType, 
  HealthCheck,
  HealthThresholds,
  HealthAlert,
  AgentHealth,
  ResourceHealth,
  DependencyHealth
} from './models/HealthStatus';
import { 
  HealthEvent, 
  EventType, 
  EventSeverity,
  StatusChangeEvent,
  AlertEvent 
} from './models/HealthEvent';
import { SystemHealthEndpoint } from './endpoints/SystemHealthEndpoint';
import { AgentHealthEndpoint } from './endpoints/AgentHealthEndpoint';
import { ResourceHealthEndpoint } from './endpoints/ResourceHealthEndpoint';
import { DependencyHealthEndpoint } from './endpoints/DependencyHealthEndpoint';
import { AgentMetricsCollector } from './collectors/AgentMetricsCollector';
import { ResourceMetricsCollector } from './collectors/ResourceMetricsCollector';
import { PerformanceCollector } from './collectors/PerformanceCollector';
import { FailurePatternCollector } from './collectors/FailurePatternCollector';

export interface HealthCheckConfig {
  interval: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  thresholdsPath: string;
  monitoringConfigPath: string;
  alertingEnabled: boolean;
  metricsEnabled: boolean;
  storageEnabled: boolean;
}

export interface HealthCheckManagerOptions {
  config?: Partial<HealthCheckConfig>;
  agentManager?: any;
  executionEngine?: any;
  performanceCache?: any;
}

export class HealthCheckManager extends EventEmitter {
  private config: HealthCheckConfig;
  private thresholds: HealthThresholds;
  private monitoringConfig: any;
  private isRunning: boolean = false;
  private cronJobs: cron.ScheduledTask[] = [];
  private healthHistory: Map<string, HealthCheck[]> = new Map();
  private alertHistory: Map<string, HealthAlert[]> = new Map();
  private componentStates: Map<string, ComponentHealth> = new Map();

  // Health check endpoints
  private systemEndpoint: SystemHealthEndpoint;
  private agentEndpoint: AgentHealthEndpoint;
  private resourceEndpoint: ResourceHealthEndpoint;
  private dependencyEndpoint: DependencyHealthEndpoint;

  // Metrics collectors
  private agentMetricsCollector: AgentMetricsCollector;
  private resourceMetricsCollector: ResourceMetricsCollector;
  private performanceCollector: PerformanceCollector;
  private failurePatternCollector: FailurePatternCollector;

  // External dependencies
  private agentManager?: any;
  private executionEngine?: any;
  private performanceCache?: any;

  constructor(options: HealthCheckManagerOptions = {}) {
    super();
    
    this.config = {
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      retryAttempts: 3,
      retryDelay: 1000,
      thresholdsPath: path.join(__dirname, 'config', 'health-thresholds.json'),
      monitoringConfigPath: path.join(__dirname, 'config', 'monitoring-config.json'),
      alertingEnabled: true,
      metricsEnabled: true,
      storageEnabled: true,
      ...options.config
    };

    this.agentManager = options.agentManager;
    this.executionEngine = options.executionEngine;
    this.performanceCache = options.performanceCache;

    this.initializeComponents();
    this.loadConfigurations();
  }

  /**
   * Initialize health check components
   */
  private initializeComponents(): void {
    // Initialize health check endpoints
    this.systemEndpoint = new SystemHealthEndpoint(this);
    this.agentEndpoint = new AgentHealthEndpoint(this, this.agentManager);
    this.resourceEndpoint = new ResourceHealthEndpoint(this);
    this.dependencyEndpoint = new DependencyHealthEndpoint(this);

    // Initialize metrics collectors
    this.agentMetricsCollector = new AgentMetricsCollector(this.agentManager, this.executionEngine);
    this.resourceMetricsCollector = new ResourceMetricsCollector();
    this.performanceCollector = new PerformanceCollector(this.performanceCache);
    this.failurePatternCollector = new FailurePatternCollector();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Load configuration files
   */
  private async loadConfigurations(): Promise<void> {
    try {
      if (await fs.pathExists(this.config.thresholdsPath)) {
        this.thresholds = await fs.readJson(this.config.thresholdsPath);
      } else {
        this.thresholds = this.getDefaultThresholds();
      }

      if (await fs.pathExists(this.config.monitoringConfigPath)) {
        this.monitoringConfig = await fs.readJson(this.config.monitoringConfigPath);
      } else {
        this.monitoringConfig = this.getDefaultMonitoringConfig();
      }
    } catch (error) {
      console.error('Failed to load health check configurations:', error);
      this.thresholds = this.getDefaultThresholds();
      this.monitoringConfig = this.getDefaultMonitoringConfig();
    }
  }

  /**
   * Set up event listeners for health monitoring
   */
  private setupEventListeners(): void {
    this.on('healthCheck:completed', this.handleHealthCheckCompleted.bind(this));
    this.on('statusChange', this.handleStatusChange.bind(this));
    this.on('alert:triggered', this.handleAlertTriggered.bind(this));
    this.on('alert:resolved', this.handleAlertResolved.bind(this));
  }

  /**
   * Start health monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Schedule health checks
    this.scheduleHealthChecks();
    
    // Start metrics collection
    this.startMetricsCollection();

    this.emit('healthMonitoring:started');
    console.log('Health Check Manager started');
  }

  /**
   * Stop health monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Stop cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs = [];

    // Stop metrics collection
    this.stopMetricsCollection();

    this.emit('healthMonitoring:stopped');
    console.log('Health Check Manager stopped');
  }

  /**
   * Schedule health checks using cron
   */
  private scheduleHealthChecks(): void {
    const config = this.monitoringConfig.healthChecks;
    
    if (!config.enabled) {
      return;
    }

    // System health check (every 30 seconds)
    const systemJob = cron.schedule('*/30 * * * * *', async () => {
      await this.runSystemHealthCheck();
    });
    this.cronJobs.push(systemJob);

    // Agent health check (every minute)
    const agentJob = cron.schedule('*/60 * * * * *', async () => {
      await this.runAgentHealthCheck();
    });
    this.cronJobs.push(agentJob);

    // Resource health check (every 30 seconds)
    const resourceJob = cron.schedule('*/30 * * * * *', async () => {
      await this.runResourceHealthCheck();
    });
    this.cronJobs.push(resourceJob);

    // Dependency health check (every 2 minutes)
    const dependencyJob = cron.schedule('*/120 * * * * *', async () => {
      await this.runDependencyHealthCheck();
    });
    this.cronJobs.push(dependencyJob);

    // Cleanup job (every hour)
    const cleanupJob = cron.schedule('0 * * * *', () => {
      this.cleanupOldData();
    });
    this.cronJobs.push(cleanupJob);
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (!this.monitoringConfig.metrics.enabled) {
      return;
    }

    // Start collectors
    this.agentMetricsCollector.start();
    this.resourceMetricsCollector.start();
    this.performanceCollector.start();
    this.failurePatternCollector.start();
  }

  /**
   * Stop metrics collection
   */
  private stopMetricsCollection(): void {
    this.agentMetricsCollector.stop();
    this.resourceMetricsCollector.stop();
    this.performanceCollector.stop();
    this.failurePatternCollector.stop();
  }

  /**
   * Run system health check
   */
  private async runSystemHealthCheck(): Promise<void> {
    try {
      const healthCheck = await this.systemEndpoint.checkHealth();
      this.recordHealthCheck('system', healthCheck);
      this.emit('healthCheck:completed', { component: 'system', check: healthCheck });
    } catch (error) {
      console.error('System health check failed:', error);
      this.recordFailedHealthCheck('system', error);
    }
  }

  /**
   * Run agent health check
   */
  private async runAgentHealthCheck(): Promise<void> {
    try {
      const healthCheck = await this.agentEndpoint.checkHealth();
      this.recordHealthCheck('agents', healthCheck);
      this.emit('healthCheck:completed', { component: 'agents', check: healthCheck });
    } catch (error) {
      console.error('Agent health check failed:', error);
      this.recordFailedHealthCheck('agents', error);
    }
  }

  /**
   * Run resource health check
   */
  private async runResourceHealthCheck(): Promise<void> {
    try {
      const healthCheck = await this.resourceEndpoint.checkHealth();
      this.recordHealthCheck('resources', healthCheck);
      this.emit('healthCheck:completed', { component: 'resources', check: healthCheck });
    } catch (error) {
      console.error('Resource health check failed:', error);
      this.recordFailedHealthCheck('resources', error);
    }
  }

  /**
   * Run dependency health check
   */
  private async runDependencyHealthCheck(): Promise<void> {
    try {
      const healthCheck = await this.dependencyEndpoint.checkHealth();
      this.recordHealthCheck('dependencies', healthCheck);
      this.emit('healthCheck:completed', { component: 'dependencies', check: healthCheck });
    } catch (error) {
      console.error('Dependency health check failed:', error);
      this.recordFailedHealthCheck('dependencies', error);
    }
  }

  /**
   * Get overall system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const components: ComponentHealth[] = [];
    const timestamp = new Date().toISOString();

    // Get health from all endpoints
    try {
      const systemHealth = await this.systemEndpoint.getHealth();
      if (systemHealth) components.push(systemHealth);
    } catch (error) {
      console.error('Failed to get system health:', error);
    }

    try {
      const agentHealths = await this.agentEndpoint.getAllAgentHealth();
      components.push(...agentHealths);
    } catch (error) {
      console.error('Failed to get agent healths:', error);
    }

    try {
      const resourceHealth = await this.resourceEndpoint.getResourceHealth();
      if (resourceHealth) {
        const componentHealth: ComponentHealth = {
          component: 'resources',
          type: ComponentType.RESOURCE,
          status: this.calculateResourceStatus(resourceHealth),
          checks: [],
          uptime: 0,
          lastCheck: timestamp,
          consecutiveFailures: 0,
          errorRate: 0
        };
        components.push(componentHealth);
      }
    } catch (error) {
      console.error('Failed to get resource health:', error);
    }

    try {
      const dependencyHealths = await this.dependencyEndpoint.getAllDependencyHealth();
      dependencyHealths.forEach(dep => {
        const componentHealth: ComponentHealth = {
          component: dep.name,
          type: ComponentType.DEPENDENCY,
          status: dep.status,
          checks: [],
          uptime: 0,
          lastCheck: timestamp,
          consecutiveFailures: 0,
          errorRate: 0
        };
        components.push(componentHealth);
      });
    } catch (error) {
      console.error('Failed to get dependency healths:', error);
    }

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(components);

    // Count components by status
    const summary = {
      healthy: components.filter(c => c.status === HealthLevel.HEALTHY).length,
      degraded: components.filter(c => c.status === HealthLevel.DEGRADED).length,
      unhealthy: components.filter(c => c.status === HealthLevel.UNHEALTHY).length,
      critical: components.filter(c => c.status === HealthLevel.CRITICAL).length
    };

    return {
      status: overallStatus,
      timestamp,
      uptime: process.uptime(),
      components,
      summary,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Record health check result
   */
  private recordHealthCheck(component: string, check: HealthCheck): void {
    if (!this.healthHistory.has(component)) {
      this.healthHistory.set(component, []);
    }

    const history = this.healthHistory.get(component)!;
    history.push(check);

    // Keep only last 100 checks per component
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    // Update component state
    this.updateComponentState(component, check);
  }

  /**
   * Record failed health check
   */
  private recordFailedHealthCheck(component: string, error: any): void {
    const failedCheck: HealthCheck = {
      name: `${component}_health_check`,
      status: HealthLevel.CRITICAL,
      message: error instanceof Error ? error.message : String(error),
      duration: 0,
      timestamp: new Date().toISOString(),
      metadata: { error: true }
    };

    this.recordHealthCheck(component, failedCheck);
  }

  /**
   * Update component state
   */
  private updateComponentState(component: string, check: HealthCheck): void {
    const existingState = this.componentStates.get(component);
    const previousStatus = existingState?.status || HealthLevel.HEALTHY;

    const componentHealth: ComponentHealth = {
      component,
      type: this.getComponentType(component),
      status: check.status,
      checks: [check],
      uptime: existingState?.uptime || process.uptime(),
      lastCheck: check.timestamp,
      consecutiveFailures: check.status !== HealthLevel.HEALTHY 
        ? (existingState?.consecutiveFailures || 0) + 1 
        : 0,
      errorRate: this.calculateErrorRate(component)
    };

    this.componentStates.set(component, componentHealth);

    // Emit status change event if status changed
    if (previousStatus !== check.status) {
      const statusChangeEvent: StatusChangeEvent = {
        id: `status_${component}_${Date.now()}`,
        type: EventType.STATUS_CHANGE,
        severity: this.mapHealthLevelToSeverity(check.status),
        timestamp: check.timestamp,
        component,
        componentType: componentHealth.type,
        source: 'health-monitor',
        title: `${component} status changed`,
        message: `Component ${component} status changed from ${previousStatus} to ${check.status}`,
        tags: ['status-change', component],
        resolved: false,
        previousStatus,
        newStatus: check.status,
        trigger: 'health_check'
      };

      this.emit('statusChange', statusChangeEvent);
    }
  }

  /**
   * Handle health check completed event
   */
  private handleHealthCheckCompleted(event: { component: string; check: HealthCheck }): void {
    // Check for threshold violations and trigger alerts
    this.checkThresholds(event.component, event.check);
  }

  /**
   * Handle status change event
   */
  private handleStatusChange(event: StatusChangeEvent): void {
    console.log(`Status change: ${event.component} ${event.previousStatus} -> ${event.newStatus}`);
    
    // Trigger appropriate responses based on status change
    if (event.newStatus === HealthLevel.CRITICAL) {
      this.triggerCriticalAlert(event);
    } else if (event.newStatus === HealthLevel.UNHEALTHY) {
      this.triggerUnhealthyAlert(event);
    }
  }

  /**
   * Handle alert triggered event
   */
  private handleAlertTriggered(alert: HealthAlert): void {
    console.log(`Alert triggered: ${alert.component} - ${alert.message}`);
    
    // Store alert
    if (!this.alertHistory.has(alert.component)) {
      this.alertHistory.set(alert.component, []);
    }
    this.alertHistory.get(alert.component)!.push(alert);
  }

  /**
   * Handle alert resolved event
   */
  private handleAlertResolved(alert: HealthAlert): void {
    console.log(`Alert resolved: ${alert.component} - ${alert.message}`);
  }

  /**
   * Check thresholds and trigger alerts
   */
  private checkThresholds(component: string, check: HealthCheck): void {
    if (!this.config.alertingEnabled) {
      return;
    }

    // Logic for threshold checking based on component type
    // This would check against the loaded thresholds configuration
    // and trigger appropriate alerts
  }

  /**
   * Calculate error rate for component
   */
  private calculateErrorRate(component: string): number {
    const history = this.healthHistory.get(component);
    if (!history || history.length === 0) {
      return 0;
    }

    const recentChecks = history.slice(-10); // Last 10 checks
    const failures = recentChecks.filter(check => 
      check.status === HealthLevel.UNHEALTHY || check.status === HealthLevel.CRITICAL
    ).length;

    return (failures / recentChecks.length) * 100;
  }

  /**
   * Calculate overall system status
   */
  private calculateOverallStatus(components: ComponentHealth[]): HealthLevel {
    if (components.length === 0) {
      return HealthLevel.HEALTHY;
    }

    const criticalCount = components.filter(c => c.status === HealthLevel.CRITICAL).length;
    const unhealthyCount = components.filter(c => c.status === HealthLevel.UNHEALTHY).length;
    const degradedCount = components.filter(c => c.status === HealthLevel.DEGRADED).length;

    if (criticalCount > 0) {
      return HealthLevel.CRITICAL;
    } else if (unhealthyCount > 0) {
      return HealthLevel.UNHEALTHY;
    } else if (degradedCount > 0) {
      return HealthLevel.DEGRADED;
    } else {
      return HealthLevel.HEALTHY;
    }
  }

  /**
   * Calculate resource status from ResourceHealth
   */
  private calculateResourceStatus(resourceHealth: ResourceHealth): HealthLevel {
    const statuses = [
      resourceHealth.cpu.status,
      resourceHealth.memory.status,
      resourceHealth.disk.status,
      resourceHealth.network.status
    ];

    if (statuses.includes(HealthLevel.CRITICAL)) {
      return HealthLevel.CRITICAL;
    } else if (statuses.includes(HealthLevel.UNHEALTHY)) {
      return HealthLevel.UNHEALTHY;
    } else if (statuses.includes(HealthLevel.DEGRADED)) {
      return HealthLevel.DEGRADED;
    } else {
      return HealthLevel.HEALTHY;
    }
  }

  /**
   * Get component type from component name
   */
  private getComponentType(component: string): ComponentType {
    if (component === 'system' || component === 'resources') {
      return ComponentType.SYSTEM;
    } else if (component === 'agents' || component.includes('agent')) {
      return ComponentType.AGENT;
    } else {
      return ComponentType.DEPENDENCY;
    }
  }

  /**
   * Map health level to event severity
   */
  private mapHealthLevelToSeverity(level: HealthLevel): EventSeverity {
    switch (level) {
      case HealthLevel.CRITICAL:
        return EventSeverity.CRITICAL;
      case HealthLevel.UNHEALTHY:
        return EventSeverity.ERROR;
      case HealthLevel.DEGRADED:
        return EventSeverity.WARNING;
      default:
        return EventSeverity.INFO;
    }
  }

  /**
   * Trigger critical alert
   */
  private triggerCriticalAlert(event: StatusChangeEvent): void {
    const alert: HealthAlert = {
      id: `alert_${event.component}_${Date.now()}`,
      component: event.component,
      type: event.componentType,
      level: 'critical',
      message: `Critical: ${event.message}`,
      timestamp: event.timestamp,
      resolved: false,
      metadata: { originalEvent: event }
    };

    this.emit('alert:triggered', alert);
  }

  /**
   * Trigger unhealthy alert
   */
  private triggerUnhealthyAlert(event: StatusChangeEvent): void {
    const alert: HealthAlert = {
      id: `alert_${event.component}_${Date.now()}`,
      component: event.component,
      type: event.componentType,
      level: 'error',
      message: `Unhealthy: ${event.message}`,
      timestamp: event.timestamp,
      resolved: false,
      metadata: { originalEvent: event }
    };

    this.emit('alert:triggered', alert);
  }

  /**
   * Clean up old data
   */
  private cleanupOldData(): void {
    const retentionDays = 7;
    const cutoffTime = new Date();
    cutoffTime.setDate(cutoffTime.getDate() - retentionDays);

    // Clean up health history
    this.healthHistory.forEach((history, component) => {
      const filtered = history.filter(check => 
        new Date(check.timestamp) > cutoffTime
      );
      this.healthHistory.set(component, filtered);
    });

    // Clean up alert history
    this.alertHistory.forEach((alerts, component) => {
      const filtered = alerts.filter(alert => 
        new Date(alert.timestamp) > cutoffTime
      );
      this.alertHistory.set(component, filtered);
    });
  }

  /**
   * Get default thresholds
   */
  private getDefaultThresholds(): HealthThresholds {
    return {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      responseTime: { warning: 5000, critical: 10000 },
      errorRate: { warning: 5, critical: 15 },
      availability: { warning: 95, critical: 90 }
    };
  }

  /**
   * Get default monitoring configuration
   */
  private getDefaultMonitoringConfig(): any {
    return {
      healthChecks: { enabled: true },
      metrics: { enabled: true },
      alerting: { enabled: true },
      dashboard: { enabled: true }
    };
  }

  /**
   * Get health check configuration
   */
  getConfig(): HealthCheckConfig {
    return { ...this.config };
  }

  /**
   * Get thresholds configuration
   */
  getThresholds(): HealthThresholds {
    return { ...this.thresholds };
  }

  /**
   * Get component states
   */
  getComponentStates(): Map<string, ComponentHealth> {
    return new Map(this.componentStates);
  }

  /**
   * Get health history for a component
   */
  getHealthHistory(component: string): HealthCheck[] {
    return this.healthHistory.get(component) || [];
  }

  /**
   * Get alert history for a component
   */
  getAlertHistory(component: string): HealthAlert[] {
    return this.alertHistory.get(component) || [];
  }
}