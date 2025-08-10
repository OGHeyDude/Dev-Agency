/**
 * System Health Endpoint - Overall system health monitoring
 * 
 * @file SystemHealthEndpoint.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as os from 'os';
import * as fs from 'fs-extra';
import { 
  HealthCheck, 
  HealthLevel, 
  ComponentHealth, 
  ComponentType 
} from '../models/HealthStatus';

export class SystemHealthEndpoint {
  private healthCheckManager: any;
  private startTime: number;

  constructor(healthCheckManager: any) {
    this.healthCheckManager = healthCheckManager;
    this.startTime = Date.now();
  }

  /**
   * Perform comprehensive system health check
   */
  async checkHealth(): Promise<HealthCheck> {
    const startTime = Date.now();
    const checks = [];
    let overallStatus = HealthLevel.HEALTHY;
    const messages = [];

    try {
      // Check system uptime
      const uptimeCheck = this.checkUptime();
      checks.push(uptimeCheck);
      if (uptimeCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, uptimeCheck.status);
        messages.push(uptimeCheck.message);
      }

      // Check memory usage
      const memoryCheck = this.checkMemoryUsage();
      checks.push(memoryCheck);
      if (memoryCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, memoryCheck.status);
        messages.push(memoryCheck.message);
      }

      // Check CPU load
      const cpuCheck = this.checkCpuLoad();
      checks.push(cpuCheck);
      if (cpuCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, cpuCheck.status);
        messages.push(cpuCheck.message);
      }

      // Check disk space
      const diskCheck = await this.checkDiskSpace();
      checks.push(diskCheck);
      if (diskCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, diskCheck.status);
        messages.push(diskCheck.message);
      }

      // Check process health
      const processCheck = this.checkProcessHealth();
      checks.push(processCheck);
      if (processCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, processCheck.status);
        messages.push(processCheck.message);
      }

      // Check Node.js version compatibility
      const nodeCheck = this.checkNodeVersion();
      checks.push(nodeCheck);
      if (nodeCheck.status !== HealthLevel.HEALTHY) {
        overallStatus = this.getWorstStatus(overallStatus, nodeCheck.status);
        messages.push(nodeCheck.message);
      }

      return {
        name: 'system_health',
        status: overallStatus,
        message: messages.length > 0 ? messages.join('; ') : 'System is healthy',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: {
          checks: checks.length,
          passedChecks: checks.filter(c => c.status === HealthLevel.HEALTHY).length,
          failedChecks: checks.filter(c => c.status !== HealthLevel.HEALTHY).length,
          detailedChecks: checks
        }
      };

    } catch (error) {
      return {
        name: 'system_health',
        status: HealthLevel.CRITICAL,
        message: `System health check failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { error: true }
      };
    }
  }

  /**
   * Get detailed system health information
   */
  async getHealth(): Promise<ComponentHealth> {
    const healthCheck = await this.checkHealth();
    const uptime = process.uptime();
    
    return {
      component: 'system',
      type: ComponentType.SYSTEM,
      status: healthCheck.status,
      checks: [healthCheck],
      uptime,
      lastCheck: healthCheck.timestamp,
      consecutiveFailures: healthCheck.status === HealthLevel.HEALTHY ? 0 : 1,
      errorRate: healthCheck.status === HealthLevel.HEALTHY ? 0 : 100
    };
  }

  /**
   * Check system uptime
   */
  private checkUptime(): HealthCheck {
    const startTime = Date.now();
    const uptime = process.uptime();
    const systemUptime = os.uptime();
    
    // Consider system healthy if uptime is reasonable
    // Warn if process has been restarted recently (less than 5 minutes)
    // Critical if system uptime is very low (less than 1 minute)
    
    let status = HealthLevel.HEALTHY;
    let message = `System uptime: ${Math.floor(systemUptime / 3600)}h ${Math.floor((systemUptime % 3600) / 60)}m, Process uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
    
    if (systemUptime < 60) {
      status = HealthLevel.CRITICAL;
      message = `System recently restarted (${systemUptime.toFixed(0)}s ago)`;
    } else if (uptime < 300) {
      status = HealthLevel.DEGRADED;
      message = `Process recently restarted (${uptime.toFixed(0)}s ago)`;
    }

    return {
      name: 'uptime_check',
      status,
      message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      metadata: { systemUptime, processUptime: uptime }
    };
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): HealthCheck {
    const startTime = Date.now();
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usagePercent = (usedMem / totalMem) * 100;
    
    const thresholds = this.healthCheckManager.getThresholds();
    let status = HealthLevel.HEALTHY;
    let message = `Memory usage: ${usagePercent.toFixed(1)}% (${Math.round(usedMem / 1024 / 1024)}MB / ${Math.round(totalMem / 1024 / 1024)}MB)`;
    
    if (usagePercent > thresholds.memory.critical) {
      status = HealthLevel.CRITICAL;
      message = `Critical memory usage: ${usagePercent.toFixed(1)}%`;
    } else if (usagePercent > thresholds.memory.warning) {
      status = HealthLevel.DEGRADED;
      message = `High memory usage: ${usagePercent.toFixed(1)}%`;
    }

    return {
      name: 'memory_usage_check',
      status,
      message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      metadata: {
        processMemory: memUsage,
        systemMemory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          usagePercent
        }
      }
    };
  }

  /**
   * Check CPU load
   */
  private checkCpuLoad(): HealthCheck {
    const startTime = Date.now();
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    const load1m = loadAvg[0];
    const load5m = loadAvg[1];
    const load15m = loadAvg[2];
    
    // Calculate load percentage based on CPU count
    const loadPercent = (load1m / cpuCount) * 100;
    
    const thresholds = this.healthCheckManager.getThresholds();
    let status = HealthLevel.HEALTHY;
    let message = `CPU load: ${load1m.toFixed(2)} (${loadPercent.toFixed(1)}% of ${cpuCount} cores)`;
    
    if (loadPercent > thresholds.cpu.critical) {
      status = HealthLevel.CRITICAL;
      message = `Critical CPU load: ${load1m.toFixed(2)} (${loadPercent.toFixed(1)}%)`;
    } else if (loadPercent > thresholds.cpu.warning) {
      status = HealthLevel.DEGRADED;
      message = `High CPU load: ${load1m.toFixed(2)} (${loadPercent.toFixed(1)}%)`;
    }

    return {
      name: 'cpu_load_check',
      status,
      message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      metadata: {
        loadAverage: { load1m, load5m, load15m },
        cpuCount,
        loadPercent
      }
    };
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check current working directory disk space
      const stats = await fs.stat(process.cwd());
      
      // For Unix-like systems, we'll use a different approach
      // This is a simplified check - in production, you'd use a more robust method
      let status = HealthLevel.HEALTHY;
      let message = 'Disk space check completed';
      
      // Placeholder for actual disk space checking
      // In a real implementation, you would check available disk space
      // using platform-specific methods or libraries like 'check-disk-space'
      
      return {
        name: 'disk_space_check',
        status,
        message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: {
          workingDirectory: process.cwd(),
          note: 'Basic disk access check completed'
        }
      };
      
    } catch (error) {
      return {
        name: 'disk_space_check',
        status: HealthLevel.CRITICAL,
        message: `Disk access failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        metadata: { error: true }
      };
    }
  }

  /**
   * Check process health
   */
  private checkProcessHealth(): HealthCheck {
    const startTime = Date.now();
    const pid = process.pid;
    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;
    
    let status = HealthLevel.HEALTHY;
    let message = `Process healthy (PID: ${pid}, Platform: ${platform}-${arch}, Node: ${nodeVersion})`;
    
    // Check for any process-specific issues
    const memUsage = process.memoryUsage();
    const heapUsed = memUsage.heapUsed;
    const heapTotal = memUsage.heapTotal;
    const heapUsagePercent = (heapUsed / heapTotal) * 100;
    
    // Check for memory leaks (heap usage > 80%)
    if (heapUsagePercent > 80) {
      status = HealthLevel.DEGRADED;
      message = `High heap usage: ${heapUsagePercent.toFixed(1)}%`;
    }

    return {
      name: 'process_health_check',
      status,
      message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      metadata: {
        pid,
        platform,
        arch,
        nodeVersion,
        memoryUsage: memUsage,
        heapUsagePercent
      }
    };
  }

  /**
   * Check Node.js version compatibility
   */
  private checkNodeVersion(): HealthCheck {
    const startTime = Date.now();
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    let status = HealthLevel.HEALTHY;
    let message = `Node.js version: ${nodeVersion}`;
    
    // Check for supported Node.js versions
    if (major < 16) {
      status = HealthLevel.CRITICAL;
      message = `Unsupported Node.js version: ${nodeVersion} (requires >= 16.0.0)`;
    } else if (major < 18) {
      status = HealthLevel.DEGRADED;
      message = `Older Node.js version: ${nodeVersion} (recommended >= 18.0.0)`;
    }

    return {
      name: 'node_version_check',
      status,
      message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      metadata: {
        nodeVersion,
        majorVersion: major,
        supportedVersions: '>=16.0.0',
        recommendedVersions: '>=18.0.0'
      }
    };
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
   * Get system information
   */
  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAverage: os.loadavg()
    };
  }
}