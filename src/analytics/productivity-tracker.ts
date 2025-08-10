/**
 * Developer Productivity Analytics System
 * Tracks agent usage, identifies bottlenecks, and provides optimization insights
 */

import { EventEmitter } from 'events';
import { DataCollector } from './data-collector';
import { PatternAnalyzer } from './pattern-analyzer';
import { InsightsGenerator } from './insights-generator';
import { DashboardAPI } from './dashboard-api';

export interface ProductivityMetrics {
  agentUsage: AgentUsageMetric[];
  taskMetrics: TaskMetric[];
  bottlenecks: Bottleneck[];
  recommendations: Recommendation[];
  productivityScore: number;
  velocityTrend: 'up' | 'stable' | 'down';
}

export interface AgentUsageMetric {
  agent: string;
  invocations: number;
  successRate: number;
  avgExecutionTime: number;
  contextSize: number;
  lastUsed: Date;
}

export interface TaskMetric {
  id: string;
  type: string;
  completionTime: number;
  agentsUsed: string[];
  complexity: number;
  success: boolean;
  timestamp: Date;
}

export interface Bottleneck {
  stage: string;
  frequency: number;
  avgDelay: number;
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface Recommendation {
  type: 'agent' | 'workflow' | 'tool';
  suggestion: string;
  expectedImprovement: number;
  priority: number;
  implementation: string;
}

export class ProductivityTracker extends EventEmitter {
  private dataCollector: DataCollector;
  private patternAnalyzer: PatternAnalyzer;
  private insightsGenerator: InsightsGenerator;
  private dashboardAPI: DashboardAPI;
  private metrics: ProductivityMetrics;
  private trackingEnabled: boolean = true;

  constructor() {
    super();
    this.dataCollector = new DataCollector();
    this.patternAnalyzer = new PatternAnalyzer();
    this.insightsGenerator = new InsightsGenerator();
    this.dashboardAPI = new DashboardAPI();
    
    this.metrics = this.initializeMetrics();
    this.setupEventListeners();
  }

  private initializeMetrics(): ProductivityMetrics {
    return {
      agentUsage: [],
      taskMetrics: [],
      bottlenecks: [],
      recommendations: [],
      productivityScore: 0,
      velocityTrend: 'stable'
    };
  }

  private setupEventListeners(): void {
    this.dataCollector.on('data', (data) => this.processData(data));
    this.patternAnalyzer.on('pattern', (pattern) => this.handlePattern(pattern));
    this.insightsGenerator.on('insight', (insight) => this.handleInsight(insight));
  }

  /**
   * Track an agent invocation
   */
  public trackAgentInvocation(
    agent: string,
    context: any,
    result: any,
    executionTime: number
  ): void {
    if (!this.trackingEnabled) return;

    const metric = {
      agent,
      timestamp: new Date(),
      contextSize: JSON.stringify(context).length,
      success: result.success || false,
      executionTime,
      taskId: context.taskId || 'unknown'
    };

    this.dataCollector.collect('agent_invocation', metric);
    this.updateAgentMetrics(agent, metric);
    this.emit('agent_tracked', metric);
  }

  /**
   * Track a task completion
   */
  public trackTaskCompletion(
    taskId: string,
    type: string,
    agentsUsed: string[],
    completionTime: number,
    success: boolean
  ): void {
    if (!this.trackingEnabled) return;

    const taskMetric: TaskMetric = {
      id: taskId,
      type,
      completionTime,
      agentsUsed,
      complexity: this.calculateComplexity(agentsUsed, completionTime),
      success,
      timestamp: new Date()
    };

    this.metrics.taskMetrics.push(taskMetric);
    this.dataCollector.collect('task_completion', taskMetric);
    this.analyzeTaskPerformance(taskMetric);
    this.emit('task_tracked', taskMetric);
  }

  /**
   * Identify bottlenecks in the workflow
   */
  public identifyBottlenecks(): Bottleneck[] {
    const patterns = this.patternAnalyzer.analyze(this.metrics);
    const bottlenecks: Bottleneck[] = [];

    // Analyze agent performance bottlenecks
    this.metrics.agentUsage.forEach(agent => {
      if (agent.successRate < 0.7) {
        bottlenecks.push({
          stage: `${agent.agent} execution`,
          frequency: agent.invocations,
          avgDelay: agent.avgExecutionTime,
          impact: agent.invocations > 10 ? 'high' : 'medium',
          description: `Low success rate (${(agent.successRate * 100).toFixed(1)}%)`
        });
      }
      
      if (agent.avgExecutionTime > 30000) { // > 30 seconds
        bottlenecks.push({
          stage: `${agent.agent} execution`,
          frequency: agent.invocations,
          avgDelay: agent.avgExecutionTime,
          impact: 'high',
          description: `Slow execution (${(agent.avgExecutionTime / 1000).toFixed(1)}s avg)`
        });
      }
    });

    // Analyze task bottlenecks
    const failedTasks = this.metrics.taskMetrics.filter(t => !t.success);
    if (failedTasks.length > 0) {
      const failureRate = failedTasks.length / this.metrics.taskMetrics.length;
      if (failureRate > 0.2) {
        bottlenecks.push({
          stage: 'Task completion',
          frequency: failedTasks.length,
          avgDelay: 0,
          impact: 'high',
          description: `High failure rate (${(failureRate * 100).toFixed(1)}%)`
        });
      }
    }

    this.metrics.bottlenecks = bottlenecks;
    return bottlenecks;
  }

  /**
   * Generate recommendations for productivity improvement
   */
  public generateRecommendations(): Recommendation[] {
    const insights = this.insightsGenerator.generate(this.metrics);
    const recommendations: Recommendation[] = [];

    // Agent usage recommendations
    this.metrics.agentUsage.forEach(agent => {
      if (agent.contextSize > 10000) {
        recommendations.push({
          type: 'agent',
          suggestion: `Optimize context for ${agent.agent} agent`,
          expectedImprovement: 25,
          priority: 2,
          implementation: 'Use context optimizer to reduce token usage'
        });
      }
    });

    // Workflow recommendations
    const bottlenecks = this.identifyBottlenecks();
    bottlenecks.forEach(bottleneck => {
      if (bottleneck.impact === 'high') {
        recommendations.push({
          type: 'workflow',
          suggestion: `Address ${bottleneck.stage} bottleneck`,
          expectedImprovement: 35,
          priority: 1,
          implementation: bottleneck.description
        });
      }
    });

    // Tool recommendations
    if (this.metrics.taskMetrics.length > 50) {
      const avgComplexity = this.metrics.taskMetrics.reduce((sum, t) => sum + t.complexity, 0) / this.metrics.taskMetrics.length;
      if (avgComplexity > 5) {
        recommendations.push({
          type: 'tool',
          suggestion: 'Enable parallel agent execution',
          expectedImprovement: 40,
          priority: 1,
          implementation: 'Use orchestrator for complex multi-agent tasks'
        });
      }
    }

    // Sort by priority and expected improvement
    recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.expectedImprovement - a.expectedImprovement;
    });

    this.metrics.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Calculate productivity score (0-100)
   */
  public calculateProductivityScore(): number {
    let score = 100;

    // Factor in agent success rates
    const avgSuccessRate = this.metrics.agentUsage.reduce((sum, a) => sum + a.successRate, 0) / (this.metrics.agentUsage.length || 1);
    score *= avgSuccessRate;

    // Factor in task success rate
    const taskSuccessRate = this.metrics.taskMetrics.filter(t => t.success).length / (this.metrics.taskMetrics.length || 1);
    score *= taskSuccessRate;

    // Factor in bottlenecks
    const highImpactBottlenecks = this.metrics.bottlenecks.filter(b => b.impact === 'high').length;
    score -= highImpactBottlenecks * 10;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));
    
    this.metrics.productivityScore = Math.round(score);
    return this.metrics.productivityScore;
  }

  /**
   * Analyze velocity trend
   */
  public analyzeVelocityTrend(): 'up' | 'stable' | 'down' {
    if (this.metrics.taskMetrics.length < 10) {
      return 'stable';
    }

    const recentTasks = this.metrics.taskMetrics.slice(-10);
    const olderTasks = this.metrics.taskMetrics.slice(-20, -10);

    const recentAvgTime = recentTasks.reduce((sum, t) => sum + t.completionTime, 0) / recentTasks.length;
    const olderAvgTime = olderTasks.reduce((sum, t) => sum + t.completionTime, 0) / olderTasks.length;

    if (recentAvgTime < olderAvgTime * 0.9) {
      this.metrics.velocityTrend = 'up';
    } else if (recentAvgTime > olderAvgTime * 1.1) {
      this.metrics.velocityTrend = 'down';
    } else {
      this.metrics.velocityTrend = 'stable';
    }

    return this.metrics.velocityTrend;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): ProductivityMetrics {
    this.calculateProductivityScore();
    this.analyzeVelocityTrend();
    this.identifyBottlenecks();
    this.generateRecommendations();
    return this.metrics;
  }

  /**
   * Get dashboard data
   */
  public getDashboardData(): any {
    return this.dashboardAPI.generateDashboardData(this.getMetrics());
  }

  /**
   * Export analytics report
   */
  public exportReport(format: 'markdown' | 'json' = 'markdown'): string {
    const metrics = this.getMetrics();
    
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    }

    // Markdown format
    return `# Developer Productivity Report

## Summary
- **Productivity Score:** ${metrics.productivityScore}/100
- **Velocity Trend:** ${metrics.velocityTrend}
- **Total Tasks:** ${metrics.taskMetrics.length}
- **Active Agents:** ${metrics.agentUsage.length}

## Agent Performance
${metrics.agentUsage.map(a => `- **${a.agent}:** ${a.invocations} invocations, ${(a.successRate * 100).toFixed(1)}% success rate`).join('\\n')}

## Bottlenecks
${metrics.bottlenecks.map(b => `- **${b.stage}:** ${b.description} (Impact: ${b.impact})`).join('\\n')}

## Recommendations
${metrics.recommendations.map((r, i) => `${i + 1}. ${r.suggestion} (Expected improvement: ${r.expectedImprovement}%)`).join('\\n')}

## Task Metrics
- **Success Rate:** ${((metrics.taskMetrics.filter(t => t.success).length / metrics.taskMetrics.length) * 100).toFixed(1)}%
- **Average Completion Time:** ${(metrics.taskMetrics.reduce((sum, t) => sum + t.completionTime, 0) / metrics.taskMetrics.length / 1000).toFixed(1)}s

---
*Generated: ${new Date().toISOString()}*`;
  }

  /**
   * Reset metrics
   */
  public reset(): void {
    this.metrics = this.initializeMetrics();
    this.emit('reset');
  }

  /**
   * Enable/disable tracking
   */
  public setTrackingEnabled(enabled: boolean): void {
    this.trackingEnabled = enabled;
    this.emit('tracking_status', enabled);
  }

  // Private helper methods
  private updateAgentMetrics(agent: string, metric: any): void {
    let agentMetric = this.metrics.agentUsage.find(a => a.agent === agent);
    
    if (!agentMetric) {
      agentMetric = {
        agent,
        invocations: 0,
        successRate: 0,
        avgExecutionTime: 0,
        contextSize: 0,
        lastUsed: new Date()
      };
      this.metrics.agentUsage.push(agentMetric);
    }

    const totalTime = agentMetric.avgExecutionTime * agentMetric.invocations;
    const totalSuccess = agentMetric.successRate * agentMetric.invocations;
    const totalContext = agentMetric.contextSize * agentMetric.invocations;

    agentMetric.invocations++;
    agentMetric.avgExecutionTime = (totalTime + metric.executionTime) / agentMetric.invocations;
    agentMetric.successRate = (totalSuccess + (metric.success ? 1 : 0)) / agentMetric.invocations;
    agentMetric.contextSize = (totalContext + metric.contextSize) / agentMetric.invocations;
    agentMetric.lastUsed = metric.timestamp;
  }

  private calculateComplexity(agentsUsed: string[], completionTime: number): number {
    // Simple complexity calculation based on agents and time
    const agentComplexity = agentsUsed.length * 2;
    const timeComplexity = Math.log10(completionTime / 1000 + 1);
    return Math.round(agentComplexity + timeComplexity);
  }

  private analyzeTaskPerformance(task: TaskMetric): void {
    // Analyze patterns in task performance
    this.patternAnalyzer.addTask(task);
  }

  private processData(data: any): void {
    // Process collected data
    this.patternAnalyzer.processData(data);
  }

  private handlePattern(pattern: any): void {
    // Handle discovered patterns
    this.insightsGenerator.addPattern(pattern);
  }

  private handleInsight(insight: any): void {
    // Handle generated insights
    this.emit('insight', insight);
  }
}

export default ProductivityTracker;