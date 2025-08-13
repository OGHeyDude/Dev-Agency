/**
 * AGENT-027: Auto-fix Agent Configuration System
 * Manages configuration for the auto-fix agent with type-safe settings
 */

import { AutoFixConfig, RiskLevel, IssueType } from './types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration manager for the Auto-fix Agent
 * Handles loading, validation, and runtime configuration management
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: AutoFixConfig;
  private configPath: string;
  private watchers: Map<string, (config: AutoFixConfig) => void> = new Map();

  private constructor() {
    this.configPath = this.getConfigPath();
    this.config = this.loadConfiguration();
  }

  /**
   * Get singleton instance of ConfigurationManager
   */
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): AutoFixConfig {
    return { ...this.config };
  }

  /**
   * Update configuration with partial values
   */
  public updateConfig(updates: Partial<AutoFixConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
    this.saveConfiguration();
    this.notifyWatchers();
  }

  /**
   * Get configuration for specific issue type
   */
  public getIssueConfig(issueType: IssueType) {
    return this.config.issueTypes[issueType];
  }

  /**
   * Check if auto-fix is enabled for issue type
   */
  public isAutoFixEnabled(issueType: IssueType): boolean {
    return this.config.issueTypes[issueType]?.autoFixEnabled ?? false;
  }

  /**
   * Get confidence threshold for issue type
   */
  public getConfidenceThreshold(issueType: IssueType): number {
    return this.config.issueTypes[issueType]?.confidenceThreshold ?? 
           this.config.thresholds.autoFixConfidence;
  }

  /**
   * Get risk tolerance level
   */
  public getRiskTolerance(): RiskLevel {
    return this.config.riskTolerance;
  }

  /**
   * Check if fix should be auto-applied based on confidence and risk
   */
  public shouldAutoApply(
    confidence: number,
    risk: RiskLevel,
    issueType: IssueType
  ): boolean {
    if (!this.isAutoFixEnabled(issueType)) {
      return false;
    }

    const confidenceThreshold = this.getConfidenceThreshold(issueType);
    if (confidence < confidenceThreshold) {
      return false;
    }

    // Check risk tolerance
    const riskLevels: RiskLevel[] = ['low', 'medium', 'high'];
    const toleranceIndex = riskLevels.indexOf(this.config.riskTolerance);
    const riskIndex = riskLevels.indexOf(risk);

    return riskIndex <= toleranceIndex;
  }

  /**
   * Register configuration change watcher
   */
  public watchConfig(id: string, callback: (config: AutoFixConfig) => void): void {
    this.watchers.set(id, callback);
  }

  /**
   * Unregister configuration watcher
   */
  public unwatchConfig(id: string): void {
    this.watchers.delete(id);
  }

  /**
   * Validate configuration against schema
   */
  public validateConfig(config: Partial<AutoFixConfig>): string[] {
    const errors: string[] = [];

    // Validate thresholds
    if (config.thresholds) {
      const { autoFixConfidence, predictionConfidence, regressionThreshold } = config.thresholds;
      
      if (autoFixConfidence !== undefined && (autoFixConfidence < 0 || autoFixConfidence > 1)) {
        errors.push('autoFixConfidence must be between 0 and 1');
      }
      
      if (predictionConfidence !== undefined && (predictionConfidence < 0 || predictionConfidence > 1)) {
        errors.push('predictionConfidence must be between 0 and 1');
      }
      
      if (regressionThreshold !== undefined && (regressionThreshold < 0 || regressionThreshold > 1)) {
        errors.push('regressionThreshold must be between 0 and 1');
      }
    }

    // Validate timeouts
    if (config.timeouts) {
      Object.entries(config.timeouts).forEach(([key, value]) => {
        if (value !== undefined && value < 0) {
          errors.push(`${key} timeout must be positive`);
        }
      });
    }

    // Validate paths
    if (config.paths) {
      Object.entries(config.paths).forEach(([key, pathValue]) => {
        if (pathValue && !this.isValidPath(pathValue)) {
          errors.push(`Invalid path for ${key}: ${pathValue}`);
        }
      });
    }

    return errors;
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    this.saveConfiguration();
    this.notifyWatchers();
  }

  /**
   * Export configuration to JSON
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  public importConfig(json: string): void {
    try {
      const imported = JSON.parse(json);
      const errors = this.validateConfig(imported);
      
      if (errors.length > 0) {
        throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
      }
      
      this.config = this.mergeConfig(this.getDefaultConfig(), imported);
      this.saveConfiguration();
      this.notifyWatchers();
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);
    }
  }

  // Private methods

  private getConfigPath(): string {
    // Check environment variable first
    const envPath = process.env.AUTOFIX_CONFIG_PATH;
    if (envPath) {
      return envPath;
    }

    // Check common config locations
    const configLocations = [
      path.join(process.cwd(), '.autofix.config.json'),
      path.join(process.cwd(), 'autofix.config.json'),
      path.join(process.env.HOME || '', '.config', 'autofix', 'config.json'),
    ];

    for (const location of configLocations) {
      if (fs.existsSync(location)) {
        return location;
      }
    }

    // Default to project root
    return path.join(process.cwd(), '.autofix.config.json');
  }

  private loadConfiguration(): AutoFixConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        const loaded = JSON.parse(content);
        return this.mergeConfig(this.getDefaultConfig(), loaded);
      }
    } catch (error) {
      console.warn(`Failed to load configuration from ${this.configPath}:`, error);
    }

    return this.getDefaultConfig();
  }

  private saveConfiguration(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(`Failed to save configuration to ${this.configPath}:`, error);
    }
  }

  private mergeConfig(base: AutoFixConfig, updates: Partial<AutoFixConfig>): AutoFixConfig {
    const merged = { ...base };

    // Deep merge objects
    if (updates.thresholds) {
      merged.thresholds = { ...base.thresholds, ...updates.thresholds };
    }
    
    if (updates.timeouts) {
      merged.timeouts = { ...base.timeouts, ...updates.timeouts };
    }
    
    if (updates.paths) {
      merged.paths = { ...base.paths, ...updates.paths };
    }
    
    if (updates.issueTypes) {
      merged.issueTypes = { ...base.issueTypes, ...updates.issueTypes };
    }
    
    if (updates.learning) {
      merged.learning = { ...base.learning, ...updates.learning };
    }
    
    if (updates.notifications) {
      merged.notifications = { ...base.notifications, ...updates.notifications };
    }
    
    if (updates.safety) {
      merged.safety = { ...base.safety, ...updates.safety };
    }
    
    if (updates.monitoring) {
      merged.monitoring = { ...base.monitoring, ...updates.monitoring };
    }

    // Simple properties
    if (updates.enabled !== undefined) merged.enabled = updates.enabled;
    if (updates.riskTolerance !== undefined) merged.riskTolerance = updates.riskTolerance;
    if (updates.maxConcurrentFixes !== undefined) merged.maxConcurrentFixes = updates.maxConcurrentFixes;
    if (updates.dryRun !== undefined) merged.dryRun = updates.dryRun;
    if (updates.logLevel !== undefined) merged.logLevel = updates.logLevel;
    if (updates.excludePatterns) merged.excludePatterns = updates.excludePatterns;
    if (updates.includePatterns) merged.includePatterns = updates.includePatterns;

    return merged;
  }

  private notifyWatchers(): void {
    this.watchers.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        console.error('Error in configuration watcher:', error);
      }
    });
  }

  private isValidPath(pathValue: string): boolean {
    try {
      // Check if path is absolute or can be resolved
      const resolved = path.resolve(pathValue);
      return resolved.length > 0;
    } catch {
      return false;
    }
  }

  private getDefaultConfig(): AutoFixConfig {
    return {
      enabled: true,
      riskTolerance: 'medium',
      thresholds: {
        autoFixConfidence: 0.9,
        predictionConfidence: 0.7,
        regressionThreshold: 0.05,
      },
      timeouts: {
        analysis: 30000,
        fix: 60000,
        validation: 30000,
        rollback: 10000,
      },
      maxConcurrentFixes: 3,
      dryRun: false,
      logLevel: 'info',
      paths: {
        workspace: process.cwd(),
        tempDir: path.join(process.cwd(), '.autofix-temp'),
        backupDir: path.join(process.cwd(), '.autofix-backup'),
        historyFile: path.join(process.cwd(), '.autofix-history.json'),
      },
      excludePatterns: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.git/**',
        '*.min.js',
        '*.min.css',
      ],
      includePatterns: [
        'src/**',
        'lib/**',
        'test/**',
        'tests/**',
      ],
      issueTypes: {
        [IssueType.Compilation]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.9,
          maxRetries: 3,
          priority: 1,
        },
        [IssueType.Test]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.85,
          maxRetries: 2,
          priority: 2,
        },
        [IssueType.Dependency]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.95,
          maxRetries: 1,
          priority: 3,
        },
        [IssueType.Lint]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.8,
          maxRetries: 3,
          priority: 4,
        },
        [IssueType.Performance]: {
          autoFixEnabled: false,
          confidenceThreshold: 0.95,
          maxRetries: 1,
          priority: 5,
        },
        [IssueType.Security]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.98,
          maxRetries: 1,
          priority: 1,
        },
        [IssueType.Accessibility]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.85,
          maxRetries: 2,
          priority: 3,
        },
        [IssueType.Style]: {
          autoFixEnabled: true,
          confidenceThreshold: 0.75,
          maxRetries: 3,
          priority: 5,
        },
        [IssueType.Documentation]: {
          autoFixEnabled: false,
          confidenceThreshold: 0.8,
          maxRetries: 1,
          priority: 4,
        },
        [IssueType.Configuration]: {
          autoFixEnabled: false,
          confidenceThreshold: 0.9,
          maxRetries: 1,
          priority: 2,
        },
      },
      learning: {
        enabled: true,
        minSamplesForPattern: 5,
        patternConfidenceThreshold: 0.8,
        maxPatternsStored: 1000,
        updateFrequency: 86400000, // 24 hours
      },
      notifications: {
        enabled: true,
        channels: ['console'],
        events: {
          fixApplied: true,
          fixFailed: true,
          predictionGenerated: true,
          rollbackPerformed: true,
        },
        webhookUrl: undefined,
        emailRecipients: [],
        slackChannel: undefined,
      },
      safety: {
        requireApprovalForHighRisk: true,
        requireTestsBeforeFix: true,
        backupBeforeFix: true,
        maxChangesPerFix: 50,
        prohibitedPatterns: [],
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute
        healthCheckInterval: 300000, // 5 minutes
        exportMetrics: false,
        metricsExportPath: undefined,
      },
    };
  }
}

// Export singleton instance getter for convenience
export const getConfig = () => ConfigurationManager.getInstance().getConfig();
export const updateConfig = (updates: Partial<AutoFixConfig>) => 
  ConfigurationManager.getInstance().updateConfig(updates);
export const shouldAutoApply = (confidence: number, risk: RiskLevel, issueType: IssueType) =>
  ConfigurationManager.getInstance().shouldAutoApply(confidence, risk, issueType);