/**
 * Prompt Versioning System
 * Manages versions, rollbacks, and A/B testing for domain prompts
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { createHash } from 'crypto';
import { Logger } from '../utils/Logger';
import { DomainPrompt } from './PromptLibrary';

export interface PromptVersion {
  id: string;
  domain: string;
  version: string;
  timestamp: number;
  hash: string;
  content: DomainPrompt;
  metadata: {
    author?: string;
    description?: string;
    performance?: {
      successRate?: number;
      avgTokens?: number;
      avgResponseTime?: number;
    };
  };
}

export interface VersionComparison {
  version1: PromptVersion;
  version2: PromptVersion;
  differences: {
    bestPractices: { added: string[]; removed: string[]; };
    antiPatterns: { added: string[]; removed: string[]; };
    contextRequirements: { added: string[]; removed: string[]; };
    basePromptChanged: boolean;
  };
  performanceComparison?: {
    successRateDelta: number;
    tokensDelta: number;
    responseTimeDelta: number;
  };
}

export class PromptVersioning {
  private static instance: PromptVersioning;
  private logger: Logger;
  private versionsPath: string;
  private versionCache: Map<string, PromptVersion[]>;

  private constructor() {
    this.logger = Logger.create({ component: 'PromptVersioning' });
    this.versionCache = new Map();
    this.versionsPath = path.join(
      process.env.DEV_AGENCY_PATH || '/home/hd/Desktop/LAB/Dev-Agency',
      'prompts',
      'versions'
    );
    this.ensureVersionsDirectory();
  }

  public static getInstance(): PromptVersioning {
    if (!PromptVersioning.instance) {
      PromptVersioning.instance = new PromptVersioning();
    }
    return PromptVersioning.instance;
  }

  private async ensureVersionsDirectory(): Promise<void> {
    await fs.ensureDir(this.versionsPath);
  }

  /**
   * Save a new version of a domain prompt
   */
  public async saveVersion(
    domain: string,
    prompt: DomainPrompt,
    metadata?: PromptVersion['metadata']
  ): Promise<PromptVersion> {
    const timestamp = Date.now();
    const hash = this.calculateHash(prompt);
    
    // Check if this exact version already exists
    const existing = await this.findByHash(domain, hash);
    if (existing) {
      this.logger.info(`Version already exists for ${domain}: ${existing.version}`);
      return existing;
    }

    // Generate new version number
    const versions = await this.listVersions(domain);
    const versionNumber = this.generateVersionNumber(versions);

    const version: PromptVersion = {
      id: `${domain}-${versionNumber}-${timestamp}`,
      domain,
      version: versionNumber,
      timestamp,
      hash,
      content: prompt,
      metadata: metadata || {}
    };

    // Save to file
    const versionPath = path.join(this.versionsPath, domain);
    await fs.ensureDir(versionPath);
    
    const filename = `${versionNumber}-${timestamp}.json`;
    await fs.writeJson(
      path.join(versionPath, filename),
      version,
      { spaces: 2 }
    );

    // Update cache
    if (!this.versionCache.has(domain)) {
      this.versionCache.set(domain, []);
    }
    this.versionCache.get(domain)!.push(version);

    this.logger.info(`Saved version ${versionNumber} for ${domain}`);
    return version;
  }

  /**
   * Get a specific version of a domain prompt
   */
  public async getVersion(
    domain: string,
    version: string
  ): Promise<PromptVersion | null> {
    const versions = await this.listVersions(domain);
    return versions.find(v => v.version === version) || null;
  }

  /**
   * Get the latest version of a domain prompt
   */
  public async getLatestVersion(domain: string): Promise<PromptVersion | null> {
    const versions = await this.listVersions(domain);
    if (versions.length === 0) {
      return null;
    }

    // Sort by timestamp descending
    versions.sort((a, b) => b.timestamp - a.timestamp);
    return versions[0];
  }

  /**
   * List all versions of a domain prompt
   */
  public async listVersions(domain: string): Promise<PromptVersion[]> {
    // Check cache first
    if (this.versionCache.has(domain)) {
      return this.versionCache.get(domain)!;
    }

    const versionPath = path.join(this.versionsPath, domain);
    if (!await fs.pathExists(versionPath)) {
      return [];
    }

    const files = await fs.readdir(versionPath);
    const versions: PromptVersion[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readJson(path.join(versionPath, file));
        versions.push(content);
      }
    }

    // Cache the results
    this.versionCache.set(domain, versions);
    return versions;
  }

  /**
   * Rollback to a specific version
   */
  public async rollback(
    domain: string,
    targetVersion: string
  ): Promise<DomainPrompt | null> {
    const version = await this.getVersion(domain, targetVersion);
    if (!version) {
      this.logger.error(`Version ${targetVersion} not found for ${domain}`);
      return null;
    }

    // Save current version as backup before rollback
    const currentPath = path.join(
      process.env.DEV_AGENCY_PATH || '/home/hd/Desktop/LAB/Dev-Agency',
      'prompts',
      'domains',
      ...domain.split('/') 
    ) + '.md';

    if (await fs.pathExists(currentPath)) {
      const backupPath = currentPath + `.backup-${Date.now()}`;
      await fs.copy(currentPath, backupPath);
      this.logger.info(`Backed up current version to ${backupPath}`);
    }

    // Write the rolled-back version
    await this.writeDomainPrompt(domain, version.content);
    
    this.logger.info(`Rolled back ${domain} to version ${targetVersion}`);
    return version.content;
  }

  /**
   * Compare two versions of a prompt
   */
  public async compareVersions(
    domain: string,
    version1: string,
    version2: string
  ): Promise<VersionComparison | null> {
    const v1 = await this.getVersion(domain, version1);
    const v2 = await this.getVersion(domain, version2);

    if (!v1 || !v2) {
      this.logger.error(`Cannot compare: missing version(s)`);
      return null;
    }

    const comparison: VersionComparison = {
      version1: v1,
      version2: v2,
      differences: {
        bestPractices: this.compareArrays(
          v1.content.bestPractices,
          v2.content.bestPractices
        ),
        antiPatterns: this.compareArrays(
          v1.content.antiPatterns,
          v2.content.antiPatterns
        ),
        contextRequirements: this.compareArrays(
          v1.content.contextRequirements,
          v2.content.contextRequirements
        ),
        basePromptChanged: v1.content.basePrompt !== v2.content.basePrompt
      }
    };

    // Add performance comparison if available
    if (v1.metadata.performance && v2.metadata.performance) {
      comparison.performanceComparison = {
        successRateDelta: (v2.metadata.performance.successRate || 0) - 
                         (v1.metadata.performance.successRate || 0),
        tokensDelta: (v2.metadata.performance.avgTokens || 0) - 
                    (v1.metadata.performance.avgTokens || 0),
        responseTimeDelta: (v2.metadata.performance.avgResponseTime || 0) - 
                          (v1.metadata.performance.avgResponseTime || 0)
      };
    }

    return comparison;
  }

  /**
   * A/B test two versions
   */
  public async selectVersionForABTest(
    domain: string,
    testPercentage: number = 50
  ): Promise<PromptVersion | null> {
    const versions = await this.listVersions(domain);
    if (versions.length < 2) {
      // Not enough versions for A/B testing
      return versions[0] || null;
    }

    // Sort by timestamp to get the two most recent versions
    versions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Randomly select between the two most recent versions
    const random = Math.random() * 100;
    return random < testPercentage ? versions[0] : versions[1];
  }

  /**
   * Update performance metrics for a version
   */
  public async updatePerformanceMetrics(
    domain: string,
    version: string,
    metrics: {
      successRate?: number;
      avgTokens?: number;
      avgResponseTime?: number;
    }
  ): Promise<void> {
    const versionObj = await this.getVersion(domain, version);
    if (!versionObj) {
      this.logger.error(`Version ${version} not found for ${domain}`);
      return;
    }

    // Update metrics
    if (!versionObj.metadata.performance) {
      versionObj.metadata.performance = {};
    }

    Object.assign(versionObj.metadata.performance, metrics);

    // Save updated version
    const versionPath = path.join(
      this.versionsPath,
      domain,
      `${version}-${versionObj.timestamp}.json`
    );
    
    await fs.writeJson(versionPath, versionObj, { spaces: 2 });
    
    // Update cache
    const cached = this.versionCache.get(domain);
    if (cached) {
      const index = cached.findIndex(v => v.version === version);
      if (index !== -1) {
        cached[index] = versionObj;
      }
    }

    this.logger.info(`Updated performance metrics for ${domain} v${version}`);
  }

  // Private helper methods

  private calculateHash(prompt: DomainPrompt): string {
    const content = JSON.stringify({
      basePrompt: prompt.basePrompt,
      bestPractices: prompt.bestPractices,
      antiPatterns: prompt.antiPatterns,
      contextRequirements: prompt.contextRequirements
    });
    return createHash('sha256').update(content).digest('hex').substring(0, 8);
  }

  private async findByHash(
    domain: string,
    hash: string
  ): Promise<PromptVersion | null> {
    const versions = await this.listVersions(domain);
    return versions.find(v => v.hash === hash) || null;
  }

  private generateVersionNumber(existingVersions: PromptVersion[]): string {
    if (existingVersions.length === 0) {
      return '1.0.0';
    }

    // Get the latest version
    const latest = existingVersions
      .map(v => v.version)
      .sort()
      .pop()!;

    // Increment patch version
    const parts = latest.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private compareArrays(
    arr1: string[],
    arr2: string[]
  ): { added: string[]; removed: string[]; } {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const added = arr2.filter(item => !set1.has(item));
    const removed = arr1.filter(item => !set2.has(item));

    return { added, removed };
  }

  private async writeDomainPrompt(
    domain: string,
    prompt: DomainPrompt
  ): Promise<void> {
    const promptPath = path.join(
      process.env.DEV_AGENCY_PATH || '/home/hd/Desktop/LAB/Dev-Agency',
      'prompts',
      'domains',
      ...domain.split('/')
    ) + '.md';

    // Format as markdown
    const content = this.formatPromptAsMarkdown(prompt);
    await fs.writeFile(promptPath, content, 'utf-8');
  }

  private formatPromptAsMarkdown(prompt: DomainPrompt): string {
    const lines: string[] = [];
    
    // Frontmatter
    lines.push('---');
    lines.push(`version: ${prompt.version}`);
    if (prompt.frameworks && prompt.frameworks.length > 0) {
      lines.push(`frameworks: ${prompt.frameworks.join(', ')}`);
    }
    if (prompt.tools && prompt.tools.length > 0) {
      lines.push(`tools: ${prompt.tools.join(', ')}`);
    }
    lines.push(`updated: ${new Date().toISOString().split('T')[0]}`);
    lines.push('---');
    lines.push('');
    
    // Content
    lines.push(`# ${prompt.domain} Domain Prompt`);
    lines.push('');
    lines.push('## Base Prompt');
    lines.push(prompt.basePrompt);
    lines.push('');
    
    if (prompt.bestPractices.length > 0) {
      lines.push('## Best Practices');
      prompt.bestPractices.forEach(bp => lines.push(`- ${bp}`));
      lines.push('');
    }
    
    if (prompt.antiPatterns.length > 0) {
      lines.push('## Anti-Patterns');
      prompt.antiPatterns.forEach(ap => lines.push(`- ${ap}`));
      lines.push('');
    }
    
    if (prompt.contextRequirements.length > 0) {
      lines.push('## Context Requirements');
      prompt.contextRequirements.forEach(cr => lines.push(`- ${cr}`));
      lines.push('');
    }
    
    return lines.join('\n');
  }
}