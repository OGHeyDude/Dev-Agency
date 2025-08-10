/**
 * Performance Cache - Multi-level caching system for context and file operations
 * 
 * @file PerformanceCache.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { LRUCache } from 'lru-cache';
import NodeCache from 'node-cache';
import { Logger } from './Logger';
import { securityManager } from './security';

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  size: number;
  hash: string;
  metadata?: Record<string, any>;
}

export interface CacheMetrics {
  hitCount: number;
  missCount: number;
  totalRequests: number;
  hitRate: number;
  memoryCacheSize: number;
  fileCacheSize: number;
  totalEntries: number;
  averageResponseTime: number;
}

export interface CacheConfig {
  memoryCacheMaxMB: number;        // Default: 50MB
  fileCacheMaxMB: number;          // Default: 200MB
  maxEntries: number;              // Default: 1000
  ttlMinutes: number;              // Default: 60 minutes
  cacheDir: string;                // Default: .cache
  enabled: boolean;                // Default: true
  compression: boolean;            // Default: false
}

export interface ContextCacheEntry {
  content: string;
  fileCount: number;
  totalSize: number;
  fileHashes: Record<string, string>;
  contextPath: string;
}

export class PerformanceCache {
  private logger = Logger.create({ component: 'PerformanceCache' });
  private memoryCache: LRUCache<string, any>;
  private fileCache: NodeCache;
  private config: Required<CacheConfig>;
  private metrics: CacheMetrics;
  private responseTimes: number[] = [];

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      memoryCacheMaxMB: config.memoryCacheMaxMB || 50,
      fileCacheMaxMB: config.fileCacheMaxMB || 200,
      maxEntries: config.maxEntries || 1000,
      ttlMinutes: config.ttlMinutes || 60,
      cacheDir: config.cacheDir || path.join(process.cwd(), '.cache'),
      enabled: config.enabled !== undefined ? config.enabled : true,
      compression: config.compression || false
    };

    this.metrics = {
      hitCount: 0,
      missCount: 0,
      totalRequests: 0,
      hitRate: 0,
      memoryCacheSize: 0,
      fileCacheSize: 0,
      totalEntries: 0,
      averageResponseTime: 0
    };

    // Initialize memory cache (L1 cache)
    this.memoryCache = new LRUCache({
      max: this.config.maxEntries,
      maxSize: this.config.memoryCacheMaxMB * 1024 * 1024,
      ttl: this.config.ttlMinutes * 60 * 1000,
      sizeCalculation: (value: any, key: string) => {
        return JSON.stringify({ key, value }).length + 128; // Add overhead
      },
      dispose: (value: any, key: string) => {
        this.logger.debug(`Evicted from memory cache: ${key}`);
      }
    });

    // Initialize file cache (L2 cache)
    this.fileCache = new NodeCache({
      stdTTL: this.config.ttlMinutes * 60,
      checkperiod: 600, // Check expired entries every 10 minutes
      useClones: false
    });

    this.initializeCacheDirectory();
    this.logger.info(`Performance cache initialized: ${this.config.memoryCacheMaxMB}MB memory, ${this.config.fileCacheMaxMB}MB disk`);
  }

  /**
   * Get cached context with file modification time validation
   */
  async getContext(contextPath: string): Promise<ContextCacheEntry | null> {
    if (!this.config.enabled) return null;

    const startTime = Date.now();
    const cacheKey = await this.generateContextCacheKey(contextPath);
    
    try {
      // Check L1 cache (memory)
      const memoryResult = this.memoryCache.get(cacheKey) as ContextCacheEntry;
      if (memoryResult && await this.isContextCacheValid(memoryResult, contextPath)) {
        this.recordHit(Date.now() - startTime);
        this.logger.debug(`Context cache hit (memory): ${contextPath}`);
        return memoryResult;
      }

      // Check L2 cache (file system)
      const fileResult = await this.getFromFileCache<ContextCacheEntry>(cacheKey);
      if (fileResult && await this.isContextCacheValid(fileResult, contextPath)) {
        // Promote to L1 cache
        this.memoryCache.set(cacheKey, fileResult);
        this.recordHit(Date.now() - startTime);
        this.logger.debug(`Context cache hit (file): ${contextPath}`);
        return fileResult;
      }

      // Cache miss
      this.recordMiss(Date.now() - startTime);
      return null;
      
    } catch (error) {
      this.logger.warn(`Error retrieving context cache: ${error}`);
      this.recordMiss(Date.now() - startTime);
      return null;
    }
  }

  /**
   * Cache context with file hashes for validation
   */
  async setContext(contextPath: string, content: string, fileCount: number, totalSize: number): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const cacheKey = await this.generateContextCacheKey(contextPath);
      const fileHashes = await this.generateFileHashes(contextPath);
      
      const cacheEntry: ContextCacheEntry = {
        content,
        fileCount,
        totalSize,
        fileHashes,
        contextPath
      };

      // Store in L1 cache (memory)
      this.memoryCache.set(cacheKey, cacheEntry);
      
      // Store in L2 cache (file system) for persistence
      await this.setToFileCache(cacheKey, cacheEntry);
      
      this.logger.debug(`Cached context: ${contextPath} (${fileCount} files, ${totalSize} bytes)`);
      
    } catch (error) {
      this.logger.warn(`Error caching context: ${error}`);
    }
  }

  /**
   * Generic get with multi-level caching
   */
  async get<T>(key: string, category: string = 'default'): Promise<T | null> {
    if (!this.config.enabled) return null;

    const startTime = Date.now();
    const fullKey = `${category}:${key}`;
    
    try {
      // Check L1 cache (memory)
      const memoryResult = this.memoryCache.get(fullKey) as T;
      if (memoryResult !== undefined) {
        this.recordHit(Date.now() - startTime);
        return memoryResult;
      }

      // Check L2 cache (file)
      const fileResult = await this.getFromFileCache<T>(fullKey);
      if (fileResult !== null) {
        // Promote to L1 cache
        this.memoryCache.set(fullKey, fileResult);
        this.recordHit(Date.now() - startTime);
        return fileResult;
      }

      this.recordMiss(Date.now() - startTime);
      return null;
      
    } catch (error) {
      this.logger.warn(`Error retrieving cache: ${error}`);
      this.recordMiss(Date.now() - startTime);
      return null;
    }
  }

  /**
   * Generic set with multi-level caching
   */
  async set<T>(key: string, value: T, category: string = 'default', ttlMinutes?: number): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const fullKey = `${category}:${key}`;
      const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : undefined;
      
      // Store in L1 cache (memory)
      if (ttl) {
        this.memoryCache.set(fullKey, value, { ttl });
      } else {
        this.memoryCache.set(fullKey, value);
      }
      
      // Store in L2 cache (file)
      await this.setToFileCache(fullKey, value, ttlMinutes);
      
      this.logger.debug(`Cached value: ${fullKey}`);
      
    } catch (error) {
      this.logger.warn(`Error setting cache: ${error}`);
    }
  }

  /**
   * Delete from all cache levels
   */
  async delete(key: string, category: string = 'default'): Promise<boolean> {
    const fullKey = `${category}:${key}`;
    
    let deleted = false;
    
    // Delete from L1 cache
    if (this.memoryCache.delete(fullKey)) {
      deleted = true;
    }
    
    // Delete from L2 cache
    if (await this.deleteFromFileCache(fullKey)) {
      deleted = true;
    }
    
    if (deleted) {
      this.logger.debug(`Deleted from cache: ${fullKey}`);
    }
    
    return deleted;
  }

  /**
   * Clear all cache levels
   */
  async clear(category?: string): Promise<void> {
    if (category) {
      // Clear specific category
      const keysToDelete: string[] = [];
      
      // Get keys from memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`${category}:`)) {
          keysToDelete.push(key);
        }
      }
      
      // Delete from both levels
      for (const key of keysToDelete) {
        this.memoryCache.delete(key);
        await this.deleteFromFileCache(key);
      }
      
      this.logger.info(`Cleared cache category: ${category} (${keysToDelete.length} entries)`);
    } else {
      // Clear all caches
      this.memoryCache.clear();
      this.fileCache.flushAll();
      await this.clearFileCacheDirectory();
      this.logger.info('Cleared all caches');
    }
    
    this.updateMetrics();
  }

  /**
   * Generate cache key for context path
   */
  private async generateContextCacheKey(contextPath: string): Promise<string> {
    // Create hash from path and modification times
    const pathValidation = await securityManager.validatePath(contextPath, 'read');
    if (!pathValidation.isValid) {
      throw new Error(`Invalid context path: ${contextPath}`);
    }
    
    const resolvedPath = pathValidation.resolvedPath!;
    const stats = await fs.stat(resolvedPath);
    const pathHash = crypto.createHash('md5').update(resolvedPath).digest('hex').substr(0, 8);
    const timeHash = crypto.createHash('md5').update(stats.mtime.toISOString()).digest('hex').substr(0, 8);
    
    return `context:${pathHash}:${timeHash}`;
  }

  /**
   * Generate file hashes for cache validation
   */
  private async generateFileHashes(contextPath: string): Promise<Record<string, string>> {
    const pathValidation = await securityManager.validatePath(contextPath, 'read');
    if (!pathValidation.isValid) {
      return {};
    }
    
    const resolvedPath = pathValidation.resolvedPath!;
    const stats = await fs.stat(resolvedPath);
    const fileHashes: Record<string, string> = {};
    
    if (stats.isFile()) {
      const content = await securityManager.secureReadFile(resolvedPath);
      fileHashes[resolvedPath] = crypto.createHash('md5').update(content).digest('hex');
    } else if (stats.isDirectory()) {
      // Hash directory modification time as a simple approach
      fileHashes[resolvedPath] = crypto.createHash('md5').update(stats.mtime.toISOString()).digest('hex');
    }
    
    return fileHashes;
  }

  /**
   * Validate context cache against file system
   */
  private async isContextCacheValid(cacheEntry: ContextCacheEntry, contextPath: string): Promise<boolean> {
    try {
      const currentHashes = await this.generateFileHashes(contextPath);
      
      // Simple validation - check if directory mtime changed
      for (const [filePath, hash] of Object.entries(currentHashes)) {
        if (cacheEntry.fileHashes[filePath] !== hash) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      this.logger.debug(`Cache validation failed: ${error}`);
      return false;
    }
  }

  /**
   * Get from file cache
   */
  private async getFromFileCache<T>(key: string): Promise<T | null> {
    try {
      const cacheFilePath = path.join(this.config.cacheDir, `${this.sanitizeKey(key)}.json`);
      
      if (!await fs.pathExists(cacheFilePath)) {
        return null;
      }
      
      const stats = await fs.stat(cacheFilePath);
      const now = Date.now();
      const ttl = this.config.ttlMinutes * 60 * 1000;
      
      if (now - stats.mtime.getTime() > ttl) {
        // Expired, remove file
        await fs.remove(cacheFilePath);
        return null;
      }
      
      const content = await fs.readFile(cacheFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      
      return parsed.value as T;
      
    } catch (error) {
      this.logger.debug(`Error reading file cache: ${error}`);
      return null;
    }
  }

  /**
   * Set to file cache
   */
  private async setToFileCache<T>(key: string, value: T, ttlMinutes?: number): Promise<void> {
    try {
      const cacheFilePath = path.join(this.config.cacheDir, `${this.sanitizeKey(key)}.json`);
      
      const cacheEntry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        size: JSON.stringify(value).length,
        hash: crypto.createHash('md5').update(JSON.stringify(value)).digest('hex')
      };
      
      await fs.writeFile(cacheFilePath, JSON.stringify(cacheEntry, null, 2));
      
    } catch (error) {
      this.logger.warn(`Error writing file cache: ${error}`);
    }
  }

  /**
   * Delete from file cache
   */
  private async deleteFromFileCache(key: string): Promise<boolean> {
    try {
      const cacheFilePath = path.join(this.config.cacheDir, `${this.sanitizeKey(key)}.json`);
      
      if (await fs.pathExists(cacheFilePath)) {
        await fs.remove(cacheFilePath);
        return true;
      }
      
      return false;
      
    } catch (error) {
      this.logger.debug(`Error deleting file cache: ${error}`);
      return false;
    }
  }

  /**
   * Clear file cache directory
   */
  private async clearFileCacheDirectory(): Promise<void> {
    try {
      if (await fs.pathExists(this.config.cacheDir)) {
        await fs.emptyDir(this.config.cacheDir);
      }
    } catch (error) {
      this.logger.warn(`Error clearing file cache directory: ${error}`);
    }
  }

  /**
   * Sanitize key for file system
   */
  private sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9\-_:.]/g, '_');
  }

  /**
   * Initialize cache directory
   */
  private async initializeCacheDirectory(): Promise<void> {
    try {
      await fs.ensureDir(this.config.cacheDir);
      this.logger.debug(`Cache directory ensured: ${this.config.cacheDir}`);
    } catch (error) {
      this.logger.error(`Failed to initialize cache directory: ${error}`);
      this.config.enabled = false;
    }
  }

  /**
   * Record cache hit
   */
  private recordHit(responseTime: number): void {
    this.metrics.hitCount++;
    this.metrics.totalRequests++;
    this.responseTimes.push(responseTime);
    this.updateMetrics();
  }

  /**
   * Record cache miss
   */
  private recordMiss(responseTime: number): void {
    this.metrics.missCount++;
    this.metrics.totalRequests++;
    this.responseTimes.push(responseTime);
    this.updateMetrics();
  }

  /**
   * Update internal metrics
   */
  private updateMetrics(): void {
    this.metrics.hitRate = this.metrics.totalRequests > 0 ? 
      this.metrics.hitCount / this.metrics.totalRequests : 0;
    this.metrics.memoryCacheSize = this.memoryCache.calculatedSize || 0;
    this.metrics.totalEntries = this.memoryCache.size;
    
    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    }
    
    // Keep only last 1000 response times to prevent memory growth
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
  }

  /**
   * Get current cache metrics
   */
  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Get cache status summary
   */
  getCacheStatus(): string {
    const metrics = this.getMetrics();
    return `Cache: ${metrics.totalEntries} entries, ` +
           `${(metrics.hitRate * 100).toFixed(1)}% hit rate, ` +
           `${(metrics.memoryCacheSize / 1024 / 1024).toFixed(1)}MB memory, ` +
           `${metrics.averageResponseTime.toFixed(1)}ms avg response`;
  }

  /**
   * Check if cache is healthy
   */
  isHealthy(): boolean {
    const metrics = this.getMetrics();
    return this.config.enabled && 
           metrics.hitRate > 0.3 && // At least 30% hit rate
           metrics.averageResponseTime < 100; // Under 100ms average
  }

  /**
   * Get configuration
   */
  getConfig(): Required<CacheConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('Cache configuration updated', newConfig);
  }

  /**
   * Shutdown cache
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down performance cache...');
    this.memoryCache.clear();
    this.fileCache.close();
    
    const metrics = this.getMetrics();
    this.logger.info(`Cache shutdown completed. Final metrics: ${JSON.stringify(metrics)}`);
  }
}