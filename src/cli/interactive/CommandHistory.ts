/**
 * Command History Management with Search Functionality
 * Provides persistent command history with search and filtering capabilities
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export interface HistoryEntry {
  command: string;
  timestamp: Date;
  sessionId?: string;
  success?: boolean;
  duration?: number;
}

export interface HistorySearchOptions {
  query?: string;
  sessionId?: string;
  fromDate?: Date;
  toDate?: Date;
  successOnly?: boolean;
  limit?: number;
}

export class CommandHistory {
  private history: HistoryEntry[] = [];
  private filePath: string;
  private maxSize: number;
  private isLoaded = false;

  constructor(filePath: string, maxSize = 1000) {
    this.filePath = filePath;
    this.maxSize = maxSize;
  }

  /**
   * Load command history from file
   */
  async load(): Promise<void> {
    try {
      if (await fs.pathExists(this.filePath)) {
        const data = await fs.readJson(this.filePath);
        if (Array.isArray(data)) {
          this.history = data.map(entry => ({
            ...entry,
            timestamp: new Date(entry.timestamp)
          }));
        }
      }
      this.isLoaded = true;
    } catch (error) {
      console.warn(`Warning: Could not load command history from ${this.filePath}:`, error);
      this.history = [];
      this.isLoaded = true;
    }
  }

  /**
   * Save command history to file
   */
  async save(): Promise<void> {
    try {
      // Ensure directory exists
      await fs.ensureDir(path.dirname(this.filePath));
      
      // Trim history to max size before saving
      this.trimToMaxSize();
      
      await fs.writeJson(this.filePath, this.history, { spaces: 2 });
    } catch (error) {
      console.warn(`Warning: Could not save command history to ${this.filePath}:`, error);
    }
  }

  /**
   * Add a command to history
   */
  add(command: string, sessionId?: string, success?: boolean, duration?: number): void {
    if (!this.isLoaded) {
      throw new Error('History not loaded. Call load() first.');
    }

    const entry: HistoryEntry = {
      command: command.trim(),
      timestamp: new Date(),
      sessionId,
      success,
      duration
    };

    // Don't add duplicate consecutive commands
    const lastEntry = this.history[this.history.length - 1];
    if (lastEntry && lastEntry.command === entry.command) {
      return;
    }

    this.history.push(entry);
    this.trimToMaxSize();
  }

  /**
   * Get recent commands (simple string array for readline compatibility)
   */
  getRecentCommands(count = 50): string[] {
    if (!this.isLoaded) {
      return [];
    }

    return this.history
      .slice(-count)
      .map(entry => entry.command);
  }

  /**
   * Get detailed history entries
   */
  getHistory(options: HistorySearchOptions = {}): HistoryEntry[] {
    if (!this.isLoaded) {
      return [];
    }

    let filtered = [...this.history];

    // Filter by query (command text search)
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.command.toLowerCase().includes(query)
      );
    }

    // Filter by session ID
    if (options.sessionId) {
      filtered = filtered.filter(entry => entry.sessionId === options.sessionId);
    }

    // Filter by date range
    if (options.fromDate) {
      filtered = filtered.filter(entry => entry.timestamp >= options.fromDate!);
    }
    if (options.toDate) {
      filtered = filtered.filter(entry => entry.timestamp <= options.toDate!);
    }

    // Filter by success status
    if (options.successOnly) {
      filtered = filtered.filter(entry => entry.success === true);
    }

    // Limit results
    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Search history with fuzzy matching
   */
  search(query: string, maxResults = 10): HistoryEntry[] {
    if (!this.isLoaded || !query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const matches: Array<{ entry: HistoryEntry; score: number }> = [];

    for (const entry of this.history) {
      const command = entry.command.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (command === searchTerm) {
        score = 100;
      }
      // Starts with query gets high score
      else if (command.startsWith(searchTerm)) {
        score = 80;
      }
      // Contains query gets medium score
      else if (command.includes(searchTerm)) {
        score = 60;
      }
      // Check for partial word matches
      else {
        const words = command.split(' ');
        for (const word of words) {
          if (word.startsWith(searchTerm)) {
            score = 40;
            break;
          }
          if (word.includes(searchTerm)) {
            score = 20;
            break;
          }
        }
      }

      if (score > 0) {
        matches.push({ entry, score });
      }
    }

    // Sort by score (descending) and timestamp (descending for same scores)
    matches.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return b.entry.timestamp.getTime() - a.entry.timestamp.getTime();
    });

    return matches.slice(0, maxResults).map(match => match.entry);
  }

  /**
   * Get command frequency statistics
   */
  getStats(): {
    totalCommands: number;
    uniqueCommands: number;
    mostUsed: Array<{ command: string; count: number }>;
    averagePerSession: number;
    successRate: number;
  } {
    if (!this.isLoaded) {
      return {
        totalCommands: 0,
        uniqueCommands: 0,
        mostUsed: [],
        averagePerSession: 0,
        successRate: 0
      };
    }

    const commandCounts = new Map<string, number>();
    const sessions = new Set<string>();
    let successCount = 0;
    let totalWithStatus = 0;

    for (const entry of this.history) {
      // Count command frequency
      const count = commandCounts.get(entry.command) || 0;
      commandCounts.set(entry.command, count + 1);

      // Track sessions
      if (entry.sessionId) {
        sessions.add(entry.sessionId);
      }

      // Track success rate
      if (entry.success !== undefined) {
        totalWithStatus++;
        if (entry.success) {
          successCount++;
        }
      }
    }

    // Get most used commands
    const mostUsed = Array.from(commandCounts.entries())
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCommands: this.history.length,
      uniqueCommands: commandCounts.size,
      mostUsed,
      averagePerSession: sessions.size > 0 ? this.history.length / sessions.size : 0,
      successRate: totalWithStatus > 0 ? successCount / totalWithStatus : 0
    };
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
  }

  /**
   * Get command suggestions based on partial input
   */
  getSuggestions(partial: string, maxSuggestions = 5): string[] {
    if (!this.isLoaded || !partial.trim()) {
      return [];
    }

    const searchTerm = partial.toLowerCase().trim();
    const suggestions = new Set<string>();

    // Look for commands that start with the partial input
    for (const entry of this.history) {
      const command = entry.command.toLowerCase();
      if (command.startsWith(searchTerm) && command !== searchTerm) {
        suggestions.add(entry.command);
        if (suggestions.size >= maxSuggestions) {
          break;
        }
      }
    }

    // If we don't have enough suggestions, look for commands containing the partial
    if (suggestions.size < maxSuggestions) {
      for (const entry of this.history) {
        const command = entry.command.toLowerCase();
        if (command.includes(searchTerm) && !command.startsWith(searchTerm)) {
          suggestions.add(entry.command);
          if (suggestions.size >= maxSuggestions) {
            break;
          }
        }
      }
    }

    return Array.from(suggestions);
  }

  /**
   * Export history to different formats
   */
  async export(format: 'json' | 'csv' | 'txt', outputPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));

    switch (format) {
      case 'json':
        await fs.writeJson(outputPath, this.history, { spaces: 2 });
        break;

      case 'csv':
        const csvHeader = 'timestamp,command,sessionId,success,duration\n';
        const csvRows = this.history.map(entry => 
          `"${entry.timestamp.toISOString()}","${entry.command.replace(/"/g, '""')}","${entry.sessionId || ''}","${entry.success || ''}","${entry.duration || ''}"`
        ).join('\n');
        await fs.writeFile(outputPath, csvHeader + csvRows);
        break;

      case 'txt':
        const txtContent = this.history.map(entry => 
          `[${entry.timestamp.toISOString()}] ${entry.command}`
        ).join('\n');
        await fs.writeFile(outputPath, txtContent);
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Import history from a file
   */
  async import(filePath: string, merge = false): Promise<void> {
    if (!await fs.pathExists(filePath)) {
      throw new Error(`History file not found: ${filePath}`);
    }

    const data = await fs.readJson(filePath);
    if (!Array.isArray(data)) {
      throw new Error('Invalid history file format');
    }

    const importedHistory: HistoryEntry[] = data.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    }));

    if (merge) {
      // Merge with existing history, avoiding duplicates
      const existingCommands = new Set(
        this.history.map(entry => `${entry.command}-${entry.timestamp.getTime()}`)
      );

      for (const entry of importedHistory) {
        const key = `${entry.command}-${entry.timestamp.getTime()}`;
        if (!existingCommands.has(key)) {
          this.history.push(entry);
        }
      }

      // Sort by timestamp
      this.history.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } else {
      // Replace existing history
      this.history = importedHistory;
    }

    this.trimToMaxSize();
  }

  private trimToMaxSize(): void {
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize);
    }
  }
}