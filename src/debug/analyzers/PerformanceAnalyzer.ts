/**
 * Performance Analyzer - Detect bottlenecks and optimization opportunities
 * 
 * @file PerformanceAnalyzer.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import { Logger } from '../../../tools/agent-cli/src/utils/Logger';
import { 
  ExecutionTrace, 
  ExecutionStep, 
  PerformanceBottleneck, 
  OptimizationSuggestion,
  PerformanceMetrics,
  WorkflowTrace
} from '../models/TraceModels';

export interface PerformanceAnalysisResult {
  analysisId: string;
  executionId: string;
  timestamp: string;
  
  // Overall scores
  performanceScore: number; // 0-100
  efficiencyScore: number; // 0-100
  reliabilityScore: number; // 0-100
  
  // Detailed analysis
  bottlenecks: PerformanceBottleneck[];
  optimizations: OptimizationSuggestion[];
  
  // Metrics comparison
  baseline?: PerformanceMetrics;
  improvements?: PerformanceImprovement[];
  
  // Recommendations
  prioritizedActions: PrioritizedAction[];
  estimatedImpact: ImpactEstimate;
}

export interface PerformanceImprovement {
  metric: string;
  currentValue: number;
  baselineValue: number;
  improvementPercent: number;
  trend: 'improving' | 'degrading' | 'stable';
}

export interface PrioritizedAction {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  category: 'performance' | 'reliability' | 'cost' | 'maintainability';
}

export interface ImpactEstimate {
  durationReduction: number; // milliseconds
  resourceSaving: number; // percentage
  costSaving: number; // estimated cost reduction
  reliabilityImprovement: number; // percentage
}

export interface PerformanceTrend {
  metric: string;
  timeWindow: string;
  dataPoints: Array<{
    timestamp: string;
    value: number;
    executionId: string;
  }>;
  trend: 'improving' | 'degrading' | 'stable';
  trendStrength: number; // 0-1
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface PerformanceAnalyzerConfig {
  enableTrendAnalysis: boolean;
  trendWindowSize: number; // number of traces to analyze
  enablePredictiveAnalysis: boolean;
  
  // Thresholds
  thresholds: PerformanceThreshold[];
  
  // Analysis settings
  bottleneckDetectionSensitivity: number; // 0-1
  optimizationGenerationMode: 'conservative' | 'aggressive' | 'balanced';
  
  // Caching
  enableResultCaching: boolean;
  cacheExpiryMinutes: number;
}

export interface PerformanceAnalyzerStats {
  totalAnalyses: number;
  bottlenecksDetected: number;
  optimizationsSuggested: number;
  averageAnalysisTime: number;
  cacheHitRate: number;
  trendsTracked: number;
}

export class PerformanceAnalyzer extends EventEmitter {
  private config: PerformanceAnalyzerConfig;
  private logger: Logger;
  
  // Storage
  private analysisResults = new Map<string, PerformanceAnalysisResult>();
  private performanceTrends = new Map<string, PerformanceTrend>();
  private baselineMetrics = new Map<string, PerformanceMetrics>();
  
  // Caching
  private analysisCache = new Map<string, PerformanceAnalysisResult>();
  
  // Statistics
  private stats: PerformanceAnalyzerStats = {
    totalAnalyses: 0,
    bottlenecksDetected: 0,
    optimizationsSuggested: 0,
    averageAnalysisTime: 0,
    cacheHitRate: 0,
    trendsTracked: 0
  };

  constructor(config: Partial<PerformanceAnalyzerConfig> = {}) {
    super();
    
    this.config = {
      enableTrendAnalysis: true,
      trendWindowSize: 50,
      enablePredictiveAnalysis: true,
      
      thresholds: [
        { metric: 'duration', warning: 30000, critical: 60000, unit: 'ms' },
        { metric: 'memory', warning: 500, critical: 1000, unit: 'MB' },
        { metric: 'tokens', warning: 5000, critical: 10000, unit: 'tokens' },
        { metric: 'cpu', warning: 80, critical: 95, unit: '%' }
      ],
      
      bottleneckDetectionSensitivity: 0.7,
      optimizationGenerationMode: 'balanced',
      
      enableResultCaching: true,
      cacheExpiryMinutes: 30,
      
      ...config
    };
    
    this.logger = Logger.create({ 
      component: 'PerformanceAnalyzer',
      level: 'info'
    });
    
    this.setupCleanupInterval();
    this.logger.info('PerformanceAnalyzer initialized', { config: this.config });
  }

  /**
   * Analyze trace performance
   */
  async analyzeTrace(trace: ExecutionTrace): Promise<PerformanceAnalysisResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(trace);
    if (this.config.enableResultCaching) {
      const cached = this.analysisCache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        this.stats.cacheHitRate = (this.stats.cacheHitRate + 1) / 2;
        return cached;
      }
    }

    try {
      const result: PerformanceAnalysisResult = {
        analysisId: this.generateAnalysisId(),
        executionId: trace.executionId,
        timestamp: new Date().toISOString(),
        
        performanceScore: 0,
        efficiencyScore: 0,
        reliabilityScore: 0,
        
        bottlenecks: [],
        optimizations: [],
        
        baseline: this.getBaselineMetrics(trace.agentName),
        improvements: [],
        
        prioritizedActions: [],
        estimatedImpact: {
          durationReduction: 0,
          resourceSaving: 0,
          costSaving: 0,
          reliabilityImprovement: 0
        }
      };

      // Analyze bottlenecks
      result.bottlenecks = await this.detectBottlenecks(trace);
      this.stats.bottlenecksDetected += result.bottlenecks.length;

      // Generate optimizations
      result.optimizations = await this.generateOptimizations(trace, result.bottlenecks);
      this.stats.optimizationsSuggested += result.optimizations.length;

      // Calculate scores
      result.performanceScore = this.calculatePerformanceScore(trace, result.bottlenecks);
      result.efficiencyScore = this.calculateEfficiencyScore(trace);
      result.reliabilityScore = this.calculateReliabilityScore(trace);

      // Compare with baseline
      if (result.baseline) {
        result.improvements = this.compareWithBaseline(trace.performance, result.baseline);
      }

      // Generate prioritized actions
      result.prioritizedActions = this.prioritizeActions(result.optimizations, result.bottlenecks);

      // Calculate estimated impact
      result.estimatedImpact = this.estimateImpact(result.optimizations);

      // Update trends if enabled
      if (this.config.enableTrendAnalysis) {
        this.updatePerformanceTrends(trace);
      }

      // Update baseline metrics
      this.updateBaselineMetrics(trace.agentName, trace.performance);

      // Cache result
      if (this.config.enableResultCaching) {
        this.analysisCache.set(cacheKey, result);
      }

      // Store result
      this.analysisResults.set(result.analysisId, result);

      // Update statistics
      const analysisTime = Date.now() - startTime;
      this.stats.totalAnalyses++;
      this.stats.averageAnalysisTime = 
        (this.stats.averageAnalysisTime * (this.stats.totalAnalyses - 1) + analysisTime) / 
        this.stats.totalAnalyses;

      // Emit events for significant findings
      this.emitAnalysisEvents(result);

      this.logger.info('Performance analysis completed', {
        executionId: trace.executionId,
        analysisTime,
        bottlenecks: result.bottlenecks.length,
        optimizations: result.optimizations.length,
        performanceScore: result.performanceScore
      });

      return result;

    } catch (error) {
      this.logger.error('Performance analysis failed', {
        executionId: trace.executionId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Analyze workflow performance
   */
  async analyzeWorkflow(workflow: WorkflowTrace): Promise<PerformanceAnalysisResult> {
    // Aggregate analysis from all execution traces
    const individualAnalyses = await Promise.all(
      workflow.executionTraces.map(trace => this.analyzeTrace(trace))
    );

    const aggregatedResult: PerformanceAnalysisResult = {
      analysisId: this.generateAnalysisId(),
      executionId: workflow.workflowId,
      timestamp: new Date().toISOString(),
      
      performanceScore: this.aggregateScores(individualAnalyses.map(a => a.performanceScore)),
      efficiencyScore: this.aggregateScores(individualAnalyses.map(a => a.efficiencyScore)),
      reliabilityScore: this.aggregateScores(individualAnalyses.map(a => a.reliabilityScore)),
      
      bottlenecks: this.aggregateBottlenecks(individualAnalyses),
      optimizations: this.aggregateOptimizations(individualAnalyses),
      
      improvements: [],
      prioritizedActions: [],
      estimatedImpact: {
        durationReduction: 0,
        resourceSaving: 0,
        costSaving: 0,
        reliabilityImprovement: 0
      }
    };

    // Workflow-specific analysis
    aggregatedResult.bottlenecks.push(...this.detectWorkflowBottlenecks(workflow));
    aggregatedResult.optimizations.push(...this.generateWorkflowOptimizations(workflow));

    // Re-prioritize for workflow context
    aggregatedResult.prioritizedActions = this.prioritizeActions(
      aggregatedResult.optimizations, 
      aggregatedResult.bottlenecks
    );

    aggregatedResult.estimatedImpact = this.estimateImpact(aggregatedResult.optimizations);

    return aggregatedResult;
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(agentName?: string, timeWindow?: string): PerformanceTrend[] {
    let trends = Array.from(this.performanceTrends.values());
    
    if (agentName) {
      // Filter trends for specific agent (would need agent tracking in trends)
      // For now, return all trends
    }
    
    if (timeWindow) {
      // Filter by time window
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - parseInt(timeWindow));
      
      trends = trends.filter(trend => 
        trend.dataPoints.some(dp => new Date(dp.timestamp) >= cutoff)
      );
    }
    
    return trends;
  }

  /**
   * Get analysis results
   */
  getAnalysisResults(criteria?: {
    executionId?: string;
    minPerformanceScore?: number;
    hasBottlenecks?: boolean;
    limit?: number;
  }): PerformanceAnalysisResult[] {
    let results = Array.from(this.analysisResults.values());
    
    if (criteria) {
      if (criteria.executionId) {
        results = results.filter(r => r.executionId === criteria.executionId);
      }
      
      if (criteria.minPerformanceScore !== undefined) {
        results = results.filter(r => r.performanceScore >= criteria.minPerformanceScore);
      }
      
      if (criteria.hasBottlenecks) {
        results = results.filter(r => r.bottlenecks.length > 0);
      }
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (criteria?.limit) {
      results = results.slice(0, criteria.limit);
    }
    
    return results;
  }

  /**
   * Get statistics
   */
  getStats(): PerformanceAnalyzerStats {
    return { ...this.stats };
  }

  // Private analysis methods

  private async detectBottlenecks(trace: ExecutionTrace): Promise<PerformanceBottleneck[]> {
    const bottlenecks: PerformanceBottleneck[] = [];
    
    // Duration-based bottlenecks
    if (trace.duration) {
      const durationThreshold = this.getThreshold('duration');
      if (trace.duration > durationThreshold.critical) {
        bottlenecks.push({
          id: `bottleneck-duration-${crypto.randomBytes(4).toString('hex')}`,
          type: 'duration',
          severity: 'critical',
          description: `Execution duration ${trace.duration}ms exceeds critical threshold ${durationThreshold.critical}ms`,
          location: {
            stepId: 'overall',
            stepName: 'Overall Execution',
            timeRange: { start: trace.startTime, end: trace.endTime || trace.startTime }
          },
          impact: {
            durationIncrease: trace.duration - durationThreshold.warning,
            resourceCost: trace.performance?.memoryUsage?.peak || 0
          },
          suggestions: [
            'Review execution flow for optimization opportunities',
            'Consider parallel processing where applicable',
            'Optimize resource-intensive operations'
          ]
        });
      }
    }
    
    // Step-level bottlenecks
    const stepDurations = trace.steps.map(s => s.duration || 0).filter(d => d > 0);
    if (stepDurations.length > 0) {
      const avgDuration = stepDurations.reduce((a, b) => a + b, 0) / stepDurations.length;
      const threshold = avgDuration * (2 - this.config.bottleneckDetectionSensitivity);
      
      trace.steps.forEach(step => {
        if ((step.duration || 0) > threshold) {
          bottlenecks.push({
            id: `bottleneck-step-${step.stepId}`,
            type: 'cpu',
            severity: (step.duration || 0) > threshold * 2 ? 'high' : 'medium',
            description: `Step '${step.stepName}' duration ${step.duration}ms significantly exceeds average ${avgDuration.toFixed(0)}ms`,
            location: {
              stepId: step.stepId,
              stepName: step.stepName,
              timeRange: { start: step.startTime, end: step.endTime || step.startTime }
            },
            impact: {
              durationIncrease: (step.duration || 0) - avgDuration,
              resourceCost: step.resourceUsage?.memory || 0
            },
            suggestions: [
              'Profile step execution for optimization',
              'Consider caching if applicable',
              'Optimize algorithms or data structures'
            ]
          });
        }
      });
    }
    
    // Memory bottlenecks
    const memoryThreshold = this.getThreshold('memory');
    if (trace.performance?.memoryUsage?.peak && trace.performance.memoryUsage.peak > memoryThreshold.warning) {
      bottlenecks.push({
        id: `bottleneck-memory-${crypto.randomBytes(4).toString('hex')}`,
        type: 'memory',
        severity: trace.performance.memoryUsage.peak > memoryThreshold.critical ? 'critical' : 'medium',
        description: `Peak memory usage ${trace.performance.memoryUsage.peak.toFixed(1)}MB exceeds threshold`,
        location: {
          stepId: 'overall',
          stepName: 'Memory Usage',
          timeRange: { start: trace.startTime, end: trace.endTime || trace.startTime }
        },
        impact: {
          durationIncrease: 0,
          resourceCost: trace.performance.memoryUsage.peak
        },
        suggestions: [
          'Review memory allocation patterns',
          'Implement garbage collection optimization',
          'Consider streaming for large data processing'
        ]
      });
    }
    
    // Token usage bottlenecks
    const tokenThreshold = this.getThreshold('tokens');
    if (trace.tokenUsage?.totalTokens && trace.tokenUsage.totalTokens > tokenThreshold.warning) {
      bottlenecks.push({
        id: `bottleneck-tokens-${crypto.randomBytes(4).toString('hex')}`,
        type: 'resource',
        severity: trace.tokenUsage.totalTokens > tokenThreshold.critical ? 'high' : 'medium',
        description: `Token usage ${trace.tokenUsage.totalTokens} tokens exceeds threshold`,
        location: {
          stepId: 'overall',
          stepName: 'Token Usage',
          timeRange: { start: trace.startTime, end: trace.endTime || trace.startTime }
        },
        impact: {
          durationIncrease: 0,
          resourceCost: trace.tokenUsage.estimatedCost || 0
        },
        suggestions: [
          'Optimize prompt engineering',
          'Implement context caching',
          'Review token usage patterns'
        ]
      });
    }
    
    return bottlenecks;
  }

  private async generateOptimizations(trace: ExecutionTrace, bottlenecks: PerformanceBottleneck[]): Promise<OptimizationSuggestion[]> {
    const optimizations: OptimizationSuggestion[] = [];
    
    // Generate optimizations based on bottlenecks
    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.type) {
        case 'duration':
          optimizations.push({
            id: `opt-duration-${crypto.randomBytes(4).toString('hex')}`,
            type: 'algorithm',
            priority: 'high',
            description: 'Optimize execution flow to reduce overall duration',
            estimatedImprovement: {
              durationReduction: bottleneck.impact.durationIncrease * 0.3,
              resourceSaving: 10
            },
            implementation: {
              effort: 'medium',
              risk: 'medium',
              details: 'Review and optimize critical path operations'
            }
          });
          break;
          
        case 'memory':
          optimizations.push({
            id: `opt-memory-${crypto.randomBytes(4).toString('hex')}`,
            type: 'resource-allocation',
            priority: 'medium',
            description: 'Optimize memory usage patterns',
            estimatedImprovement: {
              durationReduction: 0,
              resourceSaving: 20
            },
            implementation: {
              effort: 'medium',
              risk: 'low',
              details: 'Implement memory pooling and optimize data structures'
            }
          });
          break;
          
        case 'resource':
          optimizations.push({
            id: `opt-tokens-${crypto.randomBytes(4).toString('hex')}`,
            type: 'caching',
            priority: 'medium',
            description: 'Implement token usage optimization',
            estimatedImprovement: {
              durationReduction: 1000,
              resourceSaving: 25
            },
            implementation: {
              effort: 'low',
              risk: 'low',
              details: 'Add context caching and prompt optimization'
            }
          });
          break;
      }
    });
    
    // General optimizations based on performance metrics
    if (trace.performance?.cacheHitRatio < 0.8) {
      optimizations.push({
        id: `opt-cache-${crypto.randomBytes(4).toString('hex')}`,
        type: 'caching',
        priority: 'medium',
        description: 'Improve cache hit ratio through better caching strategy',
        estimatedImprovement: {
          durationReduction: (trace.duration || 0) * 0.15,
          resourceSaving: 15
        },
        implementation: {
          effort: 'low',
          risk: 'low',
          details: 'Review and optimize caching mechanisms'
        }
      });
    }
    
    // Parallelization opportunities
    if (trace.steps.length > 3 && this.hasParallelizationOpportunity(trace)) {
      optimizations.push({
        id: `opt-parallel-${crypto.randomBytes(4).toString('hex')}`,
        type: 'parallelization',
        priority: 'high',
        description: 'Implement parallel execution for independent operations',
        estimatedImprovement: {
          durationReduction: (trace.duration || 0) * 0.4,
          resourceSaving: 5
        },
        implementation: {
          effort: 'high',
          risk: 'medium',
          details: 'Identify and parallelize independent execution steps'
        }
      });
    }
    
    return optimizations;
  }

  private calculatePerformanceScore(trace: ExecutionTrace, bottlenecks: PerformanceBottleneck[]): number {
    let score = 100;
    
    // Penalize based on bottlenecks
    bottlenecks.forEach(bottleneck => {
      switch (bottleneck.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Adjust based on performance metrics
    if (trace.performance?.cacheHitRatio) {
      score += trace.performance.cacheHitRatio * 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateEfficiencyScore(trace: ExecutionTrace): number {
    let score = 100;
    
    // Token efficiency
    if (trace.tokenUsage?.efficiencyScore) {
      score = (score + trace.tokenUsage.efficiencyScore) / 2;
    }
    
    // Resource utilization
    const memoryEfficiency = this.calculateResourceEfficiency(
      trace.performance?.memoryUsage?.average || 0,
      trace.performance?.memoryUsage?.peak || 1
    );
    score = (score + memoryEfficiency) / 2;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateReliabilityScore(trace: ExecutionTrace): number {
    let score = 100;
    
    // Success rate impact
    if (trace.status === 'failed') {
      score = 0;
    } else if (trace.status === 'completed') {
      score = 100;
    } else {
      score = 50; // partial completion
    }
    
    // Error handling
    if (trace.error) {
      score = Math.max(0, score - 20);
    }
    
    return Math.max(0, Math.min(100, score));
  }

  // Helper methods

  private getThreshold(metric: string): PerformanceThreshold {
    return this.config.thresholds.find(t => t.metric === metric) || 
           { metric, warning: 1000, critical: 2000, unit: 'units' };
  }

  private calculateResourceEfficiency(average: number, peak: number): number {
    if (peak === 0) return 100;
    return (average / peak) * 100;
  }

  private hasParallelizationOpportunity(trace: ExecutionTrace): boolean {
    // Simple heuristic: if steps are relatively independent
    // (no data dependencies in context changes)
    return trace.steps.some((step, index) => 
      index > 0 && 
      !this.hasDataDependency(step, trace.steps[index - 1])
    );
  }

  private hasDataDependency(currentStep: ExecutionStep, previousStep: ExecutionStep): boolean {
    // Check if current step uses output from previous step
    // Simplified check - in practice would be more sophisticated
    return currentStep.input === previousStep.output;
  }

  private compareWithBaseline(current: PerformanceMetrics, baseline: PerformanceMetrics): PerformanceImprovement[] {
    const improvements: PerformanceImprovement[] = [];
    
    // Duration comparison
    if (baseline.totalDuration > 0) {
      const improvementPercent = ((baseline.totalDuration - current.totalDuration) / baseline.totalDuration) * 100;
      improvements.push({
        metric: 'duration',
        currentValue: current.totalDuration,
        baselineValue: baseline.totalDuration,
        improvementPercent,
        trend: improvementPercent > 5 ? 'improving' : improvementPercent < -5 ? 'degrading' : 'stable'
      });
    }
    
    // Memory comparison
    if (baseline.memoryUsage?.peak && current.memoryUsage?.peak) {
      const improvementPercent = ((baseline.memoryUsage.peak - current.memoryUsage.peak) / baseline.memoryUsage.peak) * 100;
      improvements.push({
        metric: 'memory',
        currentValue: current.memoryUsage.peak,
        baselineValue: baseline.memoryUsage.peak,
        improvementPercent,
        trend: improvementPercent > 5 ? 'improving' : improvementPercent < -5 ? 'degrading' : 'stable'
      });
    }
    
    return improvements;
  }

  private prioritizeActions(optimizations: OptimizationSuggestion[], bottlenecks: PerformanceBottleneck[]): PrioritizedAction[] {
    const actions: PrioritizedAction[] = [];
    
    // Convert bottlenecks to actions
    bottlenecks.forEach(bottleneck => {
      let priority: PrioritizedAction['priority'] = 'medium';
      if (bottleneck.severity === 'critical') priority = 'critical';
      else if (bottleneck.severity === 'high') priority = 'high';
      else if (bottleneck.severity === 'low') priority = 'low';
      
      actions.push({
        priority,
        action: `Address ${bottleneck.type} bottleneck`,
        description: bottleneck.description,
        estimatedEffort: 'medium',
        expectedImpact: bottleneck.severity === 'critical' ? 'high' : 'medium',
        category: 'performance'
      });
    });
    
    // Convert optimizations to actions
    optimizations.forEach(optimization => {
      actions.push({
        priority: optimization.priority === 'high' ? 'high' : 'medium',
        action: optimization.description,
        description: optimization.implementation.details,
        estimatedEffort: optimization.implementation.effort,
        expectedImpact: optimization.estimatedImprovement.durationReduction > 1000 ? 'high' : 'medium',
        category: 'performance'
      });
    });
    
    // Sort by priority and impact
    actions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const impactOrder = { high: 3, medium: 2, low: 1 };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return impactOrder[b.expectedImpact] - impactOrder[a.expectedImpact];
    });
    
    return actions;
  }

  private estimateImpact(optimizations: OptimizationSuggestion[]): ImpactEstimate {
    return optimizations.reduce((total, opt) => ({
      durationReduction: total.durationReduction + opt.estimatedImprovement.durationReduction,
      resourceSaving: total.resourceSaving + opt.estimatedImprovement.resourceSaving,
      costSaving: total.costSaving + (opt.estimatedImprovement.resourceSaving * 0.01), // Rough estimate
      reliabilityImprovement: total.reliabilityImprovement + (opt.type === 'resource-allocation' ? 5 : 0)
    }), {
      durationReduction: 0,
      resourceSaving: 0,
      costSaving: 0,
      reliabilityImprovement: 0
    });
  }

  private updatePerformanceTrends(trace: ExecutionTrace): void {
    const metrics = ['duration', 'memory', 'tokens', 'cpu'];
    
    metrics.forEach(metric => {
      let trendKey = `${trace.agentName}-${metric}`;
      let trend = this.performanceTrends.get(trendKey);
      
      if (!trend) {
        trend = {
          metric,
          timeWindow: '24h',
          dataPoints: [],
          trend: 'stable',
          trendStrength: 0
        };
        this.performanceTrends.set(trendKey, trend);
        this.stats.trendsTracked++;
      }
      
      // Add data point
      const value = this.extractMetricValue(trace, metric);
      if (value !== null) {
        trend.dataPoints.push({
          timestamp: trace.startTime,
          value,
          executionId: trace.executionId
        });
        
        // Maintain window size
        if (trend.dataPoints.length > this.config.trendWindowSize) {
          trend.dataPoints.shift();
        }
        
        // Update trend analysis
        this.analyzeTrend(trend);
      }
    });
  }

  private extractMetricValue(trace: ExecutionTrace, metric: string): number | null {
    switch (metric) {
      case 'duration':
        return trace.duration || 0;
      case 'memory':
        return trace.performance?.memoryUsage?.peak || 0;
      case 'tokens':
        return trace.tokenUsage?.totalTokens || 0;
      case 'cpu':
        return trace.performance?.cpuTime || 0;
      default:
        return null;
    }
  }

  private analyzeTrend(trend: PerformanceTrend): void {
    if (trend.dataPoints.length < 3) return;
    
    const values = trend.dataPoints.map(dp => dp.value);
    const n = values.length;
    
    // Simple linear regression for trend detection
    const sumX = Array.from({length: n}, (_, i) => i).reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
    const sumXX = Array.from({length: n}, (_, i) => i * i).reduce((a, b) => a + b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Determine trend direction and strength
    const avgValue = sumY / n;
    const relativeSlope = Math.abs(slope) / avgValue;
    
    if (relativeSlope < 0.01) {
      trend.trend = 'stable';
    } else if (slope > 0) {
      trend.trend = 'degrading'; // Increasing values are usually bad for performance
    } else {
      trend.trend = 'improving';
    }
    
    trend.trendStrength = Math.min(1, relativeSlope * 10);
  }

  private updateBaselineMetrics(agentName: string, metrics: PerformanceMetrics): void {
    // Simple rolling average baseline
    const existing = this.baselineMetrics.get(agentName);
    if (existing) {
      const alpha = 0.1; // Smoothing factor
      const updated: PerformanceMetrics = {
        totalDuration: existing.totalDuration * (1 - alpha) + metrics.totalDuration * alpha,
        cpuTime: existing.cpuTime * (1 - alpha) + metrics.cpuTime * alpha,
        memoryUsage: {
          peak: existing.memoryUsage.peak * (1 - alpha) + metrics.memoryUsage.peak * alpha,
          average: existing.memoryUsage.average * (1 - alpha) + metrics.memoryUsage.average * alpha,
          final: existing.memoryUsage.final * (1 - alpha) + metrics.memoryUsage.final * alpha
        },
        ioOperations: metrics.ioOperations, // Use latest
        cacheHitRatio: existing.cacheHitRatio * (1 - alpha) + metrics.cacheHitRatio * alpha,
        bottlenecks: [], // Don't baseline bottlenecks
        optimizationSuggestions: []
      };
      this.baselineMetrics.set(agentName, updated);
    } else {
      this.baselineMetrics.set(agentName, { ...metrics });
    }
  }

  private getBaselineMetrics(agentName: string): PerformanceMetrics | undefined {
    return this.baselineMetrics.get(agentName);
  }

  private emitAnalysisEvents(result: PerformanceAnalysisResult): void {
    // Emit bottleneck detection events
    result.bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity === 'critical' || bottleneck.severity === 'high') {
        this.emit('bottleneck:detected', {
          executionId: result.executionId,
          bottleneck,
          analysisId: result.analysisId
        });
      }
    });
    
    // Emit performance score events
    if (result.performanceScore < 60) {
      this.emit('performance:low-score', {
        executionId: result.executionId,
        score: result.performanceScore,
        analysisId: result.analysisId
      });
    }
  }

  // Workflow-specific methods

  private detectWorkflowBottlenecks(workflow: WorkflowTrace): PerformanceBottleneck[] {
    const bottlenecks: PerformanceBottleneck[] = [];
    
    // Detect sequential bottlenecks
    const parallelizableSteps = workflow.executionTraces.filter(trace => 
      !workflow.dependencies.some(dep => dep.toExecutionId === trace.executionId)
    );
    
    if (parallelizableSteps.length > 1) {
      bottlenecks.push({
        id: `workflow-sequential-${crypto.randomBytes(4).toString('hex')}`,
        type: 'wait',
        severity: 'medium',
        description: `${parallelizableSteps.length} steps could be executed in parallel`,
        location: {
          stepId: 'workflow',
          stepName: 'Workflow Execution',
          timeRange: { start: workflow.startTime, end: workflow.endTime || workflow.startTime }
        },
        impact: {
          durationIncrease: (workflow.duration || 0) * 0.3,
          resourceCost: 0
        },
        suggestions: [
          'Implement parallel execution for independent steps',
          'Review workflow dependencies'
        ]
      });
    }
    
    return bottlenecks;
  }

  private generateWorkflowOptimizations(workflow: WorkflowTrace): OptimizationSuggestion[] {
    const optimizations: OptimizationSuggestion[] = [];
    
    // Parallelization optimization
    const independentTraces = workflow.executionTraces.filter(trace =>
      !workflow.dependencies.some(dep => dep.toExecutionId === trace.executionId)
    );
    
    if (independentTraces.length > 1) {
      optimizations.push({
        id: `workflow-parallel-${crypto.randomBytes(4).toString('hex')}`,
        type: 'parallelization',
        priority: 'high',
        description: 'Implement parallel execution for workflow steps',
        estimatedImprovement: {
          durationReduction: (workflow.duration || 0) * 0.4,
          resourceSaving: 10
        },
        implementation: {
          effort: 'high',
          risk: 'medium',
          details: 'Redesign workflow to execute independent steps in parallel'
        }
      });
    }
    
    return optimizations;
  }

  private aggregateScores(scores: number[]): number {
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private aggregateBottlenecks(analyses: PerformanceAnalysisResult[]): PerformanceBottleneck[] {
    const allBottlenecks = analyses.flatMap(a => a.bottlenecks);
    
    // Deduplicate similar bottlenecks
    const uniqueBottlenecks: PerformanceBottleneck[] = [];
    const seen = new Set<string>();
    
    allBottlenecks.forEach(bottleneck => {
      const key = `${bottleneck.type}-${bottleneck.severity}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBottlenecks.push(bottleneck);
      }
    });
    
    return uniqueBottlenecks;
  }

  private aggregateOptimizations(analyses: PerformanceAnalysisResult[]): OptimizationSuggestion[] {
    const allOptimizations = analyses.flatMap(a => a.optimizations);
    
    // Deduplicate and prioritize
    const optimizationMap = new Map<string, OptimizationSuggestion>();
    
    allOptimizations.forEach(opt => {
      const key = opt.type;
      const existing = optimizationMap.get(key);
      
      if (!existing || opt.priority === 'high') {
        optimizationMap.set(key, opt);
      }
    });
    
    return Array.from(optimizationMap.values());
  }

  // Utility methods

  private generateAnalysisId(): string {
    return `analysis-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateCacheKey(trace: ExecutionTrace): string {
    return `cache-${trace.executionId}-${trace.agentName}`;
  }

  private isCacheValid(result: PerformanceAnalysisResult): boolean {
    const ageMinutes = (Date.now() - new Date(result.timestamp).getTime()) / (1000 * 60);
    return ageMinutes < this.config.cacheExpiryMinutes;
  }

  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60 * 60 * 1000); // Run every hour
  }

  private cleanupExpiredData(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24); // Keep 24 hours of data
    
    // Clean analysis results
    for (const [id, result] of this.analysisResults.entries()) {
      if (new Date(result.timestamp) < cutoffTime) {
        this.analysisResults.delete(id);
      }
    }
    
    // Clean cache
    for (const [key, result] of this.analysisCache.entries()) {
      if (!this.isCacheValid(result)) {
        this.analysisCache.delete(key);
      }
    }
    
    // Clean trend data points
    for (const trend of this.performanceTrends.values()) {
      trend.dataPoints = trend.dataPoints.filter(dp => 
        new Date(dp.timestamp) >= cutoffTime
      );
    }
    
    this.logger.info('Cleanup completed', {
      analysisResults: this.analysisResults.size,
      cacheEntries: this.analysisCache.size,
      trends: this.performanceTrends.size
    });
  }
}