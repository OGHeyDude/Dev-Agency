/**
 * Alert Store - Central state management for alerts and incidents
 * 
 * @file alertStore.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { healthApi, RealTimeAlert, IncidentTimelineEntry } from '../services/healthApi';
import { websocketService } from '../services/websocket';

interface AlertState {
  // Active alerts
  activeAlerts: RealTimeAlert[];
  activeAlertsLoading: boolean;
  activeAlertsError?: string;
  
  // Resolved alerts
  resolvedAlerts: RealTimeAlert[];
  resolvedAlertsLoading: boolean;
  resolvedAlertsError?: string;
  
  // Timeline
  timeline: IncidentTimelineEntry[];
  timelineLoading: boolean;
  timelineError?: string;
  
  // Filters
  severityFilter: 'all' | 'critical' | 'warning' | 'info';
  typeFilter: 'all' | 'health' | 'performance' | 'resource' | 'agent' | 'system';
  showResolved: boolean;
  
  // UI state
  selectedAlert?: RealTimeAlert;
  alertsPerPage: number;
  currentPage: number;
  
  // Sound and notification settings
  soundAlertsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  
  // Actions
  fetchActiveAlerts: () => Promise<void>;
  fetchResolvedAlerts: () => Promise<void>;
  fetchTimeline: (limit?: number) => Promise<void>;
  resolveAlert: (alertId: string, resolvedBy?: string) => Promise<boolean>;
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<boolean>;
  selectAlert: (alert?: RealTimeAlert) => void;
  setSeverityFilter: (severity: AlertState['severityFilter']) => void;
  setTypeFilter: (type: AlertState['typeFilter']) => void;
  setShowResolved: (show: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSoundAlerts: (enabled: boolean) => void;
  setBrowserNotifications: (enabled: boolean) => void;
  addAlert: (alert: RealTimeAlert) => void;
  updateAlert: (alert: RealTimeAlert) => void;
  addTimelineEntry: (entry: IncidentTimelineEntry) => void;
  refreshAll: () => Promise<void>;
  resetErrors: () => void;
}

export const useAlertStore = create<AlertState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    activeAlerts: [],
    resolvedAlerts: [],
    timeline: [],
    activeAlertsLoading: false,
    resolvedAlertsLoading: false,
    timelineLoading: false,
    severityFilter: 'all',
    typeFilter: 'all',
    showResolved: false,
    alertsPerPage: 20,
    currentPage: 1,
    soundAlertsEnabled: true,
    browserNotificationsEnabled: true,

    // Fetch active alerts
    fetchActiveAlerts: async () => {
      set({ activeAlertsLoading: true, activeAlertsError: undefined });
      
      try {
        const response = await healthApi.getAlerts({ status: 'active' });
        set({ 
          activeAlerts: response.alerts,
          activeAlertsLoading: false
        });
      } catch (error) {
        set({ 
          activeAlertsError: error instanceof Error ? error.message : 'Failed to fetch active alerts',
          activeAlertsLoading: false 
        });
      }
    },

    // Fetch resolved alerts
    fetchResolvedAlerts: async () => {
      set({ resolvedAlertsLoading: true, resolvedAlertsError: undefined });
      
      try {
        const response = await healthApi.getAlerts({ status: 'resolved', limit: 100 });
        set({ 
          resolvedAlerts: response.alerts,
          resolvedAlertsLoading: false
        });
      } catch (error) {
        set({ 
          resolvedAlertsError: error instanceof Error ? error.message : 'Failed to fetch resolved alerts',
          resolvedAlertsLoading: false 
        });
      }
    },

    // Fetch timeline
    fetchTimeline: async (limit = 100) => {
      set({ timelineLoading: true, timelineError: undefined });
      
      try {
        const response = await healthApi.getTimeline(limit);
        set({ 
          timeline: response.timeline,
          timelineLoading: false
        });
      } catch (error) {
        set({ 
          timelineError: error instanceof Error ? error.message : 'Failed to fetch timeline',
          timelineLoading: false 
        });
      }
    },

    // Resolve alert
    resolveAlert: async (alertId: string, resolvedBy?: string) => {
      try {
        const response = await healthApi.resolveAlert(alertId, resolvedBy);
        
        if (response.success) {
          // Move alert from active to resolved
          set((state) => ({
            activeAlerts: state.activeAlerts.filter(alert => alert.id !== alertId)
          }));
          
          // Refresh resolved alerts to get the updated one
          get().fetchResolvedAlerts();
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Failed to resolve alert:', error);
        return false;
      }
    },

    // Acknowledge alert
    acknowledgeAlert: async (alertId: string, acknowledgedBy: string) => {
      try {
        const response = await healthApi.acknowledgeAlert(alertId, acknowledgedBy);
        
        if (response.success) {
          // Update the alert in the active alerts list
          set((state) => ({
            activeAlerts: state.activeAlerts.map(alert =>
              alert.id === alertId
                ? { ...alert, acknowledgedBy, acknowledgedAt: new Date().toISOString() }
                : alert
            )
          }));
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Failed to acknowledge alert:', error);
        return false;
      }
    },

    // Select alert
    selectAlert: (alert?: RealTimeAlert) => {
      set({ selectedAlert: alert });
    },

    // Set severity filter
    setSeverityFilter: (severity) => {
      set({ severityFilter: severity, currentPage: 1 });
    },

    // Set type filter
    setTypeFilter: (type) => {
      set({ typeFilter: type, currentPage: 1 });
    },

    // Set show resolved
    setShowResolved: (show) => {
      set({ showResolved: show, currentPage: 1 });
    },

    // Set current page
    setCurrentPage: (page) => {
      set({ currentPage: Math.max(1, page) });
    },

    // Set sound alerts
    setSoundAlerts: (enabled) => {
      set({ soundAlertsEnabled: enabled });
      localStorage.setItem('soundAlertsEnabled', JSON.stringify(enabled));
    },

    // Set browser notifications
    setBrowserNotifications: (enabled) => {
      set({ browserNotificationsEnabled: enabled });
      localStorage.setItem('browserNotificationsEnabled', JSON.stringify(enabled));
      
      if (enabled && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    },

    // Add new alert (from WebSocket)
    addAlert: (alert) => {
      set((state) => ({
        activeAlerts: [alert, ...state.activeAlerts]
      }));

      // Show browser notification
      const { browserNotificationsEnabled } = get();
      if (browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`${alert.severity.toUpperCase()}: ${alert.title}`, {
          body: alert.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: alert.id
        });
      }

      // Play sound
      const { soundAlertsEnabled } = get();
      if (soundAlertsEnabled && alert.severity === 'critical') {
        // Create audio context for sound
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = alert.severity === 'critical' ? 800 : 600;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
        } catch (error) {
          console.warn('Failed to play alert sound:', error);
        }
      }
    },

    // Update alert (from WebSocket)
    updateAlert: (updatedAlert) => {
      set((state) => {
        if (updatedAlert.resolved) {
          // Move from active to resolved
          return {
            activeAlerts: state.activeAlerts.filter(alert => alert.id !== updatedAlert.id),
            resolvedAlerts: [updatedAlert, ...state.resolvedAlerts]
          };
        } else {
          // Update in active alerts
          return {
            activeAlerts: state.activeAlerts.map(alert =>
              alert.id === updatedAlert.id ? updatedAlert : alert
            )
          };
        }
      });
    },

    // Add timeline entry (from WebSocket)
    addTimelineEntry: (entry) => {
      set((state) => ({
        timeline: [entry, ...state.timeline.slice(0, 99)] // Keep only 100 most recent
      }));
    },

    // Refresh all data
    refreshAll: async () => {
      const { fetchActiveAlerts, fetchResolvedAlerts, fetchTimeline } = get();
      await Promise.allSettled([
        fetchActiveAlerts(),
        fetchResolvedAlerts(),
        fetchTimeline()
      ]);
    },

    // Reset errors
    resetErrors: () => {
      set({
        activeAlertsError: undefined,
        resolvedAlertsError: undefined,
        timelineError: undefined
      });
    }
  }))
);

// Setup WebSocket listeners
websocketService.on('alert-triggered', (alert: RealTimeAlert) => {
  useAlertStore.getState().addAlert(alert);
});

websocketService.on('alert-resolved', (alert: RealTimeAlert) => {
  useAlertStore.getState().updateAlert(alert);
});

websocketService.on('incident-update', (entry: IncidentTimelineEntry) => {
  useAlertStore.getState().addTimelineEntry(entry);
});

// Load settings from localStorage
const savedSoundAlerts = localStorage.getItem('soundAlertsEnabled');
const savedBrowserNotifications = localStorage.getItem('browserNotificationsEnabled');

if (savedSoundAlerts !== null) {
  useAlertStore.getState().setSoundAlerts(JSON.parse(savedSoundAlerts));
}

if (savedBrowserNotifications !== null) {
  useAlertStore.getState().setBrowserNotifications(JSON.parse(savedBrowserNotifications));
}

// Computed selectors
export const useAlertSelectors = () => {
  const store = useAlertStore();
  
  return {
    // Get filtered alerts
    getFilteredAlerts: () => {
      const alerts = store.showResolved ? store.resolvedAlerts : store.activeAlerts;
      
      return alerts.filter(alert => {
        if (store.severityFilter !== 'all' && alert.severity !== store.severityFilter) {
          return false;
        }
        
        if (store.typeFilter !== 'all' && alert.type !== store.typeFilter) {
          return false;
        }
        
        return true;
      });
    },

    // Get paginated alerts
    getPaginatedAlerts: () => {
      const filteredAlerts = useAlertSelectors().getFilteredAlerts();
      const start = (store.currentPage - 1) * store.alertsPerPage;
      const end = start + store.alertsPerPage;
      
      return {
        alerts: filteredAlerts.slice(start, end),
        totalPages: Math.ceil(filteredAlerts.length / store.alertsPerPage),
        currentPage: store.currentPage,
        totalAlerts: filteredAlerts.length
      };
    },

    // Get alert counts by severity
    getAlertCounts: () => {
      const active = store.activeAlerts;
      
      return {
        total: active.length,
        critical: active.filter(a => a.severity === 'critical').length,
        warning: active.filter(a => a.severity === 'warning').length,
        info: active.filter(a => a.severity === 'info').length
      };
    },

    // Get most recent alerts
    getRecentAlerts: (limit = 5) => {
      return store.activeAlerts
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },

    // Get alerts by component
    getAlertsByComponent: (component: string) => {
      return store.activeAlerts.filter(alert => alert.component === component);
    },

    // Check if there are critical alerts
    hasCriticalAlerts: () => {
      return store.activeAlerts.some(alert => alert.severity === 'critical');
    },

    // Get unacknowledged alerts
    getUnacknowledgedAlerts: () => {
      return store.activeAlerts.filter(alert => !alert.acknowledgedBy);
    },

    // Get loading states
    isLoading: () => {
      return store.activeAlertsLoading || store.resolvedAlertsLoading || store.timelineLoading;
    },

    // Get errors
    hasErrors: () => {
      return !!(store.activeAlertsError || store.resolvedAlertsError || store.timelineError);
    },

    getErrors: () => {
      return [
        store.activeAlertsError,
        store.resolvedAlertsError,
        store.timelineError
      ].filter(Boolean);
    }
  };
};