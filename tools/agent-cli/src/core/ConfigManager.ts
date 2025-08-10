/**
 * Configuration Manager - YAML-based configuration system
 * 
 * @file ConfigManager.ts
 * @created 2025-08-09
 * @updated 2025-08-09
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as YAML from 'yaml';
import * as os from 'os';
import { Logger } from '../utils/Logger';

export interface AgentCliConfig {
  // General settings
  default_parallel_limit: number;
  default_timeout: number;
  default_format: 'json' | 'markdown' | 'text';
  
  // Paths
  dev_agency_path: string;
  agents_path: string;
  recipes_path: string;
  
  // Project-specific settings
  project_type?: 'web-app' | 'cli' | 'library' | 'mcp-server';
  context_paths: string[];
  output_directory: string;
  
  // Agent preferences
  preferred_agents: Record<string, string[]>;
  agent_settings: Record<string, any>;
  
  // Execution settings
  auto_optimize_context: boolean;
  save_execution_logs: boolean;
  metrics_enabled: boolean;
  
  // Recipe settings
  recipe_variables: Record<string, any>;
}

export class ConfigManager {
  private logger = new Logger();
  private config: AgentCliConfig;
  private configPath: string;
  private globalConfigPath: string;

  constructor() {
    // Default configuration
    this.config = this.getDefaultConfig();
    
    // Configuration file paths
    this.configPath = path.join(process.cwd(), '.agent-cli.yaml');
    this.globalConfigPath = path.join(os.homedir(), '.agent-cli', 'config.yaml');
    
    this.loadConfiguration();
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AgentCliConfig {
    return {
      // General settings
      default_parallel_limit: 3,
      default_timeout: 300,
      default_format: 'text',
      
      // Paths
      dev_agency_path: '/home/hd/Desktop/LAB/Dev-Agency',
      agents_path: '/home/hd/Desktop/LAB/Dev-Agency/Agents',
      recipes_path: '/home/hd/Desktop/LAB/Dev-Agency/recipes',
      
      // Project-specific settings
      context_paths: ['./src', './docs'],
      output_directory: './agent-output',
      
      // Agent preferences
      preferred_agents: {
        'architecture': ['architect'],
        'coding': ['coder', 'mcp-dev'],
        'testing': ['tester'],
        'documentation': ['documenter'],
        'performance': ['performance']
      },
      agent_settings: {},
      
      // Execution settings
      auto_optimize_context: true,
      save_execution_logs: true,
      metrics_enabled: true,
      
      // Recipe settings
      recipe_variables: {}
    };
  }

  /**
   * Load configuration from files (global then local)
   */
  private async loadConfiguration(): Promise<void> {
    try {
      // Load global config first
      if (await fs.pathExists(this.globalConfigPath)) {
        const globalConfig = await this.loadConfigFile(this.globalConfigPath);
        this.config = { ...this.config, ...globalConfig };
        this.logger.debug('Loaded global configuration');
      }

      // Load local project config (overrides global)
      if (await fs.pathExists(this.configPath)) {
        const localConfig = await this.loadConfigFile(this.configPath);
        this.config = { ...this.config, ...localConfig };
        this.logger.debug('Loaded local configuration');
      }
    } catch (error) {
      this.logger.warn('Failed to load configuration:', error);
    }
  }

  /**
   * Load configuration from specific file
   */
  async loadConfig(filePath: string): Promise<void> {
    try {
      const config = await this.loadConfigFile(filePath);
      this.config = { ...this.config, ...config };
      this.logger.info(`Loaded configuration from: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to load config from ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Read and parse YAML config file
   */
  private async loadConfigFile(filePath: string): Promise<Partial<AgentCliConfig>> {
    const content = await fs.readFile(filePath, 'utf-8');
    return YAML.parse(content);
  }

  /**
   * Initialize configuration for a new project
   */
  async initializeConfig(projectType?: string): Promise<void> {
    try {
      const config = { ...this.getDefaultConfig() };
      
      if (projectType) {
        config.project_type = projectType as any;
        
        // Set project-specific defaults
        switch (projectType) {
          case 'web-app':
            config.context_paths = ['./src', './public', './docs'];
            config.preferred_agents.frontend = ['coder'];
            config.preferred_agents.backend = ['architect', 'coder'];
            break;
            
          case 'cli':
            config.context_paths = ['./src', './bin', './docs'];
            config.preferred_agents.cli = ['coder'];
            break;
            
          case 'library':
            config.context_paths = ['./src', './lib', './docs'];
            config.preferred_agents.library = ['architect', 'coder', 'documenter'];
            break;
            
          case 'mcp-server':
            config.context_paths = ['./src', './schemas', './docs'];
            config.preferred_agents.mcp = ['mcp-dev', 'integration'];
            break;
        }
      }

      // Create output directory
      await fs.ensureDir(config.output_directory);
      
      // Write local config file
      await this.saveConfigFile(this.configPath, config);
      
      this.logger.success(`Configuration initialized for ${projectType || 'general'} project`);
    } catch (error) {
      this.logger.error('Failed to initialize configuration:', error);
      throw error;
    }
  }

  /**
   * Save configuration to YAML file
   */
  private async saveConfigFile(filePath: string, config: AgentCliConfig | Partial<AgentCliConfig>): Promise<void> {
    const yamlContent = YAML.stringify(config, {
      indent: 2,
      lineWidth: 100,
      minContentWidth: 0
    });
    
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, yamlContent, 'utf-8');
  }

  /**
   * Set configuration value
   */
  async setConfig(key: string, value: string): Promise<void> {
    try {
      // Parse value based on key type
      let parsedValue: any = value;
      
      // Handle numeric values
      if (key.includes('limit') || key.includes('timeout')) {
        parsedValue = parseInt(value);
      }
      
      // Handle boolean values
      if (key.includes('enabled') || key.includes('auto_')) {
        parsedValue = value.toLowerCase() === 'true';
      }
      
      // Handle array values
      if (key.includes('paths')) {
        parsedValue = value.split(',').map(v => v.trim());
      }
      
      // Set nested keys
      const keys = key.split('.');
      let current: any = this.config;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = parsedValue;
      
      // Save to local config file
      await this.saveConfigFile(this.configPath, this.config);
      
      this.logger.debug(`Set configuration: ${key} = ${value}`);
    } catch (error) {
      this.logger.error(`Failed to set config ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get configuration value
   */
  async getConfig(key: string): Promise<any> {
    const keys = key.split('.');
    let current: any = this.config;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Get all configuration
   */
  async getAllConfig(): Promise<AgentCliConfig> {
    return { ...this.config };
  }

  /**
   * Get project-specific configuration
   */
  getProjectConfig(): Partial<AgentCliConfig> {
    const {
      project_type,
      context_paths,
      output_directory,
      preferred_agents,
      recipe_variables
    } = this.config;
    
    return {
      project_type,
      context_paths,
      output_directory,
      preferred_agents,
      recipe_variables
    };
  }

  /**
   * Get execution configuration
   */
  getExecutionConfig(): {
    parallelLimit: number;
    timeout: number;
    format: string;
    outputDirectory: string;
    autoOptimize: boolean;
    saveExecutionLogs: boolean;
    metricsEnabled: boolean;
  } {
    return {
      parallelLimit: this.config.default_parallel_limit,
      timeout: this.config.default_timeout,
      format: this.config.default_format,
      outputDirectory: this.config.output_directory,
      autoOptimize: this.config.auto_optimize_context,
      saveExecutionLogs: this.config.save_execution_logs,
      metricsEnabled: this.config.metrics_enabled
    };
  }

  /**
   * Get preferred agents for a task type
   */
  getPreferredAgents(taskType: string): string[] {
    return this.config.preferred_agents[taskType] || [];
  }

  /**
   * Get Dev-Agency paths
   */
  getDevAgencyPaths(): {
    base: string;
    agents: string;
    recipes: string;
  } {
    return {
      base: this.config.dev_agency_path,
      agents: this.config.agents_path,
      recipes: this.config.recipes_path
    };
  }

  /**
   * Update recipe variables
   */
  async updateRecipeVariables(variables: Record<string, any>): Promise<void> {
    this.config.recipe_variables = { ...this.config.recipe_variables, ...variables };
    await this.saveConfigFile(this.configPath, this.config);
  }

  /**
   * Validate configuration
   */
  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Check required paths
    const pathsToCheck = [
      this.config.dev_agency_path,
      this.config.agents_path,
      this.config.recipes_path
    ];
    
    for (const p of pathsToCheck) {
      if (!await fs.pathExists(p)) {
        errors.push(`Path does not exist: ${p}`);
      }
    }
    
    // Check numeric values
    if (this.config.default_parallel_limit < 1 || this.config.default_parallel_limit > 10) {
      errors.push('default_parallel_limit must be between 1 and 10');
    }
    
    if (this.config.default_timeout < 30 || this.config.default_timeout > 3600) {
      errors.push('default_timeout must be between 30 and 3600 seconds');
    }
    
    // Check output directory is writable
    try {
      await fs.ensureDir(this.config.output_directory);
    } catch (error) {
      errors.push(`Cannot create output directory: ${this.config.output_directory}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Initialize project configuration
   */
  async initializeProject(projectPath: string, options?: { type?: string; name?: string }): Promise<void> {
    try {
      // Create project-specific config
      const projectConfig: Partial<AgentCliConfig> = {
        project_type: (options?.type as any) || 'web-app',
        output_directory: path.join(projectPath, 'outputs')
      };
      
      // Merge with default config
      this.config = { ...this.config, ...projectConfig };
      
      // Save config file in project
      const projectConfigPath = path.join(projectPath, '.agent-cli.json');
      await this.saveConfigFile(projectConfigPath, projectConfig);
      
      this.logger.info(`Initialized project configuration at ${projectConfigPath}`);
    } catch (error) {
      this.logger.error('Failed to initialize project:', error);
      throw error;
    }
  }

  /**
   * Alias for setConfig - set configuration value
   */
  async set(key: string, value: string): Promise<void> {
    return this.setConfig(key, value);
  }

  /**
   * Alias for getConfig - get configuration value
   */
  async get(key: string): Promise<any> {
    return this.getConfig(key);
  }
}