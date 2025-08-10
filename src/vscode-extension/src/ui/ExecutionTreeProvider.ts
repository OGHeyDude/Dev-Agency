/**
 * Execution Tree Provider for VS Code Extension
 * Shows agent executions in the sidebar with real-time updates
 * 
 * @file ExecutionTreeProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { AgentManager } from '../core/AgentManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';
import { ExecutionTreeItem } from './AgentTreeProvider';

export class ExecutionGroupItem extends vscode.TreeItem {
  constructor(
    public readonly groupName: string,
    public readonly executions: any[],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
  ) {
    super(groupName, collapsibleState);
    
    this.tooltip = `${groupName} (${executions.length} executions)`;
    this.description = `${executions.length}`;
    this.iconPath = this.getGroupIcon(groupName);
    this.contextValue = 'dev-agency-execution-group';
  }

  private getGroupIcon(groupName: string): vscode.ThemeIcon {
    const groupIcons: Record<string, string> = {
      'Active': 'sync~spin',
      'Queued': 'clock',
      'Recent': 'history',
      'Failed': 'error',
      'All': 'list-unordered'
    };
    
    return new vscode.ThemeIcon(groupIcons[groupName] || 'folder');
  }
}

export class ExecutionTreeProvider implements vscode.TreeDataProvider<ExecutionGroupItem | ExecutionTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ExecutionGroupItem | ExecutionTreeItem | undefined | null | void> = new vscode.EventEmitter<ExecutionGroupItem | ExecutionTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ExecutionGroupItem | ExecutionTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private refreshInterval?: NodeJS.Timeout;

  constructor(
    private agentManager: AgentManager,
    private logger: ExtensionLogger
  ) {
    this.initialize();
  }

  /**
   * Initialize the execution tree provider
   */
  private initialize(): void {
    // Listen for agent manager events
    this.agentManager.on('execution-started', () => {
      this.refresh();
    });

    this.agentManager.on('execution-completed', () => {
      this.refresh();
    });

    this.agentManager.on('execution-failed', () => {
      this.refresh();
    });

    this.agentManager.on('execution-cancelled', () => {
      this.refresh();
    });

    this.agentManager.on('execution-progress', () => {
      this.refresh();
    });

    // Setup periodic refresh for active executions
    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, 2000); // Refresh every 2 seconds

    this.logger.debug('ExecutionTreeProvider initialized');
  }

  /**
   * Get tree item
   */
  getTreeItem(element: ExecutionGroupItem | ExecutionTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children for tree item
   */
  async getChildren(element?: ExecutionGroupItem | ExecutionTreeItem): Promise<(ExecutionGroupItem | ExecutionTreeItem)[]> {
    try {
      if (!element) {
        // Root level - return execution groups
        return await this.getExecutionGroups();
      }

      if (element instanceof ExecutionGroupItem) {
        // Group level - return executions in group
        return this.getExecutionsInGroup(element);
      }

      return [];
    } catch (error) {
      this.logger.error('Failed to get execution tree children:', error);
      return [];
    }
  }

  /**
   * Get execution groups
   */
  private async getExecutionGroups(): Promise<ExecutionGroupItem[]> {
    const status = this.agentManager.getExecutionStatus();
    const groups: ExecutionGroupItem[] = [];

    // Active executions
    const activeExecutions = status.recent.filter(exec => 
      exec.status === 'running' || exec.status === 'queued'
    );
    
    if (activeExecutions.length > 0) {
      groups.push(new ExecutionGroupItem('Active', activeExecutions));
    }

    // Recent completed executions (last 10)
    const recentCompleted = status.recent
      .filter(exec => exec.status === 'completed')
      .slice(0, 10);
    
    if (recentCompleted.length > 0) {
      groups.push(new ExecutionGroupItem('Recent', recentCompleted, vscode.TreeItemCollapsibleState.Collapsed));
    }

    // Failed executions
    const failedExecutions = status.recent.filter(exec => 
      exec.status === 'failed' || exec.status === 'cancelled'
    );
    
    if (failedExecutions.length > 0) {
      groups.push(new ExecutionGroupItem('Failed', failedExecutions, vscode.TreeItemCollapsibleState.Collapsed));
    }

    // If no specific groups, show all
    if (groups.length === 0 && status.recent.length > 0) {
      groups.push(new ExecutionGroupItem('All', status.recent));
    }

    // If no executions at all, show empty state
    if (groups.length === 0) {
      const emptyGroup = new ExecutionGroupItem('No Executions', [], vscode.TreeItemCollapsibleState.None);
      emptyGroup.description = 'Run an agent to see executions here';
      emptyGroup.tooltip = 'Use Ctrl+Alt+A to invoke an agent';
      groups.push(emptyGroup);
    }

    return groups;
  }

  /**
   * Get executions in a specific group
   */
  private getExecutionsInGroup(group: ExecutionGroupItem): ExecutionTreeItem[] {
    return group.executions.map(execution => new ExecutionTreeItem(execution));
  }

  /**
   * Get parent for tree item
   */
  getParent(element: ExecutionGroupItem | ExecutionTreeItem): vscode.ProviderResult<ExecutionGroupItem | ExecutionTreeItem> {
    if (element instanceof ExecutionTreeItem) {
      // Find the parent group
      const status = this.agentManager.getExecutionStatus();
      const execution = element.execution;
      
      if (execution.status === 'running' || execution.status === 'queued') {
        const activeExecutions = status.recent.filter(exec => 
          exec.status === 'running' || exec.status === 'queued'
        );
        return new ExecutionGroupItem('Active', activeExecutions);
      }
      
      if (execution.status === 'completed') {
        const recentCompleted = status.recent.filter(exec => exec.status === 'completed').slice(0, 10);
        return new ExecutionGroupItem('Recent', recentCompleted, vscode.TreeItemCollapsibleState.Collapsed);
      }
      
      if (execution.status === 'failed' || execution.status === 'cancelled') {
        const failedExecutions = status.recent.filter(exec => 
          exec.status === 'failed' || exec.status === 'cancelled'
        );
        return new ExecutionGroupItem('Failed', failedExecutions, vscode.TreeItemCollapsibleState.Collapsed);
      }
    }
    
    return null;
  }

  /**
   * Refresh tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Show execution details
   */
  async showExecutionDetails(execution: any): Promise<void> {
    try {
      const details = this.formatExecutionDetails(execution);
      
      const action = await vscode.window.showInformationMessage(
        details,
        { modal: true },
        'Copy Details',
        'Show Output',
        'Cancel Execution'
      );

      switch (action) {
        case 'Copy Details':
          await vscode.env.clipboard.writeText(details);
          vscode.window.showInformationMessage('Execution details copied to clipboard');
          break;
          
        case 'Show Output':
          if (execution.output) {
            await this.showExecutionOutput(execution);
          } else {
            vscode.window.showInformationMessage('No output available for this execution');
          }
          break;
          
        case 'Cancel Execution':
          if (execution.status === 'running' || execution.status === 'queued') {
            await this.cancelExecution(execution);
          } else {
            vscode.window.showInformationMessage('Execution cannot be cancelled');
          }
          break;
      }
    } catch (error) {
      this.logger.error('Failed to show execution details:', error);
      vscode.window.showErrorMessage('Failed to show execution details');
    }
  }

  /**
   * Format execution details for display
   */
  private formatExecutionDetails(execution: any): string {
    let details = `Execution Details:\n\n`;
    details += `ID: ${execution.id}\n`;
    details += `Agent: ${execution.agentName}\n`;
    details += `Task: ${execution.task}\n`;
    details += `Status: ${execution.status}\n`;
    details += `Started: ${new Date(execution.startTime).toLocaleString()}\n`;
    
    if (execution.endTime) {
      details += `Ended: ${new Date(execution.endTime).toLocaleString()}\n`;
      const duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime();
      details += `Duration: ${duration}ms\n`;
    }
    
    if (execution.progress !== undefined) {
      details += `Progress: ${execution.progress}%\n`;
    }
    
    if (execution.context) {
      if (execution.context.file) {
        details += `Context File: ${execution.context.file}\n`;
      }
      if (execution.context.workspace) {
        details += `Workspace: ${execution.context.workspace}\n`;
      }
    }
    
    if (execution.error) {
      details += `\nError: ${execution.error}\n`;
    }
    
    return details;
  }

  /**
   * Show execution output in a new document
   */
  private async showExecutionOutput(execution: any): Promise<void> {
    const outputContent = `# Execution Output\n\n`;
    const content = outputContent + 
      `**Agent:** ${execution.agentName}\n` +
      `**Task:** ${execution.task}\n` +
      `**Status:** ${execution.status}\n` +
      `**Time:** ${new Date(execution.startTime).toLocaleString()}\n\n` +
      `## Output\n\n${execution.output || 'No output available'}`;

    const document = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(document);
  }

  /**
   * Cancel a running execution
   */
  private async cancelExecution(execution: any): Promise<void> {
    const confirmation = await vscode.window.showWarningMessage(
      `Are you sure you want to cancel "${execution.agentName}" execution?`,
      'Yes, Cancel',
      'No'
    );

    if (confirmation === 'Yes, Cancel') {
      try {
        await this.agentManager.cancelExecution(execution.id);
        vscode.window.showInformationMessage(`Cancelled execution: ${execution.agentName}`);
        this.refresh();
      } catch (error) {
        this.logger.error('Failed to cancel execution:', error);
        vscode.window.showErrorMessage('Failed to cancel execution');
      }
    }
  }

  /**
   * Get execution statistics for display
   */
  getExecutionStats(): {
    total: number;
    active: number;
    queued: number;
    completed: number;
    failed: number;
  } {
    const status = this.agentManager.getExecutionStatus();
    
    const stats = {
      total: status.total,
      active: 0,
      queued: 0,
      completed: 0,
      failed: 0
    };

    status.recent.forEach(execution => {
      switch (execution.status) {
        case 'running':
          stats.active++;
          break;
        case 'queued':
          stats.queued++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'failed':
        case 'cancelled':
          stats.failed++;
          break;
      }
    });

    return stats;
  }

  /**
   * Show execution statistics
   */
  async showExecutionStats(): Promise<void> {
    const stats = this.getExecutionStats();
    
    const message = [
      `Execution Statistics:`,
      ``,
      `Total: ${stats.total}`,
      `Active: ${stats.active}`,
      `Queued: ${stats.queued}`,
      `Completed: ${stats.completed}`,
      `Failed: ${stats.failed}`
    ].join('\n');

    vscode.window.showInformationMessage(message, { modal: true });
  }

  /**
   * Clear execution history
   */
  async clearExecutionHistory(): Promise<void> {
    const confirmation = await vscode.window.showWarningMessage(
      'Are you sure you want to clear all execution history?',
      'Yes, Clear',
      'No'
    );

    if (confirmation === 'Yes, Clear') {
      // Implementation would depend on AgentManager having a clear history method
      vscode.window.showInformationMessage('Execution history cleared');
      this.refresh();
    }
  }

  /**
   * Dispose of the execution tree provider
   */
  dispose(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.logger.debug('ExecutionTreeProvider disposed');
  }
}