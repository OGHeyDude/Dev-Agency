/**
 * Issue Detector - Main detection orchestrator
 * Coordinates various monitors to detect different types of issues
 */

import { EventEmitter } from 'events';
import { CompilationMonitor } from './monitors/CompilationMonitor';
import { TestFailureMonitor } from './monitors/TestFailureMonitor';
import { DependencyMonitor } from './monitors/DependencyMonitor';
import { PerformanceMonitor } from './monitors/PerformanceMonitor';
import { LintMonitor } from './monitors/LintMonitor';
import { HealthConnector } from './health-integration/HealthConnector';
import { ErrorPatterns } from './patterns/ErrorPatterns';
import {
  AutoFixIssue,
  IssueType,
  DetectionRule,
  MonitoringState
} from '../types';

export interface IssueDetectorOptions {
  enabledTypes: IssueType[];
  timeout: number;
  pollingInterval?: number;
}

export class IssueDetector extends EventEmitter {
  private options: IssueDetectorOptions;
  private monitors: Map<IssueType, any> = new Map();
  private healthConnector: HealthConnector;
  private patterns: ErrorPatterns;
  private detectionRules: DetectionRule[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  
  constructor(options: IssueDetectorOptions) {
    super();
    this.options = {
      pollingInterval: 5000,
      ...options
    };
    
    this.patterns = new ErrorPatterns();
    this.healthConnector = new HealthConnector();
    
    this.initializeMonitors();
    this.loadDetectionRules();
    this.setupEventHandlers();
  }
  
  /**
   * Start monitoring for issues
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    this.emit('monitoring:started');
    
    // Start health connector
    await this.healthConnector.connect();
    
    // Start enabled monitors
    for (const [type, monitor] of this.monitors) {
      if (this.options.enabledTypes.includes(type)) {
        await monitor.start();
        this.emit('monitor:started', { type, monitor: monitor.constructor.name });
      }
    }
    
    // Start periodic scanning
    this.startPeriodicScanning();
  }
  
  /**
   * Stop monitoring
   */
  public async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = false;
    
    // Stop periodic scanning
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    // Stop all monitors
    for (const [type, monitor] of this.monitors) {
      try {
        await monitor.stop();
        this.emit('monitor:stopped', { type, monitor: monitor.constructor.name });
      } catch (error) {
        this.emit('monitor:error', { type, error });
      }
    }
    
    // Disconnect health connector
    await this.healthConnector.disconnect();
    
    this.emit('monitoring:stopped');
  }
  
  /**
   * Manually trigger issue detection
   */
  public async detectIssues(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];
    
    // Run detection on all enabled monitors
    for (const [type, monitor] of this.monitors) {
      if (this.options.enabledTypes.includes(type)) {
        try {
          const monitorIssues = await monitor.detect();
          issues.push(...monitorIssues);
        } catch (error) {
          this.emit('monitor:error', { type, error });
        }
      }
    }
    
    // Process through pattern matching
    const processedIssues = await this.processIssues(issues);
    
    // Emit detected issues
    for (const issue of processedIssues) {
      this.emit('issue:detected', issue);
    }
    
    return processedIssues;
  }
  
  /**
   * Add custom detection rule
   */
  public addDetectionRule(rule: DetectionRule): void {
    this.detectionRules.push(rule);
    this.emit('rule:added', rule);
  }
  
  /**
   * Remove detection rule
   */
  public removeDetectionRule(ruleId: string): boolean {
    const index = this.detectionRules.findIndex(rule => rule.id === ruleId);
    if (index >= 0) {
      const rule = this.detectionRules.splice(index, 1)[0];
      this.emit('rule:removed', rule);
      return true;
    }
    return false;
  }
  
  /**
   * Get current detection rules
   */
  public getDetectionRules(): DetectionRule[] {
    return [...this.detectionRules];
  }
  
  // Private methods
  
  private initializeMonitors(): void {
    // Initialize all monitor types
    this.monitors.set('compilation', new CompilationMonitor({
      patterns: this.patterns.getCompilationPatterns(),
      timeout: this.options.timeout
    }));
    
    this.monitors.set('test', new TestFailureMonitor({
      patterns: this.patterns.getTestPatterns(),
      timeout: this.options.timeout
    }));
    
    this.monitors.set('dependency', new DependencyMonitor({
      patterns: this.patterns.getDependencyPatterns(),
      timeout: this.options.timeout
    }));
    
    this.monitors.set('performance', new PerformanceMonitor({
      patterns: this.patterns.getPerformancePatterns(),
      timeout: this.options.timeout
    }));
    
    this.monitors.set('lint', new LintMonitor({
      patterns: this.patterns.getLintPatterns(),
      timeout: this.options.timeout
    }));
  }
  
  private loadDetectionRules(): void {
    // Load default detection rules
    this.detectionRules = [
      {
        id: 'typescript_error',
        name: 'TypeScript Compilation Error',
        description: 'Detects TypeScript compilation errors',
        issueType: 'compilation',
        pattern: /error TS\d+:/,
        severity: 'high',
        confidence: 0.9,
        enabled: true,
        conditions: [
          {
            field: 'file',
            operator: 'contains',
            value: '.ts'
          }
        ],
        actions: [
          {
            type: 'create_issue',
            parameters: {
              type: 'compilation',
              severity: 'high'
            }
          }
        ]
      },
      {
        id: 'test_failure',
        name: 'Test Failure',
        description: 'Detects failing tests',
        issueType: 'test',
        pattern: /FAIL|FAILED|Error:/,
        severity: 'medium',
        confidence: 0.8,
        enabled: true,
        conditions: [
          {
            field: 'context.testFile',
            operator: 'equals',
            value: true
          }
        ],
        actions: [
          {
            type: 'create_issue',
            parameters: {
              type: 'test',
              severity: 'medium'
            }
          }
        ]
      },
      {
        id: 'dependency_vulnerability',
        name: 'Dependency Vulnerability',
        description: 'Detects security vulnerabilities in dependencies',
        issueType: 'dependency',
        pattern: /vulnerability|CVE-\d+/i,
        severity: 'high',
        confidence: 0.85,
        enabled: true,
        conditions: [],
        actions: [
          {
            type: 'create_issue',
            parameters: {
              type: 'dependency',
              severity: 'high'
            }
          }
        ]
      }
    ];
  }
  
  private setupEventHandlers(): void {
    // Set up health connector events
    this.healthConnector.on('health:alert', (alert) => {
      this.processHealthAlert(alert);
    });
    
    // Set up monitor events
    for (const [type, monitor] of this.monitors) {
      monitor.on('issue:found', (issue: AutoFixIssue) => {
        this.emit('issue:detected', issue);
      });
      
      monitor.on('issue:resolved', (issueId: string) => {
        this.emit('issue:resolved', issueId);
      });
      
      monitor.on('error', (error: any) => {
        this.emit('monitor:error', { type, error });
      });
    }
  }
  
  private startPeriodicScanning(): void {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.detectIssues();
      } catch (error) {
        this.emit('scanning:error', error);
      }
    }, this.options.pollingInterval);
  }
  
  private async processIssues(issues: AutoFixIssue[]): Promise<AutoFixIssue[]> {
    const processedIssues: AutoFixIssue[] = [];
    
    for (const issue of issues) {
      try {
        // Apply detection rules
        const processedIssue = await this.applyDetectionRules(issue);
        
        // Enhance with pattern matching
        const enhancedIssue = await this.patterns.enhanceIssue(processedIssue);
        
        processedIssues.push(enhancedIssue);
      } catch (error) {
        this.emit('processing:error', { issue, error });
        // Include original issue if processing fails
        processedIssues.push(issue);
      }
    }
    
    return processedIssues;
  }
  
  private async applyDetectionRules(issue: AutoFixIssue): Promise<AutoFixIssue> {
    for (const rule of this.detectionRules) {
      if (!rule.enabled || rule.issueType !== issue.type) {
        continue;
      }
      
      // Check if rule conditions match
      if (this.matchesRuleConditions(issue, rule)) {
        // Apply rule modifications
        const modifiedIssue = { ...issue };
        
        // Update confidence based on rule
        modifiedIssue.confidence = Math.max(modifiedIssue.confidence, rule.confidence);
        
        // Update severity if rule specifies higher severity
        if (this.severityLevel(rule.severity) > this.severityLevel(modifiedIssue.severity)) {
          modifiedIssue.severity = rule.severity;
        }
        
        // Add rule tags
        if (!modifiedIssue.tags) {
          modifiedIssue.tags = [];
        }
        modifiedIssue.tags.push(`rule:${rule.id}`);
        
        return modifiedIssue;
      }
    }
    
    return issue;
  }
  
  private matchesRuleConditions(issue: AutoFixIssue, rule: DetectionRule): boolean {
    for (const condition of rule.conditions) {
      if (!this.evaluateCondition(issue, condition)) {
        return false;
      }
    }
    return true;
  }
  
  private evaluateCondition(issue: AutoFixIssue, condition: any): boolean {
    // Implementation would evaluate rule conditions
    // For now, return true
    return true;
  }
  
  private severityLevel(severity: string): number {
    const levels: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    return levels[severity] || 1;
  }
  
  private async processHealthAlert(alert: any): Promise<void> {
    // Convert health alerts to issues
    const issue: AutoFixIssue = {
      id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.mapHealthAlertToIssueType(alert.type),
      severity: alert.severity || 'medium',
      title: alert.title || 'Health Alert',
      description: alert.message || 'Health monitoring detected an issue',
      location: {
        file: alert.component || 'system',
        module: alert.service
      },
      context: {
        healthAlert: true,
        ...alert.context
      },
      detected: new Date(),
      confidence: 0.8,
      tags: ['health', 'monitoring']
    };
    
    this.emit('issue:detected', issue);
  }
  
  private mapHealthAlertToIssueType(alertType: string): IssueType {
    const mapping: Record<string, IssueType> = {
      'performance': 'performance',
      'error': 'compilation',
      'dependency': 'dependency',
      'test': 'test'
    };
    
    return mapping[alertType] || 'compilation';
  }
}