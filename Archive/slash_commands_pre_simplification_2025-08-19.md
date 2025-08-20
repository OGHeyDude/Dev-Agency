---
title: Custom Slash Commands
description: Extended slash commands for specialized workflows and recipes
type: guide
category: commands
tags: [commands, automation, recipes, workflow]
created: 2025-08-09
updated: 2025-08-10
---

# Custom Slash Commands

## Table of Contents
- [Sprint Management Commands](#sprint-management-commands)
- [Auto-fix Commands](#auto-fix-commands)
- [Development Workflow Commands](#development-workflow-commands)
- [Quality & Testing Commands](#quality--testing-commands)
- [Infrastructure Commands](#infrastructure-commands)
- [Documentation Commands](#documentation-commands)
- [Recipe Execution Commands](#recipe-execution-commands)
- [Command Aliases](#command-aliases)
- [Integration Patterns](#integration-patterns)

## Sprint Management Commands

### `/sprint-themed` - Strategic Sprint Management (TEST)
**Purpose:** Complete themed sprint workflow with automated planning and execution  
**Recipe:** `/recipes/test/sprint_management_recipe.md`  
**Agents Used:** `architect`, `documenter`, multi-agent execution library  
**Status:** Testing - Next-generation sprint system

#### Basic Usage
```bash
/sprint-themed                   # Interactive theme selection and execution
```

#### Sprint Themes Available
```bash
/sprint-themed --development     # Feature development (70%) + critical bugs (30%)
/sprint-themed --bug-bash        # Focused bug resolution sprint
/sprint-themed --refactoring     # Technical debt reduction sprint
/sprint-themed --database        # Schema changes and migration sprint
/sprint-themed --documentation   # Documentation improvement sprint
```

#### Advanced Options
```bash
/sprint-themed --auto-execute    # Skip user approval, execute automatically
/sprint-themed --max-agents 4   # Limit concurrent agents (default: varies by theme)
/sprint-themed --points 35       # Custom story point target
/sprint-themed --preview         # Show execution plan without running
```

#### What It Does
1. **Theme Selection & Context Loading:**
   - Interactive theme selection or direct specification
   - Loads complete project context and constraints
   - Establishes theme-specific success criteria

2. **Intelligent Ticket Selection:**
   - Curates tickets matching theme and team capacity
   - Applies theme-specific filtering and prioritization
   - Balances business value with technical considerations

3. **Comprehensive Spec Validation:**
   - Ensures all tickets have complete specifications
   - Generates missing specs using established patterns
   - Validates acceptance criteria and success metrics

4. **Strategic Implementation Planning:**
   - Creates optimal execution sequence with parallelization
   - Assigns appropriate agents to each ticket
   - Plans resource allocation and dependency management

5. **User Approval Checkpoint:**
   - Presents complete execution plan for review
   - Shows resource allocation and timeline estimates
   - Allows modifications before automated execution

6. **Automated Sprint Execution:**
   - Executes entire sprint with no manual intervention
   - Manages agent orchestration and quality gates
   - Provides real-time progress tracking and reporting

#### Example Output
```
🎯 SPRINT THEME SELECTION
=====================================
Available Themes:
1. Development Sprint (Standard feature/bug mix)
2. Bug Bash Sprint (Stability focus) 
3. Refactoring Sprint (Technical debt)
4. Database Sprint (Schema/migration work)
5. Documentation Sprint (Doc improvement)

Selected: Development Sprint

📋 TICKET CURATION (Development Theme)
=====================================
Target: 33 story points | Theme: 70% features, 30% bugs

Selected Tickets:
• FEATURE-045: User dashboard v2 (8 pts) - High business value
• FEATURE-047: API rate limiting (5 pts) - Infrastructure improvement  
• BUG-023: Memory leak in auth service (5 pts) - Critical stability
• FEATURE-046: Mobile responsive design (8 pts) - User experience
• BUG-024: Race condition in payment flow (3 pts) - Critical bug
• ENHANCEMENT-012: Logging standardization (2 pts) - Operational
• BUG-025: Timeout handling improvements (2 pts) - Reliability

Total: 33 points | Features: 23 pts (70%) | Bugs: 8 pts (24%) | Ops: 2 pts (6%)

🏗️ EXECUTION PLAN GENERATED
=====================================
Phase 1 (Days 1-3): Foundation
• BUG-023 (critical) → FEATURE-045 (dashboard core)
• Agents: architect + coder + tester (2 parallel streams)

Phase 2 (Days 4-7): Core Development  
• FEATURE-047 (API) || FEATURE-046 (mobile) || BUG-024 (payments)
• Agents: 3 parallel streams, 4-5 agents total

Phase 3 (Days 8-10): Polish & Integration
• ENHANCEMENT-012 → BUG-025 → Integration testing
• Agents: coder + tester + documenter

Quality Gates: Enabled for all phases
Memory Sync: After each ticket completion
Progress Tracking: Real-time dashboard

⏰ ESTIMATED COMPLETION: 10 working days
🎯 SUCCESS PROBABILITY: 94% (based on team velocity and complexity analysis)

Proceed with execution? [y/N]
```

### `/sprint-status` - Active Sprint Monitoring
**Purpose:** Monitor ongoing sprint progress and health  
**Integration:** Works with `/sprint-themed` and `/sprint-execute`

#### Usage
```bash
/sprint-status                   # Show current sprint status
/sprint-status --detailed        # Include per-ticket breakdown
/sprint-status --velocity        # Show velocity tracking
/sprint-status --blockers        # Focus on current blockers
/sprint-status --agents          # Show active agent assignments
```

#### Example Output
```
📊 ACTIVE SPRINT STATUS
=====================================
Sprint: Development Sprint (Theme) | Day 6 of 10
Progress: 18/33 points completed (55%)
Velocity: On track (slightly ahead)

🎯 TICKET STATUS
• ✅ BUG-023: DONE (5 pts) - Completed Day 2
• ✅ FEATURE-045: DONE (8 pts) - Completed Day 4  
• ⚡ FEATURE-047: IN_PROGRESS (5 pts) - Agent: coder, 80% complete
• ⚡ FEATURE-046: IN_PROGRESS (8 pts) - Agent: architect+coder, 45% complete
• ⏳ BUG-024: READY_TO_START (3 pts) - Waiting for FEATURE-047
• ⏳ ENHANCEMENT-012: QUEUED (2 pts)
• ⏳ BUG-025: QUEUED (2 pts)

🤖 ACTIVE AGENTS (3/4 capacity)
• architect: Working on FEATURE-046 (mobile design)
• coder: Working on FEATURE-047 (API rate limiting) 
• tester: Available (testing completed features)

📈 VELOCITY TRACKING
• Target: 3.3 pts/day | Actual: 3.6 pts/day (+9%)
• Completion ETA: Day 9 (1 day ahead of schedule)
• Confidence: 96% on-time delivery

⚠️ BLOCKERS & RISKS
• None currently blocking progress
• Low risk: FEATURE-046 complexity may extend timeline by 0.5 days
```

### `/sprint-plan` - Automated Sprint Planning

## STAD Protocol Commands

### `/validate` - Comprehensive Stage Validation with Auto-Completion
**Purpose:** Validate ALL stages are complete and automatically fix any missing items  
**Integration:** STAD Protocol comprehensive validation with agent orchestration  
**Agents Used:** Architect, Coder, Tester, Backend QA, Documenter, Retrospective (as needed)

#### Usage
```bash
/validate                 # Check all stages and auto-complete missing items
/validate --check-only    # Only report issues without fixing
/validate --stage 2       # Validate specific stage with auto-completion
```

#### What It Does
1. **Comprehensive Stage Analysis:**
   - Scans all STAD stages (0-4) for completeness
   - Identifies missing specifications, tests, documentation
   - Detects incomplete implementations or validations
   - Checks for blockers and unresolved issues

2. **Automatic Completion:**
   - Stage 1 missing specs → Triggers Architect Agent to write them
   - Stage 2 incomplete tests → Triggers Tester Agent to add coverage
   - Stage 2 missing docs → Triggers Documenter Agent to update
   - Stage 3 no validation → Triggers Backend QA Agent to validate
   - Stage 4 no retro → Triggers Retrospective Agent to analyze

3. **Smart Orchestration:**
   - Prioritizes critical missing items first
   - Runs multiple agents in parallel where possible
   - Maintains stage gate requirements
   - Updates ticket statuses automatically

4. **Output:**
   - Complete validation report across all stages
   - List of items automatically completed
   - Remaining manual actions required
   - Overall sprint health assessment

#### Example Output
```
🔍 COMPREHENSIVE VALIDATION REPORT
=====================================
Stage 0: ✅ Strategic Planning COMPLETE
Stage 1: ⚠️ Sprint Preparation - 2 issues found, fixing...
  → Missing spec for AGENT-010 - Architect Agent writing spec...
  → Ticket AGENT-015 exceeds 5 points - Splitting into subtasks...
Stage 2: ⚠️ Sprint Execution - 3 issues found, fixing...
  → Test coverage at 72% - Tester Agent adding tests...
  → Missing documentation for API changes - Documenter updating...
  → Lint errors in 2 files - Auto-fixing...
Stage 3: ✅ Sprint Validation COMPLETE
Stage 4: ⏳ Pending (requires /approve first)

🤖 AUTO-COMPLETION IN PROGRESS
• Architect: Writing spec for AGENT-010
• Tester: Adding tests for auth module
• Documenter: Updating API documentation
• Coder: Fixing lint errors

✅ All issues resolved automatically!
Sprint ready for next stage transition.
```

### `/validate-stage [0-4]` - Stage Gate Validation
**Purpose:** Validate that criteria are met for a specific stage transition  
**Integration:** STAD Protocol stage gate enforcement  
**Agents Used:** Varies by stage - Backend QA for Stage 3, Retrospective for Stage 4

#### Usage
```bash
/validate-stage 1         # Validate Stage 1 → 2 transition
/validate-stage 2         # Validate Stage 2 → 3 transition
/validate-stage 3         # Validate Stage 3 → 4 transition
```

#### What It Does
1. **Checks Stage-Specific Gates:**
   - Stage 0→1: Epic definition, stakeholder alignment
   - Stage 1→2: Specs complete, no ticket >5 points
   - Stage 2→3: Implementation done, tests passing
   - Stage 3→4: Human approval, production ready

2. **Validation Process:**
   - Loads gate criteria from `/Project_Management/Stage_Gates/`
   - Runs automated checks via `scripts/validation/validate_stage_gate.sh`
   - Reports missing requirements
   - Blocks or allows transition

3. **Output:**
   - Gate validation report
   - Missing requirements list
   - Recommended actions
   - Go/No-Go decision

### `/bug` - Stage 3 Debug Trigger
**Purpose:** Report and debug issues found during Stage 3 validation  
**Integration:** STAD Protocol Stage 3 debugging with git bisect  
**Agents Used:** Debug Agent with root cause analysis

#### Usage
```bash
/bug "Login fails after auth changes"     # Report and debug specific issue
/bug --critical "Payment flow broken"     # Mark as critical blocker
/bug --bisect "Test suite failing"        # Use git bisect to find cause
```

#### What It Does
1. **Issue Analysis:**
   - Creates bug report in `/Project_Management/Bug_Reports/`
   - Triggers Debug Agent for root cause analysis
   - Uses git bisect to identify breaking commit
   - Updates ticket status to BLOCKED if critical

2. **Debug Process:**
   - Reproduces the issue systematically
   - Traces execution path to find root cause
   - Identifies the exact commit that introduced bug
   - Proposes fix without workarounds

3. **Resolution:**
   - Implements proper fix (no workarounds)
   - Adds regression tests
   - Updates documentation if needed
   - Clears BLOCKED status when resolved

#### Example Output
```
🐛 BUG INVESTIGATION
=====================================
Issue: Login fails after auth changes
Severity: CRITICAL
Status: Investigating...

🔍 Root Cause Analysis:
• Running git bisect between commits...
• Found breaking commit: a3f42b1 "Refactor auth middleware"
• Issue: Missing null check in token validation
• Line: src/auth/middleware.ts:47

🔧 Fix Applied:
• Added proper null checking
• Added regression test
• Verified fix resolves issue

✅ Bug resolved and regression test added
```

### `/revise` - Stage 3 Plan Revision Request
**Purpose:** Request plan revision from Architect Agent when issues found in Stage 3  
**Integration:** STAD Protocol Stage 3 feedback loop to Stage 1  
**Agents Used:** Architect Agent for spec updates

#### Usage
```bash
/revise "API design doesn't handle rate limiting"    # Request design revision
/revise --spec AGENT-010 "Missing error cases"       # Revise specific spec
/revise --architecture "Database schema issues"      # Architecture revision
```

#### What It Does
1. **Revision Request:**
   - Documents feedback in `/Project_Management/Sprint_Execution/Sprint_[N]/revisions/`
   - Returns control to Architect Agent
   - Maintains audit trail of changes
   - Updates affected specifications

2. **Architect Response:**
   - Reviews feedback and current implementation
   - Updates technical specifications
   - Adjusts execution plan if needed
   - Documents architectural decisions

3. **Continuation:**
   - Returns to Stage 2 execution with updates
   - Preserves completed work where possible
   - Updates dependency graph if needed
   - Notifies about plan changes

#### Example Output
```
📝 PLAN REVISION REQUEST
=====================================
Feedback: API design doesn't handle rate limiting
Affected Specs: AGENT-047, AGENT-048
Status: Returning to Architect Agent...

🏗️ Architect Analysis:
• Reviewing current API design
• Adding rate limiting specifications
• Updating execution plan

📋 Spec Updates:
• AGENT-047: Added rate limit headers
• AGENT-048: Added retry logic specs
• Created new ticket: AGENT-049 for rate limiter

✅ Plans revised, returning to execution
```

### `/approve` - Human Approval & Stage 4 Trigger
**Purpose:** Record human approval and automatically trigger Stage 4 retrospective  
**Integration:** STAD Protocol Stage 3→4 transition with automatic retrospective  
**Agents Used:** Retrospective Agent for sprint analysis

#### Usage
```bash
/approve                  # Approve and start retrospective
/approve --conditional    # Approve with conditions + retrospective
/approve --reject        # Reject and return to Stage 2
```

#### What It Does
1. **Validation Review:**
   - Displays validation report
   - Shows test results
   - Lists any issues found

2. **Approval Recording:**
   - Creates approval marker at `/Project_Management/.approval`
   - Records timestamp, approver, conditions
   - Updates sprint status to APPROVED
   - Updates all tickets to READY_FOR_RELEASE

3. **Stage 4 Automation (NEW):**
   - **Automatically triggers Retrospective Agent**
   - Generates retrospective at `/Project_Management/Sprint_Retrospectives/Sprint_[N]_retrospective.md`
   - Analyzes sprint metrics and velocity
   - Captures lessons learned and improvements
   - Merges feature branch to main
   - Creates GitHub release with version tag
   - Updates all tickets to DONE status

4. **Output:**
   - Approval confirmation
   - Retrospective report summary
   - Release notes generated
   - Next sprint recommendations

#### Example Output
```
✅ SPRINT APPROVED
=====================================
Approver: HD
Timestamp: 2025-08-18 14:30:00
Conditions: None

🚀 STAGE 4: RELEASE & RETROSPECTIVE
• Merging to main branch...
• Creating release v2.1.0...
• Running retrospective analysis...

📊 RETROSPECTIVE SUMMARY
Sprint: Sprint 8
Velocity: 44 points (avg: 25)
Completion: 100%
Quality: 0 bugs found

💡 KEY INSIGHTS
• Velocity trending up 76%
• Successful parallel execution
• Zero post-release issues

📈 IMPROVEMENTS
• Continue parallel agent work
• Maintain test coverage >80%
• Document architectural decisions

✅ Sprint complete and released!
Retrospective saved to Sprint_8_retrospective.md
```

### `/stage-gate [from] [to]` - Manual Gate Transition
**Purpose:** Manually validate and transition between STAD stages  
**Integration:** Override for automated gate validation  
**Use With Caution:** Bypasses automatic checks

#### Usage
```bash
/stage-gate 1 2          # Force transition from Stage 1 to 2
/stage-gate --check 2 3  # Check without transitioning
/stage-gate --force 3 4  # Force transition (director approval needed)
```

## Session & Context Commands

### `/context` - Show Project Context
**Purpose:** Display the current project context and verify path resolution  
**Usage:** `/context`  
**Description:** Shows current project information, paths being used, and Dev-Agency references

#### What It Shows
- Current working directory and project name
- Git repository and branch information
- Project-specific paths (docs, specs, archive)
- Dev-Agency central system paths
- Path verification (which directories exist)

#### Example Output
```
Project: MyApp
Root: /home/hd/Projects/MyApp
Git: https://github.com/user/MyApp.git
Branch: feature/new-feature

Project Paths:
- Docs: ./docs/
- Specs: ./Project_Management/Specs/
- Archive: ./Archive/

Dev-Agency Paths:
- Agents: /home/hd/Desktop/LAB/Dev-Agency/Agents/
- Templates: /home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/
```

## Auto-fix Commands

### `/auto-fix` - Intelligent Issue Detection and Resolution
**Purpose:** Automatically detect, analyze, and resolve development issues with predictive capabilities  
**Agent:** `auto-fix` (AGENT-027)  
**Integration:** Real-time monitoring with health systems and learning framework

#### Basic Usage
```bash
/auto-fix                    # Start auto-fix monitoring
/auto-fix [issue-id]        # Fix specific issue
/auto-fix --stop            # Stop auto-fix monitoring  
```

#### Advanced Options
```bash
/auto-fix --status          # Show monitoring status and metrics
/auto-fix --insights        # Show predictive insights
/auto-fix --history [limit] # Show fix history (default: 10)
/auto-fix --config          # Show current configuration
```

#### Configuration
```bash
/auto-fix --threshold 0.8   # Set auto-apply confidence threshold
/auto-fix --risk low        # Set risk tolerance (low/medium/high)
/auto-fix --types "compilation,test,lint" # Enable specific issue types
/auto-fix --dry-run         # Preview fixes without applying
```

#### Issue-specific Commands
```bash
/auto-fix --compilation     # Focus on compilation issues only
/auto-fix --tests           # Focus on test failures only  
/auto-fix --dependencies    # Focus on dependency issues only
/auto-fix --lint            # Focus on code quality issues only
/auto-fix --security        # Focus on security vulnerabilities only
```

#### What It Does
1. **Detection Phase:**
   - Monitors compilation, tests, dependencies, and code quality
   - Uses pattern recognition for common error types
   - Integrates with health monitoring systems
   - Provides real-time issue alerts

2. **Analysis Phase:**
   - Performs automated root cause analysis
   - Correlates with historical fix data  
   - Assesses fix complexity and risk
   - Generates confidence scores

3. **Prediction Phase:**
   - Predicts issues 24-48 hours before occurrence
   - Analyzes code change patterns and trends
   - Provides early warnings and prevention suggestions
   - Learns from successful and failed fixes

4. **Resolution Phase:**
   - Generates multiple context-aware fix strategies
   - Applies fixes automatically for high-confidence scenarios
   - Validates fixes through comprehensive testing
   - Provides rollback capability for failed fixes

#### Example Outputs
```
🤖 Auto-fix Agent Status
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Monitoring: ACTIVE
📊 Issues Detected: 12 (last 24h)
🔧 Fixes Applied: 10 (83% success rate)
⚡ Avg Fix Time: 1.2 minutes
🔮 Active Predictions: 3

Recent Activity:
• TS2304: Fixed missing React import in component.tsx
• Test failure: Updated assertion in user.test.ts  
• Vulnerability: Updated lodash to v4.17.21
• ESLint: Auto-fixed 5 semicolon violations

Upcoming Predictions:
• High probability of test failures after next dependency update
• Potential TypeScript errors in auth module (72h window)
• Performance regression risk in data processing (48h window)
```

## Development Workflow Commands

### `/api-feature` - API Development Workflow  
**Purpose:** Complete REST API development with testing, documentation, and integration  
**Recipe:** `/recipes/api_feature_recipe.md`  
**Agents Used:** `architect`, `coder`, `tester`, `documenter`, `security`

#### Basic Usage
```bash
/api-feature [endpoint-name]     # Create new API endpoint
/api-feature --resource users    # REST resource endpoint
/api-feature --crud              # Full CRUD operations
```

#### Advanced Options
```bash
/api-feature --auth required     # Add authentication/authorization
/api-feature --validate strict   # Input validation and sanitization
/api-feature --cache redis       # Add caching layer
/api-feature --rate-limit        # Add rate limiting
/api-feature --async             # Asynchronous operation support
/api-feature --docs swagger      # Generate Swagger/OpenAPI docs
```

#### What It Does
1. **Architecture Phase:** API design with REST principles, authentication, and data modeling
2. **Implementation Phase:** Route handlers, middleware, validation, and error handling
3. **Testing Phase:** Unit tests, integration tests, and API contract testing
4. **Security Review:** Input validation, authorization checks, and vulnerability scanning
5. **Documentation:** API documentation, examples, and integration guides

### `/full-stack-feature` - Complete Feature Development
**Purpose:** End-to-end feature development including frontend, backend, and database  
**Recipe:** `/recipes/full_stack_feature_recipe.md`  
**Agents Used:** `architect`, `coder`, `tester`, `documenter`, `memory-sync`

#### Basic Usage
```bash
/full-stack-feature [feature-name]  # Complete feature development
/full-stack-feature --ui-first      # Start with UI/UX design
/full-stack-feature --api-first     # Start with backend API
```

#### Options
```bash
/full-stack-feature --frontend react    # Specify frontend framework
/full-stack-feature --backend nodejs    # Specify backend technology
/full-stack-feature --database postgres # Database requirements
/full-stack-feature --mobile            # Include mobile responsiveness
/full-stack-feature --realtime          # WebSocket/real-time features
```

#### What It Does
1. **System Design:** Architecture planning with frontend, backend, and database components
2. **Database Schema:** Entity modeling, migrations, and relationship design
3. **Backend Development:** APIs, business logic, and data access layers
4. **Frontend Implementation:** UI components, state management, and API integration
5. **Integration Testing:** End-to-end testing and cross-component validation
6. **Documentation:** User guides, technical documentation, and deployment instructions

### `/mcp-server` - MCP Implementation Workflow
**Purpose:** Model Context Protocol server development with tools and prompts  
**Recipe:** `/recipes/mcp_server_recipe.md`  
**Agents Used:** `mcp-dev`, `architect`, `coder`, `tester`, `documenter`

#### Basic Usage
```bash
/mcp-server [server-name]        # Create new MCP server
/mcp-server --tools              # Focus on tool implementations
/mcp-server --prompts            # Focus on prompt libraries
```

#### Options
```bash
/mcp-server --transport stdio    # Standard I/O transport
/mcp-server --transport http     # HTTP transport protocol
/mcp-server --config yaml        # Configuration format
/mcp-server --auth token         # Authentication mechanism
/mcp-server --logging detailed   # Logging configuration
```

#### What It Does
1. **Protocol Design:** MCP specification compliance and transport setup
2. **Tool Implementation:** Custom tools with proper schemas and handlers
3. **Prompt Development:** Reusable prompt templates and libraries
4. **Testing Framework:** MCP protocol testing and validation
5. **Integration:** Claude Code integration and deployment setup

## Quality & Testing Commands

### `/bug-fix` - Systematic Bug Resolution
**Purpose:** Root cause analysis and comprehensive bug resolution workflow  
**Recipe:** `/recipes/bug_fix_recipe.md`  
**Agents Used:** `tester`, `architect`, `coder`

#### Basic Usage  
```bash
/bug-fix [bug-id]               # Fix specific bug ticket
/bug-fix --severity critical    # Focus on critical bugs
/bug-fix --reproduce-first      # Ensure reproducibility
```

#### Options
```bash
/bug-fix --root-cause           # Deep root cause analysis
/bug-fix --regression-test      # Add regression testing
/bug-fix --hotfix              # Emergency production fix
/bug-fix --batch               # Fix multiple related bugs
```

#### What It Does
1. **Pre-condition Validation:** Ensure bug report completeness and reproducibility
2. **Root Cause Analysis:** Identify true source with execution tracing
3. **Fix Design:** Minimal, robust solution that addresses root cause
4. **Implementation:** Fix with comprehensive testing and validation
5. **Regression Prevention:** Tests to prevent future occurrences

### `/tdd-workflow` - Test-Driven Development
**Purpose:** Test-first development workflow with quality gates  
**Recipe:** `/recipes/tdd_workflow_recipe.md`  
**Agents Used:** `tester`, `coder`, `architect`

#### Basic Usage
```bash
/tdd-workflow [feature-name]    # TDD workflow for feature
/tdd-workflow --red-green       # Classic Red-Green-Refactor
```

#### Options  
```bash
/tdd-workflow --unit            # Focus on unit testing
/tdd-workflow --integration     # Include integration tests
/tdd-workflow --coverage 90     # Target test coverage
/tdd-workflow --bdd             # Behavior-driven development
```

#### What It Does
1. **Test Design:** Define test scenarios before implementation
2. **Red Phase:** Write failing tests that define requirements
3. **Green Phase:** Implement minimal code to pass tests
4. **Refactor Phase:** Improve code quality while maintaining tests
5. **Validation:** Ensure comprehensive coverage and quality

### `/security-audit` - Security Review Workflow
**Purpose:** Comprehensive security analysis and vulnerability assessment  
**Recipe:** `/recipes/security_audit_recipe.md`  
**Agents Used:** `security`, `architect`, `tester`

#### Basic Usage
```bash
/security-audit                 # Full security audit
/security-audit --dependencies  # Dependency vulnerabilities only
/security-audit --code          # Code security analysis
```

#### Options
```bash
/security-audit --deep          # Deep security analysis
/security-audit --compliance    # Compliance checking
/security-audit --pen-test      # Penetration testing approach
/security-audit --report        # Generate security report
```

#### What It Does
1. **Threat Modeling:** Identify security threats and attack vectors
2. **Vulnerability Scanning:** Automated and manual security testing
3. **Code Analysis:** Static analysis for security patterns
4. **Dependency Audit:** Third-party security vulnerabilities  
5. **Remediation:** Security fixes and hardening recommendations

### `/performance` - Performance Optimization
**Purpose:** Performance bottleneck identification and optimization  
**Recipe:** `/recipes/performance_optimization_recipe.md`  
**Agents Used:** `performance`, `architect`, `coder`

#### Basic Usage
```bash
/performance                    # Performance analysis and optimization
/performance --profile          # Performance profiling first
/performance --memory           # Focus on memory optimization
```

#### Options
```bash
/performance --database         # Database query optimization
/performance --frontend         # Frontend performance
/performance --api             # API response optimization
/performance --load-test       # Load testing and scaling
```

#### What It Does  
1. **Performance Profiling:** Identify bottlenecks and resource usage
2. **Analysis:** Root cause analysis of performance issues
3. **Optimization:** Code, query, and architecture optimizations
4. **Validation:** Performance testing and benchmarking
5. **Monitoring:** Performance monitoring setup and alerting

## Infrastructure Commands

### `/memory-sync` - Knowledge Graph Synchronization
**Purpose:** Sync code changes to knowledge graph for enhanced context  
**Recipe:** `/recipes/memory_sync_recipe.md`  
**Agents Used:** `memory-sync`

#### Basic Usage
```bash
/memory-sync                    # Sync all changes
/memory-sync [path]            # Sync specific directory
/memory-sync --types "py,ts"   # Sync specific file types
```

#### Options
```bash
/memory-sync --force           # Force full resync
/memory-sync --incremental     # Only sync changes
/memory-sync --analyze         # Analyze before syncing
/memory-sync --cleanup         # Remove obsolete entries
```

### `/database-migrate` - Database Migration Workflow
**Purpose:** Zero-downtime database schema changes and data migrations  
**Recipe:** `/recipes/database_migration_workflow.md`  
**Agents Used:** `architect`, `coder`, `tester`

#### Basic Usage
```bash
/database-migrate [migration-name]  # Create and run migration
/database-migrate --rollback        # Rollback last migration
/database-migrate --preview         # Preview migration changes
```

#### Options
```bash
/database-migrate --zero-downtime   # Zero-downtime migration strategy
/database-migrate --data-migration  # Include data transformation
/database-migrate --backup-first    # Create backup before migration
/database-migrate --validate        # Validate migration integrity
```

### `/refactor` - Code Refactoring Workflow  
**Purpose:** Large-scale code refactoring with safety and testing  
**Recipe:** `/recipes/complex_refactoring_workflow.md`  
**Agents Used:** `architect`, `coder`, `tester`

#### Basic Usage
```bash
/refactor [component-name]      # Refactor specific component
/refactor --extract-service     # Extract microservice
/refactor --modernize          # Modernize legacy code
```

#### Options
```bash
/refactor --safe               # Extra safety checks and validation
/refactor --preserve-behavior  # Ensure behavior preservation
/refactor --step-by-step       # Incremental refactoring approach
/refactor --performance        # Performance-focused refactoring
```

## Sprint Planning Commands

### `/sprint-plan` - STAD Stage 1: Sprint Preparation
**Purpose:** Comprehensive sprint preparation with ticket selection, spec writing, and dependency mapping  
**Recipe:** `/recipes/sprint_preparation_recipe.md`  
**Agents Used:** `architect`, `documenter`, `scrum_master`  
**STAD Stage:** Stage 1 (Sprint Preparation)

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

### `/sprint-predict` - Predictive Sprint Analysis
**Purpose:** Data-driven sprint planning insights using historical analysis  
**Agent:** `predictive-planner`  
**Implementation:** `/src/planning/PredictivePlanner.ts`

#### Basic Usage
```bash
/sprint-predict
```

#### Options
```bash
/sprint-predict --target 35         # Custom point target (default: 30)
/sprint-predict --risk high         # Risk tolerance: low/medium/high
/sprint-predict --duration 1        # Sprint duration in weeks (default: 2)
/sprint-predict --scope last-3      # Analysis scope: all/last-N/recent
/sprint-predict --format json       # Output format: summary/full/json
/sprint-predict --confidence        # Include confidence breakdown
/sprint-predict --patterns          # Focus on pattern analysis
```

#### What It Does
1. **Historical Analysis:**
   - Parses PROJECT_PLAN.md for sprint completion data
   - Calculates team velocity trends and patterns
   - Identifies successful sprint compositions

2. **Velocity Insights:**
   - Current vs. average velocity analysis
   - Trend detection (increasing/decreasing/stable)
   - Confidence intervals for planning targets

3. **Pattern Recognition:**
   - Successful ticket size distributions
   - Epic combinations that work well together
   - Sprint composition patterns with high success rates

4. **Blocker Prediction:**
   - Historical blocker analysis by epic/ticket type
   - Risk assessment based on past patterns
   - Mitigation strategies for predicted issues

5. **Optimal Composition:**
   - Recommended sprint point target
   - Ideal ticket mix (small/medium/large)
   - Epic prioritization based on success patterns

#### Output Example
```
🎯 PREDICTIVE SPRINT PLANNING INSIGHTS
=====================================

📊 VELOCITY ANALYSIS
Current Velocity: 44 points
Average Velocity: 25 points
Trend: INCREASING
Confidence Range: 12-38 points

🎯 RECOMMENDED SPRINT COMPOSITION
Target Points: 31
Ticket Mix: 1 small + 7 medium + 1 large

🔍 IDENTIFIED PATTERNS
• Pattern 1: Epic mix of System+Integration shows 95% success
• Pattern 2: Sprints with 6-8 tickets complete 90% vs 65% for 10+
• Pattern 3: Security tickets early in sprint reduce blockers by 40%

⚠️ BLOCKER PREDICTIONS
• Medium Risk: Integration Framework epic - dependency complexity
  Mitigation: Schedule dependency reviews early, prepare fallbacks

💡 RECOMMENDATIONS
• Team velocity trending up - consider 33-35 point target
• Focus on Integration Framework, System Observability
• Include 1 buffer ticket for unexpected complexity

🎯 Confidence Level: 87% (based on 4 sprint history)
```

#### Integration with Planning
```bash
# Enhanced sprint planning workflow
/sprint-predict              # Get data-driven insights
[Review predictions]
/sprint-plan --insights      # Use predictions in planning
/sprint-execute              # Execute optimized plan
```

### `/sprint-execute` - STAD Stage 2: Sprint Execution
**Purpose:** Autonomous sprint execution with zero-intervention implementation  
**Recipe:** `/recipes/sprint_execution_recipe.md`  
**Agents Used:** `coder`, `tester`, `debug`, `security`, `performance`, `integration`, `documenter`, `memory-sync`  
**STAD Stage:** Stage 2 (Sprint Execution)

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
# STAD 5-stage workflow (deprecated 7-step shown for reference)
# Stage 1: /sprint-plan → Stage 2: /sprint-execute → Stage 3: /validate → Stage 4: /approve
# Old 7-step (DEPRECATED): /research → /plan → /build → /test → /document → /reflect → /done

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

### Sprint Management
```bash
/st     → /sprint-themed          # Strategic sprint system
/ss     → /sprint-status          # Sprint monitoring
/sp     → /sprint-plan           # Classic sprint planning
/spr    → /sprint-predict        # Predictive analysis
/se     → /sprint-execute        # Sprint execution
```

### Development & Quality
```bash
/af     → /auto-fix              # Auto-fix agent
/api    → /api-feature           # API development
/fs     → /full-stack-feature    # Full-stack development  
/mcp    → /mcp-server           # MCP implementation
/bf     → /bug-fix              # Bug resolution
/tdd    → /tdd-workflow         # Test-driven development
/sec    → /security-audit       # Security audit
/perf   → /performance          # Performance optimization
```

### Infrastructure
```bash
/ms     → /memory-sync          # Knowledge graph sync
/db     → /database-migrate     # Database migration
/ref    → /refactor             # Code refactoring
```

### Documentation  
```bash
/da     → /doc-audit            # Documentation audit
/dt     → /doc-template         # Apply template
/ds     → /doc-split            # Split document
```

### Recipe Execution
```bash
/rc     → /recipe               # Execute recipe
/rcc    → /recipe-chain         # Chain recipes
```

## Integration Patterns

### Standard Development Workflow
```bash
# STAD 5-stage sprint cycle (replaces old 7-step)
# Stage 0: Planning → Stage 1: /sprint-plan → Stage 2: /sprint-execute → Stage 3: /validate → Stage 4: /sprint-retro

# Enhanced with specialized commands
/cmd → /research → /plan → /api-feature → /security-audit → /doc-audit → /done
```

### Sprint-Driven Development
```bash
# Strategic sprint workflow (recommended)  
/sprint-themed → [User Approval] → [Automated Execution] → /sprint-status

# Classic sprint workflow
/sprint-plan → /sprint-execute → /sprint-status

# Predictive-driven planning
/sprint-predict → /sprint-plan → /sprint-execute
```

### Quality-First Workflows
```bash
# TDD approach
/tdd-workflow → /security-audit → /performance → /doc-audit

# Bug resolution workflow  
/auto-fix → /bug-fix → /tdd-workflow → /regression-test

# Security-first development
/security-audit → /api-feature → /security-audit → /penetration-test
```

### Infrastructure & Maintenance
```bash
# Database evolution
/database-migrate → /performance → /security-audit → /doc-audit

# Legacy modernization
/refactor → /tdd-workflow → /performance → /security-audit

# Knowledge management
/memory-sync → /doc-audit → /doc-standardization
```

### Multi-Agent Orchestration
```bash
# Parallel development streams
/sprint-execute --max-agents 5
# Runs multiple agents simultaneously:
# - architect + coder (Feature A)
# - tester + security (Feature B) 
# - documenter (Documentation)
# - memory-sync (Background sync)
```

### Emergency Response Workflows
```bash
# Production issue resolution
/auto-fix --security → /bug-fix --hotfix → /security-audit → /deploy

# Critical bug workflow
/bug-fix --reproduce-first → /root-cause → /hotfix → /regression-test
```

### Documentation Maintenance  
```bash
# Comprehensive documentation audit
/doc-audit → /doc-template → /doc-split → /memory-sync

# Quick documentation updates
/doc-template [file] → /doc-audit --path [dir] → /memory-sync
```

---

## Command Implementation Pattern

Each slash command follows this standard pattern:

1. **Parse Arguments:** Extract options and parameters from command line
2. **Load Recipe:** Read the corresponding recipe file from `/recipes/`
3. **Prepare Context:** Gather necessary project information and constraints
4. **Agent Selection:** Choose and configure appropriate agents for the workflow
5. **Execute Workflow:** Run agents in the specified sequence with quality gates
6. **Report Results:** Provide summary, next steps, and integration points

## Adding New Commands

To add a new slash command:

1. **Create Recipe:** Add recipe file in `/recipes/[recipe_name].md` following established patterns
2. **Define Command:** Add command definition in this file (`/prompts/slash_commands.md`)
3. **Document Integration:** Include usage examples, options, and workflow integration
4. **Test Functionality:** Validate with sample data and edge cases
5. **Update References:** Add to main CLAUDE.md and relevant documentation
6. **Add Aliases:** Include convenient short-form aliases in the aliases section

---

*Commands are implemented through Claude's interpretation of recipes and agent invocations. Actual execution depends on current project context, available tools, and system capabilities.*