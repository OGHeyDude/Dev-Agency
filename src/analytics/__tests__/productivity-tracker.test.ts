/**
 * Tests for AGENT-033: Developer Productivity Analytics
 * Validates tracking, analysis, and insights generation
 */

import { ProductivityTracker } from '../productivity-tracker';
import { DataCollector } from '../data-collector';
import { PatternAnalyzer } from '../pattern-analyzer';
import { InsightsGenerator } from '../insights-generator';

describe('AGENT-033: Developer Productivity Analytics', () => {
  let tracker: ProductivityTracker;

  beforeEach(() => {
    tracker = new ProductivityTracker();
  });

  afterEach(() => {
    tracker.reset();
  });

  describe('Acceptance Criteria: Track agent invocations', () => {
    test('should track agent invocation with metadata', () => {
      const agent = 'coder';
      const context = { task: 'implement feature' };
      const result = { success: true, output: 'code' };
      const executionTime = 5000;

      tracker.trackAgentInvocation(agent, context, result, executionTime);
      const metrics = tracker.getMetrics();

      expect(metrics.agentUsage).toHaveLength(1);
      expect(metrics.agentUsage[0].agent).toBe(agent);
      expect(metrics.agentUsage[0].invocations).toBe(1);
      expect(metrics.agentUsage[0].successRate).toBe(1);
      expect(metrics.agentUsage[0].avgExecutionTime).toBe(executionTime);
    });

    test('should update metrics for multiple invocations', () => {
      const agent = 'tester';
      
      tracker.trackAgentInvocation(agent, {}, { success: true }, 3000);
      tracker.trackAgentInvocation(agent, {}, { success: false }, 5000);
      tracker.trackAgentInvocation(agent, {}, { success: true }, 4000);

      const metrics = tracker.getMetrics();
      const agentMetric = metrics.agentUsage.find(a => a.agent === agent);

      expect(agentMetric?.invocations).toBe(3);
      expect(agentMetric?.successRate).toBeCloseTo(0.67, 2);
      expect(agentMetric?.avgExecutionTime).toBe(4000);
    });
  });

  describe('Acceptance Criteria: Calculate productivity metrics', () => {
    test('should calculate productivity score', () => {
      // Add successful tasks
      tracker.trackTaskCompletion('task-1', 'feature', ['coder'], 10000, true);
      tracker.trackTaskCompletion('task-2', 'bug', ['tester', 'coder'], 15000, true);
      tracker.trackAgentInvocation('coder', {}, { success: true }, 5000);
      tracker.trackAgentInvocation('tester', {}, { success: true }, 3000);

      const score = tracker.calculateProductivityScore();
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(tracker.getMetrics().productivityScore).toBe(score);
    });

    test('should detect velocity trend', () => {
      // Add tasks over time to establish trend
      for (let i = 0; i < 15; i++) {
        const time = i < 10 ? 20000 : 15000; // Faster in recent tasks
        tracker.trackTaskCompletion(`task-${i}`, 'feature', ['coder'], time, true);
      }

      const trend = tracker.analyzeVelocityTrend();
      expect(['up', 'stable', 'down']).toContain(trend);
      expect(tracker.getMetrics().velocityTrend).toBe(trend);
    });
  });

  describe('Acceptance Criteria: Identify bottlenecks', () => {
    test('should identify agent performance bottlenecks', () => {
      // Create a slow agent
      tracker.trackAgentInvocation('slow-agent', {}, { success: true }, 35000);
      tracker.trackAgentInvocation('slow-agent', {}, { success: true }, 40000);
      
      // Create a failing agent
      for (let i = 0; i < 10; i++) {
        tracker.trackAgentInvocation('failing-agent', {}, { success: i < 3 }, 5000);
      }

      const bottlenecks = tracker.identifyBottlenecks();
      
      expect(bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.some(b => b.stage.includes('slow-agent'))).toBe(true);
      expect(bottlenecks.some(b => b.stage.includes('failing-agent'))).toBe(true);
    });

    test('should classify bottleneck impact levels', () => {
      // High failure rate
      for (let i = 0; i < 20; i++) {
        tracker.trackTaskCompletion(`task-${i}`, 'test', ['agent'], 5000, i < 5);
      }

      const bottlenecks = tracker.identifyBottlenecks();
      const highImpact = bottlenecks.filter(b => b.impact === 'high');
      
      expect(highImpact.length).toBeGreaterThan(0);
    });
  });

  describe('Acceptance Criteria: Generate recommendations', () => {
    test('should generate actionable recommendations', () => {
      // Create scenario needing optimization
      tracker.trackAgentInvocation('heavy-agent', { data: 'x'.repeat(20000) }, { success: true }, 10000);
      tracker.trackAgentInvocation('heavy-agent', { data: 'x'.repeat(20000) }, { success: true }, 10000);

      const recommendations = tracker.generateRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('suggestion');
      expect(recommendations[0]).toHaveProperty('expectedImprovement');
      expect(recommendations[0]).toHaveProperty('implementation');
    });

    test('should prioritize recommendations by impact', () => {
      // Create multiple issues
      tracker.trackAgentInvocation('slow', {}, { success: true }, 60000);
      tracker.trackAgentInvocation('failing', {}, { success: false }, 5000);
      
      const recommendations = tracker.generateRecommendations();
      
      if (recommendations.length > 1) {
        expect(recommendations[0].priority).toBeLessThanOrEqual(recommendations[1].priority);
      }
    });
  });

  describe('Acceptance Criteria: Export reports', () => {
    test('should export markdown report', () => {
      tracker.trackAgentInvocation('coder', {}, { success: true }, 5000);
      tracker.trackTaskCompletion('task-1', 'feature', ['coder'], 10000, true);
      
      const report = tracker.exportReport('markdown');
      
      expect(report).toContain('# Developer Productivity Report');
      expect(report).toContain('Productivity Score:');
      expect(report).toContain('Agent Performance');
      expect(report).toMatch(/Generated: \d{4}-\d{2}-\d{2}/);
    });

    test('should export JSON report', () => {
      tracker.trackAgentInvocation('tester', {}, { success: true }, 3000);
      
      const report = tracker.exportReport('json');
      const parsed = JSON.parse(report);
      
      expect(parsed).toHaveProperty('productivityScore');
      expect(parsed).toHaveProperty('agentUsage');
      expect(parsed).toHaveProperty('taskMetrics');
      expect(parsed).toHaveProperty('recommendations');
    });
  });

  describe('Acceptance Criteria: Real-time updates', () => {
    test('should emit events on tracking', (done) => {
      tracker.on('agent_tracked', (metric) => {
        expect(metric.agent).toBe('coder');
        done();
      });

      tracker.trackAgentInvocation('coder', {}, { success: true }, 5000);
    });

    test('should emit events on task completion', (done) => {
      tracker.on('task_tracked', (task) => {
        expect(task.id).toBe('task-1');
        expect(task.success).toBe(true);
        done();
      });

      tracker.trackTaskCompletion('task-1', 'feature', ['coder'], 10000, true);
    });
  });

  describe('Acceptance Criteria: Dashboard data generation', () => {
    test('should generate dashboard data structure', () => {
      tracker.trackAgentInvocation('coder', {}, { success: true }, 5000);
      tracker.trackTaskCompletion('task-1', 'feature', ['coder'], 10000, true);
      
      const dashboard = tracker.getDashboardData();
      
      expect(dashboard).toHaveProperty('overview');
      expect(dashboard).toHaveProperty('agents');
      expect(dashboard).toHaveProperty('tasks');
      expect(dashboard).toHaveProperty('insights');
      expect(dashboard).toHaveProperty('charts');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty metrics gracefully', () => {
      const metrics = tracker.getMetrics();
      
      expect(metrics.productivityScore).toBe(0);
      expect(metrics.agentUsage).toEqual([]);
      expect(metrics.taskMetrics).toEqual([]);
      expect(metrics.bottlenecks).toEqual([]);
    });

    test('should handle tracking when disabled', () => {
      tracker.setTrackingEnabled(false);
      tracker.trackAgentInvocation('coder', {}, { success: true }, 5000);
      
      const metrics = tracker.getMetrics();
      expect(metrics.agentUsage).toHaveLength(0);
    });

    test('should reset metrics correctly', () => {
      tracker.trackAgentInvocation('coder', {}, { success: true }, 5000);
      tracker.reset();
      
      const metrics = tracker.getMetrics();
      expect(metrics.agentUsage).toHaveLength(0);
      expect(metrics.productivityScore).toBe(0);
    });
  });
});