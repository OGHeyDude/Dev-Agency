/**
 * Statistical Analyzer for Sprint Planning
 * 
 * Provides statistical analysis methods for sprint data including
 * velocity trends, pattern recognition, and predictive analytics.
 */

import { 
  SprintData, 
  TicketData, 
  VelocityAnalysis, 
  StatisticalSummary,
  EpicAnalysis,
  SprintPattern
} from './types';

export class StatisticalAnalyzer {
  
  /**
   * Analyze velocity trends across sprints
   */
  public analyzeVelocity(sprints: SprintData[]): VelocityAnalysis {
    const completedSprints = sprints.filter(s => s.status === 'COMPLETED');
    
    if (completedSprints.length === 0) {
      return {
        currentVelocity: 0,
        averageVelocity: 0,
        velocityTrend: 'STABLE',
        confidenceInterval: { min: 0, max: 0 },
        lastThreeSprintsAverage: 0
      };
    }
    
    // Sort by sprint number
    completedSprints.sort((a, b) => a.sprintNumber - b.sprintNumber);
    
    const velocities = completedSprints.map(s => s.completedPoints);
    const currentVelocity = velocities[velocities.length - 1] || 0;
    const averageVelocity = this.calculateMean(velocities);
    
    // Calculate last 3 sprints average
    const lastThree = velocities.slice(-3);
    const lastThreeSprintsAverage = this.calculateMean(lastThree);
    
    // Determine trend
    const velocityTrend = this.calculateTrend(velocities);
    
    // Calculate confidence interval using standard deviation
    const stdDev = this.calculateStandardDeviation(velocities);
    const confidenceInterval = {
      min: Math.max(0, averageVelocity - stdDev),
      max: averageVelocity + stdDev
    };
    
    return {
      currentVelocity,
      averageVelocity,
      velocityTrend,
      confidenceInterval,
      lastThreeSprintsAverage
    };
  }

  /**
   * Identify patterns in successful sprint compositions
   */
  public identifySprintPatterns(sprints: SprintData[]): SprintPattern[] {
    const patterns: SprintPattern[] = [];
    const completedSprints = sprints.filter(s => s.status === 'COMPLETED');
    
    if (completedSprints.length < 2) return patterns;
    
    // Pattern 1: Successful point distribution
    const successfulSprints = completedSprints.filter(s => s.completionRate >= 0.8);
    if (successfulSprints.length > 0) {
      const pointDistribution = this.analyzePointDistribution(successfulSprints);
      patterns.push({
        patternType: 'COMPOSITION',
        description: `Successful sprints typically have ${pointDistribution.description}`,
        frequency: successfulSprints.length / completedSprints.length,
        successRate: successfulSprints.reduce((sum, s) => sum + s.completionRate, 0) / successfulSprints.length,
        conditions: pointDistribution.conditions,
        examples: successfulSprints.slice(0, 3).map(s => s.name)
      });
    }
    
    // Pattern 2: Epic composition patterns
    const epicPatterns = this.analyzeEpicPatterns(completedSprints);
    patterns.push(...epicPatterns);
    
    // Pattern 3: Ticket size patterns
    const sizePatterns = this.analyzeTicketSizePatterns(completedSprints);
    patterns.push(...sizePatterns);
    
    return patterns;
  }

  /**
   * Analyze epic performance
   */
  public analyzeEpics(allTickets: TicketData[]): EpicAnalysis[] {
    const epicMap = new Map<string, TicketData[]>();
    
    // Group tickets by epic
    for (const ticket of allTickets) {
      if (!epicMap.has(ticket.epic)) {
        epicMap.set(ticket.epic, []);
      }
      epicMap.get(ticket.epic)!.push(ticket);
    }
    
    const analyses: EpicAnalysis[] = [];
    
    for (const [epicName, tickets] of epicMap.entries()) {
      const completedTickets = tickets.filter(t => t.status === 'DONE');
      const averagePoints = this.calculateMean(tickets.map(t => t.points));
      
      // Estimate completion time (simplified)
      const averageCompletionTime = this.estimateCompletionTime(tickets);
      
      // Calculate success rate
      const successRate = tickets.length > 0 ? completedTickets.length / tickets.length : 0;
      
      // Identify common blockers (simplified - based on ticket type patterns)
      const commonBlockers = this.identifyCommonBlockers(tickets);
      
      analyses.push({
        epicName,
        totalTickets: tickets.length,
        completedTickets: completedTickets.length,
        averagePoints,
        averageCompletionTime,
        successRate,
        blockerFrequency: this.calculateBlockerFrequency(tickets),
        commonBlockers
      });
    }
    
    return analyses.sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Calculate statistical summary for a numeric array
   */
  public calculateStatistics(values: number[]): StatisticalSummary {
    if (values.length === 0) {
      return { mean: 0, median: 0, standardDeviation: 0, min: 0, max: 0 };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const mean = this.calculateMean(values);
    const median = this.calculateMedian(sorted);
    const standardDeviation = this.calculateStandardDeviation(values, mean);
    
    return {
      mean,
      median,
      standardDeviation,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      trend: this.calculateTrend(values)
    };
  }

  // Private helper methods

  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateMedian(sortedValues: number[]): number {
    if (sortedValues.length === 0) return 0;
    
    const mid = Math.floor(sortedValues.length / 2);
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
    }
    return sortedValues[mid];
  }

  private calculateStandardDeviation(values: number[], mean?: number): number {
    if (values.length === 0) return 0;
    
    const avg = mean !== undefined ? mean : this.calculateMean(values);
    const squaredDifferences = values.map(val => Math.pow(val - avg, 2));
    const variance = this.calculateMean(squaredDifferences);
    return Math.sqrt(variance);
  }

  private calculateTrend(values: number[]): 'INCREASING' | 'DECREASING' | 'STABLE' {
    if (values.length < 3) return 'STABLE';
    
    // Simple linear regression slope calculation
    const n = values.length;
    const sumX = (n * (n + 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * (index + 1), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6; // Sum of squared indices
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    const threshold = this.calculateMean(values) * 0.05; // 5% threshold
    
    if (slope > threshold) return 'INCREASING';
    if (slope < -threshold) return 'DECREASING';
    return 'STABLE';
  }

  private analyzePointDistribution(sprints: SprintData[]) {
    const distributions = sprints.map(sprint => {
      const tickets = sprint.tickets || [];
      return {
        small: tickets.filter(t => t.points <= 2).length,
        medium: tickets.filter(t => t.points >= 3 && t.points <= 5).length,
        large: tickets.filter(t => t.points >= 8).length,
        totalTickets: tickets.length
      };
    });
    
    const avgSmall = this.calculateMean(distributions.map(d => d.small));
    const avgMedium = this.calculateMean(distributions.map(d => d.medium));
    const avgLarge = this.calculateMean(distributions.map(d => d.large));
    
    return {
      description: `${Math.round(avgSmall)} small (1-2 pts), ${Math.round(avgMedium)} medium (3-5 pts), ${Math.round(avgLarge)} large (8+ pts) tickets`,
      conditions: [
        `Small tickets: ${Math.round(avgSmall)} ± 1`,
        `Medium tickets: ${Math.round(avgMedium)} ± 1`,
        `Large tickets: ${Math.round(avgLarge)} ± 1`
      ]
    };
  }

  private analyzeEpicPatterns(sprints: SprintData[]): SprintPattern[] {
    const patterns: SprintPattern[] = [];
    const epicCombinations = new Map<string, { count: number; totalSuccess: number; sprints: string[] }>();
    
    // Analyze epic combinations in successful sprints
    const successfulSprints = sprints.filter(s => s.completionRate >= 0.8);
    
    for (const sprint of successfulSprints) {
      const epics = [...new Set((sprint.tickets || []).map(t => t.epic))].sort().join('+');
      if (!epicCombinations.has(epics)) {
        epicCombinations.set(epics, { count: 0, totalSuccess: 0, sprints: [] });
      }
      const combo = epicCombinations.get(epics)!;
      combo.count++;
      combo.totalSuccess += sprint.completionRate;
      combo.sprints.push(sprint.name);
    }
    
    // Find frequent successful combinations
    for (const [epics, stats] of epicCombinations.entries()) {
      if (stats.count >= 2) { // Appeared in at least 2 sprints
        patterns.push({
          patternType: 'COMPOSITION',
          description: `Epic combination: ${epics} shows high success rate`,
          frequency: stats.count / successfulSprints.length,
          successRate: stats.totalSuccess / stats.count,
          conditions: [`Epic mix: ${epics}`],
          examples: stats.sprints
        });
      }
    }
    
    return patterns;
  }

  private analyzeTicketSizePatterns(sprints: SprintData[]): SprintPattern[] {
    const patterns: SprintPattern[] = [];
    const successfulSprints = sprints.filter(s => s.completionRate >= 0.8);
    
    if (successfulSprints.length === 0) return patterns;
    
    // Analyze ticket count patterns
    const ticketCounts = successfulSprints.map(s => (s.tickets || []).length);
    const avgTicketCount = this.calculateMean(ticketCounts);
    
    if (avgTicketCount > 0) {
      patterns.push({
        patternType: 'COMPOSITION',
        description: `Successful sprints typically contain ${Math.round(avgTicketCount)} ± 2 tickets`,
        frequency: 1.0,
        successRate: this.calculateMean(successfulSprints.map(s => s.completionRate)),
        conditions: [`Ticket count: ${Math.round(avgTicketCount - 2)} to ${Math.round(avgTicketCount + 2)}`],
        examples: successfulSprints.slice(0, 3).map(s => s.name)
      });
    }
    
    return patterns;
  }

  private estimateCompletionTime(tickets: TicketData[]): number {
    // Simplified estimation based on points and complexity
    const avgPoints = this.calculateMean(tickets.map(t => t.points));
    
    // Basic heuristic: more points = more time
    // Small tickets (1-2 pts): ~1-2 days
    // Medium tickets (3-5 pts): ~3-5 days  
    // Large tickets (8-13 pts): ~8-10 days
    if (avgPoints <= 2) return 1.5;
    if (avgPoints <= 5) return 4;
    return 9;
  }

  private identifyCommonBlockers(tickets: TicketData[]): string[] {
    const blockers: string[] = [];
    
    // Analyze ticket types for common blocking patterns
    const types = tickets.map(t => t.ticketType);
    const typeCounts = new Map<string, number>();
    
    for (const type of types) {
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    }
    
    // Identify dominant types that often cause delays
    if (typeCounts.get('SECURITY') && typeCounts.get('SECURITY')! > tickets.length * 0.3) {
      blockers.push('Security review complexity');
    }
    
    if (typeCounts.get('BUILD') && typeCounts.get('BUILD')! > tickets.length * 0.2) {
      blockers.push('Build system issues');
    }
    
    if (typeCounts.get('AGENT') && typeCounts.get('AGENT')! > tickets.length * 0.7) {
      blockers.push('Agent integration complexity');
    }
    
    return blockers;
  }

  private calculateBlockerFrequency(tickets: TicketData[]): number {
    // Simplified calculation based on ticket characteristics
    const problematicTypes = tickets.filter(t => 
      t.ticketType === 'SECURITY' || 
      t.ticketType === 'BUILD' || 
      t.points >= 8
    );
    
    return tickets.length > 0 ? problematicTypes.length / tickets.length : 0;
  }
}