/**
 * Main Notification Manager
 * Orchestrates Slack and Teams notifications
 */

import { SlackService } from './services/SlackService';
import { TeamsService } from './services/TeamsService';
import { NotificationConfigManager } from './config/NotificationConfig';
import {
  NotificationPayload,
  NotificationResult,
  NotificationEvent,
  NotificationPriority
} from './types/NotificationTypes';

export class NotificationManager {
  private slackService!: SlackService;
  private teamsService!: TeamsService;
  private configManager: NotificationConfigManager;
  private isInitialized = false;

  constructor(configManager?: NotificationConfigManager) {
    this.configManager = configManager || NotificationConfigManager.getInstance();
    this.initializeServices();
  }

  private initializeServices(): void {
    const config = this.configManager.getConfig();

    // Initialize Slack service
    this.slackService = new SlackService(
      config.slack?.webhookUrl,
      config.slack?.botToken,
      config.slack?.rateLimitRpm
    );

    // Initialize Teams service
    this.teamsService = new TeamsService(
      config.teams?.webhookUrl,
      config.teams?.rateLimitRpm
    );

    this.isInitialized = true;
  }

  /**
   * Send notification to all enabled platforms
   */
  public async notify(payload: NotificationPayload): Promise<NotificationResult[]> {
    if (!this.isInitialized) {
      throw new Error('NotificationManager not initialized');
    }

    if (!this.configManager.isEventEnabled(payload.event)) {
      return [];
    }

    const results: NotificationResult[] = [];
    const promises: Promise<void>[] = [];

    // Send to Slack if enabled
    if (this.configManager.isSlackEnabled()) {
      promises.push(this.sendToSlack(payload).then(result => {
        if (result) results.push(result);
      }));
    }

    // Send to Teams if enabled
    if (this.configManager.isTeamsEnabled()) {
      promises.push(this.sendToTeams(payload).then(result => {
        if (result) results.push(result);
      }));
    }

    // Wait for all notifications to complete
    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Send notification with retry logic
   */
  public async notifyWithRetry(payload: NotificationPayload): Promise<NotificationResult[]> {
    const retryConfig = this.configManager.getRetryConfig();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryConfig.attempts; attempt++) {
      try {
        const results = await this.notify(payload);
        
        // Check if all notifications succeeded
        const hasFailures = results.some(result => !result.success);
        
        if (!hasFailures || attempt === retryConfig.attempts) {
          return results;
        }

        // Log retry attempt
        console.warn(`Notification attempt ${attempt} had failures, retrying...`);
        
        // Wait before retry
        await this.delay(retryConfig.delayMs * attempt);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === retryConfig.attempts) {
          throw lastError;
        }
        
        await this.delay(retryConfig.delayMs * attempt);
      }
    }

    throw lastError || new Error('Max retry attempts exceeded');
  }

  private async sendToSlack(payload: NotificationPayload): Promise<NotificationResult | null> {
    try {
      const channel = this.configManager.getChannelForEvent('slack', payload.event, {
        projectName: payload.projectName,
        agentName: payload.agentName
      });

      return await this.slackService.sendNotification(payload, channel || undefined);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      return {
        success: false,
        platform: 'slack',
        channel: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendToTeams(payload: NotificationPayload): Promise<NotificationResult | null> {
    try {
      const channel = this.configManager.getChannelForEvent('teams', payload.event, {
        projectName: payload.projectName,
        agentName: payload.agentName
      });

      return await this.teamsService.sendNotification(payload, channel || undefined);
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
      return {
        success: false,
        platform: 'teams',
        channel: 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Convenience methods for common notification types
   */
  public async notifyAgentStart(agentName: string, ticketId?: string, projectName?: string): Promise<NotificationResult[]> {
    return this.notify({
      event: 'agent_start',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      source: 'Dev-Agency',
      agentName,
      ticketId,
      projectName,
      message: `Agent ${agentName} has started execution${ticketId ? ` for ticket ${ticketId}` : ''}`
    });
  }

  public async notifyAgentComplete(
    agentName: string,
    duration?: number,
    tokenCount?: number,
    ticketId?: string,
    projectName?: string
  ): Promise<NotificationResult[]> {
    return this.notify({
      event: 'agent_complete',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      source: 'Dev-Agency',
      agentName,
      ticketId,
      projectName,
      message: `Agent ${agentName} completed successfully${ticketId ? ` for ticket ${ticketId}` : ''}`,
      metrics: {
        duration,
        tokenCount,
        success: true
      }
    });
  }

  public async notifyAgentError(
    agentName: string,
    error: Error,
    ticketId?: string,
    projectName?: string
  ): Promise<NotificationResult[]> {
    return this.notify({
      event: 'agent_error',
      priority: 'high',
      timestamp: new Date().toISOString(),
      source: 'Dev-Agency',
      agentName,
      ticketId,
      projectName,
      message: `Agent ${agentName} encountered an error${ticketId ? ` while processing ticket ${ticketId}` : ''}`,
      error: {
        type: error.constructor.name,
        message: error.message,
        stack: error.stack
      }
    });
  }

  public async notifySystemHealth(status: 'healthy' | 'degraded' | 'critical', details?: string): Promise<NotificationResult[]> {
    const priority: NotificationPriority = status === 'critical' ? 'critical' : 
                                          status === 'degraded' ? 'high' : 'normal';
    
    return this.notify({
      event: 'system_health',
      priority,
      timestamp: new Date().toISOString(),
      source: 'Dev-Agency Health Monitor',
      message: `System health status: ${status.toUpperCase()}${details ? ` - ${details}` : ''}`
    });
  }

  /**
   * Test all configured notification services
   */
  public async testConnections(): Promise<{ slack: boolean; teams: boolean }> {
    const results = {
      slack: false,
      teams: false
    };

    if (this.configManager.isSlackEnabled()) {
      results.slack = await this.slackService.testConnection();
    }

    if (this.configManager.isTeamsEnabled()) {
      results.teams = await this.teamsService.testConnection();
    }

    return results;
  }

  /**
   * Get configuration status
   */
  public getStatus() {
    return {
      initialized: this.isInitialized,
      slack: {
        enabled: this.configManager.isSlackEnabled(),
        configured: this.slackService.isConfigured()
      },
      teams: {
        enabled: this.configManager.isTeamsEnabled(),
        configured: this.teamsService.isConfigured()
      },
      enabledEvents: this.configManager.getConfig().global?.enabledEvents || []
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration at runtime
   */
  public updateConfig(configManager: NotificationConfigManager): void {
    this.configManager = configManager;
    this.initializeServices();
  }
}

// Singleton instance
let globalNotificationManager: NotificationManager | null = null;

/**
 * Get or create the global notification manager instance
 */
export function getNotificationManager(configManager?: NotificationConfigManager): NotificationManager {
  if (!globalNotificationManager) {
    globalNotificationManager = new NotificationManager(configManager);
  }
  return globalNotificationManager;
}