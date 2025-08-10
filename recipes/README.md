---
title: Recipes Directory
description: Proven workflow patterns and agent combinations for common development tasks
type: guide
category: documentation
tags: [recipes, workflows, patterns, development, agents, best-practices]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Recipe Directory

## Purpose
Proven workflow patterns and agent combinations for common development tasks.

## 🚫 Anti-Clutter Rules

### Before Creating a New Recipe
1. **Check existing recipes** - Might already be covered
2. **Is this a pattern?** - One-time workflows don't need recipes
3. **Can we extend existing?** - Add variations instead of new files
4. **Will others use this?** - Must be generally applicable

### Recipe Creation Criteria
Only create a new recipe when:
- Pattern used successfully 3+ times
- Significantly different from existing recipes
- General enough for multiple projects
- Complex enough to need documentation

## Current Recipes

| Recipe | Purpose | Complexity | Agents Used |
|--------|---------|------------|-------------|
| `api_feature_recipe.md` | REST API development | Medium | 5-6 agents |
| `bug_fix_recipe.md` | Systematic debugging | Low-Medium | 3-4 agents |
| `clean_code_enforcement.md` | Anti-clutter workflow | Medium | 4-5 agents |
| `complex_refactoring_workflow.md` | Large-scale code reorganization | High | 4-5 agents |
| `database_migration_workflow.md` | Zero-downtime schema changes | High | 4-5 agents |
| `documentation_standardization_recipe.md` | Documentation audit & optimization | High | 3-4 agents |
| `full_stack_feature_recipe.md` | Complete feature development | High | 5-6 agents |
| `mcp_server_recipe.md` | MCP implementation | High | 5-6 agents |
| `memory_sync_recipe.md` | Knowledge graph syncing | Low | 2-3 agents |
| `performance_optimization_recipe.md` | Performance bottleneck resolution | High | 4-5 agents |
| `quality_first_recipe.md` | Quality-focused workflow | High | 5-6 agents |
| `security_audit_recipe.md` | Security review | High | 4-5 agents |
| `sprint_execution_recipe.md` | Sprint implementation orchestration | High | 5-6 agents |
| `sprint_planning_recipe.md` | Automated sprint planning & spec generation | High | 2-3 agents |
| `tdd_development_cycle_recipe.md` | Test-driven development | Medium | 4-5 agents |

## File Naming Convention
- **Format**: `[workflow]_recipe.md`
- **Style**: lowercase, underscored
- **Examples**: `api_feature_recipe.md`, `bug_fix_recipe.md`

## Required Sections for New Recipes
Every recipe MUST include:

1. **Overview** - What this recipe solves
2. **Use Case** - When to use this recipe
3. **Agent Sequence** - Order of agent usage
4. **Step-by-Step Process** - Detailed workflow
5. **Anti-Clutter Checks** - Prevent redundancy
6. **Success Criteria** - How to measure success
7. **Complexity Level** - Simple, Medium, Complex
8. **Common Issues** - Known problems and solutions

## Recipe Template
```markdown
# Recipe: [Workflow Name]

## Overview
[Brief description of what this recipe accomplishes]

## Philosophy
[Core principle driving this workflow]

## Use Case
- [Scenario 1]
- [Scenario 2]

## Agent Sequence
1. /agent:[name] - [Purpose]
2. /agent:[name] - [Purpose]

## Step-by-Step Process

### Phase 1: [Name]
**Anti-Clutter Check**: Search for existing [thing] first

[Detailed steps...]

## Agent-Specific Prompts (Optional)
Include this section ONLY if agents need specialized prompts beyond their base definition.

### For [agent-name]:
```
[Specialized prompt text that enhances the agent for this specific recipe]
```

## Success Criteria
- [ ] [Measurable outcome]
- [ ] [Quality metric]

## Complexity Level
**Level:** [Simple/Medium/Complex]
**Story Points:** [1-13 range]
**Prerequisites:** [Required skills/tools]

## Common Issues and Solutions
| Issue | Solution |
|-------|----------|
| [Problem] | [Fix] |
```

## Parallel Execution Patterns

### Maximizing Quality with Parallel Agents
Our recipes leverage parallel execution to improve quality coverage without sacrificing thoroughness. Common patterns include:

#### Analysis Phase Parallelization
- **Pattern**: Run analysis agents simultaneously for comprehensive baseline
- **Example**: `performance` + `memory-sync` for complete system understanding
- **Benefit**: More thorough analysis without sequential delays

#### Quality Assurance Parallelization  
- **Pattern**: Run multiple validation agents simultaneously after implementation
- **Example**: `tester` + `security` + `performance` comprehensive validation
- **Benefit**: Complete quality coverage in parallel

#### Documentation & Sync Parallelization
- **Pattern**: Update documentation and knowledge graph simultaneously
- **Example**: `documenter` + `memory-sync` for complete information capture
- **Benefit**: Comprehensive documentation without sequential overhead

### Parallel Execution Guidelines
1. **Maximum 5 agents** can run simultaneously (system constraint)
2. **Respect dependencies** - Some phases must be sequential
3. **Monitor resources** - Parallel execution increases system load
4. **Batch related work** - Group agents working on similar contexts

## Recipe Quality Standards

### Good Recipe Characteristics
- **Reproducible** - Anyone can follow it
- **Specific** - Clear, actionable steps
- **Measured** - Has success criteria
- **Efficient** - Optimized over time
- **Anti-clutter** - Includes duplicate prevention

### Recipe Evolution
- Start as draft after first success
- Refine after 3 uses
- Promote to stable after 5 successes
- Archive if unused for 6 months

## Maintenance

### Regular Review (Quarterly)
- Remove unused recipes
- Consolidate similar workflows
- Update based on learnings
- Add new proven patterns

### Quality Checks
- [ ] No duplicate recipes
- [ ] All include anti-clutter checks
- [ ] Time estimates are accurate
- [ ] Success criteria are measurable

## Recipe Variations
Instead of creating new recipes, add variations:

```markdown
## Recipe Variations

### [Variation Name]
- Different in: [What changes]
- When to use: [Specific scenario]
- Modified steps: [Which steps change]
```

---

*Remember: Quality recipes from real experience > Theoretical workflows*