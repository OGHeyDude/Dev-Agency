---
title: Agent System Integration Guide - Centralized Approach
description: How to use the centralized Dev-Agency agent system in any project without copying files
type: guide
category: development
tags: [integration, centralized-system, reference-only, single-source-of-truth]
created: 2025-08-09
updated: 2025-08-09
version: 2.0
status: stable
---

# Agent System Integration Guide - Centralized Approach

## Overview

**IMPORTANT UPDATE**: Dev-Agency is now a centralized system. DO NOT COPY files to projects. Instead, all projects reference Dev-Agency directly, ensuring single source of truth.

## 🎯 Centralized System Principles

**NEW APPROACH - NO COPYING**:
1. **Zero duplication** - Agents stay in Dev-Agency only
2. **Direct references** - Claude reads from Dev-Agency for all projects
3. **Single source of truth** - Edit once in Dev-Agency, applies everywhere
4. **Clean projects** - Projects only contain project-specific code

## Quick Integration (2 Minutes) - Reference Only

### Step 1: Create Project CLAUDE.md
```bash
# From your project directory
PROJECT_DIR=$(pwd)

# Copy the minimal template (this is the ONLY file you copy)
cp /home/hd/Desktop/LAB/Dev-Agency/PROJECT_CLAUDE_TEMPLATE.md $PROJECT_DIR/CLAUDE.md

# Edit to add project name and specifics
vi $PROJECT_DIR/CLAUDE.md
```

### Step 2: NO COPYING NEEDED
**Do NOT copy any of these** - Claude reads them directly from Dev-Agency:
- ❌ Do NOT copy Agents
- ❌ Do NOT copy recipes  
- ❌ Do NOT copy prompts
- ❌ Do NOT copy Development_Standards
- ❌ Do NOT copy templates

### Step 3: Optional Local Tracking
```bash
# Only if you want project-specific metrics
mkdir -p $PROJECT_DIR/{metrics,feedback}
```

## How It Works

### When You Use an Agent Command

```markdown
User (in any project): /agent:coder implement the feature
Claude: 
1. Reads `/home/hd/Desktop/LAB/Dev-Agency/Agents/coder.md`
2. Applies agent to current project context
3. No copying, no duplication
```

### Central References in Action

Your project CLAUDE.md contains:
```markdown
## Central Agent System
All agents, guides, and templates are managed centrally at:
`/home/hd/Desktop/LAB/Dev-Agency/`
```

Claude automatically:
- Reads agent definitions from Dev-Agency
- Uses templates from Dev-Agency
- Follows standards from Dev-Agency
- Applies recipes from Dev-Agency

## Benefits of Centralized Approach

### \u2705 What You Get

1. **Zero Maintenance** - No files to sync or update in projects
2. **Instant Updates** - Improvements to agents apply immediately everywhere
3. **Clean Projects** - Only project code, no infrastructure clutter
4. **Single Source of Truth** - One place to improve and evolve agents
5. **Version Consistency** - All projects use the same agent versions

### \ud83d\udeab What You Avoid

1. **No Duplication** - No copies of agents across projects
2. **No Sync Issues** - No manual updates needed
3. **No Version Conflicts** - One version for all
4. **No Scattered Files** - Clean project directories
5. **No Maintenance Overhead** - Edit once, apply everywhere

## Project-Specific Usage

### For Web Applications
In your project CLAUDE.md, note which agents are most relevant:
```markdown
## Commonly Used Agents for This Project
- `/agent:coder` - API endpoint implementation
- `/agent:security` - OWASP compliance checks
- `/agent:integration` - Service connections
- Recipe: `/home/hd/Desktop/LAB/Dev-Agency/recipes/api_feature_recipe.md`
```

### For MCP Projects
```markdown
## Commonly Used Agents for This Project
- `/agent:mcp-dev` - Protocol implementation specialist
- `/agent:integration` - System connections
- Recipe: `/home/hd/Desktop/LAB/Dev-Agency/recipes/mcp_server_recipe.md`
```

### For CLI Tools
```markdown
## Commonly Used Agents for This Project
- `/agent:coder` - Command implementation
- `/agent:tester` - CLI testing patterns
- `/agent:documenter` - Help text and man pages
```

## Integration Checklist - Centralized Approach

### Quick Setup (2 minutes)
- [ ] Copy PROJECT_CLAUDE_TEMPLATE.md to project as CLAUDE.md
- [ ] Edit project name and type
- [ ] Test an agent command
- [ ] ✅ Done! No files to copy

### Optional Enhancements
- [ ] Create local metrics directory (if needed)
- [ ] Add project-specific context to CLAUDE.md
- [ ] Document commonly used agents for this project
- [ ] Note relevant recipes from Dev-Agency

## Usage in Integrated Projects

### Basic Agent Invocation
```markdown
After research phase:

/agent:architect
[Provide requirements and context]

/agent:coder  
[Provide specification and examples]

/agent:tester
[Provide implementation to test]
```

### Using Recipes
```markdown
Following recipe: /recipes/api_feature_recipe.md

Step 1: Research existing patterns
Step 2: /agent:architect for design
Step 3: /agent:coder for implementation
...
```

### Tracking Performance
```markdown
After agent use, update:
- /metrics/agent_performance_log.md
- /feedback/agent_feedback_form.md
```

## Maintenance - Centralized System

### How to Update Agents
```bash
# Edit ONLY in Dev-Agency
cd /home/hd/Desktop/LAB/Dev-Agency/Agents/
vi coder.md  # Make improvements

# Changes apply IMMEDIATELY to all projects
# No syncing needed!
```

### Version Management
- All updates happen in Dev-Agency
- Version tracking in Dev-Agency frontmatter
- All projects automatically use latest version
- No manual syncing ever needed

## Troubleshooting

### Common Issues

**Issue:** Agent not following project patterns
**Solution:** Add project-specific examples to agent context

**Issue:** Token limits exceeded
**Solution:** Use context optimization patterns from feedback/context_improvements.md

**Issue:** Agent selection confusion
**Solution:** Refer to WORKFLOW_INTEGRATION.md selection matrix

## Benefits of Integration

1. **Consistency:** Same agent system across all projects
2. **Learning:** Improvements in one project benefit all
3. **Efficiency:** Proven recipes and prompts ready to use
4. **Quality:** Specialized agents for complex tasks
5. **Tracking:** Performance metrics guide improvements

## Migration from Old Copy-Based System

If you have projects with copied Dev-Agency files:
1. **Delete copied files**: `rm -rf ./Agents ./recipes ./prompts`
2. **Update project CLAUDE.md**: Use the new template
3. **Test**: Verify agents work via central reference

## Support

- **Central System:** `/home/hd/Desktop/LAB/Dev-Agency/`
- **Updates:** Edit in Dev-Agency, applies everywhere
- **Template:** `/home/hd/Desktop/LAB/Dev-Agency/PROJECT_CLAUDE_TEMPLATE.md`

## Quick Reference - Centralized Commands

```markdown
# In ANY project, these commands read from Dev-Agency:
/agent:architect    # Reads from Dev-Agency/Agents/architect.md
/agent:coder       # Reads from Dev-Agency/Agents/coder.md
/agent:tester      # Reads from Dev-Agency/Agents/tester.md
/agent:security    # Reads from Dev-Agency/Agents/security.md
/agent:documenter  # Reads from Dev-Agency/Agents/documenter.md

# Check agent definition:
cat /home/hd/Desktop/LAB/Dev-Agency/Agents/[agent-name].md

# Use recipe:
cat /home/hd/Desktop/LAB/Dev-Agency/recipes/[recipe-name].md
```

---

*Integration Guide Version: 2.0 - Centralized System*
*NO COPYING - Direct references only*