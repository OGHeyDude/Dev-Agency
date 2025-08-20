---
title: Development Workflow Guide - STAD Protocol Edition
description: Methodology for planning and executing projects using STAD Protocol 5-stage sprint lifecycle
type: guide
category: workflow
tags: [workflow, planning, sprint, stad-protocol, sprint-lifecycle, status-transitions]
created: 08-03-2025
updated: 2025-08-16
---

# Development Workflow Guide: STAD Protocol Implementation

> This document explains our methodology for planning and executing projects using the STAD Protocol (Stateful & Traceable Agentic Development) 5-stage sprint lifecycle. Our core philosophy is **"Plan everything upfront, execute without intervention"** through comprehensive sprint-level orchestration.

## Related Documentation
- **STAD Workflow**: See `/docs/getting-started/stad-workflow.md` for complete STAD lifecycle details
- **Development Standards**: See `Development Standards Guide.md` for code quality and security requirements
- **Documentation Guide**: See `Documentation Guide.md` for documentation processes
- **All Templates**: Located in `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/`

## Quick Start: Setting Up a New Project

1. Copy `Templates/PROJECT_PLAN_Template.md` to your project root as `PROJECT_PLAN.md`
2. Copy `Templates/CLAUDE_Template.md` to your project root as `CLAUDE.md`
3. Create a `specs/` directory for ticket specifications
4. Copy `Templates/CHANGELOG_Template.md` to your project root as `CHANGELOG.md`

The `CLAUDE.md` file ensures AI assistants follow this workflow automatically.

---

## The Core Principles

1.  **Sprint-Level Orchestration:** Work is organized at the sprint level, not per-ticket, enabling parallel execution and comprehensive planning.
2.  **Comprehensive Upfront Planning:** All design decisions and specifications are completed in Stage 1 before any implementation begins.
3.  **Zero-Intervention Execution:** Stage 2 execution requires no human intervention due to complete specifications.
4.  **Stage Gates for Quality:** Each stage transition requires validation through defined gates.
5.  **Agent Specialization:** Specialized agents handle different aspects of development with proper handoffs.

---

## STAD 5-Stage Sprint Lifecycle

### Stage 0: Strategic Planning
**Purpose:** Define strategic direction, create epics, and establish the product roadmap.

1.  **Capture Epics:** Define high-level epics in PROJECT_PLAN.md that represent major features or initiatives.
2.  **Create Roadmap:** Sequence epics by priority and allocate to future sprints.
3.  **Technical Feasibility:** Use `/agent:architect` to validate technical approach.
4.  **Stage Gate:** ✅ Epics defined ✅ Roadmap prioritized ✅ Technical feasibility validated

### Stage 1: Sprint Preparation
**Purpose:** Create comprehensive specifications for ALL sprint work.

1.  **Select Tickets:** Choose tickets totaling 30-35 points, no single ticket > 5 points.
2.  **Write Complete Specs:** Document ALL design decisions, edge cases, and acceptance criteria.
3.  **Map Dependencies:** Identify execution sequence and parallel opportunities.
4.  **Stage Gate:** ✅ All specs complete ✅ Dependencies mapped ✅ Human approval (`/approve`)

---

### Stage 2: Sprint Execution
**Purpose:** Zero-intervention implementation with parallel agent execution.

1.  **Automated Execution:** Use `/sprint-execute --max-agents 4` for parallel work.
2.  **Follow Specs Exactly:** Agents implement based on Stage 1 specifications only.
3.  **No Design Decisions:** All decisions were made in Stage 1.
4.  **Continuous Integration:** Automated testing and documentation updates.
5.  **Stage Gate:** ✅ Implementation complete ✅ Tests passing ✅ Documentation updated

**Key Agents:**
- `/agent:coder` - Feature implementation
- `/agent:tester` - Test creation
- `/agent:documenter` - Continuous documentation
- Specialists as needed (security, performance, integration)

### Stage 3: Sprint Validation
**Purpose:** Comprehensive quality validation before release.

1.  **Quality Gates:** Run `/validate-stage 3` for automated validation.
2.  **Testing:** Backend QA, integration, performance, security validation.
3.  **Issue Resolution:** Fix any validation failures.
4.  **Stage Gate:** ✅ All validation passed ✅ Human approval (`/approve`)

### Stage 4: Release & Retrospective
**Purpose:** Deploy to production and capture learnings.

1.  **Release:** Merge to main, update CHANGELOG, tag version, deploy.
2.  **Retrospective:** Use `/agent:retrospective` to analyze sprint metrics.
3.  **Knowledge Capture:** Document patterns and update processes.
4.  **Success Metrics:** Velocity, defect rate, cycle time, agent effectiveness.

### Tracking Work: Ticket Status Transitions

We use a strict state machine to ensure a controlled and visible workflow. A ticket can only move between states as defined below.

**Primary Path:**
`TODO` → `IN_PROGRESS` → `CODE_REVIEW` → `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE`


                                                                                 +--------------------+
                                                                                 |                    |
                                                                                 v                    |

+----------+     +-------------+     +-------------+     +------------+     +---------------+     +--------------------+     +--------+
|   TODO   | --> | IN_PROGRESS | --> | CODE_REVIEW | --> | QA_TESTING | --> | DOCUMENTATION | --> | READY_FOR_RELEASE  | --> |  DONE  |
+----------+     +-------------+     +-------------+     +------------+     +---------------+     +--------------------+     +--------+
^               |     ^               |                 |                    |
|               |     +---------------+                 |                    |
|               +---------------------------------------+                    |
|               +------------------------------------------------------------+
|
+----------+
|  BLOCKED |
+----------+
^
|
(Any State)


**Handling Issues:**

* **Blocking:** Any active ticket (e.g., `IN_PROGRESS`, `CODE_REVIEW`) can be moved to `BLOCKED` if its progress is impeded by an external factor. When the issue is resolved:
  * If blocked during active work (`IN_PROGRESS`, `CODE_REVIEW`, `QA_TESTING`), return to the previous state
  * If blocked before significant work began or requires complete re-evaluation, return to `TODO`
* **Failures:** If a ticket fails `CODE_REVIEW`, `QA_TESTING`, or `DOCUMENTATION` review, it moves back to `IN_PROGRESS` for rework. This is part of the normal development cycle, not a blocked state.

---

## Sprint Planning with STAD

Unlike traditional per-ticket workflows, STAD operates at the sprint level with comprehensive upfront planning:

1.  **Sprint Goal:** Define a clear sprint theme (Development, Bug Bash, Refactoring, etc.).
2.  **Ticket Selection:** Choose 30-35 story points of work, ensuring no ticket exceeds 5 points.
3.  **Comprehensive Specs:** Use `/sprint-plan` to generate complete specifications for ALL tickets.
4.  **Parallel Execution:** Use `/sprint-execute` for zero-intervention implementation.
5.  **Stage Gates:** Validate transitions between stages for quality enforcement.

---

## Release Process (Stage 4)

In STAD, releases happen at the end of Stage 4 after validation:

1.  **Sprint Validation:** Ensure all Stage 3 quality gates passed.
2.  **Create Release Version:** Update `CHANGELOG.md` with sprint deliverables.
3.  **Deploy:** Execute deployment after human approval.
4.  **Retrospective:** Run `/agent:retrospective` to capture learnings.
5.  **Update Status:** Move all sprint tickets to `DONE`.
6.  **Process Improvements:** Update templates and processes based on retrospective.

This ensures comprehensive validation before release and continuous improvement through retrospectives.
