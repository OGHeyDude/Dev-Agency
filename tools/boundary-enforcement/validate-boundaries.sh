#!/bin/bash
# Feature Boundary Enforcement Script
# Validates that changes respect feature ownership boundaries

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get ticket ID from branch name or argument
TICKET_ID=${1:-$(git branch --show-current | grep -oE 'TICKET-[0-9]+|AGENT-[0-9]+|SECURITY-[0-9]+|BUILD-[0-9]+|PERF-[0-9]+')}

if [ -z "$TICKET_ID" ]; then
    echo -e "${RED}ERROR: Could not determine ticket ID from branch name or argument${NC}"
    echo "Usage: $0 [TICKET-ID]"
    exit 1
fi

# Find spec file
SPEC_FILE="Project_Management/Specs/${TICKET_ID}_spec.md"

if [ ! -f "$SPEC_FILE" ]; then
    echo -e "${YELLOW}WARNING: Spec file not found: $SPEC_FILE${NC}"
    echo "Skipping boundary validation (spec required for enforcement)"
    exit 0
fi

echo -e "${GREEN}Validating boundaries for ticket: $TICKET_ID${NC}"

# Extract owned files from spec
OWNED_FILES=$(grep -A 50 "### Owned Resources\|### Files Owned" "$SPEC_FILE" 2>/dev/null | \
    grep -E "^- |^\* " | \
    sed 's/^- //;s/^* //;s/\*\*/\*/g' | \
    grep -v "^#" || echo "")

# Extract shared dependencies from spec
SHARED_FILES=$(grep -A 50 "### Shared Dependencies" "$SPEC_FILE" 2>/dev/null | \
    grep -E "^- |^\* " | \
    sed 's/^- //;s/^* //;s/ (.*)$//;s/\*\*/\*/g' | \
    grep -v "^#" || echo "")

# Get modified files (staged and unstaged)
if git diff --cached --name-only > /dev/null 2>&1; then
    MODIFIED_FILES=$(git diff --cached --name-only)
else
    MODIFIED_FILES=$(git diff --name-only)
fi

VIOLATIONS=0
WARNINGS=0

for file in $MODIFIED_FILES; do
    # Skip spec files and documentation
    if [[ "$file" == *.md ]] || [[ "$file" == Project_Management/* ]]; then
        continue
    fi
    
    # Check if file matches owned patterns
    IS_OWNED=false
    if [ -n "$OWNED_FILES" ]; then
        while IFS= read -r pattern; do
            if [[ -n "$pattern" ]] && [[ "$file" == $pattern ]]; then
                IS_OWNED=true
                break
            fi
        done <<< "$OWNED_FILES"
    fi
    
    # Check if file matches shared patterns
    IS_SHARED=false
    SHARED_CONSTRAINT=""
    if [ -n "$SHARED_FILES" ]; then
        while IFS= read -r pattern; do
            if [[ -n "$pattern" ]] && [[ "$file" == $pattern ]]; then
                IS_SHARED=true
                # Check for constraint (READ-ONLY, EXTEND-ONLY)
                SHARED_CONSTRAINT=$(grep "$pattern" "$SPEC_FILE" | grep -oE "READ-ONLY|EXTEND-ONLY" || echo "")
                break
            fi
        done <<< "$SHARED_FILES"
    fi
    
    # Validate based on ownership
    if [ "$IS_OWNED" = true ]; then
        echo -e "${GREEN}✓${NC} $file (owned by $TICKET_ID)"
    elif [ "$IS_SHARED" = true ]; then
        if [ -n "$SHARED_CONSTRAINT" ]; then
            # Check if modifications violate constraint
            if [ "$SHARED_CONSTRAINT" = "READ-ONLY" ]; then
                echo -e "${RED}✗ ERROR: Modifying READ-ONLY file: $file${NC}"
                echo "  Suggestion: Create a feature-specific extension instead"
                VIOLATIONS=$((VIOLATIONS + 1))
            elif [ "$SHARED_CONSTRAINT" = "EXTEND-ONLY" ]; then
                # Check if there are deletions (not just additions)
                if git diff --cached "$file" 2>/dev/null | grep "^-" | grep -v "^---" > /dev/null; then
                    echo -e "${RED}✗ ERROR: Modifying EXTEND-ONLY file: $file${NC}"
                    echo "  Detected deletions/modifications. Only additions allowed."
                    VIOLATIONS=$((VIOLATIONS + 1))
                else
                    echo -e "${YELLOW}⚠${NC} $file (shared - EXTEND-ONLY, verify additions only)"
                    WARNINGS=$((WARNINGS + 1))
                fi
            fi
        else
            echo -e "${YELLOW}⚠${NC} $file (shared dependency - use with caution)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        # Check if it's a new file
        if ! git ls-files --error-unmatch "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $file (new file)"
        else
            echo -e "${RED}✗ ERROR: File not in ownership scope: $file${NC}"
            echo "  This file is not listed in owned or shared resources for $TICKET_ID"
            echo "  Suggestion: Add to spec or use feature-specific alternatives"
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
    fi
done

# Check for hardcoded values in CSS files
echo -e "\n${GREEN}Checking for design token compliance...${NC}"
CSS_FILES=$(echo "$MODIFIED_FILES" | grep -E "\.(css|scss|less)$" || true)

for file in $CSS_FILES; do
    if [ -f "$file" ]; then
        # Check for hardcoded colors
        if grep -E "color: #|background: #|border-color: #" "$file" > /dev/null; then
            echo -e "${RED}✗ ERROR: Hardcoded colors in $file${NC}"
            echo "  Use design tokens: var(--color-primary)"
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
        
        # Check for hardcoded spacing
        if grep -E "padding: [0-9]+px|margin: [0-9]+px" "$file" > /dev/null; then
            echo -e "${YELLOW}⚠ WARNING: Hardcoded spacing in $file${NC}"
            echo "  Consider using: calc(var(--spacing-unit) * N)"
            WARNINGS=$((WARNINGS + 1))
        fi
        
        # Verify CSS modules for feature files
        if [[ "$file" == src/features/* ]] && [[ "$file" != *.module.css ]]; then
            echo -e "${RED}✗ ERROR: Feature CSS must use modules: $file${NC}"
            echo "  Rename to: ${file%.css}.module.css"
            VIOLATIONS=$((VIOLATIONS + 1))
        fi
    fi
done

# Summary
echo -e "\n================================"
if [ $VIOLATIONS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All boundary checks passed!${NC}"
    exit 0
elif [ $VIOLATIONS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${RED}✗ Validation failed with $VIOLATIONS violation(s) and $WARNINGS warning(s)${NC}"
    echo -e "\nTo fix violations:"
    echo "1. Only modify files listed in 'Owned Resources' section of your spec"
    echo "2. For shared files marked READ-ONLY, create feature-specific copies"
    echo "3. For EXTEND-ONLY files, only add new code, don't modify existing"
    echo "4. Use design tokens instead of hardcoded values"
    echo "5. Use CSS modules for feature-specific styles"
    exit 1
fi