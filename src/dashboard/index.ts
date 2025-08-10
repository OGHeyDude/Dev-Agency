/**
 * Dashboard Integration - Main entry point for real-time health monitoring dashboard
 * 
 * @file index.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as path from 'path';
import { HealthDashboardController } from './backend/src/controllers/HealthDashboardController';
import { HealthCheckManager } from '../health/HealthCheckManager';
import { NotificationManager } from '../notifications/NotificationManager';
import { DashboardConfiguration } from './backend/src/models/RealTimeHealthStatus';

export interface DashboardIntegrationConfig {
  port?: number;
  healthCheckManager?: HealthCheckManager;
  notificationManager?: NotificationManager;
  enableWebSocket?: boolean;
  enableServerSentEvents?: boolean;
  enableRedis?: boolean;
  redisUrl?: string;
  corsOrigins?: string[];
}

export class HealthMonitoringDashboard {
  private controller: HealthDashboardController;
  private isRunning = false;

  constructor(config: DashboardIntegrationConfig = {}) {
    // Default dashboard configuration
    const dashboardConfig: DashboardConfiguration = {
      refreshInterval: 5000,
      alertThresholds: {
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
      notificationChannels: {
        slack: { enabled: false, webhook: '', channel: '#alerts' },
        email: { enabled: false, smtp: {}, recipients: [] },
        teams: { enabled: false, webhook: '' }
      },
      ui: {
        autoRefresh: true,
        soundAlerts: true,
        browserNotifications: true,
        theme: 'auto'
      }
    };

    // Initialize the dashboard controller
    this.controller = new HealthDashboardController(
      {
        port: config.port || 3002,
        redis: config.enableRedis ? {
          url: config.redisUrl || 'redis://localhost:6379',
          keyPrefix: 'health-dashboard:'
        } : undefined,
        dashboard: dashboardConfig,
        enableWebSocket: config.enableWebSocket !== false,
        enableServerSentEvents: config.enableServerSentEvents !== false,
        corsOrigins: config.corsOrigins || ['*'],
        rateLimit: {
          windowMs: 60000,
          max: 1000
        }
      },
      config.healthCheckManager,
      config.notificationManager
    );
  }

  /**
   * Start the health monitoring dashboard
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    await this.controller.start();
    this.isRunning = true;

    console.log('Health Monitoring Dashboard is now running!');
  }

  /**
   * Stop the health monitoring dashboard
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    await this.controller.stop();
    this.isRunning = false;

    console.log('Health Monitoring Dashboard stopped');
  }

  /**
   * Get dashboard statistics
   */
  getStats() {
    return this.controller.getStats();
  }

  /**
   * Check if dashboard is running
   */
  isRunning(): boolean {
    return this.isRunning;
  }
}

// Export main components for external use
export * from './backend/src/models/RealTimeHealthStatus';
export * from './backend/src/services/WebSocketServer';
export * from './backend/src/services/AlertManager';
export * from './backend/src/services/HealthCollector';
export * from './backend/src/controllers/HealthDashboardController';

// Create a convenient factory function
export function createHealthMonitoringDashboard(config: DashboardIntegrationConfig = {}) {
  return new HealthMonitoringDashboard(config);
}

// Default export for easy import
export default HealthMonitoringDashboard;