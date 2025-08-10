# Production Health System for Dev-Agency

Enterprise-grade production reliability system providing health monitoring, circuit breaker patterns, and graceful degradation for the Dev-Agency platform.

## Features

- **🔍 Health Monitoring** - Real-time system health checks and monitoring
- **⚡ Circuit Breakers** - Automatic failure detection and prevention
- **🛡️ Graceful Degradation** - Intelligent fallback strategies
- **📊 Monitoring Dashboard** - Web-based real-time monitoring interface
- **🔄 Auto Recovery** - Automated system recovery mechanisms
- **📈 Metrics Collection** - Comprehensive performance and reliability metrics

## Quick Start

### Installation

```bash
cd /home/hd/Desktop/LAB/Dev-Agency/src
npm install
npm run build
```

### Basic Usage

```typescript
import { ProductionHealthWrapper } from './integration/ProductionHealthWrapper';

// Wrap existing components with production health monitoring
const { agentManager, executionEngine, healthWrapper } = 
  await ProductionHealthWrapper.createIntegratedSystem(
    originalAgentManager,
    originalExecutionEngine
  );

// Use components normally - now with built-in reliability
const result = await executionEngine.executeSingle({
  agentName: 'architect',
  task: 'Design system architecture'
});

console.log('Dashboard available at:', healthWrapper.getDashboardUrl());
```

### Standalone Usage

```typescript
import { ProductionHealthSystem } from './index';

const healthSystem = new ProductionHealthSystem({
  healthChecks: { enabled: true, interval: 30000 },
  circuitBreakers: { defaultFailureThreshold: 5 },
  monitoring: { enabled: true, port: 3001 }
});

await healthSystem.start();

// Access components directly
const { healthCheckManager, circuitBreakerManager } = healthSystem.getComponents();
```

## System Architecture

```
┌─────────────────────────────────────┐
│        Health Check Layer           │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Health API  │ │ Metrics         ││
│  │ Endpoints   │ │ Collector       ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
           │ HTTP/WebSocket
           ▼
┌─────────────────────────────────────┐
│      Circuit Breaker Layer          │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Circuit     │ │ Failure         ││
│  │ Breakers    │ │ Detection       ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
           │ Agent Invocation
           ▼
┌─────────────────────────────────────┐
│     Graceful Degradation Layer      │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Fallback    │ │ Recovery        ││
│  │ Strategies  │ │ Manager         ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
           │ Enhanced Agent System
           ▼
┌─────────────────────────────────────┐
│       Existing Agent System         │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Agent       │ │ Performance     ││
│  │ Manager     │ │ Monitoring      ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
```

## Components

### Health Monitoring
- **SystemHealthEndpoint** - Overall system health checks
- **AgentHealthEndpoint** - Individual agent monitoring
- **ResourceHealthEndpoint** - System resource monitoring
- **DependencyHealthEndpoint** - External dependency checks

### Circuit Breakers
- **AgentCircuitBreaker** - Agent-specific failure protection
- **ResourceCircuitBreaker** - Resource-based protection
- **TimeoutCircuitBreaker** - Timeout-based failure detection
- **ErrorRateCircuitBreaker** - Error rate-based protection

### Graceful Degradation
- **CachedResponseStrategy** - Serve cached responses
- **SimplifiedResponseStrategy** - Reduced functionality responses
- **FallbackAgentStrategy** - Alternative agent selection
- **OfflineResponseStrategy** - Offline mode support

### Monitoring Dashboard
- **Real-time web interface** at http://localhost:3001/dashboard
- **RESTful API** for programmatic access
- **WebSocket support** for real-time updates
- **Metrics collection** and visualization

## API Endpoints

### Health Checks
- `GET /health` - Overall system health
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe
- `GET /health/agents` - Agent health status
- `GET /health/dependencies` - Dependency health status

### Monitoring API
- `GET /api/status` - Complete system status
- `GET /api/circuit-breakers` - Circuit breaker states
- `GET /api/degradation` - Degradation status
- `GET /api/events` - System events and alerts
- `GET /api/metrics` - Performance metrics
- `POST /api/force-recovery` - Force component recovery

### Dashboard
- `GET /dashboard` - Web monitoring interface
- WebSocket at `ws://localhost:3001` for real-time updates

## Configuration

### Environment Variables

```bash
# Health Monitoring
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000

# Circuit Breakers
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# Degradation
DEGRADATION_ENABLED=true
DEGRADATION_AUTO_RECOVERY=true

# Monitoring
MONITORING_ENABLED=true
MONITORING_PORT=3001
```

### Configuration Files

- `src/health/config/health-thresholds.json` - Health check thresholds
- `src/health/config/monitoring-config.json` - Monitoring configuration
- `src/reliability/config/circuit-breaker-rules.json` - Circuit breaker rules
- `src/degradation/config/degradation-rules.json` - Degradation strategies

## Examples

### Custom Health Check

```typescript
import { HealthCheckManager } from './health/HealthCheckManager';

const healthManager = new HealthCheckManager();

// Add custom database health check
healthManager.addCustomCheck({
  name: 'database',
  check: async () => {
    try {
      await database.ping();
      return { status: 'HEALTHY', message: 'Database connected' };
    } catch (error) {
      return { status: 'CRITICAL', message: `Database error: ${error.message}` };
    }
  },
  interval: 30000
});
```

### Custom Circuit Breaker

```typescript
import { CircuitBreakerManager } from './reliability/CircuitBreakerManager';

const cbManager = new CircuitBreakerManager();

// Get circuit breaker with custom config
const agentCB = cbManager.getAgentCircuitBreaker('my-agent', {
  failureThreshold: 3,
  timeout: 30000,
  halfOpenMaxCalls: 2
});

// Use with custom function
const result = await agentCB.execute(
  async (context) => {
    return await myCustomAgentExecution(context);
  },
  { agentName: 'my-agent', task: 'custom task' }
);
```

### Custom Degradation Strategy

```typescript
import { DegradationManager } from './degradation/DegradationManager';

class MyFallbackStrategy {
  name = 'my_fallback';
  priority = 2;

  canHandle(context) {
    return context.component === 'my-agent';
  }

  async execute(context, originalRequest) {
    return {
      success: true,
      output: 'Fallback response',
      fromFallback: true
    };
  }

  getDescription() {
    return 'My custom fallback strategy';
  }

  async isAvailable() {
    return true;
  }
}

const degradationManager = new DegradationManager();
degradationManager.registerStrategy(new MyFallbackStrategy());
```

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
npm run lint:fix
```

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001
CMD ["npm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dev-agency-health
spec:
  template:
    spec:
      containers:
      - name: health-system
        image: dev-agency-health:latest
        ports:
        - containerPort: 3001
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3001
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
```

## Monitoring and Alerting

### Prometheus Integration

The system automatically exports metrics in Prometheus format at `/metrics`:

```bash
curl http://localhost:3001/metrics
```

### Grafana Dashboard

Import the provided Grafana dashboard configuration from `monitoring/grafana-dashboard.json`.

### Alert Rules

Example Prometheus alert rules:

```yaml
groups:
- name: dev-agency-health
  rules:
  - alert: CircuitBreakerOpen
    expr: circuit_breaker_state == 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Circuit breaker open for {{ $labels.agent }}"
  
  - alert: SystemDegraded
    expr: system_health_status != 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "System health degraded"
```

## Troubleshooting

### Common Commands

```bash
# Check system health
curl http://localhost:3001/health

# View circuit breaker status
curl http://localhost:3001/api/circuit-breakers | jq

# Check degradation status
curl http://localhost:3001/api/degradation | jq

# View recent events
curl http://localhost:3001/api/events?limit=10 | jq
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=production-health:* npm start
```

### Force Recovery

```typescript
// Force close all circuit breakers
await healthSystem.forceRecovery();

// Force specific recovery
const components = healthSystem.getComponents();
await components.degradationManager.resolveDegradation('agent-name');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Documentation

- [Complete Documentation](../docs/production-reliability.md)
- [API Reference](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
- [Deployment Guide](./docs/deployment.md)

## Support

- GitHub Issues: [Issues](https://github.com/dev-agency/production-health/issues)
- Documentation: [Docs](../docs/production-reliability.md)
- Examples: [Examples](./examples/)

---

**Built for enterprise-grade reliability in production environments.**