/**
 * Self-Improving Agent Learning Framework
 * Enables agents to learn from patterns and continuously improve
 */

import { EventEmitter } from 'events';
import { PerformanceMonitor } from './performance-monitor';
import { PatternExtractor } from './pattern-extractor';
import { PromptEvolver } from './prompt-evolver';
import { KnowledgeBase } from './knowledge-base';
import { ImprovementEngine } from './improvement-engine';

export interface LearningConfig {
  agent: string;
  learningEnabled: boolean;
  adaptationLevel: 'conservative' | 'moderate' | 'aggressive';
  performanceThreshold: number;
  evolutionStrategy: EvolutionStrategy;
  metrics: LearningMetrics;
}

export interface EvolutionStrategy {
  promptMutation: number; // 0-1 mutation rate
  contextPruning: boolean;
  patternMatching: boolean;
  crossLearning: boolean; // Learn from other agents
}

export interface LearningMetrics {
  successRate: number;
  avgExecutionTime: number;
  contextEfficiency: number;
  improvementRate: number;
}

export interface ExecutionPattern {
  id: string;
  agent: string;
  context: any;
  prompt: string;
  result: any;
  success: boolean;
  executionTime: number;
  timestamp: Date;
  features: Map<string, any>;
}

export interface LearningModel {
  agent: string;
  patterns: {
    successful: ExecutionPattern[];
    failed: ExecutionPattern[];
    optimal: ExecutionPattern[];
  };
  prompts: {
    base: string;
    variations: PromptVariation[];
    performance: PerformanceMetric[];
  };
  evolution: {
    generation: number;
    improvements: Improvement[];
    regressions: Regression[];
  };
  recommendations: {
    contextOptimizations: string[];
    promptRefinements: string[];
    strategyAdjustments: string[];
  };
}

export interface PromptVariation {
  id: string;
  prompt: string;
  generation: number;
  parentId: string | null;
  performance: PerformanceMetric;
  features: string[];
}

export interface PerformanceMetric {
  successRate: number;
  avgExecutionTime: number;
  contextSize: number;
  invocations: number;
  lastUsed: Date;
}

export interface Improvement {
  timestamp: Date;
  metric: string;
  before: number;
  after: number;
  change: number;
  description: string;
}

export interface Regression {
  timestamp: Date;
  metric: string;
  before: number;
  after: number;
  change: number;
  severity: 'low' | 'medium' | 'high';
}

export class LearningFramework extends EventEmitter {
  private agents: Map<string, LearningConfig> = new Map();
  private models: Map<string, LearningModel> = new Map();
  private performanceMonitor: PerformanceMonitor;
  private patternExtractor: PatternExtractor;
  private promptEvolver: PromptEvolver;
  private knowledgeBase: KnowledgeBase;
  private improvementEngine: ImprovementEngine;
  private learningEnabled: boolean = true;

  constructor() {
    super();
    this.performanceMonitor = new PerformanceMonitor();
    this.patternExtractor = new PatternExtractor();
    this.promptEvolver = new PromptEvolver();
    this.knowledgeBase = new KnowledgeBase();
    this.improvementEngine = new ImprovementEngine();
    
    this.setupEventHandlers();
  }

  /**
   * Register an agent for learning
   */
  public registerAgent(config: LearningConfig): void {
    this.agents.set(config.agent, config);
    
    if (!this.models.has(config.agent)) {
      this.models.set(config.agent, this.initializeModel(config.agent));
    }

    this.emit('agent:registered', { agent: config.agent });
  }

  /**
   * Track agent execution for learning
   */
  public async trackExecution(
    agent: string,
    context: any,
    prompt: string,
    result: any,
    executionTime: number,
    success: boolean
  ): Promise<void> {
    if (!this.learningEnabled || !this.agents.has(agent)) {
      return;
    }

    const pattern: ExecutionPattern = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agent,
      context,
      prompt,
      result,
      success,
      executionTime,
      timestamp: new Date(),
      features: this.extractFeatures(context, prompt, result)
    };

    // Track performance
    this.performanceMonitor.track(pattern);

    // Update model
    const model = this.models.get(agent)!;
    if (success) {
      model.patterns.successful.push(pattern);
      
      // Check if it's optimal
      if (this.isOptimalPattern(pattern, model)) {
        model.patterns.optimal.push(pattern);
      }
    } else {
      model.patterns.failed.push(pattern);
    }

    // Learn from pattern
    await this.learn(agent, pattern);

    // Emit tracking event
    this.emit('execution:tracked', { agent, pattern });
  }

  /**
   * Learn from execution pattern
   */
  private async learn(agent: string, pattern: ExecutionPattern): Promise<void> {
    const config = this.agents.get(agent)!;
    const model = this.models.get(agent)!;

    // Extract patterns
    const extractedPatterns = await this.patternExtractor.extract(
      pattern,
      model.patterns
    );

    // Update knowledge base
    this.knowledgeBase.store(agent, extractedPatterns);

    // Check if evolution is needed
    if (this.shouldEvolve(model, config)) {
      await this.evolve(agent, model, config);
    }

    // Generate recommendations
    model.recommendations = this.improvementEngine.generateRecommendations(
      model,
      extractedPatterns
    );

    this.emit('learning:complete', { agent, patterns: extractedPatterns.length });
  }

  /**
   * Evolve agent prompts based on learning
   */
  private async evolve(
    agent: string,
    model: LearningModel,
    config: LearningConfig
  ): Promise<void> {
    const currentGeneration = model.evolution.generation;

    // Generate new prompt variations
    const newVariations = await this.promptEvolver.evolve(
      model.prompts.base,
      model.patterns.optimal,
      config.evolutionStrategy
    );

    // Test variations
    const testedVariations = await this.testVariations(
      newVariations,
      model.patterns.successful.slice(-10) // Test on recent successes
    );

    // Select best variation
    const bestVariation = this.selectBestVariation(testedVariations, config);

    if (bestVariation && this.isImprovement(bestVariation, model)) {
      // Update model with new variation
      model.prompts.variations.push({
        ...bestVariation,
        generation: currentGeneration + 1,
        parentId: model.prompts.variations[model.prompts.variations.length - 1]?.id || null
      });

      model.evolution.generation++;

      // Track improvement
      const improvement: Improvement = {
        timestamp: new Date(),
        metric: 'success_rate',
        before: model.prompts.performance[model.prompts.performance.length - 1]?.successRate || 0,
        after: bestVariation.performance.successRate,
        change: bestVariation.performance.successRate - (model.prompts.performance[model.prompts.performance.length - 1]?.successRate || 0),
        description: `Generation ${currentGeneration + 1} prompt evolution`
      };

      model.evolution.improvements.push(improvement);
      
      this.emit('evolution:complete', { 
        agent, 
        generation: model.evolution.generation,
        improvement: improvement.change 
      });
    }
  }

  /**
   * Get optimized prompt for agent
   */
  public getOptimizedPrompt(agent: string): string {
    const model = this.models.get(agent);
    if (!model || model.prompts.variations.length === 0) {
      return model?.prompts.base || '';
    }

    // Get best performing variation
    const bestVariation = model.prompts.variations
      .sort((a, b) => b.performance.successRate - a.performance.successRate)[0];

    return bestVariation.prompt;
  }

  /**
   * Get learning insights for an agent
   */
  public getInsights(agent: string): LearningInsights {
    const model = this.models.get(agent);
    if (!model) {
      return {
        hasLearned: false,
        successPatterns: [],
        failurePatterns: [],
        improvements: [],
        recommendations: []
      };
    }

    const successPatterns = this.patternExtractor.summarizePatterns(
      model.patterns.successful
    );

    const failurePatterns = this.patternExtractor.summarizePatterns(
      model.patterns.failed
    );

    return {
      hasLearned: model.evolution.generation > 0,
      successPatterns,
      failurePatterns,
      improvements: model.evolution.improvements,
      recommendations: [
        ...model.recommendations.contextOptimizations,
        ...model.recommendations.promptRefinements,
        ...model.recommendations.strategyAdjustments
      ]
    };
  }

  /**
   * Cross-agent learning
   */
  public async crossLearn(sourceAgent: string, targetAgent: string): Promise<void> {
    const sourceModel = this.models.get(sourceAgent);
    const targetModel = this.models.get(targetAgent);

    if (!sourceModel || !targetModel) {
      return;
    }

    // Find transferable patterns
    const transferablePatterns = this.findTransferablePatterns(
      sourceModel.patterns.optimal,
      targetAgent
    );

    // Apply patterns to target agent
    for (const pattern of transferablePatterns) {
      await this.learn(targetAgent, {
        ...pattern,
        agent: targetAgent
      });
    }

    this.emit('cross-learning:complete', {
      source: sourceAgent,
      target: targetAgent,
      patterns: transferablePatterns.length
    });
  }

  /**
   * Reset learning for an agent
   */
  public resetAgent(agent: string): void {
    this.models.set(agent, this.initializeModel(agent));
    this.emit('agent:reset', { agent });
  }

  /**
   * Get performance metrics
   */
  public getMetrics(agent: string): LearningMetrics | null {
    const model = this.models.get(agent);
    if (!model) return null;

    const successRate = model.patterns.successful.length / 
      (model.patterns.successful.length + model.patterns.failed.length);

    const avgExecutionTime = [...model.patterns.successful, ...model.patterns.failed]
      .reduce((sum, p) => sum + p.executionTime, 0) / 
      (model.patterns.successful.length + model.patterns.failed.length);

    const contextEfficiency = this.calculateContextEfficiency(model);
    const improvementRate = this.calculateImprovementRate(model);

    return {
      successRate,
      avgExecutionTime,
      contextEfficiency,
      improvementRate
    };
  }

  // Private helper methods

  private initializeModel(agent: string): LearningModel {
    return {
      agent,
      patterns: {
        successful: [],
        failed: [],
        optimal: []
      },
      prompts: {
        base: '',
        variations: [],
        performance: []
      },
      evolution: {
        generation: 0,
        improvements: [],
        regressions: []
      },
      recommendations: {
        contextOptimizations: [],
        promptRefinements: [],
        strategyAdjustments: []
      }
    };
  }

  private extractFeatures(context: any, prompt: string, result: any): Map<string, any> {
    const features = new Map<string, any>();

    features.set('contextSize', JSON.stringify(context).length);
    features.set('promptLength', prompt.length);
    features.set('hasCode', prompt.includes('code') || prompt.includes('implement'));
    features.set('hasTest', prompt.includes('test'));
    features.set('resultSize', JSON.stringify(result).length);

    return features;
  }

  private isOptimalPattern(pattern: ExecutionPattern, model: LearningModel): boolean {
    // Pattern is optimal if it's in top 10% for execution time and successful
    const successfulPatterns = model.patterns.successful;
    if (successfulPatterns.length < 10) return pattern.success;

    const sortedByTime = successfulPatterns
      .sort((a, b) => a.executionTime - b.executionTime);
    
    const threshold = sortedByTime[Math.floor(sortedByTime.length * 0.1)].executionTime;
    return pattern.executionTime <= threshold;
  }

  private shouldEvolve(model: LearningModel, config: LearningConfig): boolean {
    // Evolve based on adaptation level and pattern count
    const minPatterns = {
      'conservative': 50,
      'moderate': 20,
      'aggressive': 10
    };

    const totalPatterns = model.patterns.successful.length + model.patterns.failed.length;
    return totalPatterns >= minPatterns[config.adaptationLevel] &&
           totalPatterns % minPatterns[config.adaptationLevel] === 0;
  }

  private async testVariations(
    variations: PromptVariation[],
    testPatterns: ExecutionPattern[]
  ): Promise<PromptVariation[]> {
    // Simulate testing variations against patterns
    return variations.map(variation => {
      const performance = this.simulatePerformance(variation, testPatterns);
      return {
        ...variation,
        performance
      };
    });
  }

  private simulatePerformance(
    variation: PromptVariation,
    patterns: ExecutionPattern[]
  ): PerformanceMetric {
    // Simulate performance based on variation features
    const baseSuccess = 0.7;
    const modifier = variation.features.length * 0.02;

    return {
      successRate: Math.min(baseSuccess + modifier, 0.95),
      avgExecutionTime: 5000 - variation.features.length * 100,
      contextSize: 10000 - variation.features.length * 500,
      invocations: 0,
      lastUsed: new Date()
    };
  }

  private selectBestVariation(
    variations: PromptVariation[],
    config: LearningConfig
  ): PromptVariation | null {
    if (variations.length === 0) return null;

    // Sort by success rate and execution time
    return variations.sort((a, b) => {
      const scoreA = a.performance.successRate * 100 - a.performance.avgExecutionTime / 1000;
      const scoreB = b.performance.successRate * 100 - b.performance.avgExecutionTime / 1000;
      return scoreB - scoreA;
    })[0];
  }

  private isImprovement(variation: PromptVariation, model: LearningModel): boolean {
    const currentPerformance = model.prompts.performance[model.prompts.performance.length - 1];
    if (!currentPerformance) return true;

    return variation.performance.successRate > currentPerformance.successRate ||
           (variation.performance.successRate === currentPerformance.successRate &&
            variation.performance.avgExecutionTime < currentPerformance.avgExecutionTime);
  }

  private findTransferablePatterns(
    patterns: ExecutionPattern[],
    targetAgent: string
  ): ExecutionPattern[] {
    // Find patterns that could apply to target agent
    return patterns.filter(pattern => {
      // Simple heuristic: patterns with generic features
      const features = pattern.features;
      return !features.has('agent-specific') && 
             features.get('contextSize') < 20000;
    });
  }

  private calculateContextEfficiency(model: LearningModel): number {
    const patterns = [...model.patterns.successful, ...model.patterns.failed];
    if (patterns.length === 0) return 0;

    const avgContextSize = patterns.reduce((sum, p) => 
      sum + (p.features.get('contextSize') || 0), 0
    ) / patterns.length;

    const avgResultSize = patterns.reduce((sum, p) => 
      sum + (p.features.get('resultSize') || 0), 0
    ) / patterns.length;

    return avgResultSize > 0 ? avgResultSize / avgContextSize : 0;
  }

  private calculateImprovementRate(model: LearningModel): number {
    if (model.evolution.improvements.length === 0) return 0;

    const totalImprovement = model.evolution.improvements.reduce((sum, imp) => 
      sum + imp.change, 0
    );

    return totalImprovement / model.evolution.generation;
  }

  private setupEventHandlers(): void {
    this.performanceMonitor.on('threshold:exceeded', (data) => {
      this.emit('performance:alert', data);
    });

    this.patternExtractor.on('pattern:found', (pattern) => {
      this.emit('pattern:discovered', pattern);
    });

    this.promptEvolver.on('evolution:success', (data) => {
      this.emit('prompt:evolved', data);
    });
  }
}

export interface LearningInsights {
  hasLearned: boolean;
  successPatterns: string[];
  failurePatterns: string[];
  improvements: Improvement[];
  recommendations: string[];
}

export default LearningFramework;