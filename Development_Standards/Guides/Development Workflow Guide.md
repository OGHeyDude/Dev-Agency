---
title: Development Workflow Guide
description: Methodology for planning and executing projects with clear phases and status transitions
type: guide
category: workflow
tags: [workflow, planning, sprint, development-cycle, status-transitions]
created: 08-03-2025
updated: 08-03-2025
---

# Our Development Workflow: A Guide

> This document explains our methodology for planning and executing projects. Our core philosophy is to separate **"what"** we build from **"when"** we build it. This creates focus, clarity, and adaptability.\n\n## Related Documentation\n- **Development Standards**: See `Development Standards Guide.md` for code quality and security requirements\n- **Documentation Guide**: See `Documentation Guide.md` for documentation processes\n- **All Templates**: Located in `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/`

## Quick Start: Setting Up a New Project

1. Copy `Templates/PROJECT_PLAN_Template.md` to your project root as `PROJECT_PLAN.md`
2. Copy `Templates/CLAUDE_Template.md` to your project root as `CLAUDE.md`
3. Create a `specs/` directory for ticket specifications
4. Copy `Templates/CHANGELOG_Template.md` to your project root as `CHANGELOG.md`

The `CLAUDE.md` file ensures AI assistants follow this workflow automatically.

---

## The Core Principles

1.  **Centralized Planning:** Every project has a single `Project Plan` document that acts as the source of truth for its vision, roadmap, and backlog.
2.  **Structured Freedom:** We follow a clear process for how work moves from an idea to a finished product, but allow for flexibility within each step.
3.  **Clarity Through Definition:** A task is not ready to be worked on until it is clearly defined and understood.

---

## Phase 1: Scope Planning (Defining the "What")

This is the continuous process of building a well-defined and prioritized backlog of tasks.

1.  **Capture Ideas:** When a new idea for a feature, task, or bug emerges, add it to the **Backlog** table in the project's `Project Plan` document. Assign it the status `BACKLOG`. At this stage, a descriptive title is all that's needed.

2.  **Define and Plan:** Before a task can be worked on, it must be fleshed out. This involves writing a spec document that outlines the requirements, goals, and acceptance criteria.

3.  **Estimate and Ready:** Estimate the task's complexity using **Story Points** (1, 2, 3, 5, 8, 13). Once a ticket is fully specified and estimated, update its status to `TODO`. It is now officially in the pool of work ready to be selected for a sprint.

---

## Phase 2: The Development Cycle (Executing the "When")

This phase covers how an individual task moves from the ready state (`TODO`) to completion (`DONE`).

### Individual Task Workflow

Every ticket that enters development should follow this five-step process to ensure quality and maintainability.

1.  **Research:** Look for supporting documentation, existing code, and internal or external examples. Gather anything that can improve development success, efficiency, and alignment with the existing codebase.
2.  **Plan:** Define the specific goals of the task. Create a technical plan outlining the implementation steps, potential challenges, and necessary components.
3.  **Build:** Implement the plan. Write clean, efficient, and well-structured code.
4.  **Test:** Validate your work with comprehensive testing. This includes unit tests, integration tests, and manual validation to ensure the code works as expected and doesn't introduce regressions.
5.  **Document:** Update any relevant documentation. This could include code comments, API specifications, or user-facing guides. Good documentation is essential for future maintenance and collaboration.

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

## Phase 3: Sprint Planning

While individual tasks follow the cycle above, we organize our work into **Sprints** (typically 1-2 weeks) to tackle larger goals.

1.  **Define Sprint Goal:** At the start of a sprint, set a single, clear objective.
2.  **Select Tickets:** Pull high-priority tickets from the `TODO` list that align with the sprint goal and move them into the `Current Sprint` section of the `Project Plan`.
3.  **Execute:** Begin work on the selected tickets, following the development cycle and status transition rules defined above.

---

## Phase 4: Release & Changelog Integration

When you have a group of tickets in `READY_FOR_RELEASE` state, follow this process:

1.  **Create Release Version:** In your `CHANGELOG.md`, add a new version header (e.g., `## [v1.2.0] - YYYY-MM-DD`)
2.  **Document Changes:** List the completed features and fixes from the `READY_FOR_RELEASE` tickets under the new version
3.  **Deploy:** Execute your deployment process
4.  **Update Status:** Once successfully deployed, move all released tickets from `READY_FOR_RELEASE` to `DONE`

This ensures your changelog accurately reflects what was included in each release.
