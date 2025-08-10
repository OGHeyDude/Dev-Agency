/**
 * Configuration Manager for VS Code Extension
 * Manages extension settings and configuration with VS Code integration
 * 
 * @file ConfigurationManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';

export interface ExtensionConfig {
  agentPath: string;
  cliPath: string;
  enableInlineAnnotations: boolean;
  enableAutoInvocation: boolean;
  debugPort: number;
  maxConcurrentAgents: number;
  outputFormat: 'json' | 'markdown' | 'text';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  statusBarPosition: 'left' | 'right';
  enableNotifications: boolean;
}

export interface WorkspaceConfig {
  agentPreferences: Record<string, any>;
  customAgents: string[];
  excludePatterns: string[];
  includePatterns: string[];
  contextDepth: number;
  autoSaveBeforeExecution: boolean;
  confirmDestructiveActions: boolean;
}

export class ConfigurationManager {
  private readonly configSection = 'dev-agency';
  private workspaceConfig?: WorkspaceConfig;
  private configChangeHandlers: Array<(config: ExtensionConfig) => void> = [];

  constructor(private context: vscode.ExtensionContext) {
    this.loadWorkspaceConfig();
  }

  /**
   * Get configuration value with type safety and defaults
   */
  get<K extends keyof ExtensionConfig>(key: K): ExtensionConfig[K];
  get<K extends keyof ExtensionConfig>(key: K, defaultValue: ExtensionConfig[K]): ExtensionConfig[K];
  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | undefined {
    const config = vscode.workspace.getConfiguration(this.configSection);
    const value = config.get<T>(key);
    
    if (value !== undefined) {
      return value;
    }
    
    // Return default values for known configuration keys
    const defaults = this.getDefaultConfig();
    if (key in defaults) {
      return (defaults as any)[key] ?? defaultValue;
    }
    
    return defaultValue;
  }

  /**
   * Set configuration value
   */
  async set<K extends keyof ExtensionConfig>(
    key: K, 
    value: ExtensionConfig[K], 
    target?: vscode.ConfigurationTarget
  ): Promise<void>;
  async set<T>(
    key: string, 
    value: T, 
    target?: vscode.ConfigurationTarget
  ): Promise<void>;
  async set(
    key: string, 
    value: any, 
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configSection);
    await config.update(key, value, target);
  }

  /**
   * Get all configuration as typed object
   */
  getAllConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration(this.configSection);
    const defaults = this.getDefaultConfig();

    return {
      agentPath: config.get('agentPath') ?? defaults.agentPath,
      cliPath: config.get('cliPath') ?? defaults.cliPath,
      enableInlineAnnotations: config.get('enableInlineAnnotations') ?? defaults.enableInlineAnnotations,
      enableAutoInvocation: config.get('enableAutoInvocation') ?? defaults.enableAutoInvocation,
      debugPort: config.get('debugPort') ?? defaults.debugPort,
      maxConcurrentAgents: config.get('maxConcurrentAgents') ?? defaults.maxConcurrentAgents,
      outputFormat: config.get('outputFormat') ?? defaults.outputFormat,
      logLevel: config.get('logLevel') ?? defaults.logLevel,
      statusBarPosition: config.get('statusBarPosition') ?? defaults.statusBarPosition,
      enableNotifications: config.get('enableNotifications') ?? defaults.enableNotifications
    };
  }

  /**
   * Get default configuration values
   */
  private getDefaultConfig(): ExtensionConfig {
    return {
      agentPath: '/home/hd/Desktop/LAB/Dev-Agency',
      cliPath: '/home/hd/Desktop/LAB/Dev-Agency/tools/agent-cli/dist/cli.js',
      enableInlineAnnotations: true,
      enableAutoInvocation: false,
      debugPort: 8081,
      maxConcurrentAgents: 3,
      outputFormat: 'markdown',
      logLevel: 'info',
      statusBarPosition: 'right',
      enableNotifications: true
    };
  }

  /**
   * Validate configuration
   */
  async validateConfig(): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config = this.getAllConfig();

    // Validate agent path
    if (!await fs.pathExists(config.agentPath)) {
      errors.push(`Agent path does not exist: ${config.agentPath}`);
    } else {
      const agentsDir = path.join(config.agentPath, 'Agents');
      if (!await fs.pathExists(agentsDir)) {
        errors.push(`Agents directory not found: ${agentsDir}`);
      }
    }

    // Validate CLI path
    if (!await fs.pathExists(config.cliPath)) {
      warnings.push(`CLI tool not found: ${config.cliPath}`);
    }

    // Validate debug port
    if (config.debugPort < 1024 || config.debugPort > 65535) {
      warnings.push(`Debug port should be between 1024 and 65535: ${config.debugPort}`);
    }

    // Validate concurrent agents
    if (config.maxConcurrentAgents < 1 || config.maxConcurrentAgents > 10) {
      warnings.push(`Max concurrent agents should be between 1 and 10: ${config.maxConcurrentAgents}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get agent path with validation
   */
  getAgentPath(): string {
    const agentPath = this.get('agentPath');
    if (!agentPath) {
      throw new Error('Agent path not configured');
    }
    return agentPath;
  }

  /**
   * Get CLI path with validation
   */
  getCliPath(): string {
    const cliPath = this.get('cliPath');
    if (!cliPath) {
      throw new Error('CLI path not configured');
    }
    return cliPath;
  }

  /**
   * Load workspace-specific configuration
   */
  private async loadWorkspaceConfig(): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    const workspaceConfigPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'dev-agency.json');
    
    try {
      if (await fs.pathExists(workspaceConfigPath)) {
        const workspaceConfigContent = await fs.readJson(workspaceConfigPath);
        this.workspaceConfig = this.validateWorkspaceConfig(workspaceConfigContent);
      }
    } catch (error) {
      console.warn('Failed to load workspace configuration:', error);
    }
  }

  /**
   * Save workspace-specific configuration
   */
  async saveWorkspaceConfig(config: Partial<WorkspaceConfig>): Promise<void> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new Error('No workspace folder available');
    }

    const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
    const workspaceConfigPath = path.join(vscodeDir, 'dev-agency.json');

    // Ensure .vscode directory exists
    await fs.ensureDir(vscodeDir);

    // Merge with existing config
    const mergedConfig = { ...this.workspaceConfig, ...config };
    
    await fs.writeJson(workspaceConfigPath, mergedConfig, { spaces: 2 });
    this.workspaceConfig = mergedConfig;
  }

  /**
   * Validate workspace configuration
   */
  private validateWorkspaceConfig(config: any): WorkspaceConfig {
    const defaults: WorkspaceConfig = {
      agentPreferences: {},
      customAgents: [],
      excludePatterns: ['node_modules/**', '.git/**', '**/*.log'],
      includePatterns: ['**/*'],
      contextDepth: 10,
      autoSaveBeforeExecution: true,
      confirmDestructiveActions: true
    };

    return {
      agentPreferences: config.agentPreferences || defaults.agentPreferences,
      customAgents: Array.isArray(config.customAgents) ? config.customAgents : defaults.customAgents,
      excludePatterns: Array.isArray(config.excludePatterns) ? config.excludePatterns : defaults.excludePatterns,
      includePatterns: Array.isArray(config.includePatterns) ? config.includePatterns : defaults.includePatterns,
      contextDepth: typeof config.contextDepth === 'number' ? config.contextDepth : defaults.contextDepth,
      autoSaveBeforeExecution: typeof config.autoSaveBeforeExecution === 'boolean' ? config.autoSaveBeforeExecution : defaults.autoSaveBeforeExecution,
      confirmDestructiveActions: typeof config.confirmDestructiveActions === 'boolean' ? config.confirmDestructiveActions : defaults.confirmDestructiveActions
    };
  }

  /**
   * Get workspace configuration
   */
  getWorkspaceConfig(): WorkspaceConfig | undefined {
    return this.workspaceConfig;
  }

  /**
   * Get agent preferences for specific agent
   */
  getAgentPreferences(agentName: string): any {
    return this.workspaceConfig?.agentPreferences[agentName] || {};
  }

  /**
   * Set agent preferences
   */
  async setAgentPreferences(agentName: string, preferences: any): Promise<void> {
    const currentConfig = this.workspaceConfig || this.validateWorkspaceConfig({});
    currentConfig.agentPreferences[agentName] = preferences;
    await this.saveWorkspaceConfig(currentConfig);
  }

  /**
   * Check if file should be excluded from context
   */
  shouldExcludeFile(filePath: string): boolean {
    if (!this.workspaceConfig) return false;

    const relativePath = vscode.workspace.asRelativePath(filePath);
    
    // Check exclude patterns
    for (const pattern of this.workspaceConfig.excludePatterns) {
      if (this.matchPattern(relativePath, pattern)) {
        return true;
      }
    }

    // Check include patterns
    for (const pattern of this.workspaceConfig.includePatterns) {
      if (this.matchPattern(relativePath, pattern)) {
        return false;
      }
    }

    return false;
  }

  /**
   * Simple pattern matching for file paths
   */
  private matchPattern(path: string, pattern: string): boolean {
    // Convert glob pattern to regex (simplified)
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }

  /**
   * Get configuration section
   */
  getConfigSection(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(this.configSection);
  }

  /**
   * Register configuration change handler
   */
  onConfigurationChanged(handler: (config: ExtensionConfig) => void): vscode.Disposable {
    this.configChangeHandlers.push(handler);
    
    const disposable = vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(this.configSection)) {
        const newConfig = this.getAllConfig();
        handler(newConfig);
      }
    });

    return disposable;
  }

  /**
   * Reload configuration from VS Code settings
   */
  reload(): void {
    const config = this.getAllConfig();
    this.configChangeHandlers.forEach(handler => handler(config));
  }

  /**
   * Export configuration for backup/sharing
   */
  async exportConfiguration(): Promise<string> {
    const globalConfig = this.getAllConfig();
    const workspaceConfig = this.workspaceConfig;

    const exportData = {
      global: globalConfig,
      workspace: workspaceConfig,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import configuration from backup
   */
  async importConfiguration(configData: string): Promise<void> {
    try {
      const importData = JSON.parse(configData);
      
      if (!importData.global || !importData.version) {
        throw new Error('Invalid configuration format');
      }

      // Import global configuration
      const globalConfig = importData.global;
      for (const [key, value] of Object.entries(globalConfig)) {
        await this.set(key, value, vscode.ConfigurationTarget.Global);
      }

      // Import workspace configuration if available
      if (importData.workspace) {
        await this.saveWorkspaceConfig(importData.workspace);
      }

    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configSection);
    const defaults = this.getDefaultConfig();

    for (const [key] of Object.entries(defaults)) {
      await config.update(key, undefined, target);
    }

    if (target === vscode.ConfigurationTarget.Workspace) {
      // Reset workspace configuration
      this.workspaceConfig = undefined;
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        const workspaceConfigPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'dev-agency.json');
        if (await fs.pathExists(workspaceConfigPath)) {
          await fs.remove(workspaceConfigPath);
        }
      }
    }
  }

  /**
   * Get configuration migration suggestions
   */
  async getConfigurationMigrations(): Promise<Array<{
    key: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>> {
    const migrations: Array<{
      key: string;
      oldValue: any;
      newValue: any;
      reason: string;
    }> = [];

    const config = this.getAllConfig();

    // Example migration: old debug port values
    if (config.debugPort === 8080) {
      migrations.push({
        key: 'debugPort',
        oldValue: 8080,
        newValue: 8081,
        reason: 'Avoiding conflict with common development servers'
      });
    }

    // Example migration: deprecated output formats
    if (config.outputFormat === 'text' as any) {
      migrations.push({
        key: 'outputFormat',
        oldValue: 'text',
        newValue: 'markdown',
        reason: 'Text format is deprecated, markdown provides better formatting'
      });
    }

    return migrations;
  }

  /**
   * Apply configuration migrations
   */
  async applyMigrations(): Promise<number> {
    const migrations = await this.getConfigurationMigrations();
    
    for (const migration of migrations) {
      await this.set(migration.key, migration.newValue);
    }

    return migrations.length;
  }

  /**
   * Get configuration health status
   */
  async getConfigurationHealth(): Promise<{
    healthy: boolean;
    score: number;
    issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }>;
    suggestions: string[];
  }> {
    const validation = await this.validateConfig();
    const migrations = await this.getConfigurationMigrations();
    
    const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [
      ...validation.errors.map(error => ({ type: 'error' as const, message: error })),
      ...validation.warnings.map(warning => ({ type: 'warning' as const, message: warning }))
    ];

    if (migrations.length > 0) {
      issues.push({
        type: 'info',
        message: `${migrations.length} configuration migrations available`
      });
    }

    const score = Math.max(0, 100 - (validation.errors.length * 30) - (validation.warnings.length * 10));
    const healthy = validation.valid && score >= 80;

    const suggestions: string[] = [];
    if (!healthy) {
      suggestions.push('Review and fix configuration errors');
    }
    if (migrations.length > 0) {
      suggestions.push('Apply available configuration migrations');
    }
    if (score < 90) {
      suggestions.push('Consider reviewing configuration warnings');
    }

    return {
      healthy,
      score,
      issues,
      suggestions
    };
  }
}