/**
 * Predictive Sprint Planning Types
 * 
 * Core interfaces and types for analyzing historical sprint data
 * and providing predictive insights for sprint planning.
 */

export interface SprintData {
  sprintNumber: number;
  name: string;
  dates: {
    start: string;
    end: string;
  };
  totalPoints: number;
  completedPoints: number;
  completionRate: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  tickets: TicketData[];
  phases?: SprintPhase[];
}

export interface TicketData {
  id: string;
  title: string;
  epic: string;
  points: number;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'QA_TESTING' | 'DOCUMENTATION' | 'READY_FOR_RELEASE' | 'DONE' | 'CANCELLED';
  completionDate?: string;
  blockers?: string[];
  dependencies?: string[];
  ticketType: 'AGENT' | 'SECURITY' | 'BUILD' | 'PERF' | 'OTHER';
}

export interface SprintPhase {
  name: string;
  tickets: string[];
  totalPoints: number;
  completedPoints?: number;
  week: number;
}

export interface VelocityAnalysis {
  currentVelocity: number;
  averageVelocity: number;
  velocityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  confidenceInterval: {
    min: number;
    max: number;
  };
  lastThreeSprintsAverage: number;
}

export interface SprintPattern {
  patternType: 'COMPOSITION' | 'SEQUENCE' | 'BLOCKER' | 'SUCCESS_FACTOR';
  description: string;
  frequency: number;
  successRate: number;
  conditions: string[];
  examples: string[];
}

export interface BlockerPrediction {
  ticketId: string;
  blockerType: 'DEPENDENCY' | 'TECHNICAL' | 'EXTERNAL' | 'KNOWLEDGE' | 'RESOURCE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  historicalBasis: string[];
  suggestedMitigation: string;
}

export interface OptimalSprintComposition {
  recommendedPoints: number;
  ticketMix: {
    small: number; // 1-2 points
    medium: number; // 3-5 points
    large: number; // 8-13 points
  };
  epicDistribution: Record<string, number>;
  riskBalance: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
  rationale: string[];
}

export interface PredictiveInsights {
  velocityAnalysis: VelocityAnalysis;
  identifiedPatterns: SprintPattern[];
  blockerPredictions: BlockerPrediction[];
  optimalComposition: OptimalSprintComposition;
  confidence: number; // 0-1 scale
  recommendations: string[];
  warnings: string[];
}

export interface HistoricalAnalysis {
  totalSprintsAnalyzed: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  overallMetrics: {
    averageCompletionRate: number;
    averageVelocity: number;
    mostSuccessfulEpic: string;
    mostProblematicTicketType: string;
  };
  sprintData: SprintData[];
}

export interface PlanningConfig {
  targetPoints: number;
  sprintDuration: number; // weeks
  teamCapacity: number;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  priorities: string[]; // Epic names in priority order
  excludeTicketTypes?: string[];
  includeInProgressWork: boolean;
}

export interface StatisticalSummary {
  mean: number;
  median: number;
  standardDeviation: number;
  min: number;
  max: number;
  trend?: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export interface EpicAnalysis {
  epicName: string;
  totalTickets: number;
  completedTickets: number;
  averagePoints: number;
  averageCompletionTime: number; // days
  successRate: number;
  blockerFrequency: number;
  commonBlockers: string[];
}