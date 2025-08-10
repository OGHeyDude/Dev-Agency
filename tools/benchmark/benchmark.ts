/**
 * Performance Benchmarking Suite for Dev-Agency Agents
 * Comprehensive benchmarks for agent performance profiling and comparison
 */

import { performance } from 'perf_hooks';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface BenchmarkResult {
  name: string;
  agent: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  stdDev: number;
  tokensUsed?: number;
  memoryUsed?: number;
  cacheHits?: number;
  cacheMisses?: number;
  timestamp: number;
}

export interface BenchmarkSuite {
  name: string;
  description: string;
  results: BenchmarkResult[];
  comparison?: ComparisonReport;
}

export interface ComparisonReport {
  baseline: string;
  improvements: Array<{
    agent: string;
    metric: string;
    baselineValue: number;
    currentValue: number;
    improvement: number; // percentage
  }>;
  regressions: Array<{
    agent: string;
    metric: string;
    baselineValue: number;
    currentValue: number;
    regression: number; // percentage
  }>;
}

export class PerformanceBenchmark {
  private results: Map<string, BenchmarkResult[]>;
  private baselinePath: string;
  
  constructor() {
    this.results = new Map();
    this.baselinePath = path.join(
      process.env.DEV_AGENCY_PATH || '/home/hd/Desktop/LAB/Dev-Agency',
      'benchmarks',
      'baseline.json'
    );
  }

  /**
   * Run a benchmark test
   */
  async runBenchmark(
    name: string,
    agent: string,
    testFn: () => Promise<void>,
    iterations: number = 10
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    let totalTokens = 0;
    let totalMemory = 0;
    
    console.log(`Running benchmark: ${name} (${iterations} iterations)`);
    
    for (let i = 0; i < iterations; i++) {
      // Garbage collection before each iteration if available
      if (global.gc) {
        global.gc();
      }
      
      const memStart = process.memoryUsage().heapUsed;
      const startTime = performance.now();
      
      await testFn();
      
      const endTime = performance.now();
      const memEnd = process.memoryUsage().heapUsed;
      
      const elapsed = endTime - startTime;
      times.push(elapsed);
      totalMemory += (memEnd - memStart);
      
      // Progress indicator
      process.stdout.write(`\r  Progress: ${i + 1}/${iterations}`);
    }
    
    console.log('\n  ✓ Complete');
    
    const result: BenchmarkResult = {
      name,
      agent,
      iterations,
      totalTime: times.reduce((a, b) => a + b, 0),
      avgTime: times.reduce((a, b) => a + b, 0) / iterations,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      stdDev: this.calculateStdDev(times),
      memoryUsed: totalMemory / iterations,
      timestamp: Date.now()
    };
    
    // Store result
    if (!this.results.has(agent)) {
      this.results.set(agent, []);
    }
    this.results.get(agent)!.push(result);
    
    return result;
  }

  /**
   * Run a suite of benchmarks
   */
  async runSuite(suiteName: string, tests: Array<{
    name: string;
    agent: string;
    testFn: () => Promise<void>;
    iterations?: number;
  }>): Promise<BenchmarkSuite> {
    console.log(`\n🚀 Running Benchmark Suite: ${suiteName}\n`);
    
    const results: BenchmarkResult[] = [];
    
    for (const test of tests) {
      const result = await this.runBenchmark(
        test.name,
        test.agent,
        test.testFn,
        test.iterations || 10
      );
      results.push(result);
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const suite: BenchmarkSuite = {
      name: suiteName,
      description: `Benchmark suite run at ${new Date().toISOString()}`,
      results
    };
    
    // Generate comparison if baseline exists
    if (await this.hasBaseline()) {
      suite.comparison = await this.compareWithBaseline(results);
    }
    
    return suite;
  }

  /**
   * Compare current results with baseline
   */
  async compareWithBaseline(
    currentResults: BenchmarkResult[]
  ): Promise<ComparisonReport> {
    const baseline = await this.loadBaseline();
    const report: ComparisonReport = {
      baseline: 'Previous run',
      improvements: [],
      regressions: []
    };
    
    for (const current of currentResults) {
      const baselineResult = baseline.find(
        b => b.name === current.name && b.agent === current.agent
      );
      
      if (baselineResult) {
        // Compare average time
        const timeDiff = ((baselineResult.avgTime - current.avgTime) / baselineResult.avgTime) * 100;
        
        if (timeDiff > 5) { // >5% improvement
          report.improvements.push({
            agent: current.agent,
            metric: 'avgTime',
            baselineValue: baselineResult.avgTime,
            currentValue: current.avgTime,
            improvement: timeDiff
          });
        } else if (timeDiff < -5) { // >5% regression
          report.regressions.push({
            agent: current.agent,
            metric: 'avgTime',
            baselineValue: baselineResult.avgTime,
            currentValue: current.avgTime,
            regression: Math.abs(timeDiff)
          });
        }
        
        // Compare memory usage
        if (baselineResult.memoryUsed && current.memoryUsed) {
          const memDiff = ((baselineResult.memoryUsed - current.memoryUsed) / baselineResult.memoryUsed) * 100;
          
          if (memDiff > 10) { // >10% improvement
            report.improvements.push({
              agent: current.agent,
              metric: 'memory',
              baselineValue: baselineResult.memoryUsed,
              currentValue: current.memoryUsed,
              improvement: memDiff
            });
          } else if (memDiff < -10) { // >10% regression
            report.regressions.push({
              agent: current.agent,
              metric: 'memory',
              baselineValue: baselineResult.memoryUsed,
              currentValue: current.memoryUsed,
              regression: Math.abs(memDiff)
            });
          }
        }
      }
    }
    
    return report;
  }

  /**
   * Save results as new baseline
   */
  async saveAsBaseline(results: BenchmarkResult[]): Promise<void> {
    await fs.ensureDir(path.dirname(this.baselinePath));
    await fs.writeJson(this.baselinePath, results, { spaces: 2 });
    console.log(`✓ Saved ${results.length} results as new baseline`);
  }

  /**
   * Load baseline results
   */
  async loadBaseline(): Promise<BenchmarkResult[]> {
    if (await fs.pathExists(this.baselinePath)) {
      return await fs.readJson(this.baselinePath);
    }
    return [];
  }

  /**
   * Check if baseline exists
   */
  async hasBaseline(): Promise<boolean> {
    return await fs.pathExists(this.baselinePath);
  }

  /**
   * Generate benchmark report
   */
  generateReport(suite: BenchmarkSuite): string {
    let report = `# Benchmark Report: ${suite.name}\n\n`;
    report += `${suite.description}\n\n`;
    
    // Results table
    report += `## Results\n\n`;
    report += `| Agent | Test | Iterations | Avg Time (ms) | Min | Max | Std Dev | Memory (MB) |\n`;
    report += `|-------|------|------------|---------------|-----|-----|---------|-------------|\n`;
    
    for (const result of suite.results) {
      report += `| ${result.agent} `;
      report += `| ${result.name} `;
      report += `| ${result.iterations} `;
      report += `| ${result.avgTime.toFixed(2)} `;
      report += `| ${result.minTime.toFixed(2)} `;
      report += `| ${result.maxTime.toFixed(2)} `;
      report += `| ${result.stdDev.toFixed(2)} `;
      report += `| ${(result.memoryUsed! / 1024 / 1024).toFixed(2)} |\n`;
    }
    
    // Comparison report
    if (suite.comparison) {
      report += `\n## Comparison with Baseline\n\n`;
      
      if (suite.comparison.improvements.length > 0) {
        report += `### ✅ Improvements\n\n`;
        for (const imp of suite.comparison.improvements) {
          report += `- **${imp.agent}** (${imp.metric}): `;
          report += `${imp.improvement.toFixed(1)}% faster `;
          report += `(${imp.baselineValue.toFixed(2)} → ${imp.currentValue.toFixed(2)})\n`;
        }
        report += '\n';
      }
      
      if (suite.comparison.regressions.length > 0) {
        report += `### ⚠️ Regressions\n\n`;
        for (const reg of suite.comparison.regressions) {
          report += `- **${reg.agent}** (${reg.metric}): `;
          report += `${reg.regression.toFixed(1)}% slower `;
          report += `(${reg.baselineValue.toFixed(2)} → ${reg.currentValue.toFixed(2)})\n`;
        }
        report += '\n';
      }
      
      if (suite.comparison.improvements.length === 0 && 
          suite.comparison.regressions.length === 0) {
        report += `No significant changes detected (±5% threshold)\n\n`;
      }
    }
    
    // Summary statistics
    report += `## Summary\n\n`;
    const totalTime = suite.results.reduce((sum, r) => sum + r.totalTime, 0);
    const totalIterations = suite.results.reduce((sum, r) => sum + r.iterations, 0);
    
    report += `- Total execution time: ${(totalTime / 1000).toFixed(2)}s\n`;
    report += `- Total iterations: ${totalIterations}\n`;
    report += `- Average time per operation: ${(totalTime / totalIterations).toFixed(2)}ms\n`;
    
    return report;
  }

  /**
   * Export results to JSON
   */
  async exportResults(filepath: string): Promise<void> {
    const allResults = Array.from(this.results.values()).flat();
    await fs.writeJson(filepath, allResults, { spaces: 2 });
    console.log(`✓ Exported ${allResults.length} results to ${filepath}`);
  }

  /**
   * Export results to CSV
   */
  async exportCSV(filepath: string): Promise<void> {
    const allResults = Array.from(this.results.values()).flat();
    
    const headers = [
      'Agent', 'Test', 'Iterations', 'Total Time', 'Avg Time', 
      'Min Time', 'Max Time', 'Std Dev', 'Memory (MB)', 'Timestamp'
    ];
    
    let csv = headers.join(',') + '\n';
    
    for (const result of allResults) {
      csv += [
        result.agent,
        result.name,
        result.iterations,
        result.totalTime.toFixed(2),
        result.avgTime.toFixed(2),
        result.minTime.toFixed(2),
        result.maxTime.toFixed(2),
        result.stdDev.toFixed(2),
        (result.memoryUsed! / 1024 / 1024).toFixed(2),
        new Date(result.timestamp).toISOString()
      ].join(',') + '\n';
    }
    
    await fs.writeFile(filepath, csv);
    console.log(`✓ Exported ${allResults.length} results to ${filepath}`);
  }

  // Private helper methods
  
  private calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
}

// Example benchmark tests
export class StandardBenchmarks {
  /**
   * Context loading benchmark
   */
  static async contextLoadingBenchmark(): Promise<void> {
    // Simulate context loading
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
  }

  /**
   * Agent invocation benchmark
   */
  static async agentInvocationBenchmark(): Promise<void> {
    // Simulate agent invocation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
  }

  /**
   * Recipe execution benchmark
   */
  static async recipeExecutionBenchmark(): Promise<void> {
    // Simulate recipe execution
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  }

  /**
   * Parallel execution benchmark
   */
  static async parallelExecutionBenchmark(): Promise<void> {
    // Simulate parallel execution
    const tasks = Array(5).fill(null).map(() => 
      new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50))
    );
    await Promise.all(tasks);
  }
}