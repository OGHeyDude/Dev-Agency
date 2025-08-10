/**
 * Monitoring Dashboard - Web-based dashboard for production health monitoring
 * 
 * @file MonitoringDashboard.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as cors from 'cors';

export interface DashboardConfig {
  port?: number;
  enabled?: boolean;
  healthCheckManager?: any;
  circuitBreakerManager?: any;
  degradationManager?: any;
  enableWebSockets?: boolean;
  enableStaticFiles?: boolean;
}

export interface DashboardEvent {
  type: string;
  component: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class MonitoringDashboard {
  private config: Required<DashboardConfig>;
  private app: express.Application;
  private server?: http.Server;
  private wss?: WebSocket.Server;
  private healthCheckManager?: any;
  private circuitBreakerManager?: any;
  private degradationManager?: any;
  private events: DashboardEvent[] = [];
  private maxEvents = 1000;
  private isRunning = false;

  constructor(config: DashboardConfig = {}) {
    this.config = {
      port: config.port || 3001,
      enabled: config.enabled !== false,
      enableWebSockets: config.enableWebSockets !== false,
      enableStaticFiles: config.enableStaticFiles !== false,
      healthCheckManager: config.healthCheckManager,
      circuitBreakerManager: config.circuitBreakerManager,
      degradationManager: config.degradationManager
    };

    this.healthCheckManager = config.healthCheckManager;
    this.circuitBreakerManager = config.circuitBreakerManager;
    this.degradationManager = config.degradationManager;

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Start the monitoring dashboard
   */
  async start(): Promise<void> {
    if (!this.config.enabled || this.isRunning) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.config.port, () => {
        console.log(`Monitoring Dashboard started on port ${this.config.port}`);
        
        if (this.config.enableWebSockets) {
          this.setupWebSockets();
        }

        this.isRunning = true;
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('Failed to start monitoring dashboard:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop the monitoring dashboard
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close();
      }

      if (this.server) {
        this.server.close(() => {
          console.log('Monitoring Dashboard stopped');
          this.isRunning = false;
          resolve();
        });
      } else {
        this.isRunning = false;
        resolve();
      }
    });
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disabled for dashboard functionality
    }));

    // CORS
    this.app.use(cors());

    // Compression
    this.app.use(compression());

    // JSON parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Static files (if enabled)
    if (this.config.enableStaticFiles) {
      const staticPath = path.join(__dirname, 'static');
      this.app.use('/static', express.static(staticPath));
    }
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const status = this.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get dashboard status',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // System status endpoint
    this.app.get('/api/status', async (req, res) => {
      try {
        const systemStatus = await this.getSystemStatus();
        res.json(systemStatus);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get system status',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Health checks endpoint
    this.app.get('/api/health-checks', async (req, res) => {
      try {
        if (!this.healthCheckManager) {
          return res.status(404).json({ error: 'Health check manager not available' });
        }

        const health = await this.healthCheckManager.getSystemHealth();
        res.json(health);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get health checks',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Circuit breakers endpoint
    this.app.get('/api/circuit-breakers', (req, res) => {
      try {
        if (!this.circuitBreakerManager) {
          return res.status(404).json({ error: 'Circuit breaker manager not available' });
        }

        const circuitBreakers = this.circuitBreakerManager.getAllStatuses();
        const aggregated = this.circuitBreakerManager.getAggregatedMetrics();
        
        res.json({
          circuitBreakers,
          aggregated
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get circuit breakers',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Degradation status endpoint
    this.app.get('/api/degradation', (req, res) => {
      try {
        if (!this.degradationManager) {
          return res.status(404).json({ error: 'Degradation manager not available' });
        }

        const status = this.degradationManager.getStatus();
        const statistics = this.degradationManager.getStatistics();
        
        res.json({
          status,
          statistics
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get degradation status',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Events endpoint
    this.app.get('/api/events', (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;
        const severity = req.query.severity as string;
        
        let filteredEvents = this.events;
        
        if (severity) {
          filteredEvents = this.events.filter(event => event.severity === severity);
        }

        const paginatedEvents = filteredEvents
          .slice(offset, offset + limit)
          .reverse(); // Most recent first

        res.json({
          events: paginatedEvents,
          total: filteredEvents.length,
          hasMore: offset + limit < filteredEvents.length
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get events',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Metrics endpoint
    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.collectMetrics();
        res.json(metrics);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to get metrics',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Force recovery endpoint
    this.app.post('/api/force-recovery', async (req, res) => {
      try {
        const { component, type } = req.body;

        if (type === 'circuit-breaker' && component && this.circuitBreakerManager) {
          const success = this.circuitBreakerManager.forceCloseCircuitBreaker(component);
          res.json({ success, message: success ? 'Circuit breaker forced closed' : 'Failed to force close' });
        } else if (type === 'degradation' && component && this.degradationManager) {
          await this.degradationManager.resolveDegradation(component);
          res.json({ success: true, message: 'Degradation resolved' });
        } else {
          res.status(400).json({ error: 'Invalid recovery request' });
        }
      } catch (error) {
        res.status(500).json({
          error: 'Failed to force recovery',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Dashboard UI endpoint (simple HTML)
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });

    this.app.get('/dashboard', (req, res) => {
      res.send(this.generateDashboardHTML());
    });
  }

  /**
   * Setup WebSocket server for real-time updates
   */
  private setupWebSockets(): void {
    if (!this.server) {
      return;
    }

    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('Dashboard WebSocket client connected');

      // Send initial data
      this.sendWebSocketMessage(ws, 'initial_data', {
        events: this.events.slice(-50).reverse(),
        timestamp: new Date().toISOString()
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Dashboard WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        console.error('Dashboard WebSocket error:', error);
      });
    });
  }

  /**
   * Handle WebSocket messages from clients
   */
  private handleWebSocketMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'subscribe':
        // Handle subscription to specific events
        break;
      case 'get_status':
        this.getSystemStatus().then(status => {
          this.sendWebSocketMessage(ws, 'status_update', status);
        });
        break;
      default:
        console.warn('Unknown WebSocket message type:', data.type);
    }
  }

  /**
   * Send WebSocket message to client
   */
  private sendWebSocketMessage(ws: WebSocket, type: string, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }));
    }
  }

  /**
   * Broadcast message to all WebSocket clients
   */
  private broadcastWebSocketMessage(type: string, data: any): void {
    if (!this.wss) {
      return;
    }

    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Record an event
   */
  recordEvent(event: DashboardEvent): void {
    this.events.push(event);

    // Trim events if needed
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Broadcast to WebSocket clients
    this.broadcastWebSocketMessage('new_event', event);
  }

  /**
   * Get dashboard status
   */
  getStatus(): {
    healthy: boolean;
    uptime: number;
    connectedClients: number;
    totalEvents: number;
    recentEvents: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp).getTime() > oneHourAgo
    ).length;

    return {
      healthy: this.isRunning,
      uptime: process.uptime(),
      connectedClients: this.wss ? this.wss.clients.size : 0,
      totalEvents: this.events.length,
      recentEvents
    };
  }

  /**
   * Get comprehensive system status
   */
  private async getSystemStatus(): Promise<any> {
    const status: any = {
      timestamp: new Date().toISOString(),
      healthy: true,
      components: {}
    };

    try {
      if (this.healthCheckManager) {
        status.components.health = await this.healthCheckManager.getSystemHealth();
        if (status.components.health.status !== 'healthy') {
          status.healthy = false;
        }
      }

      if (this.circuitBreakerManager) {
        status.components.circuitBreakers = this.circuitBreakerManager.getAggregatedMetrics();
        const cbHealth = this.circuitBreakerManager.healthCheck();
        if (!cbHealth.healthy) {
          status.healthy = false;
        }
      }

      if (this.degradationManager) {
        status.components.degradation = this.degradationManager.getStatus();
        const degHealth = this.degradationManager.healthCheck();
        if (!degHealth.healthy) {
          status.healthy = false;
        }
      }
    } catch (error) {
      console.error('Error collecting system status:', error);
      status.healthy = false;
      status.error = error instanceof Error ? error.message : String(error);
    }

    return status;
  }

  /**
   * Collect comprehensive metrics
   */
  private async collectMetrics(): Promise<any> {
    const metrics: any = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    try {
      if (this.circuitBreakerManager) {
        metrics.circuitBreakers = this.circuitBreakerManager.getAggregatedMetrics();
      }

      if (this.degradationManager) {
        metrics.degradation = this.degradationManager.getStatistics();
      }

      if (this.healthCheckManager) {
        metrics.health = await this.healthCheckManager.getSystemHealth();
      }
    } catch (error) {
      console.error('Error collecting metrics:', error);
      metrics.error = error instanceof Error ? error.message : String(error);
    }

    return metrics;
  }

  /**
   * Generate simple HTML dashboard
   */
  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Health Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-healthy { border-left: 4px solid #27ae60; }
        .status-degraded { border-left: 4px solid #f39c12; }
        .status-unhealthy { border-left: 4px solid #e74c3c; }
        .status-critical { border-left: 4px solid #c0392b; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-value { font-weight: bold; }
        .events { height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
        .event { margin: 5px 0; padding: 8px; border-radius: 4px; font-size: 14px; }
        .event-info { background-color: #d4edda; }
        .event-warning { background-color: #fff3cd; }
        .event-error { background-color: #f8d7da; }
        .event-critical { background-color: #f5c6cb; }
        .refresh-btn { background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
        .refresh-btn:hover { background: #2980b9; }
        #status { font-size: 18px; font-weight: bold; }
        .loading { text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Production Health Dashboard</h1>
            <div id="status">Loading...</div>
            <button class="refresh-btn" onclick="refreshData()">Refresh</button>
        </div>
        
        <div class="grid">
            <div class="card" id="system-health">
                <h3>System Health</h3>
                <div class="loading">Loading...</div>
            </div>
            
            <div class="card" id="circuit-breakers">
                <h3>Circuit Breakers</h3>
                <div class="loading">Loading...</div>
            </div>
            
            <div class="card" id="degradation">
                <h3>Graceful Degradation</h3>
                <div class="loading">Loading...</div>
            </div>
            
            <div class="card">
                <h3>Recent Events</h3>
                <div class="events" id="events">
                    <div class="loading">Loading events...</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let ws = null;
        
        function connectWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = protocol + '//' + window.location.host;
            
            ws = new WebSocket(wsUrl);
            
            ws.onopen = function() {
                console.log('WebSocket connected');
            };
            
            ws.onmessage = function(event) {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };
            
            ws.onclose = function() {
                console.log('WebSocket disconnected');
                setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
            };
        }
        
        function handleWebSocketMessage(message) {
            switch(message.type) {
                case 'initial_data':
                    updateEvents(message.data.events);
                    break;
                case 'new_event':
                    addEvent(message.data);
                    break;
                case 'status_update':
                    updateDashboard(message.data);
                    break;
            }
        }
        
        async function refreshData() {
            try {
                const [status, events] = await Promise.all([
                    fetch('/api/status').then(r => r.json()),
                    fetch('/api/events?limit=50').then(r => r.json())
                ]);
                
                updateDashboard(status);
                updateEvents(events.events);
                
            } catch (error) {
                console.error('Failed to refresh data:', error);
            }
        }
        
        function updateDashboard(status) {
            const statusEl = document.getElementById('status');
            const overallStatus = status.healthy ? 'Healthy' : 'Issues Detected';
            const statusClass = status.healthy ? 'status-healthy' : 'status-unhealthy';
            
            statusEl.textContent = 'System Status: ' + overallStatus;
            statusEl.className = statusClass;
            
            // Update health card
            if (status.components.health) {
                updateHealthCard(status.components.health);
            }
            
            // Update circuit breakers card
            if (status.components.circuitBreakers) {
                updateCircuitBreakersCard(status.components.circuitBreakers);
            }
            
            // Update degradation card
            if (status.components.degradation) {
                updateDegradationCard(status.components.degradation);
            }
        }
        
        function updateHealthCard(health) {
            const card = document.getElementById('system-health');
            const statusClass = 'status-' + health.status;
            card.className = 'card ' + statusClass;
            
            card.innerHTML = '<h3>System Health</h3>' +
                '<div class="metric"><span>Status:</span><span class="metric-value">' + health.status + '</span></div>' +
                '<div class="metric"><span>Components:</span><span class="metric-value">' + health.components.length + '</span></div>' +
                '<div class="metric"><span>Healthy:</span><span class="metric-value">' + health.summary.healthy + '</span></div>' +
                '<div class="metric"><span>Issues:</span><span class="metric-value">' + (health.summary.degraded + health.summary.unhealthy + health.summary.critical) + '</span></div>';
        }
        
        function updateCircuitBreakersCard(cb) {
            const card = document.getElementById('circuit-breakers');
            const statusClass = cb.openCircuits > 0 ? 'status-unhealthy' : 'status-healthy';
            card.className = 'card ' + statusClass;
            
            card.innerHTML = '<h3>Circuit Breakers</h3>' +
                '<div class="metric"><span>Total:</span><span class="metric-value">' + cb.totalCircuitBreakers + '</span></div>' +
                '<div class="metric"><span>Open:</span><span class="metric-value">' + cb.openCircuits + '</span></div>' +
                '<div class="metric"><span>Closed:</span><span class="metric-value">' + cb.closedCircuits + '</span></div>' +
                '<div class="metric"><span>Success Rate:</span><span class="metric-value">' + cb.overallSuccessRate.toFixed(1) + '%</span></div>';
        }
        
        function updateDegradationCard(deg) {
            const card = document.getElementById('degradation');
            const statusClass = deg.active ? 'status-degraded' : 'status-healthy';
            card.className = 'card ' + statusClass;
            
            card.innerHTML = '<h3>Graceful Degradation</h3>' +
                '<div class="metric"><span>Status:</span><span class="metric-value">' + (deg.active ? 'Active' : 'Normal') + '</span></div>' +
                '<div class="metric"><span>Level:</span><span class="metric-value">' + deg.level + '</span></div>' +
                '<div class="metric"><span>Affected:</span><span class="metric-value">' + deg.affectedComponents.length + '</span></div>' +
                '<div class="metric"><span>Recovery:</span><span class="metric-value">' + (deg.recoveryInProgress ? 'In Progress' : 'N/A') + '</span></div>';
        }
        
        function updateEvents(events) {
            const eventsEl = document.getElementById('events');
            eventsEl.innerHTML = '';
            
            events.forEach(event => {
                addEvent(event);
            });
        }
        
        function addEvent(event) {
            const eventsEl = document.getElementById('events');
            const eventEl = document.createElement('div');
            eventEl.className = 'event event-' + event.severity;
            
            const time = new Date(event.timestamp).toLocaleTimeString();
            eventEl.innerHTML = '<strong>' + time + '</strong> [' + event.component + '] ' + event.message;
            
            eventsEl.insertBefore(eventEl, eventsEl.firstChild);
            
            // Keep only last 50 events in display
            while (eventsEl.children.length > 50) {
                eventsEl.removeChild(eventsEl.lastChild);
            }
        }
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            refreshData();
            connectWebSocket();
            
            // Auto-refresh every 30 seconds
            setInterval(refreshData, 30000);
        });
    </script>
</body>
</html>
    `;
  }
}