#!/bin/bash

# STAD Protocol Handoff Completeness Checker
# Verifies that agent handoffs are properly documented

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
HANDOFF_DIR="/home/hd/Desktop/LAB/Dev-Agency/Project_Management/Agent_Handoffs"
WORK_REPORTS_DIR="/home/hd/Desktop/LAB/Dev-Agency/Project_Management/Work_Reports"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "success")
            echo -e "${GREEN}✓${NC} $message"
            ;;
        "error")
            echo -e "${RED}✗${NC} $message"
            ;;
        "warning")
            echo -e "${YELLOW}⚠${NC} $message"
            ;;
        "info")
            echo -e "${BLUE}ℹ${NC} $message"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

# Function to check handoffs for a sprint
check_sprint_handoffs() {
    local sprint_num=$1
    local sprint_dir="$HANDOFF_DIR/Sprint_$sprint_num"
    
    echo ""
    echo "Checking Sprint $sprint_num Handoffs"
    echo "================================"
    
    if [ ! -d "$sprint_dir" ]; then
        print_status "warning" "No handoff directory for Sprint $sprint_num"
        return 1
    fi
    
    local handoff_count=$(find "$sprint_dir" -name "*.md" 2>/dev/null | wc -l)
    
    if [ "$handoff_count" -eq 0 ]; then
        print_status "error" "No handoffs found for Sprint $sprint_num"
        return 1
    else
        print_status "success" "Found $handoff_count handoff(s)"
        
        # List handoffs
        echo "  Handoffs:"
        for handoff in "$sprint_dir"/*.md; do
            if [ -f "$handoff" ]; then
                local filename=$(basename "$handoff")
                echo "    - $filename"
                
                # Check for required sections
                if grep -q "## Context Transfer" "$handoff" 2>/dev/null; then
                    echo -e "      ${GREEN}✓${NC} Context Transfer section"
                else
                    echo -e "      ${RED}✗${NC} Missing Context Transfer section"
                fi
                
                if grep -q "## Work Completed" "$handoff" 2>/dev/null; then
                    echo -e "      ${GREEN}✓${NC} Work Completed section"
                else
                    echo -e "      ${RED}✗${NC} Missing Work Completed section"
                fi
                
                if grep -q "## Next Steps" "$handoff" 2>/dev/null; then
                    echo -e "      ${GREEN}✓${NC} Next Steps section"
                else
                    echo -e "      ${RED}✗${NC} Missing Next Steps section"
                fi
            fi
        done
    fi
    
    return 0
}

# Function to check work reports
check_work_reports() {
    local sprint_num=$1
    local reports_dir="$WORK_REPORTS_DIR/Sprint_$sprint_num"
    
    echo ""
    echo "Checking Sprint $sprint_num Work Reports"
    echo "====================================="
    
    if [ ! -d "$reports_dir" ]; then
        print_status "warning" "No work reports directory for Sprint $sprint_num"
        return 1
    fi
    
    local report_count=$(find "$reports_dir" -name "*.md" 2>/dev/null | wc -l)
    
    if [ "$report_count" -eq 0 ]; then
        print_status "error" "No work reports found for Sprint $sprint_num"
        return 1
    else
        print_status "success" "Found $report_count work report(s)"
        
        # Group reports by agent
        echo "  Reports by agent:"
        for agent in architect coder tester documenter debug backend-qa security performance; do
            local agent_reports=$(find "$reports_dir" -name "${agent}_*.md" 2>/dev/null | wc -l)
            if [ "$agent_reports" -gt 0 ]; then
                echo "    - $agent: $agent_reports report(s)"
            fi
        done
    fi
    
    return 0
}

# Function to check critical handoffs
check_critical_handoffs() {
    echo ""
    echo "Checking Critical Handoff Patterns"
    echo "=================================="
    
    local issues=0
    
    # Check for Architect → Coder handoffs (Stage 1 → 2)
    local arch_to_coder=$(find "$HANDOFF_DIR" -name "*architect-to-coder*.md" 2>/dev/null | wc -l)
    if [ "$arch_to_coder" -gt 0 ]; then
        print_status "success" "Architect → Coder handoffs: $arch_to_coder"
    else
        print_status "warning" "No Architect → Coder handoffs found"
        ((issues++))
    fi
    
    # Check for Coder → Tester handoffs (within Stage 2)
    local coder_to_tester=$(find "$HANDOFF_DIR" -name "*coder-to-tester*.md" 2>/dev/null | wc -l)
    if [ "$coder_to_tester" -gt 0 ]; then
        print_status "success" "Coder → Tester handoffs: $coder_to_tester"
    else
        print_status "warning" "No Coder → Tester handoffs found"
        ((issues++))
    fi
    
    # Check for Tester → QA handoffs (Stage 2 → 3)
    local tester_to_qa=$(find "$HANDOFF_DIR" -name "*tester-to-qa*.md" 2>/dev/null | wc -l)
    if [ "$tester_to_qa" -gt 0 ]; then
        print_status "success" "Tester → Backend QA handoffs: $tester_to_qa"
    else
        print_status "warning" "No Tester → Backend QA handoffs found"
    fi
    
    return $issues
}

# Main script
main() {
    local sprint_num=${1:-"current"}
    
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║           STAD Protocol Handoff Completeness Check        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    
    # If sprint number not provided, try to detect current sprint
    if [ "$sprint_num" = "current" ]; then
        # Try to find the latest sprint directory
        if [ -d "$HANDOFF_DIR" ]; then
            sprint_num=$(ls -d "$HANDOFF_DIR"/Sprint_* 2>/dev/null | sed 's/.*Sprint_//' | sort -n | tail -1)
            if [ -z "$sprint_num" ]; then
                print_status "info" "No sprint handoffs found. Checking overall structure..."
                sprint_num="N/A"
            else
                print_status "info" "Detected current sprint: Sprint $sprint_num"
            fi
        fi
    fi
    
    local total_issues=0
    
    # Check handoffs
    if [ "$sprint_num" != "N/A" ]; then
        check_sprint_handoffs "$sprint_num"
        ((total_issues+=$?))
        
        check_work_reports "$sprint_num"
        ((total_issues+=$?))
    fi
    
    # Check critical handoff patterns
    check_critical_handoffs
    ((total_issues+=$?))
    
    echo ""
    echo "════════════════════════════════════════════════════════════"
    
    if [ $total_issues -eq 0 ]; then
        print_status "success" "✅ Handoff check PASSED - All handoffs properly documented"
        exit 0
    else
        print_status "warning" "⚠️  Handoff check completed with $total_issues warning(s)"
        echo ""
        echo "Consider documenting missing handoffs for better traceability"
        exit 0
    fi
}

# Run main function
main "$@"