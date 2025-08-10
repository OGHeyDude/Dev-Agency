/**
 * Logger - Structured logging utility for Agent CLI
 * 
 * @file Logger.ts
 * @created 2025-08-09
 * @updated 2025-08-09
 */

import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  component?: string;
}

export class Logger {
  private logLevel: LogLevel = 'info';
  private logFile?: string;
  private enableConsole = true;
  private enableFile = false;

  /**
   * Create a new Logger instance with the specified options
   */
  static create(options?: {
    level?: LogLevel;
    logFile?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
    component?: string;
  }): Logger {
    return new Logger(options);
  }

  constructor(options?: {
    level?: LogLevel;
    logFile?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
    component?: string;
  }) {
    if (options?.level) this.logLevel = options.level;
    if (options?.logFile) {
      this.logFile = options.logFile;
      this.enableFile = true;
    }
    if (options?.enableConsole !== undefined) this.enableConsole = options.enableConsole;
    if (options?.enableFile !== undefined) this.enableFile = options.enableFile;
  }

  /**
   * Set logging level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Enable/disable console logging
   */
  setConsoleLogging(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  /**
   * Enable/disable file logging
   */
  setFileLogging(enabled: boolean, logFile?: string): void {
    this.enableFile = enabled;
    if (logFile) this.logFile = logFile;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  /**
   * Log success message (info level with green color)
   */
  success(message: string, data?: any): void {
    this.log('info', message, data, { success: true });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any, meta?: { success?: boolean }): void {
    // Check if message should be logged based on level
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Console output
    if (this.enableConsole) {
      this.logToConsole(logEntry, meta);
    }

    // File output
    if (this.enableFile && this.logFile) {
      this.logToFile(logEntry).catch(error => {
        console.error('Failed to write to log file:', error);
      });
    }
  }

  /**
   * Check if message should be logged based on current level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.logLevel];
  }

  /**
   * Log to console with colors
   */
  private logToConsole(entry: LogEntry, meta?: { success?: boolean }): void {
    const timestamp = chalk.gray(entry.timestamp.split('T')[1].split('.')[0]);
    
    let levelColor: (text: string) => string;
    let prefix = '';
    
    switch (entry.level) {
      case 'debug':
        levelColor = chalk.blue;
        prefix = '🔍';
        break;
      case 'info':
        levelColor = meta?.success ? chalk.green : chalk.blue;
        prefix = meta?.success ? '✅' : 'ℹ️';
        break;
      case 'warn':
        levelColor = chalk.yellow;
        prefix = '⚠️';
        break;
      case 'error':
        levelColor = chalk.red;
        prefix = '❌';
        break;
    }

    const levelText = levelColor(entry.level.toUpperCase().padEnd(5));
    const formattedMessage = this.formatMessage(entry.message, entry.data);
    
    console.log(`${timestamp} ${prefix} ${levelText} ${formattedMessage}`);
    
    // Print data if it exists and level is debug or error
    if (entry.data && (entry.level === 'debug' || entry.level === 'error')) {
      console.log(chalk.gray('  Data:'), entry.data);
    }
  }

  /**
   * Log to file (JSON format)
   */
  private async logToFile(entry: LogEntry): Promise<void> {
    if (!this.logFile) return;
    
    try {
      // Ensure log directory exists
      await fs.ensureDir(path.dirname(this.logFile));
      
      // Append log entry as JSON line
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(this.logFile, logLine, 'utf-8');
    } catch (error) {
      // Don't throw here to avoid recursive logging
      console.error('Failed to write log entry:', error);
    }
  }

  /**
   * Format message with data
   */
  private formatMessage(message: string, data?: any): string {
    if (!data) return message;
    
    // If data is an error, include the error message
    if (data instanceof Error) {
      return `${message} ${chalk.red(data.message)}`;
    }
    
    // If data is a simple value, append it
    if (typeof data === 'string' || typeof data === 'number') {
      return `${message} ${chalk.cyan(String(data))}`;
    }
    
    // For complex objects, indicate they are logged separately
    return `${message} ${chalk.gray('[see data below]')}`;
  }

  /**
   * Create a child logger with a specific component name
   */
  child(component: string): Logger {
    const childLogger = new Logger({
      level: this.logLevel,
      logFile: this.logFile || undefined,
      enableConsole: this.enableConsole,
      enableFile: this.enableFile,
      component
    });
    
    // Override the log method to include component
    const originalLog = childLogger['log'].bind(childLogger);
    childLogger['log'] = (level: LogLevel, message: string, data?: any, meta?: any) => {
      const componentMessage = `[${component}] ${message}`;
      originalLog(level, componentMessage, data, meta);
    };
    
    return childLogger;
  }

  /**
   * Read log entries from file
   */
  async readLogs(options?: {
    limit?: number;
    level?: LogLevel;
    since?: Date;
    component?: string;
  }): Promise<LogEntry[]> {
    if (!this.logFile || !await fs.pathExists(this.logFile)) {
      return [];
    }
    
    try {
      const content = await fs.readFile(this.logFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      let entries: LogEntry[] = [];
      
      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as LogEntry;
          entries.push(entry);
        } catch (error) {
          // Skip invalid JSON lines
          continue;
        }
      }
      
      // Apply filters
      if (options?.level) {
        entries = entries.filter(entry => entry.level === options.level);
      }
      
      if (options?.since) {
        entries = entries.filter(entry => 
          new Date(entry.timestamp) >= options.since!
        );
      }
      
      if (options?.component) {
        entries = entries.filter(entry => 
          entry.message.includes(`[${options.component}]`)
        );
      }
      
      // Sort by timestamp (newest first)
      entries.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Apply limit
      if (options?.limit) {
        entries = entries.slice(0, options.limit);
      }
      
      return entries;
    } catch (error) {
      this.error('Failed to read log file:', error);
      return [];
    }
  }

  /**
   * Clear log file
   */
  async clearLogs(): Promise<void> {
    if (!this.logFile) return;
    
    try {
      await fs.remove(this.logFile);
      this.info('Log file cleared');
    } catch (error) {
      this.error('Failed to clear log file:', error);
      throw error;
    }
  }

  /**
   * Get log file size
   */
  async getLogSize(): Promise<number> {
    if (!this.logFile || !await fs.pathExists(this.logFile)) {
      return 0;
    }
    
    try {
      const stats = await fs.stat(this.logFile);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Rotate log file if it gets too large
   */
  async rotateLogs(maxSizeBytes: number = 10 * 1024 * 1024): Promise<void> {
    if (!this.logFile) return;
    
    const currentSize = await this.getLogSize();
    
    if (currentSize > maxSizeBytes) {
      const rotatedFile = `${this.logFile}.${Date.now()}.old`;
      
      try {
        await fs.move(this.logFile, rotatedFile);
        this.info(`Log file rotated to: ${rotatedFile}`);
      } catch (error) {
        this.error('Failed to rotate log file:', error);
        throw error;
      }
    }
  }
}