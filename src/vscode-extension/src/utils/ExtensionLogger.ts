/**
 * Extension Logger for VS Code Extension
 * Provides structured logging with VS Code output channel integration
 * 
 * @file ExtensionLogger.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  component?: string;
  data?: any;
  error?: Error;
}

export class ExtensionLogger {
  private outputChannel: vscode.OutputChannel;
  private logEntries: LogEntry[] = [];
  private maxLogEntries = 1000;
  private currentLogLevel: LogLevel = 'info';

  constructor(
    private context: vscode.ExtensionContext,
    channelName: string = 'Dev-Agency'
  ) {
    this.outputChannel = vscode.window.createOutputChannel(channelName);
    this.context.subscriptions.push(this.outputChannel);

    // Get log level from configuration
    this.updateLogLevel();

    // Listen for configuration changes
    this.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('dev-agency.logLevel')) {
          this.updateLogLevel();
        }
      })
    );
  }

  /**
   * Update log level from configuration
   */
  private updateLogLevel(): void {
    const config = vscode.workspace.getConfiguration('dev-agency');
    this.currentLogLevel = config.get<LogLevel>('logLevel', 'info');
  }

  /**
   * Check if message should be logged based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.currentLogLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const component = entry.component ? `[${entry.component}] ` : '';
    
    let formatted = `${timestamp} ${level} ${component}${entry.message}`;
    
    if (entry.data) {
      formatted += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      formatted += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return formatted;
  }

  /**
   * Add log entry to history and output
   */
  private addLogEntry(level: LogLevel, message: string, component?: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      component,
      data,
      error
    };

    // Add to history
    this.logEntries.push(entry);
    
    // Trim history if needed
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.maxLogEntries);
    }

    // Output to channel
    const formatted = this.formatLogEntry(entry);
    this.outputChannel.appendLine(formatted);

    // Show output channel for errors
    if (level === 'error') {
      this.outputChannel.show(true);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any, component?: string): void {
    this.addLogEntry('debug', message, component, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any, component?: string): void {
    this.addLogEntry('info', message, component, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any, component?: string): void {
    this.addLogEntry('warn', message, component, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, component?: string): void {
    let errorObj: Error | undefined;
    let data: any;

    if (error instanceof Error) {
      errorObj = error;
    } else if (error) {
      data = error;
    }

    this.addLogEntry('error', message, component, data, errorObj);
  }

  /**
   * Create a child logger with component context
   */
  createChild(component: string): ComponentLogger {
    return new ComponentLogger(this, component);
  }

  /**
   * Get log entries with optional filtering
   */
  getLogEntries(options?: {
    level?: LogLevel;
    component?: string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filtered = [...this.logEntries];

    if (options?.level) {
      filtered = filtered.filter(entry => entry.level === options.level);
    }

    if (options?.component) {
      filtered = filtered.filter(entry => entry.component === options.component);
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
   * Export logs as formatted text
   */
  exportLogs(options?: {
    level?: LogLevel;
    component?: string;
    since?: Date;
  }): string {
    const entries = this.getLogEntries(options);
    return entries.map(entry => this.formatLogEntry(entry)).join('\n\n');
  }

  /**
   * Clear log history
   */
  clearLogs(): void {
    this.logEntries = [];
    this.outputChannel.clear();
    this.info('Log history cleared');
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    totalEntries: number;
    entriesByLevel: Record<LogLevel, number>;
    entriesByComponent: Record<string, number>;
    oldestEntry?: Date;
    newestEntry?: Date;
  } {
    const stats = {
      totalEntries: this.logEntries.length,
      entriesByLevel: { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number>,
      entriesByComponent: {} as Record<string, number>,
      oldestEntry: undefined as Date | undefined,
      newestEntry: undefined as Date | undefined
    };

    if (this.logEntries.length > 0) {
      stats.oldestEntry = this.logEntries[0].timestamp;
      stats.newestEntry = this.logEntries[this.logEntries.length - 1].timestamp;
    }

    this.logEntries.forEach(entry => {
      stats.entriesByLevel[entry.level]++;
      
      if (entry.component) {
        stats.entriesByComponent[entry.component] = (stats.entriesByComponent[entry.component] || 0) + 1;
      }
    });

    return stats;
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
   * Dispose of the logger
   */
  dispose(): void {
    this.outputChannel.dispose();
  }
}

/**
 * Component-specific logger
 */
export class ComponentLogger {
  constructor(
    private parent: ExtensionLogger,
    private component: string
  ) {}

  debug(message: string, data?: any): void {
    this.parent.debug(message, data, this.component);
  }

  info(message: string, data?: any): void {
    this.parent.info(message, data, this.component);
  }

  warn(message: string, data?: any): void {
    this.parent.warn(message, data, this.component);
  }

  error(message: string, error?: Error | any): void {
    this.parent.error(message, error, this.component);
  }

  /**
   * Create a nested child logger
   */
  createChild(childComponent: string): ComponentLogger {
    return new ComponentLogger(this.parent, `${this.component}:${childComponent}`);
  }
}

/**
 * Performance logger for measuring execution times
 */
export class PerformanceLogger {
  private timers = new Map<string, number>();

  constructor(private logger: ExtensionLogger) {}

  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
    this.logger.debug(`Started timing: ${operation}`, undefined, 'Performance');
  }

  /**
   * End timing and log duration
   */
  endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      this.logger.warn(`Timer not found: ${operation}`, undefined, 'Performance');
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    
    this.logger.info(`Completed: ${operation} (${duration}ms)`, { duration }, 'Performance');
    
    // Warn on slow operations
    if (duration > 5000) {
      this.logger.warn(`Slow operation detected: ${operation} took ${duration}ms`, { duration }, 'Performance');
    }

    return duration;
  }

  /**
   * Time a promise operation
   */
  async timeOperation<T>(operation: string, promise: Promise<T>): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await promise;
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      this.logger.error(`Failed operation: ${operation}`, error, 'Performance');
      throw error;
    }
  }

  /**
   * Time a synchronous operation
   */
  timeSync<T>(operation: string, fn: () => T): T {
    this.startTimer(operation);
    try {
      const result = fn();
      this.endTimer(operation);
      return result;
    } catch (error) {
      this.endTimer(operation);
      this.logger.error(`Failed sync operation: ${operation}`, error, 'Performance');
      throw error;
    }
  }

  /**
   * Get active timers
   */
  getActiveTimers(): Array<{ operation: string; startTime: number; elapsed: number }> {
    const now = Date.now();
    return Array.from(this.timers.entries()).map(([operation, startTime]) => ({
      operation,
      startTime,
      elapsed: now - startTime
    }));
  }

  /**
   * Clear all timers
   */
  clearTimers(): void {
    this.timers.clear();
    this.logger.debug('All performance timers cleared', undefined, 'Performance');
  }
}

/**
 * Create a logger instance for the extension
 */
export function createLogger(context: vscode.ExtensionContext, channelName?: string): ExtensionLogger {
  return new ExtensionLogger(context, channelName);
}

/**
 * Create a performance logger instance
 */
export function createPerformanceLogger(logger: ExtensionLogger): PerformanceLogger {
  return new PerformanceLogger(logger);
}