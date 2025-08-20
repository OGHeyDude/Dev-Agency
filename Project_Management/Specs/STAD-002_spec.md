# STAD-002 Specification: Align Coder Agent with STAD Stage 2 (Sprint Execution)

**Ticket ID:** STAD-002  
**Story Points:** 3  
**Epic:** Prompt Engineering  
**Sprint:** 8  
**Created:** 08-12-2025  
**Updated:** 08-17-2025  
**STAD Stage Focus:** Stage 1 (Sprint Preparation)

---

## Description

Update the Coder Agent to focus specifically on Stage 2 (Sprint Execution) of STAD Protocol v5.1. The agent must understand folder organization rules, implement the archive-don't-delete policy, work autonomously based on Stage 1 specifications, and create agent handoff reports for collaboration with other implementation agents.

## Current State

The Coder Agent currently handles general implementation tasks but lacks:
- Specific STAD Stage 2 focus and autonomous execution
- Knowledge of STAD folder organization rules
- Archive policy implementation
- Agent handoff report templates
- Understanding of Stage 1 specification format
- Clear boundaries for Stage 2 execution

## Acceptance Criteria

- [ ] Coder Agent prompt updated to focus on STAD Stage 2 (Sprint Execution)
- [ ] Agent works autonomously based on Stage 1 comprehensive specifications
- [ ] Agent understands and follows STAD folder organization rules
- [ ] Agent implements archive-don't-delete policy
- [ ] Agent creates standardized agent handoff reports
- [ ] Agent knows where to save handoffs (`/Project_Management/Sprint_Execution/Sprint_[N]/agent_handoffs/`)
- [ ] Agent knows correct locations for different file types per STAD structure
- [ ] Agent archives old files instead of deleting them
- [ ] Agent operates without requiring Stage 1 clarification
- [ ] Updated prompt enables autonomous Stage 2 execution

## STAD Implementation Approach

This ticket implements changes to align the Coder Agent with STAD Protocol v5.1 Stage 2 (Sprint Execution). The implementation focuses on:

1. **Autonomous Execution**: Agent works without Stage 1 clarification
2. **Handoff Generation**: Creates reports for other Stage 2 agents
3. **STAD Compliance**: Follows folder structure and archive policies
4. **Quality Focus**: Maintains enterprise-grade implementation standards

### Implementation Tasks
- Review current coder.md file and identify gaps
- Design new prompt structure for STAD Stage 2 autonomous execution
- Update coder.md with STAD-aligned prompt
- Create agent handoff report templates
- Add folder organization rules per STAD structure
- Implement archive policy instructions
- Test with sample implementation scenario
- Validate handoff report quality
- Update agent documentation

## Dependencies

### Depends On:
- STAD-005 (Templates must be created first)
- STAD-006 (Folder organization rules must be defined)

### Blocks:
- None directly

## Agent Assignment

**Recommended Agent:** Coder Agent (with Main Claude orchestration)  
**Reason:** This is primarily a prompt engineering and file update task

## Deliverables

1. **Updated coder.md** with Stage 3 focus
2. **Implementation summary template** for Coder Agent use
3. **Folder rules reference** embedded in prompt
4. **Archive policy** instructions
5. **Documentation** of changes

## Folder Rules to Include

```markdown
## Folder Organization Rules

### Source Code
/src/
  /[module]/
    index.ts              # Module entry point
    types.ts              # Type definitions
    /utils/               # Utility functions
    /__tests__/           # Tests (Tester Agent handles)
    /archive/             # Module-specific archive

### Documentation (Documenter Agent handles)
/docs/
  /features/              # Feature docs
  /api/                   # API docs
  /guides/                # User guides

### Project Management
/Project_Management/
  /Specs/[TICKET]/        # All stage outputs here
  /Archive/               # Project-level archive

### Archive Policy
- NEVER use rm, delete, or unlink commands
- Move to /Archive/ or /[module]/archive/
- Rename as: [filename]_archived_[YYYYMMDD]_[reason].[ext]
- Include brief reason for archiving
```

## Agent Handoff Template Structure

```markdown
# Agent Handoff Report - Coder Agent - [TICKET-ID]

**Sprint:** [N]  
**Stage:** 2 (Sprint Execution)  
**Date:** [YYYY-MM-DD]  
**Handoff To:** [Next Agent or Stage 3 Validation]

## Stage 1 Specification Input
[Brief summary of comprehensive spec received from Architect Agent]

## Implementation Completed
[Clear description of what was implemented]

## Files Created/Modified
### New Files
- `path/to/new/file.ts` - [Purpose and functionality]

### Modified Files
- `path/to/existing/file.ts` - [Changes made and rationale]

### Archived Files
- `old/file.ts` → `/Archive/2025/08/file_archived_20250817_refactored.ts`
  **Reason:** Replaced with STAD-compliant implementation

## STAD Compliance
- ✅ Followed STAD folder structure
- ✅ Applied archive-don't-delete policy
- ✅ Used enterprise-grade patterns
- ✅ No Stage 1 clarification required

## Integration Status
- **Connected Components:** [List of integrated systems]
- **API Contracts:** [New or modified interfaces]
- **Dependencies:** [External dependencies added/updated]

## Quality Assurance Notes
- **Code Coverage:** [Self-assessment]
- **Performance Considerations:** [Any performance implications]
- **Security Review:** [Security considerations addressed]

## Handoff for Next Agents
### For Tester Agent
- [Specific testing requirements or edge cases]
- [Test data or scenarios needed]

### For Documenter Agent
- [Documentation updates required]
- [New features to document]

## Outstanding Items
- [Any items that need follow-up]
- [Dependencies waiting on other agents]

## STAD Stage 2 Assessment
- **Autonomous Execution:** [Success level 1-5]
- **Specification Clarity:** [How clear Stage 1 specs were]
- **Zero Intervention:** [Achieved yes/no]
```

## Success Metrics

- Coder Agent operates autonomously in STAD Stage 2 without Stage 1 clarification
- Agent consistently follows STAD folder organization rules
- No files are deleted (only archived per STAD policy)
- Agent handoff reports include all required sections
- Files are created in correct STAD structure locations
- Archive includes clear reasons and follows STAD naming conventions
- Agent enables zero-intervention Stage 2 execution

## Notes

- Focus on STAD Stage 2 autonomous execution
- Agent must work independently based on Stage 1 comprehensive specs
- Ensure STAD folder structure compliance
- Archive policy must follow STAD naming conventions
- Handoff reports enable seamless agent collaboration
- Maintain enterprise-grade code quality standards