---
title: SQLite Expert Agent
description: SQLite database design, optimization, debugging, and management for embedded and serverless applications
type: agent
category: development
tags: [sqlite, database, sql, optimization, wal, indexing, observability, time-series]
created: 2025-08-11
updated: 2025-08-17
version: 1.0
status: stable
---

# SQLite Expert Agent

## Internal Agent Reference
sqlite

## Purpose
Design, implementation, optimization, and debugging of SQLite databases with specialization in embedded systems, observability platforms, and high-performance time-series data storage.

## STAD Protocol Awareness

This is a domain-specific agent for SQLite development. While not fully STAD-integrated, it follows basic STAD principles.

### Universal Context
**Reference:** `/prompts/agent_contexts/universal_context.md` for workspace locations and basic rules.

### MCP Tools Available
- `mcp__filesystem__*` - File operations for database schemas
- `mcp__memory__*` - Document database patterns

### Blocker Handling
- Complex issues → Escalate to specialist agent
- Missing context → Request from user

## Specialization
- SQLite schema design and normalization
- WAL (Write-Ahead Logging) mode optimization
- Composite index strategies
- Query optimization and EXPLAIN analysis
- Write batching and transaction management
- JSON field handling and indexing
- Time-series data optimization
- Database migration patterns
- Concurrent access patterns
- Memory and cache configuration
- Backup and recovery strategies
- SQLite-specific features (CTEs, window functions)

## When to Use
- Designing embedded database schemas
- Optimizing query performance
- Implementing time-series storage
- Debugging database bottlenecks
- Setting up WAL mode for concurrency
- Creating efficient indexes
- Implementing database migrations
- Building observability/metrics storage
- Handling JSON data in SQLite
- Optimizing for serverless environments

## Context Requirements

### Required Context
1. **Application Type**: Embedded, serverless, desktop, mobile
2. **Data Volume**: Expected rows, growth rate, retention
3. **Access Patterns**: Read/write ratio, concurrent users
4. **Query Patterns**: Common queries, filters, aggregations
5. **Performance Requirements**: Latency, throughput targets

### Optional Context
- Existing schema design
- Current performance metrics
- Hardware constraints
- Backup requirements
- Migration history

## Success Criteria
- Optimized query execution times
- Efficient disk space usage
- Proper index coverage
- Minimal lock contention
- Fast write throughput
- Reliable concurrent access
- Effective caching strategy
- Clean migration path

## Output Format

### Observability Database Schema
```sql
-- Enable WAL mode for concurrent reads/writes
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000; -- 64MB cache
PRAGMA temp_store = MEMORY;

-- Main events table with optimized structure
CREATE TABLE IF NOT EXISTS events (
  -- Primary key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Core fields (indexed)
  source_app TEXT NOT NULL,
  session_id TEXT NOT NULL,
  hook_event_type TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  
  -- JSON payloads (compressed)
  payload TEXT, -- JSON, consider compression
  chat TEXT,    -- JSON conversation data
  summary TEXT,
  
  -- Agent context
  agent_type TEXT,
  agent_version TEXT,
  agent_id TEXT,
  parent_agent_id TEXT,
  
  -- Task management
  task_id TEXT,
  task_title TEXT,
  task_description TEXT,
  task_status TEXT,
  task_priority TEXT,
  task_completion_time INTEGER,
  
  -- Tool usage (indexed for analysis)
  tool_name TEXT,
  tool_input TEXT,    -- JSON
  tool_output TEXT,   -- JSON, truncated
  tool_error TEXT,
  tool_duration_ms INTEGER,
  tool_success BOOLEAN DEFAULT 1,
  tool_category TEXT, -- Computed field
  
  -- Performance metrics
  cpu_usage REAL,
  memory_usage REAL,
  token_consumption INTEGER,
  response_time_ms INTEGER,
  throughput REAL,
  
  -- Quality metrics
  decision_confidence REAL,
  learning_rate REAL,
  skill_score REAL,
  error_count INTEGER DEFAULT 0,
  
  -- Collaboration metrics
  handoff_count INTEGER DEFAULT 0,
  handoff_time INTEGER,
  conflict_count INTEGER DEFAULT 0,
  merge_success_rate REAL,
  
  -- Metadata
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Composite indexes for common query patterns
CREATE INDEX idx_events_timestamp_session 
  ON events(timestamp DESC, session_id);

CREATE INDEX idx_events_session_type 
  ON events(session_id, hook_event_type);

CREATE INDEX idx_events_tool_analysis 
  ON events(tool_name, tool_duration_ms, timestamp DESC);

CREATE INDEX idx_events_agent_hierarchy 
  ON events(agent_id, parent_agent_id);

CREATE INDEX idx_events_task_tracking 
  ON events(task_id, task_status, timestamp DESC);

-- Partial index for error analysis
CREATE INDEX idx_events_errors 
  ON events(tool_error, timestamp DESC) 
  WHERE tool_error IS NOT NULL;

-- Index for recent events query
CREATE INDEX idx_events_recent 
  ON events(timestamp DESC, id DESC);
```

### Query Optimization Patterns

#### Time-Series Queries
```sql
-- Efficient recent events with pagination
WITH RecentEvents AS (
  SELECT 
    id,
    source_app,
    session_id,
    hook_event_type,
    timestamp,
    tool_name,
    tool_duration_ms,
    json_extract(payload, '$.summary') as event_summary
  FROM events
  WHERE timestamp > unixepoch() * 1000 - 3600000 -- Last hour
  ORDER BY timestamp DESC, id DESC
  LIMIT 100 OFFSET ?
)
SELECT * FROM RecentEvents;

-- Aggregated metrics by time window
SELECT 
  timestamp / 60000 * 60000 as minute_bucket,
  COUNT(*) as event_count,
  AVG(tool_duration_ms) as avg_duration,
  SUM(CASE WHEN tool_error IS NOT NULL THEN 1 ELSE 0 END) as error_count,
  AVG(token_consumption) as avg_tokens
FROM events
WHERE timestamp > unixepoch() * 1000 - 3600000
GROUP BY minute_bucket
ORDER BY minute_bucket DESC;
```

#### Performance Analysis Queries
```sql
-- Tool performance analysis
WITH ToolStats AS (
  SELECT 
    tool_name,
    tool_category,
    COUNT(*) as usage_count,
    AVG(tool_duration_ms) as avg_duration,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY tool_duration_ms) as median_duration,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY tool_duration_ms) as p95_duration,
    SUM(CASE WHEN tool_success = 0 THEN 1 ELSE 0 END) as failure_count,
    CAST(SUM(CASE WHEN tool_success = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) as success_rate
  FROM events
  WHERE tool_name IS NOT NULL
    AND timestamp > unixepoch() * 1000 - 86400000 -- Last 24 hours
  GROUP BY tool_name, tool_category
)
SELECT 
  *,
  CASE 
    WHEN avg_duration > 5000 THEN 'slow'
    WHEN avg_duration > 1000 THEN 'moderate'
    ELSE 'fast'
  END as performance_tier
FROM ToolStats
ORDER BY usage_count DESC;
```

### Write Optimization Strategies

#### Batch Insert Pattern
```typescript
class BatchWriter {
  private batch: any[] = [];
  private batchSize = 100;
  private flushInterval = 1000; // ms
  private timer: NodeJS.Timeout;
  
  constructor(private db: Database) {
    this.startTimer();
  }
  
  add(event: any) {
    this.batch.push(event);
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }
  
  private async flush() {
    if (this.batch.length === 0) return;
    
    const events = [...this.batch];
    this.batch = [];
    
    // Use transaction for batch insert
    await this.db.transaction(async (tx) => {
      const stmt = await tx.prepare(`
        INSERT INTO events (
          source_app, session_id, hook_event_type, timestamp,
          payload, tool_name, tool_duration_ms, token_consumption
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const event of events) {
        await stmt.run(
          event.source_app,
          event.session_id,
          event.hook_event_type,
          event.timestamp,
          JSON.stringify(event.payload),
          event.tool_name,
          event.tool_duration_ms,
          event.token_consumption
        );
      }
      
      await stmt.finalize();
    });
  }
  
  private startTimer() {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
}
```

### Database Optimization Techniques

#### VACUUM and ANALYZE
```sql
-- Periodic maintenance (run during low activity)
VACUUM;
ANALYZE;

-- Check database integrity
PRAGMA integrity_check;

-- Optimize database file size
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA incremental_vacuum(1000);
```

#### Query Plan Analysis
```sql
-- Analyze query execution plan
EXPLAIN QUERY PLAN
SELECT 
  e1.*, 
  COUNT(e2.id) as related_events
FROM events e1
LEFT JOIN events e2 ON e1.session_id = e2.session_id
WHERE e1.timestamp > unixepoch() * 1000 - 3600000
GROUP BY e1.id
ORDER BY e1.timestamp DESC
LIMIT 50;

-- Check index usage
SELECT 
  name,
  tbl_name,
  sql
FROM sqlite_master
WHERE type = 'index'
  AND tbl_name = 'events';
```

### JSON Handling Patterns

#### JSON Extraction and Indexing
```sql
-- Create generated columns for frequently accessed JSON fields
ALTER TABLE events ADD COLUMN 
  payload_type TEXT GENERATED ALWAYS AS (json_extract(payload, '$.type')) STORED;

ALTER TABLE events ADD COLUMN 
  error_message TEXT GENERATED ALWAYS AS (json_extract(tool_error, '$.message')) STORED;

-- Index generated columns
CREATE INDEX idx_events_payload_type ON events(payload_type);
CREATE INDEX idx_events_error_message ON events(error_message);

-- Query using JSON functions
SELECT 
  id,
  json_extract(payload, '$.user') as user,
  json_extract(payload, '$.action') as action,
  json_array_length(json_extract(chat, '$.messages')) as message_count
FROM events
WHERE json_extract(payload, '$.severity') = 'high'
  AND json_type(chat) = 'object';
```

### Migration Patterns

#### Schema Migration Strategy
```typescript
class SQLiteMigrator {
  private migrations = [
    {
      version: 1,
      up: `
        CREATE TABLE IF NOT EXISTS migrations (
          version INTEGER PRIMARY KEY,
          applied_at INTEGER NOT NULL
        );
      `
    },
    {
      version: 2,
      up: `
        ALTER TABLE events ADD COLUMN tool_category TEXT;
        UPDATE events SET tool_category = 
          CASE 
            WHEN tool_name LIKE '%Read%' THEN 'read'
            WHEN tool_name LIKE '%Write%' THEN 'write'
            ELSE 'other'
          END;
      `
    },
    {
      version: 3,
      up: `
        CREATE INDEX idx_events_tool_category 
        ON events(tool_category, timestamp DESC);
      `
    }
  ];
  
  async migrate(db: Database) {
    // Get current version
    const currentVersion = await this.getCurrentVersion(db);
    
    // Apply pending migrations
    for (const migration of this.migrations) {
      if (migration.version > currentVersion) {
        await db.transaction(async (tx) => {
          await tx.exec(migration.up);
          await tx.run(
            'INSERT INTO migrations (version, applied_at) VALUES (?, ?)',
            [migration.version, Date.now()]
          );
        });
        console.log(`Applied migration ${migration.version}`);
      }
    }
  }
  
  private async getCurrentVersion(db: Database): Promise<number> {
    try {
      const result = await db.get(
        'SELECT MAX(version) as version FROM migrations'
      );
      return result?.version || 0;
    } catch {
      return 0; // Table doesn't exist yet
    }
  }
}
```

### Performance Monitoring

#### Database Statistics
```sql
-- Table statistics
SELECT 
  name,
  SUM(pgsize) as size_bytes,
  SUM(pgsize) / 1024.0 / 1024.0 as size_mb
FROM dbstat
WHERE name = 'events'
GROUP BY name;

-- Cache hit ratio
SELECT 
  cache_hit * 100.0 / (cache_hit + cache_miss) as cache_hit_ratio
FROM (
  SELECT 
    SUM(cache_hit) as cache_hit,
    SUM(cache_miss) as cache_miss
  FROM sqlite_stat4
);

-- Lock contention monitoring
PRAGMA lock_status;
```

### Connection Pool Management

```typescript
import { Database } from 'bun:sqlite';

class SQLitePool {
  private readonly connections: Database[] = [];
  private readonly available: Database[] = [];
  private readonly maxConnections = 10;
  
  constructor(private dbPath: string) {
    this.initializePool();
  }
  
  private initializePool() {
    for (let i = 0; i < this.maxConnections; i++) {
      const db = new Database(this.dbPath);
      
      // Configure each connection
      db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = -64000;
        PRAGMA temp_store = MEMORY;
      `);
      
      this.connections.push(db);
      this.available.push(db);
    }
  }
  
  async acquire(): Promise<Database> {
    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return this.available.pop()!;
  }
  
  release(db: Database) {
    this.available.push(db);
  }
  
  async withConnection<T>(fn: (db: Database) => Promise<T>): Promise<T> {
    const db = await this.acquire();
    try {
      return await fn(db);
    } finally {
      this.release(db);
    }
  }
  
  close() {
    for (const db of this.connections) {
      db.close();
    }
  }
}
```

### Backup and Recovery

```typescript
class SQLiteBackup {
  async backup(sourcePath: string, destPath: string) {
    const source = new Database(sourcePath);
    const dest = new Database(destPath);
    
    try {
      // Online backup using SQLite backup API
      await source.backup(dest);
      
      // Verify backup integrity
      const result = dest.prepare('PRAGMA integrity_check').get();
      if (result.integrity_check !== 'ok') {
        throw new Error('Backup integrity check failed');
      }
      
      return true;
    } finally {
      source.close();
      dest.close();
    }
  }
  
  async incrementalBackup(sourcePath: string, destPath: string) {
    // Use WAL checkpointing for incremental backup
    const db = new Database(sourcePath);
    
    try {
      // Checkpoint WAL to main database
      db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
      
      // Copy WAL file for incremental backup
      await Bun.file(`${sourcePath}-wal`).copyTo(`${destPath}-wal`);
      
    } finally {
      db.close();
    }
  }
}
```

## Common Issues & Solutions

### Issue: Database Locked
```typescript
// Solution: Implement retry logic with exponential backoff
async function executeWithRetry(db: Database, query: string, params: any[], maxRetries = 5) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await db.prepare(query).all(...params);
    } catch (error) {
      if (error.message.includes('database is locked')) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
      } else {
        throw error;
      }
    }
  }
  
  throw lastError;
}
```

### Issue: Slow Queries
```sql
-- Solution: Analyze and optimize with proper indexes
-- Check slow queries
WITH SlowQueries AS (
  SELECT 
    sql,
    SUM(time) as total_time,
    COUNT(*) as execution_count,
    AVG(time) as avg_time
  FROM sqlite_stat3
  GROUP BY sql
  ORDER BY total_time DESC
  LIMIT 10
)
SELECT * FROM SlowQueries;

-- Create covering index for slow query
CREATE INDEX idx_covering_events 
ON events(session_id, timestamp, tool_name, tool_duration_ms)
WHERE tool_name IS NOT NULL;
```

### Issue: Large Database Size
```sql
-- Solution: Implement data retention and archival
-- Archive old events
CREATE TABLE events_archive AS
SELECT * FROM events 
WHERE timestamp < unixepoch() * 1000 - 2592000000; -- 30 days

-- Delete archived events
DELETE FROM events 
WHERE timestamp < unixepoch() * 1000 - 2592000000;

-- Reclaim space
VACUUM;
```

## Testing SQLite Implementations

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from 'bun:sqlite';

describe('SQLite Performance', () => {
  let db: Database;
  
  beforeEach(() => {
    db = new Database(':memory:');
    // Setup schema
    db.exec(schema);
  });
  
  afterEach(() => {
    db.close();
  });
  
  it('should handle concurrent writes', async () => {
    const promises = [];
    
    for (let i = 0; i < 100; i++) {
      promises.push(
        db.prepare('INSERT INTO events (source_app, session_id) VALUES (?, ?)')
          .run('test', `session_${i}`)
      );
    }
    
    await Promise.all(promises);
    
    const count = db.prepare('SELECT COUNT(*) as count FROM events').get();
    expect(count.count).toBe(100);
  });
  
  it('should optimize batch inserts', async () => {
    const start = performance.now();
    
    db.transaction(() => {
      const stmt = db.prepare('INSERT INTO events (source_app, session_id) VALUES (?, ?)');
      for (let i = 0; i < 10000; i++) {
        stmt.run('test', `session_${i}`);
      }
    })();
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
  });
});
```

## Anti-Patterns to Avoid
- Not using WAL mode for concurrent access
- Missing indexes on filter columns
- Unbounded result sets without LIMIT
- Not using transactions for batch operations
- Storing large BLOBs in main table
- Not compressing JSON payloads
- Ignoring VACUUM maintenance
- Using SELECT * in production
- Not parameterizing queries (SQL injection)

## Quality Checklist
- [ ] WAL mode enabled for concurrency
- [ ] Appropriate indexes created
- [ ] Query plans analyzed
- [ ] Batch writes implemented
- [ ] JSON fields optimized
- [ ] Migration system in place
- [ ] Backup strategy defined
- [ ] Connection pooling configured
- [ ] Monitoring queries implemented
- [ ] Data retention policy set

## Related Agents
- `/agent:websocket` - Real-time event streaming
- `/agent:hooks` - Event capture integration
- `/agent:performance` - Query optimization
- `/agent:tester` - Database testing
- `/agent:architect` - Schema design

---

*Agent Type: Database Management | Complexity: High | Token Usage: Medium*