/**
 * Dev-Agency VS Code Extension
 * Main extension entry point and activation logic
 * 
 * @file extension.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { AgentManager } from './core/AgentManager';
import { StatusBarProvider } from './ui/StatusBarProvider';
import { CommandProvider } from './commands/CommandProvider';
import { IntelliSenseProvider } from './intellisense/IntelliSenseProvider';
import { DebugProvider } from './debug/DebugProvider';
import { ConfigurationManager } from './config/ConfigurationManager';
import { ExtensionLogger } from './utils/ExtensionLogger';
import { ErrorHandler } from './utils/ErrorHandler';
import { ContextManager } from './context/ContextManager';
import { AgentTreeProvider } from './ui/AgentTreeProvider';
import { ExecutionTreeProvider } from './ui/ExecutionTreeProvider';
import { WebviewProvider } from './ui/WebviewProvider';
import { OutputChannelProvider } from './ui/OutputChannelProvider';

/**
 * Extension context and global state
 */
interface ExtensionState {
  agentManager: AgentManager;
  statusBarProvider: StatusBarProvider;
  commandProvider: CommandProvider;
  intelliSenseProvider: IntelliSenseProvider;
  debugProvider: DebugProvider;
  configManager: ConfigurationManager;
  logger: ExtensionLogger;
  errorHandler: ErrorHandler;
  contextManager: ContextManager;
  outputChannel: OutputChannelProvider;
  isActivated: boolean;
}

let extensionState: ExtensionState | undefined;

/**
 * Extension activation function
 * Called when VS Code activates the extension
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log('Dev-Agency extension is being activated...');
  
  try {
    // Initialize core components
    const logger = new ExtensionLogger(context);
    const errorHandler = new ErrorHandler(logger);
    const configManager = new ConfigurationManager(context);
    
    logger.info('Initializing Dev-Agency extension...');
    
    // Set up global error handling
    setupGlobalErrorHandling(errorHandler);
    
    // Initialize managers and providers
    const agentManager = new AgentManager(configManager, logger);
    const contextManager = new ContextManager(configManager, logger);
    const outputChannel = new OutputChannelProvider(logger);
    
    // UI Providers
    const statusBarProvider = new StatusBarProvider(context, configManager, logger);
    const intelliSenseProvider = new IntelliSenseProvider(agentManager, contextManager, logger);
    const debugProvider = new DebugProvider(configManager, logger);
    
    // Command system
    const commandProvider = new CommandProvider(
      context,
      agentManager,
      statusBarProvider,
      debugProvider,
      contextManager,
      outputChannel,
      logger
    );
    
    // Store global state
    extensionState = {
      agentManager,
      statusBarProvider,
      commandProvider,
      intelliSenseProvider,
      debugProvider,
      configManager,
      logger,
      errorHandler,
      contextManager,
      outputChannel,
      isActivated: false
    };
    
    // Initialize all components
    await initializeExtension(context, extensionState);
    
    // Register all VS Code integrations
    registerVSCodeIntegrations(context, extensionState);
    
    // Set context variables
    await vscode.commands.executeCommand('setContext', 'dev-agency.enabled', true);
    
    extensionState.isActivated = true;
    logger.info('Dev-Agency extension activated successfully');
    
    // Show welcome message on first activation
    await showWelcomeMessage(context, configManager);
    
  } catch (error) {
    console.error('Failed to activate Dev-Agency extension:', error);
    vscode.window.showErrorMessage(
      `Failed to activate Dev-Agency extension: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Extension deactivation function
 * Called when VS Code deactivates the extension
 */
export async function deactivate(): Promise<void> {
  if (!extensionState) return;
  
  try {
    extensionState.logger.info('Deactivating Dev-Agency extension...');
    
    // Cleanup all components
    await extensionState.agentManager.shutdown();
    await extensionState.debugProvider.shutdown();
    extensionState.statusBarProvider.dispose();
    extensionState.outputChannel.dispose();
    
    await vscode.commands.executeCommand('setContext', 'dev-agency.enabled', false);
    
    extensionState.logger.info('Dev-Agency extension deactivated');
    
  } catch (error) {
    console.error('Error during extension deactivation:', error);
  } finally {
    extensionState = undefined;
  }
}

/**
 * Initialize all extension components
 */
async function initializeExtension(
  context: vscode.ExtensionContext,
  state: ExtensionState
): Promise<void> {
  
  // Initialize agent manager (loads agents from Dev-Agency)
  await state.agentManager.initialize();
  
  // Initialize debug provider (connect with AGENT-023)
  await state.debugProvider.initialize();
  
  // Initialize status bar
  state.statusBarProvider.initialize();
  
  // Setup context monitoring for workspace changes
  await state.contextManager.initialize();
  
  // Initialize output channel
  state.outputChannel.initialize();
}

/**
 * Register all VS Code integrations and providers
 */
function registerVSCodeIntegrations(
  context: vscode.ExtensionContext,
  state: ExtensionState
): void {
  
  // Register commands
  state.commandProvider.registerCommands();
  
  // Register IntelliSense providers
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      ['typescript', 'javascript', 'python', 'markdown'],
      state.intelliSenseProvider,
      '/', '@', '#'
    ),
    vscode.languages.registerHoverProvider(
      ['typescript', 'javascript', 'python', 'markdown'],
      state.intelliSenseProvider
    ),
    vscode.languages.registerCodeActionProvider(
      ['typescript', 'javascript', 'python', 'markdown'],
      state.intelliSenseProvider
    )
  );
  
  // Register tree data providers for sidebar
  const agentTreeProvider = new AgentTreeProvider(state.agentManager, state.logger);
  const executionTreeProvider = new ExecutionTreeProvider(state.agentManager, state.logger);
  
  context.subscriptions.push(
    vscode.window.createTreeView('dev-agency.agents', {
      treeDataProvider: agentTreeProvider,
      canSelectMany: false
    }),
    vscode.window.createTreeView('dev-agency.executions', {
      treeDataProvider: executionTreeProvider,
      canSelectMany: false
    })
  );
  
  // Register webview providers for custom panels
  const webviewProvider = new WebviewProvider(
    context,
    state.agentManager,
    state.debugProvider,
    state.logger
  );
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'dev-agency.debug',
      webviewProvider
    )
  );
  
  // Register debug configurations
  context.subscriptions.push(
    vscode.debug.registerDebugConfigurationProvider(
      'dev-agency',
      state.debugProvider
    )
  );
  
  // Register task provider
  context.subscriptions.push(
    vscode.tasks.registerTaskProvider('dev-agency', {
      provideTasks: () => {
        return state.agentManager.getAvailableAgents().then(agents => {
          return agents.map(agent => {
            const definition: vscode.TaskDefinition = {
              type: 'dev-agency',
              agent: agent.name
            };
            
            const execution = new vscode.ShellExecution(
              state.configManager.getCliPath(),
              ['agent', agent.name]
            );
            
            return new vscode.Task(
              definition,
              vscode.TaskScope.Workspace,
              `Run ${agent.name}`,
              'dev-agency',
              execution,
              ['dev-agency']
            );
          });
        });
      },
      resolveTask: () => undefined
    })
  );
  
  // Register configuration change handler
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration('dev-agency')) {
        state.configManager.reload();
        state.logger.info('Configuration reloaded');
      }
    })
  );
  
  // Register file system watchers for context awareness
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      state.contextManager.onDocumentChanged(event);
    }),
    vscode.workspace.onDidSaveTextDocument(document => {
      state.contextManager.onDocumentSaved(document);
    }),
    vscode.window.onDidChangeActiveTextEditor(editor => {
      state.contextManager.onActiveEditorChanged(editor);
    })
  );
  
  // Register debug session events
  context.subscriptions.push(
    vscode.debug.onDidStartDebugSession(session => {
      if (session.type === 'dev-agency') {
        state.debugProvider.onDebugSessionStarted(session);
      }
    }),
    vscode.debug.onDidTerminateDebugSession(session => {
      if (session.type === 'dev-agency') {
        state.debugProvider.onDebugSessionEnded(session);
      }
    })
  );
}

/**
 * Setup global error handling
 */
function setupGlobalErrorHandling(errorHandler: ErrorHandler): void {
  process.on('unhandledRejection', (reason, promise) => {
    errorHandler.handleError(
      new Error(`Unhandled promise rejection: ${reason}`),
      'global-unhandled-rejection'
    );
  });
  
  process.on('uncaughtException', (error) => {
    errorHandler.handleError(error, 'global-uncaught-exception');
  });
}

/**
 * Show welcome message on first activation
 */
async function showWelcomeMessage(
  context: vscode.ExtensionContext,
  configManager: ConfigurationManager
): Promise<void> {
  const hasShownWelcome = context.globalState.get('dev-agency.hasShownWelcome', false);
  
  if (!hasShownWelcome) {
    const selection = await vscode.window.showInformationMessage(
      'Welcome to Dev-Agency! Would you like to see the getting started guide?',
      'Show Guide',
      'Configure Settings',
      'Not Now'
    );
    
    switch (selection) {
      case 'Show Guide':
        await vscode.commands.executeCommand('dev-agency.showGettingStarted');
        break;
      case 'Configure Settings':
        await vscode.commands.executeCommand('workbench.action.openSettings', 'dev-agency');
        break;
    }
    
    await context.globalState.update('dev-agency.hasShownWelcome', true);
  }
}

/**
 * Get current extension state (for testing and debugging)
 */
export function getExtensionState(): ExtensionState | undefined {
  return extensionState;
}

/**
 * Extension API for other extensions to integrate with Dev-Agency
 */
export interface DevAgencyAPI {
  invokeAgent(agentName: string, task: string, context?: string): Promise<any>;
  getAvailableAgents(): Promise<any[]>;
  getAgentStatus(): Promise<any>;
  subscribeToEvents(callback: (event: any) => void): vscode.Disposable;
}

/**
 * Export API for other extensions
 */
export function getAPI(): DevAgencyAPI | undefined {
  if (!extensionState || !extensionState.isActivated) {
    return undefined;
  }
  
  return {
    async invokeAgent(agentName: string, task: string, context?: string) {
      return extensionState!.agentManager.invokeAgent(agentName, {
        task,
        contextPath: context
      });
    },
    
    async getAvailableAgents() {
      return extensionState!.agentManager.getAvailableAgents();
    },
    
    async getAgentStatus() {
      return extensionState!.agentManager.getExecutionStatus();
    },
    
    subscribeToEvents(callback: (event: any) => void) {
      // Implementation would depend on event system
      return new vscode.Disposable(() => {
        // Cleanup subscription
      });
    }
  };
}