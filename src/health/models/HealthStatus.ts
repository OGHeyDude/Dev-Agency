/**
 * Health Status Data Models - Core health monitoring data structures
 * 
 * @file HealthStatus.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

export enum HealthLevel {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical'
}

export enum ComponentType {
  AGENT = 'agent',
  SYSTEM = 'system',
  DEPENDENCY = 'dependency',
  RESOURCE = 'resource'
}

export interface HealthCheck {
  name: string;
  status: HealthLevel;
  message?: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ComponentHealth {
  component: string;
  type: ComponentType;
  status: HealthLevel;
  checks: HealthCheck[];
  uptime: number;
  lastCheck: string;
  consecutiveFailures: number;
  errorRate: number;
}

export interface SystemHealth {
  status: HealthLevel;
  timestamp: string;
  uptime: number;
  components: ComponentHealth[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    critical: number;
  };
  version: string;
  environment: string;
}

export interface AgentHealth {
  agentName: string;
  status: HealthLevel;
  availability: number;
  averageResponseTime: number;
  successRate: number;
  lastExecution?: string;
  errorCount: number;
  circuitBreakerStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  metrics: {
    executionsToday: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
  };
}

export interface ResourceHealth {
  cpu: {
    usage: number;
    available: number;
    threshold: number;
    status: HealthLevel;
  };
  memory: {
    used: number;
    available: number;
    total: number;
    usage: number;
    threshold: number;
    status: HealthLevel;
  };
  disk: {
    used: number;
    available: number;
    total: number;
    usage: number;
    threshold: number;
    status: HealthLevel;
  };
  network: {
    latency: number;
    throughput: number;
    errorRate: number;
    status: HealthLevel;
  };
}

export interface DependencyHealth {
  name: string;
  type: 'database' | 'api' | 'filesystem' | 'cache' | 'external';
  status: HealthLevel;
  responseTime: number;
  lastCheck: string;
  availability: number;
  endpoint?: string;
  error?: string;
}

export interface HealthThresholds {
  cpu: {
    warning: number;
    critical: number;
  };
  memory: {
    warning: number;
    critical: number;
  };
  disk: {
    warning: number;
    critical: number;
  };
  responseTime: {
    warning: number;
    critical: number;
  };
  errorRate: {
    warning: number;
    critical: number;
  };
  availability: {
    warning: number;
    critical: number;
  };
}

export interface HealthAlert {
  id: string;
  component: string;
  type: ComponentType;
  level: 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface HealthTrend {
  component: string;
  metric: string;
  timeframe: '1h' | '6h' | '24h' | '7d' | '30d';
  dataPoints: Array<{
    timestamp: string;
    value: number;
  }>;
  trend: 'improving' | 'stable' | 'degrading';
  changePercent: number;
}

export interface HealthReport {
  timestamp: string;
  period: string;
  system: SystemHealth;
  agents: AgentHealth[];
  resources: ResourceHealth;
  dependencies: DependencyHealth[];
  alerts: HealthAlert[];
  trends: HealthTrend[];
  recommendations: string[];
}