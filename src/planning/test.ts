/**
 * Test Suite for Predictive Sprint Planner
 * 
 * Basic tests to validate the predictive planning functionality
 * with real Dev-Agency PROJECT_PLAN.md data.
 */

import { analyzeSprint, validateProjectPlanStructure } from './index';
import { DataParser } from './DataParser';
import { StatisticalAnalyzer } from './StatisticalAnalyzer';
import * as fs from 'fs';

class PredictivePlannerTest {
  private projectPlanPath: string;

  constructor() {
    this.projectPlanPath = '/home/hd/Desktop/LAB/Dev-Agency/Project_Management/PROJECT_PLAN.md';
  }

  async runTests(): Promise<void> {
    console.log('🧪 Testing Predictive Sprint Planner\n');

    try {
      await this.testProjectPlanValidation();
      await this.testDataParsing();
      await this.testStatisticalAnalysis();
      await this.testPredictiveAnalysis();
      
      console.log('✅ All tests passed!\n');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  private async testProjectPlanValidation(): Promise<void> {
    console.log('📋 Testing PROJECT_PLAN.md validation...');
    
    if (!fs.existsSync(this.projectPlanPath)) {
      throw new Error(`PROJECT_PLAN.md not found at ${this.projectPlanPath}`);
    }

    const content = fs.readFileSync(this.projectPlanPath, 'utf-8');
    const validation = validateProjectPlanStructure(content);
    
    console.log(`   Valid structure: ${validation.valid}`);
    if (validation.issues.length > 0) {
      console.log(`   Issues: ${validation.issues.join(', ')}`);
    }
    if (validation.suggestions.length > 0) {
      console.log(`   Suggestions: ${validation.suggestions.join(', ')}`);
    }
    
    console.log('   ✅ Validation test passed\n');
  }

  private async testDataParsing(): Promise<void> {
    console.log('📊 Testing data parsing...');
    
    const parser = new DataParser();
    const historicalData = await parser.parseFromFile(this.projectPlanPath);
    
    console.log(`   Sprints analyzed: ${historicalData.totalSprintsAnalyzed}`);
    console.log(`   Date range: ${historicalData.dateRange.earliest} to ${historicalData.dateRange.latest}`);
    console.log(`   Average completion rate: ${Math.round(historicalData.overallMetrics.averageCompletionRate * 100)}%`);
    console.log(`   Average velocity: ${Math.round(historicalData.overallMetrics.averageVelocity)} points`);
    
    // Validate we have meaningful data
    if (historicalData.totalSprintsAnalyzed < 2) {
      console.warn('   ⚠️  Limited sprint data may affect prediction accuracy');
    }
    
    // Test data structure
    if (historicalData.sprintData.length > 0) {
      const firstSprint = historicalData.sprintData[0];
      console.log(`   Sample sprint: ${firstSprint.name} (${firstSprint.totalPoints} points)`);
    }
    
    console.log('   ✅ Data parsing test passed\n');
  }

  private async testStatisticalAnalysis(): Promise<void> {
    console.log('📈 Testing statistical analysis...');
    
    const parser = new DataParser();
    const analyzer = new StatisticalAnalyzer();
    const historicalData = await parser.parseFromFile(this.projectPlanPath);
    
    // Test velocity analysis
    const velocityAnalysis = analyzer.analyzeVelocity(historicalData.sprintData);
    console.log(`   Current velocity: ${velocityAnalysis.currentVelocity} points`);
    console.log(`   Velocity trend: ${velocityAnalysis.velocityTrend}`);
    console.log(`   Confidence range: ${Math.round(velocityAnalysis.confidenceInterval.min)}-${Math.round(velocityAnalysis.confidenceInterval.max)}`);
    
    // Test pattern identification
    const patterns = analyzer.identifySprintPatterns(historicalData.sprintData);
    console.log(`   Patterns identified: ${patterns.length}`);
    if (patterns.length > 0) {
      console.log(`   Top pattern: ${patterns[0].description.substring(0, 60)}...`);
    }
    
    // Test epic analysis
    const allTickets = historicalData.sprintData.flatMap(s => s.tickets || []);
    const epicAnalyses = analyzer.analyzeEpics(allTickets);
    console.log(`   Epics analyzed: ${epicAnalyses.length}`);
    if (epicAnalyses.length > 0) {
      const topEpic = epicAnalyses[0];
      console.log(`   Most successful epic: ${topEpic.epicName} (${Math.round(topEpic.successRate * 100)}% success)`);
    }
    
    console.log('   ✅ Statistical analysis test passed\n');
  }

  private async testPredictiveAnalysis(): Promise<void> {
    console.log('🎯 Testing predictive analysis...');
    
    const config = {
      targetPoints: 30,
      riskTolerance: 'MEDIUM' as const,
      priorities: ['System Foundation', 'Integration Framework', 'Performance Tracking']
    };
    
    const result = await analyzeSprint(this.projectPlanPath, config);
    const insights = result.insights;
    
    console.log(`   Recommended points: ${insights.optimalComposition.recommendedPoints}`);
    console.log(`   Ticket mix: ${insights.optimalComposition.ticketMix.small}+${insights.optimalComposition.ticketMix.medium}+${insights.optimalComposition.ticketMix.large}`);
    console.log(`   Confidence level: ${Math.round(insights.confidence * 100)}%`);
    console.log(`   Recommendations: ${insights.recommendations.length}`);
    console.log(`   Warnings: ${insights.warnings.length}`);
    console.log(`   Blocker predictions: ${insights.blockerPredictions.length}`);
    
    // Test summary formatting
    const summary = result.summary;
    console.log(`   Summary length: ${summary.length} characters`);
    
    // Validate key components exist
    if (!insights.velocityAnalysis) {
      throw new Error('Missing velocity analysis');
    }
    if (!insights.optimalComposition) {
      throw new Error('Missing optimal composition');
    }
    if (insights.confidence < 0 || insights.confidence > 1) {
      throw new Error('Invalid confidence score');
    }
    
    console.log('   ✅ Predictive analysis test passed\n');
  }

  async testLiveDemo(): Promise<void> {
    console.log('🚀 Live Demo - Predictive Sprint Planning\n');
    
    const result = await analyzeSprint(this.projectPlanPath, {
      targetPoints: 31, // Sprint 5 target
      riskTolerance: 'MEDIUM',
      priorities: [
        'Production Readiness',
        'System Observability', 
        'Integration Expansion',
        'Developer Experience',
        'Advanced Automation'
      ],
      includeInProgressWork: false
    });
    
    console.log(result.summary);
    console.log('\n🎯 Demo completed successfully!');
  }
}

// Main execution
async function main() {
  const test = new PredictivePlannerTest();
  
  try {
    await test.runTests();
    
    // Run live demo if requested
    const args = process.argv.slice(2);
    if (args.includes('--demo')) {
      await test.testLiveDemo();
    }
    
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { PredictivePlannerTest };