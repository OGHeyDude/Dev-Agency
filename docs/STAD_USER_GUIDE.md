# STAD Protocol v4.1 User Guide

**The Git-Native Agentic Development Workflow**  
**Version:** 4.1  
**Date:** 08-12-2025  
**Status:** Production Ready with Known Constraints  

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Step-by-Step Workflow](#step-by-step-workflow)
4. [Commands Reference](#commands-reference)
5. [Semantic Commit Format](#semantic-commit-format)
6. [Recovery Procedures](#recovery-procedures)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Known Constraints](#known-constraints)

---

## 🚀 Quick Start

Get up and running with STAD Protocol in 5 minutes:

```bash
# 1. Gather context before planning
./scripts/sprint-preflight.sh

# 2. Plan sprint with Architect Agent
/agent:architect "Plan Sprint 8 with context from preflight"

# 3. Set up parallel execution (if needed)
./scripts/stad-worktree.sh setup

# 4. Implement with semantic commits
git commit -m "feat(auth): STAD-001 complete | Batch:1/3 | Deps:[] | Decision:JWT"

# 5. Track progress
./scripts/review-dashboard.sh "Sprint 8" "User Auth"

# 6. Create checkpoint
git tag -a "sprint-8-batch-1-complete" -m "Batch 1 complete"
```

---

## 🎯 Core Concepts

### The Four Pillars of STAD

1. **GitHub Projects = Visual Sprint Brain**
   - No custom state files needed
   - Project board IS your database
   - Visual progress tracking included

2. **Git Worktrees = Parallel Execution**
   - True isolation for parallel work
   - Zero merge conflicts
   - Native Git feature (no custom code)

3. **Semantic Commits = Immutable State**
   - State travels with code
   - Perfect audit trail
   - Metadata embedded in history

4. **Git Tags = Recovery Checkpoints**
   - Permanent recovery points
   - Easy rollback capability
   - Native Git recovery

### Key Innovation: Zero Custom Code

STAD v4.1 uses ONLY native Git/GitHub features:
- No state.yml files
- No custom databases
- No proprietary tools
- Maximum portability

---

## 📋 Step-by-Step Workflow

### Phase 1: Sprint Planning

#### Step 1.1: Context Gathering
```bash
# Run pre-flight analysis FIRST
./scripts/sprint-preflight.sh

# Output includes:
# - Recent commits and changes
# - Modified areas of codebase
# - Architectural decisions made
# - Recent bug fixes to avoid regression
```

#### Step 1.2: DAG Generation with Architect
```bash
/agent:architect "Plan Sprint 8: User Authentication
Context from preflight:
- Recent changes in /src/auth
- Decision to use JWT tokens
- Bug fix in session handling
Requirements:
- Login/logout functionality
- Password reset
- Session management
Generate DAG showing dependencies"
```

#### Step 1.3: Create GitHub Project Board
Due to CLI limitations, use web UI:
1. Go to: https://github.com/[owner]/[repo]/projects
2. Create new board: "Sprint 8: User Authentication"
3. Add custom fields: Batch, Dependencies, Execution Order
4. See [GitHub Project Setup Guide](STAD_GITHUB_PROJECT_SETUP.md)

### Phase 2: Sprint Execution

#### Step 2.1: Worktree Setup (Optional for Parallel)
```bash
# Create isolated environments
./scripts/stad-worktree.sh setup

# Creates:
# ./batch-1 → feature/sprint-8
# ./batch-2 → feature/sprint-8
# ./batch-3 → feature/sprint-8
```

**Note:** Due to security restrictions, you may not be able to `cd` into worktree directories. Work in main directory instead.

#### Step 2.2: Batch Implementation
Execute tickets in batches per DAG:

```bash
# Batch 1: Foundation (STAD-001, STAD-002)
/agent:coder "Implement STAD-001 and STAD-002 per execution plan
Focus: Database schema and auth service
Dependencies: None
Key decisions: PostgreSQL, JWT tokens"

# Commit with semantic format
git add -A
git commit -m "feat(auth): STAD-001,002 complete | Batch:1/3 | Deps:[] | Decision:PostgreSQL,JWT"

# Create checkpoint
git tag -a "sprint-8-batch-1" -m "Foundation complete"
```

#### Step 2.3: Progress Tracking
```bash
# Generate review dashboard
./scripts/review-dashboard.sh "Sprint 8" "Authentication"

# Check git history with semantic commits
git log --oneline --grep="STAD-"

# View all checkpoints
git tag -l "sprint-8-*"
```

### Phase 3: Review & Completion

#### Step 3.1: Create Pull Request
```bash
# Push feature branch
git push origin feature/sprint-8

# Create PR with metadata
gh pr create \
  --title "feat(sprint-8): User Authentication complete" \
  --body "## Summary
  Implemented complete user authentication system
  
  ## Tickets Completed
  - STAD-001: Database schema
  - STAD-002: Auth service
  - STAD-003: Login/logout
  - STAD-004: Password reset
  
  ## Test Plan
  - [ ] Unit tests pass
  - [ ] Integration tests pass
  - [ ] Manual testing complete
  
  Generated with STAD Protocol v4.1"
```

#### Step 3.2: Review Process
1. Deploy to staging (if applicable)
2. Functional testing
3. Code review
4. Approve/Request changes

---

## 🔧 Commands Reference

### STAD Scripts

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `./scripts/sprint-preflight.sh` | Gather context | Before planning |
| `./scripts/stad-worktree.sh setup` | Create worktrees | For parallel work |
| `./scripts/stad-worktree.sh status` | Check worktrees | During execution |
| `./scripts/stad-worktree.sh clean` | Remove worktrees | After sprint |
| `./scripts/review-dashboard.sh [sprint] [feature]` | Progress report | Daily/On-demand |

### Git Commands for STAD

```bash
# Checkpointing
git tag -a "sprint-X-batch-Y" -m "Description"
git tag -l "sprint-*"                           # List checkpoints

# Semantic commit history
git log --grep="STAD-" --oneline               # Find sprint work
git log --grep="Batch:" --format="%s"          # Track batches
git log --grep="Decision:" --format="%s"       # View decisions

# Recovery
git checkout sprint-8-batch-2                   # Restore to checkpoint
git reflog                                      # View all actions
git bisect start                                # Find bugs automatically
```

### Agent Commands

```bash
# Planning
/agent:architect "Plan [sprint] with [context]"

# Implementation
/agent:coder "Implement [tickets] per plan"

# Testing
/agent:tester "Create tests for [feature]"

# Documentation
/agent:documenter "Document [feature]"
```

---

## 📝 Semantic Commit Format

### Standard Format
```
type(scope): description | Metadata:value | More:metadata
```

### Required Components

1. **Type**: feat, fix, docs, test, refactor, perf, style, chore
2. **Scope**: Module or area affected
3. **Description**: Clear, concise summary
4. **Metadata** (pipe-separated):
   - `Batch:X/Y` - Batch number and total
   - `Deps:[list]` - Dependencies
   - `Decision:choice` - Key architectural decisions
   - `Sprint:N` - Sprint number
   - `Ticket:ID` - Related ticket

### Examples

```bash
# Feature with full metadata
feat(auth): STAD-001,002 complete | Batch:1/3 | Deps:[] | Decision:JWT,PostgreSQL | Sprint:8

# Bug fix with context
fix(session): Resolve timeout issue | Ticket:BUG-042 | Sprint:8 | Decision:Increase-to-30min

# Documentation update
docs(stad): Complete user guide | Sprint:7 | Decision:Git-native-approach

# Test addition
test(auth): Add integration tests | Batch:2/3 | Deps:[STAD-001] | Sprint:8
```

---

## 🔄 Recovery Procedures

### Scenario 1: Session Lost / Context Lost

```bash
# View current state via git
git log --oneline -20 --grep="STAD-"

# Check last checkpoint
git tag -l "sprint-*" | tail -1

# View GitHub issues
gh issue list --label "sprint-8"

# Rebuild context from commits
git log --grep="Decision:" --format="%s" -10
```

### Scenario 2: Need to Find Breaking Change

```bash
# Use git bisect
git bisect start
git bisect bad HEAD                    # Current state is broken
git bisect good sprint-8-batch-2       # Last known good
git bisect run npm test                # Automatically find issue
```

### Scenario 3: Rollback to Checkpoint

```bash
# List available checkpoints
git tag -l "sprint-*"

# Checkout specific checkpoint
git checkout sprint-8-batch-2

# Create new branch from checkpoint
git checkout -b feature/sprint-8-recovery
```

### Scenario 4: Merge Conflict Resolution

```bash
# If using worktrees, merge sequentially
git merge batch-1/feature/sprint-8
git merge batch-2/feature/sprint-8

# Use semantic commits to understand changes
git log --grep="Batch:1" --oneline
```

---

## 🐛 Troubleshooting

### Issue: Cannot create GitHub Project via CLI

**Error:** `gh project create` fails with auth error

**Solution:** 
1. Create via web UI (see [GitHub Project Setup Guide](STAD_GITHUB_PROJECT_SETUP.md))
2. Note project number for queries
3. Use `gh issue list` as alternative

### Issue: Cannot access worktree directories

**Error:** Security prevents `cd` to worktree paths

**Solution:**
1. Work in main directory only
2. Use branches instead of worktrees
3. Merge branches sequentially

### Issue: Semantic commits too verbose

**Problem:** Commit messages becoming too long

**Solution:**
1. Use abbreviations: Deps → D, Decision → Dec
2. Reference issue for details
3. Keep critical metadata only

### Issue: Token usage still high

**Problem:** Not achieving 90% reduction

**Solution:**
1. Batch more tickets together (4-5 per batch)
2. Improve context preparation
3. Use checkpoint recovery instead of regeneration

---

## ✅ Best Practices

### 1. Always Run Pre-flight
```bash
# BEFORE planning any sprint
./scripts/sprint-preflight.sh > context.md
```

### 2. Semantic Commit Discipline
- Include ALL metadata in commits
- Use consistent format
- Reference tickets always

### 3. Checkpoint Frequently
```bash
# After each batch
git tag -a "sprint-X-batch-Y"

# After major milestones
git tag -a "sprint-X-milestone-name"
```

### 4. Document Decisions
```bash
# In commits
Decision:PostgreSQL-over-MySQL

# In code comments
// Decision: JWT for stateless auth (Sprint 8)
```

### 5. Review Dashboard Daily
```bash
# Start of day
./scripts/review-dashboard.sh "Current Sprint" "Feature"
```

---

## ⚠️ Known Constraints

### Current Limitations

| Feature | Status | Workaround |
|---------|--------|------------|
| GitHub Project CLI | ❌ Auth issues | Use web UI |
| Worktree directory access | ❌ Security | Work in main dir |
| 90% token reduction | ⚠️ ~60% achieved | Larger batches |
| Parallel execution | ⚠️ Limited | Sequential merges |

### Environment Requirements

- Git 2.7+ (for worktrees)
- GitHub CLI (`gh`) installed
- Bash shell for scripts
- Node.js (for Dev-Agency agents)

### Not Yet Implemented

- Automated GitHub Project creation
- Full parallel execution in worktrees
- Git hooks for semantic commit validation
- Automated deployment scripts

---

## 📊 Example Sprint Execution

### Sprint 8: User Authentication (Example)

```bash
# Day 1: Planning
./scripts/sprint-preflight.sh
/agent:architect "Plan Sprint 8: User Auth with preflight context"
# Manual: Create GitHub Project Board

# Day 2-3: Implementation
# Batch 1: Foundation
git commit -m "feat(auth): STAD-001,002 done | Batch:1/3 | Deps:[]"
git tag -a "sprint-8-batch-1"

# Batch 2: Core Features  
git commit -m "feat(auth): STAD-003,004 done | Batch:2/3 | Deps:[001,002]"
git tag -a "sprint-8-batch-2"

# Batch 3: Polish
git commit -m "feat(auth): STAD-005,006 done | Batch:3/3 | Deps:[003,004]"
git tag -a "sprint-8-complete"

# Day 4: Review
gh pr create --title "feat: Sprint 8 - User Authentication"
./scripts/review-dashboard.sh "Sprint 8" "Authentication"
```

---

## 🔗 Additional Resources

- [STAD Protocol North Star v4.1](STAD_PROTOCOL_NORTH_STAR.md) - Complete vision
- [GitHub Project Setup](STAD_GITHUB_PROJECT_SETUP.md) - Manual board creation
- [Sprint Retrospective Template](/Development_Standards/Templates/Sprint Retrospective Template.md)
- [Dev-Agency Agents](/Agents/) - Agent definitions
- [Git Worktrees Documentation](https://git-scm.com/docs/git-worktree)
- [Semantic Commit Specification](https://www.conventionalcommits.org/)

---

## 🎯 Success Metrics

Track these metrics to measure STAD effectiveness:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Token Reduction | 60-90% | Compare with non-batched |
| Recovery Time | <5 min | Time to restore context |
| Commit Metadata | 100% | Grep for proper format |
| Checkpoint Usage | Every batch | Count tags per sprint |
| Sprint Velocity | Increasing | Story points completed |

---

## 📝 Getting Help

1. **Check Documentation**: This guide + linked resources
2. **Review Examples**: STAD Day 1-3 summaries
3. **Use Recovery**: Git history has everything
4. **Create Issue**: GitHub issues for bugs/questions

---

**Happy STADing!** 🚀

*Remember: The best code is no code. STAD v4.1 requires zero custom code - just Git and GitHub.*

---

**Document Version:** 1.0  
**Last Updated:** 08-12-2025  
**Next Review:** After Sprint 8 completion