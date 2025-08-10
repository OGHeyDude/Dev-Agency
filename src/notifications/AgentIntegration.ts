/**
 * Integration module for hooking notifications into the agent system
 */

import { NotificationManager, getNotificationManager } from './NotificationManager';
import { SlashCommandHandler } from './handlers/SlashCommandHandler';
import type { AgentStatus } from './handlers/SlashCommandHandler';

export interface AgentExecutionContext {
  agentName: string;
  task: string;
  ticketId?: string;
  projectName?: string;
  startTime: Date;
  metadata?: Record<string, any>;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: string;
  error?: Error;
  duration: number;
  tokenCount?: number;
  metadata?: Record<string, any>;
}

export class AgentNotificationIntegration {
  private notificationManager: NotificationManager;
  private slashCommandHandler: SlashCommandHandler;
  private activeExecutions: Map<string, AgentExecutionContext> = new Map();

  constructor(
    notificationManager?: NotificationManager,
    slashCommandHandler?: SlashCommandHandler
  ) {
    this.notificationManager = notificationManager || getNotificationManager();
    this.slashCommandHandler = slashCommandHandler || new SlashCommandHandler();
  }

  /**
   * Hook this into agent execution start
   */
  public async onAgentStart(context: AgentExecutionContext): Promise<void> {
    const executionId = this.generateExecutionId(context);
    this.activeExecutions.set(executionId, context);

    // Update slash command handler status
    this.slashCommandHandler.updateAgentStatus(context.agentName, {
      name: context.agentName,
      status: 'running',
      currentTask: context.task,
      startTime: context.startTime.toISOString()
    });

    // Send notification
    try {
      await this.notificationManager.notifyAgentStart(
        context.agentName,
        context.ticketId,
        context.projectName
      );
    } catch (error) {
      console.warn('Failed to send agent start notification:', error);
    }
  }

  /**
   * Hook this into agent execution completion
   */
  public async onAgentComplete(
    context: AgentExecutionContext,
    result: AgentExecutionResult
  ): Promise<void> {
    const executionId = this.generateExecutionId(context);
    this.activeExecutions.delete(executionId);

    // Update slash command handler status
    this.slashCommandHandler.updateAgentStatus(context.agentName, {
      name: context.agentName,
      status: 'idle',
      currentTask: undefined,
      startTime: undefined
    });

    // Send notification based on result
    try {
      if (result.success) {
        await this.notificationManager.notifyAgentComplete(
          context.agentName,
          result.duration,
          result.tokenCount,
          context.ticketId,
          context.projectName
        );
      } else if (result.error) {
        await this.notificationManager.notifyAgentError(
          context.agentName,
          result.error,
          context.ticketId,
          context.projectName
        );

        // Update status to error
        this.slashCommandHandler.updateAgentStatus(context.agentName, {
          name: context.agentName,
          status: 'error',
          currentTask: undefined,
          startTime: undefined
        });
      }
    } catch (error) {
      console.warn('Failed to send agent completion notification:', error);
    }
  }

  /**
   * Hook this into agent execution errors
   */
  public async onAgentError(
    context: AgentExecutionContext,
    error: Error
  ): Promise<void> {
    const executionId = this.generateExecutionId(context);
    this.activeExecutions.delete(executionId);

    // Update slash command handler status
    this.slashCommandHandler.updateAgentStatus(context.agentName, {
      name: context.agentName,
      status: 'error',
      currentTask: undefined,
      startTime: undefined
    });

    // Send error notification
    try {
      await this.notificationManager.notifyAgentError(
        context.agentName,
        error,
        context.ticketId,
        context.projectName
      );
    } catch (notificationError) {
      console.warn('Failed to send agent error notification:', notificationError);
    }
  }

  /**
   * Hook this into system health changes
   */
  public async onSystemHealthChange(
    status: 'healthy' | 'degraded' | 'critical',
    details?: string
  ): Promise<void> {
    try {
      await this.notificationManager.notifySystemHealth(status, details);
    } catch (error) {
      console.warn('Failed to send system health notification:', error);
    }
  }

  /**
   * Get current active executions
   */
  public getActiveExecutions(): AgentExecutionContext[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get agent status for slash commands
   */
  public getAgentStatus(agentName: string): AgentStatus | undefined {
    const statuses = this.slashCommandHandler.getAllStatuses();
    return statuses.find(status => status.name === agentName);
  }

  /**
   * Manually update agent status
   */
  public updateAgentStatus(agentName: string, status: Partial<AgentStatus>): void {
    const currentStatus = this.getAgentStatus(agentName);
    const updatedStatus: AgentStatus = {
      name: agentName,
      status: 'idle',
      ...currentStatus,
      ...status
    };
    
    this.slashCommandHandler.updateAgentStatus(agentName, updatedStatus);
  }

  /**
   * Clean up finished agents
   */
  public cleanupAgent(agentName: string): void {
    this.slashCommandHandler.removeAgentStatus(agentName);
    
    // Remove any active executions for this agent
    const executionsToDelete: string[] = [];
    this.activeExecutions.forEach((context, executionId) => {
      if (context.agentName === agentName) {
        executionsToDelete.push(executionId);
      }
    });
    
    executionsToDelete.forEach(executionId => {
      this.activeExecutions.delete(executionId);
    });
  }

  private generateExecutionId(context: AgentExecutionContext): string {
    return `${context.agentName}_${context.startTime.getTime()}_${context.ticketId || 'notask'}`;
  }

  /**
   * Get the notification manager instance
   */
  public getNotificationManager(): NotificationManager {
    return this.notificationManager;
  }

  /**
   * Get the slash command handler instance
   */
  public getSlashCommandHandler(): SlashCommandHandler {
    return this.slashCommandHandler;
  }
}

// Global instance for easy access
let globalAgentIntegration: AgentNotificationIntegration | null = null;

/**
 * Get or create the global agent notification integration instance
 */
export function getAgentNotificationIntegration(): AgentNotificationIntegration {
  if (!globalAgentIntegration) {
    globalAgentIntegration = new AgentNotificationIntegration();
  }
  return globalAgentIntegration;
}

/**
 * Utility function to wrap agent execution with notifications
 */
export async function withNotifications<T>(
  context: AgentExecutionContext,
  execution: () => Promise<T>
): Promise<T> {
  const integration = getAgentNotificationIntegration();
  
  try {
    // Notify start
    await integration.onAgentStart(context);
    
    // Execute the agent
    const startTime = Date.now();
    const result = await execution();
    const duration = Date.now() - startTime;
    
    // Notify completion
    await integration.onAgentComplete(context, {
      success: true,
      output: typeof result === 'string' ? result : JSON.stringify(result),
      duration
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - context.startTime.getTime();
    const agentError = error instanceof Error ? error : new Error(String(error));
    
    // Notify error
    await integration.onAgentError(context, agentError);
    
    // Also call onAgentComplete with error result
    await integration.onAgentComplete(context, {
      success: false,
      error: agentError,
      duration
    });
    
    throw error;
  }
}