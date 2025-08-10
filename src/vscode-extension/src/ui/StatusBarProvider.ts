/**
 * Status Bar Provider for VS Code Extension
 * Manages the status bar widget and real-time agent status display
 * 
 * @file StatusBarProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export interface AgentStatus {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error' | 'cancelled';
  progress?: number;
  message?: string;
  startTime?: Date;
  estimatedCompletion?: Date;
}

export class StatusBarProvider {
  private statusBarItem: vscode.StatusBarItem;
  private currentStatus: AgentStatus | null = null;
  private statusHistory: AgentStatus[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    private context: vscode.ExtensionContext,
    private configManager: ConfigurationManager,
    private logger: ExtensionLogger
  ) {
    // Create status bar item
    const position = configManager.get('statusBarPosition', 'right') === 'left' 
      ? vscode.StatusBarAlignment.Left 
      : vscode.StatusBarAlignment.Right;
    
    this.statusBarItem = vscode.window.createStatusBarItem(position, 100);
    this.context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Initialize the status bar provider
   */
  initialize(): void {
    this.setIdleState();
    this.statusBarItem.show();
    
    // Setup periodic status updates
    this.updateInterval = setInterval(() => {
      this.updateStatusDisplay();
    }, 1000);

    this.logger.debug('StatusBarProvider initialized');
  }

  /**
   * Set idle state
   */
  setIdleState(): void {
    this.currentStatus = {
      name: 'Dev-Agency',
      status: 'idle',
      message: 'Ready'
    };
    
    this.statusBarItem.text = '$(robot) Dev-Agency';
    this.statusBarItem.tooltip = 'Dev-Agency: Ready to assist';
    this.statusBarItem.command = 'dev-agency.showStatus';
    this.statusBarItem.backgroundColor = undefined;
  }

  /**
   * Show progress for agent execution
   */
  showProgress(agentName: string, message: string, progress?: number): void {
    this.currentStatus = {
      name: agentName,
      status: 'running',
      message,
      progress,
      startTime: new Date()
    };

    this.updateStatusDisplay();
    this.logger.debug(`Status updated: ${agentName} - ${message}`);
  }

  /**
   * Update progress for current agent
   */
  updateProgress(progress: number): void {
    if (this.currentStatus?.status === 'running') {
      this.currentStatus.progress = progress;
      this.updateStatusDisplay();
    }
  }

  /**
   * Show success state
   */
  showSuccess(agentName: string, message?: string): void {
    const finalStatus: AgentStatus = {
      name: agentName,
      status: 'success',
      message: message || 'Completed successfully'
    };

    this.currentStatus = finalStatus;
    this.addToHistory(finalStatus);
    this.updateStatusDisplay();

    // Return to idle after 3 seconds
    setTimeout(() => {
      if (this.currentStatus?.status === 'success') {
        this.setIdleState();
      }
    }, 3000);
  }

  /**
   * Show error state
   */
  showError(agentName: string, error: string): void {
    const errorStatus: AgentStatus = {
      name: agentName,
      status: 'error',
      message: `Error: ${error}`
    };

    this.currentStatus = errorStatus;
    this.addToHistory(errorStatus);
    this.updateStatusDisplay();

    // Return to idle after 5 seconds
    setTimeout(() => {
      if (this.currentStatus?.status === 'error') {
        this.setIdleState();
      }
    }, 5000);
  }

  /**
   * Show cancelled state
   */
  showCancelled(agentName: string): void {
    const cancelledStatus: AgentStatus = {
      name: agentName,
      status: 'cancelled',
      message: 'Cancelled by user'
    };

    this.currentStatus = cancelledStatus;
    this.addToHistory(cancelledStatus);
    this.updateStatusDisplay();

    // Return to idle after 2 seconds
    setTimeout(() => {
      if (this.currentStatus?.status === 'cancelled') {
        this.setIdleState();
      }
    }, 2000);
  }

  /**
   * Update the visual status display
   */
  private updateStatusDisplay(): void {
    if (!this.currentStatus) {
      this.setIdleState();
      return;
    }

    const status = this.currentStatus;
    let icon = '$(robot)';
    let backgroundColor: vscode.ThemeColor | undefined;
    let tooltip = `Dev-Agency`;

    switch (status.status) {
      case 'idle':
        icon = '$(robot)';
        tooltip = 'Dev-Agency: Ready to assist';
        break;

      case 'running':
        icon = '$(sync~spin)';
        backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        tooltip = this.buildRunningTooltip(status);
        break;

      case 'success':
        icon = '$(check)';
        backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        tooltip = `Dev-Agency: ${status.name} completed successfully`;
        break;

      case 'error':
        icon = '$(error)';
        backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        tooltip = `Dev-Agency: ${status.name} failed - ${status.message}`;
        break;

      case 'cancelled':
        icon = '$(circle-slash)';
        backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        tooltip = `Dev-Agency: ${status.name} was cancelled`;
        break;
    }

    // Build status text
    let statusText = `${icon} ${status.name}`;
    
    if (status.status === 'running' && status.progress !== undefined) {
      statusText += ` (${status.progress}%)`;
    }

    if (status.message && status.status !== 'idle') {
      statusText += `: ${this.truncateMessage(status.message)}`;
    }

    // Update status bar item
    this.statusBarItem.text = statusText;
    this.statusBarItem.tooltip = tooltip;
    this.statusBarItem.backgroundColor = backgroundColor;
    this.statusBarItem.command = 'dev-agency.showStatus';
  }

  /**
   * Build detailed tooltip for running status
   */
  private buildRunningTooltip(status: AgentStatus): string {
    let tooltip = `Dev-Agency: ${status.name} is running`;
    
    if (status.message) {
      tooltip += `\n${status.message}`;
    }
    
    if (status.progress !== undefined) {
      tooltip += `\nProgress: ${status.progress}%`;
    }
    
    if (status.startTime) {
      const elapsed = Math.floor((Date.now() - status.startTime.getTime()) / 1000);
      tooltip += `\nElapsed: ${elapsed}s`;
    }
    
    if (status.estimatedCompletion) {
      const remaining = Math.max(0, Math.floor((status.estimatedCompletion.getTime() - Date.now()) / 1000));
      tooltip += `\nEstimated remaining: ${remaining}s`;
    }
    
    tooltip += '\n\nClick to view details';
    
    return tooltip;
  }

  /**
   * Truncate message for display
   */
  private truncateMessage(message: string, maxLength: number = 50): string {
    if (message.length <= maxLength) {
      return message;
    }
    return message.substring(0, maxLength - 3) + '...';
  }

  /**
   * Add status to history
   */
  private addToHistory(status: AgentStatus): void {
    this.statusHistory.unshift({
      ...status,
      startTime: status.startTime || new Date()
    });
    
    // Keep only last 20 entries
    if (this.statusHistory.length > 20) {
      this.statusHistory = this.statusHistory.slice(0, 20);
    }
  }

  /**
   * Get current status
   */
  getCurrentStatus(): AgentStatus | null {
    return this.currentStatus;
  }

  /**
   * Get status history
   */
  getStatusHistory(): AgentStatus[] {
    return [...this.statusHistory];
  }

  /**
   * Get formatted status for display
   */
  getFormattedStatus(): string {
    if (!this.currentStatus) {
      return 'Dev-Agency: Idle';
    }

    const status = this.currentStatus;
    let formatted = `${status.name}: ${status.status}`;
    
    if (status.message) {
      formatted += ` - ${status.message}`;
    }
    
    if (status.progress !== undefined) {
      formatted += ` (${status.progress}%)`;
    }
    
    return formatted;
  }

  /**
   * Show status history in quick pick
   */
  async showStatusHistory(): Promise<void> {
    if (this.statusHistory.length === 0) {
      vscode.window.showInformationMessage('No status history available');
      return;
    }

    const items = this.statusHistory.map((status, index) => {
      let icon = '$(robot)';
      switch (status.status) {
        case 'running': icon = '$(sync~spin)'; break;
        case 'success': icon = '$(check)'; break;
        case 'error': icon = '$(error)'; break;
        case 'cancelled': icon = '$(circle-slash)'; break;
      }

      const timeAgo = status.startTime 
        ? this.getTimeAgo(status.startTime)
        : 'unknown';

      return {
        label: `${icon} ${status.name}`,
        description: status.message || status.status,
        detail: `${timeAgo} ago`,
        status
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a status entry for details',
      ignoreFocusOut: true
    });

    if (selected) {
      await this.showStatusDetails((selected as any).status);
    }
  }

  /**
   * Show detailed status information
   */
  private async showStatusDetails(status: AgentStatus): Promise<void> {
    const details = this.buildStatusDetails(status);
    
    const action = await vscode.window.showInformationMessage(
      details,
      'Copy to Clipboard',
      'View Logs'
    );

    switch (action) {
      case 'Copy to Clipboard':
        await vscode.env.clipboard.writeText(details);
        vscode.window.showInformationMessage('Status details copied to clipboard');
        break;
      case 'View Logs':
        await vscode.commands.executeCommand('dev-agency.showOutput');
        break;
    }
  }

  /**
   * Build detailed status information
   */
  private buildStatusDetails(status: AgentStatus): string {
    let details = `Agent: ${status.name}\n`;
    details += `Status: ${status.status}\n`;
    
    if (status.message) {
      details += `Message: ${status.message}\n`;
    }
    
    if (status.progress !== undefined) {
      details += `Progress: ${status.progress}%\n`;
    }
    
    if (status.startTime) {
      details += `Time: ${status.startTime.toLocaleString()}\n`;
      const elapsed = Math.floor((Date.now() - status.startTime.getTime()) / 1000);
      details += `Duration: ${elapsed}s\n`;
    }
    
    return details;
  }

  /**
   * Get human-readable time ago
   */
  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }

  /**
   * Handle status bar click
   */
  async handleStatusBarClick(): Promise<void> {
    const options = [
      '$(pulse) Show Current Status',
      '$(history) View History',
      '$(gear) Open Settings',
      '$(output) Show Output'
    ];

    const selected = await vscode.window.showQuickPick(options, {
      placeHolder: 'Dev-Agency Status Actions'
    });

    switch (selected) {
      case '$(pulse) Show Current Status':
        const currentDetails = this.currentStatus 
          ? this.buildStatusDetails(this.currentStatus)
          : 'Dev-Agency is idle';
        vscode.window.showInformationMessage(currentDetails);
        break;
      case '$(history) View History':
        await this.showStatusHistory();
        break;
      case '$(gear) Open Settings':
        await vscode.commands.executeCommand('workbench.action.openSettings', 'dev-agency');
        break;
      case '$(output) Show Output':
        await vscode.commands.executeCommand('dev-agency.showOutput');
        break;
    }
  }

  /**
   * Clear status history
   */
  clearHistory(): void {
    this.statusHistory = [];
    this.logger.debug('Status history cleared');
  }

  /**
   * Get status statistics
   */
  getStatusStats(): {
    total: number;
    successful: number;
    failed: number;
    cancelled: number;
  } {
    const stats = {
      total: this.statusHistory.length,
      successful: 0,
      failed: 0,
      cancelled: 0
    };

    this.statusHistory.forEach(status => {
      switch (status.status) {
        case 'success':
          stats.successful++;
          break;
        case 'error':
          stats.failed++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });

    return stats;
  }

  /**
   * Dispose of the status bar provider
   */
  dispose(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.statusBarItem.dispose();
    this.logger.debug('StatusBarProvider disposed');
  }
}