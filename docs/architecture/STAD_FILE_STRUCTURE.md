# STAD_FILE_STRUCTURE.md - Authoritative File Organization Guide

**Version:** 1.0  
**Created:** 2025-01-17  
**Status:** Active  
**Authority:** PRIMARY - This is the single source of truth for file placement

---

## 🎯 Purpose

This document is the **AUTHORITATIVE GUIDE** for file organization in Dev-Agency and all projects using STAD Protocol. When in doubt about where a file belongs, THIS document is the final authority.

## ⚠️ Critical Rules

1. **This Document Supersedes All Others** - If any other doc conflicts, this wins
2. **No Ambiguity Allowed** - Every file type has ONE correct location
3. **Archive Don't Delete** - Never delete files, always archive with reason
4. **Single Source of Truth** - Update existing docs, don't create duplicates

---

## 📁 Master Structure - Dev-Agency Central System

```
/home/hd/Desktop/LAB/Dev-Agency/
├── CLAUDE.md                           # Main system configuration
├── PROJECT_PLAN.md                     # Sprint and epic tracking
│
├── /Agents/                            # Agent definitions (NEVER COPY to projects)
│   ├── architect.md                    # Stage 1 primary
│   ├── coder.md                        # Stage 2 primary
│   ├── tester.md                       # Stage 2 support
│   ├── backend-qa.md                   # Stage 3 primary
│   ├── retrospective.md                # Stage 4 primary
│   └── [specialist].md                 # Other agents
│
├── /docs/                              # ALL documentation
│   ├── /architecture/                  # System design docs
│   │   ├── STAD_PROTOCOL_NORTH_STAR.md # Vision document
│   │   ├── STAD_Agent_Registry.md      # Agent mapping
│   │   ├── STAD_CLAUDE.md              # Operational rules
│   │   ├── STAD_FILE_STRUCTURE.md      # THIS FILE - Authority on structure
│   │   └── CLAUDE_HIERARCHY.md         # CLAUDE.md relationships
│   │
│   ├── /guides/                        # How-to guides
│   │   └── /standards/                 # Development standards
│   │       ├── Development Standards Guide.md
│   │       ├── Development Workflow Guide.md
│   │       └── folder_organization_guide.md
│   │
│   ├── /reference/                     # Reference materials
│   │   └── /templates/                 # All templates (27 files)
│   │       ├── PROJECT_PLAN_Template.md
│   │       ├── SPECS_Template.md
│   │       ├── PROJECT_CLAUDE_TEMPLATE.md
│   │       ├── Observability_PROJECT_CLAUDE_TEMPLATE.md
│   │       └── /STAD_Stage_Templates/  # Stage-specific templates
│   │
│   ├── /getting-started/               # Onboarding docs
│   │   ├── stad-workflow.md
│   │   ├── choosing-agents.md
│   │   └── stad-quickstart.md
│   │
│   └── /integrations/                  # Integration guides
│       ├── github-boards.md
│       └── mcp-protocol.md
│
├── /Project_Management/                # Project execution artifacts
│   ├── PROJECT_PLAN.md                # Central ticket tracking
│   │
│   ├── /Specs/                        # Stage 1 outputs
│   │   ├── STAD-001_spec.md
│   │   └── STAD-001-updated_spec.md
│   │
│   ├── /Sprint_Execution/             # Stage 2 artifacts
│   │   └── /Sprint_[N]/
│   │       ├── /implementation_reports/
│   │       ├── /agent_handoffs/
│   │       └── /work_reports/
│   │
│   ├── /Sprint_Validation/            # Stage 3 artifacts
│   │   └── /Sprint_[N]/
│   │       ├── validation_report.md
│   │       └── /quality_gates/
│   │
│   ├── /Sprint_Retrospectives/        # Stage 4 outputs
│   │   ├── Sprint_[N]_retrospective.md
│   │   └── Sprint_[N]_metrics.md
│   │
│   ├── /Sprint_Plans/                 # Sprint planning docs
│   ├── /Bug_Reports/                  # Bug tracking
│   ├── /Handoff_Reports/              # Session handoffs
│   ├── /STAD_Migration/               # Migration tracking
│   └── /Stage_Gates/                  # Gate validation records
│
├── /recipes/                          # Agent combination recipes
│   ├── sprint_execution_recipe.md
│   └── sprint_preparation_recipe.md
│
├── /prompts/                          # Reusable prompts
│   ├── /agent_contexts/              # Agent context templates
│   └── slash_commands.md             # Command definitions
│
├── /scripts/                          # Automation scripts
│   ├── /validation/                  # Validation scripts
│   └── sprint-preflight.sh          # Pre-sprint checks
│
├── /Archive/                         # Historical artifacts
│   ├── /2025/                       # Year-based organization
│   │   └── /01/                     # Month-based
│   └── archive_log.md               # Archive tracking
│
├── /CORE/                            # Core system files (minimal)
└── /TEMPLATE_PACKAGE/                # Template distribution package
```

---

## 📋 File Placement Rules by Type

### Configuration Files
**CLAUDE.env**  
**Location:** Project root (same level as CLAUDE.md)  
**Rule:** MUST be in .gitignore (contains project-specific settings)  
**Setup:** Run `/home/hd/Desktop/LAB/Dev-Agency/scripts/setup-claude-env.sh`  
**Update:** Edit directly, especially `ACTIVE_SPRINT` as you progress

### Agent Files
**Location:** `/Agents/`  
**Rule:** NEVER copy to projects, always reference from Dev-Agency  
**Naming:** `[agent-name].md` (lowercase, hyphenated)

### Documentation
**Location:** `/docs/[category]/`  
**Categories:**
- `architecture/` - System design, protocols, high-level docs
- `guides/` - How-to guides, tutorials
- `reference/` - Templates, API docs, specifications
- `getting-started/` - Onboarding, quickstarts
- `integrations/` - Third-party integration guides

### Templates
**Location:** `/docs/reference/templates/`  
**Rule:** All templates in ONE location  
**Never:** Create templates elsewhere

### Sprint Artifacts by STAD Stage

| STAD Stage | Output Type | Location |
|------------|-------------|----------|
| **Stage 0** | Epic definitions | `/Project_Management/PROJECT_PLAN.md` |
| **Stage 1** | Specifications | `/Project_Management/Specs/[TICKET]_spec.md` |
| **Stage 1** | Sprint plans | `/Project_Management/Sprint_Plans/Sprint_[N]_Plan.md` |
| **Stage 2** | Implementation reports | `/Project_Management/Sprint_Execution/Sprint_[N]/implementation_reports/` |
| **Stage 2** | Agent handoffs | `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/` |
| **Stage 2** | Work reports | `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/` |
| **Stage 3** | Validation reports | `/Project_Management/Sprint_Validation/Sprint_[N]/` |
| **Stage 3** | Quality gates | `/Project_Management/Sprint_Validation/Sprint_[N]/quality_gates/` |
| **Stage 4** | Retrospectives | `/Project_Management/Sprint_Retrospectives/Sprint_[N]_retrospective.md` |
| **Stage 4** | Metrics | `/Project_Management/Sprint_Retrospectives/Sprint_[N]_metrics.md` |

### Project Root Structure (for all projects using STAD)
```
[PROJECT_ROOT]/
├── CLAUDE.env               # Project configuration (in .gitignore) - NEW!
├── CLAUDE.md                # Project-specific context
├── PROJECT_PLAN.md          # Central ticket tracking
├── /Project_Management/     # All project management artifacts
├── /docs/                   # Project documentation
├── /src/                    # Source code
├── /tests/                  # Tests
└── /Archive/                # Archived files
```

### Code Files (in projects, not Dev-Agency)
```
/src/
├── /[module]/
│   ├── index.ts
│   ├── types.ts
│   ├── __tests__/          # Module tests
│   └── README.md           # Module documentation
└── /shared/
    ├── /types/
    ├── /utils/
    └── /constants/
```

---

## 🎯 Agent-Specific File Rules

### Architect Agent (Stage 1)
**Creates:** Specifications  
**Location:** `/Project_Management/Specs/[TICKET]_spec.md`  
**Handoffs:** `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/architect_to_[agent]_[TICKET].md`

### Coder Agent (Stage 2)
**Creates:** Implementation code (in project `/src/`)  
**Reports:** `/Project_Management/Sprint_Execution/Sprint_[N]/implementation_reports/[TICKET]_implementation.md`  
**Work Log:** `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/coder_[TICKET]_report.md`

### Tester Agent (Stage 2)
**Creates:** Test files (in project `/src/[module]/__tests__/`)  
**Reports:** `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/tester_[TICKET]_report.md`

### Backend QA Agent (Stage 3)
**Creates:** Validation reports  
**Location:** `/Project_Management/Sprint_Validation/Sprint_[N]/validation_report.md`  
**Quality Gates:** `/Project_Management/Sprint_Validation/Sprint_[N]/quality_gates/`

### Retrospective Agent (Stage 4)
**Creates:** Sprint retrospectives  
**Location:** `/Project_Management/Sprint_Retrospectives/Sprint_[N]_retrospective.md`  
**Metrics:** `/Project_Management/Sprint_Retrospectives/Sprint_[N]_metrics.md`

### Documenter Agent (All Stages)
**Updates:** Existing docs in `/docs/`  
**Rule:** NEVER create new documentation files without checking existing  
**Process:** Search → Update → Create (only if truly new concept)

---

## 📂 Common Mistakes and Correct Locations

### ❌ WRONG → ✅ CORRECT

```
❌ /Development_Standards/Templates/
✅ /docs/reference/templates/

❌ /Development_Standards/Guides/
✅ /docs/guides/standards/

❌ /docs/templates/
✅ /docs/reference/templates/

❌ Creating new README in random location
✅ Update existing docs in proper category

❌ /temp/random_notes.md
✅ /Project_Management/temp/[context]_notes.md

❌ Deleting old_implementation.ts
✅ /Archive/2025/01/old_implementation_archived_20250117_refactored.ts

❌ Creating duplicate agent definition
✅ Reference from /Agents/[agent].md

❌ New template in project folder
✅ /docs/reference/templates/[template].md
```

---

## 🔍 Quick Decision Tree

**"Where does this file go?"**

1. **Is it an agent definition?**  
   → `/Agents/[agent].md`

2. **Is it a template?**  
   → `/docs/reference/templates/`

3. **Is it documentation?**  
   - Architecture/design → `/docs/architecture/`
   - How-to guide → `/docs/guides/`
   - Getting started → `/docs/getting-started/`
   - Integration guide → `/docs/integrations/`

4. **Is it a sprint artifact?**  
   - Spec → `/Project_Management/Specs/`
   - Handoff → `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`
   - Work report → `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/`
   - Validation → `/Project_Management/Sprint_Validation/Sprint_[N]/`
   - Retrospective → `/Project_Management/Sprint_Retrospectives/`

5. **Is it code?** (in projects, not Dev-Agency)  
   - Feature code → `/src/[module]/`
   - Tests → `/src/[module]/__tests__/`
   - Shared code → `/src/shared/`

6. **Is it obsolete?**  
   → `/Archive/[YYYY]/[MM]/[file]_archived_[YYYYMMDD]_[reason].[ext]`

---

## 📏 Enforcement

### Validation Commands
```bash
# Check if file is in correct location
./scripts/validation/check_file_location.sh [file_path]

# Find misplaced files
./scripts/validation/find_misplaced_files.sh

# Validate entire structure
./scripts/validation/validate_structure.sh
```

### Pre-Commit Hooks
All commits are validated for:
- Files in correct locations
- No files in root (except allowed)
- No duplicate templates
- Archive policy compliance

---

## 🚨 Authority Statement

**This document is the FINAL AUTHORITY on file placement in Dev-Agency.**

If you find conflicting information in:
- Other documentation
- Agent instructions
- Comments in code
- Previous patterns

**THIS DOCUMENT WINS.**

Last updated paths that supersede all others:
- Templates: `/docs/reference/templates/` (NOT /docs/templates/)
- Standards: `/docs/guides/standards/` (NOT /Development_Standards/)
- Agents: `/Agents/` (NEVER copy to projects)

---

## 📝 Revision History

| Date | Version | Change | Reason |
|------|---------|--------|--------|
| 2025-01-17 | 1.0 | Initial authoritative version | Consolidate conflicting docs |

---

*This is the authoritative guide for STAD Protocol file organization. All agents and developers MUST follow this structure.*