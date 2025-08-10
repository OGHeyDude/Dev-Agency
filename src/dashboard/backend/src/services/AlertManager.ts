/**
 * Alert Manager - Comprehensive alerting and escalation system
 * 
 * @file AlertManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as cron from 'node-cron';
import {
  RealTimeAlert,
  AlertThresholds,
  AlertEscalationRule,
  ThresholdBreach,
  NotificationAttempt,
  IncidentTimelineEntry,
  RecoveryAttempt,
  AgentHealthStatus,
  SystemHealthSummary
} from '../models/RealTimeHealthStatus';
import { HealthLevel, ComponentType } from '../../../health/models/HealthStatus';

export interface AlertManagerConfig {
  thresholds: AlertThresholds;
  escalationRules: AlertEscalationRule[];
  enableAutoResolution: boolean;
  autoResolutionTimeout: number; // minutes
  suppressDuplicates: boolean;
  duplicateWindow: number; // seconds
  maxActiveAlerts: number;
  notificationRetryAttempts: number;
  notificationRetryDelay: number; // seconds
}

export interface NotificationChannel {
  name: string;
  type: 'slack' | 'email' | 'webhook' | 'teams';
  config: any;
  enabled: boolean;
  priority: number;
}

export class AlertManager extends EventEmitter {
  private config: AlertManagerConfig;
  private activeAlerts: Map<string, RealTimeAlert> = new Map();
  private resolvedAlerts: Map<string, RealTimeAlert> = new Map();
  private alertHistory: RealTimeAlert[] = [];
  private thresholdBreaches: Map<string, ThresholdBreach> = new Map();
  private incidentTimeline: IncidentTimelineEntry[] = [];
  private notificationChannels: Map<string, NotificationChannel> = new Map();
  
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  private healthCheckTimer?: NodeJS.Timeout;
  
  private isRunning = false;
  private alertCounter = 0;

  constructor(config: Partial<AlertManagerConfig>) {
    super();
    
    this.config = {
      thresholds: {
        critical: {
          responseTime: 10000,
          errorRate: 15,
          memoryUsage: 80,
          agentFailures: 3,
          cpuUsage: 90,
          diskUsage: 95
        },
        warning: {
          responseTime: 5000,
          errorRate: 5,
          memoryUsage: 60,
          agentFailures: 1,
          cpuUsage: 70,
          diskUsage: 85
        },
        recovery: {
          confirmationTime: 120,
          successRateRequired: 90,
          healthScoreRequired: 80
        }
      },
      escalationRules: [
        {
          severity: 'warning',
          initialDelay: 300,
          repeatInterval: 1800,
          maxRepeats: 5,
          channels: ['slack'],
          escalationChain: ['team-lead']
        },
        {
          severity: 'critical',
          initialDelay: 60,
          repeatInterval: 300,
          maxRepeats: 10,
          channels: ['slack', 'email'],
          escalationChain: ['team-lead', 'manager', 'on-call']
        }
      ],
      enableAutoResolution: true,
      autoResolutionTimeout: 30,
      suppressDuplicates: true,
      duplicateWindow: 300,
      maxActiveAlerts: 1000,
      notificationRetryAttempts: 3,
      notificationRetryDelay: 30,
      ...config
    };
  }

  /**
   * Start the alert manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startCleanupTimer();
    this.startHealthCheckTimer();
    
    this.emit('alertManager:started');
    console.log('Alert Manager started');
  }

  /**
   * Stop the alert manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    // Clear all timers
    this.escalationTimers.forEach(timer => clearTimeout(timer));
    this.escalationTimers.clear();
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    this.emit('alertManager:stopped');
    console.log('Alert Manager stopped');
  }

  /**
   * Add notification channel
   */
  addNotificationChannel(channel: NotificationChannel): void {
    this.notificationChannels.set(channel.name, channel);
    this.emit('notificationChannel:added', channel);
  }

  /**
   * Remove notification channel
   */
  removeNotificationChannel(name: string): void {
    this.notificationChannels.delete(name);
    this.emit('notificationChannel:removed', { name });
  }

  /**
   * Evaluate agent health and trigger alerts if needed
   */
  evaluateAgentHealth(agentHealth: AgentHealthStatus): void {
    const component = agentHealth.agentId;
    const alerts: RealTimeAlert[] = [];

    // Check response time threshold
    if (agentHealth.performanceMetrics.avgResponseTime > this.config.thresholds.critical.responseTime) {
      alerts.push(this.createAlert({
        type: 'performance',
        severity: 'critical',
        component,
        title: 'Critical Response Time',
        message: `Agent ${component} response time is ${agentHealth.performanceMetrics.avgResponseTime}ms (threshold: ${this.config.thresholds.critical.responseTime}ms)`,
        metadata: { responseTime: agentHealth.performanceMetrics.avgResponseTime }
      }));
    } else if (agentHealth.performanceMetrics.avgResponseTime > this.config.thresholds.warning.responseTime) {
      alerts.push(this.createAlert({
        type: 'performance',
        severity: 'warning',
        component,
        title: 'High Response Time',
        message: `Agent ${component} response time is ${agentHealth.performanceMetrics.avgResponseTime}ms (threshold: ${this.config.thresholds.warning.responseTime}ms)`,
        metadata: { responseTime: agentHealth.performanceMetrics.avgResponseTime }
      }));
    }

    // Check error rate threshold
    if (agentHealth.performanceMetrics.errorRate > this.config.thresholds.critical.errorRate) {
      alerts.push(this.createAlert({
        type: 'agent',
        severity: 'critical',
        component,
        title: 'Critical Error Rate',
        message: `Agent ${component} error rate is ${agentHealth.performanceMetrics.errorRate}% (threshold: ${this.config.thresholds.critical.errorRate}%)`,
        metadata: { errorRate: agentHealth.performanceMetrics.errorRate }
      }));
    } else if (agentHealth.performanceMetrics.errorRate > this.config.thresholds.warning.errorRate) {
      alerts.push(this.createAlert({
        type: 'agent',
        severity: 'warning',
        component,
        title: 'High Error Rate',
        message: `Agent ${component} error rate is ${agentHealth.performanceMetrics.errorRate}% (threshold: ${this.config.thresholds.warning.errorRate}%)`,
        metadata: { errorRate: agentHealth.performanceMetrics.errorRate }
      }));
    }

    // Check agent status
    if (agentHealth.status === 'failed') {
      alerts.push(this.createAlert({
        type: 'agent',
        severity: 'critical',
        component,
        title: 'Agent Failed',
        message: `Agent ${component} has failed and is not responding`,
        metadata: { status: agentHealth.status }
      }));
    } else if (agentHealth.status === 'blocked') {
      alerts.push(this.createAlert({
        type: 'agent',
        severity: 'warning',
        component,
        title: 'Agent Blocked',
        message: `Agent ${component} is blocked and cannot process requests`,
        metadata: { status: agentHealth.status }
      }));
    }

    // Check memory usage
    if (agentHealth.resourceUsage.memoryMB > 0) {
      const memoryUsagePercent = (agentHealth.resourceUsage.memoryMB / (1024 * 8)) * 100; // Assume 8GB limit
      
      if (memoryUsagePercent > this.config.thresholds.critical.memoryUsage) {
        alerts.push(this.createAlert({
          type: 'resource',
          severity: 'critical',
          component,
          title: 'Critical Memory Usage',
          message: `Agent ${component} memory usage is ${memoryUsagePercent.toFixed(1)}% (${agentHealth.resourceUsage.memoryMB}MB)`,
          metadata: { memoryUsage: memoryUsagePercent, memoryMB: agentHealth.resourceUsage.memoryMB }
        }));
      } else if (memoryUsagePercent > this.config.thresholds.warning.memoryUsage) {
        alerts.push(this.createAlert({
          type: 'resource',
          severity: 'warning',
          component,
          title: 'High Memory Usage',
          message: `Agent ${component} memory usage is ${memoryUsagePercent.toFixed(1)}% (${agentHealth.resourceUsage.memoryMB}MB)`,
          metadata: { memoryUsage: memoryUsagePercent, memoryMB: agentHealth.resourceUsage.memoryMB }
        }));
      }
    }

    // Check health score
    if (agentHealth.healthScore < 50) {
      alerts.push(this.createAlert({
        type: 'health',
        severity: 'critical',
        component,
        title: 'Poor Health Score',
        message: `Agent ${component} health score is ${agentHealth.healthScore}/100`,
        metadata: { healthScore: agentHealth.healthScore }
      }));
    } else if (agentHealth.healthScore < 70) {
      alerts.push(this.createAlert({
        type: 'health',
        severity: 'warning',
        component,
        title: 'Degraded Health Score',
        message: `Agent ${component} health score is ${agentHealth.healthScore}/100`,
        metadata: { healthScore: agentHealth.healthScore }
      }));
    }

    // Process alerts
    alerts.forEach(alert => this.processAlert(alert));
  }

  /**
   * Evaluate system health and trigger alerts if needed
   */
  evaluateSystemHealth(systemHealth: SystemHealthSummary): void {
    const alerts: RealTimeAlert[] = [];

    // Check overall system status
    if (systemHealth.overall === HealthLevel.CRITICAL) {
      alerts.push(this.createAlert({
        type: 'system',
        severity: 'critical',
        component: 'system',
        title: 'Critical System Status',
        message: `System health is critical with ${systemHealth.alertCount.critical} critical alerts`,
        metadata: { systemHealth }
      }));
    } else if (systemHealth.overall === HealthLevel.UNHEALTHY) {
      alerts.push(this.createAlert({
        type: 'system',
        severity: 'warning',
        component: 'system',
        title: 'System Health Degraded',
        message: `System health is degraded with ${systemHealth.alertCount.warning} warnings`,
        metadata: { systemHealth }
      }));
    }

    // Check resource thresholds
    Object.entries(systemHealth.resourceStatus).forEach(([resource, status]) => {
      if (status.usage > this.getResourceThreshold(resource, 'critical')) {
        alerts.push(this.createAlert({
          type: 'resource',
          severity: 'critical',
          component: `system-${resource}`,
          title: `Critical ${resource.toUpperCase()} Usage`,
          message: `System ${resource} usage is ${status.usage.toFixed(1)}% (threshold: ${this.getResourceThreshold(resource, 'critical')}%)`,
          metadata: { resource, usage: status.usage }
        }));
      } else if (status.usage > this.getResourceThreshold(resource, 'warning')) {
        alerts.push(this.createAlert({
          type: 'resource',
          severity: 'warning',
          component: `system-${resource}`,
          title: `High ${resource.toUpperCase()} Usage`,
          message: `System ${resource} usage is ${status.usage.toFixed(1)}% (threshold: ${this.getResourceThreshold(resource, 'warning')}%)`,
          metadata: { resource, usage: status.usage }
        }));
      }
    });

    // Check failed agents
    if (systemHealth.agentCount.failed > this.config.thresholds.critical.agentFailures) {
      alerts.push(this.createAlert({
        type: 'agent',
        severity: 'critical',
        component: 'agents',
        title: 'Multiple Agent Failures',
        message: `${systemHealth.agentCount.failed} agents have failed (threshold: ${this.config.thresholds.critical.agentFailures})`,
        metadata: { failedAgents: systemHealth.agentCount.failed }
      }));
    } else if (systemHealth.agentCount.failed > this.config.thresholds.warning.agentFailures) {
      alerts.push(this.createAlert({
        type: 'agent',
        severity: 'warning',
        component: 'agents',
        title: 'Agent Failures Detected',
        message: `${systemHealth.agentCount.failed} agents have failed (threshold: ${this.config.thresholds.warning.agentFailures})`,
        metadata: { failedAgents: systemHealth.agentCount.failed }
      }));
    }

    // Process alerts
    alerts.forEach(alert => this.processAlert(alert));
  }

  /**
   * Create a new alert
   */
  private createAlert(params: {
    type: RealTimeAlert['type'];
    severity: RealTimeAlert['severity'];
    component: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): RealTimeAlert {
    const alertId = `alert-${++this.alertCounter}-${Date.now()}`;
    
    return {
      id: alertId,
      type: params.type,
      severity: params.severity,
      title: params.title,
      message: params.message,
      component: params.component,
      componentType: this.getComponentType(params.component),
      timestamp: new Date().toISOString(),
      resolved: false,
      escalationLevel: 0,
      notifications: [],
      tags: [params.type, params.severity, params.component],
      metadata: params.metadata
    };
  }

  /**
   * Process a new alert
   */
  private processAlert(alert: RealTimeAlert): void {
    // Check for duplicates
    if (this.config.suppressDuplicates && this.isDuplicateAlert(alert)) {
      console.log(`Suppressing duplicate alert: ${alert.id}`);
      return;
    }

    // Check if we've reached the max active alerts limit
    if (this.activeAlerts.size >= this.config.maxActiveAlerts) {
      console.warn(`Max active alerts reached (${this.config.maxActiveAlerts}), dropping alert: ${alert.id}`);
      return;
    }

    // Add to active alerts
    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Add to incident timeline
    this.addToIncidentTimeline({
      id: `timeline-${Date.now()}`,
      timestamp: alert.timestamp,
      type: 'alert',
      component: alert.component,
      severity: alert.severity === 'critical' ? 'critical' : 'warning',
      title: alert.title,
      description: alert.message,
      metadata: { alertId: alert.id }
    });

    // Schedule escalation
    this.scheduleEscalation(alert);

    // Send initial notification
    this.sendNotification(alert);

    // Emit event
    this.emit('alert:triggered', alert);

    console.log(`Alert triggered: ${alert.severity.toUpperCase()} - ${alert.title} (${alert.component})`);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      console.warn(`Attempted to resolve non-existent alert: ${alertId}`);
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    // Clear escalation timer
    const escalationTimer = this.escalationTimers.get(alertId);
    if (escalationTimer) {
      clearTimeout(escalationTimer);
      this.escalationTimers.delete(alertId);
    }

    // Move to resolved alerts
    this.activeAlerts.delete(alertId);
    this.resolvedAlerts.set(alertId, alert);

    // Add to incident timeline
    this.addToIncidentTimeline({
      id: `timeline-${Date.now()}`,
      timestamp: alert.resolvedAt,
      type: 'resolution',
      component: alert.component,
      severity: 'info',
      title: 'Alert Resolved',
      description: `Alert "${alert.title}" has been resolved`,
      userId: resolvedBy,
      metadata: { alertId: alert.id }
    });

    // Send resolution notification
    this.sendResolutionNotification(alert);

    // Emit event
    this.emit('alert:resolved', alert);

    console.log(`Alert resolved: ${alert.title} (${alert.component})`);
    return true;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      console.warn(`Attempted to acknowledge non-existent alert: ${alertId}`);
      return false;
    }

    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();

    // Add to incident timeline
    this.addToIncidentTimeline({
      id: `timeline-${Date.now()}`,
      timestamp: alert.acknowledgedAt,
      type: 'acknowledgment',
      component: alert.component,
      severity: 'info',
      title: 'Alert Acknowledged',
      description: `Alert "${alert.title}" acknowledged by ${acknowledgedBy}`,
      userId: acknowledgedBy,
      metadata: { alertId: alert.id }
    });

    this.emit('alert:acknowledged', { alert, acknowledgedBy });

    console.log(`Alert acknowledged: ${alert.title} by ${acknowledgedBy}`);
    return true;
  }

  /**
   * Check if alert is a duplicate
   */
  private isDuplicateAlert(alert: RealTimeAlert): boolean {
    const cutoffTime = new Date();
    cutoffTime.setSeconds(cutoffTime.getSeconds() - this.config.duplicateWindow);

    return Array.from(this.activeAlerts.values()).some(existingAlert =>
      existingAlert.component === alert.component &&
      existingAlert.type === alert.type &&
      existingAlert.severity === alert.severity &&
      existingAlert.title === alert.title &&
      new Date(existingAlert.timestamp) > cutoffTime
    );
  }

  /**
   * Schedule alert escalation
   */
  private scheduleEscalation(alert: RealTimeAlert): void {
    const rule = this.config.escalationRules.find(r => r.severity === alert.severity);
    if (!rule) {
      return;
    }

    const scheduleNext = (delay: number, level: number) => {
      if (level > rule.maxRepeats) {
        return;
      }

      const timer = setTimeout(() => {
        const currentAlert = this.activeAlerts.get(alert.id);
        if (!currentAlert || currentAlert.resolved) {
          return;
        }

        this.escalateAlert(currentAlert, level);
        
        // Schedule next escalation
        scheduleNext(rule.repeatInterval * 1000, level + 1);
      }, delay);

      this.escalationTimers.set(alert.id, timer);
    };

    scheduleNext(rule.initialDelay * 1000, 1);
  }

  /**
   * Escalate an alert
   */
  private escalateAlert(alert: RealTimeAlert, level: number): void {
    alert.escalationLevel = level;

    this.addToIncidentTimeline({
      id: `timeline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'escalation',
      component: alert.component,
      severity: alert.severity === 'critical' ? 'critical' : 'warning',
      title: `Alert Escalated (Level ${level})`,
      description: `Alert "${alert.title}" escalated to level ${level}`,
      metadata: { alertId: alert.id, escalationLevel: level }
    });

    // Send escalation notification
    this.sendNotification(alert);

    this.emit('alert:escalated', { alert, level });
    console.log(`Alert escalated to level ${level}: ${alert.title}`);
  }

  /**
   * Send notification for alert
   */
  private async sendNotification(alert: RealTimeAlert): Promise<void> {
    const rule = this.config.escalationRules.find(r => r.severity === alert.severity);
    if (!rule) {
      return;
    }

    const channels = rule.channels.map(name => this.notificationChannels.get(name)).filter(Boolean);
    
    for (const channel of channels) {
      if (!channel || !channel.enabled) {
        continue;
      }

      const attempt: NotificationAttempt = {
        channel: channel.type,
        timestamp: new Date().toISOString(),
        success: false
      };

      try {
        const startTime = Date.now();
        await this.sendToChannel(channel, alert);
        attempt.success = true;
        attempt.responseTime = Date.now() - startTime;
        
        console.log(`Notification sent successfully to ${channel.name} for alert ${alert.id}`);
      } catch (error) {
        attempt.error = error instanceof Error ? error.message : String(error);
        console.error(`Failed to send notification to ${channel.name} for alert ${alert.id}:`, error);
      }

      alert.notifications.push(attempt);
    }
  }

  /**
   * Send resolution notification
   */
  private async sendResolutionNotification(alert: RealTimeAlert): Promise<void> {
    // Implementation would send resolution notification to appropriate channels
    console.log(`Would send resolution notification for alert ${alert.id}`);
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(channel: NotificationChannel, alert: RealTimeAlert): Promise<void> {
    // This would implement actual notification sending logic for different channel types
    // For now, just simulate the call
    
    switch (channel.type) {
      case 'slack':
        // Implement Slack notification
        break;
      case 'email':
        // Implement email notification
        break;
      case 'webhook':
        // Implement webhook notification
        break;
      case 'teams':
        // Implement Teams notification
        break;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Add entry to incident timeline
   */
  private addToIncidentTimeline(entry: IncidentTimelineEntry): void {
    this.incidentTimeline.push(entry);
    
    // Keep only last 10000 entries
    if (this.incidentTimeline.length > 10000) {
      this.incidentTimeline.splice(0, this.incidentTimeline.length - 10000);
    }

    this.emit('incident:timeline-update', entry);
  }

  /**
   * Get component type from component name
   */
  private getComponentType(component: string): ComponentType {
    if (component === 'system' || component.startsWith('system-')) {
      return ComponentType.SYSTEM;
    } else if (component === 'agents' || component.includes('agent')) {
      return ComponentType.AGENT;
    } else {
      return ComponentType.DEPENDENCY;
    }
  }

  /**
   * Get resource threshold
   */
  private getResourceThreshold(resource: string, level: 'warning' | 'critical'): number {
    switch (resource) {
      case 'cpu':
        return this.config.thresholds[level].cpuUsage;
      case 'memory':
        return this.config.thresholds[level].memoryUsage;
      case 'disk':
        return this.config.thresholds[level].diskUsage;
      default:
        return level === 'critical' ? 90 : 70;
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldAlerts();
    }, 3600000); // Every hour
  }

  /**
   * Start health check timer
   */
  private startHealthCheckTimer(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, 300000); // Every 5 minutes
  }

  /**
   * Cleanup old resolved alerts
   */
  private cleanupOldAlerts(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24); // Keep 24 hours

    const beforeCount = this.resolvedAlerts.size;
    
    this.resolvedAlerts.forEach((alert, id) => {
      if (new Date(alert.timestamp) < cutoffTime) {
        this.resolvedAlerts.delete(id);
      }
    });

    const removedCount = beforeCount - this.resolvedAlerts.size;
    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old resolved alerts`);
    }
  }

  /**
   * Perform health check on alert manager itself
   */
  private performHealthCheck(): void {
    const stats = this.getStats();
    
    if (stats.activeAlerts > this.config.maxActiveAlerts * 0.8) {
      console.warn(`Alert manager approaching capacity: ${stats.activeAlerts}/${this.config.maxActiveAlerts} alerts`);
    }

    this.emit('alertManager:health-check', stats);
  }

  /**
   * Get alert manager statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      activeAlerts: this.activeAlerts.size,
      resolvedAlerts: this.resolvedAlerts.size,
      totalAlertsProcessed: this.alertCounter,
      escalationTimers: this.escalationTimers.size,
      notificationChannels: this.notificationChannels.size,
      incidentTimelineEntries: this.incidentTimeline.length
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): RealTimeAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get resolved alerts
   */
  getResolvedAlerts(): RealTimeAlert[] {
    return Array.from(this.resolvedAlerts.values());
  }

  /**
   * Get incident timeline
   */
  getIncidentTimeline(limit?: number): IncidentTimelineEntry[] {
    const timeline = [...this.incidentTimeline].reverse(); // Most recent first
    return limit ? timeline.slice(0, limit) : timeline;
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): RealTimeAlert | undefined {
    return this.activeAlerts.get(alertId) || this.resolvedAlerts.get(alertId);
  }
}