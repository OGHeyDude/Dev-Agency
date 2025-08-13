---
title: Complete Dev-Agency Command Reference
description: Comprehensive reference for all Dev-Agency commands, slash commands, CLI tools, and agent invocations
type: reference
category: commands
tags: [commands, reference, cli, agents, slash-commands, workflows]
created: 2025-08-10
updated: 2025-08-10
---

# Complete Dev-Agency Command Reference

This reference provides complete documentation for all Dev-Agency commands, organized by category for quick access.

## Table of Contents

- [Quick Reference Tables](#quick-reference-tables)
- [Core Development Workflow Commands](#core-development-workflow-commands)
- [Agent Invocation Commands](#agent-invocation-commands)
- [Sprint Management Commands](#sprint-management-commands)
- [Documentation Management Commands](#documentation-management-commands)
- [Memory Sync Commands](#memory-sync-commands)
- [CLI Tool Commands](#cli-tool-commands)
- [Recipe Execution Commands](#recipe-execution-commands)
- [Session Management Commands](#session-management-commands)
- [Context and Environment Commands](#context-and-environment-commands)
- [Advanced Usage Patterns](#advanced-usage-patterns)
- [Command Combinations](#command-combinations)

---

## Quick Reference Tables

### Core Workflow Commands
| Command | Purpose | Status Transition |
|---------|---------|------------------|
| `/cmd` | Initialize session | - |
| `/research` | Discovery phase | - |
| `/plan` | Planning phase | `BACKLOG` → `TODO` |
| `/build` | Implementation phase | `TODO` → `IN_PROGRESS` → `CODE_REVIEW` |
| `/test` | Validation phase | `CODE_REVIEW` → `QA_TESTING` |
| `/document` | Documentation phase | `QA_TESTING` → `DOCUMENTATION` |
| `/reflect` | Review implementation | - |
| `/done` | Complete ticket | `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE` |

### Agent Categories
| Category | Agents | Primary Use Cases |
|----------|---------|------------------|
| **Core Development** | architect, coder, tester, security | Feature development, bug fixes |
| **Specialized** | mcp-dev, performance, integration, hooks | Domain-specific implementations |
| **Quality** | clutter-detector, memory-sync, documenter | Code quality, documentation |
| **Analysis** | predictive-planner, code-intelligence, vcs-integration | Planning, insights |

### Sprint Commands
| Command | Purpose | Options |
|---------|---------|---------|
| `/sprint-plan` | Plan sprint | `--points`, `--priority`, `--continue` |
| `/sprint-predict` | Predictive analysis | `--target`, `--risk`, `--duration` |
| `/sprint-execute` | Execute sprint | `--max-agents`, `--tickets`, `--dry-run` |
| `/sprint-themed` | Themed sprint workflow | Theme selection |
| `/sprint-status` | Monitor progress | - |

---

## Core Development Workflow Commands

### `/cmd` - Initialize Session
**Purpose:** Initialize development session and read project context

```bash
/cmd
```

**What it does:**
- Reads CLAUDE.md configuration
- Checks PROJECT_PLAN.md for current sprint
- Loads project context and standards
- Greets user with status summary

**Output:** Session initialization summary with current sprint status

---

### `/research` - Discovery Phase
**Purpose:** Search codebase, analyze patterns, gather context

```bash
/research
/research --scope [directory]
/research --patterns [file-types]
```

**Options:**
- `--scope [dir]` - Limit search to specific directory
- `--patterns [types]` - Focus on specific file types (e.g., "*.ts,*.py")
- `--depth [n]` - Maximum directory depth to search

**What it does:**
- Searches for existing implementations
- Analyzes code patterns and architecture
- Identifies reusable components
- Gathers context for planning phase

**Optional Agent:** `/agent:architect` for complex system analysis

---

### `/plan` - Planning Phase
**Purpose:** Create detailed technical plan and specification

```bash
/plan
/plan --ticket [TICKET-ID]
/plan --epic [EPIC-NAME]
```

**Options:**
- `--ticket [id]` - Plan specific ticket
- `--epic [name]` - Plan epic-level work
- `--template [type]` - Use specific spec template
- `--points [n]` - Estimate story points

**What it does:**
- Reads `$WORKFLOW` standards
- Creates technical specification using `$SPEC` template
- Defines acceptance criteria and success metrics
- Updates ticket status to `TODO`

**Required Agent:** `/agent:architect` for system design

---

### `/build` - Implementation Phase
**Purpose:** Implement features following specifications

```bash
/build
/build --ticket [TICKET-ID]
/build --dry-run
```

**Options:**
- `--ticket [id]` - Build specific ticket
- `--dry-run` - Preview implementation plan
- `--parallel` - Enable parallel implementation
- `--agents [list]` - Specify agents to use

**What it does:**
- Reads `$STANDARDS` for code quality requirements
- Orchestrates implementation using appropriate agents
- Maintains code quality and security standards
- Updates status: `TODO` → `IN_PROGRESS` → `CODE_REVIEW`

**Agent Selection:**
- `/agent:coder` - Standard features
- `/agent:mcp-dev` - MCP implementations
- `/agent:hooks` - Middleware/plugins
- `/agent:integration` - Service connections

---

### `/test` - Validation Phase
**Purpose:** Comprehensive testing and validation

```bash
/test
/test --type [unit|integration|e2e]
/test --coverage
/test --security
```

**Options:**
- `--type [type]` - Specific test type
- `--coverage` - Generate coverage report
- `--security` - Include security testing
- `--performance` - Include performance testing

**What it does:**
- Coordinates comprehensive testing
- Validates against acceptance criteria
- Generates test reports and coverage
- Updates status: `CODE_REVIEW` → `QA_TESTING`

**Required Agent:** `/agent:tester`
**Optional Agents:** `/agent:security`, `/agent:performance`

---

### `/document` - Documentation Phase
**Purpose:** Update and maintain documentation

```bash
/document
/document --type [technical|user|api]
/document --update-only
```

**Options:**
- `--type [type]` - Specific documentation type
- `--update-only` - Only update existing docs
- `--generate-new` - Create new documentation
- `--api-docs` - Generate API documentation

**What it does:**
- Reads `$DOCS_GUIDE` for standards
- Updates technical and user documentation
- Ensures documentation accuracy
- Updates status: `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE`

**Optional Agent:** `/agent:documenter` for comprehensive docs

---

### `/reflect` - Review Implementation
**Purpose:** Review implementation for accuracy and efficiency

```bash
/reflect
/reflect --with-metrics
/reflect --performance
```

**Options:**
- `--with-metrics` - Include performance metrics
- `--performance` - Focus on performance analysis
- `--security` - Include security review

**What it does:**
- Reviews spec document for completion
- Analyzes code implementation accuracy
- Updates ticket and task status
- Identifies areas for improvement

---

### `/done` - Complete Ticket
**Purpose:** Complete ticket and prepare for release

```bash
/done
/done --ticket [TICKET-ID]
/done --skip-notes
```

**Options:**
- `--ticket [id]` - Complete specific ticket
- `--skip-notes` - Skip release notes generation
- `--commit` - Auto-commit changes

**What it does:**
- Reviews spec document for completion
- Adds commit notes to Release_Notes.md
- Reads `$DONE` checklist and verifies completion
- Updates status to `DONE` in PROJECT_PLAN

---

## Agent Invocation Commands

### Core Development Agents

#### `/agent:architect`
**Purpose:** System design and architecture decisions

```bash
/agent:architect
/agent:architect --context [system-area]
/agent:architect --design-review
```

**Use Cases:**
- System design and architecture planning
- Technical specification creation
- Design pattern recommendations
- Architecture reviews and improvements

**Context Requirements:**
- System requirements and constraints
- Existing architecture documentation
- Performance and scalability requirements

---

#### `/agent:coder`
**Purpose:** General code implementation

```bash
/agent:coder
/agent:coder --language [lang]
/agent:coder --pattern [pattern]
```

**Use Cases:**
- Feature implementation
- Bug fixes and corrections
- Code refactoring and improvements
- Algorithm and data structure implementation

**Context Requirements:**
- Technical specifications
- Code quality standards
- Existing codebase patterns

---

#### `/agent:tester`
**Purpose:** QA testing and debugging

```bash
/agent:tester
/agent:tester --type [unit|integration|e2e]
/agent:tester --debug
```

**Use Cases:**
- Test case creation and execution
- Bug reproduction and analysis
- Test coverage improvement
- Quality assurance validation

**Context Requirements:**
- Acceptance criteria
- Existing test suite structure
- Testing framework configuration

---

#### `/agent:security`
**Purpose:** Security review and hardening

```bash
/agent:security
/agent:security --audit
/agent:security --penetration-test
```

**Use Cases:**
- Security vulnerability assessment
- Code security review
- Penetration testing
- Security best practices implementation

**Context Requirements:**
- Security requirements and policies
- Threat model and attack vectors
- Compliance requirements

---

#### `/agent:documenter`
**Purpose:** User-facing documentation

```bash
/agent:documenter
/agent:documenter --type [user|api|technical]
/agent:documenter --audience [developer|user|admin]
```

**Use Cases:**
- User guide creation and updates
- API documentation generation
- Technical documentation maintenance
- Documentation standardization

**Context Requirements:**
- Documentation standards and templates
- Target audience information
- Feature specifications and use cases

---

### Specialist Agents

#### `/agent:mcp-dev`
**Purpose:** MCP protocol specialist

```bash
/agent:mcp-dev
/agent:mcp-dev --server-type [tool|resource|prompt]
/agent:mcp-dev --protocol-version [version]
```

**Use Cases:**
- MCP server development
- Protocol implementation
- Tool and resource integration
- MCP specification compliance

---

#### `/agent:performance`
**Purpose:** Performance optimization

```bash
/agent:performance
/agent:performance --profile
/agent:performance --benchmark
```

**Use Cases:**
- Performance bottleneck identification
- Code optimization recommendations
- Memory usage optimization
- Scalability improvements

---

#### `/agent:integration`
**Purpose:** Service integration

```bash
/agent:integration
/agent:integration --service [service-name]
/agent:integration --protocol [http|grpc|websocket]
```

**Use Cases:**
- External service integration
- API client development
- Webhook implementation
- Third-party service connections

---

#### `/agent:hooks`
**Purpose:** Hooks and middleware

```bash
/agent:hooks
/agent:hooks --type [pre|post|middleware]
/agent:hooks --framework [express|fastify|next]
```

**Use Cases:**
- Git hooks implementation
- Middleware development
- Plugin architecture
- Event system implementation

---

### Quality Agents

#### `/agent:memory-sync`
**Purpose:** Sync code changes to knowledge graph

```bash
/agent:memory-sync
/agent:memory-sync --path [directory]
/agent:memory-sync --force
```

**Use Cases:**
- Knowledge graph synchronization
- Code change tracking
- Context maintenance
- Information consistency

---

#### `/agent:clutter-detector`
**Purpose:** Find and eliminate redundancy

```bash
/agent:clutter-detector
/agent:clutter-detector --path [directory]
/agent:clutter-detector --auto-fix
```

**Use Cases:**
- Duplicate code detection
- Unused code identification
- File organization improvements
- Codebase cleanup

---

### Analysis Agents

#### `/agent:predictive-planner`
**Purpose:** Data-driven planning insights

```bash
/agent:predictive-planner
/agent:predictive-planner --scope [sprints]
/agent:predictive-planner --confidence
```

**Use Cases:**
- Sprint planning optimization
- Velocity prediction
- Risk assessment
- Pattern recognition

---

#### `/agent:code-intelligence`
**Purpose:** Code analysis and insights

```bash
/agent:code-intelligence
/agent:code-intelligence --metrics
/agent:code-intelligence --dependencies
```

**Use Cases:**
- Code quality metrics
- Dependency analysis
- Complexity assessment
- Refactoring recommendations

---

#### `/agent:vcs-integration`
**Purpose:** Version control system integration

```bash
/agent:vcs-integration
/agent:vcs-integration --provider [github|gitlab]
/agent:vcs-integration --operation [pr|issue|pipeline]
```

**Use Cases:**
- Git workflow automation
- PR and issue management
- CI/CD pipeline integration
- Branch management strategies

---

## Sprint Management Commands

### `/sprint-plan` - Comprehensive Sprint Planning
**Purpose:** Automated sprint planning with ticket selection and documentation

```bash
/sprint-plan
/sprint-plan --points 40
/sprint-plan --priority security
/sprint-plan --continue
/sprint-plan --team-size 3
/sprint-plan --duration 1-week
/sprint-plan --quick
/sprint-plan --max-agents 3
```

**Options:**
- `--points [n]` - Custom point target (default: 30-35)
- `--priority [epic]` - Focus on specific epic/category
- `--continue` - Include existing in-progress work
- `--team-size [n]` - Adjust for team capacity
- `--duration [time]` - Sprint duration (1-week, 2-week)
- `--quick` - Emergency planning with minimal specs
- `--max-agents [n]` - Limit parallel planning agents

**Process:**
1. **Analysis Phase:** Review velocity, capacity, carry-over work
2. **Ticket Selection:** Select optimal story point distribution
3. **Spec Generation:** Create specifications with acceptance criteria
4. **Documentation Planning:** Map documentation needs and updates
5. **Dependency Analysis:** Create dependency graph and work sequence
6. **Context Preparation:** Gather files and prepare agent contexts

**Agents Used:** `architect`, `documenter`

---

### `/sprint-predict` - Predictive Sprint Analysis
**Purpose:** Data-driven sprint planning insights using historical data

```bash
/sprint-predict
/sprint-predict --target 35
/sprint-predict --risk high
/sprint-predict --duration 1
/sprint-predict --scope last-3
/sprint-predict --format json
/sprint-predict --confidence
/sprint-predict --patterns
```

**Options:**
- `--target [n]` - Custom point target (default: 30)
- `--risk [level]` - Risk tolerance: low/medium/high
- `--duration [weeks]` - Sprint duration (default: 2)
- `--scope [scope]` - Analysis scope: all/last-N/recent
- `--format [type]` - Output: summary/full/json
- `--confidence` - Include confidence breakdown
- `--patterns` - Focus on pattern analysis

**Agent Used:** `predictive-planner`

**Outputs:**
- Velocity analysis and trends
- Recommended sprint composition
- Pattern recognition insights
- Blocker predictions and mitigations
- Confidence assessments

---

### `/sprint-execute` - Sprint Execution Strategy
**Purpose:** Execute planned sprint with optimal orchestration

```bash
/sprint-execute
/sprint-execute --max-agents 3
/sprint-execute --tickets AGENT-010
/sprint-execute --dry-run
/sprint-execute --continue
/sprint-execute --recipe-override
/sprint-execute --status
```

**Options:**
- `--max-agents [n]` - Limit parallel execution agents (default: 5)
- `--tickets [list]` - Execute specific tickets only
- `--dry-run` - Preview execution strategy
- `--continue` - Resume interrupted execution
- `--recipe-override` - Use custom recipes
- `--status` - Check current progress

**Process:**
1. **Sprint Loading:** Read planned sprint and dependencies
2. **Execution Planning:** Create dependency-aware order
3. **Parallel Orchestration:** Manage multiple agents
4. **Implementation:** Execute using appropriate recipes
5. **Memory & Commits:** Sync changes and commit work
6. **Progress Tracking:** Monitor and report status

**Agents Used:** `architect`, `coder`, `tester`, `security`, `documenter`, `memory-sync`

---

### `/sprint-themed` - Themed Sprint Workflow (TEST)
**Purpose:** Complete sprint workflow with theme selection

```bash
/sprint-themed
```

**Themes:**
- **Development** - Feature development focus
- **Bug Bash** - Bug fixing and stabilization
- **Refactoring** - Code quality improvements
- **Database** - Data layer work
- **Documentation** - Documentation improvements

**Process:**
- **Phases 1-5:** Planning and preparation
- **User Approval:** Review and approve plan
- **Phase 6:** Automatic execution of entire sprint
- **No manual intervention** needed during execution

---

### `/sprint-status` - Monitor Sprint Progress
**Purpose:** Monitor active sprint progress and metrics

```bash
/sprint-status
/sprint-status --detailed
/sprint-status --metrics
```

**Options:**
- `--detailed` - Include detailed ticket information
- `--metrics` - Show velocity and performance metrics

**Displays:**
- Completed/in-progress/blocked tickets
- Velocity and points tracking
- Remaining work in sprint
- Blocker identification
- Timeline projections

---

## Documentation Management Commands

### `/doc-audit` - Documentation Standardization & Audit
**Purpose:** Comprehensive documentation audit and standardization

```bash
/doc-audit
/doc-audit --audit-only
/doc-audit --dry-run
/doc-audit --path docs/
/doc-audit --skip-adr
/doc-audit --adr-only
/doc-audit --memory-optimize
/doc-audit --max-words 500
```

**Options:**
- `--audit-only` - Run audit without making changes
- `--dry-run` - Preview changes without applying
- `--path [dir]` - Limit to specific directory
- `--skip-adr` - Skip ADR enforcement check
- `--adr-only` - Only check/enforce ADRs
- `--memory-optimize` - Only optimize for Memory Tool
- `--max-words [n]` - Custom word limit for splitting

**Process:**
1. **Audit Phase:** Find duplicates, orphaned files, missing ADRs
2. **Standardization Phase:** Apply templates, frontmatter, formatting
3. **Optimization Phase:** Split large docs, create navigation
4. **Memory Sync Phase:** Sync to knowledge graph

**Agents Used:** `documenter`, `clutter-detector`, `memory-sync`

---

### `/doc-template` - Apply Documentation Template
**Purpose:** Apply standardized template to specific document

```bash
/doc-template docs/features/auth.md
/doc-template --type feature docs/new-feature.md
/doc-template --type adr docs/adrs/ADR-0001.md
```

**Options:**
- `--type [type]` - Template type: feature/adr/guide/reference

---

### `/doc-split` - Split Large Document
**Purpose:** Split large document into manageable parts

```bash
/doc-split docs/comprehensive-guide.md
/doc-split --max-words 500 docs/api-reference.md
/doc-split --preserve-sections docs/user-manual.md
```

**Options:**
- `--max-words [n]` - Maximum words per section
- `--preserve-sections` - Maintain section boundaries

---

## Memory Sync Commands

### Manual Sync Commands

#### `/sync-memory` - Sync All Changed Files
```bash
/sync-memory
/sync-memory [path]
/sync-memory --types "py,ts"
/sync-memory --force
```

**Options:**
- `[path]` - Sync specific directory
- `--types [list]` - Sync specific file types
- `--force` - Force full resync

**Purpose:** Sync code changes to knowledge graph

---

#### `/sync-memory --status` - Show Sync Status
```bash
/sync-memory --status
/sync-memory --pending
```

**Options:**
- `--status` - Show current sync status
- `--pending` - Show pending changes

**Purpose:** Monitor synchronization state

---

## CLI Tool Commands

### Interactive Mode Commands

#### Start Interactive Mode
```bash
dev-agency interactive
dev-agency -i
```

**Features:**
- REPL-style command execution
- Command history and search
- Tab completion
- Session management
- Context-aware suggestions

---

#### Traditional CLI Commands
```bash
# Project management
dev-agency status
dev-agency plan --ticket FEATURE-001
dev-agency workflow --name sprint-planning

# Agent execution
dev-agency agent --name architect --context system-design
dev-agency agent --name coder --ticket FEATURE-001

# Recipe execution
dev-agency recipe --name api_feature --context user-auth
dev-agency recipe --name security_audit --scope backend

# System utilities
dev-agency config --show
dev-agency config --set key=value
dev-agency health --check
dev-agency metrics --show
```

### Enhanced CLI Options

#### Global Options
- `--version`, `-V` - Show version
- `--help`, `-h` - Show help
- `--config [path]` - Use custom config file
- `--verbose`, `-v` - Verbose output
- `--quiet`, `-q` - Quiet output
- `--dry-run` - Preview without execution
- `--force` - Force execution

#### Environment Variables
```bash
DEV_AGENCY_CONFIG_PATH=/path/to/config
DEV_AGENCY_LOG_LEVEL=debug
DEV_AGENCY_MAX_PARALLEL_AGENTS=5
DEV_AGENCY_DEFAULT_POINTS=30
```

---

## Recipe Execution Commands

### `/recipe` - Execute Named Recipe
**Purpose:** Execute any recipe by name

```bash
/recipe documentation_standardization
/recipe api_feature --context "user authentication"
/recipe bug_fix --ticket "BUG-123"
/recipe security_audit --scope backend
/recipe performance_optimization --metrics
```

**Options:**
- `--context [text]` - Provide additional context
- `--ticket [id]` - Associate with specific ticket
- `--scope [area]` - Limit scope of recipe
- `--dry-run` - Preview recipe execution

---

### `/recipe-chain` - Chain Multiple Recipes
**Purpose:** Execute multiple recipes in sequence

```bash
/recipe-chain security_audit,performance_optimization
/recipe-chain clean_code,documentation_standardization
/recipe-chain bug_fix,test_coverage --ticket BUG-001
```

**Options:**
- `--parallel` - Execute recipes in parallel where possible
- `--stop-on-error` - Stop chain if any recipe fails
- `--context [text]` - Provide context for all recipes

---

### Available Recipes

#### Development Recipes
- `api_feature_recipe` - API endpoint development
- `full_stack_feature_recipe` - End-to-end feature development
- `bug_fix_recipe` - Bug investigation and fixing
- `tdd_workflow_recipe` - Test-driven development workflow

#### Quality Recipes
- `security_audit_recipe` - Security assessment and hardening
- `performance_optimization_recipe` - Performance analysis and improvements
- `complex_refactoring_workflow` - Large-scale refactoring
- `memory_sync_recipe` - Knowledge graph synchronization

#### Infrastructure Recipes
- `mcp_server_recipe` - MCP server development
- `database_migration_workflow` - Database schema changes
- `documentation_standardization_recipe` - Documentation improvements

#### Sprint Recipes
- `sprint_execution_recipe` - Sprint implementation orchestration
- `sprint_preparation_recipe` - Sprint planning and preparation

---

## Session Management Commands

### Standard Session Commands

#### `/standards` - Review Work Standards
```bash
/standards
/standards --category [development|testing|documentation]
/standards --detailed
```

**Purpose:** Review and apply development standards

---

#### `/reflect` - Review Implementation
```bash
/reflect
/reflect --with-metrics
/reflect --performance
/reflect --security
```

**Purpose:** Analyze implementation quality and completeness

---

#### `/commit` - Prepare Git Commit
```bash
/commit
/commit --message "custom message"
/commit --skip-notes
```

**Process:**
1. Collect notes from Release_Notes.md
2. Prepare Git commit with conventional format
3. Commit the work
4. Clear old notes and stage new release notes

---

#### `/bug-report` - Create Bug Report
```bash
/bug-report
/bug-report --severity [low|medium|high|critical]
/bug-report --component [component-name]
```

**Purpose:** Create structured bug report using `$BUG_REPORT` template

---

### Agent-Specific Session Commands

#### `/agent-status` - Show Agent Status
```bash
/agent-status
/agent-status --detailed
/agent-status --metrics
```

**Displays:**
- Current agent invocations and results
- Agent performance metrics
- Resource utilization
- Success/failure rates

---

#### `/agent-metrics` - Display Performance Metrics
```bash
/agent-metrics
/agent-metrics --period [day|week|month]
/agent-metrics --export
```

**Shows:**
- Agent response times
- Token usage statistics
- Quality scores
- Trend analysis

---

#### `/agent-recipe` - Load Agent Recipe
```bash
/agent-recipe [name]
/agent-recipe sprint-execution
/agent-recipe documentation-workflow
```

**Purpose:** Load proven agent combination recipes

---

#### `/agent-feedback` - Record Agent Feedback
```bash
/agent-feedback
/agent-feedback --agent [agent-name]
/agent-feedback --rating [1-5]
```

**Purpose:** Provide feedback for agent improvement

---

## Context and Environment Commands

### Environment Setup

#### Project Context Loading
```bash
# Automatic context loading
/cmd  # Reads CLAUDE.md, PROJECT_PLAN.md

# Manual context refresh
/context-refresh
/context-refresh --deep
```

### Configuration Management

#### Reference Path Variables
```bash
# Standard Guides
$STANDARDS    # Development Standards Guide
$WORKFLOW     # Development Workflow Guide  
$DOCS_GUIDE   # Documentation Guide
$DONE         # Definition of Done

# Templates
$PROJECT_PLAN # PROJECT_PLAN Template
$SPEC         # SPECS Template
$CHANGELOG    # CHANGELOG Template
$BUG_REPORT   # Bug Report Template
$HANDOFF      # Handoff Report Template
$NOTES        # Release Notes Template

# Agent System
$AGENTS_DIR   # Agents directory
$RECIPES      # Recipes directory
$PROMPTS      # Prompts directory
$METRICS      # Metrics directory
```

### System Health Commands

#### Health Checks
```bash
# CLI health check
dev-agency health --check
dev-agency health --detailed

# Agent system health
/agent-health
/agent-health --full-report
```

#### System Metrics
```bash
# Performance metrics
dev-agency metrics --show
dev-agency metrics --export --format json

# Resource usage
/system-resources
/system-resources --memory
/system-resources --agents
```

---

## Advanced Usage Patterns

### Parallel Agent Execution

#### Multi-Agent Workflows
```bash
# Parallel development
/build --agents "coder,tester" --parallel

# Comprehensive review
/review --agents "security,performance,documenter"

# Multi-phase execution
/sprint-execute --max-agents 5
```

### Context Optimization

#### Large Codebase Handling
```bash
# Scope-limited operations
/research --scope "src/components"
/doc-audit --path "docs/api"

# Type-specific operations  
/sync-memory --types "ts,tsx"
/agent:clutter-detector --path "src" --auto-fix
```

### Conditional Execution

#### Environment-Aware Commands
```bash
# Production safety
/deploy --env production --confirm
/security-scan --level strict

# Development optimization
/test --skip-e2e --fast
/build --dev-mode --watch
```

---

## Command Combinations

### Complete Feature Development Workflow
```bash
# 1. Research and Planning
/cmd
/research --scope "src/auth"
/plan --ticket AUTH-001
/agent:architect

# 2. Implementation
/build --ticket AUTH-001
/agent:coder --language typescript
/agent:security --audit

# 3. Testing and Validation
/test --type integration
/agent:tester --coverage

# 4. Documentation and Completion
/document --type api
/agent:documenter
/reflect --with-metrics
/done --ticket AUTH-001
```

### Sprint Execution Workflow
```bash
# 1. Sprint Planning
/sprint-predict --target 35 --confidence
/sprint-plan --points 35 --max-agents 4

# 2. Sprint Execution
/sprint-execute --max-agents 4
/sprint-status --detailed

# 3. Sprint Completion
/doc-audit --memory-optimize
/commit
```

### Documentation Standardization Workflow
```bash
# 1. Audit Current State
/doc-audit --audit-only
/agent:clutter-detector --path docs

# 2. Standardize Documentation
/doc-audit --dry-run
/doc-audit

# 3. Sync and Optimize
/sync-memory --types "md"
/agent:memory-sync --force
```

### Bug Fix Workflow
```bash
# 1. Investigation
/research --patterns "*.test.*"
/bug-report --severity high

# 2. Implementation
/recipe bug_fix --ticket BUG-001
/agent:tester --debug

# 3. Validation
/test --type unit --coverage
/agent:security --audit
/done --ticket BUG-001
```

### Performance Optimization Workflow
```bash
# 1. Analysis
/agent:performance --profile
/agent:code-intelligence --metrics

# 2. Optimization
/recipe performance_optimization
/agent:performance --benchmark

# 3. Validation
/test --type performance
/agent:performance --validate
```

---

## Command Aliases

For increased productivity, these aliases are available:

### Core Workflow Aliases
```bash
/r     → /research
/p     → /plan
/b     → /build
/t     → /test
/d     → /document
/rf    → /reflect
/dn    → /done
```

### Sprint Management Aliases
```bash
/sp    → /sprint-plan
/spr   → /sprint-predict
/se    → /sprint-execute
/st    → /sprint-themed
/ss    → /sprint-status
```

### Documentation Aliases
```bash
/da    → /doc-audit
/dt    → /doc-template
/ds    → /doc-split
```

### Recipe Aliases
```bash
/rc    → /recipe
/rcc   → /recipe-chain
```

### Agent Aliases
```bash
/aa    → /agent:architect
/ac    → /agent:coder
/at    → /agent:tester
/as    → /agent:security
/ad    → /agent:documenter
/am    → /agent:memory-sync
/acd   → /agent:clutter-detector
/ap    → /agent:performance
/ai    → /agent:integration
```

---

## Best Practices and Tips

### Command Usage Guidelines

1. **Always start with `/cmd`** to initialize session context
2. **Use `/research` before `/plan`** to gather complete context
3. **Apply appropriate agents** based on task complexity
4. **Monitor progress** with status commands
5. **Use dry-run options** for complex operations
6. **Chain commands** for workflow efficiency

### Performance Optimization

1. **Limit agent parallelism** with `--max-agents` for resource management
2. **Scope operations** to relevant directories/files
3. **Use specific file types** for targeted operations
4. **Cache context** between related commands
5. **Monitor system resources** during intensive operations

### Quality Assurance

1. **Always include security review** for production code
2. **Validate with multiple test types** (unit, integration, e2e)  
3. **Document as you develop** rather than retrofitting
4. **Use memory sync** to maintain context consistency
5. **Review with `/reflect`** before marking complete

---

*This command reference is maintained as part of the Dev-Agency central system. For updates or corrections, see `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/`.*