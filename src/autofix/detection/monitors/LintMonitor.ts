/**
 * Lint Monitor - Detects code quality and linting issues
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { AutoFixIssue, FixPattern } from '../../types';

export interface LintMonitorOptions {
  patterns: FixPattern[];
  timeout: number;
  lintCommand?: string;
}

export class LintMonitor extends EventEmitter {
  private options: LintMonitorOptions;
  private isRunning = false;
  
  constructor(options: LintMonitorOptions) {
    super();
    this.options = {
      lintCommand: 'npm run lint',
      ...options
    };
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
    return new Promise((resolve) => {
      const issues: AutoFixIssue[] = [];
      const [command, ...args] = this.options.lintCommand!.split(' ');
      
      const lintProcess = spawn(command, args, {
        stdio: 'pipe'
      });
      
      let output = '';
      
      lintProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      lintProcess.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      lintProcess.on('exit', (code) => {
        if (code !== 0) {
          const lintIssues = this.parseLintOutput(output);
          resolve(lintIssues);
        } else {
          resolve(issues);
        }
      });
      
      setTimeout(() => {
        lintProcess.kill();
        resolve(issues);
      }, this.options.timeout);
    });
  }
  
  private parseLintOutput(output: string): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    const lines = output.split('\\n');
    
    for (const line of lines) {
      // Parse ESLint format: file:line:col error/warning message (rule)
      const eslintMatch = line.match(/^(.+?):(\\d+):(\\d+):\\s*(error|warning)\\s+(.+?)\\s+\\((.+?)\\)$/);
      
      if (eslintMatch) {
        const [, file, lineStr, colStr, level, message, rule] = eslintMatch;
        
        const issue: AutoFixIssue = {
          id: `lint_${rule}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'lint',
          severity: level === 'error' ? 'medium' : 'low',
          title: `Lint ${level}: ${rule}`,
          description: message.trim(),
          location: {
            file: file.trim(),
            line: parseInt(lineStr),
            column: parseInt(colStr)
          },
          context: {
            rule,
            level,
            linter: 'eslint',
            fixable: this.isFixableRule(rule)
          },
          detected: new Date(),
          confidence: 0.9,
          tags: ['lint', 'code-quality', rule]
        };
        
        issues.push(issue);
      }
    }
    
    return issues;
  }
  
  private isFixableRule(rule: string): boolean {
    // Common ESLint rules that can be auto-fixed
    const fixableRules = [
      'semi',
      'quotes',
      'indent',
      'comma-dangle',
      'no-trailing-spaces',
      'eol-last',
      'no-multiple-empty-lines'
    ];
    
    return fixableRules.includes(rule);
  }
}