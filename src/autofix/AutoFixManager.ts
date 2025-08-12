/**
 * Auto-fix Manager - Main orchestrator for the auto-fix system
 * Coordinates detection, analysis, fixing, and validation
 */

import { EventEmitter } from 'events';
import { IssueDetector } from './detection/IssueDetector';
import { RootCauseAnalyzer } from './analysis/RootCauseAnalyzer';
import { PredictiveEngine } from './analysis/PredictiveEngine';
import { FixGenerator } from './fixing/FixGenerator';
import { FixValidator } from './fixing/validation/FixValidator';
import { FixLearner } from './learning/FixLearner';
import {
  AutoFixIssue,
  FixStrategy,
  FixResult,
  PredictiveInsight,
  AutoFixConfig,
  FixHistory,
  MonitoringState,
  FixStatus,
  SeverityLevel
} from './types';

export interface AutoFixManagerOptions {
  config: AutoFixConfig;
  dataPath?: string;
  enableLogging?: boolean;
}

export class AutoFixManager extends EventEmitter {
  private detector: IssueDetector;
  private analyzer: RootCauseAnalyzer;
  private predictor: PredictiveEngine;
  private generator: FixGenerator;
  private validator: FixValidator;
  private learner: FixLearner;
  
  private config: AutoFixConfig;
  private state: MonitoringState;
  private activeIssues = new Map<string, AutoFixIssue>();
  private activeFixes = new Map<string, FixResult>();
  private fixHistory: FixHistory[] = [];
  private isMonitoring = false;
  
  constructor(options: AutoFixManagerOptions) {
    super();
    
    this.config = options.config;
    this.state = this.initializeState();
    
    // Initialize core components
    this.detector = new IssueDetector({
      enabledTypes: this.config.enabledIssueTypes,
      timeout: this.config.timeouts.detection
    });
    
    this.analyzer = new RootCauseAnalyzer({
      timeout: this.config.timeouts.analysis
    });
    
    this.predictor = new PredictiveEngine({
      confidenceThreshold: 0.6,
      maxPredictions: 50
    });
    
    this.generator = new FixGenerator({
      riskTolerance: this.config.riskTolerance,
      maxStrategies: 5
    });
    
    this.validator = new FixValidator({
      testValidationRequired: this.config.testValidationRequired,
      timeout: this.config.timeouts.validation
    });
    
    this.learner = new FixLearner({
      learningEnabled: true
    });
    
    this.setupEventHandlers();
  }
  
  /**
   * Start monitoring for issues and auto-fixing
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    this.state.enabled = true;
    this.state.lastCheck = new Date();
    
    this.emit('monitoring:started');
    
    // Start detection monitoring
    await this.detector.startMonitoring();
    
    // Start predictive analysis
    await this.predictor.startPredictiveAnalysis();
    
    this.emit('status:changed', this.state);
  }
  
  /**
   * Stop monitoring and finish active fixes
   */
  public async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = false;
    this.state.enabled = false;
    
    // Wait for active fixes to complete
    await this.waitForActiveFixes();
    
    // Stop components
    await this.detector.stopMonitoring();
    await this.predictor.stopPredictiveAnalysis();
    
    this.emit('monitoring:stopped');
    this.emit('status:changed', this.state);
  }
  
  /**
   * Manually trigger fix for specific issue
   */
  public async fixIssue(issue: AutoFixIssue, strategy?: FixStrategy): Promise<FixResult> {
    this.emit('fix:started', { issue, strategy });
    
    try {
      // Analyze if no strategy provided
      if (!strategy) {
        const analysis = await this.analyzer.analyzeIssue(issue);
        const strategies = await this.generator.generateStrategies(issue, analysis);
        
        if (strategies.length === 0) {
          throw new Error('No fix strategies could be generated for this issue');
        }
        
        // Select best strategy
        strategy = strategies.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
      }
      
      // Check if auto-apply threshold is met
      const shouldAutoApply = strategy.confidence >= this.config.autoApplyThreshold &&
                             strategy.riskLevel !== 'high';
      
      if (!shouldAutoApply) {
        this.emit('fix:requires_approval', { issue, strategy });
        
        // For now, skip auto-apply for medium/high risk fixes
        // In production, this would trigger approval workflow
        const result: FixResult = {
          strategy,
          issue,
          status: 'pending',
          applied: false,
          success: false,
          executionTime: 0,
          startTime: new Date(),
          changes: [],
          testsRun: [],
          rollbackRequired: false,
          metrics: this.createEmptyMetrics()
        };
        
        return result;
      }
      
      // Apply the fix
      const result = await this.applyFix(issue, strategy);
      
      // Learn from result
      await this.learner.recordFixResult(result);
      
      // Update state
      this.updateStateAfterFix(result);
      
      this.emit('fix:completed', result);
      
      return result;
      
    } catch (error) {
      const errorResult: FixResult = {
        strategy: strategy!,
        issue,
        status: 'failed',
        applied: false,
        success: false,
        executionTime: 0,
        startTime: new Date(),
        endTime: new Date(),
        changes: [],
        testsRun: [],
        rollbackRequired: false,
        error: {
          code: 'FIX_ERROR',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          recoverable: false
        },
        metrics: this.createEmptyMetrics()
      };
      
      this.emit('fix:failed', errorResult);
      
      return errorResult;
    }
  }
  
  /**
   * Get predictive insights for potential issues
   */
  public async getPredictiveInsights(): Promise<PredictiveInsight[]> {
    return await this.predictor.generateInsights();
  }
  
  /**
   * Get current monitoring status
   */
  public getStatus(): MonitoringState {
    return { ...this.state };
  }
  
  /**
   * Get active issues
   */
  public getActiveIssues(): AutoFixIssue[] {
    return Array.from(this.activeIssues.values());
  }
  
  /**
   * Get fix history
   */
  public getFixHistory(limit = 100): FixHistory[] {
    return this.fixHistory.slice(-limit);
  }
  
  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<AutoFixConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('config:updated', this.config);
  }
  
  // Private methods
  
  private async applyFix(issue: AutoFixIssue, strategy: FixStrategy): Promise<FixResult> {
    const startTime = new Date();
    const result: FixResult = {
      strategy,
      issue,
      status: 'applying',
      applied: false,
      success: false,
      executionTime: 0,
      startTime,
      changes: [],
      testsRun: [],
      rollbackRequired: false,
      metrics: this.createEmptyMetrics()
    };
    
    this.activeFixes.set(issue.id, result);
    
    try {
      // Execute fix steps
      const changes = await this.executeFix(strategy);
      result.changes = changes;
      result.applied = true;
      
      // Validate fix
      const validationResult = await this.validator.validateFix(result);
      
      if (!validationResult.success) {
        // Rollback if validation fails
        if (this.config.rollbackOnFailure) {
          await this.rollbackFix(result);
          result.rollbackRequired = true;
          result.status = 'rolled_back';
        } else {
          result.status = 'failed';
        }
        
        result.error = validationResult.error;
      } else {
        result.success = true;
        result.status = 'applied';
        result.testsRun = validationResult.testsRun || [];
      }
      
      result.endTime = new Date();
      result.executionTime = result.endTime.getTime() - startTime.getTime();
      result.metrics = this.calculateMetrics(result);
      
      // Add to history
      this.addToHistory(result);
      
      return result;
      
    } catch (error) {
      result.status = 'failed';
      result.endTime = new Date();
      result.executionTime = result.endTime.getTime() - startTime.getTime();
      result.error = {
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        recoverable: true
      };
      
      return result;
      
    } finally {
      this.activeFixes.delete(issue.id);
    }
  }
  
  private async executeFix(strategy: FixStrategy): Promise<any[]> {
    // Implementation would execute fix steps
    // For now, return empty changes
    return [];
  }
  
  private async rollbackFix(result: FixResult): Promise<void> {
    // Implementation would execute rollback steps
    // For now, just log
    console.log(`Rolling back fix for issue: ${result.issue.id}`);
  }
  
  private setupEventHandlers(): void {
    this.detector.on('issue:detected', (issue: AutoFixIssue) => {
      this.activeIssues.set(issue.id, issue);
      this.emit('issue:detected', issue);
      
      // Auto-fix if enabled and meets criteria
      if (this.shouldAutoFix(issue)) {
        this.fixIssue(issue).catch(error => {
          this.emit('auto_fix:failed', { issue, error });
        });
      }
    });
    
    this.detector.on('issue:resolved', (issueId: string) => {
      this.activeIssues.delete(issueId);
      this.emit('issue:resolved', issueId);
    });
    
    this.predictor.on('prediction:generated', (insight: PredictiveInsight) => {
      this.emit('prediction:generated', insight);
    });
  }
  
  private shouldAutoFix(issue: AutoFixIssue): boolean {
    return this.config.enabled &&
           this.config.enabledIssueTypes.includes(issue.type) &&
           issue.confidence >= this.config.autoApplyThreshold &&
           issue.severity !== 'critical'; // Let humans handle critical issues
  }
  
  private initializeState(): MonitoringState {
    return {
      enabled: false,
      lastCheck: new Date(),
      issuesDetected: 0,
      fixesApplied: 0,
      successRate: 0,
      averageFixTime: 0,
      activeMonitors: [],
      healthStatus: 'healthy'
    };
  }
  
  private updateStateAfterFix(result: FixResult): void {
    this.state.fixesApplied++;
    
    if (result.success) {
      this.state.successRate = this.calculateSuccessRate();
      this.state.averageFixTime = this.calculateAverageFixTime();
    }
    
    this.state.lastCheck = new Date();
  }
  
  private calculateSuccessRate(): number {
    if (this.fixHistory.length === 0) return 0;
    
    const successful = this.fixHistory.filter(h => h.result.success).length;
    return (successful / this.fixHistory.length) * 100;
  }
  
  private calculateAverageFixTime(): number {
    if (this.fixHistory.length === 0) return 0;
    
    const total = this.fixHistory.reduce((sum, h) => sum + h.result.executionTime, 0);
    return total / this.fixHistory.length;
  }
  
  private addToHistory(result: FixResult): void {
    const history: FixHistory = {
      id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issue: result.issue,
      strategy: result.strategy,
      result,
      timestamp: new Date()
    };
    
    this.fixHistory.push(history);
    
    // Keep only last 1000 entries
    if (this.fixHistory.length > 1000) {
      this.fixHistory = this.fixHistory.slice(-1000);
    }
  }
  
  private async waitForActiveFixes(): Promise<void> {
    // Wait for all active fixes to complete
    while (this.activeFixes.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  private createEmptyMetrics(): any {
    return {
      detectionTime: 0,
      analysisTime: 0,
      fixTime: 0,
      validationTime: 0,
      totalTime: 0,
      linesChanged: 0,
      filesAffected: 0,
      testsRun: 0
    };
  }
  
  private calculateMetrics(result: FixResult): any {
    return {
      ...result.metrics,
      totalTime: result.executionTime,
      filesAffected: result.changes.length,
      linesChanged: result.changes.reduce((sum, change) => 
        sum + (change.diff ? change.diff.split('\n').length : 0), 0
      ),
      testsRun: result.testsRun.length
    };
  }
}