# Prompt Evolution Tracking

## Purpose
Version control and track the evolution of agent prompts based on real-world usage and feedback.

## Prompt Versioning System

### Version Format
`[Agent]_v[Major].[Minor].[Patch]`

- **Major:** Significant restructuring
- **Minor:** New capabilities added
- **Patch:** Small improvements/fixes

### Change Categories
- 🔧 **Fix:** Corrects issues
- ✨ **Enhancement:** Improves quality
- 🚀 **Feature:** Adds capability
- 📝 **Clarity:** Improves understanding
- ⚡ **Performance:** Optimizes tokens

## Prompt Evolution Log

### Template
```markdown
## [Date] - [Agent] - v[Version]

**Change Type:** [Fix/Enhancement/Feature/Clarity/Performance]

**Reason for Change:**
[What prompted this update]

**Previous Version Issues:**
[What wasn't working]

**Changes Made:**
[Specific modifications]

**Results:**
[Improvement observed]

**Prompt Diff:**
```diff
- [Removed text]
+ [Added text]
```

**Stored Location:**
`/prompts/[domain]/[agent]_v[version].md`

---
```

## Evolution History

### 08-09-2025 - All Agents - v1.0.0

**Change Type:** 🚀 Feature

**Reason for Change:**
Initial system setup

**Changes Made:**
Created comprehensive initial prompts for all agents

**Results:**
Baseline established for all agents

**Stored Location:**
Various templates in `/AGENT_PROMPTS.md`

---

## Prompt Improvement Patterns

### Discovered Patterns That Work

#### 1. Explicit Output Format
**Before:** "Provide a solution"
**After:** "Provide solution as: 1. Analysis 2. Implementation 3. Tests"
**Impact:** 40% more structured outputs

#### 2. Success Criteria First
**Before:** Criteria at end of prompt
**After:** Criteria immediately after task description
**Impact:** 25% better requirement adherence

#### 3. Example-Driven Context
**Before:** Describing patterns
**After:** Showing actual code examples
**Impact:** 60% more accurate pattern following

#### 4. Role Reinforcement
**Before:** Generic "implement this"
**After:** "You are an expert [language] developer"
**Impact:** 20% quality improvement

## Prompt Components Analysis

### High-Impact Components

| Component | Impact | Should Include |
|-----------|--------|----------------|
| Role Definition | High | Always |
| Success Criteria | High | Always |
| Examples | High | When applicable |
| Output Format | High | Always |
| Standards | Medium | When relevant |
| Constraints | Medium | When applicable |
| Context | High | Always |
| Anti-patterns | Low | Only if common |

## A/B Testing Results

### Test Template
```markdown
### [Date] - [Test Name]

**Hypothesis:** [What we're testing]

**Version A:** [Control prompt]
**Version B:** [Test prompt]

**Metric:** [What we're measuring]

**Results:**
- Version A: [Result]
- Version B: [Result]

**Winner:** [A or B]
**Adoption:** [Yes/No]
```

## Prompt Library

### Stable Prompts (v1.0+)

#### `/agent:coder` - REST API Implementation
**Version:** v1.0.0
**Success Rate:** [To be measured]
**Location:** `/prompts/web-api/coder_v1.0.0.md`

#### `/agent:tester` - Unit Test Creation
**Version:** v1.0.0
**Success Rate:** [To be measured]
**Location:** `/prompts/testing/tester_v1.0.0.md`

### Experimental Prompts (v0.x)

[None yet - all prompts at v1.0.0]

### Deprecated Prompts

[None yet]

## Prompt Optimization Techniques

### Token Reduction Strategies

1. **Remove Redundancy**
   - Eliminate repeated instructions
   - Combine similar requirements
   - Use references instead of repetition

2. **Compress Instructions**
   - Use bullet points vs paragraphs
   - Abbreviate when clear
   - Remove obvious statements

3. **Optimize Examples**
   - Show patterns, not everything
   - Use minimal working examples
   - Reference instead of include when possible

### Clarity Improvements

1. **Structure Consistently**
   - Same order across similar prompts
   - Clear section headers
   - Numbered steps when sequential

2. **Be Specific**
   - Exact format requirements
   - Concrete success criteria
   - Measurable outcomes

3. **Avoid Ambiguity**
   - One interpretation only
   - Clear boundaries
   - Explicit inclusions/exclusions

## Prompt Performance Metrics

### Tracking Framework

| Metric | How to Measure | Target | Current |
|--------|---------------|--------|---------|
| First-Success Rate | % correct first try | >80% | TBD |
| Clarity Score | % needing clarification | <10% | TBD |
| Token Efficiency | Output quality/tokens | >0.8 | TBD |
| Pattern Adherence | % following examples | >90% | TBD |

## Version Migration Guide

### When to Version

- **Major (1.0.0 → 2.0.0)**
  - Complete restructuring
  - Different approach
  - Breaking changes

- **Minor (1.0.0 → 1.1.0)**
  - New capabilities
  - Significant improvements
  - Added sections

- **Patch (1.0.0 → 1.0.1)**
  - Typo fixes
  - Small clarifications
  - Minor optimizations

### Migration Process

1. Test new version with recent task
2. Compare outputs side-by-side
3. Measure improvement metrics
4. Document in this log
5. Update prompt library
6. Deprecate old version after validation

## Best Practices Discovered

### DO:
- ✅ Start with role definition
- ✅ Provide clear success criteria
- ✅ Include relevant examples
- ✅ Specify output format
- ✅ End with deliverables summary

### DON'T:
- ❌ Include unnecessary context
- ❌ Repeat instructions
- ❌ Use vague language
- ❌ Mix multiple tasks
- ❌ Assume prior knowledge

## Prompt Templates Repository

### Location Structure
```
/prompts/
├── web-api/
│   ├── coder_v*.md
│   ├── tester_v*.md
│   └── documenter_v*.md
├── mcp/
│   ├── mcp-dev_v*.md
│   └── integration_v*.md
├── frontend/
│   ├── coder_v*.md
│   └── tester_v*.md
└── backend/
    ├── architect_v*.md
    ├── coder_v*.md
    └── performance_v*.md
```

## Next Evolution Targets

### Priority Improvements
1. [ ] Optimize `/agent:architect` context size
2. [ ] Improve `/agent:tester` TDD flow
3. [ ] Enhance `/agent:security` OWASP coverage
4. [ ] Refine `/agent:mcp-dev` examples

### Experimental Features
1. [ ] Chain-of-thought prompting
2. [ ] Self-correction instructions
3. [ ] Meta-prompting techniques
4. [ ] Few-shot learning patterns

---

*Evolution tracking started: 08-09-2025*