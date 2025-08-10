/**
 * Debug Visualizer - Main orchestrator for debugging and trace visualization system
 * 
 * @file DebugVisualizer.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import { TraceCollector, TraceCollectorConfig } from './collectors/TraceCollector';
import { DebugServer, DebugServerConfig } from './servers/DebugServer';
import { BreakpointManager } from './analyzers/BreakpointManager';
import { PerformanceAnalyzer } from './analyzers/PerformanceAnalyzer';
import { ExecutionEngine } from '../../tools/agent-cli/src/core/ExecutionEngine';
import { Logger } from '../../tools/agent-cli/src/utils/Logger';

export interface DebugVisualizerConfig {
  // Server configuration
  server: Partial<DebugServerConfig>;
  
  // Trace collection configuration
  traceCollector: Partial<TraceCollectorConfig>;
  
  // Feature flags
  enableBreakpoints: boolean;
  enablePerformanceAnalysis: boolean;
  enableFlowVisualization: boolean;
  enableTokenVisualization: boolean;
  enableDecisionTracking: boolean;
  
  // Integration settings
  autoAttachToExecutionEngine: boolean;
  integrateWithHealthDashboard: boolean;
  
  // Security settings
  requireAuthentication: boolean;
  authTokens: string[];
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface DebugVisualizerStats {
  uptime: number;
  isRunning: boolean;
  
  // Service statistics
  server: any;
  traceCollector: any;
  breakpointManager: any;
  performanceAnalyzer: any;
  
  // Integration status
  executionEngineAttached: boolean;
  healthDashboardConnected: boolean;
  
  // Usage statistics
  totalSessions: number;
  activeConnections: number;
  tracesCollected: number;
  analysesPerformed: number;
}

export class DebugVisualizer extends EventEmitter {
  private config: DebugVisualizerConfig;
  private logger: Logger;
  
  // Core components
  private traceCollector: TraceCollector;
  private debugServer: DebugServer;
  private breakpointManager: BreakpointManager;
  private performanceAnalyzer: PerformanceAnalyzer;
  
  // External integrations
  private executionEngine?: ExecutionEngine;
  private healthDashboardController?: any; // From AGENT-021
  
  // State
  private isRunning = false;
  private startTime?: Date;
  private totalSessions = 0;

  constructor(config: Partial<DebugVisualizerConfig> = {}) {
    super();
    
    this.config = {
      server: {
        port: 8081,
        enableHTTPS: false,
        corsOrigins: ['*'],
        maxConnections: 50,
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
        maxTraceHistory: 1000,
        traceRetentionHours: 24,
        samplingRate: 1.0
      },
      
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true,
      enableDecisionTracking: true,
      
      autoAttachToExecutionEngine: true,
      integrateWithHealthDashboard: true,
      
      requireAuthentication: false,
      authTokens: [],
      
      logLevel: 'info',
      
      ...config
    };
    
    this.logger = Logger.create({ 
      component: 'DebugVisualizer',
      level: this.config.logLevel
    });
    
    this.initializeComponents();
    this.setupEventHandlers();
    
    this.logger.info('DebugVisualizer initialized', { 
      features: this.getEnabledFeatures(),
      serverPort: this.config.server.port
    });
  }

  /**
   * Start the debug visualizer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('DebugVisualizer is already running');
      return;
    }

    try {
      this.startTime = new Date();
      
      // Start debug server
      await this.debugServer.start();
      
      this.isRunning = true;
      
      this.emit('visualizer:started', {
        port: this.config.server.port,
        features: this.getEnabledFeatures()
      });
      
      this.logger.info('DebugVisualizer started successfully', {
        port: this.config.server.port,
        uptime: 0
      });
      
    } catch (error) {
      this.logger.error('Failed to start DebugVisualizer:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Stop the debug visualizer
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.isRunning = false;
      
      // Detach from execution engine
      if (this.executionEngine) {
        this.traceCollector.detach();
      }
      
      // Stop debug server
      await this.debugServer.stop();
      
      this.emit('visualizer:stopped');
      this.logger.info('DebugVisualizer stopped');
      
    } catch (error) {
      this.logger.error('Error stopping DebugVisualizer:', error);
      throw error;
    }
  }

  /**
   * Attach to execution engine for automatic trace collection
   */
  async attachToExecutionEngine(executionEngine: ExecutionEngine): Promise<void> {
    if (this.executionEngine) {
      this.logger.warn('Already attached to an ExecutionEngine');
      return;
    }

    try {
      this.executionEngine = executionEngine;
      await this.traceCollector.attachToExecutionEngine(executionEngine);
      
      // Integrate breakpoint manager with execution engine
      if (this.config.enableBreakpoints) {
        this.integrateBreakpointsWithExecutionEngine();
      }
      
      this.emit('execution-engine:attached', { executionEngine: !!executionEngine });
      this.logger.info('Successfully attached to ExecutionEngine');
      
    } catch (error) {
      this.logger.error('Failed to attach to ExecutionEngine:', error);
      throw error;
    }
  }

  /**
   * Integrate with health dashboard from AGENT-021
   */
  integrateWithHealthDashboard(healthDashboard: any): void {
    this.healthDashboardController = healthDashboard;
    
    // Forward debugging events to health dashboard
    this.forwardEventsToHealthDashboard();
    
    this.emit('health-dashboard:integrated');
    this.logger.info('Integrated with HealthDashboard');
  }

  /**
   * Get trace by execution ID
   */
  getTrace(executionId: string) {
    return this.traceCollector.getTrace(executionId);
  }

  /**
   * Get traces with filtering
   */
  getTraces(criteria?: any) {
    return this.traceCollector.getTraces(criteria);
  }

  /**
   * Analyze trace performance
   */
  async analyzeTrace(executionId: string) {
    const trace = this.traceCollector.getTrace(executionId);
    if (!trace) {
      throw new Error(`Trace not found: ${executionId}`);
    }
    
    return await this.performanceAnalyzer.analyzeTrace(trace);
  }

  /**
   * Add breakpoint
   */
  addBreakpoint(breakpointData: any) {
    if (!this.config.enableBreakpoints) {
      throw new Error('Breakpoints are disabled');
    }
    
    return this.breakpointManager.addBreakpoint(breakpointData);
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(breakpointId: string) {
    return this.breakpointManager.removeBreakpoint(breakpointId);
  }

  /**
   * Get all breakpoints
   */
  getAllBreakpoints() {
    return this.breakpointManager.getAllBreakpoints();
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(agentName?: string, timeWindow?: string) {
    return this.performanceAnalyzer.getPerformanceTrends(agentName, timeWindow);
  }

  /**
   * Get statistics
   */
  getStats(): DebugVisualizerStats {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    
    return {
      uptime,
      isRunning: this.isRunning,
      
      server: this.debugServer.getStats(),
      traceCollector: this.traceCollector.getStats(),
      breakpointManager: this.breakpointManager.getStats(),
      performanceAnalyzer: this.performanceAnalyzer.getStats(),
      
      executionEngineAttached: !!this.executionEngine,
      healthDashboardConnected: !!this.healthDashboardController,
      
      totalSessions: this.totalSessions,
      activeConnections: this.debugServer.getStats().connectedClients || 0,
      tracesCollected: this.traceCollector.getStats().totalTracesCollected,
      analysesPerformed: this.performanceAnalyzer.getStats().totalAnalyses
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const stats = this.getStats();
    
    return {
      healthy: this.isRunning && 
               stats.server && 
               (stats.executionEngineAttached || !this.config.autoAttachToExecutionEngine),
      status: this.isRunning ? 'running' : 'stopped',
      uptime: stats.uptime,
      features: this.getEnabledFeatures(),
      stats: {
        activeConnections: stats.activeConnections,
        tracesCollected: stats.tracesCollected,
        analysesPerformed: stats.analysesPerformed
      },
      issues: this.getHealthIssues()
    };
  }

  // Private methods

  private initializeComponents(): void {
    // Initialize trace collector
    this.traceCollector = new TraceCollector({
      ...this.config.traceCollector,
      enableDecisionTracking: this.config.enableDecisionTracking
    });
    
    // Initialize breakpoint manager
    this.breakpointManager = new BreakpointManager({
      enableConditionalBreakpoints: this.config.enableBreakpoints,
      enableWatchExpressions: this.config.enableBreakpoints
    });
    
    // Initialize performance analyzer
    this.performanceAnalyzer = new PerformanceAnalyzer({
      enableTrendAnalysis: this.config.enablePerformanceAnalysis,
      enablePredictiveAnalysis: this.config.enablePerformanceAnalysis
    });
    
    // Initialize debug server
    this.debugServer = new DebugServer(
      {
        ...this.config.server,
        requireAuth: this.config.requireAuthentication,
        authTokens: this.config.authTokens
      },
      this.traceCollector,
      this.breakpointManager,
      this.performanceAnalyzer
    );
  }

  private setupEventHandlers(): void {
    // Trace collector events
    this.traceCollector.on('trace:started', (trace) => {
      this.emit('trace:started', trace);
      
      // Trigger performance analysis for completed traces
      this.traceCollector.on('trace:completed', async (completedTrace) => {
        if (this.config.enablePerformanceAnalysis) {
          try {
            const analysis = await this.performanceAnalyzer.analyzeTrace(completedTrace);
            this.emit('trace:analyzed', { trace: completedTrace, analysis });
          } catch (error) {
            this.logger.error('Failed to analyze trace:', error);
          }
        }
      });
    });

    this.traceCollector.on('collector:attached', () => {
      this.logger.info('TraceCollector attached to ExecutionEngine');
    });

    // Breakpoint manager events
    this.breakpointManager.on('breakpoint:hit', (data) => {
      this.emit('breakpoint:hit', data);
      this.logger.info('Breakpoint hit', { 
        breakpointId: data.breakpoint.id,
        executionId: data.trace.executionId 
      });
    });

    // Performance analyzer events
    this.performanceAnalyzer.on('bottleneck:detected', (data) => {
      this.emit('performance:bottleneck-detected', data);
      this.logger.warn('Performance bottleneck detected', {
        executionId: data.executionId,
        type: data.bottleneck.type,
        severity: data.bottleneck.severity
      });
    });

    // Debug server events
    this.debugServer.on('client:connected', (data) => {
      this.totalSessions++;
      this.emit('client:connected', data);
    });

    this.debugServer.on('client:disconnected', (data) => {
      this.emit('client:disconnected', data);
    });

    this.debugServer.on('server:started', () => {
      this.logger.info('Debug server started');
    });

    this.debugServer.on('server:stopped', () => {
      this.logger.info('Debug server stopped');
    });
  }

  private integrateBreakpointsWithExecutionEngine(): void {
    if (!this.executionEngine) return;

    // Listen to execution events and check for breakpoints
    this.executionEngine.on('execution:step', async (data) => {
      const { executionId, step } = data;
      const trace = this.traceCollector.getTrace(executionId);
      
      if (trace && step) {
        const breakResult = await this.breakpointManager.shouldBreak(trace, step);
        
        if (breakResult.shouldBreak) {
          // Pause execution and notify clients
          this.debugServer.broadcast({
            type: 'execution:paused',
            data: {
              executionId,
              step,
              breakpoint: breakResult.breakpoint,
              reason: breakResult.reason
            }
          });
          
          // Start step execution mode
          this.breakpointManager.startStepExecution(executionId, 'step-over');
        }
      }
    });
  }

  private forwardEventsToHealthDashboard(): void {
    if (!this.healthDashboardController) return;

    // Forward critical debugging events to health dashboard
    this.on('performance:bottleneck-detected', (data) => {
      this.healthDashboardController.emit('debug:bottleneck-detected', {
        type: 'debug-bottleneck',
        severity: data.bottleneck.severity,
        description: data.bottleneck.description,
        executionId: data.executionId,
        timestamp: new Date().toISOString()
      });
    });

    this.on('breakpoint:hit', (data) => {
      this.healthDashboardController.emit('debug:breakpoint-hit', {
        type: 'debug-breakpoint',
        breakpointName: data.breakpoint.name,
        executionId: data.trace.executionId,
        timestamp: new Date().toISOString()
      });
    });
  }

  private getEnabledFeatures(): string[] {
    const features: string[] = [];
    
    if (this.config.enableBreakpoints) features.push('breakpoints');
    if (this.config.enablePerformanceAnalysis) features.push('performance-analysis');
    if (this.config.enableFlowVisualization) features.push('flow-visualization');
    if (this.config.enableTokenVisualization) features.push('token-visualization');
    if (this.config.enableDecisionTracking) features.push('decision-tracking');
    
    return features;
  }

  private getHealthIssues(): string[] {
    const issues: string[] = [];
    
    if (!this.isRunning) {
      issues.push('DebugVisualizer is not running');
    }
    
    if (this.config.autoAttachToExecutionEngine && !this.executionEngine) {
      issues.push('ExecutionEngine not attached');
    }
    
    if (this.config.integrateWithHealthDashboard && !this.healthDashboardController) {
      issues.push('HealthDashboard not integrated');
    }
    
    const serverStats = this.debugServer?.getStats();
    if (serverStats && serverStats.connectedClients === 0) {
      issues.push('No active debugging sessions');
    }
    
    return issues;
  }

  private async cleanup(): Promise<void> {
    const cleanupTasks: Promise<void>[] = [];
    
    if (this.debugServer) {
      cleanupTasks.push(this.debugServer.stop().catch(() => {}));
    }
    
    if (this.traceCollector && this.executionEngine) {
      this.traceCollector.detach();
    }
    
    await Promise.allSettled(cleanupTasks);
  }
}

// Export factory function for easier integration
export function createDebugVisualizer(config?: Partial<DebugVisualizerConfig>): DebugVisualizer {
  return new DebugVisualizer(config);
}

// Export convenience function for quick setup
export async function startDebugVisualizer(
  config?: Partial<DebugVisualizerConfig>,
  executionEngine?: ExecutionEngine,
  healthDashboard?: any
): Promise<DebugVisualizer> {
  const visualizer = createDebugVisualizer(config);
  
  if (executionEngine) {
    await visualizer.attachToExecutionEngine(executionEngine);
  }
  
  if (healthDashboard) {
    visualizer.integrateWithHealthDashboard(healthDashboard);
  }
  
  await visualizer.start();
  return visualizer;
}