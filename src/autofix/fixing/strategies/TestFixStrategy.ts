/**
 * Test Fix Strategy - Fixes failing tests and test-related issues
 */

import { FixStrategy } from '../../types';
import { StrategyContext } from '../FixGenerator';

export class TestFixStrategy {
  public async generateStrategies(context: StrategyContext): Promise<FixStrategy[]> {
    const strategies: FixStrategy[] = [];
    const { issue } = context;
    
    // Analyze test failure patterns
    if (issue.context.testFile) {
      if (issue.description.includes('expect')) {
        strategies.push(this.createAssertionFixStrategy(context));
      }
      
      if (issue.description.includes('timeout')) {
        strategies.push(this.createTimeoutFixStrategy(context));
      }
      
      if (issue.description.includes('async')) {
        strategies.push(this.createAsyncTestFixStrategy(context));
      }
      
      // Generic test regeneration
      strategies.push(this.createTestRegenerationStrategy(context));
    }
    
    return strategies.filter(s => s !== null) as FixStrategy[];
  }
  
  private createAssertionFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'fix_test_assertion',
      name: 'Fix Test Assertion',
      description: 'Fix failing test assertion by updating expected values',
      issueTypes: ['test'],
      steps: [
        {
          id: 'analyze_assertion',
          type: 'command',
          description: 'Analyze the failing assertion',
          action: {
            type: 'test_analysis',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName,
              framework: issue.context.framework
            }
          },
          optional: false
        },
        {
          id: 'update_assertion',
          type: 'file_edit',
          description: 'Update test assertion with correct expected value',
          action: {
            type: 'update_assertion',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName,
              assertionType: 'expect',
              updateStrategy: 'snapshot_update' // or 'expected_value'
            }
          },
          rollbackAction: {
            type: 'revert_assertion',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      riskLevel: 'medium',
      confidence: 0.6,
      estimatedTime: 90,
      prerequisites: ['test_file_exists'],
      rollbackSteps: [
        {
          id: 'revert_assertion',
          type: 'file_edit',
          description: 'Revert assertion to original state',
          action: {
            type: 'revert_assertion',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Test assertion passes',
        'Test logic remains valid',
        'No other tests broken'
      ],
      tags: ['test', 'assertion', 'jest']
    };
  }
  
  private createTimeoutFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'fix_test_timeout',
      name: 'Fix Test Timeout',
      description: 'Increase test timeout for slow operations',
      issueTypes: ['test'],
      steps: [
        {
          id: 'analyze_timeout',
          type: 'command',
          description: 'Analyze test execution time',
          action: {
            type: 'test_timing_analysis',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        },
        {
          id: 'increase_timeout',
          type: 'file_edit',
          description: 'Increase test timeout value',
          action: {
            type: 'update_timeout',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName,
              newTimeout: 10000, // 10 seconds
              scope: 'single_test' // or 'suite'
            }
          },
          rollbackAction: {
            type: 'restore_timeout',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.8,
      estimatedTime: 30,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'restore_original_timeout',
          type: 'file_edit',
          description: 'Restore original timeout value',
          action: {
            type: 'restore_timeout',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Test completes within new timeout',
        'No timeout errors occur'
      ],
      tags: ['test', 'timeout', 'performance']
    };
  }
  
  private createAsyncTestFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'fix_async_test',
      name: 'Fix Async Test',
      description: 'Fix async test by adding proper await/return statements',
      issueTypes: ['test'],
      steps: [
        {
          id: 'analyze_async_pattern',
          type: 'command',
          description: 'Analyze async patterns in test',
          action: {
            type: 'async_analysis',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName,
              checkPatterns: ['Promise', 'async', 'await']
            }
          },
          optional: false
        },
        {
          id: 'fix_async_handling',
          type: 'file_edit',
          description: 'Add proper async/await handling',
          action: {
            type: 'fix_async',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName,
              strategy: 'add_await' // or 'add_return', 'make_async'
            }
          },
          rollbackAction: {
            type: 'revert_async_changes',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      riskLevel: 'medium',
      confidence: 0.7,
      estimatedTime: 120,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'revert_async_changes',
          type: 'file_edit',
          description: 'Revert async changes',
          action: {
            type: 'revert_async_changes',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Test handles async operations correctly',
        'No unhandled promise rejections',
        'Test passes consistently'
      ],
      tags: ['test', 'async', 'promises']
    };
  }
  
  private createTestRegenerationStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'regenerate_test',
      name: 'Regenerate Test',
      description: 'Regenerate failing test based on current implementation',
      issueTypes: ['test'],
      steps: [
        {
          id: 'analyze_current_behavior',
          type: 'command',
          description: 'Analyze current implementation behavior',
          action: {
            type: 'behavior_analysis',
            target: this.getSourceFileFromTest(issue.location.file),
            parameters: {
              testFile: issue.location.file,
              testName: issue.context.testName
            }
          },
          optional: false
        },
        {
          id: 'generate_new_test',
          type: 'file_edit',
          description: 'Generate new test based on current behavior',
          action: {
            type: 'generate_test',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName,
              strategy: 'behavior_driven',
              preserveStructure: true
            }
          },
          rollbackAction: {
            type: 'restore_original_test',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      riskLevel: 'high',
      confidence: 0.4,
      estimatedTime: 300, // 5 minutes
      prerequisites: ['source_file_exists'],
      rollbackSteps: [
        {
          id: 'restore_original_test',
          type: 'file_edit',
          description: 'Restore original test',
          action: {
            type: 'restore_original_test',
            target: issue.location.file,
            parameters: {
              testName: issue.context.testName
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Generated test passes',
        'Test covers required behavior',
        'Test maintains original intent'
      ],
      tags: ['test', 'generation', 'behavior-driven']
    };
  }
  
  private getSourceFileFromTest(testFile: string): string {
    // Convert test file path to source file path
    // e.g., 'src/utils/helper.test.ts' -> 'src/utils/helper.ts'
    return testFile.replace(/\.test\.(js|ts|jsx|tsx)$/, '.$1');
  }
}