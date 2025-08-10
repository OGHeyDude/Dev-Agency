---
title: Workflow Integration Guide
description: How the Agent System integrates with the 5-Step Development Process
type: guide
category: architecture
tags: [workflow, agents, integration, development-process, 5-step]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Workflow Integration Guide

## Overview

This guide details how the Agent System integrates with your existing 5-Step Development Process, showing when and how to invoke specialized agents within each step of your workflow.

## The 5-Step Development Process

### 🎯 REMEMBER OUR CORE VALUES
**"Quality, Efficiency, Security, and Documentation OVER Speed"**
**"The better you plan, the better the outcome"**

Every step should embody these principles. Take the time needed to do it RIGHT.

### Step 1: `/research` - Discovery and Analysis

**Main Claude's Role**: Primary investigator exploring the codebase and understanding requirements.

**Agent Usage**: Minimal - Main Claude handles most research directly.

```mermaid
Research Flow:
Main Claude → Search codebase → Analyze patterns → Document findings
```

**When to Use Agents**:
- Complex architecture questions → `/agent:architect` for system analysis
- Security audit requirements → `/agent:security` for vulnerability scanning

**Example Workflow**:
```
1. Main Claude uses Grep/Glob to find relevant code
2. Reads and analyzes existing implementations
3. If complex architecture decision needed:
   → Invoke /agent:architect with findings
4. Compile research into planning context
```

### Step 2: `/plan` - Technical Planning and Specification

**Main Claude's Role**: Orchestrator creating technical specifications and coordinating design.

**Agent Usage**: High - Architectural and design decisions.

```mermaid
Planning Flow:
Main Claude → /agent:architect → Technical Spec → Update PROJECT_PLAN
```

**Agent Invocation Pattern**:
```
Main Claude:
1. Reads research findings
2. Prepares context for architect
3. Invokes: /agent:architect with requirements + constraints
4. Processes architect's design
5. Creates/updates Spec document
6. Updates ticket status to TODO
```

**Example Context Passing**:
```javascript
// Main Claude prepares for architect
const architectContext = {
  requirements: researchFindings.requirements,
  existingArchitecture: researchFindings.patterns,
  constraints: projectConstraints,
  scale: expectedLoad
};

// Invoke architect agent
const design = await invokeAgent('architect', architectContext);

// Process and refine design
const spec = refineDesign(design);
```

### Step 3: `/build` - Implementation

**Main Claude's Role**: Code orchestrator managing implementation across different components.

**Agent Usage**: Very High - Primary implementation phase.

```mermaid
Build Flow:
Main Claude → Determine component → Select appropriate agent → Implementation
           ↓
    /agent:coder (general)
    /agent:mcp-dev (MCP specific)
    /agent:hooks (middleware)
    /agent:integration (services)
```

**Agent Selection Matrix**:

| Component Type | Primary Agent | Support Agents |
|---------------|---------------|----------------|
| REST API | `/agent:coder` | `/agent:integration` |
| MCP Server | `/agent:mcp-dev` | `/agent:coder` |
| Middleware | `/agent:hooks` | `/agent:coder` |
| Service Integration | `/agent:integration` | `/agent:coder` |
| Database Layer | `/agent:coder` | `/agent:performance` |

**Workflow Example**:
```
Main Claude:
1. Reads technical spec
2. Identifies components to build
3. For each component:
   a. Prepares context (spec + standards + examples)
   b. Invokes appropriate specialist agent
   c. Validates implementation
   d. Integrates with existing code
4. Updates ticket status to CODE_REVIEW
```

**Parallel Building**:
```javascript
// When components are independent
const implementations = await Promise.all([
  invokeAgent('coder', apiContext),
  invokeAgent('mcp-dev', mcpContext),
  invokeAgent('integration', serviceContext)
]);
```

### Step 4: `/test` - Validation and Quality Assurance

**Main Claude's Role**: Test coordinator ensuring comprehensive validation.

**Agent Usage**: High - Testing and security validation.

```mermaid
Test Flow:
Main Claude → /agent:tester → Test Results
           ↓                ↓
    /agent:security    Failed tests → /agent:coder (fixes)
    /agent:performance
```

**Testing Workflow**:
```
Main Claude:
1. Gathers all implementation code
2. Prepares test context with:
   - Implementation code
   - Acceptance criteria
   - Test framework details
   - Existing test examples

3. Invokes /agent:tester for:
   - Writing comprehensive tests
   - Running tests
   - Debugging failures

4. If tests pass:
   → Invoke /agent:security for security review
   → Invoke /agent:performance for optimization (if needed)

5. If issues found:
   → Prepare fix context
   → Invoke /agent:coder for fixes
   → Re-test

6. Update ticket status to QA_TESTING → READY_FOR_RELEASE
```

**TDD Variation**:
```
1. /agent:tester writes failing tests first
2. /agent:coder implements to make tests pass
3. /agent:tester validates and may suggest refactoring
```

### Step 5: `/document` - Documentation and Finalization

**Main Claude's Role**: Documentation coordinator ensuring all documentation is complete.

**Agent Usage**: Moderate - User-facing documentation.

```mermaid
Document Flow:
Main Claude → Determine documentation needs → /agent:documenter
           ↓
    Update Spec
    Update README
    Create guides
```

**Documentation Workflow**:
```
Main Claude:
1. Reviews implementation and test results
2. Identifies documentation needs:
   - API documentation needed? → /agent:documenter
   - User guide needed? → /agent:documenter
   - README update needed? → /agent:documenter
   - Spec update needed? → Main Claude handles

3. For each documentation need:
   - Prepare context (code + APIs + use cases)
   - Invoke /agent:documenter
   - Review and integrate documentation

4. Update ticket status to DOCUMENTATION → DONE
```

## Status Transition Management

### Ticket Status Flow with Agents

```
BACKLOG 
  ↓
TODO (After /plan with /agent:architect)
  ↓
IN_PROGRESS (During /build with specialists)
  ↓
CODE_REVIEW (After /build completion)
  ↓
QA_TESTING (During /test with /agent:tester)
  ↓
DOCUMENTATION (During /document with /agent:documenter)
  ↓
READY_FOR_RELEASE
  ↓
DONE
```

### Agent Involvement by Status

| Status | Primary Agents | Purpose |
|--------|---------------|---------|
| TODO → IN_PROGRESS | `/agent:architect` | Final design review |
| IN_PROGRESS | `/agent:coder`, specialists | Implementation |
| CODE_REVIEW | `/agent:tester` | Initial test writing |
| QA_TESTING | `/agent:tester`, `/agent:security` | Full validation |
| DOCUMENTATION | `/agent:documenter` | User docs |

## Command Integration

### Enhanced Workflow Commands

```bash
# Research phase
/research
→ Main Claude searches and analyzes
→ May invoke /agent:architect for complex questions

# Planning phase
/plan
→ Main Claude prepares context
→ Invokes /agent:architect
→ Creates/updates Spec

# Building phase
/build
→ Main Claude reads Spec
→ Invokes appropriate specialists
→ Manages integration

# Testing phase
/test
→ Invokes /agent:tester
→ Invokes /agent:security
→ Coordinates fixes with /agent:coder

# Documentation phase
/document
→ Invokes /agent:documenter for user docs
→ Main Claude updates technical docs
```

## Practical Examples

### Example 1: Building a New REST API Feature

```
1. /research
   - Main Claude searches for existing API patterns
   - Finds authentication middleware
   - Documents database schema

2. /plan
   - Main Claude invokes /agent:architect with:
     * API requirements
     * Existing patterns
     * Performance needs
   - Architect designs endpoint structure
   - Main Claude creates Spec

3. /build
   - Main Claude invokes /agent:coder with:
     * Endpoint specifications
     * Coding standards
     * Example implementations
   - Coder implements endpoints
   - Main Claude invokes /agent:integration for external service

4. /test
   - Main Claude invokes /agent:tester with implementation
   - Tester writes and runs tests
   - Main Claude invokes /agent:security for review
   - Security agent finds SQL injection risk
   - Main Claude invokes /agent:coder for fix

5. /document
   - Main Claude invokes /agent:documenter with API details
   - Documenter creates API reference
   - Main Claude updates Spec completion
```

### Example 2: MCP Server Implementation

```
1. /research
   - Main Claude researches MCP protocol
   - Identifies integration points

2. /plan
   - /agent:architect designs MCP architecture
   - Defines tools and resources to expose

3. /build
   - /agent:mcp-dev implements MCP server
   - /agent:integration connects to existing services

4. /test
   - /agent:tester validates protocol compliance
   - Tests all exposed tools

5. /document
   - /agent:documenter creates MCP integration guide
```

### Example 3: Performance Optimization Task

```
1. /research
   - Main Claude identifies slow endpoints
   - Gathers performance metrics

2. /plan
   - Main Claude analyzes bottlenecks
   - Plans optimization strategy

3. /build
   - /agent:performance analyzes and provides optimizations
   - /agent:coder implements caching
   - /agent:coder optimizes queries

4. /test
   - /agent:tester writes performance tests
   - Validates improvements

5. /document
   - Documents performance improvements
   - Updates optimization guidelines
```

## Parallel Agent Execution

### When to Run Agents in Parallel

**Good Candidates**:
- Independent components
- Multiple reviews (security + performance)
- Different documentation types
- Separate service integrations

**Example**:
```javascript
// Parallel review after implementation
const reviews = await Promise.all([
  invokeAgent('security', { code: implementation }),
  invokeAgent('performance', { code: implementation }),
  invokeAgent('tester', { code: implementation })
]);

// Process all results
processSecurityIssues(reviews[0]);
processPerformanceIssues(reviews[1]);
processTestResults(reviews[2]);
```

### When to Run Sequentially

**Required Sequential**:
- Design → Implementation
- Implementation → Testing
- Testing → Fixes
- Fixes → Re-testing

## TodoWrite Integration

### Todo Management with Agents

```javascript
// Before invoking agents
updateTodo({
  task: "Implement user authentication",
  status: "in_progress",
  assignedAgent: "/agent:coder"
});

// After agent completion
updateTodo({
  task: "Implement user authentication",
  status: "completed",
  agentOutput: "Summary of implementation"
});

// Create follow-up tasks
createTodo({
  task: "Fix security issue in auth",
  status: "pending",
  plannedAgent: "/agent:coder"
});
```

## Error Handling in Workflow

### Agent Failure Recovery

```
If /agent:coder fails:
1. Main Claude analyzes error
2. Adjusts context/approach
3. May try different agent
4. May handle directly
5. Updates ticket status if blocked

If /agent:tester finds bugs:
1. Main Claude prioritizes issues
2. Prepares fix context
3. Invokes /agent:coder for each fix
4. Re-runs tests

If /agent:security finds vulnerabilities:
1. Main Claude assesses severity
2. Critical: Immediate fix required
3. High: Fix before continuing
4. Medium/Low: Add to backlog
```

## Optimization Tips

### 1. Context Preparation
- Pre-process all standards into agent prompts
- Include only relevant code sections
- Provide clear examples from codebase

### 2. Agent Selection
- Use specialists for complex domains
- Use general coder for standard features
- Combine agents for comprehensive validation

### 3. Workflow Efficiency
- Batch related tasks for single agent
- Run independent agents in parallel
- Cache common contexts for reuse

## Monitoring and Metrics

### Track Agent Performance

```javascript
const agentMetrics = {
  agent: '/agent:coder',
  task: 'API implementation',
  inputTokens: 2500,
  outputTokens: 1500,
  success: true,
  duration: '45s',
  requiredRetries: 0
};
```

### Workflow Metrics

- Time per step
- Agent invocations per ticket
- Success rate by agent type
- Context size optimization

## Summary

The Agent System seamlessly integrates with your 5-step workflow by:

1. **Enhancing each step** with specialized expertise
2. **Maintaining Main Claude** as the orchestrator
3. **Following status transitions** strictly
4. **Enabling parallel execution** where possible
5. **Providing clear handoffs** between agents
6. **Ensuring complete context** in every invocation

The key to success is treating agents as specialized tools within your established workflow, not as replacements for it.

---

*Last Updated: 2025-08-09 | Version: 1.0*