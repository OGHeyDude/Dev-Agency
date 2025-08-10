# Dev-Agency Notification System

Real-time Slack/Teams integration for agent operations, build notifications, and team collaboration.

## Features

- **🚀 Real-time Notifications** - Agent start, completion, error, and system health alerts
- **💬 Slack Integration** - Webhook and bot API support with rich message formatting
- **📱 Teams Integration** - Webhook notifications with adaptive cards
- **⚡ Slash Commands** - `/agent-status`, `/agent-health`, `/agent-invoke` commands
- **🔧 Agent Integration** - Seamless hooks into existing agent execution pipeline
- **📊 Status Dashboard** - Real-time agent status via slash commands
- **⚙️ Configurable** - Per-project/channel routing with regex patterns
- **🛡️ Production Ready** - Rate limiting, error handling, retry logic

## Quick Start

### 1. Environment Setup

Copy the example environment file:
```bash
cp src/notifications/config/example.env .env
```

Update `.env` with your webhook URLs:
```bash
# Slack
SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-bot-token-here

# Teams  
TEAMS_ENABLED=true
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
```

### 2. Basic Usage

```typescript
import { setupNotificationSystem } from './notifications';

// Quick setup with auto-configuration
const system = await setupNotificationSystem({
  serverPort: 3002,
  enableSlack: true,
  enableTeams: true,
  autoStart: true
});

// Test connections
const results = await system.testConnections();
console.log('Connections:', results);
```

### 3. Agent Integration

```typescript
import { withNotifications, AgentExecutionContext } from './notifications';

const context: AgentExecutionContext = {
  agentName: 'architect',
  task: 'Design system architecture',
  ticketId: 'ARCH-001',
  projectName: 'my-project',
  startTime: new Date()
};

// Wrap any agent execution
const result = await withNotifications(context, async () => {
  // Your agent execution code here
  return await myAgent.execute();
});
```

## API Endpoints

### Health & Status
- `GET /health` - Service health check
- `GET /api/notifications/status` - Notification service status
- `POST /api/notifications/test` - Test platform connections

### Notifications
- `POST /api/notifications/send` - Send manual notification
- `POST /api/agents/status` - Update agent status
- `GET /api/agents/status` - Get all agent statuses

### Webhooks
- `POST /webhooks/slack/command` - Slack slash command endpoint
- `POST /webhooks/teams/events` - Teams webhook endpoint

### Documentation
- `GET /api/docs` - API documentation
- `GET /` - Service info

## Slash Commands

### Slack Commands

Configure these URLs in your Slack app:

**`/agent-status [agentName]`**
- **URL:** `https://your-domain.com/webhooks/slack/command`
- **Description:** Get agent status (specific agent or all)
- **Usage:** 
  - `/agent-status` - Show all agent statuses
  - `/agent-status architect` - Show specific agent status

**`/agent-health`**
- **URL:** `https://your-domain.com/webhooks/slack/command`  
- **Description:** Get system health status
- **Usage:** `/agent-health`

**`/agent-invoke <command> [args]`**
- **URL:** `https://your-domain.com/webhooks/slack/command`
- **Description:** Invoke simple agent commands
- **Usage:** 
  - `/agent-invoke status` - System status
  - `/agent-invoke health-check` - Run health check
  - `/agent-invoke list-agents` - List available agents

## Configuration

### Channel Routing

Configure automatic channel routing based on patterns:

```typescript
import { NotificationConfigManager, createDefaultChannelMappings } from './notifications';

const config = new NotificationConfigManager({
  slack: {
    enabled: true,
    webhookUrl: 'https://hooks.slack.com/services/...',
    channels: [
      {
        projectPattern: 'critical-.*',
        channel: '#critical-alerts',
        events: ['agent_error', 'system_health']
      },
      {
        agentPattern: 'security|audit',
        channel: '#security',
        events: ['agent_complete', 'agent_error']
      },
      {
        projectPattern: '.*',
        channel: '#dev-general',
        events: ['agent_start', 'agent_complete']
      }
    ]
  }
});
```

### Environment Variables

```bash
# Slack Configuration
SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_DEFAULT_CHANNEL=#dev-agency
SLACK_RATE_LIMIT_RPM=50

# Teams Configuration  
TEAMS_ENABLED=true
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/your-webhook-url
TEAMS_RATE_LIMIT_RPM=50

# Global Settings
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_TIMEOUT_MS=10000
NOTIFICATION_SERVER_PORT=3002

# Channel Mappings (JSON)
NOTIFICATION_CHANNELS_CONFIG={"slack":[...],"teams":[...]}
```

## Message Formats

### Slack Messages

Rich formatted messages with:
- **Blocks** - Structured layout with sections and fields
- **Attachments** - Color-coded based on priority
- **Context** - Agent name, ticket ID, project, timestamps
- **Metrics** - Duration, token count, success status
- **Errors** - Type, message, and stack trace (in development)

### Teams Messages

Adaptive cards with:
- **MessageCard** format for webhook compatibility
- **Sections** with facts and metrics
- **Color themes** based on notification priority
- **Emojis** for visual event identification

## Agent Integration Hooks

### Manual Integration

```typescript
import { getAgentNotificationIntegration } from './notifications';

const integration = getAgentNotificationIntegration();

// Agent start
await integration.onAgentStart({
  agentName: 'coder',
  task: 'Implement feature',
  ticketId: 'DEV-123',
  startTime: new Date()
});

// Agent completion
await integration.onAgentComplete(context, {
  success: true,
  duration: 5000,
  tokenCount: 2500
});

// Agent error
await integration.onAgentError(context, new Error('Something failed'));
```

### Wrapper Integration

```typescript
import { withNotifications } from './notifications';

// Automatically handles start/complete/error notifications
const result = await withNotifications(context, async () => {
  return await yourAgentFunction();
});
```

## Development

### Run Examples

```bash
# Install dependencies
npm install

# Run basic usage examples
npm run dev -- src/notifications/examples/basic-usage.ts

# Or run specific examples
node -r ts-node/register src/notifications/examples/basic-usage.ts
```

### Test Connections

```bash
# Test Slack connection
curl -X POST http://localhost:3002/api/notifications/test

# Send test notification
curl -X POST http://localhost:3002/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"event":"agent_complete","message":"Test notification","agentName":"test"}'
```

### Slash Command Testing

```bash
# Test agent status command
curl -X POST http://localhost:3002/webhooks/slack/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "/agent-status",
    "channel_id": "C1234567890",
    "user_id": "U1234567890", 
    "user_name": "developer",
    "text": ""
  }'
```

## Production Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .
RUN npm run build

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3002/health || exit 1

EXPOSE 3002
CMD ["npm", "start"]
```

### Environment Variables

Ensure these are set in production:
- `SLACK_WEBHOOK_URL` or `SLACK_BOT_TOKEN`
- `TEAMS_WEBHOOK_URL` 
- `NOTIFICATION_SERVER_PORT`
- `NODE_ENV=production`

### Nginx Reverse Proxy

```nginx
location /notifications/ {
    proxy_pass http://localhost:3002/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Monitoring

### Health Checks

```bash
# Service health
curl http://localhost:3002/health

# Connection tests  
curl -X POST http://localhost:3002/api/notifications/test

# Agent statuses
curl http://localhost:3002/api/agents/status
```

### Logs

Enable debug logging:
```bash
DEBUG=notification-system:* npm start
```

### Metrics

Access Prometheus-style metrics:
```bash
curl http://localhost:3002/metrics
```

## Troubleshooting

### Common Issues

**1. Webhooks not working**
- Verify webhook URLs are correct and accessible
- Check firewall/network connectivity
- Test with `POST /api/notifications/test`

**2. Slash commands not responding**
- Verify Slack app configuration
- Check request validation in logs
- Test endpoint directly with curl

**3. Rate limiting errors**
- Adjust `SLACK_RATE_LIMIT_RPM`/`TEAMS_RATE_LIMIT_RPM`
- Implement exponential backoff
- Consider using multiple webhooks

**4. Missing notifications**
- Check event is in `enabledEvents` configuration
- Verify channel routing patterns
- Check notification retry logic

### Debug Commands

```bash
# Check service status
curl http://localhost:3002/api/notifications/status

# Get API documentation
curl http://localhost:3002/api/docs

# Test manual notification
curl -X POST http://localhost:3002/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{"event":"agent_start","message":"Debug test","agentName":"debug"}'
```

## License

MIT License - see LICENSE file for details.

---

**Built for enterprise-grade team collaboration and development workflow automation.**