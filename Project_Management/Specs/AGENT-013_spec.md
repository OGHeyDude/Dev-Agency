---
title: AGENT-013 - Agent Invocation CLI Tool
description: Command-line interface for invoking Dev-Agency agents with enhanced workflow integration
type: spec
category: tools
tags: [cli, agents, automation, workflow, parallel-execution]
created: 2025-08-09
updated: 2025-08-09
status: completed
---

# **Spec: Agent Invocation CLI Tool**

**Ticket ID:** `AGENT-013`  
**Status:** `TODO`  
**Last Updated:** 2025-08-09  
**Story Points:** 5  
**Sprint:** 08-10-2025 to 08-24-2025

---

## **1. Problem & Goal**

**Problem:** Agent invocation currently requires manual Claude Code interaction and lacks standardized patterns for batch execution, context management, progress monitoring, recipe automation, and workflow integration.

**Goal:** Create a powerful CLI tool that simplifies agent invocation, enables batch processing with parallelization (up to 5 agents), provides comprehensive monitoring, and integrates seamlessly with Dev-Agency workflows to improve developer productivity.

## **2. Acceptance Criteria**

- [ ] CLI supports simple agent invocation: `agent invoke architect --task "design system"`
- [ ] Batch execution with parallel processing (up to 5 agents simultaneously)
- [ ] Recipe execution: `agent recipe full-stack-feature --context ./context.json`
- [ ] Context management with automatic preparation and validation
- [ ] Progress tracking with real-time status updates
- [ ] Result formatting (JSON, markdown, plain text)
- [ ] Configuration file support for defaults and project settings
- [ ] Integration with existing Dev-Agency workflow commands
- [ ] Cross-platform compatibility (Windows, macOS, Linux)
- [ ] Extensible plugin architecture for custom agents
- [ ] Performance metrics tracking and reporting
- [ ] Error handling with detailed diagnostics
- [ ] Dry-run mode for validation without execution

## **3. Technical Plan**

**Approach:** Build a Node.js CLI application using Commander.js for command parsing, with modular architecture supporting plugins, parallel execution via worker threads, and comprehensive configuration management.

### **CLI Command Structure**

```bash
# Basic invocation
agent invoke <agent-name> [options]
agent invoke architect --task "design auth system" --context ./auth.md

# Batch execution
agent batch --agents "architect,coder,tester" --parallel 3

# Recipe execution
agent recipe <recipe-name> [options]
agent recipe mcp-server --output ./plan.md

# Configuration
agent config set default-parallel-limit 5
agent config init --project-type web-app

# Monitoring
agent status --active
agent logs --agent architect --last 10
agent metrics --summary
```

### **Core Components**

1. **Command Parser** - Route CLI commands to handlers
2. **Agent Manager** - Load definitions and manage invocations
3. **Execution Engine** - Handle parallel execution and progress
4. **Context Manager** - Prepare and optimize contexts
5. **Configuration System** - Manage settings and preferences
6. **Recipe Engine** - Execute predefined workflows

### **Architecture Design**

```
CLI Entry Point
    ├── Command Parser
    ├── Configuration Loader
    ├── Agent Manager
    │   ├── Definition Loader
    │   └── Invocation Handler
    ├── Execution Engine
    │   ├── Task Scheduler
    │   ├── Parallel Executor
    │   └── Progress Reporter
    └── Recipe Engine
        ├── Recipe Parser
        └── Step Executor
```

### **Implementation Phases**

**Phase 1: Core CLI Structure**
- Basic command structure with Commander.js
- Agent definition loader for Dev-Agency agents
- Simple single-agent invocation
- Basic configuration management

**Phase 2: Context & Optimization**
- Context preparation system
- Size analyzer and optimizer
- Template processing for contexts
- Dry-run mode for testing

**Phase 3: Parallel Execution**
- Parallel execution with worker threads
- Progress tracking and status updates
- Result aggregation and formatting
- Dependency resolution

**Phase 4: Recipe Integration**
- Integrate with Dev-Agency recipes
- Recipe execution engine
- Recipe validation and testing
- Result combination logic

## **4. Success Metrics**

- Single agent invocation: <5 seconds overhead
- Parallel execution efficiency: >80% of theoretical maximum
- Context optimization: 30% average size reduction
- Recipe execution: 40% faster than manual process
- User satisfaction: >4.0/5.0 rating

## **5. Dependencies**

- Node.js runtime environment
- Claude Code API access
- Integration with AGENT-010 (context optimizer)
- Integration with AGENT-011 (selection assistant)

## **6. Anti-Clutter Checks**

- [ ] Search for existing CLI tools in Dev-Agency
- [ ] Verify no duplication with workflow commands
- [ ] Reuse existing agent definitions
- [ ] Leverage established patterns

---

## **Implementation Completed - 2025-08-09**

### **Core Components Created:**
- **CLI Entry Point** (`/tools/agent-cli/src/cli.ts`) - Commander.js-based command structure with full argument parsing
- **Agent Manager** (`/tools/agent-cli/src/core/AgentManager.ts`) - Dev-Agency agent loading, validation, and context preparation
- **Configuration System** (`/tools/agent-cli/src/core/ConfigManager.ts`) - YAML-based project and global configuration management
- **Execution Engine** (`/tools/agent-cli/src/core/ExecutionEngine.ts`) - Parallel agent coordination with worker threads, up to 5 concurrent agents
- **Recipe Engine** (`/tools/agent-cli/src/core/RecipeEngine.ts`) - Dev-Agency recipe parsing and execution with dependency resolution
- **Logger Utility** (`/tools/agent-cli/src/utils/Logger.ts`) - Structured logging with console and file output
- **TypeScript Configuration** - Complete build system with ESLint, Jest testing framework
- **Comprehensive Documentation** (`/tools/agent-cli/README.md`) - Installation, usage, and API documentation

### **Features Implemented:**
✅ Single agent invocation with context and task specification  
✅ Parallel batch execution (up to 5 agents simultaneously)  
✅ Recipe execution with dependency resolution  
✅ YAML configuration management (global and project-specific)  
✅ Multiple output formats (JSON, Markdown, text)  
✅ Dry-run mode for validation without execution  
✅ Real-time progress tracking and status monitoring  
✅ Performance metrics and execution analytics  
✅ Cross-platform compatibility (Windows, macOS, Linux)  
✅ Comprehensive error handling with detailed diagnostics  
✅ Integration with Dev-Agency centralized system  

### **Architecture:**
- **Hub-and-Spoke Design** - Main CLI orchestrates all agent interactions
- **Worker Thread Execution** - Isolated agent execution with timeout support
- **Context Optimization** - Automatic file filtering and size management
- **Configuration Layering** - Global defaults, project overrides, command-line options
- **Dependency Resolution** - Intelligent step ordering in recipe execution
- **Performance Monitoring** - Built-in metrics collection and reporting

### **Installation Path:**
```bash
cd /home/hd/Desktop/LAB/Dev-Agency/tools/agent-cli
npm install && npm run build
```

### **Ready for Testing and Integration**

---

*Epic: Integration Framework | Priority: High | Risk: Low*