/**
 * Health Collector - Real-time health data collection and aggregation
 * 
 * @file HealthCollector.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import * as fs from 'fs-extra';
import {
  AgentHealthStatus,
  SystemHealthSummary,
  ResourceStatus,
  DashboardMetrics,
  HealthCheckResult
} from '../models/RealTimeHealthStatus';
import { HealthLevel, ComponentHealth, SystemHealth } from '../../../health/models/HealthStatus';
import { HealthCheckManager } from '../../../health/HealthCheckManager';

export interface HealthCollectorConfig {
  collectionInterval: number; // milliseconds
  agentHealthTimeout: number; // milliseconds
  resourceMonitoringEnabled: boolean;
  historicalDataRetention: number; // hours
  cacheEnabled: boolean;
  cacheSize: number;
  enablePredictiveAnalysis: boolean;
}

export interface HealthDataCache {
  agentHealth: Map<string, AgentHealthStatus>;
  systemHealth?: SystemHealthSummary;
  resourceStatus: Map<string, ResourceStatus>;
  lastUpdate: Date;
}

export class HealthCollector extends EventEmitter {
  private config: HealthCollectorConfig;
  private healthCheckManager?: HealthCheckManager;
  private dataCache: HealthDataCache;
  private collectionTimer?: NodeJS.Timeout;
  private historicalData: Map<string, Array<{ timestamp: Date; data: any }>> = new Map();
  
  private isRunning = false;
  private collectionCount = 0;
  private lastCollectionTime = 0;

  constructor(
    config: Partial<HealthCollectorConfig>,
    healthCheckManager?: HealthCheckManager
  ) {
    super();
    
    this.config = {
      collectionInterval: 5000, // 5 seconds
      agentHealthTimeout: 30000, // 30 seconds
      resourceMonitoringEnabled: true,
      historicalDataRetention: 24, // 24 hours
      cacheEnabled: true,
      cacheSize: 1000,
      enablePredictiveAnalysis: false,
      ...config
    };

    this.healthCheckManager = healthCheckManager;
    this.dataCache = {
      agentHealth: new Map(),
      resourceStatus: new Map(),
      lastUpdate: new Date()
    };
  }

  /**
   * Start health data collection
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startCollection();
    
    this.emit('collector:started');
    console.log('Health Collector started');
  }

  /**
   * Stop health data collection
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = undefined;
    }
    
    this.emit('collector:stopped');
    console.log('Health Collector stopped');
  }

  /**
   * Start periodic data collection
   */
  private startCollection(): void {
    this.collectionTimer = setInterval(async () => {
      try {
        const startTime = Date.now();
        await this.collectAllHealthData();
        const duration = Date.now() - startTime;
        
        this.collectionCount++;
        this.lastCollectionTime = duration;
        
        this.emit('collection:completed', {
          duration,
          collectionCount: this.collectionCount,
          cacheSize: this.dataCache.agentHealth.size
        });
        
      } catch (error) {
        console.error('Health collection failed:', error);
        this.emit('collection:error', error);
      }
    }, this.config.collectionInterval);
  }

  /**
   * Collect all health data
   */
  private async collectAllHealthData(): Promise<void> {
    const tasks: Promise<any>[] = [];

    // Collect system health
    tasks.push(this.collectSystemHealth());

    // Collect resource status
    if (this.config.resourceMonitoringEnabled) {
      tasks.push(this.collectResourceStatus());
    }

    // Collect agent health
    tasks.push(this.collectAgentHealth());

    // Wait for all collections to complete
    await Promise.allSettled(tasks);

    // Update cache timestamp
    this.dataCache.lastUpdate = new Date();

    // Clean up historical data
    this.cleanupHistoricalData();

    // Emit aggregated health update
    this.emitHealthUpdate();
  }

  /**
   * Collect system health from HealthCheckManager
   */
  private async collectSystemHealth(): Promise<void> {
    if (!this.healthCheckManager) {
      return;
    }

    try {
      const systemHealth = await this.healthCheckManager.getSystemHealth();
      const summary = this.convertToSystemHealthSummary(systemHealth);
      
      this.dataCache.systemHealth = summary;
      this.storeHistoricalData('system', summary);
      
      this.emit('health:system-updated', summary);
      
    } catch (error) {
      console.error('Failed to collect system health:', error);
    }
  }

  /**
   * Collect resource status (CPU, memory, disk, network)
   */
  private async collectResourceStatus(): Promise<void> {
    try {
      const resourceStatus = {
        cpu: await this.collectCpuStatus(),
        memory: await this.collectMemoryStatus(),
        disk: await this.collectDiskStatus(),
        network: await this.collectNetworkStatus()
      };

      // Update cache
      Object.entries(resourceStatus).forEach(([resource, status]) => {
        this.dataCache.resourceStatus.set(resource, status);
        this.storeHistoricalData(`resource-${resource}`, status);
      });

      this.emit('health:resources-updated', resourceStatus);
      
    } catch (error) {
      console.error('Failed to collect resource status:', error);
    }
  }

  /**
   * Collect agent health data
   */
  private async collectAgentHealth(): Promise<void> {
    if (!this.healthCheckManager) {
      return;
    }

    try {
      // Get agent health from health check manager
      const agentStates = this.healthCheckManager.getComponentStates();
      const agentHealthStatuses = new Map<string, AgentHealthStatus>();

      agentStates.forEach((componentHealth, component) => {
        if (componentHealth.type === 'agent' || component.includes('agent')) {
          const agentHealth = this.convertToAgentHealthStatus(component, componentHealth);
          agentHealthStatuses.set(component, agentHealth);
          
          this.dataCache.agentHealth.set(component, agentHealth);
          this.storeHistoricalData(`agent-${component}`, agentHealth);
        }
      });

      this.emit('health:agents-updated', Array.from(agentHealthStatuses.values()));
      
    } catch (error) {
      console.error('Failed to collect agent health:', error);
    }
  }

  /**
   * Collect CPU status
   */
  private async collectCpuStatus(): Promise<ResourceStatus> {
    const cpus = os.cpus();
    const numCpus = cpus.length;
    
    // Calculate CPU usage (simplified)
    const loadAvg = os.loadavg();
    const usage = Math.min((loadAvg[0] / numCpus) * 100, 100);

    return {
      current: usage,
      usage: usage,
      threshold: {
        warning: 70,
        critical: 90
      },
      status: usage > 90 ? HealthLevel.CRITICAL : usage > 70 ? HealthLevel.DEGRADED : HealthLevel.HEALTHY,
      trend: this.calculateTrend('cpu', usage)
    };
  }

  /**
   * Collect memory status
   */
  private async collectMemoryStatus(): Promise<ResourceStatus> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usage = (usedMem / totalMem) * 100;

    return {
      current: usedMem,
      usage: usage,
      threshold: {
        warning: 80,
        critical: 95
      },
      status: usage > 95 ? HealthLevel.CRITICAL : usage > 80 ? HealthLevel.DEGRADED : HealthLevel.HEALTHY,
      trend: this.calculateTrend('memory', usage)
    };
  }

  /**
   * Collect disk status
   */
  private async collectDiskStatus(): Promise<ResourceStatus> {
    try {
      const stats = await fs.stat('/');
      // This is a simplified disk usage calculation
      // In a real implementation, you'd use a library like 'diskusage'
      const usage = 50; // Placeholder value

      return {
        current: usage,
        usage: usage,
        threshold: {
          warning: 85,
          critical: 95
        },
        status: usage > 95 ? HealthLevel.CRITICAL : usage > 85 ? HealthLevel.DEGRADED : HealthLevel.HEALTHY,
        trend: this.calculateTrend('disk', usage)
      };
    } catch (error) {
      return {
        current: 0,
        usage: 0,
        threshold: { warning: 85, critical: 95 },
        status: HealthLevel.HEALTHY,
        trend: 'stable'
      };
    }
  }

  /**
   * Collect network status
   */
  private async collectNetworkStatus(): Promise<ResourceStatus> {
    // Simplified network status
    const interfaces = os.networkInterfaces();
    const activeInterfaces = Object.keys(interfaces).length;
    
    return {
      current: activeInterfaces,
      usage: activeInterfaces > 0 ? 100 : 0,
      threshold: {
        warning: 0,
        critical: 0
      },
      status: activeInterfaces > 0 ? HealthLevel.HEALTHY : HealthLevel.CRITICAL,
      trend: 'stable'
    };
  }

  /**
   * Convert SystemHealth to SystemHealthSummary
   */
  private convertToSystemHealthSummary(systemHealth: SystemHealth): SystemHealthSummary {
    // Count agents by status
    const agentComponents = systemHealth.components.filter(c => c.type === 'agent');
    const agentCount = {
      total: agentComponents.length,
      running: agentComponents.filter(c => c.status === HealthLevel.HEALTHY).length,
      idle: 0, // This would need to be determined from actual agent status
      failed: agentComponents.filter(c => c.status === HealthLevel.CRITICAL).length,
      blocked: 0, // This would need to be determined from actual agent status
      recovering: agentComponents.filter(c => c.status === HealthLevel.DEGRADED).length
    };

    // Get resource status from cache
    const resourceStatus = {
      cpu: this.dataCache.resourceStatus.get('cpu') || this.createDefaultResourceStatus(),
      memory: this.dataCache.resourceStatus.get('memory') || this.createDefaultResourceStatus(),
      disk: this.dataCache.resourceStatus.get('disk') || this.createDefaultResourceStatus(),
      network: this.dataCache.resourceStatus.get('network') || this.createDefaultResourceStatus()
    };

    return {
      overall: systemHealth.status,
      timestamp: systemHealth.timestamp,
      uptime: systemHealth.uptime,
      agentCount,
      resourceStatus,
      alertCount: {
        critical: systemHealth.summary.critical,
        warning: systemHealth.summary.degraded + systemHealth.summary.unhealthy,
        total: systemHealth.summary.critical + systemHealth.summary.degraded + systemHealth.summary.unhealthy
      },
      healthTrend: this.calculateSystemTrend(systemHealth)
    };
  }

  /**
   * Convert ComponentHealth to AgentHealthStatus
   */
  private convertToAgentHealthStatus(agentId: string, componentHealth: ComponentHealth): AgentHealthStatus {
    const status = this.mapHealthLevelToAgentStatus(componentHealth.status);
    
    // Calculate health score based on various factors
    const healthScore = this.calculateHealthScore(componentHealth);
    
    return {
      agentId,
      status,
      lastActivity: new Date(componentHealth.lastCheck),
      resourceUsage: {
        cpuPercent: 0, // Would be collected from actual agent metrics
        memoryMB: 0,   // Would be collected from actual agent metrics
        tokensUsed: 0  // Would be collected from actual agent metrics
      },
      performanceMetrics: {
        avgResponseTime: 0,     // Would be calculated from historical data
        errorRate: componentHealth.errorRate,
        successRate: Math.max(0, 100 - componentHealth.errorRate)
      },
      healthScore,
      metadata: {
        consecutiveFailures: componentHealth.consecutiveFailures,
        uptime: componentHealth.uptime,
        checks: componentHealth.checks.length
      }
    };
  }

  /**
   * Map HealthLevel to agent status
   */
  private mapHealthLevelToAgentStatus(level: HealthLevel): AgentHealthStatus['status'] {
    switch (level) {
      case HealthLevel.HEALTHY:
        return 'running';
      case HealthLevel.DEGRADED:
        return 'recovering';
      case HealthLevel.UNHEALTHY:
        return 'blocked';
      case HealthLevel.CRITICAL:
        return 'failed';
      default:
        return 'idle';
    }
  }

  /**
   * Calculate health score for agent
   */
  private calculateHealthScore(componentHealth: ComponentHealth): number {
    let score = 100;

    // Reduce score based on consecutive failures
    score -= componentHealth.consecutiveFailures * 10;

    // Reduce score based on error rate
    score -= componentHealth.errorRate * 2;

    // Reduce score based on status
    switch (componentHealth.status) {
      case HealthLevel.DEGRADED:
        score -= 20;
        break;
      case HealthLevel.UNHEALTHY:
        score -= 40;
        break;
      case HealthLevel.CRITICAL:
        score -= 60;
        break;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate trend for metric
   */
  private calculateTrend(metric: string, currentValue: number): 'up' | 'down' | 'stable' {
    const historical = this.historicalData.get(metric);
    if (!historical || historical.length < 2) {
      return 'stable';
    }

    const recent = historical.slice(-3).map(h => h.data.usage || h.data.current || currentValue);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;

    if (currentValue > avg * 1.1) return 'up';
    if (currentValue < avg * 0.9) return 'down';
    return 'stable';
  }

  /**
   * Calculate system health trend
   */
  private calculateSystemTrend(systemHealth: SystemHealth): 'improving' | 'stable' | 'degrading' {
    const healthyCount = systemHealth.summary.healthy;
    const totalCount = systemHealth.components.length;
    const healthyRatio = totalCount > 0 ? healthyCount / totalCount : 1;

    const historical = this.historicalData.get('system');
    if (!historical || historical.length < 2) {
      return 'stable';
    }

    const recentRatios = historical.slice(-3).map(h => {
      const summary = h.data.summary || { healthy: 0 };
      const components = h.data.components || [];
      return components.length > 0 ? summary.healthy / components.length : 1;
    });

    const avgRatio = recentRatios.reduce((sum, ratio) => sum + ratio, 0) / recentRatios.length;

    if (healthyRatio > avgRatio * 1.1) return 'improving';
    if (healthyRatio < avgRatio * 0.9) return 'degrading';
    return 'stable';
  }

  /**
   * Store historical data
   */
  private storeHistoricalData(key: string, data: any): void {
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, []);
    }

    const historical = this.historicalData.get(key)!;
    historical.push({
      timestamp: new Date(),
      data: JSON.parse(JSON.stringify(data)) // Deep copy
    });

    // Limit historical data size
    const maxSize = Math.floor(this.config.cacheSize / 10);
    if (historical.length > maxSize) {
      historical.splice(0, historical.length - maxSize);
    }
  }

  /**
   * Clean up old historical data
   */
  private cleanupHistoricalData(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - this.config.historicalDataRetention);

    this.historicalData.forEach((data, key) => {
      const filtered = data.filter(entry => entry.timestamp > cutoffTime);
      this.historicalData.set(key, filtered);
    });
  }

  /**
   * Emit health update event
   */
  private emitHealthUpdate(): void {
    if (!this.dataCache.systemHealth) {
      return;
    }

    this.emit('health:update', {
      system: this.dataCache.systemHealth,
      agents: Array.from(this.dataCache.agentHealth.values()),
      resources: Object.fromEntries(this.dataCache.resourceStatus),
      timestamp: this.dataCache.lastUpdate.toISOString()
    });
  }

  /**
   * Create default resource status
   */
  private createDefaultResourceStatus(): ResourceStatus {
    return {
      current: 0,
      usage: 0,
      threshold: { warning: 70, critical: 90 },
      status: HealthLevel.HEALTHY,
      trend: 'stable'
    };
  }

  /**
   * Get current health data from cache
   */
  getCurrentHealthData() {
    return {
      system: this.dataCache.systemHealth,
      agents: Array.from(this.dataCache.agentHealth.values()),
      resources: Object.fromEntries(this.dataCache.resourceStatus),
      lastUpdate: this.dataCache.lastUpdate,
      cacheSize: this.dataCache.agentHealth.size
    };
  }

  /**
   * Get historical data for a metric
   */
  getHistoricalData(key: string, limit?: number) {
    const data = this.historicalData.get(key) || [];
    return limit ? data.slice(-limit) : data;
  }

  /**
   * Get collector statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      collectionCount: this.collectionCount,
      lastCollectionTime: this.lastCollectionTime,
      cacheSize: this.dataCache.agentHealth.size,
      historicalDataKeys: this.historicalData.size,
      lastUpdate: this.dataCache.lastUpdate,
      config: this.config
    };
  }

  /**
   * Force immediate data collection
   */
  async forceCollection(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Collector is not running');
    }

    await this.collectAllHealthData();
  }
}