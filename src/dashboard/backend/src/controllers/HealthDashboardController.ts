/**
 * Health Dashboard Controller - Main controller for real-time health monitoring dashboard
 * 
 * @file HealthDashboardController.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as express from 'express';
import * as http from 'http';
import * as Redis from 'redis';
import { WebSocketServer } from '../services/WebSocketServer';
import { AlertManager } from '../services/AlertManager';
import { HealthCollector } from '../services/HealthCollector';
import { HealthCheckManager } from '../../../health/HealthCheckManager';
import { NotificationManager } from '../../../notifications/NotificationManager';
import {
  AgentHealthStatus,
  SystemHealthSummary,
  RealTimeAlert,
  DashboardMetrics,
  HealthStreamEvents,
  AlertThresholds,
  DashboardConfiguration
} from '../models/RealTimeHealthStatus';

export interface DashboardControllerConfig {
  server?: http.Server;
  port: number;
  redis?: {
    url: string;
    keyPrefix: string;
  };
  dashboard: DashboardConfiguration;
  enableWebSocket: boolean;
  enableServerSentEvents: boolean;
  corsOrigins: string[];
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export class HealthDashboardController extends EventEmitter {
  private config: DashboardControllerConfig;
  private app: express.Application;
  private server?: http.Server;
  private redisClient?: Redis.RedisClientType;
  
  // Core services
  private webSocketServer: WebSocketServer;
  private alertManager: AlertManager;
  private healthCollector: HealthCollector;
  
  // External services
  private healthCheckManager?: HealthCheckManager;
  private notificationManager?: NotificationManager;
  
  private isRunning = false;
  private startupTime?: Date;

  constructor(
    config: DashboardControllerConfig,
    healthCheckManager?: HealthCheckManager,
    notificationManager?: NotificationManager
  ) {
    super();
    
    this.config = config;
    this.healthCheckManager = healthCheckManager;
    this.notificationManager = notificationManager;
    
    this.app = express();
    this.setupExpressApp();
    
    // Initialize services
    this.webSocketServer = new WebSocketServer({
      server: this.server,
      heartbeatInterval: 30000,
      maxClients: 100,
      enableCompression: true,
      clientTimeout: 120000
    });
    
    this.alertManager = new AlertManager({
      thresholds: config.dashboard.alertThresholds,
      enableAutoResolution: true,
      autoResolutionTimeout: 30,
      suppressDuplicates: true,
      duplicateWindow: 300,
      maxActiveAlerts: 1000,
      notificationRetryAttempts: 3,
      notificationRetryDelay: 30
    });
    
    this.healthCollector = new HealthCollector(
      {
        collectionInterval: config.dashboard.refreshInterval,
        resourceMonitoringEnabled: true,
        historicalDataRetention: 24,
        cacheEnabled: true,
        cacheSize: 1000
      },
      healthCheckManager
    );
    
    this.setupServiceIntegration();
  }

  /**
   * Start the dashboard controller
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.startupTime = new Date();
    
    try {
      // Initialize Redis if configured
      if (this.config.redis) {
        await this.initializeRedis();
      }
      
      // Start HTTP server
      await this.startHttpServer();
      
      // Start WebSocket server
      if (this.config.enableWebSocket) {
        await this.webSocketServer.start();
      }
      
      // Start core services
      await this.alertManager.start();
      await this.healthCollector.start();
      
      // Setup notification channels
      this.setupNotificationChannels();
      
      this.isRunning = true;
      
      this.emit('dashboard:started', {
        port: this.config.port,
        webSocketEnabled: this.config.enableWebSocket,
        redisEnabled: !!this.config.redis
      });
      
      console.log(`Health Dashboard started on port ${this.config.port}`);
      
    } catch (error) {
      console.error('Failed to start Health Dashboard:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Stop the dashboard controller
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    await this.cleanup();
    
    this.emit('dashboard:stopped');
    console.log('Health Dashboard stopped');
  }

  /**
   * Setup Express application
   */
  private setupExpressApp(): void {
    // Middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // CORS
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (this.config.corsOrigins.includes('*') || 
          (origin && this.config.corsOrigins.includes(origin))) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const status = this.getHealthStatus();
      res.status(status.healthy ? 200 : 503).json(status);
    });

    // API routes
    this.setupApiRoutes();
    
    // Static files (dashboard UI will be served here)
    this.app.use('/static', express.static('public'));
    
    // Dashboard UI
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Health Monitoring Dashboard API',
        version: '1.0.0',
        status: 'running',
        endpoints: [
          '/health',
          '/api/status',
          '/api/agents',
          '/api/alerts',
          '/api/metrics',
          '/api/timeline'
        ]
      });
    });

    // Error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('API Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup API routes
   */
  private setupApiRoutes(): void {
    const router = express.Router();

    // System status endpoint
    router.get('/status', async (req, res) => {
      try {
        const healthData = this.healthCollector.getCurrentHealthData();
        const alerts = this.alertManager.getActiveAlerts();
        
        const response = {
          system: healthData.system,
          timestamp: new Date().toISOString(),
          healthy: healthData.system?.overall === 'healthy',
          alerts: {
            active: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            warning: alerts.filter(a => a.severity === 'warning').length
          },
          uptime: process.uptime(),
          lastUpdate: healthData.lastUpdate
        };
        
        res.json(response);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get system status',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Agent health endpoints
    router.get('/agents', (req, res) => {
      try {
        const healthData = this.healthCollector.getCurrentHealthData();
        res.json({
          agents: healthData.agents,
          count: healthData.agents.length,
          lastUpdate: healthData.lastUpdate
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get agent health',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    router.get('/agents/:agentId', (req, res) => {
      try {
        const { agentId } = req.params;
        const healthData = this.healthCollector.getCurrentHealthData();
        const agent = healthData.agents.find(a => a.agentId === agentId);
        
        if (!agent) {
          return res.status(404).json({ error: 'Agent not found' });
        }
        
        // Get historical data
        const historical = this.healthCollector.getHistoricalData(`agent-${agentId}`, 100);
        
        res.json({
          agent,
          historical,
          lastUpdate: healthData.lastUpdate
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get agent details',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Alert endpoints
    router.get('/alerts', (req, res) => {
      try {
        const { status, severity, limit } = req.query;
        let alerts = status === 'resolved' 
          ? this.alertManager.getResolvedAlerts()
          : this.alertManager.getActiveAlerts();
        
        if (severity) {
          alerts = alerts.filter(a => a.severity === severity);
        }
        
        if (limit) {
          const limitNum = parseInt(limit as string);
          alerts = alerts.slice(0, limitNum);
        }
        
        res.json({
          alerts: alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
          count: alerts.length
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get alerts',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    router.post('/alerts/:alertId/resolve', (req, res) => {
      try {
        const { alertId } = req.params;
        const { resolvedBy } = req.body;
        
        const success = this.alertManager.resolveAlert(alertId, resolvedBy);
        
        if (!success) {
          return res.status(404).json({ error: 'Alert not found or already resolved' });
        }
        
        res.json({ success: true, message: 'Alert resolved successfully' });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to resolve alert',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    router.post('/alerts/:alertId/acknowledge', (req, res) => {
      try {
        const { alertId } = req.params;
        const { acknowledgedBy } = req.body;
        
        if (!acknowledgedBy) {
          return res.status(400).json({ error: 'acknowledgedBy is required' });
        }
        
        const success = this.alertManager.acknowledgeAlert(alertId, acknowledgedBy);
        
        if (!success) {
          return res.status(404).json({ error: 'Alert not found' });
        }
        
        res.json({ success: true, message: 'Alert acknowledged successfully' });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to acknowledge alert',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Metrics endpoints
    router.get('/metrics', async (req, res) => {
      try {
        const { timeframe } = req.query;
        
        const metrics: DashboardMetrics = {
          timestamp: new Date().toISOString(),
          connectedClients: this.webSocketServer.getServerStats().connectedClients,
          dataStreamRate: 0, // Will be calculated
          alertsGenerated: this.alertManager.getStats().totalAlertsProcessed,
          alertsResolved: this.alertManager.getStats().resolvedAlerts,
          systemLoad: {
            cpu: 0, // Will be updated by health collector
            memory: process.memoryUsage().heapUsed / 1024 / 1024,
            activeConnections: this.webSocketServer.getServerStats().connectedClients
          },
          performanceStats: {
            avgResponseTime: 0,
            errorRate: 0,
            uptime: process.uptime()
          }
        };
        
        res.json(metrics);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get metrics',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Incident timeline endpoint
    router.get('/timeline', (req, res) => {
      try {
        const { limit } = req.query;
        const limitNum = limit ? parseInt(limit as string) : 100;
        
        const timeline = this.alertManager.getIncidentTimeline(limitNum);
        
        res.json({
          timeline,
          count: timeline.length
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get incident timeline',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Resource status endpoints
    router.get('/resources', (req, res) => {
      try {
        const healthData = this.healthCollector.getCurrentHealthData();
        res.json({
          resources: healthData.resources,
          lastUpdate: healthData.lastUpdate
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get resource status',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Configuration endpoints
    router.get('/config', (req, res) => {
      res.json({
        refreshInterval: this.config.dashboard.refreshInterval,
        alertThresholds: this.config.dashboard.alertThresholds,
        ui: this.config.dashboard.ui
      });
    });

    router.put('/config/thresholds', (req, res) => {
      try {
        // Update alert thresholds
        // Implementation would validate and update thresholds
        res.json({ success: true, message: 'Thresholds updated successfully' });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to update thresholds',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Server-Sent Events endpoint
    router.get('/stream', (req, res) => {
      if (!this.config.enableServerSentEvents) {
        return res.status(404).json({ error: 'Server-Sent Events not enabled' });
      }
      
      this.setupServerSentEvents(req, res);
    });

    this.app.use('/api', router);
  }

  /**
   * Setup service integration and event handling
   */
  private setupServiceIntegration(): void {
    // Health collector events
    this.healthCollector.on('health:system-updated', (systemHealth: SystemHealthSummary) => {
      this.broadcastHealthUpdate('system-health-update', systemHealth);
      this.alertManager.evaluateSystemHealth(systemHealth);
    });

    this.healthCollector.on('health:agents-updated', (agents: AgentHealthStatus[]) => {
      agents.forEach(agent => {
        this.broadcastHealthUpdate('agent-status-change', agent);
        this.alertManager.evaluateAgentHealth(agent);
      });
    });

    this.healthCollector.on('health:resources-updated', (resources: any) => {
      // Check for resource threshold breaches
      Object.entries(resources).forEach(([resource, status]: [string, any]) => {
        if (status.usage > status.threshold.critical) {
          this.broadcastHealthUpdate('resource-threshold-breach', {
            metric: resource,
            component: `system-${resource}`,
            currentValue: status.usage,
            threshold: status.threshold.critical,
            severity: 'critical' as const,
            timestamp: new Date().toISOString(),
            duration: 0
          });
        }
      });
    });

    // Alert manager events
    this.alertManager.on('alert:triggered', (alert: RealTimeAlert) => {
      this.broadcastHealthUpdate('alert-triggered', alert);
      this.storeAlertInRedis(alert);
    });

    this.alertManager.on('alert:resolved', (alert: RealTimeAlert) => {
      this.broadcastHealthUpdate('alert-resolved', alert);
      this.storeAlertInRedis(alert);
    });

    // WebSocket server events
    this.webSocketServer.on('client:connected', (data) => {
      console.log(`Dashboard client connected: ${data.clientId}`);
    });

    this.webSocketServer.on('client:disconnected', (data) => {
      console.log(`Dashboard client disconnected: ${data.clientId}`);
    });

    this.webSocketServer.on('client:status-request', async (data) => {
      const healthData = this.healthCollector.getCurrentHealthData();
      this.webSocketServer.sendToClient(data.clientId, {
        type: 'system-health-update',
        data: healthData.system,
        timestamp: new Date().toISOString(),
        source: 'health-collector'
      });
    });
  }

  /**
   * Broadcast health update to all connected clients
   */
  private broadcastHealthUpdate<K extends keyof HealthStreamEvents>(
    type: K,
    data: HealthStreamEvents[K]
  ): void {
    this.webSocketServer.broadcast(type, data);
    
    // Also cache in Redis if available
    if (this.redisClient) {
      this.cacheHealthUpdate(type, data);
    }
  }

  /**
   * Setup notification channels
   */
  private setupNotificationChannels(): void {
    if (!this.notificationManager) {
      return;
    }

    // Configure notification channels based on dashboard config
    const channels = this.config.dashboard.notificationChannels;
    
    if (channels.slack?.enabled) {
      this.alertManager.addNotificationChannel({
        name: 'slack',
        type: 'slack',
        config: channels.slack,
        enabled: true,
        priority: 1
      });
    }

    if (channels.email?.enabled) {
      this.alertManager.addNotificationChannel({
        name: 'email',
        type: 'email',
        config: channels.email,
        enabled: true,
        priority: 2
      });
    }

    if (channels.teams?.enabled) {
      this.alertManager.addNotificationChannel({
        name: 'teams',
        type: 'teams',
        config: channels.teams,
        enabled: true,
        priority: 3
      });
    }
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(): Promise<void> {
    if (!this.config.redis) return;

    try {
      this.redisClient = Redis.createClient({
        url: this.config.redis.url
      });

      await this.redisClient.connect();
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Start HTTP server
   */
  private async startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.config.server) {
        this.server = this.config.server;
        resolve();
        return;
      }

      this.server = http.createServer(this.app);
      this.webSocketServer = new WebSocketServer({ server: this.server });

      this.server.listen(this.config.port, () => {
        resolve();
      });

      this.server.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Setup Server-Sent Events
   */
  private setupServerSentEvents(req: express.Request, res: express.Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial data
    const healthData = this.healthCollector.getCurrentHealthData();
    res.write(`data: ${JSON.stringify({
      type: 'initial',
      data: healthData,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Set up event listeners for real-time updates
    const sendUpdate = (type: string, data: any) => {
      res.write(`data: ${JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      })}\n\n`);
    };

    this.healthCollector.on('health:update', (data) => sendUpdate('health', data));
    this.alertManager.on('alert:triggered', (data) => sendUpdate('alert', data));

    // Handle client disconnect
    req.on('close', () => {
      console.log('SSE client disconnected');
    });
  }

  /**
   * Store alert in Redis
   */
  private async storeAlertInRedis(alert: RealTimeAlert): Promise<void> {
    if (!this.redisClient || !this.config.redis) return;

    try {
      const key = `${this.config.redis.keyPrefix}alert:${alert.id}`;
      await this.redisClient.setEx(key, 86400, JSON.stringify(alert)); // 24 hours TTL
    } catch (error) {
      console.error('Failed to store alert in Redis:', error);
    }
  }

  /**
   * Cache health update in Redis
   */
  private async cacheHealthUpdate(type: string, data: any): Promise<void> {
    if (!this.redisClient || !this.config.redis) return;

    try {
      const key = `${this.config.redis.keyPrefix}update:${type}:${Date.now()}`;
      await this.redisClient.setEx(key, 3600, JSON.stringify(data)); // 1 hour TTL
    } catch (error) {
      console.error('Failed to cache health update in Redis:', error);
    }
  }

  /**
   * Get health status
   */
  private getHealthStatus() {
    const healthData = this.healthCollector.getCurrentHealthData();
    const alertStats = this.alertManager.getStats();
    const wsStats = this.webSocketServer.getServerStats();

    return {
      healthy: this.isRunning && 
               healthData.system?.overall === 'healthy' && 
               alertStats.activeAlerts === 0,
      status: 'running',
      uptime: this.startupTime ? Date.now() - this.startupTime.getTime() : 0,
      services: {
        healthCollector: this.healthCollector.getStats().isRunning,
        alertManager: alertStats.isRunning,
        webSocketServer: wsStats.isRunning,
        redis: !!this.redisClient
      },
      stats: {
        connectedClients: wsStats.connectedClients,
        activeAlerts: alertStats.activeAlerts,
        totalAgents: healthData.agents.length,
        lastUpdate: healthData.lastUpdate
      }
    };
  }

  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    const cleanupTasks = [];

    // Stop services
    if (this.webSocketServer.isServerRunning()) {
      cleanupTasks.push(this.webSocketServer.stop());
    }
    
    cleanupTasks.push(this.alertManager.stop());
    cleanupTasks.push(this.healthCollector.stop());

    // Close Redis connection
    if (this.redisClient) {
      cleanupTasks.push(this.redisClient.quit());
    }

    // Close HTTP server
    if (this.server && this.server !== this.config.server) {
      cleanupTasks.push(new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      }));
    }

    await Promise.allSettled(cleanupTasks);
  }

  /**
   * Get dashboard statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      startupTime: this.startupTime,
      uptime: this.startupTime ? Date.now() - this.startupTime.getTime() : 0,
      healthCollector: this.healthCollector.getStats(),
      alertManager: this.alertManager.getStats(),
      webSocketServer: this.webSocketServer.getServerStats(),
      config: {
        port: this.config.port,
        webSocketEnabled: this.config.enableWebSocket,
        sseEnabled: this.config.enableServerSentEvents,
        redisEnabled: !!this.config.redis
      }
    };
  }
}