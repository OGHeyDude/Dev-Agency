/**
 * Enhanced CLI with Interactive REPL Mode
 * Provides persistent session state, command history, and intelligent auto-completion
 */

import { createInterface, ReadLine } from 'readline';
import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { CommandHistory } from './CommandHistory';
import { AutoComplete } from './AutoComplete';
import { SessionManager } from './SessionManager';
import { HelpSystem } from './HelpSystem';

interface REPLOptions {
  historyFile?: string;
  sessionFile?: string;
  maxHistorySize?: number;
  prompt?: string;
  enableColors?: boolean;
}

interface REPLCommand {
  name: string;
  description: string;
  handler: (args: string[], session: REPLSession) => Promise<void> | void;
  completions?: string[] | ((partial: string) => Promise<string[]>);
  help?: string;
}

export interface REPLSession {
  id: string;
  name?: string;
  context: Record<string, any>;
  variables: Record<string, any>;
  lastCommand?: string;
  startTime: Date;
  commandCount: number;
  workingDirectory: string;
}

export class REPLMode extends EventEmitter {
  private rl: ReadLine | null = null;
  private commands = new Map<string, REPLCommand>();
  private commandHistory: CommandHistory;
  private autoComplete: AutoComplete;
  private sessionManager: SessionManager;
  private helpSystem: HelpSystem;
  private currentSession: REPLSession;
  private options: Required<REPLOptions>;
  private isRunning = false;
  private promptText = '';

  constructor(options: REPLOptions = {}) {
    super();

    this.options = {
      historyFile: options.historyFile || path.join(process.cwd(), '.dev_agency_history'),
      sessionFile: options.sessionFile || path.join(process.cwd(), '.dev_agency_session'),
      maxHistorySize: options.maxHistorySize || 1000,
      prompt: options.prompt || 'agent> ',
      enableColors: options.enableColors ?? true
    };

    // Initialize components
    this.commandHistory = new CommandHistory(this.options.historyFile, this.options.maxHistorySize);
    this.sessionManager = new SessionManager(this.options.sessionFile);
    this.autoComplete = new AutoComplete();
    this.helpSystem = new HelpSystem();

    // Initialize current session
    this.currentSession = this.createSession();

    // Set up default commands
    this.setupDefaultCommands();

    this.promptText = this.options.enableColors ? 
      chalk.cyan(this.options.prompt) : 
      this.options.prompt;
  }

  /**
   * Start the interactive REPL mode
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('REPL mode is already running');
    }

    try {
      // Load command history and session
      await this.commandHistory.load();
      await this.sessionManager.loadSession(this.currentSession);

      // Create readline interface
      this.rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: this.promptText,
        history: this.commandHistory.getRecentCommands(50),
        completer: this.handleTabCompletion.bind(this),
        historySize: this.options.maxHistorySize
      });

      // Set up event handlers
      this.setupEventHandlers();

      this.isRunning = true;

      // Display welcome message
      this.displayWelcome();

      // Start the prompt
      this.rl.prompt();

      this.emit('started', this.currentSession);

    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop the REPL mode gracefully
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Save session and history
      await this.sessionManager.saveSession(this.currentSession);
      await this.commandHistory.save();

      if (this.rl) {
        this.rl.close();
        this.rl = null;
      }

      this.isRunning = false;
      this.emit('stopped', this.currentSession);

    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Register a new command in the REPL
   */
  registerCommand(command: REPLCommand): void {
    this.commands.set(command.name, command);
    this.autoComplete.addCommand(command.name, command.completions);
    this.helpSystem.addCommand(command);
  }

  /**
   * Execute a command directly (for testing or programmatic use)
   */
  async executeCommand(input: string): Promise<void> {
    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      // Parse command and arguments
      const [commandName, ...args] = trimmed.split(' ').filter(Boolean);
      
      // Add to history
      this.commandHistory.add(trimmed);
      this.currentSession.lastCommand = trimmed;
      this.currentSession.commandCount++;

      // Handle built-in commands
      if (await this.handleBuiltinCommand(commandName, args)) {
        return;
      }

      // Handle registered commands
      const command = this.commands.get(commandName);
      if (command) {
        await command.handler(args, this.currentSession);
        return;
      }

      // Command not found
      console.log(chalk.red(`Unknown command: ${commandName}`));
      console.log(chalk.gray('Type "help" for available commands or "?" for quick help'));

    } catch (error) {
      console.log(chalk.red(`Error executing command: ${error instanceof Error ? error.message : String(error)}`));
      this.emit('commandError', error, input);
    }
  }

  /**
   * Get current session information
   */
  getSession(): REPLSession {
    return { ...this.currentSession };
  }

  /**
   * Update session context
   */
  updateContext(key: string, value: any): void {
    this.currentSession.context[key] = value;
  }

  /**
   * Set a session variable
   */
  setVariable(name: string, value: any): void {
    this.currentSession.variables[name] = value;
  }

  /**
   * Get a session variable
   */
  getVariable(name: string): any {
    return this.currentSession.variables[name];
  }

  private createSession(): REPLSession {
    return {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      context: {},
      variables: {},
      startTime: new Date(),
      commandCount: 0,
      workingDirectory: process.cwd()
    };
  }

  private setupDefaultCommands(): void {
    // Help command
    this.registerCommand({
      name: 'help',
      description: 'Show help information',
      help: 'Usage: help [command]\nShow general help or help for a specific command',
      handler: async (args) => {
        if (args.length === 0) {
          this.helpSystem.showGeneralHelp();
        } else {
          this.helpSystem.showCommandHelp(args[0]);
        }
      }
    });

    // Exit command
    this.registerCommand({
      name: 'exit',
      description: 'Exit the interactive session',
      help: 'Usage: exit\nSave session and exit the REPL',
      handler: async () => {
        console.log(chalk.green('Goodbye! Session saved.'));
        await this.stop();
        process.exit(0);
      }
    });

    // Session management commands
    this.registerCommand({
      name: 'session',
      description: 'Manage REPL sessions',
      help: 'Usage: session <save|load|list|info|clear> [name]',
      completions: ['save', 'load', 'list', 'info', 'clear'],
      handler: async (args) => {
        const action = args[0];
        switch (action) {
          case 'save':
            const sessionName = args[1];
            if (sessionName) {
              this.currentSession.name = sessionName;
              await this.sessionManager.saveNamedSession(sessionName, this.currentSession);
              console.log(chalk.green(`Session saved as: ${sessionName}`));
            } else {
              await this.sessionManager.saveSession(this.currentSession);
              console.log(chalk.green('Session saved'));
            }
            break;
          case 'load':
            if (args[1]) {
              const loadedSession = await this.sessionManager.loadNamedSession(args[1]);
              if (loadedSession) {
                this.currentSession = loadedSession;
                console.log(chalk.green(`Session loaded: ${args[1]}`));
              } else {
                console.log(chalk.red(`Session not found: ${args[1]}`));
              }
            }
            break;
          case 'list':
            const sessions = await this.sessionManager.listSessions();
            console.log(chalk.blue('Available sessions:'));
            sessions.forEach(name => console.log(`  ${name}`));
            break;
          case 'info':
            this.displaySessionInfo();
            break;
          case 'clear':
            this.currentSession.context = {};
            this.currentSession.variables = {};
            console.log(chalk.yellow('Session context and variables cleared'));
            break;
          default:
            console.log(chalk.red('Usage: session <save|load|list|info|clear> [name]'));
        }
      }
    });

    // History command
    this.registerCommand({
      name: 'history',
      description: 'Show command history',
      help: 'Usage: history [count]\nShow recent commands (default: 10)',
      handler: async (args) => {
        const count = args[0] ? parseInt(args[0]) : 10;
        const commands = this.commandHistory.getRecentCommands(count);
        console.log(chalk.blue('Recent commands:'));
        commands.forEach((cmd, index) => {
          console.log(`  ${index + 1}. ${cmd}`);
        });
      }
    });

    // Clear command
    this.registerCommand({
      name: 'clear',
      description: 'Clear the screen',
      handler: async () => {
        console.clear();
      }
    });

    // Set/get variable commands
    this.registerCommand({
      name: 'set',
      description: 'Set a session variable',
      help: 'Usage: set <name> <value>\nSet a session variable',
      handler: async (args) => {
        if (args.length < 2) {
          console.log(chalk.red('Usage: set <name> <value>'));
          return;
        }
        const [name, ...valueParts] = args;
        const value = valueParts.join(' ');
        this.setVariable(name, value);
        console.log(chalk.green(`Set ${name} = ${value}`));
      }
    });

    this.registerCommand({
      name: 'get',
      description: 'Get a session variable',
      help: 'Usage: get <name>\nGet the value of a session variable',
      handler: async (args) => {
        if (args.length === 0) {
          // Show all variables
          const vars = this.currentSession.variables;
          if (Object.keys(vars).length === 0) {
            console.log(chalk.yellow('No session variables set'));
          } else {
            console.log(chalk.blue('Session variables:'));
            Object.entries(vars).forEach(([key, value]) => {
              console.log(`  ${key} = ${value}`);
            });
          }
        } else {
          const value = this.getVariable(args[0]);
          console.log(`${args[0]} = ${value ?? 'undefined'}`);
        }
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.rl) return;

    this.rl.on('line', async (input: string) => {
      await this.executeCommand(input);
      if (this.isRunning && this.rl) {
        this.rl.prompt();
      }
    });

    this.rl.on('close', async () => {
      console.log(chalk.green('\nGoodbye!'));
      await this.stop();
      process.exit(0);
    });

    // Handle Ctrl+C gracefully
    this.rl.on('SIGINT', async () => {
      console.log(chalk.yellow('\nPress Ctrl+C again to exit, or type "exit" to save session'));
      if (this.rl) {
        this.rl.prompt();
      }
    });

    // Handle special key combinations
    process.stdin.on('keypress', (str, key) => {
      if (key && key.name === 'tab') {
        // Tab completion is handled by readline's completer
        return;
      }
      
      if (key && key.ctrl && key.name === 'r') {
        // Ctrl+R for reverse history search - handled by readline
        return;
      }
    });
  }

  private async handleTabCompletion(line: string): Promise<[string[], string]> {
    const trimmed = line.trim();
    const parts = trimmed.split(' ');
    
    if (parts.length === 1) {
      // Complete command names
      const commandNames = Array.from(this.commands.keys());
      const matches = commandNames.filter(name => name.startsWith(trimmed));
      return [matches, trimmed];
    } else {
      // Complete command arguments
      const commandName = parts[0];
      const command = this.commands.get(commandName);
      
      if (command && command.completions) {
        let completions: string[] = [];
        
        if (Array.isArray(command.completions)) {
          completions = command.completions;
        } else if (typeof command.completions === 'function') {
          const partial = parts[parts.length - 1];
          completions = await command.completions(partial);
        }
        
        const partial = parts[parts.length - 1];
        const matches = completions.filter(comp => comp.startsWith(partial));
        return [matches, partial];
      }
    }
    
    return [[], ''];
  }

  private async handleBuiltinCommand(command: string, args: string[]): Promise<boolean> {
    switch (command) {
      case '?':
        this.helpSystem.showQuickHelp();
        return true;
      case 'pwd':
        console.log(this.currentSession.workingDirectory);
        return true;
      case 'cd':
        if (args.length > 0) {
          const newPath = path.resolve(this.currentSession.workingDirectory, args[0]);
          if (await fs.pathExists(newPath)) {
            this.currentSession.workingDirectory = newPath;
            process.chdir(newPath);
            console.log(chalk.green(`Changed to: ${newPath}`));
          } else {
            console.log(chalk.red(`Directory not found: ${args[0]}`));
          }
        } else {
          this.currentSession.workingDirectory = process.env.HOME || process.cwd();
          process.chdir(this.currentSession.workingDirectory);
          console.log(chalk.green(`Changed to home directory`));
        }
        return true;
      default:
        return false;
    }
  }

  private displayWelcome(): void {
    if (!this.options.enableColors) {
      console.log('Dev-Agency Interactive CLI');
      console.log('Type "help" for commands or "?" for quick help');
      console.log('');
      return;
    }

    console.log(chalk.blue('╔══════════════════════════════════════════════════════════════╗'));
    console.log(chalk.blue('║') + chalk.cyan.bold('                 Dev-Agency Interactive CLI                   ') + chalk.blue('║'));
    console.log(chalk.blue('╠══════════════════════════════════════════════════════════════╣'));
    console.log(chalk.blue('║') + ' 🤖 Enhanced CLI with intelligent auto-completion            ' + chalk.blue('║'));
    console.log(chalk.blue('║') + ' 📚 Persistent command history and session management        ' + chalk.blue('║'));
    console.log(chalk.blue('║') + ' ⚡ Tab completion for commands and parameters               ' + chalk.blue('║'));
    console.log(chalk.blue('║') + ' 🔍 Ctrl+R for reverse history search                        ' + chalk.blue('║'));
    console.log(chalk.blue('╠══════════════════════════════════════════════════════════════╣'));
    console.log(chalk.blue('║') + chalk.yellow(' Quick Start:') + '                                              ' + chalk.blue('║'));
    console.log(chalk.blue('║') + '   • Type ' + chalk.green('"help"') + ' for all commands                            ' + chalk.blue('║'));
    console.log(chalk.blue('║') + '   • Type ' + chalk.green('"?"') + ' for quick help                              ' + chalk.blue('║'));
    console.log(chalk.blue('║') + '   • Type ' + chalk.green('"exit"') + ' to save session and quit                  ' + chalk.blue('║'));
    console.log(chalk.blue('║') + '   • Use ' + chalk.cyan('Tab') + ' for auto-completion                          ' + chalk.blue('║'));
    console.log(chalk.blue('╚══════════════════════════════════════════════════════════════╝'));
    console.log('');

    // Show session info
    this.displaySessionInfo();
    console.log('');
  }

  private displaySessionInfo(): void {
    const session = this.currentSession;
    const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
    
    console.log(chalk.blue('Session Info:'));
    console.log(`  ID: ${session.id}`);
    if (session.name) {
      console.log(`  Name: ${session.name}`);
    }
    console.log(`  Started: ${session.startTime.toLocaleString()}`);
    console.log(`  Duration: ${duration}s`);
    console.log(`  Commands: ${session.commandCount}`);
    console.log(`  Directory: ${session.workingDirectory}`);
    
    const contextKeys = Object.keys(session.context).length;
    const variableKeys = Object.keys(session.variables).length;
    if (contextKeys > 0 || variableKeys > 0) {
      console.log(`  Context: ${contextKeys} items, Variables: ${variableKeys} items`);
    }
  }
}