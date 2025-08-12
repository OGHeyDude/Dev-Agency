/**
 * Root Cause Analyzer - Determines the underlying cause of issues
 */

import { AutoFixIssue, IssueType } from '../types';

export interface RootCauseAnalysisResult {
  issue: AutoFixIssue;
  rootCause: string;
  confidence: number;
  evidences: Evidence[];
  relatedIssues: string[];
  category: RootCauseCategory;
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface Evidence {
  type: 'pattern_match' | 'historical_data' | 'code_analysis' | 'dependency_graph';
  description: string;
  weight: number;
  source: string;
}

export type RootCauseCategory = 
  | 'syntax_error' 
  | 'type_error' 
  | 'missing_dependency' 
  | 'version_conflict' 
  | 'configuration_error'
  | 'logic_error'
  | 'performance_bottleneck'
  | 'security_vulnerability';

export interface RootCauseAnalyzerOptions {
  timeout: number;
  maxEvidences?: number;
}

export class RootCauseAnalyzer {
  private options: RootCauseAnalyzerOptions;
  private knownPatterns = new Map<string, RootCausePattern>();
  
  constructor(options: RootCauseAnalyzerOptions) {
    this.options = {
      maxEvidences: 10,
      ...options
    };
    
    this.initializePatterns();
  }
  
  /**
   * Analyze an issue to determine its root cause
   */
  public async analyzeIssue(issue: AutoFixIssue): Promise<RootCauseAnalysisResult> {
    const evidences: Evidence[] = [];
    
    // Pattern-based analysis
    const patternEvidences = await this.analyzePatterns(issue);
    evidences.push(...patternEvidences);
    
    // Code structure analysis
    const codeEvidences = await this.analyzeCodeStructure(issue);
    evidences.push(...codeEvidences);
    
    // Dependency analysis
    const dependencyEvidences = await this.analyzeDependencies(issue);
    evidences.push(...dependencyEvidences);
    
    // Historical analysis
    const historicalEvidences = await this.analyzeHistoricalPatterns(issue);
    evidences.push(...historicalEvidences);
    
    // Sort evidences by weight
    const topEvidences = evidences
      .sort((a, b) => b.weight - a.weight)
      .slice(0, this.options.maxEvidences);
    
    // Determine root cause
    const rootCauseResult = this.determineRootCause(issue, topEvidences);
    
    return {
      issue,
      rootCause: rootCauseResult.cause,
      confidence: rootCauseResult.confidence,
      evidences: topEvidences,
      relatedIssues: rootCauseResult.relatedIssues,
      category: rootCauseResult.category,
      complexity: rootCauseResult.complexity
    };
  }
  
  private async analyzePatterns(issue: AutoFixIssue): Promise<Evidence[]> {
    const evidences: Evidence[] = [];
    
    // Check against known patterns
    for (const [patternId, pattern] of this.knownPatterns) {
      if (pattern.issueType === issue.type) {
        const match = this.matchPattern(issue, pattern);
        if (match.matches) {
          evidences.push({
            type: 'pattern_match',
            description: `Matches known pattern: ${pattern.name}`,
            weight: match.confidence * 0.8,
            source: `pattern:${patternId}`
          });
        }
      }
    }
    
    return evidences;
  }
  
  private async analyzeCodeStructure(issue: AutoFixIssue): Promise<Evidence[]> {
    const evidences: Evidence[] = [];
    
    // Analyze based on issue type and location
    if (issue.type === 'compilation') {
      if (issue.context.errorCode?.startsWith('TS2304')) { // Cannot find name
        evidences.push({
          type: 'code_analysis',
          description: 'Likely missing import or typo in identifier',
          weight: 0.9,
          source: 'typescript_analyzer'
        });
      } else if (issue.context.errorCode?.startsWith('TS2307')) { // Cannot find module
        evidences.push({
          type: 'code_analysis',
          description: 'Missing dependency or incorrect module path',
          weight: 0.9,
          source: 'typescript_analyzer'
        });
      }
    }
    
    if (issue.type === 'test') {
      if (issue.description.includes('expect')) {
        evidences.push({
          type: 'code_analysis',
          description: 'Test assertion failure - logic or expectation mismatch',
          weight: 0.8,
          source: 'test_analyzer'
        });
      }
    }
    
    return evidences;
  }
  
  private async analyzeDependencies(issue: AutoFixIssue): Promise<Evidence[]> {
    const evidences: Evidence[] = [];
    
    if (issue.type === 'dependency') {
      if (issue.context.vulnerability) {
        evidences.push({
          type: 'dependency_graph',
          description: 'Security vulnerability in dependency chain',
          weight: 0.95,
          source: 'security_scanner'
        });
      }
      
      if (issue.context.fixAvailable) {
        evidences.push({
          type: 'dependency_graph',
          description: 'Fix available through dependency update',
          weight: 0.8,
          source: 'package_manager'
        });
      }
    }
    
    return evidences;
  }
  
  private async analyzeHistoricalPatterns(issue: AutoFixIssue): Promise<Evidence[]> {
    const evidences: Evidence[] = [];
    
    // This would analyze historical fix data
    // For now, provide basic historical context
    
    if (issue.tags?.includes('typescript')) {
      evidences.push({
        type: 'historical_data',
        description: 'TypeScript issues commonly resolved by import fixes',
        weight: 0.6,
        source: 'historical_analysis'
      });
    }
    
    return evidences;
  }
  
  private determineRootCause(issue: AutoFixIssue, evidences: Evidence[]): {
    cause: string;
    confidence: number;
    relatedIssues: string[];
    category: RootCauseCategory;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    // Analyze evidences to determine most likely root cause
    const topEvidence = evidences[0];
    
    if (!topEvidence) {
      return {
        cause: 'Unable to determine root cause',
        confidence: 0.1,
        relatedIssues: [],
        category: 'logic_error',
        complexity: 'complex'
      };
    }
    
    // Determine category and complexity based on issue type and evidences
    let category: RootCauseCategory = 'logic_error';
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    
    if (issue.type === 'compilation') {
      if (issue.context.errorCode?.includes('TS2304')) {
        category = 'missing_dependency';
        complexity = 'simple';
      } else if (issue.context.errorCode?.includes('TS2307')) {
        category = 'missing_dependency';
        complexity = 'simple';
      } else if (issue.context.errorCode?.includes('TS2322')) {
        category = 'type_error';
        complexity = 'moderate';
      }
    } else if (issue.type === 'dependency') {
      if (issue.context.vulnerability) {
        category = 'security_vulnerability';
        complexity = 'simple';
      } else {
        category = 'version_conflict';
        complexity = 'simple';
      }
    } else if (issue.type === 'lint') {
      category = 'syntax_error';
      complexity = 'simple';
    }
    
    // Generate root cause description
    const cause = this.generateRootCauseDescription(issue, category, evidences);
    
    // Calculate confidence based on evidence weights
    const totalWeight = evidences.reduce((sum, e) => sum + e.weight, 0);
    const confidence = Math.min(totalWeight / evidences.length, 0.95);
    
    return {
      cause,
      confidence,
      relatedIssues: [],
      category,
      complexity
    };
  }
  
  private generateRootCauseDescription(
    issue: AutoFixIssue, 
    category: RootCauseCategory, 
    evidences: Evidence[]
  ): string {
    const templates: Record<RootCauseCategory, string> = {
      'syntax_error': 'Syntax error in code that violates language rules',
      'type_error': 'Type mismatch or incorrect type usage',
      'missing_dependency': 'Required dependency, import, or module is missing',
      'version_conflict': 'Conflicting versions of dependencies or incompatible packages',
      'configuration_error': 'Incorrect configuration in build or runtime settings',
      'logic_error': 'Logical error in code implementation',
      'performance_bottleneck': 'Performance issue causing slowdown or resource exhaustion',
      'security_vulnerability': 'Security vulnerability in code or dependencies'
    };
    
    let description = templates[category];
    
    // Enhance with specific evidence details
    const specificEvidence = evidences.find(e => e.weight > 0.8);
    if (specificEvidence) {
      description += `: ${specificEvidence.description}`;
    }
    
    return description;
  }
  
  private matchPattern(issue: AutoFixIssue, pattern: RootCausePattern): { matches: boolean; confidence: number } {
    // Simple pattern matching logic
    // In production, this would be more sophisticated
    
    if (pattern.errorPattern) {
      const regex = new RegExp(pattern.errorPattern);
      if (regex.test(issue.description)) {
        return { matches: true, confidence: 0.8 };
      }
    }
    
    return { matches: false, confidence: 0 };
  }
  
  private initializePatterns(): void {
    // Initialize known root cause patterns
    this.knownPatterns.set('ts_missing_import', {
      id: 'ts_missing_import',
      name: 'TypeScript Missing Import',
      issueType: 'compilation',
      errorPattern: 'TS2304.*Cannot find name',
      rootCause: 'missing_dependency',
      confidence: 0.9
    });
    
    this.knownPatterns.set('ts_missing_module', {
      id: 'ts_missing_module',
      name: 'TypeScript Missing Module',
      issueType: 'compilation',
      errorPattern: 'TS2307.*Cannot find module',
      rootCause: 'missing_dependency',
      confidence: 0.9
    });
    
    this.knownPatterns.set('npm_security_vuln', {
      id: 'npm_security_vuln',
      name: 'NPM Security Vulnerability',
      issueType: 'dependency',
      errorPattern: 'vulnerability|CVE-',
      rootCause: 'security_vulnerability',
      confidence: 0.95
    });
  }
}

interface RootCausePattern {
  id: string;
  name: string;
  issueType: IssueType;
  errorPattern?: string;
  rootCause: RootCauseCategory;
  confidence: number;
}