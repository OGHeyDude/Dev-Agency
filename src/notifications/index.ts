/**
 * Dev-Agency Notification System
 * Slack/Teams integration for agent notifications and slash commands
 */

// Core notification system
export { NotificationManager, getNotificationManager } from './NotificationManager';
export { NotificationConfigManager, createDefaultChannelMappings } from './config/NotificationConfig';

// Services
export { SlackService } from './services/SlackService';
export { TeamsService } from './services/TeamsService';

// Server and handlers
export { NotificationServer, DEFAULT_SERVER_CONFIG } from './NotificationServer';
export { SlashCommandHandler } from './handlers/SlashCommandHandler';

// Integration
export { 
  AgentNotificationIntegration, 
  getAgentNotificationIntegration, 
  withNotifications 
} from './AgentIntegration';

// Types
export * from './types/NotificationTypes';

// Re-export commonly used interfaces
export type {
  AgentExecutionContext,
  AgentExecutionResult
} from './AgentIntegration';

export type {
  AgentStatus
} from './handlers/SlashCommandHandler';

export type {
  NotificationServerConfig
} from './NotificationServer';

/**
 * Quick setup function for the complete notification system
 */
export async function setupNotificationSystem(options?: {
  serverPort?: number;
  enableSlack?: boolean;
  enableTeams?: boolean;
  slackWebhookUrl?: string;
  slackBotToken?: string;
  teamsWebhookUrl?: string;
  autoStart?: boolean;
}) {
  const {
    serverPort = 3002,
    enableSlack = false,
    enableTeams = false,
    slackWebhookUrl,
    slackBotToken,
    teamsWebhookUrl,
    autoStart = true
  } = options || {};

  // Create configuration
  const configManager = new NotificationConfigManager({
    slack: {
      enabled: enableSlack,
      webhookUrl: slackWebhookUrl,
      botToken: slackBotToken,
      channels: [],
      rateLimitRpm: 50
    },
    teams: {
      enabled: enableTeams,
      webhookUrl: teamsWebhookUrl,
      channels: [],
      rateLimitRpm: 50
    },
    global: {
      enabledEvents: [
        'agent_start',
        'agent_complete',
        'agent_error',
        'system_health'
      ],
      retryAttempts: 3,
      retryDelayMs: 1000,
      timeoutMs: 10000
    }
  });

  // Create notification manager
  const notificationManager = new NotificationManager(configManager);
  
  // Create server
  const server = new NotificationServer({
    port: serverPort,
    enableCors: true,
    enableSecurity: true,
    enableCompression: true
  }, notificationManager);

  // Create agent integration
  const agentIntegration = new AgentNotificationIntegration(
    notificationManager,
    server.getSlashCommandHandler()
  );

  if (autoStart) {
    await server.start();
  }

  return {
    notificationManager,
    server,
    agentIntegration,
    configManager,
    
    // Convenience methods
    async start() {
      if (!autoStart) {
        await server.start();
      }
    },
    
    async stop() {
      await server.stop();
    },
    
    async testConnections() {
      return notificationManager.testConnections();
    },
    
    getStatus() {
      return {
        server: {
          running: true,
          port: serverPort
        },
        notifications: notificationManager.getStatus()
      };
    }
  };
}