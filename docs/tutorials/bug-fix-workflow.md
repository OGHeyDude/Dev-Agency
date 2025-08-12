---
title: Bug Fix Workflow with Dev-Agency Agents
description: Step-by-step tutorial for efficiently fixing bugs using Dev-Agency's agent system
type: tutorial
category: development
tags: [bug-fix, agents, workflow, testing, debugging]
created: 2025-08-10
updated: 2025-08-10
---

# Bug Fix Workflow with Dev-Agency Agents

This tutorial demonstrates how to efficiently fix bugs using the Dev-Agency agent system, from initial bug report to production deployment.

## Overview

The Dev-Agency bug fix workflow leverages specialized agents to systematically identify, analyze, fix, and validate bug fixes. This approach ensures thorough debugging and prevents regression issues.

## Workflow Summary

```
Bug Report → Reproduce → Analyze → Fix → Test → Document → Deploy
     ↓          ↓        ↓      ↓     ↓       ↓        ↓
  /research  /agent:   /agent: /agent: /agent: /agent:  /done
             tester    tester  coder   tester  documenter
```

---

## Scenario: API Performance Bug

**Bug Report**: Users reporting slow response times from the `/api/users/search` endpoint. Response times have increased from ~200ms to ~5000ms over the past week.

**Symptoms**:
- Slow API response times
- Database query timeout errors
- Increased server CPU usage
- Customer complaints about search functionality

---

## Step 1: Initial Bug Investigation

### Command: `/research`

Start by gathering information about the bug and affected systems.

```bash
# Search for the affected endpoint
Grep "users/search" --type js
Grep "search" --glob "*.sql" 
Grep "timeout" --glob "*.log"
```

**Expected Research Findings**:
- Location of search endpoint code
- Recent changes to search functionality
- Database query patterns
- Error logs and performance metrics

---

## Step 2: Bug Reproduction and Analysis

### Command: `/agent:tester`

Use the tester agent to reproduce the bug and gather detailed diagnostic information.

**Agent Prompt Context**:
```
You are debugging a performance issue with the /api/users/search endpoint.

CURRENT SYMPTOMS:
- Response times: 200ms → 5000ms (25x slower)
- Database timeout errors
- High CPU usage

RECENT CHANGES:
- New search filters added 3 days ago
- Database index changes last week
- User table grew to 2M+ records

TASK: Create reproduction steps and diagnostic tests.
```

**Expected Agent Output**:
```markdown
## Bug Reproduction Steps

1. **Setup Test Environment**
   ```bash
   curl -X POST http://localhost:3000/api/users/search \
     -H "Content-Type: application/json" \
     -d '{"query": "john", "filters": {"department": "engineering"}}'
   ```

2. **Performance Baseline**
   - Current response: ~5000ms
   - Expected response: <500ms
   - Memory usage: 85% (abnormal)

3. **Root Cause Hypothesis**
   - Missing database index on new filter columns
   - N+1 query problem in user relations
   - Inefficient search algorithm

## Diagnostic Tests Created

### Database Query Analysis
```sql
EXPLAIN ANALYZE SELECT u.* FROM users u 
  WHERE u.name ILIKE '%john%' 
  AND u.department_id IN (SELECT id FROM departments WHERE name = 'engineering');
```

### Load Test Script
```bash
# test/load-test-search.js
for i in {1..10}; do
  time curl -s "http://localhost:3000/api/users/search?q=test" > /dev/null
done
```

## Priority: HIGH (Performance regression affecting production)
```

---

## Step 3: Root Cause Analysis

### Command: `/agent:tester` (Follow-up Analysis)

Run the diagnostic tests and analyze results.

**Follow-up Agent Context**:
```
DIAGNOSTIC RESULTS:
- Database EXPLAIN shows table scan (no index used)
- Query execution time: 4.8s for 2M records
- Missing composite index on (name, department_id)
- Application fetches ALL user relations (N+1 problem)

TASK: Confirm root cause and create fix recommendations.
```

**Expected Agent Analysis**:
```markdown
## Root Cause Confirmed

### Primary Issue: Missing Database Index
```sql
-- Current query (slow):
EXPLAIN ANALYZE SELECT * FROM users 
WHERE name ILIKE '%john%' AND department_id = 5;

-- Result: Seq Scan on users (cost=0.00..45000.00 rows=1000)
-- Execution time: 4847.234 ms
```

### Secondary Issue: N+1 Query Problem
```javascript
// Current code (inefficient):
users.forEach(async (user) => {
  user.profile = await Profile.findById(user.profile_id); // N+1!
  user.permissions = await getUserPermissions(user.id);  // N+1!
});
```

## Fix Recommendations

1. **Create composite database index**
2. **Implement eager loading for relations** 
3. **Add query result caching**
4. **Optimize search algorithm**

## Impact Assessment
- **Severity**: HIGH (25x performance degradation)
- **Users Affected**: All search functionality users (~80% of active users)
- **Fix Complexity**: MEDIUM (database + code changes)
- **Estimated Fix Time**: 2-4 hours
```

---

## Step 4: Create Bug Report

### Command: `/bug-report`

Document the bug formally using the standard template.

**Expected Bug Report** (`/Project_Management/Bug_Reports/BUG-2025-001_api_search_performance.md`):
```markdown
---
title: API Search Performance Regression
bug_id: BUG-2025-001
severity: HIGH
priority: HIGH
status: IN_PROGRESS
created: 2025-08-10
updated: 2025-08-10
---

# Bug Report: API Search Performance Regression

## Summary
The `/api/users/search` endpoint has experienced a 25x performance degradation over the past week.

## Environment
- **Component**: User Search API
- **Version**: v2.3.1
- **Environment**: Production + Staging

## Symptoms
- Response time: 200ms → 5000ms
- Database timeout errors
- High server CPU usage (85%+)
- Customer complaints increasing

## Root Cause
1. Missing composite database index on `users(name, department_id)`
2. N+1 query problem in user relation loading
3. No query result caching

## Impact
- **Users Affected**: ~80% of active users
- **Business Impact**: Search functionality unusable
- **Revenue Impact**: Potential customer churn

## Fix Plan
1. Create database index
2. Implement eager loading
3. Add query caching
4. Performance testing

## Testing Strategy
- Load testing with 1000+ concurrent users
- Database query performance validation
- Memory usage monitoring
```

---

## Step 5: Implement the Fix

### Command: `/agent:coder`

Use the coder agent to implement the bug fix based on the analysis.

**Agent Context**:
```
You are fixing a performance bug in the user search API.

ROOT CAUSE ANALYSIS:
1. Missing database index on users(name, department_id)
2. N+1 query problem in relation loading
3. No caching for search results

FILES TO MODIFY:
- src/api/users/search.js
- migrations/add_user_search_index.sql
- src/models/User.js

PERFORMANCE TARGET:
- Response time: <500ms (down from 5000ms)
- Support 1000+ concurrent users
- Memory usage: <60%

TASK: Implement comprehensive performance fix.
```

**Expected Agent Implementation**:

```javascript
// src/api/users/search.js (Fixed version)
const searchUsers = async (req, res) => {
  const { query, filters = {} } = req.body;
  const cacheKey = `user_search:${JSON.stringify({query, filters})}`;
  
  try {
    // 1. Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // 2. Optimized database query with eager loading
    const users = await User.findAll({
      where: {
        name: { [Op.iLike]: `%${query}%` },
        ...(filters.department && { 
          department_id: filters.department 
        })
      },
      include: [
        { model: Profile, as: 'profile' },        // Eager load
        { model: Permission, as: 'permissions' }   // Eager load
      ],
      limit: 50,
      order: [['name', 'ASC']]
    });
    
    // 3. Cache results for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(users));
    
    res.json(users);
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};
```

```sql
-- migrations/20250810_add_user_search_index.sql
CREATE INDEX CONCURRENTLY idx_users_search 
ON users(name text_pattern_ops, department_id);

-- Additional index for common search patterns
CREATE INDEX CONCURRENTLY idx_users_department_name 
ON users(department_id, name);

-- Analyze table to update query planner statistics
ANALYZE users;
```

```javascript
// src/models/User.js (Updated associations)
User.associate = (models) => {
  User.belongsTo(models.Profile, {
    foreignKey: 'profile_id',
    as: 'profile'
  });
  
  User.belongsToMany(models.Permission, {
    through: 'user_permissions',
    as: 'permissions'
  });
};
```

**Performance Improvements**:
- Database index reduces query time from 4847ms to ~15ms
- Eager loading eliminates N+1 queries
- Caching reduces database load by 70%
- Query result limiting prevents memory issues

---

## Step 6: Test the Fix

### Command: `/agent:tester`

Validate that the fix resolves the performance issue and doesn't introduce regressions.

**Testing Agent Context**:
```
PERFORMANCE FIX IMPLEMENTED:
1. ✅ Composite database index created
2. ✅ N+1 queries eliminated with eager loading  
3. ✅ Redis caching implemented
4. ✅ Query result limiting added

VALIDATION REQUIRED:
- Response time: Target <500ms (was 5000ms)
- Load test: 1000 concurrent users
- Memory usage: Target <60% (was 85%+)
- Regression testing: Ensure no new bugs

TASK: Create comprehensive test suite and performance validation.
```

**Expected Testing Output**:

```markdown
## Performance Test Results

### Response Time Testing
```bash
# Before fix: ~5000ms
# After fix: ~180ms ✅ (96% improvement)

for i in {1..100}; do
  time curl -s "http://localhost:3000/api/users/search" \
    -d '{"query":"john","filters":{"department":"engineering"}}' \
    -H "Content-Type: application/json"
done

# Results:
# Average: 182ms
# 95th percentile: 245ms  
# 99th percentile: 320ms
# All under 500ms target ✅
```

### Load Testing Results
```bash
# Artillery load test - 1000 concurrent users
artillery run test/search-load-test.yml

# Results:
# Scenarios launched: 1000
# Scenarios completed: 1000
# Request rate: 50/sec
# Response time (median): 185ms ✅
# Response time (95th percentile): 290ms ✅
# Response time (99th percentile): 415ms ✅
# Errors: 0 ✅
```

### Memory Usage Monitoring
```bash
# Server memory usage during load test
# Before: 85%+ (RED)
# After: 45% (GREEN) ✅

# Database connection pool
# Before: 95/100 connections (overload)
# After: 12/100 connections (optimal) ✅
```

### Regression Testing
```bash
# Full API test suite
npm run test:integration

# Results:
# Tests: 245 passed, 0 failed ✅
# Coverage: 94% ✅
# No regressions detected ✅
```

## Database Index Verification
```sql
-- Confirm index is being used
EXPLAIN ANALYZE SELECT u.*, p.*, perm.* 
FROM users u 
JOIN profiles p ON u.profile_id = p.id
JOIN user_permissions up ON u.id = up.user_id
JOIN permissions perm ON up.permission_id = perm.id
WHERE u.name ILIKE '%john%' AND u.department_id = 5;

-- Result: Index Scan using idx_users_search ✅
-- Execution time: 15.234 ms ✅ (was 4847ms)
```

## Fix Validation: ✅ PASSED
- ✅ Performance target met (<500ms)
- ✅ Load testing successful (1000 users)
- ✅ Memory usage optimized (<60%)
- ✅ No regressions introduced
- ✅ Database indexes working properly
```

---

## Step 7: Update Documentation

### Command: `/agent:documenter`

Update relevant documentation to reflect the changes and prevent similar issues.

**Documentation Agent Context**:
```
PERFORMANCE BUG FIX COMPLETED:
- Search API optimized (5000ms → 180ms)
- Database indexes added
- Caching layer implemented
- Load testing validated

DOCUMENTATION UPDATES NEEDED:
1. API documentation - performance characteristics
2. Database schema - new indexes
3. Deployment guide - cache configuration
4. Performance monitoring - new metrics

TASK: Update documentation comprehensively.
```

**Expected Documentation Updates**:

```markdown
## API Documentation Update
### /api/users/search (Updated)

**Performance Characteristics**:
- Response Time: ~180ms (typical)
- Rate Limit: 1000 requests/minute per user
- Cache Duration: 5 minutes
- Max Results: 50 per query

**Recent Optimizations** (2025-08-10):
- Added composite database index
- Implemented Redis caching
- Eliminated N+1 query problems
- Added query result limits

## Database Schema Update
### New Indexes (Added 2025-08-10)
```sql
-- User search optimization
CREATE INDEX idx_users_search ON users(name text_pattern_ops, department_id);
CREATE INDEX idx_users_department_name ON users(department_id, name);
```

## Deployment Guide Update
### Redis Cache Configuration
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  environment:
    - REDIS_MAXMEMORY=256mb
    - REDIS_MAXMEMORY_POLICY=allkeys-lru
```

## Performance Monitoring
### New Metrics to Track
- Search API response time (target: <500ms)
- Cache hit rate (target: >70%)
- Database connection pool usage (target: <50%)
- Memory usage during peak load (target: <60%)
```

---

## Step 8: Complete Bug Fix

### Command: `/done`

Finalize the bug fix process with proper documentation and closure.

```bash
# Update ticket status in PROJECT_PLAN.md
# Add release notes
# Commit changes
# Deploy to production
```

**Bug Fix Completion Checklist**:
- ✅ Root cause identified and confirmed
- ✅ Performance fix implemented and tested
- ✅ Load testing passed (1000 concurrent users)
- ✅ Regression testing completed
- ✅ Documentation updated
- ✅ Monitoring alerts configured
- ✅ Bug report updated with resolution
- ✅ Code changes reviewed and approved
- ✅ Production deployment completed
- ✅ Performance improvement verified in production

---

## Common Bug Patterns and Agent Strategies

### 1. Performance Issues
**Agents**: `/agent:tester` → `/agent:coder` → `/agent:performance`
- Root cause analysis with profiling
- Database query optimization
- Caching strategy implementation
- Load testing validation

### 2. Logic Bugs
**Agents**: `/agent:tester` → `/agent:coder`
- Reproduce with minimal test case
- Add comprehensive unit tests
- Fix with TDD approach
- Regression testing

### 3. Security Vulnerabilities
**Agents**: `/agent:security` → `/agent:coder` → `/agent:tester`
- Security assessment and impact analysis
- Secure fix implementation
- Penetration testing validation
- Security documentation updates

### 4. Integration Issues
**Agents**: `/agent:integration` → `/agent:tester` → `/agent:coder`
- API contract validation
- Service communication analysis
- Mock-based testing
- End-to-end validation

---

## Emergency Bug Fix Procedure

For critical production bugs requiring immediate hotfixes:

### 1. Immediate Response (0-15 minutes)
```bash
# Quick investigation
/research --priority critical
/agent:tester --mode emergency
```

### 2. Hotfix Development (15-60 minutes)
```bash
# Fast implementation
/agent:coder --mode hotfix --review-level minimal
/agent:tester --tests critical-only
```

### 3. Emergency Deployment (60-90 minutes)
```bash
# Direct to production
/deploy --environment production --type hotfix
/monitor --alerts critical --duration 2h
```

### 4. Post-Emergency Follow-up (Next day)
```bash
# Complete proper fix
/agent:architect --review hotfix
/agent:coder --refactor hotfix
/agent:tester --full-test-suite
/agent:documenter --post-mortem
```

---

## Performance Metrics

Track these metrics for continuous improvement:

### Bug Fix Efficiency
- **Time to Resolution**: Target <4 hours for HIGH severity
- **First-Time Fix Rate**: Target >85% (no rework needed)
- **Agent Utilization**: Optimal agent selection rate
- **Test Coverage**: >90% for bug-affected code

### Quality Metrics
- **Regression Rate**: <5% of fixes introduce new bugs  
- **Customer Satisfaction**: >95% satisfied with fix quality
- **Production Stability**: <2 incidents per 1000 deployments
- **Performance Impact**: <10ms average response time increase

---

## Conclusion

The Dev-Agency bug fix workflow provides a systematic, agent-enhanced approach to resolving bugs efficiently. By leveraging specialized agents at each stage, teams can:

1. **Reproduce bugs reliably** with `/agent:tester`
2. **Analyze root causes thoroughly** with diagnostic agents
3. **Implement robust fixes** with `/agent:coder` and specialists
4. **Validate comprehensively** with multiple testing approaches
5. **Document properly** for future prevention

This workflow ensures high-quality bug fixes while minimizing time to resolution and preventing regressions.

**Next Steps**: Practice this workflow with your team's actual bugs and customize the agent prompts based on your technology stack and requirements.