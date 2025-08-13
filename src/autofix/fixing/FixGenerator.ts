/**
 * Fix Generator - Generates context-aware fix strategies for detected issues
 */

import { AutoFixIssue, FixStrategy, FixStep, RiskLevel } from '../types';
import { RootCauseAnalysisResult } from '../analysis/RootCauseAnalyzer';
import { CompilationFixStrategy } from './strategies/CompilationFixStrategy';
import { TestFixStrategy } from './strategies/TestFixStrategy';
import { DependencyFixStrategy } from './strategies/DependencyFixStrategy';
import { LintFixStrategy } from './strategies/LintFixStrategy';

export interface FixGeneratorOptions {
  riskTolerance: RiskLevel;
  maxStrategies: number;
  enableExperimental?: boolean;
}

export interface StrategyContext {
  issue: AutoFixIssue;
  analysis?: RootCauseAnalysisResult;
  projectContext: any;
  historicalFixes: any[];
  codebase: any;
}

export class FixGenerator {
  private options: FixGeneratorOptions;
  private strategies = new Map<string, any>();
  
  constructor(options: FixGeneratorOptions) {
    this.options = {
      enableExperimental: false,
      ...options
    };
    
    this.initializeStrategies();
  }
  
  /**
   * Generate fix strategies for an issue
   */
  public async generateStrategies(
    issue: AutoFixIssue, 
    analysis?: RootCauseAnalysisResult
  ): Promise<FixStrategy[]> {
    const context: StrategyContext = {
      issue,
      analysis,
      projectContext: await this.getProjectContext(),
      historicalFixes: await this.getHistoricalFixes(issue.type),
      codebase: await this.getCodebaseContext(issue)
    };
    
    const strategies: FixStrategy[] = [];
    
    // Get strategies from type-specific generators
    const typeStrategy = this.strategies.get(issue.type);
    if (typeStrategy) {
      const typeStrategies = await typeStrategy.generateStrategies(context);
      strategies.push(...typeStrategies);
    }
    
    // Get generic strategies
    const genericStrategies = await this.generateGenericStrategies(context);
    strategies.push(...genericStrategies);
    
    // Filter and rank strategies
    const filteredStrategies = this.filterStrategiesByRisk(strategies);
    const rankedStrategies = this.rankStrategies(filteredStrategies, context);
    
    // Limit number of strategies
    return rankedStrategies.slice(0, this.options.maxStrategies);
  }
  
  /**
   * Generate a single best-effort strategy
   */
  public async generateBestStrategy(
    issue: AutoFixIssue, 
    analysis?: RootCauseAnalysisResult
  ): Promise<FixStrategy | null> {
    const strategies = await this.generateStrategies(issue, analysis);
    return strategies.length > 0 ? strategies[0] : null;
  }
  
  /**
   * Validate that a strategy can be applied safely
   */
  public validateStrategy(strategy: FixStrategy, context: StrategyContext): {
    valid: boolean;
    reasons: string[];
    warnings: string[];
  } {
    const reasons: string[] = [];
    const warnings: string[] = [];
    
    // Check risk tolerance
    if (!this.isRiskAcceptable(strategy.riskLevel)) {
      reasons.push(`Risk level ${strategy.riskLevel} exceeds tolerance ${this.options.riskTolerance}`);
    }
    
    // Check prerequisites
    for (const prereq of strategy.prerequisites) {
      if (!this.checkPrerequisite(prereq, context)) {
        reasons.push(`Prerequisite not met: ${prereq}`);
      }
    }
    
    // Check for potential conflicts
    const conflicts = this.checkConflicts(strategy, context);
    if (conflicts.length > 0) {
      warnings.push(...conflicts);
    }
    
    // Validate rollback capability
    if (strategy.rollbackSteps.length === 0 && strategy.riskLevel !== 'low') {
      warnings.push('No rollback steps defined for medium/high risk strategy');
    }
    
    return {
      valid: reasons.length === 0,
      reasons,
      warnings
    };
  }
  
  private initializeStrategies(): void {
    this.strategies.set('compilation', new CompilationFixStrategy());
    this.strategies.set('test', new TestFixStrategy());
    this.strategies.set('dependency', new DependencyFixStrategy());
    this.strategies.set('lint', new LintFixStrategy());
  }
  
  private async generateGenericStrategies(context: StrategyContext): Promise<FixStrategy[]> {
    const strategies: FixStrategy[] = [];
    
    // Generic documentation strategy
    if (context.issue.confidence > 0.5) {
      strategies.push({
        id: 'document_issue',
        name: 'Document Issue',
        description: 'Create documentation for manual investigation',
        issueTypes: [context.issue.type],
        steps: [
          {
            id: 'create_bug_report',
            type: 'file_edit',
            description: 'Create detailed bug report',
            action: {
              type: 'create_file',
              target: `Bug_Reports/issue_${context.issue.id}.md`,
              parameters: {
                content: this.generateBugReport(context.issue)
              }
            },
            optional: false
          }
        ],
        riskLevel: 'low',
        confidence: 0.9,
        estimatedTime: 60, // 1 minute
        prerequisites: [],
        rollbackSteps: [],
        successCriteria: ['Bug report file created'],
        tags: ['documentation', 'manual']
      });
    }
    
    return strategies;
  }
  
  private filterStrategiesByRisk(strategies: FixStrategy[]): FixStrategy[] {
    return strategies.filter(strategy => this.isRiskAcceptable(strategy.riskLevel));
  }
  
  private isRiskAcceptable(strategyRisk: RiskLevel): boolean {
    const riskLevels = { low: 1, medium: 2, high: 3 };
    const toleranceLevel = riskLevels[this.options.riskTolerance];
    const strategyLevel = riskLevels[strategyRisk];
    
    return strategyLevel <= toleranceLevel;
  }
  
  private rankStrategies(strategies: FixStrategy[], context: StrategyContext): FixStrategy[] {
    return strategies.sort((a, b) => {
      // Primary ranking by confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }
      
      // Secondary ranking by risk (lower risk preferred)
      const riskScore = { low: 3, medium: 2, high: 1 };
      const aRisk = riskScore[a.riskLevel];
      const bRisk = riskScore[b.riskLevel];
      
      if (aRisk !== bRisk) {
        return bRisk - aRisk;
      }
      
      // Tertiary ranking by estimated time (faster preferred)
      return a.estimatedTime - b.estimatedTime;
    });
  }
  
  private checkPrerequisite(prereq: string, context: StrategyContext): boolean {
    // Implement prerequisite checking logic
    // For now, assume all prerequisites are met
    return true;
  }
  
  private checkConflicts(strategy: FixStrategy, context: StrategyContext): string[] {
    const conflicts: string[] = [];
    
    // Check for file conflicts
    const modifiedFiles = strategy.steps
      .filter(step => step.type === 'file_edit')
      .map(step => step.action.target);
    
    if (modifiedFiles.length > 1) {
      conflicts.push('Strategy modifies multiple files simultaneously');
    }
    
    return conflicts;
  }
  
  private async getProjectContext(): Promise<any> {
    // Get project context from various sources
    return {
      hasTypeScript: true,
      hasTests: true,
      packageManager: 'npm',
      buildTool: 'webpack',
      framework: 'react'
    };
  }
  
  private async getHistoricalFixes(issueType: string): Promise<any[]> {
    // Get historical fixes from learning system
    return [];
  }
  
  private async getCodebaseContext(issue: AutoFixIssue): Promise<any> {
    // Analyze codebase around the issue location
    return {
      nearbyFiles: [],
      dependencies: [],
      patterns: []
    };
  }
  
  private generateBugReport(issue: AutoFixIssue): string {
    return `# Bug Report: ${issue.title}

## Issue Details
- **ID**: ${issue.id}
- **Type**: ${issue.type}
- **Severity**: ${issue.severity}
- **Detected**: ${issue.detected.toISOString()}
- **Confidence**: ${issue.confidence}

## Description
${issue.description}

## Location
- **File**: ${issue.location.file}
- **Line**: ${issue.location.line || 'N/A'}
- **Column**: ${issue.location.column || 'N/A'}

## Context
\`\`\`json
${JSON.stringify(issue.context, null, 2)}
\`\`\`

## Tags
${issue.tags?.join(', ') || 'None'}

## Manual Investigation Required
This issue requires manual investigation and resolution.
`;
  }
}