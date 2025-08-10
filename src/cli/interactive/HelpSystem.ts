/**
 * Context-Aware Help System
 * Provides intelligent help and documentation for CLI commands
 */

import chalk from 'chalk';

export interface HelpCommand {
  name: string;
  description: string;
  usage?: string;
  help?: string;
  examples?: string[];
  aliases?: string[];
  options?: HelpOption[];
  subcommands?: HelpCommand[];
}

export interface HelpOption {
  flag: string;
  description: string;
  type?: string;
  required?: boolean;
  default?: string;
}

export interface HelpTopic {
  name: string;
  title: string;
  content: string;
  relatedCommands?: string[];
}

export class HelpSystem {
  private commands = new Map<string, HelpCommand>();
  private topics = new Map<string, HelpTopic>();
  private aliases = new Map<string, string>();

  constructor() {
    this.setupBuiltinTopics();
  }

  /**
   * Add a command to the help system
   */
  addCommand(command: HelpCommand): void {
    this.commands.set(command.name, command);
    
    // Register aliases
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias, command.name);
      }
    }
  }

  /**
   * Add a help topic
   */
  addTopic(topic: HelpTopic): void {
    this.topics.set(topic.name, topic);
  }

  /**
   * Show general help information
   */
  showGeneralHelp(): void {
    console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║') + chalk.cyan.bold('              Dev-Agency CLI Help System                     ') + chalk.blue('║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');

    console.log(chalk.yellow.bold('QUICK START:'));
    console.log('  • Use ' + chalk.green('Tab') + ' key for auto-completion');
    console.log('  • Use ' + chalk.green('Ctrl+R') + ' for reverse history search');
    console.log('  • Type ' + chalk.green('help <command>') + ' for detailed command help');
    console.log('  • Type ' + chalk.green('?') + ' for quick reference');
    console.log('');

    console.log(chalk.yellow.bold('CORE COMMANDS:'));
    const coreCommands = [
      'help', 'invoke', 'batch', 'recipe', 'session', 'history', 'status', 'exit'
    ];
    
    for (const cmdName of coreCommands) {
      const command = this.commands.get(cmdName);
      if (command) {
        const paddedName = cmdName.padEnd(12);
        console.log(`  ${chalk.cyan(paddedName)} ${command.description}`);
      }
    }
    console.log('');

    console.log(chalk.yellow.bold('AGENT OPERATIONS:'));
    console.log('  ' + chalk.cyan('invoke'.padEnd(12)) + ' Run a single agent with specified task');
    console.log('  ' + chalk.cyan('batch'.padEnd(12)) + ' Execute multiple agents in parallel');
    console.log('  ' + chalk.cyan('select'.padEnd(12)) + ' Get agent recommendations for a task');
    console.log('  ' + chalk.cyan('recipe'.padEnd(12)) + ' Execute predefined workflow recipes');
    console.log('');

    console.log(chalk.yellow.bold('EXAMPLES:'));
    console.log('  ' + chalk.gray('invoke architect --task "design user auth system"'));
    console.log('  ' + chalk.gray('batch --agents coder,tester --context ./src'));
    console.log('  ' + chalk.gray('recipe mcp-server --vars \'{"name": "my-server"}\''));
    console.log('  ' + chalk.gray('select "optimize database performance"'));
    console.log('');

    console.log(chalk.yellow.bold('HELP TOPICS:'));
    const topics = Array.from(this.topics.keys()).slice(0, 6);
    topics.forEach(topic => {
      console.log(`  ${chalk.green('help')} ${chalk.cyan(topic)}`);
    });
    console.log('');

    console.log(chalk.gray('For detailed information: help <command> or help <topic>'));
  }

  /**
   * Show quick reference help
   */
  showQuickHelp(): void {
    console.log(chalk.blue('═══ Quick Reference ═══'));
    console.log('');
    console.log(chalk.yellow('Navigation:'));
    console.log('  ' + chalk.green('Tab') + '           Auto-complete commands and paths');
    console.log('  ' + chalk.green('Ctrl+R') + '        Search command history');
    console.log('  ' + chalk.green('↑/↓') + '           Browse command history');
    console.log('  ' + chalk.green('Ctrl+C') + '        Cancel current input');
    console.log('');
    console.log(chalk.yellow('Essential Commands:'));
    console.log('  ' + chalk.cyan('help') + '          Show full help system');
    console.log('  ' + chalk.cyan('invoke <agent>') + ' Run single agent');
    console.log('  ' + chalk.cyan('status') + '        Show system status');
    console.log('  ' + chalk.cyan('session info') + '  Show session details');
    console.log('  ' + chalk.cyan('history') + '       Show recent commands');
    console.log('  ' + chalk.cyan('exit') + '          Save and exit');
    console.log('');
  }

  /**
   * Show help for a specific command
   */
  showCommandHelp(commandName: string): void {
    // Check for alias
    const actualName = this.aliases.get(commandName) || commandName;
    const command = this.commands.get(actualName);

    if (!command) {
      console.log(chalk.red(`Unknown command: ${commandName}`));
      console.log(chalk.gray('Type "help" to see all available commands'));
      return;
    }

    console.log(chalk.blue(`╔═══ ${command.name.toUpperCase()} COMMAND HELP ═══╗`));
    console.log('');

    // Description
    console.log(chalk.yellow.bold('DESCRIPTION:'));
    console.log(`  ${command.description}`);
    console.log('');

    // Usage
    if (command.usage) {
      console.log(chalk.yellow.bold('USAGE:'));
      console.log(`  ${chalk.green(command.usage)}`);
      console.log('');
    }

    // Options
    if (command.options && command.options.length > 0) {
      console.log(chalk.yellow.bold('OPTIONS:'));
      for (const option of command.options) {
        const required = option.required ? chalk.red(' (required)') : '';
        const defaultValue = option.default ? chalk.gray(` [default: ${option.default}]`) : '';
        console.log(`  ${chalk.cyan(option.flag.padEnd(15))} ${option.description}${required}${defaultValue}`);
      }
      console.log('');
    }

    // Subcommands
    if (command.subcommands && command.subcommands.length > 0) {
      console.log(chalk.yellow.bold('SUBCOMMANDS:'));
      for (const sub of command.subcommands) {
        console.log(`  ${chalk.cyan(sub.name.padEnd(15))} ${sub.description}`);
      }
      console.log('');
    }

    // Examples
    if (command.examples && command.examples.length > 0) {
      console.log(chalk.yellow.bold('EXAMPLES:'));
      for (const example of command.examples) {
        console.log(`  ${chalk.gray(example)}`);
      }
      console.log('');
    }

    // Aliases
    if (command.aliases && command.aliases.length > 0) {
      console.log(chalk.yellow.bold('ALIASES:'));
      console.log(`  ${command.aliases.map(a => chalk.cyan(a)).join(', ')}`);
      console.log('');
    }

    // Detailed help
    if (command.help) {
      console.log(chalk.yellow.bold('DETAILS:'));
      console.log(`  ${command.help}`);
      console.log('');
    }
  }

  /**
   * Show help for a topic
   */
  showTopicHelp(topicName: string): void {
    const topic = this.topics.get(topicName);
    if (!topic) {
      console.log(chalk.red(`Unknown help topic: ${topicName}`));
      this.showAvailableTopics();
      return;
    }

    console.log(chalk.blue(`╔═══ ${topic.title.toUpperCase()} ═══╗`));
    console.log('');
    console.log(topic.content);
    console.log('');

    if (topic.relatedCommands && topic.relatedCommands.length > 0) {
      console.log(chalk.yellow.bold('RELATED COMMANDS:'));
      for (const cmdName of topic.relatedCommands) {
        const command = this.commands.get(cmdName);
        if (command) {
          console.log(`  ${chalk.cyan(cmdName.padEnd(12))} ${command.description}`);
        }
      }
      console.log('');
    }
  }

  /**
   * Show available help topics
   */
  showAvailableTopics(): void {
    console.log(chalk.yellow('Available help topics:'));
    Array.from(this.topics.keys()).forEach(topic => {
      const topicInfo = this.topics.get(topic)!;
      console.log(`  ${chalk.cyan(topic.padEnd(15))} ${topicInfo.title}`);
    });
    console.log('');
    console.log(chalk.gray('Usage: help <topic>'));
  }

  /**
   * Search help content
   */
  searchHelp(query: string): void {
    const results: Array<{type: 'command' | 'topic', name: string, description: string}> = [];
    const searchTerm = query.toLowerCase();

    // Search commands
    for (const [name, command] of this.commands) {
      if (name.toLowerCase().includes(searchTerm) || 
          command.description.toLowerCase().includes(searchTerm) ||
          (command.help && command.help.toLowerCase().includes(searchTerm))) {
        results.push({
          type: 'command',
          name,
          description: command.description
        });
      }
    }

    // Search topics
    for (const [name, topic] of this.topics) {
      if (name.toLowerCase().includes(searchTerm) ||
          topic.title.toLowerCase().includes(searchTerm) ||
          topic.content.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'topic',
          name,
          description: topic.title
        });
      }
    }

    if (results.length === 0) {
      console.log(chalk.yellow(`No help found for: ${query}`));
      return;
    }

    console.log(chalk.blue(`Search results for: ${chalk.cyan(query)}`));
    console.log('');

    const commands = results.filter(r => r.type === 'command');
    const topics = results.filter(r => r.type === 'topic');

    if (commands.length > 0) {
      console.log(chalk.yellow.bold('COMMANDS:'));
      commands.forEach(result => {
        console.log(`  ${chalk.cyan(result.name.padEnd(15))} ${result.description}`);
      });
      console.log('');
    }

    if (topics.length > 0) {
      console.log(chalk.yellow.bold('TOPICS:'));
      topics.forEach(result => {
        console.log(`  ${chalk.cyan(result.name.padEnd(15))} ${result.description}`);
      });
      console.log('');
    }

    console.log(chalk.gray('Use: help <name> for detailed information'));
  }

  /**
   * Get context-sensitive help based on partial input
   */
  getContextHelp(input: string): string[] {
    const words = input.trim().split(/\s+/);
    const suggestions: string[] = [];

    if (words.length === 1) {
      // Suggest commands
      const partial = words[0].toLowerCase();
      for (const [name, command] of this.commands) {
        if (name.toLowerCase().startsWith(partial)) {
          suggestions.push(`${name} - ${command.description}`);
        }
      }
    } else if (words.length >= 2) {
      // Suggest based on command context
      const commandName = words[0];
      const command = this.commands.get(commandName);
      
      if (command && command.options) {
        const partial = words[words.length - 1];
        if (partial.startsWith('-')) {
          // Suggest options
          for (const option of command.options) {
            if (option.flag.startsWith(partial)) {
              suggestions.push(`${option.flag} - ${option.description}`);
            }
          }
        }
      }
    }

    return suggestions.slice(0, 5); // Limit suggestions
  }

  private setupBuiltinTopics(): void {
    this.addTopic({
      name: 'getting-started',
      title: 'Getting Started with Dev-Agency CLI',
      content: `
${chalk.cyan('Welcome to the Dev-Agency Interactive CLI!')}

This enhanced CLI provides a powerful development environment with:
• ${chalk.yellow('Intelligent Auto-completion')}: Press Tab for smart suggestions
• ${chalk.yellow('Persistent Command History')}: Navigate with ↑/↓ or search with Ctrl+R
• ${chalk.yellow('Session Management')}: Save and restore your work context
• ${chalk.yellow('Context-Aware Help')}: Get relevant help based on what you're doing

${chalk.yellow('Quick Start Steps:')}
1. Try typing "invoke" and press Tab to see available agents
2. Run "status" to check system health
3. Use "session info" to see your current session
4. Explore with "list --agents" to see all available agents

${chalk.yellow('Pro Tips:')}
• Use "?" for quick reference anytime
• Commands support partial completion - type "inv" + Tab
• Session variables persist across commands - use "set/get"
• All commands support --help flag for detailed options
      `,
      relatedCommands: ['invoke', 'status', 'session', 'list']
    });

    this.addTopic({
      name: 'agents',
      title: 'Working with Dev-Agency Agents',
      content: `
${chalk.cyan('Dev-Agency Agents are specialized AI assistants for development tasks.')}

${chalk.yellow('Available Agent Types:')}
• ${chalk.green('architect')}: System design and architecture planning
• ${chalk.green('coder')}: Code implementation and development
• ${chalk.green('tester')}: Quality assurance and testing
• ${chalk.green('security')}: Security review and vulnerability assessment
• ${chalk.green('documenter')}: Documentation creation and maintenance
• ${chalk.green('performance')}: Performance optimization and monitoring

${chalk.yellow('Usage Patterns:')}
• Single agent: ${chalk.gray('invoke architect --task "design user auth"')}
• Multiple agents: ${chalk.gray('batch --agents coder,tester --context ./src')}
• Get recommendations: ${chalk.gray('select "implement payment system"')}

${chalk.yellow('Best Practices:')}
• Always provide clear, specific task descriptions
• Use --context to provide relevant code/files
• Combine agents for comprehensive solutions
• Use recipes for common multi-agent workflows
      `,
      relatedCommands: ['invoke', 'batch', 'select', 'list']
    });

    this.addTopic({
      name: 'sessions',
      title: 'Session Management',
      content: `
${chalk.cyan('Sessions help you maintain context and state across CLI interactions.')}

${chalk.yellow('Session Features:')}
• Persistent variables that survive across commands
• Context storage for project-specific information
• Command history tied to sessions
• Named sessions for different projects

${chalk.yellow('Session Commands:')}
• ${chalk.gray('session info')}: Show current session details
• ${chalk.gray('session save [name]')}: Save current session
• ${chalk.gray('session load <name>')}: Load a saved session  
• ${chalk.gray('session list')}: List all saved sessions
• ${chalk.gray('session clear')}: Clear session variables

${chalk.yellow('Variable Management:')}
• ${chalk.gray('set project_root ./my-app')}: Set a session variable
• ${chalk.gray('get project_root')}: Get variable value
• ${chalk.gray('get')}: Show all variables

${chalk.yellow('Use Cases:')}
• Maintain project context while switching between tasks
• Store frequently used paths and configuration
• Share session state between team members
      `,
      relatedCommands: ['session', 'set', 'get']
    });

    this.addTopic({
      name: 'recipes',
      title: 'Recipe System',
      content: `
${chalk.cyan('Recipes are predefined workflows that orchestrate multiple agents.')}

${chalk.yellow('Available Recipes:')}
• ${chalk.green('full-stack-feature')}: Complete feature development
• ${chalk.green('mcp-server')}: MCP server implementation
• ${chalk.green('api-feature')}: REST API development
• ${chalk.green('bug-fix')}: Comprehensive bug resolution
• ${chalk.green('performance-optimization')}: Performance improvements

${chalk.yellow('Recipe Usage:')}
• Basic: ${chalk.gray('recipe mcp-server')}
• With variables: ${chalk.gray('recipe mcp-server --vars \'{"name": "auth-server"}\'')}
• With context: ${chalk.gray('recipe bug-fix --context ./problematic-file.js')}
• Dry run: ${chalk.gray('recipe full-stack-feature --dry-run')}

${chalk.yellow('Recipe Variables:')}
Recipes accept JSON variables to customize behavior:
${chalk.gray('{"name": "my-feature", "database": "postgres", "auth": true}')}

${chalk.yellow('Benefits:')}
• Consistent workflow execution
• Coordinated multi-agent collaboration
• Reduced cognitive load for complex tasks
• Repeatable development processes
      `,
      relatedCommands: ['recipe', 'list']
    });
  }
}