/**
 * Test Failure Monitor - Detects failing tests and test-related issues
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { AutoFixIssue, FixPattern } from '../../types';

export interface TestFailureMonitorOptions {
  patterns: FixPattern[];
  timeout: number;
  testCommand?: string;
  watchMode?: boolean;
}

export class TestFailureMonitor extends EventEmitter {
  private options: TestFailureMonitorOptions;
  private isRunning = false;
  private testProcess?: any;
  
  constructor(options: TestFailureMonitorOptions) {
    super();
    this.options = {
      testCommand: 'npm test',
      watchMode: false,
      ...options
    };
  }
  
  public async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.emit('started');
    
    if (this.options.watchMode) {
      await this.startWatchMode();
    }
  }
  
  public async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.testProcess) {
      this.testProcess.kill();
      this.testProcess = undefined;
    }
    
    this.emit('stopped');
  }
  
  public async detect(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];
    
    try {
      const testIssues = await this.runTests();
      issues.push(...testIssues);
    } catch (error) {
      this.emit('error', error);
    }
    
    return issues;
  }
  
  private async startWatchMode(): Promise<void> {
    const [command, ...args] = [...this.options.testCommand!.split(' '), '--watch'];
    
    this.testProcess = spawn(command, args, {
      stdio: 'pipe'
    });
    
    this.testProcess.stdout?.on('data', (data: Buffer) => {
      this.processTestOutput(data.toString());
    });
    
    this.testProcess.stderr?.on('data', (data: Buffer) => {
      this.processTestOutput(data.toString());
    });
  }
  
  private async runTests(): Promise<AutoFixIssue[]> {
    return new Promise((resolve) => {
      const issues: AutoFixIssue[] = [];
      const [command, ...args] = this.options.testCommand!.split(' ');
      
      const testProcess = spawn(command, args, {
        stdio: 'pipe'
      });
      
      let output = '';
      
      testProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      testProcess.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });
      
      testProcess.on('exit', (code) => {
        if (code !== 0) {
          const testIssues = this.parseTestOutput(output);
          resolve(testIssues);
        } else {
          resolve(issues);
        }
      });
      
      setTimeout(() => {
        testProcess.kill();
        resolve(issues);
      }, this.options.timeout);
    });
  }
  
  private processTestOutput(output: string): void {
    const issues = this.parseTestOutput(output);
    
    for (const issue of issues) {
      this.emit('issue:found', issue);
    }
  }
  
  private parseTestOutput(output: string): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    
    // Parse Jest output format
    if (output.includes('FAIL')) {
      const jestIssues = this.parseJestOutput(output);
      issues.push(...jestIssues);
    }
    
    // Parse other test framework outputs...
    
    return issues;
  }
  
  private parseJestOutput(output: string): AutoFixIssue[] {
    const issues: AutoFixIssue[] = [];
    const lines = output.split('\\n');
    
    let currentFile = '';
    let inFailedTest = false;
    let testName = '';
    let errorMessage = '';
    
    for (const line of lines) {
      // Match Jest file header: FAIL src/path/to/test.ts
      const fileMatch = line.match(/^\\s*FAIL\\s+(.+\\.test\\.[jt]s)$/);
      if (fileMatch) {
        currentFile = fileMatch[1];
        continue;
      }
      
      // Match test failure: ✕ test name
      const testMatch = line.match(/^\\s*✕\\s+(.+)$/);
      if (testMatch) {
        testName = testMatch[1];
        inFailedTest = true;
        errorMessage = '';
        continue;
      }
      
      // Collect error message lines
      if (inFailedTest && line.trim()) {
        if (line.includes('expect(')) {
          const issue: AutoFixIssue = {
            id: `test_failure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'test',
            severity: 'medium',
            title: `Test Failure: ${testName}`,
            description: `Test "${testName}" failed with assertion error`,
            location: {
              file: currentFile,
              function: testName
            },
            context: {
              testFile: true,
              testName,
              errorMessage: errorMessage.trim(),
              framework: 'jest'
            },
            detected: new Date(),
            confidence: 0.9,
            tags: ['test', 'jest', 'failure']
          };
          
          issues.push(issue);
          inFailedTest = false;
        } else {
          errorMessage += line + '\\n';
        }
      }
    }
    
    return issues;
  }
}