/**
 * Dependency Monitor - Detects dependency-related issues
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import { AutoFixIssue, FixPattern } from '../../types';

export interface DependencyMonitorOptions {
  patterns: FixPattern[];
  timeout: number;
}

export class DependencyMonitor extends EventEmitter {
  private options: DependencyMonitorOptions;
  private isRunning = false;
  
  constructor(options: DependencyMonitorOptions) {
    super();
    this.options = options;
  }
  
  public async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.emit('started');
  }
  
  public async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.emit('stopped');
  }
  
  public async detect(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];
    
    try {
      // Check for security vulnerabilities
      const securityIssues = await this.checkSecurityVulnerabilities();
      issues.push(...securityIssues);
      
      // Check for outdated packages
      const outdatedIssues = await this.checkOutdatedPackages();
      issues.push(...outdatedIssues);
      
      // Check for peer dependency issues
      const peerIssues = await this.checkPeerDependencies();
      issues.push(...peerIssues);
      
    } catch (error) {
      this.emit('error', error);
    }
    
    return issues;
  }
  
  private async checkSecurityVulnerabilities(): Promise<AutoFixIssue[]> {
    return new Promise((resolve) => {
      const issues: AutoFixIssue[] = [];
      
      const auditProcess = spawn('npm', ['audit', '--json'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      auditProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      auditProcess.on('exit', () => {
        try {
          const auditData = JSON.parse(output);
          const vulnerabilities = this.parseAuditOutput(auditData);
          resolve(vulnerabilities);
        } catch (error) {
          resolve(issues);
        }
      });
      
      setTimeout(() => {
        auditProcess.kill();
        resolve(issues);
      }, this.options.timeout);
    });
  }
  
  private async checkOutdatedPackages(): Promise<AutoFixIssue[]> {
    return new Promise((resolve) => {
      const issues: AutoFixIssue[] = [];
      
      const outdatedProcess = spawn('npm', ['outdated', '--json'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      outdatedProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      outdatedProcess.on('exit', () => {
        try {
          const outdatedData = JSON.parse(output);
          const outdatedIssues = this.parseOutdatedOutput(outdatedData);
          resolve(outdatedIssues);
        } catch (error) {
          resolve(issues);
        }
      });
      
      setTimeout(() => {
        outdatedProcess.kill();
        resolve(issues);
      }, this.options.timeout);
    });
  }
  
  private async checkPeerDependencies(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];
    
    try {
      const packageJson = await fs.readFile('package.json', 'utf8');
      const pkg = JSON.parse(packageJson);
      
      // Check if package-lock.json or node_modules indicate peer dependency issues
      // This is a simplified implementation
      
    } catch (error) {
      // Ignore errors for now
    }
    
    return issues;
  }
  
  private parseAuditOutput(auditData: any): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    
    if (auditData.vulnerabilities) {
      for (const [pkgName, vuln] of Object.entries(auditData.vulnerabilities)) {
        const vulnerability = vuln as any;
        
        const issue: AutoFixIssue = {
          id: `vuln_${pkgName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'dependency',
          severity: this.mapSeverity(vulnerability.severity),
          title: `Security Vulnerability in ${pkgName}`,
          description: vulnerability.title || `${pkgName} has known security vulnerabilities`,
          location: {
            file: 'package.json',
            module: pkgName
          },
          context: {
            packageName: pkgName,
            vulnerability: vulnerability,
            via: vulnerability.via,
            range: vulnerability.range,
            fixAvailable: vulnerability.fixAvailable
          },
          detected: new Date(),
          confidence: 0.95,
          tags: ['security', 'vulnerability', 'dependency']
        };
        
        issues.push(issue);
      }
    }
    
    return issues;
  }
  
  private parseOutdatedOutput(outdatedData: any): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    
    for (const [pkgName, info] of Object.entries(outdatedData)) {
      const packageInfo = info as any;
      
      // Only report major version updates as potential issues
      if (this.isMajorVersionDifference(packageInfo.current, packageInfo.latest)) {
        const issue: AutoFixIssue = {
          id: `outdated_${pkgName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'dependency',
          severity: 'low',
          title: `Outdated Package: ${pkgName}`,
          description: `${pkgName} is outdated (${packageInfo.current} → ${packageInfo.latest})`,
          location: {
            file: 'package.json',
            module: pkgName
          },
          context: {
            packageName: pkgName,
            current: packageInfo.current,
            wanted: packageInfo.wanted,
            latest: packageInfo.latest,
            location: packageInfo.location
          },
          detected: new Date(),
          confidence: 0.7,
          tags: ['outdated', 'dependency', 'maintenance']
        };
        
        issues.push(issue);
      }
    }
    
    return issues;
  }
  
  private mapSeverity(npmSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      'info': 'low',
      'low': 'low',
      'moderate': 'medium',
      'high': 'high',
      'critical': 'critical'
    };
    
    return mapping[npmSeverity] || 'medium';
  }
  
  private isMajorVersionDifference(current: string, latest: string): boolean {
    const currentMajor = parseInt(current.split('.')[0] || '0');
    const latestMajor = parseInt(latest.split('.')[0] || '0');
    
    return latestMajor > currentMajor;
  }
}