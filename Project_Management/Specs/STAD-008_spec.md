# STAD-008 Specification: Create Reflection Agent for Stage 6

**Ticket ID:** STAD-008  
**Story Points:** 5  
**Epic:** Agent Development  
**Sprint:** 8  
**Created:** 08-14-2025  

---

## Description

Create a new Reflection Agent specifically designed for Stage 6 (Reflect) of our 7-stage development process. This agent will aggregate micro-reflections from all previous stages, identify patterns, extract insights, and prepare comprehensive reflection notes that feed into sprint retrospectives. It serves as the bridge between individual ticket learnings and team-wide improvements.

## Current State

Currently:
- No dedicated Reflection Agent exists
- Micro-reflections are scattered and unprocessed
- No systematic pattern identification across stages
- Sprint retrospectives lack detailed insights
- Learnings are lost between sprints
- No aggregation of improvement suggestions

## Acceptance Criteria

- [ ] Reflection Agent created with Stage 6 focus
- [ ] Agent can aggregate micro-reflections from all stages
- [ ] Agent identifies patterns across stages
- [ ] Agent extracts actionable insights
- [ ] Agent produces standardized reflection notes
- [ ] Agent can correlate successes and failures
- [ ] Agent suggests process improvements
- [ ] Agent knows output location (`/Project_Management/Specs/[TICKET]/reflection_notes.md`)
- [ ] Agent can prepare sprint retrospective input
- [ ] Agent tracks improvement suggestions

## 7-Stage Breakdown

### Stage 1: Research (3 hours)
**Required:** Yes  
**Tasks:**
- Study reflection methodologies
- Research pattern recognition techniques
- Analyze aggregation strategies
- Review retrospective best practices
- Study learning extraction methods

**Output:** `/Project_Management/Specs/STAD-008/research_findings.md`

### Stage 2: Plan (3 hours)
**Required:** Yes  
**Tasks:**
- Design agent prompt structure
- Define aggregation logic
- Plan pattern identification algorithms
- Create insight extraction framework
- Design improvement tracking system

**Output:** `/Project_Management/Specs/STAD-008/technical_plan.md`

### Stage 3: Build (5 hours)
**Required:** Yes  
**Tasks:**
- Create reflection.md agent file
- Implement aggregation logic
- Add pattern recognition
- Include insight extraction
- Add improvement suggestions
- Create correlation analysis

**Output:** `/Project_Management/Specs/STAD-008/implementation_summary.md`

### Stage 4: Test (3 hours)
**Required:** Yes  
**Tasks:**
- Test with sample micro-reflections
- Validate pattern identification
- Test insight quality
- Verify aggregation accuracy
- Check improvement suggestions

**Output:** `/Project_Management/Specs/STAD-008/test_results.md`

### Stage 5: Document (2 hours)
**Required:** Yes  
**Tasks:**
- Create agent documentation
- Add reflection examples
- Document pattern types
- Create usage guide

**Output:** `/Project_Management/Specs/STAD-008/documentation_links.md`

### Stage 6: Reflect (1 hour)
**Required:** Yes  
**Tasks:**
- Review agent effectiveness
- Identify meta-improvements
- Note reflection insights
- Capture learnings

**Output:** `/Project_Management/Specs/STAD-008/reflection_notes.md`

### Stage 7: Done (0.5 hours)
**Required:** Yes  
**Tasks:**
- Verify acceptance criteria
- Update PROJECT_PLAN.md
- Commit with semantic format
- Update GitHub board

**Output:** Status update and commit

**Total Estimated Time:** 17.5 hours

## Dependencies

### Depends On:
- STAD-005 (Templates for micro-reflections)
- STAD-001 through STAD-004 (Agents producing micro-reflections)

### Blocks:
- STAD-009 (Sprint template needs reflection format)

## Agent Assignment

**Recommended Agent:** Coder Agent (with Main Claude orchestration)  
**Reason:** Creating new agent file and complex aggregation logic

## Agent Design

### Core Capabilities
```markdown
## Reflection Agent Capabilities

1. **Micro-Reflection Aggregation**
   - Collect from all stage outputs
   - Parse reflection sections
   - Organize by theme
   - Track frequency

2. **Pattern Recognition**
   - Identify recurring themes
   - Spot success patterns
   - Find failure patterns
   - Recognize improvement areas

3. **Insight Extraction**
   - Extract key learnings
   - Identify root causes
   - Find correlations
   - Generate hypotheses

4. **Improvement Suggestions**
   - Process improvements
   - Tool enhancements
   - Template updates
   - Workflow optimizations

5. **Sprint Preparation**
   - Aggregate for retrospective
   - Prioritize insights
   - Track progress on improvements
   - Measure impact
```

### Reflection Process
```markdown
## Reflection Methodology

1. **Collection Phase**
   - Read all stage outputs
   - Extract micro-reflections
   - Categorize by type
   - Note sentiment

2. **Analysis Phase**
   - Identify patterns
   - Find correlations
   - Spot anomalies
   - Track trends

3. **Synthesis Phase**
   - Combine related insights
   - Extract key themes
   - Prioritize learnings
   - Generate recommendations

4. **Action Phase**
   - Suggest improvements
   - Define action items
   - Assign priorities
   - Set metrics

5. **Documentation Phase**
   - Create reflection notes
   - Prepare retrospective input
   - Update knowledge base
   - Track suggestions
```

### Output Template Integration
```markdown
# Reflection Notes - [TICKET-ID]

## Micro-Reflection Summary
### Stage 1: Research
- **Key Insight:** [Most important learning]
- **Challenge:** [Main difficulty]
- **Success:** [What worked well]

### Stage 2: Plan
- **Key Insight:** [Most important learning]
- **Challenge:** [Main difficulty]
- **Success:** [What worked well]

### Stage 3: Build
- **Key Insight:** [Most important learning]
- **Challenge:** [Main difficulty]
- **Success:** [What worked well]

### Stage 4: Test
- **Key Insight:** [Most important learning]
- **Challenge:** [Main difficulty]
- **Success:** [What worked well]

### Stage 5: Document
- **Key Insight:** [Most important learning]
- **Challenge:** [Main difficulty]
- **Success:** [What worked well]

## Patterns Identified

### Success Patterns
1. **Pattern:** [Description]
   - **Occurred in:** [Stages]
   - **Impact:** [Positive outcome]
   - **Recommendation:** [How to repeat]

### Challenge Patterns
1. **Pattern:** [Description]
   - **Occurred in:** [Stages]
   - **Root Cause:** [Why it happened]
   - **Mitigation:** [How to avoid]

### Process Patterns
1. **Pattern:** [Description]
   - **Frequency:** [How often]
   - **Significance:** [Why it matters]
   - **Action:** [What to do]

## Key Learnings

### Technical Learnings
- [Learning 1]
- [Learning 2]

### Process Learnings
- [Learning 1]
- [Learning 2]

### Team Learnings
- [Learning 1]
- [Learning 2]

## Improvement Suggestions

### Immediate Actions
1. **Action:** [What to do]
   - **Why:** [Justification]
   - **Impact:** [Expected benefit]
   - **Effort:** [Low/Medium/High]

### Future Considerations
1. **Consideration:** [What to explore]
   - **Potential:** [Possible benefit]
   - **Investigation:** [What to research]

## Metrics and Measurements

### Time Analysis
- **Estimated Total:** [Hours]
- **Actual Total:** [Hours]
- **Variance:** [+/- %]
- **Bottleneck:** [Which stage]

### Quality Indicators
- **Rework Required:** [Yes/No]
- **Test Coverage:** [%]
- **Documentation Completeness:** [%]
- **Micro-Reflection Quality:** [1-5]

## Knowledge to Preserve
- **Best Practice:** [What to standardize]
- **Tool/Technique:** [What to adopt]
- **Pattern:** [What to follow]
- **Warning:** [What to avoid]

## Sprint Retrospective Input
### Top 3 Successes
1. [Success 1]
2. [Success 2]
3. [Success 3]

### Top 3 Challenges
1. [Challenge 1]
2. [Challenge 2]
3. [Challenge 3]

### Top 3 Improvements
1. [Improvement 1]
2. [Improvement 2]
3. [Improvement 3]
```

## Success Metrics

- Reflection Agent processes 100% of micro-reflections
- Identifies 80% of improvement opportunities
- Patterns lead to measurable improvements
- Sprint retrospectives enriched with insights
- 30% reduction in repeated mistakes
- Knowledge preservation increases

## Notes

- Agent must balance detail with clarity
- Focus on actionable insights
- Patterns must be evidence-based
- Suggestions should be practical
- Track improvement implementation
- Feed continuous improvement cycle