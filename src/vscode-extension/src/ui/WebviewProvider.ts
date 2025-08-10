/**
 * Webview Provider for VS Code Extension
 * Manages custom webview panels for debug visualization and agent interactions
 * 
 * @file WebviewProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { AgentManager } from '../core/AgentManager';
import { DebugProvider } from '../debug/DebugProvider';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export class WebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'dev-agency.debug';

  private _view?: vscode.WebviewView;

  constructor(
    private context: vscode.ExtensionContext,
    private agentManager: AgentManager,
    private debugProvider: DebugProvider,
    private logger: ExtensionLogger
  ) {}

  /**
   * Resolve webview view
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this.context.extensionUri
      ]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      message => {
        this.handleWebviewMessage(message);
      },
      undefined,
      this.context.subscriptions
    );

    // Update webview when debug state changes
    this.setupDebugEventHandlers();

    this.logger.debug('WebviewProvider resolved');
  }

  /**
   * Setup debug event handlers
   */
  private setupDebugEventHandlers(): void {
    // Listen for debug events and update webview
    this.agentManager.on('execution-started', (execution) => {
      this.postMessage({
        command: 'execution-started',
        execution
      });
    });

    this.agentManager.on('execution-completed', (execution) => {
      this.postMessage({
        command: 'execution-completed',
        execution
      });
    });

    this.agentManager.on('execution-progress', (execution) => {
      this.postMessage({
        command: 'execution-progress',
        execution
      });
    });
  }

  /**
   * Handle messages from webview
   */
  private async handleWebviewMessage(message: any): Promise<void> {
    try {
      switch (message.command) {
        case 'get-debug-status':
          await this.sendDebugStatus();
          break;

        case 'get-executions':
          await this.sendExecutions();
          break;

        case 'invoke-agent':
          await this.handleAgentInvocation(message.agentName, message.task);
          break;

        case 'cancel-execution':
          await this.handleCancelExecution(message.executionId);
          break;

        case 'show-trace-details':
          await this.handleShowTraceDetails(message.traceId);
          break;

        case 'open-debug-visualizer':
          await this.debugProvider.openDebugger();
          break;

        case 'refresh-data':
          await this.refreshWebviewData();
          break;

        default:
          this.logger.warn(`Unknown webview message command: ${message.command}`);
      }
    } catch (error) {
      this.logger.error('Failed to handle webview message:', error);
    }
  }

  /**
   * Send debug status to webview
   */
  private async sendDebugStatus(): Promise<void> {
    const debugStats = this.debugProvider.getDebugStats();
    const agentStatus = this.agentManager.getExecutionStatus();

    this.postMessage({
      command: 'debug-status',
      data: {
        debug: debugStats,
        agents: agentStatus
      }
    });
  }

  /**
   * Send executions to webview
   */
  private async sendExecutions(): Promise<void> {
    const status = this.agentManager.getExecutionStatus();

    this.postMessage({
      command: 'executions-data',
      data: {
        active: status.active,
        queued: status.queued,
        recent: status.recent
      }
    });
  }

  /**
   * Handle agent invocation from webview
   */
  private async handleAgentInvocation(agentName: string, task: string): Promise<void> {
    try {
      const result = await this.agentManager.invokeAgent(agentName, { task });
      
      this.postMessage({
        command: 'agent-invocation-result',
        data: {
          agentName,
          task,
          result
        }
      });
    } catch (error) {
      this.postMessage({
        command: 'agent-invocation-error',
        data: {
          agentName,
          task,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * Handle execution cancellation from webview
   */
  private async handleCancelExecution(executionId: string): Promise<void> {
    try {
      await this.agentManager.cancelExecution(executionId);
      
      this.postMessage({
        command: 'execution-cancelled',
        data: { executionId }
      });
    } catch (error) {
      this.postMessage({
        command: 'execution-cancel-error',
        data: {
          executionId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  /**
   * Handle showing trace details
   */
  private async handleShowTraceDetails(traceId: string): Promise<void> {
    try {
      await this.debugProvider.showTraces();
    } catch (error) {
      this.logger.error('Failed to show trace details:', error);
    }
  }

  /**
   * Refresh webview data
   */
  private async refreshWebviewData(): Promise<void> {
    await this.sendDebugStatus();
    await this.sendExecutions();
  }

  /**
   * Post message to webview
   */
  private postMessage(message: any): void {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  /**
   * Get HTML content for webview
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'webview', 'main.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'webview', 'main.css')
    );

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src ${webview.cspSource};">
        <link href="${styleUri}" rel="stylesheet">
        <title>Dev-Agency</title>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 Dev-Agency</h1>
                <button id="refresh-btn" class="btn btn-secondary">
                    <span class="icon">🔄</span> Refresh
                </button>
            </div>

            <div class="section">
                <h2>📊 Status</h2>
                <div id="status-container">
                    <div class="status-item">
                        <span class="label">Active:</span>
                        <span id="active-count">-</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Queued:</span>
                        <span id="queued-count">-</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Debug:</span>
                        <span id="debug-status">-</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🚀 Quick Actions</h2>
                <div class="actions-container">
                    <button id="invoke-agent-btn" class="btn btn-primary">
                        <span class="icon">🤖</span> Invoke Agent
                    </button>
                    <button id="open-debugger-btn" class="btn btn-secondary">
                        <span class="icon">🐛</span> Open Debugger
                    </button>
                    <button id="show-traces-btn" class="btn btn-secondary">
                        <span class="icon">📈</span> Show Traces
                    </button>
                </div>
            </div>

            <div class="section">
                <h2>⚡ Recent Executions</h2>
                <div id="executions-container">
                    <div class="loading">Loading executions...</div>
                </div>
            </div>

            <div class="section">
                <h2>🔧 Debug Information</h2>
                <div id="debug-info-container">
                    <div class="loading">Loading debug info...</div>
                </div>
            </div>
        </div>

        <script src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  /**
   * Update webview when visible
   */
  public async updateWebview(): Promise<void> {
    if (this._view?.visible) {
      await this.refreshWebviewData();
    }
  }

  /**
   * Show webview
   */
  public show(): void {
    if (this._view) {
      this._view.show(true);
    }
  }

  /**
   * Reveal webview with specific data
   */
  public revealWithData(data: any): void {
    if (this._view) {
      this._view.show(true);
      this.postMessage({
        command: 'reveal-data',
        data
      });
    }
  }
}