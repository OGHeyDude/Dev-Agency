---
title: STAD Protocol Quick-Start Guide
description: Get up and running with STAD Protocol in 5 minutes
type: guide
category: onboarding
tags: [stad, quickstart, onboarding, tutorial]
created: 2025-08-17
updated: 2025-08-17
version: 1.0
---

# STAD Protocol Quick-Start Guide

**Welcome to STAD Protocol!** This guide will get you productive with the Stateful & Traceable Agentic Development framework in just 5 minutes.

---

## 🎯 What is STAD Protocol?

STAD is a **5-stage sprint lifecycle** that enables autonomous AI-driven development:

| Stage | Name | Purpose | Who Leads |
|-------|------|---------|-----------|
| **0** | Strategic Planning | Define epics & roadmap | Human + Architect |
| **1** | Sprint Preparation | Create comprehensive specs | Architect Agent |
| **2** | Sprint Execution | Autonomous development | Coder & Tester Agents |
| **3** | Sprint Validation | QA and review | Backend QA Agent |
| **4** | Release & Retrospective | Deploy and learn | Retrospective Agent |

**Key Difference:** STAD replaces the old 7-stage per-ticket workflow with a modern sprint-level approach.

---

## 🚀 Your First STAD Sprint

### Step 1: Create an Epic (Stage 0)
```bash
# Start with strategic planning
/stad:epic

# Provide:
# - Business goal
# - Success criteria
# - Rough estimate (13, 21, 34+ points)
```

### Step 2: Prepare the Sprint (Stage 1)
```bash
# Convert epic to technical specs
/stad:prep [EPIC-ID]

# Architect agent will:
# - Create technical specifications
# - Break down into ≤5 point tickets
# - Map dependencies (DAG)
# - Document edge cases
```

### Step 3: Execute Autonomously (Stage 2)
```bash
# Launch zero-intervention execution
/stad:execute

# Agents will:
# - Work through tickets in parallel
# - Make decisions based on Stage 1 specs
# - Create handoffs between agents
# - Commit with semantic messages
```

### Step 4: Validate Quality (Stage 3)
```bash
# Run comprehensive validation
/stad:validate

# Backend QA will:
# - Run all tests
# - Check performance
# - Validate security
# - Generate review dashboard
```

### Step 5: Release & Learn (Stage 4)
```bash
# Complete the sprint
/stad:release

# System will:
# - Merge to main
# - Deploy (if configured)
# - Generate retrospective
# - Update knowledge graph
```

---

## 📋 Essential Commands

### Core Workflow
```bash
/stad:epic          # Create new epic (Stage 0)
/stad:prep          # Prepare sprint (Stage 1)
/stad:execute       # Run sprint (Stage 2)
/stad:validate      # QA sprint (Stage 3)
/stad:release       # Release sprint (Stage 4)
```

### Monitoring & Control
```bash
/stad:health        # Check sprint health
/stad:standup       # Daily progress report
/stad:gate          # Validate stage gate
/stad:pause         # Pause execution
/stad:override      # Human intervention
```

### Information
```bash
/stad:status        # Current stage and progress
/stad:handoff       # View handoff documents
/stad:metrics       # Performance metrics
```

---

## 🤖 Key Agents

### Stage Leaders
- **Architect** (Stage 1): Creates comprehensive specs
- **Coder** (Stage 2): Implements features
- **Backend QA** (Stage 3): Validates quality
- **Retrospective** (Stage 4): Analyzes and learns

### Supporting Cast
- **Scrum Master**: Enforces protocol compliance
- **Tester**: Creates and runs tests
- **Debug**: Fixes issues with root cause analysis
- **Documenter**: Maintains documentation
- **Memory-Sync**: Updates knowledge graph

---

## 📁 Where Things Live

```
/Project_Management/
├── PROJECT_PLAN.md         # Sprint backlog
├── /Specs/                 # Technical specifications
├── /Agent_Handoffs/        # Inter-agent communication
├── /Stage_Gates/           # Validation checkpoints
├── /Work_Reports/          # Agent completion reports
└── /Retrospectives/        # Sprint learnings
```

---

## ⚡ Quick Tips

### 1. **Front-load Decisions**
Make all architectural decisions in Stage 1. Stage 2 should run without any human input.

### 2. **Trust the Gates**
Stage gates ensure quality. Don't skip them.

### 3. **Use Handoffs**
Agents communicate through handoff documents. Check them if issues arise.

### 4. **Leverage Knowledge Graph**
The system learns from each sprint. Past solutions inform future ones.

### 5. **Batch Similar Work**
Group related tickets in sprints for better context and efficiency.

---

## 🚨 Common Pitfalls

### ❌ DON'T
- Mix STAD with the old 7-stage workflow
- Skip Stage 1 comprehensive planning
- Intervene during Stage 2 execution
- Bypass stage gates
- Create tickets >5 story points

### ✅ DO
- Complete all specs before execution
- Let Stage 2 run autonomously
- Use semantic commit messages
- Document edge cases upfront
- Trust the retrospective insights

---

## 🎓 Next Steps

1. **Read the Full Guide**: `/docs/architecture/STAD_PROTOCOL_NORTH_STAR.md`
2. **Review Agent Playbook**: `/docs/architecture/STAD_Agent_Playbook.md`
3. **Try a Test Sprint**: Start with a small epic (13 points)
4. **Join the Community**: Share learnings and get help

---

## 🆘 Need Help?

- **Command Help**: `/help stad`
- **View Examples**: `/examples stad-sprint`
- **Check Status**: `/stad:health`
- **Human Override**: `/stad:override`

---

**Remember:** STAD is about autonomous execution with human oversight. Plan thoroughly in Stage 1, then let the agents work their magic in Stage 2!

---

*Welcome to the future of AI-driven development. Happy sprinting!* 🚀