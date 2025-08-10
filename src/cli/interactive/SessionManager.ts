/**
 * Session Management System
 * Handles persistent session state, variables, and context management
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { REPLSession } from './REPLMode';

export interface SessionSnapshot {
  id: string;
  name?: string;
  timestamp: string;
  context: Record<string, any>;
  variables: Record<string, any>;
  workingDirectory: string;
  metadata: {
    startTime: string;
    commandCount: number;
    lastCommand?: string;
    version: string;
  };
}

export interface SessionListItem {
  name: string;
  id: string;
  timestamp: string;
  commandCount: number;
  size: number;
}

export class SessionManager {
  private defaultSessionFile: string;
  private namedSessionsDir: string;
  private maxSessions = 50;
  private sessionVersion = '1.0.0';

  constructor(sessionFile: string) {
    this.defaultSessionFile = sessionFile;
    this.namedSessionsDir = path.join(path.dirname(sessionFile), 'sessions');
  }

  /**
   * Save the current session to the default location
   */
  async saveSession(session: REPLSession): Promise<void> {
    try {
      const snapshot = this.createSnapshot(session);
      await fs.ensureDir(path.dirname(this.defaultSessionFile));
      await fs.writeJson(this.defaultSessionFile, snapshot, { spaces: 2 });
    } catch (error) {
      console.warn(`Warning: Could not save session to ${this.defaultSessionFile}:`, error);
    }
  }

  /**
   * Load session from the default location
   */
  async loadSession(session: REPLSession): Promise<void> {
    try {
      if (await fs.pathExists(this.defaultSessionFile)) {
        const snapshot = await fs.readJson(this.defaultSessionFile) as SessionSnapshot;
        this.applySnapshot(session, snapshot);
      }
    } catch (error) {
      console.warn(`Warning: Could not load session from ${this.defaultSessionFile}:`, error);
    }
  }

  /**
   * Save session with a specific name
   */
  async saveNamedSession(name: string, session: REPLSession): Promise<void> {
    if (!this.isValidSessionName(name)) {
      throw new Error('Invalid session name. Use alphanumeric characters, hyphens, and underscores only.');
    }

    try {
      await fs.ensureDir(this.namedSessionsDir);
      
      const snapshot = this.createSnapshot(session);
      snapshot.name = name;
      
      const sessionFile = path.join(this.namedSessionsDir, `${name}.json`);
      await fs.writeJson(sessionFile, snapshot, { spaces: 2 });

      // Clean up old sessions if needed
      await this.cleanupOldSessions();
    } catch (error) {
      throw new Error(`Failed to save session '${name}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load a named session
   */
  async loadNamedSession(name: string): Promise<REPLSession | null> {
    try {
      const sessionFile = path.join(this.namedSessionsDir, `${name}.json`);
      
      if (!await fs.pathExists(sessionFile)) {
        return null;
      }

      const snapshot = await fs.readJson(sessionFile) as SessionSnapshot;
      
      // Create a new session and apply the snapshot
      const session: REPLSession = {
        id: snapshot.id,
        name: snapshot.name,
        context: {},
        variables: {},
        startTime: new Date(),
        commandCount: 0,
        workingDirectory: process.cwd()
      };

      this.applySnapshot(session, snapshot);
      return session;
    } catch (error) {
      throw new Error(`Failed to load session '${name}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all named sessions
   */
  async listSessions(): Promise<SessionListItem[]> {
    try {
      if (!await fs.pathExists(this.namedSessionsDir)) {
        return [];
      }

      const files = await fs.readdir(this.namedSessionsDir);
      const sessionFiles = files.filter(file => file.endsWith('.json'));
      
      const sessions: SessionListItem[] = [];

      for (const file of sessionFiles) {
        try {
          const sessionFile = path.join(this.namedSessionsDir, file);
          const snapshot = await fs.readJson(sessionFile) as SessionSnapshot;
          const stats = await fs.stat(sessionFile);
          
          sessions.push({
            name: path.basename(file, '.json'),
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            commandCount: snapshot.metadata.commandCount,
            size: stats.size
          });
        } catch (error) {
          // Skip corrupted session files
          console.warn(`Warning: Could not read session file ${file}:`, error);
        }
      }

      // Sort by timestamp (newest first)
      return sessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.warn('Warning: Could not list sessions:', error);
      return [];
    }
  }

  /**
   * Delete a named session
   */
  async deleteSession(name: string): Promise<boolean> {
    try {
      const sessionFile = path.join(this.namedSessionsDir, `${name}.json`);
      
      if (await fs.pathExists(sessionFile)) {
        await fs.remove(sessionFile);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Failed to delete session '${name}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export session to a portable format
   */
  async exportSession(sessionName: string, outputPath: string, format: 'json' | 'yaml' = 'json'): Promise<void> {
    const sessionFile = path.join(this.namedSessionsDir, `${sessionName}.json`);
    
    if (!await fs.pathExists(sessionFile)) {
      throw new Error(`Session '${sessionName}' not found`);
    }

    const snapshot = await fs.readJson(sessionFile);
    
    await fs.ensureDir(path.dirname(outputPath));

    if (format === 'json') {
      await fs.writeJson(outputPath, snapshot, { spaces: 2 });
    } else if (format === 'yaml') {
      const yaml = require('yaml');
      const yamlContent = yaml.stringify(snapshot);
      await fs.writeFile(outputPath, yamlContent);
    }
  }

  /**
   * Import session from an exported file
   */
  async importSession(filePath: string, newName?: string): Promise<string> {
    if (!await fs.pathExists(filePath)) {
      throw new Error(`Import file not found: ${filePath}`);
    }

    let snapshot: SessionSnapshot;
    
    try {
      if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        const yaml = require('yaml');
        const yamlContent = await fs.readFile(filePath, 'utf-8');
        snapshot = yaml.parse(yamlContent);
      } else {
        snapshot = await fs.readJson(filePath);
      }
    } catch (error) {
      throw new Error(`Failed to parse import file: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Validate snapshot structure
    if (!snapshot.id || !snapshot.metadata) {
      throw new Error('Invalid session file format');
    }

    // Generate new session name if not provided
    const sessionName = newName || 
                       snapshot.name || 
                       `imported-${Date.now().toString(36)}`;

    // Update snapshot metadata
    snapshot.name = sessionName;
    snapshot.timestamp = new Date().toISOString();

    // Save the imported session
    await fs.ensureDir(this.namedSessionsDir);
    const outputFile = path.join(this.namedSessionsDir, `${sessionName}.json`);
    await fs.writeJson(outputFile, snapshot, { spaces: 2 });

    return sessionName;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    totalSize: number;
    oldestSession?: string;
    newestSession?: string;
    averageCommandCount: number;
  }> {
    const sessions = await this.listSessions();
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalSize: 0,
        averageCommandCount: 0
      };
    }

    const totalSize = sessions.reduce((sum, session) => sum + session.size, 0);
    const totalCommands = sessions.reduce((sum, session) => sum + session.commandCount, 0);
    
    // Sort by timestamp
    const sortedByTime = [...sessions].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      totalSessions: sessions.length,
      totalSize,
      oldestSession: sortedByTime[0]?.name,
      newestSession: sortedByTime[sortedByTime.length - 1]?.name,
      averageCommandCount: Math.round(totalCommands / sessions.length)
    };
  }

  /**
   * Backup all sessions to a single archive
   */
  async backupSessions(backupPath: string): Promise<void> {
    const sessions = await this.listSessions();
    const backup: Record<string, SessionSnapshot> = {};

    for (const session of sessions) {
      const sessionFile = path.join(this.namedSessionsDir, `${session.name}.json`);
      if (await fs.pathExists(sessionFile)) {
        backup[session.name] = await fs.readJson(sessionFile);
      }
    }

    // Include metadata about the backup
    const backupData = {
      metadata: {
        created: new Date().toISOString(),
        version: this.sessionVersion,
        sessionCount: Object.keys(backup).length
      },
      sessions: backup
    };

    await fs.ensureDir(path.dirname(backupPath));
    await fs.writeJson(backupPath, backupData, { spaces: 2 });
  }

  /**
   * Restore sessions from a backup
   */
  async restoreSessions(backupPath: string, overwrite = false): Promise<number> {
    if (!await fs.pathExists(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const backupData = await fs.readJson(backupPath);
    
    if (!backupData.sessions || !backupData.metadata) {
      throw new Error('Invalid backup file format');
    }

    await fs.ensureDir(this.namedSessionsDir);
    
    let restoredCount = 0;

    for (const [sessionName, snapshot] of Object.entries(backupData.sessions)) {
      const sessionFile = path.join(this.namedSessionsDir, `${sessionName}.json`);
      
      // Check if session already exists
      if (!overwrite && await fs.pathExists(sessionFile)) {
        console.warn(`Session '${sessionName}' already exists, skipping`);
        continue;
      }

      await fs.writeJson(sessionFile, snapshot, { spaces: 2 });
      restoredCount++;
    }

    return restoredCount;
  }

  private createSnapshot(session: REPLSession): SessionSnapshot {
    return {
      id: session.id,
      name: session.name,
      timestamp: new Date().toISOString(),
      context: { ...session.context },
      variables: { ...session.variables },
      workingDirectory: session.workingDirectory,
      metadata: {
        startTime: session.startTime.toISOString(),
        commandCount: session.commandCount,
        lastCommand: session.lastCommand,
        version: this.sessionVersion
      }
    };
  }

  private applySnapshot(session: REPLSession, snapshot: SessionSnapshot): void {
    session.id = snapshot.id;
    session.name = snapshot.name;
    session.context = { ...snapshot.context };
    session.variables = { ...snapshot.variables };
    session.workingDirectory = snapshot.workingDirectory || process.cwd();
    
    if (snapshot.metadata) {
      session.startTime = new Date(snapshot.metadata.startTime);
      session.commandCount = snapshot.metadata.commandCount;
      session.lastCommand = snapshot.metadata.lastCommand;
    }
  }

  private isValidSessionName(name: string): boolean {
    // Allow alphanumeric characters, hyphens, underscores, and dots
    return /^[a-zA-Z0-9._-]+$/.test(name) && name.length > 0 && name.length <= 64;
  }

  private async cleanupOldSessions(): Promise<void> {
    try {
      const sessions = await this.listSessions();
      
      if (sessions.length > this.maxSessions) {
        // Sort by timestamp (oldest first)
        const sorted = sessions.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        // Delete oldest sessions
        const toDelete = sorted.slice(0, sessions.length - this.maxSessions);
        
        for (const session of toDelete) {
          await this.deleteSession(session.name);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not cleanup old sessions:', error);
    }
  }
}