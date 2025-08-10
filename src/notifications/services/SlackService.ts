/**
 * Slack Integration Service
 */

import axios, { AxiosResponse } from 'axios';
import {
  NotificationPayload,
  SlackMessage,
  SlackBlock,
  SlackAttachment,
  NotificationResult
} from '../types/NotificationTypes';

export class SlackService {
  private readonly webhookUrl?: string;
  private readonly botToken?: string;
  private readonly rateLimiter: Map<string, number[]> = new Map();
  private readonly rateLimitRpm: number;

  constructor(
    webhookUrl?: string,
    botToken?: string,
    rateLimitRpm: number = 50
  ) {
    this.webhookUrl = webhookUrl;
    this.botToken = botToken;
    this.rateLimitRpm = rateLimitRpm;
  }

  public async sendNotification(
    payload: NotificationPayload,
    channel?: string
  ): Promise<NotificationResult> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Slack service not configured');
      }

      // Check rate limiting
      if (!this.checkRateLimit(channel || 'default')) {
        throw new Error('Rate limit exceeded');
      }

      const message = this.formatMessage(payload);
      
      if (channel && this.botToken) {
        // Use bot API for specific channels
        return await this.sendViaBot(message, channel);
      } else if (this.webhookUrl) {
        // Use webhook for general notifications
        return await this.sendViaWebhook(message);
      }

      throw new Error('No valid Slack configuration available');

    } catch (error) {
      return {
        success: false,
        platform: 'slack',
        channel: channel || 'webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendViaWebhook(message: SlackMessage): Promise<NotificationResult> {
    if (!this.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const response: AxiosResponse = await axios.post(
      this.webhookUrl,
      message,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.status !== 200) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }

    return {
      success: true,
      platform: 'slack',
      channel: 'webhook',
      timestamp: new Date().toISOString()
    };
  }

  private async sendViaBot(message: SlackMessage, channel: string): Promise<NotificationResult> {
    if (!this.botToken) {
      throw new Error('Bot token not configured');
    }

    const response: AxiosResponse = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        ...message,
        channel: channel.startsWith('#') ? channel : `#${channel}`
      },
      {
        headers: {
          'Authorization': `Bearer ${this.botToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const data = response.data;
    
    if (!data.ok) {
      throw new Error(`Bot API error: ${data.error}`);
    }

    return {
      success: true,
      platform: 'slack',
      channel,
      messageId: data.ts,
      timestamp: new Date().toISOString()
    };
  }

  private formatMessage(payload: NotificationPayload): SlackMessage {
    const color = this.getColorForPriority(payload.priority);
    const emoji = this.getEmojiForEvent(payload.event);

    const blocks: SlackBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${payload.event.replace('_', ' ').toUpperCase()}*`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Message:*\n${payload.message}`
          },
          {
            type: 'mrkdwn',
            text: `*Source:*\n${payload.source}`
          }
        ]
      }
    ];

    // Add contextual fields
    const contextFields: Array<{ type: string; text: string }> = [];
    
    if (payload.agentName) {
      contextFields.push({
        type: 'mrkdwn',
        text: `*Agent:*\n${payload.agentName}`
      });
    }

    if (payload.ticketId) {
      contextFields.push({
        type: 'mrkdwn',
        text: `*Ticket:*\n${payload.ticketId}`
      });
    }

    if (payload.projectName) {
      contextFields.push({
        type: 'mrkdwn',
        text: `*Project:*\n${payload.projectName}`
      });
    }

    if (contextFields.length > 0) {
      blocks.push({
        type: 'section',
        fields: contextFields
      });
    }

    // Add metrics if available
    if (payload.metrics) {
      const metricsFields: Array<{ type: string; text: string }> = [];
      
      if (payload.metrics.duration) {
        metricsFields.push({
          type: 'mrkdwn',
          text: `*Duration:*\n${payload.metrics.duration}ms`
        });
      }

      if (payload.metrics.tokenCount) {
        metricsFields.push({
          type: 'mrkdwn',
          text: `*Tokens:*\n${payload.metrics.tokenCount}`
        });
      }

      if (metricsFields.length > 0) {
        blocks.push({
          type: 'section',
          fields: metricsFields
        });
      }
    }

    // Add error details if present
    if (payload.error) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:* \`${payload.error.type}\`\n\`\`\`${payload.error.message}\`\`\``
        }
      });
    }

    // Add timestamp
    blocks.push({
      type: 'context',
      text: {
        type: 'mrkdwn',
        text: `<!date^${Math.floor(Date.parse(payload.timestamp) / 1000)}^{date_short} at {time}|${payload.timestamp}>`
      }
    });

    return {
      username: 'Dev-Agency Bot',
      icon_emoji: ':robot_face:',
      blocks,
      attachments: [{
        color,
        fallback: payload.message
      }]
    };
  }

  private getColorForPriority(priority: string): string {
    const colors = {
      low: '#36a64f',      // green
      normal: '#2eb886',   // teal
      high: '#ff9500',     // orange
      critical: '#e01e5a'  // red
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  }

  private getEmojiForEvent(event: string): string {
    const emojis = {
      agent_start: ':rocket:',
      agent_complete: ':white_check_mark:',
      agent_error: ':x:',
      agent_timeout: ':hourglass_flowing_sand:',
      system_health: ':heart:',
      circuit_breaker_open: ':warning:',
      circuit_breaker_close: ':green_heart:',
      degradation_start: ':yellow_heart:',
      degradation_end: ':green_heart:'
    };
    return emojis[event as keyof typeof emojis] || ':information_source:';
  }

  private checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const requests = this.rateLimiter.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= this.rateLimitRpm) {
      return false;
    }
    
    recentRequests.push(now);
    this.rateLimiter.set(identifier, recentRequests);
    return true;
  }

  public isConfigured(): boolean {
    return !!(this.webhookUrl || this.botToken);
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (this.botToken) {
        const response = await axios.post(
          'https://slack.com/api/auth.test',
          {},
          {
            headers: {
              'Authorization': `Bearer ${this.botToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );
        return response.data.ok;
      } else if (this.webhookUrl) {
        // Test webhook with a minimal payload
        const response = await axios.post(
          this.webhookUrl,
          { text: 'Connection test' },
          { timeout: 5000 }
        );
        return response.status === 200;
      }
      return false;
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return false;
    }
  }
}