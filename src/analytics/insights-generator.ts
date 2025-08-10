/**
 * Insights Generator for Productivity Analytics
 * Generates actionable insights from patterns and metrics
 */

import { EventEmitter } from 'events';
import { ProductivityMetrics, Recommendation } from './productivity-tracker';
import { Pattern } from './pattern-analyzer';

export interface Insight {
  id: string;
  type: 'improvement' | 'warning' | 'success' | 'opportunity';
  title: string;
  description: string;
  actionable: boolean;
  actions: string[];
  expectedImpact: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical';
  data: any;
}

export class InsightsGenerator extends EventEmitter {
  private insights: Insight[] = [];
  private patterns: Pattern[] = [];
  private historicalMetrics: ProductivityMetrics[] = [];

  constructor() {
    super();
  }

  /**
   * Generate insights from metrics
   */
  public generate(metrics: ProductivityMetrics): Insight[] {
    this.insights = [];
    this.historicalMetrics.push(metrics);

    // Keep only recent history
    if (this.historicalMetrics.length > 100) {
      this.historicalMetrics = this.historicalMetrics.slice(-100);
    }

    this.generateAgentInsights(metrics);
    this.generateWorkflowInsights(metrics);
    this.generateProductivityInsights(metrics);
    this.generateOptimizationInsights(metrics);
    this.generatePredictiveInsights(metrics);

    return this.insights;
  }

  /**
   * Add pattern for insight generation
   */
  public addPattern(pattern: Pattern): void {
    this.patterns.push(pattern);
    this.generatePatternInsight(pattern);
  }

  /**
   * Generate agent-related insights
   */
  private generateAgentInsights(metrics: ProductivityMetrics): void {
    // Find best performing agents
    const topAgents = metrics.agentUsage
      .filter(a => a.invocations > 5)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);

    if (topAgents.length > 0) {
      this.addInsight({
        id: 'top-agents',
        type: 'success',
        title: 'Top Performing Agents',
        description: `Agents ${topAgents.map(a => a.agent).join(', ')} are performing exceptionally well`,
        actionable: true,
        actions: ['Prioritize these agents for complex tasks', 'Study their usage patterns'],
        expectedImpact: 20,
        priority: 'medium',
        data: topAgents
      });
    }

    // Find problematic agents
    const problemAgents = metrics.agentUsage.filter(a => 
      a.invocations > 10 && a.successRate < 0.6
    );

    problemAgents.forEach(agent => {
      this.addInsight({
        id: `problem-agent-${agent.agent}`,
        type: 'warning',
        title: `Agent ${agent.agent} Needs Attention`,
        description: `Success rate is only ${(agent.successRate * 100).toFixed(1)}%`,
        actionable: true,
        actions: [
          'Review and refine agent prompts',
          'Check for context issues',
          'Consider alternative agents'
        ],
        expectedImpact: 35,
        priority: 'high',
        data: agent
      });
    });

    // Context optimization opportunities
    const highContextAgents = metrics.agentUsage.filter(a => a.contextSize > 15000);
    if (highContextAgents.length > 0) {
      this.addInsight({
        id: 'context-optimization',
        type: 'opportunity',
        title: 'Context Optimization Opportunity',
        description: `${highContextAgents.length} agents using large contexts`,
        actionable: true,
        actions: [
          'Use context optimizer tool',
          'Implement selective context loading',
          'Cache frequently used contexts'
        ],
        expectedImpact: 40,
        priority: 'medium',
        data: highContextAgents
      });
    }
  }

  /**
   * Generate workflow insights
   */
  private generateWorkflowInsights(metrics: ProductivityMetrics): void {
    // Analyze task success patterns
    if (metrics.taskMetrics.length > 20) {
      const tasksByType = new Map<string, { success: number; total: number }>();
      
      metrics.taskMetrics.forEach(task => {
        if (!tasksByType.has(task.type)) {
          tasksByType.set(task.type, { success: 0, total: 0 });
        }
        const typeData = tasksByType.get(task.type)!;
        typeData.total++;
        if (task.success) typeData.success++;
      });

      tasksByType.forEach((data, type) => {
        const successRate = data.success / data.total;
        if (successRate < 0.7 && data.total > 5) {
          this.addInsight({
            id: `workflow-improvement-${type}`,
            type: 'improvement',
            title: `Improve ${type} Workflow`,
            description: `Success rate is ${(successRate * 100).toFixed(1)}% (${data.success}/${data.total})`,
            actionable: true,
            actions: [
              'Review failed tasks for patterns',
              'Add additional validation steps',
              'Consider different agent combinations'
            ],
            expectedImpact: 45,
            priority: 'high',
            data: { type, successRate, total: data.total }
          });
        }
      });
    }

    // Identify bottlenecks
    metrics.bottlenecks.forEach(bottleneck => {
      if (bottleneck.impact === 'high') {
        this.addInsight({
          id: `bottleneck-${bottleneck.stage}`,
          type: 'warning',
          title: `Critical Bottleneck: ${bottleneck.stage}`,
          description: bottleneck.description,
          actionable: true,
          actions: [
            'Investigate root cause',
            'Consider parallel processing',
            'Optimize the affected stage'
          ],
          expectedImpact: 50,
          priority: 'critical',
          data: bottleneck
        });
      }
    });
  }

  /**
   * Generate productivity insights
   */
  private generateProductivityInsights(metrics: ProductivityMetrics): void {
    // Productivity score insights
    if (metrics.productivityScore < 60) {
      this.addInsight({
        id: 'low-productivity',
        type: 'warning',
        title: 'Productivity Below Target',
        description: `Current score: ${metrics.productivityScore}/100`,
        actionable: true,
        actions: [
          'Review and address bottlenecks',
          'Optimize agent usage',
          'Implement recommended improvements'
        ],
        expectedImpact: 60,
        priority: 'high',
        data: { score: metrics.productivityScore }
      });
    } else if (metrics.productivityScore > 85) {
      this.addInsight({
        id: 'high-productivity',
        type: 'success',
        title: 'Excellent Productivity',
        description: `Maintaining ${metrics.productivityScore}/100 productivity score`,
        actionable: true,
        actions: [
          'Document current best practices',
          'Share successful patterns with team'
        ],
        expectedImpact: 10,
        priority: 'low',
        data: { score: metrics.productivityScore }
      });
    }

    // Velocity trend insights
    if (metrics.velocityTrend === 'down' && this.historicalMetrics.length > 5) {
      this.addInsight({
        id: 'velocity-declining',
        type: 'warning',
        title: 'Velocity Declining',
        description: 'Development velocity showing downward trend',
        actionable: true,
        actions: [
          'Analyze recent changes in workflow',
          'Check for new bottlenecks',
          'Review agent performance trends'
        ],
        expectedImpact: 40,
        priority: 'high',
        data: { trend: metrics.velocityTrend }
      });
    } else if (metrics.velocityTrend === 'up') {
      this.addInsight({
        id: 'velocity-improving',
        type: 'success',
        title: 'Velocity Improving',
        description: 'Development velocity showing upward trend',
        actionable: true,
        actions: [
          'Continue current practices',
          'Document improvements made'
        ],
        expectedImpact: 15,
        priority: 'low',
        data: { trend: metrics.velocityTrend }
      });
    }
  }

  /**
   * Generate optimization insights
   */
  private generateOptimizationInsights(metrics: ProductivityMetrics): void {
    // Parallel execution opportunities
    const sequentialTasks = metrics.taskMetrics.filter(t => 
      t.agentsUsed.length > 3 && t.completionTime > 60000
    );

    if (sequentialTasks.length > 5) {
      this.addInsight({
        id: 'parallel-execution',
        type: 'opportunity',
        title: 'Enable Parallel Agent Execution',
        description: `${sequentialTasks.length} tasks could benefit from parallelization`,
        actionable: true,
        actions: [
          'Use agent orchestrator for complex tasks',
          'Identify independent subtasks',
          'Implement parallel execution patterns'
        ],
        expectedImpact: 55,
        priority: 'high',
        data: { count: sequentialTasks.length }
      });
    }

    // Caching opportunities
    const repeatAgents = metrics.agentUsage.filter(a => a.invocations > 20);
    if (repeatAgents.length > 0) {
      this.addInsight({
        id: 'caching-opportunity',
        type: 'opportunity',
        title: 'Implement Response Caching',
        description: 'Frequently used agents could benefit from caching',
        actionable: true,
        actions: [
          'Enable context caching',
          'Implement result memoization',
          'Use performance cache system'
        ],
        expectedImpact: 30,
        priority: 'medium',
        data: repeatAgents
      });
    }
  }

  /**
   * Generate predictive insights
   */
  private generatePredictiveInsights(metrics: ProductivityMetrics): void {
    if (this.historicalMetrics.length < 10) return;

    // Predict future bottlenecks
    const recentBottlenecks = this.historicalMetrics.slice(-5)
      .flatMap(m => m.bottlenecks)
      .filter(b => b.impact === 'high');

    const bottleneckFrequency = new Map<string, number>();
    recentBottlenecks.forEach(b => {
      bottleneckFrequency.set(b.stage, (bottleneckFrequency.get(b.stage) || 0) + 1);
    });

    bottleneckFrequency.forEach((freq, stage) => {
      if (freq >= 3) {
        this.addInsight({
          id: `predicted-bottleneck-${stage}`,
          type: 'warning',
          title: `Recurring Bottleneck: ${stage}`,
          description: 'This bottleneck appears frequently and needs permanent solution',
          actionable: true,
          actions: [
            'Implement systematic fix',
            'Redesign the workflow stage',
            'Allocate more resources'
          ],
          expectedImpact: 65,
          priority: 'critical',
          data: { stage, frequency: freq }
        });
      }
    });

    // Predict productivity trends
    const recentScores = this.historicalMetrics.slice(-10)
      .map(m => m.productivityScore);
    
    if (recentScores.length === 10) {
      const trend = this.calculateTrend(recentScores);
      
      if (trend < -5) {
        this.addInsight({
          id: 'productivity-decline-predicted',
          type: 'warning',
          title: 'Productivity Decline Predicted',
          description: 'Productivity showing consistent decline pattern',
          actionable: true,
          actions: [
            'Immediate intervention required',
            'Review all recent changes',
            'Implement recovery plan'
          ],
          expectedImpact: 70,
          priority: 'critical',
          data: { trend, scores: recentScores }
        });
      }
    }
  }

  /**
   * Generate insight from pattern
   */
  private generatePatternInsight(pattern: Pattern): void {
    let insight: Insight | null = null;

    switch (pattern.type) {
      case 'success':
        insight = {
          id: `pattern-${pattern.id}`,
          type: 'success',
          title: 'Successful Pattern Detected',
          description: pattern.description,
          actionable: true,
          actions: ['Replicate this pattern', 'Document for future use'],
          expectedImpact: 25,
          priority: 'medium',
          data: pattern
        };
        break;

      case 'failure':
        insight = {
          id: `pattern-${pattern.id}`,
          type: 'warning',
          title: 'Failure Pattern Detected',
          description: pattern.description,
          actionable: true,
          actions: ['Investigate root cause', 'Implement preventive measures'],
          expectedImpact: 40,
          priority: 'high',
          data: pattern
        };
        break;

      case 'bottleneck':
        insight = {
          id: `pattern-${pattern.id}`,
          type: 'improvement',
          title: 'Bottleneck Pattern Identified',
          description: pattern.description,
          actionable: true,
          actions: ['Optimize the bottleneck', 'Consider alternative approaches'],
          expectedImpact: 35,
          priority: pattern.impact === 'high' ? 'high' : 'medium',
          data: pattern
        };
        break;

      case 'optimization':
        insight = {
          id: `pattern-${pattern.id}`,
          type: 'opportunity',
          title: 'Optimization Opportunity',
          description: pattern.description,
          actionable: true,
          actions: ['Implement optimization', 'Measure improvement'],
          expectedImpact: 30,
          priority: 'medium',
          data: pattern
        };
        break;
    }

    if (insight) {
      this.addInsight(insight);
    }
  }

  /**
   * Add insight and emit event
   */
  private addInsight(insight: Insight): void {
    // Check if insight already exists
    const existing = this.insights.find(i => i.id === insight.id);
    if (!existing) {
      this.insights.push(insight);
      this.emit('insight', insight);
    }
  }

  /**
   * Calculate trend from data points
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression
    const n = values.length;
    const sumX = values.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = values.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Get insights by type
   */
  public getInsightsByType(type: Insight['type']): Insight[] {
    return this.insights.filter(i => i.type === type);
  }

  /**
   * Get high priority insights
   */
  public getHighPriorityInsights(): Insight[] {
    return this.insights.filter(i => i.priority === 'high' || i.priority === 'critical');
  }

  /**
   * Clear insights
   */
  public clearInsights(): void {
    this.insights = [];
    this.patterns = [];
  }
}

export default InsightsGenerator;