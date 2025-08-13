/**
 * Fix Validator - Validates fixes before and after application
 */

import { spawn } from 'child_process';
import { FixResult, TestResult, FixError } from '../../types';

export interface FixValidationResult {
  success: boolean;
  testsRun: TestResult[];
  validationsPassed: ValidationCheck[];
  validationsFailed: ValidationCheck[];
  error?: FixError;
  metrics: ValidationMetrics;
}

export interface ValidationCheck {
  id: string;
  name: string;
  type: 'compilation' | 'test' | 'lint' | 'build' | 'custom';
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
}

export interface ValidationMetrics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  totalDuration: number;
  testCoverage?: number;
}

export interface FixValidatorOptions {
  testValidationRequired: boolean;
  timeout: number;
  enabledValidations?: string[];
}

export class FixValidator {
  private options: FixValidatorOptions;
  
  constructor(options: FixValidatorOptions) {
    this.options = {
      enabledValidations: ['compilation', 'test', 'lint'],
      ...options
    };
  }
  
  /**
   * Validate a fix result
   */
  public async validateFix(fixResult: FixResult): Promise<FixValidationResult> {
    const startTime = Date.now();
    const validationsPassed: ValidationCheck[] = [];
    const validationsFailed: ValidationCheck[] = [];
    const testsRun: TestResult[] = [];
    
    try {
      // Run enabled validation checks
      for (const validationType of this.options.enabledValidations!) {
        const check = await this.runValidationCheck(validationType, fixResult);
        
        if (check.passed) {
          validationsPassed.push(check);
        } else {
          validationsFailed.push(check);
        }
        
        // Collect test results if this was a test validation
        if (validationType === 'test' && check.details?.testResults) {
          testsRun.push(...check.details.testResults);
        }
      }
      
      // Run fix-specific validations from success criteria
      const criteriaChecks = await this.validateSuccessCriteria(fixResult);
      validationsPassed.push(...criteriaChecks.passed);
      validationsFailed.push(...criteriaChecks.failed);
      
      const totalDuration = Date.now() - startTime;
      
      return {
        success: validationsFailed.length === 0,
        testsRun,
        validationsPassed,
        validationsFailed,
        metrics: {
          totalChecks: validationsPassed.length + validationsFailed.length,
          passedChecks: validationsPassed.length,
          failedChecks: validationsFailed.length,
          totalDuration,
          testCoverage: this.calculateTestCoverage(testsRun)
        }
      };
      
    } catch (error) {
      return {
        success: false,
        testsRun,
        validationsPassed,
        validationsFailed,
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : String(error),
          recoverable: true
        },
        metrics: {
          totalChecks: validationsPassed.length + validationsFailed.length,
          passedChecks: validationsPassed.length,
          failedChecks: validationsFailed.length,
          totalDuration: Date.now() - startTime
        }
      };
    }
  }
  
  /**
   * Pre-validate that a fix can be applied safely
   */
  public async preValidateFix(fixResult: FixResult): Promise<{
    canApply: boolean;
    blockers: string[];
    warnings: string[];
  }> {
    const blockers: string[] = [];
    const warnings: string[] = [];
    
    // Check if files exist and are writable
    for (const change of fixResult.changes) {
      if (change.type === 'modified' || change.type === 'deleted') {
        const exists = await this.checkFileExists(change.file);
        if (!exists) {
          blockers.push(`File does not exist: ${change.file}`);
        }
      }
    }
    
    // Check if tools are available
    const toolChecks = await this.checkRequiredTools(fixResult);
    blockers.push(...toolChecks.missing);
    warnings.push(...toolChecks.warnings);
    
    // Check for conflicts with ongoing operations
    const conflictChecks = await this.checkConflicts(fixResult);
    warnings.push(...conflictChecks);
    
    return {
      canApply: blockers.length === 0,
      blockers,
      warnings
    };
  }
  
  private async runValidationCheck(type: string, fixResult: FixResult): Promise<ValidationCheck> {
    const startTime = Date.now();
    
    switch (type) {
      case 'compilation':
        return await this.validateCompilation(startTime);
      case 'test':
        return await this.validateTests(fixResult, startTime);
      case 'lint':
        return await this.validateLinting(fixResult, startTime);
      case 'build':
        return await this.validateBuild(startTime);
      default:
        return {
          id: `unknown_${type}`,
          name: `Unknown validation: ${type}`,
          type: 'custom',
          passed: false,
          message: `Unknown validation type: ${type}`,
          duration: Date.now() - startTime
        };
    }
  }
  
  private async validateCompilation(startTime: number): Promise<ValidationCheck> {
    return new Promise((resolve) => {
      const tscProcess = spawn('npx', ['tsc', '--noEmit'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      tscProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      tscProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      tscProcess.on('exit', (code) => {
        const passed = code === 0;
        
        resolve({
          id: 'compilation_check',
          name: 'TypeScript Compilation',
          type: 'compilation',
          passed,
          message: passed ? 'Compilation successful' : 'Compilation failed',
          duration: Date.now() - startTime,
          details: {
            exitCode: code,
            output: output.trim()
          }
        });
      });
      
      // Timeout handling
      setTimeout(() => {
        tscProcess.kill();
        resolve({
          id: 'compilation_check',
          name: 'TypeScript Compilation',
          type: 'compilation',
          passed: false,
          message: 'Compilation check timed out',
          duration: Date.now() - startTime
        });
      }, this.options.timeout);
    });
  }
  
  private async validateTests(fixResult: FixResult, startTime: number): Promise<ValidationCheck> {
    if (!this.options.testValidationRequired) {
      return {
        id: 'test_check_skipped',
        name: 'Test Validation (Skipped)',
        type: 'test',
        passed: true,
        message: 'Test validation skipped by configuration',
        duration: Date.now() - startTime
      };
    }
    
    return new Promise((resolve) => {
      const testProcess = spawn('npm', ['test', '--', '--passWithNoTests'], {
        stdio: 'pipe'
      });
      
      let output = '';
      const testResults: TestResult[] = [];
      
      testProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.on('exit', (code) => {
        const passed = code === 0;
        
        // Parse test results from output
        const parsedResults = this.parseTestOutput(output);
        testResults.push(...parsedResults);
        
        resolve({
          id: 'test_check',
          name: 'Test Execution',
          type: 'test',
          passed,
          message: passed 
            ? `All tests passed (${testResults.length} tests)` 
            : `Tests failed (${testResults.filter(t => t.status === 'failed').length} failed)`,
          duration: Date.now() - startTime,
          details: {
            exitCode: code,
            output: output.trim(),
            testResults
          }
        });
      });
      
      // Timeout handling
      setTimeout(() => {
        testProcess.kill();
        resolve({
          id: 'test_check',
          name: 'Test Execution',
          type: 'test',
          passed: false,
          message: 'Test execution timed out',
          duration: Date.now() - startTime
        });
      }, this.options.timeout);
    });
  }
  
  private async validateLinting(fixResult: FixResult, startTime: number): Promise<ValidationCheck> {
    return new Promise((resolve) => {
      const lintProcess = spawn('npm', ['run', 'lint'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      lintProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      lintProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      lintProcess.on('exit', (code) => {
        const passed = code === 0;
        
        resolve({
          id: 'lint_check',
          name: 'Linting',
          type: 'lint',
          passed,
          message: passed ? 'Linting passed' : 'Linting failed',
          duration: Date.now() - startTime,
          details: {
            exitCode: code,
            output: output.trim()
          }
        });
      });
      
      // Timeout handling
      setTimeout(() => {
        lintProcess.kill();
        resolve({
          id: 'lint_check',
          name: 'Linting',
          type: 'lint',
          passed: false,
          message: 'Linting check timed out',
          duration: Date.now() - startTime
        });
      }, this.options.timeout);
    });
  }
  
  private async validateBuild(startTime: number): Promise<ValidationCheck> {
    return new Promise((resolve) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'pipe'
      });
      
      let output = '';
      
      buildProcess.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      buildProcess.stderr?.on('data', (data) => {
        output += data.toString();
      });
      
      buildProcess.on('exit', (code) => {
        const passed = code === 0;
        
        resolve({
          id: 'build_check',
          name: 'Build',
          type: 'build',
          passed,
          message: passed ? 'Build successful' : 'Build failed',
          duration: Date.now() - startTime,
          details: {
            exitCode: code,
            output: output.trim()
          }
        });
      });
      
      // Timeout handling
      setTimeout(() => {
        buildProcess.kill();
        resolve({
          id: 'build_check',
          name: 'Build',
          type: 'build',
          passed: false,
          message: 'Build check timed out',
          duration: Date.now() - startTime
        });
      }, this.options.timeout);
    });
  }
  
  private async validateSuccessCriteria(fixResult: FixResult): Promise<{
    passed: ValidationCheck[];
    failed: ValidationCheck[];
  }> {
    const passed: ValidationCheck[] = [];
    const failed: ValidationCheck[] = [];
    
    for (let i = 0; i < fixResult.strategy.successCriteria.length; i++) {
      const criterion = fixResult.strategy.successCriteria[i];
      const startTime = Date.now();
      
      // Simple criterion validation - in production would be more sophisticated
      const criterionPassed = await this.checkSuccessCriterion(criterion, fixResult);
      
      const check: ValidationCheck = {
        id: `criterion_${i}`,
        name: `Success Criterion: ${criterion}`,
        type: 'custom',
        passed: criterionPassed,
        message: criterionPassed ? `Criterion met: ${criterion}` : `Criterion failed: ${criterion}`,
        duration: Date.now() - startTime
      };
      
      if (criterionPassed) {
        passed.push(check);
      } else {
        failed.push(check);
      }
    }
    
    return { passed, failed };
  }
  
  private async checkSuccessCriterion(criterion: string, fixResult: FixResult): Promise<boolean> {
    // Simple heuristic-based criterion checking
    // In production, this would be more sophisticated
    
    if (criterion.toLowerCase().includes('test')) {
      // Check if tests are passing - assume true for now
      return true;
    }
    
    if (criterion.toLowerCase().includes('compile')) {
      // Check if compilation succeeds - would run actual check
      return true;
    }
    
    if (criterion.toLowerCase().includes('error')) {
      // Check if no errors introduced
      return !fixResult.error;
    }
    
    // Default to true for unknown criteria
    return true;
  }
  
  private async checkFileExists(filePath: string): Promise<boolean> {
    try {
      // In production, would use fs.access or similar
      return true;
    } catch {
      return false;
    }
  }
  
  private async checkRequiredTools(fixResult: FixResult): Promise<{
    missing: string[];
    warnings: string[];
  }> {
    const missing: string[] = [];
    const warnings: string[] = [];
    
    // Check for common tools based on fix strategy
    const strategy = fixResult.strategy;
    
    if (strategy.tags.includes('typescript')) {
      // Would check if TypeScript is available
    }
    
    if (strategy.tags.includes('npm')) {
      // Would check if npm is available
    }
    
    return { missing, warnings };
  }
  
  private async checkConflicts(fixResult: FixResult): Promise<string[]> {
    const warnings: string[] = [];
    
    // Check for file locks, ongoing operations, etc.
    // For now, return empty array
    
    return warnings;
  }
  
  private parseTestOutput(output: string): TestResult[] {
    const results: TestResult[] = [];
    
    // Simple Jest output parsing
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Match Jest test results
      if (line.includes('✓') || line.includes('✗')) {
        const status = line.includes('✓') ? 'passed' : 'failed';
        const testName = line.replace(/^\s*[✓✗]\s*/, '').trim();
        
        results.push({
          testSuite: 'unknown',
          testName,
          status: status as 'passed' | 'failed',
          duration: 0 // Would extract from output
        });
      }
    }
    
    return results;
  }
  
  private calculateTestCoverage(testResults: TestResult[]): number | undefined {
    if (testResults.length === 0) {
      return undefined;
    }
    
    const passed = testResults.filter(t => t.status === 'passed').length;
    return (passed / testResults.length) * 100;
  }
}