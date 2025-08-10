/**
 * Parallel File Loader - High-performance parallel file I/O operations
 * 
 * @file ParallelFileLoader.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as fs from 'fs-extra';
import * as path from 'path';
// Simple concurrency limiter implementation
class ConcurrencyLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const execute = () => {
        this.running++;
        fn()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.running--;
            if (this.queue.length > 0) {
              const next = this.queue.shift()!;
              next();
            }
          });
      };

      if (this.running < this.limit) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }
}
import { glob } from 'glob';
import { Logger } from './Logger';
import { securityManager } from './security';

export interface FileContent {
  path: string;
  relativePath: string;
  content: string;
  size: number;
  mtime: number;
  encoding: string;
}

export interface LoaderConfig {
  concurrencyLimit: number;        // Default: 5
  maxFileSize: number;             // Default: 1MB (1024 * 1024)
  maxTotalFiles: number;           // Default: 100
  allowedExtensions: string[];     // Default: ['.ts', '.js', '.md', '.json', '.py']
  excludePatterns: string[];       // Default: ['node_modules/**', '.git/**', 'dist/**']
  timeout: number;                 // Default: 30000ms
  retryAttempts: number;           // Default: 2
}

export interface LoadResult {
  files: FileContent[];
  skippedFiles: string[];
  errorFiles: string[];
  totalSize: number;
  loadTime: number;
  parallelismFactor: number;
  errors: string[];
}

export interface LoadMetrics {
  filesProcessed: number;
  totalLoadTime: number;
  averageFileSize: number;
  parallelismAchieved: number;
  errorRate: number;
  throughputMBps: number;
}

export class ParallelFileLoader {
  private logger = Logger.create({ component: 'ParallelFileLoader' });
  private config: Required<LoaderConfig>;
  private metrics: LoadMetrics;

  constructor(config: Partial<LoaderConfig> = {}) {
    this.config = {
      concurrencyLimit: config.concurrencyLimit || 5,
      maxFileSize: config.maxFileSize || 1024 * 1024, // 1MB
      maxTotalFiles: config.maxTotalFiles || 100,
      allowedExtensions: config.allowedExtensions || ['.ts', '.js', '.md', '.json', '.py', '.txt', '.yaml', '.yml'],
      excludePatterns: config.excludePatterns || [
        'node_modules/**', 
        '.git/**', 
        'dist/**', 
        'build/**',
        '.cache/**',
        '*.log',
        '.DS_Store'
      ],
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 2
    };

    this.metrics = {
      filesProcessed: 0,
      totalLoadTime: 0,
      averageFileSize: 0,
      parallelismAchieved: 0,
      errorRate: 0,
      throughputMBps: 0
    };

    this.logger.info(`Parallel file loader initialized: ${this.config.concurrencyLimit} concurrent, ${this.config.maxTotalFiles} max files`);
  }

  /**
   * Load all files from a directory or single file
   */
  async loadFiles(basePath: string): Promise<LoadResult> {
    const startTime = Date.now();
    const result: LoadResult = {
      files: [],
      skippedFiles: [],
      errorFiles: [],
      totalSize: 0,
      loadTime: 0,
      parallelismFactor: 0,
      errors: []
    };

    try {
      // Validate base path
      const pathValidation = await securityManager.validatePath(basePath, 'read');
      if (!pathValidation.isValid) {
        throw new Error(`Invalid base path: ${pathValidation.violations.join(', ')}`);
      }

      const resolvedPath = pathValidation.resolvedPath!;
      const stats = await fs.stat(resolvedPath);

      let filePaths: string[];

      if (stats.isFile()) {
        // Single file
        filePaths = [resolvedPath];
      } else if (stats.isDirectory()) {
        // Directory - discover files
        filePaths = await this.discoverFiles(resolvedPath);
      } else {
        throw new Error(`Unsupported path type: ${basePath}`);
      }

      // Filter and limit files
      const filteredPaths = this.filterFiles(filePaths, resolvedPath);
      const limitedPaths = filteredPaths.slice(0, this.config.maxTotalFiles);

      if (limitedPaths.length < filteredPaths.length) {
        this.logger.warn(`File limit reached: processing ${limitedPaths.length} of ${filteredPaths.length} files`);
        result.skippedFiles.push(`${filteredPaths.length - limitedPaths.length} files skipped due to limit`);
      }

      // Load files in parallel
      const loadResults = await this.loadFilesParallel(limitedPaths, resolvedPath);
      
      // Process results
      result.files = loadResults.filter(r => r.success).map(r => r.fileContent!);
      result.errorFiles = loadResults.filter(r => !r.success).map(r => r.filePath);
      result.errors = loadResults.filter(r => !r.success).map(r => r.error!);
      
      // Calculate metrics
      result.totalSize = result.files.reduce((sum, file) => sum + file.size, 0);
      result.loadTime = Date.now() - startTime;
      result.parallelismFactor = Math.min(limitedPaths.length, this.config.concurrencyLimit);

      // Update internal metrics
      this.updateMetrics(result);

      this.logger.info(
        `Loaded ${result.files.length} files in ${result.loadTime}ms ` +
        `(${(result.totalSize / 1024 / 1024).toFixed(2)}MB, ` +
        `${result.errorFiles.length} errors, ` +
        `${result.parallelismFactor}x parallelism)`
      );

      return result;

    } catch (error) {
      result.loadTime = Date.now() - startTime;
      result.errors.push(error instanceof Error ? error.message : String(error));
      this.logger.error(`File loading failed: ${error}`);
      return result;
    }
  }

  /**
   * Discover files in directory with glob patterns
   */
  private async discoverFiles(directoryPath: string): Promise<string[]> {
    const pattern = path.join(directoryPath, '**/*');
    
    // Validate glob pattern for security
    const globValidation = securityManager.validateGlobPattern('**/*', directoryPath);
    if (!globValidation.isValid) {
      throw new Error(`Unsafe glob pattern: ${globValidation.violations.join(', ')}`);
    }

    const allFiles = await new Promise<string[]>((resolve, reject) => {
      glob('**/*', {
        cwd: directoryPath,
        ignore: this.config.excludePatterns
      }, (err, matches) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });

    // Filter out directories manually since nodir option may not work as expected
    const fileList = Array.isArray(allFiles) ? allFiles : [];
    const filesOnly = [];
    
    for (const file of fileList) {
      const fullPath = path.join(directoryPath, file);
      try {
        const stats = await fs.stat(fullPath);
        if (stats.isFile()) {
          filesOnly.push(file);
        }
      } catch (error) {
        // Skip files that can't be stat'd
        continue;
      }
    }
    
    return filesOnly;
  }

  /**
   * Filter files by extension and other criteria
   */
  private filterFiles(filePaths: string[], basePath: string): string[] {
    return filePaths.filter(filePath => {
      try {
        // Check extension
        const ext = path.extname(filePath).toLowerCase();
        if (this.config.allowedExtensions.length > 0 && !this.config.allowedExtensions.includes(ext)) {
          return false;
        }

        // Check if file is readable
        fs.accessSync(filePath, fs.constants.R_OK);
        
        // Check file size
        const stats = fs.statSync(filePath);
        if (stats.size > this.config.maxFileSize) {
          this.logger.warn(`Skipping large file: ${path.relative(basePath, filePath)} (${stats.size} bytes)`);
          return false;
        }

        return true;
      } catch (error) {
        this.logger.debug(`Skipping inaccessible file: ${filePath}`);
        return false;
      }
    });
  }

  /**
   * Load files in parallel with concurrency control
   */
  private async loadFilesParallel(filePaths: string[], basePath: string): Promise<Array<{
    filePath: string;
    success: boolean;
    fileContent?: FileContent;
    error?: string;
  }>> {
    const limiter = new ConcurrencyLimiter(this.config.concurrencyLimit);
    const loadStartTime = Date.now();

    const promises = filePaths.map(filePath => 
      limiter.run(async () => {
        try {
          const fileContent = await this.loadSingleFile(filePath, basePath);
          return {
            filePath,
            success: true,
            fileContent
          };
        } catch (error) {
          return {
            filePath,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      })
    );

    // Add timeout for the entire batch
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Batch file loading timeout')), this.config.timeout);
    });

    try {
      const results = await Promise.race([
        Promise.all(promises),
        timeoutPromise
      ]) as Array<{ filePath: string; success: boolean; fileContent?: FileContent; error?: string }>;

      const loadTime = Date.now() - loadStartTime;
      const actualParallelism = Math.min(filePaths.length, this.config.concurrencyLimit);
      
      this.logger.debug(
        `Parallel loading completed: ${results.filter(r => r.success).length}/${filePaths.length} files ` +
        `in ${loadTime}ms with ${actualParallelism}x parallelism`
      );

      return results;
    } catch (error) {
      this.logger.error(`Parallel loading failed: ${error}`);
      throw error;
    }
  }

  /**
   * Load single file with retry logic
   */
  private async loadSingleFile(filePath: string, basePath: string): Promise<FileContent> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Validate file path for security
        const pathValidation = await securityManager.validatePath(filePath, 'read');
        if (!pathValidation.isValid) {
          throw new Error(`Invalid file path: ${pathValidation.violations.join(', ')}`);
        }

        const resolvedPath = pathValidation.resolvedPath!;
        const stats = await fs.stat(resolvedPath);

        // Additional size check
        if (stats.size > this.config.maxFileSize) {
          throw new Error(`File too large: ${stats.size} bytes`);
        }

        // Read file content securely
        const content = await securityManager.secureReadFile(resolvedPath);
        const relativePath = path.relative(basePath, resolvedPath);

        return {
          path: resolvedPath,
          relativePath,
          content,
          size: stats.size,
          mtime: stats.mtime.getTime(),
          encoding: 'utf-8'
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.config.retryAttempts) {
          this.logger.debug(`Retry ${attempt + 1}/${this.config.retryAttempts} for ${filePath}: ${error}`);
          await this.delay(100 * (attempt + 1)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Unknown error loading file');
  }

  /**
   * Generate content summary from loaded files
   */
  generateContentSummary(files: FileContent[]): string {
    if (files.length === 0) {
      return 'No files loaded.';
    }

    let summary = `# Context Summary\n\n`;
    summary += `**Files loaded**: ${files.length}\n`;
    summary += `**Total size**: ${(files.reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(1)}KB\n\n`;

    // Group by extension
    const extensionGroups = files.reduce((groups, file) => {
      const ext = path.extname(file.relativePath).toLowerCase() || 'no-extension';
      if (!groups[ext]) groups[ext] = [];
      groups[ext].push(file);
      return groups;
    }, {} as Record<string, FileContent[]>);

    summary += `## File Types\n`;
    Object.entries(extensionGroups).forEach(([ext, fileList]) => {
      const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
      summary += `- **${ext}**: ${fileList.length} files (${(totalSize / 1024).toFixed(1)}KB)\n`;
    });

    summary += `\n## File Contents\n\n`;
    files.forEach(file => {
      summary += `### ${file.relativePath}\n\`\`\`\n${file.content}\n\`\`\`\n\n`;
    });

    return summary;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): LoadMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): string {
    const metrics = this.getMetrics();
    return `FileLoader: ${metrics.filesProcessed} files, ` +
           `${metrics.averageFileSize.toFixed(0)} bytes avg, ` +
           `${metrics.throughputMBps.toFixed(1)} MB/s, ` +
           `${(metrics.errorRate * 100).toFixed(1)}% errors, ` +
           `${metrics.parallelismAchieved.toFixed(1)}x parallelism`;
  }

  /**
   * Update internal metrics
   */
  private updateMetrics(result: LoadResult): void {
    this.metrics.filesProcessed += result.files.length;
    this.metrics.totalLoadTime += result.loadTime;
    
    if (result.files.length > 0) {
      this.metrics.averageFileSize = result.totalSize / result.files.length;
    }
    
    this.metrics.parallelismAchieved = result.parallelismFactor;
    
    const totalFiles = result.files.length + result.errorFiles.length;
    this.metrics.errorRate = totalFiles > 0 ? result.errorFiles.length / totalFiles : 0;
    
    if (result.loadTime > 0) {
      this.metrics.throughputMBps = (result.totalSize / 1024 / 1024) / (result.loadTime / 1000);
    }
  }

  /**
   * Get configuration
   */
  getConfig(): Required<LoaderConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoaderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('File loader configuration updated', newConfig);
  }

  /**
   * Simple delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate performance improvement over sequential loading
   */
  calculatePerformanceGain(sequentialTime: number, parallelTime: number): {
    improvementPercent: number;
    speedupFactor: number;
    timesSaved: number;
  } {
    const improvementPercent = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    const speedupFactor = sequentialTime / parallelTime;
    const timesSaved = sequentialTime - parallelTime;

    return {
      improvementPercent: Math.max(0, improvementPercent),
      speedupFactor: Math.max(1, speedupFactor),
      timesSaved: Math.max(0, timesSaved)
    };
  }

  /**
   * Test parallel vs sequential loading performance
   */
  async benchmarkPerformance(basePath: string): Promise<{
    sequential: { time: number; throughput: number };
    parallel: { time: number; throughput: number };
    improvement: { percent: number; factor: number };
  }> {
    this.logger.info('Starting performance benchmark...');

    // Sequential loading benchmark
    const originalConcurrency = this.config.concurrencyLimit;
    this.config.concurrencyLimit = 1;
    
    const sequentialStart = Date.now();
    const sequentialResult = await this.loadFiles(basePath);
    const sequentialTime = Date.now() - sequentialStart;
    const sequentialThroughput = sequentialResult.totalSize / sequentialTime;

    // Parallel loading benchmark
    this.config.concurrencyLimit = originalConcurrency;
    
    const parallelStart = Date.now();
    const parallelResult = await this.loadFiles(basePath);
    const parallelTime = Date.now() - parallelStart;
    const parallelThroughput = parallelResult.totalSize / parallelTime;

    const improvementPercent = ((sequentialTime - parallelTime) / sequentialTime) * 100;
    const improvementFactor = sequentialTime / parallelTime;

    this.logger.info(
      `Benchmark completed: Sequential ${sequentialTime}ms, Parallel ${parallelTime}ms, ` +
      `${improvementPercent.toFixed(1)}% improvement (${improvementFactor.toFixed(2)}x speedup)`
    );

    return {
      sequential: { time: sequentialTime, throughput: sequentialThroughput },
      parallel: { time: parallelTime, throughput: parallelThroughput },
      improvement: { percent: improvementPercent, factor: improvementFactor }
    };
  }
}