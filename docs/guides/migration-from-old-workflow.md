---
title: Migration Guide - From Old Workflow to STAD Protocol
description: Guide for users transitioning from the old 5-step per-ticket workflow to STAD 5-stage sprint lifecycle
type: guide
category: migration
tags: [migration, stad-protocol, workflow-transition, training]
created: 2025-08-16
updated: 2025-08-16
version: 1.0
---

# Migration Guide: From Old Workflow to STAD Protocol

This guide helps developers transition from the old per-ticket 5-step workflow to the new STAD Protocol 5-stage sprint lifecycle.

## 🔄 Key Paradigm Shifts

### Old Way: Per-Ticket Focus
- Work on one ticket at a time
- Design decisions made during coding
- Sequential execution
- Individual task optimization

### New Way: Sprint-Level Orchestration
- Plan entire sprints upfront
- All design decisions in Stage 1
- Parallel execution with agents
- Sprint-level optimization

## 📊 Workflow Comparison

### Old 5-Step Process (Per Ticket)
```
research → plan → build → test → document
```
- **Scope:** Single ticket
- **Planning:** Minimal, just-in-time
- **Execution:** Sequential, one developer
- **Design:** During implementation
- **Documentation:** After implementation

### New STAD 5-Stage Lifecycle (Per Sprint)
```
Stage 0 → Stage 1 → Stage 2 → Stage 3 → Stage 4
Strategic  Sprint    Sprint    Sprint    Release &
Planning   Prep      Execute   Validate  Retro
```
- **Scope:** Entire sprint (30-35 points)
- **Planning:** Comprehensive upfront
- **Execution:** Parallel, multiple agents
- **Design:** All decisions in Stage 1
- **Documentation:** Continuous throughout

## 🎯 Command Migration

### Individual Commands

| Old Command | New Command | Context |
|-------------|-------------|---------|
| `/research` | Part of Stage 1 | Research happens during sprint planning |
| `/plan` | `/sprint-plan` | Plan entire sprint, not single ticket |
| `/build` | `/sprint-execute` | Execute whole sprint with agents |
| `/test` | `/validate-stage 3` | Sprint-level validation |
| `/document` | Continuous | Documentation updates throughout |
| `/reflect` | `/agent:retrospective` | Sprint-level retrospective |
| `/done` | Stage gate completion | Automatic with stage transitions |

### New Commands You'll Use

```bash
# Sprint Planning (Stage 1)
/sprint-plan              # Comprehensive sprint planning
/agent:architect          # System design for all tickets

# Sprint Execution (Stage 2)
/sprint-execute           # Zero-intervention execution
/sprint-execute --max-agents 4  # Parallel execution

# Validation (Stage 3)
/validate-stage 3         # Quality gates validation
/approve                  # Human approval checkpoint

# Sprint Management
/sprint-status           # Check progress
/agent-status           # Monitor agent performance
```

## 📋 Process Changes

### Planning Changes

#### Old Way
1. Pick a ticket
2. Quick research
3. Start coding
4. Figure out details as you go

#### New Way (STAD)
1. Select 30-35 points of tickets
2. Write comprehensive specs for ALL tickets
3. Make ALL design decisions upfront
4. Map dependencies and execution order
5. Get approval before ANY coding

### Execution Changes

#### Old Way
```bash
# Work on TICKET-123
/research
/plan
/build  # You write the code
/test   # You write tests
/document
```

#### New Way (STAD)
```bash
# Stage 1: Plan everything
/sprint-plan  # Write all specs

# Stage 2: Execute everything
/sprint-execute --max-agents 4
# Agents handle implementation in parallel
# No human intervention needed
```

### Quality Changes

#### Old Way
- Test after building
- Fix issues as found
- Documentation as afterthought

#### New Way (STAD)
- Stage gates enforce quality
- Validation before release
- Documentation continuous
- Retrospectives capture learnings

## 🚀 Your First STAD Sprint

### Step 1: Understand Your New Workflow
Instead of:
```
Pick ticket → Code → Test → Ship
```

You now do:
```
Plan sprint → Spec everything → Agents execute → Validate → Ship sprint
```

### Step 2: Monday Morning Sprint Planning
```bash
# Initialize
/cmd

# Review backlog
cat Project_Management/PROJECT_PLAN.md

# Plan sprint with comprehensive specs
/sprint-plan
# This replaces your old /research and /plan steps
```

### Step 3: Tuesday-Thursday Execution
```bash
# Start parallel execution
/sprint-execute --max-agents 4
# This replaces your old /build, /test, /document steps

# Monitor progress
/sprint-status
/agent-status
```

### Step 4: Friday Validation & Release
```bash
# Validate quality
/validate-stage 3

# Get approval
/approve

# Retrospective
/agent:retrospective
```

## ⚠️ Common Pitfalls When Migrating

### Pitfall 1: Starting Coding Too Early
❌ **Old Habit:** Jump into coding after minimal planning
✅ **New Way:** Complete ALL specs before ANY coding

### Pitfall 2: Making Design Decisions During Coding
❌ **Old Habit:** Figure out implementation details while coding
✅ **New Way:** Document ALL decisions in Stage 1 specs

### Pitfall 3: Working on Single Tickets
❌ **Old Habit:** Complete one ticket fully before starting next
✅ **New Way:** Batch tickets for parallel execution

### Pitfall 4: Skipping Stage Gates
❌ **Old Habit:** Move fast, fix later
✅ **New Way:** Respect stage gates for quality

### Pitfall 5: Forgetting Agent Handoffs
❌ **Old Habit:** One person does everything
✅ **New Way:** Proper handoffs between specialized agents

## 📊 Benefits You'll Experience

### Immediate Benefits (Week 1)
- Less context switching
- Clearer requirements
- Parallel progress on multiple tickets

### Short-term Benefits (Sprint 1-3)
- Higher quality from upfront planning
- Faster execution with agents
- Better documentation

### Long-term Benefits (Month 1+)
- Predictable velocity
- Reduced defects
- Improved team learning through retrospectives

## 🎓 Training Exercises

### Exercise 1: Convert a Ticket to STAD
Take an old ticket you've completed:
1. Write a comprehensive spec as if for Stage 1
2. Identify what decisions you made during coding
3. Move those decisions to the spec
4. Consider how agents would implement it

### Exercise 2: Practice Sprint Planning
1. Select 5-8 tickets (30-35 points total)
2. Write specs for all of them
3. Create a dependency graph
4. Plan parallel execution batches

### Exercise 3: Simulate Stage Gates
1. Review your last completed work
2. Apply Stage 3 validation criteria
3. Identify what would have failed
4. Consider how specs could prevent those issues

## 🔧 Gradual Migration Strategy

### Week 1: Learn the Concepts
- Read STAD documentation
- Understand 5-stage lifecycle
- Practice with `/sprint-plan` command

### Week 2: Hybrid Approach
- Use STAD planning (Stage 1)
- Manual execution (modified Stage 2)
- STAD validation (Stage 3)

### Week 3: Add Agents
- Continue STAD planning
- Try `/agent:coder` for implementation
- Use `/agent:tester` for tests

### Week 4: Full STAD
- Complete STAD workflow
- Use `/sprint-execute` for automation
- Run retrospectives

## 💡 Tips for Success

### DO:
✅ Invest time in Stage 1 planning - it pays off
✅ Trust the process - don't skip stages
✅ Use specialized agents for their strengths
✅ Document learnings in retrospectives
✅ Batch work for efficiency

### DON'T:
❌ Rush through planning to start coding
❌ Make design decisions in Stage 2
❌ Work on tickets individually
❌ Skip validation stages
❌ Ignore agent handoff requirements

## 🆘 Getting Help

### When Stuck on Planning
```bash
/agent:architect "Help plan sprint with these tickets: [list]"
```

### When Execution Fails
```bash
# Check what stage you're in
/sprint-status

# Validate stage requirements
/validate-stage [current-stage]
```

### When Confused
1. Review [STAD Workflow Guide](/docs/getting-started/stad-workflow.md)
2. Check [STAD User Guide](/docs/USER_GUIDE.md)
3. Look at sprint examples in documentation

## 📈 Measuring Your Migration Success

Track these metrics as you migrate:

| Metric | Old Way | STAD Target | Your Progress |
|--------|---------|-------------|---------------|
| Planning Time | 10% | 30% | ___ |
| Execution Time | 70% | 50% | ___ |
| Rework Time | 20% | 10% | ___ |
| Defect Rate | Baseline | -50% | ___ |
| Velocity | Baseline | +30% | ___ |

## 🎯 Quick Reference Card

### Daily STAD Commands
```bash
# Monday: Planning
/sprint-plan

# Tuesday-Thursday: Execution  
/sprint-execute --max-agents 4
/sprint-status

# Friday: Validation
/validate-stage 3
/approve
/agent:retrospective
```

### Status Transitions
```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → 
QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE
```

### Stage Gates
- Stage 0→1: Epics defined, roadmap ready
- Stage 1→2: All specs complete, human approval
- Stage 2→3: Implementation done, tests passing
- Stage 3→4: Validation passed, human approval

## 🎉 Welcome to STAD!

You're transitioning from a good workflow to a great one. The STAD Protocol will help you:
- Plan better
- Execute faster
- Deliver higher quality
- Learn continuously

Remember: The first sprint might feel different, but by Sprint 3, you'll wonder how you ever worked without STAD!

---

*For more details, see the complete [STAD Workflow Guide](/docs/getting-started/stad-workflow.md)*