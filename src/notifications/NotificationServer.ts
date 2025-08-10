/**
 * Notification Server for handling webhooks and slash commands
 */

import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { SlashCommandHandler } from './handlers/SlashCommandHandler';
import { NotificationManager } from './NotificationManager';
import { SlashCommandRequest } from './types/NotificationTypes';

export interface NotificationServerConfig {
  port: number;
  enableCors: boolean;
  enableSecurity: boolean;
  enableCompression: boolean;
  baseUrl?: string;
}

export class NotificationServer {
  private app: Application;
  private server: any;
  private config: NotificationServerConfig;
  private slashCommandHandler: SlashCommandHandler;
  private notificationManager: NotificationManager;

  constructor(
    config: NotificationServerConfig,
    notificationManager?: NotificationManager,
    slashCommandHandler?: SlashCommandHandler
  ) {
    this.config = config;
    this.app = express();
    this.notificationManager = notificationManager || new NotificationManager();
    this.slashCommandHandler = slashCommandHandler || new SlashCommandHandler();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    if (this.config.enableSecurity) {
      this.app.use(helmet());
    }

    // CORS middleware
    if (this.config.enableCors) {
      this.app.use(cors());
    }

    // Compression middleware
    if (this.config.enableCompression) {
      this.app.use(compression());
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Error handling middleware
    this.app.use((error: Error, req: Request, res: Response, next: any) => {
      console.error('Server error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      const status = this.notificationManager.getStatus();
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        notifications: status,
        version: '1.0.0'
      });
    });

    // Notification status endpoint
    this.app.get('/api/notifications/status', (req: Request, res: Response) => {
      const status = this.notificationManager.getStatus();
      res.json(status);
    });

    // Test connections endpoint
    this.app.post('/api/notifications/test', async (req: Request, res: Response) => {
      try {
        const results = await this.notificationManager.testConnections();
        res.json({
          success: true,
          results,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Manual notification endpoint
    this.app.post('/api/notifications/send', async (req: Request, res: Response) => {
      try {
        const payload = req.body;
        
        // Basic validation
        if (!payload.event || !payload.message) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: event, message'
          });
        }

        const results = await this.notificationManager.notify({
          timestamp: new Date().toISOString(),
          source: 'Manual API',
          priority: 'normal',
          ...payload
        });

        res.json({
          success: true,
          results,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Slack slash command webhook
    this.app.post('/webhooks/slack/command', async (req: Request, res: Response) => {
      try {
        const slackRequest: SlashCommandRequest = req.body;
        
        // Validate request
        if (!this.slashCommandHandler.validateRequest(slackRequest)) {
          return res.status(400).json({
            error: 'Invalid request format'
          });
        }

        const response = await this.slashCommandHandler.handleCommand(slackRequest);
        res.json(response);
      } catch (error) {
        console.error('Slack command error:', error);
        res.json({
          response_type: 'ephemeral',
          text: '❌ An error occurred while processing your command.'
        });
      }
    });

    // Teams webhook (for receiving events, not used for slash commands)
    this.app.post('/webhooks/teams/events', (req: Request, res: Response) => {
      try {
        // Teams doesn't have slash commands like Slack, but this could handle
        // incoming webhook events or message actions
        console.log('Teams webhook received:', req.body);
        res.json({ success: true });
      } catch (error) {
        console.error('Teams webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Agent status update endpoint (for internal use)
    this.app.post('/api/agents/status', (req: Request, res: Response) => {
      try {
        const { agentName, status } = req.body;
        
        if (!agentName || !status) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: agentName, status'
          });
        }

        this.slashCommandHandler.updateAgentStatus(agentName, status);
        
        res.json({
          success: true,
          message: 'Agent status updated',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Get all agent statuses endpoint
    this.app.get('/api/agents/status', (req: Request, res: Response) => {
      try {
        const statuses = this.slashCommandHandler.getAllStatuses();
        res.json({
          success: true,
          statuses,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Documentation endpoint
    this.app.get('/api/docs', (req: Request, res: Response) => {
      res.json({
        title: 'Dev-Agency Notification Service',
        version: '1.0.0',
        endpoints: {
          health: 'GET /health - Service health check',
          status: 'GET /api/notifications/status - Get notification service status',
          test: 'POST /api/notifications/test - Test notification connections',
          send: 'POST /api/notifications/send - Send manual notification',
          slackCommands: 'POST /webhooks/slack/command - Handle Slack slash commands',
          teamsWebhook: 'POST /webhooks/teams/events - Handle Teams webhooks',
          agentStatus: 'POST /api/agents/status - Update agent status',
          getAgentStatus: 'GET /api/agents/status - Get all agent statuses'
        },
        slashCommands: {
          '/agent-status [agentName]': 'Get agent status (specific or all)',
          '/agent-health': 'Get system health status',
          '/agent-invoke <command> [args]': 'Invoke simple agent commands'
        }
      });
    });

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        service: 'Dev-Agency Notification Service',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        documentation: `${this.config.baseUrl || `http://localhost:${this.config.port}`}/api/docs`
      });
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          console.log(`🚀 Notification server started on port ${this.config.port}`);
          console.log(`📖 Documentation: http://localhost:${this.config.port}/api/docs`);
          console.log(`💚 Health check: http://localhost:${this.config.port}/health`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('📴 Notification server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public getNotificationManager(): NotificationManager {
    return this.notificationManager;
  }

  public getSlashCommandHandler(): SlashCommandHandler {
    return this.slashCommandHandler;
  }
}

// Default server configuration
export const DEFAULT_SERVER_CONFIG: NotificationServerConfig = {
  port: 3002,
  enableCors: true,
  enableSecurity: true,
  enableCompression: true
};