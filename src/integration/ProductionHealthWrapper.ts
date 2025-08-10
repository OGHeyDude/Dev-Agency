/**
 * Production Health Wrapper - Integration with existing Dev-Agency components
 * 
 * @file ProductionHealthWrapper.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { ProductionHealthSystem } from '../index';
import { DegradationLevel, DegradationReason } from '../degradation/DegradationManager';

export interface ExecutionWrapper {
  agentName: string;
  originalFunction: Function;
  context: any;
}

/**
 * Wrapper that integrates production health monitoring with existing Dev-Agency components
 */
export class ProductionHealthWrapper {
  private healthSystem: ProductionHealthSystem;
  private wrappedExecutions = new Map<string, ExecutionWrapper>();
  private integrationActive = false;

  constructor(healthSystemConfig?: any) {
    this.healthSystem = new ProductionHealthSystem(healthSystemConfig);
  }

  /**
   * Initialize and start the health system
   */
  async initialize(): Promise<void> {
    await this.healthSystem.start();
    this.integrationActive = true;
    console.log('Production Health Wrapper initialized');
  }

  /**
   * Stop the health system
   */
  async shutdown(): Promise<void> {
    this.integrationActive = false;
    await this.healthSystem.stop();
    console.log('Production Health Wrapper shut down');
  }

  /**
   * Wrap AgentManager with health monitoring
   */
  wrapAgentManager(agentManager: any): any {
    if (!this.integrationActive) {
      return agentManager;
    }

    const { circuitBreakerManager, degradationManager } = this.healthSystem.getComponents();
    const wrapper = this;

    // Wrap getAgent method to add circuit breaker protection
    const originalGetAgent = agentManager.getAgent.bind(agentManager);
    agentManager.getAgent = async function(agentName: string) {
      const circuitBreaker = circuitBreakerManager.getAgentCircuitBreaker(agentName);
      
      try {
        return await circuitBreaker.execute(
          async () => originalGetAgent(agentName),
          { agentName }
        );
      } catch (error) {
        // Trigger degradation if agent loading fails
        await degradationManager.triggerDegradation({
          trigger: DegradationReason.AGENT_UNAVAILABLE,
          component: agentName,
          severity: DegradationLevel.SIGNIFICANT,
          timestamp: new Date().toISOString(),
          metadata: { error: error instanceof Error ? error.message : String(error) }
        });
        throw error;
      }
    };

    // Wrap validateAgent method
    const originalValidateAgent = agentManager.validateAgent.bind(agentManager);
    agentManager.validateAgent = async function(agentName: string, options: any) {
      const circuitBreaker = circuitBreakerManager.getAgentCircuitBreaker(agentName);
      
      try {
        return await circuitBreaker.execute(
          async () => originalValidateAgent(agentName, options),
          { agentName, task: 'validation' }
        );
      } catch (error) {
        console.warn(`Agent validation failed for ${agentName}:`, error);
        throw error;
      }
    };

    console.log('AgentManager wrapped with production health monitoring');
    return agentManager;
  }

  /**
   * Wrap ExecutionEngine with health monitoring
   */
  wrapExecutionEngine(executionEngine: any): any {
    if (!this.integrationActive) {
      return executionEngine;
    }

    const { circuitBreakerManager, degradationManager } = this.healthSystem.getComponents();
    const wrapper = this;

    // Wrap executeSingle method
    const originalExecuteSingle = executionEngine.executeSingle.bind(executionEngine);
    executionEngine.executeSingle = async function(options: any) {
      const agentName = options.agentName;
      const circuitBreaker = circuitBreakerManager.getAgentCircuitBreaker(agentName);
      
      try {
        return await circuitBreaker.execute(
          async (context) => {
            const result = await originalExecuteSingle(options);
            
            // Cache successful responses for fallback
            if (result.success && result.output) {
              wrapper.cacheSuccessfulResponse(agentName, options.task || '', result.output);
            }
            
            return result;
          },
          {
            agentName,
            task: options.task,
            contextPath: options.contextPath,
            timeout: options.timeout
          }
        );
      } catch (error) {
        // Try degradation strategies
        try {
          const degradationContext = {
            trigger: DegradationReason.AGENT_UNAVAILABLE,
            component: agentName,
            severity: DegradationLevel.SIGNIFICANT,
            timestamp: new Date().toISOString(),
            metadata: { 
              originalOptions: options,
              error: error instanceof Error ? error.message : String(error) 
            }
          };

          await degradationManager.triggerDegradation(degradationContext);
          
          // Attempt degraded execution
          const fallbackResult = await degradationManager.handleDegradedRequest(
            options,
            degradationContext
          );
          
          return fallbackResult;
        } catch (degradationError) {
          console.error(`Both primary and degraded execution failed for ${agentName}:`, degradationError);
          throw error; // Throw original error
        }
      }
    };

    // Wrap executeBatch method
    const originalExecuteBatch = executionEngine.executeBatch.bind(executionEngine);
    executionEngine.executeBatch = async function(options: any) {
      const results = [];
      
      for (const agentName of options.agents) {
        try {
          const singleResult = await executionEngine.executeSingle({
            agentName,
            contextPath: options.contextPath,
            outputPath: options.outputPath ? `${options.outputPath}_${agentName}` : undefined,
            format: options.format
          });
          results.push(singleResult);
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            agent: agentName,
            timestamp: new Date().toISOString(),
            metrics: { duration: 0, context_size: 0 }
          });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      
      return {
        total: results.length,
        successful,
        failed,
        results,
        summary: `Batch execution completed: ${successful}/${results.length} successful`
      };
    };

    console.log('ExecutionEngine wrapped with production health monitoring');
    return executionEngine;
  }

  /**
   * Cache successful response for fallback use
   */
  private cacheSuccessfulResponse(agentName: string, task: string, output: any): void {
    const { degradationManager } = this.healthSystem.getComponents();
    const strategies = degradationManager.strategies || new Map();
    
    // Find cached response strategy
    for (const strategy of strategies.values()) {
      if (strategy.name === 'cached_response' && typeof strategy.cacheAgentResponse === 'function') {
        strategy.cacheAgentResponse(agentName, task, output);
        break;
      }
    }
  }

  /**
   * Get health system status
   */
  async getHealthStatus(): Promise<any> {
    return await this.healthSystem.getSystemStatus();
  }

  /**
   * Get health check result for external monitoring
   */
  async healthCheck(): Promise<any> {
    return await this.healthSystem.healthCheck();
  }

  /**
   * Force recovery of all components
   */
  async forceRecovery(): Promise<void> {
    await this.healthSystem.forceRecovery();
  }

  /**
   * Get monitoring dashboard URL
   */
  getDashboardUrl(): string {
    const config = this.healthSystem.getConfig();
    const port = config.monitoring?.port || 3001;
    return `http://localhost:${port}/dashboard`;
  }

  /**
   * Get component references for advanced usage
   */
  getHealthSystem(): ProductionHealthSystem {
    return this.healthSystem;
  }

  /**
   * Create a simple factory function for easy integration
   */
  static async createIntegratedSystem(
    agentManager: any,
    executionEngine: any,
    config?: any
  ): Promise<{
    agentManager: any;
    executionEngine: any;
    healthWrapper: ProductionHealthWrapper;
    healthSystem: ProductionHealthSystem;
  }> {
    const healthWrapper = new ProductionHealthWrapper(config);
    await healthWrapper.initialize();
    
    const wrappedAgentManager = healthWrapper.wrapAgentManager(agentManager);
    const wrappedExecutionEngine = healthWrapper.wrapExecutionEngine(executionEngine);
    
    console.log('Integrated system created with production health monitoring');
    console.log(`Dashboard available at: ${healthWrapper.getDashboardUrl()}`);
    
    return {
      agentManager: wrappedAgentManager,
      executionEngine: wrappedExecutionEngine,
      healthWrapper,
      healthSystem: healthWrapper.getHealthSystem()
    };
  }

  /**
   * Express middleware for health checks
   */
  static createHealthCheckMiddleware(wrapper: ProductionHealthWrapper) {
    return async (req: any, res: any, next: any) => {
      if (req.path === '/health') {
        try {
          const health = await wrapper.healthCheck();
          res.json(health);
        } catch (error) {
          res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error)
          });
        }
      } else {
        next();
      }
    };
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats(): {
    active: boolean;
    wrappedComponents: string[];
    healthSystemStatus: any;
    uptime: number;
  } {
    return {
      active: this.integrationActive,
      wrappedComponents: ['AgentManager', 'ExecutionEngine'],
      healthSystemStatus: this.healthSystem.isRunning() ? 'running' : 'stopped',
      uptime: process.uptime()
    };
  }

  /**
   * Handle graceful shutdown
   */
  async gracefulShutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}, initiating graceful shutdown...`);
    
    try {
      // Stop accepting new requests
      this.integrationActive = false;
      
      // Wait for active operations to complete (simplified)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Shutdown health system
      await this.shutdown();
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}