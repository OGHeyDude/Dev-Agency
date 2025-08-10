/**
 * Enhanced CLI Entry Point
 * Provides backwards compatibility while adding interactive REPL mode
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { REPLMode } from './interactive/REPLMode';
import { AgentManager, AgentInvocationOptions } from '../../tools/agent-cli/src/core/AgentManager';
import { ConfigManager } from '../../tools/agent-cli/src/core/ConfigManager';
import { ExecutionEngine } from '../../tools/agent-cli/src/core/ExecutionEngine';
import { RecipeEngine } from '../../tools/agent-cli/src/core/RecipeEngine';
import { PromptLibrary } from '../../tools/agent-cli/src/core/PromptLibrary';
import { Logger } from '../../tools/agent-cli/src/utils/Logger';
import { ValidationManager } from '../../tools/agent-cli/src/utils/validation';
import { AgentSelector } from '../../tools/agent-cli/src/core/AgentSelector';
import * as fs from 'fs-extra';
import * as path from 'path';

interface CLIOptions {
  interactive?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  config?: string;
  historyFile?: string;
  sessionFile?: string;
  noColors?: boolean;
}

export class EnhancedCLI {
  private program: Command;
  private logger: Logger;
  private replMode: REPLMode | null = null;
  private isInteractiveMode = false;

  // Lazy-loaded managers (for backwards compatibility)
  private configManager: ConfigManager | null = null;
  private agentManager: AgentManager | null = null;
  private executionEngine: ExecutionEngine | null = null;
  private recipeEngine: RecipeEngine | null = null;
  private agentSelector: AgentSelector | null = null;

  constructor() {
    this.program = new Command();
    this.logger = Logger.create({ component: 'EnhancedCLI' });
    this.setupProgram();
  }

  /**
   * Start the CLI
   */
  async start(argv: string[] = process.argv): Promise<void> {
    // Check if we should start in interactive mode
    const args = argv.slice(2);
    const shouldStartInteractive = args.length === 0 || 
                                  args.includes('--interactive') || 
                                  args.includes('-i');

    if (shouldStartInteractive && process.stdin.isTTY) {
      await this.startInteractiveMode();
    } else {
      // Run in traditional command mode
      await this.runCommand(argv);
    }
  }

  /**
   * Start interactive REPL mode
   */
  private async startInteractiveMode(): Promise<void> {
    this.isInteractiveMode = true;

    try {
      this.replMode = new REPLMode({
        historyFile: path.join(process.cwd(), '.dev_agency_history'),
        sessionFile: path.join(process.cwd(), '.dev_agency_session'),
        maxHistorySize: 1000,
        prompt: 'agent> ',
        enableColors: !process.env.NO_COLOR
      });

      // Register all existing CLI commands in the REPL
      await this.registerREPLCommands();

      // Start the REPL
      await this.replMode.start();

    } catch (error) {
      console.error(chalk.red('Failed to start interactive mode:'), error);
      process.exit(1);
    }
  }

  /**
   * Run a single command (backwards compatibility)
   */
  private async runCommand(argv: string[]): Promise<void> {
    try {
      await this.program.parseAsync(argv);
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red('Command failed:'), error.message);
      } else {
        console.error(chalk.red('Command failed:'), String(error));
      }
      process.exit(1);
    }
  }

  /**
   * Register all CLI commands in the REPL mode
   */
  private async registerREPLCommands(): Promise<void> {
    if (!this.replMode) return;

    // Load available agents, recipes, and domains for completion
    try {
      const agentMgr = this.getAgentManager();
      const recipeMgr = this.getRecipeEngine();
      const promptLib = PromptLibrary.getInstance();

      const agents = await agentMgr.listAgents();
      const recipes = await recipeMgr.listRecipes();
      const domains = await promptLib.getAvailableDomains();

      // Update auto-completion with current data
      this.replMode.registerCommand({
        name: 'invoke',
        description: 'Invoke a single agent',
        help: 'Usage: invoke <agent> [options]\nInvoke a Dev-Agency agent with specified task',
        completions: agents.map((a: any) => a.name),
        handler: async (args, session) => {
          const result = await this.handleInvokeCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'batch',
        description: 'Execute multiple agents in parallel',
        help: 'Usage: batch --agents <agent1,agent2> [options]\nExecute multiple agents with shared context',
        handler: async (args, session) => {
          const result = await this.handleBatchCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'recipe',
        description: 'Execute a Dev-Agency recipe',
        help: 'Usage: recipe <recipe-name> [options]\nExecute a predefined workflow recipe',
        completions: recipes.map((r: any) => r.name),
        handler: async (args, session) => {
          const result = await this.handleRecipeCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'select',
        description: 'Get agent recommendations for a task',
        help: 'Usage: select "<task description>"\nGet intelligent agent recommendations',
        handler: async (args, session) => {
          const result = await this.handleSelectCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'list',
        description: 'List available resources',
        help: 'Usage: list [--agents|--recipes|--domains]\nList available agents, recipes, or domains',
        completions: ['--agents', '--recipes', '--domains'],
        handler: async (args, session) => {
          const result = await this.handleListCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'status',
        description: 'Show system status',
        help: 'Usage: status [--active]\nShow agent system status and health',
        completions: ['--active'],
        handler: async (args, session) => {
          const result = await this.handleStatusCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'config',
        description: 'Manage CLI configuration',
        help: 'Usage: config <init|set|get> [options]\nManage CLI configuration settings',
        completions: ['init', 'set', 'get'],
        handler: async (args, session) => {
          const result = await this.handleConfigCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'metrics',
        description: 'Show performance metrics',
        help: 'Usage: metrics [--summary|--export]\nShow detailed performance metrics',
        completions: ['--summary', '--export'],
        handler: async (args, session) => {
          const result = await this.handleMetricsCommand(args, session);
          console.log(result);
        }
      });

      this.replMode.registerCommand({
        name: 'prompt',
        description: 'Manage domain-specific prompts',
        help: 'Usage: prompt [--list|--domain <domain>]\nManage and view domain-specific prompts',
        completions: async (partial: string) => {
          const options = ['--list', '--domain', '--compose', '--detect'];
          const filtered = options.filter(opt => opt.startsWith(partial));
          if (filtered.length === 0) {
            return domains.filter(d => d.startsWith(partial));
          }
          return filtered;
        },
        handler: async (args, session) => {
          const result = await this.handlePromptCommand(args, session);
          console.log(result);
        }
      });

    } catch (error) {
      console.warn('Warning: Could not load dynamic completions:', error);
    }
  }

  /**
   * Setup the commander program (backwards compatibility)
   */
  private setupProgram(): void {
    this.program
      .name('agent')
      .description('Dev-Agency Enhanced CLI with Interactive Mode')
      .version('2.0.0')
      .option('-i, --interactive', 'Start in interactive REPL mode')
      .option('-v, --verbose', 'Enable verbose logging')
      .option('-q, --quiet', 'Suppress output except errors')
      .option('-c, --config <path>', 'Path to config file')
      .option('--no-colors', 'Disable colored output');

    // Add all existing commands for backwards compatibility
    this.addTraditionalCommands();
  }

  /**
   * Add traditional CLI commands (backwards compatibility)
   */
  private addTraditionalCommands(): void {
    // Invoke command
    this.program
      .command('invoke')
      .description('Invoke a single agent')
      .argument('<agent>', 'Agent name')
      .option('-t, --task <description>', 'Task description')
      .option('-c, --context <path>', 'Context file or directory path')
      .option('-d, --domains <list>', 'Comma-separated list of domains')
      .option('--timeout <seconds>', 'Execution timeout in seconds', '300')
      .option('--format <type>', 'Output format', 'markdown')
      .option('--dry-run', 'Validate without execution')
      .action(async (agent, options) => {
        const args = [agent, ...this.buildArgsFromOptions(options)];
        await this.handleInvokeCommand(args, null);
      });

    // Batch command
    this.program
      .command('batch')
      .description('Execute multiple agents in parallel')
      .option('-a, --agents <list>', 'Comma-separated list of agents')
      .option('-p, --parallel <count>', 'Number of parallel executions', '3')
      .option('-c, --context <path>', 'Context file or directory path')
      .option('--timeout <seconds>', 'Execution timeout in seconds', '600')
      .action(async (options) => {
        const args = this.buildArgsFromOptions(options);
        await this.handleBatchCommand(args, null);
      });

    // Recipe command
    this.program
      .command('recipe')
      .description('Execute a Dev-Agency recipe')
      .argument('<recipe>', 'Recipe name')
      .option('-c, --context <path>', 'Context file or directory path')
      .option('-o, --output <path>', 'Output file path')
      .option('--vars <json>', 'Recipe variables as JSON string')
      .option('--dry-run', 'Validate recipe without execution')
      .action(async (recipe, options) => {
        const args = [recipe, ...this.buildArgsFromOptions(options)];
        await this.handleRecipeCommand(args, null);
      });

    // Other existing commands...
    this.addOtherTraditionalCommands();
  }

  private addOtherTraditionalCommands(): void {
    // Status command
    this.program
      .command('status')
      .description('Show agent and system status')
      .option('--active', 'Show only active executions')
      .action(async (options) => {
        const args = this.buildArgsFromOptions(options);
        await this.handleStatusCommand(args, null);
      });

    // List command
    this.program
      .command('list')
      .description('List available agents, recipes, and domains')
      .option('--agents', 'List available agents')
      .option('--recipes', 'List available recipes')
      .option('--domains', 'List available domain prompts')
      .action(async (options) => {
        const args = this.buildArgsFromOptions(options);
        await this.handleListCommand(args, null);
      });

    // Interactive command (explicit)
    this.program
      .command('interactive')
      .description('Start interactive REPL mode')
      .action(async () => {
        await this.startInteractiveMode();
      });
  }

  // Command handlers that work in both modes
  private async handleInvokeCommand(args: string[], session: any): Promise<string> {
    try {
      if (args.length === 0) {
        return chalk.red('Usage: invoke <agent> [options]');
      }

      const [agentName, ...options] = args;
      
      // Parse options (simplified for REPL)
      const parsedOptions = this.parseOptions(options);
      
      const execEngine = this.getExecutionEngine();
      const result = await execEngine.invokeAgent({
        agentName,
        task: parsedOptions.task || 'General development task',
        contextPath: parsedOptions.context,
        domains: parsedOptions.domains?.split(','),
        timeout: parsedOptions.timeout ? parseInt(parsedOptions.timeout) * 1000 : undefined,
        format: parsedOptions.format || 'markdown',
        dryRun: parsedOptions.dryRun
      });

      return chalk.green('✓ Agent execution completed\n') + result.output;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return chalk.red(`Error: ${message}`);
    }
  }

  private async handleBatchCommand(args: string[], session: any): Promise<string> {
    try {
      const parsedOptions = this.parseOptions(args);
      
      if (!parsedOptions.agents) {
        return chalk.red('Usage: batch --agents <agent1,agent2> [options]');
      }

      const agents = parsedOptions.agents.split(',').map(a => a.trim());
      const parallelLimit = Math.min(parseInt(parsedOptions.parallel || '3'), 5);

      const execEngine = this.getExecutionEngine();
      const results = await execEngine.batchExecute({
        agents,
        contextPath: parsedOptions.context,
        parallelLimit,
        outputPath: parsedOptions.output
      });

      let output = chalk.green(`✓ Batch execution completed (${results.results.length} agents)\n`);
      results.results.forEach((result: any, index: number) => {
        output += chalk.blue(`\n--- Agent ${index + 1}: ${result.agent} ---\n`);
        output += result.output + '\n';
      });

      return output;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return chalk.red(`Error: ${message}`);
    }
  }

  private async handleRecipeCommand(args: string[], session: any): Promise<string> {
    try {
      if (args.length === 0) {
        return chalk.red('Usage: recipe <recipe-name> [options]');
      }

      const [recipeName, ...options] = args;
      const parsedOptions = this.parseOptions(options);

      const recipeMgr = this.getRecipeEngine();
      
      if (parsedOptions.dryRun) {
        const validation = await recipeMgr.validateRecipe(recipeName, {});
        if (validation.valid) {
          return chalk.green(`✓ Recipe validation passed\nRecipe: ${recipeName}\nSteps: ${validation.steps?.length || 0}`);
        } else {
          return chalk.red('✗ Recipe validation failed\n') + 
                 validation.errors.map(err => chalk.red(`  ${err}`)).join('\n');
        }
      }

      const variables = parsedOptions.vars ? JSON.parse(parsedOptions.vars) : {};
      const result = await recipeMgr.executeRecipe({
        recipeName,
        contextPath: parsedOptions.context,
        variables,
        outputPath: parsedOptions.output
      });

      return chalk.green('✓ Recipe execution completed\n') +
             `Duration: ${result.duration}ms\n` +
             `Steps completed: ${result.steps_completed}/${result.steps_total}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return chalk.red(`Error: ${message}`);
    }
  }

  private async handleSelectCommand(args: string[], session: any): Promise<string> {
    try {
      const task = args.join(' ');
      if (!task) {
        return chalk.red('Usage: select "<task description>"');
      }

      const selector = this.getAgentSelector();
      const recommendation = await selector.selectAgents(task, { maxAgents: 4 });

      let output = chalk.green('✓ Agent Recommendation Complete\n');
      output += chalk.blue('═'.repeat(50)) + '\n';
      output += `Task: ${chalk.yellow(task)}\n`;
      output += `Complexity: ${chalk.yellow(recommendation.estimated_complexity)}\n`;
      output += `Confidence: ${chalk.green(recommendation.confidence.toFixed(0) + '%')}\n\n`;
      
      output += chalk.blue('Recommended Agents:\n');
      recommendation.agents.forEach((agent, index) => {
        output += `  ${index + 1}. ${chalk.cyan(agent)}\n`;
      });

      if (recommendation.recipe) {
        output += chalk.blue('\nSuggested Recipe:\n');
        output += `  ${chalk.green(recommendation.recipe)}\n`;
      }

      return output;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return chalk.red(`Error: ${message}`);
    }
  }

  private async handleStatusCommand(args: string[], session: any): Promise<string> {
    try {
      const execEngine = this.getExecutionEngine();
      const status = await execEngine.getStatus();
      const perfStatus = await execEngine.getPerformanceStatus();

      let output = chalk.blue('=== Dev-Agency CLI Status ===\n');
      output += `Available agents: ${status.total_agents_available || 'Loading...'}\n`;
      output += `Active executions: ${status.active_executions}\n`;
      output += `Completed today: ${status.completed_today}\n`;
      output += `Failed today: ${status.failed_today}\n\n`;

      output += chalk.blue('=== Performance Status ===\n');
      output += `Memory: ${(perfStatus.memory.heapUsed / 1024 / 1024).toFixed(1)}MB heap, ${perfStatus.memory.cacheEntries} cached executions\n`;
      output += `Cache: ${(perfStatus.cache.hitRate * 100).toFixed(1)}% hit rate, ${perfStatus.cache.totalEntries} entries\n`;
      output += `Health: ${perfStatus.health.overallHealthy ? chalk.green('✓ Healthy') : chalk.yellow('⚠ Issues detected')}\n`;

      return output;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return chalk.red(`Error: ${message}`);
    }
  }

  private async handleListCommand(args: string[], session: any): Promise<string> {
    try {
      const parsedOptions = this.parseOptions(args);
      const showAll = !parsedOptions.agents && !parsedOptions.recipes && !parsedOptions.domains;

      let output = '';

      if (parsedOptions.agents || showAll) {
        const agentMgr = this.getAgentManager();
        const agents = await agentMgr.listAgents();
        output += chalk.blue('Available Agents:\n');
        agents.forEach((agent: any) => {
          output += `  ${chalk.green(agent.name)} - ${agent.description}\n`;
        });
        output += '\n';
      }

      if (parsedOptions.recipes || showAll) {
        const recipeMgr = this.getRecipeEngine();
        const recipes = await recipeMgr.listRecipes();
        output += chalk.blue(showAll ? 'Available Recipes:\n' : 'Available Recipes:\n');
        recipes.forEach((recipe: any) => {
          output += `  ${chalk.green(recipe.name)} - ${recipe.description}\n`;
        });
        output += '\n';
      }

      if (parsedOptions.domains || showAll) {
        const promptLib = PromptLibrary.getInstance();
        const domains = await promptLib.getAvailableDomains();
        output += chalk.blue(showAll ? 'Available Domains:\n' : 'Available Domains:\n');
        if (domains.length === 0) {
          output += chalk.yellow('  No domain prompts loaded\n');
        } else {
          domains.forEach(domain => {
            output += `  ${chalk.green(domain)}\n`;
          });
        }
      }

      return output;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return chalk.red(`Error: ${message}`);
    }
  }

  private async handleConfigCommand(args: string[], session: any): Promise<string> {
    // Implementation for config command
    return 'Config command implementation pending';
  }

  private async handleMetricsCommand(args: string[], session: any): Promise<string> {
    // Implementation for metrics command
    return 'Metrics command implementation pending';
  }

  private async handlePromptCommand(args: string[], session: any): Promise<string> {
    // Implementation for prompt command
    return 'Prompt command implementation pending';
  }

  // Lazy initialization methods (backwards compatibility)
  private getConfigManager(): ConfigManager {
    if (!this.configManager) {
      this.configManager = new ConfigManager();
    }
    return this.configManager;
  }

  private getAgentManager(): AgentManager {
    if (!this.agentManager) {
      this.agentManager = new AgentManager();
    }
    return this.agentManager;
  }

  private getExecutionEngine(): ExecutionEngine {
    if (!this.executionEngine) {
      this.executionEngine = new ExecutionEngine();
    }
    return this.executionEngine;
  }

  private getRecipeEngine(): RecipeEngine {
    if (!this.recipeEngine) {
      this.recipeEngine = new RecipeEngine();
    }
    return this.recipeEngine;
  }

  private getAgentSelector(): AgentSelector {
    if (!this.agentSelector) {
      this.agentSelector = new AgentSelector();
    }
    return this.agentSelector;
  }

  // Utility methods
  private buildArgsFromOptions(options: Record<string, any>): string[] {
    const args: string[] = [];
    for (const [key, value] of Object.entries(options)) {
      if (value === true) {
        args.push(`--${key}`);
      } else if (value && value !== false) {
        args.push(`--${key}`, String(value));
      }
    }
    return args;
  }

  private parseOptions(args: string[]): Record<string, string | boolean> {
    const options: Record<string, string | boolean> = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          options[key] = args[i + 1];
          i++; // Skip next argument
        } else {
          options[key] = true;
        }
      }
    }
    
    return options;
  }
}

// Export for use as a module
export { REPLMode } from './interactive/REPLMode';
export { CommandHistory } from './interactive/CommandHistory';
export { AutoComplete } from './interactive/AutoComplete';
export { SessionManager } from './interactive/SessionManager';
export { HelpSystem } from './interactive/HelpSystem';