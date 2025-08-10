/**
 * Dashboard Page - Main real-time health monitoring dashboard
 * 
 * @file Dashboard.tsx  
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useHealthStore, useHealthSelectors } from '../stores/healthStore';
import { useAlertStore, useAlertSelectors } from '../stores/alertStore';
import { websocketService } from '../services/websocket';
import { formatUptime } from '../services/healthApi';
import HealthGrid from '../components/HealthGrid/HealthGrid';
import AlertPanel from '../components/AlertPanel/AlertPanel';
import { StatusIndicator, TrafficLight } from '../components/StatusIndicator/StatusIndicator';
import {
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  WifiIcon,
  ClockIcon,
  SignalIcon,
  SignalSlashIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface SystemOverviewProps {
  className?: string;
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ className }) => {
  const { systemHealth, resources, lastUpdate } = useHealthStore();
  const { getOverallStatus } = useHealthSelectors();
  const { getAlertCounts } = useAlertSelectors();

  const overallStatus = getOverallStatus();
  const alertCounts = getAlertCounts();

  return (
    <div className={clsx('bg-white border rounded-lg p-6', className)}>
      <h2 className="text-xl font-semibold mb-6">System Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Overall Status</h3>
            <TrafficLight status={overallStatus} size="md" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {systemHealth?.agentCount.running || 0}
              </div>
              <div className="text-sm text-gray-600">Running Agents</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {alertCounts.critical}
              </div>
              <div className="text-sm text-gray-600">Critical Alerts</div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <ClockIcon className="h-4 w-4" />
              <span>Uptime: {systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowPathIcon className="h-4 w-4" />
              <span>
                Last updated: {lastUpdate ? format(lastUpdate, 'HH:mm:ss') : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Resource Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resource Usage</h3>
          
          <div className="space-y-3">
            {Object.entries(resources).map(([resource, status]) => (
              <div key={resource} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {resource === 'cpu' && <CpuChipIcon className="h-4 w-4 text-gray-500" />}
                  {resource === 'memory' && <CircleStackIcon className="h-4 w-4 text-gray-500" />}
                  {resource === 'disk' && <ServerIcon className="h-4 w-4 text-gray-500" />}
                  {resource === 'network' && <WifiIcon className="h-4 w-4 text-gray-500" />}
                  <span className="capitalize text-sm font-medium">{resource}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={clsx(
                        'h-2 rounded-full transition-all duration-300',
                        status.status === 'healthy' && 'bg-green-500',
                        status.status === 'degraded' && 'bg-yellow-500',
                        (status.status === 'unhealthy' || status.status === 'critical') && 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(100, status.usage)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-10 text-right">
                    {status.usage.toFixed(0)}%
                  </span>
                  <StatusIndicator status={status.status} size="sm" />
                </div>
              </div>
            ))}
          </div>

          {systemHealth?.healthTrend && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Trend:</span>
                <span className={clsx(
                  'font-medium capitalize',
                  systemHealth.healthTrend === 'improving' && 'text-green-600',
                  systemHealth.healthTrend === 'stable' && 'text-blue-600',
                  systemHealth.healthTrend === 'degrading' && 'text-red-600'
                )}>
                  {systemHealth.healthTrend}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DashboardControlsProps {
  className?: string;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({ className }) => {
  const {
    autoRefresh,
    refreshInterval,
    isConnected,
    reconnectAttempts,
    setAutoRefresh,
    refreshAll,
    resetErrors
  } = useHealthStore();

  const connectionStatus = websocketService.getConnectionStatus();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    resetErrors();
    
    try {
      await refreshAll();
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={clsx('bg-white border rounded-lg p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <SignalIcon className="h-5 w-5 text-green-600" />
            ) : (
              <SignalSlashIcon className="h-5 w-5 text-red-600" />
            )}
            <span className={clsx(
              'text-sm font-medium',
              isConnected ? 'text-green-600' : 'text-red-600'
            )}>
              {isConnected ? 'Connected' : `Disconnected${reconnectAttempts > 0 ? ` (${reconnectAttempts} attempts)` : ''}`}
            </span>
          </div>

          {/* Real-time Updates Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={clsx(
                'flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors',
                autoRefresh
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {autoRefresh ? (
                <>
                  <EyeIcon className="h-4 w-4" />
                  Live Updates
                </>
              ) : (
                <>
                  <EyeSlashIcon className="h-4 w-4" />
                  Manual Only
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
            title="Refresh dashboard data"
          >
            <ArrowPathIcon className={clsx('h-4 w-4', refreshing && 'animate-spin')} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          {/* Settings */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Dashboard settings"
          >
            <Cog6ToothIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Update Interval */}
      <div className="mt-3 pt-3 border-t">
        <div className="text-xs text-gray-500">
          Update interval: {refreshInterval / 1000}s
          {!isConnected && autoRefresh && (
            <span className="ml-2 text-yellow-600">(HTTP fallback mode)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'health' | 'lastActivity'>('status');
  const [filterStatus, setFilterStatus] = useState<'all' | 'running' | 'idle' | 'failed' | 'blocked' | 'recovering'>('all');

  const {
    agents,
    systemHealth,
    fetchSystemHealth,
    fetchAgents,
    fetchResources
  } = useHealthStore();

  const {
    fetchActiveAlerts,
    fetchTimeline
  } = useAlertStore();

  const { isLoading, hasErrors } = useHealthSelectors();

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.allSettled([
          fetchSystemHealth(),
          fetchAgents(),
          fetchResources(),
          fetchActiveAlerts(),
          fetchTimeline()
        ]);
      } catch (error) {
        console.error('Failed to load initial dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    loadInitialData();
  }, [fetchSystemHealth, fetchAgents, fetchResources, fetchActiveAlerts, fetchTimeline]);

  // Handle agent click
  const handleAgentClick = (agent: any) => {
    console.log('Agent clicked:', agent);
    // Could open a modal or navigate to agent details
  };

  // Handle alert click
  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked:', alert);
    // Could open alert details modal
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Health Monitoring Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Real-time system and agent health monitoring
              </p>
            </div>
            
            <div className="text-sm text-gray-500">
              {format(new Date(), 'MMM dd, yyyy HH:mm:ss')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Dashboard Controls */}
          <DashboardControls />

          {/* System Overview */}
          <SystemOverview />

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Health Grid */}
            <div className="xl:col-span-2">
              <div className="bg-white border rounded-lg">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Agents</h2>
                    
                    <div className="flex items-center gap-4">
                      {/* View Mode Toggle */}
                      <div className="flex border rounded-lg overflow-hidden">
                        {(['grid', 'list', 'compact'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                              'px-3 py-1 text-xs font-medium capitalize transition-colors',
                              viewMode === mode
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:bg-gray-100'
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>

                      {/* Sort & Filter */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="status">Sort by Status</option>
                        <option value="name">Sort by Name</option>
                        <option value="health">Sort by Health</option>
                        <option value="lastActivity">Sort by Activity</option>
                      </select>

                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="all">All Agents</option>
                        <option value="running">Running</option>
                        <option value="idle">Idle</option>
                        <option value="blocked">Blocked</option>
                        <option value="failed">Failed</option>
                        <option value="recovering">Recovering</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <HealthGrid
                    agents={agents}
                    loading={isLoading()}
                    error={hasErrors() ? 'Failed to load agent data' : undefined}
                    viewMode={viewMode}
                    sortBy={sortBy}
                    filterStatus={filterStatus}
                    onAgentClick={handleAgentClick}
                  />
                </div>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="xl:col-span-1">
              <AlertPanel
                maxHeight="600px"
                showFilters={true}
                showControls={true}
                onAlertClick={handleAlertClick}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;