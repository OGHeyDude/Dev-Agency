/**
 * Real-time Health Status Models - Extended models for real-time dashboard
 * 
 * @file RealTimeHealthStatus.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { HealthLevel, ComponentType, HealthCheck, ComponentHealth } from '../../../health/models/HealthStatus';

export interface AgentHealthStatus {
  agentId: string;
  status: 'running' | 'idle' | 'failed' | 'blocked' | 'recovering';
  lastActivity: Date;
  currentTask?: string;
  resourceUsage: {
    cpuPercent: number;
    memoryMB: number;
    tokensUsed: number;
  };
  performanceMetrics: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  healthScore: number; // 0-100 computed health score
  metadata?: Record<string, any>;
}

export interface SystemHealthSummary {
  overall: HealthLevel;
  timestamp: string;
  uptime: number;
  agentCount: {
    total: number;
    running: number;
    idle: number;
    failed: number;
    blocked: number;
    recovering: number;
  };
  resourceStatus: {
    cpu: ResourceStatus;
    memory: ResourceStatus;
    disk: ResourceStatus;
    network: ResourceStatus;
  };
  alertCount: {
    critical: number;
    warning: number;
    total: number;
  };
  healthTrend: 'improving' | 'stable' | 'degrading';
}

export interface ResourceStatus {
  current: number;
  usage: number;
  threshold: {
    warning: number;
    critical: number;
  };
  status: HealthLevel;
  trend: 'up' | 'down' | 'stable';
}

export interface RealTimeAlert {
  id: string;
  type: 'health' | 'performance' | 'resource' | 'agent' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  component: string;
  componentType: ComponentType;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalationLevel: number;
  notifications: NotificationAttempt[];
  tags: string[];
  metadata?: Record<string, any>;
}

export interface NotificationAttempt {
  channel: 'slack' | 'email' | 'webhook' | 'teams';
  timestamp: string;
  success: boolean;
  error?: string;
  responseTime?: number;
}

export interface ThresholdBreach {
  metric: string;
  component: string;
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  duration: number; // How long the breach has persisted
  previousValue?: number;
}

export interface HealthStreamEvent {
  type: 'agent-status' | 'alert-triggered' | 'alert-resolved' | 'system-health' | 'resource-threshold' | 'recovery-started' | 'recovery-completed';
  timestamp: string;
  data: any;
  correlationId?: string;
  source: string;
}

export interface DashboardMetrics {
  timestamp: string;
  connectedClients: number;
  dataStreamRate: number; // Events per second
  alertsGenerated: number;
  alertsResolved: number;
  systemLoad: {
    cpu: number;
    memory: number;
    activeConnections: number;
  };
  performanceStats: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export interface AlertEscalationRule {
  severity: 'warning' | 'critical';
  initialDelay: number; // seconds
  repeatInterval: number; // seconds
  maxRepeats: number;
  channels: string[];
  escalationChain: string[];
}

export interface AlertThresholds {
  critical: {
    responseTime: number;      // >10 seconds
    errorRate: number;         // >15%
    memoryUsage: number;       // >80%
    agentFailures: number;     // >3 consecutive
    cpuUsage: number;          // >90%
    diskUsage: number;         // >95%
  };
  warning: {
    responseTime: number;      // >5 seconds
    errorRate: number;         // >5%
    memoryUsage: number;       // >60%
    agentFailures: number;     // >1 failure
    cpuUsage: number;          // >70%
    diskUsage: number;         // >85%
  };
  recovery: {
    confirmationTime: number;  // 2 minutes of stability
    successRateRequired: number; // >90%
    healthScoreRequired: number; // >80
  };
}

export interface HealthCheckResult {
  component: string;
  status: HealthLevel;
  checks: HealthCheck[];
  timestamp: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface RecoveryAttempt {
  id: string;
  component: string;
  type: 'automatic' | 'manual';
  startedAt: string;
  completedAt?: string;
  status: 'in-progress' | 'completed' | 'failed';
  steps: RecoveryStep[];
  triggeredBy?: string;
  metadata?: Record<string, any>;
}

export interface RecoveryStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs: string[];
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  type: 'alert' | 'recovery' | 'acknowledgment' | 'resolution' | 'escalation';
  component: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface DashboardConfiguration {
  refreshInterval: number; // milliseconds
  alertThresholds: AlertThresholds;
  escalationRules: AlertEscalationRule[];
  notificationChannels: {
    slack?: {
      webhook: string;
      channel: string;
      enabled: boolean;
    };
    email?: {
      smtp: any;
      recipients: string[];
      enabled: boolean;
    };
    teams?: {
      webhook: string;
      enabled: boolean;
    };
  };
  ui: {
    autoRefresh: boolean;
    soundAlerts: boolean;
    browserNotifications: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
}

// WebSocket event types for real-time streaming
export interface HealthStreamEvents {
  'agent-status-change': AgentHealthStatus;
  'alert-triggered': RealTimeAlert;
  'alert-resolved': RealTimeAlert;
  'system-health-update': SystemHealthSummary;
  'resource-threshold-breach': ThresholdBreach;
  'recovery-started': RecoveryAttempt;
  'recovery-completed': RecoveryAttempt;
  'dashboard-metrics': DashboardMetrics;
  'incident-update': IncidentTimelineEntry;
}

export type HealthStreamEventType = keyof HealthStreamEvents;

export interface WebSocketMessage<T = any> {
  type: HealthStreamEventType;
  data: T;
  timestamp: string;
  correlationId?: string;
  source: string;
}