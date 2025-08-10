/**
 * Cached Response Strategy - Serve cached responses during degradation
 * 
 * @file CachedResponseStrategy.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { DegradationStrategy, DegradationContext, DegradationLevel } from '../DegradationManager';

export interface CachedResponse {
  key: string;
  data: any;
  timestamp: number;
  ttl: number;
  metadata?: Record<string, any>;
}

export class CachedResponseStrategy implements DegradationStrategy {
  name = 'cached_response';
  priority: number;
  private cache = new Map<string, CachedResponse>();
  private maxCacheSize = 1000;
  private defaultTtl = 3600000; // 1 hour

  constructor(priority: number = 1) {
    this.priority = priority;
  }

  /**
   * Check if this strategy can handle the degradation context
   */
  canHandle(context: DegradationContext): boolean {
    // Cache strategy can handle most degradation scenarios
    return [
      'agent_unavailable',
      'circuit_breaker_open', 
      'high_error_rate',
      'timeout_exceeded'
    ].some(reason => context.trigger.includes(reason)) ||
    context.severity === DegradationLevel.PARTIAL ||
    context.severity === DegradationLevel.SIGNIFICANT;
  }

  /**
   * Execute cached response strategy
   */
  async execute(context: DegradationContext, originalRequest: any): Promise<any> {
    const cacheKey = this.generateCacheKey(context, originalRequest);
    
    // Try to get cached response
    const cachedResponse = this.getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      console.log(`Serving cached response for ${context.component}`);
      
      return {
        success: true,
        output: cachedResponse.data,
        fromCache: true,
        cacheTimestamp: new Date(cachedResponse.timestamp).toISOString(),
        cacheAge: Date.now() - cachedResponse.timestamp,
        degradationContext: {
          strategy: this.name,
          reason: context.trigger,
          component: context.component
        },
        timestamp: new Date().toISOString(),
        message: 'Response served from cache due to service degradation'
      };
    }

    // No cached response available
    throw new Error(`No cached response available for ${context.component} with key: ${cacheKey}`);
  }

  /**
   * Get description of this strategy
   */
  getDescription(): string {
    return 'Serves previously cached responses when the primary service is unavailable or degraded';
  }

  /**
   * Check if strategy is available
   */
  async isAvailable(): Promise<boolean> {
    return this.cache.size > 0;
  }

  /**
   * Cache a response for future use
   */
  cacheResponse(key: string, data: any, ttl: number = this.defaultTtl, metadata?: Record<string, any>): void {
    // Remove expired entries and enforce size limit
    this.cleanupCache();
    
    const cachedResponse: CachedResponse = {
      key,
      data: this.cloneData(data),
      timestamp: Date.now(),
      ttl,
      metadata
    };

    this.cache.set(key, cachedResponse);
    
    console.log(`Cached response for key: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Cache response based on agent execution
   */
  cacheAgentResponse(
    agentName: string, 
    task: string, 
    response: any, 
    ttl: number = this.defaultTtl
  ): void {
    const key = this.generateAgentCacheKey(agentName, task);
    this.cacheResponse(key, response, ttl, { 
      agentName, 
      task, 
      type: 'agent_execution' 
    });
  }

  /**
   * Get cached response
   */
  private getCachedResponse(key: string): CachedResponse | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      console.log(`Cache entry expired and removed: ${key}`);
      return null;
    }

    return cached;
  }

  /**
   * Generate cache key from context and request
   */
  private generateCacheKey(context: DegradationContext, request: any): string {
    const parts = [
      context.component,
      request.agentName || 'unknown',
      this.hashRequest(request)
    ];
    
    return parts.join(':');
  }

  /**
   * Generate cache key for agent execution
   */
  private generateAgentCacheKey(agentName: string, task: string): string {
    return `agent:${agentName}:${this.hashString(task)}`;
  }

  /**
   * Hash request to create consistent cache key
   */
  private hashRequest(request: any): string {
    try {
      // Create a hash based on relevant request properties
      const hashData = {
        task: request.task || '',
        contextPath: request.contextPath || '',
        variables: request.variables || {},
        // Only include relevant properties for caching
      };
      
      return this.hashString(JSON.stringify(hashData));
    } catch (error) {
      // Fallback to simple hash
      return this.hashString(String(request));
    }
  }

  /**
   * Simple string hashing function
   */
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return '0';
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Deep clone data for caching
   */
  private cloneData(data: any): any {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to clone data for cache, using original:', error);
      return data;
    }
  }

  /**
   * Cleanup expired cache entries and enforce size limits
   */
  private cleanupCache(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Remove expired entries
    for (const [key, cached] of this.cache) {
      if (now - cached.timestamp > cached.ttl) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => this.cache.delete(key));

    // Enforce size limit (remove oldest entries)
    if (this.cache.size > this.maxCacheSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.maxCacheSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
      
      console.log(`Removed ${toRemove.length} old cache entries to enforce size limit`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    totalEntries: number;
    sizeInMB: number;
    hitRate: number;
    oldestEntry: string | null;
    newestEntry: string | null;
    entriesByType: Record<string, number>;
  } {
    let totalSize = 0;
    let oldestTimestamp = Number.MAX_SAFE_INTEGER;
    let newestTimestamp = 0;
    let oldestKey: string | null = null;
    let newestKey: string | null = null;
    const entriesByType: Record<string, number> = {};

    for (const [key, cached] of this.cache) {
      // Estimate size (rough)
      totalSize += JSON.stringify(cached).length;
      
      if (cached.timestamp < oldestTimestamp) {
        oldestTimestamp = cached.timestamp;
        oldestKey = key;
      }
      
      if (cached.timestamp > newestTimestamp) {
        newestTimestamp = cached.timestamp;
        newestKey = key;
      }

      // Count by type
      const type = cached.metadata?.type || 'unknown';
      entriesByType[type] = (entriesByType[type] || 0) + 1;
    }

    return {
      totalEntries: this.cache.size,
      sizeInMB: totalSize / 1024 / 1024,
      hitRate: 0, // Would need to track hits/misses to calculate
      oldestEntry: oldestKey,
      newestEntry: newestKey,
      entriesByType
    };
  }

  /**
   * Clear all cached responses
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Remove specific cache entry
   */
  removeCacheEntry(key: string): boolean {
    const removed = this.cache.delete(key);
    if (removed) {
      console.log(`Removed cache entry: ${key}`);
    }
    return removed;
  }

  /**
   * Get all cache keys
   */
  getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if cache key exists and is valid
   */
  hasCachedResponse(key: string): boolean {
    return this.getCachedResponse(key) !== null;
  }

  /**
   * Preload cache with common responses
   */
  preloadCache(responses: Array<{ key: string; data: any; ttl?: number }>): void {
    for (const response of responses) {
      this.cacheResponse(response.key, response.data, response.ttl);
    }
    
    console.log(`Preloaded ${responses.length} responses into cache`);
  }

  /**
   * Export cache data for backup
   */
  exportCache(): Array<{ key: string; data: any; timestamp: number; ttl: number; metadata?: any }> {
    return Array.from(this.cache.values()).map(cached => ({
      key: cached.key,
      data: cached.data,
      timestamp: cached.timestamp,
      ttl: cached.ttl,
      metadata: cached.metadata
    }));
  }

  /**
   * Import cache data from backup
   */
  importCache(cacheData: Array<{ key: string; data: any; timestamp: number; ttl: number; metadata?: any }>): void {
    this.cache.clear();
    
    for (const item of cacheData) {
      // Only import non-expired entries
      if (Date.now() - item.timestamp < item.ttl) {
        const cached: CachedResponse = {
          key: item.key,
          data: item.data,
          timestamp: item.timestamp,
          ttl: item.ttl,
          metadata: item.metadata
        };
        this.cache.set(item.key, cached);
      }
    }
    
    console.log(`Imported ${this.cache.size} cache entries from backup`);
  }
}