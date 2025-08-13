#!/bin/bash
# Setup GitHub Project Boards for STAD Protocol
# Requires GH_TOKEN with project scope

set -e

# Load token from .env if exists
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# Project IDs
PATTERNS_BOARD_ID="PVT_kwHOB9xtSs4BAW--"
AGENTS_BOARD_ID="PVT_kwHOB9xtSs4BAXMC"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           STAD Project Boards Setup Script                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to create a single select field
create_single_select_field() {
    local board_id=$1
    local field_name=$2
    shift 2
    local options=("$@")
    
    # Build options JSON
    local options_json="["
    for option in "${options[@]}"; do
        options_json="${options_json}{\"name\":\"${option}\",\"color\":\"GRAY\"},"
    done
    options_json="${options_json%,}]"  # Remove trailing comma
    
    echo "Creating field: $field_name"
    gh api graphql -f query="
    mutation {
      createProjectV2Field(input: {
        projectId: \"$board_id\"
        dataType: SINGLE_SELECT
        name: \"$field_name\"
        singleSelectOptions: $options_json
      }) {
        projectV2Field {
          ... on ProjectV2SingleSelectField {
            id
            name
          }
        }
      }
    }" 2>/dev/null || echo "  Field may already exist or error occurred"
}

# Function to create a number field
create_number_field() {
    local board_id=$1
    local field_name=$2
    
    echo "Creating field: $field_name"
    gh api graphql -f query="
    mutation {
      createProjectV2Field(input: {
        projectId: \"$board_id\"
        dataType: NUMBER
        name: \"$field_name\"
      }) {
        projectV2Field {
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }" 2>/dev/null || echo "  Field may already exist or error occurred"
}

# Function to create a text field
create_text_field() {
    local board_id=$1
    local field_name=$2
    
    echo "Creating field: $field_name"
    gh api graphql -f query="
    mutation {
      createProjectV2Field(input: {
        projectId: \"$board_id\"
        dataType: TEXT
        name: \"$field_name\"
      }) {
        projectV2Field {
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }" 2>/dev/null || echo "  Field may already exist or error occurred"
}

echo "=== Setting up STAD Agentic Patterns Board ==="
echo ""

# Create fields for Patterns board
create_single_select_field "$PATTERNS_BOARD_ID" "Pattern Type" "Workflow" "Integration" "Optimization" "Debug" "Planning"
create_text_field "$PATTERNS_BOARD_ID" "Agents Involved"
create_number_field "$PATTERNS_BOARD_ID" "Token Savings"
create_single_select_field "$PATTERNS_BOARD_ID" "Complexity" "Simple" "Medium" "Complex"
create_text_field "$PATTERNS_BOARD_ID" "Sprint Tested"
create_number_field "$PATTERNS_BOARD_ID" "Success Rate"
create_text_field "$PATTERNS_BOARD_ID" "Documentation"

echo ""
echo "=== Setting up STAD Agents Board ==="
echo ""

# Create fields for Agents board
create_single_select_field "$AGENTS_BOARD_ID" "Agent Name" "Architect" "Coder" "Tester" "Documenter" "Security" "Performance" "Integration" "Debug"
create_single_select_field "$AGENTS_BOARD_ID" "Enhancement Type" "New Feature" "Bug Fix" "Optimization" "Integration"
create_single_select_field "$AGENTS_BOARD_ID" "Story Points" "1" "2" "3" "5" "8" "13"
create_text_field "$AGENTS_BOARD_ID" "Dependencies"
create_text_field "$AGENTS_BOARD_ID" "Sprint"
create_single_select_field "$AGENTS_BOARD_ID" "Performance Impact" "High" "Medium" "Low" "None"
create_number_field "$AGENTS_BOARD_ID" "Token Usage"

echo ""
echo "=== Adding Initial Pattern Items ==="
echo ""

# Function to add an item to a project
add_project_item() {
    local board_id=$1
    local title=$2
    local body=$3
    
    echo "Adding item: $title"
    
    # First, create a draft issue
    gh api graphql -f query="
    mutation {
      addProjectV2DraftIssue(input: {
        projectId: \"$board_id\"
        title: \"$title\"
        body: \"$body\"
      }) {
        projectItem {
          id
        }
      }
    }" 2>/dev/null || echo "  Could not add item"
}

# Add pattern items
add_project_item "$PATTERNS_BOARD_ID" "Batch Execution Pattern (3-4 tickets)" "Group related tickets for single agent invocation. Reduces context switching and token usage by 60%."
add_project_item "$PATTERNS_BOARD_ID" "Semantic Commit Workflow" "Embed metadata in commit messages. Format: type(scope): desc | Key:value. Provides perfect audit trail."
add_project_item "$PATTERNS_BOARD_ID" "Git Bisect Debug Pattern" "Run git bisect before assigning to Debug Agent. Agent receives exact commit and context."
add_project_item "$PATTERNS_BOARD_ID" "Pre-flight Context Gathering" "Run sprint-preflight.sh before planning. Provides recent changes and decisions to Architect."
add_project_item "$PATTERNS_BOARD_ID" "DAG-Based Planning" "Use Architect Agent to generate dependency graph. Identifies parallelization opportunities."

echo ""
echo "=== Adding Initial Agent Items ==="
echo ""

# Add agent items
add_project_item "$AGENTS_BOARD_ID" "Add Mermaid diagram generation to Architect" "Generate visual DAG using Mermaid syntax in execution plans."
add_project_item "$AGENTS_BOARD_ID" "Token tracking for all agents" "Track input/output tokens for each invocation. Store metrics."
add_project_item "$AGENTS_BOARD_ID" "Enhance Coder Agent context preparation" "Improve context compression for better token efficiency."
add_project_item "$AGENTS_BOARD_ID" "Create Sprint Planning Agent" "New agent specifically for sprint planning automation."

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                   Setup Complete!                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Visit https://github.com/users/OGHeyDude/projects/5 (Patterns)"
echo "2. Visit https://github.com/users/OGHeyDude/projects/6 (Agents)"
echo "3. Configure columns and automation rules via web UI"
echo "4. Update item field values via web UI"
echo ""
echo "Note: Some fields may need to be configured via web UI if creation failed."