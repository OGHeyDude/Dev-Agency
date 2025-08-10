/**
 * Health Store - Central state management for health data
 * 
 * @file healthStore.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { healthApi, AgentHealthStatus, SystemHealthSummary, ResourceStatus } from '../services/healthApi';
import { websocketService } from '../services/websocket';

interface HealthState {
  // System health
  systemHealth?: SystemHealthSummary;
  systemHealthLoading: boolean;
  systemHealthError?: string;
  
  // Agent health
  agents: AgentHealthStatus[];
  agentsLoading: boolean;
  agentsError?: string;
  selectedAgent?: AgentHealthStatus;
  
  // Resource status
  resources: Record<string, ResourceStatus>;
  resourcesLoading: boolean;
  resourcesError?: string;
  
  // Connection status
  isConnected: boolean;
  reconnectAttempts: number;
  lastUpdate?: Date;
  
  // UI state
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Actions
  fetchSystemHealth: () => Promise<void>;
  fetchAgents: () => Promise<void>;
  fetchResources: () => Promise<void>;
  fetchAgent: (agentId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  updateSystemHealth: (health: SystemHealthSummary) => void;
  updateAgentHealth: (agent: AgentHealthStatus) => void;
  updateResourceStatus: (resources: Record<string, ResourceStatus>) => void;
  setConnectionStatus: (connected: boolean, attempts: number) => void;
  resetErrors: () => void;
}

export const useHealthStore = create<HealthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    agents: [],
    resources: {},
    agentsLoading: false,
    systemHealthLoading: false,
    resourcesLoading: false,
    isConnected: false,
    reconnectAttempts: 0,
    autoRefresh: true,
    refreshInterval: 5000,

    // Fetch system health
    fetchSystemHealth: async () => {
      set({ systemHealthLoading: true, systemHealthError: undefined });
      
      try {
        const response = await healthApi.getSystemStatus();
        set({ 
          systemHealth: response.system,
          systemHealthLoading: false,
          lastUpdate: new Date()
        });
      } catch (error) {
        set({ 
          systemHealthError: error instanceof Error ? error.message : 'Failed to fetch system health',
          systemHealthLoading: false 
        });
      }
    },

    // Fetch agents
    fetchAgents: async () => {
      set({ agentsLoading: true, agentsError: undefined });
      
      try {
        const response = await healthApi.getAgents();
        set({ 
          agents: response.agents,
          agentsLoading: false,
          lastUpdate: new Date()
        });
      } catch (error) {
        set({ 
          agentsError: error instanceof Error ? error.message : 'Failed to fetch agents',
          agentsLoading: false 
        });
      }
    },

    // Fetch resources
    fetchResources: async () => {
      set({ resourcesLoading: true, resourcesError: undefined });
      
      try {
        const response = await healthApi.getResources();
        set({ 
          resources: response.resources,
          resourcesLoading: false,
          lastUpdate: new Date()
        });
      } catch (error) {
        set({ 
          resourcesError: error instanceof Error ? error.message : 'Failed to fetch resources',
          resourcesLoading: false 
        });
      }
    },

    // Fetch specific agent
    fetchAgent: async (agentId: string) => {
      try {
        const response = await healthApi.getAgent(agentId);
        set({ selectedAgent: response.agent });
      } catch (error) {
        console.error('Failed to fetch agent:', error);
      }
    },

    // Refresh all data
    refreshAll: async () => {
      const { fetchSystemHealth, fetchAgents, fetchResources } = get();
      await Promise.allSettled([
        fetchSystemHealth(),
        fetchAgents(),
        fetchResources()
      ]);
    },

    // Set auto refresh
    setAutoRefresh: (enabled: boolean) => {
      set({ autoRefresh: enabled });
    },

    // Set refresh interval
    setRefreshInterval: (interval: number) => {
      set({ refreshInterval: Math.max(1000, interval) }); // Minimum 1 second
    },

    // Update system health (from WebSocket)
    updateSystemHealth: (health: SystemHealthSummary) => {
      set({ 
        systemHealth: health,
        lastUpdate: new Date()
      });
    },

    // Update agent health (from WebSocket)
    updateAgentHealth: (updatedAgent: AgentHealthStatus) => {
      set((state) => ({
        agents: state.agents.map(agent =>
          agent.agentId === updatedAgent.agentId ? updatedAgent : agent
        ),
        selectedAgent: state.selectedAgent?.agentId === updatedAgent.agentId 
          ? updatedAgent 
          : state.selectedAgent,
        lastUpdate: new Date()
      }));
    },

    // Update resource status (from WebSocket)
    updateResourceStatus: (newResources: Record<string, ResourceStatus>) => {
      set({ 
        resources: { ...get().resources, ...newResources },
        lastUpdate: new Date()
      });
    },

    // Set connection status
    setConnectionStatus: (connected: boolean, attempts: number) => {
      set({ isConnected: connected, reconnectAttempts: attempts });
    },

    // Reset errors
    resetErrors: () => {
      set({
        systemHealthError: undefined,
        agentsError: undefined,
        resourcesError: undefined
      });
    }
  }))
);

// Setup WebSocket listeners
websocketService.on('system-health-update', (data: SystemHealthSummary) => {
  useHealthStore.getState().updateSystemHealth(data);
});

websocketService.on('agent-status-change', (data: AgentHealthStatus) => {
  useHealthStore.getState().updateAgentHealth(data);
});

websocketService.on('resource-threshold-breach', (data: any) => {
  // Update resource status when threshold breach is detected
  const { resources } = useHealthStore.getState();
  if (resources[data.metric]) {
    const updatedResource = {
      ...resources[data.metric],
      current: data.currentValue,
      usage: data.currentValue,
      status: data.severity === 'critical' ? 'critical' as const : 'degraded' as const
    };
    useHealthStore.getState().updateResourceStatus({ [data.metric]: updatedResource });
  }
});

// Monitor WebSocket connection status
const updateConnectionStatus = () => {
  const status = websocketService.getConnectionStatus();
  useHealthStore.getState().setConnectionStatus(status.connected, status.reconnectAttempts);
};

// Update connection status periodically
setInterval(updateConnectionStatus, 1000);

// Setup auto-refresh
let refreshTimer: NodeJS.Timeout;

const setupAutoRefresh = () => {
  const { autoRefresh, refreshInterval } = useHealthStore.getState();
  
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  if (autoRefresh) {
    refreshTimer = setInterval(() => {
      const { isConnected } = useHealthStore.getState();
      // Only refresh via HTTP if WebSocket is not connected
      if (!isConnected) {
        useHealthStore.getState().refreshAll();
      }
    }, refreshInterval);
  }
};

// Subscribe to auto-refresh changes
useHealthStore.subscribe(
  (state) => ({ autoRefresh: state.autoRefresh, refreshInterval: state.refreshInterval }),
  setupAutoRefresh,
  { equalityFn: (a, b) => a.autoRefresh === b.autoRefresh && a.refreshInterval === b.refreshInterval }
);

// Initial setup
setupAutoRefresh();

// Computed selectors
export const useHealthSelectors = () => {
  const store = useHealthStore();
  
  return {
    // Get agents by status
    getAgentsByStatus: (status: AgentHealthStatus['status']) =>
      store.agents.filter(agent => agent.status === status),
    
    // Get healthy agents count
    getHealthyAgentsCount: () =>
      store.agents.filter(agent => agent.status === 'running').length,
    
    // Get failed agents count
    getFailedAgentsCount: () =>
      store.agents.filter(agent => agent.status === 'failed').length,
    
    // Get overall system status
    getOverallStatus: () => {
      if (store.systemHealth) {
        return store.systemHealth.overall;
      }
      
      // Calculate based on agents if system health not available
      const failedCount = store.agents.filter(agent => agent.status === 'failed').length;
      const totalCount = store.agents.length;
      
      if (failedCount === 0) return 'healthy';
      if (failedCount / totalCount > 0.5) return 'critical';
      if (failedCount / totalCount > 0.25) return 'unhealthy';
      return 'degraded';
    },
    
    // Get critical resources
    getCriticalResources: () =>
      Object.entries(store.resources).filter(([, resource]) => resource.status === 'critical'),
    
    // Get loading state
    isLoading: () =>
      store.systemHealthLoading || store.agentsLoading || store.resourcesLoading,
    
    // Get any errors
    hasErrors: () =>
      !!(store.systemHealthError || store.agentsError || store.resourcesError),
    
    // Get all errors
    getErrors: () => [
      store.systemHealthError,
      store.agentsError,
      store.resourcesError
    ].filter(Boolean),
  };
};