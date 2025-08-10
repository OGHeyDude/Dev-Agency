/**
 * Domain-specific Prompt Library System
 * Provides specialized prompt templates for different development domains
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Logger } from '../utils/Logger';

export interface DomainPrompt {
  domain: string;
  version: string;
  basePrompt: string;
  bestPractices: string[];
  antiPatterns: string[];
  contextRequirements: string[];
  frameworks?: string[];
  tools?: string[];
}

export interface PromptCompositionOptions {
  domains: string[];
  agent: string;
  task?: string;
  includebestPractices?: boolean;
  includeAntiPatterns?: boolean;
  maxTokens?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  tokenCount?: number;
}

export class PromptLibrary {
  private static instance: PromptLibrary;
  private logger: Logger;
  private promptCache: Map<string, DomainPrompt>;
  private promptsPath: string;

  private constructor() {
    this.logger = Logger.create({ component: 'PromptLibrary' });
    this.promptCache = new Map();
    this.promptsPath = path.join(
      process.env.DEV_AGENCY_PATH || '/home/hd/Desktop/LAB/Dev-Agency',
      'prompts',
      'domains'
    );
  }

  public static getInstance(): PromptLibrary {
    if (!PromptLibrary.instance) {
      PromptLibrary.instance = new PromptLibrary();
    }
    return PromptLibrary.instance;
  }

  /**
   * Load a domain-specific prompt template
   */
  public async loadDomain(domain: string): Promise<DomainPrompt | null> {
    try {
      // Check cache first
      if (this.promptCache.has(domain)) {
        return this.promptCache.get(domain)!;
      }

      // Parse domain path (e.g., "frontend/react" -> ["frontend", "react"])
      const domainParts = domain.split('/');
      const promptPath = path.join(this.promptsPath, ...domainParts) + '.md';

      if (!await fs.pathExists(promptPath)) {
        this.logger.warn(`Domain prompt not found: ${domain}`);
        return null;
      }

      const content = await fs.readFile(promptPath, 'utf-8');
      const prompt = this.parsePromptFile(content, domain);
      
      // Cache the parsed prompt
      this.promptCache.set(domain, prompt);
      return prompt;
    } catch (error) {
      this.logger.error(`Failed to load domain ${domain}:`, error);
      return null;
    }
  }

  /**
   * Compose a prompt by combining base agent prompt with domain enhancements
   */
  public async compose(
    basePrompt: string,
    options: PromptCompositionOptions
  ): Promise<string> {
    const components: string[] = [basePrompt];

    // Add domain-specific context
    for (const domain of options.domains) {
      const domainPrompt = await this.loadDomain(domain);
      if (domainPrompt) {
        components.push(this.formatDomainSection(domainPrompt, options));
      }
    }

    // Add agent-specific enhancements
    if (options.agent) {
      components.push(this.getAgentEnhancements(options.agent, options.domains));
    }

    // Compose final prompt
    const composedPrompt = components.join('\n\n---\n\n');

    // Validate token limits if specified
    if (options.maxTokens) {
      const tokenCount = this.estimateTokens(composedPrompt);
      if (tokenCount > options.maxTokens) {
        this.logger.warn(`Prompt exceeds token limit: ${tokenCount} > ${options.maxTokens}`);
        return this.truncatePrompt(composedPrompt, options.maxTokens);
      }
    }

    return composedPrompt;
  }

  /**
   * Validate a prompt for consistency and completeness
   */
  public validate(prompt: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required sections
    const requiredSections = ['Context', 'Task', 'Requirements'];
    for (const section of requiredSections) {
      if (!prompt.includes(`## ${section}`) && !prompt.includes(`### ${section}`)) {
        warnings.push(`Missing recommended section: ${section}`);
      }
    }

    // Check for conflicting instructions
    const conflictPatterns = [
      { pattern: /never.*always|always.*never/i, message: 'Conflicting absolute instructions' },
      { pattern: /must.*must not|must not.*must/i, message: 'Conflicting requirements' }
    ];

    for (const { pattern, message } of conflictPatterns) {
      if (pattern.test(prompt)) {
        warnings.push(message);
      }
    }

    // Check prompt length
    const tokenCount = this.estimateTokens(prompt);
    if (tokenCount > 4000) {
      warnings.push(`Prompt may be too long: ~${tokenCount} tokens`);
    }

    // Check for empty or minimal prompt
    if (prompt.length < 100) {
      errors.push('Prompt is too short to be effective');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      tokenCount
    };
  }

  /**
   * Get list of available domains
   */
  public async getAvailableDomains(): Promise<string[]> {
    const domains: string[] = [];

    const scanDirectory = async (dir: string, prefix: string = ''): Promise<void> => {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await scanDirectory(itemPath, prefix ? `${prefix}/${item}` : item);
        } else if (item.endsWith('.md')) {
          const domainName = item.replace('.md', '');
          domains.push(prefix ? `${prefix}/${domainName}` : domainName);
        }
      }
    };

    await scanDirectory(this.promptsPath);
    return domains.sort();
  }

  /**
   * Auto-detect domain from project context
   */
  public async detectDomain(projectPath: string): Promise<string[]> {
    const detectedDomains: string[] = [];

    // Check for package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // Check dependencies for frameworks
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.react) detectedDomains.push('frontend/react');
      if (deps.vue) detectedDomains.push('frontend/vue');
      if (deps.angular) detectedDomains.push('frontend/angular');
      if (deps.express) detectedDomains.push('backend/nodejs');
      if (deps.fastify) detectedDomains.push('backend/nodejs');
      if (deps['react-native']) detectedDomains.push('mobile/react-native');
    }

    // Check for requirements.txt (Python)
    const requirementsPath = path.join(projectPath, 'requirements.txt');
    if (await fs.pathExists(requirementsPath)) {
      const requirements = await fs.readFile(requirementsPath, 'utf-8');
      
      if (requirements.includes('django')) detectedDomains.push('backend/python');
      if (requirements.includes('fastapi')) detectedDomains.push('backend/python');
      if (requirements.includes('flask')) detectedDomains.push('backend/python');
    }

    // Check for go.mod (Go)
    const goModPath = path.join(projectPath, 'go.mod');
    if (await fs.pathExists(goModPath)) {
      detectedDomains.push('backend/go');
    }

    // Check for Dockerfile
    if (await fs.pathExists(path.join(projectPath, 'Dockerfile'))) {
      detectedDomains.push('devops/docker');
    }

    // Check for kubernetes files
    const k8sFiles = ['deployment.yaml', 'service.yaml', 'k8s.yaml'];
    for (const file of k8sFiles) {
      if (await fs.pathExists(path.join(projectPath, file))) {
        detectedDomains.push('devops/kubernetes');
        break;
      }
    }

    return [...new Set(detectedDomains)]; // Remove duplicates
  }

  // Private helper methods

  private parsePromptFile(content: string, domain: string): DomainPrompt {
    // Parse markdown frontmatter and content
    const lines = content.split('\n');
    const prompt: DomainPrompt = {
      domain,
      version: '1.0.0',
      basePrompt: '',
      bestPractices: [],
      antiPatterns: [],
      contextRequirements: [],
      frameworks: [],
      tools: []
    };

    let currentSection = '';
    let inFrontmatter = false;

    for (const line of lines) {
      if (line === '---') {
        inFrontmatter = !inFrontmatter;
        continue;
      }

      if (inFrontmatter) {
        // Parse frontmatter
        if (line.startsWith('version:')) {
          prompt.version = line.split(':')[1].trim();
        } else if (line.startsWith('frameworks:')) {
          prompt.frameworks = line.split(':')[1].split(',').map(f => f.trim());
        } else if (line.startsWith('tools:')) {
          prompt.tools = line.split(':')[1].split(',').map(t => t.trim());
        }
      } else {
        // Parse content sections
        if (line.startsWith('## ')) {
          currentSection = line.substring(3).toLowerCase();
        } else if (line.startsWith('- ') && currentSection) {
          const item = line.substring(2);
          
          switch (currentSection) {
            case 'best practices':
              prompt.bestPractices.push(item);
              break;
            case 'anti-patterns':
              prompt.antiPatterns.push(item);
              break;
            case 'context requirements':
              prompt.contextRequirements.push(item);
              break;
          }
        } else if (currentSection === 'base prompt') {
          prompt.basePrompt += line + '\n';
        }
      }
    }

    return prompt;
  }

  private formatDomainSection(
    prompt: DomainPrompt,
    options: PromptCompositionOptions
  ): string {
    const sections: string[] = [];

    sections.push(`## Domain: ${prompt.domain}`);
    sections.push(prompt.basePrompt);

    if (options.includebestPractices !== false && prompt.bestPractices.length > 0) {
      sections.push('### Best Practices');
      sections.push(...prompt.bestPractices.map(bp => `- ${bp}`));
    }

    if (options.includeAntiPatterns && prompt.antiPatterns.length > 0) {
      sections.push('### Anti-Patterns to Avoid');
      sections.push(...prompt.antiPatterns.map(ap => `- ${ap}`));
    }

    if (prompt.contextRequirements.length > 0) {
      sections.push('### Context Requirements');
      sections.push(...prompt.contextRequirements.map(cr => `- ${cr}`));
    }

    return sections.join('\n');
  }

  private getAgentEnhancements(agent: string, domains: string[]): string {
    const enhancements: string[] = [];

    // Add agent-specific domain knowledge
    switch (agent) {
      case 'architect':
        enhancements.push('### Architecture Considerations');
        enhancements.push('- Design for scalability and maintainability');
        enhancements.push('- Consider domain-specific architectural patterns');
        enhancements.push('- Ensure proper separation of concerns');
        break;
      
      case 'coder':
        enhancements.push('### Implementation Guidelines');
        enhancements.push('- Follow domain-specific coding conventions');
        enhancements.push('- Use appropriate design patterns');
        enhancements.push('- Optimize for performance and readability');
        break;
      
      case 'tester':
        enhancements.push('### Testing Strategy');
        enhancements.push('- Apply domain-specific testing patterns');
        enhancements.push('- Ensure comprehensive test coverage');
        enhancements.push('- Include edge cases and error scenarios');
        break;
      
      case 'security':
        enhancements.push('### Security Requirements');
        enhancements.push('- Apply domain-specific security best practices');
        enhancements.push('- Validate all inputs and outputs');
        enhancements.push('- Follow OWASP guidelines');
        break;
    }

    return enhancements.join('\n');
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private truncatePrompt(prompt: string, maxTokens: number): string {
    const maxChars = maxTokens * 4;
    if (prompt.length <= maxChars) {
      return prompt;
    }

    // Truncate intelligently at section boundaries
    const truncated = prompt.substring(0, maxChars);
    const lastSectionIndex = truncated.lastIndexOf('\n##');
    
    if (lastSectionIndex > maxChars * 0.8) {
      return truncated.substring(0, lastSectionIndex) + '\n\n[Truncated for token limit]';
    }

    return truncated + '\n\n[Truncated for token limit]';
  }
}