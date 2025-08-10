/**
 * Health Dashboard Backend - Main entry point
 * 
 * @file index.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import { HealthDashboardController } from './controllers/HealthDashboardController';
import { HealthCheckManager } from '../../health/HealthCheckManager';
import { NotificationManager } from '../../notifications/NotificationManager';
import { DashboardConfiguration } from './models/RealTimeHealthStatus';

// Load configuration
const configPath = path.join(__dirname, 'config', 'dashboard-config.json');
let config: any;

try {
  config = fs.readJsonSync(configPath);
} catch (error) {
  console.error('Failed to load dashboard configuration:', error);
  process.exit(1);
}

// Create dashboard configuration
const dashboardConfig: DashboardConfiguration = {
  refreshInterval: config.dashboard.refreshInterval,
  alertThresholds: config.dashboard.alertThresholds,
  escalationRules: config.dashboard.escalationRules,
  notificationChannels: config.dashboard.notificationChannels,
  ui: config.dashboard.ui
};

// Initialize external services
let healthCheckManager: HealthCheckManager | undefined;
let notificationManager: NotificationManager | undefined;

try {
  // Initialize HealthCheckManager with existing health infrastructure
  healthCheckManager = new HealthCheckManager({
    config: {
      interval: config.healthCollection.interval,
      timeout: config.healthCollection.timeout,
      retryAttempts: 3,
      retryDelay: 1000,
      thresholdsPath: path.join(__dirname, '../../health/config/health-thresholds.json'),
      monitoringConfigPath: path.join(__dirname, '../../health/config/monitoring-config.json'),
      alertingEnabled: config.alerting.enabled,
      metricsEnabled: true,
      storageEnabled: config.healthCollection.cache.enabled
    }
  });

  // Initialize NotificationManager if notification channels are configured
  if (Object.values(config.dashboard.notificationChannels).some((channel: any) => channel.enabled)) {
    notificationManager = new NotificationManager();
  }
} catch (error) {
  console.warn('External services not available, running in standalone mode:', error);
}

// Initialize dashboard controller
const dashboardController = new HealthDashboardController(
  {
    port: config.server.port,
    redis: config.redis.enabled ? {
      url: config.redis.url,
      keyPrefix: config.redis.keyPrefix
    } : undefined,
    dashboard: dashboardConfig,
    enableWebSocket: config.websocket.enabled,
    enableServerSentEvents: config.serverSentEvents.enabled,
    corsOrigins: config.server.cors.origins,
    rateLimit: config.server.rateLimit
  },
  healthCheckManager,
  notificationManager
);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal, shutting down gracefully...');
  try {
    await dashboardController.stop();
    if (healthCheckManager) {
      await healthCheckManager.stop();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT signal, shutting down gracefully...');
  try {
    await dashboardController.stop();
    if (healthCheckManager) {
      await healthCheckManager.stop();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Unhandled error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process for unhandled rejections in production
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Exit the process for uncaught exceptions
  process.exit(1);
});

// Start the dashboard
async function startDashboard(): Promise<void> {
  try {
    console.log('Starting Health Monitoring Dashboard...');
    
    // Start external services first
    if (healthCheckManager) {
      await healthCheckManager.start();
      console.log('Health Check Manager started');
    }

    // Start dashboard controller
    await dashboardController.start();
    
    // Log startup information
    const stats = dashboardController.getStats();
    console.log('Health Monitoring Dashboard started successfully!');
    console.log(`- Port: ${config.server.port}`);
    console.log(`- WebSocket: ${stats.config.webSocketEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`- Server-Sent Events: ${stats.config.sseEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`- Redis: ${stats.config.redisEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`- External Health Manager: ${healthCheckManager ? 'Connected' : 'Standalone'}`);
    console.log(`- Notification Manager: ${notificationManager ? 'Connected' : 'Disabled'}`);
    
    // Set up periodic health checks
    setInterval(() => {
      const currentStats = dashboardController.getStats();
      if (!currentStats.isRunning) {
        console.error('Dashboard controller is not running! Attempting restart...');
        restartDashboard();
      }
    }, 60000); // Check every minute

  } catch (error) {
    console.error('Failed to start Health Monitoring Dashboard:', error);
    process.exit(1);
  }
}

// Restart dashboard in case of failure
async function restartDashboard(): Promise<void> {
  try {
    console.log('Restarting dashboard controller...');
    await dashboardController.stop();
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    await dashboardController.start();
    console.log('Dashboard controller restarted successfully');
  } catch (error) {
    console.error('Failed to restart dashboard controller:', error);
    process.exit(1);
  }
}

// Export for external use
export { dashboardController, healthCheckManager, notificationManager };
export * from './models/RealTimeHealthStatus';
export * from './services/WebSocketServer';
export * from './services/AlertManager';
export * from './services/HealthCollector';
export * from './controllers/HealthDashboardController';

// Start the dashboard if this file is run directly
if (require.main === module) {
  startDashboard().catch((error) => {
    console.error('Failed to start dashboard:', error);
    process.exit(1);
  });
}