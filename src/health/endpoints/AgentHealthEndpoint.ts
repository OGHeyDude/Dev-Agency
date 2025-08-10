/**
 * Agent Health Endpoint - Individual agent health monitoring
 * 
 * @file AgentHealthEndpoint.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { 
  HealthCheck, 
  HealthLevel, 
  ComponentHealth, 
  ComponentType,
  AgentHealth 
} from '../models/HealthStatus';

export class AgentHealthEndpoint {
  private healthCheckManager: any;
  private agentManager: any;
  private agentHealthCache: Map<string, AgentHealth> = new Map();
  private lastHealthUpdate: Map<string, number> = new Map();

  constructor(healthCheckManager: any, agentManager: any) {
    this.healthCheckManager = healthCheckManager;
    this.agentManager = agentManager;
  }

  /**
   * Perform comprehensive agent health check
   */
  async checkHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    const checks = [];
    let overallStatus = HealthLevel.HEALTHY;
    const messages = [];

    try {
      if (!this.agentManager) {
        return {
          name: 'agent_health',
          status: HealthLevel.DEGRADED,
          message: 'Agent manager not available',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          metadata: { agentManagerAvailable: false }
        };
      }

      // Get all available agents
      const agents = await this.agentManager.getAllAgents();
      
      if (!agents || agents.length === 0) {
        return {
          name: 'agent_health',
          status: HealthLevel.DEGRADED,
          message: 'No agents available',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          metadata: { agentCount: 0 }
        };
      }

      // Check each agent's health
      const agentHealthPromises = agents.map(async (agent: any) => {
        try {
          const agentHealth = await this.checkIndividualAgentHealth(agent.name);
          const healthCheck: HealthCheck = {
            name: `agent_${agent.name}_health`,
            status: agentHealth.status,
            message: `${agent.name}: ${this.getAgentStatusMessage(agentHealth)}`,
            duration: 0,
            timestamp: new Date().toISOString(),
            metadata: { agent: agentHealth }
          };
          
          return healthCheck;
        } catch (error) {
          return {
            name: `agent_${agent.name}_health`,
            status: HealthLevel.CRITICAL,
            message: `${agent.name}: Health check failed - ${error instanceof Error ? error.message : String(error)}`,
            duration: 0,
            timestamp: new Date().toISOString(),
            metadata: { error: true, agentName: agent.name }
          };
        }
      });

      const agentChecks = await Promise.all(agentHealthPromises);
      checks.push(...agentChecks);

      // Determine overall agent system status
      const criticalAgents = agentChecks.filter(check => check.status === HealthLevel.CRITICAL);
      const unhealthyAgents = agentChecks.filter(check => check.status === HealthLevel.UNHEALTHY);
      const degradedAgents = agentChecks.filter(check => check.status === HealthLevel.DEGRADED);

      if (criticalAgents.length > 0) {
        overallStatus = HealthLevel.CRITICAL;
        messages.push(`${criticalAgents.length} agents critical`);
      } else if (unhealthyAgents.length > 0) {
        overallStatus = HealthLevel.UNHEALTHY;
        messages.push(`${unhealthyAgents.length} agents unhealthy`);
      } else if (degradedAgents.length > 0) {
        overallStatus = HealthLevel.DEGRADED;
        messages.push(`${degradedAgents.length} agents degraded`);
      }

      // Add cache performance check
      const cacheCheck = await this.checkAgentCacheHealth();
      checks.push(cacheCheck);
      if (cacheCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, cacheCheck.status);
        messages.push(cacheCheck.message);
      }

      const totalAgents = agents.length;
      const healthyAgents = agentChecks.filter(check => check.status === HealthLevel.HEALTHY).length;

      return {
        name: 'agent_health',
        status: overallStatus,
        message: messages.length > 0 ? messages.join('; ') : `All ${totalAgents} agents healthy`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: {
          totalAgents,
          healthyAgents,
          degradedAgents: degradedAgents.length,
          unhealthyAgents: unhealthyAgents.length,
          criticalAgents: criticalAgents.length,
          detailedChecks: checks
        }
      };

    } catch (error) {
      return {
        name: 'agent_health',
        status: HealthLevel.CRITICAL,
        message: `Agent health check failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { error: true }
      };
    }
  }

  /**
   * Check individual agent health
   */
  async checkIndividualAgentHealth(agentName: string): Promise<AgentHealth> {
    const now = Date.now();
    const cacheKey = agentName;
    
    // Check cache first (update every 30 seconds)
    const lastUpdate = this.lastHealthUpdate.get(cacheKey) || 0;
    if (now - lastUpdate < 30000 && this.agentHealthCache.has(cacheKey)) {
      return this.agentHealthCache.get(cacheKey)!;
    }

    try {
      // Get agent definition
      const agent = await this.agentManager.getAgent(agentName);
      if (!agent) {
        const agentHealth: AgentHealth = {
          agentName,
          status: HealthLevel.CRITICAL,
          availability: 0,
          averageResponseTime: 0,
          successRate: 0,
          errorCount: 0,
          circuitBreakerStatus: 'OPEN',
          metrics: {
            executionsToday: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageDuration: 0
          }
        };
        
        this.agentHealthCache.set(cacheKey, agentHealth);
        this.lastHealthUpdate.set(cacheKey, now);
        return agentHealth;
      }

      // Get execution metrics (if ExecutionEngine is available)
      let metrics = {
        executionsToday: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageDuration: 0
      };

      let averageResponseTime = 0;
      let successRate = 100;
      let errorCount = 0;
      let circuitBreakerStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

      // Try to get metrics from execution engine if available
      try {
        // This would integrate with the ExecutionEngine to get real metrics
        // For now, we'll simulate basic health status
        const testResult = await this.performAgentHealthTest(agentName);
        
        successRate = testResult.success ? 100 : 0;
        averageResponseTime = testResult.responseTime;
        errorCount = testResult.success ? 0 : 1;
        
        if (!testResult.success) {
          circuitBreakerStatus = 'OPEN';
        }
      } catch (error) {
        successRate = 0;
        errorCount = 1;
        circuitBreakerStatus = 'OPEN';
      }

      // Determine agent status
      let status = HealthLevel.HEALTHY;
      if (successRate < 50) {
        status = HealthLevel.CRITICAL;
      } else if (successRate < 80) {
        status = HealthLevel.UNHEALTHY;
      } else if (successRate < 95) {
        status = HealthLevel.DEGRADED;
      }

      // Calculate availability (simplified)
      const availability = successRate;

      const agentHealth: AgentHealth = {
        agentName,
        status,
        availability,
        averageResponseTime,
        successRate,
        errorCount,
        circuitBreakerStatus,
        metrics
      };

      // Cache the result
      this.agentHealthCache.set(cacheKey, agentHealth);
      this.lastHealthUpdate.set(cacheKey, now);

      return agentHealth;

    } catch (error) {
      const agentHealth: AgentHealth = {
        agentName,
        status: HealthLevel.CRITICAL,
        availability: 0,
        averageResponseTime: 0,
        successRate: 0,
        errorCount: 1,
        circuitBreakerStatus: 'OPEN',
        metrics: {
          executionsToday: 0,
          successfulExecutions: 0,
          failedExecutions: 1,
          averageDuration: 0
        }
      };

      this.agentHealthCache.set(cacheKey, agentHealth);
      this.lastHealthUpdate.set(cacheKey, now);
      return agentHealth;
    }
  }

  /**
   * Perform basic agent health test
   */
  private async performAgentHealthTest(agentName: string): Promise<{ success: boolean; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // Basic validation that agent exists and can be loaded
      const agent = await this.agentManager.getAgent(agentName);
      
      if (!agent) {
        return { success: false, responseTime: Date.now() - startTime };
      }

      // Check if agent has required properties
      const hasRequiredProperties = agent.name && agent.prompt_template;
      
      if (!hasRequiredProperties) {
        return { success: false, responseTime: Date.now() - startTime };
      }

      // Validate agent configuration
      const validation = await this.agentManager.validateAgent(agentName, {});
      
      if (!validation.valid) {
        return { success: false, responseTime: Date.now() - startTime };
      }

      return { success: true, responseTime: Date.now() - startTime };

    } catch (error) {
      return { success: false, responseTime: Date.now() - startTime };
    }
  }

  /**
   * Check agent cache health
   */
  private async checkAgentCacheHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      if (!this.agentManager) {
        return {
          name: 'agent_cache_health',
          status: HealthLevel.DEGRADED,
          message: 'Agent manager not available for cache check',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      // Check cache health if available
      const cacheHealth = this.agentManager.getCacheHealth ? 
        this.agentManager.getCacheHealth() : null;

      if (!cacheHealth) {
        return {
          name: 'agent_cache_health',
          status: HealthLevel.HEALTHY,
          message: 'Agent cache health check not available',
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          metadata: { cacheHealthAvailable: false }
        };
      }

      let status = HealthLevel.HEALTHY;
      let message = `Cache healthy (${(cacheHealth.hitRate * 100).toFixed(1)}% hit rate)`;

      if (!cacheHealth.healthy) {
        if (cacheHealth.issues.some((issue: string) => issue.includes('High'))) {
          status = HealthLevel.DEGRADED;
        } else {
          status = HealthLevel.UNHEALTHY;
        }
        message = `Cache issues: ${cacheHealth.issues.join(', ')}`;
      }

      return {
        name: 'agent_cache_health',
        status,
        message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: cacheHealth
      };

    } catch (error) {
      return {
        name: 'agent_cache_health',
        status: HealthLevel.CRITICAL,
        message: `Agent cache health check failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { error: true }
      };
    }
  }

  /**
   * Get all agent health information
   */
  async getAllAgentHealth(): Promise<ComponentHealth[]> {
    try {
      if (!this.agentManager) {
        return [];
      }

      const agents = await this.agentManager.getAllAgents();
      if (!agents || agents.length === 0) {
        return [];
      }

      const agentHealthPromises = agents.map(async (agent: any) => {
        const agentHealth = await this.checkIndividualAgentHealth(agent.name);
        
        const componentHealth: ComponentHealth = {
          component: agent.name,
          type: ComponentType.AGENT,
          status: agentHealth.status,
          checks: [{
            name: `${agent.name}_health`,
            status: agentHealth.status,
            message: this.getAgentStatusMessage(agentHealth),
            duration: 0,
            timestamp: new Date().toISOString(),
            metadata: agentHealth
          }],
          uptime: 0, // Would be calculated from agent metrics
          lastCheck: new Date().toISOString(),
          consecutiveFailures: agentHealth.errorCount,
          errorRate: 100 - agentHealth.successRate
        };

        return componentHealth;
      });

      return await Promise.all(agentHealthPromises);

    } catch (error) {
      console.error('Failed to get all agent health:', error);
      return [];
    }
  }

  /**
   * Get agent status message
   */
  private getAgentStatusMessage(agentHealth: AgentHealth): string {
    const { availability, averageResponseTime, successRate, circuitBreakerStatus } = agentHealth;
    
    return `${availability.toFixed(1)}% available, ${successRate.toFixed(1)}% success rate, ` +
           `${averageResponseTime}ms avg response, circuit breaker: ${circuitBreakerStatus}`;
  }

  /**
   * Get worst status between two health levels
   */
  private getWorstStatus(current: HealthLevel, newStatus: HealthLevel): HealthLevel {
    const statusPriority = {
      [HealthLevel.HEALTHY]: 0,
      [HealthLevel.DEGRADED]: 1,
      [HealthLevel.UNHEALTHY]: 2,
      [HealthLevel.CRITICAL]: 3
    };

    return statusPriority[newStatus] > statusPriority[current] ? newStatus : current;
  }

  /**
   * Get specific agent health
   */
  async getAgentHealth(agentName: string): Promise<AgentHealth | null> {
    try {
      return await this.checkIndividualAgentHealth(agentName);
    } catch (error) {
      console.error(`Failed to get health for agent ${agentName}:`, error);
      return null;
    }
  }

  /**
   * Clear agent health cache
   */
  clearCache(): void {
    this.agentHealthCache.clear();
    this.lastHealthUpdate.clear();
  }

  /**
   * Get cached agent health if available
   */
  getCachedAgentHealth(agentName: string): AgentHealth | null {
    return this.agentHealthCache.get(agentName) || null;
  }

  /**
   * Force refresh agent health
   */
  async refreshAgentHealth(agentName: string): Promise<AgentHealth> {
    // Clear cache for specific agent
    this.agentHealthCache.delete(agentName);
    this.lastHealthUpdate.delete(agentName);
    
    // Get fresh health data
    return await this.checkIndividualAgentHealth(agentName);
  }
}