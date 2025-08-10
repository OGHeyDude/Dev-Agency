/**
 * Alert Panel Component - Real-time alerts display and management
 * 
 * @file AlertPanel.tsx
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { RealTimeAlert } from '../../services/healthApi';
import { useAlertStore, useAlertSelectors } from '../../stores/alertStore';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  FilterIcon,
  EyeSlashIcon,
  BellIcon,
  BellSlashIcon
} from '@heroicons/react/24/outline';

interface AlertPanelProps {
  maxHeight?: string;
  showFilters?: boolean;
  showControls?: boolean;
  onAlertClick?: (alert: RealTimeAlert) => void;
  className?: string;
}

interface AlertItemProps {
  alert: RealTimeAlert;
  onResolve: (alertId: string) => void;
  onAcknowledge: (alertId: string) => void;
  onClick?: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onResolve, onAcknowledge, onClick }) => {
  const [resolving, setResolving] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <CheckCircleIcon className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleResolve = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setResolving(true);
    
    try {
      await onResolve(alert.id);
      toast.success('Alert resolved');
    } catch (error) {
      toast.error('Failed to resolve alert');
    } finally {
      setResolving(false);
    }
  };

  const handleAcknowledge = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAcknowledging(true);
    
    try {
      await onAcknowledge(alert.id);
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div
      className={clsx(
        'p-4 border-l-4 rounded-r-lg cursor-pointer hover:bg-gray-50 transition-colors',
        getSeverityClasses(alert.severity),
        alert.resolved && 'opacity-60'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getSeverityIcon(alert.severity)}
          
          <div className="flex-1 min-w-0">
            {/* Alert Header */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{alert.title}</h4>
              {alert.escalationLevel > 0 && (
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                  Escalated (L{alert.escalationLevel})
                </span>
              )}
              {alert.acknowledgedBy && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Acknowledged
                </span>
              )}
            </div>

            {/* Alert Message */}
            <p className="text-sm text-gray-600 mb-2">{alert.message}</p>

            {/* Alert Metadata */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
              </span>
              <span>{alert.component}</span>
              <span className="capitalize">{alert.type}</span>
              {alert.acknowledgedBy && (
                <span className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {alert.acknowledgedBy}
                </span>
              )}
            </div>

            {/* Notification Status */}
            {alert.notifications.length > 0 && (
              <div className="mt-2 flex gap-1">
                {alert.notifications.map((notification, index) => (
                  <span
                    key={index}
                    className={clsx(
                      'px-2 py-1 text-xs rounded',
                      notification.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}
                    title={notification.error || 'Notification sent successfully'}
                  >
                    {notification.channel}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!alert.resolved && (
          <div className="flex gap-2 ml-4">
            {!alert.acknowledgedBy && (
              <button
                onClick={handleAcknowledge}
                disabled={acknowledging}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors"
                title="Acknowledge alert"
              >
                {acknowledging ? 'Ack...' : 'Ack'}
              </button>
            )}
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
              title="Resolve alert"
            >
              {resolving ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AlertPanel: React.FC<AlertPanelProps> = ({
  maxHeight = '400px',
  showFilters = true,
  showControls = true,
  onAlertClick,
  className
}) => {
  const {
    severityFilter,
    typeFilter,
    showResolved,
    soundAlertsEnabled,
    browserNotificationsEnabled,
    setSeverityFilter,
    setTypeFilter,
    setShowResolved,
    setSoundAlerts,
    setBrowserNotifications,
    resolveAlert,
    acknowledgeAlert,
    fetchActiveAlerts,
    fetchResolvedAlerts
  } = useAlertStore();

  const {
    getPaginatedAlerts,
    getAlertCounts,
    isLoading,
    hasErrors,
    getErrors
  } = useAlertSelectors();

  const paginatedData = getPaginatedAlerts();
  const alertCounts = getAlertCounts();
  
  // Refresh alerts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveAlerts();
      if (showResolved) {
        fetchResolvedAlerts();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [fetchActiveAlerts, fetchResolvedAlerts, showResolved]);

  const handleResolve = async (alertId: string) => {
    const success = await resolveAlert(alertId, 'dashboard-user');
    if (!success) {
      throw new Error('Failed to resolve alert');
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    const success = await acknowledgeAlert(alertId, 'dashboard-user');
    if (!success) {
      throw new Error('Failed to acknowledge alert');
    }
  };

  return (
    <div className={clsx('bg-white border rounded-lg', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Alerts
            {alertCounts.total > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                {alertCounts.total}
              </span>
            )}
          </h3>

          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundAlerts(!soundAlertsEnabled)}
                className={clsx(
                  'p-2 rounded hover:bg-gray-100',
                  soundAlertsEnabled ? 'text-blue-600' : 'text-gray-400'
                )}
                title={soundAlertsEnabled ? 'Disable sound alerts' : 'Enable sound alerts'}
              >
                {soundAlertsEnabled ? (
                  <BellIcon className="h-4 w-4" />
                ) : (
                  <BellSlashIcon className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={() => setBrowserNotifications(!browserNotificationsEnabled)}
                className={clsx(
                  'p-2 rounded hover:bg-gray-100',
                  browserNotificationsEnabled ? 'text-blue-600' : 'text-gray-400'
                )}
                title={browserNotificationsEnabled ? 'Disable browser notifications' : 'Enable browser notifications'}
              >
                {browserNotificationsEnabled ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <FilterIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Alert Count Summary */}
        <div className="flex gap-4 mt-2 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Critical: {alertCounts.critical}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Warning: {alertCounts.warning}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Info: {alertCounts.info}
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4">
            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Severity:</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="health">Health</option>
                <option value="performance">Performance</option>
                <option value="resource">Resource</option>
                <option value="agent">Agent</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Show Resolved Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-resolved"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="show-resolved" className="text-sm font-medium">
                Show resolved
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {hasErrors() && (
        <div className="p-4 bg-red-50 border-b">
          {getErrors().map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      {/* Alert List */}
      <div className="relative" style={{ maxHeight, overflowY: 'auto' }}>
        {isLoading() ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading alerts...</p>
          </div>
        ) : paginatedData.alerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
            <p className="text-gray-600">
              {showResolved ? 'No resolved alerts found' : 'All systems are healthy'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {paginatedData.alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onResolve={handleResolve}
                onAcknowledge={handleAcknowledge}
                onClick={() => onAlertClick?.(alert)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginatedData.totalPages > 1 && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((paginatedData.currentPage - 1) * 20) + 1} to{' '}
              {Math.min(paginatedData.currentPage * 20, paginatedData.totalAlerts)} of{' '}
              {paginatedData.totalAlerts} alerts
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => useAlertStore.getState().setCurrentPage(paginatedData.currentPage - 1)}
                disabled={paginatedData.currentPage === 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm">
                {paginatedData.currentPage} of {paginatedData.totalPages}
              </span>
              
              <button
                onClick={() => useAlertStore.getState().setCurrentPage(paginatedData.currentPage + 1)}
                disabled={paginatedData.currentPage === paginatedData.totalPages}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;