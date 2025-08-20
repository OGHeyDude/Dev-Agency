# Context Improvements Tracking

## Purpose
Document discovered context optimizations and patterns that improve agent performance.

## Context Optimization Patterns

### Pattern Template
```markdown
### [Date] - [Pattern Name]

**Agent:** `/agent:[name]`
**Task Type:** [Type of task]

**Original Context Size:** [tokens/lines]
**Optimized Size:** [tokens/lines]
**Reduction:** [percentage]

**Optimization Technique:**
[Describe how context was optimized]

**Before:**
```[language]
[Example of original context]
```

**After:**
```[language]
[Example of optimized context]
```

**Impact:**
- Quality: [Maintained/Improved/Degraded]
- Speed: [Faster/Same/Slower]
- Token Savings: [Amount]

---
```

## Discovered Patterns

### 08-09-2025 - Initial Setup

**Context Guidelines Established:**

1. **Include Examples, Not Everything**
   - Instead of entire files, include 2-3 relevant examples
   - Focus on patterns, not exhaustive lists

2. **Summarize Standards**
   - Don't include entire standards documents
   - Extract only relevant rules for the task

3. **Use References for Large Structures**
   - For database schemas, show relevant tables only
   - For APIs, show endpoint patterns not all endpoints

---

## Context Structure Templates

### Effective Context for `/agent:coder`
```markdown
## Task
[Specific implementation requirement]

## Existing Pattern
```[language]
[1-2 examples from codebase]
```

## Standards
- [Relevant standard 1]
- [Relevant standard 2]

## Dependencies Available
[List of libraries]

## Success Criteria
[Clear expectations]
```

### Effective Context for `/agent:architect`
```markdown
## System Overview
[Brief current architecture - 3-5 lines]

## Requirements
[Bullet points, not paragraphs]

## Constraints
- Performance: [Specific metric]
- Scale: [Specific number]

## Existing Patterns
[1 example of similar architecture]
```

### Effective Context for `/agent:tester`
```markdown
## Code to Test
```[language]
[Just the implementation, no comments]
```

## Test Framework Example
```[language]
[1 example test from project]
```

## Requirements to Verify
[Bullet points of what to test]
```

## Context Anti-Patterns

### Things to Avoid

1. **Full File Dumps**
   - Don't include entire files
   - Extract only relevant functions

2. **Redundant Information**
   - Don't repeat what's in the prompt
   - Don't include obvious standards

3. **Unstructured Context**
   - Always use clear headers
   - Organize by relevance

4. **Missing Success Criteria**
   - Always include what "done" looks like
   - Specify quality expectations

## Optimal Context Sizes

### By Agent Type

| Agent | Optimal Input | Maximum Useful | Notes |
|-------|--------------|----------------|-------|
| `/agent:architect` | 500-1000 tokens | 2000 tokens | Focus on requirements |
| `/agent:coder` | 1000-2000 tokens | 3000 tokens | Include examples |
| `/agent:tester` | 800-1500 tokens | 2500 tokens | Code + patterns |
| `/agent:security` | 1500-2500 tokens | 4000 tokens | Comprehensive code |
| `/agent:documenter` | 1000-1500 tokens | 2000 tokens | API signatures |

## Context Improvement Discoveries

### What Always Helps
1. **Examples from the actual codebase**
2. **Clear success criteria**
3. **Specific, not general, standards**
4. **Expected output format**

### What Never Helps
1. **Commented-out code**
2. **Historical context/backstory**
3. **Multiple ways to do same thing**
4. **Unrelated code "for context"**

## Token Optimization Techniques

### 1. Code Compression
```python
# Before (45 tokens)
def calculate_total(items):
    """
    Calculate the total price of items
    including tax and discount
    """
    total = 0
    for item in items:
        total = total + item.price
    return total

# After (20 tokens)
def calculate_total(items):
    return sum(item.price for item in items)
```

### 2. Schema Simplification
```sql
-- Before: Full schema (100+ tokens)
-- After: Relevant fields only (20 tokens)
CREATE TABLE users (
    id PRIMARY KEY,
    email UNIQUE,
    role VARCHAR
    -- only fields needed for task
);
```

### 3. Standards Extraction
```markdown
# Before: Full standards doc (500+ tokens)
# After: Relevant rules only (50 tokens)

## Relevant Standards
- Use async/await
- Handle errors with try/catch
- Return consistent response format
```

## Context Quality Metrics

### Measurement Framework

| Metric | How to Measure | Target |
|--------|---------------|--------|
| Completeness | All required info present | 100% |
| Relevance | % of context used in output | >80% |
| Clarity | No clarification needed | 100% |
| Efficiency | Tokens used vs needed | <120% |

## Continuous Improvement Process

1. **After Each Session**
   - Note what context was missing
   - Note what context was unused
   - Calculate token efficiency

2. **Weekly Review**
   - Identify patterns in missing context
   - Update templates
   - Share discoveries

3. **Monthly Analysis**
   - Review token usage trends
   - Update optimal size guidelines
   - Refine anti-patterns list

---

*Last Updated: 08-09-2025*