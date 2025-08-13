---
title: Choosing the Right Agent - Decision Guide
description: Comprehensive guide for selecting optimal agents based on task type, complexity, and project phase
type: guide
category: getting-started
tags: [agents, selection, decision-tree, workflow, optimization, best-practices]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: stable
---

# Choosing the Right Agent - Decision Guide

## Quick Decision Flowchart

```
Task Type? 
├── Planning/Design → `/agent:architect`
├── Code Implementation → See "Implementation Decision Tree"
├── Testing/QA → `/agent:tester`
├── Security Review → `/agent:security`
├── Documentation → `/agent:documenter`
├── Performance Issues → `/agent:performance`
├── System Integration → `/agent:integration`
└── Code Cleanup → `/agent:clutter-detector`
```

## Agent Capability Matrix

| Agent | Primary Purpose | Complexity | Best For | Token Usage | Parallel Safe |
|-------|----------------|------------|----------|-------------|---------------|
| **`/agent:architect`** | System design & planning | High | Architecture, ADRs, Sprint planning | High | Yes (design phase) |
| **`/agent:coder`** | General implementation | Medium | Standard features, refactoring | Medium | Yes (different modules) |
| **`/agent:mcp-dev`** | MCP protocol specialist | High | MCP servers, protocol impl. | High | No (protocol specific) |
| **`/agent:tester`** | Quality assurance | Medium | Test writing, debugging | Medium | Yes (test suites) |
| **`/agent:security`** | Security assessment | Medium | Vuln scanning, compliance | Medium | Yes (different areas) |
| **`/agent:performance`** | Optimization | Medium-High | Speed, memory, scaling | Medium-High | Yes (different metrics) |
| **`/agent:documenter`** | Documentation | Low-Medium | User docs, guides | Low-Medium | Yes (different docs) |
| **`/agent:integration`** | Service coordination | Medium-High | APIs, microservices | Medium-High | Yes (different services) |
| **`/agent:hooks`** | Middleware/events | Medium | Event systems, plugins | Medium | Yes (different hooks) |
| **`/agent:memory-sync`** | Knowledge graph sync | Low | Code changes tracking | Low | No (sequential only) |
| **`/agent:clutter-detector`** | Code cleanup | Low-Medium | Redundancy removal | Medium | No (global analysis) |

## Implementation Decision Tree

```
Need to implement code?
├── Is it MCP-related?
│   ├── Yes → `/agent:mcp-dev`
│   └── No → Continue
├── Is it middleware/hooks?
│   ├── Yes → `/agent:hooks`
│   └── No → Continue
├── Is it service integration?
│   ├── Yes → `/agent:integration`
│   └── No → Continue
├── Is it performance-critical?
│   ├── Yes → `/agent:performance` + `/agent:coder`
│   └── No → `/agent:coder`
```

## Scenario-Based Agent Selection

### 🐛 "I need to fix a bug"
**Recommended Flow:**
1. **`/agent:tester`** - Reproduce and isolate the bug
2. **`/agent:coder`** - Implement the fix
3. **`/agent:tester`** - Validate the fix and prevent regression

**Why this sequence:**
- Tester identifies root cause and creates failing test
- Coder fixes with test-driven approach
- Tester ensures comprehensive validation

### 🚀 "I'm building a new feature"
**Recommended Flow:**
1. **`/agent:architect`** - Design system architecture
2. **Specialist Agent** - Implementation (see matrix)
3. **`/agent:tester`** - Comprehensive testing
4. **`/agent:documenter`** - User documentation
5. **`/agent:security`** - Security review (if handling data)

**Agent Selection for Implementation:**
- Standard feature → `/agent:coder`
- MCP integration → `/agent:mcp-dev`
- Performance-critical → `/agent:performance`
- External API → `/agent:integration`

### 🔒 "I need a security review"
**Recommended Combinations:**
- **Full audit:** `/agent:security` + `/agent:coder` (for fixes)
- **Pre-release:** `/agent:security` + `/agent:tester` (validation)
- **Compliance:** `/agent:security` + `/agent:documenter` (reports)

### ⚡ "I want to optimize performance"
**Recommended Flow:**
1. **`/agent:performance`** - Profile and identify bottlenecks
2. **`/agent:coder`** - Implement optimizations
3. **`/agent:tester`** - Benchmark and validate
4. **`/agent:memory-sync`** - Update knowledge graph

### 🏗️ "I'm planning a sprint"
**Sprint Planning Flow:**
1. **`/agent:architect`** - Ticket selection and dependency analysis
2. **Main Claude** - Resource allocation and timeline
3. **`/agent:architect`** - Parallelization strategy

## Multi-Agent Coordination Patterns

### Parallel Execution (Safe Combinations)
**Can run simultaneously:**
```bash
# Different modules
/agent:coder (Module A) + /agent:coder (Module B)

# Different aspects
/agent:security (Auth) + /agent:performance (Database)

# Different phases
/agent:tester (Unit tests) + /agent:documenter (API docs)
```

### Sequential Dependencies (Required Order)
**Must run in sequence:**
```bash
# Design → Implementation → Testing
/agent:architect → /agent:coder → /agent:tester

# Architecture → Security Review
/agent:architect → /agent:security

# Implementation → Memory Sync
/agent:coder → /agent:memory-sync
```

### Feedback Loops (Common Patterns)
```bash
# Bug Fix Loop
/agent:tester → /agent:coder → /agent:tester

# Security Hardening Loop
/agent:security → /agent:coder → /agent:security

# Performance Optimization Loop
/agent:performance → /agent:coder → /agent:performance
```

## Agent Performance Characteristics

### High Token Usage (Use Strategically)
- **`/agent:architect`** - Complex system design
- **`/agent:mcp-dev`** - Protocol implementation
- **`/agent:performance`** - Deep optimization analysis

**Strategy:** Use early in sprint, batch similar work

### Medium Token Usage (Regular Use)
- **`/agent:coder`** - Standard implementation
- **`/agent:tester`** - Test creation and debugging
- **`/agent:integration`** - Service coordination

**Strategy:** Core development workflow agents

### Low Token Usage (Frequent Use)
- **`/agent:documenter`** - Documentation updates
- **`/agent:memory-sync`** - Knowledge tracking
- **`/agent:clutter-detector`** - Code cleanup

**Strategy:** Use frequently for maintenance

## Context Optimization Tips

### Maximize Agent Effectiveness
1. **Pre-process standards** into agent prompts
2. **Include relevant examples** from codebase
3. **Provide clear success criteria**
4. **Never reference external files** - embed content

### Minimize Token Usage
1. **Extract only relevant code** for context
2. **Use focused prompts** not generic requests
3. **Batch similar work** when possible
4. **Cache agent outputs** for reuse

## Task Complexity Assessment

### Simple Tasks (Single Agent)
- Bug fix in isolated function → `/agent:coder`
- Write unit test → `/agent:tester`
- Update documentation → `/agent:documenter`
- Security scan → `/agent:security`

### Moderate Tasks (2-3 Agents)
- New API endpoint → `/agent:architect` + `/agent:coder` + `/agent:tester`
- Performance issue → `/agent:performance` + `/agent:coder`
- Integration task → `/agent:integration` + `/agent:tester`

### Complex Tasks (Multiple Agents)
- New feature → `/agent:architect` + specialist + `/agent:tester` + `/agent:security` + `/agent:documenter`
- System refactoring → `/agent:architect` + `/agent:coder` + `/agent:tester` + `/agent:clutter-detector`
- MCP server → `/agent:architect` + `/agent:mcp-dev` + `/agent:integration` + `/agent:tester`

## Common Anti-Patterns

### ❌ Agent Misuse
- Using `/agent:architect` for simple functions
- Using `/agent:coder` for system design
- Skipping `/agent:tester` for complex features
- Using multiple agents for trivial tasks

### ❌ Poor Sequencing
- Implementing before designing
- Testing without proper requirements
- Security review after deployment
- Documentation as an afterthought

### ❌ Context Issues
- Referencing files instead of embedding content
- Providing incomplete requirements
- Missing existing code patterns
- Ignoring project constraints

## Success Patterns

### ✅ Optimal Workflows
- **Design-first:** Always start with `/agent:architect` for complex work
- **Test-driven:** Include `/agent:tester` early and often
- **Security-conscious:** Run `/agent:security` before production
- **Documentation-complete:** Use `/agent:documenter` for user-facing features

### ✅ Efficient Coordination
- **Parallel execution** for independent tasks
- **Clear handoffs** between agents
- **Feedback integration** from agent outputs
- **Context reuse** across similar tasks

## Quick Reference Commands

### Agent Status and Metrics
```bash
/agent-status           # Current agent invocations
/agent-metrics         # Performance data
/agent-feedback        # Improvement tracking
```

### Common Combinations
```bash
# Full feature development
/agent:architect + /agent:coder + /agent:tester + /agent:documenter

# Bug fix workflow
/agent:tester + /agent:coder + /agent:tester

# Security hardening
/agent:security + /agent:coder + /agent:security

# Performance optimization
/agent:performance + /agent:coder + /agent:tester
```

## Decision Support Questions

Before selecting an agent, ask:

1. **What's the primary goal?** (Design, implement, test, secure, document)
2. **What's the complexity level?** (Simple, moderate, complex)
3. **Are there dependencies?** (What must happen first)
4. **What's the performance impact?** (Token usage, execution time)
5. **Can tasks run in parallel?** (Independent work streams)
6. **What context is needed?** (Code, specs, examples)
7. **What's the success criteria?** (How to measure completion)

## Agent Evolution and Feedback

### Continuous Improvement
- Track agent performance metrics after each use
- Record successful patterns and combinations
- Identify context improvements needed
- Update selection criteria based on results

### When to Create New Agents
Only create new agents when:
- Specialized expertise is required repeatedly
- Existing agents cannot handle the domain
- Significant complexity warrants isolation
- Clear differentiation from existing agents

---

## Related Documentation

- [Agent System Overview](/docs/agents/) - Complete agent documentation
- [Basic Workflow Guide](/docs/getting-started/basic-workflow.md) - Standard development process
- [Agent Recipes](/recipes/) - Proven agent combinations
- [Performance Metrics](/feedback/) - Agent optimization tracking

---

*Choose wisely, execute efficiently, measure continuously*