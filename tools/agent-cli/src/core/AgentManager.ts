/**
 * Agent Manager - Load and manage Dev-Agency agent definitions
 * 
 * @file AgentManager.ts
 * @created 2025-08-09
 * @updated 2025-08-09
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { Logger } from '../utils/Logger';

export interface AgentDefinition {
  name: string;
  description: string;
  capabilities: string[];
  requirements: string[];
  context_limits: {
    max_tokens?: number;
    max_files?: number;
  };
  prompt_template: string;
  examples?: Array<{
    input: string;
    expected_output: string;
  }>;
}

export interface AgentValidation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface AgentInvocationOptions {
  task?: string;
  contextPath?: string;
  outputPath?: string;
  format?: string;
  timeout?: number;
  variables?: Record<string, any>;
}

export class AgentManager {
  private logger = new Logger();
  private agentDefinitions = new Map<string, AgentDefinition>();
  private devAgencyPath: string;

  constructor() {
    // Dev-Agency centralized location
    this.devAgencyPath = '/home/hd/Desktop/LAB/Dev-Agency';
    this.loadAgentDefinitions();
  }

  /**
   * Load all agent definitions from Dev-Agency
   */
  private async loadAgentDefinitions(): Promise<void> {
    try {
      const agentsPath = path.join(this.devAgencyPath, 'Agents');
      
      if (!await fs.pathExists(agentsPath)) {
        throw new Error(`Agents directory not found: ${agentsPath}`);
      }

      // Find all agent markdown files
      const agentFiles = await glob('*.md', { cwd: agentsPath });
      
      this.logger.debug(`Found ${agentFiles.length} agent files`);

      for (const file of agentFiles) {
        const agentPath = path.join(agentsPath, file);
        const agentName = path.basename(file, '.md');
        
        try {
          const definition = await this.parseAgentDefinition(agentPath, agentName);
          this.agentDefinitions.set(agentName, definition);
          this.logger.debug(`Loaded agent: ${agentName}`);
        } catch (error) {
          this.logger.warn(`Failed to load agent ${agentName}:`, error);
        }
      }

      this.logger.info(`Loaded ${this.agentDefinitions.size} agents`);
    } catch (error) {
      this.logger.error('Failed to load agent definitions:', error);
      throw error;
    }
  }

  /**
   * Parse agent definition from markdown file
   */
  private async parseAgentDefinition(filePath: string, agentName: string): Promise<AgentDefinition> {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Extract frontmatter and content
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!frontmatterMatch) {
      throw new Error(`Invalid agent file format: ${filePath}`);
    }

    const [, frontmatter, body] = frontmatterMatch;
    
    // Parse frontmatter (basic YAML parsing)
    const metadata = this.parseFrontmatter(frontmatter);
    
    // Extract sections from body
    const sections = this.parseAgentSections(body);
    
    return {
      name: agentName,
      description: metadata.description || sections.description || `${agentName} agent`,
      capabilities: this.extractCapabilities(sections),
      requirements: this.extractRequirements(sections),
      context_limits: {
        max_tokens: metadata.max_tokens || 4000,
        max_files: metadata.max_files || 10
      },
      prompt_template: sections.prompt_template || body,
      examples: this.extractExamples(sections)
    };
  }

  /**
   * Basic frontmatter parser
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
   * Parse agent sections from markdown body
   */
  private parseAgentSections(body: string): Record<string, string> {
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
   * Extract capabilities from agent sections
   */
  private extractCapabilities(sections: Record<string, string>): string[] {
    const capabilities: string[] = [];
    
    // Look for capabilities in various sections
    const capabilitySections = ['capabilities', 'core_capabilities', 'what_i_do'];
    
    for (const section of capabilitySections) {
      if (sections[section]) {
        const lines = sections[section].split('\n');
        lines.forEach(line => {
          const match = line.match(/^[-*]\s*(.+)$/);
          if (match) {
            capabilities.push(match[1].trim());
          }
        });
      }
    }
    
    return capabilities;
  }

  /**
   * Extract requirements from agent sections
   */
  private extractRequirements(sections: Record<string, string>): string[] {
    const requirements: string[] = [];
    
    const requirementSections = ['requirements', 'dependencies', 'prerequisites'];
    
    for (const section of requirementSections) {
      if (sections[section]) {
        const lines = sections[section].split('\n');
        lines.forEach(line => {
          const match = line.match(/^[-*]\s*(.+)$/);
          if (match) {
            requirements.push(match[1].trim());
          }
        });
      }
    }
    
    return requirements;
  }

  /**
   * Extract examples from agent sections
   */
  private extractExamples(sections: Record<string, string>): Array<{input: string; expected_output: string}> {
    const examples: Array<{input: string; expected_output: string}> = [];
    
    if (sections.examples) {
      // Simple example parsing - looking for Input/Output pairs
      const exampleText = sections.examples;
      const inputMatches = exampleText.match(/Input:\s*(.+?)(?=Output:|$)/gs);
      const outputMatches = exampleText.match(/Output:\s*(.+?)(?=Input:|$)/gs);
      
      if (inputMatches && outputMatches && inputMatches.length === outputMatches.length) {
        for (let i = 0; i < inputMatches.length; i++) {
          examples.push({
            input: inputMatches[i].replace('Input:', '').trim(),
            expected_output: outputMatches[i].replace('Output:', '').trim()
          });
        }
      }
    }
    
    return examples;
  }

  /**
   * Get agent definition by name
   */
  async getAgent(name: string): Promise<AgentDefinition | null> {
    return this.agentDefinitions.get(name) || null;
  }

  /**
   * Get all available agents
   */
  async getAllAgents(): Promise<AgentDefinition[]> {
    return Array.from(this.agentDefinitions.values());
  }

  /**
   * Validate agent configuration for execution
   */
  async validateAgent(name: string, options: AgentInvocationOptions): Promise<AgentValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if agent exists
    const agent = this.agentDefinitions.get(name);
    if (!agent) {
      errors.push(`Agent '${name}' not found`);
      return { valid: false, errors, warnings };
    }

    // Validate context path if provided
    if (options.contextPath) {
      const exists = await fs.pathExists(options.contextPath);
      if (!exists) {
        errors.push(`Context path does not exist: ${options.contextPath}`);
      }
    }

    // Validate output path directory
    if (options.outputPath) {
      const outputDir = path.dirname(options.outputPath);
      const exists = await fs.pathExists(outputDir);
      if (!exists) {
        errors.push(`Output directory does not exist: ${outputDir}`);
      }
    }

    // Check requirements
    for (const requirement of agent.requirements) {
      // Basic requirement validation - could be expanded
      if (requirement.includes('file') && !options.contextPath) {
        warnings.push(`Agent requires context files but none provided`);
      }
    }

    // Validate format
    if (options.format && !['json', 'markdown', 'text'].includes(options.format)) {
      errors.push(`Invalid output format: ${options.format}`);
    }

    // Validate timeout
    if (options.timeout && (options.timeout < 1000 || options.timeout > 600000)) {
      errors.push('Timeout must be between 1 and 600 seconds');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Prepare context for agent execution
   */
  async prepareContext(agent: AgentDefinition, options: AgentInvocationOptions): Promise<string> {
    let context = '';

    // Add agent prompt template
    context += agent.prompt_template + '\n\n';

    // Add task if provided
    if (options.task) {
      context += `## Task\n${options.task}\n\n`;
    }

    // Add context files if provided
    if (options.contextPath) {
      const contextContent = await this.loadContextFiles(options.contextPath, agent.context_limits);
      if (contextContent) {
        context += `## Context\n${contextContent}\n\n`;
      }
    }

    // Add variables if provided
    if (options.variables) {
      context += `## Variables\n${JSON.stringify(options.variables, null, 2)}\n\n`;
    }

    return context;
  }

  /**
   * Load context files with limits
   */
  private async loadContextFiles(contextPath: string, limits: AgentDefinition['context_limits']): Promise<string> {
    const stats = await fs.stat(contextPath);
    let content = '';

    if (stats.isFile()) {
      // Single file
      const fileContent = await fs.readFile(contextPath, 'utf-8');
      content = `### ${path.basename(contextPath)}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
    } else if (stats.isDirectory()) {
      // Directory - load multiple files with limits
      const files = await glob('**/*', { 
        cwd: contextPath, 
        nodir: true,
        ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
      });

      const limitedFiles = files.slice(0, limits.max_files || 10);
      
      for (const file of limitedFiles) {
        const filePath = path.join(contextPath, file);
        try {
          const fileContent = await fs.readFile(filePath, 'utf-8');
          content += `### ${file}\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
        } catch (error) {
          this.logger.warn(`Failed to read file ${file}:`, error);
        }
      }
    }

    return content;
  }

  /**
   * Reload agent definitions (for development)
   */
  async reloadAgents(): Promise<void> {
    this.agentDefinitions.clear();
    await this.loadAgentDefinitions();
  }

  /**
   * Get agent list for CLI help
   */
  getAgentNames(): string[] {
    return Array.from(this.agentDefinitions.keys()).sort();
  }
}