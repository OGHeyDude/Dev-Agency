/**
 * Data Collector for Productivity Analytics
 * Collects and stores metrics data for analysis
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

export interface CollectedData {
  type: string;
  data: any;
  timestamp: Date;
  sessionId: string;
}

export class DataCollector extends EventEmitter {
  private dataStore: CollectedData[] = [];
  private sessionId: string;
  private maxDataPoints: number = 10000;
  private persistPath: string;
  private autoPersist: boolean = true;
  private persistInterval: NodeJS.Timeout | null = null;

  constructor(persistPath: string = './analytics-data') {
    super();
    this.sessionId = this.generateSessionId();
    this.persistPath = persistPath;
    this.ensurePersistDirectory();
    this.loadPersistedData();
    
    if (this.autoPersist) {
      this.startAutoPersist();
    }
  }

  /**
   * Collect data point
   */
  public collect(type: string, data: any): void {
    const dataPoint: CollectedData = {
      type,
      data,
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    this.dataStore.push(dataPoint);
    this.emit('data', dataPoint);

    // Trim data if exceeds max
    if (this.dataStore.length > this.maxDataPoints) {
      this.dataStore = this.dataStore.slice(-this.maxDataPoints);
    }
  }

  /**
   * Batch collect multiple data points
   */
  public collectBatch(dataPoints: Array<{ type: string; data: any }>): void {
    dataPoints.forEach(point => this.collect(point.type, point.data));
  }

  /**
   * Get collected data by type
   */
  public getDataByType(type: string): CollectedData[] {
    return this.dataStore.filter(d => d.type === type);
  }

  /**
   * Get data within time range
   */
  public getDataInRange(startTime: Date, endTime: Date): CollectedData[] {
    return this.dataStore.filter(d => 
      d.timestamp >= startTime && d.timestamp <= endTime
    );
  }

  /**
   * Get recent data
   */
  public getRecentData(minutes: number = 60): CollectedData[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.dataStore.filter(d => d.timestamp >= cutoff);
  }

  /**
   * Aggregate data by type
   */
  public aggregateByType(): Map<string, CollectedData[]> {
    const aggregated = new Map<string, CollectedData[]>();
    
    this.dataStore.forEach(data => {
      if (!aggregated.has(data.type)) {
        aggregated.set(data.type, []);
      }
      aggregated.get(data.type)!.push(data);
    });

    return aggregated;
  }

  /**
   * Calculate statistics for numeric data
   */
  public calculateStats(type: string, field: string): {
    min: number;
    max: number;
    avg: number;
    median: number;
    count: number;
  } | null {
    const data = this.getDataByType(type);
    if (data.length === 0) return null;

    const values = data
      .map(d => d.data[field])
      .filter(v => typeof v === 'number')
      .sort((a, b) => a - b);

    if (values.length === 0) return null;

    return {
      min: values[0],
      max: values[values.length - 1],
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
      median: values[Math.floor(values.length / 2)],
      count: values.length
    };
  }

  /**
   * Persist data to disk
   */
  public persist(): void {
    const filename = `analytics-${this.sessionId}-${Date.now()}.json`;
    const filepath = path.join(this.persistPath, filename);

    try {
      fs.writeFileSync(filepath, JSON.stringify({
        sessionId: this.sessionId,
        timestamp: new Date(),
        dataPoints: this.dataStore.length,
        data: this.dataStore
      }, null, 2));

      this.emit('persisted', filepath);
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Load persisted data
   */
  private loadPersistedData(): void {
    if (!fs.existsSync(this.persistPath)) return;

    try {
      const files = fs.readdirSync(this.persistPath)
        .filter(f => f.startsWith('analytics-') && f.endsWith('.json'))
        .sort()
        .slice(-5); // Load last 5 sessions

      files.forEach(file => {
        const filepath = path.join(this.persistPath, file);
        const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        
        // Convert timestamp strings back to Date objects
        content.data.forEach((d: any) => {
          d.timestamp = new Date(d.timestamp);
        });

        // Add historical data with different sessionId
        this.dataStore.push(...content.data);
      });

      this.emit('loaded', this.dataStore.length);
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Clear all data
   */
  public clear(): void {
    this.dataStore = [];
    this.emit('cleared');
  }

  /**
   * Export data
   */
  public export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportCSV();
    }
    return JSON.stringify(this.dataStore, null, 2);
  }

  private exportCSV(): string {
    if (this.dataStore.length === 0) return '';

    // Get all unique keys from data
    const keys = new Set<string>();
    this.dataStore.forEach(d => {
      Object.keys(d.data).forEach(key => keys.add(key));
    });

    // Create CSV header
    const header = ['type', 'timestamp', 'sessionId', ...Array.from(keys)].join(',');

    // Create CSV rows
    const rows = this.dataStore.map(d => {
      const row = [d.type, d.timestamp.toISOString(), d.sessionId];
      keys.forEach(key => {
        row.push(d.data[key] || '');
      });
      return row.join(',');
    });

    return [header, ...rows].join('\\n');
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private ensurePersistDirectory(): void {
    if (!fs.existsSync(this.persistPath)) {
      fs.mkdirSync(this.persistPath, { recursive: true });
    }
  }

  private startAutoPersist(): void {
    // Persist every 5 minutes
    this.persistInterval = setInterval(() => {
      this.persist();
    }, 5 * 60 * 1000);
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
    this.persist();
    this.removeAllListeners();
  }
}

export default DataCollector;