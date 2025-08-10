/**
 * Agent Selection Assistant - Intelligent agent recommendation system
 * 
 * @file AgentSelector.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from '../utils/Logger';
import { AgentManager } from './AgentManager';
import { RecipeEngine } from './RecipeEngine';

export interface TaskAnalysis {
  type: 'feature' | 'bug' | 'refactor' | 'security' | 'performance' | 'documentation' | 'architecture' | 'integration';
  complexity: 'simple' | 'medium' | 'complex';
  components: string[];
  keywords: string[];
  domains: string[];
}

export interface AgentCapability {
  name: string;
  description: string;
  capabilities: string[];
  specializations: string[];
  complexity_handling: 'simple' | 'medium' | 'complex' | 'all';
  typical_use_cases: string[];
}

export interface AgentRecommendation {
  agents: string[];
  recipe?: string;
  confidence: number;
  reasoning: string;
  workflow_steps: Array<{
    step: number;
    agent: string;
    purpose: string;
  }>;
  estimated_complexity: 'simple' | 'medium' | 'complex';
}

export interface SelectionOptions {
  maxAgents?: number;
  includeRecipes?: boolean;
  preferredComplexity?: 'simple' | 'medium' | 'complex';
  excludeAgents?: string[];
}

export class AgentSelector {
  private logger = Logger.create({ component: 'AgentSelector' });
  private agentManager: AgentManager;
  private recipeEngine: RecipeEngine;
  private agentCapabilities: Map<string, AgentCapability>;
  private taskPatterns: Array<{
    pattern: RegExp;
    type: TaskAnalysis['type'];
    keywords: string[];
    complexity: TaskAnalysis['complexity'];
  }>;

  constructor() {
    this.agentManager = new AgentManager();
    this.recipeEngine = new RecipeEngine();
    this.agentCapabilities = new Map();
    this.taskPatterns = this.initializeTaskPatterns();
    this.initializeAgentCapabilities();
  }

  /**
   * Initialize task pattern recognition
   */
  private initializeTaskPatterns(): Array<{
    pattern: RegExp;
    type: TaskAnalysis['type'];
    keywords: string[];
    complexity: TaskAnalysis['complexity'];
  }> {
    return [
      // Feature patterns
      {
        pattern: /implement|create|add|build|develop.*feature/i,
        type: 'feature',
        keywords: ['implement', 'create', 'feature', 'build', 'develop'],
        complexity: 'medium'
      },
      {
        pattern: /user\s+auth|authentication|login|signup|registration/i,
        type: 'feature',
        keywords: ['auth', 'authentication', 'login', 'security'],
        complexity: 'complex'
      },
      {
        pattern: /payment|billing|checkout|stripe|paypal/i,
        type: 'feature',
        keywords: ['payment', 'billing', 'financial', 'security'],
        complexity: 'complex'
      },
      {
        pattern: /api|endpoint|rest|graphql/i,
        type: 'feature',
        keywords: ['api', 'backend', 'integration'],
        complexity: 'medium'
      },

      // Bug patterns
      {
        pattern: /fix|bug|issue|error|broken|not\s+working/i,
        type: 'bug',
        keywords: ['fix', 'debug', 'issue', 'error'],
        complexity: 'simple'
      },
      {
        pattern: /crash|exception|memory\s+leak|performance\s+issue/i,
        type: 'bug',
        keywords: ['crash', 'performance', 'memory', 'critical'],
        complexity: 'complex'
      },

      // Security patterns
      {
        pattern: /security|audit|vulnerability|exploit|csrf|xss|sql\s+injection/i,
        type: 'security',
        keywords: ['security', 'audit', 'vulnerability'],
        complexity: 'complex'
      },

      // Performance patterns
      {
        pattern: /optimize|performance|slow|speed|cache|memory/i,
        type: 'performance',
        keywords: ['optimize', 'performance', 'speed', 'cache'],
        complexity: 'medium'
      },

      // Documentation patterns
      {
        pattern: /document|readme|guide|tutorial|api\s+docs/i,
        type: 'documentation',
        keywords: ['document', 'guide', 'readme', 'docs'],
        complexity: 'simple'
      },

      // Architecture patterns
      {
        pattern: /architecture|design|system|structure|refactor.*structure/i,
        type: 'architecture',
        keywords: ['architecture', 'design', 'system', 'structure'],
        complexity: 'complex'
      },

      // Integration patterns
      {
        pattern: /integrate|connect|webhook|mcp|plugin/i,
        type: 'integration',
        keywords: ['integrate', 'connect', 'plugin', 'service'],
        complexity: 'medium'
      },

      // Refactor patterns
      {
        pattern: /refactor|cleanup|reorganize|improve\s+code/i,
        type: 'refactor',
        keywords: ['refactor', 'cleanup', 'improve'],
        complexity: 'medium'
      }
    ];
  }

  /**
   * Initialize agent capabilities matrix
   */
  private initializeAgentCapabilities(): void {
    const capabilities: AgentCapability[] = [
      {
        name: 'architect',
        description: 'System design, architecture planning, and technical specifications',
        capabilities: ['system-design', 'architecture', 'planning', 'technical-specs'],
        specializations: ['complex-systems', 'scalability', 'technology-selection', 'sprint-planning'],
        complexity_handling: 'all',
        typical_use_cases: ['new features', 'system design', 'refactoring architecture', 'sprint planning']
      },
      {
        name: 'coder',
        description: 'General-purpose code implementation and development',
        capabilities: ['implementation', 'coding', 'refactoring', 'clean-code'],
        specializations: ['features', 'bug-fixes', 'optimization', 'patterns'],
        complexity_handling: 'all',
        typical_use_cases: ['feature implementation', 'bug fixes', 'code refactoring', 'general development']
      },
      {
        name: 'tester',
        description: 'QA testing, validation, and debugging',
        capabilities: ['testing', 'debugging', 'validation', 'quality-assurance'],
        specializations: ['unit-tests', 'integration-tests', 'debugging', 'test-automation'],
        complexity_handling: 'all',
        typical_use_cases: ['test creation', 'bug investigation', 'quality validation', 'debugging']
      },
      {
        name: 'security',
        description: 'Security audits, vulnerability assessment, and compliance',
        capabilities: ['security-audit', 'vulnerability-assessment', 'compliance', 'secure-coding'],
        specializations: ['authentication', 'authorization', 'data-protection', 'audit'],
        complexity_handling: 'complex',
        typical_use_cases: ['security reviews', 'vulnerability fixes', 'compliance audits', 'secure implementations']
      },
      {
        name: 'performance',
        description: 'Performance optimization and profiling',
        capabilities: ['optimization', 'profiling', 'benchmarking', 'caching'],
        specializations: ['memory-optimization', 'speed-optimization', 'caching-strategies', 'monitoring'],
        complexity_handling: 'medium',
        typical_use_cases: ['performance optimization', 'bottleneck analysis', 'caching implementation', 'monitoring']
      },
      {
        name: 'documenter',
        description: 'Technical and user documentation creation',
        capabilities: ['documentation', 'guides', 'api-docs', 'tutorials'],
        specializations: ['user-guides', 'api-documentation', 'technical-writing', 'examples'],
        complexity_handling: 'simple',
        typical_use_cases: ['API documentation', 'user guides', 'technical documentation', 'examples']
      },
      {
        name: 'mcp-dev',
        description: 'Model Context Protocol implementation specialist',
        capabilities: ['mcp-protocol', 'tool-creation', 'server-development', 'integration'],
        specializations: ['mcp-servers', 'tool-definitions', 'protocol-implementation', 'debugging'],
        complexity_handling: 'complex',
        typical_use_cases: ['MCP server development', 'tool implementations', 'protocol integration', 'MCP debugging']
      },
      {
        name: 'integration',
        description: 'Service integration and API connections',
        capabilities: ['api-integration', 'service-connections', 'webhooks', 'data-sync'],
        specializations: ['rest-apis', 'graphql', 'webhooks', 'third-party-services'],
        complexity_handling: 'medium',
        typical_use_cases: ['API integrations', 'webhook implementations', 'service connections', 'data synchronization']
      },
      {
        name: 'hooks',
        description: 'Hooks, middleware, and plugin development',
        capabilities: ['hooks', 'middleware', 'plugins', 'event-handling'],
        specializations: ['lifecycle-hooks', 'middleware-chains', 'plugin-architecture', 'event-systems'],
        complexity_handling: 'medium',
        typical_use_cases: ['hook implementations', 'middleware development', 'plugin systems', 'event handling']
      }
    ];

    capabilities.forEach(cap => {
      this.agentCapabilities.set(cap.name, cap);
    });
  }

  /**
   * Analyze task description to extract key information
   */
  public analyzeTask(taskDescription: string): TaskAnalysis {
    const normalizedTask = taskDescription.toLowerCase().trim();
    const words = normalizedTask.split(/\s+/);
    
    // Find matching patterns
    let taskType: TaskAnalysis['type'] = 'feature'; // default
    let complexity: TaskAnalysis['complexity'] = 'medium'; // default
    let keywords: string[] = [];
    let components: string[] = [];
    let domains: string[] = [];

    // Pattern matching
    for (const pattern of this.taskPatterns) {
      if (pattern.pattern.test(taskDescription)) {
        taskType = pattern.type;
        complexity = pattern.complexity;
        keywords = [...keywords, ...pattern.keywords];
        break;
      }
    }

    // Extract components
    const componentKeywords = [
      'frontend', 'backend', 'database', 'api', 'ui', 'server',
      'client', 'web', 'mobile', 'desktop', 'cli', 'service'
    ];
    components = words.filter(word => componentKeywords.includes(word));

    // Extract domains
    const domainKeywords = [
      'authentication', 'payment', 'user', 'admin', 'dashboard',
      'reporting', 'analytics', 'notification', 'email', 'chat'
    ];
    domains = words.filter(word => domainKeywords.includes(word));

    // Complexity adjustments based on keywords
    const complexityIndicators = {
      complex: ['architecture', 'system', 'complex', 'enterprise', 'scalable', 'distributed', 'microservice'],
      simple: ['simple', 'basic', 'quick', 'minor', 'small', 'fix']
    };

    for (const word of words) {
      if (complexityIndicators.complex.includes(word)) {
        complexity = 'complex';
        break;
      } else if (complexityIndicators.simple.includes(word)) {
        complexity = 'simple';
      }
    }

    return {
      type: taskType,
      complexity,
      components,
      keywords: [...new Set(keywords)], // Remove duplicates
      domains
    };
  }

  /**
   * Score agents based on task analysis
   */
  private scoreAgents(analysis: TaskAnalysis): Array<{ agent: string; score: number; reasoning: string[] }> {
    const scores: Array<{ agent: string; score: number; reasoning: string[] }> = [];

    for (const [agentName, capability] of this.agentCapabilities) {
      let score = 0;
      const reasoning: string[] = [];

      // Base score for task type alignment
      if (this.isAgentSuitableForTaskType(agentName, analysis.type)) {
        score += 30;
        reasoning.push(`Suitable for ${analysis.type} tasks`);
      }

      // Complexity handling
      if (capability.complexity_handling === 'all' || 
          capability.complexity_handling === analysis.complexity) {
        score += 20;
        reasoning.push(`Can handle ${analysis.complexity} complexity`);
      } else if (capability.complexity_handling === 'complex' && analysis.complexity === 'medium') {
        score += 10;
        reasoning.push(`Can handle medium complexity (specializes in complex)`);
      }

      // Keyword matching
      const keywordMatches = analysis.keywords.filter(keyword => 
        capability.capabilities.some(cap => cap.includes(keyword)) ||
        capability.specializations.some(spec => spec.includes(keyword))
      );
      score += keywordMatches.length * 5;
      if (keywordMatches.length > 0) {
        reasoning.push(`Matches keywords: ${keywordMatches.join(', ')}`);
      }

      // Domain expertise
      const domainMatches = analysis.domains.filter(domain =>
        capability.specializations.some(spec => spec.includes(domain))
      );
      score += domainMatches.length * 10;
      if (domainMatches.length > 0) {
        reasoning.push(`Domain expertise: ${domainMatches.join(', ')}`);
      }

      scores.push({ agent: agentName, score, reasoning });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Check if agent is suitable for task type
   */
  private isAgentSuitableForTaskType(agentName: string, taskType: TaskAnalysis['type']): boolean {
    const suitabilityMatrix: Record<string, TaskAnalysis['type'][]> = {
      'architect': ['architecture', 'feature', 'refactor', 'integration'],
      'coder': ['feature', 'bug', 'refactor', 'integration'],
      'tester': ['bug', 'feature', 'performance'],
      'security': ['security', 'feature', 'bug'],
      'performance': ['performance', 'bug', 'refactor'],
      'documenter': ['documentation', 'feature'],
      'mcp-dev': ['integration', 'feature'],
      'integration': ['integration', 'feature'],
      'hooks': ['feature', 'integration', 'refactor']
    };

    return suitabilityMatrix[agentName]?.includes(taskType) || false;
  }

  /**
   * Find suitable recipes based on task analysis
   */
  private async findSuitableRecipes(analysis: TaskAnalysis): Promise<Array<{ name: string; confidence: number }>> {
    try {
      const recipes = await this.recipeEngine.listRecipes();
      const suitableRecipes: Array<{ name: string; confidence: number }> = [];

      const recipePatterns: Record<string, { patterns: RegExp[]; taskTypes: TaskAnalysis['type'][] }> = {
        'full_stack_feature_recipe': {
          patterns: [/full.stack|feature|implement.*feature/i],
          taskTypes: ['feature']
        },
        'api_feature_recipe': {
          patterns: [/api|endpoint|rest|graphql/i],
          taskTypes: ['feature', 'integration']
        },
        'bug_fix_recipe': {
          patterns: [/bug|fix|issue|error/i],
          taskTypes: ['bug']
        },
        'security_audit_recipe': {
          patterns: [/security|audit|vulnerability/i],
          taskTypes: ['security']
        },
        'performance_optimization_recipe': {
          patterns: [/performance|optimize|slow|speed/i],
          taskTypes: ['performance']
        },
        'mcp_server_recipe': {
          patterns: [/mcp|model.context.protocol|server/i],
          taskTypes: ['integration', 'feature']
        },
        'complex_refactoring_workflow': {
          patterns: [/refactor|cleanup|restructure/i],
          taskTypes: ['refactor']
        }
      };

      for (const recipe of recipes) {
        const pattern = recipePatterns[recipe.name];
        if (!pattern) continue;

        let confidence = 0;

        // Task type match
        if (pattern.taskTypes.includes(analysis.type)) {
          confidence += 40;
        }

        // Pattern matching in task description
        const taskDescription = analysis.keywords.join(' ');
        for (const regex of pattern.patterns) {
          if (regex.test(taskDescription)) {
            confidence += 30;
            break;
          }
        }

        // Complexity bonus
        if (analysis.complexity === 'complex') {
          confidence += 10;
        }

        if (confidence > 30) {
          suitableRecipes.push({ name: recipe.name, confidence });
        }
      }

      return suitableRecipes.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      this.logger.warn('Failed to load recipes for recommendation:', error);
      return [];
    }
  }

  /**
   * Create workflow steps from selected agents
   */
  private createWorkflowSteps(agents: string[], taskType: TaskAnalysis['type']): Array<{
    step: number;
    agent: string;
    purpose: string;
  }> {
    const workflowPurposes: Record<string, string> = {
      'architect': 'System design and technical planning',
      'security': 'Security review and compliance check',
      'coder': 'Implementation and development',
      'tester': 'Testing and quality validation',
      'performance': 'Performance optimization and profiling',
      'documenter': 'Documentation and guides creation',
      'mcp-dev': 'MCP protocol implementation',
      'integration': 'Service integration and API connections',
      'hooks': 'Hooks and middleware implementation'
    };

    // Define logical order based on task type
    const workflowOrders: Record<TaskAnalysis['type'], string[]> = {
      'feature': ['architect', 'security', 'coder', 'tester', 'documenter'],
      'bug': ['tester', 'coder', 'tester'],
      'security': ['security', 'coder', 'tester'],
      'performance': ['performance', 'coder', 'tester'],
      'architecture': ['architect', 'coder', 'tester', 'documenter'],
      'integration': ['architect', 'integration', 'tester', 'documenter'],
      'refactor': ['architect', 'coder', 'tester'],
      'documentation': ['documenter']
    };

    const preferredOrder = workflowOrders[taskType] || ['architect', 'coder', 'tester'];
    
    // Sort agents according to preferred order
    const sortedAgents = [...agents].sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a);
      const bIndex = preferredOrder.indexOf(b);
      const aOrder = aIndex === -1 ? 999 : aIndex;
      const bOrder = bIndex === -1 ? 999 : bIndex;
      return aOrder - bOrder;
    });

    return sortedAgents.map((agent, index) => ({
      step: index + 1,
      agent,
      purpose: workflowPurposes[agent] || `${agent} processing`
    }));
  }

  /**
   * Select best agents for a task
   */
  public async selectAgents(taskDescription: string, options: SelectionOptions = {}): Promise<AgentRecommendation> {
    try {
      const analysis = this.analyzeTask(taskDescription);
      const agentScores = this.scoreAgents(analysis);
      const recipes = await this.findSuitableRecipes(analysis);

      // Filter out excluded agents
      const filteredScores = agentScores.filter(score => 
        !options.excludeAgents?.includes(score.agent)
      );

      // Select top agents
      const maxAgents = options.maxAgents || 4;
      const selectedAgentScores = filteredScores.slice(0, maxAgents).filter(score => score.score > 10);
      const selectedAgents = selectedAgentScores.map(score => score.agent);

      // Calculate overall confidence
      const averageScore = selectedAgentScores.reduce((sum, score) => sum + score.score, 0) / selectedAgentScores.length;
      const confidence = Math.min(95, Math.max(30, averageScore));

      // Select best recipe
      const bestRecipe = recipes.length > 0 && options.includeRecipes !== false ? recipes[0] : undefined;

      // Create reasoning
      const reasoning = this.createReasoning(analysis, selectedAgentScores, bestRecipe);

      // Create workflow steps
      const workflowSteps = this.createWorkflowSteps(selectedAgents, analysis.type);

      return {
        agents: selectedAgents,
        recipe: bestRecipe?.name,
        confidence,
        reasoning,
        workflow_steps: workflowSteps,
        estimated_complexity: analysis.complexity
      };

    } catch (error) {
      this.logger.error('Agent selection failed:', error);
      throw new Error(`Agent selection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create human-readable reasoning
   */
  private createReasoning(
    analysis: TaskAnalysis,
    selectedScores: Array<{ agent: string; score: number; reasoning: string[] }>,
    bestRecipe?: { name: string; confidence: number }
  ): string {
    const parts: string[] = [];

    parts.push(`Task identified as ${analysis.type} with ${analysis.complexity} complexity.`);
    
    if (analysis.keywords.length > 0) {
      parts.push(`Key requirements: ${analysis.keywords.join(', ')}.`);
    }

    parts.push('Agent selection reasoning:');
    selectedScores.forEach(score => {
      const capability = this.agentCapabilities.get(score.agent);
      parts.push(`• ${score.agent}: ${capability?.description} (Score: ${score.score})`);
    });

    if (bestRecipe) {
      parts.push(`Recommended recipe: ${bestRecipe.name} (${bestRecipe.confidence}% match)`);
    }

    return parts.join(' ');
  }

  /**
   * Interactive wizard for complex task selection
   */
  public async wizard(): Promise<AgentRecommendation> {
    // This would typically use inquirer or similar for CLI interaction
    // For now, return a structured approach for implementation
    throw new Error('Interactive wizard not yet implemented. Use selectAgents() method directly.');
  }

  /**
   * Get agent capabilities information
   */
  public getAgentCapabilities(): Map<string, AgentCapability> {
    return new Map(this.agentCapabilities);
  }

  /**
   * Validate task description
   */
  public validateTask(taskDescription: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (!taskDescription || taskDescription.trim().length === 0) {
      issues.push('Task description cannot be empty');
    }

    if (taskDescription.length < 10) {
      issues.push('Task description should be more descriptive (minimum 10 characters)');
    }

    if (taskDescription.length > 500) {
      issues.push('Task description too long (maximum 500 characters)');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}