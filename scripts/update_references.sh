#!/bin/bash
# Script to update all references from old Development_Standards paths to new docs structure
# Created: 08-17-2025

echo "Starting reference update for STAD Protocol reorganization..."

# Define old and new paths
OLD_TEMPLATES="/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates"
NEW_TEMPLATES="/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates"

OLD_GUIDES="/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides"
NEW_GUIDES="/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards"

OLD_POLICIES="/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Policies"
NEW_POLICIES="/home/hd/Desktop/LAB/Dev-Agency/docs/standards/policies"

# Shorter relative paths
OLD_TEMPLATES_REL="Development_Standards/Templates"
NEW_TEMPLATES_REL="docs/reference/templates"

OLD_GUIDES_REL="Development_Standards/Guides"
NEW_GUIDES_REL="docs/guides/standards"

OLD_POLICIES_REL="Development_Standards/Policies"
NEW_POLICIES_REL="docs/standards/policies"

# Counter for tracking changes
CHANGES=0

# Function to update references in a file
update_file() {
    local file=$1
    local temp_file="${file}.tmp"
    
    # Skip backup and archive files
    if [[ "$file" == *"Backup"* ]] || [[ "$file" == *"Archive"* ]] || [[ "$file" == *"reorganization_backup_record"* ]]; then
        echo "  Skipping: $file (backup/archive)"
        return
    fi
    
    echo "  Processing: $file"
    
    # Create a temporary file with updates
    sed -e "s|$OLD_TEMPLATES|$NEW_TEMPLATES|g" \
        -e "s|$OLD_GUIDES|$NEW_GUIDES|g" \
        -e "s|$OLD_POLICIES|$NEW_POLICIES|g" \
        -e "s|$OLD_TEMPLATES_REL|$NEW_TEMPLATES_REL|g" \
        -e "s|$OLD_GUIDES_REL|$NEW_GUIDES_REL|g" \
        -e "s|$OLD_POLICIES_REL|$NEW_POLICIES_REL|g" \
        "$file" > "$temp_file"
    
    # Check if file was modified
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        echo "    ✅ Updated references"
        ((CHANGES++))
    else
        rm "$temp_file"
        echo "    ⏭️  No changes needed"
    fi
}

# Find all markdown files that might have references
echo "Finding files with references to update..."
files_to_update=$(grep -rl "Development_Standards/\(Templates\|Guides\|Policies\)" /home/hd/Desktop/LAB/Dev-Agency --include="*.md" 2>/dev/null | grep -v "reorganization_backup_record")

# Update each file
for file in $files_to_update; do
    update_file "$file"
done

echo ""
echo "Reference update complete!"
echo "Total files updated: $CHANGES"

# Verify no broken references remain
echo ""
echo "Verifying all references updated..."
remaining=$(grep -r "Development_Standards/\(Templates\|Guides\|Policies\)" /home/hd/Desktop/LAB/Dev-Agency --include="*.md" 2>/dev/null | grep -v "reorganization_backup_record" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo "✅ All references successfully updated!"
else
    echo "⚠️  Found $remaining remaining references that may need manual review"
    echo "Run the following to see them:"
    echo "grep -r 'Development_Standards/\(Templates\|Guides\|Policies\)' /home/hd/Desktop/LAB/Dev-Agency --include='*.md' | grep -v reorganization_backup_record"
fi