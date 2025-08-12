/**
 * Lint Fix Strategy - Fixes linting and code quality issues
 */

import { FixStrategy } from '../../types';
import { StrategyContext } from '../FixGenerator';

export class LintFixStrategy {
  public async generateStrategies(context: StrategyContext): Promise<FixStrategy[]> {
    const strategies: FixStrategy[] = [];
    const { issue } = context;
    
    // Handle fixable lint rules
    if (issue.context.fixable) {
      strategies.push(this.createAutoFixStrategy(context));
    }
    
    // Handle specific common rules
    const rule = issue.context.rule;
    if (rule) {
      const ruleStrategy = this.createRuleSpecificStrategy(context, rule);
      if (ruleStrategy) {
        strategies.push(ruleStrategy);
      }
    }
    
    // Generic lint fix strategy
    strategies.push(this.createGenericLintFixStrategy(context));
    
    return strategies.filter(s => s !== null) as FixStrategy[];
  }
  
  private createAutoFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    const rule = issue.context.rule;
    
    return {
      id: 'eslint_autofix',
      name: 'ESLint Auto-fix',
      description: `Automatically fix ${rule} rule violation`,
      issueTypes: ['lint'],
      steps: [
        {
          id: 'run_eslint_fix',
          type: 'command',
          description: 'Run ESLint with --fix flag',
          action: {
            type: 'eslint_fix',
            target: issue.location.file,
            parameters: {
              rule,
              line: issue.location.line,
              autoFix: true
            }
          },
          rollbackAction: {
            type: 'restore_file',
            target: issue.location.file,
            parameters: {
              fromBackup: true
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.95,
      estimatedTime: 15,
      prerequisites: ['eslint_available'],
      rollbackSteps: [
        {
          id: 'restore_original_file',
          type: 'file_edit',
          description: 'Restore original file content',
          action: {
            type: 'restore_file',
            target: issue.location.file,
            parameters: {
              fromBackup: true
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'ESLint rule violation fixed',
        'No new lint errors introduced',
        'Code functionality preserved'
      ],
      tags: ['lint', 'eslint', 'autofix']
    };
  }
  
  private createRuleSpecificStrategy(context: StrategyContext, rule: string): FixStrategy | null {
    const { issue } = context;
    
    switch (rule) {
      case 'no-unused-vars':
        return this.createRemoveUnusedVarStrategy(context);
      case 'prefer-const':
        return this.createPreferConstStrategy(context);
      case 'no-console':
        return this.createRemoveConsoleStrategy(context);
      case 'semi':
        return this.createSemicolonFixStrategy(context);
      case 'quotes':
        return this.createQuotesFixStrategy(context);
      default:
        return null;
    }
  }
  
  private createRemoveUnusedVarStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'remove_unused_variable',
      name: 'Remove Unused Variable',
      description: 'Remove unused variable declaration',
      issueTypes: ['lint'],
      steps: [
        {
          id: 'identify_unused_var',
          type: 'command',
          description: 'Identify unused variable',
          action: {
            type: 'analyze_usage',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              variableName: this.extractVariableName(issue.description)
            }
          },
          optional: false
        },
        {
          id: 'remove_variable',
          type: 'file_edit',
          description: 'Remove unused variable declaration',
          action: {
            type: 'remove_declaration',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              type: 'variable'
            }
          },
          rollbackAction: {
            type: 'restore_declaration',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.9,
      estimatedTime: 30,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'restore_variable',
          type: 'file_edit',
          description: 'Restore variable declaration',
          action: {
            type: 'restore_declaration',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Unused variable removed',
        'Code still compiles',
        'No runtime errors introduced'
      ],
      tags: ['lint', 'cleanup', 'variables']
    };
  }
  
  private createPreferConstStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'change_let_to_const',
      name: 'Change let to const',
      description: 'Change let declaration to const for immutable variables',
      issueTypes: ['lint'],
      steps: [
        {
          id: 'replace_let_with_const',
          type: 'file_edit',
          description: 'Replace let with const',
          action: {
            type: 'replace_keyword',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              from: 'let',
              to: 'const'
            }
          },
          rollbackAction: {
            type: 'replace_keyword',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              from: 'const',
              to: 'let'
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.95,
      estimatedTime: 15,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'restore_let',
          type: 'file_edit',
          description: 'Restore let keyword',
          action: {
            type: 'replace_keyword',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              from: 'const',
              to: 'let'
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'let changed to const',
        'Code still functions correctly'
      ],
      tags: ['lint', 'const', 'immutability']
    };
  }
  
  private createRemoveConsoleStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'remove_console_statement',
      name: 'Remove Console Statement',
      description: 'Remove console.log and similar statements',
      issueTypes: ['lint'],
      steps: [
        {
          id: 'remove_console_line',
          type: 'file_edit',
          description: 'Remove console statement line',
          action: {
            type: 'remove_line',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              pattern: /console\.\w+\([^)]*\);?/
            }
          },
          rollbackAction: {
            type: 'restore_line',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.9,
      estimatedTime: 20,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'restore_console_line',
          type: 'file_edit',
          description: 'Restore console statement',
          action: {
            type: 'restore_line',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Console statement removed',
        'No debugging output in production code'
      ],
      tags: ['lint', 'console', 'cleanup']
    };
  }
  
  private createSemicolonFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'fix_semicolon',
      name: 'Fix Semicolon',
      description: 'Add or remove semicolons based on project style',
      issueTypes: ['lint'],
      steps: [
        {
          id: 'fix_semicolon',
          type: 'file_edit',
          description: 'Fix semicolon usage',
          action: {
            type: 'fix_semicolon',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              action: this.determineSemicolonAction(issue.description)
            }
          },
          rollbackAction: {
            type: 'revert_semicolon',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.98,
      estimatedTime: 10,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'revert_semicolon_fix',
          type: 'file_edit',
          description: 'Revert semicolon changes',
          action: {
            type: 'revert_semicolon',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Semicolon usage follows project style',
        'No syntax errors introduced'
      ],
      tags: ['lint', 'semicolon', 'style']
    };
  }
  
  private createQuotesFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'fix_quotes',
      name: 'Fix Quote Style',
      description: 'Fix quote style to match project conventions',
      issueTypes: ['lint'],
      steps: [
        {
          id: 'normalize_quotes',
          type: 'file_edit',
          description: 'Normalize quote style',
          action: {
            type: 'normalize_quotes',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              preferredStyle: this.determineQuoteStyle(issue.description)
            }
          },
          rollbackAction: {
            type: 'revert_quotes',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.95,
      estimatedTime: 15,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'revert_quote_changes',
          type: 'file_edit',
          description: 'Revert quote style changes',
          action: {
            type: 'revert_quotes',
            target: issue.location.file,
            parameters: {
              line: issue.location.line
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Quote style matches project convention',
        'String content unchanged'
      ],
      tags: ['lint', 'quotes', 'style']
    };
  }
  
  private createGenericLintFixStrategy(context: StrategyContext): FixStrategy {
    const { issue } = context;
    
    return {
      id: 'suppress_lint_rule',
      name: 'Suppress Lint Rule',
      description: 'Add eslint-disable comment for this rule',
      issueTypes: ['lint'],
      steps: [
        {
          id: 'add_disable_comment',
          type: 'file_edit',
          description: 'Add eslint-disable comment',
          action: {
            type: 'add_comment',
            target: issue.location.file,
            parameters: {
              line: issue.location.line,
              comment: `// eslint-disable-next-line ${issue.context.rule}`,
              position: 'above'
            }
          },
          rollbackAction: {
            type: 'remove_comment',
            target: issue.location.file,
            parameters: {
              line: issue.location.line - 1
            }
          },
          optional: false
        }
      ],
      riskLevel: 'low',
      confidence: 0.7,
      estimatedTime: 20,
      prerequisites: [],
      rollbackSteps: [
        {
          id: 'remove_disable_comment',
          type: 'file_edit',
          description: 'Remove eslint-disable comment',
          action: {
            type: 'remove_comment',
            target: issue.location.file,
            parameters: {
              line: issue.location.line - 1
            }
          },
          optional: false
        }
      ],
      successCriteria: [
        'Lint rule suppressed for this line',
        'Code functionality preserved'
      ],
      tags: ['lint', 'suppress', 'eslint-disable']
    };
  }
  
  // Helper methods
  
  private extractVariableName(description: string): string {
    const match = description.match(/'([^']+)' is defined but never used/);
    return match ? match[1] : 'unknown';
  }
  
  private determineSemicolonAction(description: string): 'add' | 'remove' {
    return description.includes('Missing semicolon') ? 'add' : 'remove';
  }
  
  private determineQuoteStyle(description: string): 'single' | 'double' {
    return description.includes('single quotes') ? 'single' : 'double';
  }
}