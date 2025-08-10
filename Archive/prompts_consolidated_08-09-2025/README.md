---
title: Prompts Directory
description: Domain-specific prompt templates and versions for optimal agent performance
type: guide
category: documentation
tags: [prompts, templates, agents, versioning, optimization, ai]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Prompts Directory

## Purpose
Domain-specific prompt templates and versions for optimal agent performance.

## 🚫 Anti-Clutter Rules

### Before Creating New Prompts
1. **Check existing prompts** - Reuse or modify existing
2. **Version existing prompts** - Don't create new files for iterations
3. **Consolidate similar prompts** - One prompt for similar tasks
4. **Reference, don't duplicate** - Link to prompts, don't copy

### Prompt Storage Rules
- Start with generic prompt in agent definition
- Only create separate file after 3+ refinements
- Version prompts instead of creating new files
- Archive old versions, don't delete

## Directory Structure

```
/prompts/
├── README.md       # This file
└── [Create subdirectories only when adding actual prompt files]
    ├── /web-api/   # REST API prompts (when created)
    ├── /mcp/       # MCP protocol prompts (when created)
    ├── /frontend/  # UI/Frontend prompts (when created)
    └── /backend/   # Server-side prompts (when created)
```

**Note:** Empty directories are clutter. Only create subdirectories when you have actual prompt files to add.

## File Naming Convention
- **Format**: `[agent]_v[version].md`
- **Version**: `v[Major].[Minor].[Patch]`
- **Examples**: `coder_v1.0.0.md`, `architect_v2.1.0.md`

## Versioning Guidelines

### When to Version
- **Major (1.0.0 → 2.0.0)**: Complete restructuring
- **Minor (1.0.0 → 1.1.0)**: New capabilities added
- **Patch (1.0.0 → 1.0.1)**: Small improvements

### Version File Structure
```markdown
# [Agent] Prompt v[Version]

## Change Log
- v1.0.1: Fixed clarity issue with requirements
- v1.0.0: Initial stable version

## Prompt
[Actual prompt content]

## Context Requirements
[What context this prompt needs]

## Success Metrics
[How to measure if prompt works]
```

## Prompt Quality Standards

### Good Prompt Characteristics
- **Specific** - Clear, unambiguous instructions
- **Contextual** - Includes necessary context
- **Measurable** - Has success criteria
- **Reusable** - Works across similar tasks
- **Anti-clutter** - Includes duplicate checks

### Prompt Testing
Before promoting to stable:
1. Test on 3+ different tasks
2. Measure success rate
3. Get token efficiency metrics
4. Document edge cases

## Consolidation Rules

### When to Consolidate
- Multiple prompts doing similar things
- Prompts with 80%+ overlap
- Domain-specific variations of same task

### How to Consolidate
```markdown
# Consolidated [Task] Prompt

## Base Prompt
[Common instructions for all variations]

## Variations
### Web API
[Additional context for web APIs]

### GraphQL
[Additional context for GraphQL]
```

## Maintenance

### Regular Review (Monthly)
- Remove unused prompts
- Consolidate similar prompts
- Update version numbers
- Archive old versions

### Quality Checks
- [ ] No duplicate prompts
- [ ] Clear versioning
- [ ] All prompts tested
- [ ] Success metrics documented

## Prompt Library Best Practices

1. **Start Simple** - Basic prompt in agent definition
2. **Iterate Based on Use** - Refine from real experience
3. **Version Systematically** - Track what changed and why
4. **Share Learnings** - Document what works
5. **Consolidate Regularly** - Prevent proliferation

---

*Remember: One excellent prompt > Ten mediocre variations*