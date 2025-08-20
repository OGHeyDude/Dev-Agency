---
title: Agent System Overview
description: Understanding how agents work automatically within STAD Protocol
type: guide
category: getting-started
tags: [agents, automation, workflow, stad]
created: 2025-08-10
updated: 2025-08-19
version: 2.0
status: stable
---

# Agent System Overview

## Automated Agent Coordination

The Dev-Agency system uses 9 essential commands that automatically coordinate specialized agents behind the scenes. Users no longer manually invoke agents—the system intelligently selects and coordinates them based on your tasks.

### Available Commands

#### STAD Sprint Commands
```bash
/sprint-plan <additional instructions>  # Stage 1: Sprint Planning
/execute                                # Stage 2: Sprint Execution  
/validate                               # Stage 3: Sprint Validation
/sprint-approved                        # Stage 4: Release & Retrospective
```

#### Utility Commands
```bash
/cmd                                    # Initialize Session
/standards <Subject>                    # Read Standards
/sync-memory                            # Knowledge Graph Sync
/sprint-status                          # Progress Report
```

## How Agents Work Automatically

**Agents work behind the scenes without manual selection:**

1. **During `/sprint-plan`**: System uses architect and planning agents automatically
2. **During `/execute`**: System coordinates coder, tester, security, and other agents as needed
3. **During `/validate`**: System uses QA, security, and validation agents automatically
4. **During `/sprint-approved`**: System uses retrospective and documentation agents automatically

## Agent Capabilities (Automated)

| Agent Type | Primary Purpose | Automatically Used For | Complexity |
|------------|----------------|----------------------|------------|
| **Architect** | System design & planning | Architecture decisions, Sprint planning | High |
| **Coder** | General implementation | Standard features, refactoring | Medium |
| **MCP Dev** | MCP protocol specialist | MCP servers, protocol implementation | High |
| **Tester** | Quality assurance | Test writing, debugging | Medium |
| **Security** | Security assessment | Vulnerability scanning, compliance | Medium |
| **Performance** | Optimization | Speed, memory, scaling optimizations | Medium-High |
| **Documenter** | Documentation | User docs, guides, API documentation | Low-Medium |
| **Integration** | Service coordination | APIs, microservices, external integrations | Medium-High |
| **Backend QA** | Validation testing | Stage 3 validation, quality gates | Medium |
| **Debug** | Issue resolution | Bug fixing, troubleshooting | Medium |
| **Memory Sync** | Knowledge graph sync | Code changes tracking | Low |

## Automatic Agent Selection

```
When you run commands, the system automatically selects agents:

/sprint-plan → Architect agent designs system
/execute → Coder, Tester, and specialist agents work in parallel
/validate → QA, Security, Performance agents validate work
/sprint-approved → Retrospective and Documenter agents finalize

Specialist agents are chosen based on:
├── MCP-related work → MCP Dev agent
├── Middleware/hooks → Hooks agent  
├── Service integration → Integration agent
├── Performance-critical → Performance agent
└── Standard features → Coder agent
```

## Automatic Workflows by Scenario

### 🐛 "I need to fix a bug"
**Use:** Add bug to backlog, then execute
```bash
# Add to PROJECT_PLAN.md: Fix login timeout bug - users getting logged out after 5 minutes
/execute  # System automatically uses Debug and Tester agents
```

**What happens automatically:**
- Debug agent reproduces and isolates the bug
- Coder agent implements the fix
- Tester agent validates and prevents regression

### 🚀 "I'm building a new feature"
**Use:** Plan and execute sprint
```bash
/sprint-plan "User dashboard with real-time notifications"
/execute  # System coordinates all needed agents automatically
```

**What happens automatically:**
- Architect agent designs system architecture
- Specialist agents handle implementation (MCP, Integration, etc.)
- Tester agent creates comprehensive tests
- Documenter agent updates documentation
- Security agent reviews if handling sensitive data

### 🔒 "I need a security review"
**Use:** Validation command
```bash
/validate  # Security agent automatically performs audit
```

**What happens automatically:**
- Security agent performs vulnerability scan
- Coder agent fixes any issues found
- Tester agent validates security fixes

### ⚡ "I want to optimize performance"
**Use:** Include in sprint plan
```bash
/sprint-plan "Optimize API response times - target <100ms"
/execute  # Performance agent automatically handles optimization
```

**What happens automatically:**
- Performance agent profiles and identifies bottlenecks
- Coder agent implements optimizations
- Tester agent benchmarks and validates improvements

### 🏗️ "I'm planning a sprint"
**Use:** Sprint planning command
```bash
/sprint-plan "Sprint 8: User authentication system"
```

**What happens automatically:**
- Architect agent analyzes tickets and dependencies
- System allocates resources and creates timeline
- Architect agent creates parallelization strategy

## Automatic Agent Coordination

### Parallel Execution (Handled Automatically)
**During `/execute`, the system runs agents simultaneously when safe:**
- Different modules: Multiple coder agents work on separate components
- Different aspects: Security and Performance agents work in parallel
- Different phases: Testing and Documentation happen concurrently

### Sequential Dependencies (Managed Automatically)
**The system ensures proper order:**
- Design → Implementation → Testing (Architecture leads, others follow)
- Architecture → Security Review (Security validates design decisions)
- Implementation → Memory Sync (Knowledge graph updated after changes)

### Feedback Loops (Built into Commands)
**Common patterns handled automatically:**
- Bug fixes: Debug → Code → Test cycle repeats until resolved
- Security: Security scan → Fix → Re-scan until clean
- Performance: Profile → Optimize → Benchmark until targets met

## System Resource Management

### Resource Optimization (Automatic)
The system automatically optimizes resource usage:

**High-resource agents** (Architecture, MCP Dev, Performance):
- Used strategically at sprint start
- Batch similar work together
- Results cached for reuse

**Medium-resource agents** (Coder, Tester, Integration):
- Core workflow agents used regularly
- Parallel execution when possible
- Context sharing between agents

**Low-resource agents** (Documenter, Memory Sync, Cleanup):
- Run frequently for maintenance
- Continuous operation during sprints
- Minimal impact on overall performance

## Optimizing System Performance

### Better Results Through Clear Communication
1. **Provide specific requirements** in sprint plans
2. **Include relevant examples** and context
3. **Set clear success criteria** for features
4. **Reference existing patterns** in your codebase

### Efficient Sprint Execution
1. **Batch related work** in sprint plans
2. **Use descriptive sprint goals** for better agent coordination
3. **Let the system handle** agent selection and coordination
4. **Trust the automation** - agents optimize themselves

## Task Complexity (Automatic Handling)

### Simple Tasks
**How to handle:** Add to backlog
```bash
# Add to PROJECT_PLAN.md: Fix login validation bug
/execute  # System uses appropriate agents automatically
```

### Moderate Tasks
**How to handle:** Include in sprint planning
```bash
/sprint-plan "Add user profile API endpoint"
/execute  # System coordinates architect, coder, and tester
```

### Complex Tasks
**How to handle:** Comprehensive sprint planning
```bash
/sprint-plan "Complete user authentication system with OAuth, 2FA, and audit logging"
/execute  # System coordinates all needed specialist agents
```

**Note:** The system automatically determines complexity and coordinates the appropriate number of agents.

## Common Anti-Patterns

### ❌ Poor Planning
- Vague sprint goals without specific requirements
- Skipping sprint planning for complex work
- Not defining clear success criteria
- Ignoring existing project constraints

### ❌ Workflow Issues
- Trying to manually control agent selection
- Skipping validation before sprint approval
- Not providing enough context in sprint plans
- Rushing through STAD stages

### ❌ Communication Problems
- Unclear or incomplete requirements
- Missing business context in plans
- Not specifying technical constraints
- Ignoring existing code patterns

## Success Patterns

### ✅ Optimal Workflows
- **Plan comprehensively:** Use `/sprint-plan` with detailed requirements
- **Execute systematically:** Trust `/execute` to coordinate agents properly
- **Validate thoroughly:** Use `/validate` before considering work complete
- **Complete properly:** Use `/sprint-approved` for clean sprint closure

### ✅ Efficient Practices
- **Clear communication:** Provide specific, detailed sprint goals
- **Trust automation:** Let the system handle agent coordination
- **Follow STAD stages:** Don't skip validation or retrospective phases
- **Document decisions:** Include context and reasoning in sprint plans

## Quick Reference Commands

### System Status
```bash
/sprint-status          # Current sprint progress
/cmd                    # Initialize session with context
/sync-memory           # Update knowledge graph
```

### Development Workflows
```bash
# Full feature development
/sprint-plan "Feature description with requirements"
/execute  # Coordinates architect, coder, tester, documenter automatically

# Bug fix workflow
# Add to PROJECT_PLAN.md: Bug description
/execute  # Coordinates debug, coder, tester automatically

# Security review
/validate  # Runs security audit automatically

# Performance optimization
/sprint-plan "Performance improvement goals"
/execute  # Coordinates performance, coder, tester automatically
```

## Planning Support Questions

Before planning a sprint, ask:

1. **What's the primary goal?** (Feature, fix, optimization, security)
2. **What's the complexity level?** (Story points, time estimate)
3. **What are the dependencies?** (External APIs, other features)
4. **What are the constraints?** (Performance, security, compliance)
5. **What's the success criteria?** (Acceptance criteria, metrics)
6. **What context exists?** (Related code, design decisions)
7. **What's the timeline?** (Sprint length, milestones)

## System Evolution and Feedback

### Continuous Improvement
- System tracks performance metrics automatically
- Successful patterns are learned and reused
- Context improvements happen transparently
- Agent coordination improves over time

### System Enhancement
The system evolves through:
- Automated learning from sprint outcomes
- Pattern recognition in successful workflows
- Optimization of agent coordination
- Integration of new agent capabilities

---

## Related Documentation

- [STAD Workflow Guide](/docs/getting-started/stad-workflow.md) - Complete STAD Protocol process
- [Agent System Overview](/Agents/README.md) - How agents work behind the scenes
- [Sprint Management Recipes](/recipes/) - Proven sprint patterns
- [Installation Guide](/docs/getting-started/installation.md) - Getting started

---

*Choose wisely, execute efficiently, measure continuously*