/**
 * Agent CLI - Main Module Exports
 * 
 * @file index.ts
 * @created 2025-08-09
 * @updated 2025-08-09
 */

// Core modules
export { AgentManager } from './core/AgentManager';
export type { AgentDefinition, AgentValidation, AgentInvocationOptions } from './core/AgentManager';

export { ConfigManager } from './core/ConfigManager';
export type { AgentCliConfig } from './core/ConfigManager';

export { ExecutionEngine } from './core/ExecutionEngine';
export type { 
  ExecutionResult, 
  SingleExecutionOptions, 
  BatchExecutionOptions, 
  BatchExecutionResult,
  ExecutionStatus,
  ExecutionLog,
  ExecutionMetrics
} from './core/ExecutionEngine';

export { RecipeEngine } from './core/RecipeEngine';
export type {
  Recipe,
  RecipeStep,
  RecipeValidation,
  RecipeExecutionOptions,
  RecipeExecutionResult
} from './core/RecipeEngine';

// Utils
export { Logger } from './utils/Logger';
export type { LogLevel, LogEntry } from './utils/Logger';

/**
 * Agent CLI Library
 * Provides programmatic access to all CLI functionality
 */
export class AgentCLI {
  public agentManager: AgentManager;
  public configManager: ConfigManager;
  public executionEngine: ExecutionEngine;
  public recipeEngine: RecipeEngine;

  constructor() {
    this.agentManager = new AgentManager();
    this.configManager = new ConfigManager();
    this.executionEngine = new ExecutionEngine();
    this.recipeEngine = new RecipeEngine();
  }

  /**
   * Initialize the CLI with configuration
   */
  async initialize(options?: {
    configFile?: string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
  }): Promise<void> {
    if (options?.configFile) {
      await this.configManager.loadConfig(options.configFile);
    }
  }

  /**
   * Quick agent invocation
   */
  async invoke(agentName: string, task: string, options?: {
    contextPath?: string;
    outputPath?: string;
    format?: string;
    timeout?: number;
  }): Promise<ExecutionResult> {
    return this.executionEngine.executeSingle({
      agentName,
      task,
      contextPath: options?.contextPath,
      outputPath: options?.outputPath,
      format: options?.format,
      timeout: options?.timeout
    });
  }

  /**
   * Quick recipe execution
   */
  async executeRecipe(recipeName: string, options?: {
    contextPath?: string;
    outputPath?: string;
    variables?: Record<string, any>;
  }): Promise<RecipeExecutionResult> {
    return this.recipeEngine.executeRecipe({
      recipeName,
      contextPath: options?.contextPath,
      outputPath: options?.outputPath,
      variables: options?.variables
    });
  }

  /**
   * List available agents
   */
  async listAgents(): Promise<string[]> {
    return this.agentManager.getAgentNames();
  }

  /**
   * List available recipes
   */
  async listRecipes(): Promise<string[]> {
    return this.recipeEngine.getRecipeNames();
  }

  /**
   * Get execution status
   */
  async getStatus(): Promise<ExecutionStatus | any> {
    return this.executionEngine.getStatus();
  }

  /**
   * Get performance metrics
   */
  async getMetrics(): Promise<ExecutionMetrics | any> {
    return this.executionEngine.getMetrics();
  }
}