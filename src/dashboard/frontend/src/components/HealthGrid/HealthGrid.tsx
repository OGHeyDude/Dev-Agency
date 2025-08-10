/**
 * Health Grid Component - Visual grid showing all agents with color-coded status
 * 
 * @file HealthGrid.tsx
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { AgentHealthStatus } from '../../services/healthApi';
import { StatusIndicator, HealthScore, AgentStatus } from '../StatusIndicator/StatusIndicator';
import { 
  ClockIcon, 
  CpuChipIcon, 
  CircleStackIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface HealthGridProps {
  agents: AgentHealthStatus[];
  loading?: boolean;
  error?: string;
  onAgentClick?: (agent: AgentHealthStatus) => void;
  viewMode?: 'grid' | 'list' | 'compact';
  sortBy?: 'name' | 'status' | 'health' | 'lastActivity';
  sortOrder?: 'asc' | 'desc';
  filterStatus?: 'all' | AgentStatus;
  className?: string;
}

interface AgentCardProps {
  agent: AgentHealthStatus;
  viewMode: 'grid' | 'list' | 'compact';
  onClick?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, viewMode, onClick }) => {
  const getStatusIcon = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'blocked':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'recovering':
        return <ArrowPathIcon className="h-5 w-5 text-blue-600" />;
      case 'idle':
        return <PauseCircleIcon className="h-5 w-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBorderColor = (status: AgentStatus) => {
    switch (status) {
      case 'running':
        return 'border-l-green-500';
      case 'failed':
        return 'border-l-red-500';
      case 'blocked':
        return 'border-l-yellow-500';
      case 'recovering':
        return 'border-l-blue-500';
      case 'idle':
        return 'border-l-gray-400';
      default:
        return 'border-l-gray-300';
    }
  };

  if (viewMode === 'compact') {
    return (
      <div
        className={clsx(
          'p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
          'border-l-4',
          getStatusBorderColor(agent.status)
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIndicator status={agent.status} size="sm" />
            <span className="font-medium text-sm truncate">{agent.agentId}</span>
          </div>
          <div className="text-xs text-gray-500">
            {agent.healthScore}%
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        className={clsx(
          'p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
          'border-l-4',
          getStatusBorderColor(agent.status)
        )}
        onClick={onClick}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Agent Name & Status */}
          <div className="col-span-3 flex items-center gap-3">
            <StatusIndicator status={agent.status} size="md" />
            {getStatusIcon(agent.status)}
            <div>
              <div className="font-medium">{agent.agentId}</div>
              <div className="text-xs text-gray-500 capitalize">{agent.status}</div>
            </div>
          </div>

          {/* Health Score */}
          <div className="col-span-2">
            <HealthScore score={agent.healthScore} size="sm" />
          </div>

          {/* Performance Metrics */}
          <div className="col-span-2 text-sm">
            <div>Response: {agent.performanceMetrics.avgResponseTime}ms</div>
            <div className={clsx(
              'text-xs',
              agent.performanceMetrics.errorRate > 5 ? 'text-red-600' : 'text-gray-500'
            )}>
              Error: {agent.performanceMetrics.errorRate.toFixed(1)}%
            </div>
          </div>

          {/* Resource Usage */}
          <div className="col-span-2 text-sm">
            <div className="flex items-center gap-1">
              <CpuChipIcon className="h-3 w-3 text-gray-400" />
              <span>{agent.resourceUsage.cpuPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <CircleStackIcon className="h-3 w-3 text-gray-400" />
              <span>{(agent.resourceUsage.memoryMB / 1024).toFixed(1)}GB</span>
            </div>
          </div>

          {/* Current Task */}
          <div className="col-span-2 text-sm text-gray-600 truncate">
            {agent.currentTask || 'No active task'}
          </div>

          {/* Last Activity */}
          <div className="col-span-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              <span>{format(new Date(agent.lastActivity), 'HH:mm:ss')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={clsx(
        'p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
        'border-l-4',
        getStatusBorderColor(agent.status)
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIndicator status={agent.status} size="md" />
          {getStatusIcon(agent.status)}
        </div>
        <div className="text-xs text-gray-500">
          {format(new Date(agent.lastActivity), 'HH:mm')}
        </div>
      </div>

      {/* Agent Name */}
      <div className="mb-3">
        <h3 className="font-medium text-lg truncate" title={agent.agentId}>
          {agent.agentId}
        </h3>
        <p className="text-sm text-gray-600 capitalize">{agent.status}</p>
      </div>

      {/* Health Score */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Health Score</div>
        <HealthScore score={agent.healthScore} size="sm" />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <div className="text-gray-500">Response</div>
          <div className="font-medium">{agent.performanceMetrics.avgResponseTime}ms</div>
        </div>
        <div>
          <div className="text-gray-500">Success</div>
          <div className={clsx(
            'font-medium',
            agent.performanceMetrics.successRate > 90 ? 'text-green-600' : 'text-yellow-600'
          )}>
            {agent.performanceMetrics.successRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <CpuChipIcon className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500">CPU:</span>
          <span className="font-medium">{agent.resourceUsage.cpuPercent.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <CircleStackIcon className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500">Mem:</span>
          <span className="font-medium">{(agent.resourceUsage.memoryMB / 1024).toFixed(1)}GB</span>
        </div>
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500 mb-1">Current Task</div>
          <div className="text-sm font-medium truncate" title={agent.currentTask}>
            {agent.currentTask}
          </div>
        </div>
      )}
    </div>
  );
};

export const HealthGrid: React.FC<HealthGridProps> = ({
  agents,
  loading = false,
  error,
  onAgentClick,
  viewMode = 'grid',
  sortBy = 'name',
  sortOrder = 'asc',
  filterStatus = 'all',
  className
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Filter and sort agents
  const filteredAndSortedAgents = useMemo(() => {
    let filtered = agents;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === filterStatus);
    }

    // Sort agents
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.agentId.localeCompare(b.agentId);
          break;
        case 'status':
          // Custom status order: running, recovering, idle, blocked, failed
          const statusOrder = ['running', 'recovering', 'idle', 'blocked', 'failed'];
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'health':
          comparison = b.healthScore - a.healthScore; // Higher health first by default
          break;
        case 'lastActivity':
          comparison = new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }, [agents, filterStatus, sortBy, sortOrder]);

  // Handle agent click
  const handleAgentClick = (agent: AgentHealthStatus) => {
    setSelectedAgent(agent.agentId);
    onAgentClick?.(agent);
  };

  // Get grid layout classes based on view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case 'compact':
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2';
      case 'list':
        return 'space-y-2';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className={getGridClasses()}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load agents</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Empty state
  if (filteredAndSortedAgents.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <CpuChipIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
        <p className="text-gray-600">
          {filterStatus !== 'all' 
            ? `No agents with status "${filterStatus}"`
            : "No agents are currently available"
          }
        </p>
      </div>
    );
  }

  // Status summary
  const statusCounts = agents.reduce((counts, agent) => {
    counts[agent.status] = (counts[agent.status] || 0) + 1;
    return counts;
  }, {} as Record<AgentStatus, number>);

  return (
    <div className={className}>
      {/* Status Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <StatusIndicator status="running" size="sm" />
            <span className="text-sm">Running: <span className="font-medium">{statusCounts.running || 0}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="recovering" size="sm" />
            <span className="text-sm">Recovering: <span className="font-medium">{statusCounts.recovering || 0}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="idle" size="sm" />
            <span className="text-sm">Idle: <span className="font-medium">{statusCounts.idle || 0}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="blocked" size="sm" />
            <span className="text-sm">Blocked: <span className="font-medium">{statusCounts.blocked || 0}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status="failed" size="sm" />
            <span className="text-sm">Failed: <span className="font-medium">{statusCounts.failed || 0}</span></span>
          </div>
          <div className="ml-auto text-sm font-medium">
            Total: {agents.length}
          </div>
        </div>
      </div>

      {/* List header for list view */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          <div className="col-span-3">Agent & Status</div>
          <div className="col-span-2">Health Score</div>
          <div className="col-span-2">Performance</div>
          <div className="col-span-2">Resources</div>
          <div className="col-span-2">Current Task</div>
          <div className="col-span-1">Last Activity</div>
        </div>
      )}

      {/* Agents Grid/List */}
      <div className={getGridClasses()}>
        {filteredAndSortedAgents.map((agent) => (
          <AgentCard
            key={agent.agentId}
            agent={agent}
            viewMode={viewMode}
            onClick={() => handleAgentClick(agent)}
          />
        ))}
      </div>
    </div>
  );
};

export default HealthGrid;