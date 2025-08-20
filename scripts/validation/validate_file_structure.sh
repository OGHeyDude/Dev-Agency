#!/bin/bash
# STAD File Structure Validation Script
# Version: 1.0
# Purpose: Validates that all files are in correct locations per STAD_FILE_STRUCTURE.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/home/hd/Desktop/LAB/Dev-Agency"

echo "========================================="
echo "STAD File Structure Validation"
echo "Authority: /docs/architecture/STAD_FILE_STRUCTURE.md"
echo "========================================="
echo ""

# Initialize counters
ERRORS=0
WARNINGS=0
CHECKS=0

# Function to check directory exists
check_dir() {
    local dir="$1"
    local required="$2"
    CHECKS=$((CHECKS + 1))
    
    if [ -d "$BASE_DIR/$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        if [ "$required" = "required" ]; then
            echo -e "${RED}✗${NC} MISSING: $dir (REQUIRED)"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠${NC} Missing: $dir (optional)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
}

# Function to check for misplaced files
check_no_files() {
    local dir="$1"
    local pattern="$2"
    local message="$3"
    CHECKS=$((CHECKS + 1))
    
    if [ -d "$BASE_DIR/$dir" ]; then
        local count=$(find "$BASE_DIR/$dir" -maxdepth 1 -name "$pattern" 2>/dev/null | wc -l)
        if [ $count -gt 0 ]; then
            echo -e "${RED}✗${NC} Found $count files in wrong location: $dir"
            echo "   $message"
            ERRORS=$((ERRORS + 1))
        fi
    fi
}

echo "Checking Required Core Structure..."
echo "-----------------------------------"

# Core directories
check_dir "Agents" "required"
check_dir "docs" "required"
check_dir "docs/architecture" "required"
check_dir "docs/guides" "required"
check_dir "docs/reference/templates" "required"
check_dir "docs/getting-started" "required"
check_dir "Project_Management" "required"
check_dir "Project_Management/Specs" "required"
check_dir "Project_Management/Sprint_Execution" "required"
check_dir "Project_Management/Sprint_Validation" "required"
check_dir "Project_Management/Sprint_Retrospectives" "required"
check_dir "recipes" "required"
check_dir "prompts" "required"
check_dir "scripts" "required"
check_dir "Archive" "required"

echo ""
echo "Checking for Misplaced Files..."
echo "-------------------------------"

# Check for old Development_Standards references
if [ -d "$BASE_DIR/Development_Standards" ]; then
    echo -e "${RED}✗${NC} Old Development_Standards directory still exists!"
    echo "   Should be migrated to /docs/"
    ERRORS=$((ERRORS + 1))
fi

# Check for templates in wrong location
check_no_files "docs/templates" "*.md" "Templates should be in /docs/reference/templates/"

# Check for specs outside proper location
check_no_files "docs" "*_spec.md" "Specs should be in /Project_Management/Specs/"

# Check for CLAUDE.md duplicates
echo ""
echo "Checking CLAUDE.md Files..."
echo "--------------------------"
CHECKS=$((CHECKS + 1))

claude_count=$(find "$BASE_DIR" -name "CLAUDE.md" -not -path "*/Archive/*" 2>/dev/null | wc -l)
if [ $claude_count -gt 3 ]; then
    echo -e "${YELLOW}⚠${NC} Found $claude_count CLAUDE.md files (expected max 3)"
    echo "   Expected: main + 2 templates only"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓${NC} CLAUDE.md count acceptable ($claude_count files)"
fi

# Check critical files exist
echo ""
echo "Checking Critical Files..."
echo "-------------------------"

critical_files=(
    "CLAUDE.md"
    "Project_Management/PROJECT_PLAN.md"
    "docs/architecture/STAD_FILE_STRUCTURE.md"
    "docs/architecture/STAD_PROTOCOL_NORTH_STAR.md"
    "docs/architecture/STAD_CLAUDE.md"
    "docs/reference/templates/PROJECT_CLAUDE_TEMPLATE.md"
)

for file in "${critical_files[@]}"; do
    CHECKS=$((CHECKS + 1))
    if [ -f "$BASE_DIR/$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} MISSING: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check for proper agent file locations
echo ""
echo "Checking Agent Files..."
echo "----------------------"

for agent_file in "$BASE_DIR"/Agents/*.md; do
    if [ -f "$agent_file" ]; then
        agent_name=$(basename "$agent_file")
        # Check agent file doesn't exist elsewhere
        duplicates=$(find "$BASE_DIR" -name "$agent_name" -not -path "*/Agents/*" -not -path "*/Archive/*" 2>/dev/null | wc -l)
        if [ $duplicates -gt 0 ]; then
            echo -e "${RED}✗${NC} Agent $agent_name has duplicates outside /Agents/"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done
echo -e "${GREEN}✓${NC} Agents properly centralized"

# Summary
echo ""
echo "========================================="
echo "Validation Summary"
echo "========================================="
echo "Total Checks: $CHECKS"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ PERFECT!${NC} File structure fully compliant with STAD Protocol."
    else
        echo -e "${GREEN}✅ PASSED${NC} with $WARNINGS warnings. Structure is acceptable."
    fi
    exit 0
else
    echo -e "${RED}❌ FAILED${NC} - $ERRORS critical issues found."
    echo ""
    echo "Next Steps:"
    echo "1. Review /docs/architecture/STAD_FILE_STRUCTURE.md"
    echo "2. Move files to correct locations"
    echo "3. Remove deprecated directories"
    echo "4. Run validation again"
    exit 1
fi