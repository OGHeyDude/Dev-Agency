/**
 * Error Handler for VS Code Extension
 * Centralized error handling with user-friendly error reporting
 * 
 * @file ErrorHandler.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { ExtensionLogger } from './ExtensionLogger';

export interface ErrorInfo {
  id: string;
  timestamp: Date;
  error: Error;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAction?: string;
  recovered: boolean;
  metadata?: any;
}

export interface ErrorRecoveryStrategy {
  canRecover(error: Error, context: string): boolean;
  recover(error: Error, context: string): Promise<boolean>;
  description: string;
}

export class ErrorHandler {
  private errorHistory: ErrorInfo[] = [];
  private maxErrorHistory = 100;
  private recoveryStrategies: ErrorRecoveryStrategy[] = [];
  private errorCounts = new Map<string, number>();

  constructor(private logger: ExtensionLogger) {
    this.setupDefaultRecoveryStrategies();
  }

  /**
   * Handle an error with context and attempt recovery
   */
  async handleError(error: Error, context: string, metadata?: any): Promise<boolean> {
    const errorInfo = this.createErrorInfo(error, context, metadata);
    
    // Log the error
    this.logger.error(`Error in ${context}:`, error);
    
    // Add to history
    this.addToHistory(errorInfo);
    
    // Track error frequency
    this.trackErrorFrequency(error, context);
    
    // Attempt recovery
    const recovered = await this.attemptRecovery(error, context);
    errorInfo.recovered = recovered;
    
    // Show user notification if needed
    if (!recovered || errorInfo.severity === 'critical') {
      await this.showUserNotification(errorInfo);
    }
    
    // Check for error patterns
    this.checkErrorPatterns();
    
    return recovered;
  }

  /**
   * Create error information object
   */
  private createErrorInfo(error: Error, context: string, metadata?: any): ErrorInfo {
    return {
      id: this.generateErrorId(),
      timestamp: new Date(),
      error,
      context,
      severity: this.determineSeverity(error, context),
      recovered: false,
      metadata
    };
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: string): ErrorInfo['severity'] {
    // Critical errors that break core functionality
    if (context.includes('initialization') || context.includes('activation')) {
      return 'critical';
    }
    
    // High severity for user-facing operations
    if (context.includes('command') || context.includes('agent-invocation')) {
      return 'high';
    }
    
    // Medium for background operations
    if (context.includes('background') || context.includes('cache')) {
      return 'medium';
    }
    
    // Check error types
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }
    
    if (error.message.includes('ENOENT') || error.message.includes('permission')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add error to history
   */
  private addToHistory(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);
    
    // Trim history if needed
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.maxErrorHistory);
    }
  }

  /**
   * Track error frequency for pattern detection
   */
  private trackErrorFrequency(error: Error, context: string): void {
    const errorKey = `${error.name}:${context}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    
    // Log if error is recurring
    if (count > 2) {
      this.logger.warn(`Recurring error detected: ${errorKey} (${count + 1} times)`);
    }
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(error: Error, context: string): Promise<boolean> {
    for (const strategy of this.recoveryStrategies) {
      if (strategy.canRecover(error, context)) {
        this.logger.info(`Attempting recovery with strategy: ${strategy.description}`);
        
        try {
          const recovered = await strategy.recover(error, context);
          if (recovered) {
            this.logger.info(`Successfully recovered using: ${strategy.description}`);
            return true;
          }
        } catch (recoveryError) {
          this.logger.warn(`Recovery strategy failed: ${strategy.description}`, recoveryError);
        }
      }
    }
    
    return false;
  }

  /**
   * Show user notification based on error severity
   */
  private async showUserNotification(errorInfo: ErrorInfo): Promise<void> {
    const { error, context, severity, recovered } = errorInfo;
    
    let message = this.createUserFriendlyMessage(error, context);
    let actions: string[] = [];
    
    switch (severity) {
      case 'critical':
        actions = ['View Logs', 'Restart Extension', 'Report Issue'];
        break;
      case 'high':
        actions = recovered ? ['View Logs'] : ['Retry', 'View Logs', 'Report Issue'];
        break;
      case 'medium':
        actions = ['View Logs'];
        break;
      case 'low':
        // Don't show notification for low severity
        return;
    }
    
    const selection = await this.showNotificationByType(severity, message, actions);
    
    if (selection) {
      await this.handleUserAction(selection, errorInfo);
    }
  }

  /**
   * Create user-friendly error message
   */
  private createUserFriendlyMessage(error: Error, context: string): string {
    // Map technical errors to user-friendly messages
    const messageMap: Record<string, string> = {
      'ENOENT': 'File or directory not found. Please check your configuration.',
      'EACCES': 'Permission denied. Please check file permissions.',
      'ECONNREFUSED': 'Connection refused. The service may not be running.',
      'timeout': 'Operation timed out. Please try again.',
      'network': 'Network error occurred. Please check your connection.'
    };

    const contextMap: Record<string, string> = {
      'agent-invocation': 'agent execution',
      'file-operation': 'file operation',
      'configuration': 'configuration loading'
    };

    // Check for known error patterns
    for (const [pattern, message] of Object.entries(messageMap)) {
      if (error.message.toLowerCase().includes(pattern.toLowerCase())) {
        return `${message} (${contextMap[context] || context})`;
      }
    }

    // Generic message
    const friendlyContext = contextMap[context] || context.replace(/-/g, ' ');
    return `An error occurred during ${friendlyContext}: ${error.message}`;
  }

  /**
   * Show notification by type
   */
  private async showNotificationByType(
    severity: ErrorInfo['severity'],
    message: string,
    actions: string[]
  ): Promise<string | undefined> {
    switch (severity) {
      case 'critical':
        return await vscode.window.showErrorMessage(message, ...actions);
      case 'high':
        return await vscode.window.showErrorMessage(message, ...actions);
      case 'medium':
        return await vscode.window.showWarningMessage(message, ...actions);
      case 'low':
        return await vscode.window.showInformationMessage(message, ...actions);
      default:
        return undefined;
    }
  }

  /**
   * Handle user action from notification
   */
  private async handleUserAction(action: string, errorInfo: ErrorInfo): Promise<void> {
    switch (action) {
      case 'Retry':
        // Could implement retry logic based on context
        break;
        
      case 'View Logs':
        this.logger.show();
        break;
        
      case 'Restart Extension':
        await vscode.commands.executeCommand('workbench.action.reloadWindow');
        break;
        
      case 'Report Issue':
        await this.openIssueReport(errorInfo);
        break;
        
      case 'Show Details':
        await this.showErrorDetails(errorInfo);
        break;
    }
  }

  /**
   * Open issue report with error details
   */
  private async openIssueReport(errorInfo: ErrorInfo): Promise<void> {
    const issueBody = this.generateIssueReport(errorInfo);
    const issueUrl = `https://github.com/dev-agency/vscode-extension/issues/new?body=${encodeURIComponent(issueBody)}`;
    
    await vscode.env.openExternal(vscode.Uri.parse(issueUrl));
  }

  /**
   * Generate issue report content
   */
  private generateIssueReport(errorInfo: ErrorInfo): string {
    let report = `## Error Report\n\n`;
    report += `**Error ID:** ${errorInfo.id}\n`;
    report += `**Timestamp:** ${errorInfo.timestamp.toISOString()}\n`;
    report += `**Context:** ${errorInfo.context}\n`;
    report += `**Severity:** ${errorInfo.severity}\n`;
    report += `**Recovered:** ${errorInfo.recovered ? 'Yes' : 'No'}\n\n`;
    
    report += `## Error Details\n\n`;
    report += `**Name:** ${errorInfo.error.name}\n`;
    report += `**Message:** ${errorInfo.error.message}\n\n`;
    
    if (errorInfo.error.stack) {
      report += `**Stack Trace:**\n\`\`\`\n${errorInfo.error.stack}\n\`\`\`\n\n`;
    }
    
    if (errorInfo.metadata) {
      report += `**Additional Context:**\n\`\`\`json\n${JSON.stringify(errorInfo.metadata, null, 2)}\n\`\`\`\n\n`;
    }
    
    report += `## Environment\n\n`;
    report += `- VS Code Version: ${vscode.version}\n`;
    report += `- Extension Version: 1.0.0\n`;
    report += `- Platform: ${process.platform}\n`;
    report += `- Node Version: ${process.version}\n`;
    
    return report;
  }

  /**
   * Show detailed error information
   */
  private async showErrorDetails(errorInfo: ErrorInfo): Promise<void> {
    const details = [
      `Error ID: ${errorInfo.id}`,
      `Time: ${errorInfo.timestamp.toLocaleString()}`,
      `Context: ${errorInfo.context}`,
      `Severity: ${errorInfo.severity}`,
      `Recovered: ${errorInfo.recovered ? 'Yes' : 'No'}`,
      `Error: ${errorInfo.error.name}`,
      `Message: ${errorInfo.error.message}`
    ].join('\n');
    
    vscode.window.showInformationMessage(details, { modal: true });
  }

  /**
   * Check for error patterns and trends
   */
  private checkErrorPatterns(): void {
    const recentErrors = this.errorHistory.slice(-10);
    
    // Check for error spikes
    const last5Minutes = Date.now() - (5 * 60 * 1000);
    const recentErrorCount = recentErrors.filter(e => e.timestamp.getTime() > last5Minutes).length;
    
    if (recentErrorCount >= 5) {
      this.logger.warn(`Error spike detected: ${recentErrorCount} errors in last 5 minutes`);
      vscode.window.showWarningMessage(
        'Dev-Agency is experiencing multiple errors. Consider restarting the extension.',
        'Restart Extension',
        'View Logs'
      ).then(action => {
        if (action === 'Restart Extension') {
          vscode.commands.executeCommand('workbench.action.reloadWindow');
        } else if (action === 'View Logs') {
          this.logger.show();
        }
      });
    }
  }

  /**
   * Setup default recovery strategies
   */
  private setupDefaultRecoveryStrategies(): void {
    // File not found recovery
    this.recoveryStrategies.push({
      canRecover: (error, context) => 
        error.message.includes('ENOENT') && context.includes('file'),
      
      recover: async (error, context) => {
        // Could attempt to recreate missing files or use defaults
        return false;
      },
      
      description: 'File not found recovery'
    });

    // Permission error recovery
    this.recoveryStrategies.push({
      canRecover: (error, context) => 
        error.message.includes('EACCES') || error.message.includes('permission'),
      
      recover: async (error, context) => {
        // Could suggest running with different permissions
        return false;
      },
      
      description: 'Permission error recovery'
    });

    // Network error recovery
    this.recoveryStrategies.push({
      canRecover: (error, context) => 
        error.message.includes('ECONNREFUSED') || 
        error.message.includes('timeout') ||
        context.includes('network'),
      
      recover: async (error, context) => {
        // Could attempt retry with backoff
        return false;
      },
      
      description: 'Network error recovery'
    });
  }

  /**
   * Add custom recovery strategy
   */
  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.push(strategy);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<ErrorInfo['severity'], number>;
    errorsByContext: Record<string, number>;
    recoveryRate: number;
    recentErrors: number;
  } {
    const stats = {
      totalErrors: this.errorHistory.length,
      errorsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 } as Record<ErrorInfo['severity'], number>,
      errorsByContext: {} as Record<string, number>,
      recoveryRate: 0,
      recentErrors: 0
    };

    const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
    let recoveredCount = 0;

    this.errorHistory.forEach(error => {
      stats.errorsBySeverity[error.severity]++;
      stats.errorsByContext[error.context] = (stats.errorsByContext[error.context] || 0) + 1;
      
      if (error.recovered) {
        recoveredCount++;
      }
      
      if (error.timestamp.getTime() > last24Hours) {
        stats.recentErrors++;
      }
    });

    if (this.errorHistory.length > 0) {
      stats.recoveryRate = (recoveredCount / this.errorHistory.length) * 100;
    }

    return stats;
  }

  /**
   * Get error history with optional filtering
   */
  getErrorHistory(options?: {
    severity?: ErrorInfo['severity'];
    context?: string;
    since?: Date;
    limit?: number;
  }): ErrorInfo[] {
    let filtered = [...this.errorHistory];

    if (options?.severity) {
      filtered = filtered.filter(error => error.severity === options.severity);
    }

    if (options?.context) {
      filtered = filtered.filter(error => error.context.includes(options.context!));
    }

    if (options?.since) {
      filtered = filtered.filter(error => error.timestamp >= options.since!);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.errorCounts.clear();
    this.logger.info('Error history cleared');
  }

  /**
   * Export error report
   */
  exportErrorReport(): string {
    const stats = this.getErrorStats();
    
    let report = `# Error Report - ${new Date().toISOString()}\n\n`;
    
    report += `## Summary\n`;
    report += `- Total Errors: ${stats.totalErrors}\n`;
    report += `- Recovery Rate: ${stats.recoveryRate.toFixed(1)}%\n`;
    report += `- Recent Errors (24h): ${stats.recentErrors}\n\n`;
    
    report += `## Errors by Severity\n`;
    Object.entries(stats.errorsBySeverity).forEach(([severity, count]) => {
      report += `- ${severity}: ${count}\n`;
    });
    
    report += `\n## Errors by Context\n`;
    Object.entries(stats.errorsByContext).forEach(([context, count]) => {
      report += `- ${context}: ${count}\n`;
    });
    
    report += `\n## Recent Error Details\n`;
    const recentErrors = this.getErrorHistory({ limit: 10 });
    recentErrors.forEach(error => {
      report += `### ${error.timestamp.toISOString()} - ${error.severity}\n`;
      report += `**Context:** ${error.context}\n`;
      report += `**Error:** ${error.error.name} - ${error.error.message}\n`;
      report += `**Recovered:** ${error.recovered ? 'Yes' : 'No'}\n\n`;
    });
    
    return report;
  }
}