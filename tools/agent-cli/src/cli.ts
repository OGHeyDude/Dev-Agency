#!/usr/bin/env node

/**
 * Dev-Agency Agent CLI Tool
 * Command-line interface for invoking agents with parallel execution support
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { AgentManager } from './core/AgentManager';
import { ConfigManager } from './core/ConfigManager';
import { ExecutionEngine } from './core/ExecutionEngine';
import { RecipeEngine } from './core/RecipeEngine';
import { Logger } from './utils/Logger';

const logger = Logger.create('CLI');
const program = new Command();

// Initialize managers
const configManager = new ConfigManager();
const agentManager = new AgentManager();
const executionEngine = new ExecutionEngine();
const recipeEngine = new RecipeEngine();

program
  .name('agent')
  .description('Dev-Agency Agent CLI Tool')
  .version('1.0.0')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('-q, --quiet', 'Suppress output except errors')
  .option('-c, --config <path>', 'Path to config file');

// Agent invocation command
program
  .command('invoke')
  .description('Invoke a single agent')
  .argument('<agent>', 'Agent name (architect, coder, tester, etc.)')
  .option('-t, --task <description>', 'Task description', 'General development task')
  .option('-c, --context <path>', 'Context file or directory path')
  .option('--timeout <seconds>', 'Execution timeout in seconds', '300')
  .option('--format <type>', 'Output format (json, markdown, text)', 'markdown')
  .option('--dry-run', 'Validate without execution')
  .action(async (agent, options) => {
    try {
      logger.info(`Invoking agent: ${chalk.blue(agent)}`);
      
      if (options.dryRun) {
        const validation = await agentManager.validateAgent(agent);
        if (validation.valid) {
          console.log(chalk.green('✓ Agent validation passed'));
          console.log(`Agent: ${agent}`);
          console.log(`Task: ${options.task}`);
          console.log(`Context: ${options.context || 'none'}`);
          return;
        } else {
          console.log(chalk.red('✗ Agent validation failed'));
          validation.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
          process.exit(1);
        }
      }

      const context = options.context ? 
        await agentManager.loadContext(options.context) : 
        'No specific context provided';

      const result = await executionEngine.invokeAgent({
        agent,
        task: options.task,
        context,
        timeout: parseInt(options.timeout) * 1000,
        format: options.format
      });

      console.log(chalk.green('\n✓ Agent execution completed'));
      console.log(result.output);
      
    } catch (error) {
      logger.error(`Failed to invoke agent: ${error.message}`);
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Batch execution command
program
  .command('batch')
  .description('Execute multiple agents in parallel')
  .option('-a, --agents <list>', 'Comma-separated list of agents')
  .option('-p, --parallel <count>', 'Number of parallel executions', '3')
  .option('-c, --context <path>', 'Context file or directory path')
  .option('--timeout <seconds>', 'Execution timeout in seconds', '600')
  .option('--format <type>', 'Output format (json, markdown, text)', 'markdown')
  .action(async (options) => {
    try {
      if (!options.agents) {
        console.log(chalk.red('Error: --agents option is required'));
        process.exit(1);
      }

      const agents = options.agents.split(',').map(a => a.trim());
      const parallelLimit = Math.min(parseInt(options.parallel), 5); // Max 5 agents

      logger.info(`Executing ${agents.length} agents with ${parallelLimit} parallel`);

      const context = options.context ? 
        await agentManager.loadContext(options.context) : 
        'No specific context provided';

      const results = await executionEngine.batchExecute({
        agents,
        context,
        parallelLimit,
        timeout: parseInt(options.timeout) * 1000
      });

      console.log(chalk.green(`\n✓ Batch execution completed (${results.length} agents)`));
      results.forEach((result, index) => {
        console.log(chalk.blue(`\n--- Agent ${index + 1}: ${result.agent} ---`));
        console.log(result.output);
      });

    } catch (error) {
      logger.error(`Batch execution failed: ${error.message}`);
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Recipe execution command
program
  .command('recipe')
  .description('Execute a Dev-Agency recipe')
  .argument('<recipe>', 'Recipe name (full-stack-feature, mcp-server, etc.)')
  .option('-c, --context <path>', 'Context file or directory path')
  .option('-o, --output <path>', 'Output file path')
  .option('--vars <json>', 'Recipe variables as JSON string')
  .option('--dry-run', 'Validate recipe without execution')
  .action(async (recipe, options) => {
    try {
      logger.info(`Executing recipe: ${chalk.blue(recipe)}`);

      const variables = options.vars ? JSON.parse(options.vars) : {};
      const context = options.context ? 
        await agentManager.loadContext(options.context) : 
        undefined;

      if (options.dryRun) {
        const validation = await recipeEngine.validateRecipe(recipe, variables);
        if (validation.valid) {
          console.log(chalk.green('✓ Recipe validation passed'));
          console.log(`Recipe: ${recipe}`);
          console.log(`Steps: ${validation.steps.length}`);
          return;
        } else {
          console.log(chalk.red('✗ Recipe validation failed'));
          validation.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
          process.exit(1);
        }
      }

      const result = await recipeEngine.executeRecipe({
        recipeName: recipe,
        context,
        variables,
        outputPath: options.output
      });

      console.log(chalk.green('\n✓ Recipe execution completed'));
      console.log(`Duration: ${result.duration}ms`);
      console.log(`Steps completed: ${result.completedSteps}/${result.totalSteps}`);
      
      if (options.output) {
        console.log(`Output saved to: ${options.output}`);
      }

    } catch (error) {
      logger.error(`Recipe execution failed: ${error.message}`);
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Configuration commands
const configCmd = program
  .command('config')
  .description('Manage CLI configuration');

configCmd
  .command('init')
  .description('Initialize project configuration')
  .option('--project-type <type>', 'Project type (web-app, cli, library, mcp-server)')
  .option('--force', 'Overwrite existing configuration')
  .action(async (options) => {
    try {
      await configManager.initializeProject(options.projectType, options.force);
      console.log(chalk.green('✓ Configuration initialized'));
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

configCmd
  .command('set')
  .description('Set configuration value')
  .argument('<key>', 'Configuration key')
  .argument('<value>', 'Configuration value')
  .action(async (key, value) => {
    try {
      await configManager.set(key, value);
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

configCmd
  .command('get')
  .description('Get configuration value')
  .argument('[key]', 'Configuration key (optional, shows all if omitted)')
  .action(async (key) => {
    try {
      const value = await configManager.get(key);
      if (key) {
        console.log(`${key}: ${value}`);
      } else {
        console.log(JSON.stringify(value, null, 2));
      }
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show agent and system status')
  .option('--active', 'Show only active executions')
  .action(async (options) => {
    try {
      const status = await executionEngine.getStatus();
      
      console.log(chalk.blue('=== Dev-Agency CLI Status ==='));
      console.log(`Available agents: ${status.availableAgents}`);
      console.log(`Active executions: ${status.activeExecutions}`);
      console.log(`Total executions: ${status.totalExecutions}`);
      console.log(`Cache hit rate: ${(status.cacheHitRate * 100).toFixed(1)}%`);

      if (options.active && status.activeExecutions > 0) {
        console.log(chalk.yellow('\nActive Executions:'));
        // Show active execution details
      }

    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List available agents and recipes')
  .option('--agents', 'List available agents')
  .option('--recipes', 'List available recipes')
  .action(async (options) => {
    try {
      if (options.agents || (!options.agents && !options.recipes)) {
        const agents = await agentManager.listAgents();
        console.log(chalk.blue('Available Agents:'));
        agents.forEach(agent => {
          console.log(`  ${chalk.green(agent.name)} - ${agent.description}`);
        });
      }

      if (options.recipes || (!options.agents && !options.recipes)) {
        const recipes = await recipeEngine.listRecipes();
        console.log(chalk.blue('\nAvailable Recipes:'));
        recipes.forEach(recipe => {
          console.log(`  ${chalk.green(recipe.name)} - ${recipe.description}`);
        });
      }

    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Metrics command
program
  .command('metrics')
  .description('Show performance metrics')
  .option('--summary', 'Show summary only')
  .option('--export <format>', 'Export metrics (csv, json)')
  .action(async (options) => {
    try {
      const metrics = await executionEngine.getMetrics();
      
      if (options.summary) {
        console.log(chalk.blue('=== Performance Summary ==='));
        console.log(`Total executions: ${metrics.totalExecutions}`);
        console.log(`Average duration: ${metrics.averageDuration.toFixed(0)}ms`);
        console.log(`Success rate: ${(metrics.successRate * 100).toFixed(1)}%`);
      } else {
        console.log(JSON.stringify(metrics, null, 2));
      }

      if (options.export) {
        // Export metrics in specified format
        const exportPath = `metrics-${Date.now()}.${options.export}`;
        console.log(chalk.green(`✓ Metrics exported to ${exportPath}`));
      }

    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Parse command line arguments
program.parse();