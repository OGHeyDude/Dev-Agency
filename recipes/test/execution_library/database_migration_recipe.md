---
title: Database Migration Recipe
description: Strategic recipe for safe database schema changes and data migrations
type: recipe
category: infrastructure
tags: [database, migration, schema, data, rollback]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: test
---

# Database Migration Recipe

## Overview
Strategic recipe for executing database migrations safely. Focuses on zero-downtime deployments, data integrity, and rollback capabilities. Self-contained with comprehensive validation.

## Philosophy
"Migrate safely, validate thoroughly, rollback cleanly" - Database changes must be reversible, tested, and monitored.

---

## Phase 1: Migration Planning & Risk Assessment

**Goal:** Analyze migration requirements and assess risks

**Process:**
1. Review migration requirements from spec
2. Analyze current schema and data volume
3. Identify affected services and queries
4. Assess downtime requirements
5. Calculate rollback complexity

**Risk Factors:**
- Data volume and migration duration
- Service dependencies
- Index rebuilding time
- Foreign key constraints
- Trigger and stored procedure impacts

**Output:** Migration plan with risk assessment

---

## Phase 2: Migration Design

**Goal:** Design safe, reversible migration strategy

**Agent:** `/agent:architect`

**Context Package:**
- Current database schema
- Target schema requirements
- Data volume statistics
- Service dependency map
- Performance requirements from PROJECT_CONTEXT.md

**Design Considerations:**
- Zero-downtime strategy (if required)
- Backward compatibility approach
- Data transformation logic
- Rollback mechanism
- Performance optimization

**Migration Patterns:**
- Expand-Contract for schema changes
- Blue-Green for major changes
- Rolling migrations for large datasets
- Shadow writes for validation

**Output:** Detailed migration design with rollback plan

---

## Phase 3: Migration Script Development

**Goal:** Create migration and rollback scripts

**Agent:** `/agent:coder`

**Context Package:**
- Migration design from architect
- Database access patterns
- ORM/migration tool conventions
- Existing migration examples
- Performance constraints

**Script Components:**
1. **Pre-migration validation**
   - Schema state verification
   - Data integrity checks
   - Dependency validation

2. **Migration execution**
   - Schema changes (additive first)
   - Data transformation
   - Index creation
   - Constraint updates

3. **Rollback script**
   - Reverse operations
   - Data restoration
   - Original state recovery

**Output:** Migration and rollback scripts with validation

---

## Phase 4: Migration Testing

**Goal:** Thoroughly test migration in isolated environment

**Agent:** `/agent:tester`

**Testing Strategy:**
1. **Test Environment Setup**
   - Clone production schema
   - Load representative data
   - Configure monitoring

2. **Migration Tests**
   - Forward migration execution
   - Data integrity validation
   - Performance benchmarking
   - Application compatibility
   - Rollback execution
   - Post-rollback validation

3. **Edge Cases**
   - Concurrent operations
   - Large data volumes
   - Network interruptions
   - Partial failures

**Output:** Test report with timing and validation results

---

## Phase 5: Performance Impact Analysis

**Goal:** Assess and optimize migration performance

**Agent:** `/agent:performance`

**Analysis Areas:**
1. Migration execution time
2. Index rebuild duration
3. Query performance impact
4. Lock contention assessment
5. Resource utilization

**Optimization Strategies:**
- Batch processing for large datasets
- Parallel execution where safe
- Index optimization
- Query plan validation
- Connection pool tuning

**Output:** Performance analysis with optimization recommendations

---

## Phase 6: Deployment Planning

**Goal:** Create detailed deployment runbook

**Runbook Contents:**
1. **Pre-deployment checklist**
   - Backup verification
   - Service health checks
   - Team notifications

2. **Deployment steps**
   - Migration execution commands
   - Monitoring checkpoints
   - Validation queries
   - Service restart sequence

3. **Rollback triggers**
   - Error thresholds
   - Performance degradation limits
   - Data corruption indicators

4. **Post-deployment validation**
   - Data integrity checks
   - Application functionality
   - Performance baselines

**Output:** Complete deployment runbook

---

## Phase 7: Documentation & Tracking

**Goal:** Update documentation and project tracking

**Documentation Updates:**
1. **Database documentation**
   - Schema changes
   - New indexes/constraints
   - Data dictionary updates

2. **PROJECT_CONTEXT.md updates**
   - Database version
   - New capabilities
   - Performance characteristics

3. **Operations documentation**
   - Monitoring updates
   - Backup considerations
   - Recovery procedures

**Commit Message Format:**
```
feat(TICKET-ID): [Database migration description]

Migration: [Version number]
- Schema changes: [List changes]
- Data transformations: [If any]
- Performance impact: [Measured impact]
- Rollback tested: Yes

Deployment window: [Planned time]
```

**Output:** Complete documentation and tracking

---

## Quality Gates

- [ ] Migration scripts reviewed and tested
- [ ] Rollback scripts validated
- [ ] Performance impact acceptable
- [ ] Data integrity maintained
- [ ] Zero data loss confirmed
- [ ] Application compatibility verified
- [ ] Monitoring alerts configured
- [ ] Runbook peer-reviewed

---

## Migration Strategies

### Zero-Downtime Patterns
1. **Expand-Contract**
   - Add new schema elements
   - Dual-write period
   - Migrate existing data
   - Update application
   - Remove old schema

2. **Blue-Green Database**
   - Maintain two database versions
   - Sync data between versions
   - Switch traffic atomically
   - Keep old version for rollback

3. **Shadow Writes**
   - Write to both old and new schema
   - Validate data consistency
   - Switch reads gradually
   - Remove shadow writes

---

## Rollback Procedures

### Rollback Decision Matrix
| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Migration errors | >1% records | Immediate rollback |
| Performance degradation | >50% slower | Rollback after analysis |
| Application errors | Any critical | Immediate rollback |
| Data corruption | Any detected | Immediate rollback |

### Rollback Execution
1. Stop application traffic (if required)
2. Execute rollback script
3. Validate data restoration
4. Restart services
5. Verify application health
6. Document incident

---

## Notes
- Always test migrations on production-like data
- Plan for 2x expected migration time
- Have DBA or senior engineer review
- Consider maintenance window vs zero-downtime
- Monitor for 24 hours post-migration