/**
 * Security Auditor - Comprehensive security audit logging and monitoring
 * 
 * @file SecurityAuditor.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Logger } from './Logger';
import { SecurityEvent } from './security';

const auditLogger = Logger.create({ component: 'SecurityAuditor' });

/**
 * Security audit configuration
 */
export interface SecurityAuditConfig {
  enabled: boolean;
  logLevel: 'all' | 'high' | 'critical';
  auditLogPath: string;
  maxLogFiles: number;
  maxLogSize: number;
  alertThresholds: {
    pathTraversalAttempts: number;
    injectionAttempts: number;
    unauthorizedAccess: number;
    timeWindow: number; // minutes
  };
}

/**
 * Audit log entry
 */
export interface AuditLogEntry extends SecurityEvent {
  id: string;
  sessionId: string;
  processId: number;
  parentProcessId?: number;
  workingDirectory: string;
  commandLine: string[];
  environment: {
    nodeVersion: string;
    platform: string;
    arch: string;
    hostname: string;
  };
  performance: {
    cpuUsage: NodeJS.CpuUsage;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

/**
 * Security alert
 */
export interface SecurityAlert {
  id: string;
  timestamp: string;
  alertType: 'threshold_exceeded' | 'anomaly_detected' | 'critical_event';
  severity: 'medium' | 'high' | 'critical';
  message: string;
  affectedEvents: string[];
  recommendedActions: string[];
  metadata: Record<string, any>;
}

/**
 * Security Auditor class for comprehensive logging and monitoring
 */
export class SecurityAuditor {
  private config: SecurityAuditConfig;
  private sessionId: string;
  private eventQueue: AuditLogEntry[] = [];
  private recentEvents: Map<string, number> = new Map();
  private alerts: SecurityAlert[] = [];

  constructor(config?: Partial<SecurityAuditConfig>) {
    this.config = {
      enabled: true,
      logLevel: 'all',
      auditLogPath: path.join(os.homedir(), '.agent-cli', 'security-audit.log'),
      maxLogFiles: 10,
      maxLogSize: 10 * 1024 * 1024, // 10MB
      alertThresholds: {
        pathTraversalAttempts: 5,
        injectionAttempts: 3,
        unauthorizedAccess: 10,
        timeWindow: 15 // 15 minutes
      },
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.initializeAuditLogging();
  }

  /**
   * Initialize audit logging system
   */
  private async initializeAuditLogging(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Ensure audit log directory exists
      await fs.ensureDir(path.dirname(this.config.auditLogPath));

      // Rotate logs if needed
      await this.rotateLogs();

      // Log session start
      await this.logSecurityEvent({
        timestamp: new Date().toISOString(),
        event: 'access_denied',
        severity: 'low',
        details: {
          operation: 'execute',
          violation: 'Security audit session started'
        }
      });

      auditLogger.info('Security audit logging initialized', {
        sessionId: this.sessionId,
        auditLogPath: this.config.auditLogPath
      });

    } catch (error) {
      auditLogger.error('Failed to initialize security audit logging:', error);
    }
  }

  /**
   * Log security event with comprehensive metadata
   */
  async logSecurityEvent(event: SecurityEvent): Promise<string> {
    if (!this.config.enabled) return '';

    // Filter events based on log level
    if (!this.shouldLogEvent(event)) return '';

    // Generate unique event ID
    const eventId = this.generateEventId();

    // Create comprehensive audit log entry
    const auditEntry: AuditLogEntry = {
      ...event,
      id: eventId,
      sessionId: this.sessionId,
      processId: process.pid,
      parentProcessId: process.ppid,
      workingDirectory: process.cwd(),
      commandLine: process.argv,
      environment: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname()
      },
      performance: {
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage()
      }
    };

    // Add to event queue
    this.eventQueue.push(auditEntry);

    // Update recent events counter for alert detection
    this.updateRecentEvents(event.event);

    // Check for security alerts
    await this.checkSecurityAlerts(auditEntry);

    // Write to audit log
    await this.writeAuditLog(auditEntry);

    // Process queue if it's getting large
    if (this.eventQueue.length > 100) {
      await this.flushEventQueue();
    }

    return eventId;
  }

  /**
   * Check if event should be logged based on log level
   */
  private shouldLogEvent(event: SecurityEvent): boolean {
    switch (this.config.logLevel) {
      case 'critical':
        return event.severity === 'critical';
      case 'high':
        return event.severity === 'critical' || event.severity === 'high';
      case 'all':
      default:
        return true;
    }
  }

  /**
   * Update recent events counter
   */
  private updateRecentEvents(eventType: string): void {
    const key = `${eventType}_${Math.floor(Date.now() / (this.config.alertThresholds.timeWindow * 60 * 1000))}`;
    this.recentEvents.set(key, (this.recentEvents.get(key) || 0) + 1);

    // Clean up old entries
    const currentWindow = Math.floor(Date.now() / (this.config.alertThresholds.timeWindow * 60 * 1000));
    for (const [k] of this.recentEvents) {
      const window = parseInt(k.split('_').pop() || '0');
      if (currentWindow - window > 5) { // Keep last 5 windows
        this.recentEvents.delete(k);
      }
    }
  }

  /**
   * Check for security alerts
   */
  private async checkSecurityAlerts(entry: AuditLogEntry): Promise<void> {
    const eventType = entry.event;
    const currentWindow = Math.floor(Date.now() / (this.config.alertThresholds.timeWindow * 60 * 1000));
    const key = `${eventType}_${currentWindow}`;
    const count = this.recentEvents.get(key) || 0;

    let alertTriggered = false;
    let alertSeverity: SecurityAlert['severity'] = 'medium';
    let recommendedActions: string[] = [];

    // Check thresholds
    switch (eventType) {
      case 'path_traversal_attempt':
        if (count >= this.config.alertThresholds.pathTraversalAttempts) {
          alertTriggered = true;
          alertSeverity = 'high';
          recommendedActions = [
            'Review recent path access attempts',
            'Verify file access controls are properly configured',
            'Consider blocking suspicious source IPs if applicable',
            'Review application logs for coordinated attacks'
          ];
        }
        break;

      case 'injection_attempt':
        if (count >= this.config.alertThresholds.injectionAttempts) {
          alertTriggered = true;
          alertSeverity = 'critical';
          recommendedActions = [
            'Immediately review injection attempt details',
            'Verify input validation is functioning correctly',
            'Check for successful injections in application behavior',
            'Consider temporarily disabling affected functionality',
            'Alert security team immediately'
          ];
        }
        break;

      case 'unauthorized_path_access':
        if (count >= this.config.alertThresholds.unauthorizedAccess) {
          alertTriggered = true;
          alertSeverity = 'high';
          recommendedActions = [
            'Review path access controls',
            'Verify user permissions are correctly configured',
            'Check for privilege escalation attempts',
            'Review application configuration for security gaps'
          ];
        }
        break;
    }

    // Critical events always trigger alerts
    if (entry.severity === 'critical') {
      alertTriggered = true;
      alertSeverity = 'critical';
      recommendedActions = [
        'Immediate security review required',
        'Escalate to security team',
        'Document incident for security audit',
        'Review system integrity'
      ];
    }

    if (alertTriggered) {
      const alert: SecurityAlert = {
        id: this.generateAlertId(),
        timestamp: new Date().toISOString(),
        alertType: entry.severity === 'critical' ? 'critical_event' : 'threshold_exceeded',
        severity: alertSeverity,
        message: `Security threshold exceeded: ${eventType} (${count} occurrences in ${this.config.alertThresholds.timeWindow} minutes)`,
        affectedEvents: [entry.id],
        recommendedActions,
        metadata: {
          eventType,
          count,
          threshold: this.getThresholdForEvent(eventType),
          timeWindow: this.config.alertThresholds.timeWindow,
          sessionId: this.sessionId
        }
      };

      this.alerts.push(alert);
      await this.handleSecurityAlert(alert);
    }
  }

  /**
   * Get threshold for event type
   */
  private getThresholdForEvent(eventType: string): number {
    switch (eventType) {
      case 'path_traversal_attempt':
        return this.config.alertThresholds.pathTraversalAttempts;
      case 'injection_attempt':
        return this.config.alertThresholds.injectionAttempts;
      case 'unauthorized_path_access':
        return this.config.alertThresholds.unauthorizedAccess;
      default:
        return 1;
    }
  }

  /**
   * Handle security alert
   */
  private async handleSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Log alert
    auditLogger.error('Security Alert Triggered', {
      alertId: alert.id,
      severity: alert.severity,
      message: alert.message,
      recommendations: alert.recommendedActions
    });

    // Write alert to separate alert log
    const alertLogPath = path.join(path.dirname(this.config.auditLogPath), 'security-alerts.log');
    const alertLogEntry = `${new Date().toISOString()} [${alert.severity.toUpperCase()}] ${alert.message}\n` +
                         `Alert ID: ${alert.id}\n` +
                         `Recommendations:\n${alert.recommendedActions.map(action => `  - ${action}`).join('\n')}\n` +
                         `Metadata: ${JSON.stringify(alert.metadata, null, 2)}\n\n`;

    try {
      await fs.appendFile(alertLogPath, alertLogEntry, 'utf-8');
    } catch (error) {
      auditLogger.error('Failed to write security alert to log:', error);
    }

    // For critical alerts, also write to console
    if (alert.severity === 'critical') {
      console.error(`🚨 CRITICAL SECURITY ALERT: ${alert.message}`);
      console.error(`Alert ID: ${alert.id}`);
      console.error('Immediate action required!');
    }
  }

  /**
   * Write audit log entry to file
   */
  private async writeAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(this.config.auditLogPath, logLine, 'utf-8');
    } catch (error) {
      auditLogger.error('Failed to write audit log entry:', error);
    }
  }

  /**
   * Flush event queue to log file
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const logContent = this.eventQueue.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await fs.appendFile(this.config.auditLogPath, logContent, 'utf-8');
      this.eventQueue = [];
    } catch (error) {
      auditLogger.error('Failed to flush event queue:', error);
    }
  }

  /**
   * Rotate log files when they get too large
   */
  private async rotateLogs(): Promise<void> {
    try {
      const stats = await fs.stat(this.config.auditLogPath);
      
      if (stats.size > this.config.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedLogPath = this.config.auditLogPath.replace('.log', `_${timestamp}.log`);
        
        await fs.move(this.config.auditLogPath, rotatedLogPath);
        
        // Clean up old log files
        await this.cleanupOldLogs();
        
        auditLogger.info('Audit log rotated', { 
          oldPath: rotatedLogPath, 
          newPath: this.config.auditLogPath 
        });
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
      if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
        auditLogger.error('Failed to rotate logs:', error);
      }
    }
  }

  /**
   * Clean up old log files
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const logDir = path.dirname(this.config.auditLogPath);
      const files = await fs.readdir(logDir);
      
      const logFiles = files
        .filter(file => file.startsWith('security-audit_') && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          stats: fs.statSync(path.join(logDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only maxLogFiles newest files
      const filesToDelete = logFiles.slice(this.config.maxLogFiles);
      
      for (const file of filesToDelete) {
        await fs.remove(file.path);
        auditLogger.debug('Deleted old audit log file', { file: file.name });
      }
    } catch (error) {
      auditLogger.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Get security audit report
   */
  async getAuditReport(options?: {
    startTime?: string;
    endTime?: string;
    eventTypes?: string[];
    severityLevels?: string[];
    limit?: number;
  }): Promise<{
    summary: {
      totalEvents: number;
      eventsByType: Record<string, number>;
      eventsBySeverity: Record<string, number>;
      topViolations: Array<{ type: string; count: number }>;
      alertsTriggered: number;
    };
    events: AuditLogEntry[];
    alerts: SecurityAlert[];
  }> {
    try {
      // Read audit log file
      const logContent = await fs.readFile(this.config.auditLogPath, 'utf-8');
      const lines = logContent.trim().split('\n').filter(line => line.trim());
      
      let events: AuditLogEntry[] = [];
      
      for (const line of lines) {
        try {
          const event = JSON.parse(line) as AuditLogEntry;
          
          // Apply filters
          if (options?.startTime && event.timestamp < options.startTime) continue;
          if (options?.endTime && event.timestamp > options.endTime) continue;
          if (options?.eventTypes && !options.eventTypes.includes(event.event)) continue;
          if (options?.severityLevels && !options.severityLevels.includes(event.severity)) continue;
          
          events.push(event);
        } catch (parseError) {
          auditLogger.warn('Failed to parse audit log line', { line });
        }
      }
      
      // Apply limit
      if (options?.limit) {
        events = events.slice(-options.limit);
      }
      
      // Generate summary
      const eventsByType: Record<string, number> = {};
      const eventsBySeverity: Record<string, number> = {};
      
      events.forEach(event => {
        eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
        eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      });
      
      const topViolations = Object.entries(eventsByType)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return {
        summary: {
          totalEvents: events.length,
          eventsByType,
          eventsBySeverity,
          topViolations,
          alertsTriggered: this.alerts.length
        },
        events,
        alerts: [...this.alerts]
      };
    } catch (error) {
      auditLogger.error('Failed to generate audit report:', error);
      return {
        summary: {
          totalEvents: 0,
          eventsByType: {},
          eventsBySeverity: {},
          topViolations: [],
          alertsTriggered: 0
        },
        events: [],
        alerts: []
      };
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and finalize audit session
   */
  async finalize(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      // Flush any remaining events
      await this.flushEventQueue();

      // Log session end
      await this.logSecurityEvent({
        timestamp: new Date().toISOString(),
        event: 'access_denied',
        severity: 'low',
        details: {
          operation: 'execute',
          violation: 'Security audit session ended'
        }
      });

      auditLogger.info('Security audit session finalized', {
        sessionId: this.sessionId,
        totalEvents: this.eventQueue.length,
        alertsTriggered: this.alerts.length
      });
    } catch (error) {
      auditLogger.error('Failed to finalize audit session:', error);
    }
  }
}

// Global security auditor instance
export const securityAuditor = new SecurityAuditor();