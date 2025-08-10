/**
 * Debug Provider for VS Code Extension
 * Integrates with AGENT-023 DebugVisualizer for debugging agent executions
 * 
 * @file DebugProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { DebugVisualizer, createDebugVisualizer } from '../../../debug/DebugVisualizer';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export interface DebugSession {
  id: string;
  agentName: string;
  status: 'active' | 'paused' | 'terminated';
  breakpoints: AgentBreakpoint[];
  traces: ExecutionTrace[];
  startTime: Date;
}

export interface AgentBreakpoint {
  id: string;
  agentName: string;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
  enabled: boolean;
  hitCount: number;
}

export interface ExecutionTrace {
  id: string;
  agentName: string;
  step: number;
  timestamp: Date;
  context: any;
  variables: Record<string, any>;
  performance: {
    memory: number;
    cpu: number;
    duration: number;
  };
}

export class DebugProvider implements vscode.DebugConfigurationProvider {
  private debugVisualizer?: DebugVisualizer;
  private activeSessions = new Map<string, DebugSession>();
  private breakpoints = new Map<string, AgentBreakpoint>();
  private isInitialized = false;
  private debugPort: number;

  constructor(
    private configManager: ConfigurationManager,
    private logger: ExtensionLogger
  ) {
    this.debugPort = configManager.get('debugPort', 8081);
  }

  /**
   * Initialize the debug provider
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.logger.info('Initializing DebugProvider...');

      // Initialize debug visualizer from AGENT-023
      this.debugVisualizer = createDebugVisualizer({
        server: {
          port: this.debugPort,
          enableHTTPS: false,
          corsOrigins: ['vscode-webview://*'],
          maxConnections: 10,
          enableBreakpoints: true,
          enablePerformanceAnalysis: true,
          enableFlowVisualization: true,
          enableTokenVisualization: true
        },
        traceCollector: {
          enablePerformanceCollection: true,
          enableTokenTracking: true,
          enableDecisionTracking: true,
          enableResourceMonitoring: true,
          maxTraceHistory: 100,
          traceRetentionHours: 2,
          samplingRate: 1.0
        },
        enableBreakpoints: true,
        enablePerformanceAnalysis: true,
        enableFlowVisualization: true,
        enableTokenVisualization: true,
        enableDecisionTracking: true,
        logLevel: 'info'
      });

      // Setup event listeners
      this.setupDebugVisualizerEvents();

      // Start the debug visualizer
      await this.debugVisualizer.start();

      this.isInitialized = true;
      this.logger.info(`DebugProvider initialized with visualizer on port ${this.debugPort}`);

    } catch (error) {
      this.logger.error('Failed to initialize DebugProvider:', error);
      throw error;
    }
  }

  /**
   * Setup debug visualizer event handlers
   */
  private setupDebugVisualizerEvents(): void {
    if (!this.debugVisualizer) return;

    this.debugVisualizer.on('trace:started', (trace) => {
      this.logger.debug(`Debug trace started: ${trace.executionId}`);
      this.notifyTraceStarted(trace);
    });

    this.debugVisualizer.on('trace:completed', (trace) => {
      this.logger.debug(`Debug trace completed: ${trace.executionId}`);
      this.notifyTraceCompleted(trace);
    });

    this.debugVisualizer.on('breakpoint:hit', (data) => {
      this.logger.info(`Breakpoint hit: ${data.breakpoint.id}`);
      this.handleBreakpointHit(data);
    });

    this.debugVisualizer.on('performance:bottleneck-detected', (data) => {
      this.logger.warn(`Performance bottleneck detected: ${data.executionId}`);
      this.notifyPerformanceIssue(data);
    });

    this.debugVisualizer.on('client:connected', () => {
      this.logger.debug('Debug client connected');
    });

    this.debugVisualizer.on('client:disconnected', () => {
      this.logger.debug('Debug client disconnected');
    });
  }

  /**
   * Provide debug configurations
   */
  provideDebugConfigurations(
    folder: vscode.WorkspaceFolder | undefined,
    token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration[]> {
    
    return [
      {
        name: 'Debug Dev-Agency Agent',
        request: 'launch',
        type: 'dev-agency',
        agent: '${input:agentName}',
        task: '${input:agentTask}',
        context: '${workspaceFolder}',
        stopOnEntry: true,
        enableBreakpoints: true,
        enablePerformanceAnalysis: true
      },
      {
        name: 'Attach to Running Agent',
        request: 'attach',
        type: 'dev-agency',
        processId: '${input:processId}',
        enableBreakpoints: true,
        enablePerformanceAnalysis: true
      }
    ];
  }

  /**
   * Resolve debug configuration before launching
   */
  resolveDebugConfiguration(
    folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
    token?: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    
    // Add default values
    if (!config.type) {
      config.type = 'dev-agency';
    }

    if (!config.request) {
      config.request = 'launch';
    }

    if (!config.debugPort) {
      config.debugPort = this.debugPort;
    }

    // Validate configuration
    if (config.request === 'launch' && !config.agent) {
      vscode.window.showErrorMessage('Agent name is required for launching debug session');
      return null;
    }

    return config;
  }

  /**
   * Open debug visualizer in webview panel
   */
  async openDebugger(): Promise<void> {
    const panel = vscode.window.createWebviewPanel(
      'dev-agency-debugger',
      'Dev-Agency Debugger',
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(__dirname, '../../../debug/interfaces/web'))
        ]
      }
    );

    // Load debug interface HTML
    const debugInterfaceHtml = await this.generateDebugInterface();
    panel.webview.html = debugInterfaceHtml;

    // Handle messages from webview
    panel.webview.onDidReceiveMessage(
      async message => {
        await this.handleWebviewMessage(message, panel.webview);
      }
    );

    this.logger.info('Debug visualizer opened in webview panel');
  }

  /**
   * Generate debug interface HTML
   */
  private async generateDebugInterface(): Promise<string> {
    const debugVisualizerUrl = `http://localhost:${this.debugPort}`;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dev-Agency Debugger</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: var(--vscode-font-family);
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            
            .debugger-container {
                display: flex;
                flex-direction: column;
                height: 100vh;
            }
            
            .toolbar {
                background-color: var(--vscode-panel-background);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .toolbar button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .toolbar button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            
            .toolbar button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .debug-iframe {
                flex: 1;
                border: none;
                width: 100%;
            }
            
            .status-bar {
                background-color: var(--vscode-statusBar-background);
                color: var(--vscode-statusBar-foreground);
                padding: 4px 16px;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            
            .status-connected {
                background-color: var(--vscode-charts-green);
            }
            
            .status-disconnected {
                background-color: var(--vscode-charts-red);
            }
        </style>
    </head>
    <body>
        <div class="debugger-container">
            <div class="toolbar">
                <button id="refresh-btn" onclick="refreshDebugger()">
                    <span>🔄 Refresh</span>
                </button>
                <button id="breakpoints-btn" onclick="toggleBreakpoints()">
                    <span>🔴 Breakpoints</span>
                </button>
                <button id="performance-btn" onclick="showPerformance()">
                    <span>📊 Performance</span>
                </button>
                <button id="traces-btn" onclick="showTraces()">
                    <span>🔍 Traces</span>
                </button>
                <div style="margin-left: auto;">
                    <button id="settings-btn" onclick="showSettings()">
                        <span>⚙️ Settings</span>
                    </button>
                </div>
            </div>
            
            <iframe 
                id="debug-iframe"
                class="debug-iframe" 
                src="${debugVisualizerUrl}"
                sandbox="allow-scripts allow-same-origin allow-forms">
            </iframe>
            
            <div class="status-bar">
                <div class="connection-status">
                    <div id="status-indicator" class="status-indicator status-connected"></div>
                    <span id="status-text">Connected to Debug Visualizer</span>
                </div>
                <div id="debug-info">
                    Sessions: <span id="session-count">0</span> | 
                    Breakpoints: <span id="breakpoint-count">0</span>
                </div>
            </div>
        </div>
        
        <script>
            const vscode = acquireVsCodeApi();
            
            function refreshDebugger() {
                document.getElementById('debug-iframe').contentWindow.location.reload();
                vscode.postMessage({ command: 'refresh' });
            }
            
            function toggleBreakpoints() {
                vscode.postMessage({ command: 'toggle-breakpoints' });
            }
            
            function showPerformance() {
                vscode.postMessage({ command: 'show-performance' });
            }
            
            function showTraces() {
                vscode.postMessage({ command: 'show-traces' });
            }
            
            function showSettings() {
                vscode.postMessage({ command: 'show-settings' });
            }
            
            // Monitor connection status
            let connectionCheckInterval = setInterval(() => {
                fetch('${debugVisualizerUrl}/health')
                    .then(response => {
                        if (response.ok) {
                            updateConnectionStatus(true);
                        } else {
                            updateConnectionStatus(false);
                        }
                    })
                    .catch(() => {
                        updateConnectionStatus(false);
                    });
            }, 5000);
            
            function updateConnectionStatus(connected) {
                const indicator = document.getElementById('status-indicator');
                const text = document.getElementById('status-text');
                
                if (connected) {
                    indicator.className = 'status-indicator status-connected';
                    text.textContent = 'Connected to Debug Visualizer';
                } else {
                    indicator.className = 'status-indicator status-disconnected';
                    text.textContent = 'Disconnected from Debug Visualizer';
                }
            }
            
            // Update debug info
            function updateDebugInfo(sessionCount, breakpointCount) {
                document.getElementById('session-count').textContent = sessionCount;
                document.getElementById('breakpoint-count').textContent = breakpointCount;
            }
            
            // Listen for messages from VS Code
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'update-status':
                        updateDebugInfo(message.sessions, message.breakpoints);
                        break;
                    case 'connection-status':
                        updateConnectionStatus(message.connected);
                        break;
                }
            });
        </script>
    </body>
    </html>
    `;
  }

  /**
   * Handle messages from webview
   */
  private async handleWebviewMessage(message: any, webview: vscode.Webview): Promise<void> {
    switch (message.command) {
      case 'refresh':
        await this.refreshDebugger();
        break;
      case 'toggle-breakpoints':
        await this.toggleBreakpoints();
        break;
      case 'show-performance':
        await this.showPerformanceAnalysis();
        break;
      case 'show-traces':
        await this.showTraces();
        break;
      case 'show-settings':
        await this.showDebugSettings();
        break;
    }
  }

  /**
   * Show execution traces
   */
  async showTraces(): Promise<void> {
    if (!this.debugVisualizer) {
      vscode.window.showErrorMessage('Debug visualizer not initialized');
      return;
    }

    try {
      const traces = this.debugVisualizer.getTraces();
      const traceItems = traces.map(trace => ({
        label: `$(pulse) ${trace.agentName || 'Unknown'} - ${trace.executionId}`,
        description: `Started: ${new Date(trace.startTime).toLocaleTimeString()}`,
        detail: `Duration: ${trace.duration}ms | Status: ${trace.status}`,
        trace
      }));

      if (traceItems.length === 0) {
        vscode.window.showInformationMessage('No execution traces available');
        return;
      }

      const selected = await vscode.window.showQuickPick(traceItems, {
        placeHolder: 'Select a trace to analyze',
        ignoreFocusOut: true
      });

      if (selected) {
        await this.showTraceDetails((selected as any).trace);
      }

    } catch (error) {
      this.logger.error('Failed to show traces:', error);
      vscode.window.showErrorMessage('Failed to show traces');
    }
  }

  /**
   * Show trace details
   */
  private async showTraceDetails(trace: any): Promise<void> {
    if (!this.debugVisualizer) return;

    try {
      const analysis = await this.debugVisualizer.analyzeTrace(trace.executionId);
      
      const panel = vscode.window.createWebviewPanel(
        'trace-details',
        `Trace: ${trace.executionId}`,
        vscode.ViewColumn.Two,
        { enableScripts: true }
      );

      panel.webview.html = this.generateTraceDetailsHtml(trace, analysis);

    } catch (error) {
      this.logger.error('Failed to show trace details:', error);
    }
  }

  /**
   * Generate trace details HTML
   */
  private generateTraceDetailsHtml(trace: any, analysis: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: var(--vscode-font-family); 
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
            }
            .trace-header {
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 16px;
                margin-bottom: 20px;
            }
            .metric {
                display: flex;
                justify-content: space-between;
                padding: 4px 0;
            }
            .performance-chart {
                margin: 20px 0;
                padding: 16px;
                background-color: var(--vscode-panel-background);
                border-radius: 4px;
            }
            pre {
                background-color: var(--vscode-textBlockQuote-background);
                padding: 12px;
                border-radius: 4px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <div class="trace-header">
            <h2>Execution Trace: ${trace.executionId}</h2>
            <div class="metric"><strong>Agent:</strong> <span>${trace.agentName || 'Unknown'}</span></div>
            <div class="metric"><strong>Status:</strong> <span>${trace.status}</span></div>
            <div class="metric"><strong>Duration:</strong> <span>${trace.duration}ms</span></div>
            <div class="metric"><strong>Started:</strong> <span>${new Date(trace.startTime).toLocaleString()}</span></div>
        </div>
        
        <h3>Performance Analysis</h3>
        <div class="performance-chart">
            <pre>${JSON.stringify(analysis, null, 2)}</pre>
        </div>
        
        <h3>Execution Steps</h3>
        <div class="execution-steps">
            ${trace.steps ? trace.steps.map((step: any, index: number) => `
                <div class="step">
                    <strong>Step ${index + 1}:</strong> ${step.description}<br>
                    <small>Duration: ${step.duration}ms</small>
                </div>
            `).join('') : '<p>No steps recorded</p>'}
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Add breakpoint
   */
  async addBreakpoint(agentName: string, condition?: string): Promise<void> {
    if (!this.debugVisualizer) {
      throw new Error('Debug visualizer not initialized');
    }

    const breakpoint: AgentBreakpoint = {
      id: `bp-${Date.now()}`,
      agentName,
      condition,
      enabled: true,
      hitCount: 0
    };

    this.breakpoints.set(breakpoint.id, breakpoint);
    
    await this.debugVisualizer.addBreakpoint({
      id: breakpoint.id,
      agentName,
      condition,
      enabled: true
    });

    this.logger.info(`Added breakpoint for agent: ${agentName}`);
  }

  /**
   * Remove breakpoint
   */
  async removeBreakpoint(breakpointId: string): Promise<void> {
    if (!this.debugVisualizer) return;

    this.breakpoints.delete(breakpointId);
    await this.debugVisualizer.removeBreakpoint(breakpointId);
    
    this.logger.info(`Removed breakpoint: ${breakpointId}`);
  }

  /**
   * Handle breakpoint hit
   */
  private async handleBreakpointHit(data: any): Promise<void> {
    const breakpoint = this.breakpoints.get(data.breakpoint.id);
    if (!breakpoint) return;

    breakpoint.hitCount++;
    this.breakpoints.set(breakpoint.id, breakpoint);

    // Show breakpoint hit notification
    const action = await vscode.window.showWarningMessage(
      `Breakpoint hit in agent: ${breakpoint.agentName}`,
      'Continue',
      'Step Over',
      'Stop Debugging'
    );

    switch (action) {
      case 'Continue':
        await this.continueExecution(data.trace.executionId);
        break;
      case 'Step Over':
        await this.stepOver(data.trace.executionId);
        break;
      case 'Stop Debugging':
        await this.stopDebugging(data.trace.executionId);
        break;
    }
  }

  /**
   * Debug session event handlers
   */
  onDebugSessionStarted(session: vscode.DebugSession): void {
    const debugSession: DebugSession = {
      id: session.id,
      agentName: session.configuration.agent || 'unknown',
      status: 'active',
      breakpoints: [],
      traces: [],
      startTime: new Date()
    };

    this.activeSessions.set(session.id, debugSession);
    this.logger.info(`Debug session started: ${session.id}`);
  }

  onDebugSessionEnded(session: vscode.DebugSession): void {
    const debugSession = this.activeSessions.get(session.id);
    if (debugSession) {
      debugSession.status = 'terminated';
    }

    this.activeSessions.delete(session.id);
    this.logger.info(`Debug session ended: ${session.id}`);
  }

  // Private helper methods for debug control
  private async continueExecution(executionId: string): Promise<void> {
    // Implementation would depend on debug visualizer API
    this.logger.debug(`Continuing execution: ${executionId}`);
  }

  private async stepOver(executionId: string): Promise<void> {
    this.logger.debug(`Stepping over: ${executionId}`);
  }

  private async stopDebugging(executionId: string): Promise<void> {
    this.logger.debug(`Stopping debug session: ${executionId}`);
  }

  private async refreshDebugger(): Promise<void> {
    // Refresh debug visualizer state
  }

  private async toggleBreakpoints(): Promise<void> {
    // Toggle all breakpoints
  }

  private async showPerformanceAnalysis(): Promise<void> {
    // Show performance analysis view
  }

  private async showDebugSettings(): Promise<void> {
    // Show debug-specific settings
  }

  // Notification methods
  private notifyTraceStarted(trace: any): void {
    if (this.configManager.get('enableNotifications', true)) {
      vscode.window.showInformationMessage(
        `Debug trace started: ${trace.agentName}`,
        'View Trace'
      ).then(selection => {
        if (selection === 'View Trace') {
          this.openDebugger();
        }
      });
    }
  }

  private notifyTraceCompleted(trace: any): void {
    if (this.configManager.get('enableNotifications', true)) {
      vscode.window.showInformationMessage(
        `Debug trace completed: ${trace.agentName} (${trace.duration}ms)`
      );
    }
  }

  private notifyPerformanceIssue(data: any): void {
    vscode.window.showWarningMessage(
      `Performance bottleneck detected in ${data.agentName}`,
      'Analyze',
      'Ignore'
    ).then(selection => {
      if (selection === 'Analyze') {
        this.showTraceDetails(data);
      }
    });
  }

  /**
   * Get debug statistics
   */
  getDebugStats(): {
    activeSessions: number;
    totalBreakpoints: number;
    visualizerStatus: 'running' | 'stopped' | 'error';
  } {
    return {
      activeSessions: this.activeSessions.size,
      totalBreakpoints: this.breakpoints.size,
      visualizerStatus: this.debugVisualizer ? 'running' : 'stopped'
    };
  }

  /**
   * Shutdown the debug provider
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down DebugProvider...');

    if (this.debugVisualizer) {
      await this.debugVisualizer.stop();
    }

    this.activeSessions.clear();
    this.breakpoints.clear();

    this.logger.info('DebugProvider shutdown complete');
  }
}