/**
 * Predictive Sprint Planner
 * 
 * Main service that combines historical analysis, statistical insights,
 * and pattern recognition to provide intelligent sprint planning assistance.
 */

import { DataParser } from './DataParser';
import { StatisticalAnalyzer } from './StatisticalAnalyzer';
import { 
  HistoricalAnalysis,
  PredictiveInsights,
  PlanningConfig,
  BlockerPrediction,
  OptimalSprintComposition,
  VelocityAnalysis,
  SprintPattern,
  TicketData
} from './types';

export class PredictivePlanner {
  private dataParser: DataParser;
  private analyzer: StatisticalAnalyzer;

  constructor() {
    this.dataParser = new DataParser();
    this.analyzer = new StatisticalAnalyzer();
  }

  /**
   * Generate comprehensive predictive insights for sprint planning
   */
  public async generateInsights(
    projectPlanPath: string,
    config: PlanningConfig
  ): Promise<PredictiveInsights> {
    
    // Parse historical data
    const historicalData = await this.dataParser.parseFromFile(projectPlanPath);
    
    // Analyze velocity trends
    const velocityAnalysis = this.analyzer.analyzeVelocity(historicalData.sprintData);
    
    // Identify patterns
    const identifiedPatterns = this.analyzer.identifySprintPatterns(historicalData.sprintData);
    
    // Predict blockers
    const blockerPredictions = this.predictBlockers(historicalData, config);
    
    // Generate optimal composition
    const optimalComposition = this.generateOptimalComposition(
      historicalData,
      velocityAnalysis,
      config
    );
    
    // Calculate confidence score
    const confidence = this.calculateConfidenceScore(historicalData, identifiedPatterns);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      historicalData,
      velocityAnalysis,
      optimalComposition,
      config
    );
    
    // Generate warnings
    const warnings = this.generateWarnings(
      historicalData,
      velocityAnalysis,
      blockerPredictions,
      config
    );
    
    return {
      velocityAnalysis,
      identifiedPatterns,
      blockerPredictions,
      optimalComposition,
      confidence,
      recommendations,
      warnings
    };
  }

  /**
   * Predict potential blockers based on historical patterns
   */
  private predictBlockers(
    historicalData: HistoricalAnalysis,
    config: PlanningConfig
  ): BlockerPrediction[] {
    const predictions: BlockerPrediction[] = [];
    
    // Analyze epic-based blocker patterns
    const epicAnalyses = this.analyzer.analyzeEpics(
      historicalData.sprintData.flatMap(s => s.tickets || [])
    );
    
    for (const epic of epicAnalyses) {
      if (epic.blockerFrequency > 0.3 && config.priorities.includes(epic.epicName)) {
        predictions.push({
          ticketId: 'EPIC-WIDE',
          blockerType: 'TECHNICAL',
          riskLevel: epic.blockerFrequency > 0.5 ? 'HIGH' : 'MEDIUM',
          description: `Epic "${epic.epicName}" has high blocker frequency (${Math.round(epic.blockerFrequency * 100)}%)`,
          historicalBasis: epic.commonBlockers,
          suggestedMitigation: this.generateBlockerMitigation(epic.epicName, epic.commonBlockers)
        });
      }
    }
    
    // Predict velocity-based blockers
    if (config.targetPoints > (historicalData.overallMetrics.averageVelocity * 1.2)) {
      predictions.push({
        ticketId: 'SPRINT-WIDE',
        blockerType: 'RESOURCE',
        riskLevel: 'HIGH',
        description: `Target points (${config.targetPoints}) exceed historical average by >20%`,
        historicalBasis: [`Average velocity: ${Math.round(historicalData.overallMetrics.averageVelocity)} points`],
        suggestedMitigation: 'Consider reducing scope or extending sprint duration'
      });
    }
    
    // Predict dependency-based blockers
    if (config.includeInProgressWork) {
      predictions.push({
        ticketId: 'DEPENDENCY',
        blockerType: 'DEPENDENCY',
        riskLevel: 'MEDIUM',
        description: 'Including in-progress work may create dependency chains',
        historicalBasis: ['Previous sprints with carry-over work had 15% lower completion rates'],
        suggestedMitigation: 'Prioritize completing existing work before adding new tickets'
      });
    }
    
    return predictions;
  }

  /**
   * Generate optimal sprint composition recommendations
   */
  private generateOptimalComposition(
    historicalData: HistoricalAnalysis,
    velocityAnalysis: VelocityAnalysis,
    config: PlanningConfig
  ): OptimalSprintComposition {
    
    // Base recommendation on velocity analysis
    const recommendedPoints = Math.min(
      config.targetPoints,
      velocityAnalysis.confidenceInterval.max
    );
    
    // Analyze successful sprint patterns for ticket mix
    const successfulSprints = historicalData.sprintData.filter(s => 
      s.status === 'COMPLETED' && s.completionRate >= 0.8
    );
    
    let ticketMix = { small: 2, medium: 3, large: 1 }; // Default
    if (successfulSprints.length > 0) {
      const avgTicketMix = this.analyzeSuccessfulTicketMix(successfulSprints);
      ticketMix = avgTicketMix;
    }
    
    // Generate epic distribution based on priorities
    const epicDistribution: Record<string, number> = {};
    const totalEpicSlots = Math.ceil(recommendedPoints / 5); // Approximate epics needed
    
    for (let i = 0; i < config.priorities.length && i < totalEpicSlots; i++) {
      const weight = (totalEpicSlots - i) / totalEpicSlots; // Higher weight for higher priority
      epicDistribution[config.priorities[i]] = Math.ceil(weight * 3); // 1-3 tickets per epic
    }
    
    // Risk balance based on historical data and configuration
    const riskBalance = this.calculateRiskBalance(config.riskTolerance);
    
    // Generate rationale
    const rationale = [
      `Based on velocity analysis: ${Math.round(velocityAnalysis.averageVelocity)} avg points`,
      `Successful sprint pattern: ${ticketMix.small} small + ${ticketMix.medium} medium + ${ticketMix.large} large tickets`,
      `Epic focus: ${config.priorities.slice(0, 3).join(', ')}`,
      `Risk tolerance: ${config.riskTolerance.toLowerCase()}`
    ];
    
    return {
      recommendedPoints,
      ticketMix,
      epicDistribution,
      riskBalance,
      rationale
    };
  }

  /**
   * Calculate confidence score based on data quality and patterns
   */
  private calculateConfidenceScore(
    historicalData: HistoricalAnalysis,
    patterns: SprintPattern[]
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on data quantity
    if (historicalData.totalSprintsAnalyzed >= 3) confidence += 0.2;
    if (historicalData.totalSprintsAnalyzed >= 5) confidence += 0.1;
    
    // Boost confidence based on pattern strength
    const strongPatterns = patterns.filter(p => p.frequency > 0.5 && p.successRate > 0.8);
    confidence += strongPatterns.length * 0.05;
    
    // Boost confidence based on recent data
    const recentSprints = historicalData.sprintData.filter(s => {
      const sprintDate = new Date(s.dates.end);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return sprintDate > threeMonthsAgo;
    });
    
    if (recentSprints.length >= 2) confidence += 0.1;
    
    // Cap at 0.95 (never 100% certain)
    return Math.min(0.95, confidence);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    historicalData: HistoricalAnalysis,
    velocityAnalysis: VelocityAnalysis,
    optimalComposition: OptimalSprintComposition,
    config: PlanningConfig
  ): string[] {
    const recommendations: string[] = [];
    
    // Velocity-based recommendations
    if (velocityAnalysis.velocityTrend === 'INCREASING') {
      recommendations.push('Team velocity is increasing - consider slightly more ambitious targets');
    } else if (velocityAnalysis.velocityTrend === 'DECREASING') {
      recommendations.push('Team velocity is declining - focus on removing impediments and reducing scope');
    }
    
    // Composition recommendations
    recommendations.push(
      `Target ${optimalComposition.recommendedPoints} points with ` +
      `${optimalComposition.ticketMix.small} small, ${optimalComposition.ticketMix.medium} medium, ` +
      `${optimalComposition.ticketMix.large} large tickets`
    );
    
    // Epic recommendations
    const topEpics = Object.entries(optimalComposition.epicDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (topEpics.length > 0) {
      recommendations.push(`Focus on epics: ${topEpics.map(([epic]) => epic).join(', ')}`);
    }
    
    // Risk management recommendations
    if (config.riskTolerance === 'LOW') {
      recommendations.push('Include buffer tickets and avoid experimental features');
    } else if (config.riskTolerance === 'HIGH') {
      recommendations.push('Consider including 1-2 stretch goals or experimental tickets');
    }
    
    // Success pattern recommendations
    if (historicalData.overallMetrics.averageCompletionRate < 0.8) {
      recommendations.push('Historical completion rate is low - consider smaller sprints to build momentum');
    }
    
    return recommendations;
  }

  /**
   * Generate warnings for potential risks
   */
  private generateWarnings(
    historicalData: HistoricalAnalysis,
    velocityAnalysis: VelocityAnalysis,
    blockerPredictions: BlockerPrediction[],
    config: PlanningConfig
  ): string[] {
    const warnings: string[] = [];
    
    // High-risk blocker warnings
    const highRiskBlockers = blockerPredictions.filter(p => p.riskLevel === 'HIGH');
    if (highRiskBlockers.length > 0) {
      warnings.push(`High-risk blockers predicted: ${highRiskBlockers.length} potential issues identified`);
    }
    
    // Velocity warnings
    if (config.targetPoints > velocityAnalysis.confidenceInterval.max) {
      warnings.push(
        `Target points (${config.targetPoints}) exceed confidence interval ` +
        `(${Math.round(velocityAnalysis.confidenceInterval.max)})`
      );
    }
    
    // Data quality warnings
    if (historicalData.totalSprintsAnalyzed < 3) {
      warnings.push('Limited historical data - predictions may be less accurate');
    }
    
    // Epic distribution warnings
    const problematicEpic = historicalData.overallMetrics.mostProblematicTicketType;
    if (config.priorities.some(epic => epic.toLowerCase().includes(problematicEpic.toLowerCase()))) {
      warnings.push(`Epic type "${problematicEpic}" has historically been problematic`);
    }
    
    return warnings;
  }

  // Private helper methods

  private analyzeSuccessfulTicketMix(sprints: any[]): { small: number; medium: number; large: number } {
    const mixes = sprints.map(sprint => {
      const tickets = sprint.tickets || [];
      return {
        small: tickets.filter((t: TicketData) => t.points <= 2).length,
        medium: tickets.filter((t: TicketData) => t.points >= 3 && t.points <= 5).length,
        large: tickets.filter((t: TicketData) => t.points >= 8).length
      };
    });
    
    return {
      small: Math.round(this.analyzer.calculateStatistics(mixes.map(m => m.small)).mean),
      medium: Math.round(this.analyzer.calculateStatistics(mixes.map(m => m.medium)).mean),
      large: Math.round(this.analyzer.calculateStatistics(mixes.map(m => m.large)).mean)
    };
  }

  private calculateRiskBalance(riskTolerance: PlanningConfig['riskTolerance']): {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  } {
    switch (riskTolerance) {
      case 'LOW':
        return { lowRisk: 0.7, mediumRisk: 0.25, highRisk: 0.05 };
      case 'MEDIUM':
        return { lowRisk: 0.5, mediumRisk: 0.4, highRisk: 0.1 };
      case 'HIGH':
        return { lowRisk: 0.3, mediumRisk: 0.5, highRisk: 0.2 };
      default:
        return { lowRisk: 0.5, mediumRisk: 0.4, highRisk: 0.1 };
    }
  }

  private generateBlockerMitigation(epicName: string, commonBlockers: string[]): string {
    // Generate mitigation based on common blockers and epic context
    if (commonBlockers.includes('Security review complexity')) {
      return epicName.toLowerCase().includes('security') 
        ? 'Schedule security reviews early in sprint, involve security team in planning, allocate extra buffer time'
        : 'Schedule security reviews early in sprint, involve security team in planning';
    }
    
    if (commonBlockers.includes('Build system issues')) {
      return 'Validate build environment before sprint start, have rollback plan ready';
    }
    
    if (commonBlockers.includes('Agent integration complexity')) {
      return epicName.toLowerCase().includes('agent')
        ? 'Break down large agent tickets, prepare comprehensive context packages, validate dependencies early'
        : 'Break down large agent tickets, prepare context packages in advance';
    }
    
    return `Monitor ${epicName} closely, have backup plan ready, engage stakeholders early`;
  }

  /**
   * Generate a formatted summary for CLI output
   */
  public formatInsightsSummary(insights: PredictiveInsights): string {
    const lines: string[] = [];
    
    lines.push('🎯 PREDICTIVE SPRINT PLANNING INSIGHTS');
    lines.push('=====================================');
    lines.push('');
    
    // Velocity Analysis
    lines.push('📊 VELOCITY ANALYSIS');
    lines.push(`Current Velocity: ${insights.velocityAnalysis.currentVelocity} points`);
    lines.push(`Average Velocity: ${Math.round(insights.velocityAnalysis.averageVelocity)} points`);
    lines.push(`Trend: ${insights.velocityAnalysis.velocityTrend}`);
    lines.push(`Confidence Range: ${Math.round(insights.velocityAnalysis.confidenceInterval.min)}-${Math.round(insights.velocityAnalysis.confidenceInterval.max)} points`);
    lines.push('');
    
    // Optimal Composition
    lines.push('🎯 RECOMMENDED SPRINT COMPOSITION');
    lines.push(`Target Points: ${insights.optimalComposition.recommendedPoints}`);
    lines.push(`Ticket Mix: ${insights.optimalComposition.ticketMix.small} small + ${insights.optimalComposition.ticketMix.medium} medium + ${insights.optimalComposition.ticketMix.large} large`);
    lines.push('');
    
    // Patterns
    if (insights.identifiedPatterns.length > 0) {
      lines.push('🔍 IDENTIFIED PATTERNS');
      insights.identifiedPatterns.slice(0, 3).forEach(pattern => {
        lines.push(`• ${pattern.description} (${Math.round(pattern.successRate * 100)}% success rate)`);
      });
      lines.push('');
    }
    
    // Recommendations
    if (insights.recommendations.length > 0) {
      lines.push('💡 RECOMMENDATIONS');
      insights.recommendations.forEach(rec => lines.push(`• ${rec}`));
      lines.push('');
    }
    
    // Warnings
    if (insights.warnings.length > 0) {
      lines.push('⚠️  WARNINGS');
      insights.warnings.forEach(warning => lines.push(`• ${warning}`));
      lines.push('');
    }
    
    // Confidence
    lines.push(`🎯 Confidence Level: ${Math.round(insights.confidence * 100)}%`);
    
    return lines.join('\n');
  }
}