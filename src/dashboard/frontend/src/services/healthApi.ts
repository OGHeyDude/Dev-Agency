/**
 * Health API Service - HTTP client for dashboard backend API
 * 
 * @file healthApi.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

// Types matching backend models
export interface AgentHealthStatus {
  agentId: string;
  status: 'running' | 'idle' | 'failed' | 'blocked' | 'recovering';
  lastActivity: Date;
  currentTask?: string;
  resourceUsage: {
    cpuPercent: number;
    memoryMB: number;
    tokensUsed: number;
  };
  performanceMetrics: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  healthScore: number;
  metadata?: Record<string, any>;
}

export interface SystemHealthSummary {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  timestamp: string;
  uptime: number;
  agentCount: {
    total: number;
    running: number;
    idle: number;
    failed: number;
    blocked: number;
    recovering: number;
  };
  resourceStatus: {
    cpu: ResourceStatus;
    memory: ResourceStatus;
    disk: ResourceStatus;
    network: ResourceStatus;
  };
  alertCount: {
    critical: number;
    warning: number;
    total: number;
  };
  healthTrend: 'improving' | 'stable' | 'degrading';
}

export interface ResourceStatus {
  current: number;
  usage: number;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface RealTimeAlert {
  id: string;
  type: 'health' | 'performance' | 'resource' | 'agent' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  component: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalationLevel: number;
  notifications: NotificationAttempt[];
  tags: string[];
  metadata?: Record<string, any>;
}

export interface NotificationAttempt {
  channel: 'slack' | 'email' | 'webhook' | 'teams';
  timestamp: string;
  success: boolean;
  error?: string;
  responseTime?: number;
}

export interface DashboardMetrics {
  timestamp: string;
  connectedClients: number;
  dataStreamRate: number;
  alertsGenerated: number;
  alertsResolved: number;
  systemLoad: {
    cpu: number;
    memory: number;
    activeConnections: number;
  };
  performanceStats: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  type: 'alert' | 'recovery' | 'acknowledgment' | 'resolution' | 'escalation';
  component: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface SystemStatusResponse {
  system?: SystemHealthSummary;
  timestamp: string;
  healthy: boolean;
  alerts: {
    active: number;
    critical: number;
    warning: number;
  };
  uptime: number;
  lastUpdate: string;
}

export interface AgentListResponse {
  agents: AgentHealthStatus[];
  count: number;
  lastUpdate: string;
}

export interface AlertListResponse {
  alerts: RealTimeAlert[];
  count: number;
}

export interface TimelineResponse {
  timeline: IncidentTimelineEntry[];
  count: number;
}

class HealthApiService {
  private baseUrl: string;
  private defaultTimeout = 10000;

  constructor() {
    this.baseUrl = this.getApiBaseUrl();
  }

  /**
   * Get API base URL
   */
  private getApiBaseUrl(): string {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = process.env.REACT_APP_API_PORT || '3002';
    
    // If running on development port, use the backend port
    if (window.location.port === '3000') {
      return `${protocol}//${hostname}:${port}/api`;
    }
    
    return `${protocol}//${window.location.host}/api`;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.defaultTimeout,
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatusResponse> {
    return this.request<SystemStatusResponse>('/status');
  }

  /**
   * Get all agents health
   */
  async getAgents(): Promise<AgentListResponse> {
    return this.request<AgentListResponse>('/agents');
  }

  /**
   * Get specific agent details
   */
  async getAgent(agentId: string): Promise<{
    agent: AgentHealthStatus;
    historical: Array<{ timestamp: string; data: AgentHealthStatus }>;
    lastUpdate: string;
  }> {
    return this.request(`/agents/${encodeURIComponent(agentId)}`);
  }

  /**
   * Get alerts
   */
  async getAlerts(params: {
    status?: 'active' | 'resolved';
    severity?: 'critical' | 'warning' | 'info';
    limit?: number;
  } = {}): Promise<AlertListResponse> {
    const query = new URLSearchParams();
    
    if (params.status) query.append('status', params.status);
    if (params.severity) query.append('severity', params.severity);
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const endpoint = queryString ? `/alerts?${queryString}` : '/alerts';
    
    return this.request<AlertListResponse>(endpoint);
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolvedBy?: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolvedBy }),
    });
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgedBy }),
    });
  }

  /**
   * Get dashboard metrics
   */
  async getMetrics(timeframe?: string): Promise<DashboardMetrics> {
    const query = timeframe ? `?timeframe=${encodeURIComponent(timeframe)}` : '';
    return this.request<DashboardMetrics>(`/metrics${query}`);
  }

  /**
   * Get incident timeline
   */
  async getTimeline(limit?: number): Promise<TimelineResponse> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<TimelineResponse>(`/timeline${query}`);
  }

  /**
   * Get resource status
   */
  async getResources(): Promise<{
    resources: Record<string, ResourceStatus>;
    lastUpdate: string;
  }> {
    return this.request('/resources');
  }

  /**
   * Get configuration
   */
  async getConfig(): Promise<{
    refreshInterval: number;
    alertThresholds: any;
    ui: any;
  }> {
    return this.request('/config');
  }

  /**
   * Update alert thresholds
   */
  async updateThresholds(thresholds: any): Promise<{ success: boolean; message: string }> {
    return this.request('/config/thresholds', {
      method: 'PUT',
      body: JSON.stringify(thresholds),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    status: string;
    uptime: number;
    services: Record<string, boolean>;
    stats: Record<string, any>;
  }> {
    // Use base URL without /api suffix for health check
    const healthUrl = this.baseUrl.replace('/api', '/health');
    const response = await fetch(healthUrl);
    return response.json();
  }
}

// Create singleton instance
export const healthApi = new HealthApiService();

// Utility functions
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
    case 'running':
      return 'text-green-600 bg-green-100';
    case 'degraded':
    case 'recovering':
      return 'text-yellow-600 bg-yellow-100';
    case 'unhealthy':
    case 'blocked':
      return 'text-orange-600 bg-orange-100';
    case 'critical':
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'idle':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-100 border-red-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'info':
      return 'text-blue-600 bg-blue-100 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};