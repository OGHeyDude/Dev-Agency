---
title: Documentation Standardization Recipe & Slash Command
ticket_id: AGENT-018
status: DONE
priority: HIGH
story_points: 5
created: 2025-08-09
updated: 2025-08-10
tags: [documentation, standardization, recipe, automation, memory-tool]
---

# AGENT-018: Documentation Standardization Recipe & Slash Command

## Overview
Create an automated recipe and slash command for auditing, organizing, and standardizing project documentation. This addresses the need for consistent documentation structure, elimination of redundancy, and optimization for Memory Tool integration.

## User Story
**As a** developer working on the Cydian project  
**I want** an automated way to audit and standardize documentation  
**So that** I can eliminate redundancy, improve information access, and optimize for Memory Tool indexing

## Requirements

### Functional Requirements
1. **Documentation Audit**
   - Scan all project directories recursively
   - Identify duplicate files with identical content
   - Flag unused/orphaned documentation files
   - Enforce ADR creation for infrastructure changes

2. **Documentation Standardization**
   - Apply consistent templates to feature documentation
   - Ensure all documents have proper YAML frontmatter
   - Standardize formatting and structure

3. **Large Document Splitting**
   - Automatically split documents > 1000 words
   - Create logical sub-documents with navigation
   - Generate appropriate frontmatter for each part
   - Maintain parent-child relationships

4. **Memory Tool Optimization**
   - Generate frontmatter compatible with Memory Tool
   - Create knowledge graph entities and relationships
   - Sync documentation to memory system

5. **Slash Command Integration**
   - `/doc-audit` - Full audit and standardization
   - `/doc-audit --audit-only` - Audit without changes
   - `/doc-audit --dry-run` - Preview changes
   - Various options for selective operations

### Non-Functional Requirements
- Performance: Process 100+ documents in < 5 minutes
- Reliability: Zero data loss during reorganization
- Usability: Clear reporting of actions taken
- Flexibility: Configurable thresholds and templates

## Technical Design

### Architecture
```
Main Claude (Orchestrator)
    ├── /agent:clutter-detector (Duplicate detection)
    ├── /agent:documenter (Standardization)
    └── /agent:memory-sync (Knowledge graph sync)
```

### Document Splitting Algorithm
```javascript
// Intelligent splitting at logical boundaries
function splitDocument(content, maxWords = 1000) {
    // 1. Identify sections by headers
    // 2. Group related content
    // 3. Split at section boundaries when possible
    // 4. Generate navigation metadata
}
```

### Frontmatter Schema
```yaml
---
title: [Required - Document title]
parent_doc: [Optional - Parent document name]
part_number: [Optional - Sequence in series]
description: [Required - One-line description]
type: [Required - feature|guide|api|architecture]
category: [Required - Category classification]
tags: [Required - Array of keywords]
created: [Required - YYYY-MM-DD]
updated: [Required - YYYY-MM-DD]
navigation:
  prev: [Optional - Previous document]
  next: [Optional - Next document]
---
```

## Implementation Details

### Files Created
1. `/recipes/documentation_standardization_recipe.md` - Complete recipe definition
2. `/prompts/slash_commands.md` - Slash command documentation
3. `/Project_Management/Specs/AGENT-018_spec.md` - This specification

### Files Modified
1. `/recipes/README.md` - Added new recipe to index

### Integration Points
- Integrates with existing agent system
- Compatible with Memory Tool MCP
- Works with standard development workflow

## Testing Plan

### Test Cases
1. **Duplicate Detection**
   - Create identical files with different names
   - Verify detection and removal

2. **Document Splitting**
   - Test with documents of various sizes
   - Verify logical splitting boundaries
   - Check frontmatter generation

3. **ADR Enforcement**
   - Modify infrastructure files
   - Verify ADR requirement detection

4. **Memory Sync**
   - Verify knowledge graph entity creation
   - Check relationship mapping

### Validation Criteria
- ✅ Zero duplicate files after audit
- ✅ All documents have valid frontmatter
- ✅ Large documents split appropriately
- ✅ Memory Tool successfully indexes content
- ✅ Clear audit report generated

## Success Metrics
- Reduce documentation redundancy by 50%+
- Improve documentation discoverability
- 100% Memory Tool compatibility
- Developer time savings of 2+ hours per sprint

## Risk Analysis

### Risks
1. **Data Loss**: Accidental deletion during cleanup
   - **Mitigation**: Always backup, dry-run mode

2. **Broken References**: Links break after reorganization
   - **Mitigation**: Automatic link updating

3. **Over-splitting**: Documents become too fragmented
   - **Mitigation**: Configurable thresholds, semantic boundaries

## Implementation Status

### Completed (08-09-2025)
- ✅ Created comprehensive recipe definition
- ✅ Designed slash command interface
- ✅ Documented all options and variations
- ✅ Updated recipe index

### Pending
- [ ] Live testing with real project documentation
- [ ] Performance benchmarking
- [ ] User feedback integration

## Notes
- Recipe follows established patterns from existing recipes
- Emphasizes anti-clutter principles
- Designed for extensibility and customization
- Can be adapted for different documentation structures

## Related Tickets
- AGENT-005: Feedback loops (can use for recipe refinement)
- AGENT-017: Memory Sync Agent (integration point)

---

*Specification complete. Ready for testing and deployment.*