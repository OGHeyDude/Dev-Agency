/**
 * Debug Server - WebSocket server for real-time debugging interface
 * 
 * @file DebugServer.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as http from 'http';
import * as express from 'express';
import * as WebSocket from 'ws';
import * as path from 'path';
import * as fs from 'fs-extra';
import { TraceCollector } from '../collectors/TraceCollector';
import { BreakpointManager } from '../analyzers/BreakpointManager';
import { PerformanceAnalyzer } from '../analyzers/PerformanceAnalyzer';
import { Logger } from '../../../tools/agent-cli/src/utils/Logger';
import { 
  ExecutionTrace, 
  FlowDiagramNode, 
  FlowDiagramEdge,
  VisualizationConfig 
} from '../models/TraceModels';

export interface DebugServerConfig {
  port: number;
  enableHTTPS: boolean;
  corsOrigins: string[];
  
  // WebSocket configuration
  maxConnections: number;
  heartbeatInterval: number;
  enableCompression: boolean;
  
  // Security
  requireAuth: boolean;
  authTokens: string[];
  
  // Features
  enableBreakpoints: boolean;
  enablePerformanceAnalysis: boolean;
  enableFlowVisualization: boolean;
  enableTokenVisualization: boolean;
  
  // Static files
  staticPath: string;
  enableStaticServing: boolean;
}

export interface DebugSession {
  sessionId: string;
  clientId: string;
  startTime: string;
  lastActivity: string;
  
  // Session state
  activeTraces: Set<string>;
  breakpoints: Set<string>;
  watchedVariables: string[];
  
  // Preferences
  visualizationConfig: VisualizationConfig;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  sessionId?: string;
  timestamp: string;
}

export interface DebugServerStats {
  connectedClients: number;
  activeSessions: number;
  totalMessages: number;
  uptime: number;
  lastActivity: string;
}

export class DebugServer extends EventEmitter {
  private config: DebugServerConfig;
  private logger: Logger;
  
  // Server components
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.WebSocketServer;
  
  // Service integrations
  private traceCollector: TraceCollector;
  private breakpointManager: BreakpointManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  
  // Session management
  private sessions = new Map<string, DebugSession>();
  private clients = new Map<string, WebSocket>();
  
  // Statistics
  private stats: DebugServerStats = {
    connectedClients: 0,
    activeSessions: 0,
    totalMessages: 0,
    uptime: 0,
    lastActivity: ''
  };
  
  private startTime: Date;
  private heartbeatTimer?: NodeJS.Timer;

  constructor(
    config: Partial<DebugServerConfig>,
    traceCollector: TraceCollector,
    breakpointManager?: BreakpointManager,
    performanceAnalyzer?: PerformanceAnalyzer
  ) {
    super();
    
    this.config = {
      port: 8081,
      enableHTTPS: false,
      corsOrigins: ['*'],
      maxConnections: 50,
      heartbeatInterval: 30000,
      enableCompression: true,
      requireAuth: false,
      authTokens: [],
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true,
      staticPath: path.join(__dirname, '../interfaces/web'),
      enableStaticServing: true,
      ...config
    };
    
    this.logger = Logger.create({ 
      component: 'DebugServer',
      level: 'info'
    });
    
    this.traceCollector = traceCollector;
    this.breakpointManager = breakpointManager || new BreakpointManager();
    this.performanceAnalyzer = performanceAnalyzer || new PerformanceAnalyzer();
    
    this.startTime = new Date();
    this.setupExpressApp();
    this.setupWebSocketServer();
    this.setupEventHandlers();
    
    this.logger.info('DebugServer initialized', { config: this.config });
  }

  /**
   * Start the debug server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, () => {
        this.startHeartbeat();
        this.logger.info(`Debug server started on port ${this.config.port}`);
        this.emit('server:started', { port: this.config.port });
        resolve();
      });

      this.server.on('error', (error) => {
        this.logger.error('Failed to start debug server:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop the debug server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      // Stop heartbeat
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }

      // Close all WebSocket connections
      this.wss.clients.forEach((ws) => {
        ws.terminate();
      });

      // Close WebSocket server
      this.wss.close(() => {
        // Close HTTP server
        this.server.close(() => {
          this.logger.info('Debug server stopped');
          this.emit('server:stopped');
          resolve();
        });
      });
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: Omit<WebSocketMessage, 'timestamp'>): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    const messageStr = JSON.stringify(fullMessage);
    
    this.wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });

    this.stats.totalMessages++;
    this.stats.lastActivity = new Date().toISOString();
  }

  /**
   * Send message to specific client
   */
  sendToClient(clientId: string, message: Omit<WebSocketMessage, 'timestamp'>): void {
    const client = this.clients.get(clientId);
    if (!client || client.readyState !== WebSocket.OPEN) {
      this.logger.warn('Client not found or not connected', { clientId });
      return;
    }

    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    client.send(JSON.stringify(fullMessage));
    this.stats.totalMessages++;
    this.stats.lastActivity = new Date().toISOString();
  }

  /**
   * Get server statistics
   */
  getStats(): DebugServerStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Get active sessions
   */
  getSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }

  // Private methods

  private setupExpressApp(): void {
    this.app = express();
    
    // Middleware
    this.app.use(express.json({ limit: '50mb' }));
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

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: Date.now() - this.startTime.getTime(),
        stats: this.getStats()
      });
    });

    this.setupAPIRoutes();

    // Static files for debug interface
    if (this.config.enableStaticServing && fs.existsSync(this.config.staticPath)) {
      this.app.use('/debug', express.static(this.config.staticPath));
    }

    // Default route
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Debug Server',
        version: '1.0.0',
        features: {
          breakpoints: this.config.enableBreakpoints,
          performanceAnalysis: this.config.enablePerformanceAnalysis,
          flowVisualization: this.config.enableFlowVisualization,
          tokenVisualization: this.config.enableTokenVisualization
        },
        websocket: `ws://localhost:${this.config.port}`,
        endpoints: ['/debug/traces', '/debug/performance', '/debug/breakpoints', '/debug/flow']
      });
    });

    this.server = http.createServer(this.app);
  }

  private setupAPIRoutes(): void {
    const router = express.Router();

    // Trace endpoints
    router.get('/traces', (req, res) => {
      try {
        const { agent, status, limit } = req.query;
        const traces = this.traceCollector.getTraces({
          agentName: agent as string,
          status: status as string,
          limit: limit ? parseInt(limit as string) : undefined
        });
        
        res.json({ traces, count: traces.length });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get traces',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    router.get('/traces/:executionId', (req, res) => {
      try {
        const trace = this.traceCollector.getTrace(req.params.executionId);
        if (!trace) {
          return res.status(404).json({ error: 'Trace not found' });
        }
        res.json(trace);
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get trace',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Flow visualization endpoints
    router.get('/flow/:executionId', (req, res) => {
      try {
        const trace = this.traceCollector.getTrace(req.params.executionId);
        if (!trace) {
          return res.status(404).json({ error: 'Trace not found' });
        }

        const flowData = this.generateFlowDiagram(trace);
        res.json(flowData);
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to generate flow diagram',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Performance analysis endpoints
    router.get('/performance/:executionId', (req, res) => {
      try {
        const trace = this.traceCollector.getTrace(req.params.executionId);
        if (!trace) {
          return res.status(404).json({ error: 'Trace not found' });
        }

        const analysis = this.performanceAnalyzer.analyzeTrace(trace);
        res.json(analysis);
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to analyze performance',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Breakpoint endpoints
    router.get('/breakpoints', (req, res) => {
      try {
        const breakpoints = this.breakpointManager.getAllBreakpoints();
        res.json({ breakpoints });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get breakpoints',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    router.post('/breakpoints', (req, res) => {
      try {
        const { agentName, condition, enabled } = req.body;
        const breakpoint = this.breakpointManager.addBreakpoint({
          agentName,
          condition,
          enabled: enabled !== false
        });
        res.json({ breakpoint });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to create breakpoint',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    router.delete('/breakpoints/:id', (req, res) => {
      try {
        const success = this.breakpointManager.removeBreakpoint(req.params.id);
        if (!success) {
          return res.status(404).json({ error: 'Breakpoint not found' });
        }
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to delete breakpoint',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Token usage analysis
    router.get('/tokens/:executionId', (req, res) => {
      try {
        const trace = this.traceCollector.getTrace(req.params.executionId);
        if (!trace) {
          return res.status(404).json({ error: 'Trace not found' });
        }

        res.json({
          tokenUsage: trace.tokenUsage,
          visualization: this.generateTokenVisualization(trace)
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get token data',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Decision tree endpoints
    router.get('/decisions/:executionId', (req, res) => {
      try {
        const trace = this.traceCollector.getTrace(req.params.executionId);
        if (!trace) {
          return res.status(404).json({ error: 'Trace not found' });
        }

        res.json({
          decisions: trace.decisions,
          tree: this.generateDecisionTree(trace)
        });
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get decision data',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    // Statistics endpoint
    router.get('/stats', (req, res) => {
      try {
        const stats = {
          server: this.getStats(),
          collector: this.traceCollector.getStats(),
          breakpoints: this.breakpointManager.getStats(),
          performance: this.performanceAnalyzer.getStats()
        };
        res.json(stats);
      } catch (error) {
        res.status(500).json({ 
          error: 'Failed to get statistics',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    });

    this.app.use('/debug', router);
  }

  private setupWebSocketServer(): void {
    this.wss = new WebSocket.WebSocketServer({ 
      server: this.server,
      maxPayload: 16 * 1024 * 1024, // 16MB
      perMessageDeflate: this.config.enableCompression
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: WebSocket, req: http.IncomingMessage): void {
    const clientId = this.generateClientId();
    const sessionId = this.generateSessionId();
    
    // Check connection limit
    if (this.wss.clients.size > this.config.maxConnections) {
      ws.close(1013, 'Server overloaded');
      return;
    }

    // Authentication if required
    if (this.config.requireAuth) {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token || !this.config.authTokens.includes(token)) {
        ws.close(1008, 'Unauthorized');
        return;
      }
    }

    // Create session
    const session: DebugSession = {
      sessionId,
      clientId,
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      activeTraces: new Set(),
      breakpoints: new Set(),
      watchedVariables: [],
      visualizationConfig: this.getDefaultVisualizationConfig()
    };

    // Store session and client
    this.sessions.set(sessionId, session);
    this.clients.set(clientId, ws);
    this.stats.connectedClients = this.wss.clients.size;
    this.stats.activeSessions = this.sessions.size;

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection:welcome',
      data: {
        sessionId,
        clientId,
        features: {
          breakpoints: this.config.enableBreakpoints,
          performanceAnalysis: this.config.enablePerformanceAnalysis,
          flowVisualization: this.config.enableFlowVisualization,
          tokenVisualization: this.config.enableTokenVisualization
        }
      }
    });

    // Handle messages
    ws.on('message', (data) => {
      this.handleMessage(clientId, sessionId, data);
    });

    // Handle disconnection
    ws.on('close', () => {
      this.handleDisconnection(clientId, sessionId);
    });

    // Handle errors
    ws.on('error', (error) => {
      this.logger.error('WebSocket error:', error);
    });

    this.logger.info('Client connected', { clientId, sessionId });
    this.emit('client:connected', { clientId, sessionId });
  }

  private handleMessage(clientId: string, sessionId: string, data: WebSocket.RawData): void {
    try {
      const message = JSON.parse(data.toString()) as WebSocketMessage;
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        this.logger.warn('Message from unknown session', { sessionId });
        return;
      }

      session.lastActivity = new Date().toISOString();
      this.stats.totalMessages++;
      
      switch (message.type) {
        case 'trace:subscribe':
          this.handleTraceSubscription(clientId, session, message.data);
          break;
          
        case 'breakpoint:set':
          this.handleBreakpointSet(clientId, session, message.data);
          break;
          
        case 'breakpoint:remove':
          this.handleBreakpointRemove(clientId, session, message.data);
          break;
          
        case 'execution:step':
          this.handleExecutionStep(clientId, session, message.data);
          break;
          
        case 'visualization:config':
          this.handleVisualizationConfig(clientId, session, message.data);
          break;
          
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', data: {} });
          break;
          
        default:
          this.logger.warn('Unknown message type', { type: message.type });
      }

    } catch (error) {
      this.logger.error('Error handling message:', error);
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Invalid message format' }
      });
    }
  }

  private handleDisconnection(clientId: string, sessionId: string): void {
    this.clients.delete(clientId);
    this.sessions.delete(sessionId);
    
    this.stats.connectedClients = this.wss.clients.size;
    this.stats.activeSessions = this.sessions.size;
    
    this.logger.info('Client disconnected', { clientId, sessionId });
    this.emit('client:disconnected', { clientId, sessionId });
  }

  private handleTraceSubscription(clientId: string, session: DebugSession, data: any): void {
    const { executionId, subscribe } = data;
    
    if (subscribe) {
      session.activeTraces.add(executionId);
      // Send current trace data
      const trace = this.traceCollector.getTrace(executionId);
      if (trace) {
        this.sendToClient(clientId, {
          type: 'trace:data',
          data: trace
        });
      }
    } else {
      session.activeTraces.delete(executionId);
    }
  }

  private handleBreakpointSet(clientId: string, session: DebugSession, data: any): void {
    if (!this.config.enableBreakpoints) return;
    
    const breakpoint = this.breakpointManager.addBreakpoint(data);
    session.breakpoints.add(breakpoint.id);
    
    this.sendToClient(clientId, {
      type: 'breakpoint:set',
      data: breakpoint
    });
  }

  private handleBreakpointRemove(clientId: string, session: DebugSession, data: any): void {
    const { breakpointId } = data;
    const success = this.breakpointManager.removeBreakpoint(breakpointId);
    
    if (success) {
      session.breakpoints.delete(breakpointId);
      this.sendToClient(clientId, {
        type: 'breakpoint:removed',
        data: { breakpointId }
      });
    }
  }

  private handleExecutionStep(clientId: string, session: DebugSession, data: any): void {
    // Handle step-through debugging commands
    const { command, executionId } = data;
    
    // This would integrate with execution engine for actual stepping
    this.sendToClient(clientId, {
      type: 'execution:step-result',
      data: { command, executionId, success: true }
    });
  }

  private handleVisualizationConfig(clientId: string, session: DebugSession, data: any): void {
    session.visualizationConfig = { ...session.visualizationConfig, ...data };
    this.sendToClient(clientId, {
      type: 'visualization:config-updated',
      data: session.visualizationConfig
    });
  }

  private setupEventHandlers(): void {
    // Listen to trace collector events
    this.traceCollector.on('trace:started', (trace: ExecutionTrace) => {
      this.broadcast({
        type: 'trace:started',
        data: trace
      });
    });

    this.traceCollector.on('trace:step-added', ({ executionId, step }) => {
      this.broadcast({
        type: 'trace:step-added',
        data: { executionId, step }
      });
    });

    this.traceCollector.on('trace:completed', (trace: ExecutionTrace) => {
      this.broadcast({
        type: 'trace:completed',
        data: trace
      });
    });

    // Listen to breakpoint manager events
    this.breakpointManager.on('breakpoint:hit', (data) => {
      this.broadcast({
        type: 'breakpoint:hit',
        data
      });
    });

    // Listen to performance analyzer events
    this.performanceAnalyzer.on('bottleneck:detected', (data) => {
      this.broadcast({
        type: 'performance:bottleneck-detected',
        data
      });
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    }, this.config.heartbeatInterval);
  }

  // Helper methods for visualization

  private generateFlowDiagram(trace: ExecutionTrace): { nodes: FlowDiagramNode[]; edges: FlowDiagramEdge[] } {
    const nodes: FlowDiagramNode[] = [];
    const edges: FlowDiagramEdge[] = [];

    // Create start node
    nodes.push({
      id: 'start',
      label: 'Start',
      type: 'start',
      status: 'completed',
      metadata: { executionId: trace.executionId },
      position: { x: 0, y: 0 },
      style: {
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 2,
        textColor: '#FFFFFF',
        shape: 'circle'
      }
    });

    // Create step nodes
    trace.steps.forEach((step, index) => {
      nodes.push({
        id: step.stepId,
        label: step.stepName,
        type: 'agent',
        status: step.status,
        metadata: { 
          step,
          duration: step.duration,
          resourceUsage: step.resourceUsage
        },
        position: { x: (index + 1) * 200, y: 0 },
        style: this.getNodeStyleForStatus(step.status)
      });

      // Create edge from previous node
      const sourceId = index === 0 ? 'start' : trace.steps[index - 1].stepId;
      edges.push({
        id: `edge-${sourceId}-${step.stepId}`,
        source: sourceId,
        target: step.stepId,
        type: 'execution',
        metadata: { duration: step.duration },
        style: {
          color: '#2196F3',
          width: 2,
          style: 'solid',
          animated: step.status === 'running'
        }
      });
    });

    // Create end node
    const endId = 'end';
    nodes.push({
      id: endId,
      label: trace.status === 'completed' ? 'Success' : 'End',
      type: 'end',
      status: trace.status,
      metadata: { 
        executionId: trace.executionId,
        totalDuration: trace.duration 
      },
      position: { x: (trace.steps.length + 1) * 200, y: 0 },
      style: {
        backgroundColor: trace.status === 'completed' ? '#4CAF50' : '#F44336',
        borderColor: trace.status === 'completed' ? '#388E3C' : '#C62828',
        borderWidth: 2,
        textColor: '#FFFFFF',
        shape: 'circle'
      }
    });

    // Edge to end node
    if (trace.steps.length > 0) {
      const lastStep = trace.steps[trace.steps.length - 1];
      edges.push({
        id: `edge-${lastStep.stepId}-${endId}`,
        source: lastStep.stepId,
        target: endId,
        type: 'execution',
        metadata: {},
        style: {
          color: '#2196F3',
          width: 2,
          style: 'solid',
          animated: false
        }
      });
    }

    return { nodes, edges };
  }

  private generateTokenVisualization(trace: ExecutionTrace): any {
    return {
      totalUsage: trace.tokenUsage,
      stepBreakdown: trace.tokenUsage.tokensPerStep,
      heatMap: trace.steps.map((step, index) => ({
        stepIndex: index,
        stepName: step.stepName,
        tokens: trace.tokenUsage.tokensPerStep[index]?.inputTokens + 
                trace.tokenUsage.tokensPerStep[index]?.outputTokens || 0,
        intensity: Math.min(1, (trace.tokenUsage.tokensPerStep[index]?.inputTokens + 
                             trace.tokenUsage.tokensPerStep[index]?.outputTokens || 0) / 1000)
      })),
      costAnalysis: {
        totalCost: trace.tokenUsage.estimatedCost,
        breakdown: trace.tokenUsage.costBreakdown,
        suggestions: trace.tokenUsage.wasteAnalysis.suggestions
      }
    };
  }

  private generateDecisionTree(trace: ExecutionTrace): any {
    // Build hierarchical structure from decision nodes
    const rootNodes = trace.decisions.filter(d => !d.parentNodeId);
    
    const buildTree = (nodeId: string): any => {
      const node = trace.decisions.find(d => d.nodeId === nodeId);
      if (!node) return null;
      
      const children = trace.decisions
        .filter(d => d.parentNodeId === nodeId)
        .map(child => buildTree(child.nodeId));
        
      return {
        ...node,
        children: children.filter(Boolean)
      };
    };
    
    return rootNodes.map(root => buildTree(root.nodeId));
  }

  private getNodeStyleForStatus(status: string): NodeStyle {
    const styles: Record<string, NodeStyle> = {
      pending: {
        backgroundColor: '#FFC107',
        borderColor: '#FF8F00',
        borderWidth: 2,
        textColor: '#000000',
        shape: 'rectangle'
      },
      running: {
        backgroundColor: '#2196F3',
        borderColor: '#1976D2',
        borderWidth: 2,
        textColor: '#FFFFFF',
        shape: 'rectangle'
      },
      completed: {
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 2,
        textColor: '#FFFFFF',
        shape: 'rectangle'
      },
      failed: {
        backgroundColor: '#F44336',
        borderColor: '#C62828',
        borderWidth: 2,
        textColor: '#FFFFFF',
        shape: 'rectangle'
      }
    };
    
    return styles[status] || styles.pending;
  }

  private getDefaultVisualizationConfig(): VisualizationConfig {
    return {
      layout: 'hierarchical',
      nodeSize: 'medium',
      showLabels: true,
      showMetrics: true,
      enableInteraction: true,
      colorScheme: 'default',
      animationSpeed: 1,
      enableAnimations: true,
      filters: {
        showOnlyErrors: false,
        showOnlyLongRunning: false,
        hideSuccessful: false,
        agentFilter: [],
        timeRangeFilter: { start: '', end: '' },
        performanceThreshold: 0
      }
    };
  }

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}