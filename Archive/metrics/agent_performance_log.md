# Agent Performance Log

## Purpose
Track individual agent invocations to measure performance, identify patterns, and guide improvements.

## Log Format

### Entry Template
```markdown
## [Date] - [Task ID] - [Agent]

**Context:**
- Task: [Brief description]
- Input Tokens: [Count]
- Output Tokens: [Count]
- Duration: [Time in seconds]

**Invocation Details:**
- Agent: `/agent:[name]`
- Purpose: [What was requested]
- Context Size: [Lines/Characters provided]

**Results:**
- Success: [Yes/No/Partial]
- Quality Score: [1-5]
- Met Requirements: [Yes/No/Partial]

**Issues/Observations:**
- [Any problems encountered]
- [Missing context noted]
- [Improvements needed]

**Follow-up Actions:**
- [Any corrections needed]
- [Additional agents invoked]

---
```

## Performance Entries

### 08-09-2025 - SETUP-001 - Documentation Creation

**Context:**
- Task: Create agent system documentation
- Input Tokens: ~2000 (estimated)
- Output Tokens: ~15000 (estimated)
- Duration: Completed in single session

**Invocation Details:**
- Agent: Main Claude (no sub-agents used)
- Purpose: Create comprehensive documentation
- Context Size: Full conversation history

**Results:**
- Success: Yes
- Quality Score: 5
- Met Requirements: Yes

**Issues/Observations:**
- No sub-agents needed for documentation task
- Comprehensive output with good structure

**Follow-up Actions:**
- None required

---

## Metrics Summary

### Overall Statistics (as of 08-09-2025)

| Metric | Value |
|--------|-------|
| Total Invocations | 0 (agents not yet used) |
| Success Rate | N/A |
| Average Quality Score | N/A |
| Average Input Tokens | N/A |
| Average Output Tokens | N/A |
| Most Used Agent | N/A |
| Least Used Agent | N/A |

### By Agent Type

| Agent | Invocations | Success Rate | Avg Quality | Avg Tokens |
|-------|-------------|--------------|-------------|------------|
| `/agent:architect` | 0 | - | - | - |
| `/agent:coder` | 0 | - | - | - |
| `/agent:tester` | 0 | - | - | - |
| `/agent:security` | 0 | - | - | - |
| `/agent:performance` | 0 | - | - | - |
| `/agent:documenter` | 0 | - | - | - |
| `/agent:mcp-dev` | 0 | - | - | - |
| `/agent:integration` | 0 | - | - | - |
| `/agent:hooks` | 0 | - | - | - |

## Improvement Tracking

### Context Optimization Discoveries
- [Date]: [What was learned about context preparation]

### Prompt Refinements
- [Date]: [What prompt changes improved results]

### Common Failure Patterns
- [Pattern]: [Description and solution]

---

*Log started: 08-09-2025*