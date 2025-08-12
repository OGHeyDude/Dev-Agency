/**
 * Fix Learner - Integration with the learning framework for continuous improvement
 */

import { FixResult, FixHistory } from '../types';

export interface FixLearnerOptions {
  learningEnabled: boolean;
  minDataPoints?: number;
}

export class FixLearner {
  private options: FixLearnerOptions;
  private fixResults: FixResult[] = [];
  
  constructor(options: FixLearnerOptions) {
    this.options = {
      minDataPoints: 10,
      ...options
    };
  }
  
  /**
   * Record a fix result for learning
   */
  public async recordFixResult(result: FixResult): Promise<void> {
    if (!this.options.learningEnabled) {
      return;
    }
    
    this.fixResults.push(result);
    
    // Keep only recent results
    if (this.fixResults.length > 1000) {
      this.fixResults = this.fixResults.slice(-1000);
    }
    
    // Update learning models if we have enough data
    if (this.fixResults.length >= this.options.minDataPoints!) {
      await this.updateLearningModels();
    }
  }
  
  /**
   * Get success rate for a specific fix strategy
   */
  public getStrategySuccessRate(strategyId: string): number {
    const strategyResults = this.fixResults.filter(r => r.strategy.id === strategyId);
    
    if (strategyResults.length === 0) {
      return 0.5; // Default success rate
    }
    
    const successful = strategyResults.filter(r => r.success).length;
    return successful / strategyResults.length;
  }
  
  /**
   * Get recommended confidence adjustment for a strategy
   */
  public getConfidenceAdjustment(strategyId: string, baseConfidence: number): number {
    const successRate = this.getStrategySuccessRate(strategyId);
    
    // Adjust confidence based on historical success rate
    if (successRate > 0.8) {
      return Math.min(baseConfidence + 0.1, 1.0);
    } else if (successRate < 0.4) {
      return Math.max(baseConfidence - 0.2, 0.1);
    }
    
    return baseConfidence;
  }
  
  private async updateLearningModels(): Promise<void> {
    // This would integrate with the main learning framework (AGENT-022)
    // For now, just perform basic analysis
    
    const analysis = this.analyzeFixPatterns();
    
    // In production, this would update the learning framework models
    console.log('Learning analysis:', analysis);
  }
  
  private analyzeFixPatterns(): any {
    const analysis = {
      totalFixes: this.fixResults.length,
      successRate: this.getOverallSuccessRate(),
      strategyPerformance: this.getStrategyPerformance(),
      issueTypePatterns: this.getIssueTypePatterns(),
      averageFixTime: this.getAverageFixTime()
    };
    
    return analysis;
  }
  
  private getOverallSuccessRate(): number {
    if (this.fixResults.length === 0) return 0;
    
    const successful = this.fixResults.filter(r => r.success).length;
    return successful / this.fixResults.length;
  }
  
  private getStrategyPerformance(): Record<string, any> {
    const performance: Record<string, any> = {};
    
    // Group by strategy ID
    const strategyGroups = new Map<string, FixResult[]>();
    
    for (const result of this.fixResults) {
      const strategyId = result.strategy.id;
      if (!strategyGroups.has(strategyId)) {
        strategyGroups.set(strategyId, []);
      }
      strategyGroups.get(strategyId)!.push(result);
    }
    
    // Calculate performance metrics for each strategy
    for (const [strategyId, results] of strategyGroups) {
      const successful = results.filter(r => r.success).length;
      const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
      
      performance[strategyId] = {
        total: results.length,
        successful,
        successRate: successful / results.length,
        averageTime: avgTime,
        lastUsed: Math.max(...results.map(r => r.startTime.getTime()))
      };
    }
    
    return performance;
  }
  
  private getIssueTypePatterns(): Record<string, any> {
    const patterns: Record<string, any> = {};
    
    // Group by issue type
    const issueTypeGroups = new Map<string, FixResult[]>();
    
    for (const result of this.fixResults) {
      const issueType = result.issue.type;
      if (!issueTypeGroups.has(issueType)) {
        issueTypeGroups.set(issueType, []);
      }
      issueTypeGroups.get(issueType)!.push(result);
    }
    
    // Calculate patterns for each issue type
    for (const [issueType, results] of issueTypeGroups) {
      const successful = results.filter(r => r.success).length;
      const avgConfidence = results.reduce((sum, r) => sum + r.issue.confidence, 0) / results.length;
      
      patterns[issueType] = {
        total: results.length,
        successRate: successful / results.length,
        averageConfidence: avgConfidence,
        commonStrategies: this.getCommonStrategies(results)
      };
    }
    
    return patterns;
  }
  
  private getCommonStrategies(results: FixResult[]): Array<{ strategy: string; count: number }> {
    const strategyCounts = new Map<string, number>();
    
    for (const result of results) {
      const strategyId = result.strategy.id;
      strategyCounts.set(strategyId, (strategyCounts.get(strategyId) || 0) + 1);
    }
    
    return Array.from(strategyCounts.entries())
      .map(([strategy, count]) => ({ strategy, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 strategies
  }
  
  private getAverageFixTime(): number {
    if (this.fixResults.length === 0) return 0;
    
    const totalTime = this.fixResults.reduce((sum, r) => sum + r.executionTime, 0);
    return totalTime / this.fixResults.length;
  }
}