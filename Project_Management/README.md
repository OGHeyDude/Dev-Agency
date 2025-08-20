---
title: Project Management Documentation
description: Central hub for STAD Protocol project management artifacts
type: guide
category: management
tags: [project-management, stad, organization, tracking]
created: 2025-08-15
updated: 2025-08-15
version: 2.0
---

# Project Management Directory Structure

This directory contains all project management artifacts for the STAD Protocol implementation. It serves as the central hub for tracking sprints, managing handoffs, and maintaining project state.

## 📁 Directory Organization

### Core Planning
- **`PROJECT_PLAN.md`** - Central source of truth for all tickets and epics
- **`/Specs/`** - Technical specifications for each ticket (one per ticket)
- **`/Sprint_Plans/`** - Execution plans with dependency graphs

### STAD Protocol Structures

#### `/Agent_Handoffs/`
Contains documented context transfers between agents.
- **Structure**: `/Sprint_[N]/[from]-to-[to].md`
- **Purpose**: Ensure complete context transfer between agents
- **Template**: `/docs/reference/templates/agent_handoff_template.md`

#### `/Work_Reports/`
Contains agent work reports for audit trail.
- **Structure**: `/Sprint_[N]/[agent]_[ticket].md`
- **Purpose**: Document work completed, decisions made, issues encountered
- **Template**: `/docs/reference/templates/work_report_template.md`

#### `/Decision_Requests/`
Contains escalated design decisions that block progress.
- **Naming**: `[TICKET]_decision.md`
- **Purpose**: Get human decisions for ambiguous requirements
- **Template**: `/docs/reference/templates/decision_request_template.md`

#### `/Stage_Gates/`
Contains validation criteria for stage transitions.
- **Files**: 
  - `stage_0_to_1_gate.md` - Strategic Planning → Sprint Preparation
  - `stage_1_to_2_gate.md` - Sprint Preparation → Sprint Execution
  - `stage_2_to_3_gate.md` - Sprint Execution → Sprint Validation
  - `stage_3_to_4_gate.md` - Sprint Validation → Release & Retrospective

#### `/Validation_Reports/`
Contains comprehensive validation results from Stage 3.
- **Naming**: `Sprint_[N]_validation.md`
- **Purpose**: Document QA results and approval status

### Sprint Artifacts

#### `/Sprint Retrospectives/`
- **Naming**: `Sprint_[N]_Retrospective.md`
- **Purpose**: Capture learnings and improvements
- **Template**: `/docs/reference/templates/Sprint Retrospective Template.md`

#### `/Releases/`
- **`CHANGELOG.md`** - Version history and release notes
- **`Release_Notes.md`** - Current release documentation

#### `/Bug_Reports/`
- **Purpose**: Track bugs found during validation
- **Template**: `/docs/reference/templates/Persistent Bug Report.md`

### Migration & Special Projects

#### `/STAD_Migration/`
Contains STAD Protocol migration tracking:
- `migration_status.md` - Daily progress updates
- `7stage_to_stad_mapping.md` - Transition guide
- Migration artifacts and documentation

#### `/Handoff/`
Legacy handoff reports (being migrated to `/Agent_Handoffs/`)

### Utility Directories

#### `/Archive/`
- **Purpose**: Store obsolete files (never delete, always archive)
- **Format**: Include `[SUBJECT]_archive_reason_[DATE].md`

#### `/temp/`
- **Purpose**: Temporary working files
- **Cleanup**: Regular cleanup after sprint completion

## 📋 File Naming Conventions

### Tickets and Specs
- Specs: `STAD-XXX_spec.md` or `[PROJECT]-XXX_spec.md`
- Always use uppercase for ticket prefixes
- Sequential numbering with leading zeros if needed

### Sprint-Based Files
- Always include sprint number: `Sprint_[N]_[description].md`
- Use underscores for spaces in filenames
- Date format: `YYYY-MM-DD` when needed

### Agent Artifacts
- Handoffs: `[sprint]-[from_agent]-to-[to_agent].md`
- Work Reports: `[agent]_[ticket].md`
- Use lowercase for agent names

## 🔄 Workflow Integration

### Stage 1: Sprint Preparation
1. Create specs in `/Specs/`
2. Create execution plan in `/Sprint_Plans/`
3. Setup sprint directories in `/Agent_Handoffs/` and `/Work_Reports/`

### Stage 2: Sprint Execution
1. Agents create handoffs in `/Agent_Handoffs/Sprint_[N]/`
2. Agents file work reports in `/Work_Reports/Sprint_[N]/`
3. Blockers create decision requests in `/Decision_Requests/`

### Stage 3: Sprint Validation
1. Backend QA creates validation report in `/Validation_Reports/`
2. Bugs documented in `/Bug_Reports/`
3. Stage gate validation against `/Stage_Gates/` criteria

### Stage 4: Release & Retrospective
1. Update `/Releases/CHANGELOG.md`
2. Create retrospective in `/Sprint Retrospectives/`
3. Archive sprint artifacts if needed

## 📊 Status Tracking

### Ticket Status Flow
```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → 
QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE
```

### Blocked Status
- Can occur from any active state
- Requires `/Decision_Requests/` entry
- Returns to previous state when unblocked

## 🎯 Best Practices

### Documentation Standards
1. **Always use frontmatter** in markdown files
2. **Update dates** using `date +"%Y-%m-%d"` command
3. **Link related documents** for traceability
4. **Use templates** for consistency

### File Management
1. **Never delete** - always archive with reason
2. **Create sprint directories** at sprint start
3. **Clean `/temp/`** after sprint completion
4. **Update `PROJECT_PLAN.md`** in real-time

### Communication
1. **Document all handoffs** between agents
2. **File work reports** immediately after completion
3. **Escalate blockers** quickly via decision requests
4. **Validate gates** before stage transitions

## 🔗 Quick Links

### Templates
- [Agent Handoff Template](../docs/reference/templates/agent_handoff_template.md)
- [Work Report Template](../docs/reference/templates/work_report_template.md)
- [Decision Request Template](../docs/reference/templates/decision_request_template.md)
- [Spec Template](../docs/reference/templates/SPECS_Template.md)

### Guides
- [Development Workflow Guide](../docs/guides/standards/Development%20Workflow%20Guide.md)
- [Documentation Guide](../docs/guides/standards/Documentation%20Guide.md)
- [Definition of Done](../docs/guides/standards/Definition%20of%20Done.md)

### STAD Protocol
- [STAD North Star](../docs/architecture/STAD_PROTOCOL_NORTH_STAR.md)
- [STAD Agent Playbook](../docs/architecture/STAD_Agent_Playbook.md)
- [STAD CLAUDE](../docs/architecture/STAD_CLAUDE.md)

---

*This directory structure supports the STAD Protocol's emphasis on traceability, handoffs, and systematic project management*