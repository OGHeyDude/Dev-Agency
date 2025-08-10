/**
 * Recipe Engine - Execute predefined Dev-Agency recipes
 * 
 * @file RecipeEngine.ts
 * @created 2025-08-09
 * @updated 2025-08-09
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { ExecutionEngine, ExecutionResult } from './ExecutionEngine';
import { AgentManager } from './AgentManager';
import { ConfigManager } from './ConfigManager';
import { Logger } from '../utils/Logger';

export interface RecipeStep {
  agent: string;
  task: string;
  context?: string[];
  variables?: Record<string, string>;
  depends_on?: string[];
  parallel?: boolean;
  timeout?: number;
}

export interface Recipe {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags: string[];
  variables?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array';
    description: string;
    default?: any;
    required?: boolean;
  }>;
  steps: RecipeStep[];
  success_criteria?: string[];
  cleanup?: RecipeStep[];
}

export interface RecipeValidation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  steps?: string[];
}

export interface RecipeExecutionOptions {
  recipeName: string;
  contextPath?: string;
  outputPath?: string;
  variables?: Record<string, any>;
}

export interface RecipeExecutionResult {
  success: boolean;
  recipe: string;
  steps_completed: number;
  steps_total: number;
  results: ExecutionResult[];
  summary: string;
  duration: number;
  errors?: string[];
}

export class RecipeEngine {
  private logger = new Logger();
  private executionEngine: ExecutionEngine;
  private agentManager: AgentManager;
  private configManager: ConfigManager;
  private recipes = new Map<string, Recipe>();
  private devAgencyPath: string;

  constructor() {
    this.executionEngine = new ExecutionEngine();
    this.agentManager = new AgentManager();
    this.configManager = new ConfigManager();
    this.devAgencyPath = '/home/hd/Desktop/LAB/Dev-Agency';
    this.loadRecipes();
  }

  /**
   * Load all recipes from Dev-Agency
   */
  private async loadRecipes(): Promise<void> {
    try {
      const recipesPath = path.join(this.devAgencyPath, 'recipes');
      
      if (!await fs.pathExists(recipesPath)) {
        throw new Error(`Recipes directory not found: ${recipesPath}`);
      }

      // Find all recipe markdown files
      const recipeFiles = await glob('*.md', { cwd: recipesPath });
      
      this.logger.debug(`Found ${recipeFiles.length} recipe files`);

      for (const file of recipeFiles) {
        const recipePath = path.join(recipesPath, file);
        const recipeName = path.basename(file, '.md');
        
        try {
          const recipe = await this.parseRecipe(recipePath, recipeName);
          this.recipes.set(recipeName, recipe);
          this.logger.debug(`Loaded recipe: ${recipeName}`);
        } catch (error) {
          this.logger.warn(`Failed to load recipe ${recipeName}:`, error);
        }
      }

      this.logger.info(`Loaded ${this.recipes.size} recipes`);
    } catch (error) {
      this.logger.error('Failed to load recipes:', error);
      throw error;
    }
  }

  /**
   * Parse recipe from markdown file
   */
  private async parseRecipe(filePath: string, recipeName: string): Promise<Recipe> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error(`Invalid recipe file format: ${filePath}`);
    }

    const [, frontmatter, body] = frontmatterMatch;
    
    // Parse frontmatter
    const metadata = this.parseFrontmatter(frontmatter);
    
    // Parse recipe sections
    const sections = this.parseRecipeSections(body);
    
    return {
      name: recipeName,
      description: metadata.description || sections.description || `${recipeName} recipe`,
      version: metadata.version || '1.0.0',
      author: metadata.author,
      tags: this.parseArrayField(metadata.tags) || [],
      variables: this.parseVariables(sections.variables),
      steps: this.parseSteps(sections.steps || sections.workflow || ''),
      success_criteria: this.parseArrayField(sections.success_criteria),
      cleanup: this.parseSteps(sections.cleanup || '')
    };
  }

  /**
   * Parse frontmatter (basic YAML parsing)
   */
  private parseFrontmatter(frontmatter: string): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    frontmatter.split('\n').forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key.trim()] = value.trim();
      }
    });
    
    return metadata;
  }

  /**
   * Parse recipe sections from markdown
   */
  private parseRecipeSections(body: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = body.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      const headerMatch = line.match(/^#+\s*(.+)$/);
      
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections[currentSection.toLowerCase().replace(/\s+/g, '_')] = currentContent.join('\n').trim();
        }
        
        // Start new section
        currentSection = headerMatch[1];
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      sections[currentSection.toLowerCase().replace(/\s+/g, '_')] = currentContent.join('\n').trim();
    }
    
    return sections;
  }

  /**
   * Parse array fields from markdown
   */
  private parseArrayField(value: string | undefined): string[] | undefined {
    if (!value) return undefined;
    
    // Handle array format: [item1, item2, item3]
    const arrayMatch = value.match(/^\[(.*)\]$/);
    if (arrayMatch) {
      return arrayMatch[1].split(',').map(item => item.trim().replace(/['"]/g, ''));
    }
    
    // Handle simple comma-separated values
    return value.split(',').map(item => item.trim());
  }

  /**
   * Parse recipe variables definition
   */
  private parseVariables(variablesText?: string): Recipe['variables'] {
    if (!variablesText) return undefined;
    
    const variables: Record<string, any> = {};
    const lines = variablesText.split('\n');
    
    for (const line of lines) {
      // Look for variable definitions: - variable_name (type): description [default: value]
      const match = line.match(/^[-*]\s*([^(]+)\(([^)]+)\):\s*(.+?)(?:\s*\[default:\s*([^\]]+)\])?$/);
      if (match) {
        const [, name, type, description, defaultValue] = match;
        variables[name.trim()] = {
          type: type.trim() as any,
          description: description.trim(),
          default: defaultValue?.trim(),
          required: !defaultValue
        };
      }
    }
    
    return Object.keys(variables).length > 0 ? variables : undefined;
  }

  /**
   * Parse recipe steps
   */
  private parseSteps(stepsText: string): RecipeStep[] {
    if (!stepsText.trim()) return [];
    
    const steps: RecipeStep[] = [];
    const lines = stepsText.split('\n');
    let currentStep: Partial<RecipeStep> | null = null;
    
    for (const line of lines) {
      // Step definition: 1. **Agent**: task description
      const stepMatch = line.match(/^\d+\.\s*\*\*([^*]+)\*\*:\s*(.+)$/);
      if (stepMatch) {
        // Save previous step
        if (currentStep && currentStep.agent && currentStep.task) {
          steps.push(currentStep as RecipeStep);
        }
        
        // Start new step
        const [, agent, task] = stepMatch;
        currentStep = {
          agent: agent.trim(),
          task: task.trim()
        };
        continue;
      }
      
      // Step properties
      if (currentStep) {
        if (line.includes('Context:')) {
          const contextMatch = line.match(/Context:\s*(.+)$/);
          if (contextMatch) {
            currentStep.context = contextMatch[1].split(',').map(c => c.trim());
          }
        }
        
        if (line.includes('Variables:')) {
          const varsMatch = line.match(/Variables:\s*(.+)$/);
          if (varsMatch) {
            try {
              currentStep.variables = JSON.parse(varsMatch[1]);
            } catch (error) {
              this.logger.warn(`Failed to parse variables in step: ${line}`);
            }
          }
        }
        
        if (line.includes('Depends on:')) {
          const depsMatch = line.match(/Depends on:\s*(.+)$/);
          if (depsMatch) {
            currentStep.depends_on = depsMatch[1].split(',').map(d => d.trim());
          }
        }
        
        if (line.includes('Parallel: true')) {
          currentStep.parallel = true;
        }
        
        if (line.includes('Timeout:')) {
          const timeoutMatch = line.match(/Timeout:\s*(\d+)/);
          if (timeoutMatch) {
            currentStep.timeout = parseInt(timeoutMatch[1]) * 1000;
          }
        }
      }
    }
    
    // Save last step
    if (currentStep && currentStep.agent && currentStep.task) {
      steps.push(currentStep as RecipeStep);
    }
    
    return steps;
  }

  /**
   * Validate recipe configuration
   */
  async validateRecipe(recipeName: string, variables?: Record<string, any>): Promise<RecipeValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const steps: string[] = [];
    
    // Check if recipe exists
    const recipe = this.recipes.get(recipeName);
    if (!recipe) {
      errors.push(`Recipe '${recipeName}' not found`);
      return { valid: false, errors, warnings, steps };
    }
    
    // Validate variables
    if (recipe.variables) {
      for (const [varName, varDef] of Object.entries(recipe.variables)) {
        if (varDef.required && (!variables || !(varName in variables))) {
          errors.push(`Required variable '${varName}' not provided`);
        }
        
        if (variables && varName in variables) {
          const value = variables[varName];
          const expectedType = varDef.type;
          
          if (!this.validateVariableType(value, expectedType)) {
            errors.push(`Variable '${varName}' must be of type '${expectedType}'`);
          }
        }
      }
    }
    
    // Validate steps
    for (const step of recipe.steps) {
      // Check if agent exists
      const agent = await this.agentManager.getAgent(step.agent);
      if (!agent) {
        errors.push(`Agent '${step.agent}' not found in step: ${step.task.substring(0, 50)}...`);
      }
      
      // Add to steps list
      steps.push(`${step.agent}: ${step.task.substring(0, 50)}${step.task.length > 50 ? '...' : ''}`);
    }
    
    // Check for circular dependencies
    if (this.hasCircularDependencies(recipe.steps)) {
      errors.push('Recipe contains circular dependencies');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      steps
    };
  }

  /**
   * Execute recipe
   */
  async executeRecipe(options: RecipeExecutionOptions): Promise<RecipeExecutionResult> {
    const startTime = Date.now();
    this.logger.info(`Starting recipe execution: ${options.recipeName}`);
    
    try {
      // Get and validate recipe
      const recipe = this.recipes.get(options.recipeName);
      if (!recipe) {
        throw new Error(`Recipe '${options.recipeName}' not found`);
      }
      
      const validation = await this.validateRecipe(options.recipeName, options.variables);
      if (!validation.valid) {
        throw new Error(`Recipe validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Prepare variables
      const variables = this.prepareVariables(recipe, options.variables || {});
      
      // Execute steps
      const results = await this.executeSteps(recipe.steps, {
        contextPath: options.contextPath,
        outputPath: options.outputPath,
        variables
      });
      
      // Execute cleanup if needed
      if (recipe.cleanup && recipe.cleanup.length > 0) {
        this.logger.info('Executing cleanup steps...');
        try {
          await this.executeSteps(recipe.cleanup, { variables });
        } catch (error) {
          this.logger.warn('Cleanup steps failed:', error);
        }
      }
      
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      
      const summary = this.generateRecipeSummary(recipe, results, duration);
      
      this.logger.info(`Recipe completed: ${successful}/${results.length} steps successful in ${duration}ms`);
      
      return {
        success: successful === results.length,
        recipe: options.recipeName,
        steps_completed: successful,
        steps_total: results.length,
        results,
        summary,
        duration,
        errors: results.filter(r => !r.success).map(r => r.error).filter(Boolean) as string[]
      };
    } catch (error) {
      this.logger.error(`Recipe execution failed:`, error);
      
      return {
        success: false,
        recipe: options.recipeName,
        steps_completed: 0,
        steps_total: 0,
        results: [],
        summary: `Recipe execution failed: ${error instanceof Error ? error.message : String(error)}`,
        duration: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Execute recipe steps with dependency resolution
   */
  private async executeSteps(
    steps: RecipeStep[], 
    context: { contextPath?: string; outputPath?: string; variables?: Record<string, any> }
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const completedSteps = new Set<number>();
    const stepResults = new Map<number, ExecutionResult>();
    
    // Build execution plan considering dependencies
    const executionPlan = this.buildExecutionPlan(steps);
    
    for (const batch of executionPlan) {
      // Execute parallel batch
      const batchPromises = batch.map(async (stepIndex) => {
        const step = steps[stepIndex];
        
        // Prepare step context
        const stepContext = this.prepareStepContext(step, context);
        
        // Execute step
        const result = await this.executionEngine.executeSingle({
          agentName: step.agent,
          task: step.task,
          contextPath: stepContext.contextPath,
          outputPath: stepContext.outputPath,
          timeout: step.timeout,
          variables: stepContext.variables
        });
        
        stepResults.set(stepIndex, result);
        completedSteps.add(stepIndex);
        
        return result;
      });
      
      // Wait for batch completion
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Check if any step failed and should stop execution
      if (batchResults.some(r => !r.success)) {
        this.logger.warn('Step failed in batch, continuing with remaining steps...');
      }
    }
    
    return results;
  }

  /**
   * Build execution plan with dependency resolution
   */
  private buildExecutionPlan(steps: RecipeStep[]): number[][] {
    const plan: number[][] = [];
    const completed = new Set<number>();
    const stepNames = steps.map((step, index) => ({ name: step.agent, index }));
    
    while (completed.size < steps.length) {
      const batch: number[] = [];
      
      for (let i = 0; i < steps.length; i++) {
        if (completed.has(i)) continue;
        
        const step = steps[i];
        
        // Check if dependencies are satisfied
        const dependenciesSatisfied = !step.depends_on || 
          step.depends_on.every(dep => {
            const depIndex = stepNames.find(s => s.name === dep)?.index;
            return depIndex !== undefined && completed.has(depIndex);
          });
        
        if (dependenciesSatisfied) {
          batch.push(i);
          completed.add(i);
        }
      }
      
      if (batch.length === 0) {
        throw new Error('Circular dependency detected in recipe steps');
      }
      
      plan.push(batch);
    }
    
    return plan;
  }

  /**
   * Prepare context for individual step
   */
  private prepareStepContext(
    step: RecipeStep, 
    globalContext: { contextPath?: string; outputPath?: string; variables?: Record<string, any> }
  ): any {
    return {
      contextPath: globalContext.contextPath,
      outputPath: globalContext.outputPath ? 
        path.join(path.dirname(globalContext.outputPath), `${step.agent}_${path.basename(globalContext.outputPath)}`) :
        undefined,
      variables: { ...globalContext.variables, ...step.variables }
    };
  }

  /**
   * Prepare variables with defaults
   */
  private prepareVariables(recipe: Recipe, providedVariables: Record<string, any>): Record<string, any> {
    const variables = { ...providedVariables };
    
    if (recipe.variables) {
      for (const [name, definition] of Object.entries(recipe.variables)) {
        if (!(name in variables) && definition.default !== undefined) {
          variables[name] = definition.default;
        }
      }
    }
    
    return variables;
  }

  /**
   * Validate variable type
   */
  private validateVariableType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Check for circular dependencies
   */
  private hasCircularDependencies(steps: RecipeStep[]): boolean {
    const stepNames = steps.map(step => step.agent);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (stepName: string): boolean => {
      if (recursionStack.has(stepName)) return true;
      if (visited.has(stepName)) return false;
      
      visited.add(stepName);
      recursionStack.add(stepName);
      
      const step = steps.find(s => s.agent === stepName);
      if (step?.depends_on) {
        for (const dep of step.depends_on) {
          if (stepNames.includes(dep) && hasCycle(dep)) {
            return true;
          }
        }
      }
      
      recursionStack.delete(stepName);
      return false;
    };
    
    for (const stepName of stepNames) {
      if (!visited.has(stepName) && hasCycle(stepName)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Generate recipe execution summary
   */
  private generateRecipeSummary(recipe: Recipe, results: ExecutionResult[], duration: number): string {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    let summary = `# Recipe Execution Summary\n\n`;
    summary += `**Recipe**: ${recipe.name}\n`;
    summary += `**Description**: ${recipe.description}\n`;
    summary += `**Version**: ${recipe.version}\n\n`;
    
    summary += `## Results\n`;
    summary += `- **Total Steps**: ${results.length}\n`;
    summary += `- **Successful**: ${successful.length}\n`;
    summary += `- **Failed**: ${failed.length}\n`;
    summary += `- **Duration**: ${(duration / 1000).toFixed(2)}s\n`;
    summary += `- **Average per Step**: ${(duration / results.length / 1000).toFixed(2)}s\n\n`;
    
    if (successful.length > 0) {
      summary += `### Successful Steps\n`;
      successful.forEach(result => {
        summary += `- **${result.agent}**: ${(result.metrics.duration / 1000).toFixed(2)}s\n`;
      });
      summary += `\n`;
    }
    
    if (failed.length > 0) {
      summary += `### Failed Steps\n`;
      failed.forEach(result => {
        summary += `- **${result.agent}**: ${result.error}\n`;
      });
      summary += `\n`;
    }
    
    return summary;
  }

  /**
   * Get all available recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  /**
   * Get recipe by name
   */
  async getRecipe(name: string): Promise<Recipe | null> {
    return this.recipes.get(name) || null;
  }

  /**
   * Get recipe names for CLI help
   */
  getRecipeNames(): string[] {
    return Array.from(this.recipes.keys()).sort();
  }

  /**
   * Reload recipes (for development)
   */
  async reloadRecipes(): Promise<void> {
    this.recipes.clear();
    await this.loadRecipes();
  }
}