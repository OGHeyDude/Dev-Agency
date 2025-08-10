---
title: Agent Catalog - When to Use What
description: Quick reference for selecting the right AI agent for your task
type: reference
category: agents
tags: [agents, selection, catalog, reference]
created: 2025-08-09
updated: 2025-08-09
---

# Agent Catalog - When to Use What

**Quick Selection Guide**: Choose the right agent for your development task.

## 🚀 Quick Selection

| **I need to...** | **Use Agent** | **Example Task** |
|-------------------|---------------|------------------|
| **Plan a feature** | `/agent:architect` | "Design user authentication system" |
| **Write code** | `/agent:coder` | "Implement REST API endpoints" |
| **Fix bugs** | `/agent:tester` | "Debug failing test suite" |
| **Check security** | `/agent:security` | "Review authentication logic" |
| **Write docs** | `/agent:documenter` | "Create API documentation" |
| **Optimize performance** | `/agent:performance` | "Identify bottlenecks in data processing" |
| **Add integrations** | `/agent:integration` | "Connect to third-party API" |
| **Build MCP servers** | `/agent:mcp-dev` | "Create custom MCP protocol server" |
| **Find duplicates** | `/agent:clutter-detector` | "Remove duplicate code patterns" |
| **Sync knowledge** | `/agent:memory-sync` | "Update AI knowledge with code changes" |

---

## 🤖 Core Development Agents

### 🏗️ `/agent:architect` - System Design
**Best for**: Planning, architecture, system design decisions
```bash
Task examples:
- "Design microservices architecture for user management"
- "Plan database schema for e-commerce platform"  
- "Create system architecture for real-time chat"
```

### 💻 `/agent:coder` - Implementation  
**Best for**: Writing code, implementing features, refactoring
```bash
Task examples:
- "Implement JWT authentication middleware"
- "Create React components for dashboard"
- "Refactor legacy database connection code"
```

### 🧪 `/agent:tester` - Quality Assurance
**Best for**: Testing, debugging, quality validation
```bash
Task examples:
- "Create comprehensive test suite for API endpoints"
- "Debug intermittent test failures"
- "Set up end-to-end testing framework"
```

### 🔒 `/agent:security` - Security Review
**Best for**: Security analysis, vulnerability assessment
```bash  
Task examples:
- "Review API endpoints for security vulnerabilities"
- "Audit authentication implementation"
- "Check for common OWASP security issues"
```

### 📝 `/agent:documenter` - Documentation
**Best for**: API docs, user guides, technical documentation
```bash
Task examples:
- "Generate API documentation from OpenAPI spec"
- "Create user guide for new features"
- "Write technical architecture documentation"
```

---

## 🔧 Specialist Agents

### ⚡ `/agent:performance` - Optimization
**Best for**: Performance analysis, bottleneck identification, optimization
```bash
Task examples:
- "Analyze database query performance"
- "Identify memory leaks in application"
- "Optimize API response times"
```

### 🔗 `/agent:integration` - System Integration
**Best for**: API integration, service connections, system compatibility
```bash
Task examples:  
- "Integrate with Stripe payment API"
- "Connect to external authentication service"
- "Build webhook handling system"
```

### 🌐 `/agent:mcp-dev` - MCP Protocol
**Best for**: Model Context Protocol development, AI system integration
```bash
Task examples:
- "Create custom MCP server for database access"
- "Build MCP integration for project management tools"
- "Develop AI-powered development workflows"
```

### 🧹 `/agent:clutter-detector` - Code Quality
**Best for**: Finding duplications, cleanup, code organization
```bash
Task examples:
- "Find and eliminate duplicate code patterns"
- "Identify unused imports and dead code"  
- "Suggest code organization improvements"
```

### 🧠 `/agent:memory-sync` - Knowledge Management
**Best for**: AI knowledge updates, documentation synchronization
```bash
Task examples:
- "Sync recent code changes to AI knowledge"
- "Update development patterns in knowledge base"
- "Synchronize project documentation with AI memory"
```

---

## 🔀 Multi-Agent Workflows

### **Parallel Execution** (Up to 5 agents simultaneously)
**Best for**: Comprehensive analysis, code reviews, complex projects

**Example: Complete Feature Review**
```bash
Simultaneous execution:
├── /agent:tester      → Quality assurance analysis
├── /agent:security    → Vulnerability assessment  
├── /agent:performance → Performance benchmarking
├── /agent:integration → System compatibility check
└── /agent:clutter-detector → Code duplication analysis

Result: 65-76% time savings vs sequential execution
```

### **Sequential Workflows** (One agent builds on another)
**Best for**: Step-by-step development, complex implementations

**Example: New Feature Development**
```bash
Step 1: /agent:architect  → System design
Step 2: /agent:coder      → Implementation
Step 3: /agent:tester     → Testing setup
Step 4: /agent:security   → Security review
Step 5: /agent:documenter → Documentation
```

---

## 💡 Agent Selection Tips

### **Choose Based On Output Needed**
- **Planning/Design** → `architect`
- **Working Code** → `coder`
- **Test Coverage** → `tester`
- **Security Report** → `security`
- **Documentation** → `documenter`

### **Consider Workflow Stage**
- **Early Planning** → `architect`, `integration`
- **Active Development** → `coder`, `tester`
- **Pre-Release** → `security`, `performance`, `clutter-detector`
- **Post-Release** → `documenter`, `memory-sync`

### **Match Agent to Project Type**
- **Web Applications** → `coder`, `security`, `performance`
- **APIs/Microservices** → `architect`, `integration`, `tester`
- **AI/ML Projects** → `mcp-dev`, `performance`, `memory-sync`
- **Legacy Refactoring** → `clutter-detector`, `architect`, `coder`

---

## ⏱️ Quick Commands Reference

```bash
# Single agent (basic)
Task: "Your task description"
Agent: general-purpose
Context: Relevant files/directory

# Multiple agents (advanced)
[Use parallel Task tool invocations for simultaneous execution]

# Recipe-based (automated workflows)
# See /recipes/ directory for predefined multi-agent workflows
```

---

**Next Steps**: 
- **Try parallel execution**: Use multiple agents for comprehensive analysis
- **Explore recipes**: Check `/recipes/` for proven multi-agent workflows
- **Learn CLI tool**: Automate agent orchestration with [Agent CLI](../tools/agent-cli/README.md)