---
title: Observability Project CLAUDE.md Template
description: Template for observability/monitoring projects that references the central Dev-Agency system
type: template
category: development
tags: [template, project-setup, claude-md, observability, monitoring]
created: 2025-08-09
updated: 2025-08-20
version: 2.0
status: stable
---

# Project: [PROJECT_NAME]

**Type**: [Observability Platform | Monitoring Service | Metrics Dashboard | Alerting System]  
**Primary Language**: [TypeScript | Python | Go | Other]  
**Status**: [Planning | Active Development | Maintenance]

---

## 🎯 IMPORTANT: Central Dev-Agency System

**All agents, guides, templates, and development standards are managed centrally at:**
`/home/hd/Desktop/LAB/Dev-Agency/`

**NEVER COPY these files to this project!** The system works by reference:
1. Agent commands automatically read from Dev-Agency
2. Templates are used directly from Dev-Agency  
3. Standards are referenced from Dev-Agency

Single source of truth = Edit once in Dev-Agency, applies everywhere instantly.

---

## Quick Commands

### STAD 5-Stage Sprint Workflow
**Stage 0:** Strategic Planning → Define epics and roadmap  
**Stage 1:** Sprint Preparation → `/sprint-plan` with Architect Agent  
**Stage 2:** Sprint Execution → `/execute` with implementation agents  
**Stage 3:** Sprint Validation → `/validate` with Backend QA  
**Stage 4:** Release & Retrospective → `/sprint-approved` and retrospective

### Agent-Enhanced STAD Process
**With Agents:** Stage 1: `/agent:architect` → Stage 2: `/agent:coder` + `/agent:tester` → Stage 3: `/agent:backend-qa` → Stage 4: `/agent:retrospective`

### STAD Sprint Commands (4 commands)
1. **`/sprint-plan <additional instructions>`** - Stage 1: Sprint Planning
2. **`/execute`** - Stage 2: Sprint Execution  
3. **`/validate`** - Stage 3: Sprint Validation
4. **`/sprint-approved`** - Stage 4: Release & Retrospective

### Utility Commands (5 commands)
5. **`/cmd`** - Initialize Session
6. **`/standards <Subject>`** - Read Standards
7. **`/sync-memory`** - Knowledge Graph Sync
8. **`/sprint-status`** - Progress Report

### Agent System Commands
```bash
# Core Development Agents
/agent:architect     # System design and architecture
/agent:coder        # General code implementation  
/agent:tester       # QA testing and debugging
/agent:security     # Security review
/agent:documenter   # User-facing documentation

# Specialist Agents  
/agent:mcp-dev      # MCP protocol specialist
/agent:performance  # Performance optimization
/agent:integration  # Service integration
/agent:hooks        # Hooks and middleware
/agent:clutter-detector  # Anti-redundancy checks
/agent:memory-sync  # Sync code changes to knowledge graph

# Advanced Agents
/agent:auto-fix     # Predictive issue resolution
/agent:code-intelligence  # Advanced code analysis
/agent:predictive-planner  # Sprint planning assistant
/agent:vcs-integration  # GitHub/GitLab integration
/agent:vue-ui       # Vue.js frontend specialist
```

Use the 8 commands above for all work. Commands integrate with STAD Protocol stages and provide clear progression through development cycles.

---

## Reference Shortcuts

### Development Standards
- `$STANDARDS` = `/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/Development Standards Guide.md`
- `$WORKFLOW` = `/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/Development Workflow Guide.md`
- `$DOCS_GUIDE` = `/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/Documentation Guide.md`
- `$DONE` = `/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/Definition of Done.md`

### Templates
- `$PROJECT_PLAN` = `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/PROJECT_PLAN_Template.md`
- `$SPEC` = `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/SPECS_Template.md`
- `$CHANGELOG` = `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/CHANGELOG_Template.md`
- `$BUG_REPORT` = `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/Persistent Bug Report.md`

---

## 🎯 UNIVERSAL CORE PHILOSOPHY

### Quality First Principle
**"Quality, Efficiency, Security, and Documentation OVER Speed"**
- We build enterprise-grade software worthy of production
- Every line of code should be secure and maintainable
- Documentation is NOT optional - it's part of the deliverable
- Take the time needed to do it RIGHT the first time

### Planning Philosophy  
**"The better you plan, the better the outcome"**
- ALWAYS read documentation before starting
- ALWAYS write detailed plans before coding
- ALWAYS track progress against plans
- We use Story Points (1,2,3,5,8,13), NOT time to plan our work

### Anti-Clutter Principle
**"Single Source of Truth - No Clutter, No Redundancy"**
- SEARCH before creating
- UPDATE instead of duplicating
- CONSOLIDATE scattered content
- ARCHIVE obsolete files (never delete)

---

## 🚫 UNIVERSAL ANTI-CLUTTER DIRECTIVES

### Before Creating ANYTHING
1. **Search First**: Check if it already exists (use Grep, Glob, or Task tools)
2. **Extend Second**: Can you add to existing file/function?
3. **Create Last**: Only if truly needed and unique

### Mandatory Pre-Implementation Checks
```bash
# Before creating ANY file:
ls [target_directory]  # Check what exists
Grep "similar_function" # Search for existing implementations
Read existing_files    # Understand current structure
```

---

## 📁 Project Setup

**For complete setup instructions, see:**
`/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/New Project Setup Guide.md`

### Required Project Structure
```bash
/Project_Management/
├── PROJECT_PLAN.md           # Central source of truth for all tickets
├── /Specs/                   # All ticket specifications
├── /Bug_Reports/             # Bug tracking
├── /temp/                    # Temporary working files
├── /Sprint Retrospectives/   # Sprint retrospectives
├── /Archive/                 # Archived files (never delete, always archive)
└── /Releases/                # Release documentation

/docs/                        # All documentation
├── /features/                # Feature documentation
├── /guides/                  # User guides and tutorials
├── /api/                     # API reference documentation
└── /development/             # Development documentation

/src/                         # Source code
└── /[module]/__tests__/     # Test files (MANDATORY)
```

### Quick Setup Commands
```bash
# 1. Create structure
mkdir -p Project_Management/{Specs,Bug_Reports,temp,"Sprint Retrospectives",Archive,Releases}
mkdir -p docs/{features,guides,api,tutorials,integrations,agents,development/{architecture,patterns,testing,deployment}}
mkdir -p src

# 2. Copy templates (see setup guide for details)
# 3. Customize this CLAUDE.md file
```

---

## 🔧 Observability-Specific Configuration

### Monitoring Stack Components
[Prometheus | Grafana | OpenTelemetry | Datadog | New Relic | Custom]

### Metrics Collection
- **Application Metrics**: [Response time, throughput, error rates]
- **System Metrics**: [CPU, memory, disk, network]
- **Business Metrics**: [User actions, conversions, revenue]
- **Custom Metrics**: [Project-specific metrics]

### Alerting Configuration
- **Alert Channels**: [Email | Slack | PagerDuty | SMS]
- **Severity Levels**: [Critical | Warning | Info]
- **Escalation Policies**: [Define escalation paths]

### Data Retention
- **Hot Storage**: [Duration for real-time queries]
- **Cold Storage**: [Duration for historical analysis]
- **Aggregation Rules**: [How data is downsampled over time]

### Key Integrations
- **Data Sources**: [Applications, databases, infrastructure]
- **Export Targets**: [S3, BigQuery, other systems]
- **API Endpoints**: [Metrics API, Query API, Alert API]

---

## 📋 Project Context

### Business Requirements
[Brief description of what this observability solution monitors and why]

### Technical Constraints
[Data volume, latency requirements, storage limitations]

### Integration Points
[Services being monitored, data collection methods, export destinations]

---

## STAD 5-Stage Process (MANDATORY)

### Sprint-level stages:

### Stage 0: Strategic Planning
- Define observability strategy and goals
- Identify key metrics and SLIs/SLOs
- Plan monitoring architecture
- **Output**: Epic definitions and roadmap

### Stage 1: Sprint Preparation (`/sprint-plan`)
- **Required**: `/agent:architect` for system design
- Select monitoring tickets for sprint
- Write comprehensive specs for each component
- Define alert thresholds and dashboard designs
- **Gate**: All specs complete, no ticket >5 points

### Stage 2: Sprint Execution (`/execute`)
- **Required**: Select appropriate agent(s)
- `/agent:coder` for collectors/exporters
- `/agent:integration` for service connections
- `/agent:performance` for optimization
- **Zero-intervention**: All decisions from Stage 1

### Stage 3: Sprint Validation (`/validate`)
- **Required**: `/agent:backend-qa` for validation
- Test data collection accuracy
- Validate alerting thresholds
- Performance benchmarking
- **Gate**: Human approval required (`/sprint-approved`)

### Stage 4: Release & Retrospective
- **Required**: `/agent:retrospective` for learnings
- Deploy monitoring to production
- Document patterns and improvements
- Capture metrics on monitoring effectiveness
- **Output**: Sprint retrospective and release notes

---

## Ticket Status Transitions

Follow this STRICT state machine:
```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE
```
- **BLOCKED**: Can occur from any state, return to previous when unblocked
- **Failed review**: Return to IN_PROGRESS for rework

---

## 🧪 Quality Requirements

### Test Coverage Requirements
- **85%** for general functionality
- **95%** for critical paths:
  - Data collection pipelines
  - Alerting logic
  - Metric calculations
  - API endpoints

### Performance Requirements
- Query response time < [X]ms
- Data ingestion rate > [Y] points/sec
- Alert evaluation latency < [Z]ms
- Dashboard load time < [N] seconds

---

## ⏰ Date and Time Accuracy (MANDATORY)

### ALWAYS Get Real Date/Time - NEVER Guess
```bash
# Before writing ANY date in documentation:
date +"%m-%d-%Y"        # For docs text: 08-11-2025
date +"%Y-%m-%d"        # For frontmatter: 2025-08-11
date +"%Y-%m-%d %H:%M"  # With time: 2025-08-11 14:30
```

### Documentation Frontmatter (REQUIRED for all .md files)
```yaml
---
title: [Clear title]
description: [One-line purpose]
type: [guide|spec|dashboard|runbook|metrics]
category: [monitoring|alerting|metrics|dashboards]
tags: [relevant, terms]
created: [YYYY-MM-DD from date command]
updated: [YYYY-MM-DD from date command]
---
```

---

## 📁 Archive Principle (NEVER Delete)

When removing files or folders:
1. Move to `/Archive/` folder (create if needed)
2. Add reason file: `[SUBJECT]_archive_reason_[DATE].md`
3. Include: Why archived, Date, Related ticket, Migration notes

---

## 📄 File Organization

### Observability-Specific Organization
- **Metrics definitions** → `/docs/metrics/[service]-metrics.md`
- **Alert runbooks** → `/docs/runbooks/[alert-name].md`
- **Dashboard configs** → `/src/dashboards/[dashboard].json`
- **Collector configs** → `/src/collectors/[collector]/config.yaml`
- **Query library** → `/docs/queries/[use-case].md`

### Standard Organization
- **Temporary files** → `/Project_Management/temp/`
- **Feature docs** → `/docs/features/[feature-name].md`
- **API docs** → `/docs/api/[module]-api.md`
- **Test files** → `/src/[module]/__tests__/`

---

## 🚀 Development Commands

```bash
# Observability-specific commands
[docker-compose up -d]           # Start monitoring stack
[prometheus --config.file=...]   # Start Prometheus
[grafana-server]                 # Start Grafana
[npm run collect]                # Start metrics collector

# Standard development commands
[npm install | pip install -r requirements.txt | go mod download]
[npm run dev | python main.py | go run .]
[npm test | pytest | go test]
[npm run lint | ruff check | golangci-lint run]
```

---

## ✅ Mandatory Quality Gates

Before ANY commit:
1. Run `/agent:clutter-detector` (if available)
2. Check: Zero duplicate metrics definitions
3. Check: All alerts have runbooks
4. Check: Dashboard queries are optimized
5. Check: Tests passing (>85% coverage)
6. Check: Security review done (no secrets in configs)

---

## Project Management Requirements

### Required in PROJECT_PLAN.md
- **All tickets must have**: Unique ID, Status, Story Points (1,2,3,5,8,13), Spec Link
- **Epic tracking**: Use simplified statuses (Planned → In Progress → Done)
- **Sprint velocity**: Track actual vs planned points

### Required Templates (Reference from Dev-Agency)
- **`$PROJECT_PLAN`**: For project planning and backlog
- **`$SPEC`**: For EVERY ticket before moving to TODO
- **`$CHANGELOG`**: For release documentation
- **`$BUG_REPORT`**: For persistent bug tracking

---

## Notes

- All development standards from Dev-Agency apply unless explicitly overridden
- All templates are read from Dev-Agency - do not duplicate
- All agents are defined in Dev-Agency - do not copy
- This file should remain minimal and project-specific
- Focus on observability-specific configuration

---

*This project uses the centralized Dev-Agency system at `/home/hd/Desktop/LAB/Dev-Agency/`*