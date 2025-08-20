# STAD Stage Templates - Usage Guide

## Overview

These templates support the STAD Protocol (Stateful & Traceable Agentic Development) 5-stage sprint lifecycle. Each template ensures consistency, quality, and traceable documentation throughout the development process.

## The 5 STAD Stages

```
Stage 0 → Stage 1 → Stage 2 → Stage 3 → Stage 4
Strategic  Sprint    Sprint    Sprint    Release &
Planning   Prep      Execute   Validate  Retro
```

## Template Files

| Stage | Template | Purpose | When to Use |
|-------|----------|---------|-------------|
| 0 | `stage0_epic_definition.md` | Define epics and strategic initiatives | Before sprint planning |
| 1 | `stage1_comprehensive_spec.md` | Create complete technical specifications | During sprint planning |
| 2 | `stage2_implementation_report.md` | Document implementation progress | After code completion |
| 3 | `stage3_validation_report.md` | Record validation results | During QA phase |
| 4 | `stage4_retrospective_summary.md` | Capture sprint learnings | End of sprint |

## Usage Instructions

### Stage 0: Epic Definition
**When:** Quarterly planning or new initiative
**Who:** Product Owner, Architect, Technical Lead
**Output Location:** `/Project_Management/Epics/`

```bash
# Copy template
cp stage0_epic_definition.md /Project_Management/Epics/EPIC-XXX_definition.md
# Fill out all sections
# Get approvals before proceeding
```

### Stage 1: Comprehensive Specification
**When:** Sprint planning (Monday)
**Who:** Architect Agent, Technical Lead
**Output Location:** `/Project_Management/Specs/`

```bash
# Copy template for each ticket
cp stage1_comprehensive_spec.md /Project_Management/Specs/TICKET-XXX_spec.md
# Document ALL design decisions
# Ensure zero ambiguity for Stage 2
```

**Critical Requirements:**
- Must enable zero-intervention execution
- All design decisions documented
- Dependencies mapped completely
- Edge cases addressed

### Stage 2: Implementation Report
**When:** After implementation complete
**Who:** Implementing Agent/Developer
**Output Location:** `/Project_Management/Sprint_Execution/Sprint_N/`

```bash
# Create report after implementation
cp stage2_implementation_report.md /Project_Management/Sprint_Execution/Sprint_N/TICKET-XXX_implementation.md
# Document what was built
# Confirm NO design decisions were made
```

**Key Points:**
- Should follow Stage 1 spec exactly
- Document any challenges (without design changes)
- Record handoffs between agents

### Stage 3: Validation Report
**When:** Sprint validation phase (Friday AM)
**Who:** QA Agent, Testing Team
**Output Location:** `/Project_Management/Sprint_Validation/Sprint_N/`

```bash
# Create validation report
cp stage3_validation_report.md /Project_Management/Sprint_Validation/Sprint_N/validation_report.md
# Run all quality gates
# Document all findings
```

**Quality Gates:**
- Code quality checks
- Test coverage validation
- Security scanning
- Performance testing
- Documentation review

### Stage 4: Retrospective Summary
**When:** End of sprint (Friday PM)
**Who:** Scrum Master, Entire Team
**Output Location:** `/Project_Management/Sprint_Retrospectives/`

```bash
# Create retrospective
cp stage4_retrospective_summary.md /Project_Management/Sprint_Retrospectives/Sprint_N_retrospective.md
# Aggregate all work reports
# Capture learnings
# Plan improvements
```

## Best Practices

### DO:
✅ Fill out templates completely - no skipped sections
✅ Use templates immediately when entering each stage
✅ Keep templates factual and objective
✅ Update templates if requirements change
✅ Archive old versions when updating

### DON'T:
❌ Skip templates to save time
❌ Modify template structure without team agreement
❌ Leave placeholders unfilled
❌ Delete old reports (always archive)
❌ Make templates overly verbose

## Template Principles

1. **Completeness Over Brevity**
   - Better to be thorough than miss critical information
   - But avoid unnecessary verbosity

2. **Consistency Is Key**
   - Use same format across all tickets/sprints
   - Enables easy aggregation and analysis

3. **Traceability Matters**
   - Every decision should be documented
   - Every output should be locatable

4. **Stage Gates Are Mandatory**
   - Each template includes validation checklist
   - Must pass gates to proceed

## Integration with Agents

### Agent-Specific Usage
- **Architect Agent**: Uses Stage 1 template
- **Coder Agent**: Reads Stage 1, writes Stage 2
- **Tester Agent**: Contributes to Stage 3
- **Documenter Agent**: Updates throughout stages
- **Retrospective Agent**: Generates Stage 4

### Automation Opportunities
```bash
# Future: Auto-generate templates
./scripts/create-sprint-templates.sh Sprint_N

# Future: Validate template completion
./scripts/validate-template.sh stage1_comprehensive_spec.md
```

## Metrics and Success

### Template Usage Metrics
- Target: 100% template usage for all stages
- Measure: Templates created vs tickets completed
- Review: Weekly in retrospectives

### Quality Indicators
- Specs enable zero-intervention: >90%
- Validation first-pass rate: >80%
- Retrospective actions implemented: >75%

## Common Issues and Solutions

### Issue: "Templates feel like overhead"
**Solution:** Templates save time by preventing rework. Track time saved from clear specs.

### Issue: "Specs not detailed enough for Stage 2"
**Solution:** Review Stage 1 template sections. Add more detail to implementation steps.

### Issue: "Validation missing issues"
**Solution:** Enhance Stage 3 checklist. Add automated quality gates.

### Issue: "Retrospectives not driving improvement"
**Solution:** Make action items specific and assigned. Track completion.

## Template Evolution

Templates are living documents. To propose changes:

1. Document the problem
2. Propose specific change
3. Test with one sprint
4. Review in retrospective
5. Update if successful

## Quick Reference

### File Naming Convention
```
Stage 0: EPIC-XXX_definition.md
Stage 1: TICKET-XXX_spec.md
Stage 2: TICKET-XXX_implementation.md
Stage 3: Sprint_N_validation.md
Stage 4: Sprint_N_retrospective.md
```

### Location Map
```
/Project_Management/
├── Epics/                    # Stage 0 outputs
├── Specs/                    # Stage 1 outputs
├── Sprint_Execution/         # Stage 2 outputs
├── Sprint_Validation/        # Stage 3 outputs
└── Sprint_Retrospectives/    # Stage 4 outputs
```

---

*Templates support STAD Protocol v5.1 - Updated 08-16-2025*