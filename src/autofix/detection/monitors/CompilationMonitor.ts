/**
 * Compilation Monitor - Detects TypeScript/JavaScript compilation issues
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import { AutoFixIssue, FixPattern } from '../../types';

export interface CompilationMonitorOptions {
  patterns: FixPattern[];
  timeout: number;
  watchMode?: boolean;
  buildCommand?: string;
}

export class CompilationMonitor extends EventEmitter {
  private options: CompilationMonitorOptions;
  private isRunning = false;
  private buildProcess?: any;
  
  constructor(options: CompilationMonitorOptions) {
    super();
    this.options = {
      watchMode: false,
      buildCommand: 'npm run build',
      ...options
    };
  }
  
  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.emit('started');
    
    if (this.options.watchMode) {
      await this.startWatchMode();
    }
  }
  
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.buildProcess) {
      this.buildProcess.kill();
      this.buildProcess = undefined;
    }
    
    this.emit('stopped');
  }
  
  public async detect(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];
    
    try {
      // Run TypeScript compiler check
      const tscIssues = await this.checkTypeScript();
      issues.push(...tscIssues);
      
      // Run build check
      const buildIssues = await this.checkBuild();
      issues.push(...buildIssues);
      
    } catch (error) {
      this.emit('error', error);
    }
    
    return issues;
  }
  
  private async startWatchMode(): Promise<void> {
    // Start TypeScript in watch mode
    this.buildProcess = spawn('npx', ['tsc', '--watch', '--noEmit'], {
      stdio: 'pipe'
    });
    
    this.buildProcess.stdout?.on('data', (data: Buffer) => {
      this.processCompilerOutput(data.toString());
    });
    
    this.buildProcess.stderr?.on('data', (data: Buffer) => {
      this.processCompilerOutput(data.toString());
    });
    
    this.buildProcess.on('exit', (code: number) => {
      if (this.isRunning) {
        this.emit('error', new Error(`TypeScript compiler exited with code ${code}`));
      }
    });
  }
  
  private async checkTypeScript(): Promise<AutoFixIssue[]> {
    return new Promise((resolve) => {
      const issues: AutoFixIssue[] = [];
      
      const tscProcess = spawn('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      tscProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      tscProcess.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      tscProcess.on('exit', () => {
        const tscIssues = this.parseTypeScriptOutput(output);
        resolve(tscIssues);
      });
      
      // Timeout handling
      setTimeout(() => {
        tscProcess.kill();
        resolve(issues);
      }, this.options.timeout);
    });
  }
  
  private async checkBuild(): Promise<AutoFixIssue[]> {
    return new Promise((resolve) => {
      const issues: AutoFixIssue[] = [];
      const [command, ...args] = this.options.buildCommand!.split(' ');
      
      const buildProcess = spawn(command, args, {
        stdio: 'pipe'
      });
      
      let output = '';
      
      buildProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      buildProcess.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      buildProcess.on('exit', (code) => {
        if (code !== 0) {
          const buildIssues = this.parseBuildOutput(output);
          resolve(buildIssues);
        } else {
          resolve(issues);
        }
      });
      
      // Timeout handling
      setTimeout(() => {
        buildProcess.kill();
        resolve(issues);
      }, this.options.timeout);
    });
  }
  
  private processCompilerOutput(output: string): void {
    const issues = this.parseTypeScriptOutput(output);
    
    for (const issue of issues) {
      this.emit('issue:found', issue);
    }
  }
  
  private parseTypeScriptOutput(output: string): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    const lines = output.split('\\n');
    
    for (const line of lines) {
      // Parse TypeScript error format: file(line,col): error TSxxxx: message
      const tsErrorMatch = line.match(/^(.+)\\((\\d+),(\\d+)\\):\\s+error\\s+(TS\\d+):\\s+(.+)$/);
      
      if (tsErrorMatch) {
        const [, file, lineStr, colStr, errorCode, message] = tsErrorMatch;
        
        const issue: AutoFixIssue = {
          id: `ts_${errorCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'compilation',
          severity: this.getTypeScriptErrorSeverity(errorCode),
          title: `TypeScript Error ${errorCode}`,
          description: message.trim(),
          location: {
            file: file.trim(),
            line: parseInt(lineStr),
            column: parseInt(colStr)
          },
          context: {
            errorCode,
            compiler: 'typescript',
            rawOutput: line
          },
          detected: new Date(),
          confidence: 0.95,
          tags: ['typescript', 'compilation', errorCode.toLowerCase()]
        };
        
        issues.push(issue);
      }
    }
    
    return issues;
  }
  
  private parseBuildOutput(output: string): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    const lines = output.split('\\n');
    
    for (const line of lines) {
      // Parse common build error patterns
      if (line.includes('Error:') || line.includes('ERROR:')) {
        const issue: AutoFixIssue = {
          id: `build_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'compilation',
          severity: 'high',
          title: 'Build Error',
          description: line.trim(),
          location: {
            file: 'build'
          },
          context: {
            buildError: true,
            rawOutput: line
          },
          detected: new Date(),
          confidence: 0.8,
          tags: ['build', 'compilation']
        };
        
        issues.push(issue);
      }
    }
    
    return issues;
  }
  
  private getTypeScriptErrorSeverity(errorCode: string): 'low' | 'medium' | 'high' | 'critical' {
    // Map TypeScript error codes to severity levels
    const criticalErrors = ['TS2304', 'TS2307', 'TS2339']; // Cannot find name, module, property
    const highErrors = ['TS2322', 'TS2345', 'TS2531']; // Type assignment, argument, null/undefined
    const mediumErrors = ['TS2552', 'TS2564', 'TS7053']; // Non-existent property, uninitialized, index signature
    
    if (criticalErrors.includes(errorCode)) {
      return 'critical';
    } else if (highErrors.includes(errorCode)) {
      return 'high';
    } else if (mediumErrors.includes(errorCode)) {
      return 'medium';
    } else {
      return 'medium'; // Default for unknown errors
    }
  }
}