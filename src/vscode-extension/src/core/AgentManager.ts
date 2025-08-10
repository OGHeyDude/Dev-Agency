/**
 * Agent Manager for VS Code Extension
 * Manages agent discovery, invocation, and execution tracking
 * 
 * @file AgentManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export interface AgentDefinition {
  name: string;
  description: string;
  capabilities: string[];
  requirements: string[];
  category?: string;
  icon?: string;
  contextLimits: {
    maxTokens?: number;
    maxFiles?: number;
  };
}

export interface AgentInvocationOptions {
  task?: string;
  contextPath?: string;
  outputPath?: string;
  format?: 'json' | 'markdown' | 'text';
  timeout?: number;
  variables?: Record<string, any>;
  background?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface AgentExecution {
  id: string;
  agentName: string;
  task: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  progress?: number;
  output?: string;
  error?: string;
  context?: {
    file?: string;
    selection?: vscode.Selection;
    workspace?: string;
  };
}

export interface AgentExecutionResult {
  success: boolean;
  output: string;
  suggestions?: CodeSuggestion[];
  actions?: AgentAction[];
  metadata: {
    executionTime: number;
    tokensUsed?: number;
    confidence?: number;
    agentVersion?: string;
  };
}

export interface CodeSuggestion {
  id: string;
  type: 'completion' | 'replacement' | 'insertion';
  code: string;
  description: string;
  confidence: number;
  range?: vscode.Range;
  language?: string;
}

export interface AgentAction {
  id: string;
  type: 'file-create' | 'file-modify' | 'file-delete' | 'command-execute';
  description: string;
  payload: any;
  requiresConfirmation: boolean;
}

export class AgentManager extends EventEmitter {
  private agents: Map<string, AgentDefinition> = new Map();
  private executions: Map<string, AgentExecution> = new Map();
  private activeProcesses: Map<string, ChildProcess> = new Map();
  private executionQueue: AgentExecution[] = [];
  private maxConcurrentExecutions: number;
  private isInitialized = false;

  constructor(
    private configManager: ConfigurationManager,
    private logger: ExtensionLogger
  ) {
    super();
    this.maxConcurrentExecutions = configManager.get('maxConcurrentAgents', 3);
  }

  /**
   * Initialize the agent manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.logger.info('Initializing AgentManager...');
      
      // Load available agents from Dev-Agency system
      await this.loadAgents();
      
      // Setup periodic cleanup
      this.setupCleanupInterval();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      this.logger.info(`AgentManager initialized with ${this.agents.size} agents`);
      
    } catch (error) {
      this.logger.error('Failed to initialize AgentManager:', error);
      throw error;
    }
  }

  /**
   * Load agents from Dev-Agency system
   */
  private async loadAgents(): Promise<void> {
    const agentPath = this.configManager.getAgentPath();
    const agentsDir = path.join(agentPath, 'Agents');
    
    if (!await fs.pathExists(agentsDir)) {
      throw new Error(`Agents directory not found: ${agentsDir}`);
    }

    const agentFiles = await fs.readdir(agentsDir);
    const markdownFiles = agentFiles.filter(file => file.endsWith('.md') && file !== 'README.md');
    
    this.agents.clear();
    
    for (const file of markdownFiles) {
      try {
        const agentName = path.basename(file, '.md');
        const definition = await this.parseAgentDefinition(path.join(agentsDir, file), agentName);
        
        this.agents.set(agentName, definition);
        this.logger.debug(`Loaded agent: ${agentName}`);
        
      } catch (error) {
        this.logger.warn(`Failed to load agent ${file}:`, error);
      }
    }
    
    this.emit('agents-loaded', Array.from(this.agents.values()));
  }

  /**
   * Parse agent definition from markdown file
   */
  private async parseAgentDefinition(filePath: string, agentName: string): Promise<AgentDefinition> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter if present
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let metadata: Record<string, any> = {};
    let body = content;
    
    if (frontmatterMatch) {
      const [, frontmatter, bodyContent] = frontmatterMatch;
      metadata = this.parseFrontmatter(frontmatter);
      body = bodyContent;
    }
    
    // Extract description from the first paragraph or h1
    let description = agentName;
    const descMatch = body.match(/^#{1,2}\s+(.+)$/m) || body.match(/^([^#\n]+)\n/);
    if (descMatch) {
      description = descMatch[1].trim();
    }
    
    // Extract capabilities
    const capabilities = this.extractListItems(body, ['## Capabilities', '## Core Capabilities', '## What I Do']);
    
    // Extract requirements  
    const requirements = this.extractListItems(body, ['## Requirements', '## Dependencies', '## Prerequisites']);
    
    return {
      name: agentName,
      description: metadata.description || description,
      capabilities: capabilities || [],
      requirements: requirements || [],
      category: metadata.category || 'general',
      icon: this.getAgentIcon(agentName, metadata.category),
      contextLimits: {
        maxTokens: metadata.max_tokens || 4000,
        maxFiles: metadata.max_files || 10
      }
    };
  }

  /**
   * Parse simple YAML-like frontmatter
   */
  private parseFrontmatter(frontmatter: string): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    frontmatter.split('\n').forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
    
    return metadata;
  }

  /**
   * Extract list items from markdown sections
   */
  private extractListItems(content: string, sectionHeaders: string[]): string[] {
    const items: string[] = [];
    
    for (const header of sectionHeaders) {
      const headerRegex = new RegExp(`${header}\\s*\\n([\\s\\S]*?)(?=\\n#{1,2}|$)`, 'i');
      const match = content.match(headerRegex);
      
      if (match) {
        const sectionContent = match[1];
        const listItems = sectionContent.match(/^[-*]\s+(.+)$/gm);
        
        if (listItems) {
          items.push(...listItems.map(item => item.replace(/^[-*]\s+/, '').trim()));
        }
      }
    }
    
    return items;
  }

  /**
   * Get appropriate icon for agent
   */
  private getAgentIcon(agentName: string, category?: string): string {
    const iconMap: Record<string, string> = {
      architect: 'symbol-structure',
      coder: 'code',
      tester: 'beaker',
      security: 'shield',
      documenter: 'book',
      performance: 'dashboard',
      integration: 'plug',
      'mcp-dev': 'extensions',
      hooks: 'git-branch',
      'memory-sync': 'sync'
    };
    
    return iconMap[agentName] || iconMap[category || ''] || 'robot';
  }

  /**
   * Get all available agents
   */
  async getAvailableAgents(): Promise<AgentDefinition[]> {
    await this.ensureInitialized();
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by name
   */
  async getAgent(name: string): Promise<AgentDefinition | undefined> {
    await this.ensureInitialized();
    return this.agents.get(name);
  }

  /**
   * Invoke an agent with specified options
   */
  async invokeAgent(agentName: string, options: AgentInvocationOptions): Promise<AgentExecutionResult> {
    await this.ensureInitialized();
    
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }
    
    // Create execution record
    const execution: AgentExecution = {
      id: this.generateExecutionId(),
      agentName,
      task: options.task || 'Agent invocation',
      status: 'queued',
      startTime: new Date(),
      context: this.getCurrentContext()
    };
    
    this.executions.set(execution.id, execution);
    
    // Add to queue or execute immediately
    if (this.activeProcesses.size >= this.maxConcurrentExecutions) {
      this.executionQueue.push(execution);
      this.logger.info(`Agent ${agentName} queued (${this.executionQueue.length} in queue)`);
    } else {
      return this.executeAgent(execution, options);
    }
    
    // For queued executions, return a pending result
    return {
      success: false,
      output: 'Agent execution queued',
      metadata: {
        executionTime: 0
      }
    };
  }

  /**
   * Execute an agent
   */
  private async executeAgent(execution: AgentExecution, options: AgentInvocationOptions): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
      execution.status = 'running';
      execution.progress = 0;
      this.executions.set(execution.id, execution);
      
      this.emit('execution-started', execution);
      this.logger.info(`Executing agent: ${execution.agentName}`);
      
      // Build CLI command
      const cliPath = this.configManager.getCliPath();
      const args = this.buildCliArgs(execution.agentName, options);
      
      // Execute agent via CLI
      const result = await this.executeCli(execution, cliPath, args);
      
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.progress = 100;
      execution.output = result.output;
      
      this.executions.set(execution.id, execution);
      this.emit('execution-completed', execution);
      
      // Process next in queue
      this.processQueue();
      
      const executionTime = Date.now() - startTime;
      this.logger.info(`Agent ${execution.agentName} completed in ${executionTime}ms`);
      
      return {
        success: true,
        output: result.output,
        suggestions: result.suggestions,
        actions: result.actions,
        metadata: {
          executionTime,
          tokensUsed: result.tokensUsed,
          confidence: result.confidence
        }
      };
      
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error instanceof Error ? error.message : String(error);
      
      this.executions.set(execution.id, execution);
      this.emit('execution-failed', execution);
      
      // Process next in queue
      this.processQueue();
      
      throw error;
    }
  }

  /**
   * Build CLI arguments for agent execution
   */
  private buildCliArgs(agentName: string, options: AgentInvocationOptions): string[] {
    const args = ['agent', agentName];
    
    if (options.task) {
      args.push('--task', options.task);
    }
    
    if (options.contextPath) {
      args.push('--context', options.contextPath);
    }
    
    if (options.outputPath) {
      args.push('--output', options.outputPath);
    }
    
    if (options.format) {
      args.push('--format', options.format);
    }
    
    if (options.timeout) {
      args.push('--timeout', options.timeout.toString());
    }
    
    if (options.variables) {
      args.push('--variables', JSON.stringify(options.variables));
    }
    
    return args;
  }

  /**
   * Execute CLI command
   */
  private async executeCli(execution: AgentExecution, cliPath: string, args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      
      const process = spawn('node', [cliPath, ...args], {
        cwd: this.configManager.getAgentPath(),
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      this.activeProcesses.set(execution.id, process);
      
      process.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        // Try to parse progress updates
        this.updateExecutionProgress(execution, chunk);
      });
      
      process.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        this.activeProcesses.delete(execution.id);
        
        if (code === 0) {
          try {
            const result = this.parseCliOutput(output);
            resolve(result);
          } catch (error) {
            // If parsing fails, return raw output
            resolve({
              output,
              suggestions: [],
              actions: []
            });
          }
        } else {
          reject(new Error(`Agent execution failed with code ${code}: ${errorOutput}`));
        }
      });
      
      process.on('error', (error) => {
        this.activeProcesses.delete(execution.id);
        reject(error);
      });
    });
  }

  /**
   * Update execution progress based on output
   */
  private updateExecutionProgress(execution: AgentExecution, output: string): void {
    // Look for progress indicators in output
    const progressMatch = output.match(/Progress: (\d+)%/);
    if (progressMatch) {
      execution.progress = parseInt(progressMatch[1]);
      this.executions.set(execution.id, execution);
      this.emit('execution-progress', execution);
    }
  }

  /**
   * Parse CLI output for structured data
   */
  private parseCliOutput(output: string): any {
    // Try to extract JSON from output
    const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (error) {
        // Fall through to default parsing
      }
    }
    
    // Extract code suggestions
    const suggestions: CodeSuggestion[] = [];
    const codeBlocks = output.match(/```(\w+)?\n([\s\S]*?)```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block, index) => {
        const match = block.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const [, language, code] = match;
          suggestions.push({
            id: `suggestion-${index}`,
            type: 'completion',
            code: code.trim(),
            description: `Code suggestion ${index + 1}`,
            confidence: 0.8,
            language: language || 'text'
          });
        }
      });
    }
    
    return {
      output,
      suggestions,
      actions: []
    };
  }

  /**
   * Process execution queue
   */
  private processQueue(): void {
    if (this.executionQueue.length > 0 && this.activeProcesses.size < this.maxConcurrentExecutions) {
      const nextExecution = this.executionQueue.shift();
      if (nextExecution) {
        // Need to reconstruct options - this is a limitation of the current design
        const options: AgentInvocationOptions = {
          task: nextExecution.task
        };
        this.executeAgent(nextExecution, options).catch(error => {
          this.logger.error(`Failed to execute queued agent ${nextExecution.agentName}:`, error);
        });
      }
    }
  }

  /**
   * Cancel agent execution
   */
  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    
    const process = this.activeProcesses.get(executionId);
    if (process) {
      process.kill('SIGTERM');
      this.activeProcesses.delete(executionId);
    }
    
    execution.status = 'cancelled';
    execution.endTime = new Date();
    this.executions.set(executionId, execution);
    
    this.emit('execution-cancelled', execution);
    this.logger.info(`Cancelled execution: ${executionId}`);
  }

  /**
   * Get execution status
   */
  getExecutionStatus(): {
    active: number;
    queued: number;
    total: number;
    recent: AgentExecution[];
  } {
    const recent = Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 10);
    
    return {
      active: this.activeProcesses.size,
      queued: this.executionQueue.length,
      total: this.executions.size,
      recent
    };
  }

  /**
   * Get current VS Code context
   */
  private getCurrentContext(): AgentExecution['context'] {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) return {};
    
    return {
      file: activeEditor.document.fileName,
      selection: activeEditor.selection,
      workspace: vscode.workspace.name || 'unknown'
    };
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup cleanup interval for old executions
   */
  private setupCleanupInterval(): void {
    setInterval(() => {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      
      for (const [id, execution] of this.executions.entries()) {
        if (execution.endTime && execution.endTime.getTime() < cutoff) {
          this.executions.delete(id);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Refresh agents from filesystem
   */
  async refreshAgents(): Promise<void> {
    this.logger.info('Refreshing agents...');
    await this.loadAgents();
    this.emit('agents-refreshed', Array.from(this.agents.values()));
  }

  /**
   * Ensure manager is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Shutdown the agent manager
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down AgentManager...');
    
    // Cancel all active executions
    for (const [id, process] of this.activeProcesses.entries()) {
      process.kill('SIGTERM');
    }
    
    this.activeProcesses.clear();
    this.executionQueue.length = 0;
    
    this.emit('shutdown');
    this.logger.info('AgentManager shutdown complete');
  }
}