---
title: Integration Agent
description: System integration planning, API coordination, service orchestration, and third-party integration implementation
type: agent
category: development
tags: [integration, apis, microservices, orchestration, webhooks, messaging]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Integration Agent

## Agent ID
`/agent:integration`

## Purpose
System integration planning, API coordination, service orchestration, and third-party integration implementation.

## Specialization
- API integration design
- Service orchestration
- Message queue implementation
- Webhook handling
- Data synchronization
- Protocol translation
- Third-party service integration

## When to Use
- Connecting multiple services
- Implementing third-party APIs
- Designing microservice communication
- Setting up event-driven architecture
- Data pipeline creation
- Service mesh configuration

## Context Requirements

### Required Context
1. **Systems to Integrate**: Services, APIs, databases
2. **Data Flow Requirements**: What data moves where
3. **Integration Patterns**: Sync/async, push/pull
4. **Authentication Methods**: API keys, OAuth, etc.
5. **Error Handling Needs**: Retry logic, fallbacks

### Optional Context
- SLA requirements
- Rate limits
- Data transformation needs
- Existing integration patterns

## Success Criteria
- Services communicate reliably
- Error handling implemented
- Data consistency maintained
- Performance requirements met
- Security preserved
- Monitoring enabled

## Output Format
```markdown
## Integration Design

### Systems Overview
- System A: [Description, API type]
- System B: [Description, API type]

### Integration Pattern
[Synchronous/Asynchronous, Push/Pull, etc.]

### Data Flow
System A → [Transformation] → System B

### Implementation
\```language
// Integration code with:
// - Connection setup
// - Data transformation
// - Error handling
// - Retry logic
\```

### Error Handling Strategy
- Retry policy: [Details]
- Fallback: [Strategy]
- Monitoring: [Approach]
```

## Example Prompt Template
```
You are an integration specialist connecting [SYSTEM A] with [SYSTEM B].

System A Details:
- Type: [REST API/GraphQL/Database/etc.]
- Authentication: [Method]
- Data Format: [JSON/XML/etc.]

System B Details:
- Type: [Details]
- Authentication: [Method]
- Data Format: [Format]

Requirements:
- Data flow: [Direction and frequency]
- Transformation: [Needed changes]
- Error handling: [Requirements]
- Performance: [SLA/throughput]

Design and implement:
1. Connection strategy
2. Data transformation
3. Error handling
4. Retry mechanism
5. Monitoring approach
```

## Integration with Workflow

### Typical Flow
1. Architect defines integration needs
2. Integration agent designs solution
3. Implements connectors and transformations
4. Tester validates data flow
5. Performance agent optimizes

### Handoff to Next Agent
Integration designs go to:
- `/agent:coder` - Implementation details
- `/agent:tester` - Integration testing
- `/agent:performance` - Optimization
- `/agent:security` - Security review

## Common Integration Patterns

### REST API Integration
```javascript
class APIIntegration {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.retryCount = config.retryCount || 3;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    for (let i = 0; i <= this.retryCount; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        if (i === this.retryCount) throw error;
        await this.delay(Math.pow(2, i) * 1000);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Message Queue Integration
```python
import asyncio
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer

class MessageQueueIntegration:
    def __init__(self, bootstrap_servers):
        self.servers = bootstrap_servers
        self.producer = None
        self.consumer = None

    async def start(self):
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.servers,
            value_serializer=lambda v: json.dumps(v).encode()
        )
        await self.producer.start()

    async def publish(self, topic, message):
        try:
            await self.producer.send_and_wait(topic, message)
        except Exception as e:
            # Dead letter queue
            await self.producer.send_and_wait(f"{topic}.dlq", {
                'original_message': message,
                'error': str(e)
            })

    async def consume(self, topic, handler):
        self.consumer = AIOKafkaConsumer(
            topic,
            bootstrap_servers=self.servers,
            value_deserializer=lambda v: json.loads(v.decode())
        )
        await self.consumer.start()
        
        async for message in self.consumer:
            try:
                await handler(message.value)
                await self.consumer.commit()
            except Exception as e:
                # Error handling
                await self.handle_error(message, e)
```

### Webhook Handler
```typescript
interface WebhookConfig {
  secret: string;
  endpoint: string;
  retryPolicy: RetryPolicy;
}

class WebhookIntegration {
  constructor(private config: WebhookConfig) {}

  async handleWebhook(req: Request): Promise<void> {
    // Verify signature
    if (!this.verifySignature(req)) {
      throw new Error('Invalid signature');
    }

    // Process with idempotency
    const eventId = req.headers['x-event-id'];
    if (await this.isProcessed(eventId)) {
      return; // Already processed
    }

    try {
      await this.processEvent(req.body);
      await this.markProcessed(eventId);
    } catch (error) {
      await this.scheduleRetry(req.body, error);
    }
  }

  private verifySignature(req: Request): boolean {
    const signature = req.headers['x-signature'];
    const computed = crypto
      .createHmac('sha256', this.config.secret)
      .update(JSON.stringify(req.body))
      .digest('hex');
    return signature === computed;
  }
}
```

### Data Synchronization
```python
class DataSync:
    def __init__(self, source, target):
        self.source = source
        self.target = target
        self.batch_size = 1000

    async def sync(self, since=None):
        """Incremental sync with change detection"""
        cursor = None
        
        while True:
            # Fetch batch from source
            batch = await self.source.fetch_changes(
                since=since,
                cursor=cursor,
                limit=self.batch_size
            )
            
            if not batch.records:
                break
            
            # Transform data
            transformed = [
                self.transform(record) 
                for record in batch.records
            ]
            
            # Bulk upsert to target
            await self.target.bulk_upsert(transformed)
            
            # Update cursor
            cursor = batch.next_cursor
            since = batch.last_modified
            
            # Store checkpoint
            await self.save_checkpoint(since, cursor)
```

## Integration Strategies

### Circuit Breaker Pattern
```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failures = 0;
    this.nextAttempt = Date.now();
    this.state = 'CLOSED';
  }

  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

### Rate Limiting
```typescript
class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens <= 0) {
      const waitTime = (1 / this.refillRate) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }
    
    this.tokens--;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }
}
```

## Anti-Patterns to Avoid
- Tight coupling between services
- Missing error handling
- No retry logic
- Ignoring rate limits
- Synchronous when async would work
- No monitoring/alerting
- Missing idempotency

## Quality Checklist
- [ ] Services loosely coupled
- [ ] Error handling comprehensive
- [ ] Retry logic implemented
- [ ] Circuit breaker in place
- [ ] Rate limiting respected
- [ ] Monitoring enabled
- [ ] Data consistency maintained
- [ ] Security preserved
- [ ] Documentation complete

## Integration Types
- **Synchronous**: Request/Response
- **Asynchronous**: Fire-and-forget
- **Batch**: Scheduled bulk transfers
- **Stream**: Real-time data flow
- **Event-driven**: Pub/sub patterns

## Related Agents
- `/agent:architect` - System design
- `/agent:coder` - Implementation
- `/agent:tester` - Integration testing
- `/agent:performance` - Optimization
- `/agent:security` - Security review

---

*Agent Type: Integration & Orchestration | Complexity: High | Token Usage: Medium-High*