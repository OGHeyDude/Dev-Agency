#!/bin/bash

# detect-project-state.sh - Dynamic Project State Detection
# Detects current sprint, epic, phase, and tickets from PROJECT_PLAN.md
# This eliminates the need for manual CLAUDE.env updates

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Find PROJECT_PLAN.md
find_project_plan() {
    if [ -f "./Project_Management/PROJECT_PLAN.md" ]; then
        echo "./Project_Management/PROJECT_PLAN.md"
    elif [ -f "./PROJECT_PLAN.md" ]; then
        echo "./PROJECT_PLAN.md"
    else
        echo ""
    fi
}

# Detect current sprint (marked as IN_PROGRESS or 🚧)
detect_current_sprint() {
    local project_plan="$1"
    if [ -z "$project_plan" ]; then
        echo "Unknown"
        return
    fi
    
    # Look for sprint with IN_PROGRESS status
    local sprint=$(grep -B5 "Status.*IN_PROGRESS\|Status.*🚧" "$project_plan" 2>/dev/null | grep -E "^##.*Sprint|^##.*Phase" | head -1 | sed 's/##*//' | sed 's/:.*//' | xargs)
    
    if [ -z "$sprint" ]; then
        # Fallback: Look for sprint section with 🚧 emoji
        sprint=$(grep -E "^##.*Sprint.*🚧|^##.*Phase.*🚧" "$project_plan" 2>/dev/null | head -1 | sed 's/##*//' | sed 's/🚧.*//' | xargs)
    fi
    
    if [ -z "$sprint" ]; then
        # Fallback: Check latest Sprint_Execution directory
        if [ -d "./Project_Management/Sprint_Execution" ]; then
            sprint=$(ls -dt ./Project_Management/Sprint_Execution/*/ 2>/dev/null | head -1 | xargs basename 2>/dev/null)
        fi
    fi
    
    echo "${sprint:-Sprint_Unknown}"
}

# Detect current epic (marked as In Progress)
detect_current_epic() {
    local project_plan="$1"
    if [ -z "$project_plan" ]; then
        echo "Unknown"
        return
    fi
    
    # Look for epic with "In Progress" status in epic tracking table
    local epic=$(grep "| In Progress |" "$project_plan" 2>/dev/null | grep "EPIC-" | awk -F'|' '{print $2}' | xargs | head -1)
    
    if [ -z "$epic" ]; then
        # Fallback: Find epic associated with current sprint tickets
        local current_ticket=$(detect_current_ticket "$project_plan")
        if [ "$current_ticket" != "None" ]; then
            epic=$(grep "$current_ticket" "$project_plan" 2>/dev/null | grep -o "EPIC-[0-9]*" | head -1)
        fi
    fi
    
    echo "${epic:-EPIC-Unknown}"
}

# Detect current phase (from Phase sections)
detect_current_phase() {
    local project_plan="$1"
    if [ -z "$project_plan" ]; then
        echo "Unknown"
        return
    fi
    
    # Look for phase with 🚧 emoji (in progress)
    local phase=$(grep -E "^###.*Phase.*🚧" "$project_plan" 2>/dev/null | head -1 | sed 's/###*//' | sed 's/🚧.*//' | xargs)
    
    if [ -z "$phase" ]; then
        # Fallback: Look for phase mentioned in current sprint
        local current_sprint=$(detect_current_sprint "$project_plan")
        phase=$(echo "$current_sprint" | grep -o "Phase[_\s]*[0-9]*" | head -1)
    fi
    
    echo "${phase:-Phase_Unknown}"
}

# Detect current ticket (marked as IN_PROGRESS)
detect_current_ticket() {
    local project_plan="$1"
    if [ -z "$project_plan" ]; then
        echo "None"
        return
    fi
    
    # Look for ticket with IN_PROGRESS status
    local ticket=$(grep "| IN_PROGRESS |" "$project_plan" 2>/dev/null | awk -F'|' '{print $2}' | xargs | head -1)
    
    echo "${ticket:-None}"
}

# Detect sprint velocity (story points completed/total)
detect_sprint_velocity() {
    local project_plan="$1"
    if [ -z "$project_plan" ]; then
        echo "0/0"
        return
    fi
    
    local current_sprint=$(detect_current_sprint "$project_plan")
    if [ "$current_sprint" != "Sprint_Unknown" ]; then
        # Find story points line for current sprint
        local velocity=$(grep -A10 "$current_sprint" "$project_plan" 2>/dev/null | grep "Story Points Delivered" | grep -o "[0-9]*/[0-9]*" | head -1)
        echo "${velocity:-0/0}"
    else
        echo "0/0"
    fi
}

# Export all detected values as environment variables
export_project_state() {
    local project_plan=$(find_project_plan)
    
    if [ -z "$project_plan" ]; then
        echo -e "${YELLOW}⚠️  No PROJECT_PLAN.md found${NC}"
        export ACTIVE_SPRINT="Unknown"
        export CURRENT_EPIC="Unknown"
        export CURRENT_PHASE="Unknown"
        export CURRENT_TICKET="None"
        export SPRINT_VELOCITY="0/0"
        return 1
    fi
    
    export ACTIVE_SPRINT=$(detect_current_sprint "$project_plan")
    export CURRENT_EPIC=$(detect_current_epic "$project_plan")
    export CURRENT_PHASE=$(detect_current_phase "$project_plan")
    export CURRENT_TICKET=$(detect_current_ticket "$project_plan")
    export SPRINT_VELOCITY=$(detect_sprint_velocity "$project_plan")
    
    # Create sprint execution directories if they don't exist
    if [ "$ACTIVE_SPRINT" != "Unknown" ] && [ "$ACTIVE_SPRINT" != "Sprint_Unknown" ]; then
        mkdir -p "./Project_Management/Sprint_Execution/${ACTIVE_SPRINT}/agent_handoffs"
        mkdir -p "./Project_Management/Sprint_Execution/${ACTIVE_SPRINT}/work_reports"
        mkdir -p "./Project_Management/Sprint_Execution/${ACTIVE_SPRINT}/implementation_reports"
    fi
    
    return 0
}

# Main function
main() {
    local mode="${1:-all}"
    local project_plan=$(find_project_plan)
    
    if [ -z "$project_plan" ]; then
        echo "Unknown"
        exit 1
    fi
    
    case "$mode" in
        --sprint)
            detect_current_sprint "$project_plan"
            ;;
        --epic)
            detect_current_epic "$project_plan"
            ;;
        --phase)
            detect_current_phase "$project_plan"
            ;;
        --ticket)
            detect_current_ticket "$project_plan"
            ;;
        --velocity)
            detect_sprint_velocity "$project_plan"
            ;;
        --export)
            export_project_state
            ;;
        --display|all)
            echo -e "${GREEN}📊 Dynamic Project State Detection${NC}"
            echo -e "${GREEN}====================================${NC}"
            echo -e "${BLUE}Sprint:${NC}   $(detect_current_sprint "$project_plan")"
            echo -e "${BLUE}Epic:${NC}     $(detect_current_epic "$project_plan")"
            echo -e "${BLUE}Phase:${NC}    $(detect_current_phase "$project_plan")"
            echo -e "${BLUE}Ticket:${NC}   $(detect_current_ticket "$project_plan")"
            echo -e "${BLUE}Velocity:${NC} $(detect_sprint_velocity "$project_plan")"
            ;;
        *)
            echo "Usage: $0 [--sprint|--epic|--phase|--ticket|--velocity|--export|--display|all]"
            echo ""
            echo "Options:"
            echo "  --sprint    Display current sprint"
            echo "  --epic      Display current epic"
            echo "  --phase     Display current phase"
            echo "  --ticket    Display current ticket in progress"
            echo "  --velocity  Display sprint velocity (completed/total)"
            echo "  --export    Export all values as environment variables"
            echo "  --display   Display all values (default)"
            echo ""
            exit 1
            ;;
    esac
}

# Run main function
main "$@"