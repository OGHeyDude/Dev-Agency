#!/bin/bash
# Set file permissions based on feature boundaries
# This helps prevent accidental modifications during development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get ticket ID
TICKET_ID=${1:-$(git branch --show-current | grep -oE 'TICKET-[0-9]+|AGENT-[0-9]+|SECURITY-[0-9]+|BUILD-[0-9]+|PERF-[0-9]+')}

if [ -z "$TICKET_ID" ]; then
    echo -e "${RED}ERROR: Could not determine ticket ID${NC}"
    echo "Usage: $0 [TICKET-ID]"
    exit 1
fi

# Find spec file
SPEC_FILE="Project_Management/Specs/${TICKET_ID}_spec.md"

if [ ! -f "$SPEC_FILE" ]; then
    echo -e "${RED}ERROR: Spec file not found: $SPEC_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}Setting feature boundaries for ticket: $TICKET_ID${NC}"

# Function to safely change permissions
safe_chmod() {
    local perms=$1
    local file=$2
    if [ -f "$file" ] || [ -d "$file" ]; then
        chmod $perms "$file" 2>/dev/null && echo -e "${GREEN}✓${NC} Set $perms: $file" || echo -e "${YELLOW}⚠${NC} Could not set permissions: $file"
    fi
}

# Extract and process shared files (make read-only)
echo -e "\n${YELLOW}Making shared dependencies read-only...${NC}"
SHARED_FILES=$(grep -A 50 "### Shared Dependencies" "$SPEC_FILE" 2>/dev/null | \
    grep -E "^- |^\* " | \
    sed 's/^- //;s/^* //;s/ (.*)$//;s/\*\*/\*/g' | \
    grep -v "^#" || echo "")

if [ -n "$SHARED_FILES" ]; then
    while IFS= read -r pattern; do
        if [[ -n "$pattern" ]]; then
            # Handle wildcards
            if [[ "$pattern" == *"*"* ]]; then
                for file in $pattern; do
                    safe_chmod 444 "$file"
                done
            else
                safe_chmod 444 "$pattern"
            fi
        fi
    done <<< "$SHARED_FILES"
else
    echo "No shared dependencies found"
fi

# Extract and process owned files (make writable)
echo -e "\n${GREEN}Making owned files writable...${NC}"
OWNED_FILES=$(grep -A 50 "### Owned Resources\|### Files Owned" "$SPEC_FILE" 2>/dev/null | \
    grep -E "^- |^\* " | \
    sed 's/^- //;s/^* //;s/\*\*/\*/g' | \
    grep -v "^#" || echo "")

if [ -n "$OWNED_FILES" ]; then
    while IFS= read -r pattern; do
        if [[ -n "$pattern" ]]; then
            # Handle wildcards
            if [[ "$pattern" == *"*"* ]]; then
                for file in $pattern; do
                    safe_chmod 644 "$file"
                done
            else
                safe_chmod 644 "$pattern"
            fi
        fi
    done <<< "$OWNED_FILES"
else
    echo "No owned files found"
fi

# Make design system files read-only for everyone
echo -e "\n${BLUE}Protecting design system files...${NC}"
DESIGN_SYSTEM_PATHS=(
    "src/design-system"
    "src/design-tokens"
    "src/theme"
    "styles/tokens.css"
    "styles/theme.css"
)

for path in "${DESIGN_SYSTEM_PATHS[@]}"; do
    if [ -e "$path" ]; then
        if [ -d "$path" ]; then
            find "$path" -type f -exec chmod 444 {} \; 2>/dev/null && \
                echo -e "${GREEN}✓${NC} Protected: $path/"
        else
            safe_chmod 444 "$path"
        fi
    fi
done

echo -e "\n${GREEN}Feature boundaries set successfully!${NC}"
echo -e "\nPermissions applied:"
echo "  • Owned files: read-write (644)"
echo "  • Shared files: read-only (444)"
echo "  • Design system: read-only (444)"
echo -e "\n${YELLOW}Note: Run 'git checkout -- .' to reset permissions after work${NC}"