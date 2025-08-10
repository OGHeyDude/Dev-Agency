/**
 * Pattern Analyzer for Productivity Analytics
 * Identifies patterns and trends in development workflows
 */

import { EventEmitter } from 'events';
import { TaskMetric, AgentUsageMetric, ProductivityMetrics } from './productivity-tracker';

export interface Pattern {
  id: string;
  type: 'success' | 'failure' | 'bottleneck' | 'optimization';
  description: string;
  frequency: number;
  impact: 'low' | 'medium' | 'high';
  data: any;
}

export interface WorkflowPattern {
  agents: string[];
  successRate: number;
  avgTime: number;
  occurrences: number;
}

export class PatternAnalyzer extends EventEmitter {
  private patterns: Pattern[] = [];
  private taskHistory: TaskMetric[] = [];
  private workflowPatterns: Map<string, WorkflowPattern> = new Map();
  private anomalyThreshold: number = 2; // Standard deviations

  constructor() {
    super();
  }

  /**
   * Analyze metrics for patterns
   */
  public analyze(metrics: ProductivityMetrics): Pattern[] {
    this.patterns = [];

    this.analyzeAgentPatterns(metrics.agentUsage);
    this.analyzeTaskPatterns(metrics.taskMetrics);
    this.analyzeWorkflowPatterns(metrics.taskMetrics);
    this.detectAnomalies(metrics);

    return this.patterns;
  }

  /**
   * Add task to history for pattern analysis
   */
  public addTask(task: TaskMetric): void {
    this.taskHistory.push(task);
    this.updateWorkflowPattern(task);

    // Keep only recent history
    if (this.taskHistory.length > 1000) {
      this.taskHistory = this.taskHistory.slice(-1000);
    }
  }

  /**
   * Process collected data
   */
  public processData(data: any): void {
    // Process real-time data for pattern detection
    if (data.type === 'task_completion') {
      this.addTask(data.data);
    }
  }

  /**
   * Analyze agent usage patterns
   */
  private analyzeAgentPatterns(agents: AgentUsageMetric[]): void {
    // Find underutilized agents
    agents.forEach(agent => {
      if (agent.invocations < 5 && agents.length > 5) {
        this.addPattern({
          id: `underutilized-${agent.agent}`,
          type: 'optimization',
          description: `Agent ${agent.agent} is underutilized`,
          frequency: agent.invocations,
          impact: 'low',
          data: { agent: agent.agent, invocations: agent.invocations }
        });
      }

      // Find inefficient agents
      if (agent.successRate < 0.6 && agent.invocations > 10) {
        this.addPattern({
          id: `inefficient-${agent.agent}`,
          type: 'failure',
          description: `Agent ${agent.agent} has low success rate`,
          frequency: agent.invocations,
          impact: 'high',
          data: { agent: agent.agent, successRate: agent.successRate }
        });
      }

      // Find slow agents
      if (agent.avgExecutionTime > 60000) { // > 1 minute
        this.addPattern({
          id: `slow-${agent.agent}`,
          type: 'bottleneck',
          description: `Agent ${agent.agent} is slow`,
          frequency: agent.invocations,
          impact: 'medium',
          data: { agent: agent.agent, avgTime: agent.avgExecutionTime }
        });
      }
    });

    // Find optimal agent combinations
    const frequentPairs = this.findFrequentAgentPairs();
    frequentPairs.forEach(pair => {
      if (pair.successRate > 0.9) {
        this.addPattern({
          id: `optimal-pair-${pair.agents.join('-')}`,
          type: 'success',
          description: `Agents ${pair.agents.join(' + ')} work well together`,
          frequency: pair.occurrences,
          impact: 'medium',
          data: pair
        });
      }
    });
  }

  /**
   * Analyze task completion patterns
   */
  private analyzeTaskPatterns(tasks: TaskMetric[]): void {
    if (tasks.length < 10) return;

    // Group tasks by type
    const tasksByType = new Map<string, TaskMetric[]>();
    tasks.forEach(task => {
      if (!tasksByType.has(task.type)) {
        tasksByType.set(task.type, []);
      }
      tasksByType.get(task.type)!.push(task);
    });

    // Analyze each task type
    tasksByType.forEach((typeTasks, type) => {
      const successRate = typeTasks.filter(t => t.success).length / typeTasks.length;
      const avgTime = typeTasks.reduce((sum, t) => sum + t.completionTime, 0) / typeTasks.length;

      if (successRate < 0.7) {
        this.addPattern({
          id: `failing-task-${type}`,
          type: 'failure',
          description: `Task type ${type} has high failure rate`,
          frequency: typeTasks.length,
          impact: 'high',
          data: { type, successRate, count: typeTasks.length }
        });
      }

      // Check for time regression
      const recentTasks = typeTasks.slice(-5);
      const olderTasks = typeTasks.slice(0, 5);
      if (recentTasks.length === 5 && olderTasks.length === 5) {
        const recentAvg = recentTasks.reduce((sum, t) => sum + t.completionTime, 0) / 5;
        const olderAvg = olderTasks.reduce((sum, t) => sum + t.completionTime, 0) / 5;

        if (recentAvg > olderAvg * 1.5) {
          this.addPattern({
            id: `regression-${type}`,
            type: 'bottleneck',
            description: `Task type ${type} showing performance regression`,
            frequency: typeTasks.length,
            impact: 'high',
            data: { type, recentAvg, olderAvg, increase: ((recentAvg / olderAvg - 1) * 100).toFixed(1) }
          });
        }
      }
    });
  }

  /**
   * Analyze workflow patterns
   */
  private analyzeWorkflowPatterns(tasks: TaskMetric[]): void {
    // Find common successful workflows
    this.workflowPatterns.forEach((pattern, key) => {
      if (pattern.occurrences >= 5) {
        if (pattern.successRate > 0.9) {
          this.addPattern({
            id: `successful-workflow-${key}`,
            type: 'success',
            description: `Workflow ${pattern.agents.join(' → ')} is highly successful`,
            frequency: pattern.occurrences,
            impact: 'medium',
            data: pattern
          });
        } else if (pattern.successRate < 0.5) {
          this.addPattern({
            id: `failing-workflow-${key}`,
            type: 'failure',
            description: `Workflow ${pattern.agents.join(' → ')} often fails`,
            frequency: pattern.occurrences,
            impact: 'high',
            data: pattern
          });
        }
      }
    });
  }

  /**
   * Detect anomalies in metrics
   */
  private detectAnomalies(metrics: ProductivityMetrics): void {
    // Detect sudden changes in productivity score
    if (this.taskHistory.length > 20) {
      const recentTasks = this.taskHistory.slice(-10);
      const olderTasks = this.taskHistory.slice(-20, -10);

      const recentSuccess = recentTasks.filter(t => t.success).length / recentTasks.length;
      const olderSuccess = olderTasks.filter(t => t.success).length / olderTasks.length;

      if (Math.abs(recentSuccess - olderSuccess) > 0.3) {
        this.addPattern({
          id: 'anomaly-success-rate',
          type: recentSuccess < olderSuccess ? 'failure' : 'success',
          description: `Sudden ${recentSuccess < olderSuccess ? 'drop' : 'improvement'} in success rate`,
          frequency: 1,
          impact: 'high',
          data: { recent: recentSuccess, older: olderSuccess }
        });
      }
    }

    // Detect unusual agent usage
    metrics.agentUsage.forEach(agent => {
      const avgInvocations = metrics.agentUsage.reduce((sum, a) => sum + a.invocations, 0) / metrics.agentUsage.length;
      const stdDev = Math.sqrt(
        metrics.agentUsage.reduce((sum, a) => sum + Math.pow(a.invocations - avgInvocations, 2), 0) / metrics.agentUsage.length
      );

      if (Math.abs(agent.invocations - avgInvocations) > stdDev * this.anomalyThreshold) {
        this.addPattern({
          id: `anomaly-agent-${agent.agent}`,
          type: 'optimization',
          description: `Unusual usage pattern for ${agent.agent}`,
          frequency: agent.invocations,
          impact: 'medium',
          data: { agent: agent.agent, invocations: agent.invocations, average: avgInvocations }
        });
      }
    });
  }

  /**
   * Find frequent agent pairs
   */
  private findFrequentAgentPairs(): WorkflowPattern[] {
    const pairs: WorkflowPattern[] = [];
    const pairMap = new Map<string, { success: number; total: number; time: number }>();

    this.taskHistory.forEach(task => {
      if (task.agentsUsed.length >= 2) {
        for (let i = 0; i < task.agentsUsed.length - 1; i++) {
          const pairKey = `${task.agentsUsed[i]}-${task.agentsUsed[i + 1]}`;
          
          if (!pairMap.has(pairKey)) {
            pairMap.set(pairKey, { success: 0, total: 0, time: 0 });
          }

          const pair = pairMap.get(pairKey)!;
          pair.total++;
          pair.time += task.completionTime;
          if (task.success) pair.success++;
        }
      }
    });

    pairMap.forEach((data, key) => {
      if (data.total >= 3) {
        pairs.push({
          agents: key.split('-'),
          successRate: data.success / data.total,
          avgTime: data.time / data.total,
          occurrences: data.total
        });
      }
    });

    return pairs;
  }

  /**
   * Update workflow pattern
   */
  private updateWorkflowPattern(task: TaskMetric): void {
    if (task.agentsUsed.length === 0) return;

    const workflowKey = task.agentsUsed.join('-');
    
    if (!this.workflowPatterns.has(workflowKey)) {
      this.workflowPatterns.set(workflowKey, {
        agents: task.agentsUsed,
        successRate: 0,
        avgTime: 0,
        occurrences: 0
      });
    }

    const pattern = this.workflowPatterns.get(workflowKey)!;
    const totalTime = pattern.avgTime * pattern.occurrences;
    const totalSuccess = pattern.successRate * pattern.occurrences;

    pattern.occurrences++;
    pattern.avgTime = (totalTime + task.completionTime) / pattern.occurrences;
    pattern.successRate = (totalSuccess + (task.success ? 1 : 0)) / pattern.occurrences;
  }

  /**
   * Add pattern and emit event
   */
  private addPattern(pattern: Pattern): void {
    // Check if pattern already exists
    const existing = this.patterns.find(p => p.id === pattern.id);
    if (existing) {
      existing.frequency = pattern.frequency;
      existing.data = pattern.data;
    } else {
      this.patterns.push(pattern);
      this.emit('pattern', pattern);
    }
  }

  /**
   * Get patterns by type
   */
  public getPatternsByType(type: Pattern['type']): Pattern[] {
    return this.patterns.filter(p => p.type === type);
  }

  /**
   * Get high impact patterns
   */
  public getHighImpactPatterns(): Pattern[] {
    return this.patterns.filter(p => p.impact === 'high');
  }

  /**
   * Clear patterns
   */
  public clearPatterns(): void {
    this.patterns = [];
    this.workflowPatterns.clear();
  }
}

export default PatternAnalyzer;