---
title: Debugging and Monitoring Guide
description: Comprehensive guide for debugging agents and monitoring system health in Dev-Agency
type: guide
category: development
tags: [debugging, monitoring, troubleshooting, performance, health-checks]
created: 2025-08-10
updated: 2025-08-10
---

# Debugging and Monitoring Guide

## Table of Contents
- [Overview](#overview)
- [Debug Visualization System](#debug-visualization-system)
- [Real-Time Health Monitoring](#real-time-health-monitoring)
- [Production Health Checks](#production-health-checks)
- [Debugging Tools](#debugging-tools)
- [Monitoring Dashboards](#monitoring-dashboards)
- [Common Debugging Scenarios](#common-debugging-scenarios)
- [Performance Analysis](#performance-analysis)
- [Alert Management](#alert-management)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Best Practices](#best-practices)

## Overview

The Dev-Agency debugging and monitoring system provides comprehensive tools for:
- **Debug Visualization**: Visual execution flow diagrams and breakpoint debugging
- **Health Monitoring**: Real-time system health and performance metrics
- **Production Monitoring**: Automated health checks and alert management
- **Performance Analysis**: Token usage visualization and bottleneck detection

## Debug Visualization System

### Visual Execution Flow Diagrams

The debug visualization system creates real-time flow diagrams showing:

#### Agent Execution Flow
```
Project Start
    │
    ├─ Research Phase
    │   ├─ Agent: Architect (SUCCESS)
    │   └─ Context Analysis (2.3s, 1,250 tokens)
    │
    ├─ Planning Phase
    │   ├─ Agent: Coder (IN PROGRESS)
    │   └─ Technical Spec Generation
    │
    └─ Build Phase (PENDING)
```

#### Activation Commands
```bash
# Enable debug visualization
/debug-viz on

# View current execution flow
/debug-flow

# Export flow diagram
/debug-export svg ./debug-flow.svg
```

### Breakpoint Debugging

Set breakpoints at critical execution points:

```bash
# Set breakpoint before agent execution
/debug-break before-agent architect

# Set breakpoint on error conditions
/debug-break on-error timeout

# Set breakpoint on performance threshold
/debug-break on-performance >5000ms

# List active breakpoints
/debug-breaks

# Clear all breakpoints
/debug-clear-breaks
```

### Interactive Debug Console

When a breakpoint is hit:

```
🔍 BREAKPOINT HIT: before-agent architect
┌─────────────────────────────────────────────────┐
│ Context: Planning Phase - Ticket SPRINT-4-001  │
│ Agent: architect                                │
│ Input Tokens: 2,847                           │
│ Previous Duration: 3.2s                       │
├─────────────────────────────────────────────────┤
│ Debug Commands:                                │
│ > inspect-context    # View full context      │
│ > inspect-history    # View execution history │
│ > step              # Execute next step       │
│ > continue          # Resume execution        │
│ > abort             # Stop execution          │
└─────────────────────────────────────────────────┘
```

## Real-Time Health Monitoring

### System Health Dashboard

Monitor key system metrics in real-time:

#### Health Metrics Display
```
┌─ Dev-Agency System Health ─────────────────────────────┐
│ Status: 🟢 HEALTHY                    Uptime: 4h 23m   │
├────────────────────────────────────────────────────────┤
│ Agent Executions:     47 (success: 45, failed: 2)     │
│ Average Response:     2.3s (target: <3s)              │
│ Token Usage:          124,567 / 500,000 (24.9%)       │
│ Memory Usage:         1.2GB / 4GB (30%)               │
│ Active Sessions:      3                                │
├────────────────────────────────────────────────────────┤
│ Recent Activity:                                       │
│ 14:32:15  Agent:Coder     SUCCESS  2.1s  1,234 tokens │
│ 14:31:45  Agent:Tester    SUCCESS  1.8s    876 tokens │
│ 14:30:22  Agent:Architect FAILED   5.2s  2,145 tokens │
└────────────────────────────────────────────────────────┘
```

#### Activation Commands
```bash
# Start real-time monitoring
/monitor start

# View health dashboard
/health-dashboard

# Monitor specific agent
/monitor agent architect

# Set monitoring alerts
/monitor alert token-limit 90%
/monitor alert response-time 5s
```

### Performance Metrics

#### Token Usage Visualization
```
Token Usage Trends (Last 24h)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Input Tokens    ████████████░░░░  65%  (avg: 1,247/call)
Output Tokens   ██████████░░░░░░  52%  (avg: 892/call)
Total Usage     ███████████░░░░░  58%  (124k/500k daily)
Peak Hour       ████████████████  16:00-17:00 (23k tokens)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Response Time Analysis
```
Response Time Distribution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<1s     ████████████████████████  47 calls (24%)
1-2s    ████████████████████████████████████  71 calls (36%)
2-3s    ████████████████████████████  54 calls (28%)
3-5s    ████████████  23 calls (12%)
>5s     ██  3 calls (<1%)

Average: 2.3s | P95: 4.1s | P99: 6.2s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Production Health Checks

### Automated Health Monitoring

Production health checks run automatically every 30 seconds:

#### Health Check Components
```yaml
health_checks:
  - name: "Agent Availability"
    endpoint: "/health/agents"
    timeout: 5s
    critical: true
    
  - name: "Token Pool Status"
    check: token_usage_percentage < 80%
    warning: 70%
    critical: 90%
    
  - name: "Response Time"
    metric: avg_response_time_5m
    warning: 3s
    critical: 5s
    
  - name: "Error Rate"
    metric: error_rate_5m
    warning: 5%
    critical: 10%
```

#### Health Status API
```bash
# Check overall system health
curl http://localhost:8080/health

# Get detailed health report
curl http://localhost:8080/health/detailed

# Check specific component
curl http://localhost:8080/health/agents/architect
```

### Health Check Results
```json
{
  "status": "healthy",
  "timestamp": "2025-08-10T14:32:15Z",
  "checks": {
    "agents": {
      "status": "healthy",
      "available": 8,
      "total": 8,
      "response_time_avg": "2.3s"
    },
    "tokens": {
      "status": "warning",
      "usage_percentage": 74.2,
      "remaining": 128734,
      "reset_in": "6h 23m"
    },
    "performance": {
      "status": "healthy",
      "avg_response_time": "2.1s",
      "error_rate": "1.2%"
    }
  }
}
```

## Debugging Tools

### Agent Execution Tracer

Track detailed agent execution:

```bash
# Start tracing all agents
/trace start

# Trace specific agent
/trace agent architect

# View trace log
/trace log

# Export trace data
/trace export json ./execution-trace.json
```

#### Trace Output Example
```
🔍 EXECUTION TRACE: Agent Architect
┌─────────────────────────────────────────────────┐
│ Start Time: 2025-08-10T14:30:15.234Z           │
│ Context Size: 2,847 tokens                     │
│ Temperature: 0.1                               │
├─────────────────────────────────────────────────┤
│ 14:30:15.234  CONTEXT_PREPARED                 │
│ 14:30:15.267  API_REQUEST_SENT                 │
│ 14:30:17.123  FIRST_TOKEN_RECEIVED             │
│ 14:30:18.456  RESPONSE_COMPLETE                │
│ 14:30:18.478  OUTPUT_PROCESSED                 │
├─────────────────────────────────────────────────┤
│ Duration: 3.244s                               │
│ Tokens: 2,847 → 1,234 (ratio: 0.43)           │
│ Status: SUCCESS                                │
└─────────────────────────────────────────────────┘
```

### Context Inspector

Examine agent context and inputs:

```bash
# Inspect current context
/inspect-context

# View context for specific agent
/inspect-context architect

# Export context to file
/inspect-context export ./context-dump.json
```

#### Context Inspection Output
```yaml
Agent Context: architect
────────────────────────────
Input Context Size: 2,847 tokens
Max Context Limit: 32,000 tokens
Context Usage: 8.9%

Context Composition:
- System Prompt: 1,234 tokens (43.3%)
- Standards Guide: 856 tokens (30.1%) 
- Code Examples: 634 tokens (22.3%)
- User Request: 123 tokens (4.3%)

Recent Context History:
1. Previous successful execution (architect): 2,456 tokens
2. Code changes detected: +234 tokens
3. New requirements added: +157 tokens
```

### Performance Profiler

Identify performance bottlenecks:

```bash
# Start performance profiling
/profile start

# Profile specific operation
/profile operation plan-ticket

# View performance report
/profile report

# Export performance data
/profile export csv ./performance-data.csv
```

#### Performance Profile Example
```
🚀 PERFORMANCE PROFILE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Operation: plan-ticket (SPRINT-4-023)
Total Duration: 8.7s

Breakdown:
Context Preparation:  1.2s (13.8%) ████
Agent Execution:      6.1s (70.1%) ██████████████████
Response Processing:  0.8s (9.2%)  ███
File Operations:      0.4s (4.6%)  ██
Validation:          0.2s (2.3%)  █

Bottleneck Identified: Agent Execution
Recommendation: Consider context optimization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Monitoring Dashboards

### Executive Dashboard

High-level system overview:

```
┌─ Dev-Agency Executive Dashboard ───────────────────────┐
│ Today: 2025-08-10                    Status: 🟢 HEALTHY │
├────────────────────────────────────────────────────────┤
│ Key Metrics (24h):                                    │
│ • Tickets Completed: 12                               │
│ • Success Rate: 94.2%                                 │
│ • Avg Completion Time: 2.3h                           │
│ • Developer Satisfaction: 4.7/5                       │
├────────────────────────────────────────────────────────┤
│ Agent Performance:                                     │
│ • Most Used: Coder (47 calls)                         │
│ • Best Performance: Tester (1.2s avg)                 │
│ • Needs Attention: Architect (3 failures)             │
├────────────────────────────────────────────────────────┤
│ Resource Utilization:                                 │
│ • Token Pool: 76% remaining                           │
│ • Compute: 34% average load                           │
│ • Storage: 12% used                                   │
└────────────────────────────────────────────────────────┘
```

### Technical Dashboard

Detailed technical metrics:

```bash
# Launch technical dashboard
/dashboard tech

# View real-time metrics
/dashboard live

# Export dashboard data
/dashboard export pdf ./tech-dashboard.pdf
```

### Agent Performance Dashboard

```
┌─ Agent Performance Dashboard ──────────────────────────┐
│ Period: Last 7 days                                   │
├────────────────────────────────────────────────────────┤
│ Agent: architect                                       │
│ ├─ Executions: 23 (success: 20, failed: 3)            │
│ ├─ Avg Response: 4.1s (target: <3s) ⚠️               │
│ ├─ Token Usage: 1,856 avg (efficient: <2000) ✅       │
│ └─ Success Rate: 87% (target: >95%) ⚠️                │
├────────────────────────────────────────────────────────┤
│ Agent: coder                                           │
│ ├─ Executions: 47 (success: 45, failed: 2)            │
│ ├─ Avg Response: 2.1s (target: <3s) ✅               │
│ ├─ Token Usage: 1,234 avg (efficient: <2000) ✅       │
│ └─ Success Rate: 96% (target: >95%) ✅                │
├────────────────────────────────────────────────────────┤
│ Top Issues:                                           │
│ 1. Architect timeout issues (3 occurrences)          │
│ 2. Context size optimization needed                   │
│ 3. Token usage trending upward                        │
└────────────────────────────────────────────────────────┘
```

## Common Debugging Scenarios

### Scenario 1: Agent Execution Failure

**Problem**: Agent fails to execute or returns error

**Debug Steps**:
```bash
# 1. Check agent status
/health-check agent architect

# 2. Inspect recent execution
/trace log agent architect --last

# 3. Examine context size
/inspect-context architect

# 4. Review error logs
/logs error --agent architect --last 24h
```

**Common Causes**:
- Context size exceeding limits
- Invalid input format
- Network connectivity issues
- Token rate limits exceeded

### Scenario 2: Performance Degradation

**Problem**: Response times significantly increased

**Debug Steps**:
```bash
# 1. Start performance profiling
/profile start

# 2. Execute problematic operation
/build

# 3. Analyze performance report
/profile report --detailed

# 4. Check resource usage
/monitor resources
```

**Performance Analysis**:
```
🔍 PERFORMANCE DEGRADATION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Baseline Performance (7 days ago): 2.1s avg
Current Performance: 4.7s avg
Degradation: 123% slower

Root Cause Analysis:
1. Context size increased 45% (code base growth)
2. Token usage per call up 32%
3. Agent model switching overhead detected

Recommendations:
- Implement context compression
- Optimize prompt templates
- Consider agent specialization
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Scenario 3: Token Limit Issues

**Problem**: Approaching or exceeding token limits

**Debug Steps**:
```bash
# 1. Check token usage
/monitor tokens

# 2. Analyze token consumption patterns
/analyze tokens --period 24h

# 3. Identify high-usage agents
/tokens by-agent --sort desc

# 4. Optimize context
/optimize-context --agent architect
```

**Token Analysis Output**:
```
📊 TOKEN USAGE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Usage: 387,234 / 500,000 tokens (77.4%)
Rate: 23,456 tokens/hour
Estimated Time to Limit: 4.8 hours

High Usage Agents:
1. architect: 156,789 tokens (40.5%)
2. coder: 134,567 tokens (34.8%)
3. tester: 67,234 tokens (17.4%)

Optimization Opportunities:
- Context compression: -15% tokens
- Prompt optimization: -8% tokens  
- Selective agent usage: -12% tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Scenario 4: Context Overflow

**Problem**: Agent context exceeding size limits

**Debug Steps**:
```bash
# 1. Inspect context composition
/inspect-context --breakdown

# 2. Identify largest components
/context-analysis --sort-size

# 3. Test context compression
/context-compress --dry-run

# 4. Apply optimization
/context-optimize --agent architect
```

## Performance Analysis

### Response Time Analysis

Track and analyze agent response times:

```bash
# View response time trends
/analyze response-times --period 7d

# Compare agent performance
/compare-agents --metric response-time

# Identify slow executions
/analyze slow-calls --threshold 5s
```

### Token Efficiency Analysis

Monitor token usage efficiency:

```bash
# Analyze token efficiency
/analyze token-efficiency

# Compare input/output ratios
/analyze token-ratios --by-agent

# Identify optimization opportunities
/optimize-suggestions tokens
```

### Success Rate Analysis

Track agent execution success rates:

```bash
# View success rate trends
/analyze success-rates --period 30d

# Identify failure patterns
/analyze failures --group-by error-type

# Generate reliability report
/report reliability --format pdf
```

## Alert Management

### Alert Configuration

Set up monitoring alerts:

```yaml
alerts:
  - name: "High Token Usage"
    condition: token_usage > 80%
    severity: warning
    notification: slack
    
  - name: "Agent Failure Rate"
    condition: failure_rate > 10%
    severity: critical
    notification: [email, slack]
    
  - name: "Response Time Degradation"
    condition: avg_response_time > 5s
    severity: warning
    notification: slack
```

### Alert Commands

```bash
# List active alerts
/alerts list

# Configure new alert
/alerts create --name "Memory Usage" --condition "memory > 90%" --severity critical

# Disable alert
/alerts disable "High Token Usage"

# View alert history
/alerts history --period 7d
```

### Alert Notifications

Example alert notification:

```
🚨 ALERT: High Token Usage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Severity: WARNING
Time: 2025-08-10T14:32:15Z

Condition: token_usage > 80%
Current Value: 87.3% (436,234 / 500,000 tokens)
Trend: ↗ Increasing (5.2% in last hour)

Recommended Actions:
1. Review high-usage agents
2. Implement context optimization
3. Consider token pool expansion

View Details: /dashboard tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting Guide

### Quick Diagnosis Commands

```bash
# System health check
/diagnosis quick

# Comprehensive system analysis
/diagnosis full

# Network connectivity test
/diagnosis network

# Agent availability check
/diagnosis agents
```

### Common Issues and Solutions

#### Issue: Agent Timeouts
```
Symptoms: Agents failing with timeout errors
Diagnosis: /diagnosis agent-timeouts
Solutions:
1. Increase timeout limits: /config timeout 30s
2. Optimize context size: /optimize-context
3. Check network connectivity: /diagnosis network
```

#### Issue: Context Size Limits
```
Symptoms: "Context too large" errors
Diagnosis: /inspect-context --size-breakdown
Solutions:
1. Enable context compression: /config context-compression on
2. Reduce code examples: /optimize-context --reduce-examples
3. Use context windowing: /config context-window 16000
```

#### Issue: High Token Consumption
```
Symptoms: Rapidly approaching token limits
Diagnosis: /analyze tokens --high-usage
Solutions:
1. Implement selective agent usage
2. Optimize prompt templates
3. Use context caching
4. Schedule usage during off-peak hours
```

### Log Analysis

Analyze system logs for issues:

```bash
# View error logs
/logs error --last 24h

# Search logs for patterns
/logs search "timeout" --last 1h

# Export logs for analysis
/logs export --level error --format json ./error-logs.json
```

### Health Recovery Procedures

Automated recovery procedures:

```bash
# Restart failed agents
/recovery restart-agents

# Clear token usage cache
/recovery clear-token-cache

# Reset performance counters
/recovery reset-metrics

# Full system recovery
/recovery full-reset --confirm
```

## Best Practices

### Monitoring Best Practices

1. **Proactive Monitoring**
   - Set up alerts before issues occur
   - Monitor trends, not just current values
   - Regularly review and adjust thresholds

2. **Performance Baselines**
   - Establish performance baselines
   - Track degradation over time
   - Document normal operating ranges

3. **Alert Fatigue Prevention**
   - Use appropriate severity levels
   - Group related alerts
   - Implement alert suppression rules

### Debugging Best Practices

1. **Systematic Approach**
   - Start with high-level health checks
   - Narrow down to specific components
   - Document findings and solutions

2. **Context Preservation**
   - Capture system state during issues
   - Export diagnostic data
   - Maintain debugging logs

3. **Performance Optimization**
   - Regular performance reviews
   - Proactive optimization
   - Monitor optimization impact

### Production Monitoring

1. **Automated Health Checks**
   - Comprehensive health endpoints
   - Regular automated testing
   - Integration with external monitoring

2. **Capacity Planning**
   - Monitor resource trends
   - Plan for growth
   - Set up capacity alerts

3. **Incident Response**
   - Clear escalation procedures
   - Automated recovery when possible
   - Post-incident analysis and improvement

## Conclusion

The Dev-Agency debugging and monitoring system provides comprehensive tools for maintaining system health and diagnosing issues. Regular use of these tools will help ensure optimal performance and reliability of your agentic development environment.

For additional support, refer to the [Troubleshooting Reference](../reference/troubleshooting.md) or the [Performance Optimization Guide](../development/patterns/performance-patterns.md).

---

*Last updated: 2025-08-10*
*Version: 1.0*
*Next review: 2025-09-10*