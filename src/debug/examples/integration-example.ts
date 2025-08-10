/**
 * Debug Visualizer Integration Example
 * 
 * @file integration-example.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { 
  DebugVisualizer, 
  createDebugVisualizer,
  DebugIntegrationHelper,
  TraceCollector,
  BreakpointManager,
  PerformanceAnalyzer
} from '../index';

import { ExecutionEngine } from '../../../tools/agent-cli/src/core/ExecutionEngine';
import { HealthDashboardController } from '../../dashboard/backend/src/controllers/HealthDashboardController';

/**
 * Example 1: Basic Debug Visualizer Setup
 */
async function basicDebugSetup() {
  console.log('Setting up basic debug visualizer...');

  // Create debug visualizer with default configuration
  const debugVisualizer = createDebugVisualizer({
    server: {
      port: 8081,
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
    }
  });

  // Start the visualizer
  await debugVisualizer.start();

  console.log('Debug visualizer started on http://localhost:8081');
  
  return debugVisualizer;
}

/**
 * Example 2: Full Integration with ExecutionEngine
 */
async function fullIntegrationExample() {
  console.log('Setting up full integration example...');

  // Create execution engine
  const executionEngine = new ExecutionEngine();

  // Create debug visualizer
  const debugVisualizer = createDebugVisualizer({
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
      enableResourceMonitoring: true,
      samplingRate: 1.0,
      maxTraceHistory: 1000
    },
    enableBreakpoints: true,
    enablePerformanceAnalysis: true,
    autoAttachToExecutionEngine: true
  });

  // Attach to execution engine
  await debugVisualizer.attachToExecutionEngine(executionEngine);

  // Start the visualizer
  await debugVisualizer.start();

  // Test the integration
  console.log('Testing agent execution with debugging...');
  
  try {
    const result = await executionEngine.executeSingle({
      agentName: 'test-agent',
      contextPath: './test-context.md',
      outputPath: './test-output.md'
    });

    console.log('Execution completed:', result.success);
    
    // Get debugging statistics
    const stats = debugVisualizer.getStats();
    console.log('Debug stats:', stats);
    
  } catch (error) {
    console.error('Execution failed:', error);
  }

  return { debugVisualizer, executionEngine };
}

/**
 * Example 3: Production Monitoring Setup
 */
async function productionMonitoringExample() {
  console.log('Setting up production monitoring...');

  const debugVisualizer = await DebugIntegrationHelper.setupProductionMonitoring({
    port: 8081,
    authTokens: ['prod-token-123', 'monitor-token-456'],
    // executionEngine: yourExecutionEngine,
    // healthDashboard: yourHealthDashboard
  });

  console.log('Production monitoring started');
  
  return debugVisualizer;
}

/**
 * Example 4: Development Debug Setup
 */
async function developmentDebugExample() {
  console.log('Setting up development debugging...');

  const executionEngine = new ExecutionEngine();
  
  const debugVisualizer = await DebugIntegrationHelper.setupDevelopmentDebugging(
    executionEngine,
    8081
  );

  // Add some sample breakpoints for development
  debugVisualizer.addBreakpoint({
    name: 'Agent Start',
    agentName: 'test-agent',
    condition: 'true', // Always break
    description: 'Break when any agent starts execution'
  });

  debugVisualizer.addBreakpoint({
    name: 'Slow Execution',
    condition: 'step.duration > 5000',
    description: 'Break when any step takes more than 5 seconds'
  });

  console.log('Development debugging setup complete');
  console.log('Open http://localhost:8081 to view the debug interface');
  
  return { debugVisualizer, executionEngine };
}

/**
 * Example 5: Custom Component Integration
 */
async function customComponentExample() {
  console.log('Setting up custom component integration...');

  // Create individual components
  const traceCollector = new TraceCollector({
    enablePerformanceCollection: true,
    enableTokenTracking: true,
    enableDecisionTracking: true,
    samplingRate: 1.0
  });

  const breakpointManager = new BreakpointManager({
    enableConditionalBreakpoints: true,
    enableWatchExpressions: true
  });

  const performanceAnalyzer = new PerformanceAnalyzer({
    enableTrendAnalysis: true,
    enablePredictiveAnalysis: true
  });

  // Create debug visualizer with custom components
  const debugVisualizer = new DebugVisualizer({
    server: {
      port: 8081,
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true
    },
    traceCollector: {
      enablePerformanceCollection: true,
      enableTokenTracking: true,
      enableDecisionTracking: true
    }
  });

  // Manual component setup
  // debugVisualizer.setTraceCollector(traceCollector);
  // debugVisualizer.setBreakpointManager(breakpointManager);
  // debugVisualizer.setPerformanceAnalyzer(performanceAnalyzer);

  await debugVisualizer.start();

  // Test trace collection
  const trace = traceCollector.startTrace('test-exec-1', 'test-agent', {
    testParameter: 'test-value'
  });

  traceCollector.addStep(trace.executionId, {
    stepName: 'Test Step',
    stepType: 'execution',
    status: 'running'
  });

  // Record a decision
  traceCollector.recordDecision(trace.executionId, {
    question: 'Should we proceed?',
    options: [
      { optionId: 'yes', label: 'Yes', confidence: 0.8, expectedOutcome: 'Continue execution' },
      { optionId: 'no', label: 'No', confidence: 0.2, expectedOutcome: 'Stop execution' }
    ],
    chosenOption: 'yes',
    confidence: 0.8,
    reasoning: {
      primaryFactors: ['User input indicates continuation'],
      secondaryFactors: ['System resources available'],
      constraintsConsidered: ['Time limits'],
      assumptionsMade: ['User intent is clear'],
      logicalSteps: [
        {
          stepNumber: 1,
          description: 'Analyze user input',
          evidence: ['Clear continuation signal'],
          conclusion: 'User wants to proceed',
          confidence: 0.9
        }
      ],
      confidenceFactors: {
        dataQuality: 0.8,
        contextCompleteness: 0.7,
        historicalAccuracy: 0.9,
        expertKnowledge: 0.6
      }
    }
  });

  // Complete the step and trace
  traceCollector.completeStep(trace.executionId, trace.steps[0].stepId, {
    success: true,
    output: 'Test completed successfully'
  });

  traceCollector.completeTrace(trace.executionId, {
    success: true,
    output: 'Test execution completed',
    agent: 'test-agent',
    timestamp: new Date().toISOString(),
    metrics: {
      duration: 1500,
      context_size: 100,
      tokens_used: 250
    }
  });

  console.log('Custom component setup complete');
  console.log('Sample trace created for testing');
  
  return { debugVisualizer, traceCollector, breakpointManager, performanceAnalyzer };
}

/**
 * Example 6: Health Dashboard Integration
 */
async function healthDashboardIntegrationExample() {
  console.log('Setting up health dashboard integration...');

  // This would integrate with the existing health dashboard from AGENT-021
  const healthDashboardConfig = {
    port: 8080,
    dashboard: {
      refreshInterval: 5000,
      alertThresholds: {
        cpu: { warning: 70, critical: 90 },
        memory: { warning: 80, critical: 95 },
        responseTime: { warning: 1000, critical: 5000 }
      },
      ui: {
        theme: 'default',
        autoRefresh: true,
        showNotifications: true
      },
      notificationChannels: {
        slack: { enabled: false },
        email: { enabled: false },
        teams: { enabled: false }
      }
    },
    enableWebSocket: true,
    enableServerSentEvents: false,
    corsOrigins: ['*'],
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000 // limit each IP to 1000 requests per windowMs
    }
  };

  // Create health dashboard (this would use the existing implementation)
  // const healthDashboard = new HealthDashboardController(healthDashboardConfig);
  // await healthDashboard.start();

  // Create debug visualizer
  const debugVisualizer = createDebugVisualizer({
    server: {
      port: 8081,
      enableBreakpoints: true,
      enablePerformanceAnalysis: true
    },
    integrateWithHealthDashboard: true
  });

  // Integrate with health dashboard
  // debugVisualizer.integrateWithHealthDashboard(healthDashboard);

  await debugVisualizer.start();

  console.log('Health dashboard integration complete');
  console.log('Debug visualizer: http://localhost:8081');
  console.log('Health dashboard: http://localhost:8080');
  
  return debugVisualizer;
}

/**
 * Example 7: Testing and Demo Mode
 */
async function testingDemoExample() {
  console.log('Setting up testing and demo mode...');

  const debugVisualizer = createDebugVisualizer({
    server: {
      port: 8081,
      enableBreakpoints: true,
      enablePerformanceAnalysis: true,
      enableFlowVisualization: true,
      enableTokenVisualization: true
    },
    traceCollector: {
      samplingRate: 1.0 // Capture everything for demo
    }
  });

  await debugVisualizer.start();

  // Generate sample data for demonstration
  console.log('Generating sample trace data...');
  
  // This would simulate agent executions for demo purposes
  setTimeout(async () => {
    await simulateAgentExecution(debugVisualizer, 'architect', 'system-design');
  }, 1000);

  setTimeout(async () => {
    await simulateAgentExecution(debugVisualizer, 'coder', 'feature-implementation');
  }, 3000);

  setTimeout(async () => {
    await simulateAgentExecution(debugVisualizer, 'tester', 'quality-assurance');
  }, 5000);

  console.log('Demo mode setup complete');
  console.log('Sample traces will be generated automatically');
  
  return debugVisualizer;
}

async function simulateAgentExecution(debugVisualizer: DebugVisualizer, agentName: string, taskType: string) {
  // This would simulate an agent execution for demo purposes
  console.log(`Simulating ${agentName} execution for ${taskType}`);
  
  // In a real scenario, this would be triggered by actual agent executions
  // For now, we just log the simulation
}

/**
 * Main function to run examples
 */
async function main() {
  const args = process.argv.slice(2);
  const example = args[0] || 'basic';

  console.log(`Running ${example} example...`);

  try {
    let result;
    
    switch (example) {
      case 'basic':
        result = await basicDebugSetup();
        break;
      case 'full':
        result = await fullIntegrationExample();
        break;
      case 'production':
        result = await productionMonitoringExample();
        break;
      case 'development':
        result = await developmentDebugExample();
        break;
      case 'custom':
        result = await customComponentExample();
        break;
      case 'health':
        result = await healthDashboardIntegrationExample();
        break;
      case 'demo':
        result = await testingDemoExample();
        break;
      default:
        console.error('Unknown example:', example);
        console.log('Available examples: basic, full, production, development, custom, health, demo');
        process.exit(1);
    }

    console.log(`${example} example completed successfully`);
    console.log('Press Ctrl+C to stop the debug visualizer');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\nShutting down debug visualizer...');
      if (result && typeof result.stop === 'function') {
        await result.stop();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error(`Failed to run ${example} example:`, error);
    process.exit(1);
  }
}

// Export for use in other modules
export {
  basicDebugSetup,
  fullIntegrationExample,
  productionMonitoringExample,
  developmentDebugExample,
  customComponentExample,
  healthDashboardIntegrationExample,
  testingDemoExample
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}