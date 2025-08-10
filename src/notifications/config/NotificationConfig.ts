/**
 * Notification Configuration Manager
 */

import { NotificationConfig, ChannelMapping, NotificationEvent } from '../types/NotificationTypes';

export class NotificationConfigManager {
  private config: NotificationConfig;
  private static instance: NotificationConfigManager;

  constructor(config?: NotificationConfig) {
    this.config = config || this.getDefaultConfig();
    this.loadFromEnvironment();
  }

  public static getInstance(config?: NotificationConfig): NotificationConfigManager {
    if (!NotificationConfigManager.instance) {
      NotificationConfigManager.instance = new NotificationConfigManager(config);
    }
    return NotificationConfigManager.instance;
  }

  private getDefaultConfig(): NotificationConfig {
    return {
      slack: {
        enabled: false,
        channels: [],
        rateLimitRpm: 50
      },
      teams: {
        enabled: false,
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
    };
  }

  private loadFromEnvironment(): void {
    // Slack configuration from environment
    if (process.env.SLACK_ENABLED === 'true') {
      this.config.slack = {
        ...this.config.slack,
        enabled: true,
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        botToken: process.env.SLACK_BOT_TOKEN,
        defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || '#dev-agency',
        rateLimitRpm: parseInt(process.env.SLACK_RATE_LIMIT_RPM || '50', 10),
        channels: this.config.slack?.channels || []
      };
    }

    // Teams configuration from environment
    if (process.env.TEAMS_ENABLED === 'true') {
      this.config.teams = {
        ...this.config.teams,
        enabled: true,
        webhookUrl: process.env.TEAMS_WEBHOOK_URL,
        rateLimitRpm: parseInt(process.env.TEAMS_RATE_LIMIT_RPM || '50', 10),
        channels: this.config.teams?.channels || []
      };
    }

    // Global configuration
    if (process.env.NOTIFICATION_RETRY_ATTEMPTS) {
      this.config.global!.retryAttempts = parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS, 10);
    }

    if (process.env.NOTIFICATION_TIMEOUT_MS) {
      this.config.global!.timeoutMs = parseInt(process.env.NOTIFICATION_TIMEOUT_MS, 10);
    }

    // Load channel mappings from JSON if provided
    if (process.env.NOTIFICATION_CHANNELS_CONFIG) {
      try {
        const channelConfig = JSON.parse(process.env.NOTIFICATION_CHANNELS_CONFIG);
        if (channelConfig.slack) {
          this.config.slack!.channels = channelConfig.slack;
        }
        if (channelConfig.teams) {
          this.config.teams!.channels = channelConfig.teams;
        }
      } catch (error) {
        console.warn('Failed to parse NOTIFICATION_CHANNELS_CONFIG:', error);
      }
    }
  }

  public getConfig(): NotificationConfig {
    return { ...this.config };
  }

  public isSlackEnabled(): boolean {
    return this.config.slack?.enabled || false;
  }

  public isTeamsEnabled(): boolean {
    return this.config.teams?.enabled || false;
  }

  public isEventEnabled(event: NotificationEvent): boolean {
    return this.config.global?.enabledEvents.includes(event) || false;
  }

  public getChannelForEvent(
    platform: 'slack' | 'teams',
    event: NotificationEvent,
    context?: {
      projectName?: string;
      agentName?: string;
    }
  ): string | null {
    const platformConfig = platform === 'slack' ? this.config.slack : this.config.teams;
    
    if (!platformConfig?.enabled) return null;

    // Find matching channel mapping
    for (const mapping of platformConfig.channels) {
      if (!mapping.events.includes(event)) continue;

      // Check project pattern
      if (mapping.projectPattern && context?.projectName) {
        const projectRegex = new RegExp(mapping.projectPattern);
        if (!projectRegex.test(context.projectName)) continue;
      }

      // Check agent pattern
      if (mapping.agentPattern && context?.agentName) {
        const agentRegex = new RegExp(mapping.agentPattern);
        if (!agentRegex.test(context.agentName)) continue;
      }

      return mapping.channel;
    }

    // Return default channel if no specific mapping found
    if (platform === 'slack' && this.config.slack?.defaultChannel) {
      return this.config.slack.defaultChannel;
    }

    // Return webhook URL if no channel mappings
    return platformConfig.webhookUrl || null;
  }

  public getRetryConfig() {
    return {
      attempts: this.config.global?.retryAttempts || 3,
      delayMs: this.config.global?.retryDelayMs || 1000,
      timeoutMs: this.config.global?.timeoutMs || 10000
    };
  }

  public updateConfig(updates: Partial<NotificationConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      slack: { ...this.config.slack!, ...updates.slack },
      teams: { ...this.config.teams!, ...updates.teams },
      global: { ...this.config.global!, ...updates.global }
    };
  }

  public addChannelMapping(platform: 'slack' | 'teams', mapping: ChannelMapping): void {
    const platformConfig = platform === 'slack' ? this.config.slack : this.config.teams;
    if (platformConfig) {
      platformConfig.channels.push(mapping);
    }
  }

  public validateConfig(): string[] {
    const errors: string[] = [];

    if (this.config.slack?.enabled) {
      if (!this.config.slack.webhookUrl && !this.config.slack.botToken) {
        errors.push('Slack enabled but no webhook URL or bot token provided');
      }
    }

    if (this.config.teams?.enabled) {
      if (!this.config.teams.webhookUrl) {
        errors.push('Teams enabled but no webhook URL provided');
      }
    }

    if (!this.config.global?.enabledEvents?.length) {
      errors.push('No notification events enabled');
    }

    return errors;
  }
}

// Default configuration factory
export function createDefaultChannelMappings(): {
  slack: ChannelMapping[];
  teams: ChannelMapping[];
} {
  return {
    slack: [
      {
        projectPattern: '.*',
        channel: '#dev-agency-general',
        events: ['agent_start', 'agent_complete', 'agent_error']
      },
      {
        agentPattern: 'security|audit',
        channel: '#security-alerts',
        events: ['agent_complete', 'agent_error', 'system_health']
      },
      {
        channel: '#critical-alerts',
        events: ['circuit_breaker_open', 'degradation_start']
      }
    ],
    teams: [
      {
        projectPattern: '.*',
        channel: 'https://outlook.office.com/webhook/...',
        events: ['agent_complete', 'agent_error', 'system_health']
      }
    ]
  };
}