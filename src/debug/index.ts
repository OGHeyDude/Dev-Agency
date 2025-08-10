/**
 * Debug Visualizer - Main export file for debugging and trace visualization system
 * 
 * @file index.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

// Main orchestrator
export { 
  DebugVisualizer, 
  createDebugVisualizer, 
  startDebugVisualizer,
  type DebugVisualizerConfig,
  type DebugVisualizerStats
} from './DebugVisualizer';

// Core components
export { 
  TraceCollector,
  type TraceCollectorConfig,
  type TraceCollectorStats
} from './collectors/TraceCollector';

export { 
  DebugServer,
  type DebugServerConfig,
  type DebugSession as ServerDebugSession,
  type DebugServerStats
} from './servers/DebugServer';

export { 
  BreakpointManager,
  type Breakpoint,
  type WatchExpression,
  type StepExecution,
  type BreakpointManagerStats
} from './analyzers/BreakpointManager';

export { 
  PerformanceAnalyzer,
  type PerformanceAnalysisResult,
  type PerformanceTrend,
  type PerformanceThreshold,
  type PerformanceAnalyzerStats
} from './analyzers/PerformanceAnalyzer';

// Models and types
export {
  type ExecutionTrace,
  type ExecutionStep,
  type ExecutionContext,
  type PerformanceMetrics,
  type TokenUsageData,
  type DecisionNode,
  type WorkflowTrace,
  type FlowDiagramNode,
  type FlowDiagramEdge,
  type VisualizationConfig,
  type PerformanceBottleneck,
  type OptimizationSuggestion
} from './models/TraceModels';

// Utilities and extensions
export { 
  TracingLogger,
  createTracingLogger,
  extendLoggerWithTracing,
  TraceLoggingUtils,
  type TraceLogEntry,
  type LoggerTraceOptions
} from './utils/LoggerExtension';

export {
  DebugExecutionEngine,
  createDebugExecutionEngine,
  enhanceExecutionEngineWithDebugging,
  type DebugExecutionOptions,
  type DebugSession,
  type ExecutionEngineDebugConfig
} from './utils/ExecutionEngineExtension';

// Integration helpers
export class DebugIntegrationHelper {
  /**
   * Quick setup for full debugging stack
   */
  static async setupFullDebugging(config: {
    port?: number;
    enableAuth?: boolean;
    authTokens?: string[];
    executionEngine?: any;
    healthDashboard?: any;
  } = {}): Promise<DebugVisualizer> {
    const { 
      port = 8081, 
      enableAuth = false, 
      authTokens = [],
      executionEngine,
      healthDashboard
    } = config;

    // Create debug visualizer with comprehensive configuration
    const debugVisualizer = createDebugVisualizer({
      server: {
        port,
        requireAuth: enableAuth,
        authTokens,
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
        samplingRate: 1.0
      },
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true,
      enableDecisionTracking: true,
      autoAttachToExecutionEngine: !!executionEngine,
      integrateWithHealthDashboard: !!healthDashboard
    });

    // Attach external components
    if (executionEngine) {
      await debugVisualizer.attachToExecutionEngine(executionEngine);
    }

    if (healthDashboard) {
      debugVisualizer.integrateWithHealthDashboard(healthDashboard);
    }

    // Start the system
    await debugVisualizer.start();

    return debugVisualizer;
  }

  /**
   * Create lightweight debugging setup for development
   */
  static async setupDevelopmentDebugging(
    executionEngine?: any,
    port: number = 8081
  ): Promise<DebugVisualizer> {
    const debugVisualizer = createDebugVisualizer({
      server: {
        port,
        requireAuth: false,
        enableBreakpoints: true,
        enablePerformanceAnalysis: true,
        enableFlowVisualization: true,
        enableTokenVisualization: false // Disable for faster dev
      },
      traceCollector: {
        enablePerformanceCollection: true,
        enableTokenTracking: false,
        enableDecisionTracking: true,
        samplingRate: 0.5 // Sample 50% for performance
      },
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: false,
      enableDecisionTracking: true
    });

    if (executionEngine) {
      await debugVisualizer.attachToExecutionEngine(executionEngine);
    }

    await debugVisualizer.start();
    return debugVisualizer;
  }

  /**
   * Create production monitoring setup
   */
  static async setupProductionMonitoring(config: {
    port?: number;
    authTokens: string[];
    executionEngine?: any;
    healthDashboard?: any;
  }): Promise<DebugVisualizer> {
    const { 
      port = 8081, 
      authTokens,
      executionEngine,
      healthDashboard 
    } = config;

    const debugVisualizer = createDebugVisualizer({
      server: {
        port,
        requireAuth: true,
        authTokens,
        enableBreakpoints: false, // Disabled in production
        enablePerformanceAnalysis: true,
        enableFlowVisualization: true,
        enableTokenVisualization: true
      },
      traceCollector: {
        enablePerformanceCollection: true,
        enableTokenTracking: true,
        enableDecisionTracking: false, // May be too verbose
        samplingRate: 0.1 // Low sampling for production
      },
      enableBreakpoints: false,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true,
      enableDecisionTracking: false
    });

    if (executionEngine) {
      await debugVisualizer.attachToExecutionEngine(executionEngine);
    }

    if (healthDashboard) {
      debugVisualizer.integrateWithHealthDashboard(healthDashboard);
    }

    await debugVisualizer.start();
    return debugVisualizer;
  }
}

// Export version information
export const VERSION = '1.0.0';

// Export default configuration presets
export const DebugConfigurations = {
  development: {
    server: {
      port: 8081,
      requireAuth: false,
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true
    },
    traceCollector: {
      enablePerformanceCollection: true,
      enableTokenTracking: true,
      enableDecisionTracking: true,
      samplingRate: 1.0
    },
    features: {
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true,
      enableDecisionTracking: true
    }
  },

  testing: {
    server: {
      port: 8082,
      requireAuth: false,
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: false, // Faster for tests
      enableTokenVisualization: false
    },
    traceCollector: {
      enablePerformanceCollection: true,
      enableTokenTracking: false,
      enableDecisionTracking: false,
      samplingRate: 0.1
    },
    features: {
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: false,
      enableTokenVisualization: false,
      enableDecisionTracking: false
    }
  },

  production: {
    server: {
      port: 8081,
      requireAuth: true,
      authTokens: [], // Must be provided
      enableBreakpoints: false,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true
    },
    traceCollector: {
      enablePerformanceCollection: true,
      enableTokenTracking: true,
      enableDecisionTracking: false,
      samplingRate: 0.05
    },
    features: {
      enableBreakpoints: false,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true,
      enableDecisionTracking: false
    }
  }
} as const;