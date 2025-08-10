/**
 * Agent Collaboration Orchestrator
 * Intelligent multi-agent coordination for complex task workflows
 */

import { EventEmitter } from 'events';
import { TaskAnalyzer } from './task-analyzer';
import { DependencyGraph } from './dependency-graph';
import { AgentSelector } from './agent-selector';
import { ContextOptimizer } from './context-optimizer';
import { ExecutionEngine } from './execution-engine';

export interface OrchestrationConfig {
  maxParallelAgents: number;
  contextSizeLimit: number;
  retryAttempts: number;
  timeoutPerAgent: number;
  optimizationLevel: 'speed' | 'quality' | 'balanced';
}

export interface Task {
  id: string;
  type: string;
  description: string;
  requirements: string[];
  context: any;
  priority: number;
  dependencies: string[];
  estimatedComplexity: number;
}

export interface SubTask {
  id: string;
  parentTaskId: string;
  agent: string;
  description: string;
  context: any;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  retryCount: number;
}

export interface OrchestrationResult {
  taskId: string;
  success: boolean;
  subTasks: SubTask[];
  totalDuration: number;
  parallelizationRatio: number;
  contextSavings: number;
  errors: string[];
  recommendations: string[];
}

export interface AgentExecution {
  agentName: string;
  context: any;
  timeout: number;
  retryOnFailure: boolean;
}

export class Orchestrator extends EventEmitter {
  private config: OrchestrationConfig;
  private taskAnalyzer: TaskAnalyzer;
  private dependencyGraph: DependencyGraph;
  private agentSelector: AgentSelector;
  private contextOptimizer: ContextOptimizer;
  private executionEngine: ExecutionEngine;
  private activeOrchestrations: Map<string, OrchestrationState> = new Map();

  constructor(config?: Partial<OrchestrationConfig>) {
    super();
    
    this.config = {
      maxParallelAgents: 4,
      contextSizeLimit: 50000,
      retryAttempts: 2,
      timeoutPerAgent: 60000,
      optimizationLevel: 'balanced',
      ...config
    };

    this.taskAnalyzer = new TaskAnalyzer();
    this.dependencyGraph = new DependencyGraph();
    this.agentSelector = new AgentSelector();
    this.contextOptimizer = new ContextOptimizer(this.config.contextSizeLimit);
    this.executionEngine = new ExecutionEngine(this.config);

    this.setupEventHandlers();
  }

  /**
   * Orchestrate a complex task with multiple agents
   */
  public async orchestrate(task: Task): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const orchestrationId = `orch-${task.id}-${Date.now()}`;
    
    this.emit('orchestration:start', { orchestrationId, task });

    try {
      // Step 1: Analyze and decompose task
      const subTasks = await this.taskAnalyzer.decompose(task);
      this.emit('task:decomposed', { orchestrationId, subTasks: subTasks.length });

      // Step 2: Build dependency graph
      const graph = this.dependencyGraph.build(subTasks);
      this.emit('graph:built', { orchestrationId, nodes: graph.nodes, edges: graph.edges });

      // Step 3: Select optimal agents for each subtask
      const agentAssignments = await this.agentSelector.assign(subTasks, this.config.optimizationLevel);
      this.emit('agents:assigned', { orchestrationId, assignments: agentAssignments });

      // Step 4: Optimize context for each agent
      const optimizedSubTasks = await this.optimizeContexts(subTasks, agentAssignments);
      const contextSavings = this.calculateContextSavings(subTasks, optimizedSubTasks);
      this.emit('context:optimized', { orchestrationId, savings: contextSavings });

      // Step 5: Execute with parallel/sequential coordination
      const executionPlan = this.createExecutionPlan(optimizedSubTasks, graph);
      const executionResult = await this.executionEngine.execute(executionPlan);
      
      // Step 6: Aggregate results
      const result = this.aggregateResults(
        task.id,
        executionResult,
        startTime,
        contextSavings
      );

      this.emit('orchestration:complete', { orchestrationId, result });
      return result;

    } catch (error) {
      this.emit('orchestration:error', { orchestrationId, error });
      throw error;
    } finally {
      this.activeOrchestrations.delete(orchestrationId);
    }
  }

  /**
   * Create execution plan based on dependencies
   */
  private createExecutionPlan(subTasks: SubTask[], graph: any): ExecutionPlan {
    const plan: ExecutionPlan = {
      sequential: [],
      parallel: []
    };

    // Topological sort for dependency ordering
    const sorted = graph.topologicalSort();
    
    // Group tasks by dependency level
    const levels = new Map<number, SubTask[]>();
    sorted.forEach((nodeId: string) => {
      const task = subTasks.find(t => t.id === nodeId);
      if (task) {
        const level = graph.getLevel(nodeId);
        if (!levels.has(level)) {
          levels.set(level, []);
        }
        levels.get(level)!.push(task);
      }
    });

    // Create execution waves
    levels.forEach((tasksAtLevel, level) => {
      if (tasksAtLevel.length === 1) {
        plan.sequential.push(tasksAtLevel[0]);
      } else {
        plan.parallel.push(tasksAtLevel);
      }
    });

    return plan;
  }

  /**
   * Optimize contexts for agent invocations
   */
  private async optimizeContexts(subTasks: SubTask[], agentAssignments: Map<string, string>): Promise<SubTask[]> {
    const optimized: SubTask[] = [];

    for (const task of subTasks) {
      const agent = agentAssignments.get(task.id) || task.agent;
      const optimizedContext = await this.contextOptimizer.optimize(
        task.context,
        agent,
        task.description
      );

      optimized.push({
        ...task,
        agent,
        context: optimizedContext
      });
    }

    return optimized;
  }

  /**
   * Calculate context size savings
   */
  private calculateContextSavings(original: SubTask[], optimized: SubTask[]): number {
    const originalSize = original.reduce((sum, t) => 
      sum + JSON.stringify(t.context).length, 0
    );
    const optimizedSize = optimized.reduce((sum, t) => 
      sum + JSON.stringify(t.context).length, 0
    );

    return originalSize > 0 ? 
      Math.round((1 - optimizedSize / originalSize) * 100) : 0;
  }

  /**
   * Aggregate execution results
   */
  private aggregateResults(
    taskId: string,
    executionResult: any,
    startTime: number,
    contextSavings: number
  ): OrchestrationResult {
    const totalDuration = Date.now() - startTime;
    const successfulTasks = executionResult.subTasks.filter((t: SubTask) => t.status === 'completed');
    const failedTasks = executionResult.subTasks.filter((t: SubTask) => t.status === 'failed');

    // Calculate parallelization effectiveness
    const sequentialTime = executionResult.subTasks.reduce((sum: number, t: SubTask) => {
      if (t.startTime && t.endTime) {
        return sum + (t.endTime.getTime() - t.startTime.getTime());
      }
      return sum;
    }, 0);

    const parallelizationRatio = sequentialTime > 0 ? 
      Math.round((sequentialTime / totalDuration - 1) * 100) : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    if (failedTasks.length > 0) {
      recommendations.push(`${failedTasks.length} subtasks failed - review agent selection`);
    }
    if (parallelizationRatio < 20 && executionResult.subTasks.length > 3) {
      recommendations.push('Low parallelization - check for unnecessary dependencies');
    }
    if (contextSavings < 20) {
      recommendations.push('Low context optimization - consider more aggressive pruning');
    }

    return {
      taskId,
      success: failedTasks.length === 0,
      subTasks: executionResult.subTasks,
      totalDuration,
      parallelizationRatio,
      contextSavings,
      errors: failedTasks.map((t: SubTask) => t.error || 'Unknown error'),
      recommendations
    };
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.executionEngine.on('subtask:start', (data) => {
      this.emit('subtask:start', data);
    });

    this.executionEngine.on('subtask:complete', (data) => {
      this.emit('subtask:complete', data);
    });

    this.executionEngine.on('subtask:failed', (data) => {
      this.emit('subtask:failed', data);
    });

    this.executionEngine.on('parallel:start', (data) => {
      this.emit('parallel:start', data);
    });

    this.executionEngine.on('parallel:complete', (data) => {
      this.emit('parallel:complete', data);
    });
  }

  /**
   * Get active orchestrations
   */
  public getActiveOrchestrations(): string[] {
    return Array.from(this.activeOrchestrations.keys());
  }

  /**
   * Cancel an orchestration
   */
  public cancelOrchestration(orchestrationId: string): boolean {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (state) {
      state.cancelled = true;
      this.executionEngine.cancelExecution(orchestrationId);
      this.activeOrchestrations.delete(orchestrationId);
      this.emit('orchestration:cancelled', { orchestrationId });
      return true;
    }
    return false;
  }

  /**
   * Get orchestration metrics
   */
  public getMetrics(): OrchestrationMetrics {
    return {
      activeOrchestrations: this.activeOrchestrations.size,
      totalOrchestrations: this.executionEngine.getTotalExecutions(),
      averageParallelization: this.executionEngine.getAverageParallelization(),
      averageContextSavings: this.contextOptimizer.getAverageSavings(),
      agentUtilization: this.agentSelector.getUtilizationMetrics()
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<OrchestrationConfig>): void {
    this.config = { ...this.config, ...config };
    this.executionEngine.updateConfig(this.config);
    this.contextOptimizer.updateLimit(this.config.contextSizeLimit);
  }
}

interface OrchestrationState {
  id: string;
  task: Task;
  startTime: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  cancelled: boolean;
}

interface ExecutionPlan {
  sequential: SubTask[];
  parallel: SubTask[][];
}

interface OrchestrationMetrics {
  activeOrchestrations: number;
  totalOrchestrations: number;
  averageParallelization: number;
  averageContextSavings: number;
  agentUtilization: Map<string, number>;
}

export default Orchestrator;