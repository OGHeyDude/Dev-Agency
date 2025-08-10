/**
 * Dashboard API for Productivity Analytics
 * Provides data formatting and API endpoints for dashboard visualization
 */

import { ProductivityMetrics, AgentUsageMetric, TaskMetric, Bottleneck, Recommendation } from './productivity-tracker';

export interface DashboardData {
  overview: OverviewData;
  agents: AgentData;
  tasks: TaskData;
  insights: InsightData;
  charts: ChartData;
}

export interface OverviewData {
  productivityScore: number;
  scoreChange: number;
  velocityTrend: 'up' | 'stable' | 'down';
  totalTasks: number;
  successRate: number;
  activeAgents: number;
  topRecommendation: string;
  lastUpdated: Date;
}

export interface AgentData {
  topAgents: AgentSummary[];
  agentPerformance: AgentPerformance[];
  agentComparison: AgentComparison;
}

export interface AgentSummary {
  name: string;
  invocations: number;
  successRate: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface AgentPerformance {
  agent: string;
  metrics: {
    invocations: number;
    successRate: number;
    avgTime: number;
    contextSize: number;
  };
  sparkline: number[];
}

export interface AgentComparison {
  labels: string[];
  successRates: number[];
  invocations: number[];
  avgTimes: number[];
}

export interface TaskData {
  recentTasks: TaskSummary[];
  taskDistribution: TaskDistribution;
  completionTimes: TimeDistribution;
}

export interface TaskSummary {
  id: string;
  type: string;
  agents: string[];
  duration: string;
  status: 'success' | 'failure';
  timestamp: string;
}

export interface TaskDistribution {
  byType: { type: string; count: number }[];
  byComplexity: { complexity: string; count: number }[];
  bySuccess: { status: string; count: number }[];
}

export interface TimeDistribution {
  buckets: string[];
  counts: number[];
  average: number;
  median: number;
}

export interface InsightData {
  bottlenecks: BottleneckSummary[];
  recommendations: RecommendationSummary[];
  patterns: PatternSummary[];
}

export interface BottleneckSummary {
  stage: string;
  impact: string;
  description: string;
  actionRequired: boolean;
}

export interface RecommendationSummary {
  title: string;
  impact: string;
  priority: number;
  action: string;
}

export interface PatternSummary {
  type: string;
  description: string;
  frequency: number;
}

export interface ChartData {
  productivityTrend: TimeSeriesData;
  agentUsageTrend: TimeSeriesData;
  taskSuccessTrend: TimeSeriesData;
  velocityChart: TimeSeriesData;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export class DashboardAPI {
  private historicalData: ProductivityMetrics[] = [];
  private maxHistorySize: number = 100;

  /**
   * Generate complete dashboard data
   */
  public generateDashboardData(metrics: ProductivityMetrics): DashboardData {
    this.updateHistory(metrics);

    return {
      overview: this.generateOverview(metrics),
      agents: this.generateAgentData(metrics),
      tasks: this.generateTaskData(metrics),
      insights: this.generateInsightData(metrics),
      charts: this.generateChartData(metrics)
    };
  }

  /**
   * Generate overview data
   */
  private generateOverview(metrics: ProductivityMetrics): OverviewData {
    const previousScore = this.historicalData.length > 1 
      ? this.historicalData[this.historicalData.length - 2].productivityScore 
      : metrics.productivityScore;

    const successfulTasks = metrics.taskMetrics.filter(t => t.success).length;
    const successRate = metrics.taskMetrics.length > 0 
      ? (successfulTasks / metrics.taskMetrics.length) * 100 
      : 0;

    return {
      productivityScore: metrics.productivityScore,
      scoreChange: metrics.productivityScore - previousScore,
      velocityTrend: metrics.velocityTrend,
      totalTasks: metrics.taskMetrics.length,
      successRate: Math.round(successRate),
      activeAgents: metrics.agentUsage.length,
      topRecommendation: metrics.recommendations[0]?.suggestion || 'No recommendations',
      lastUpdated: new Date()
    };
  }

  /**
   * Generate agent data
   */
  private generateAgentData(metrics: ProductivityMetrics): AgentData {
    // Top agents
    const topAgents: AgentSummary[] = metrics.agentUsage
      .sort((a, b) => b.invocations - a.invocations)
      .slice(0, 5)
      .map(agent => ({
        name: agent.agent,
        invocations: agent.invocations,
        successRate: Math.round(agent.successRate * 100),
        trend: this.calculateAgentTrend(agent.agent)
      }));

    // Agent performance details
    const agentPerformance: AgentPerformance[] = metrics.agentUsage.map(agent => ({
      agent: agent.agent,
      metrics: {
        invocations: agent.invocations,
        successRate: Math.round(agent.successRate * 100),
        avgTime: Math.round(agent.avgExecutionTime / 1000),
        contextSize: agent.contextSize
      },
      sparkline: this.generateSparkline(agent.agent)
    }));

    // Agent comparison
    const agentComparison: AgentComparison = {
      labels: metrics.agentUsage.map(a => a.agent),
      successRates: metrics.agentUsage.map(a => Math.round(a.successRate * 100)),
      invocations: metrics.agentUsage.map(a => a.invocations),
      avgTimes: metrics.agentUsage.map(a => Math.round(a.avgExecutionTime / 1000))
    };

    return {
      topAgents,
      agentPerformance,
      agentComparison
    };
  }

  /**
   * Generate task data
   */
  private generateTaskData(metrics: ProductivityMetrics): TaskData {
    // Recent tasks
    const recentTasks: TaskSummary[] = metrics.taskMetrics
      .slice(-10)
      .reverse()
      .map(task => ({
        id: task.id,
        type: task.type,
        agents: task.agentsUsed,
        duration: this.formatDuration(task.completionTime),
        status: task.success ? 'success' : 'failure',
        timestamp: this.formatTime(task.timestamp)
      }));

    // Task distribution
    const typeMap = new Map<string, number>();
    const complexityMap = new Map<string, number>();
    let successCount = 0;
    let failureCount = 0;

    metrics.taskMetrics.forEach(task => {
      // By type
      typeMap.set(task.type, (typeMap.get(task.type) || 0) + 1);
      
      // By complexity
      const complexityBucket = this.getComplexityBucket(task.complexity);
      complexityMap.set(complexityBucket, (complexityMap.get(complexityBucket) || 0) + 1);
      
      // By success
      if (task.success) successCount++;
      else failureCount++;
    });

    const taskDistribution: TaskDistribution = {
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })),
      byComplexity: Array.from(complexityMap.entries()).map(([complexity, count]) => ({ complexity, count })),
      bySuccess: [
        { status: 'Success', count: successCount },
        { status: 'Failure', count: failureCount }
      ]
    };

    // Completion times
    const times = metrics.taskMetrics.map(t => t.completionTime / 1000).sort((a, b) => a - b);
    const timeDistribution: TimeDistribution = {
      buckets: ['<10s', '10-30s', '30-60s', '1-2m', '>2m'],
      counts: this.bucketizeTimes(times),
      average: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      median: times.length > 0 ? Math.round(times[Math.floor(times.length / 2)]) : 0
    };

    return {
      recentTasks,
      taskDistribution,
      completionTimes: timeDistribution
    };
  }

  /**
   * Generate insight data
   */
  private generateInsightData(metrics: ProductivityMetrics): InsightData {
    // Bottlenecks
    const bottlenecks: BottleneckSummary[] = metrics.bottlenecks.map(b => ({
      stage: b.stage,
      impact: b.impact,
      description: b.description,
      actionRequired: b.impact === 'high'
    }));

    // Recommendations
    const recommendations: RecommendationSummary[] = metrics.recommendations
      .slice(0, 5)
      .map(r => ({
        title: r.suggestion,
        impact: `${r.expectedImprovement}%`,
        priority: r.priority,
        action: r.implementation
      }));

    // Patterns (would come from pattern analyzer in full implementation)
    const patterns: PatternSummary[] = [
      { type: 'success', description: 'Morning sessions most productive', frequency: 15 },
      { type: 'optimization', description: 'Parallel execution opportunity', frequency: 8 }
    ];

    return {
      bottlenecks,
      recommendations,
      patterns
    };
  }

  /**
   * Generate chart data
   */
  private generateChartData(metrics: ProductivityMetrics): ChartData {
    const last10 = this.historicalData.slice(-10);

    // Productivity trend
    const productivityTrend: TimeSeriesData = {
      labels: last10.map((_, i) => `T-${10 - i}`),
      datasets: [{
        label: 'Productivity Score',
        data: last10.map(m => m.productivityScore),
        color: '#4CAF50'
      }]
    };

    // Agent usage trend
    const agentUsageTrend: TimeSeriesData = {
      labels: last10.map((_, i) => `T-${10 - i}`),
      datasets: [{
        label: 'Total Invocations',
        data: last10.map(m => m.agentUsage.reduce((sum, a) => sum + a.invocations, 0)),
        color: '#2196F3'
      }]
    };

    // Task success trend
    const taskSuccessTrend: TimeSeriesData = {
      labels: last10.map((_, i) => `T-${10 - i}`),
      datasets: [{
        label: 'Success Rate',
        data: last10.map(m => {
          const successful = m.taskMetrics.filter(t => t.success).length;
          return m.taskMetrics.length > 0 ? Math.round((successful / m.taskMetrics.length) * 100) : 0;
        }),
        color: '#FF9800'
      }]
    };

    // Velocity chart
    const velocityChart: TimeSeriesData = {
      labels: last10.map((_, i) => `T-${10 - i}`),
      datasets: [{
        label: 'Tasks Completed',
        data: last10.map(m => m.taskMetrics.length),
        color: '#9C27B0'
      }]
    };

    return {
      productivityTrend,
      agentUsageTrend,
      taskSuccessTrend,
      velocityChart
    };
  }

  /**
   * Get dashboard HTML
   */
  public generateDashboardHTML(data: DashboardData): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Productivity Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h2 { font-size: 18px; margin-bottom: 15px; color: #666; }
        .metric { font-size: 36px; font-weight: bold; color: #333; }
        .label { font-size: 14px; color: #999; margin-top: 5px; }
        .trend { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px; }
        .trend.up { background: #e8f5e9; color: #4caf50; }
        .trend.stable { background: #fff3e0; color: #ff9800; }
        .trend.down { background: #ffebee; color: #f44336; }
        .list { list-style: none; }
        .list li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .list li:last-child { border-bottom: none; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 3px; font-size: 11px; }
        .badge.success { background: #4caf50; color: white; }
        .badge.failure { background: #f44336; color: white; }
        .badge.high { background: #ff5722; color: white; }
        .badge.medium { background: #ff9800; color: white; }
        .badge.low { background: #ffc107; color: black; }
        .progress { height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-bar { height: 100%; background: #4caf50; transition: width 0.3s; }
        .chart-placeholder { height: 200px; background: #fafafa; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Developer Productivity Dashboard</h1>
        
        <div class="grid">
            <!-- Productivity Score -->
            <div class="card">
                <h2>Productivity Score</h2>
                <div class="metric">${data.overview.productivityScore}<span style="font-size: 24px; color: #999;">/100</span></div>
                <div class="label">
                    Change: ${data.overview.scoreChange >= 0 ? '+' : ''}${data.overview.scoreChange}
                    <span class="trend ${data.overview.velocityTrend}">${data.overview.velocityTrend}</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${data.overview.productivityScore}%"></div>
                </div>
            </div>

            <!-- Task Success Rate -->
            <div class="card">
                <h2>Task Success Rate</h2>
                <div class="metric">${data.overview.successRate}%</div>
                <div class="label">${data.overview.totalTasks} total tasks</div>
            </div>

            <!-- Active Agents -->
            <div class="card">
                <h2>Active Agents</h2>
                <div class="metric">${data.overview.activeAgents}</div>
                <div class="label">Agents in use</div>
            </div>

            <!-- Top Agents -->
            <div class="card">
                <h2>Top Agents</h2>
                <ul class="list">
                    ${data.agents.topAgents.map(agent => `
                        <li>
                            <strong>${agent.name}</strong>
                            <span style="float: right;">
                                ${agent.invocations} calls
                                <span class="badge ${agent.successRate > 80 ? 'success' : 'failure'}">${agent.successRate}%</span>
                            </span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Recent Tasks -->
            <div class="card">
                <h2>Recent Tasks</h2>
                <ul class="list">
                    ${data.tasks.recentTasks.slice(0, 5).map(task => `
                        <li>
                            <strong>${task.type}</strong>
                            <span class="badge ${task.status}">${task.status}</span>
                            <br>
                            <span style="font-size: 12px; color: #999;">
                                ${task.agents.join(' → ')} (${task.duration})
                            </span>
                        </li>
                    `).join('')}
                </ul>
            </div>

            <!-- Bottlenecks -->
            <div class="card">
                <h2>Bottlenecks</h2>
                <ul class="list">
                    ${data.insights.bottlenecks.map(bottleneck => `
                        <li>
                            <strong>${bottleneck.stage}</strong>
                            <span class="badge ${bottleneck.impact}">${bottleneck.impact}</span>
                            <br>
                            <span style="font-size: 12px; color: #666;">${bottleneck.description}</span>
                        </li>
                    `).join('')}
                    ${data.insights.bottlenecks.length === 0 ? '<li style="color: #999;">No bottlenecks detected</li>' : ''}
                </ul>
            </div>

            <!-- Recommendations -->
            <div class="card" style="grid-column: span 2;">
                <h2>Top Recommendations</h2>
                <ul class="list">
                    ${data.insights.recommendations.map(rec => `
                        <li>
                            <strong>${rec.title}</strong>
                            <span style="float: right;">
                                Impact: <strong>${rec.impact}</strong>
                            </span>
                            <br>
                            <span style="font-size: 12px; color: #666;">${rec.action}</span>
                        </li>
                    `).join('')}
                    ${data.insights.recommendations.length === 0 ? '<li style="color: #999;">No recommendations available</li>' : ''}
                </ul>
            </div>

            <!-- Charts -->
            <div class="card">
                <h2>Productivity Trend</h2>
                <div class="chart-placeholder">Chart: Productivity over time</div>
            </div>

            <div class="card">
                <h2>Agent Usage</h2>
                <div class="chart-placeholder">Chart: Agent invocations</div>
            </div>

            <div class="card">
                <h2>Task Velocity</h2>
                <div class="chart-placeholder">Chart: Tasks completed</div>
            </div>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            Last updated: ${data.overview.lastUpdated.toLocaleString()}
        </div>
    </div>
</body>
</html>`;
  }

  // Helper methods
  private updateHistory(metrics: ProductivityMetrics): void {
    this.historicalData.push(metrics);
    if (this.historicalData.length > this.maxHistorySize) {
      this.historicalData = this.historicalData.slice(-this.maxHistorySize);
    }
  }

  private calculateAgentTrend(agentName: string): 'improving' | 'stable' | 'declining' {
    if (this.historicalData.length < 3) return 'stable';

    const recent = this.historicalData.slice(-3);
    const agentData = recent.map(m => {
      const agent = m.agentUsage.find(a => a.agent === agentName);
      return agent ? agent.successRate : 0;
    });

    const trend = agentData[2] - agentData[0];
    if (trend > 0.1) return 'improving';
    if (trend < -0.1) return 'declining';
    return 'stable';
  }

  private generateSparkline(agentName: string): number[] {
    return this.historicalData.slice(-10).map(m => {
      const agent = m.agentUsage.find(a => a.agent === agentName);
      return agent ? Math.round(agent.successRate * 100) : 0;
    });
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private getComplexityBucket(complexity: number): string {
    if (complexity <= 2) return 'Simple';
    if (complexity <= 5) return 'Medium';
    if (complexity <= 8) return 'Complex';
    return 'Very Complex';
  }

  private bucketizeTimes(times: number[]): number[] {
    const buckets = [0, 0, 0, 0, 0]; // <10s, 10-30s, 30-60s, 1-2m, >2m
    times.forEach(time => {
      if (time < 10) buckets[0]++;
      else if (time < 30) buckets[1]++;
      else if (time < 60) buckets[2]++;
      else if (time < 120) buckets[3]++;
      else buckets[4]++;
    });
    return buckets;
  }
}

export default DashboardAPI;