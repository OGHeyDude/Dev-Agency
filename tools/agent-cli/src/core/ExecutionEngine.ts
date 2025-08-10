/**
 * Execution Engine - Parallel agent execution coordinator
 * 
 * @file ExecutionEngine.ts
 * @created 2025-08-09
 * @updated 2025-08-09
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EventEmitter } from 'events';
import { AgentManager, AgentInvocationOptions } from './AgentManager';
import { ConfigManager } from './ConfigManager';
import { Logger } from '../utils/Logger';
import { MemoryManager, MemoryMetrics } from '../utils/MemoryManager';
import { PerformanceCache } from '../utils/PerformanceCache';
import { securityManager } from '../utils/security';
const sanitizeHtml = require('sanitize-html');

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  metrics: {
    duration: number;
    tokens_used?: number;
    context_size: number;
  };
  agent: string;
  timestamp: string;
}

export interface SingleExecutionOptions extends AgentInvocationOptions {
  agentName: string;
}

export interface BatchExecutionOptions {
  agents: string[];
  parallelLimit: number;
  contextPath?: string;
  outputPath?: string;
  format?: string;
}

export interface BatchExecutionResult {
  total: number;
  successful: number;
  failed: number;
  results: ExecutionResult[];
  summary: string;
}

export interface ExecutionStatus {
  active_executions: number;
  queued_executions: number;
  completed_today: number;
  failed_today: number;
  total_agents_available: number;
}

export interface ExecutionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  agent?: string;
  message: string;
  duration?: number;
}

export interface ExecutionMetrics {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  average_duration: number;
  total_tokens_used: number;
  agents_usage: Record<string, number>;
  performance_by_agent: Record<string, {
    avg_duration: number;
    success_rate: number;
    total_runs: number;
  }>;
}

export class ExecutionEngine extends EventEmitter {
  private logger = Logger.create({ component: 'ExecutionEngine' });
  private agentManager: AgentManager;
  private memoryManager: MemoryManager;
  private performanceCache: PerformanceCache;
  // private configManager: ConfigManager; // TODO: Use or remove
  
  private activeExecutions = new Map<string, ExecutionResult>();
  private executionQueue: SingleExecutionOptions[] = [];
  private metrics!: ExecutionMetrics;

  constructor() {
    super();
    this.agentManager = new AgentManager();
    this.memoryManager = new MemoryManager({
      maxExecutionHistory: 1000,
      maxMemoryMB: 100,
      ttlMinutes: 60
    });
    this.performanceCache = new PerformanceCache({
      memoryCacheMaxMB: 50,
      fileCacheMaxMB: 200,
      ttlMinutes: 60
    });
    // this.configManager = new ConfigManager(); // TODO: Use or remove
    this.initializeMetrics();
    
    this.logger.info('ExecutionEngine initialized with performance optimizations');
  }

  /**
   * Initialize execution metrics
   */
  private initializeMetrics(): void {
    this.metrics = {
      total_executions: 0,
      successful_executions: 0,
      failed_executions: 0,
      average_duration: 0,
      total_tokens_used: 0,
      agents_usage: {},
      performance_by_agent: {}
    };
  }

  /**
   * Execute single agent
   */
  async executeSingle(options: SingleExecutionOptions): Promise<ExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    this.logger.info(`Starting execution: ${options.agentName} [${executionId}]`);
    
    try {
      // Validate agent and options
      const validation = await this.agentManager.validateAgent(options.agentName, options);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Get agent definition
      const agent = await this.agentManager.getAgent(options.agentName);
      if (!agent) {
        throw new Error(`Agent not found: ${options.agentName}`);
      }

      // Prepare context
      const context = await this.agentManager.prepareContext(agent, options);
      
      // Create execution result placeholder
      const result: ExecutionResult = {
        success: false,
        agent: options.agentName,
        timestamp: new Date().toISOString(),
        metrics: {
          duration: 0,
          context_size: context.length
        }
      };

      // Add to active executions
      this.activeExecutions.set(executionId, result);
      this.emit('execution:started', { executionId, agent: options.agentName });

      // Execute in worker thread for timeout support
      const workerResult = await this.executeInWorker({
        agentName: options.agentName,
        context,
        options,
        timeout: options.timeout || 300000
      });

      // Process result
      result.success = workerResult.success;
      result.output = workerResult.output;
      result.error = workerResult.error;
      result.metrics.duration = Date.now() - startTime;
      result.metrics.tokens_used = workerResult.tokens_used;

      // Save output if requested with security validation
      if (options.outputPath && result.output) {
        // Validate output path security
        const pathValidation = await securityManager.validatePath(options.outputPath, 'write');
        if (!pathValidation.isValid) {
          this.logger.error('Output path security validation failed:', pathValidation.violations);
          result.error = `Output path security validation failed: ${pathValidation.violations.join(', ')}`;
        } else {
          await this.saveOutput(result.output, pathValidation.resolvedPath!, options.format || 'text');
        }
      }

      // Update metrics
      this.updateMetrics(result);
      
      // Remove from active executions and store in memory-managed cache
      this.activeExecutions.delete(executionId);
      this.memoryManager.setExecution(executionId, result);

      this.emit('execution:completed', { executionId, result });
      this.logger.info(`Completed execution: ${options.agentName} [${executionId}] in ${result.metrics.duration}ms`);

      return result;
    } catch (error) {
      const result: ExecutionResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        agent: options.agentName,
        timestamp: new Date().toISOString(),
        metrics: {
          duration: Date.now() - startTime,
          context_size: 0
        }
      };

      this.activeExecutions.delete(executionId);
      this.memoryManager.setExecution(executionId, result);
      this.updateMetrics(result);

      this.emit('execution:failed', { executionId, error: result.error });
      this.logger.error(`Failed execution: ${options.agentName} [${executionId}]:`, error);

      throw error;
    }
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeBatch(options: BatchExecutionOptions): Promise<BatchExecutionResult> {
    const startTime = Date.now();
    this.logger.info(`Starting batch execution: ${options.agents.length} agents, ${options.parallelLimit} parallel`);

    // Prepare execution options for each agent with security validation
    const executions: SingleExecutionOptions[] = [];
    for (const agentName of options.agents) {
      let secureOutputPath: string | undefined;
      if (options.outputPath) {
        secureOutputPath = await this.generateSecureOutputPath(options.outputPath, agentName);
      }
      
      executions.push({
        agentName,
        contextPath: options.contextPath,
        outputPath: secureOutputPath,
        format: options.format
      });
    }

    // Execute with concurrency limit
    const results = await this.executeWithConcurrency(executions, options.parallelLimit);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    const summary = this.generateBatchSummary(results, Date.now() - startTime);
    
    this.logger.info(`Batch execution completed: ${successful}/${results.length} successful in ${Date.now() - startTime}ms`);

    return {
      total: results.length,
      successful,
      failed,
      results,
      summary
    };
  }

  /**
   * Execute agents with concurrency control
   */
  private async executeWithConcurrency(
    executions: SingleExecutionOptions[], 
    concurrencyLimit: number
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const inProgress = new Set<Promise<ExecutionResult>>();

    for (const execution of executions) {
      // Wait if we've hit the concurrency limit
      if (inProgress.size >= concurrencyLimit) {
        const completed = await Promise.race(inProgress);
        results.push(completed);
        inProgress.delete(Promise.resolve(completed));
      }

      // Start new execution
      const promise = this.executeSingle(execution).catch(error => {
        // Convert errors to ExecutionResult
        return {
          success: false,
          error: error.message,
          agent: execution.agentName,
          timestamp: new Date().toISOString(),
          metrics: {
            duration: 0,
            context_size: 0
          }
        };
      });

      inProgress.add(promise);
    }

    // Wait for remaining executions
    while (inProgress.size > 0) {
      const completed = await Promise.race(inProgress);
      results.push(completed);
      inProgress.delete(Promise.resolve(completed));
    }

    return results;
  }

  /**
   * Generate secure output path for batch execution
   */
  private async generateSecureOutputPath(basePath: string, agentName: string): Promise<string> {
    // Validate base path first
    const pathValidation = await securityManager.validatePath(basePath, 'write');
    if (!pathValidation.isValid) {
      throw new Error(`Base output path validation failed: ${pathValidation.violations.join(', ')}`);
    }
    
    // Generate agent-specific path
    const sanitizedAgentName = agentName.replace(/[^a-zA-Z0-9\-_]/g, '_');
    const agentPath = path.join(path.dirname(pathValidation.resolvedPath!), `${sanitizedAgentName}_${path.basename(pathValidation.resolvedPath!)}`);
    
    // Validate the generated path
    const agentPathValidation = await securityManager.validatePath(agentPath, 'write');
    if (!agentPathValidation.isValid) {
      throw new Error(`Generated agent path validation failed: ${agentPathValidation.violations.join(', ')}`);
    }
    
    return agentPathValidation.resolvedPath!;
  }

  /**
   * Sanitize output content
   */
  private sanitizeOutput(output: string): string {
    if (typeof output !== 'string') {
      return String(output);
    }
    
    // Remove null bytes and control characters
    let sanitized = output.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
    
    // Check for and log potential injection patterns
    const injectionPatterns = [
      { name: 'script_tag', pattern: /<script[\s\S]*?>/gi },
      { name: 'javascript_protocol', pattern: /javascript:/gi },
      { name: 'event_handler', pattern: /on\w+\s*=/gi },
      { name: 'eval_function', pattern: /eval\s*\(/gi },
      { name: 'function_constructor', pattern: /Function\s*\(/gi }
    ];
    
    for (const { name, pattern } of injectionPatterns) {
      if (pattern.test(sanitized)) {
        this.logger.warn(`Potential ${name} detected in output, sanitizing`, { pattern: pattern.source });
        // Remove the dangerous pattern
        sanitized = sanitized.replace(pattern, '[SANITIZED_CONTENT]');
      }
    }
    
    return sanitized;
  }

  /**
   * Recursively sanitize JSON object
   */
  private sanitizeJsonObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeOutput(obj);
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeJsonObject(item));
    } else if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        sanitized[sanitizedKey] = this.sanitizeJsonObject(value);
      }
      return sanitized;
    }
    return obj;
  }

  /**
   * Execute agent in worker thread with timeout
   */
  private async executeInWorker(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: data
      });

      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error('Execution timeout'));
      }, data.timeout);

      worker.on('message', (result) => {
        clearTimeout(timeout);
        resolve(result);
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      worker.on('exit', (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Save execution output to file with security validation
   */
  private async saveOutput(output: string, outputPath: string, format: string): Promise<void> {
    // Validate and sanitize the output path (should already be validated but double-check)
    const pathValidation = await securityManager.validatePath(outputPath, 'write');
    if (!pathValidation.isValid) {
      throw new Error(`Output path validation failed: ${pathValidation.violations.join(', ')}`);
    }
    
    await fs.ensureDir(path.dirname(pathValidation.resolvedPath!));
    
    // Sanitize output content to prevent injection
    let content = this.sanitizeOutput(output);
    
    // Format output based on format type
    switch (format) {
      case 'json':
        try {
          const parsed = JSON.parse(content);
          // Sanitize JSON values
          const sanitizedJson = this.sanitizeJsonObject(parsed);
          content = JSON.stringify(sanitizedJson, null, 2);
        } catch {
          content = JSON.stringify({ output: this.sanitizeOutput(output) }, null, 2);
        }
        break;
        
      case 'markdown':
        // Sanitize markdown content
        content = sanitizeHtml(content, {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'pre', 'code', 'blockquote'],
          allowedAttributes: {},
          disallowedTagsMode: 'escape'
        });
        if (!content.includes('# ') && !content.includes('## ')) {
          content = `# Agent Output\n\n${content}`;
        }
        break;
        
      case 'text':
      default:
        // Already sanitized above
        break;
    }
    
    // Use secure file write
    await securityManager.secureWriteFile(pathValidation.resolvedPath!, content);
    this.logger.debug(`Output saved securely to: ${outputPath}`);
  }

  /**
   * Update execution metrics
   */
  private updateMetrics(result: ExecutionResult): void {
    this.metrics.total_executions++;
    
    if (result.success) {
      this.metrics.successful_executions++;
    } else {
      this.metrics.failed_executions++;
    }
    
    // Update average duration
    this.metrics.average_duration = 
      (this.metrics.average_duration * (this.metrics.total_executions - 1) + result.metrics.duration) / 
      this.metrics.total_executions;
    
    // Update tokens used
    if (result.metrics.tokens_used) {
      this.metrics.total_tokens_used += result.metrics.tokens_used;
    }
    
    // Update agent usage
    this.metrics.agents_usage[result.agent] = (this.metrics.agents_usage[result.agent] || 0) + 1;
    
    // Update per-agent performance
    if (!this.metrics.performance_by_agent[result.agent]) {
      this.metrics.performance_by_agent[result.agent] = {
        avg_duration: 0,
        success_rate: 0,
        total_runs: 0
      };
    }
    
    const agentMetrics = this.metrics.performance_by_agent[result.agent];
    agentMetrics.total_runs++;
    agentMetrics.avg_duration = 
      (agentMetrics.avg_duration * (agentMetrics.total_runs - 1) + result.metrics.duration) / 
      agentMetrics.total_runs;
    
    // Calculate success rate from memory-managed history
    const agentExecutions = this.memoryManager.getExecutionsByAgent(result.agent);
    const successfulRuns = agentExecutions.filter(r => r.success).length;
    agentMetrics.success_rate = (successfulRuns / agentExecutions.length) * 100;
  }

  /**
   * Generate batch execution summary
   */
  private generateBatchSummary(results: ExecutionResult[], totalDuration: number): string {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    let summary = `## Batch Execution Summary\n\n`;
    summary += `- **Total Agents**: ${results.length}\n`;
    summary += `- **Successful**: ${successful.length}\n`;
    summary += `- **Failed**: ${failed.length}\n`;
    summary += `- **Total Duration**: ${(totalDuration / 1000).toFixed(2)}s\n`;
    summary += `- **Average per Agent**: ${(totalDuration / results.length / 1000).toFixed(2)}s\n\n`;
    
    if (successful.length > 0) {
      summary += `### Successful Executions\n`;
      successful.forEach(result => {
        summary += `- **${result.agent}**: ${(result.metrics.duration / 1000).toFixed(2)}s\n`;
      });
      summary += `\n`;
    }
    
    if (failed.length > 0) {
      summary += `### Failed Executions\n`;
      failed.forEach(result => {
        summary += `- **${result.agent}**: ${result.error}\n`;
      });
      summary += `\n`;
    }
    
    return summary;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current execution status
   */
  async getStatus(activeOnly: boolean = false): Promise<ExecutionStatus | any> {
    if (activeOnly) {
      return Array.from(this.activeExecutions.values());
    }
    
    const today = new Date().toDateString();
    const allExecutions = this.memoryManager.getAllExecutions();
    const todayResults = allExecutions.filter((r: ExecutionResult) => 
      new Date(r.timestamp).toDateString() === today
    );
    
    return {
      active_executions: this.activeExecutions.size,
      queued_executions: this.executionQueue.length,
      completed_today: todayResults.filter((r: ExecutionResult) => r.success).length,
      failed_today: todayResults.filter((r: ExecutionResult) => !r.success).length,
      total_agents_available: (await this.agentManager.getAllAgents()).length
    };
  }

  /**
   * Get execution logs
   */
  async getLogs(options: { agent?: string; limit?: number }): Promise<ExecutionLog[]> {
    const executionHistory = options.agent ? 
      this.memoryManager.getExecutionsByAgent(options.agent) :
      this.memoryManager.getAllExecutions();

    let logs = executionHistory
      .map(result => ({
        timestamp: result.timestamp,
        level: result.success ? 'info' as const : 'error' as const,
        agent: result.agent,
        message: result.success ? 
          `Execution completed in ${result.metrics.duration}ms` : 
          `Execution failed: ${result.error}`,
        duration: result.metrics.duration
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (options.limit) {
      logs = logs.slice(0, options.limit);
    }
    
    return logs;
  }

  /**
   * Get performance metrics
   */
  async getMetrics(summaryOnly: boolean = false): Promise<ExecutionMetrics | any> {
    if (summaryOnly) {
      return {
        total_executions: this.metrics.total_executions,
        success_rate: (this.metrics.successful_executions / this.metrics.total_executions * 100).toFixed(1),
        average_duration: `${(this.metrics.average_duration / 1000).toFixed(2)}s`,
        most_used_agent: Object.entries(this.metrics.agents_usage)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
      };
    }
    
    return { ...this.metrics };
  }

  /**
   * Alias for executeSingle - invoke a single agent
   */
  async invokeAgent(options: SingleExecutionOptions): Promise<ExecutionResult> {
    return this.executeSingle(options);
  }

  /**
   * Alias for executeBatch - execute multiple agents in parallel
   */
  async batchExecute(options: BatchExecutionOptions): Promise<BatchExecutionResult> {
    return this.executeBatch(options);
  }

  /**
   * Get memory metrics from the memory manager
   */
  getMemoryMetrics(): MemoryMetrics {
    return this.memoryManager.getMemoryMetrics();
  }

  /**
   * Get cache metrics from the performance cache
   */
  getCacheMetrics() {
    return this.performanceCache.getMetrics();
  }

  /**
   * Get comprehensive performance status
   */
  async getPerformanceStatus(): Promise<{
    memory: MemoryMetrics;
    cache: any;
    execution: ExecutionMetrics;
    health: {
      memoryHealthy: boolean;
      cacheHealthy: boolean;
      overallHealthy: boolean;
    };
  }> {
    const memoryMetrics = this.getMemoryMetrics();
    const cacheMetrics = this.getCacheMetrics();
    const executionMetrics = await this.getMetrics();

    const memoryHealthy = this.memoryManager.isWithinLimits();
    const cacheHealthy = this.performanceCache.isHealthy();

    return {
      memory: memoryMetrics,
      cache: cacheMetrics,
      execution: executionMetrics,
      health: {
        memoryHealthy,
        cacheHealthy,
        overallHealthy: memoryHealthy && cacheHealthy
      }
    };
  }

  /**
   * Get performance summary string
   */
  getPerformanceSummary(): string {
    const memSummary = this.memoryManager.getMemorySummary();
    const cacheSummary = this.performanceCache.getCacheStatus();
    return `${memSummary} | ${cacheSummary}`;
  }

  /**
   * Clear caches and reset performance data
   */
  async clearPerformanceData(): Promise<void> {
    await this.performanceCache.clear();
    this.memoryManager.clearExecutions();
    this.logger.info('Performance data cleared');
  }

  /**
   * Force memory cleanup
   */
  forceMemoryCleanup(): void {
    this.memoryManager.forceCleanup();
    this.logger.info('Memory cleanup forced');
  }

  /**
   * Shutdown the execution engine and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down ExecutionEngine...');
    
    // Wait for active executions to complete or timeout
    const activeCount = this.activeExecutions.size;
    if (activeCount > 0) {
      this.logger.info(`Waiting for ${activeCount} active executions to complete...`);
      
      // Give active executions 30 seconds to complete
      const timeout = setTimeout(() => {
        this.logger.warn('Timeout waiting for executions, forcing shutdown');
      }, 30000);

      // Wait for all active executions
      while (this.activeExecutions.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      clearTimeout(timeout);
    }

    // Shutdown components
    this.memoryManager.shutdown();
    await this.performanceCache.shutdown();
    
    this.logger.info('ExecutionEngine shutdown completed');
  }
}

// Worker thread execution logic
if (!isMainThread) {
  const { agentName, context, options } = workerData;
  
  // Simulate agent execution
  // In real implementation, this would invoke Claude Code with the agent context
  const simulateExecution = async (): Promise<any> => {
    const startTime = Date.now();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      output: success ? `Agent ${agentName} completed successfully.\n\nContext processed: ${context.length} characters\n\nTask: ${options.task || 'No task specified'}` : undefined,
      error: success ? undefined : `Agent ${agentName} encountered an error during execution`,
      tokens_used: Math.floor(context.length / 4), // Rough token estimation
      duration: Date.now() - startTime
    };
  };
  
  simulateExecution()
    .then(result => parentPort?.postMessage(result))
    .catch(error => parentPort?.postMessage({ success: false, error: error.message }));
}