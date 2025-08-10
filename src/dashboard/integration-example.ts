/**
 * Integration Example - How to integrate the Health Monitoring Dashboard
 * 
 * @file integration-example.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { HealthMonitoringDashboard } from './index';
import { HealthCheckManager } from '../health/HealthCheckManager';
import { NotificationManager } from '../notifications/NotificationManager';

/**
 * Example integration with existing Dev-Agency health infrastructure
 */
async function integrateHealthDashboard() {
  // Initialize existing health check manager
  const healthCheckManager = new HealthCheckManager({
    config: {
      interval: 30000,
      timeout: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      thresholdsPath: './health/config/health-thresholds.json',
      monitoringConfigPath: './health/config/monitoring-config.json',
      alertingEnabled: true,
      metricsEnabled: true,
      storageEnabled: true
    }
  });

  // Initialize notification manager for alerts
  const notificationManager = new NotificationManager();

  // Create and configure the health monitoring dashboard
  const dashboard = new HealthMonitoringDashboard({
    port: 3002,
    healthCheckManager,
    notificationManager,
    enableWebSocket: true,
    enableServerSentEvents: true,
    enableRedis: true,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    corsOrigins: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com', 'https://dashboard.your-domain.com']
      : ['http://localhost:3000', 'http://127.0.0.1:3000']
  });

  // Start the health check manager first
  await healthCheckManager.start();
  console.log('Health Check Manager started');

  // Then start the dashboard
  await dashboard.start();
  console.log('Health Monitoring Dashboard started');

  // Log dashboard statistics
  const stats = dashboard.getStats();
  console.log('Dashboard Statistics:', {
    isRunning: stats.isRunning,
    port: stats.config.port,
    webSocketEnabled: stats.config.webSocketEnabled,
    redisEnabled: stats.config.redisEnabled,
    uptime: stats.uptime
  });

  // Setup graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await dashboard.stop();
    await healthCheckManager.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await dashboard.stop();
    await healthCheckManager.stop();
    process.exit(0);
  });

  return { dashboard, healthCheckManager };
}

/**
 * Standalone dashboard example (without existing health infrastructure)
 */
async function standaloneHealthDashboard() {
  // Create dashboard without external dependencies
  const dashboard = new HealthMonitoringDashboard({
    port: 3002,
    enableWebSocket: true,
    enableServerSentEvents: true,
    enableRedis: false, // Disable Redis for simplicity
    corsOrigins: ['*'] // Allow all origins for development
  });

  await dashboard.start();
  console.log('Standalone Health Monitoring Dashboard started on port 3002');

  return dashboard;
}

/**
 * Production deployment example
 */
async function productionHealthDashboard() {
  // Production configuration with all features enabled
  const healthCheckManager = new HealthCheckManager({
    config: {
      interval: 15000, // More frequent checks in production
      timeout: 3000,
      retryAttempts: 5,
      retryDelay: 2000,
      alertingEnabled: true,
      metricsEnabled: true,
      storageEnabled: true
    }
  });

  const notificationManager = new NotificationManager();

  const dashboard = new HealthMonitoringDashboard({
    port: parseInt(process.env.DASHBOARD_PORT || '3002'),
    healthCheckManager,
    notificationManager,
    enableWebSocket: true,
    enableServerSentEvents: true,
    enableRedis: true,
    redisUrl: process.env.REDIS_URL || 'redis://redis-cluster:6379',
    corsOrigins: [
      process.env.FRONTEND_URL || 'https://dashboard.your-domain.com',
      process.env.API_DOMAIN || 'https://api.your-domain.com'
    ]
  });

  // Start services
  await healthCheckManager.start();
  await dashboard.start();

  // Log production startup
  console.log('Production Health Monitoring Dashboard started:', {
    port: process.env.DASHBOARD_PORT || 3002,
    environment: process.env.NODE_ENV,
    redisEnabled: true,
    corsOrigins: dashboard.getStats().config
  });

  // Setup monitoring and alerting
  setInterval(() => {
    const stats = dashboard.getStats();
    if (!stats.isRunning) {
      console.error('Dashboard is not running! Attempting restart...');
      // Implement restart logic or alert operations team
    }
  }, 60000); // Check every minute

  return { dashboard, healthCheckManager };
}

// Export examples for different use cases
export {
  integrateHealthDashboard,
  standaloneHealthDashboard,
  productionHealthDashboard
};

// If this file is run directly, start the integrated dashboard
if (require.main === module) {
  integrateHealthDashboard().catch((error) => {
    console.error('Failed to start Health Monitoring Dashboard:', error);
    process.exit(1);
  });
}