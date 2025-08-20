#!/bin/bash

# STAD Tickets Details for GitHub Project Board
# This script adds detailed STAD tickets to the GitHub project board

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          Adding Detailed STAD Tickets to Board            ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Source the board IDs
AGENTS_BOARD_ID="PVT_kwHOB9xtSs4BAXMC"

# Function to add a detailed ticket
add_ticket() {
    local title="$1"
    local body="$2"
    
    echo "Adding: $title"
    
    gh api graphql -f query="
    mutation {
      addProjectV2DraftIssue(input: {
        projectId: \"$AGENTS_BOARD_ID\"
        title: \"$title\"
        body: \"$body\"
      }) {
        projectItem {
          id
        }
      }
    }" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ Added successfully"
    else
        echo "⚠ May already exist or error occurred"
    fi
}

# STAD-001
add_ticket "[DETAILED] STAD-001: Align Architect Agent with Stage 1 (Sprint Preparation)" "## Description
Update the Architect Agent to focus specifically on Stage 1 (Sprint Preparation) of the STAD Protocol 5-stage process.

## Story Points: 3
## Epic: Prompt Engineering
## Dependencies: STAD-005, STAD-006

## Acceptance Criteria
- [ ] Architect Agent prompt updated to focus on Stage 2 responsibilities
- [ ] Agent produces standardized technical plans using templates
- [ ] Agent includes micro-reflections in all outputs
- [ ] Agent knows output location (/Project_Management/Specs/[TICKET]/technical_plan.md)
- [ ] Agent can generate DAGs in Mermaid format
- [ ] Agent can identify parallelization opportunities

## Deliverables
1. Updated architect.md with Stage 2 focus
2. Technical plan template for Architect Agent use
3. Example DAG in Mermaid format
4. Micro-reflection template section
5. Documentation of changes

## Spec Location
/Project_Management/Specs/STAD-001_spec.md"

# STAD-002
add_ticket "[DETAILED] STAD-002: Align Coder Agent with Stage 2 (Sprint Execution)" "## Description
Update the Coder Agent to focus specifically on Stage 2 (Sprint Execution) of the STAD Protocol 5-stage process.

## Story Points: 3
## Epic: Prompt Engineering
## Dependencies: STAD-005, STAD-006

## Acceptance Criteria
- [ ] Coder Agent prompt updated to focus on Stage 3 responsibilities
- [ ] Agent understands and follows folder organization rules
- [ ] Agent implements archive-don't-delete policy
- [ ] Agent produces standardized implementation summaries with micro-reflections
- [ ] Agent knows correct locations for different file types
- [ ] Agent archives old files instead of deleting them

## Key Features
- Folder organization rules integration
- Archive policy implementation
- Implementation summary template
- Micro-reflection sections

## Spec Location
/Project_Management/Specs/STAD-002_spec.md"

# STAD-003
add_ticket "[DETAILED] STAD-003: Align Tester Agent with Stage 2 (Sprint Execution)" "## Description
Update the Tester Agent to focus specifically on Stage 2 (Sprint Execution - Testing) of the STAD Protocol 5-stage process.

## Story Points: 3
## Epic: Prompt Engineering
## Dependencies: STAD-005, STAD-006

## Acceptance Criteria
- [ ] Tester Agent prompt updated to focus on Stage 4 responsibilities
- [ ] Agent understands test file organization (/src/[module]/__tests__/)
- [ ] Agent knows coverage requirements (80% minimum)
- [ ] Agent produces standardized test results with micro-reflections
- [ ] Agent identifies and documents edge cases
- [ ] Agent doesn't concern itself with implementation or documentation

## Testing Requirements
- Unit test creation and organization
- Integration test scenarios
- Coverage reporting (80% minimum)
- Edge case identification
- Test execution tracking

## Spec Location
/Project_Management/Specs/STAD-003_spec.md"

# STAD-004
add_ticket "[DETAILED] STAD-004: Align Documenter Agent with Continuous Documentation" "## Description
Update the Documenter Agent for continuous documentation across all stages of the STAD Protocol 5-stage process.

## Story Points: 3
## Epic: Prompt Engineering
## Dependencies: STAD-005, STAD-006

## Acceptance Criteria
- [ ] Documenter Agent prompt updated to focus on Stage 5 responsibilities
- [ ] Agent understands documentation hierarchy (/docs/ structure)
- [ ] Agent knows to UPDATE existing docs, not create duplicates
- [ ] Agent produces standardized documentation summaries with micro-reflections
- [ ] Agent follows anti-clutter principles (update > create)
- [ ] Agent focuses on user clarity

## Documentation Standards
- Update over create principle
- Documentation hierarchy rules
- Examples and tutorials
- API documentation
- User guide updates

## Spec Location
/Project_Management/Specs/STAD-004_spec.md"

# STAD-005
add_ticket "[DETAILED] STAD-005: Create Stage-Specific Output Templates" "## Description
Create standardized output templates for each of the 5 stages of the STAD Protocol.

## Story Points: 5
## Epic: Templates & Standards
## Dependencies: None (Foundation ticket)
## Blocks: STAD-001, 002, 003, 004, 007, 008

## Acceptance Criteria
- [ ] Template created for Stage 0 (Strategic Planning) - epic_definition.md
- [ ] Template created for Stage 1 (Sprint Preparation) - sprint_plan.md
- [ ] Template created for Stage 2 (Sprint Execution) - execution_summary.md
- [ ] Template created for Stage 3 (Sprint Validation) - validation_report.md
- [ ] Template created for Stage 4 (Release & Retrospective) - release_notes.md
- [ ] All templates include handoff sections
- [ ] All templates include work report sections

## Templates to Create
1. epic_definition_template.md
2. sprint_plan_template.md
3. execution_summary_template.md
4. validation_report_template.md
5. release_notes_template.md

## Spec Location
/Project_Management/Specs/STAD-005_spec.md"

# STAD-006
add_ticket "[DETAILED] STAD-006: Define and Document Folder Organization Rules" "## Description
Create comprehensive folder organization rules that all agents and developers must follow.

## Story Points: 3
## Epic: Standards & Organization
## Dependencies: None (Foundation ticket)
## Blocks: STAD-001, 002, 003, 004, 007, 008

## Acceptance Criteria
- [ ] Comprehensive folder structure documented
- [ ] Archive policy fully defined with examples
- [ ] File type to location mapping created
- [ ] Stage output locations specified
- [ ] Module organization rules defined
- [ ] Documentation hierarchy established
- [ ] Archive naming conventions specified

## Key Deliverables
- Master folder structure definition
- Archive policy (never delete, always archive)
- File location reference guide
- Decision flowcharts
- Enforcement scripts

## Spec Location
/Project_Management/Specs/STAD-006_spec.md"

# STAD-007
add_ticket "[DETAILED] STAD-007: Create Scrum Master Agent for STAD Coordination" "## Description
Create a Scrum Master Agent specifically designed for coordinating the STAD Protocol 5-stage process.

## Story Points: 5
## Epic: Agent Development
## Dependencies: STAD-005, STAD-006

## Acceptance Criteria
- [ ] Research Agent created with Stage 1 focus
- [ ] Agent can search codebases effectively
- [ ] Agent identifies patterns and anti-patterns
- [ ] Agent finds existing implementations
- [ ] Agent produces standardized research findings
- [ ] Agent follows anti-clutter principles
- [ ] Agent provides clear recommendations

## Core Capabilities
- Codebase search (Grep, Glob)
- Pattern identification
- Duplicate detection
- Solution discovery
- Recommendation engine

## Spec Location
/Project_Management/Specs/STAD-007_spec.md"

# STAD-008
add_ticket "[DETAILED] STAD-008: Create Retrospective Agent for Stage 4" "## Description
Create a Retrospective Agent specifically designed for Stage 4 (Release & Retrospective) of the STAD Protocol.

## Story Points: 5
## Epic: Agent Development
## Dependencies: STAD-005, STAD-001-004

## Acceptance Criteria
- [ ] Reflection Agent created with Stage 6 focus
- [ ] Agent can aggregate micro-reflections from all stages
- [ ] Agent identifies patterns across stages
- [ ] Agent extracts actionable insights
- [ ] Agent produces standardized reflection notes
- [ ] Agent can prepare sprint retrospective input
- [ ] Agent tracks improvement suggestions

## Core Functions
- Micro-reflection aggregation
- Pattern recognition
- Insight extraction
- Improvement suggestions
- Sprint retrospective preparation

## Spec Location
/Project_Management/Specs/STAD-008_spec.md"

# STAD-009
add_ticket "[DETAILED] STAD-009: Create Sprint Planning Template" "## Description
Create a comprehensive sprint planning template that aligns with the STAD Protocol 5 stages.

## Story Points: 3
## Epic: Templates & Planning
## Dependencies: STAD-005, STAD-001

## Acceptance Criteria
- [ ] Sprint planning template created with STAD 5-stage alignment
- [ ] Template includes time estimation per stage
- [ ] Dependency tracking integrated
- [ ] Batch grouping logic defined
- [ ] Parallelization opportunities highlighted
- [ ] DAG generation support included
- [ ] Resource allocation section added

## Template Features
- STAD stage mapping per ticket
- Time estimation methodology
- Dependency DAG visualization
- Batch processing groups
- Resource allocation matrix
- Risk assessment

## Spec Location
/Project_Management/Specs/STAD-009_spec.md"

# STAD-010
add_ticket "[DETAILED] STAD-010: Document Complete STAD Protocol" "## Description
Create comprehensive documentation of the complete STAD Protocol 5-stage process with agent integration.

## Story Points: 3
## Epic: Documentation
## Dependencies: STAD-001 through STAD-009

## Acceptance Criteria
- [ ] Complete STAD Protocol user guide created
- [ ] Agent collaboration workflow documented
- [ ] Micro-to-macro reflection flow explained
- [ ] Step-by-step examples provided
- [ ] Troubleshooting section included
- [ ] Best practices documented
- [ ] Quick reference guide created
- [ ] Visual diagrams included

## Documentation Sections
1. Introduction to STAD Protocol
2. The 5-Stage Sprint Lifecycle
3. Agent System Integration
4. Micro-to-Macro Reflections
5. Sprint Planning & Execution
6. Examples & Scenarios
7. Troubleshooting
8. Best Practices
9. Quick Reference
10. FAQ

## Spec Location
/Project_Management/Specs/STAD-010_spec.md"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Operation Complete                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Note: Tickets marked with [DETAILED] prefix are the complete versions."
echo "The original tickets without details can be archived or deleted from the board."