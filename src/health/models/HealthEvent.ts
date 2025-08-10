/**
 * Health Event Data Models - Health monitoring event and incident structures
 * 
 * @file HealthEvent.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { HealthLevel, ComponentType } from './HealthStatus';

export enum EventType {
  HEALTH_CHECK = 'health_check',
  STATUS_CHANGE = 'status_change',
  ALERT_TRIGGERED = 'alert_triggered',
  ALERT_RESOLVED = 'alert_resolved',
  CIRCUIT_BREAKER_OPEN = 'circuit_breaker_open',
  CIRCUIT_BREAKER_CLOSED = 'circuit_breaker_closed',
  DEGRADATION_STARTED = 'degradation_started',
  DEGRADATION_ENDED = 'degradation_ended',
  RECOVERY_STARTED = 'recovery_started',
  RECOVERY_COMPLETED = 'recovery_completed',
  MAINTENANCE_STARTED = 'maintenance_started',
  MAINTENANCE_ENDED = 'maintenance_ended',
  THRESHOLD_EXCEEDED = 'threshold_exceeded',
  DEPENDENCY_FAILURE = 'dependency_failure',
  RESOURCE_EXHAUSTION = 'resource_exhaustion'
}

export enum EventSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface HealthEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  timestamp: string;
  component: string;
  componentType: ComponentType;
  source: string;
  title: string;
  message: string;
  details?: Record<string, any>;
  tags: string[];
  correlationId?: string;
  resolved: boolean;
  resolvedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface StatusChangeEvent extends HealthEvent {
  previousStatus: HealthLevel;
  newStatus: HealthLevel;
  trigger: 'health_check' | 'threshold' | 'manual' | 'circuit_breaker';
  duration?: number;
}

export interface AlertEvent extends HealthEvent {
  alertRule: string;
  threshold: {
    metric: string;
    operator: string;
    value: number;
    currentValue: number;
  };
  escalationLevel: number;
  notificationsSent: string[];
  suppressUntil?: string;
}

export interface CircuitBreakerEvent extends HealthEvent {
  circuitName: string;
  previousState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  newState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  failureThreshold: number;
  timeout: number;
  lastFailure?: string;
}

export interface DegradationEvent extends HealthEvent {
  degradationStrategy: string;
  triggeredBy: string;
  affectedFeatures: string[];
  fallbackMode: string;
  estimatedRecoveryTime?: string;
  userImpact: 'none' | 'minimal' | 'moderate' | 'significant' | 'severe';
}

export interface RecoveryEvent extends HealthEvent {
  recoveryStrategy: string;
  triggeredBy: 'automatic' | 'manual';
  recoverySteps: Array<{
    step: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    error?: string;
  }>;
  recoveryDuration?: number;
  healthChecksPassed: number;
  healthChecksTotal: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startedAt: string;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  affectedComponents: string[];
  affectedUsers: number;
  rootCause?: string;
  resolution?: string;
  preventionSteps?: string[];
  events: HealthEvent[];
  timeline: Array<{
    timestamp: string;
    action: string;
    actor: string;
    description: string;
  }>;
  metrics: {
    detectionTime: number;
    acknowledgeTime: number;
    resolutionTime: number;
    totalDowntime: number;
  };
  postMortem?: {
    conducted: boolean;
    conductedAt?: string;
    facilitator?: string;
    participants: string[];
    findings: string[];
    actionItems: Array<{
      item: string;
      owner: string;
      dueDate: string;
      status: 'open' | 'in_progress' | 'completed';
    }>;
  };
}

export interface EventFilter {
  types?: EventType[];
  severities?: EventSeverity[];
  components?: string[];
  componentTypes?: ComponentType[];
  startTime?: string;
  endTime?: string;
  resolved?: boolean;
  acknowledged?: boolean;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EventStatistics {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  eventsBySeverity: Record<EventSeverity, number>;
  eventsByComponent: Record<string, number>;
  averageResolutionTime: number;
  unacknowledgedCount: number;
  unresolvedCount: number;
  trendsLast24h: {
    total: number;
    critical: number;
    warnings: number;
    errors: number;
  };
  topComponents: Array<{
    component: string;
    eventCount: number;
    lastEvent: string;
  }>;
  recoveryMetrics: {
    averageRecoveryTime: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    automaticRecoveries: number;
    manualRecoveries: number;
  };
}

export interface EventNotification {
  eventId: string;
  channels: ('email' | 'slack' | 'webhook' | 'sms')[];
  recipients: string[];
  template: string;
  sentAt: string;
  deliveryStatus: Record<string, 'sent' | 'delivered' | 'failed'>;
  retryCount: number;
  suppressUntil?: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  affectedComponents: string[];
  maintenanceType: 'planned' | 'emergency';
  impact: 'none' | 'minimal' | 'partial' | 'full';
  notificationsSent: boolean;
  approvedBy: string;
  performedBy: string[];
  tasks: Array<{
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    assignee: string;
    estimatedDuration: number;
    actualDuration?: number;
    notes?: string;
  }>;
}