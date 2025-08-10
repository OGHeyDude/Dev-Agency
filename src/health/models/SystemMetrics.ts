/**
 * System Metrics Data Models - Performance and operational metrics structures
 * 
 * @file SystemMetrics.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  tags?: Record<string, string>;
}

export interface TimeSeries {
  name: string;
  unit: string;
  dataPoints: MetricDataPoint[];
}

export interface AgentMetrics {
  agentName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageResponseTime: number;
  medianResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  throughputPerMinute: number;
  concurrentExecutions: number;
  queuedExecutions: number;
  lastExecutionTime?: string;
  memoryUsage: number;
  cpuUsage: number;
  responseTimeTrend: TimeSeries;
  errorRateTrend: TimeSeries;
  throughputTrend: TimeSeries;
}

export interface SystemResourceMetrics {
  timestamp: string;
  cpu: {
    totalUsage: number;
    userUsage: number;
    systemUsage: number;
    idlePercentage: number;
    loadAverage1m: number;
    loadAverage5m: number;
    loadAverage15m: number;
    coreCount: number;
  };
  memory: {
    totalMB: number;
    usedMB: number;
    freeMB: number;
    availableMB: number;
    usagePercentage: number;
    buffersCacheMB: number;
    swapUsedMB: number;
    swapTotalMB: number;
  };
  disk: {
    totalGB: number;
    usedGB: number;
    availableGB: number;
    usagePercentage: number;
    readBytesPerSec: number;
    writeBytesPerSec: number;
    iopsRead: number;
    iopsWrite: number;
    ioWaitTime: number;
  };
  network: {
    bytesInPerSec: number;
    bytesOutPerSec: number;
    packetsInPerSec: number;
    packetsOutPerSec: number;
    errorRate: number;
    dropRate: number;
    connectionsActive: number;
    connectionsTotal: number;
  };
  process: {
    processCount: number;
    threadCount: number;
    fileDescriptors: number;
    uptime: number;
    restarts: number;
    gcPauses: number;
    heapUsedMB: number;
    heapTotalMB: number;
  };
}

export interface CacheMetrics {
  name: string;
  hitCount: number;
  missCount: number;
  totalRequests: number;
  hitRate: number;
  evictionCount: number;
  totalEntries: number;
  memoryUsageMB: number;
  averageResponseTimeMs: number;
  maxEntrySizeMB: number;
  oldestEntryAge: number;
}

export interface DatabaseMetrics {
  connectionPoolSize: number;
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  deadlocks: number;
  replicationLag?: number;
}

export interface QueueMetrics {
  queueName: string;
  totalMessages: number;
  processedMessages: number;
  failedMessages: number;
  pendingMessages: number;
  averageProcessingTime: number;
  throughputPerMinute: number;
  oldestPendingMessage: number;
  deadLetterCount: number;
}

export interface PerformanceMetrics {
  timestamp: string;
  agents: AgentMetrics[];
  system: SystemResourceMetrics;
  caches: CacheMetrics[];
  databases: DatabaseMetrics[];
  queues: QueueMetrics[];
  customMetrics: Record<string, number | string>;
}

export interface BusinessMetrics {
  totalUsers: number;
  activeUsers: number;
  totalExecutions: number;
  executionsPerHour: number;
  successRate: number;
  averageUserResponseTime: number;
  costPerExecution: number;
  revenue: number;
  customerSatisfactionScore: number;
}

export interface SecurityMetrics {
  authenticationAttempts: number;
  authenticationFailures: number;
  authorizationFailures: number;
  suspiciousActivities: number;
  blockedRequests: number;
  rateLimit: {
    totalRequests: number;
    blockedRequests: number;
    topSourceIPs: Array<{
      ip: string;
      requests: number;
    }>;
  };
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface MetricsCollection {
  timestamp: string;
  collectionDuration: number;
  performance: PerformanceMetrics;
  business: BusinessMetrics;
  security: SecurityMetrics;
  metadata: {
    version: string;
    environment: string;
    region: string;
    collector: string;
  };
}

export interface MetricThreshold {
  name: string;
  warningValue: number;
  criticalValue: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  unit: string;
  description: string;
}

export interface MetricAlert extends MetricThreshold {
  triggered: boolean;
  triggeredAt?: string;
  currentValue: number;
  severity: 'warning' | 'critical';
  message: string;
}