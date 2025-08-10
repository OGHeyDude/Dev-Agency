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
import { PromptLibrary } from './core/PromptLibrary';
import { Logger } from './utils/Logger';
import { ValidationManager } from './utils/validation';
import { securityManager } from './utils/security';
import { validateCommandArg } from './utils/security';
import { securityAuditor } from './utils/SecurityAuditor';
import { AgentSelector } from './core/AgentSelector';

const logger = Logger.create({ component: 'CLI' });
const program = new Command();

// Lazy-loaded managers - initialized only when needed
let configManager: ConfigManager | null = null;
let agentManager: AgentManager | null = null;
let executionEngine: ExecutionEngine | null = null;
let recipeEngine: RecipeEngine | null = null;
let agentSelector: AgentSelector | null = null;

// Track startup time
const startupStartTime = Date.now();

// Lazy initialization functions
const getConfigManager = (): ConfigManager => {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  return configManager;
};

const getAgentManager = (): AgentManager => {
  if (!agentManager) {
    agentManager = new AgentManager();
  }
  return agentManager;
};

const getExecutionEngine = (): ExecutionEngine => {
  if (!executionEngine) {
    executionEngine = new ExecutionEngine();
  }
  return executionEngine;
};

const getRecipeEngine = (): RecipeEngine => {
  if (!recipeEngine) {
    recipeEngine = new RecipeEngine();
  }
  return recipeEngine;
};

const getAgentSelector = (): AgentSelector => {
  if (!agentSelector) {
    agentSelector = new AgentSelector();
  }
  return agentSelector;
};

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
  .option('-d, --domains <list>', 'Comma-separated list of domains (react, nodejs, python, etc.)')
  .option('--auto-detect', 'Auto-detect domains from context files')
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
      
      // Process domains
      let domains: string[] = [];
      if (options.domains) {
        domains = options.domains.split(',').map((d: string) => d.trim()).filter(Boolean);
      }
      
      // Auto-detect domains if requested
      if (options.autoDetect && validatedOptions.contextPath) {
        const promptLib = PromptLibrary.getInstance();
        const detectedDomains = await promptLib.detectDomain(validatedOptions.contextPath);
        domains = [...new Set([...domains, ...detectedDomains])];
        if (detectedDomains.length > 0) {
          console.log(chalk.blue(`Auto-detected domains: ${detectedDomains.join(', ')}`));
        }
      }
      
      logger.info(`Invoking agent: ${chalk.blue(validatedOptions.agentName)}`);
      if (domains.length > 0) {
        console.log(chalk.blue(`Using domains: ${domains.join(', ')}`));
      }
      
      if (options.dryRun) {
        const agentMgr = getAgentManager();
        const validation = await agentMgr.validateAgent(validatedOptions.agentName, validatedOptions);
        if (validation.valid) {
          console.log(chalk.green('✓ Agent validation passed'));
          console.log(`Agent: ${validatedOptions.agentName}`);
          console.log(`Task: ${validatedOptions.task || 'General development task'}`);
          console.log(`Context: ${validatedOptions.contextPath || 'none'}`);
          console.log(`Domains: ${domains.length > 0 ? domains.join(', ') : 'none'}`);
          
          // Validate domain prompts
          if (domains.length > 0) {
            const promptLib = PromptLibrary.getInstance();
            for (const domain of domains) {
              const domainPrompt = await promptLib.loadDomain(domain);
              if (!domainPrompt) {
                console.log(chalk.yellow(`⚠ Domain '${domain}' not found`));
              }
            }
          }
          return;
        } else {
          console.log(chalk.red('✗ Agent validation failed'));
          validation.errors.forEach(error => console.log(chalk.red(`  ${error}`)));
          process.exit(1);
        }
      }

      // const context = options.context ? 
      //   await getAgentManager().loadContext(options.context) : 
      //   'No specific context provided';

      const execEngine = getExecutionEngine();
      const result = await execEngine.invokeAgent({
        ...validatedOptions,
        domains: domains.length > 0 ? domains : undefined
      });

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
  .option('-d, --domains <list>', 'Comma-separated list of domains (react, nodejs, python, etc.)')
  .option('--auto-detect', 'Auto-detect domains from context files')
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
      //   await getAgentManager().loadContext(options.context) : 
      //   'No specific context provided';

      const execEngine = getExecutionEngine();
      const results = await execEngine.batchExecute({
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
        await getAgentManager().loadContext(validatedOptions.contextPath) : 
        undefined;

      const recipeMgr = getRecipeEngine();
      if (options.dryRun) {
        const validation = await recipeMgr.validateRecipe(validatedOptions.recipeName, variables);
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

      const result = await recipeMgr.executeRecipe({
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
      const configMgr = getConfigManager();
      const projectPath = process.cwd(); // Use current working directory
      await configMgr.initializeProject(projectPath, { type: options.projectType });
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
      
      const configMgr = getConfigManager();
      await configMgr.set(key, value);
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
      const configMgr = getConfigManager();
      const value = await configMgr.get(key);
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
      const startupTime = Date.now() - startupStartTime;
      const execEngine = getExecutionEngine();
      const status = await execEngine.getStatus();
      const perfStatus = await execEngine.getPerformanceStatus();
      
      console.log(chalk.blue('=== Dev-Agency CLI Status ==='));
      console.log(`Startup time: ${startupTime}ms`);
      console.log(`Available agents: ${status.total_agents_available || 'Loading...'}`);
      console.log(`Active executions: ${status.active_executions}`);
      console.log(`Completed today: ${status.completed_today}`);
      console.log(`Failed today: ${status.failed_today}`);
      
      // Performance metrics
      console.log(chalk.blue('\n=== Performance Status ==='));
      console.log(`Memory: ${(perfStatus.memory.heapUsed / 1024 / 1024).toFixed(1)}MB heap, ${perfStatus.memory.cacheEntries} cached executions`);
      console.log(`Cache: ${(perfStatus.cache.hitRate * 100).toFixed(1)}% hit rate, ${perfStatus.cache.totalEntries} entries`);
      console.log(`Health: ${perfStatus.health.overallHealthy ? chalk.green('✓ Healthy') : chalk.yellow('⚠ Issues detected')}`);
      
      if (options.active && status.active_executions > 0) {
        console.log(chalk.yellow('\nActive Executions:'));
        const activeLogs = await execEngine.getStatus(true);
        console.log(JSON.stringify(activeLogs, null, 2));
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
  .description('List available agents, recipes, and domains')
  .option('--agents', 'List available agents')
  .option('--recipes', 'List available recipes')
  .option('--domains', 'List available domain prompts')
  .action(async (options) => {
    try {
      const showAll = !options.agents && !options.recipes && !options.domains;

      if (options.agents || showAll) {
        const agentMgr = getAgentManager();
        const agents = await agentMgr.listAgents();
        console.log(chalk.blue('Available Agents:'));
        agents.forEach((agent: any) => {
          console.log(`  ${chalk.green(agent.name)} - ${agent.description}`);
        });
      }

      if (options.recipes || showAll) {
        const recipeMgr = getRecipeEngine();
        const recipes = await recipeMgr.listRecipes();
        console.log(chalk.blue(showAll ? '\nAvailable Recipes:' : 'Available Recipes:'));
        recipes.forEach((recipe: any) => {
          console.log(`  ${chalk.green(recipe.name)} - ${recipe.description}`);
        });
      }

      if (options.domains || showAll) {
        const promptLib = PromptLibrary.getInstance();
        const domains = await promptLib.getAvailableDomains();
        console.log(chalk.blue(showAll ? '\nAvailable Domains:' : 'Available Domains:'));
        if (domains.length === 0) {
          console.log(chalk.yellow('  No domain prompts loaded'));
        } else {
          for (const domain of domains) {
            const domainPrompt = await promptLib.loadDomain(domain);
            if (domainPrompt) {
              const frameworks = domainPrompt.frameworks?.join(', ') || '';
              console.log(`  ${chalk.green(domain)} - ${domainPrompt.basePrompt.substring(0, 50)}...`);
              if (frameworks) {
                console.log(`    ${chalk.gray(`Frameworks: ${frameworks}`)}`);
              }
            } else {
              console.log(`  ${chalk.red(domain)} - Failed to load`);
            }
          }
        }
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
      const execEngine = getExecutionEngine();
      const agentMgr = getAgentManager();
      
      const execMetrics = await execEngine.getMetrics();
      const perfStatus = await execEngine.getPerformanceStatus();
      const agentMetrics = agentMgr.getPerformanceMetrics();
      
      if (options.summary) {
        console.log(chalk.blue('=== Performance Summary ==='));
        console.log(`Total executions: ${execMetrics.total_executions || 0}`);
        console.log(`Average duration: ${execMetrics.average_duration.toFixed(0)}ms`);
        console.log(`Success rate: ${((execMetrics.successful_executions / execMetrics.total_executions) * 100).toFixed(1)}%`);
        
        // Performance metrics
        console.log(chalk.blue('\n=== Cache Performance ==='));
        console.log(`Context cache hit rate: ${(agentMetrics.cache.hitRate * 100).toFixed(1)}%`);
        console.log(`Execution cache size: ${perfStatus.memory.cacheEntries} entries`);
        console.log(`Memory usage: ${(perfStatus.memory.heapUsed / 1024 / 1024).toFixed(1)}MB`);
        console.log(`File loader throughput: ${agentMetrics.fileLoader.throughputMBps.toFixed(1)}MB/s`);
      } else {
        console.log('=== Execution Metrics ===');
        console.log(JSON.stringify(execMetrics, null, 2));
        console.log('\n=== Performance Status ===');
        console.log(JSON.stringify(perfStatus, null, 2));
        console.log('\n=== Agent Metrics ===');
        console.log(JSON.stringify(agentMetrics, null, 2));
      }

      if (options.export) {
        // Export metrics in specified format
        const exportPath = `metrics-${Date.now()}.${options.export}`;
        const exportData = {
          execution: execMetrics,
          performance: perfStatus,
          agent: agentMetrics,
          timestamp: new Date().toISOString()
        };
        
        if (options.export === 'csv') {
          // Simple CSV export
          console.log('CSV export not implemented yet');
        } else {
          const fs = require('fs-extra');
          await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
        }
        console.log(chalk.green(`✓ Metrics exported to ${exportPath}`));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

// Agent selection commands
program
  .command('select')
  .description('Get agent recommendations for a task')
  .argument('<task>', 'Task description')
  .option('--max-agents <num>', 'Maximum number of agents to recommend', '4')
  .option('--no-recipes', 'Exclude recipe recommendations')
  .option('--exclude <agents>', 'Comma-separated list of agents to exclude')
  .option('--complexity <level>', 'Preferred complexity level (simple, medium, complex)')
  .option('--format <type>', 'Output format (json, markdown, text)', 'text')
  .action(async (task, options) => {
    try {
      // Validate inputs
      const validation = validateCommandArg(task, 'string');
      if (!validation) {
        console.log(chalk.red('Error: Invalid task description'));
        process.exit(1);
      }

      const selector = getAgentSelector();
      
      // Validate task description
      const taskValidation = selector.validateTask(task);
      if (!taskValidation.valid) {
        console.log(chalk.red('Task validation failed:'));
        taskValidation.issues.forEach(issue => console.log(chalk.red(`  ${issue}`)));
        process.exit(1);
      }

      // Parse options
      const selectionOptions = {
        maxAgents: parseInt(options.maxAgents),
        includeRecipes: options.recipes,
        excludeAgents: options.exclude ? options.exclude.split(',').map((s: string) => s.trim()) : [],
        preferredComplexity: options.complexity
      };

      logger.info(`Analyzing task: ${chalk.blue(task)}`);
      const recommendation = await selector.selectAgents(task, selectionOptions);

      // Format output
      if (options.format === 'json') {
        console.log(JSON.stringify(recommendation, null, 2));
      } else if (options.format === 'markdown') {
        console.log(chalk.blue('## Agent Recommendation\n'));
        console.log(`**Task:** ${task}\n`);
        console.log(`**Complexity:** ${recommendation.estimated_complexity}`);
        console.log(`**Confidence:** ${recommendation.confidence.toFixed(0)}%\n`);
        
        console.log('**Recommended Agents:**');
        recommendation.agents.forEach((agent, index) => {
          console.log(`${index + 1}. ${agent}`);
        });
        
        if (recommendation.recipe) {
          console.log(`\n**Recipe:** ${recommendation.recipe}`);
        }
        
        console.log('\n**Workflow Steps:**');
        recommendation.workflow_steps.forEach(step => {
          console.log(`${step.step}. **${step.agent}** - ${step.purpose}`);
        });
        
        console.log(`\n**Reasoning:** ${recommendation.reasoning}`);
      } else {
        // Default text format
        console.log(chalk.green('\n✓ Agent Recommendation Complete'));
        console.log(chalk.blue('═'.repeat(50)));
        
        console.log(`Task: ${chalk.yellow(task)}`);
        console.log(`Complexity: ${chalk.yellow(recommendation.estimated_complexity)}`);
        console.log(`Confidence: ${chalk.green(recommendation.confidence.toFixed(0) + '%')}`);
        
        console.log(chalk.blue('\nRecommended Agents:'));
        recommendation.agents.forEach((agent, index) => {
          console.log(`  ${index + 1}. ${chalk.cyan(agent)}`);
        });
        
        if (recommendation.recipe) {
          console.log(chalk.blue(`\nSuggested Recipe:`));
          console.log(`  ${chalk.green(recommendation.recipe)}`);
        }
        
        console.log(chalk.blue('\nWorkflow Steps:'));
        recommendation.workflow_steps.forEach(step => {
          console.log(`  ${step.step}. ${chalk.cyan(step.agent)} - ${step.purpose}`);
        });
        
        console.log(chalk.blue('\nReasoning:'));
        console.log(`  ${recommendation.reasoning}`);
        
        console.log(chalk.blue('\nExample Usage:'));
        if (recommendation.recipe) {
          console.log(chalk.gray(`  agent recipe ${recommendation.recipe}`));
        } else {
          console.log(chalk.gray(`  agent batch --agents ${recommendation.agents.join(',')}`));
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Agent selection failed: ${errorMessage}`);
      console.log(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

// Prompt command - manage domain-specific prompts
program
  .command('prompt')
  .description('Manage domain-specific prompt templates')
  .option('-l, --list', 'List available domains')
  .option('-d, --domain <domain>', 'Load specific domain prompt')
  .option('-c, --compose <domains...>', 'Compose prompts from multiple domains')
  .option('-a, --agent <agent>', 'Agent to enhance with domain knowledge')
  .option('--detect <path>', 'Auto-detect domains from project')
  .action(async (options) => {
    try {
      const promptLibrary = PromptLibrary.getInstance();

      if (options.list) {
        const domains = await promptLibrary.getAvailableDomains();
        console.log('\n📚 Available Domain Prompts:\n');
        domains.forEach(domain => console.log(`  • ${domain}`));
        console.log('\nUse: agent prompt --domain <domain> to view details');
        return;
      }

      if (options.detect) {
        const detected = await promptLibrary.detectDomain(options.detect);
        console.log('\n🔍 Detected Domains:\n');
        detected.forEach(domain => console.log(`  • ${domain}`));
        return;
      }

      if (options.domain) {
        const prompt = await promptLibrary.loadDomain(options.domain);
        if (prompt) {
          console.log(`\n📖 Domain: ${prompt.domain}`);
          console.log(`Version: ${prompt.version}`);
          console.log('\nBase Prompt:');
          console.log(prompt.basePrompt);
          console.log('\nBest Practices:', prompt.bestPractices.length, 'items');
          console.log('Anti-Patterns:', prompt.antiPatterns.length, 'items');
        } else {
          console.error(`Domain not found: ${options.domain}`);
        }
        return;
      }

      if (options.compose) {
        const basePrompt = 'You are an AI development assistant.';
        const composed = await promptLibrary.compose(basePrompt, {
          domains: options.compose,
          agent: options.agent || 'coder'
        });
        console.log('\n🎨 Composed Prompt:\n');
        console.log(composed);
        return;
      }

      console.log('Use --help for usage information');
    } catch (error) {
      logger.error('Prompt command failed:', error);
      process.exit(1);
    }
  });

program
  .command('wizard')
  .description('Interactive agent selection wizard')
  .option('--format <type>', 'Output format (json, markdown, text)', 'text')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧙 Agent Selection Wizard'));
      console.log(chalk.gray('Interactive wizard coming soon. For now, use the select command:\n'));
      console.log(chalk.yellow('Examples:'));
      console.log(chalk.gray('  agent select "implement user authentication"'));
      console.log(chalk.gray('  agent select "fix memory leak in payment service"'));
      console.log(chalk.gray('  agent select "optimize database queries"'));
      console.log(chalk.gray('  agent select "create API documentation"'));
      
      // For now, show available agents
      const selector = getAgentSelector();
      const capabilities = selector.getAgentCapabilities();
      
      console.log(chalk.blue('\nAvailable Agents:'));
      Array.from(capabilities.entries()).forEach(([name, capability]) => {
        console.log(`  ${chalk.cyan(name)} - ${capability.description}`);
      });
      
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
// Performance-aware graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Finalize security audit
    await securityAuditor.finalize();
    
    // Shutdown performance-related components if they were initialized
    if (executionEngine) {
      await executionEngine.shutdown();
    }
    
    if (agentManager) {
      await agentManager.shutdown();
    }
    
    logger.info('Graceful shutdown completed');
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
  }
  
  process.exit(0);
};

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Add performance benchmark command
program
  .command('benchmark')
  .description('Run performance benchmarks')
  .option('--context <path>', 'Context path for benchmarking')
  .option('--iterations <num>', 'Number of iterations', '5')
  .action(async (options) => {
    try {
      const startTime = Date.now();
      console.log(chalk.blue('=== Performance Benchmark ==='));
      
      const agentMgr = getAgentManager();
      const execEngine = getExecutionEngine();
      
      // Startup time
      const startupTime = Date.now() - startupStartTime;
      console.log(`CLI Startup time: ${startupTime}ms`);
      
      // Context loading benchmark
      if (options.context) {
        console.log(chalk.yellow('\nContext Loading Benchmark:'));
        const contextBench = await agentMgr.benchmarkContextLoading(options.context);
        console.log(`  Cache miss: ${contextBench.cacheMiss.time}ms`);
        console.log(`  Cache hit: ${contextBench.cacheHit.time}ms`);
        console.log(`  Improvement: ${contextBench.improvement.percent.toFixed(1)}%`);
      }
      
      // Memory status
      console.log(chalk.yellow('\nMemory Status:'));
      const memMetrics = execEngine.getMemoryMetrics();
      console.log(`  Heap used: ${(memMetrics.heapUsed / 1024 / 1024).toFixed(1)}MB`);
      console.log(`  Cache entries: ${memMetrics.cacheEntries}`);
      console.log(`  Memory pressure: ${(memMetrics.memoryPressure * 100).toFixed(1)}%`);
      
      // Cache performance
      console.log(chalk.yellow('\nCache Performance:'));
      const cacheMetrics = execEngine.getCacheMetrics();
      console.log(`  Hit rate: ${(cacheMetrics.hitRate * 100).toFixed(1)}%`);
      console.log(`  Total entries: ${cacheMetrics.totalEntries}`);
      console.log(`  Avg response time: ${cacheMetrics.averageResponseTime.toFixed(1)}ms`);
      
      const benchmarkTime = Date.now() - startTime;
      console.log(chalk.green(`\n✓ Benchmark completed in ${benchmarkTime}ms`));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`Benchmark error: ${errorMessage}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();