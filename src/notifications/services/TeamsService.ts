/**
 * Microsoft Teams Integration Service
 */

import axios, { AxiosResponse } from 'axios';
import {
  NotificationPayload,
  TeamsMessage,
  TeamsSection,
  NotificationResult
} from '../types/NotificationTypes';

export class TeamsService {
  private readonly webhookUrl?: string;
  private readonly rateLimiter: Map<string, number[]> = new Map();
  private readonly rateLimitRpm: number;

  constructor(
    webhookUrl?: string,
    rateLimitRpm: number = 50
  ) {
    this.webhookUrl = webhookUrl;
    this.rateLimitRpm = rateLimitRpm;
  }

  public async sendNotification(
    payload: NotificationPayload,
    channel?: string
  ): Promise<NotificationResult> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Teams service not configured');
      }

      // Check rate limiting
      if (!this.checkRateLimit(channel || 'default')) {
        throw new Error('Rate limit exceeded');
      }

      const message = this.formatMessage(payload);
      const targetUrl = channel || this.webhookUrl!;
      
      return await this.sendViaWebhook(message, targetUrl);

    } catch (error) {
      return {
        success: false,
        platform: 'teams',
        channel: channel || 'webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async sendViaWebhook(message: TeamsMessage, webhookUrl: string): Promise<NotificationResult> {
    const response: AxiosResponse = await axios.post(
      webhookUrl,
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
      platform: 'teams',
      channel: 'webhook',
      timestamp: new Date().toISOString()
    };
  }

  private formatMessage(payload: NotificationPayload): TeamsMessage {
    const themeColor = this.getColorForPriority(payload.priority);
    const title = `${this.getEmojiForEvent(payload.event)} ${payload.event.replace('_', ' ').toUpperCase()}`;

    const sections: TeamsSection[] = [
      {
        activityTitle: title,
        activitySubtitle: payload.message,
        facts: this.buildFacts(payload),
        markdown: true
      }
    ];

    // Add error section if present
    if (payload.error) {
      sections.push({
        activityTitle: '❌ Error Details',
        facts: [
          { name: 'Type', value: payload.error.type },
          { name: 'Message', value: payload.error.message }
        ],
        markdown: true
      });
    }

    // Add metrics section if present
    if (payload.metrics) {
      const metricsFacts = [];
      
      if (payload.metrics.duration) {
        metricsFacts.push({
          name: 'Duration',
          value: `${payload.metrics.duration}ms`
        });
      }

      if (payload.metrics.tokenCount) {
        metricsFacts.push({
          name: 'Token Count',
          value: payload.metrics.tokenCount.toString()
        });
      }

      if (payload.metrics.success !== undefined) {
        metricsFacts.push({
          name: 'Success',
          value: payload.metrics.success ? 'Yes' : 'No'
        });
      }

      if (metricsFacts.length > 0) {
        sections.push({
          activityTitle: '📊 Metrics',
          facts: metricsFacts,
          markdown: true
        });
      }
    }

    const message: TeamsMessage = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      summary: payload.message,
      themeColor,
      sections
    };

    return message;
  }

  private buildFacts(payload: NotificationPayload): Array<{ name: string; value: string }> {
    const facts: Array<{ name: string; value: string }> = [
      { name: 'Source', value: payload.source },
      { name: 'Timestamp', value: new Date(payload.timestamp).toLocaleString() }
    ];

    if (payload.agentName) {
      facts.push({ name: 'Agent', value: payload.agentName });
    }

    if (payload.ticketId) {
      facts.push({ name: 'Ticket ID', value: payload.ticketId });
    }

    if (payload.projectName) {
      facts.push({ name: 'Project', value: payload.projectName });
    }

    facts.push({ name: 'Priority', value: payload.priority.toUpperCase() });

    return facts;
  }

  private getColorForPriority(priority: string): string {
    const colors = {
      low: '28a745',      // green
      normal: '17a2b8',   // teal
      high: 'ffc107',     // yellow/orange
      critical: 'dc3545' // red
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  }

  private getEmojiForEvent(event: string): string {
    const emojis = {
      agent_start: '🚀',
      agent_complete: '✅',
      agent_error: '❌',
      agent_timeout: '⏳',
      system_health: '❤️',
      circuit_breaker_open: '⚠️',
      circuit_breaker_close: '💚',
      degradation_start: '💛',
      degradation_end: '💚'
    };
    return emojis[event as keyof typeof emojis] || 'ℹ️';
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
    return !!this.webhookUrl;
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.webhookUrl) return false;

      // Test webhook with a minimal payload
      const testMessage: TeamsMessage = {
        '@type': 'MessageCard',
        '@context': 'http://schema.org/extensions',
        summary: 'Connection test',
        sections: [{
          activityTitle: 'Connection Test',
          facts: [
            { name: 'Status', value: 'Testing connection' },
            { name: 'Timestamp', value: new Date().toISOString() }
          ]
        }]
      };

      const response = await axios.post(
        this.webhookUrl,
        testMessage,
        { 
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Teams connection test failed:', error);
      return false;
    }
  }
}