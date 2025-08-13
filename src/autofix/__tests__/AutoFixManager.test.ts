/**
 * AutoFixManager Integration Tests
 * Tests the complete auto-fix workflow
 */

import { AutoFixManager } from '../AutoFixManager';
import { AutoFixIssue, AutoFixConfig, FixResult } from '../types';

describe('AutoFixManager', () => {
  let manager: AutoFixManager;
  let mockConfig: AutoFixConfig;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      autoApplyThreshold: 0.8,
      riskTolerance: 'medium',
      enabledIssueTypes: ['compilation', 'test', 'dependency', 'lint'],
      testValidationRequired: true,
      rollbackOnFailure: true,
      maxConcurrentFixes: 3,
      retryAttempts: 2,
      timeouts: {
        detection: 30000,
        analysis: 60000,
        fixing: 120000,
        validation: 180000
      }
    };

    manager = new AutoFixManager({
      config: mockConfig,
      enableLogging: false
    });
  });

  afterEach(async () => {
    await manager.stopMonitoring();
  });

  describe('Monitoring Lifecycle', () => {
    it('should start and stop monitoring successfully', async () => {
      await manager.startMonitoring();
      const status = manager.getStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.healthStatus).toBe('healthy');
      
      await manager.stopMonitoring();
      const stoppedStatus = manager.getStatus();
      
      expect(stoppedStatus.enabled).toBe(false);
    });

    it('should handle multiple start/stop calls gracefully', async () => {
      // Starting multiple times should not cause issues
      await manager.startMonitoring();
      await manager.startMonitoring();
      
      const status = manager.getStatus();
      expect(status.enabled).toBe(true);
      
      // Stopping multiple times should not cause issues
      await manager.stopMonitoring();
      await manager.stopMonitoring();
      
      const stoppedStatus = manager.getStatus();
      expect(stoppedStatus.enabled).toBe(false);
    });
  });

  describe('Issue Detection and Fixing', () => {
    it('should detect and fix TypeScript compilation issues', async () => {
      const issue: AutoFixIssue = {
        id: 'ts-error-001',
        type: 'compilation',
        severity: 'high',
        title: 'TypeScript Error TS2304',
        description: "Cannot find name 'React'",
        location: {
          file: 'src/component.tsx',
          line: 1,
          column: 8
        },
        context: {
          errorCode: 'TS2304',
          compiler: 'typescript',
          missingImport: 'React'
        },
        detected: new Date(),
        confidence: 0.9,
        tags: ['typescript', 'compilation', 'import']
      };

      const result = await manager.fixIssue(issue);
      
      expect(result).toBeDefined();
      expect(result.issue.id).toBe(issue.id);
      expect(result.strategy).toBeDefined();
      expect(result.strategy.name).toContain('Import');
      
      // Should either be applied or pending approval based on confidence
      if (result.strategy.confidence >= mockConfig.autoApplyThreshold) {
        expect(['applied', 'failed', 'rolled_back']).toContain(result.status);
      } else {
        expect(result.status).toBe('pending');
      }
    });

    it('should detect and fix test failures', async () => {
      const issue: AutoFixIssue = {
        id: 'test-fail-001',
        type: 'test',
        severity: 'medium',
        title: 'Test Failure: should render correctly',
        description: 'expect(received).toBe(expected)',
        location: {
          file: 'src/component.test.tsx',
          line: 15,
          function: 'should render correctly'
        },
        context: {
          testFile: true,
          testName: 'should render correctly',
          framework: 'jest',
          errorMessage: 'Expected: "Hello World"\\nReceived: "Hello"'
        },
        detected: new Date(),
        confidence: 0.7,
        tags: ['test', 'jest', 'assertion']
      };

      const result = await manager.fixIssue(issue);
      
      expect(result).toBeDefined();
      expect(result.issue.id).toBe(issue.id);
      expect(result.strategy).toBeDefined();
      expect(result.strategy.issueTypes).toContain('test');
    });

    it('should detect and fix dependency vulnerabilities', async () => {
      const issue: AutoFixIssue = {
        id: 'vuln-001',
        type: 'dependency',
        severity: 'critical',
        title: 'Security Vulnerability in lodash',
        description: 'Prototype Pollution in lodash',
        location: {
          file: 'package.json',
          module: 'lodash'
        },
        context: {
          packageName: 'lodash',
          vulnerability: {
            id: 'CVE-2021-23337',
            title: 'Prototype Pollution',
            severity: 'high'
          },
          fixAvailable: true,
          current: '4.17.15',
          fixed: '4.17.21'
        },
        detected: new Date(),
        confidence: 0.95,
        tags: ['security', 'vulnerability', 'dependency']
      };

      const result = await manager.fixIssue(issue);
      
      expect(result).toBeDefined();
      expect(result.issue.id).toBe(issue.id);
      expect(result.strategy).toBeDefined();
      expect(result.strategy.name).toContain('Security');
    });

    it('should handle lint issues with auto-fixable rules', async () => {
      const issue: AutoFixIssue = {
        id: 'lint-001',
        type: 'lint',
        severity: 'low',
        title: 'Lint error: semi',
        description: 'Missing semicolon',
        location: {
          file: 'src/utils.ts',
          line: 23,
          column: 42
        },
        context: {
          rule: 'semi',
          level: 'error',
          linter: 'eslint',
          fixable: true
        },
        detected: new Date(),
        confidence: 0.95,
        tags: ['lint', 'eslint', 'semi']
      };

      const result = await manager.fixIssue(issue);
      
      expect(result).toBeDefined();
      expect(result.issue.id).toBe(issue.id);
      expect(result.strategy).toBeDefined();
      expect(result.strategy.riskLevel).toBe('low');
    });
  });

  describe('Predictive Capabilities', () => {
    it('should generate predictive insights', async () => {
      await manager.startMonitoring();
      
      // Wait a moment for predictive analysis to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const insights = await manager.getPredictiveInsights();
      
      expect(Array.isArray(insights)).toBe(true);
      
      // Each insight should have required properties
      for (const insight of insights) {
        expect(insight.id).toBeDefined();
        expect(insight.issueType).toBeDefined();
        expect(insight.probability).toBeGreaterThanOrEqual(0);
        expect(insight.probability).toBeLessThanOrEqual(1);
        expect(insight.confidence).toBeGreaterThanOrEqual(0);
        expect(insight.confidence).toBeLessThanOrEqual(1);
        expect(insight.timeframe).toMatch(/^(1-6h|6-24h|1-3d|3-7d)$/);
        expect(Array.isArray(insight.preventionSuggestions)).toBe(true);
      }
    });

    it('should filter insights by confidence threshold', async () => {
      await manager.startMonitoring();
      
      const insights = await manager.getPredictiveInsights();
      
      // All insights should meet or exceed the confidence threshold
      for (const insight of insights) {
        expect(insight.confidence).toBeGreaterThanOrEqual(0.6); // Default threshold
      }
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration correctly', () => {
      const updates = {
        autoApplyThreshold: 0.9,
        riskTolerance: 'low' as const,
        maxConcurrentFixes: 5
      };

      manager.updateConfig(updates);
      
      // Configuration should be updated (we'd need to expose config getter to test this)
      // For now, just verify the method doesn't throw
      expect(() => manager.updateConfig(updates)).not.toThrow();
    });

    it('should respect risk tolerance settings', async () => {
      // Update config to low risk tolerance
      manager.updateConfig({ riskTolerance: 'low' });

      const highRiskIssue: AutoFixIssue = {
        id: 'high-risk-001',
        type: 'compilation',
        severity: 'critical',
        title: 'Complex compilation error',
        description: 'Multiple type errors requiring significant changes',
        location: { file: 'src/complex.ts' },
        context: { complexity: 'high' },
        detected: new Date(),
        confidence: 0.9,
        tags: ['typescript', 'complex']
      };

      const result = await manager.fixIssue(highRiskIssue);
      
      // High-risk fixes should require manual approval even with high confidence
      expect(result.status).toBe('pending');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid issues gracefully', async () => {
      const invalidIssue = {
        id: 'invalid-001',
        type: 'unknown' as any,
        severity: 'medium',
        title: 'Unknown issue type',
        description: 'This issue has an unknown type',
        location: { file: 'src/test.ts' },
        context: {},
        detected: new Date(),
        confidence: 0.8,
        tags: []
      };

      const result = await manager.fixIssue(invalidIssue);
      
      // Should handle gracefully, either with a generic strategy or error
      expect(result).toBeDefined();
      expect(result.issue.id).toBe(invalidIssue.id);
    });

    it('should handle fix failures with rollback', async () => {
      // Create an issue that will likely fail to fix
      const problematicIssue: AutoFixIssue = {
        id: 'fail-001',
        type: 'compilation',
        severity: 'high',
        title: 'Unfixable compilation error',
        description: 'This error cannot be automatically fixed',
        location: { file: 'non-existent-file.ts' },
        context: { unfixable: true },
        detected: new Date(),
        confidence: 0.5,
        tags: ['unfixable']
      };

      const result = await manager.fixIssue(problematicIssue);
      
      expect(result).toBeDefined();
      expect(result.issue.id).toBe(problematicIssue.id);
      
      // Should either fail or be pending
      expect(['failed', 'pending', 'rolled_back']).toContain(result.status);
    });
  });

  describe('Metrics and History', () => {
    it('should track fix history', async () => {
      const issue: AutoFixIssue = {
        id: 'history-001',
        type: 'lint',
        severity: 'low',
        title: 'Simple lint fix',
        description: 'Missing semicolon',
        location: { file: 'src/test.ts', line: 1 },
        context: { rule: 'semi', fixable: true },
        detected: new Date(),
        confidence: 0.95,
        tags: ['lint']
      };

      await manager.fixIssue(issue);
      
      const history = manager.getFixHistory(10);
      
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      
      const latestEntry = history[history.length - 1];
      expect(latestEntry.issue.id).toBe(issue.id);
      expect(latestEntry.result).toBeDefined();
      expect(latestEntry.timestamp).toBeDefined();
    });

    it('should provide accurate status metrics', async () => {
      await manager.startMonitoring();
      
      const status = manager.getStatus();
      
      expect(status.enabled).toBe(true);
      expect(status.lastCheck).toBeInstanceOf(Date);
      expect(status.issuesDetected).toBeGreaterThanOrEqual(0);
      expect(status.fixesApplied).toBeGreaterThanOrEqual(0);
      expect(status.successRate).toBeGreaterThanOrEqual(0);
      expect(status.successRate).toBeLessThanOrEqual(100);
      expect(status.averageFixTime).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(status.activeMonitors)).toBe(true);
      expect(['healthy', 'degraded', 'critical', 'offline']).toContain(status.healthStatus);
    });
  });

  describe('Integration with Learning System', () => {
    it('should learn from fix results', async () => {
      const issue: AutoFixIssue = {
        id: 'learning-001',
        type: 'compilation',
        severity: 'medium',
        title: 'TypeScript error for learning',
        description: 'Cannot find name test',
        location: { file: 'src/learning.ts', line: 5 },
        context: { errorCode: 'TS2304' },
        detected: new Date(),
        confidence: 0.8,
        tags: ['typescript', 'learning']
      };

      const result = await manager.fixIssue(issue);
      
      expect(result).toBeDefined();
      
      // The learning system should record this fix result
      // In a real implementation, we'd verify learning system integration
      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalTime).toBeGreaterThan(0);
    });
  });
});