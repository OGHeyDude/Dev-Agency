/**
 * Predictive Sprint Planning Service
 * 
 * Entry point for the predictive sprint planning system.
 * Provides intelligent analysis and recommendations for sprint planning.
 */

export { PredictivePlanner } from './PredictivePlanner';
export { DataParser } from './DataParser';
export { StatisticalAnalyzer } from './StatisticalAnalyzer';

export * from './types';

// Convenience function for quick analysis
import { PredictivePlanner } from './PredictivePlanner';
import { PlanningConfig } from './types';

/**
 * Quick analysis function for use in scripts or agents
 */
export async function analyzeSprint(
  projectPlanPath: string, 
  config?: Partial<PlanningConfig>
) {
  const planner = new PredictivePlanner();
  
  const defaultConfig: PlanningConfig = {
    targetPoints: 30,
    sprintDuration: 2,
    teamCapacity: 1,
    riskTolerance: 'MEDIUM',
    priorities: ['System Foundation', 'Integration Framework', 'Performance Tracking'],
    includeInProgressWork: false,
    ...config
  };
  
  const insights = await planner.generateInsights(projectPlanPath, defaultConfig);
  return {
    insights,
    summary: planner.formatInsightsSummary(insights)
  };
}

/**
 * Validate PROJECT_PLAN.md structure for analysis
 */
export function validateProjectPlanStructure(content: string): {
  valid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check for required sections
  if (!content.includes('## **2. Current Sprint**')) {
    issues.push('Missing "Current Sprint" section');
  }
  
  if (!content.includes('### **Previous Sprints (Completed)**')) {
    issues.push('Missing "Previous Sprints" section');
  }
  
  if (!content.includes('## **4. Backlog (All Tickets)**')) {
    issues.push('Missing "Backlog" section');
  }
  
  // Check for sprint data patterns
  const sprintMatches = content.match(/Sprint \d+.*\(\d+\/\d+ points completed - \d+%\)/g);
  if (!sprintMatches || sprintMatches.length < 2) {
    suggestions.push('More historical sprint data would improve prediction accuracy');
  }
  
  // Check for ticket status patterns
  const statusMatches = content.match(/`(BACKLOG|TODO|IN_PROGRESS|DONE|CANCELLED)`/g);
  if (!statusMatches || statusMatches.length < 5) {
    suggestions.push('More diverse ticket statuses would improve analysis');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}