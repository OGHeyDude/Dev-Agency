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
import { securityManager } from '../utils/security';
const sanitizeHtml = require('sanitize-html');

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

      // Find all agent markdown files with secure glob pattern
      const agentPattern = path.join(agentsPath, '*.md');
      const globValidation = securityManager.validateGlobPattern('*.md', agentsPath);
      if (!globValidation.isValid) {
        throw new Error(`Unsafe glob pattern: ${globValidation.violations.join(', ')}`);
      }
      const agentFilePaths = await glob(agentPattern);
      
      // Convert to relative paths and ensure they're strings
      const relativeFiles = Array.isArray(agentFilePaths) ? agentFilePaths.map(file => path.relative(agentsPath, file)) : [];
      
      this.logger.debug(`Found ${Array.isArray(agentFilePaths) ? agentFilePaths.length : 0} agent files`);

      for (const file of relativeFiles) {
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
    // Secure file read with path validation
    const content = await securityManager.secureReadFile(filePath);
    
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

    // Validate context path if provided with security checks
    if (options.contextPath) {
      const pathValidation = await securityManager.validatePath(options.contextPath, 'read');
      if (!pathValidation.isValid) {
        errors.push(`Context path security validation failed: ${pathValidation.violations.join(', ')}`);
      } else {
        const exists = await fs.pathExists(pathValidation.resolvedPath!);
        if (!exists) {
          errors.push(`Context path does not exist: ${options.contextPath}`);
        }
      }
    }

    // Validate output path directory with security checks
    if (options.outputPath) {
      const pathValidation = await securityManager.validatePath(options.outputPath, 'write');
      if (!pathValidation.isValid) {
        errors.push(`Output path security validation failed: ${pathValidation.violations.join(', ')}`);
      } else {
        const outputDir = path.dirname(pathValidation.resolvedPath!);
        const exists = await fs.pathExists(outputDir);
        if (!exists) {
          errors.push(`Output directory does not exist: ${outputDir}`);
        }
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
   * Load context files with limits and security validation
   */
  private async loadContextFiles(contextPath: string, limits: AgentDefinition['context_limits']): Promise<string> {
    // Validate context path security
    const pathValidation = await securityManager.validatePath(contextPath, 'read');
    if (!pathValidation.isValid) {
      throw new Error(`Context path security validation failed: ${pathValidation.violations.join(', ')}`);
    }
    
    const stats = await fs.stat(pathValidation.resolvedPath!);
    let content = '';

    if (stats.isFile()) {
      // Single file - secure read
      const fileContent = await securityManager.secureReadFile(pathValidation.resolvedPath!);
      // Sanitize content to prevent injection
      const sanitizedContent = sanitizeHtml(fileContent, {
        allowedTags: [],
        allowedAttributes: {},
        textFilter: (text) => {
          // Remove potential injection patterns
          return text.replace(/[<>&"']/g, (char) => {
            const entityMap: { [key: string]: string } = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '"': '&quot;',
              "'": '&#39;'
            };
            return entityMap[char] || char;
          });
        }
      });
      content = `### ${path.basename(contextPath)}\n\`\`\`\n${sanitizedContent}\n\`\`\`\n\n`;
    } else if (stats.isDirectory()) {
      // Directory - load multiple files with limits and security
      const pattern = path.join(pathValidation.resolvedPath!, '**/*');
      const globValidation = securityManager.validateGlobPattern('**/*', pathValidation.resolvedPath!);
      if (!globValidation.isValid) {
        throw new Error(`Unsafe glob pattern: ${globValidation.violations.join(', ')}`);
      }
      const allFilePaths = await glob(pattern);

      // Filter out directories and convert to relative paths
      const fileList = Array.isArray(allFilePaths) ? allFilePaths : [];
      const files = fileList
        .filter(file => fs.statSync(file).isFile())
        .map(file => path.relative(contextPath, file))
        .filter(file => !file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('build'));

      const limitedFiles = files.slice(0, limits.max_files || 10);
      
      for (const file of limitedFiles) {
        const filePath = path.join(pathValidation.resolvedPath!, file);
        try {
          // Validate each file path
          const fileValidation = await securityManager.validatePath(filePath, 'read');
          if (!fileValidation.isValid) {
            this.logger.warn(`Skipping unsafe file ${file}:`, fileValidation.violations);
            continue;
          }
          
          const fileContent = await securityManager.secureReadFile(fileValidation.resolvedPath!);
          // Sanitize file content
          const sanitizedContent = sanitizeHtml(fileContent, {
            allowedTags: [],
            allowedAttributes: {},
            textFilter: (text) => {
              // Remove potential injection patterns
              return text.replace(/[<>&"']/g, (char) => {
                const entityMap: { [key: string]: string } = {
                  '<': '&lt;',
                  '>': '&gt;',
                  '&': '&amp;',
                  '"': '&quot;',
                  "'": '&#39;'
                };
                return entityMap[char] || char;
              });
            }
          });
          content += `### ${file}\n\`\`\`\n${sanitizedContent}\n\`\`\`\n\n`;
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

  /**
   * Load context files for agent execution with security validation
   */
  async loadContext(contextPath: string, agent?: string): Promise<string> {
    if (!contextPath) return '';
    
    try {
      // Security validation first
      const pathValidation = await securityManager.validatePath(contextPath, 'read');
      if (!pathValidation.isValid) {
        this.logger.error('Context path security validation failed:', pathValidation.violations);
        return '';
      }
      
      const agentDef = agent ? this.agentDefinitions.get(agent) : undefined;
      const limits = agentDef?.context_limits || { max_files: 50, max_tokens: 100000 };
      return await this.loadContextFiles(contextPath, limits);
    } catch (error) {
      this.logger.error('Failed to load context:', error);
      return '';
    }
  }

  /**
   * Ensure agents are loaded before operations
   */
  private async ensureLoaded(): Promise<void> {
    if (this.agentDefinitions.size === 0) {
      await this.loadAgentDefinitions();
    }
  }

  /**
   * List all available agents with their descriptions
   */
  async listAgents(): Promise<Array<{ name: string; description: string; capabilities: string[] }>> {
    await this.ensureLoaded();
    
    return Array.from(this.agentDefinitions.entries()).map(([name, def]) => ({
      name,
      description: def.description,
      capabilities: def.capabilities
    }));
  }
}