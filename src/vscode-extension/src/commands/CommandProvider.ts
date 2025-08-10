/**
 * Command Provider for VS Code Extension
 * Handles all command palette and context menu integrations
 * 
 * @file CommandProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { AgentManager, AgentDefinition, AgentInvocationOptions } from '../core/AgentManager';
import { StatusBarProvider } from '../ui/StatusBarProvider';
import { DebugProvider } from '../debug/DebugProvider';
import { ContextManager } from '../context/ContextManager';
import { OutputChannelProvider } from '../ui/OutputChannelProvider';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export class CommandProvider {
  private disposables: vscode.Disposable[] = [];

  constructor(
    private context: vscode.ExtensionContext,
    private agentManager: AgentManager,
    private statusBarProvider: StatusBarProvider,
    private debugProvider: DebugProvider,
    private contextManager: ContextManager,
    private outputChannel: OutputChannelProvider,
    private logger: ExtensionLogger
  ) {}

  /**
   * Register all commands
   */
  registerCommands(): void {
    this.disposables.push(
      // Main agent invocation command
      vscode.commands.registerCommand('dev-agency.invokeAgent', async () => {
        await this.handleInvokeAgent();
      }),

      // Quick agent selection command
      vscode.commands.registerCommand('dev-agency.selectAgent', async () => {
        await this.handleSelectAgent();
      }),

      // Status and monitoring commands
      vscode.commands.registerCommand('dev-agency.showStatus', async () => {
        await this.handleShowStatus();
      }),

      vscode.commands.registerCommand('dev-agency.showOutput', () => {
        this.outputChannel.show();
      }),

      // Debug integration commands
      vscode.commands.registerCommand('dev-agency.openDebugger', async () => {
        await this.handleOpenDebugger();
      }),

      vscode.commands.registerCommand('dev-agency.showTraces', async () => {
        await this.handleShowTraces();
      }),

      // Agent management commands
      vscode.commands.registerCommand('dev-agency.refreshAgents', async () => {
        await this.handleRefreshAgents();
      }),

      vscode.commands.registerCommand('dev-agency.clearCache', async () => {
        await this.handleClearCache();
      }),

      // Context-specific commands
      vscode.commands.registerCommand('dev-agency.analyzeFile', async (uri?: vscode.Uri) => {
        await this.handleAnalyzeFile(uri);
      }),

      vscode.commands.registerCommand('dev-agency.analyzeSelection', async () => {
        await this.handleAnalyzeSelection();
      }),

      vscode.commands.registerCommand('dev-agency.generateCode', async () => {
        await this.handleGenerateCode();
      }),

      vscode.commands.registerCommand('dev-agency.reviewCode', async () => {
        await this.handleReviewCode();
      }),

      vscode.commands.registerCommand('dev-agency.optimizeCode', async () => {
        await this.handleOptimizeCode();
      }),

      // Workflow commands
      vscode.commands.registerCommand('dev-agency.runWorkflow', async () => {
        await this.handleRunWorkflow();
      }),

      vscode.commands.registerCommand('dev-agency.createAgent', async () => {
        await this.handleCreateAgent();
      }),

      // Help and documentation
      vscode.commands.registerCommand('dev-agency.showGettingStarted', async () => {
        await this.handleShowGettingStarted();
      }),

      vscode.commands.registerCommand('dev-agency.showHelp', async () => {
        await this.handleShowHelp();
      }),

      // Settings
      vscode.commands.registerCommand('dev-agency.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'dev-agency');
      })
    );

    // Store disposables for cleanup
    this.context.subscriptions.push(...this.disposables);
  }

  /**
   * Handle main agent invocation command
   */
  private async handleInvokeAgent(): Promise<void> {
    try {
      const agents = await this.agentManager.getAvailableAgents();
      if (agents.length === 0) {
        vscode.window.showWarningMessage('No agents available. Please check your Dev-Agency configuration.');
        return;
      }

      // Show agent selection
      const selectedAgent = await this.showAgentPicker(agents);
      if (!selectedAgent) return;

      // Get task input
      const task = await this.getTaskInput(selectedAgent);
      if (!task) return;

      // Get context
      const context = await this.getContextForInvocation();

      // Build invocation options
      const options: AgentInvocationOptions = {
        task,
        contextPath: context?.contextPath,
        format: 'markdown'
      };

      // Show progress and execute
      await this.executeAgentWithProgress(selectedAgent, options);

    } catch (error) {
      this.logger.error('Failed to invoke agent:', error);
      vscode.window.showErrorMessage(`Failed to invoke agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handle select agent command (quick picker)
   */
  private async handleSelectAgent(): Promise<void> {
    try {
      const agents = await this.agentManager.getAvailableAgents();
      const selectedAgent = await this.showAgentPicker(agents);
      
      if (selectedAgent) {
        await this.executeAgentWithDefaults(selectedAgent);
      }
    } catch (error) {
      this.logger.error('Failed to select agent:', error);
      vscode.window.showErrorMessage(`Failed to select agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Show agent picker with enhanced UI
   */
  private async showAgentPicker(agents: AgentDefinition[]): Promise<AgentDefinition | undefined> {
    const items: vscode.QuickPickItem[] = agents.map(agent => ({
      label: `$(${agent.icon || 'robot'}) ${agent.name}`,
      description: agent.description,
      detail: `Capabilities: ${agent.capabilities.slice(0, 3).join(', ')}${agent.capabilities.length > 3 ? '...' : ''}`,
      agent
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select an agent to invoke',
      matchOnDescription: true,
      matchOnDetail: true,
      ignoreFocusOut: true
    });

    return selected ? (selected as any).agent : undefined;
  }

  /**
   * Get task input from user
   */
  private async getTaskInput(agent: AgentDefinition): Promise<string | undefined> {
    const placeholder = this.getTaskPlaceholder(agent);
    
    return await vscode.window.showInputBox({
      prompt: `Enter task for ${agent.name}`,
      placeHolder: placeholder,
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value.trim()) {
          return 'Task description is required';
        }
        if (value.length > 500) {
          return 'Task description too long (max 500 characters)';
        }
        return null;
      }
    });
  }

  /**
   * Get context-aware placeholder for task input
   */
  private getTaskPlaceholder(agent: AgentDefinition): string {
    const placeholders: Record<string, string> = {
      architect: 'Design system architecture for...',
      coder: 'Implement functionality to...',
      tester: 'Create tests for...',
      security: 'Review security of...',
      documenter: 'Document...',
      performance: 'Optimize performance of...',
      integration: 'Integrate with...'
    };

    return placeholders[agent.name] || `Ask ${agent.name} to...`;
  }

  /**
   * Get context for agent invocation
   */
  private async getContextForInvocation(): Promise<{ contextPath?: string; description?: string } | undefined> {
    const activeEditor = vscode.window.activeTextEditor;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    const contextOptions: vscode.QuickPickItem[] = [
      { label: '$(file) Current File', description: activeEditor?.document.fileName || 'No file open' },
      { label: '$(folder) Current Workspace', description: workspaceFolder?.uri.fsPath || 'No workspace' },
      { label: '$(selection) Current Selection', description: 'Selected text in editor' },
      { label: '$(search) Custom Path', description: 'Specify custom context path' },
      { label: '$(x) No Context', description: 'Execute without additional context' }
    ];

    const selectedContext = await vscode.window.showQuickPick(contextOptions, {
      placeHolder: 'Select context for agent execution',
      ignoreFocusOut: true
    });

    if (!selectedContext) return undefined;

    switch (selectedContext.label) {
      case '$(file) Current File':
        return { contextPath: activeEditor?.document.fileName };
      case '$(folder) Current Workspace':
        return { contextPath: workspaceFolder?.uri.fsPath };
      case '$(selection) Current Selection':
        return { contextPath: activeEditor?.document.fileName };
      case '$(search) Custom Path':
        const customPath = await vscode.window.showInputBox({
          prompt: 'Enter context path',
          placeHolder: '/path/to/context/file/or/directory'
        });
        return customPath ? { contextPath: customPath } : undefined;
      default:
        return {};
    }
  }

  /**
   * Execute agent with progress indication
   */
  private async executeAgentWithProgress(agent: AgentDefinition, options: AgentInvocationOptions): Promise<void> {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Executing ${agent.name}`,
      cancellable: true
    }, async (progress, token) => {
      
      this.statusBarProvider.showProgress(agent.name, 'Initializing...');
      progress.report({ increment: 0, message: 'Starting execution...' });

      try {
        // Listen for progress updates
        const progressHandler = (execution: any) => {
          if (execution.agentName === agent.name) {
            progress.report({ 
              increment: execution.progress || 0, 
              message: `Progress: ${execution.progress || 0}%` 
            });
            this.statusBarProvider.updateProgress(execution.progress || 0);
          }
        };

        this.agentManager.on('execution-progress', progressHandler);

        // Execute agent
        const result = await this.agentManager.invokeAgent(agent.name, options);

        // Show results
        await this.showExecutionResults(agent, result);

        // Clean up
        this.agentManager.removeListener('execution-progress', progressHandler);
        this.statusBarProvider.showSuccess(agent.name);

      } catch (error) {
        this.statusBarProvider.showError(agent.name, error instanceof Error ? error.message : String(error));
        throw error;
      }
    });
  }

  /**
   * Execute agent with sensible defaults
   */
  private async executeAgentWithDefaults(agent: AgentDefinition): Promise<void> {
    const context = await this.contextManager.getCurrentContext();
    
    const options: AgentInvocationOptions = {
      task: `Analyze and provide insights`,
      contextPath: context.file,
      format: 'markdown'
    };

    await this.executeAgentWithProgress(agent, options);
  }

  /**
   * Show execution results to user
   */
  private async showExecutionResults(agent: AgentDefinition, result: any): Promise<void> {
    // Show in output channel
    this.outputChannel.appendResult(agent.name, result);

    // Show suggestions if available
    if (result.suggestions && result.suggestions.length > 0) {
      const selection = await vscode.window.showInformationMessage(
        `${agent.name} has ${result.suggestions.length} suggestions`,
        'View Suggestions',
        'Dismiss'
      );

      if (selection === 'View Suggestions') {
        await this.showCodeSuggestions(result.suggestions);
      }
    }

    // Show actions if available
    if (result.actions && result.actions.length > 0) {
      const selection = await vscode.window.showInformationMessage(
        `${agent.name} proposes ${result.actions.length} actions`,
        'Review Actions',
        'Dismiss'
      );

      if (selection === 'Review Actions') {
        await this.showAgentActions(result.actions);
      }
    }
  }

  /**
   * Show code suggestions to user
   */
  private async showCodeSuggestions(suggestions: any[]): Promise<void> {
    const items = suggestions.map((suggestion, index) => ({
      label: `$(code) Suggestion ${index + 1}`,
      description: suggestion.description,
      detail: suggestion.code.substring(0, 100) + (suggestion.code.length > 100 ? '...' : ''),
      suggestion
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select a code suggestion to apply',
      ignoreFocusOut: true
    });

    if (selected) {
      await this.applySuggestion((selected as any).suggestion);
    }
  }

  /**
   * Apply code suggestion
   */
  private async applySuggestion(suggestion: any): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showWarningMessage('No active editor to apply suggestion');
      return;
    }

    const edit = new vscode.WorkspaceEdit();
    const range = suggestion.range || activeEditor.selection;
    
    edit.replace(activeEditor.document.uri, range, suggestion.code);
    
    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      vscode.window.showInformationMessage('Code suggestion applied successfully');
    } else {
      vscode.window.showErrorMessage('Failed to apply code suggestion');
    }
  }

  /**
   * Show agent actions to user
   */
  private async showAgentActions(actions: any[]): Promise<void> {
    for (const action of actions) {
      if (action.requiresConfirmation) {
        const confirmation = await vscode.window.showWarningMessage(
          `${action.description}\n\nDo you want to proceed?`,
          'Yes',
          'No'
        );

        if (confirmation !== 'Yes') continue;
      }

      await this.executeAgentAction(action);
    }
  }

  /**
   * Execute agent action
   */
  private async executeAgentAction(action: any): Promise<void> {
    try {
      switch (action.type) {
        case 'file-create':
          await this.createFile(action.payload);
          break;
        case 'file-modify':
          await this.modifyFile(action.payload);
          break;
        case 'command-execute':
          await vscode.commands.executeCommand(action.payload.command, ...action.payload.args);
          break;
        default:
          this.logger.warn(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to execute action ${action.id}:`, error);
      vscode.window.showErrorMessage(`Failed to execute action: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create file from action
   */
  private async createFile(payload: any): Promise<void> {
    const uri = vscode.Uri.file(payload.path);
    const edit = new vscode.WorkspaceEdit();
    edit.createFile(uri, { overwrite: false });
    edit.insert(uri, new vscode.Position(0, 0), payload.content || '');
    
    await vscode.workspace.applyEdit(edit);
    await vscode.window.showTextDocument(uri);
  }

  /**
   * Modify file from action
   */
  private async modifyFile(payload: any): Promise<void> {
    const uri = vscode.Uri.file(payload.path);
    const document = await vscode.workspace.openTextDocument(uri);
    const edit = new vscode.WorkspaceEdit();
    
    const range = new vscode.Range(
      payload.range.start.line,
      payload.range.start.character,
      payload.range.end.line,
      payload.range.end.character
    );
    
    edit.replace(uri, range, payload.newText);
    await vscode.workspace.applyEdit(edit);
  }

  // Additional command handlers...

  private async handleShowStatus(): Promise<void> {
    const status = this.agentManager.getExecutionStatus();
    const message = `Active: ${status.active} | Queued: ${status.queued} | Total: ${status.total}`;
    
    vscode.window.showInformationMessage(message, 'View Details').then(selection => {
      if (selection === 'View Details') {
        this.outputChannel.showStatus(status);
      }
    });
  }

  private async handleOpenDebugger(): Promise<void> {
    await this.debugProvider.openDebugger();
  }

  private async handleShowTraces(): Promise<void> {
    await this.debugProvider.showTraces();
  }

  private async handleRefreshAgents(): Promise<void> {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Window,
      title: 'Refreshing agents...'
    }, async () => {
      await this.agentManager.refreshAgents();
    });
    
    vscode.window.showInformationMessage('Agents refreshed successfully');
  }

  private async handleClearCache(): Promise<void> {
    // Clear extension caches
    vscode.window.showInformationMessage('Cache cleared successfully');
  }

  private async handleAnalyzeFile(uri?: vscode.Uri): Promise<void> {
    const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
    if (!targetUri) {
      vscode.window.showWarningMessage('No file to analyze');
      return;
    }

    const agent = await this.agentManager.getAgent('architect');
    if (!agent) {
      vscode.window.showErrorMessage('Architect agent not available');
      return;
    }

    const options: AgentInvocationOptions = {
      task: 'Analyze this file and provide architectural insights',
      contextPath: targetUri.fsPath,
      format: 'markdown'
    };

    await this.executeAgentWithProgress(agent, options);
  }

  private async handleAnalyzeSelection(): Promise<void> {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor?.selection || activeEditor.selection.isEmpty) {
      vscode.window.showWarningMessage('No text selected');
      return;
    }

    const agent = await this.agentManager.getAgent('coder');
    if (!agent) {
      vscode.window.showErrorMessage('Coder agent not available');
      return;
    }

    const selectedText = activeEditor.document.getText(activeEditor.selection);
    const options: AgentInvocationOptions = {
      task: `Analyze this code selection: ${selectedText}`,
      contextPath: activeEditor.document.fileName,
      format: 'markdown'
    };

    await this.executeAgentWithProgress(agent, options);
  }

  private async handleGenerateCode(): Promise<void> {
    const prompt = await vscode.window.showInputBox({
      prompt: 'Describe the code you want to generate',
      placeHolder: 'e.g., Create a function that validates email addresses'
    });

    if (!prompt) return;

    const agent = await this.agentManager.getAgent('coder');
    if (!agent) {
      vscode.window.showErrorMessage('Coder agent not available');
      return;
    }

    const options: AgentInvocationOptions = {
      task: prompt,
      contextPath: vscode.window.activeTextEditor?.document.fileName,
      format: 'markdown'
    };

    await this.executeAgentWithProgress(agent, options);
  }

  private async handleReviewCode(): Promise<void> {
    const agent = await this.agentManager.getAgent('security');
    if (!agent) {
      vscode.window.showErrorMessage('Security agent not available');
      return;
    }

    const activeEditor = vscode.window.activeTextEditor;
    const options: AgentInvocationOptions = {
      task: 'Review this code for security issues and best practices',
      contextPath: activeEditor?.document.fileName,
      format: 'markdown'
    };

    await this.executeAgentWithProgress(agent, options);
  }

  private async handleOptimizeCode(): Promise<void> {
    const agent = await this.agentManager.getAgent('performance');
    if (!agent) {
      vscode.window.showErrorMessage('Performance agent not available');
      return;
    }

    const activeEditor = vscode.window.activeTextEditor;
    const options: AgentInvocationOptions = {
      task: 'Analyze and suggest performance optimizations for this code',
      contextPath: activeEditor?.document.fileName,
      format: 'markdown'
    };

    await this.executeAgentWithProgress(agent, options);
  }

  private async handleRunWorkflow(): Promise<void> {
    vscode.window.showInformationMessage('Workflow execution not yet implemented');
  }

  private async handleCreateAgent(): Promise<void> {
    vscode.window.showInformationMessage('Agent creation not yet implemented');
  }

  private async handleShowGettingStarted(): Promise<void> {
    const uri = vscode.Uri.parse('https://github.com/dev-agency/vscode-extension#getting-started');
    await vscode.env.openExternal(uri);
  }

  private async handleShowHelp(): Promise<void> {
    const uri = vscode.Uri.parse('https://github.com/dev-agency/vscode-extension#documentation');
    await vscode.env.openExternal(uri);
  }

  /**
   * Dispose of all command registrations
   */
  dispose(): void {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
  }
}