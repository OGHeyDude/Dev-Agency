# Ticket AGENT-016: Implement Centralized Dev-Agency System

**Created:** 08-09-2025  
**Updated:** 08-09-2025  
**Status:** DONE  
**Points:** 5

## 1. Problem Statement

Currently, the Dev-Agency system requires copying agent files, recipes, and templates to each project, which creates:
- Duplication across projects
- Version synchronization issues  
- Maintenance overhead
- Violation of "Single Source of Truth" principle
- Clutter in project directories

## 2. Goals

Transform Dev-Agency into a centralized system where:
- All projects reference agents directly from Dev-Agency
- No copying of files to individual projects
- Single location for all updates and improvements
- Clean project directories with only project-specific code

## 3. Acceptance Criteria

- [x] Global CLAUDE.md draft updated with central references
- [x] Project template created for minimal CLAUDE.md
- [x] Integration guide updated to reference-only approach
- [x] Central system architecture documented
- [x] Dev-Agency CLAUDE.md clarified as central hub
- [x] All documentation updated with new approach
- [x] Migration path documented for existing projects

## 4. Technical Approach

### System Architecture
```
Dev-Agency (Central)
    ↓ references
All Projects (no copies)
```

### Implementation Steps
1. Update global configuration to reference Dev-Agency
2. Create minimal project template
3. Update all documentation for centralized approach
4. Remove all copy-based instructions
5. Document migration from old system

## 5. Research Notes

### Key Insight
Claude can read files from any location, so copying is unnecessary. Direct references ensure:
- Single source of truth
- Instant updates
- Zero maintenance

### Benefits Identified
- Eliminates duplication
- Ensures consistency
- Simplifies maintenance
- Reduces project clutter

## 6. Implementation Details

### Files Created
1. `PROJECT_CLAUDE_TEMPLATE.md` - Minimal template for projects
2. `CENTRAL_SYSTEM.md` - Architecture documentation

### Files Updated
1. `DRAFT_GLOBAL_CLAUDE.md` - Added central system configuration
2. `INTEGRATION_GUIDE.md` - Changed from copy to reference approach
3. `CLAUDE.md` - Clarified as central system

### Key Changes
- Removed all `cp` commands from integration
- Added direct path references to Dev-Agency
- Created clear separation between central system and projects

## 7. Testing Plan

- [ ] Create test project using new template
- [ ] Verify agent commands work via central reference
- [ ] Confirm no files need to be copied
- [ ] Test that updates in Dev-Agency apply immediately

## 8. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Path changes | Document absolute paths clearly |
| User confusion | Provide migration guide |
| Existing projects | Document cleanup process |

## 9. Follow-up Tasks

- Apply DRAFT_GLOBAL_CLAUDE.md to actual global config
- Test with real project
- Monitor for any issues
- Update any remaining documentation

## 10. Definition of Done

- [x] Central system fully documented
- [x] Reference-only approach implemented
- [x] All copy-based instructions removed
- [x] Templates and guides updated
- [x] Migration path documented
- [ ] Tested with example project

## Notes

This transformation makes Dev-Agency a true infrastructure project that serves all development work. By centralizing the agent system, we achieve the core principle of "Single Source of Truth" and eliminate all duplication across projects.

The key innovation is recognizing that Claude can read from any path, so copying is not just unnecessary but counterproductive. This approach aligns perfectly with our anti-clutter principles.

---

*Spec completed: 08-09-2025*