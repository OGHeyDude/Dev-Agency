/**
 * Developer Productivity Analytics System
 * Export point for all analytics modules
 */

export { ProductivityTracker } from './productivity-tracker';
export type { 
  ProductivityMetrics, 
  AgentUsageMetric, 
  TaskMetric, 
  Bottleneck, 
  Recommendation 
} from './productivity-tracker';

export { DataCollector } from './data-collector';
export type { CollectedData } from './data-collector';

export { PatternAnalyzer } from './pattern-analyzer';
export type { Pattern, WorkflowPattern } from './pattern-analyzer';

export { InsightsGenerator } from './insights-generator';
export type { Insight } from './insights-generator';

export { DashboardAPI } from './dashboard-api';
export type { 
  DashboardData,
  OverviewData,
  AgentData,
  TaskData,
  InsightData,
  ChartData
} from './dashboard-api';

// Create singleton instance for global use
import { ProductivityTracker } from './productivity-tracker';
export const tracker = new ProductivityTracker();

// Export convenience functions
export function trackAgent(agent: string, context: any, result: any, executionTime: number): void {
  tracker.trackAgentInvocation(agent, context, result, executionTime);
}

export function trackTask(taskId: string, type: string, agentsUsed: string[], completionTime: number, success: boolean): void {
  tracker.trackTaskCompletion(taskId, type, agentsUsed, completionTime, success);
}

export function getMetrics(): ProductivityMetrics {
  return tracker.getMetrics();
}

export function getDashboard(): any {
  return tracker.getDashboardData();
}

export function exportReport(format: 'markdown' | 'json' = 'markdown'): string {
  return tracker.exportReport(format);
}