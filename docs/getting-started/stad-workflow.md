---
title: STAD Protocol Workflow Guide
description: Complete guide to the STAD 5-stage sprint lifecycle for agentic development
type: guide
category: workflow
tags: [stad, workflow, stages, sprint-lifecycle, agents]
created: 2025-08-16
updated: 2025-08-16
version: 1.0
---

# STAD Protocol Workflow Guide

This guide explains the STAD Protocol (Stateful & Traceable Agentic Development) 5-stage sprint lifecycle used across all Dev-Agency projects. STAD transforms development from per-ticket tasks to sprint-level orchestration with comprehensive planning and zero-intervention execution.

## 🎯 Core Philosophy

**"Plan everything upfront, execute without intervention"**

STAD Protocol prioritizes:
- **Sprint-level thinking** over individual ticket focus
- **Comprehensive planning** before any execution
- **Stage gates** for quality enforcement
- **Agent handoffs** for specialized expertise
- **Zero-intervention execution** through complete specs

## 📋 The STAD 5-Stage Sprint Lifecycle

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Stage 0    │ -> │   Stage 1    │ -> │   Stage 2    │ -> │   Stage 3    │ -> │   Stage 4    │
│  Strategic   │    │    Sprint    │    │    Sprint    │    │    Sprint    │    │  Release &   │
│   Planning   │    │ Preparation  │    │  Execution   │    │ Validation   │    │Retrospective │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
     Epics              Specs            Zero-Int          QA Gates          Learn
```

### Ticket Status Flow (Within Stages)
```
BACKLOG -> TODO -> IN_PROGRESS -> CODE_REVIEW -> QA_TESTING -> DOCUMENTATION -> READY_FOR_RELEASE -> DONE
```

## Stage 0: Strategic Planning

### Purpose
Define the strategic direction, create epics, and establish the product roadmap.

### Process
1. **Business Strategy**
   - Define product vision
   - Identify user needs
   - Set success metrics

2. **Epic Creation**
   - Break vision into epics
   - Estimate epic complexity
   - Define epic dependencies

3. **Roadmap Development**
   - Sequence epics by priority
   - Allocate to future sprints
   - Identify technical risks

### Key Agents
- **Human/Claude** - Strategic decisions
- **Architect agents** - Technical feasibility (automatic)

### Outputs
- Epic definitions in PROJECT_PLAN.md
- Product roadmap
- Risk assessment

### Stage Gate to Stage 1
✅ Epics defined with clear scope  
✅ Roadmap prioritized  
✅ Technical feasibility validated  

### Commands
```bash
/cmd                    # Initialize and review PROJECT_PLAN.md
# Note: Technical feasibility assessed automatically during sprint planning
```

## Stage 1: Sprint Preparation

### Purpose
Create comprehensive specifications for ALL sprint work, enabling zero-intervention execution.

### Process
1. **Sprint Planning**
   ```bash
   /sprint-plan            # Automated sprint planning
   ```

2. **Ticket Selection**
   - Select tickets totaling 30-35 points
   - Ensure no ticket exceeds 5 points
   - Balance risk and complexity

3. **Comprehensive Spec Writing**
   - Write detailed specs for EVERY ticket
   - Document ALL design decisions
   - Plan for edge cases
   - Define acceptance criteria

4. **Dependency Mapping**
   - Identify ticket dependencies
   - Plan execution sequence
   - Map parallel opportunities

### Key Agents
- **Architect agents** - System design and specs (automatic)
- **`/agent:scrum_master`** - Sprint coordination
- **`/agent:documenter`** - Spec documentation

### Outputs
- Complete specs for all tickets
- Dependency graph
- Execution plan
- Agent assignments

### Stage Gate to Stage 2
✅ ALL tickets have complete specs  
✅ No ticket exceeds 5 story points  
✅ All design decisions documented  
✅ Dependencies mapped  
✅ Human approval obtained (`/approve`)  

### Example Spec
```markdown
## TICKET-123: Add User Authentication

### Acceptance Criteria
1. Users can register with email/password
2. JWT tokens expire after 24 hours
3. Password reset via email

### Technical Decisions
- Use bcrypt for password hashing (rounds: 10)
- Store sessions in Redis
- Email via SendGrid API

### Edge Cases
- Duplicate email: Return specific error
- Invalid token: Force re-login
- Rate limiting: 5 attempts per minute
```

## Stage 2: Sprint Execution

### Purpose
Zero-intervention implementation with parallel agent execution based on comprehensive specs.

### Process
1. **Automated Execution**
   ```bash
   /sprint-execute --max-agents 4
   ```

2. **Parallel Implementation**
   - Multiple agents work simultaneously
   - Each follows their spec exactly
   - No design decisions during execution
   - Automatic handoffs between agents

3. **Continuous Integration**
   - Automated testing on each commit
   - Continuous documentation updates
   - Real-time progress tracking

### Key Agents
- **`/agent:coder`** - Feature implementation (PRIMARY)
- **`/agent:tester`** - Test creation (PRIMARY)
- **`/agent:documenter`** - Continuous documentation
- **`/agent:debug`** - Issue resolution (On-demand)
- **Specialists** as needed:
  - `/agent:security` - Security features
  - `/agent:performance` - Optimization
  - `/agent:integration` - Service connections
  - `/agent:mcp-dev` - MCP implementations

### Agent Handoffs
```
Architect → Coder → Tester → Documenter
    ↓         ↓        ↓          ↓
[Handoff] [Handoff] [Handoff] [Work Report]
```

### Outputs
- Implemented features
- Test coverage
- Updated documentation
- Work reports from each agent

### Stage Gate to Stage 3
✅ All implementation complete  
✅ Frontend tests written and passing (components, integration)
✅ Backend tests written and passing (API, database)
✅ Coverage >85% for both stacks
✅ Documentation updated  
✅ Work reports filed  
✅ No IN_PROGRESS tickets  

## Stage 3: Sprint Validation

### Purpose
Comprehensive quality validation and testing before release.

### Process
1. **Automated Validation**
   ```bash
   /validate-stage 3
   ```

2. **Quality Gates**
   - Automated test validation (frontend + backend)
   - Integration testing
   - Performance testing
   - Security review
   - Human UI/UX review preparation

3. **Issue Resolution**
   - Fix any validation failures
   - Update tests as needed
   - Document known issues

### Key Agents
- **`/agent:qa-validator`** - Validates all automated tests (PRIMARY)
- **`/agent:security`** - Security validation
- **`/agent:performance`** - Performance validation
- **Human** - UI/UX visual review

### Validation Criteria
- ✅ Frontend tests validated (>85% coverage)
- ✅ Backend tests validated (>85% coverage)
- ✅ All acceptance criteria met
- ✅ No critical bugs
- ✅ Performance benchmarks met
- ✅ Security scan passed
- ✅ Human UI/UX review complete

### Stage Gate to Stage 4
✅ All validation passed  
✅ Human approval (`/approve`)  
✅ No BLOCKED tickets  
✅ Release notes prepared  

## Stage 4: Release & Retrospective

### Purpose
Deploy to production and capture learnings for continuous improvement.

### Process
1. **Release Preparation**
   - Merge to main branch
   - Update CHANGELOG.md
   - Tag release version
   - Deploy to production

2. **Sprint Retrospective**
   ```bash
   /agent:retrospective
   ```
   - Aggregate all work reports
   - Analyze sprint metrics
   - Identify improvements
   - Update templates/processes

3. **Knowledge Capture**
   - Document patterns
   - Update best practices
   - Record technical decisions
   - Share learnings

### Key Agents
- **`/agent:retrospective`** - Sprint analysis (PRIMARY)
- **`/agent:documenter`** - Release documentation

### Outputs
- Production deployment
- Sprint retrospective report
- Updated CHANGELOG
- Process improvements

### Success Metrics
- Sprint velocity
- Defect rate
- Cycle time
- Agent effectiveness

## 🔄 Complete Sprint Example

### Sprint 8: Authentication System
```markdown
## Stage 0: Strategic Planning
- Epic: User Authentication & Authorization
- Estimated: 50 points across 2 sprints

## Stage 1: Sprint Preparation (Day 1)
/sprint-plan "Sprint 8: User Authentication"
- Selected: 32 points (6 tickets)
- Specs written: 100% complete
- Dependencies: Login → Session → Permissions

## Stage 2: Sprint Execution (Days 2-8)
/execute
- Autonomous execution with multiple agents
- Tickets completed: 6/6
- Tests written: 95% coverage

## Stage 3: Sprint Validation (Day 9)
/validate
- Backend QA: ✅ Passed
- Security: ✅ No vulnerabilities
- Performance: ✅ <100ms response

## Stage 4: Release & Retrospective (Day 10)
/sprint-approved
- Deployed: v2.1.0
- Velocity: 32 points (target met)
- Improvements: Better spec templates identified
```

## 🎯 Key Differences from Old Workflow

### Old 5-Step Process (Per Ticket)
```
research → plan → build → test → document
```
- Focus: Individual tickets
- Planning: Minimal upfront
- Execution: Sequential
- Decisions: During coding

### New STAD 5-Stage (Per Sprint)
```
Stage 0 → Stage 1 → Stage 2 → Stage 3 → Stage 4
```
- Focus: Entire sprints
- Planning: Comprehensive upfront
- Execution: Parallel, zero-intervention
- Decisions: All in Stage 1

## ⚠️ Common Patterns

### Standard Sprint Pattern
```
Stage 0: Quarterly planning
Stage 1: Monday (sprint planning)
Stage 2: Tuesday-Thursday (execution)
Stage 3: Friday morning (validation)
Stage 4: Friday afternoon (retrospective)
```

### Bug Bash Pattern
```
Stage 1: Collect and spec all bugs
Stage 2: Parallel fix with multiple agents
Stage 3: Comprehensive regression testing
Stage 4: Patch release
```

### Feature Development Pattern
```
Stage 1: Detailed feature specs with UI/UX
Stage 2: Frontend + Backend parallel development
Stage 3: Integration and user testing
Stage 4: Feature release
```

## ✅ Best Practices

### DO
- **Complete ALL specs in Stage 1** - No coding without specs
- **Respect stage gates** - Don't skip validation
- **Use appropriate agents** - Match expertise to task
- **File work reports** - Document agent outputs
- **Plan for parallelization** - Identify independent work
- **Update PROJECT_PLAN.md** - Keep status current

### DON'T
- **Make design decisions in Stage 2** - All decisions in Stage 1
- **Skip comprehensive planning** - Invest time upfront
- **Exceed 5 points per ticket** - Break down large work
- **Ignore stage gates** - Quality enforcement critical
- **Forget handoffs** - Document context transfer
- **Rush validation** - Quality over speed

## 🚨 Stage Gate Enforcement

### Automated Validation
```bash
# Check stage gate criteria
./scripts/validation/validate_stage_gate.sh 1 2

# Enforce human approval
/approve  # Required for Stage 3→4 transition
```

### Manual Override (Emergency Only)
```bash
/stage-gate override --reason "Production hotfix" --from 1 --to 2
```

## 📊 Success Metrics

### Sprint Level
- **Velocity**: Story points completed
- **Predictability**: Planned vs actual
- **Quality**: Defect escape rate
- **Efficiency**: Cycle time

### Stage Level
- **Stage 1**: Spec completeness (100% target)
- **Stage 2**: Execution without intervention
- **Stage 3**: First-pass validation rate
- **Stage 4**: Actionable improvements

## 🔧 Commands Reference

### STAD Sprint Commands (9 Commands Only)
```bash
# STAD Sprint Commands
/sprint-plan <additional instructions>  # Stage 1: Sprint Planning
/execute                                # Stage 2: Sprint Execution  
/validate                               # Stage 3: Sprint Validation
/sprint-approved                        # Stage 4: Release & Retrospective

# Utility Commands
/cmd                                    # Initialize Session
/standards <Subject>                    # Read Standards
/sync-memory                            # Knowledge Graph Sync
/sprint-status                          # Progress Report
```

**Note**: The system automatically coordinates appropriate agents for each stage.

## 📚 Additional Resources

- [STAD Protocol North Star](../architecture/STAD_PROTOCOL_NORTH_STAR.md) - Vision document
- [STAD Agent Registry](../architecture/STAD_Agent_Registry.md) - Agent stage mapping
- [Sprint Management](./sprint-management.md) - Detailed sprint guide
- [Stage Gates](../guides/stage-gates.md) - Gate criteria details
- [Agent Handoffs](../guides/agent-handoffs.md) - Handoff templates

---

*This workflow guide is part of the STAD Protocol implementation in Dev-Agency. For updates, see `/home/hd/Desktop/LAB/Dev-Agency/docs/`*