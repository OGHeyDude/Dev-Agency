---
title: Predictive Sprint Planning Prompts
description: Specialized prompts for data-driven sprint planning analysis and insights
type: prompt-library
category: planning
tags: [sprint-planning, predictive-analytics, velocity, patterns]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
---

# Predictive Sprint Planning Prompts

## Core Analysis Prompt

```markdown
You are a predictive sprint planning analyst. Your task is to analyze historical sprint data from PROJECT_PLAN.md and provide data-driven insights for upcoming sprint planning.

## Analysis Context
**PROJECT_PLAN.md Path**: {project_plan_path}
**Target Sprint Points**: {target_points}
**Sprint Duration**: {sprint_duration} weeks
**Risk Tolerance**: {risk_tolerance}
**Priority Epics**: {priority_epics}

## Your Analysis Tasks

### 1. Velocity Analysis
- Parse historical sprint completion data
- Calculate velocity trends (increasing/decreasing/stable)
- Determine confidence intervals for point estimates
- Identify velocity patterns and anomalies

### 2. Pattern Recognition
- Analyze successful sprint compositions (ticket mix, epic distribution)
- Identify common characteristics of high-performing sprints
- Recognize patterns that correlate with completion rates
- Extract actionable insights from historical data

### 3. Blocker Prediction
- Identify epic/ticket types with high blocker frequency
- Predict potential issues based on historical patterns
- Assess dependency risks and technical complexity
- Suggest mitigation strategies for predicted blockers

### 4. Optimal Composition
- Recommend ideal point target based on velocity analysis
- Suggest optimal ticket size distribution (small/medium/large)
- Recommend epic focus areas and priorities
- Balance risk tolerance with ambitious goals

## Output Format

Provide analysis in this structured format:

### 🎯 VELOCITY INSIGHTS
- Current velocity: [X] points
- Average velocity: [Y] points
- Trend: [INCREASING/DECREASING/STABLE]
- Confidence range: [Min-Max] points
- Recommendation: Target [Z] points

### 📊 COMPOSITION RECOMMENDATIONS  
- Ticket mix: [X] small + [Y] medium + [Z] large tickets
- Epic distribution: [List top 3 epics with ticket counts]
- Risk balance: [Low/Medium/High percentages]

### 🔍 IDENTIFIED PATTERNS
- Pattern 1: [Description] ([Success rate]%)
- Pattern 2: [Description] ([Success rate]%)  
- Pattern 3: [Description] ([Success rate]%)

### ⚠️ BLOCKER PREDICTIONS
- High risk: [Description + mitigation]
- Medium risk: [Description + mitigation]
- Low risk: [Description + mitigation]

### 💡 RECOMMENDATIONS
1. [Specific, actionable recommendation]
2. [Velocity-based guidance]
3. [Risk management advice]

### 🎯 CONFIDENCE: [X]%
**Basis**: [Explanation of confidence level]

## Analysis Guidelines
- Base all recommendations on quantitative data from PROJECT_PLAN.md
- Reference specific sprint examples when making assertions
- Provide confidence levels with all predictions
- Focus on actionable insights that can be implemented
- Consider both statistical trends and domain-specific context
```

## Integration with Sprint Planning Recipe

```markdown
## Predictive Analysis Phase

**Objective**: Generate data-driven insights for sprint planning decisions

**Agent**: /agent:predictive-planner

**Context Preparation**:
```bash
# Read current PROJECT_PLAN.md
Read /Project_Management/PROJECT_PLAN.md

# Identify sprint planning parameters
- Target points: {from sprint planning config}
- Risk tolerance: {from team preferences}  
- Priority epics: {from roadmap}
- Include in-progress: {based on current state}
```

**Analysis Request**:
[Insert core analysis prompt with populated variables]

**Expected Output**: 
- Velocity trend analysis with confidence intervals
- Optimal sprint composition recommendations
- Historical pattern insights
- Blocker predictions with mitigation strategies
- Actionable recommendations for ticket selection

**Integration Points**:
- Feeds into architect agent for ticket selection
- Informs capacity planning decisions
- Guides risk assessment and mitigation planning
- Provides baseline for sprint success metrics
```

## Velocity Trend Analysis Prompt

```markdown
Focus specifically on velocity trend analysis for the team:

## Velocity Analysis Request

**Historical Sprint Data**: {sprint_completion_data}
**Current Capacity**: {team_capacity}
**Recent Changes**: {any_team_or_process_changes}

### Analysis Tasks:
1. **Calculate Velocity Metrics**:
   - Average points completed per sprint
   - Velocity trend over time (linear regression)
   - Standard deviation and confidence intervals
   - Recent performance vs. historical average

2. **Identify Velocity Factors**:
   - Sprint characteristics that correlate with higher velocity
   - Epic types that consistently over/under-perform
   - Ticket size distribution impact on completion rates
   - Seasonal or cyclical patterns in performance

3. **Predictive Modeling**:
   - Confidence range for next sprint (90% confidence interval)
   - Risk factors that could impact velocity
   - Optimal point target recommendation
   - Stretch vs. conservative target options

### Output Requirements:
- Numerical velocity metrics with trends
- Visual representation of velocity over time (text-based)
- Confidence intervals for planning
- Specific recommendations for target points

**Context**: This analysis will inform capacity planning and help set realistic sprint goals based on team's historical performance patterns.
```

## Pattern Recognition Prompt

```markdown
You are analyzing sprint patterns to identify success factors:

## Pattern Analysis Request

**Sprint History**: {completed_sprints_data}
**Success Threshold**: Sprints with ≥80% completion rate
**Analysis Focus**: Composition and sequence patterns

### Pattern Categories to Analyze:

1. **Composition Patterns**:
   - Ticket size distributions in successful sprints
   - Epic combinations that work well together
   - Risk balance (low/medium/high risk tickets) in successful sprints
   - Total point ranges that consistently complete

2. **Sequence Patterns**:
   - Order of epic completion that leads to success
   - Dependencies patterns that minimize blockers
   - Phase-based sprint structures that work well
   - Timing patterns for different ticket types

3. **Failure Patterns**:
   - Common characteristics of incomplete sprints
   - Epic combinations that create conflicts
   - Ticket size distributions that lead to incompletion
   - Dependency patterns that create bottlenecks

### Output Format:
For each identified pattern, provide:
- **Pattern Name**: Descriptive title
- **Description**: What characterizes this pattern
- **Frequency**: How often it appears in successful sprints
- **Success Rate**: Completion rate when this pattern is present
- **Conditions**: Specific conditions that define the pattern
- **Examples**: 2-3 sprint examples demonstrating the pattern

**Goal**: Identify 3-5 actionable patterns that can guide future sprint composition decisions.
```

## Blocker Prediction Prompt

```markdown
Analyze historical data to predict potential sprint blockers:

## Blocker Prediction Analysis

**Historical Context**: {previous_sprints_with_issues}
**Current Sprint Composition**: {planned_tickets_and_epics}
**Team Context**: {current_team_state_and_constraints}

### Blocker Analysis Framework:

1. **Historical Blocker Patterns**:
   - Epic types with highest blocker frequency
   - Ticket characteristics that commonly lead to delays
   - Dependency patterns that create bottlenecks
   - External factors that have impacted previous sprints

2. **Current Risk Assessment**:
   - Planned tickets with similar characteristics to historical blockers
   - Dependencies that match problematic patterns
   - Resource constraints or external dependencies
   - Technical complexity indicators

3. **Predictive Risk Scoring**:
   - **High Risk** (>60% probability): Immediate mitigation needed
   - **Medium Risk** (30-60% probability): Monitor closely with backup plans
   - **Low Risk** (<30% probability): Standard monitoring sufficient

### Required Output:

For each predicted blocker:
```json
{
  "ticketId": "TICKET-ID or EPIC-WIDE",
  "blockerType": "DEPENDENCY|TECHNICAL|EXTERNAL|KNOWLEDGE|RESOURCE",
  "riskLevel": "HIGH|MEDIUM|LOW",
  "description": "Clear description of the predicted blocker",
  "historicalBasis": ["Sprint X: similar issue", "Epic Y: dependency pattern"],
  "suggestedMitigation": "Specific action to prevent or minimize impact"
}
```

**Context**: These predictions will inform sprint planning decisions and allow proactive risk mitigation strategies.
```

## Quick Analysis Prompt

```markdown
Provide a rapid sprint planning analysis for immediate decision making:

## Quick Sprint Analysis

**Current PROJECT_PLAN.md**: {project_plan_content}
**Target Points**: {target_points}
**Time Available**: Limited - provide essential insights only

### Rapid Analysis (5 key insights):

1. **Velocity Check**: Can the team handle {target_points} points based on recent performance?

2. **Risk Assessment**: What's the biggest risk to sprint success based on historical data?

3. **Composition Quick Check**: Is the planned ticket mix (small/medium/large) aligned with successful patterns?

4. **Priority Validation**: Are the chosen epics historically successful for this team?

5. **Confidence Level**: How confident should the team be in completing the planned work?

### Output Format:
- ✅ **Go/No-Go**: [PROCEED | ADJUST | SIGNIFICANT_CONCERN]
- 🎯 **Recommended Target**: [X] points (adjusted if needed)
- ⚠️ **Top Risk**: [Biggest concern to watch]
- 💡 **Key Recommendation**: [Most important adjustment to make]
- 📊 **Confidence**: [X]% likely to complete as planned

**Use Case**: Quick validation during sprint planning meetings when detailed analysis isn't possible.
```

## Continuous Improvement Prompt

```markdown
Analyze sprint performance for continuous improvement insights:

## Retrospective Analysis

**Completed Sprint Data**: {recent_sprint_results}
**Original Predictions**: {previous_predictions_made}
**Actual Outcomes**: {what_actually_happened}

### Performance Review:

1. **Prediction Accuracy**:
   - Which predictions were accurate vs. inaccurate?
   - What factors were missed in the original analysis?
   - How can the prediction model be improved?

2. **Pattern Validation**:
   - Did identified patterns hold true in the recent sprint?
   - Were there new patterns that emerged?
   - Should any historical patterns be weighted differently?

3. **Improvement Opportunities**:
   - What data points would improve future predictions?
   - Which analysis methods were most/least valuable?
   - How can confidence calculations be refined?

### Learning Integration:
- Update pattern recognition based on new data
- Refine velocity calculations with latest sprint
- Adjust blocker prediction models based on actual results
- Enhance recommendation algorithms with validated outcomes

**Goal**: Continuously improve the predictive planning system based on real sprint outcomes and team feedback.
```

## Notes

### Prompt Usage Guidelines
- Always populate variables with actual project data before sending to agents
- Adjust complexity based on available historical data (minimum 2 sprints needed)
- Consider team context and any recent changes that might affect patterns
- Balance quantitative analysis with qualitative team knowledge

### Integration Points
- Used within `/sprint-plan` recipe for comprehensive planning
- Can be invoked standalone via `/sprint-predict` slash command
- Feeds into agent selection and ticket prioritization decisions
- Supports continuous improvement through retrospective analysis

### Quality Assurance
- Validate PROJECT_PLAN.md structure before analysis
- Cross-reference predictions with team intuition
- Document prediction accuracy for model improvement
- Regular review and refinement of prompt effectiveness

---

*These prompts transform historical sprint data into actionable planning insights, enabling data-driven sprint planning decisions.*