/**
 * Memory Manager - Bounded memory management with LRU cache
 * 
 * @file MemoryManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { LRUCache } from 'lru-cache';
import { Logger } from './Logger';
import { ExecutionResult } from '../core/ExecutionEngine';

export interface MemoryConfig {
  maxExecutionHistory: number;     // Default: 1000 entries
  maxMemoryMB: number;            // Default: 100MB
  ttlMinutes?: number;            // Optional: 60 minutes
  gcIntervalMinutes?: number;     // Default: 10 minutes
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  cacheSize: number;
  cacheEntries: number;
  hitRate: number;
  memoryPressure: number;        // 0-1 scale
}

export interface CacheMetrics {
  hitCount: number;
  missCount: number;
  size: number;
  maxSize: number;
  hitRate: number;
  entries: number;
}

export class MemoryManager {
  private logger = Logger.create({ component: 'MemoryManager' });
  private executionCache: LRUCache<string, ExecutionResult>;
  private gcTimer?: NodeJS.Timeout;
  private metrics: CacheMetrics;
  private config: Required<MemoryConfig>;

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = {
      maxExecutionHistory: config.maxExecutionHistory || 1000,
      maxMemoryMB: config.maxMemoryMB || 100,
      ttlMinutes: config.ttlMinutes || 60,
      gcIntervalMinutes: config.gcIntervalMinutes || 10
    };

    this.metrics = {
      hitCount: 0,
      missCount: 0,
      size: 0,
      maxSize: this.config.maxMemoryMB * 1024 * 1024,
      hitRate: 0,
      entries: 0
    };

    // Initialize LRU cache with bounded memory
    this.executionCache = new LRUCache<string, ExecutionResult>({
      max: this.config.maxExecutionHistory,
      maxSize: this.config.maxMemoryMB * 1024 * 1024, // Convert MB to bytes
      ttl: this.config.ttlMinutes * 60 * 1000, // Convert minutes to ms
      sizeCalculation: (value: ExecutionResult, key: string) => {
        // Calculate memory footprint of execution result
        const valueSize = JSON.stringify(value).length;
        const keySize = key.length * 2; // Unicode string
        return valueSize + keySize + 64; // Add overhead estimation
      },
      dispose: (value: ExecutionResult, key: string) => {
        this.logger.debug(`Evicted execution from cache: ${key}`);
      },
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });

    this.startGarbageCollection();
    this.logger.info(`Memory manager initialized: ${this.config.maxExecutionHistory} entries, ${this.config.maxMemoryMB}MB limit`);
  }

  /**
   * Store execution result in cache
   */
  setExecution(executionId: string, result: ExecutionResult): void {
    const key = `exec_${executionId}`;
    this.executionCache.set(key, result);
    this.updateMetrics();
    
    this.logger.debug(`Cached execution: ${executionId}, cache size: ${this.executionCache.size}`);
  }

  /**
   * Retrieve execution result from cache
   */
  getExecution(executionId: string): ExecutionResult | null {
    const key = `exec_${executionId}`;
    const result = this.executionCache.get(key);
    
    if (result) {
      this.metrics.hitCount++;
      this.logger.debug(`Cache hit: ${executionId}`);
      return result;
    } else {
      this.metrics.missCount++;
      this.logger.debug(`Cache miss: ${executionId}`);
      return null;
    }
  }

  /**
   * Get all execution results (bounded by cache size)
   */
  getAllExecutions(): ExecutionResult[] {
    const results: ExecutionResult[] = [];
    
    for (const [key, value] of this.executionCache.entries()) {
      if (key.startsWith('exec_')) {
        results.push(value);
      }
    }
    
    // Sort by timestamp (newest first)
    return results.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get execution results filtered by agent
   */
  getExecutionsByAgent(agentName: string): ExecutionResult[] {
    return this.getAllExecutions().filter(result => result.agent === agentName);
  }

  /**
   * Clear all cached executions
   */
  clearExecutions(): void {
    const beforeSize = this.executionCache.size;
    this.executionCache.clear();
    this.updateMetrics();
    
    this.logger.info(`Cleared execution cache: ${beforeSize} entries removed`);
  }

  /**
   * Remove specific execution from cache
   */
  removeExecution(executionId: string): boolean {
    const key = `exec_${executionId}`;
    const deleted = this.executionCache.delete(key);
    
    if (deleted) {
      this.updateMetrics();
      this.logger.debug(`Removed execution from cache: ${executionId}`);
    }
    
    return deleted;
  }

  /**
   * Get current memory metrics
   */
  getMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      cacheSize: this.executionCache.calculatedSize || 0,
      cacheEntries: this.executionCache.size,
      hitRate: this.metrics.hitRate,
      memoryPressure: this.calculateMemoryPressure(memUsage)
    };
  }

  /**
   * Get cache-specific metrics
   */
  getCacheMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Update internal cache metrics
   */
  private updateMetrics(): void {
    const totalRequests = this.metrics.hitCount + this.metrics.missCount;
    this.metrics.hitRate = totalRequests > 0 ? this.metrics.hitCount / totalRequests : 0;
    this.metrics.size = this.executionCache.calculatedSize || 0;
    this.metrics.entries = this.executionCache.size;
  }

  /**
   * Calculate memory pressure (0-1 scale)
   */
  private calculateMemoryPressure(memUsage: NodeJS.MemoryUsage): number {
    const heapPressure = memUsage.heapUsed / memUsage.heapTotal;
    const cachePressure = this.metrics.size / this.metrics.maxSize;
    
    // Return the higher pressure indicator
    return Math.max(heapPressure, cachePressure);
  }

  /**
   * Start garbage collection timer
   */
  private startGarbageCollection(): void {
    const intervalMs = this.config.gcIntervalMinutes * 60 * 1000;
    
    this.gcTimer = setInterval(() => {
      this.performGarbageCollection();
    }, intervalMs) as NodeJS.Timeout;

    // Perform initial cleanup
    this.performGarbageCollection();
  }

  /**
   * Perform garbage collection and memory cleanup
   */
  private performGarbageCollection(): void {
    const beforeSize = this.executionCache.size;
    const beforeMemory = process.memoryUsage().heapUsed;

    // Force LRU cache cleanup of expired entries
    this.executionCache.purgeStale();

    // Check memory pressure and force cleanup if needed
    const memoryMetrics = this.getMemoryMetrics();
    if (memoryMetrics.memoryPressure > 0.8) {
      this.logger.warn('High memory pressure detected, performing aggressive cleanup');
      
      // Remove oldest 25% of entries to reduce pressure
      const entriesToRemove = Math.floor(this.executionCache.size * 0.25);
      const entries = Array.from(this.executionCache.keys());
      
      for (let i = 0; i < entriesToRemove && entries.length > 0; i++) {
        const oldestKey = entries.pop();
        if (oldestKey) {
          this.executionCache.delete(oldestKey);
        }
      }
    }

    // Force Node.js garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const afterSize = this.executionCache.size;
    const afterMemory = process.memoryUsage().heapUsed;
    const memoryFreed = beforeMemory - afterMemory;

    if (beforeSize !== afterSize || memoryFreed > 0) {
      this.logger.debug(
        `GC completed: ${beforeSize - afterSize} entries removed, ` +
        `${(memoryFreed / 1024 / 1024).toFixed(2)}MB freed`
      );
    }

    this.updateMetrics();
  }

  /**
   * Get memory usage summary
   */
  getMemorySummary(): string {
    const metrics = this.getMemoryMetrics();
    const cacheMetrics = this.getCacheMetrics();
    
    return `Memory: ${(metrics.heapUsed / 1024 / 1024).toFixed(1)}MB heap, ` +
           `Cache: ${cacheMetrics.entries} entries (${(cacheMetrics.size / 1024 / 1024).toFixed(1)}MB), ` +
           `Hit rate: ${(cacheMetrics.hitRate * 100).toFixed(1)}%, ` +
           `Pressure: ${(metrics.memoryPressure * 100).toFixed(1)}%`;
  }

  /**
   * Check if memory limits are being respected
   */
  isWithinLimits(): boolean {
    const metrics = this.getMemoryMetrics();
    return metrics.memoryPressure < 0.9; // 90% threshold
  }

  /**
   * Force memory cleanup
   */
  forceCleanup(): void {
    this.logger.info('Forcing memory cleanup...');
    this.performGarbageCollection();
  }

  /**
   * Shutdown memory manager
   */
  shutdown(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
      this.gcTimer = undefined;
    }
    
    this.clearExecutions();
    this.logger.info('Memory manager shutdown completed');
  }

  /**
   * Get configuration summary
   */
  getConfig(): Required<MemoryConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration (requires restart for some changes)
   */
  updateConfig(newConfig: Partial<MemoryConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    this.logger.info(`Memory manager configuration updated`, {
      old: oldConfig,
      new: this.config
    });
    
    // Note: Some changes like max size require cache recreation
    // This is left for future enhancement if needed
  }
}