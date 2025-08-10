---
title: Clean Code and Anti-Clutter Policy
description: Mandatory clean code principles and anti-clutter standards that prevent redundancy and maintain single source of truth
type: policy
category: standards
tags: [clean-code, dry-principle, refactoring, code-quality, anti-clutter, maintenance, policy]
created: 2025-08-09
updated: 2025-08-10
version: 1.1
status: active
---

# Policy: Clean Code and Anti-Clutter Standards

## Philosophy
**"Single Source of Truth - No Clutter, No Redundancy"**

This recipe enforces clean code principles and prevents clutter accumulation in codebases through systematic checks and balances.

## Core Principles

### DRY (Don't Repeat Yourself)
- Every piece of knowledge must have a single, unambiguous representation
- Extract common patterns into reusable components
- Consolidate similar functionality

### KISS (Keep It Simple, Stupid)
- Avoid unnecessary complexity
- Choose clarity over cleverness
- Simplest solution that works is the best

### YAGNI (You Aren't Gonna Need It)
- Don't add functionality until it's needed
- Avoid speculative features
- Remove unused code immediately

## The Anti-Clutter Workflow

### Phase 1: Pre-Implementation Audit (MANDATORY)
**Time: 15-20 minutes**
**Principle: "Search First, Create Second"**

#### Step 1: Comprehensive Search
```bash
# Search for similar functionality
Grep "function_name|similar_pattern" --type [filetype]

# Check for existing implementations
Glob "**/*similar*"

# Review related files
ls [target_directory]
Read [existing_files]
```

#### Step 2: Duplication Check
```markdown
Main Claude:
"Before I implement [feature], check for:
1. Does this functionality already exist?
2. Can I extend an existing component?
3. Is there a pattern I should follow?
4. What can be reused?"
```

#### Step 3: Location Verification
```markdown
Verify:
- [ ] This is the CORRECT directory for this type of file
- [ ] The naming follows project conventions
- [ ] Similar files are in the same location
- [ ] This doesn't fragment related code
```

### Phase 2: Implementation with Clutter Prevention
**Time: Variable**
**Principle: "Consolidate and Simplify"**

#### Step 1: Architect Review
```markdown
/agent:architect

"Review this implementation plan for:
1. Redundancy with existing components
2. Opportunities for consolidation
3. Over-engineering risks
4. Simpler alternatives

IMPORTANT: Flag ANY duplication or unnecessary complexity."
```

#### Step 2: Clean Implementation
```markdown
/agent:coder

"Implement with these MANDATORY requirements:
1. NO duplication of existing code
2. REUSE existing utilities and patterns
3. EXTRACT common functionality
4. KEEP functions focused and small
5. AVOID unnecessary abstractions
6. COMMENT only complex logic

Before creating ANY new function:
- Search for existing similar functions
- Check if you can extend existing code
- Verify this is the simplest approach"
```

#### Step 3: Real-time Consolidation
```markdown
During implementation:
- If you find similar code: STOP and refactor
- If you copy-paste: STOP and extract
- If file gets too large: STOP and split logically
- If logic gets complex: STOP and simplify
```

### Phase 3: Post-Implementation Cleanup
**Time: 20-30 minutes**
**Principle: "Leave it cleaner than you found it"**

#### Step 1: Clutter Detection
```markdown
/agent:clutter-detector

"Analyze the implementation for:
1. Code duplication (even partial)
2. Dead code
3. Unused imports/variables
4. Redundant comments
5. Over-complex abstractions
6. Files that should be consolidated
7. Scattered related functionality

Report all findings with specific locations."
```

#### Step 2: Consolidation Pass
```markdown
For each finding:
1. Duplicate code → Extract to shared function
2. Dead code → Remove immediately
3. Unused items → Delete
4. Redundant comments → Remove
5. Complex abstractions → Simplify
6. Multiple similar files → Consolidate
7. Scattered code → Group together
```

#### Step 3: Documentation Consolidation
```markdown
/agent:documenter

"IMPORTANT: Do NOT create new documentation files.
Instead:
1. UPDATE existing documentation
2. CONSOLIDATE scattered docs
3. REMOVE outdated information
4. MAINTAIN single source of truth

Check for existing docs BEFORE writing anything new."
```

### Phase 4: Quality Gates
**Time: 10-15 minutes**
**Principle: "Verify cleanliness"**

#### Gate 1: No Duplication
```bash
# Check for duplicate code
Grep -n "identical_patterns" 

# Verify DRY principle
- [ ] No copy-pasted code
- [ ] Common patterns extracted
- [ ] Utilities properly shared
```

#### Gate 2: Proper Organization
```markdown
- [ ] All files in correct directories
- [ ] Related code is grouped
- [ ] No scattered functionality
- [ ] Clear separation of concerns
```

#### Gate 3: Minimal Complexity
```markdown
- [ ] Functions are small (<30 lines)
- [ ] Cyclomatic complexity is low
- [ ] No unnecessary abstractions
- [ ] Clear, simple logic
```

## Weekly Clutter Sweep

### Schedule: Every Friday
```markdown
/agent:clutter-detector

"Perform comprehensive clutter analysis:
1. Find ALL duplicate code patterns
2. Identify unused files/functions
3. Locate over-complex areas
4. Find scattered related code
5. Identify consolidation opportunities

Generate cleanup tasks for next sprint."
```

## Anti-Patterns to Detect and Fix

### Code Smells
| Smell | Detection | Fix |
|-------|-----------|-----|
| Duplicate code | Same logic in multiple places | Extract to shared function |
| Long functions | >30 lines | Split into smaller functions |
| Dead code | Unused functions/variables | Delete immediately |
| God objects | Classes doing too much | Split responsibilities |
| Shotgun surgery | Change requires many file edits | Consolidate related code |

### Documentation Smells
| Smell | Detection | Fix |
|-------|-----------|-----|
| Duplicate docs | Same info in multiple files | Single source of truth |
| Outdated docs | Doesn't match code | Update or delete |
| Over-documentation | Obvious comments | Remove redundant comments |
| Scattered docs | Related info in many files | Consolidate |

## Metrics for Success

### Cleanliness Metrics
- **Duplication Rate**: <5% (measured by tools)
- **Average Function Length**: <20 lines
- **File Count Growth**: Minimal (consolidate rather than create)
- **Documentation Files**: Decreasing over time (consolidation)

### Quality Indicators
- [ ] Can find any functionality in <30 seconds
- [ ] No "where should this go?" confusion
- [ ] Clear ownership of code sections
- [ ] Easy to understand without extensive docs

## Enforcement Checklist

### Before Creating ANY File
- [ ] Searched for existing similar files
- [ ] Verified this is the correct location
- [ ] Checked if can add to existing file
- [ ] Confirmed this separation is necessary

### Before Writing ANY Code
- [ ] Searched for existing implementations
- [ ] Identified reusable components
- [ ] Planned to avoid duplication
- [ ] Chosen simplest approach

### After Implementation
- [ ] Ran clutter detection
- [ ] Consolidated duplicates
- [ ] Removed dead code
- [ ] Updated (not created) documentation

### During Code Review
- [ ] Zero duplication confirmed
- [ ] Proper organization verified
- [ ] Complexity minimized
- [ ] Documentation consolidated

## Commands Quick Reference

```bash
# Pre-implementation search
Grep "pattern" --type js
Glob "**/similar*"
ls target_directory/

# Clutter detection
/agent:clutter-detector

# Consolidation
/agent:coder "Refactor and consolidate these duplicate functions"

# Documentation update
/agent:documenter "UPDATE existing docs, do not create new"
```

## Remember

> "The best code is no code"  
> "The second best code is reused code"  
> "The third best code is simple code"

**Every line of code is a liability. Every file is a maintenance burden. Keep it minimal, keep it clean.**

---

*Recipe Version: 1.0 | Focus: Anti-Clutter*