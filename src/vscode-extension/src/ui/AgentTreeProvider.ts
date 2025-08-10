/**
 * Agent Tree Provider for VS Code Extension
 * Provides tree view of available agents in the sidebar
 * 
 * @file AgentTreeProvider.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import * as vscode from 'vscode';
import { AgentManager, AgentDefinition } from '../core/AgentManager';
import { ExtensionLogger } from '../utils/ExtensionLogger';

export class AgentTreeItem extends vscode.TreeItem {
  constructor(
    public readonly agent: AgentDefinition,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
  ) {
    super(agent.name, collapsibleState);
    
    this.tooltip = agent.description;
    this.description = agent.category || 'general';
    this.iconPath = new vscode.ThemeIcon(agent.icon || 'robot');
    
    // Add context value for context menu
    this.contextValue = 'dev-agency-agent';
    
    // Make clickable to show details
    this.command = {
      command: 'dev-agency.showAgentDetails',
      title: 'Show Agent Details',
      arguments: [agent]
    };
  }
}

export class AgentCapabilityItem extends vscode.TreeItem {
  constructor(
    public readonly capability: string,
    public readonly agentName: string
  ) {
    super(capability, vscode.TreeItemCollapsibleState.None);
    
    this.tooltip = `${agentName} capability: ${capability}`;
    this.iconPath = new vscode.ThemeIcon('symbol-method');
    this.contextValue = 'dev-agency-capability';
  }
}

export class AgentTreeProvider implements vscode.TreeDataProvider<AgentTreeItem | AgentCapabilityItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<AgentTreeItem | AgentCapabilityItem | undefined | null | void> = new vscode.EventEmitter<AgentTreeItem | AgentCapabilityItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<AgentTreeItem | AgentCapabilityItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private agents: AgentDefinition[] = [];

  constructor(
    private agentManager: AgentManager,
    private logger: ExtensionLogger
  ) {
    this.initialize();
  }

  /**
   * Initialize the tree provider
   */
  private async initialize(): Promise<void> {
    try {
      // Load initial agents
      await this.refreshAgents();
      
      // Listen for agent manager events
      this.agentManager.on('agents-loaded', (agents) => {
        this.agents = agents;
        this.refresh();
      });
      
      this.agentManager.on('agents-refreshed', (agents) => {
        this.agents = agents;
        this.refresh();
      });

    } catch (error) {
      this.logger.error('Failed to initialize AgentTreeProvider:', error);
    }
  }

  /**
   * Get tree item
   */
  getTreeItem(element: AgentTreeItem | AgentCapabilityItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children for tree item
   */
  async getChildren(element?: AgentTreeItem | AgentCapabilityItem): Promise<(AgentTreeItem | AgentCapabilityItem)[]> {
    if (!element) {
      // Root level - return agents grouped by category
      return this.getAgentsByCategory();
    }

    if (element instanceof AgentTreeItem) {
      // Agent level - return capabilities
      return this.getAgentCapabilities(element.agent);
    }

    return [];
  }

  /**
   * Get agents grouped by category
   */
  private getAgentsByCategory(): AgentTreeItem[] {
    const categories = new Map<string, AgentDefinition[]>();
    
    // Group agents by category
    this.agents.forEach(agent => {
      const category = agent.category || 'general';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(agent);
    });

    // Create tree items
    const items: AgentTreeItem[] = [];
    
    // Sort categories and create items
    const sortedCategories = Array.from(categories.keys()).sort();
    
    for (const category of sortedCategories) {
      const categoryAgents = categories.get(category)!;
      categoryAgents.sort((a, b) => a.name.localeCompare(b.name));
      
      // If only one category, don't create category node
      if (categories.size === 1) {
        items.push(...categoryAgents.map(agent => new AgentTreeItem(agent)));
      } else {
        // Create category node
        const categoryItem = new AgentTreeItem({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          description: `${categoryAgents.length} agents`,
          capabilities: [],
          requirements: [],
          contextLimits: {},
          category,
          icon: this.getCategoryIcon(category)
        } as AgentDefinition);
        
        categoryItem.contextValue = 'dev-agency-category';
        categoryItem.command = undefined; // No command for category
        
        items.push(categoryItem);
      }
    }

    return items;
  }

  /**
   * Get capabilities for an agent
   */
  private getAgentCapabilities(agent: AgentDefinition): AgentCapabilityItem[] {
    const items: AgentCapabilityItem[] = [];
    
    // Add capabilities
    if (agent.capabilities && agent.capabilities.length > 0) {
      items.push(...agent.capabilities.map(capability => 
        new AgentCapabilityItem(capability, agent.name)
      ));
    } else {
      // Show placeholder if no capabilities
      const placeholder = new AgentCapabilityItem('No capabilities defined', agent.name);
      placeholder.iconPath = new vscode.ThemeIcon('info');
      items.push(placeholder);
    }
    
    return items;
  }

  /**
   * Get icon for category
   */
  private getCategoryIcon(category: string): string {
    const categoryIcons: Record<string, string> = {
      core: 'gear',
      development: 'code',
      testing: 'beaker',
      security: 'shield',
      documentation: 'book',
      performance: 'dashboard',
      integration: 'plug',
      general: 'folder'
    };
    
    return categoryIcons[category] || 'folder';
  }

  /**
   * Refresh agents from manager
   */
  async refreshAgents(): Promise<void> {
    try {
      this.agents = await this.agentManager.getAvailableAgents();
      this.refresh();
    } catch (error) {
      this.logger.error('Failed to refresh agents:', error);
    }
  }

  /**
   * Refresh tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get parent for tree item (required for reveal)
   */
  getParent(element: AgentTreeItem | AgentCapabilityItem): vscode.ProviderResult<AgentTreeItem | AgentCapabilityItem> {
    if (element instanceof AgentCapabilityItem) {
      // Find the parent agent
      const agent = this.agents.find(a => a.name === element.agentName);
      if (agent) {
        return new AgentTreeItem(agent);
      }
    }
    
    return null;
  }
}

/**
 * Execution Tree Item for showing running and recent executions
 */
export class ExecutionTreeItem extends vscode.TreeItem {
  constructor(
    public readonly execution: any,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
  ) {
    super(`${execution.agentName} - ${execution.task}`, collapsibleState);
    
    this.tooltip = this.buildTooltip(execution);
    this.description = this.buildDescription(execution);
    this.iconPath = this.getStatusIcon(execution.status);
    this.contextValue = 'dev-agency-execution';
    
    // Add command to show execution details
    this.command = {
      command: 'dev-agency.showExecutionDetails',
      title: 'Show Execution Details',
      arguments: [execution]
    };
  }

  private buildTooltip(execution: any): string {
    let tooltip = `Agent: ${execution.agentName}\n`;
    tooltip += `Task: ${execution.task}\n`;
    tooltip += `Status: ${execution.status}\n`;
    tooltip += `Started: ${new Date(execution.startTime).toLocaleString()}\n`;
    
    if (execution.endTime) {
      tooltip += `Ended: ${new Date(execution.endTime).toLocaleString()}\n`;
      const duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime();
      tooltip += `Duration: ${duration}ms\n`;
    }
    
    if (execution.progress !== undefined) {
      tooltip += `Progress: ${execution.progress}%\n`;
    }
    
    if (execution.error) {
      tooltip += `Error: ${execution.error}\n`;
    }
    
    return tooltip;
  }

  private buildDescription(execution: any): string {
    if (execution.status === 'running' && execution.progress !== undefined) {
      return `${execution.status} (${execution.progress}%)`;
    }
    
    if (execution.endTime) {
      const duration = new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime();
      return `${execution.status} (${duration}ms)`;
    }
    
    return execution.status;
  }

  private getStatusIcon(status: string): vscode.ThemeIcon {
    const statusIcons: Record<string, string> = {
      queued: 'clock',
      running: 'sync~spin',
      completed: 'check',
      failed: 'error',
      cancelled: 'circle-slash'
    };
    
    return new vscode.ThemeIcon(statusIcons[status] || 'pulse');
  }
}