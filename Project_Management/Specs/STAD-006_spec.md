# STAD-006 Specification: Implement Folder Organization Rules and Archive Policy (STAD-Aligned)

**Ticket ID:** STAD-006  
**Story Points:** 3  
**Epic:** Standards & Organization  
**Sprint:** 8-Test  
**Created:** 08-16-2025  
**STAD Stage Focus:** Stage 1 (Sprint Preparation)

---

## Description

Create comprehensive folder organization rules aligned with STAD Protocol stages. Define where stage outputs belong, establish archive policy, and ensure consistent project structure. These rules will be embedded into agent prompts and enforced through automation.

## Current State

Currently we have:
- Inconsistent file placement across projects
- No STAD stage output locations defined
- Agents creating files in various locations
- No clear mapping of STAD stages to folders
- Archive policy not formalized

## Acceptance Criteria

- [ ] STAD stage output locations defined
- [ ] Archive policy documented with examples
- [ ] File type to location mapping created
- [ ] Sprint folder structure specified
- [ ] Work report locations defined
- [ ] Handoff document locations specified
- [ ] Archive naming conventions created
- [ ] Rules integrated into folder_organization_guide.md
- [ ] Enforcement checklist created

## Technical Specification

### STAD-Aligned Folder Structure

```markdown
/[Project-Root]/
├── /Project_Management/
│   ├── PROJECT_PLAN.md              # Sprint tracking
│   ├── /Epics/                      # Stage 0 outputs
│   │   └── [EPIC-ID]_definition.md
│   ├── /Specs/                      # Stage 1 outputs
│   │   └── [TICKET-ID]_spec.md
│   ├── /Sprint_Execution/           # Stage 2 outputs
│   │   └── Sprint_[N]/
│   │       ├── implementation_reports/
│   │       └── agent_handoffs/
│   ├── /Sprint_Validation/          # Stage 3 outputs
│   │   └── Sprint_[N]/
│   │       ├── validation_report.md
│   │       └── quality_gates/
│   ├── /Sprint_Retrospectives/      # Stage 4 outputs
│   │   └── Sprint_[N]_retrospective.md
│   ├── /Work_Reports/               # Agent work reports
│   │   └── Sprint_[N]/
│   │       └── [AGENT]_[TICKET]_report.md
│   ├── /Bug_Reports/
│   └── /Archive/
│       ├── [YYYY]/[MM]/
│       └── archive_log.md
│
├── /src/                            # Code (Stage 2 outputs)
├── /tests/                          # Tests (Stage 2 outputs)
├── /docs/                           # Documentation (Stage 2 outputs)
└── /scripts/                        # Automation scripts
```

### Archive Policy for STAD

```markdown
## STAD Archive Policy

### Archive Triggers
1. Sprint completion (Stage 4) - Archive sprint artifacts
2. Epic completion - Archive epic documentation
3. Code refactoring - Archive old implementations
4. Template updates - Archive old templates

### Archive Structure
/Archive/
├── /Sprints/
│   └── Sprint_[N]_[YYYY-MM-DD]/
├── /Epics/
│   └── [EPIC-ID]_[YYYY-MM-DD]/
├── /Code/
│   └── [YYYY]/[MM]/
└── archive_log.md

### Naming Convention
[original-name]_archived_[YYYYMMDD]_[stage]_[reason].[ext]

Example: 
- Original: technical_plan.md
- Archived: technical_plan_archived_20250816_stage1_sprint_complete.md
```

### Stage Output Mapping

| STAD Stage | Output Location | File Types |
|------------|----------------|------------|
| Stage 0 | /Epics/ | Epic definitions, roadmaps |
| Stage 1 | /Specs/ | Comprehensive specifications |
| Stage 2 | /src/, /tests/, /docs/ | Code, tests, documentation |
| Stage 3 | /Sprint_Validation/ | Validation reports, QA results |
| Stage 4 | /Sprint_Retrospectives/ | Retrospective reports, metrics |

### Enforcement Rules

1. **Pre-Sprint Setup**
   - Create sprint folders before Stage 1
   - Verify folder structure compliance

2. **During Sprint**
   - Agents save to designated locations
   - Work reports filed after each task
   - Handoffs saved between agents

3. **Post-Sprint**
   - Archive sprint artifacts
   - Update archive log
   - Clean working directories

## Dependencies

### Depends On:
- None (Foundation ticket)

### Blocks:
- STAD-001 (Architect needs to know where to save specs)
- All other agent alignment tickets

## Success Metrics

- 100% compliance with STAD folder structure
- All stage outputs in correct locations
- Archive policy followed consistently
- Zero files deleted (all archived)
- Clear audit trail of sprint artifacts

## Notes

- Folder structure must support STAD Protocol stages
- Archive preserves sprint history for learning
- Automation scripts will enforce compliance
- Regular audits ensure consistency