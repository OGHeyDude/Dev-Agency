#!/bin/bash
# STAD Protocol Consistency Validation Script
# Version: 1.0
# Purpose: Validates consistency across all STAD Protocol documents
# Authority: STAD_FILE_STRUCTURE.md is the single source of truth

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/home/hd/Desktop/LAB/Dev-Agency"

echo "========================================="
echo "STAD Protocol Consistency Validation"
echo "Authority: /docs/architecture/STAD_FILE_STRUCTURE.md"
echo "Date: $(date +"%Y-%m-%d %H:%M")"
echo "========================================="
echo ""

# Initialize counters
ERRORS=0
WARNINGS=0
CHECKS=0
FIXED=0

# Function to check for incorrect paths
check_incorrect_paths() {
    local pattern="$1"
    local description="$2"
    local severity="$3"
    CHECKS=$((CHECKS + 1))
    
    echo -e "${BLUE}Checking:${NC} $description"
    
    # Exclude Archive and backup directories
    local count=$(grep -r "$pattern" "$BASE_DIR" \
        --include="*.md" \
        --exclude-dir="Archive" \
        --exclude-dir="backup" \
        --exclude-dir=".git" \
        2>/dev/null | wc -l)
    
    if [ $count -gt 0 ]; then
        if [ "$severity" = "error" ]; then
            echo -e "${RED}✗${NC} Found $count instances of incorrect pattern: $pattern"
            ERRORS=$((ERRORS + 1))
            echo "   Files with issues:"
            grep -r "$pattern" "$BASE_DIR" \
                --include="*.md" \
                --exclude-dir="Archive" \
                --exclude-dir="backup" \
                --exclude-dir=".git" \
                2>/dev/null | cut -d: -f1 | sort -u | head -5
        else
            echo -e "${YELLOW}⚠${NC} Found $count instances of outdated pattern: $pattern"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${GREEN}✓${NC} No instances found"
    fi
    echo ""
}

echo "Phase 1: Checking for Incorrect Path Patterns"
echo "=============================================="
echo ""

# Critical path checks
check_incorrect_paths "/Project_Management/Agent_Handoffs/\[" \
    "Old agent handoff paths (should be under Sprint_Execution)" \
    "error"

check_incorrect_paths "/Project_Management/Retrospectives/\[Agent\]" \
    "Old retrospective paths (should be under Sprint_Execution)" \
    "error"

check_incorrect_paths "/Retrospectives/\[" \
    "Short form retrospective paths" \
    "error"

check_incorrect_paths "/Agent_Handoffs/\[" \
    "Short form handoff paths" \
    "error"

# Check for correct paths to ensure they exist
echo "Phase 2: Verifying Correct Path Usage"
echo "======================================"
echo ""

check_correct_path() {
    local pattern="$1"
    local description="$2"
    CHECKS=$((CHECKS + 1))
    
    echo -e "${BLUE}Verifying:${NC} $description"
    
    local count=$(grep -r "$pattern" "$BASE_DIR" \
        --include="*.md" \
        --exclude-dir="Archive" \
        --exclude-dir="backup" \
        --exclude-dir=".git" \
        2>/dev/null | wc -l)
    
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✓${NC} Found $count instances of correct pattern"
    else
        echo -e "${YELLOW}⚠${NC} No instances found - may need to add documentation"
        WARNINGS=$((WARNINGS + 1))
    fi
    echo ""
}

check_correct_path "/Project_Management/Sprint_Execution/Sprint_\[N\]/agent_handoffs/" \
    "Correct agent handoff paths"

check_correct_path "/Project_Management/Sprint_Execution/Sprint_\[N\]/work_reports/" \
    "Correct work report paths"

check_correct_path "/Project_Management/Sprint_Retrospectives/Sprint_\[N\]" \
    "Correct sprint retrospective paths"

# Check for logical conflicts
echo "Phase 3: Checking for Logical Conflicts"
echo "========================================"
echo ""

# Check Review Dashboard assignment
echo -e "${BLUE}Checking:${NC} Review Dashboard creation assignment"
CHECKS=$((CHECKS + 1))

# Count occurrences of different assignments
auto_gen=$(grep -r "Auto-generated.*Dashboard" "$BASE_DIR" \
    --include="*.md" \
    --exclude-dir="Archive" \
    2>/dev/null | wc -l)

backend_qa_gen=$(grep -r "Backend QA.*Dashboard\|CREATE.*Dashboard.*Backend" "$BASE_DIR" \
    --include="*.md" \
    --exclude-dir="Archive" \
    2>/dev/null | wc -l)

if [ $auto_gen -gt 0 ] && [ $backend_qa_gen -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC} Mixed assignments found (Auto: $auto_gen, Backend QA: $backend_qa_gen)"
    echo "   Should be consistently assigned to Backend QA Agent"
    WARNINGS=$((WARNINGS + 1))
elif [ $backend_qa_gen -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Consistently assigned to Backend QA Agent"
else
    echo -e "${YELLOW}⚠${NC} No clear assignment found"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check for inconsistent file naming patterns
echo "Phase 4: Checking File Naming Consistency"
echo "========================================="
echo ""

echo -e "${BLUE}Checking:${NC} Handoff file naming patterns"
CHECKS=$((CHECKS + 1))

# Look for different naming patterns
pattern1=$(grep -r "\[FROM\]_to_\[TO\]_\[TICKET\]" "$BASE_DIR" \
    --include="*.md" \
    --exclude-dir="Archive" \
    2>/dev/null | wc -l)

pattern2=$(grep -r "\[from\]-to-\[to\]" "$BASE_DIR" \
    --include="*.md" \
    --exclude-dir="Archive" \
    2>/dev/null | wc -l)

if [ $pattern1 -gt 0 ] && [ $pattern2 -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC} Mixed naming patterns found (underscore: $pattern1, dash: $pattern2)"
    echo "   Should consistently use: [FROM]_to_[TO]_[TICKET].md"
    WARNINGS=$((WARNINGS + 1))
elif [ $pattern1 -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Consistent underscore pattern"
else
    echo -e "${YELLOW}⚠${NC} No clear pattern established"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check STAD_FILE_STRUCTURE.md authority
echo "Phase 5: Verifying Authority Hierarchy"
echo "======================================"
echo ""

echo -e "${BLUE}Checking:${NC} STAD_FILE_STRUCTURE.md references"
CHECKS=$((CHECKS + 1))

authority_refs=$(grep -r "STAD_FILE_STRUCTURE.*authority\|authoritative.*STAD_FILE_STRUCTURE" "$BASE_DIR" \
    --include="*.md" \
    --exclude-dir="Archive" \
    2>/dev/null | wc -l)

if [ $authority_refs -gt 3 ]; then
    echo -e "${GREEN}✓${NC} STAD_FILE_STRUCTURE.md properly established as authority ($authority_refs references)"
else
    echo -e "${YELLOW}⚠${NC} May need more references to STAD_FILE_STRUCTURE.md as authority"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "========================================="
echo "Validation Summary"
echo "========================================="
echo "Total Checks: $CHECKS"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ PERFECT!${NC} STAD Protocol is fully consistent."
        echo "All documents align with STAD_FILE_STRUCTURE.md"
    else
        echo -e "${GREEN}✅ PASSED${NC} with $WARNINGS warnings."
        echo "Core structure is consistent, minor improvements suggested."
    fi
    exit 0
else
    echo -e "${RED}❌ FAILED${NC} - $ERRORS critical consistency issues found."
    echo ""
    echo "Critical Issues to Fix:"
    echo "1. Update all incorrect path references"
    echo "2. Align with STAD_FILE_STRUCTURE.md structure"
    echo "3. Ensure consistent naming patterns"
    echo ""
    echo "Run this script again after fixes to verify consistency."
    exit 1
fi