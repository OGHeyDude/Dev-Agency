/**
 * WebSocket Service - Real-time connection management for dashboard frontend
 * 
 * @file websocket.ts
 * @created 2025-08-10
 * @updated 2025-08-10
 */

import { toast } from 'react-hot-toast';

export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  correlationId?: string;
  source: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enableLogging: boolean;
}

export type WebSocketEventHandler<T = any> = (data: T, message: WebSocketMessage<T>) => void;

export class WebSocketService {
  private ws?: WebSocket;
  private config: WebSocketConfig;
  private eventHandlers: Map<string, WebSocketEventHandler[]> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private isConnecting = false;
  private isIntentionallyClosed = false;
  
  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: this.getWebSocketUrl(),
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      enableLogging: true,
      ...config
    };
  }

  /**
   * Get WebSocket URL based on current location
   */
  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const port = process.env.REACT_APP_WEBSOCKET_PORT || '3002';
    
    // If running on different port (development), use the backend port
    if (host.includes('3000') || host.includes('localhost')) {
      return `${protocol}//${window.location.hostname}:${port}`;
    }
    
    return `${protocol}//${host}`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.isIntentionallyClosed = false;

    return new Promise((resolve, reject) => {
      try {
        this.log('Connecting to WebSocket:', this.config.url);
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.log('WebSocket connected');
          
          // Start heartbeat
          this.startHeartbeat();
          
          // Show connection success
          toast.success('Dashboard connected', { duration: 2000 });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            this.log('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.stopHeartbeat();
          
          this.log('WebSocket closed:', event.code, event.reason);
          
          if (!this.isIntentionallyClosed) {
            toast.error('Dashboard disconnected', { duration: 3000 });
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.log('WebSocket error:', error);
          
          if (this.reconnectAttempts === 0) {
            toast.error('Failed to connect to dashboard', { duration: 5000 });
          }
          
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        this.log('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = undefined;
    }
    
    this.log('WebSocket disconnected intentionally');
  }

  /**
   * Send message to server
   */
  send(type: string, data: any): boolean {
    if (!this.isConnected()) {
      this.log('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      const message = {
        type,
        data,
        timestamp: new Date().toISOString(),
        correlationId: this.generateCorrelationId()
      };

      this.ws!.send(JSON.stringify(message));
      this.log('Sent message:', type, data);
      return true;
    } catch (error) {
      this.log('Failed to send message:', error);
      return false;
    }
  }

  /**
   * Subscribe to events
   */
  subscribe(events: string[]): void {
    this.send('subscribe', { events });
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(events: string[]): void {
    this.send('unsubscribe', { events });
  }

  /**
   * Add event handler
   */
  on<T = any>(eventType: string, handler: WebSocketEventHandler<T>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Remove event handler
   */
  off(eventType: string, handler?: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (!handlers) return;

    if (handler) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(eventType);
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    this.log('Received message:', message.type, message.data);

    // Handle internal message types
    switch (message.type) {
      case 'ping':
        this.send('pong', {});
        return;
      case 'pong':
        // Heartbeat response received
        return;
    }

    // Emit to registered handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data, message);
        } catch (error) {
          this.log('Error in event handler for', message.type, ':', error);
        }
      });
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message.data, message);
        } catch (error) {
          this.log('Error in wildcard handler:', error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
        toast.error('Failed to reconnect to dashboard. Please refresh the page.', {
          duration: 0, // Don't auto-dismiss
        });
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.config.reconnectInterval * this.reconnectAttempts, 30000);

    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(async () => {
      if (!this.isIntentionallyClosed) {
        try {
          await this.connect();
        } catch (error) {
          this.log('Reconnect attempt failed:', error);
        }
      }
    }, delay);
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send('ping', {});
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.config.maxReconnectAttempts
    };
  }

  /**
   * Request current status from server
   */
  requestStatus(): void {
    this.send('get-status', {});
  }

  /**
   * Log message (if logging enabled)
   */
  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// Auto-connect on import (can be disabled if needed)
if (typeof window !== 'undefined') {
  websocketService.connect().catch((error) => {
    console.warn('Failed to auto-connect WebSocket:', error);
  });
}