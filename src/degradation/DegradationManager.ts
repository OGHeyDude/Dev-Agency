/**
 * Degradation Manager - Coordinate graceful degradation strategies
 * 
 * @file DegradationManager.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { EventEmitter } from 'events';
import * as fs from 'fs-extra';
import * as path from 'path';
import { CachedResponseStrategy } from './strategies/CachedResponseStrategy';
import { SimplifiedResponseStrategy } from './strategies/SimplifiedResponseStrategy';
import { FallbackAgentStrategy } from './strategies/FallbackAgentStrategy';
import { OfflineResponseStrategy } from './strategies/OfflineResponseStrategy';
import { RecoveryManager } from './recovery/RecoveryManager';

export enum DegradationLevel {
  NONE = 'none',
  PARTIAL = 'partial',
  SIGNIFICANT = 'significant',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

export enum DegradationReason {
  CIRCUIT_BREAKER_OPEN = 'circuit_breaker_open',
  HIGH_ERROR_RATE = 'high_error_rate',
  RESOURCE_EXHAUSTION = 'resource_exhaustion',
  DEPENDENCY_FAILURE = 'dependency_failure',
  MANUAL_TRIGGER = 'manual_trigger',
  AGENT_UNAVAILABLE = 'agent_unavailable',
  TIMEOUT_EXCEEDED = 'timeout_exceeded'
}

export interface DegradationContext {
  trigger: DegradationReason;
  component: string;
  severity: DegradationLevel;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DegradationStrategy {
  name: string;
  priority: number;
  canHandle: (context: DegradationContext) => boolean;
  execute: (context: DegradationContext, originalRequest: any) => Promise<any>;
  getDescription: () => string;
  isAvailable: () => Promise<boolean>;
}

export interface DegradationRule {
  id: string;
  name: string;
  conditions: {
    components?: string[];
    reasons?: DegradationReason[];
    severityThreshold?: DegradationLevel;
  };
  strategy: string;
  priority: number;
  enabled: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface DegradationStatus {
  active: boolean;
  level: DegradationLevel;
  affectedComponents: string[];
  activeDegradations: DegradationContext[];
  availableStrategies: string[];
  recoveryInProgress: boolean;
  lastDegradationTime?: string;
  lastRecoveryTime?: string;
}

export class DegradationManager extends EventEmitter {
  private strategies = new Map<string, DegradationStrategy>();
  private rules: DegradationRule[] = [];
  private activeDegradations = new Map<string, DegradationContext>();
  private degradationHistory: DegradationContext[] = [];
  private recoveryManager: RecoveryManager;
  private config: {
    maxDegradationHistory: number;
    autoRecoveryEnabled: boolean;
    recoveryCheckInterval: number;
    configPath: string;
  };

  constructor() {
    super();

    this.config = {
      maxDegradationHistory: 1000,
      autoRecoveryEnabled: true,
      recoveryCheckInterval: 30000, // 30 seconds
      configPath: path.join(__dirname, 'config', 'degradation-rules.json')
    };

    this.recoveryManager = new RecoveryManager(this);
    this.initializeDefaultStrategies();
    this.loadConfiguration();
    this.setupEventListeners();
  }

  /**
   * Start degradation manager
   */
  async start(): Promise<void> {
    if (this.config.autoRecoveryEnabled) {
      this.recoveryManager.start();
    }

    this.emit('manager:started');
    console.log('Degradation Manager started');
  }

  /**
   * Stop degradation manager
   */
  async stop(): Promise<void> {
    this.recoveryManager.stop();
    this.emit('manager:stopped');
    console.log('Degradation Manager stopped');
  }

  /**
   * Trigger degradation for a component
   */
  async triggerDegradation(context: DegradationContext): Promise<void> {
    const key = `${context.component}:${context.trigger}`;
    
    // Check if already degraded for this reason
    if (this.activeDegradations.has(key)) {
      console.log(`Degradation already active for ${key}`);
      return;
    }

    console.log(`Triggering degradation for ${context.component}: ${context.trigger}`);

    // Add to active degradations
    this.activeDegradations.set(key, context);
    this.degradationHistory.push(context);

    // Trim history if needed
    if (this.degradationHistory.length > this.config.maxDegradationHistory) {
      this.degradationHistory.shift();
    }

    // Emit degradation event
    this.emit('degradationTriggered', context);

    // Start recovery monitoring if enabled
    if (this.config.autoRecoveryEnabled) {
      this.recoveryManager.startMonitoring(context);
    }
  }

  /**
   * Handle request with degradation strategies
   */
  async handleDegradedRequest(
    originalRequest: any,
    degradationContext: DegradationContext
  ): Promise<any> {
    // Find applicable strategies based on rules
    const applicableStrategies = this.findApplicableStrategies(degradationContext);
    
    if (applicableStrategies.length === 0) {
      throw new Error(`No degradation strategies available for ${degradationContext.component}`);
    }

    // Try strategies in priority order
    for (const strategy of applicableStrategies) {
      try {
        console.log(`Attempting degradation strategy: ${strategy.name} for ${degradationContext.component}`);
        
        const result = await strategy.execute(degradationContext, originalRequest);
        
        this.emit('strategyExecuted', {
          strategy: strategy.name,
          context: degradationContext,
          success: true,
          timestamp: new Date().toISOString()
        });

        return result;

      } catch (error) {
        console.warn(`Degradation strategy ${strategy.name} failed:`, error);
        
        this.emit('strategyExecuted', {
          strategy: strategy.name,
          context: degradationContext,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      }
    }

    // All strategies failed
    throw new Error(`All degradation strategies failed for ${degradationContext.component}`);
  }

  /**
   * Resolve degradation for a component
   */
  async resolveDegradation(component: string, reason?: DegradationReason): Promise<void> {
    const keysToRemove: string[] = [];

    for (const [key, context] of this.activeDegradations) {
      if (context.component === component && (!reason || context.trigger === reason)) {
        keysToRemove.push(key);
      }
    }

    if (keysToRemove.length === 0) {
      console.log(`No active degradations found for ${component}`);
      return;
    }

    for (const key of keysToRemove) {
      const context = this.activeDegradations.get(key)!;
      this.activeDegradations.delete(key);
      
      console.log(`Resolved degradation for ${context.component}: ${context.trigger}`);
      
      this.emit('degradationResolved', {
        ...context,
        resolvedAt: new Date().toISOString(),
        duration: Date.now() - new Date(context.timestamp).getTime()
      });
    }

    // Check if component is fully recovered
    const remainingDegradations = Array.from(this.activeDegradations.values())
      .filter(ctx => ctx.component === component);

    if (remainingDegradations.length === 0) {
      this.emit('componentRecovered', {
        component,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Register a degradation strategy
   */
  registerStrategy(strategy: DegradationStrategy): void {
    this.strategies.set(strategy.name, strategy);
    console.log(`Registered degradation strategy: ${strategy.name}`);
  }

  /**
   * Unregister a degradation strategy
   */
  unregisterStrategy(strategyName: string): void {
    this.strategies.delete(strategyName);
    console.log(`Unregistered degradation strategy: ${strategyName}`);
  }

  /**
   * Add degradation rule
   */
  addRule(rule: DegradationRule): void {
    // Remove existing rule with same ID if exists
    this.rules = this.rules.filter(r => r.id !== rule.id);
    this.rules.push(rule);
    
    // Sort by priority (lower number = higher priority)
    this.rules.sort((a, b) => a.priority - b.priority);
    
    console.log(`Added degradation rule: ${rule.name}`);
  }

  /**
   * Remove degradation rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
    console.log(`Removed degradation rule: ${ruleId}`);
  }

  /**
   * Get current degradation status
   */
  getStatus(): DegradationStatus {
    const activeDegradations = Array.from(this.activeDegradations.values());
    const affectedComponents = Array.from(new Set(activeDegradations.map(d => d.component)));
    
    // Calculate overall degradation level
    let overallLevel = DegradationLevel.NONE;
    if (activeDegradations.length > 0) {
      const levels = activeDegradations.map(d => d.severity);
      overallLevel = this.getHighestDegradationLevel(levels);
    }

    return {
      active: activeDegradations.length > 0,
      level: overallLevel,
      affectedComponents,
      activeDegradations,
      availableStrategies: Array.from(this.strategies.keys()),
      recoveryInProgress: this.recoveryManager.isRecoveryInProgress(),
      lastDegradationTime: activeDegradations.length > 0 ? 
        Math.max(...activeDegradations.map(d => new Date(d.timestamp).getTime())).toString() : undefined,
      lastRecoveryTime: this.recoveryManager.getLastRecoveryTime()
    };
  }

  /**
   * Get degradation statistics
   */
  getStatistics(): {
    totalDegradations: number;
    activeCount: number;
    degradationsByComponent: Record<string, number>;
    degradationsByReason: Record<string, number>;
    averageDuration: number;
    mostFrequentReason: string;
    recoverySummary: any;
  } {
    const byComponent: Record<string, number> = {};
    const byReason: Record<string, number> = {};
    let totalDuration = 0;
    let completedCount = 0;

    // Analyze historical data
    for (const degradation of this.degradationHistory) {
      byComponent[degradation.component] = (byComponent[degradation.component] || 0) + 1;
      byReason[degradation.trigger] = (byReason[degradation.trigger] || 0) + 1;
    }

    // Calculate average duration for resolved degradations
    // This would need to track resolution times - simplified for now
    const averageDuration = completedCount > 0 ? totalDuration / completedCount : 0;

    // Find most frequent reason
    const mostFrequentReason = Object.entries(byReason)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    return {
      totalDegradations: this.degradationHistory.length,
      activeCount: this.activeDegradations.size,
      degradationsByComponent: byComponent,
      degradationsByReason: byReason,
      averageDuration,
      mostFrequentReason,
      recoverySummary: this.recoveryManager.getRecoveryStatistics()
    };
  }

  /**
   * Initialize default degradation strategies
   */
  private initializeDefaultStrategies(): void {
    // Cached response strategy (highest priority for quick fallback)
    this.registerStrategy(new CachedResponseStrategy(1));
    
    // Simplified response strategy (medium priority)
    this.registerStrategy(new SimplifiedResponseStrategy(2));
    
    // Fallback agent strategy (lower priority, but more capable)
    this.registerStrategy(new FallbackAgentStrategy(3));
    
    // Offline response strategy (lowest priority, last resort)
    this.registerStrategy(new OfflineResponseStrategy(4));
  }

  /**
   * Find applicable strategies for degradation context
   */
  private findApplicableStrategies(context: DegradationContext): DegradationStrategy[] {
    const applicableStrategies: DegradationStrategy[] = [];

    // Find matching rules
    const matchingRules = this.rules.filter(rule => 
      rule.enabled && this.ruleMatches(rule, context)
    );

    // Get strategies from matching rules
    for (const rule of matchingRules) {
      const strategy = this.strategies.get(rule.strategy);
      if (strategy && strategy.canHandle(context)) {
        applicableStrategies.push(strategy);
      }
    }

    // If no rules match, try all available strategies
    if (applicableStrategies.length === 0) {
      for (const strategy of this.strategies.values()) {
        if (strategy.canHandle(context)) {
          applicableStrategies.push(strategy);
        }
      }
    }

    // Sort by priority
    return applicableStrategies.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if rule matches degradation context
   */
  private ruleMatches(rule: DegradationRule, context: DegradationContext): boolean {
    // Check component match
    if (rule.conditions.components && 
        !rule.conditions.components.includes(context.component)) {
      return false;
    }

    // Check reason match
    if (rule.conditions.reasons && 
        !rule.conditions.reasons.includes(context.trigger)) {
      return false;
    }

    // Check severity threshold
    if (rule.conditions.severityThreshold && 
        !this.severityMeetsThreshold(context.severity, rule.conditions.severityThreshold)) {
      return false;
    }

    return true;
  }

  /**
   * Check if severity meets threshold
   */
  private severityMeetsThreshold(current: DegradationLevel, threshold: DegradationLevel): boolean {
    const levels = {
      [DegradationLevel.NONE]: 0,
      [DegradationLevel.PARTIAL]: 1,
      [DegradationLevel.SIGNIFICANT]: 2,
      [DegradationLevel.SEVERE]: 3,
      [DegradationLevel.CRITICAL]: 4
    };

    return levels[current] >= levels[threshold];
  }

  /**
   * Get highest degradation level from array
   */
  private getHighestDegradationLevel(levels: DegradationLevel[]): DegradationLevel {
    const levelValues = {
      [DegradationLevel.NONE]: 0,
      [DegradationLevel.PARTIAL]: 1,
      [DegradationLevel.SIGNIFICANT]: 2,
      [DegradationLevel.SEVERE]: 3,
      [DegradationLevel.CRITICAL]: 4
    };

    const maxValue = Math.max(...levels.map(level => levelValues[level]));
    
    return Object.entries(levelValues)
      .find(([, value]) => value === maxValue)?.[0] as DegradationLevel || DegradationLevel.NONE;
  }

  /**
   * Load configuration from file
   */
  private async loadConfiguration(): Promise<void> {
    try {
      if (await fs.pathExists(this.config.configPath)) {
        const config = await fs.readJson(this.config.configPath);
        
        if (config.rules) {
          this.rules = config.rules;
          this.rules.sort((a, b) => a.priority - b.priority);
        }

        if (config.settings) {
          Object.assign(this.config, config.settings);
        }

        console.log(`Loaded ${this.rules.length} degradation rules from configuration`);
      }
    } catch (error) {
      console.warn('Failed to load degradation configuration:', error);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.on('degradationTriggered', (context) => {
      console.log(`Degradation triggered: ${context.component} (${context.trigger})`);
    });

    this.on('degradationResolved', (event) => {
      console.log(`Degradation resolved: ${event.component} after ${event.duration}ms`);
    });

    this.on('componentRecovered', (event) => {
      console.log(`Component fully recovered: ${event.component}`);
    });
  }

  /**
   * Health check for degradation manager
   */
  healthCheck(): {
    healthy: boolean;
    activeStrategies: number;
    activeDegradations: number;
    availableStrategies: number;
    recoveryEnabled: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const status = this.getStatus();

    // Check for too many active degradations
    if (status.activeDegradations.length > 5) {
      issues.push(`High number of active degradations: ${status.activeDegradations.length}`);
    }

    // Check if critical degradations are active
    const criticalDegradations = status.activeDegradations.filter(d => 
      d.severity === DegradationLevel.CRITICAL
    );
    if (criticalDegradations.length > 0) {
      issues.push(`Critical degradations active: ${criticalDegradations.length}`);
    }

    // Check strategy availability
    if (this.strategies.size === 0) {
      issues.push('No degradation strategies available');
    }

    return {
      healthy: issues.length === 0,
      activeStrategies: this.strategies.size,
      activeDegradations: status.activeDegradations.length,
      availableStrategies: status.availableStrategies.length,
      recoveryEnabled: this.config.autoRecoveryEnabled,
      issues
    };
  }

  /**
   * Get recovery manager
   */
  getRecoveryManager(): RecoveryManager {
    return this.recoveryManager;
  }

  /**
   * Force recovery for all degradations
   */
  async forceRecoveryAll(): Promise<void> {
    const components = Array.from(new Set(
      Array.from(this.activeDegradations.values()).map(d => d.component)
    ));

    for (const component of components) {
      await this.resolveDegradation(component);
    }

    console.log('Forced recovery for all active degradations');
  }
}