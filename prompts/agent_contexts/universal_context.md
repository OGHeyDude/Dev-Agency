# Universal Agent Context Template

**Version:** 1.0  
**Updated:** 2025-08-15  
**Purpose:** Standard context included for ALL agents in STAD Protocol

---

## Project Information
- **Project:** Dev-Agency - Centralized Agentic Development System
- **Sprint:** [CURRENT_SPRINT_ID]
- **Current STAD Stage:** [0-4]
- **Date:** [CURRENT_DATE]
- **Ticket:** [TICKET_ID] (if applicable)

---

## Universal Rules (ALL AGENTS MUST FOLLOW)

### 1. Archive, Don't Delete
- NEVER delete files - move to `/Archive/OLD_Dev_System/` folder
- Create archive reason: `[SUBJECT]_archive_reason_[DATE].md`
- Use template: `/docs/reference/templates/archive_reason_template.md`

### 2. Single Source of Truth
- Check for existing implementations before creating new
- Update existing documentation rather than creating new files
- Consolidate scattered information
- Use `Grep` and `Glob` tools to search first

### 3. Knowledge Graph Usage
- Graph Structure: `Entities (nodes) → Relations (edges) → Observations (properties)`
- Query before creating: `mcp__memory__search_nodes({ query: "term" })`
- Update after changes: `mcp__memory__add_observations()`
- Use template: `/docs/reference/templates/knowledge_graph_update_template.md`

### 3.1. MCP Tools Available
**All agents have access to these MCP (Model Context Protocol) tools:**

#### Memory/Knowledge Graph Tools
- `mcp__memory__search_nodes({ query })` - Search existing knowledge
- `mcp__memory__create_entities([{ name, entityType, observations }])` - Document new knowledge
- `mcp__memory__add_observations([{ entityName, contents }])` - Add insights to existing entities
- `mcp__memory__read_graph()` - Get full knowledge graph state
- `mcp__memory__open_nodes({ names })` - Get specific entities by name

#### Filesystem Tools (Preferred over standard tools)
- `mcp__filesystem__read_file({ path })` - Read files with enhanced capabilities
- `mcp__filesystem__write_file({ path, content })` - Create files with validation
- `mcp__filesystem__edit_file({ path, oldContent, newContent })` - Precise file editing
- `mcp__filesystem__search_files({ path, pattern })` - Find files with advanced patterns
- `mcp__filesystem__list_directory({ path })` - Explore directory structure
- `mcp__filesystem__move_file({ sourcePath, destinationPath })` - Reorganize files

#### IDE Integration Tools (For development agents)
- `mcp__ide__getDiagnostics({ uri })` - Get real-time code diagnostics
- `mcp__ide__executeCode({ code })` - Execute code snippets for testing

#### Standard Entity Types for Knowledge Graph
**Use these consistent entity types across all agents:**
- `architecture_decision` - ADRs and architectural choices
- `technical_component` - System components and modules  
- `code_pattern` - Reusable coding patterns and solutions
- `implementation_solution` - Complex problem solutions
- `test_pattern` - Testing approaches and strategies
- `bug_pattern` - Bug categories and fix patterns
- `documentation_pattern` - Documentation approaches
- `quality_standard` - Quality benchmarks and metrics
- `integration_pattern` - Service integration approaches
- `performance_baseline` - Performance benchmarks

### 4. Handoff Protocol
- Each agent creates a handoff document for the next agent
- Location: `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/[FROM]_to_[TO]_[TICKET].md`
- Use template: `/docs/reference/templates/agent_handoff_template.md`
- Include: Work done, decisions made, open questions, next steps

### 5. Status Updates
- Update GitHub Project board after each significant step
- Use semantic commits: `type(scope): message [TICKET-ID]`
- Log progress in agent-specific work reports
- Update ticket status according to STAD transitions

### 6. Work Reports
- Submit to: `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/[agent]_[TICKET]_report.md`
- Use template: `/docs/reference/templates/work_report_template.md`
- Include: Work completed, challenges, decisions, recommendations

### 7. Blocker Handling
- **Bugs/Tool Failures**: FIX properly (NO WORKAROUNDS)
- **Design Decisions**: Mark BLOCKED, escalate to `/Project_Management/Decision_Requests/`
- Use template: `/docs/reference/templates/blocker_escalation_template.md`

---

## Workspace Locations

### Your Workspace
- **Work Reports:** `/Project_Management/Sprint_Execution/Sprint_[N]/work_reports/`
- **Temp Files:** `/Project_Management/TEMP/[YourAgent]/`
- **Handoffs:** `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`
- **Sprint Retrospectives:** `/Project_Management/Sprint_Retrospectives/`

### Shared Resources
- **Templates:** `/docs/reference/templates/`
- **Archive:** `/Archive/OLD_Dev_System/`
- **Decision Requests:** `/Project_Management/Decision_Requests/`
- **Stage Gates:** `/Project_Management/Stage_Gates/`

---

## Knowledge Base

### Core STAD Documentation
- **STAD Protocol:** `/docs/architecture/STAD_PROTOCOL_NORTH_STAR.md`
- **Agent Playbook:** `/docs/architecture/STAD_Agent_Playbook.md`
- **STAD CLAUDE:** `/docs/architecture/STAD_CLAUDE.md`
- **Implementation Plan:** `/STAD_PROTOCOL_Implementation_Plan.md`

### Agent-Specific Guides
- **Your Guide:** `/docs/guides/[agent_name]_guide.md`
- **Best Practices:** `/docs/guides/[domain]_best_practices.md`
- **Standards:** `/docs/guides/standards/`

### Knowledge Graph Access
- Use `mcp__memory` commands for graph operations
- Query existing knowledge before creating
- Update graph after significant changes
- Maintain entity relationships

---

## Communication Protocol

### Handoff Chain
- **Previous Handoff:** [LINK_OR_NONE]
- **Next Agent:** [NEXT_AGENT_NAME]
- **Expected Handoff:** [WHAT_NEXT_AGENT_NEEDS]

### Escalation Path
1. **Warning Level:** Note in work report
2. **Blocker Level:** Create decision request
3. **Critical Level:** Tag Scrum Master agent
4. **Emergency Level:** Direct stakeholder notification

### Collaboration
- Check `/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/` for related work
- Review `/Project_Management/Work_Reports/` for context
- Coordinate through GitHub Project board
- Use semantic commit messages for traceability

---

## Stage-Specific Context

### Stage 0: Strategic Planning
- Focus: Epics and roadmap
- Output: Business requirements
- Next: Technical specifications

### Stage 1: Sprint Preparation
- Focus: Technical specs and planning
- Output: Execution plan and DAG
- Next: Implementation

### Stage 2: Sprint Execution
- Focus: Autonomous development
- Output: Working code and tests
- Next: Validation

### Stage 3: Sprint Validation
- Focus: QA and review
- Output: Validated features
- Next: Release preparation

### Stage 4: Release & Retrospective
- Focus: Deployment and learning
- Output: Released features and insights
- Next: Next sprint planning

---

## Quality Requirements

### Code Quality
- Follow `/docs/guides/coding_standards.md`
- Run linters before marking complete
- Ensure tests pass
- No hardcoded paths or credentials

### Documentation Quality
- Include frontmatter in all .md files
- Update existing docs (don't create duplicates)
- Use clear, concise language
- Include examples where helpful

### Process Quality
- Follow STAD Protocol strictly
- Complete all required templates
- Submit work reports
- Create comprehensive handoffs

---

## Success Criteria

Your work is considered complete when:
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Handoff document created
- [ ] Work report submitted
- [ ] Knowledge graph updated
- [ ] GitHub board updated
- [ ] No blockers remaining

---

## Notes

- This context is included in EVERY agent invocation
- Agent-specific context builds on this foundation
- Never skip or abbreviate these requirements
- When in doubt, check with Scrum Master agent

---

*End of Universal Context - Agent-specific context follows*