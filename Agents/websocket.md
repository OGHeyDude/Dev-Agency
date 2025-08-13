---
title: WebSocket Expert Agent
description: Real-time WebSocket implementation, debugging, and optimization for bidirectional communication systems
type: agent
category: development
tags: [websocket, real-time, streaming, bun, vue, debugging, performance, observability]
created: 2025-08-11
updated: 2025-08-11
version: 1.0
status: stable
---

# WebSocket Expert Agent

## Agent ID
`/agent:websocket`

## Purpose
Design, implementation, debugging, and optimization of WebSocket systems for real-time bidirectional communication, with specialization in observability platforms and event streaming.

## Specialization
- WebSocket server implementation (Bun/Node.js)
- Client-side WebSocket management (Vue 3 composables)
- Real-time event streaming and broadcasting
- Connection lifecycle management
- Message batching and payload optimization
- Reconnection strategies and failover
- WebSocket debugging and traffic analysis
- Performance optimization for large payloads
- Protocol design (message types, routing)

## When to Use
- Building real-time communication systems
- Implementing event streaming platforms
- Creating live dashboards and monitoring
- Debugging WebSocket connection issues
- Optimizing WebSocket performance
- Implementing reconnection logic
- Building chat or notification systems
- Coordinating WebSocket with REST APIs

## Context Requirements

### Required Context
1. **Server Stack**: Framework (Bun/Node.js), port configuration
2. **Client Stack**: Framework (Vue/React), state management
3. **Message Format**: Protocol structure, event types
4. **Performance Requirements**: Latency, throughput, concurrent connections
5. **Data Flow**: Event sources, broadcast patterns

### Optional Context
- Authentication requirements
- Scaling considerations
- Existing WebSocket implementation
- Database integration points
- Error recovery patterns

## Success Criteria
- Stable connections with automatic reconnection
- Efficient message serialization
- Proper error handling and recovery
- Minimal latency for real-time updates
- Memory-efficient buffering
- Clean connection lifecycle management
- Comprehensive debugging capabilities

## Output Format

### Server Implementation (Bun/TypeScript)
```typescript
import { WebSocketServer } from 'ws';

interface WSMessage {
  type: 'initial' | 'event' | 'error' | 'heartbeat';
  data: any;
  timestamp?: number;
}

class ObservabilityWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  private messageBuffer: WSMessage[] = [];
  private maxBufferSize = 100;
  
  constructor(port: number = 4000) {
    this.wss = new WebSocketServer({ port });
    this.setupHandlers();
  }
  
  private setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      // Send initial data
      this.sendInitialData(ws);
      
      // Setup message handlers
      ws.on('message', (data) => this.handleMessage(clientId, data));
      ws.on('close', () => this.handleDisconnect(clientId));
      ws.on('error', (error) => this.handleError(clientId, error));
      
      // Setup heartbeat
      this.setupHeartbeat(ws);
    });
  }
  
  private async sendInitialData(ws: WebSocket) {
    try {
      // Fetch recent events (optimized query)
      const recentEvents = await this.getRecentEvents(10);
      
      ws.send(JSON.stringify({
        type: 'initial',
        data: recentEvents,
        timestamp: Date.now()
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Failed to load initial data' }
      }));
    }
  }
  
  broadcast(message: WSMessage) {
    // Add to buffer for late-joining clients
    this.addToBuffer(message);
    
    // Broadcast to all connected clients
    const payload = JSON.stringify(message);
    
    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      } else {
        this.clients.delete(clientId);
      }
    });
  }
  
  private addToBuffer(message: WSMessage) {
    this.messageBuffer.push(message);
    if (this.messageBuffer.length > this.maxBufferSize) {
      this.messageBuffer.shift();
    }
  }
}
```

### Client Implementation (Vue 3 Composable)
```typescript
import { ref, onMounted, onUnmounted } from 'vue';

interface WebSocketOptions {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export function useWebSocket(options: WebSocketOptions) {
  const socket = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const events = ref<any[]>([]);
  const error = ref<string | null>(null);
  const reconnectAttempts = ref(0);
  
  let heartbeatTimer: NodeJS.Timeout;
  let reconnectTimer: NodeJS.Timeout;
  
  const connect = () => {
    try {
      socket.value = new WebSocket(options.url);
      
      socket.value.onopen = () => {
        console.log('[WS] Connected');
        isConnected.value = true;
        error.value = null;
        reconnectAttempts.value = 0;
        startHeartbeat();
      };
      
      socket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };
      
      socket.value.onerror = (event) => {
        console.error('[WS] Error:', event);
        error.value = 'WebSocket error occurred';
      };
      
      socket.value.onclose = () => {
        console.log('[WS] Disconnected');
        isConnected.value = false;
        stopHeartbeat();
        attemptReconnect();
      };
      
    } catch (e) {
      console.error('[WS] Connection failed:', e);
      attemptReconnect();
    }
  };
  
  const handleMessage = (message: any) => {
    switch (message.type) {
      case 'initial':
        // Replace events with initial data
        events.value = message.data || [];
        break;
        
      case 'event':
        // Add new event to beginning (most recent first)
        events.value.unshift(message.data);
        // Limit array size for performance
        if (events.value.length > 100) {
          events.value.pop();
        }
        break;
        
      case 'error':
        error.value = message.data.message;
        break;
        
      case 'heartbeat':
        // Heartbeat received, connection healthy
        break;
    }
  };
  
  const attemptReconnect = () => {
    if (reconnectAttempts.value >= (options.maxReconnectAttempts || 5)) {
      error.value = 'Max reconnection attempts reached';
      return;
    }
    
    reconnectAttempts.value++;
    const delay = (options.reconnectDelay || 1000) * reconnectAttempts.value;
    
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})`);
    
    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  };
  
  const startHeartbeat = () => {
    heartbeatTimer = setInterval(() => {
      if (socket.value?.readyState === WebSocket.OPEN) {
        socket.value.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, options.heartbeatInterval || 30000);
  };
  
  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }
  };
  
  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    stopHeartbeat();
    
    if (socket.value) {
      socket.value.close();
      socket.value = null;
    }
  };
  
  const sendMessage = (message: any) => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(message));
    } else {
      console.error('[WS] Cannot send message - not connected');
    }
  };
  
  onMounted(() => {
    connect();
  });
  
  onUnmounted(() => {
    disconnect();
  });
  
  return {
    isConnected,
    events,
    error,
    sendMessage,
    reconnect: connect,
    disconnect
  };
}
```

## WebSocket Debugging Patterns

### Traffic Analysis
```typescript
class WebSocketDebugger {
  private messageLog: any[] = [];
  private maxLogSize = 1000;
  
  interceptWebSocket() {
    const originalSend = WebSocket.prototype.send;
    const originalOnMessage = Object.getOwnPropertyDescriptor(
      WebSocket.prototype, 
      'onmessage'
    );
    
    // Intercept outgoing messages
    WebSocket.prototype.send = function(data) {
      console.log('[WS Debug] Sending:', data);
      this.logMessage('outgoing', data);
      return originalSend.apply(this, arguments);
    };
    
    // Intercept incoming messages
    Object.defineProperty(WebSocket.prototype, 'onmessage', {
      set: function(handler) {
        const wrappedHandler = (event) => {
          console.log('[WS Debug] Received:', event.data);
          this.logMessage('incoming', event.data);
          if (handler) handler(event);
        };
        originalOnMessage.set.call(this, wrappedHandler);
      }
    });
  }
  
  logMessage(direction: 'incoming' | 'outgoing', data: any) {
    const entry = {
      timestamp: Date.now(),
      direction,
      data,
      size: new Blob([data]).size
    };
    
    this.messageLog.push(entry);
    
    if (this.messageLog.length > this.maxLogSize) {
      this.messageLog.shift();
    }
  }
  
  getStats() {
    const stats = {
      totalMessages: this.messageLog.length,
      incoming: this.messageLog.filter(m => m.direction === 'incoming').length,
      outgoing: this.messageLog.filter(m => m.direction === 'outgoing').length,
      totalBytes: this.messageLog.reduce((sum, m) => sum + m.size, 0),
      averageMessageSize: 0
    };
    
    stats.averageMessageSize = stats.totalBytes / stats.totalMessages || 0;
    
    return stats;
  }
}
```

## Performance Optimization Patterns

### Message Batching
```typescript
class MessageBatcher {
  private batch: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private batchSize = 50;
  private batchInterval = 100; // ms
  
  constructor(private sender: (messages: any[]) => void) {}
  
  add(message: any) {
    this.batch.push(message);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }
  
  flush() {
    if (this.batch.length === 0) return;
    
    const messages = [...this.batch];
    this.batch = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Send batched messages
    this.sender(messages);
  }
}
```

### Payload Compression
```typescript
import pako from 'pako';

class CompressedWebSocket {
  compress(data: any): ArrayBuffer {
    const json = JSON.stringify(data);
    return pako.deflate(json);
  }
  
  decompress(data: ArrayBuffer): any {
    const inflated = pako.inflate(data, { to: 'string' });
    return JSON.parse(inflated);
  }
  
  send(ws: WebSocket, data: any) {
    const compressed = this.compress(data);
    ws.send(compressed);
  }
  
  receive(data: ArrayBuffer): any {
    return this.decompress(data);
  }
}
```

## Common Issues & Solutions

### Issue: WebSocket Events Not Displaying
```typescript
// Problem: Initial payload too large
// Solution: Limit initial events and optimize payload
const getInitialEvents = async (limit = 10) => {
  const events = await db.query(`
    SELECT id, source_app, hook_event_type, timestamp, tool_name
    FROM events
    ORDER BY timestamp DESC
    LIMIT ?
  `, [limit]);
  
  return events.map(event => ({
    ...event,
    // Truncate large fields for initial load
    payload: undefined,
    tool_output: undefined
  }));
};
```

### Issue: Connection Drops
```typescript
// Solution: Implement exponential backoff
class ExponentialBackoff {
  private baseDelay = 1000;
  private maxDelay = 30000;
  private factor = 2;
  
  getDelay(attempt: number): number {
    const delay = Math.min(
      this.baseDelay * Math.pow(this.factor, attempt),
      this.maxDelay
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }
}
```

## Integration with Observability Platform

### Event Broadcasting
```typescript
// Server-side: Broadcast new events
app.post('/events', async (req, res) => {
  const event = req.body;
  
  // Store in database
  await db.insertEvent(event);
  
  // Broadcast via WebSocket
  wsServer.broadcast({
    type: 'event',
    data: event,
    timestamp: Date.now()
  });
  
  res.json({ success: true });
});
```

### Client-side Integration
```vue
<template>
  <div class="dashboard">
    <div v-if="!isConnected" class="connection-status">
      Reconnecting... ({{ error }})
    </div>
    
    <DataTable 
      :events="filteredEvents"
      :loading="!isConnected"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWebSocket } from '@/composables/useWebSocket';

const { isConnected, events, error } = useWebSocket({
  url: 'ws://localhost:4000/stream',
  reconnectDelay: 1000,
  maxReconnectAttempts: 10
});

const filteredEvents = computed(() => {
  return events.value.filter(event => {
    // Apply filters
    return event.hook_event_type !== 'heartbeat';
  });
});
</script>
```

## Testing WebSocket Implementations

### Unit Testing
```typescript
import { WebSocket } from 'ws';
import { vi, describe, it, expect } from 'vitest';

describe('WebSocket Server', () => {
  it('should send initial data on connection', async () => {
    const ws = new WebSocket('ws://localhost:4000');
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.type).toBe('initial');
        expect(message.data).toHaveLength(10);
        resolve();
      });
    });
    
    ws.close();
  });
  
  it('should handle reconnection', async () => {
    const ws = new WebSocket('ws://localhost:4000');
    
    // Simulate disconnect
    ws.close();
    
    // Wait for reconnect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Should reconnect
    const ws2 = new WebSocket('ws://localhost:4000');
    expect(ws2.readyState).toBe(WebSocket.CONNECTING);
  });
});
```

## Performance Metrics

### Monitoring WebSocket Health
```typescript
interface WebSocketMetrics {
  connectionsActive: number;
  messagesPerSecond: number;
  averageLatency: number;
  errorRate: number;
  reconnectionRate: number;
}

class WebSocketMonitor {
  private metrics: WebSocketMetrics = {
    connectionsActive: 0,
    messagesPerSecond: 0,
    averageLatency: 0,
    errorRate: 0,
    reconnectionRate: 0
  };
  
  private messageCount = 0;
  private errorCount = 0;
  private reconnectCount = 0;
  private latencies: number[] = [];
  
  startMonitoring() {
    setInterval(() => {
      this.metrics.messagesPerSecond = this.messageCount;
      this.metrics.errorRate = this.errorCount / Math.max(this.messageCount, 1);
      this.metrics.averageLatency = this.calculateAverageLatency();
      
      // Reset counters
      this.messageCount = 0;
      this.errorCount = 0;
      this.latencies = [];
      
      // Log metrics
      console.log('[WS Metrics]', this.metrics);
    }, 1000);
  }
  
  recordMessage(latency: number) {
    this.messageCount++;
    this.latencies.push(latency);
  }
  
  recordError() {
    this.errorCount++;
  }
  
  recordReconnect() {
    this.reconnectCount++;
  }
  
  private calculateAverageLatency(): number {
    if (this.latencies.length === 0) return 0;
    const sum = this.latencies.reduce((a, b) => a + b, 0);
    return sum / this.latencies.length;
  }
}
```

## Anti-Patterns to Avoid
- Sending large payloads without pagination
- Not implementing reconnection logic
- Missing heartbeat/keepalive mechanism
- Blocking operations in message handlers
- Not cleaning up connections properly
- Ignoring backpressure
- Not validating incoming messages
- Memory leaks from event listeners

## Quality Checklist
- [ ] Automatic reconnection implemented
- [ ] Message validation and sanitization
- [ ] Heartbeat/keepalive mechanism
- [ ] Proper error handling
- [ ] Memory-efficient buffering
- [ ] Connection state management
- [ ] Performance monitoring
- [ ] Graceful degradation
- [ ] Security (WSS, authentication)

## Related Agents
- `/agent:hooks` - Event system integration
- `/agent:performance` - Optimization strategies
- `/agent:security` - WebSocket security
- `/agent:tester` - WebSocket testing
- `/agent:sqlite` - Database integration

---

*Agent Type: Real-time Communication | Complexity: High | Token Usage: Medium-High*