# Folder Organization Guide - STAD Protocol Aligned

**Version:** 2.1  
**Updated:** 01-17-2025  
**Status:** Active  
**Protocol:** STAD v5.1

---

## Overview

This guide defines the mandatory folder structure for all Dev-Agency projects following STAD Protocol. Every file has a designated location based on its type and the STAD stage that produces it.

**IMPORTANT:** For the authoritative file placement guide, see `/docs/architecture/STAD_FILE_STRUCTURE.md` - that document supersedes any conflicting information.

## Core Principle

**"A place for everything, and everything in its place"**

- No ambiguity in file placement
- Stage outputs have designated folders
- Archive everything, delete nothing
- Maintain clean working directories

## Master Folder Structure

```
/[Project-Root]/
├── Project_Management/           # All project management artifacts
│   ├── PROJECT_PLAN.md         # Central sprint and ticket tracking
│   ├── Epics/                  # Stage 0: Strategic Planning
│   │   └── [EPIC-ID]_definition.md
│   ├── Specs/                  # Stage 1: Sprint Preparation
│   │   ├── [TICKET-ID]_spec.md
│   │   └── [TICKET-ID]-updated_spec.md  # Updated versions
│   ├── Sprint_Execution/       # Stage 2: Sprint Execution
│   │   └── Sprint_[N]/
│   │       ├── implementation_reports/
│   │       │   └── [TICKET-ID]_implementation.md
│   │       ├── agent_handoffs/
│   │       │   └── [FROM]_to_[TO]_[TICKET].md
│   │       └── work_reports/
│   │           └── [AGENT]_[TICKET]_report.md
│   ├── Sprint_Validation/      # Stage 3: Sprint Validation
│   │   └── Sprint_[N]/
│   │       ├── validation_report.md
│   │       ├── quality_gates/
│   │       │   ├── code_quality.md
│   │       │   ├── test_coverage.md
│   │       │   └── security_scan.md
│   │       └── issue_tracking/
│   │           └── validation_issues.md
│   ├── Sprint_Retrospectives/  # Stage 4: Release & Retrospective
│   │   ├── Sprint_[N]_retrospective.md
│   │   └── Sprint_[N]_metrics.md
│   ├── Sprint_Plans/           # Sprint planning documents
│   │   ├── Sprint_[N]_Plan.md
│   │   └── Sprint_[N]_Executive_Summary.md
│   ├── Bug_Reports/            # Bug tracking
│   │   └── BUG-[XXX]_report.md
│   ├── Releases/               # Release documentation
│   │   ├── CHANGELOG.md
│   │   └── Release_Notes.md
│   └── Archive/                # Historical artifacts
│       ├── [YYYY]/
│       │   └── [MM]/
│       │       └── [archived_files]
│       └── archive_log.md
│
├── src/                        # Source code (Stage 2 output)
│   ├── [module]/              # Feature modules
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── __tests__/         # Module tests
│   │   └── README.md          # Module documentation
│   └── shared/                # Shared code
│       ├── types/
│       ├── utils/
│       └── constants/
│
├── tests/                      # End-to-end tests (Stage 2 output)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                       # Documentation (Stage 2 output)
│   ├── features/              # Feature documentation
│   ├── api/                   # API reference
│   ├── guides/                # User guides
│   ├── tutorials/             # Tutorials
│   ├── architecture/          # System design
│   └── development/           # Developer documentation
│
├── docs/                       # All Dev-Agency documentation
│   ├── reference/templates/   # All templates
│   │   └── STAD_Stage_Templates/
│   ├── guides/standards/       # Standards and guides
│   └── architecture/           # System design docs
│
├── scripts/                    # Automation scripts
│   ├── validation/
│   └── deployment/
│
├── config/                     # Configuration files
├── .github/                    # GitHub specific files
└── Archive/                    # Project-level archives
    ├── STAD_Migration_History/ # Historical migrations
    ├── Sprint_Handoffs/       # Old sprint artifacts
    └── old-session-logs/      # Session archives
```

## STAD Stage Output Mapping

| STAD Stage | Primary Output Location | File Types |
|------------|------------------------|------------|
| **Stage 0: Strategic Planning** | `/Epics/` | Epic definitions, roadmaps, feasibility studies |
| **Stage 1: Sprint Preparation** | `/Specs/` | Comprehensive specifications, dependency graphs |
| **Stage 2: Sprint Execution** | `/src/`, `/tests/`, `/docs/` | Code, tests, documentation |
| **Stage 3: Sprint Validation** | `/Sprint_Validation/` | Validation reports, quality gates, issues |
| **Stage 4: Release & Retro** | `/Sprint_Retrospectives/` | Retrospectives, metrics, lessons learned |

## File Naming Conventions

### General Rules
- Use descriptive names
- Include ticket/epic IDs
- Add dates for time-sensitive files
- Use underscores for spaces
- Lowercase for code files
- PascalCase for documentation

### Specific Patterns

#### Specifications
```
[TICKET-ID]_spec.md              # Original spec
[TICKET-ID]-updated_spec.md      # Updated version
```

#### Implementation Reports
```
[TICKET-ID]_implementation.md    # Stage 2 report
```

#### Agent Handoffs
```
architect_to_coder_[TICKET-ID].md
coder_to_tester_[TICKET-ID].md
```

#### Work Reports
```
[AGENT]_[TICKET-ID]_report.md
architect_STAD-001_report.md
```

#### Archive Files
```
[original-name]_archived_[YYYYMMDD]_[reason].[ext]
login_archived_20250816_refactored.ts
```

## Archive Policy

### Core Principle
**"Never delete, always archive"**

### When to Archive
1. **Sprint Completion** - Move sprint artifacts after retrospective
2. **Code Refactoring** - Archive old implementations
3. **Template Updates** - Archive previous versions
4. **Documentation Updates** - Archive major revisions
5. **Failed Experiments** - Archive attempted solutions

### Archive Process

1. **Identify File to Archive**
   ```bash
   # Example: Old implementation
   src/auth/login.ts
   ```

2. **Determine Archive Location**
   - Sprint artifacts: `/Project_Management/Archive/[YYYY]/[MM]/`
   - Code: `/Archive/[YYYY]/[MM]/`
   - Module-specific: `/src/[module]/archive/`

3. **Rename with Metadata**
   ```bash
   # Pattern: [name]_archived_[YYYYMMDD]_[reason].[ext]
   login_archived_20250816_refactored.ts
   ```

4. **Move to Archive**
   ```bash
   mv src/auth/login.ts Archive/2025/08/login_archived_20250816_refactored.ts
   ```

5. **Update Archive Log**
   ```markdown
   ## 2025-08-16
   - Archived: login.ts
   - Reason: Refactored to use JWT
   - Original: /src/auth/login.ts
   - Archive: /Archive/2025/08/login_archived_20250816_refactored.ts
   ```

### Archive Reasons
- `refactored` - Code was refactored
- `deprecated` - Feature deprecated  
- `replaced` - Replaced with new implementation
- `obsolete` - No longer needed
- `duplicate` - Duplicate functionality
- `experiment` - Experimental code
- `sprint_complete` - Sprint artifacts
- `updated` - New version created

## Sprint Folder Management

### Sprint Setup (Stage 1)
```bash
# Create sprint folders
mkdir -p Project_Management/Sprint_Execution/Sprint_8
mkdir -p Project_Management/Sprint_Execution/Sprint_8/implementation_reports
mkdir -p Project_Management/Sprint_Execution/Sprint_8/agent_handoffs
mkdir -p Project_Management/Sprint_Execution/Sprint_8/work_reports
mkdir -p Project_Management/Sprint_Validation/Sprint_8
mkdir -p Project_Management/Sprint_Validation/Sprint_8/quality_gates
```

### During Sprint (Stage 2)
- Save implementation reports immediately after completion
- Create handoff documents between agents
- File work reports after each ticket

### Sprint Validation (Stage 3)
- Consolidate validation results
- Document quality gate outcomes
- Track issues found

### Sprint Closure (Stage 4)
- Complete retrospective
- Archive sprint folders
- Clean working directories

## Agent-Specific Rules

### Architect Agent
- **Saves to:** `/Project_Management/Specs/`
- **Creates:** `[TICKET-ID]_spec.md`
- **Handoffs to:** `/Sprint_Execution/Sprint_N/agent_handoffs/`

### Coder Agent
- **Saves to:** `/src/`, `/tests/`
- **Reports to:** `/Sprint_Execution/Sprint_N/implementation_reports/`
- **Documents in:** `/docs/`

### Tester Agent
- **Saves to:** `/tests/`, `/Sprint_Validation/`
- **Reports to:** `/Sprint_Validation/Sprint_N/`
- **Issues to:** `/Sprint_Validation/Sprint_N/issue_tracking/`

### Documenter Agent
- **Updates:** `/docs/`
- **Never creates:** New documentation files without checking existing
- **Archives:** Old documentation versions

## Enforcement Checklist

### Daily Checks
- [ ] All new files in correct locations
- [ ] No files in root directory
- [ ] Work reports filed for completed tickets
- [ ] Handoffs created between agents

### Sprint Checks
- [ ] Sprint folders properly structured
- [ ] All stage outputs in designated folders
- [ ] Archive log updated
- [ ] No orphaned files

### Quality Checks
- [ ] File naming conventions followed
- [ ] No duplicate files
- [ ] Archive policy followed (nothing deleted)
- [ ] Documentation current

## Common Mistakes and Solutions

### Mistake: Files in wrong location
**Solution:** Move immediately to correct folder, update any references

### Mistake: Deleting instead of archiving
**Solution:** Recover from git, archive properly with reason

### Mistake: No handoff documents
**Solution:** Create retrospectively, establish habit for future

### Mistake: Inconsistent naming
**Solution:** Rename following conventions, update references

## Automation Support

### Validation Script
```bash
# Check folder structure compliance
./scripts/validation/check_folder_structure.sh

# Find misplaced files
./scripts/validation/find_orphaned_files.sh
```

### Archive Script
```bash
# Archive file with proper naming
./scripts/archive_file.sh [file] [reason]

# Archive sprint artifacts
./scripts/archive_sprint.sh Sprint_N
```

## Success Metrics

- **100% File Placement Accuracy** - All files in correct locations
- **Zero Deletions** - Everything archived with reasons
- **Complete Handoffs** - All agent transitions documented
- **Clean Working Dirs** - No clutter in active folders
- **Searchable Archives** - Can find any historical artifact

## Migration Notes

For projects migrating to this structure:
1. Create new folder structure
2. Move existing files to correct locations
3. Archive any deprecated content
4. Update all references
5. Validate with enforcement scripts

---

*This guide enforces STAD Protocol v5.1 folder organization. All projects must comply.*