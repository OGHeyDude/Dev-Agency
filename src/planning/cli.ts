#!/usr/bin/env node
/**
 * CLI Interface for Predictive Sprint Planner
 * 
 * Simple command-line interface for testing and using the predictive
 * sprint planning functionality.
 */

import { PredictivePlanner } from './PredictivePlanner';
import { PlanningConfig } from './types';
import * as path from 'path';
import * as fs from 'fs';

interface CliOptions {
  projectPlan?: string;
  targetPoints?: number;
  riskTolerance?: 'LOW' | 'MEDIUM' | 'HIGH';
  sprintDuration?: number;
  priorities?: string[];
  includeInProgress?: boolean;
  output?: 'summary' | 'full' | 'json';
}

class PredictivePlannerCli {
  private planner: PredictivePlanner;

  constructor() {
    this.planner = new PredictivePlanner();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);
    
    try {
      // Validate project plan path
      const projectPlanPath = options.projectPlan || this.findProjectPlan();
      if (!fs.existsSync(projectPlanPath)) {
        console.error(`❌ PROJECT_PLAN.md not found at: ${projectPlanPath}`);
        this.showUsage();
        return;
      }

      // Prepare configuration
      const config: PlanningConfig = {
        targetPoints: options.targetPoints || 30,
        sprintDuration: options.sprintDuration || 2,
        teamCapacity: 1,
        riskTolerance: options.riskTolerance || 'MEDIUM',
        priorities: options.priorities || [
          'System Foundation',
          'Integration Framework', 
          'Performance Tracking',
          'Recipe Library',
          'Advanced Automation'
        ],
        includeInProgressWork: options.includeInProgress || false
      };

      console.log('🔍 Analyzing sprint data...\n');
      
      // Generate insights
      const insights = await this.planner.generateInsights(projectPlanPath, config);
      
      // Output results
      switch (options.output) {
        case 'json':
          console.log(JSON.stringify(insights, null, 2));
          break;
        case 'full':
          this.outputFullAnalysis(insights, config);
          break;
        case 'summary':
        default:
          console.log(this.planner.formatInsightsSummary(insights));
          break;
      }

    } catch (error) {
      console.error('❌ Error during analysis:', error instanceof Error ? error.message : error);
    }
  }

  private parseArgs(args: string[]): CliOptions {
    const options: CliOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--project-plan':
        case '-p':
          options.projectPlan = args[++i];
          break;
        case '--target-points':
        case '-t':
          options.targetPoints = parseInt(args[++i]);
          break;
        case '--risk':
        case '-r':
          const risk = args[++i].toUpperCase();
          if (['LOW', 'MEDIUM', 'HIGH'].includes(risk)) {
            options.riskTolerance = risk as 'LOW' | 'MEDIUM' | 'HIGH';
          }
          break;
        case '--duration':
        case '-d':
          options.sprintDuration = parseInt(args[++i]);
          break;
        case '--priorities':
          options.priorities = args[++i].split(',').map(s => s.trim());
          break;
        case '--include-in-progress':
          options.includeInProgress = true;
          break;
        case '--output':
        case '-o':
          const output = args[++i];
          if (['summary', 'full', 'json'].includes(output)) {
            options.output = output as 'summary' | 'full' | 'json';
          }
          break;
        case '--help':
        case '-h':
          this.showUsage();
          process.exit(0);
          break;
      }
    }
    
    return options;
  }

  private findProjectPlan(): string {
    // Try common locations
    const candidates = [
      './PROJECT_PLAN.md',
      './Project_Management/PROJECT_PLAN.md',
      '../Project_Management/PROJECT_PLAN.md',
      '/home/hd/Desktop/LAB/Dev-Agency/Project_Management/PROJECT_PLAN.md'
    ];
    
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return path.resolve(candidate);
      }
    }
    
    throw new Error('PROJECT_PLAN.md not found. Please specify with --project-plan');
  }

  private outputFullAnalysis(insights: any, config: PlanningConfig): void {
    console.log('📊 COMPREHENSIVE SPRINT PLANNING ANALYSIS');
    console.log('==========================================\n');
    
    // Configuration
    console.log('🎯 CONFIGURATION');
    console.log(`Target Points: ${config.targetPoints}`);
    console.log(`Sprint Duration: ${config.sprintDuration} weeks`);
    console.log(`Risk Tolerance: ${config.riskTolerance}`);
    console.log(`Priorities: ${config.priorities.slice(0, 3).join(', ')}`);
    console.log('');

    // Velocity Analysis
    console.log('📈 VELOCITY ANALYSIS');
    console.log(`Current Velocity: ${insights.velocityAnalysis.currentVelocity} points`);
    console.log(`Average Velocity: ${Math.round(insights.velocityAnalysis.averageVelocity)} points`);
    console.log(`Velocity Trend: ${insights.velocityAnalysis.velocityTrend}`);
    console.log(`Confidence Range: ${Math.round(insights.velocityAnalysis.confidenceInterval.min)}-${Math.round(insights.velocityAnalysis.confidenceInterval.max)} points`);
    console.log(`Last 3 Sprints Average: ${Math.round(insights.velocityAnalysis.lastThreeSprintsAverage)} points`);
    console.log('');

    // Patterns
    if (insights.identifiedPatterns.length > 0) {
      console.log('🔍 IDENTIFIED PATTERNS');
      insights.identifiedPatterns.forEach((pattern: any, index: number) => {
        console.log(`${index + 1}. ${pattern.description}`);
        console.log(`   Success Rate: ${Math.round(pattern.successRate * 100)}%`);
        console.log(`   Frequency: ${Math.round(pattern.frequency * 100)}% of sprints`);
        console.log('');
      });
    }

    // Blockers
    if (insights.blockerPredictions.length > 0) {
      console.log('⚠️  BLOCKER PREDICTIONS');
      insights.blockerPredictions.forEach((blocker: any) => {
        console.log(`${blocker.riskLevel}: ${blocker.description}`);
        console.log(`   Type: ${blocker.blockerType}`);
        console.log(`   Mitigation: ${blocker.suggestedMitigation}`);
        console.log('');
      });
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    insights.recommendations.forEach((rec: string, index: number) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log('');

    // Warnings
    if (insights.warnings.length > 0) {
      console.log('⚠️  WARNINGS');
      insights.warnings.forEach((warning: string) => {
        console.log(`• ${warning}`);
      });
      console.log('');
    }

    // Confidence
    console.log(`🎯 Overall Confidence: ${Math.round(insights.confidence * 100)}%`);
  }

  private showUsage(): void {
    console.log(`
🎯 Predictive Sprint Planner CLI

USAGE:
  npx predictive-planner [options]

OPTIONS:
  -p, --project-plan <path>    Path to PROJECT_PLAN.md file
  -t, --target-points <num>    Target sprint points (default: 30)
  -r, --risk <level>          Risk tolerance: LOW|MEDIUM|HIGH (default: MEDIUM)
  -d, --duration <weeks>      Sprint duration in weeks (default: 2)
  --priorities <list>         Comma-separated priority epics
  --include-in-progress       Include existing in-progress work
  -o, --output <format>       Output format: summary|full|json (default: summary)
  -h, --help                  Show this help

EXAMPLES:
  # Basic analysis
  npx predictive-planner

  # Custom target and risk
  npx predictive-planner -t 35 -r HIGH

  # Full analysis output
  npx predictive-planner -o full

  # JSON output for scripting
  npx predictive-planner -o json

  # Custom priorities
  npx predictive-planner --priorities "Security,Performance,Features"
`);
  }
}

// Main execution
if (require.main === module) {
  const cli = new PredictivePlannerCli();
  const args = process.argv.slice(2);
  
  cli.run(args).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { PredictivePlannerCli };