/**
 * Slash Command Handler for Slack/Teams
 */

import {
  SlashCommandRequest,
  SlashCommandResponse,
  SlackBlock
} from '../types/NotificationTypes';

export interface AgentStatus {
  name: string;
  status: 'idle' | 'running' | 'error';
  currentTask?: string;
  startTime?: string;
  lastActivity?: string;
}

export interface SystemStatus {
  health: 'healthy' | 'degraded' | 'critical';
  uptime: string;
  activeAgents: number;
  completedTasks: number;
  errors: number;
  version: string;
}

export class SlashCommandHandler {
  private agentStatuses: Map<string, AgentStatus> = new Map();
  private systemStartTime: Date = new Date();

  /**
   * Handle incoming slash command
   */
  public async handleCommand(request: SlashCommandRequest): Promise<SlashCommandResponse> {
    const { command, text, user_name } = request;
    const args = text.trim().split(/\s+/).filter(Boolean);

    try {
      switch (command) {
        case '/agent-status':
          return await this.handleStatusCommand(args, user_name);
        
        case '/agent-health':
          return await this.handleHealthCommand(args, user_name);
        
        case '/agent-invoke':
          return await this.handleInvokeCommand(args, user_name);
        
        default:
          return this.createErrorResponse(`Unknown command: ${command}`);
      }
    } catch (error) {
      console.error('Slash command error:', error);
      return this.createErrorResponse('An error occurred while processing the command.');
    }
  }

  private async handleStatusCommand(args: string[], userName: string): Promise<SlashCommandResponse> {
    const agentName = args[0];

    if (agentName) {
      // Get specific agent status
      const status = this.agentStatuses.get(agentName);
      
      if (!status) {
        return this.createResponse(`Agent \`${agentName}\` not found.`);
      }

      const blocks: SlackBlock[] = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Agent Status: ${agentName}*`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Status:* ${this.getStatusEmoji(status.status)} ${status.status}`
            },
            {
              type: 'mrkdwn',
              text: `*Current Task:* ${status.currentTask || 'None'}`
            },
            {
              type: 'mrkdwn',
              text: `*Start Time:* ${status.startTime || 'N/A'}`
            },
            {
              type: 'mrkdwn',
              text: `*Last Activity:* ${status.lastActivity || 'N/A'}`
            }
          ]
        }
      ];

      return {
        response_type: 'ephemeral',
        blocks
      };
    } else {
      // Get all agent statuses
      const allStatuses = Array.from(this.agentStatuses.values());
      
      if (allStatuses.length === 0) {
        return this.createResponse('No agents currently tracked.');
      }

      const blocks: SlackBlock[] = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*All Agent Statuses:*'
          }
        }
      ];

      // Group by status
      const byStatus = {
        running: allStatuses.filter(s => s.status === 'running'),
        idle: allStatuses.filter(s => s.status === 'idle'),
        error: allStatuses.filter(s => s.status === 'error')
      };

      Object.entries(byStatus).forEach(([statusType, agents]) => {
        if (agents.length > 0) {
          blocks.push({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${this.getStatusEmoji(statusType as any)} ${statusType.toUpperCase()} (${agents.length}):*\n${agents.map(a => `• ${a.name}${a.currentTask ? ` - ${a.currentTask}` : ''}`).join('\n')}`
            }
          });
        }
      });

      return {
        response_type: 'ephemeral',
        blocks
      };
    }
  }

  private async handleHealthCommand(args: string[], userName: string): Promise<SlashCommandResponse> {
    const systemStatus = this.getSystemStatus();
    
    const blocks: SlackBlock[] = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*System Health Status*'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Health:* ${this.getHealthEmoji(systemStatus.health)} ${systemStatus.health.toUpperCase()}`
          },
          {
            type: 'mrkdwn',
            text: `*Uptime:* ${systemStatus.uptime}`
          },
          {
            type: 'mrkdwn',
            text: `*Active Agents:* ${systemStatus.activeAgents}`
          },
          {
            type: 'mrkdwn',
            text: `*Completed Tasks:* ${systemStatus.completedTasks}`
          },
          {
            type: 'mrkdwn',
            text: `*Errors:* ${systemStatus.errors}`
          },
          {
            type: 'mrkdwn',
            text: `*Version:* ${systemStatus.version}`
          }
        ]
      }
    ];

    return {
      response_type: 'ephemeral',
      blocks
    };
  }

  private async handleInvokeCommand(args: string[], userName: string): Promise<SlashCommandResponse> {
    if (args.length === 0) {
      return this.createErrorResponse('Usage: `/agent-invoke <command> [args]`\n\nAvailable commands:\n• `status` - Get system status\n• `health-check` - Run health check\n• `list-agents` - List available agents');
    }

    const subCommand = args[0];

    switch (subCommand) {
      case 'status':
        return this.handleStatusCommand(args.slice(1), userName);
      
      case 'health-check':
        return this.createResponse('🔍 Running health check...\n_This is a simulated response. In a real implementation, this would trigger an actual health check._');
      
      case 'list-agents':
        const availableAgents = [
          'architect', 'coder', 'tester', 'security', 'documenter', 
          'performance', 'integration', 'mcp-dev', 'hooks'
        ];
        
        return this.createResponse(`*Available Agents:*\n${availableAgents.map(name => `• ${name}`).join('\n')}`);
      
      default:
        return this.createErrorResponse(`Unknown invoke command: ${subCommand}`);
    }
  }

  private getStatusEmoji(status: string): string {
    const emojis = {
      idle: '⚪',
      running: '🟢',
      error: '🔴'
    };
    return emojis[status as keyof typeof emojis] || '❔';
  }

  private getHealthEmoji(health: string): string {
    const emojis = {
      healthy: '💚',
      degraded: '💛',
      critical: '❤️'
    };
    return emojis[health as keyof typeof emojis] || '❔';
  }

  private getSystemStatus(): SystemStatus {
    const now = new Date();
    const uptime = Math.floor((now.getTime() - this.systemStartTime.getTime()) / 1000);
    const activeAgents = Array.from(this.agentStatuses.values()).filter(s => s.status === 'running').length;
    const errors = Array.from(this.agentStatuses.values()).filter(s => s.status === 'error').length;

    return {
      health: errors > 0 ? 'degraded' : 'healthy',
      uptime: this.formatUptime(uptime),
      activeAgents,
      completedTasks: this.getCompletedTaskCount(),
      errors,
      version: '1.0.0'
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  private getCompletedTaskCount(): number {
    // In a real implementation, this would come from persistent storage
    return 42; // Mock value
  }

  private createResponse(text: string): SlashCommandResponse {
    return {
      response_type: 'ephemeral',
      text
    };
  }

  private createErrorResponse(error: string): SlashCommandResponse {
    return {
      response_type: 'ephemeral',
      text: `❌ Error: ${error}`
    };
  }

  /**
   * Update agent status (called by agent system)
   */
  public updateAgentStatus(agentName: string, status: AgentStatus): void {
    this.agentStatuses.set(agentName, {
      ...status,
      lastActivity: new Date().toISOString()
    });
  }

  /**
   * Remove agent status when agent stops
   */
  public removeAgentStatus(agentName: string): void {
    this.agentStatuses.delete(agentName);
  }

  /**
   * Get current agent statuses
   */
  public getAllStatuses(): AgentStatus[] {
    return Array.from(this.agentStatuses.values());
  }

  /**
   * Validate slash command request
   */
  public validateRequest(request: SlashCommandRequest): boolean {
    // Basic validation
    return !!(
      request.command &&
      request.user_id &&
      request.channel_id
    );
  }
}