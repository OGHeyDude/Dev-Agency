/**
 * Intelligent Auto-Completion Engine
 * Provides context-aware tab completion for commands, parameters, and file paths
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

export interface CompletionProvider {
  name: string;
  canHandle: (context: CompletionContext) => boolean;
  getCompletions: (context: CompletionContext) => Promise<string[]> | string[];
  priority?: number;
}

export interface CompletionContext {
  line: string;
  cursor: number;
  words: string[];
  currentWord: string;
  commandName?: string;
  argumentIndex?: number;
  workingDirectory?: string;
}

export interface CompletionResult {
  completions: string[];
  prefix: string;
  suggestions?: CompletionSuggestion[];
}

export interface CompletionSuggestion {
  value: string;
  description?: string;
  type?: 'command' | 'option' | 'file' | 'directory' | 'value';
  priority?: number;
}

export class AutoComplete {
  private providers: CompletionProvider[] = [];
  private commandCompletions: Map<string, string[] | ((partial: string) => Promise<string[]>)> = new Map();
  private agentCommands: string[] = [];
  private recipeNames: string[] = [];
  private domainNames: string[] = [];

  constructor() {
    this.setupDefaultProviders();
  }

  /**
   * Add a command with its possible completions
   */
  addCommand(command: string, completions?: string[] | ((partial: string) => Promise<string[]>)): void {
    if (completions) {
      this.commandCompletions.set(command, completions);
    }
  }

  /**
   * Set available agent commands for completion
   */
  setAgentCommands(agents: string[]): void {
    this.agentCommands = agents;
  }

  /**
   * Set available recipe names for completion
   */
  setRecipeNames(recipes: string[]): void {
    this.recipeNames = recipes;
  }

  /**
   * Set available domain names for completion
   */
  setDomainNames(domains: string[]): void {
    this.domainNames = domains;
  }

  /**
   * Add a custom completion provider
   */
  addProvider(provider: CompletionProvider): void {
    this.providers.push(provider);
    // Sort by priority (higher priority first)
    this.providers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Get completions for a given line and cursor position
   */
  async getCompletions(line: string, cursor?: number): Promise<CompletionResult> {
    const context = this.parseContext(line, cursor || line.length);
    const allCompletions: CompletionSuggestion[] = [];

    // Run all applicable providers
    for (const provider of this.providers) {
      if (provider.canHandle(context)) {
        try {
          const providerCompletions = await provider.getCompletions(context);
          const suggestions = providerCompletions.map(completion => ({
            value: completion,
            type: this.inferCompletionType(completion, provider.name),
            priority: provider.priority || 0
          } as CompletionSuggestion));
          allCompletions.push(...suggestions);
        } catch (error) {
          console.warn(`Completion provider ${provider.name} failed:`, error);
        }
      }
    }

    // Remove duplicates and sort by priority
    const uniqueCompletions = this.deduplicateAndSort(allCompletions);
    
    return {
      completions: uniqueCompletions.map(s => s.value),
      prefix: context.currentWord,
      suggestions: uniqueCompletions
    };
  }

  private parseContext(line: string, cursor: number): CompletionContext {
    const beforeCursor = line.substring(0, cursor);
    const words = beforeCursor.trim().split(/\s+/).filter(Boolean);
    
    let currentWord = '';
    if (beforeCursor.endsWith(' ')) {
      currentWord = '';
    } else if (words.length > 0) {
      currentWord = words[words.length - 1];
    }

    const commandName = words.length > 0 ? words[0] : undefined;
    const argumentIndex = words.length > 1 ? words.length - 2 : -1;

    return {
      line,
      cursor,
      words,
      currentWord,
      commandName,
      argumentIndex,
      workingDirectory: process.cwd()
    };
  }

  private setupDefaultProviders(): void {
    // Command name completion provider
    this.addProvider({
      name: 'commands',
      priority: 100,
      canHandle: (context) => context.words.length <= 1,
      getCompletions: (context) => {
        const commands = Array.from(this.commandCompletions.keys());
        return commands.filter(cmd => cmd.startsWith(context.currentWord));
      }
    });

    // Agent command completion provider
    this.addProvider({
      name: 'agents',
      priority: 90,
      canHandle: (context) => {
        return context.commandName === 'invoke' || 
               context.commandName === 'agent' ||
               (context.words.includes('--agent') && context.argumentIndex >= 0);
      },
      getCompletions: (context) => {
        return this.agentCommands.filter(agent => 
          agent.startsWith(context.currentWord)
        );
      }
    });

    // Recipe completion provider
    this.addProvider({
      name: 'recipes',
      priority: 85,
      canHandle: (context) => {
        return context.commandName === 'recipe' ||
               (context.words.includes('--recipe') && context.argumentIndex >= 0);
      },
      getCompletions: (context) => {
        return this.recipeNames.filter(recipe => 
          recipe.startsWith(context.currentWord)
        );
      }
    });

    // Domain completion provider
    this.addProvider({
      name: 'domains',
      priority: 80,
      canHandle: (context) => {
        return context.words.includes('--domains') || 
               context.words.includes('-d') ||
               context.commandName === 'prompt';
      },
      getCompletions: (context) => {
        return this.domainNames.filter(domain => 
          domain.startsWith(context.currentWord)
        );
      }
    });

    // File path completion provider
    this.addProvider({
      name: 'files',
      priority: 70,
      canHandle: (context) => {
        return context.words.includes('--context') ||
               context.words.includes('-c') ||
               context.words.includes('--output') ||
               context.words.includes('-o') ||
               context.currentWord.includes('/') ||
               context.currentWord.includes('\\');
      },
      getCompletions: async (context) => {
        return await this.getFileCompletions(context);
      }
    });

    // Option/flag completion provider
    this.addProvider({
      name: 'options',
      priority: 60,
      canHandle: (context) => context.currentWord.startsWith('-'),
      getCompletions: (context) => {
        return this.getOptionCompletions(context);
      }
    });

    // Dynamic command argument completion provider
    this.addProvider({
      name: 'arguments',
      priority: 50,
      canHandle: (context) => context.commandName !== undefined,
      getCompletions: async (context) => {
        return await this.getDynamicCompletions(context);
      }
    });

    // Value completion provider (for specific option values)
    this.addProvider({
      name: 'values',
      priority: 40,
      canHandle: (context) => this.hasValueContext(context),
      getCompletions: (context) => {
        return this.getValueCompletions(context);
      }
    });
  }

  private async getFileCompletions(context: CompletionContext): Promise<string[]> {
    try {
      const currentWord = context.currentWord;
      let searchPattern: string;
      let baseDir: string;

      if (currentWord.includes('/') || currentWord.includes('\\')) {
        // Path contains directory separators
        const dirPath = path.dirname(currentWord);
        const baseName = path.basename(currentWord);
        baseDir = path.resolve(context.workingDirectory || process.cwd(), dirPath);
        searchPattern = path.join(baseDir, `${baseName}*`);
      } else {
        // Simple filename
        baseDir = context.workingDirectory || process.cwd();
        searchPattern = path.join(baseDir, `${currentWord}*`);
      }

      const matches = await glob(searchPattern, { 
        dot: true,
        nodir: false 
      });

      return matches
        .map(match => {
          const relativePath = path.relative(context.workingDirectory || process.cwd(), match);
          // Add trailing slash for directories
          return fs.statSync(match).isDirectory() ? `${relativePath}/` : relativePath;
        })
        .filter(match => match.startsWith(currentWord))
        .slice(0, 20); // Limit results
    } catch (error) {
      return [];
    }
  }

  private getOptionCompletions(context: CompletionContext): string[] {
    const commonOptions = [
      '--help', '--verbose', '--quiet', '--config', '--output', 
      '--context', '--domains', '--timeout', '--format', '--dry-run'
    ];

    const commandSpecificOptions: Record<string, string[]> = {
      'invoke': ['--task', '--context', '--domains', '--auto-detect', '--timeout', '--format', '--dry-run'],
      'batch': ['--agents', '--parallel', '--context', '--domains', '--auto-detect', '--timeout', '--format'],
      'recipe': ['--context', '--output', '--vars', '--dry-run'],
      'config': ['--project-type', '--force'],
      'select': ['--max-agents', '--no-recipes', '--exclude', '--complexity', '--format'],
      'prompt': ['--list', '--domain', '--compose', '--agent', '--detect'],
      'status': ['--active'],
      'list': ['--agents', '--recipes', '--domains'],
      'metrics': ['--summary', '--export'],
      'security': ['--report', '--alerts']
    };

    const specific = commandSpecificOptions[context.commandName || ''] || [];
    const allOptions = [...commonOptions, ...specific];

    return allOptions.filter(option => option.startsWith(context.currentWord));
  }

  private async getDynamicCompletions(context: CompletionContext): Promise<string[]> {
    const command = context.commandName;
    if (!command) return [];

    const completionFunction = this.commandCompletions.get(command);
    if (!completionFunction) return [];

    if (Array.isArray(completionFunction)) {
      return completionFunction.filter(comp => comp.startsWith(context.currentWord));
    } else if (typeof completionFunction === 'function') {
      return await completionFunction(context.currentWord);
    }

    return [];
  }

  private hasValueContext(context: CompletionContext): boolean {
    const words = context.words;
    if (words.length < 2) return false;

    const previousWord = words[words.length - 2];
    return previousWord.startsWith('-') && !context.currentWord.startsWith('-');
  }

  private getValueCompletions(context: CompletionContext): string[] {
    const words = context.words;
    if (words.length < 2) return [];

    const option = words[words.length - 2];
    const valueCompletions: Record<string, string[]> = {
      '--format': ['json', 'markdown', 'text', 'csv'],
      '--complexity': ['simple', 'medium', 'complex'],
      '--project-type': ['web-app', 'cli', 'library', 'mcp-server'],
      '--export': ['json', 'csv'],
      '--timeout': ['30', '60', '120', '300', '600'],
      '--parallel': ['1', '2', '3', '4', '5']
    };

    const completions = valueCompletions[option];
    if (!completions) return [];

    return completions.filter(value => value.startsWith(context.currentWord));
  }

  private inferCompletionType(completion: string, providerName: string): CompletionSuggestion['type'] {
    switch (providerName) {
      case 'commands':
        return 'command';
      case 'files':
        return completion.endsWith('/') ? 'directory' : 'file';
      case 'options':
        return 'option';
      default:
        return 'value';
    }
  }

  private deduplicateAndSort(suggestions: CompletionSuggestion[]): CompletionSuggestion[] {
    const seen = new Set<string>();
    const unique: CompletionSuggestion[] = [];

    for (const suggestion of suggestions) {
      if (!seen.has(suggestion.value)) {
        seen.add(suggestion.value);
        unique.push(suggestion);
      }
    }

    // Sort by priority (descending) then alphabetically
    return unique.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return a.value.localeCompare(b.value);
    });
  }

  /**
   * Get smart suggestions based on context
   */
  async getSmartSuggestions(line: string): Promise<CompletionSuggestion[]> {
    const context = this.parseContext(line, line.length);
    
    // If line is empty, suggest common commands
    if (!line.trim()) {
      return [
        { value: 'help', description: 'Show help information', type: 'command', priority: 100 },
        { value: 'invoke', description: 'Invoke a single agent', type: 'command', priority: 90 },
        { value: 'recipe', description: 'Execute a recipe', type: 'command', priority: 85 },
        { value: 'status', description: 'Show system status', type: 'command', priority: 80 },
        { value: 'session', description: 'Manage sessions', type: 'command', priority: 75 }
      ];
    }

    // Get completions from all providers
    const result = await this.getCompletions(line);
    return result.suggestions || [];
  }

  /**
   * Check if completion is available for a given context
   */
  hasCompletions(line: string, cursor?: number): boolean {
    const context = this.parseContext(line, cursor || line.length);
    return this.providers.some(provider => provider.canHandle(context));
  }

  /**
   * Get completion statistics
   */
  getStats(): {
    totalProviders: number;
    commandsRegistered: number;
    agentCommands: number;
    recipeNames: number;
    domainNames: number;
  } {
    return {
      totalProviders: this.providers.length,
      commandsRegistered: this.commandCompletions.size,
      agentCommands: this.agentCommands.length,
      recipeNames: this.recipeNames.length,
      domainNames: this.domainNames.length
    };
  }
}