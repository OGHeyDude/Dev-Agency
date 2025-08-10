#!/usr/bin/env node

/**
 * Enhanced Dev-Agency CLI with Interactive REPL Mode
 * Provides backwards compatibility while adding advanced interactive features
 */

import { EnhancedCLI } from './EnhancedCLI';
import chalk from 'chalk';
import * as fs from 'fs-extra';

// Check if running in TTY (terminal) vs script/CI environment
const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

// Handle graceful shutdown
let cliInstance: EnhancedCLI | null = null;

const gracefulShutdown = async (signal: string) => {
  if (cliInstance) {
    console.log(chalk.yellow(`\nReceived ${signal}, shutting down gracefully...`));
    try {
      // The REPL mode handles its own cleanup
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

async function main() {
  try {
    // Check for version flag early
    if (process.argv.includes('--version') || process.argv.includes('-V')) {
      console.log('2.0.0');
      process.exit(0);
    }

    // Check for help flag early
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showUsage();
      process.exit(0);
    }

    // Initialize enhanced CLI
    cliInstance = new EnhancedCLI();

    // Start the CLI (will automatically determine mode based on arguments and TTY)
    await cliInstance.start(process.argv);

  } catch (error) {
    console.error(chalk.red('CLI initialization failed:'), error);
    process.exit(1);
  }
}

function showUsage() {
  console.log(chalk.blue('Dev-Agency Enhanced CLI v2.0.0'));
  console.log('');
  console.log(chalk.yellow('USAGE:'));
  console.log('  agent                           Start in interactive REPL mode');
  console.log('  agent <command> [options]       Run a single command');
  console.log('  agent --interactive             Explicitly start interactive mode');
  console.log('');
  console.log(chalk.yellow('INTERACTIVE MODE FEATURES:'));
  console.log('  • Persistent command history with search (Ctrl+R)');
  console.log('  • Intelligent tab completion for commands and parameters');
  console.log('  • Session management and variable storage');
  console.log('  • Context-aware help system');
  console.log('  • Real-time agent status and metrics');
  console.log('');
  console.log(chalk.yellow('CORE COMMANDS:'));
  console.log('  invoke <agent>                  Invoke a single agent');
  console.log('  batch --agents <list>           Execute multiple agents in parallel');
  console.log('  recipe <name>                   Execute a predefined workflow');
  console.log('  select "<task>"                 Get agent recommendations');
  console.log('  status                          Show system status');
  console.log('  list [--agents|--recipes]       List available resources');
  console.log('');
  console.log(chalk.yellow('SESSION MANAGEMENT:'));
  console.log('  session save [name]             Save current session');
  console.log('  session load <name>             Load a saved session');
  console.log('  session list                    List all saved sessions');
  console.log('  set <var> <value>               Set session variable');
  console.log('  get [var]                       Get session variable(s)');
  console.log('');
  console.log(chalk.yellow('OPTIONS:'));
  console.log('  -i, --interactive               Force interactive mode');
  console.log('  -v, --verbose                   Enable verbose logging');
  console.log('  -q, --quiet                     Suppress non-error output');
  console.log('  -c, --config <path>             Use custom config file');
  console.log('  --no-colors                     Disable colored output');
  console.log('  --version                       Show version number');
  console.log('  --help                          Show this help message');
  console.log('');
  console.log(chalk.yellow('EXAMPLES:'));
  console.log('  agent                           # Start interactive mode');
  console.log('  agent invoke architect --task "design auth system"');
  console.log('  agent batch --agents coder,tester --context ./src');
  console.log('  agent recipe mcp-server --vars \'{"name": "auth-server"}\'');
  console.log('  agent select "optimize database queries"');
  console.log('');
  console.log(chalk.gray('For detailed help, use: agent help <command> or start interactive mode'));
}

// Start the application
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}