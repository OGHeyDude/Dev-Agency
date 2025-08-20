# STAD_CLAUDE.md - STAD Protocol Implementation Guide

**Version:** 1.0  
**Created:** 08-16-2025  
**Status:** Active  
**Purpose:** Operational rules and best practices for STAD Protocol execution

---

## 📂 Project Context

### Dynamic State Detection
```bash
# Load static configuration
if [ -f "./CLAUDE.env" ]; then
    source ./CLAUDE.env
fi

# Detect dynamic project state from PROJECT_PLAN.md
if [ -f "./scripts/detect-project-state.sh" ]; then
    source ./scripts/detect-project-state.sh --export
    echo "✅ Dynamic state loaded:"
    echo "   Sprint: $ACTIVE_SPRINT"
    echo "   Epic: $CURRENT_EPIC"
    echo "   Ticket: $CURRENT_TICKET"
fi
```

### Current Project: Dev-Agency (Central System)
- **Project Root:** `/home/hd/Desktop/LAB/Dev-Agency`
- **Git Repository:** `https://github.com/OGHeyDude/Dev-Agency.git`
- **Project Type:** Central Development Infrastructure
- **Special Note:** This IS the central system - all paths are local
- **Sprint Detection:** Automatic from PROJECT_PLAN.md

### Path Resolution for Dev-Agency
When working IN Dev-Agency itself:
- **Agents:** `./Agents/` (local)
- **Templates:** `./docs/reference/templates/` (local)
- **Standards:** `./Development_Standards/Guides/` (local)
- **Project Management:** `./Project_Management/` (local)

---

## 🎯 Universal Mandates (ALL Agents)

### Core Philosophy
**"Quality, Efficiency, Security, Documentation OVER Speed"**
- Document the "why" not just the "what"
- Enterprise-grade code ready for production
- Take the time to do it RIGHT the first time
- **Archive, Don't Delete** - Preserve history
- **Quality over Speed** - Better to be right than fast

### Non-Negotiable Rules
1. **Never Delete** - Archive to `/Archive/` with reason file
2. **Never Guess Dates** - Always run `date +"%m-%d-%Y"`
3. **Never Duplicate** - Search → Update → Create (in that order)
4. **Never Skip Handoffs** - Create at `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`
5. **Never Hardcode Paths** - Use environment variables/configs

### Required Actions
```bash
# Before ANY work
date +"%m-%d-%Y"              # Get real date
gh project list                # Check board status
mcp__memory__search_nodes()    # Query knowledge graph

# After EVERY change
git commit -m "type(scope): message [TICKET-ID]"
# type: feat|fix|docs|style|refactor|test|chore
# scope: component/module affected  
# TICKET-ID: GitHub issue or board item
gh project item-edit           # Update board
mcp__memory__add_observations() # Update knowledge
```

---

## 📁 Project Structure

### Required Folder Organization
Every project MUST maintain the following documentation structure:

```markdown
[PROJECT_ROOT]/
├── CLAUDE.env                # Project configuration (in .gitignore)
├── CLAUDE.md                 # Project-specific context
├── PROJECT_PLAN.md           # Central source of truth for all tickets
├── /Project_Management/
│   ├── /Specs/               # All ticket specifications
│   ├── /Sprint_Execution/    # Sprint execution artifacts (STAD)
│   │   └── /Sprint_[N]/
│   │       ├── /agent_handoffs/  # Agent context passing
│   │       └── /work_reports/    # Agent work reports
│   ├── /Sprint_Plans/        # Sprint planning documents
│   ├── /Sprint_Retrospectives/ # Stage 4 retrospectives
│   ├── /Stage_Gates/         # Gate validation criteria
│   ├── /Bug_Reports/         # Bug tracking
│   ├── /TEMP/                # Temporary working files
│   └── /Releases/            # Release documentation
│       ├── CHANGELOG.md
│       └── Release_Notes.md
└── /Archive/                 # Archived files (never delete)


/docs/                        # All documentation (NEW)
├── /features/                # Feature documentation
├── /guides/                  # User guides and tutorials
├── /api/                     # API reference documentation
├── /tutorials/               # Step-by-step tutorials
├── /integrations/            # Third-party integrations
├── /agents/                  # Agent-specific documentation
└── /development/             # Development documentation
   ├── /architecture/        # System design and architecture
   ├── /patterns/           # Code patterns and best practices
   ├── /testing/            # Testing strategies and guides
   └── /deployment/         # Deployment and operations


/src/                         # Source code
└── /[module]/__tests__/     # Test files (MANDATORY)
```

---

## 🔄 STAD 5-Stage Lifecycle

### Stage 0: Strategic Planning
**Command:** Human-driven (no specific command)
✅ Epic defined with clear requirements  
✅ Story points estimated (rough: 13, 21, 34+ points)  
✅ Strategic alignment confirmed  
✅ Roadmap created in GitHub Project board

### Stage 1: Sprint Preparation  
**Command:** `/sprint-plan <additional instructions>`
✅ Technical specification complete  
✅ All tickets ≤5 story points (split if >5 points automatically)
✅ Dependencies mapped (DAG)  
✅ Edge cases documented  
✅ Fallback strategies defined  

### Stage 2: Sprint Execution
**Command:** `/execute`
✅ All automated tests passing (frontend + backend)
✅ Frontend tests: Components, integration, UI logic
✅ Backend tests: API, database, services
✅ Lint/typecheck clean  
✅ Coverage targets met (>80%)
✅ Handoffs created  
✅ Knowledge graph updated  

### Stage 3: Sprint Validation
**Command:** `/execute`
✅ Automated test validation complete
✅ Human UI/UX review complete  
✅ No critical bugs  
✅ Performance validated  
✅ Security checked

### Stage 4: Release & Retrospective
**Command:** `/sprint-approved`
✅ Feature merged to main
✅ Deployment successful
✅ Retrospective completed
✅ Knowledge captured
✅ Metrics analyzed  

---

## 👥 Agent-Specific Mandates

### Scrum Master
- **ENFORCE** protocol compliance
- **VALIDATE** every handoff
- **BLOCK** stage transitions if gates not met
- **TRACK** velocity and blockers

### Architect
- **SEARCH** for existing patterns first
- **PLAN** with "why" as first-class citizen
- **SPLIT** any ticket >5 points
- **DOCUMENT** all edge cases and fallbacks

### Coder
- **FOLLOW** `/docs/guides/coding_standards.md`
- **RUN** `npm run lint && npm run typecheck` before complete
- **COMMIT** semantically with ticket IDs
- **UPDATE** board after each component
- **SUBMIT** work report to `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/coder_[TICKET]_report.md`
- **DOCUMENT** bugs found and fixed (NO WORKAROUNDS)

### Tester
- **ACHIEVE** coverage targets (no exceptions)
- **ELIMINATE** flaky tests
- **VALIDATE** requirements, not just code
- **DOCUMENT** test patterns for reuse

### Documenter
- **UPDATE** existing docs (don't create new)
- **MAINTAIN** single source of truth
- **INCLUDE** complete frontmatter
- **EXPLAIN** "why" not just "how"

### Backend QA
- **VERIFY** API contracts
- **VALIDATE** security (mandatory)
- **CHECK** performance SLAs
- **ENSURE** database integrity

### Debug Agent
- **USE** `git bisect` to find root cause
- **ADD** regression tests
- **DOCUMENT** why bug occurred
- **UPDATE** knowledge graph with findings

### Retrospective
- **MEASURE** everything (velocity, bugs, blockers)
- **IDENTIFY** patterns in failures AND successes
- **DOCUMENT** bugs, root causes, and FIXES (no workarounds)
- **TRACK** tool issues and resolve them
- **CONSOLIDATE** agent retrospectives from `/Retrospectives/`
- **FEED** improvements back to process

---

## 📊 Status Transitions

```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → 
QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE

Any state can → BLOCKED (must document reason)
```

---

## 📝 Agent Work Reports

**Every agent MUST submit work reports to:** `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/[agent]_[TICKET]_report.md`

### Work Report Template
```markdown
# Work Report: [Agent] - [Ticket ID]
Date: [Run date command]
Stage: [Current STAD Stage]

## Work Completed
- [What was done]
- [Files modified/created]
- [Decisions made]

## Issues Encountered

### Bugs/Tool Failures (Fixed)
- Issue: [Description of what broke]
  - Root Cause: [Why it happened]
  - Fix Applied: [Proper fix, NO WORKAROUND]
  - Prevention: [How to avoid in future]

### Architecture/Design Blockers (Escalated)
- Unknown: [What needs decision]
  - Context: [Why decision is needed]
  - Options: [Possible approaches]
  - Status: BLOCKED - Awaiting decision
  - Resolution: [Decision made by User + Claude]

## Improvements Suggested
- [Process improvements]
- [Tool improvements]
- [Documentation gaps]

## Time Tracking
- Estimated: [Story points]
- Actual: [Time taken]
- Blockers: [Time lost to blockers]
```

---

## 🚧 Blocker Handling Protocol

### Two Types of Blockers

#### Type 1: Bugs and Tool Failures
**Resolution:** FIX immediately, NO WORKAROUNDS
- Debug using git bisect if needed
- Activate Debug Agent for complex issues
- Fix the root cause, not symptoms
- Add regression test for the bug
- Document fix in work report

#### Type 2: Design Decision Required
**Resolution:** BLOCKED, escalate to human
- Unknown Architecture: escalate for decision
- Document what decision is needed
- Provide context and options
- Set ticket status to BLOCKED
- Wait for human decision
- Resume after decision made

### Ticket Management Rules

#### Story Point Limits
- **Maximum ticket size:** 5 story points
- **Tickets >5 points:** Automatically split into subtasks
- **Epic breakdown:** 13, 21, 34+ points → multiple 1-5 point tickets
- **Splitting criteria:** Logical boundaries, independent deliverables

#### Ticket Status Flow
```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → 
QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE
```
- **BLOCKED state:** Can occur from any active state
- **Return path:** BLOCKED → previous state when unblocked

---

## ✅ Definition of Done

**No ticket is DONE until:**
- [ ] All sub tasks are 100% completed
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Lint/typecheck clean
- [ ] Documentation updated
- [ ] Handoff created for next agent
- [ ] Knowledge graph updated
- [ ] Board status current
- [ ] Security validated
- [ ] Performance verified

---

## 🚀 Quick Commands

```bash
# STAD Sprint Commands (4 commands)
/sprint-plan <additional instructions>  # Stage 1: Planning
/execute                                # Stage 2: Execution
/validate                              # Stage 3: Validation
/sprint-approved                       # Stage 4: Release & Retrospective

# Utility Commands (4 commands)
/cmd                                   # Initialize Session
/standards <Subject>                   # Read Standards
/sync-memory                           # Knowledge Graph Sync
/sprint-status                         # Progress Report
```

---

## 🔐 Security First

- Zero exposed secrets/keys
- Input validation always
- Security review for production code
- Principle of least privilege
- Audit trail via git history

---

## 📈 Tracking is KEY

**"Tracking progress is the KEY to achieving goals"**

Track:
- Story points (1,2,3,5,8,13)
- Velocity per sprint
- Bug rates
- Coverage metrics
- Time per stage

---

## 🆘 When Blocked

### Two Types of Blockers

#### Type 1: Bugs/Tool Failures (NO WORKAROUNDS)
**When:** Something that SHOULD work doesn't work
- Example: Test framework failing, linter broken, API returning errors
- **Action:** FIX the root cause properly
- **Never:** Apply band-aid solutions or workarounds

#### Type 2: Unknowns/Architecture Decisions (ESCALATE)
**When:** Missing requirements, unclear approach, or design decisions needed
- Example: Which library to use, how to handle edge case, API design choice
- **Action:** Mark ticket as BLOCKED → Human review required
- **Process:**
  1. Document the unknown/decision needed
  2. Update ticket status to BLOCKED
  3. Create handoff with context
  4. Wait for User + Claude decision
  5. Implement agreed solution

### Blocked Process
1. Document blocker type and details in ticket
2. Update status to BLOCKED with reason
3. Create handoff with full context
4. For Type 1: Fix it properly
5. For Type 2: Escalate for decision
6. Switch to unblocked work while waiting

---

**Remember: The STAD Protocol is our constitution. This document is our operational manual. Follow both.**