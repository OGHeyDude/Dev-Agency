/**
 * Enhanced CLI Module Exports
 * Main entry point for the Dev-Agency Enhanced CLI system
 */

export { EnhancedCLI } from './EnhancedCLI';
export { REPLMode, REPLSession } from './interactive/REPLMode';
export { CommandHistory, HistoryEntry, HistorySearchOptions } from './interactive/CommandHistory';
export { AutoComplete, CompletionProvider, CompletionContext, CompletionResult } from './interactive/AutoComplete';
export { SessionManager, SessionSnapshot, SessionListItem } from './interactive/SessionManager';
export { HelpSystem, HelpCommand, HelpOption, HelpTopic } from './interactive/HelpSystem';

// Re-export types for external use
export interface CLIConfiguration {
  interactive?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  config?: string;
  historyFile?: string;
  sessionFile?: string;
  noColors?: boolean;
}

// Version information
export const CLI_VERSION = '2.0.0';
export const FEATURES = {
  INTERACTIVE_REPL: true,
  COMMAND_HISTORY: true,
  TAB_COMPLETION: true,
  SESSION_MANAGEMENT: true,
  CONTEXT_AWARE_HELP: true,
  BACKWARDS_COMPATIBILITY: true
};

// Default configuration values
export const DEFAULT_CONFIG = {
  historyFile: '.dev_agency_history',
  sessionFile: '.dev_agency_session',
  maxHistorySize: 1000,
  prompt: 'agent> ',
  enableColors: true
};

/**
 * Create and start an enhanced CLI instance
 */
export async function startCLI(config?: CLIConfiguration): Promise<EnhancedCLI> {
  const cli = new EnhancedCLI();
  
  // Build argv from config if provided
  const argv = ['node', 'cli'];
  if (config) {
    if (config.interactive) argv.push('--interactive');
    if (config.verbose) argv.push('--verbose');
    if (config.quiet) argv.push('--quiet');
    if (config.config) argv.push('--config', config.config);
    if (config.noColors) argv.push('--no-colors');
  }
  
  await cli.start(argv);
  return cli;
}

/**
 * Utility function to check if environment supports interactive mode
 */
export function supportsInteractiveMode(): boolean {
  return process.stdin.isTTY && 
         process.stdout.isTTY && 
         !process.env.CI && 
         !process.env.NON_INTERACTIVE;
}

/**
 * Get CLI feature information
 */
export function getFeatureInfo() {
  return {
    version: CLI_VERSION,
    features: FEATURES,
    supportsInteractive: supportsInteractiveMode(),
    platform: process.platform,
    nodeVersion: process.version
  };
}