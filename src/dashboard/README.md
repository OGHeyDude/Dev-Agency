# Real-time Health Monitoring Dashboard

A comprehensive real-time health monitoring dashboard for the Dev-Agency system, providing live visibility into agent execution status, resource utilization, performance degradation, and automated alerting for critical issues.

## Features

### 🎯 Core Capabilities
- **Real-time agent status monitoring** with <100ms latency
- **Live system health visualization** with traffic light indicators
- **WebSocket streaming** for instant updates with SSE fallback
- **Resource usage monitoring** with threshold-based alerts
- **Alert management** with escalation rules and notifications
- **Mobile-responsive design** for on-call access
- **Historical data tracking** and trend analysis

### 🚀 Technical Features
- **TypeScript** with full type safety
- **React + TypeScript** frontend with Tailwind CSS
- **Node.js + Express** backend with WebSocket support
- **Redis caching** for real-time data optimization
- **Comprehensive error handling** and recovery
- **Production-ready** deployment with health checks

## Architecture Overview

```
Real-time Health Monitor Architecture:

┌─────────────────────────────────────┐
│           Frontend Dashboard        │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Health Grid │ │  Alert Panel    ││
│  │ Status LEDs │ │  Notifications  ││
│  └─────────────┘ └─────────────────┘│
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Metrics     │ │  System Status  ││
│  │ Real-time   │ │  Overview       ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
           │ WebSocket/SSE
           ▼
┌─────────────────────────────────────┐
│        Health Monitor API           │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Data        │ │  Alert          ││
│  │ Aggregator  │ │  Manager        ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
           │ Poll/Subscribe
           ▼
┌─────────────────────────────────────┐
│         Data Sources                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │ Agent   │ │ System  │ │ External││
│  │ Metrics │ │ Stats   │ │ APIs    ││
│  └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────┘
```

## Directory Structure

```
/dashboard/
├── backend/                    # Backend services
│   ├── src/
│   │   ├── controllers/        # API controllers
│   │   │   └── HealthDashboardController.ts
│   │   ├── services/           # Core services
│   │   │   ├── WebSocketServer.ts
│   │   │   ├── AlertManager.ts
│   │   │   └── HealthCollector.ts
│   │   ├── models/             # Data models
│   │   │   └── RealTimeHealthStatus.ts
│   │   ├── config/             # Configuration files
│   │   │   └── dashboard-config.json
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── HealthGrid/
│   │   │   ├── AlertPanel/
│   │   │   └── StatusIndicator/
│   │   ├── services/           # API and WebSocket clients
│   │   │   ├── healthApi.ts
│   │   │   └── websocket.ts
│   │   ├── stores/             # Zustand state management
│   │   │   ├── healthStore.ts
│   │   │   └── alertStore.ts
│   │   ├── pages/              # Main pages
│   │   │   └── Dashboard.tsx
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
├── index.ts                    # Main integration point
└── README.md                   # This file
```

## Quick Start

### 1. Backend Setup

```bash
cd dashboard/backend
npm install
npm run build
npm start
```

The backend will start on port 3002 by default.

### 2. Frontend Setup

```bash
cd dashboard/frontend
npm install
npm start
```

The frontend will start on port 3000 and proxy API calls to the backend.

### 3. Integration Usage

```typescript
import { HealthMonitoringDashboard } from './dashboard';
import { HealthCheckManager } from './health/HealthCheckManager';
import { NotificationManager } from './notifications/NotificationManager';

// Initialize with existing services
const healthCheckManager = new HealthCheckManager(/* config */);
const notificationManager = new NotificationManager();

const dashboard = new HealthMonitoringDashboard({
  port: 3002,
  healthCheckManager,
  notificationManager,
  enableWebSocket: true,
  enableRedis: true,
  redisUrl: 'redis://localhost:6379'
});

// Start the dashboard
await dashboard.start();

// Dashboard is now available at http://localhost:3002
```

## Configuration

### Backend Configuration

The backend can be configured via `backend/src/config/dashboard-config.json`:

```json
{
  "server": {
    "port": 3002,
    "cors": {
      "origins": ["*"]
    }
  },
  "websocket": {
    "enabled": true,
    "heartbeatInterval": 30000,
    "maxClients": 100
  },
  "dashboard": {
    "refreshInterval": 5000,
    "alertThresholds": {
      "critical": {
        "responseTime": 10000,
        "errorRate": 15,
        "memoryUsage": 80
      }
    }
  }
}
```

### Alert Thresholds

Configure alert thresholds to match your system requirements:

- **Critical Thresholds**: Response time >10s, error rate >15%, memory >80%
- **Warning Thresholds**: Response time >5s, error rate >5%, memory >60%
- **Recovery Confirmation**: 2 minutes of stability, >90% success rate

### Notification Channels

Supported notification channels:
- **Slack**: Webhook integration with customizable messages
- **Email**: SMTP integration with escalation rules
- **Microsoft Teams**: Webhook integration
- **Custom Webhooks**: Generic HTTP POST notifications

## API Endpoints

### REST API

- `GET /health` - Dashboard health check
- `GET /api/status` - System status summary
- `GET /api/agents` - All agent health data
- `GET /api/agents/:id` - Specific agent details
- `GET /api/alerts` - Alert management
- `POST /api/alerts/:id/resolve` - Resolve alert
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/metrics` - Dashboard metrics
- `GET /api/timeline` - Incident timeline
- `GET /api/resources` - Resource usage data

### WebSocket Events

Real-time events streamed to connected clients:

```typescript
interface HealthStreamEvents {
  'agent-status-change': AgentHealthStatus;
  'alert-triggered': RealTimeAlert;
  'alert-resolved': RealTimeAlert;
  'system-health-update': SystemHealthSummary;
  'resource-threshold-breach': ThresholdBreach;
  'recovery-started': RecoveryAttempt;
  'dashboard-metrics': DashboardMetrics;
}
```

## Integration Points

### With Existing Health System (AGENT-026)

The dashboard integrates seamlessly with the existing health check infrastructure:

- **HealthCheckManager**: Provides system and agent health data
- **Health Endpoints**: Reuses existing health check logic
- **Thresholds Configuration**: Extends existing threshold definitions
- **Event System**: Subscribes to health status changes

### With Notification System (AGENT-028)

Alert notifications integrate with the existing notification infrastructure:

- **NotificationManager**: Routes alerts to configured channels
- **Escalation Rules**: Configurable alert escalation workflows
- **Channel Management**: Slack, Teams, email integrations
- **Retry Logic**: Robust notification delivery with fallbacks

## Component Details

### HealthGrid Component

Visual grid displaying all agents with real-time status updates:

- **View Modes**: Grid, list, and compact views
- **Status Indicators**: Traffic light style status visualization  
- **Sorting**: By name, status, health score, or activity
- **Filtering**: By agent status (running, idle, failed, etc.)
- **Real-time Updates**: WebSocket-driven status changes

### AlertPanel Component

Comprehensive alert management interface:

- **Real-time Alerts**: Live alert notifications with sound/browser notifications
- **Alert Actions**: Acknowledge and resolve alerts
- **Filtering**: By severity, type, and resolution status
- **Timeline**: Incident timeline with audit trail
- **Escalation**: Visual escalation level indicators

### StatusIndicator Component

Reusable status visualization components:

- **Traffic Light**: Traditional red/yellow/green indicators
- **Health Score**: Progress bar with percentage display
- **Agent Status**: Specific indicators for agent states
- **Animated**: Pulse, bounce, and ping animations for attention

## Deployment

### Docker Deployment

Both backend and frontend can be containerized:

```bash
# Build backend
cd dashboard/backend
docker build -t health-dashboard-backend .

# Build frontend  
cd dashboard/frontend
docker build -t health-dashboard-frontend .

# Run with docker-compose
docker-compose up -d
```

### Production Considerations

- **Reverse Proxy**: Use nginx or similar for SSL termination
- **Load Balancing**: Scale backend instances behind load balancer
- **Database**: Use Redis cluster for high availability
- **Monitoring**: Monitor the monitoring system itself
- **Backup**: Regular backup of alert history and configuration

## Performance

### Optimization Features

- **WebSocket Connection Pooling**: Efficient client management
- **Data Caching**: Redis caching for frequently accessed data
- **Compression**: WebSocket and HTTP response compression
- **Rate Limiting**: Protect against excessive requests
- **Lazy Loading**: Frontend components load on demand

### Scalability

The system is designed to handle:
- **100+ concurrent WebSocket connections**
- **1000+ agents** with 5-second update intervals
- **10,000+ alerts** with retention and cleanup
- **Sub-100ms** real-time update latency

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Check CORS configuration
   - Verify port accessibility
   - Review proxy/firewall settings

2. **Missing Agent Data**
   - Confirm HealthCheckManager integration
   - Check agent metrics collection
   - Verify health endpoint responses

3. **Alert Notifications Not Sent**
   - Validate notification channel configuration
   - Check external service credentials
   - Review escalation rule settings

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=health-dashboard:* npm start

# Frontend  
REACT_APP_DEBUG=true npm start
```

### Health Checks

The dashboard includes comprehensive health checks:
- **Backend Health**: `/health` endpoint
- **WebSocket Health**: Connection count and responsiveness
- **Integration Health**: External service connectivity
- **Data Freshness**: Last update timestamps

## Contributing

When contributing to the dashboard:

1. **Follow TypeScript best practices**
2. **Add comprehensive error handling**
3. **Include unit tests for new features**
4. **Update documentation**
5. **Test real-time functionality thoroughly**

## License

This project is part of the Dev-Agency system and follows the same license terms.

---

**Built with ❤️ for enterprise-grade health monitoring**