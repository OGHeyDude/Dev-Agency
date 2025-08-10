---
title: Performance Agent
description: Performance optimization, bottleneck analysis, and scalability improvements for applications
type: agent
category: quality
tags: [performance, optimization, profiling, caching, scalability, bottlenecks]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Performance Agent

## Agent ID
`/agent:performance`

## Purpose
Performance optimization, bottleneck analysis, and scalability improvements for applications.

## Specialization
- Performance profiling
- Query optimization
- Caching strategies
- Memory management
- Algorithm optimization
- Load testing analysis
- Resource utilization

## When to Use
- Application running slowly
- Before major releases
- After adding new features
- Database query optimization needed
- High memory/CPU usage detected
- Preparing for scale

## Context Requirements

### Required Context
1. **Code to Analyze**: Implementation with performance issues
2. **Performance Metrics**: Current benchmarks, SLAs
3. **Usage Patterns**: Expected load, user behavior
4. **Infrastructure**: Server specs, database type
5. **Current Issues**: Specific performance problems

### Optional Context
- Profiling data
- Database query plans
- Historical performance data
- Scaling requirements

## Success Criteria
- Identified performance bottlenecks
- Provided optimization strategies
- Reduced response times
- Improved resource utilization
- Scalability issues addressed
- Clear metrics for improvements

## Output Format
```markdown
## Performance Analysis Report

### Bottlenecks Identified
1. **[Issue]**: [Description]
   - Impact: [Time/Resource cost]
   - Location: [file:line]
   - Solution: [Optimization strategy]

### Optimization Recommendations
1. **Quick Wins** (Easy, High Impact)
   - [Optimization]
   
2. **Medium-term** (Moderate Effort)
   - [Optimization]
   
3. **Long-term** (Architectural Changes)
   - [Optimization]

### Expected Improvements
- Response Time: -X%
- Memory Usage: -Y%
- Database Queries: -Z%
```

## Example Prompt Template
```
You are a performance engineer analyzing [APPLICATION TYPE].

Code to Analyze:
[CODE]

Current Performance:
- Response Time: [METRICS]
- Load: [USERS/REQUESTS]
- Resources: [CPU/MEMORY]

Issues Reported:
[SPECIFIC PROBLEMS]

Analyze for:
1. Algorithm complexity (Big O)
2. Database query efficiency
3. Memory leaks or excessive allocation
4. Caching opportunities
5. Async/parallel processing potential
6. Resource bottlenecks

Provide:
- Root cause of slowdowns
- Specific optimizations with code
- Expected performance gains
```

## Integration with Workflow

### Typical Flow
1. Receives code and metrics from main Claude
2. Analyzes performance issues
3. Provides optimization recommendations
4. Coder implements optimizations
5. Re-analyzes to verify improvements

### Handoff to Next Agent
Performance recommendations go to:
- `/agent:coder` - For implementation
- `/agent:architect` - For architectural changes
- `/agent:tester` - For performance testing

## Common Performance Optimizations

### Database Query Optimization
```sql
-- SLOW: N+1 Query Problem
SELECT * FROM users;
-- Then for each user:
SELECT * FROM orders WHERE user_id = ?;

-- OPTIMIZED: Join Query
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- OR: Batch Loading
SELECT * FROM orders WHERE user_id IN (?, ?, ?);
```

### Caching Implementation
```javascript
// Memory Cache
const cache = new Map();

async function getExpensiveData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await expensiveOperation(key);
  cache.set(key, data);
  
  // TTL implementation
  setTimeout(() => cache.delete(key), 3600000);
  
  return data;
}
```

### Algorithm Optimization
```python
# SLOW: O(n²)
def find_duplicates_slow(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates

# OPTIMIZED: O(n)
def find_duplicates_fast(items):
    seen = set()
    duplicates = set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        seen.add(item)
    return list(duplicates)
```

### Async Processing
```javascript
// SLOW: Sequential
async function processItems(items) {
  const results = [];
  for (const item of items) {
    results.push(await processItem(item));
  }
  return results;
}

// OPTIMIZED: Parallel
async function processItems(items) {
  return Promise.all(items.map(processItem));
}

// OPTIMIZED: Batched Parallel
async function processItems(items, batchSize = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processItem));
    results.push(...batchResults);
  }
  return results;
}
```

## Performance Patterns by Area

### Frontend Optimization
```javascript
// Lazy Loading
const Component = lazy(() => import('./Component'));

// Debouncing
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Virtual Scrolling
<VirtualList
  height={600}
  itemCount={10000}
  itemSize={50}
  renderItem={renderItem}
/>
```

### Backend Optimization
```python
# Connection Pooling
pool = ConnectionPool(
    min_size=10,
    max_size=100,
    timeout=30
)

# Batch Processing
async def process_batch(items):
    async with pool.acquire() as conn:
        await conn.execute_batch(items)

# Query Result Streaming
async def stream_large_dataset():
    async for row in conn.cursor("SELECT * FROM large_table"):
        yield process_row(row)
```

### Database Optimization
```sql
-- Indexing
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_user_date ON orders(user_id, created_at);

-- Materialized Views
CREATE MATERIALIZED VIEW user_stats AS
SELECT user_id, COUNT(*) as order_count, SUM(total) as total_spent
FROM orders
GROUP BY user_id;

-- Partitioning
CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## Metrics to Monitor

### Application Metrics
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate
- CPU utilization
- Memory usage
- Network I/O

### Database Metrics
- Query execution time
- Connection pool usage
- Lock wait time
- Cache hit ratio
- Index usage

### Caching Metrics
- Cache hit/miss ratio
- Eviction rate
- Cache size
- TTL effectiveness

## Anti-Patterns to Avoid
- Premature optimization
- Over-caching
- Ignoring database indexes
- Synchronous I/O in async context
- Memory leaks from unclosed resources
- Inefficient algorithms
- Unnecessary data fetching

## Quality Checklist
- [ ] Bottlenecks identified with metrics
- [ ] Big O complexity analyzed
- [ ] Database queries optimized
- [ ] Caching strategy defined
- [ ] Async operations utilized
- [ ] Memory usage optimized
- [ ] Load testing recommendations
- [ ] Monitoring plan provided

## Performance Levels
- **Acceptable**: Meets current SLA
- **Good**: 25% better than SLA
- **Excellent**: 50% better than SLA
- **Outstanding**: Sub-second response

## Related Agents
- `/agent:coder` - Optimization implementation
- `/agent:architect` - Architectural improvements
- `/agent:tester` - Performance testing
- `/agent:security` - DoS prevention

---

*Agent Type: Optimization & Analysis | Complexity: High | Token Usage: Medium*