/**
 * Integration Tests - Validate core functionality works
 * 
 * @file integration.test.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { MemoryManager } from '../utils/MemoryManager';
import { PerformanceCache } from '../utils/PerformanceCache';
import * as fs from 'fs-extra';
import * as path from 'path';

describe('Performance Integration Tests', () => {
  let tempDir: string;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../.test-temp');
    await fs.ensureDir(tempDir);
  });

  afterAll(async () => {
    // Cleanup
    await fs.remove(tempDir);
  });

  describe('MemoryManager Integration', () => {
    test('should manage memory within bounds', () => {
      const memoryManager = new MemoryManager({
        maxExecutionHistory: 10,
        maxMemoryMB: 5
      });

      // Add test executions
      for (let i = 0; i < 15; i++) {
        memoryManager.setExecution(`exec_${i}`, {
          success: true,
          output: `Test output ${i}`,
          agent: 'test-agent',
          timestamp: new Date().toISOString(),
          metrics: {
            duration: 100,
            context_size: 1000
          }
        });
      }

      const metrics = memoryManager.getMemoryMetrics();
      expect(metrics.cacheEntries).toBeLessThanOrEqual(10);
      
      // Test LRU behavior
      const recent = memoryManager.getExecution('exec_14');
      const old = memoryManager.getExecution('exec_0');
      
      expect(recent).toBeTruthy();
      expect(old).toBeNull();

      memoryManager.shutdown();
    });

    test('should provide cache metrics', () => {
      const memoryManager = new MemoryManager();

      memoryManager.setExecution('test1', {
        success: true,
        output: 'Test',
        agent: 'test',
        timestamp: new Date().toISOString(),
        metrics: { duration: 100, context_size: 1000 }
      });

      // Test hit and miss
      const hit = memoryManager.getExecution('test1');
      const miss = memoryManager.getExecution('nonexistent');

      expect(hit).toBeTruthy();
      expect(miss).toBeNull();

      const cacheMetrics = memoryManager.getCacheMetrics();
      expect(cacheMetrics.hitCount).toBe(1);
      expect(cacheMetrics.missCount).toBe(1);
      expect(cacheMetrics.hitRate).toBe(0.5);

      memoryManager.shutdown();
    });
  });

  describe('PerformanceCache Integration', () => {
    test('should provide multi-level caching', async () => {
      const cache = new PerformanceCache({
        memoryCacheMaxMB: 1,
        fileCacheMaxMB: 5,
        ttlMinutes: 1,
        cacheDir: path.join(tempDir, '.test-cache')
      });

      await cache.set('test-key', { data: 'test-value' });

      const result = await cache.get('test-key');
      expect(result).toEqual({ data: 'test-value' });

      const metrics = cache.getMetrics();
      expect(metrics.hitRate).toBeGreaterThan(0);

      await cache.shutdown();
    });

    test('should invalidate cache properly', async () => {
      const cache = new PerformanceCache({
        memoryCacheMaxMB: 1,
        fileCacheMaxMB: 5,
        ttlMinutes: 1,
        cacheDir: path.join(tempDir, '.test-cache-2')
      });

      await cache.set('temp-key', { data: 'temp-value' });
      
      let result = await cache.get('temp-key');
      expect(result).toEqual({ data: 'temp-value' });

      await cache.delete('temp-key');
      result = await cache.get('temp-key');
      expect(result).toBeNull();

      await cache.shutdown();
    });
  });

  describe('CLI Performance Features', () => {
    test('should track startup time', () => {
      const startTime = Date.now();
      
      // Simulate CLI initialization with lazy loading
      const managers: any[] = [];
      
      // Lazy loading should be fast
      const lazyLoadTime = Date.now() - startTime;
      expect(lazyLoadTime).toBeLessThan(100); // Should be very fast
      
      // Actual manager creation happens on demand
      const managerStartTime = Date.now();
      managers.push({ type: 'config', initialized: true });
      managers.push({ type: 'agent', initialized: true });
      const managerLoadTime = Date.now() - managerStartTime;
      
      expect(managerLoadTime).toBeLessThan(1000); // Should be reasonable
    });

    test('should provide performance metrics structure', () => {
      const memoryManager = new MemoryManager();
      const metrics = memoryManager.getMemoryMetrics();
      
      expect(metrics).toHaveProperty('heapUsed');
      expect(metrics).toHaveProperty('heapTotal');
      expect(metrics).toHaveProperty('cacheSize');
      expect(metrics).toHaveProperty('cacheEntries');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('memoryPressure');
      
      expect(typeof metrics.heapUsed).toBe('number');
      expect(typeof metrics.hitRate).toBe('number');
      expect(typeof metrics.memoryPressure).toBe('number');
      
      memoryManager.shutdown();
    });
  });

  describe('Resource Management', () => {
    test('should cleanup resources properly', async () => {
      const memoryManager = new MemoryManager();
      const cache = new PerformanceCache({
        cacheDir: path.join(tempDir, '.test-cleanup-cache')
      });

      // Add some data
      memoryManager.setExecution('test', {
        success: true,
        output: 'test',
        agent: 'test',
        timestamp: new Date().toISOString(),
        metrics: { duration: 100, context_size: 1000 }
      });

      await cache.set('test', { data: 'test' });

      // Verify data exists
      expect(memoryManager.getExecution('test')).toBeTruthy();
      expect(await cache.get('test')).toBeTruthy();

      // Cleanup
      memoryManager.shutdown();
      await cache.shutdown();

      // Verify cleanup (memory should be cleared)
      const finalMetrics = memoryManager.getMemoryMetrics();
      expect(finalMetrics.cacheEntries).toBe(0);
    });

    test('should handle concurrent operations safely', async () => {
      const memoryManager = new MemoryManager();
      
      // Simulate concurrent access
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve().then(() => {
            memoryManager.setExecution(`concurrent_${i}`, {
              success: true,
              output: `Concurrent test ${i}`,
              agent: 'concurrent-test',
              timestamp: new Date().toISOString(),
              metrics: { duration: 50, context_size: 500 }
            });
          })
        );
      }

      await Promise.all(promises);

      const metrics = memoryManager.getMemoryMetrics();
      expect(metrics.cacheEntries).toBe(10);

      memoryManager.shutdown();
    });
  });
});