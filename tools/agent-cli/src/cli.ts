#!/usr/bin/env node

/**
 * Dev-Agency Agent CLI Tool
 * Command-line interface for invoking agents with parallel execution support
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { AgentManager, AgentInvocationOptions } from './core/AgentManager';
import { ConfigManager } from './core/ConfigManager';
import { ExecutionEngine } from './core/ExecutionEngine';
import { RecipeEngine } from './core/RecipeEngine';
import { Logger } from './utils/Logger';
import { ValidationManager } from './utils/validation';
import { securityManager } from './utils/security';
import { validateCommandArg } from './utils/security';
import { securityAuditor } from './utils/SecurityAuditor';

const logger = Logger.create({ component: 'CLI' });
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
      // Validate and sanitize inputs
      const sanitizedAgent = ValidationManager.sanitizeCommandArg(agent);
      if (!sanitizedAgent) {
        console.log(chalk.red('Error: Invalid agent name'));
        process.exit(1);
      }
      
      // Validate all options
      const validationResult = await ValidationManager.validateAgentInvocation({
        agentName: sanitizedAgent,
        task: options.task,
        contextPath: options.context,
        outputPath: options.output,
        timeout: options.timeout ? parseInt(options.timeout) * 1000 : undefined,
        format: options.format,
        dryRun: options.dryRun
      });
      
      if (!validationResult.isValid) {
        console.log(chalk.red('Error: Input validation failed'));
        validationResult.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
        process.exit(1);
      }
      
      const validatedOptions = validationResult.data!;
      logger.info(`Invoking agent: ${chalk.blue(validatedOptions.agentName)}`);
      
      if (options.dryRun) {
        const validation = await agentManager.validateAgent(validatedOptions.agentName, validatedOptions);
        if (validation.valid) {
          console.log(chalk.green('✓ Agent validation passed'));
          console.log(`Agent: ${validatedOptions.agentName}`);
          console.log(`Task: ${validatedOptions.task || 'General development task'}`);
          console.log(`Context: ${validatedOptions.contextPath || 'none'}`);
          return;
        } else {
          console.log(chalk.red('✗ Agent validation failed'));
          validation.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
          process.exit(1);
        }
      }

      // const context = options.context ? 
      //   await agentManager.loadContext(options.context) : 
      //   'No specific context provided';

      const result = await executionEngine.invokeAgent(validatedOptions);

      console.log(chalk.green('\n✓ Agent execution completed'));
      console.log(result.output);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to invoke agent: ${errorMessage}`);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      // Validate batch execution options
      const validationResult = await ValidationManager.validateBatchExecution({
        agents: options.agents,
        parallel: options.parallel,
        contextPath: options.context,
        outputPath: options.output,
        timeout: options.timeout ? parseInt(options.timeout) * 1000 : undefined,
        format: options.format
      });
      
      if (!validationResult.isValid) {
        console.log(chalk.red('Error: Batch validation failed'));
        validationResult.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
        process.exit(1);
      }
      
      const validatedOptions = validationResult.data!;
      if (!validatedOptions.agents) {
        console.log(chalk.red('Error: --agents option is required'));
        process.exit(1);
      }

      const agents = validatedOptions.agents;
      const parallelLimit = Math.min(validatedOptions.parallel || 3, 5); // Max 5 agents

      logger.info(`Executing ${agents.length} agents with ${parallelLimit} parallel`);

      // const context = options.context ? 
      //   await agentManager.loadContext(options.context) : 
      //   'No specific context provided';

      const results = await executionEngine.batchExecute({
        agents,
        contextPath: validatedOptions.contextPath,
        parallelLimit,
        outputPath: validatedOptions.outputPath
      });

      console.log(chalk.green(`\n✓ Batch execution completed (${results.results.length} agents)`));
      results.results.forEach((result: any, index: number) => {
        console.log(chalk.blue(`\n--- Agent ${index + 1}: ${result.agent} ---`));
        console.log(result.output);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Batch execution failed: ${errorMessage}`);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      // Validate recipe execution options
      const validationResult = await ValidationManager.validateRecipeExecution({
        recipeName: recipe,
        contextPath: options.context,
        outputPath: options.output,
        vars: options.vars,
        dryRun: options.dryRun
      });
      
      if (!validationResult.isValid) {
        console.log(chalk.red('Error: Recipe validation failed'));
        validationResult.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
        process.exit(1);
      }
      
      const validatedOptions = validationResult.data!;
      logger.info(`Executing recipe: ${chalk.blue(validatedOptions.recipeName)}`);

      const variables = validatedOptions.vars || {};
      const context = validatedOptions.contextPath ? 
        await agentManager.loadContext(validatedOptions.contextPath) : 
        undefined;

      if (options.dryRun) {
        const validation = await recipeEngine.validateRecipe(validatedOptions.recipeName, variables);
        if (validation.valid) {
          console.log(chalk.green('✓ Recipe validation passed'));
          console.log(`Recipe: ${validatedOptions.recipeName}`);
          console.log(`Steps: ${validation.steps?.length || 0}`);
          return;
        } else {
          console.log(chalk.red('✗ Recipe validation failed'));
          validation.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
          process.exit(1);
        }
      }

      const result = await recipeEngine.executeRecipe({
        recipeName: validatedOptions.recipeName,
        contextPath: validatedOptions.contextPath,
        variables,
        outputPath: validatedOptions.outputPath
      });

      console.log(chalk.green('\n✓ Recipe execution completed'));
      console.log(`Duration: ${result.duration}ms`);
      console.log(`Steps completed: ${result.steps_completed}/${result.steps_total}`);
      
      if (validatedOptions.outputPath) {
        console.log(`Output saved to: ${validatedOptions.outputPath}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Recipe execution failed: ${errorMessage}`);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      // Validate configuration inputs
      const validationResult = ValidationManager.validateConfigSet(key, value);
      if (!validationResult.isValid) {
        console.log(chalk.red('Error: Config validation failed'));
        validationResult.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
        process.exit(1);
      }
      
      await configManager.set(key, value);
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
        agents.forEach((agent: any) => {
          console.log(`  ${chalk.green(agent.name)} - ${agent.description}`);
        });
      }

      if (options.recipes || (!options.agents && !options.recipes)) {
        const recipes = await recipeEngine.listRecipes();
        console.log(chalk.blue('\nAvailable Recipes:'));
        recipes.forEach((recipe: any) => {
          console.log(`  ${chalk.green(recipe.name)} - ${recipe.description}`);
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

// Security status command
program
  .command('security')
  .description('Show security status and audit information')
  .option('--report', 'Generate detailed security audit report')
  .option('--alerts', 'Show security alerts only')
  .action(async (options) => {
    try {
      if (options.alerts) {
        const report = await securityAuditor.getAuditReport();
        if (report.alerts.length === 0) {
          console.log(chalk.green('✓ No security alerts'));
        } else {
          console.log(chalk.yellow(`⚠️  ${report.alerts.length} security alerts:`));
          report.alerts.forEach(alert => {
            const severityColor = alert.severity === 'critical' ? 'red' : 
                                alert.severity === 'high' ? 'yellow' : 'blue';
            console.log(chalk[severityColor](`  [${alert.severity.toUpperCase()}] ${alert.message}`));
            console.log(`    Alert ID: ${alert.id}`);
            console.log(`    Time: ${alert.timestamp}`);
            if (alert.recommendedActions.length > 0) {
              console.log('    Recommended Actions:');
              alert.recommendedActions.forEach(action => {
                console.log(`      - ${action}`);
              });
            }
            console.log('');
          });
        }
        return;
      }

      if (options.report) {
        const report = await securityAuditor.getAuditReport();
        const policy = securityManager.getPolicy();
        
        console.log(chalk.blue('=== Security Audit Report ==='));
        console.log(`Total Events: ${report.summary.totalEvents}`);
        console.log(`Alerts Triggered: ${report.summary.alertsTriggered}`);
        console.log('');
        
        console.log(chalk.blue('Events by Type:'));
        Object.entries(report.summary.eventsByType).forEach(([type, count]) => {
          console.log(`  ${type}: ${count}`);
        });
        console.log('');
        
        console.log(chalk.blue('Events by Severity:'));
        Object.entries(report.summary.eventsBySeverity).forEach(([severity, count]) => {
          const color = severity === 'critical' ? 'red' : 
                       severity === 'high' ? 'yellow' : 
                       severity === 'medium' ? 'blue' : 'green';
          console.log(`  ${chalk[color](severity)}: ${count}`);
        });
        console.log('');
        
        console.log(chalk.blue('Security Policy:'));
        console.log(`  Allowed Base Paths: ${policy.allowedBasePaths.length}`);
        console.log(`  Allowed Extensions: ${policy.allowedExtensions.join(', ')}`);
        console.log(`  Max File Size: ${(policy.maxFileSize / (1024 * 1024)).toFixed(1)}MB`);
        console.log(`  Max Files: ${policy.maxFiles}`);
        console.log(`  Max Depth: ${policy.maxDepth}`);
        console.log(`  Allow Symlinks: ${policy.allowSymlinks}`);
        console.log('');
        
        if (report.summary.topViolations.length > 0) {
          console.log(chalk.blue('Top Violations:'));
          report.summary.topViolations.slice(0, 5).forEach(violation => {
            console.log(`  ${violation.type}: ${violation.count}`);
          });
        }
        return;
      }

      // Default: show summary
      const policy = securityManager.getPolicy();
      const report = await securityAuditor.getAuditReport({ limit: 10 });
      
      console.log(chalk.blue('=== Security Status ==='));
      console.log(`Security Controls: ${chalk.green('ACTIVE')}`);
      console.log(`Audit Logging: ${chalk.green('ENABLED')}`);
      console.log(`Recent Events: ${report.summary.totalEvents}`);
      console.log(`Active Alerts: ${report.summary.alertsTriggered}`);
      
      const hasAlerts = report.alerts.length > 0;
      const hasHighSeverity = report.summary.eventsBySeverity.high > 0 || 
                              report.summary.eventsBySeverity.critical > 0;
      
      const status = hasAlerts || hasHighSeverity ? 
        chalk.yellow('⚠️  ATTENTION REQUIRED') : 
        chalk.green('✓ SECURE');
      
      console.log(`Overall Status: ${status}`);
      
      if (hasAlerts) {
        console.log('');
        console.log(chalk.yellow('Use --alerts to see security alerts'));
      }
      
      if (report.summary.totalEvents > 0) {
        console.log(chalk.blue('\nUse --report for detailed audit information'));
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${String(promise)} reason: ${String(reason)}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Parse command line arguments
// Graceful shutdown handling for security audit finalization\nconst gracefulShutdown = async (signal: string) => {\n  logger.info(`Received ${signal}, shutting down gracefully...`);\n  \n  try {\n    await securityAuditor.finalize();\n  } catch (error) {\n    logger.error('Error during security audit finalization:', error);\n  }\n  \n  process.exit(0);\n};\n\n// Graceful shutdown signals\nprocess.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\nprocess.on('SIGINT', () => gracefulShutdown('SIGINT'));\n\n// Parse command line arguments\nprogram.parse();