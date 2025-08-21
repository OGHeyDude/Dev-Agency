# STAD Agent Integration Guide

**Version:** 1.0  
**Created:** 08-20-2025  
**Status:** Active  
**Purpose:** Comprehensive guide for STAD Protocol agent alignment and integration

---

## 📚 Overview

This guide documents how all Dev-Agency agents integrate with the STAD Protocol 5-stage lifecycle. It serves as the definitive reference for agent responsibilities, handoffs, and collaboration patterns.

---

## 🎯 STAD Protocol 5-Stage Lifecycle

### Stage 0: Strategic Planning (Human-Led)
- Epic definition and roadmapping
- Story estimation (13, 21, 34+ points)
- Strategic alignment
- No agent involvement

### Stage 1: Sprint Preparation
- **Lead:** Architect Agent + Main Claude
- **Output:** Comprehensive specifications
- **Goal:** All decisions made, zero ambiguity

### Stage 2: Sprint Execution
- **Lead:** Coder, Tester, Documenter Agents
- **Output:** Implementation, tests, documentation
- **Goal:** Zero-intervention autonomous execution

### Stage 3: Sprint Validation
- **Lead:** QA Validator Agent (backend-qa)
- **Output:** Validation reports
- **Goal:** All quality gates passed

### Stage 4: Release & Retrospective
- **Lead:** Retrospective Agent + Human
- **Output:** Release artifacts, lessons learned
- **Goal:** Continuous improvement

---

## 👥 Agent Responsibilities by Stage

### Stage 1: Sprint Preparation

#### Architect Agent
**Primary Responsibilities:**
- Create comprehensive technical specifications
- Make all design decisions upfront
- Map dependencies and create DAGs
- Split tickets >5 story points
- Document edge cases and fallbacks

**Outputs:**
- `/Project_Management/Specs/[TICKET]_spec.md`
- Technical plans with zero ambiguity
- Dependency graphs

#### Main Claude (Orchestrator)
**Primary Responsibilities:**
- Coordinate spec creation
- Ensure completeness
- Create sprint plan
- Prepare agent handoffs

**Outputs:**
- `/Project_Management/Sprint_Plans/Sprint_[N]_Plan.md`
- Initial agent context packages

---

### Stage 2: Sprint Execution

#### Coder Agent
**Primary Responsibilities:**
- Implement features per specs
- Follow STAD folder organization
- Apply archive-don't-delete policy
- Create handoffs for Tester
- Fix bugs properly (no workarounds)

**Key Rules:**
- Never delete files - archive them
- No design decisions - follow specs
- Semantic commits with ticket IDs
- Update GitHub board after each component

**Outputs:**
- Implementation code
- `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/coder_[TICKET]_report.md`
- `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/coder_to_tester_[TICKET].md`

#### Tester Agent
**Primary Responsibilities:**
- Write comprehensive tests (>85% coverage)
- Test frontend (components, integration, UI)
- Test backend (API, database, services)
- Create regression tests for every bug
- Work in parallel with Coder

**Key Rules:**
- Archive old tests, never delete
- Eliminate flaky tests
- Validate requirements, not just code
- Document test patterns

**Outputs:**
- Test suites with >85% coverage
- `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/tester_[TICKET]_report.md`
- `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/tester_to_qa-validator_[TICKET].md`

#### Documenter Agent (Stages 2-4)
**Primary Responsibilities:**
- Update existing documentation (never duplicate)
- Maintain single source of truth
- Document as implementation progresses
- Apply anti-clutter principles

**Key Rules:**
- SEARCH first - always check if docs exist
- UPDATE > CREATE - modify existing docs
- CONSOLIDATE scattered information
- Archive deprecated docs, never delete

**Outputs:**
- Updated documentation (not new files)
- `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/documenter_[TICKET]_report.md`

---

### Stage 3: Sprint Validation

#### QA Validator Agent (backend-qa)
**Primary Responsibilities:**
- Validate all automated tests passed
- Verify frontend coverage >85%
- Verify backend coverage >85%
- Check all acceptance criteria
- Run regression suite
- Prepare for human UI/UX review

**Key Rules:**
- No workarounds - fix issues properly
- Enforce quality gates strictly
- Document all issues found
- Block release if gates fail

**Outputs:**
- `/Project_Management/Sprint_Validation/Sprint_[N]/validation_report.md`
- Quality gate pass/fail status
- Readiness for human review

---

### Stage 4: Release & Retrospective

#### Retrospective Agent
**Primary Responsibilities:**
- Analyze sprint metrics
- Calculate velocity
- Identify patterns (success and failure)
- Consolidate all work reports
- Generate improvement recommendations

**Key Rules:**
- Measure everything objectively
- Document bugs and fixes (no workarounds)
- Track tool issues
- Feed improvements back to process

**Outputs:**
- `/Project_Management/Sprint_Retrospectives/Sprint_[N]_retrospective.md`
- Velocity calculations
- Action items for next sprint
- Process improvements

---

## 🔄 Agent Handoff Flow

### Standard Handoff Chain
```
Stage 1: Architect → Main Claude
    ↓
Stage 2: Main Claude → Coder → Tester
                    ↘        ↗
                     Documenter (continuous)
    ↓
Stage 3: Tester → QA Validator
    ↓
Stage 4: QA Validator → Retrospective → Human
```

### Handoff Locations
All handoffs stored in:
`/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`

Format: `[from_agent]_to_[to_agent]_[TICKET]_[date].md`

### Handoff Content Requirements
Every handoff must include:
- Work completed
- Key findings/decisions
- Files modified
- Known issues
- Next steps
- Context for receiving agent

---

## 📁 STAD Folder Organization

### Source Code
```
/src/
  /[module]/
    index.ts              # Entry point
    types.ts              # Type definitions
    /utils/               # Utilities
    /__tests__/           # Tests
    /archive/             # Archived code
```

### Documentation
```
/docs/
  /features/              # Feature docs
  /api/                   # API docs
  /guides/                # User guides
  /development/           # Dev docs
  /archive/               # Archived docs
```

### Project Management
```
/Project_Management/
  /Specs/                 # Ticket specs
  /Sprint_Execution/      # Sprint artifacts
    /Sprint_[N]/
      /agent_handoffs/    # Agent collaboration
      /work_reports/      # Work documentation
  /Sprint_Validation/     # Validation reports
  /Sprint_Retrospectives/ # Retrospectives
  /Decision_Requests/     # Blocked decisions
  /Bug_Reports/           # Bug tracking
  /Archive/               # Archived files
```

---

## 🚫 Archive Policy (Never Delete)

### Universal Rule
**NEVER** use `rm`, `delete`, or `unlink` commands

### Archive Process
1. Move file to appropriate `/archive/` folder
2. Rename: `[filename]_archived_[YYYYMMDD]_[reason].[ext]`
3. Document reason in filename
4. Update any references

### Archive Locations
- Code: `/src/[module]/archive/`
- Tests: `/src/[module]/__tests__/archive/`
- Docs: `/docs/archive/`
- Project: `/Project_Management/Archive/`

---

## 🚧 Blocker Handling

### Type 1: Bugs/Tool Failures
**Resolution:** Fix immediately
- Use bug_fix_recipe.md
- Activate debug agent if needed
- Document fix in work report
- Add regression test
- NO WORKAROUNDS

### Type 2: Design Decisions
**Resolution:** Escalate to human
- Mark ticket BLOCKED
- Create decision request
- Document in `/Project_Management/Decision_Requests/`
- Alert: "HD, DECISION NEEDED: [description]"
- Wait for human decision

---

## ✅ Quality Gates

### Stage 2 → Stage 3 Gates
- [ ] All code implemented per spec
- [ ] Tests written (>85% coverage)
- [ ] Lint/typecheck passing
- [ ] Documentation updated
- [ ] No known bugs

### Stage 3 → Stage 4 Gates
- [ ] All automated tests passing
- [ ] Frontend coverage >85%
- [ ] Backend coverage >85%
- [ ] Acceptance criteria met
- [ ] Performance validated
- [ ] Security checked
- [ ] Ready for human review

---

## 📊 Metrics and Tracking

### Required Metrics
- **Velocity:** Story points per sprint
- **Coverage:** Frontend and backend percentages
- **Bug Rate:** Bugs found vs fixed
- **Blocker Time:** Time lost to blockers
- **Quality Gates:** Pass/fail rates

### Tracking Locations
- GitHub Project boards
- Work reports
- Sprint retrospectives
- Knowledge graph (MCP Memory tool)

---

## 🔧 MCP Tools Integration

### Memory/Knowledge Graph
All agents should:
- Search for existing patterns before creating
- Document new patterns discovered
- Add observations to existing entities
- Update after significant work

### Filesystem Tools
Prefer MCP filesystem tools:
- `mcp__filesystem__read_file()` over Read
- `mcp__filesystem__edit_file()` for precise edits
- `mcp__filesystem__search_files()` for discovery

---

## 📈 Continuous Improvement

### Sprint Retrospectives Feed Into:
1. Agent prompt updates
2. Process refinements
3. Template improvements
4. Tool enhancements
5. Documentation updates

### Knowledge Capture
- Document patterns in knowledge graph
- Update this guide with learnings
- Share insights across sprints
- Build on successes

---

## 🎯 Success Indicators

### Stage 1 Success
- Zero ambiguity in specs
- All decisions documented
- Dependencies mapped
- Edge cases covered

### Stage 2 Success
- Zero-intervention execution
- No design decisions needed
- All work per spec
- Handoffs created

### Stage 3 Success
- All tests passing
- Quality gates met
- Issues fixed properly
- Ready for human review

### Stage 4 Success
- Metrics analyzed
- Patterns identified
- Improvements documented
- Knowledge captured

---

## 🚀 Quick Reference

### Agent Commands
```bash
# Stage 1: Planning
/sprint-plan

# Stage 2-3: Execution & Validation
/execute

# Stage 4: Retrospective
/sprint-approved
```

### Key Files
- Specs: `/Project_Management/Specs/`
- Plans: `/Project_Management/Sprint_Plans/`
- Reports: `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/`
- Handoffs: `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`

### Status Flow
```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → 
QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE
```

---

## 📚 Related Documentation

- [STAD Quick Reference](/docs/guides/STAD_Quick_Reference_Claude.md)
- [Development Standards Guide](/Development_Standards/Guides/Development Standards Guide.md)
- [Sprint Preparation Recipe](/recipes/sprint_preparation_recipe.md)
- [Sprint Execution Recipe](/recipes/sprint_execution_recipe.md)
- [Bug Fix Recipe](/recipes/bug_fix_recipe.md)

---

*This guide is the single source of truth for STAD agent integration. Updated as of Sprint 8.*