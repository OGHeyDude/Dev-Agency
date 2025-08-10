/**
 * WebSocket Server - Real-time data streaming for health monitoring dashboard
 * 
 * @file WebSocketServer.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as WebSocket from 'ws';
import * as http from 'http';
import { EventEmitter } from 'events';
import { WebSocketMessage, HealthStreamEvents, HealthStreamEventType } from '../models/RealTimeHealthStatus';

export interface WebSocketServerConfig {
  server?: http.Server;
  port?: number;
  heartbeatInterval: number;
  maxClients: number;
  enableCompression: boolean;
  clientTimeout: number;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  isAlive: boolean;
  subscriptions: Set<string>;
  metadata: {
    connectedAt: Date;
    userAgent?: string;
    ip?: string;
    lastActivity: Date;
  };
}

export class WebSocketServer extends EventEmitter {
  private wss?: WebSocket.Server;
  private config: Required<WebSocketServerConfig>;
  private clients: Map<string, ClientConnection> = new Map();
  private heartbeatTimer?: NodeJS.Timeout;
  private statsTimer?: NodeJS.Timeout;
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();
  private isRunning = false;

  constructor(config: Partial<WebSocketServerConfig> = {}) {
    super();
    
    this.config = {
      server: undefined,
      port: 3002,
      heartbeatInterval: 30000, // 30 seconds
      maxClients: 100,
      enableCompression: true,
      clientTimeout: 120000, // 2 minutes
      ...config
    };
  }

  /**
   * Start the WebSocket server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    const options: WebSocket.ServerOptions = {
      perMessageDeflate: this.config.enableCompression,
      maxPayload: 1024 * 1024, // 1MB
    };

    if (this.config.server) {
      options.server = this.config.server;
    } else {
      options.port = this.config.port;
    }

    this.wss = new WebSocket.Server(options);
    this.setupEventHandlers();
    this.startHeartbeat();
    this.startStatsCollection();

    this.isRunning = true;
    this.emit('server:started', { port: this.config.port });

    console.log(`WebSocket server started on ${this.config.server ? 'HTTP server' : `port ${this.config.port}`}`);
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }
      
      if (this.statsTimer) {
        clearInterval(this.statsTimer);
      }

      // Close all client connections
      this.clients.forEach((client) => {
        client.ws.terminate();
      });
      this.clients.clear();

      if (this.wss) {
        this.wss.close(() => {
          this.isRunning = false;
          this.emit('server:stopped');
          console.log('WebSocket server stopped');
          resolve();
        });
      } else {
        this.isRunning = false;
        resolve();
      }
    });
  }

  /**
   * Setup WebSocket server event handlers
   */
  private setupEventHandlers(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket, request) => {
      const clientId = this.generateClientId();
      
      // Check client limit
      if (this.clients.size >= this.config.maxClients) {
        ws.close(1008, 'Server at capacity');
        return;
      }

      const client: ClientConnection = {
        id: clientId,
        ws,
        isAlive: true,
        subscriptions: new Set(),
        metadata: {
          connectedAt: new Date(),
          userAgent: request.headers['user-agent'],
          ip: request.socket.remoteAddress,
          lastActivity: new Date()
        }
      };

      this.clients.set(clientId, client);
      this.setupClientEventHandlers(client);
      
      // Send welcome message
      this.sendToClient(clientId, {
        type: 'dashboard-metrics',
        data: {
          message: 'Connected to health monitoring dashboard',
          clientId,
          serverTime: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        source: 'websocket-server'
      });

      // Send queued messages if any
      this.processQueuedMessages(clientId);

      this.emit('client:connected', { clientId, client });
      console.log(`Client connected: ${clientId} (${this.clients.size} total clients)`);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
      this.emit('server:error', error);
    });
  }

  /**
   * Setup individual client event handlers
   */
  private setupClientEventHandlers(client: ClientConnection): void {
    client.ws.on('message', (data: WebSocket.RawData) => {
      client.metadata.lastActivity = new Date();
      
      try {
        const message = JSON.parse(data.toString());
        this.handleClientMessage(client, message);
      } catch (error) {
        console.error(`Invalid message from client ${client.id}:`, error);
        this.sendToClient(client.id, {
          type: 'dashboard-metrics',
          data: { error: 'Invalid message format' },
          timestamp: new Date().toISOString(),
          source: 'websocket-server'
        });
      }
    });

    client.ws.on('pong', () => {
      client.isAlive = true;
      client.metadata.lastActivity = new Date();
    });

    client.ws.on('close', (code, reason) => {
      this.clients.delete(client.id);
      this.emit('client:disconnected', { clientId: client.id, code, reason: reason.toString() });
      console.log(`Client disconnected: ${client.id} (${this.clients.size} remaining clients)`);
    });

    client.ws.on('error', (error) => {
      console.error(`Client ${client.id} error:`, error);
      this.emit('client:error', { clientId: client.id, error });
    });
  }

  /**
   * Handle incoming messages from clients
   */
  private handleClientMessage(client: ClientConnection, message: any): void {
    switch (message.type) {
      case 'ping':
        this.sendToClient(client.id, {
          type: 'dashboard-metrics',
          data: { pong: true },
          timestamp: new Date().toISOString(),
          source: 'websocket-server'
        });
        break;

      case 'subscribe':
        if (message.events && Array.isArray(message.events)) {
          message.events.forEach((event: string) => {
            client.subscriptions.add(event);
          });
          this.emit('client:subscribed', { clientId: client.id, events: message.events });
        }
        break;

      case 'unsubscribe':
        if (message.events && Array.isArray(message.events)) {
          message.events.forEach((event: string) => {
            client.subscriptions.delete(event);
          });
          this.emit('client:unsubscribed', { clientId: client.id, events: message.events });
        }
        break;

      case 'get-status':
        this.emit('client:status-request', { clientId: client.id });
        break;

      default:
        console.warn(`Unknown message type from client ${client.id}:`, message.type);
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast<K extends HealthStreamEventType>(
    type: K, 
    data: HealthStreamEvents[K], 
    options: { 
      filter?: (client: ClientConnection) => boolean;
      subscription?: string;
    } = {}
  ): void {
    const message: WebSocketMessage<HealthStreamEvents[K]> = {
      type,
      data,
      timestamp: new Date().toISOString(),
      source: 'health-monitor'
    };

    let sentCount = 0;
    
    this.clients.forEach((client) => {
      // Apply filter if provided
      if (options.filter && !options.filter(client)) {
        return;
      }

      // Check subscription if specified
      if (options.subscription && !client.subscriptions.has(options.subscription)) {
        return;
      }

      if (this.sendToClient(client.id, message)) {
        sentCount++;
      }
    });

    this.emit('message:broadcast', { type, sentCount, totalClients: this.clients.size });
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, message: WebSocketMessage): boolean {
    const client = this.clients.get(clientId);
    
    if (!client) {
      console.warn(`Attempted to send message to non-existent client: ${clientId}`);
      return false;
    }

    if (client.ws.readyState !== WebSocket.OPEN) {
      // Queue message for later delivery
      this.queueMessage(clientId, message);
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      client.metadata.lastActivity = new Date();
      return true;
    } catch (error) {
      console.error(`Failed to send message to client ${clientId}:`, error);
      this.emit('client:send-error', { clientId, error });
      return false;
    }
  }

  /**
   * Queue message for offline client
   */
  private queueMessage(clientId: string, message: WebSocketMessage): void {
    if (!this.messageQueue.has(clientId)) {
      this.messageQueue.set(clientId, []);
    }

    const queue = this.messageQueue.get(clientId)!;
    queue.push(message);

    // Limit queue size to prevent memory issues
    if (queue.length > 100) {
      queue.shift();
    }
  }

  /**
   * Process queued messages for reconnected client
   */
  private processQueuedMessages(clientId: string): void {
    const queue = this.messageQueue.get(clientId);
    if (!queue || queue.length === 0) {
      return;
    }

    queue.forEach((message) => {
      this.sendToClient(clientId, message);
    });

    this.messageQueue.delete(clientId);
    console.log(`Processed ${queue.length} queued messages for client ${clientId}`);
  }

  /**
   * Start heartbeat to check client connections
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          // Client didn't respond to previous ping
          client.ws.terminate();
          this.clients.delete(clientId);
          console.log(`Terminated unresponsive client: ${clientId}`);
          return;
        }

        // Check for client timeout
        const lastActivity = client.metadata.lastActivity.getTime();
        if (now - lastActivity > this.config.clientTimeout) {
          client.ws.close(1000, 'Client timeout');
          this.clients.delete(clientId);
          console.log(`Closed timed out client: ${clientId}`);
          return;
        }

        // Send ping
        client.isAlive = false;
        try {
          client.ws.ping();
        } catch (error) {
          console.error(`Failed to ping client ${clientId}:`, error);
        }
      });
    }, this.config.heartbeatInterval);
  }

  /**
   * Start statistics collection
   */
  private startStatsCollection(): void {
    this.statsTimer = setInterval(() => {
      const stats = this.getServerStats();
      this.emit('server:stats', stats);
      
      // Broadcast stats to interested clients
      this.broadcast('dashboard-metrics', {
        timestamp: new Date().toISOString(),
        connectedClients: stats.connectedClients,
        dataStreamRate: stats.messagesPerSecond,
        alertsGenerated: 0, // Will be updated by alert manager
        alertsResolved: 0,  // Will be updated by alert manager
        systemLoad: {
          cpu: process.cpuUsage().user / 1000000, // Convert to seconds
          memory: process.memoryUsage().heapUsed / 1024 / 1024, // Convert to MB
          activeConnections: stats.connectedClients
        },
        performanceStats: {
          avgResponseTime: 0, // Will be calculated by health collector
          errorRate: 0,       // Will be calculated by health collector  
          uptime: process.uptime()
        }
      });
    }, 60000); // Every minute
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get server statistics
   */
  getServerStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentlyActive = Array.from(this.clients.values()).filter(
      client => client.metadata.lastActivity.getTime() > oneMinuteAgo
    ).length;

    return {
      isRunning: this.isRunning,
      connectedClients: this.clients.size,
      activeClients: recentlyActive,
      messagesPerSecond: 0, // This would need to be calculated based on actual message flow
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      queuedMessages: Array.from(this.messageQueue.values()).reduce((sum, queue) => sum + queue.length, 0)
    };
  }

  /**
   * Get client information
   */
  getClientInfo(clientId: string): ClientConnection | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Get all connected clients
   */
  getConnectedClients(): ClientConnection[] {
    return Array.from(this.clients.values());
  }

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }
}