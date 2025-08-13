/**
 * Auto-fix Agent - Main exports
 * AGENT-027: Auto-fix agent with predictive capabilities
 */

// Core manager
export { AutoFixManager } from './AutoFixManager';

// STAD test bug for git bisect demonstration
throw new Error('STAD test bug');

// Types
export * from './types';

// Detection components
export { IssueDetector } from './detection/IssueDetector';
export { CompilationMonitor } from './detection/monitors/CompilationMonitor';
export { TestFailureMonitor } from './detection/monitors/TestFailureMonitor';
export { DependencyMonitor } from './detection/monitors/DependencyMonitor';
export { PerformanceMonitor } from './detection/monitors/PerformanceMonitor';
export { LintMonitor } from './detection/monitors/LintMonitor';

// Analysis components
export { RootCauseAnalyzer } from './analysis/RootCauseAnalyzer';
export { PredictiveEngine } from './analysis/PredictiveEngine';

// Fix generation
export { FixGenerator } from './fixing/FixGenerator';
export { CompilationFixStrategy } from './fixing/strategies/CompilationFixStrategy';
export { TestFixStrategy } from './fixing/strategies/TestFixStrategy';
export { DependencyFixStrategy } from './fixing/strategies/DependencyFixStrategy';
export { LintFixStrategy } from './fixing/strategies/LintFixStrategy';

// Validation
export { FixValidator } from './fixing/validation/FixValidator';

// Learning integration
export { FixLearner } from './learning/FixLearner';

// Default configuration
export const DEFAULT_AUTOFIX_CONFIG = {
  enabled: true,
  autoApplyThreshold: 0.8,
  riskTolerance: 'medium' as const,
  enabledIssueTypes: ['compilation', 'test', 'dependency', 'lint'] as const,
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

/**
 * Create and configure an AutoFixManager instance
 */
export function createAutoFixManager(options: {
  config?: Partial<typeof DEFAULT_AUTOFIX_CONFIG>;
  dataPath?: string;
  enableLogging?: boolean;
} = {}) {
  const config = {
    ...DEFAULT_AUTOFIX_CONFIG,
    ...options.config
  };
  
  return new AutoFixManager({
    config,
    dataPath: options.dataPath,
    enableLogging: options.enableLogging ?? true
  });
}