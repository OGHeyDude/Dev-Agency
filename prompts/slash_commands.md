---
title: Custom Slash Commands
description: Extended slash commands for specialized workflows and recipes
type: guide
category: commands
tags: [commands, automation, recipes, workflow]
created: 2025-08-09
updated: 2025-08-09
---

# Custom Slash Commands

## Sprint Planning Commands

### `/sprint-plan` - Automated Sprint Planning
**Purpose:** Comprehensive sprint planning with ticket selection, spec writing, and documentation mapping  
**Recipe:** `/recipes/sprint_planning_recipe.md`  
**Agents Used:** `architect`, `documenter`

#### Basic Usage
```bash
/sprint-plan
```

#### Options
```bash
/sprint-plan --points 40        # Custom point target (default: 30-35)
/sprint-plan --priority security # Focus on specific epic/category
/sprint-plan --continue         # Include existing in-progress work
/sprint-plan --team-size 3      # Adjust for team capacity
/sprint-plan --duration 1-week  # Shorter sprint duration
/sprint-plan --quick            # Emergency planning (minimal specs)
/sprint-plan --max-agents 3     # Limit parallel planning agents
```

#### What It Does
1. **Analysis Phase:**
   - Reviews previous sprint velocity
   - Identifies carry-over work
   - Assesses team capacity

2. **Ticket Selection:**
   - Selects 30-35 story points of work
   - Prioritizes critical issues first
   - Balances ticket sizes

3. **Spec Generation:**
   - Writes specs for all tickets without them
   - Includes acceptance criteria
   - Maps documentation needs

4. **Documentation Planning:**
   - Identifies docs to read for context
   - Lists docs needing updates
   - Plans new documentation

5. **Dependency Analysis:**
   - Creates dependency graph
   - Identifies blockers
   - Suggests optimal work sequence

6. **Context Preparation:**
   - Gathers relevant files for each ticket
   - Prepares agent context packages
   - Eliminates implementation guesswork

#### Output Example
```
📅 Sprint 4 Plan Generated
================================
Sprint Goal: Resolve critical issues and complete agent system
Points: 33 | Tickets: 7 | Duration: 2 weeks

Selected Tickets:
1. SECURITY-001 (5 pts) - Critical security fix
2. BUILD-001 (2 pts) - TypeScript compilation
3. AGENT-010 (3 pts) - Complete context optimizer
...

Documentation Roadmap:
- 12 docs to read for context
- 8 docs requiring updates
- 3 new docs to create

Work Sequence:
Week 1: SECURITY-001 → BUILD-001 → AGENT-010
Week 2: AGENT-005 → AGENT-004 → AGENT-007

Dependencies Identified:
- BUILD-001 blocks all development
- AGENT-010 must complete before AGENT-005

Risk Mitigations:
- Security fix allocated extra buffer
- Parallel work identified for efficiency

✅ All specs written
✅ Context packages prepared
✅ Ready to start sprint
```

### `/sprint-execute` - Sprint Execution Strategy
**Purpose:** Create optimal implementation strategy for executing a planned sprint  
**Recipe:** `/recipes/sprint_execution_recipe.md`  
**Agents Used:** `architect`, `coder`, `tester`, `security`, `documenter`, `memory-sync`

#### Basic Usage
```bash
/sprint-execute
```

#### Options
```bash
/sprint-execute --max-agents 3      # Limit parallel execution agents (default: 5)
/sprint-execute --tickets AGENT-010 # Execute specific tickets only
/sprint-execute --dry-run          # Preview execution strategy
/sprint-execute --continue         # Resume interrupted execution
/sprint-execute --recipe-override  # Use custom recipes for tickets
/sprint-execute --status           # Check current execution progress
```

#### What It Does
1. **Sprint Loading:**
   - Reads planned sprint from `/sprint-plan`
   - Loads all ticket specs and dependencies
   - Identifies current statuses

2. **Execution Planning:**
   - Creates dependency-aware execution order
   - Assigns agents to each ticket
   - Selects appropriate recipes

3. **Parallel Orchestration:**
   - Manages up to 5 agents simultaneously
   - Dynamically schedules based on dependencies
   - Optimizes agent utilization

4. **Implementation:**
   - Executes tickets using assigned recipes
   - Maintains quality gates
   - Handles testing and reviews

5. **Memory & Commits:**
   - Syncs changes to knowledge graph
   - Creates conventional commits
   - Updates ticket statuses to DONE

6. **Progress Tracking:**
   - Real-time execution monitoring
   - Daily status reports
   - Blocker identification

#### Output Example
```
🚀 Sprint Execution Strategy Generated
================================
Sprint: Sprint 4 | Tickets: 7 | Duration: 2 weeks

Execution Order:
1. BUILD-001 → 2. SECURITY-001 → 3. AGENT-010 → ...

Agent Assignments:
- BUILD-001: coder + tester (bug_fix_recipe)
- SECURITY-001: architect + security + tester (security_audit_recipe)
- AGENT-010: architect + coder + documenter (performance_recipe)

Parallel Groups:
Day 1-2: BUILD-001 (2 agents) | Research (1 agent)
Day 3-4: SECURITY-001 (3 agents) | AGENT-010 (2 agents)
Day 5: Testing (4 agents) | Docs (1 agent)

Quality Gates: Enabled
Memory Sync: After each ticket
Commit Strategy: One per ticket

✅ Execution plan ready
✅ Agent schedule optimized
✅ Dependencies respected
```

#### Sprint Workflow Integration
```bash
# Complete sprint workflow
/sprint-plan          # Plan WHAT to build
[Review & Approve]
/sprint-execute       # Execute HOW to build
[Monitor Progress]
/sprint-execute --status
```

## Documentation Commands

### `/doc-audit` - Documentation Standardization & Audit
**Purpose:** Comprehensive documentation audit and standardization workflow  
**Recipe:** `/recipes/documentation_standardization_recipe.md`  
**Agents Used:** `documenter`, `clutter-detector`, `memory-sync`

#### Basic Usage
```bash
/doc-audit
```

#### Options
```bash
/doc-audit --audit-only      # Run audit without making changes
/doc-audit --dry-run         # Preview changes without applying
/doc-audit --path docs/      # Limit to specific directory
/doc-audit --skip-adr        # Skip ADR enforcement check
/doc-audit --adr-only        # Only check/enforce ADRs
/doc-audit --memory-optimize # Only optimize for Memory Tool
/doc-audit --max-words 500   # Custom word limit for splitting
```

#### What It Does
1. **Audit Phase:**
   - Scans for duplicate documentation files
   - Identifies orphaned/unused documentation
   - Checks for missing ADRs for infrastructure changes

2. **Standardization Phase:**
   - Applies consistent templates to feature docs
   - Ensures all docs have proper frontmatter
   - Standardizes formatting and structure

3. **Optimization Phase:**
   - Splits large documents (>1000 words) into parts
   - Generates navigation frontmatter
   - Creates parent-child relationships

4. **Memory Sync Phase:**
   - Syncs all documentation to knowledge graph
   - Creates entities and relationships
   - Optimizes for Memory Tool queries

#### Output Example
```
📊 Documentation Audit Report
================================
✅ Duplicates found: 3
   - auth.md == authentication.md
   - setup.md == installation.md
   - api-guide.md == api-reference.md

⚠️ Orphaned files: 5
   - old-notes.md (no references)
   - draft-spec.md (no references)
   ...

🔍 Missing ADRs: 2
   - terraform/vpc.tf changed without ADR
   - k8s/deployment.yaml changed without ADR

📝 Documents to split: 4
   - authentication.md (1,543 words)
   - api-reference.md (2,100 words)
   ...

Actions taken:
- Removed 3 duplicate files
- Created 2 ADR templates
- Split 4 large documents into 12 parts
- Synced 45 documents to Memory Tool
```

### `/doc-template` - Apply Documentation Template
**Purpose:** Apply standardized template to a specific document  
**Quick Action:** Single document standardization

```bash
/doc-template docs/features/auth.md
/doc-template --type feature docs/new-feature.md
/doc-template --type adr docs/adrs/ADR-0001.md
```

### `/doc-split` - Split Large Document
**Purpose:** Split a single large document into smaller parts  
**Quick Action:** Document splitting with frontmatter

```bash
/doc-split docs/comprehensive-guide.md
/doc-split --max-words 500 docs/api-reference.md
/doc-split --preserve-sections docs/user-manual.md
```

## Recipe Execution Commands

### `/recipe` - Execute Named Recipe
**Purpose:** Execute any recipe by name  
**Usage:**
```bash
/recipe documentation_standardization
/recipe api_feature --context "user authentication"
/recipe bug_fix --ticket "BUG-123"
```

### `/recipe-chain` - Chain Multiple Recipes
**Purpose:** Execute multiple recipes in sequence  
**Usage:**
```bash
/recipe-chain security_audit,performance_optimization
/recipe-chain clean_code,documentation_standardization
```

## Integration with Main Workflow

These commands integrate with the standard workflow:

```bash
# Standard workflow with documentation audit
/cmd → /research → /plan → /build → /test → /doc-audit → /document → /done

# Quick documentation cleanup
/doc-audit --audit-only → /doc-audit --dry-run → /doc-audit

# ADR enforcement workflow
/doc-audit --adr-only → /agent:documenter → /commit
```

## Command Implementation Pattern

Each slash command follows this pattern:

1. **Parse Arguments:** Extract options and parameters
2. **Load Recipe:** Read the corresponding recipe file
3. **Prepare Context:** Gather necessary information
4. **Execute Agents:** Run agents in specified sequence
5. **Report Results:** Provide summary and next steps

## Adding New Commands

To add a new slash command:

1. Create recipe in `/recipes/[recipe_name].md`
2. Add command definition here in `/prompts/slash_commands.md`
3. Document options and usage
4. Test with sample data
5. Update main CLAUDE.md with new command

## Command Aliases

For convenience, these aliases are available:

```bash
/sp     → /sprint-plan
/se     → /sprint-execute
/da     → /doc-audit
/dt     → /doc-template
/ds     → /doc-split
/rc     → /recipe
/rcc    → /recipe-chain
```

---

*Note: Commands are implemented through Claude's interpretation of recipes and agent invocations. Actual execution depends on the current project context and available tools.*