/**
 * Output Channel Provider for VS Code Extension
 * Manages dedicated output channel for agent responses and system logs
 * 
 * @file OutputChannelProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export interface OutputEntry {
  timestamp: Date;
  type: 'agent-result' | 'system-log' | 'error' | 'warning' | 'info';
  source: string;
  content: string;
  metadata?: any;
}

export class OutputChannelProvider {
  private outputChannel: vscode.OutputChannel;
  private outputHistory: OutputEntry[] = [];
  private maxHistory = 500;

  constructor(private logger: ExtensionLogger) {
    this.outputChannel = vscode.window.createOutputChannel('Dev-Agency Results');
  }

  /**
   * Initialize the output channel provider
   */
  initialize(): void {
    // Add welcome message
    this.appendSystemMessage('Dev-Agency VS Code Extension initialized');
    this.logger.debug('OutputChannelProvider initialized');
  }

  /**
   * Append agent execution result
   */
  appendResult(agentName: string, result: any): void {
    const entry: OutputEntry = {
      timestamp: new Date(),
      type: 'agent-result',
      source: agentName,
      content: this.formatAgentResult(agentName, result),
      metadata: result
    };

    this.addEntry(entry);
    this.outputToChannel(entry);
  }

  /**
   * Append system log message
   */
  appendSystemMessage(message: string, source: string = 'System'): void {
    const entry: OutputEntry = {
      timestamp: new Date(),
      type: 'system-log',
      source,
      content: message
    };

    this.addEntry(entry);
    this.outputToChannel(entry);
  }

  /**
   * Append error message
   */
  appendError(message: string, error?: Error, source: string = 'System'): void {
    const entry: OutputEntry = {
      timestamp: new Date(),
      type: 'error',
      source,
      content: error ? `${message}\nError: ${error.message}` : message,
      metadata: error
    };

    this.addEntry(entry);
    this.outputToChannel(entry);
  }

  /**
   * Append warning message
   */
  appendWarning(message: string, source: string = 'System'): void {
    const entry: OutputEntry = {
      timestamp: new Date(),
      type: 'warning',
      source,
      content: message
    };

    this.addEntry(entry);
    this.outputToChannel(entry);
  }

  /**
   * Append info message
   */
  appendInfo(message: string, source: string = 'System'): void {
    const entry: OutputEntry = {
      timestamp: new Date(),
      type: 'info',
      source,
      content: message
    };

    this.addEntry(entry);
    this.outputToChannel(entry);
  }

  /**
   * Format agent execution result for display
   */
  private formatAgentResult(agentName: string, result: any): string {
    const timestamp = new Date().toLocaleTimeString();
    let formatted = `\n${'='.repeat(60)}\n`;
    formatted += `🤖 AGENT: ${agentName.toUpperCase()}\n`;
    formatted += `⏰ TIME: ${timestamp}\n`;
    formatted += `${'='.repeat(60)}\n\n`;

    // Add execution metadata if available
    if (result.metadata) {
      formatted += `⚡ EXECUTION TIME: ${result.metadata.executionTime}ms\n`;
      if (result.metadata.tokensUsed) {
        formatted += `🔢 TOKENS USED: ${result.metadata.tokensUsed}\n`;
      }
      if (result.metadata.confidence) {
        formatted += `📊 CONFIDENCE: ${Math.round(result.metadata.confidence * 100)}%\n`;
      }
      formatted += `\n`;
    }

    // Add main output
    if (result.output) {
      formatted += `📝 OUTPUT:\n`;
      formatted += `${'-'.repeat(40)}\n`;
      formatted += `${result.output}\n`;
      formatted += `${'-'.repeat(40)}\n\n`;
    }

    // Add suggestions if available
    if (result.suggestions && result.suggestions.length > 0) {
      formatted += `💡 SUGGESTIONS (${result.suggestions.length}):\n`;
      formatted += `${'-'.repeat(40)}\n`;
      result.suggestions.forEach((suggestion: any, index: number) => {
        formatted += `${index + 1}. ${suggestion.description}\n`;
        if (suggestion.code) {
          formatted += `   Code: ${suggestion.code.substring(0, 100)}${suggestion.code.length > 100 ? '...' : ''}\n`;
        }
        if (suggestion.confidence) {
          formatted += `   Confidence: ${Math.round(suggestion.confidence * 100)}%\n`;
        }
        formatted += `\n`;
      });
      formatted += `${'-'.repeat(40)}\n\n`;
    }

    // Add actions if available
    if (result.actions && result.actions.length > 0) {
      formatted += `🔧 ACTIONS (${result.actions.length}):\n`;
      formatted += `${'-'.repeat(40)}\n`;
      result.actions.forEach((action: any, index: number) => {
        formatted += `${index + 1}. ${action.description}\n`;
        formatted += `   Type: ${action.type}\n`;
        formatted += `   Requires Confirmation: ${action.requiresConfirmation ? 'Yes' : 'No'}\n\n`;
      });
      formatted += `${'-'.repeat(40)}\n\n`;
    }

    return formatted;
  }

  /**
   * Add entry to history
   */
  private addEntry(entry: OutputEntry): void {
    this.outputHistory.push(entry);

    // Trim history if needed
    if (this.outputHistory.length > this.maxHistory) {
      this.outputHistory = this.outputHistory.slice(-this.maxHistory);
    }
  }

  /**
   * Output entry to VS Code channel
   */
  private outputToChannel(entry: OutputEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const icon = this.getTypeIcon(entry.type);
    
    if (entry.type === 'agent-result') {
      // Agent results are already formatted
      this.outputChannel.appendLine(entry.content);
    } else {
      // System messages get simple formatting
      this.outputChannel.appendLine(`[${timestamp}] ${icon} ${entry.source}: ${entry.content}`);
    }
  }

  /**
   * Get icon for entry type
   */
  private getTypeIcon(type: OutputEntry['type']): string {
    switch (type) {
      case 'agent-result': return '🤖';
      case 'system-log': return 'ℹ️';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return '📝';
      default: return '•';
    }
  }

  /**
   * Show agent execution status
   */
  showStatus(status: any): void {
    let statusMessage = `\n📊 AGENT STATUS REPORT\n`;
    statusMessage += `${'='.repeat(40)}\n`;
    statusMessage += `Active Executions: ${status.active}\n`;
    statusMessage += `Queued Executions: ${status.queued}\n`;
    statusMessage += `Total Executions: ${status.total}\n\n`;

    if (status.recent && status.recent.length > 0) {
      statusMessage += `Recent Executions:\n`;
      statusMessage += `${'-'.repeat(30)}\n`;
      status.recent.slice(0, 5).forEach((execution: any, index: number) => {
        statusMessage += `${index + 1}. ${execution.agentName} - ${execution.status}\n`;
        statusMessage += `   Started: ${new Date(execution.startTime).toLocaleString()}\n`;
        if (execution.endTime) {
          const duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime();
          statusMessage += `   Duration: ${duration}ms\n`;
        }
        statusMessage += `\n`;
      });
    }

    this.outputChannel.appendLine(statusMessage);
    this.show();
  }

  /**
   * Show output channel
   */
  show(preserveFocus?: boolean): void {
    this.outputChannel.show(preserveFocus);
  }

  /**
   * Hide output channel
   */
  hide(): void {
    this.outputChannel.hide();
  }

  /**
   * Clear output channel
   */
  clear(): void {
    this.outputChannel.clear();
    this.outputHistory = [];
    this.appendSystemMessage('Output cleared');
  }

  /**
   * Get output history with filtering
   */
  getOutputHistory(options?: {
    type?: OutputEntry['type'];
    source?: string;
    since?: Date;
    limit?: number;
  }): OutputEntry[] {
    let filtered = [...this.outputHistory];

    if (options?.type) {
      filtered = filtered.filter(entry => entry.type === options.type);
    }

    if (options?.source) {
      filtered = filtered.filter(entry => entry.source === options.source);
    }

    if (options?.since) {
      filtered = filtered.filter(entry => entry.timestamp >= options.since!);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Export output history
   */
  exportHistory(options?: {
    type?: OutputEntry['type'];
    source?: string;
    since?: Date;
  }): string {
    const entries = this.getOutputHistory(options);
    
    let exported = `# Dev-Agency Output Export\n`;
    exported += `Generated: ${new Date().toISOString()}\n\n`;

    entries.forEach(entry => {
      exported += `## ${entry.timestamp.toISOString()} - ${entry.source}\n`;
      exported += `Type: ${entry.type}\n\n`;
      exported += `${entry.content}\n\n`;
      exported += `${'-'.repeat(80)}\n\n`;
    });

    return exported;
  }

  /**
   * Search output history
   */
  searchHistory(query: string, options?: {
    type?: OutputEntry['type'];
    source?: string;
    caseSensitive?: boolean;
  }): OutputEntry[] {
    const searchText = options?.caseSensitive ? query : query.toLowerCase();
    
    return this.outputHistory.filter(entry => {
      // Apply filters first
      if (options?.type && entry.type !== options.type) return false;
      if (options?.source && entry.source !== options.source) return false;

      // Search in content
      const content = options?.caseSensitive ? entry.content : entry.content.toLowerCase();
      return content.includes(searchText);
    });
  }

  /**
   * Show search results in output channel
   */
  showSearchResults(query: string, options?: {
    type?: OutputEntry['type'];
    source?: string;
    caseSensitive?: boolean;
  }): void {
    const results = this.searchHistory(query, options);
    
    let searchOutput = `\n🔍 SEARCH RESULTS\n`;
    searchOutput += `Query: "${query}"\n`;
    searchOutput += `Results: ${results.length}\n`;
    searchOutput += `${'='.repeat(40)}\n\n`;

    if (results.length === 0) {
      searchOutput += `No results found.\n`;
    } else {
      results.slice(0, 10).forEach((entry, index) => {
        searchOutput += `${index + 1}. [${entry.timestamp.toLocaleTimeString()}] ${entry.source}\n`;
        searchOutput += `   ${entry.content.substring(0, 200)}${entry.content.length > 200 ? '...' : ''}\n\n`;
      });

      if (results.length > 10) {
        searchOutput += `... and ${results.length - 10} more results\n`;
      }
    }

    this.outputChannel.appendLine(searchOutput);
    this.show();
  }

  /**
   * Get output statistics
   */
  getStats(): {
    totalEntries: number;
    entriesByType: Record<OutputEntry['type'], number>;
    entriesBySource: Record<string, number>;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const stats = {
      totalEntries: this.outputHistory.length,
      entriesByType: {
        'agent-result': 0,
        'system-log': 0,
        'error': 0,
        'warning': 0,
        'info': 0
      } as Record<OutputEntry['type'], number>,
      entriesBySource: {} as Record<string, number>,
      oldestEntry: undefined as Date | undefined,
      newestEntry: undefined as Date | undefined
    };

    if (this.outputHistory.length > 0) {
      stats.oldestEntry = this.outputHistory[0].timestamp;
      stats.newestEntry = this.outputHistory[this.outputHistory.length - 1].timestamp;
    }

    this.outputHistory.forEach(entry => {
      stats.entriesByType[entry.type]++;
      stats.entriesBySource[entry.source] = (stats.entriesBySource[entry.source] || 0) + 1;
    });

    return stats;
  }

  /**
   * Show statistics in output channel
   */
  showStats(): void {
    const stats = this.getStats();
    
    let statsOutput = `\n📊 OUTPUT STATISTICS\n`;
    statsOutput += `${'='.repeat(40)}\n`;
    statsOutput += `Total Entries: ${stats.totalEntries}\n\n`;

    statsOutput += `Entries by Type:\n`;
    Object.entries(stats.entriesByType).forEach(([type, count]) => {
      statsOutput += `  ${type}: ${count}\n`;
    });

    statsOutput += `\nTop Sources:\n`;
    const topSources = Object.entries(stats.entriesBySource)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    topSources.forEach(([source, count]) => {
      statsOutput += `  ${source}: ${count}\n`;
    });

    if (stats.oldestEntry && stats.newestEntry) {
      const timespan = stats.newestEntry.getTime() - stats.oldestEntry.getTime();
      const hours = Math.round(timespan / (1000 * 60 * 60));
      statsOutput += `\nTime Span: ${hours} hours\n`;
    }

    statsOutput += `\n`;

    this.outputChannel.appendLine(statsOutput);
    this.show();
  }

  /**
   * Dispose of the output channel provider
   */
  dispose(): void {
    this.outputChannel.dispose();
    this.outputHistory = [];
    this.logger.debug('OutputChannelProvider disposed');
  }
}