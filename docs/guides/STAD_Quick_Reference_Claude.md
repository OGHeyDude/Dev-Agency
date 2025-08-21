---
title: STAD Quick Reference for Claude Agents
description: Operational manual for Claude agents executing STAD Protocol - no fluff, just execution
type: guide
category: workflow
tags: [stad, claude, agents, reference, execution]
created: 2025-08-19
updated: 2025-08-19
version: 1.0
---

# STAD Quick Reference for Claude Agents

**For:** Claude agents executing STAD Protocol  
**Purpose:** Direct execution reference - no philosophy, just actions

---

## 🎯 STAD in 30 Seconds

**5 Stages, 9 Commands, Zero Intervention in Stages 2-3**

```
Stage 0: Human plans epics
Stage 1: /sprint-plan - Write ALL specs, make ALL decisions
Stage 2: /execute - Implement from specs (NO design decisions)
Stage 3: /execute - Validate & auto-fix until 100% DONE
Stage 4: /sprint-approved - Human review, release & learn
```

---

## 📋 Stage Execution Reference

### Stage 0: Strategic Planning (Human-led)
**You don't execute this.** Human provides epics.

### Stage 1: Sprint Preparation
**Command:** `/sprint-plan <additional instructions>`  
**Recipe:** `/home/hd/Desktop/LAB/Dev-Agency/recipes/sprint_preparation_recipe.md`

**MUST DO:**
1. Read PROJECT_PLAN.md
2. Select 30-35 story points
3. Split any ticket >5 points
4. Write COMPLETE specs for EVERY ticket
5. Document ALL design decisions
6. Create dependency graph
7. Prepare agent handoffs

**OUTPUT REQUIRED:**
- `/Project_Management/Specs/[TICKET]_spec.md` for each ticket
- Updated PROJECT_PLAN.md with sprint tickets
- `/Project_Management/Sprint_Plans/Sprint_[N]_plan.md`

### Stage 2: Sprint Execution  
**Command:** `/execute`  
**Recipe:** `/home/hd/Desktop/LAB/Dev-Agency/recipes/sprint_execution_recipe.md`

**MUST DO:**
1. Follow specs EXACTLY (no new decisions)
2. Implement in dependency order
3. Write ALL automated tests:
   - Frontend: Components, integration, UI logic (Jest, RTL)
   - Backend: API, database, services
   - Coverage >85% for both
4. Update documentation continuously
5. Semantic commits: `type(scope): message | Sprint:[N] | Ticket:[ID]`
6. Create handoffs between agents

**OUTPUT REQUIRED:**
- Implemented code
- Frontend tests passing (components, integration)
- Backend tests passing (API, database)
- `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/[agent]_[TICKET]_report.md`
- `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/[from]_to_[to]_[TICKET].md`

### Stage 3: Sprint Validation (Autonomous)
**Command:** `/execute` (continues from Stage 2)  
**Recipe:** Embedded in sprint_execution_recipe.md

**MUST DO (Zero-Intervention with Process):**
1. Validate ALL automated tests passed:
   - Frontend: Component, integration, UI logic tests
   - Backend: API, database, service tests
2. Check coverage (>85% both frontend & backend)
3. Validate against acceptance criteria
4. If ANY issues found, follow process:
   - **Bugs:** Use bug_fix_recipe.md + debug agent
   - **Design Questions:** Mark BLOCKED, escalate to human
   - **Complex Issues:** Architect + debug agents collaborate
   - **NO WORKAROUNDS** - only proper fixes
   - Re-validate until passing
5. Update documentation
6. Mark tickets as DONE only when fully validated

**Human Involvement:** Only after ALL tickets are 100% DONE

**OUTPUT REQUIRED:**
- All automated tests validated
- Human UI/UX review complete
- Coverage reports (frontend + backend)
- `/Project_Management/Sprint_Validation/Sprint_[N]_validation.md`

### Stage 4: Release & Retrospective
**Command:** `/sprint-approved`  
**Recipe:** Use retrospective agent

**MUST DO:**
1. Merge to main
2. Update CHANGELOG.md
3. Create retrospective report
4. Sync memory graph

**OUTPUT REQUIRED:**
- `/Project_Management/Sprint_Retrospectives/Sprint_[N]_retrospective.md`
- Updated CHANGELOG.md
- Memory sync complete

---

## 🔧 The 9 Essential Commands

```bash
# STAD Sprint Commands (4)
/sprint-plan <instructions>    # Stage 1: Plan everything
/execute                       # Stage 2: Build everything
/validate                      # Stage 3: Test everything  
/sprint-approved              # Stage 4: Ship & learn

# Utility Commands (5)
/cmd                          # Initialize session
/standards <subject>          # Read relevant standards
/sync-memory                  # Update knowledge graph
/sprint-status               # Check progress
/folder-cleanup [path]        # Clean any folder systematically
```

---

## 📚 Recipe Usage Matrix

| Situation | Recipe to Use | Command/Path |
|-----------|--------------|--------------|
| Planning sprint | sprint_preparation_recipe.md | `/sprint-plan` |
| Executing sprint | sprint_execution_recipe.md | `/execute` |
| Fixing bugs | bug_fix_recipe.md | When bug found |
| API feature | api_feature_recipe.md | For API tickets |
| Database changes | database_migration_workflow.md | For schema changes |
| Performance issues | performance_optimization_recipe.md | For optimization |
| Security audit | security_audit_recipe.md | For security tickets |
| Memory sync | memory_sync_recipe.md | `/sync-memory` |
| Folder cleanup | folder_cleanup_recipe.md | `/folder-cleanup` |
| MCP server | mcp_server_recipe.md | For MCP features |
| Documentation | documentation_standardization_recipe.md | For doc updates |

**Recipe Location:** `/home/hd/Desktop/LAB/Dev-Agency/recipes/`

---

## 🚧 Blocker Decision Tree (Stage 2-3)

```
Encounter Issue
    ↓
Is it a bug/test failure?
    ├─ YES → Type 1: FIX IT PROPERLY
    │         - Follow bug_fix_recipe.md
    │         - Use debug agent for complex issues
    │         - Fix root cause (NO WORKAROUNDS)
    │         - Add regression test
    │         - Document in work report
    │         - Re-validate
    │
    └─ NO → Is it a design/architecture decision?
             ├─ YES → Type 2: BLOCKED
             │         - Examples:
             │           • Which library to use?
             │           • How to handle edge case not in spec?
             │           • API design choice needed?
             │         - Set status: BLOCKED
             │         - Document decision needed
             │         - Create handoff
             │         - Wait for human decision
             │
             └─ NO → Is it an integration issue?
                      ├─ YES → Type 3: COLLABORATE
                      │         - Architect agent for analysis
                      │         - Debug agent for root cause
                      │         - Fix per patterns
                      │         - Re-validate
                      │
                      └─ NO → Continue working
```

**NEVER:**
- Apply workarounds for bugs
- Make design decisions in Stage 2
- Skip documenting blockers
- Continue without resolution

---

## 📁 Critical Paths

### Project Structure
```
/Project_Management/
├── PROJECT_PLAN.md                    # Sprint backlog & status
├── /Specs/                           # ALL ticket specs
├── /Sprint_Execution/Sprint_[N]/
│   ├── /agent_handoffs/              # Inter-agent context
│   └── /work_reports/                # Agent reports
├── /Sprint_Plans/                    # Sprint plans
├── /Sprint_Retrospectives/           # Retrospectives
└── /Sprint_Validation/               # Validation reports

/Archive/                             # NEVER DELETE - archive here
```

### Central System (Dev-Agency)
```
/home/hd/Desktop/LAB/Dev-Agency/
├── /Agents/                          # Agent definitions
├── /recipes/                         # All recipes
├── /docs/reference/templates/        # All templates
└── /Development_Standards/Guides/    # All standards
```

---

## ✅ Required Outputs Checklist

### Every Ticket MUST Have:
- [ ] Spec in `/Project_Management/Specs/[TICKET]_spec.md`
- [ ] Status updates in PROJECT_PLAN.md
- [ ] Work report from each agent
- [ ] Handoff documents between agents
- [ ] Frontend tests with >85% coverage
- [ ] Backend tests with >85% coverage
- [ ] Documentation updates
- [ ] Semantic commits with metadata

### Every Sprint MUST Have:
- [ ] Sprint plan document
- [ ] All ticket specs (100%)
- [ ] Validation report
- [ ] Retrospective report
- [ ] Updated CHANGELOG
- [ ] Memory sync

---

## 🎯 Execution Rules (NO EXCEPTIONS)

1. **Stage Gates are MANDATORY** - Cannot skip stages
2. **Specs before Code** - No implementation without spec
3. **Decisions in Stage 1 ONLY** - Stages 2-3 are pure execution
4. **Fix Bugs Properly** - No workarounds, fix and re-validate
5. **100% Complete Before Human Review** - All tickets DONE first
6. **Archive Don't Delete** - Move to /Archive/ with reason
7. **Semantic Commits Always** - Include Sprint & Ticket metadata
8. **Handoffs Required** - Document context for next agent
9. **Test Coverage >85%** - Non-negotiable
10. **Update PROJECT_PLAN.md** - Real-time status updates
11. **Memory Sync After Changes** - Keep knowledge graph current

---

## 🔄 Common Patterns

### Sprint Start Pattern
```bash
/cmd                              # Initialize
/sprint-plan "Sprint N goals"    # Plan with specs
# Review specs
/execute                          # Build
```

### Bug Fix Pattern
```bash
# Bug found in validation
git bisect start                  # Find breaking commit
# Fix root cause (no workaround)
# Add regression test
# Update work report
```

### Blocked Pattern
```bash
# Hit design decision needed
# Update ticket status: BLOCKED
# Document in handoff
# Switch to unblocked work
# Wait for human decision
```

---

## ❌ Anti-Patterns (AVOID)

1. **Making design decisions during Stage 2**
2. **Implementing without complete spec**
3. **Applying workarounds instead of fixes**
4. **Skipping test coverage requirements**
5. **Deleting files instead of archiving**
6. **Generic commit messages without metadata**
7. **Missing handoff documentation**
8. **Proceeding past failed stage gates**
9. **Not updating PROJECT_PLAN.md status**
10. **Forgetting memory sync**

---

## 📊 Status Transitions

```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → 
QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE

Any state → BLOCKED (document reason)
BLOCKED → previous state (when resolved)
```

---

## 🔥 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| No specs | Cannot proceed - run `/sprint-plan` first |
| Ticket >5 points | Split into subtasks automatically |
| Design question | Mark BLOCKED, escalate to human |
| Test failing | Fix properly, no workarounds |
| Missing handoff | Create before switching agents |
| <85% coverage | Write more tests, cannot proceed |
| Stage gate failed | Fix issues, cannot skip |

---

## 📝 Semantic Commit Format

```bash
type(scope): description | Sprint:N | Ticket:ID | Decision:choice

# Examples:
feat(auth): implement JWT | Sprint:8 | Ticket:STAD-001 | Decision:JWT
fix(api): resolve timeout | Sprint:8 | Ticket:BUG-042
test(auth): add coverage | Sprint:8 | Ticket:STAD-001
docs(stad): update guide | Sprint:8 | Ticket:DOC-015
```

---

## 🎬 Session Start Checklist

```bash
date +"%m-%d-%Y"                     # Get real date
source ./CLAUDE.env                  # Load project config  
./scripts/detect-project-state.sh    # Get dynamic state
git status                           # Check git state
gh project list                      # Check boards
mcp__memory__search_nodes("sprint")  # Query knowledge
```

---

**Remember:** This is YOUR operational manual. Follow it exactly. No philosophy, no debates, just execution.