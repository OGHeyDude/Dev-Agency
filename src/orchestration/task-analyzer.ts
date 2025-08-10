/**
 * Task Analyzer for Agent Orchestration
 * Decomposes complex tasks into agent-executable subtasks
 */

import { Task, SubTask } from './orchestrator';

export class TaskAnalyzer {
  private decompositionStrategies: Map<string, DecompositionStrategy> = new Map();
  private taskIdCounter = 0;

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Initialize decomposition strategies
   */
  private initializeStrategies(): void {
    // Feature development strategy
    this.decompositionStrategies.set('feature', {
      name: 'Feature Development',
      decompose: this.decomposeFeature.bind(this)
    });

    // Bug fix strategy
    this.decompositionStrategies.set('bug', {
      name: 'Bug Fix',
      decompose: this.decomposeBugFix.bind(this)
    });

    // Refactoring strategy
    this.decompositionStrategies.set('refactor', {
      name: 'Refactoring',
      decompose: this.decomposeRefactoring.bind(this)
    });

    // Testing strategy
    this.decompositionStrategies.set('test', {
      name: 'Testing',
      decompose: this.decomposeTesting.bind(this)
    });

    // Generic strategy
    this.decompositionStrategies.set('generic', {
      name: 'Generic',
      decompose: this.decomposeGeneric.bind(this)
    });
  }

  /**
   * Decompose a task into subtasks
   */
  public async decompose(task: Task): Promise<SubTask[]> {
    const strategy = this.decompositionStrategies.get(task.type) || 
                    this.decompositionStrategies.get('generic')!;
    
    const subTasks = await strategy.decompose(task);
    
    // Validate and enhance subtasks
    return this.enhanceSubTasks(subTasks, task);
  }

  /**
   * Decompose feature development task
   */
  private async decomposeFeature(task: Task): Promise<SubTask[]> {
    const subTasks: SubTask[] = [];

    // 1. Architecture design
    subTasks.push(this.createSubTask(
      task.id,
      'architect',
      'Design feature architecture',
      { requirements: task.requirements, context: task.context },
      []
    ));

    // 2. Implementation
    subTasks.push(this.createSubTask(
      task.id,
      'coder',
      'Implement feature',
      { design: 'from-architect', context: task.context },
      [subTasks[0].id]
    ));

    // 3. Testing
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Create and run tests',
      { implementation: 'from-coder', requirements: task.requirements },
      [subTasks[1].id]
    ));

    // 4. Documentation
    subTasks.push(this.createSubTask(
      task.id,
      'documenter',
      'Document feature',
      { implementation: 'from-coder', tests: 'from-tester' },
      [subTasks[1].id] // Can run parallel with testing
    ));

    // 5. Security review (if needed)
    if (task.requirements.some(r => r.includes('security') || r.includes('auth'))) {
      subTasks.push(this.createSubTask(
        task.id,
        'security',
        'Security review',
        { implementation: 'from-coder' },
        [subTasks[1].id]
      ));
    }

    return subTasks;
  }

  /**
   * Decompose bug fix task
   */
  private async decomposeBugFix(task: Task): Promise<SubTask[]> {
    const subTasks: SubTask[] = [];

    // 1. Bug analysis
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Analyze and reproduce bug',
      { bugReport: task.context, requirements: task.requirements },
      []
    ));

    // 2. Fix implementation
    subTasks.push(this.createSubTask(
      task.id,
      'coder',
      'Implement bug fix',
      { analysis: 'from-tester', context: task.context },
      [subTasks[0].id]
    ));

    // 3. Test fix
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Verify bug fix',
      { fix: 'from-coder', originalBug: task.context },
      [subTasks[1].id]
    ));

    // 4. Regression tests
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Run regression tests',
      { fix: 'from-coder' },
      [subTasks[1].id]
    ));

    return subTasks;
  }

  /**
   * Decompose refactoring task
   */
  private async decomposeRefactoring(task: Task): Promise<SubTask[]> {
    const subTasks: SubTask[] = [];

    // 1. Code analysis
    subTasks.push(this.createSubTask(
      task.id,
      'code-intelligence',
      'Analyze code for refactoring opportunities',
      { code: task.context, goals: task.requirements },
      []
    ));

    // 2. Refactoring plan
    subTasks.push(this.createSubTask(
      task.id,
      'architect',
      'Create refactoring plan',
      { analysis: 'from-code-intelligence', requirements: task.requirements },
      [subTasks[0].id]
    ));

    // 3. Implementation
    subTasks.push(this.createSubTask(
      task.id,
      'coder',
      'Implement refactoring',
      { plan: 'from-architect', code: task.context },
      [subTasks[1].id]
    ));

    // 4. Testing
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Test refactored code',
      { original: task.context, refactored: 'from-coder' },
      [subTasks[2].id]
    ));

    // 5. Performance validation
    subTasks.push(this.createSubTask(
      task.id,
      'performance',
      'Validate performance',
      { original: task.context, refactored: 'from-coder' },
      [subTasks[2].id]
    ));

    return subTasks;
  }

  /**
   * Decompose testing task
   */
  private async decomposeTesting(task: Task): Promise<SubTask[]> {
    const subTasks: SubTask[] = [];

    // 1. Test plan
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Create test plan',
      { requirements: task.requirements, context: task.context },
      []
    ));

    // 2. Unit tests
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Write unit tests',
      { plan: 'from-tester', code: task.context },
      [subTasks[0].id]
    ));

    // 3. Integration tests
    subTasks.push(this.createSubTask(
      task.id,
      'tester',
      'Write integration tests',
      { plan: 'from-tester', code: task.context },
      [subTasks[0].id]
    ));

    // 4. Performance tests
    if (task.requirements.some(r => r.includes('performance'))) {
      subTasks.push(this.createSubTask(
        task.id,
        'performance',
        'Create performance tests',
        { plan: 'from-tester', code: task.context },
        [subTasks[0].id]
      ));
    }

    // 5. Security tests
    if (task.requirements.some(r => r.includes('security'))) {
      subTasks.push(this.createSubTask(
        task.id,
        'security',
        'Create security tests',
        { plan: 'from-tester', code: task.context },
        [subTasks[0].id]
      ));
    }

    return subTasks;
  }

  /**
   * Generic decomposition for unknown task types
   */
  private async decomposeGeneric(task: Task): Promise<SubTask[]> {
    const subTasks: SubTask[] = [];

    // Analyze complexity
    const complexity = task.estimatedComplexity || 5;

    if (complexity <= 3) {
      // Simple task - single agent
      subTasks.push(this.createSubTask(
        task.id,
        'coder',
        task.description,
        task.context,
        []
      ));
    } else if (complexity <= 6) {
      // Medium complexity - design + implement
      subTasks.push(this.createSubTask(
        task.id,
        'architect',
        `Design solution for ${task.description}`,
        task.context,
        []
      ));

      subTasks.push(this.createSubTask(
        task.id,
        'coder',
        `Implement ${task.description}`,
        { design: 'from-architect', context: task.context },
        [subTasks[0].id]
      ));
    } else {
      // High complexity - full cycle
      subTasks.push(this.createSubTask(
        task.id,
        'architect',
        `Design architecture for ${task.description}`,
        task.context,
        []
      ));

      subTasks.push(this.createSubTask(
        task.id,
        'coder',
        `Implement ${task.description}`,
        { design: 'from-architect', context: task.context },
        [subTasks[0].id]
      ));

      subTasks.push(this.createSubTask(
        task.id,
        'tester',
        `Test ${task.description}`,
        { implementation: 'from-coder' },
        [subTasks[1].id]
      ));

      subTasks.push(this.createSubTask(
        task.id,
        'documenter',
        `Document ${task.description}`,
        { implementation: 'from-coder' },
        [subTasks[1].id]
      ));
    }

    return subTasks;
  }

  /**
   * Create a subtask
   */
  private createSubTask(
    parentTaskId: string,
    agent: string,
    description: string,
    context: any,
    dependencies: string[]
  ): SubTask {
    const id = `subtask-${parentTaskId}-${++this.taskIdCounter}`;
    
    return {
      id,
      parentTaskId,
      agent,
      description,
      context,
      dependencies,
      status: 'pending',
      retryCount: 0
    };
  }

  /**
   * Enhance subtasks with additional metadata
   */
  private enhanceSubTasks(subTasks: SubTask[], parentTask: Task): SubTask[] {
    return subTasks.map(subTask => {
      // Add parent context reference
      subTask.context = {
        ...subTask.context,
        parentTask: {
          id: parentTask.id,
          type: parentTask.type,
          priority: parentTask.priority
        }
      };

      // Validate dependencies exist
      subTask.dependencies = subTask.dependencies.filter(depId =>
        subTasks.some(t => t.id === depId)
      );

      return subTask;
    });
  }

  /**
   * Analyze task complexity
   */
  public analyzeComplexity(task: Task): number {
    let complexity = 0;

    // Requirement complexity
    complexity += task.requirements.length * 2;

    // Context size complexity
    const contextSize = JSON.stringify(task.context).length;
    complexity += Math.floor(contextSize / 1000);

    // Type complexity
    const typeComplexity: Record<string, number> = {
      'feature': 5,
      'bug': 3,
      'refactor': 6,
      'test': 4,
      'generic': 3
    };
    complexity += typeComplexity[task.type] || 3;

    // Dependencies complexity
    complexity += task.dependencies.length * 2;

    return Math.min(complexity, 10);
  }

  /**
   * Get decomposition statistics
   */
  public getStatistics(): DecompositionStats {
    return {
      strategiesAvailable: this.decompositionStrategies.size,
      totalTasksAnalyzed: this.taskIdCounter,
      averageSubtasksPerTask: 4 // Would track this in production
    };
  }
}

interface DecompositionStrategy {
  name: string;
  decompose: (task: Task) => Promise<SubTask[]>;
}

interface DecompositionStats {
  strategiesAvailable: number;
  totalTasksAnalyzed: number;
  averageSubtasksPerTask: number;
}

export default TaskAnalyzer;