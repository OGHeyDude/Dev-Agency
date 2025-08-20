#!/bin/bash

# STAD Protocol Stage Gate Validation Script
# Validates criteria before allowing stage transitions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
        *)
            echo "$message"
            ;;
    esac
}

# Function to validate Stage 0 → 1 transition
validate_stage_0_to_1() {
    echo "Validating Stage 0 → Stage 1 (Strategic Planning → Sprint Preparation)"
    echo "================================================================"
    
    local errors=0
    
    # Check for epic definitions
    if [ -f "/home/hd/Desktop/LAB/Dev-Agency/Project_Management/PROJECT_PLAN.md" ]; then
        if grep -q "## Epic:" /home/hd/Desktop/LAB/Dev-Agency/Project_Management/PROJECT_PLAN.md; then
            print_status "success" "Epic definitions found"
        else
            print_status "error" "No epic definitions found"
            ((errors++))
        fi
    else
        print_status "error" "PROJECT_PLAN.md not found"
        ((errors++))
    fi
    
    # Check for roadmap
    if grep -q "## Roadmap\|## Sprint Plan" /home/hd/Desktop/LAB/Dev-Agency/Project_Management/PROJECT_PLAN.md 2>/dev/null; then
        print_status "success" "Roadmap/Sprint plan exists"
    else
        print_status "warning" "No roadmap found (optional)"
    fi
    
    return $errors
}

# Function to validate Stage 1 → 2 transition
validate_stage_1_to_2() {
    echo "Validating Stage 1 → Stage 2 (Sprint Preparation → Sprint Execution)"
    echo "===================================================================="
    
    local errors=0
    
    # Check for specs
    local spec_count=$(find /home/hd/Desktop/LAB/Dev-Agency/Project_Management/Specs -name "*.md" 2>/dev/null | wc -l)
    if [ "$spec_count" -gt 0 ]; then
        print_status "success" "Found $spec_count specification(s)"
    else
        print_status "error" "No specifications found"
        ((errors++))
    fi
    
    # Check for tickets over 5 points
    if grep -E "Story Points: [6-9]|Story Points: [0-9]{2}" /home/hd/Desktop/LAB/Dev-Agency/Project_Management/Specs/*.md 2>/dev/null; then
        print_status "error" "Found tickets exceeding 5 story points"
        ((errors++))
    else
        print_status "success" "All tickets ≤ 5 story points"
    fi
    
    # Check for decision documentation
    if ls /home/hd/Desktop/LAB/Dev-Agency/Project_Management/Decision_Requests/*.md 2>/dev/null | grep -q .; then
        print_status "success" "Decision documentation found"
    else
        print_status "warning" "No decision requests (may be embedded in specs)"
    fi
    
    return $errors
}

# Function to validate Stage 2 → 3 transition
validate_stage_2_to_3() {
    echo "Validating Stage 2 → Stage 3 (Sprint Execution → Sprint Validation)"
    echo "===================================================================="
    
    local errors=0
    
    # Check for implementation completion
    if grep -q "IN_PROGRESS" /home/hd/Desktop/LAB/Dev-Agency/Project_Management/PROJECT_PLAN.md 2>/dev/null; then
        print_status "error" "Found tickets still IN_PROGRESS"
        ((errors++))
    else
        print_status "success" "No tickets in progress"
    fi
    
    # Check for test coverage (simplified check)
    if [ -d "/home/hd/Desktop/LAB/Dev-Agency/src" ]; then
        local test_files=$(find /home/hd/Desktop/LAB/Dev-Agency/src -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
        if [ "$test_files" -gt 0 ]; then
            print_status "success" "Found $test_files test file(s)"
        else
            print_status "warning" "No test files found"
        fi
    fi
    
    # Check for work reports
    if ls /home/hd/Desktop/LAB/Dev-Agency/Project_Management/Work_Reports/*/*.md 2>/dev/null | grep -q .; then
        print_status "success" "Work reports filed"
    else
        print_status "warning" "No work reports found"
    fi
    
    return $errors
}

# Function to validate Stage 3 → 4 transition
validate_stage_3_to_4() {
    echo "Validating Stage 3 → Stage 4 (Sprint Validation → Release & Retrospective)"
    echo "=========================================================================="
    
    local errors=0
    
    # Check for validation reports
    if ls /home/hd/Desktop/LAB/Dev-Agency/Project_Management/Validation_Reports/*.md 2>/dev/null | grep -q .; then
        print_status "success" "Validation reports found"
    else
        print_status "error" "No validation reports found"
        ((errors++))
    fi
    
    # Check for human approval (simplified - looks for approval marker)
    if [ -f "/home/hd/Desktop/LAB/Dev-Agency/Project_Management/.approval" ]; then
        print_status "success" "Human approval recorded"
    else
        print_status "warning" "Human approval not recorded (use /approve command)"
    fi
    
    # Check for critical bugs
    if grep -i "critical.*bug\|blocker" /home/hd/Desktop/LAB/Dev-Agency/Project_Management/Bug_Reports/*.md 2>/dev/null; then
        print_status "error" "Critical bugs found"
        ((errors++))
    else
        print_status "success" "No critical bugs"
    fi
    
    return $errors
}

# Main script
main() {
    local from_stage=${1:-""}
    local to_stage=${2:-""}
    
    if [ -z "$from_stage" ] || [ -z "$to_stage" ]; then
        echo "Usage: $0 <from_stage> <to_stage>"
        echo "Example: $0 1 2"
        echo ""
        echo "Valid transitions:"
        echo "  0 → 1: Strategic Planning → Sprint Preparation"
        echo "  1 → 2: Sprint Preparation → Sprint Execution"
        echo "  2 → 3: Sprint Execution → Sprint Validation"
        echo "  3 → 4: Sprint Validation → Release & Retrospective"
        exit 1
    fi
    
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║              STAD Protocol Stage Gate Validation          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    local validation_result=0
    
    case "${from_stage}_${to_stage}" in
        "0_1")
            validate_stage_0_to_1
            validation_result=$?
            ;;
        "1_2")
            validate_stage_1_to_2
            validation_result=$?
            ;;
        "2_3")
            validate_stage_2_to_3
            validation_result=$?
            ;;
        "3_4")
            validate_stage_3_to_4
            validation_result=$?
            ;;
        *)
            echo "Invalid stage transition: $from_stage → $to_stage"
            exit 1
            ;;
    esac
    
    echo ""
    echo "════════════════════════════════════════════════════════════"
    
    if [ $validation_result -eq 0 ]; then
        print_status "success" "✅ Gate validation PASSED - Ready for Stage $to_stage"
        exit 0
    else
        print_status "error" "❌ Gate validation FAILED - $validation_result issue(s) found"
        echo ""
        echo "Please resolve the issues above before transitioning to Stage $to_stage"
        exit 1
    fi
}

# Run main function
main "$@"