/**
 * Dependency Graph Builder for Task Orchestration
 * Creates and manages DAG for task dependencies
 */

import { SubTask } from './orchestrator';

export interface GraphNode {
  id: string;
  task: SubTask;
  level: number;
  inDegree: number;
  outDegree: number;
  dependencies: string[];
  dependents: string[];
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, Set<string>>;
  levels: Map<number, Set<string>>;
  isAcyclic: boolean;
}

export class DependencyGraph {
  /**
   * Build dependency graph from subtasks
   */
  public build(subTasks: SubTask[]): Graph {
    const graph: Graph = {
      nodes: new Map(),
      edges: new Map(),
      levels: new Map(),
      isAcyclic: true
    };

    // Create nodes
    subTasks.forEach(task => {
      graph.nodes.set(task.id, {
        id: task.id,
        task,
        level: 0,
        inDegree: 0,
        outDegree: 0,
        dependencies: task.dependencies,
        dependents: []
      });
      graph.edges.set(task.id, new Set());
    });

    // Build edges and calculate degrees
    subTasks.forEach(task => {
      task.dependencies.forEach(depId => {
        if (graph.nodes.has(depId)) {
          graph.edges.get(depId)!.add(task.id);
          graph.nodes.get(depId)!.dependents.push(task.id);
          graph.nodes.get(depId)!.outDegree++;
          graph.nodes.get(task.id)!.inDegree++;
        }
      });
    });

    // Check for cycles
    graph.isAcyclic = this.isDAG(graph);

    // Calculate levels
    this.calculateLevels(graph);

    return graph;
  }

  /**
   * Check if graph is a DAG (no cycles)
   */
  private isDAG(graph: Graph): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = graph.edges.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycle(nodeId)) return false;
      }
    }

    return true;
  }

  /**
   * Calculate levels for parallel execution
   */
  private calculateLevels(graph: Graph): void {
    const visited = new Set<string>();
    const queue: string[] = [];

    // Find all nodes with no dependencies (level 0)
    graph.nodes.forEach(node => {
      if (node.inDegree === 0) {
        node.level = 0;
        queue.push(node.id);
        if (!graph.levels.has(0)) {
          graph.levels.set(0, new Set());
        }
        graph.levels.get(0)!.add(node.id);
      }
    });

    // BFS to assign levels
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const node = graph.nodes.get(nodeId)!;
      const dependents = graph.edges.get(nodeId) || new Set();

      dependents.forEach(depId => {
        const depNode = graph.nodes.get(depId)!;
        depNode.level = Math.max(depNode.level, node.level + 1);
        
        if (!graph.levels.has(depNode.level)) {
          graph.levels.set(depNode.level, new Set());
        }
        graph.levels.get(depNode.level)!.add(depId);

        // Check if all dependencies are visited
        const allDepsVisited = depNode.dependencies.every(d => visited.has(d));
        if (allDepsVisited && !queue.includes(depId)) {
          queue.push(depId);
        }
      });
    }
  }

  /**
   * Topological sort of the graph
   */
  public topologicalSort(graph: Graph): string[] {
    if (!graph.isAcyclic) {
      throw new Error('Cannot perform topological sort on cyclic graph');
    }

    const sorted: string[] = [];
    const visited = new Set<string>();
    
    const visit = (nodeId: string): void => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = graph.nodes.get(nodeId)!;
      node.dependencies.forEach(depId => {
        if (graph.nodes.has(depId)) {
          visit(depId);
        }
      });

      sorted.push(nodeId);
    };

    graph.nodes.forEach((_, nodeId) => {
      visit(nodeId);
    });

    return sorted;
  }

  /**
   * Get execution waves (tasks that can run in parallel)
   */
  public getExecutionWaves(graph: Graph): string[][] {
    const waves: string[][] = [];

    // Sort levels
    const sortedLevels = Array.from(graph.levels.keys()).sort((a, b) => a - b);

    sortedLevels.forEach(level => {
      const tasksAtLevel = Array.from(graph.levels.get(level) || []);
      if (tasksAtLevel.length > 0) {
        waves.push(tasksAtLevel);
      }
    });

    return waves;
  }

  /**
   * Find critical path (longest path in DAG)
   */
  public findCriticalPath(graph: Graph): string[] {
    if (!graph.isAcyclic) {
      throw new Error('Cannot find critical path in cyclic graph');
    }

    const distances = new Map<string, number>();
    const parents = new Map<string, string | null>();

    // Initialize distances
    graph.nodes.forEach((_, nodeId) => {
      distances.set(nodeId, 0);
      parents.set(nodeId, null);
    });

    // Topological order
    const sorted = this.topologicalSort(graph);

    // Calculate longest paths
    sorted.forEach(nodeId => {
      const node = graph.nodes.get(nodeId)!;
      const dependents = graph.edges.get(nodeId) || new Set();

      dependents.forEach(depId => {
        const currentDist = distances.get(nodeId)! + 1;
        if (currentDist > distances.get(depId)!) {
          distances.set(depId, currentDist);
          parents.set(depId, nodeId);
        }
      });
    });

    // Find node with maximum distance
    let maxDist = 0;
    let endNode = '';
    distances.forEach((dist, nodeId) => {
      if (dist > maxDist) {
        maxDist = dist;
        endNode = nodeId;
      }
    });

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = endNode;
    while (current !== null) {
      path.unshift(current);
      current = parents.get(current) || null;
    }

    return path;
  }

  /**
   * Get level of a node
   */
  public getLevel(graph: Graph, nodeId: string): number {
    return graph.nodes.get(nodeId)?.level || 0;
  }

  /**
   * Optimize graph for parallel execution
   */
  public optimize(graph: Graph): Graph {
    // Remove redundant edges (transitive reduction)
    const optimized = this.transitiveReduction(graph);

    // Rebalance levels for better parallelization
    this.rebalanceLevels(optimized);

    return optimized;
  }

  /**
   * Transitive reduction - remove redundant edges
   */
  private transitiveReduction(graph: Graph): Graph {
    const reduced = {
      ...graph,
      edges: new Map(graph.edges)
    };

    graph.nodes.forEach((node, nodeId) => {
      const directDependents = new Set(graph.edges.get(nodeId) || []);
      const allReachable = this.getAllReachable(graph, nodeId);

      directDependents.forEach(depId => {
        // Check if depId is reachable through other paths
        const otherPaths = this.isReachableWithout(graph, nodeId, depId, depId);
        if (otherPaths) {
          // Remove redundant edge
          reduced.edges.get(nodeId)?.delete(depId);
          const depNode = reduced.nodes.get(depId);
          if (depNode) {
            depNode.dependencies = depNode.dependencies.filter(d => d !== nodeId);
            depNode.inDegree--;
          }
          const srcNode = reduced.nodes.get(nodeId);
          if (srcNode) {
            srcNode.dependents = srcNode.dependents.filter(d => d !== depId);
            srcNode.outDegree--;
          }
        }
      });
    });

    return reduced;
  }

  /**
   * Get all reachable nodes from a given node
   */
  private getAllReachable(graph: Graph, startId: string): Set<string> {
    const reachable = new Set<string>();
    const queue = [startId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const dependents = graph.edges.get(nodeId) || new Set();
      
      dependents.forEach(depId => {
        if (!reachable.has(depId)) {
          reachable.add(depId);
          queue.push(depId);
        }
      });
    }

    return reachable;
  }

  /**
   * Check if target is reachable from source without using a specific edge
   */
  private isReachableWithout(
    graph: Graph,
    source: string,
    target: string,
    exclude: string
  ): boolean {
    const visited = new Set<string>();
    const queue = [source];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const dependents = graph.edges.get(nodeId) || new Set();
      for (const depId of dependents) {
        if (depId === exclude && nodeId === source) continue;
        if (depId === target) return true;
        queue.push(depId);
      }
    }

    return false;
  }

  /**
   * Rebalance levels for better parallelization
   */
  private rebalanceLevels(graph: Graph): void {
    // Recalculate levels after optimization
    graph.levels.clear();
    this.calculateLevels(graph);

    // Try to move tasks to earlier levels if dependencies allow
    graph.nodes.forEach(node => {
      if (node.dependencies.length > 0) {
        const maxDepLevel = Math.max(
          ...node.dependencies.map(depId => {
            const depNode = graph.nodes.get(depId);
            return depNode ? depNode.level : 0;
          })
        );
        
        const newLevel = maxDepLevel + 1;
        if (newLevel < node.level) {
          // Move to earlier level
          graph.levels.get(node.level)?.delete(node.id);
          node.level = newLevel;
          if (!graph.levels.has(newLevel)) {
            graph.levels.set(newLevel, new Set());
          }
          graph.levels.get(newLevel)!.add(node.id);
        }
      }
    });
  }

  /**
   * Get graph statistics
   */
  public getStatistics(graph: Graph): GraphStatistics {
    const criticalPath = this.findCriticalPath(graph);
    const waves = this.getExecutionWaves(graph);

    return {
      nodeCount: graph.nodes.size,
      edgeCount: Array.from(graph.edges.values()).reduce((sum, set) => sum + set.size, 0),
      levels: graph.levels.size,
      criticalPathLength: criticalPath.length,
      maxParallelism: Math.max(...waves.map(w => w.length)),
      isAcyclic: graph.isAcyclic
    };
  }
}

interface GraphStatistics {
  nodeCount: number;
  edgeCount: number;
  levels: number;
  criticalPathLength: number;
  maxParallelism: number;
  isAcyclic: boolean;
}

export default DependencyGraph;