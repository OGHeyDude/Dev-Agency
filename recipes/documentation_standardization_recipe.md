---
title: Documentation Standardization & Optimization
description: Automated workflow for auditing, organizing, and standardizing project documentation for Memory Tool optimization
type: recipe
category: documentation
tags: [documentation, standardization, memory-tool, audit, organization, adr]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Recipe: Documentation Standardization & Optimization

## Overview
Comprehensive workflow for auditing, organizing, and standardizing project documentation. This recipe eliminates redundancy, improves developer access to information, and ensures documentation is optimized for Memory Tool integration.

## Use Case
- Auditing existing documentation for duplicates and unused files
- Standardizing documentation format across the project
- Splitting large documents for better navigation
- Enforcing Architecture Decision Records (ADRs)
- Optimizing documentation for Memory Tool indexing

## Agent Sequence

```mermaid
graph LR
    A[Main Claude] --> B[documenter]
    B --> C[clutter-detector]
    C --> D[memory-sync]
    D --> E[documenter]
```

## Step-by-Step Process

### Step 1: Documentation Audit
**Agent:** Main Claude + `/agent:clutter-detector`  
**Actions:**
```bash
# Scan all project directories
find . -type f \( -name "*.md" -o -name "*.txt" \) | head -100

# Check for duplicate content using checksums
find . -type f -name "*.md" -exec md5sum {} \; | sort | uniq -d -w 32

# Find orphaned documentation (not linked from anywhere)
Grep "\.md\)|\.txt\)" --type md
```

**Expected Output:**
- List of duplicate files with identical content
- List of orphaned documentation files
- Documentation coverage gaps

### Step 2: ADR Enforcement Check
**Agent:** Main Claude  
**Actions:**
```bash
# Check for infrastructure changes without ADRs
git log --since="30 days ago" --name-only -- terraform/ ansible/ k8s/

# Verify ADR exists for each infrastructure change
ls docs/adrs/ | grep -E "ADR-[0-9]{4}"
```

**Agent Prompt for `/agent:documenter`:**
```
Review the following infrastructure changes that lack ADRs:
[LIST OF CHANGES]

For each change, create an ADR following this template:
- Title: ADR-XXXX: [Decision Title]
- Status: Accepted/Proposed/Deprecated
- Context: Why this decision was needed
- Decision: What was decided
- Consequences: Impact and trade-offs
```

### Step 3: Documentation Standardization
**Agent:** `/agent:documenter`  
**Context Preparation:**

**Working Files Location:**
```bash
# Create working directory for draft documentation
mkdir -p /Project_Management/TEMP/docs_draft/

# Save draft documents before review
Write /Project_Management/TEMP/docs_draft/[document_name]_draft.md

# Save review versions
Write /Project_Management/TEMP/review/[document_name]_review.md
```
```javascript
// Feature documentation template
const FEATURE_DOC_TEMPLATE = `
---
title: [Feature Name]
description: [One-line description]
type: feature
category: [user-facing|internal|api|infrastructure]
tags: [relevant, keywords]
created: [YYYY-MM-DD]
updated: [YYYY-MM-DD]
---

# [Feature Name]

## Overview
[Brief description of the feature]

## User Stories
- As a [user type], I want to [action] so that [benefit]

## Technical Design
### Architecture
[High-level architecture description]

### Components
- Component 1: [Description]
- Component 2: [Description]

### API Endpoints (if applicable)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /api/... | ...         |

## Configuration
[Any configuration requirements]

## Testing
[Testing approach and requirements]

## Security Considerations
[Security implications and mitigations]

## Performance Considerations
[Performance impacts and optimizations]
`;
```

**Actions:**
```bash
# Apply template to all feature documentation
for file in docs/features/*.md; do
    # Agent applies standardization
done
```

### Step 4: Large Document Splitting
**Agent:** `/agent:documenter` with custom logic  
**Splitting Rules:**
```javascript
const SPLITTING_CONFIG = {
    maxWords: 1000,
    splitStrategy: 'logical', // Split at section boundaries
    namingPattern: 'part-{number}.md',
    preserveStructure: true
};

// Splitting logic
function splitDocument(file) {
    const content = readFile(file);
    const wordCount = content.split(' ').length;
    
    if (wordCount > SPLITTING_CONFIG.maxWords) {
        const sections = identifyLogicalSections(content);
        const parts = [];
        
        let currentPart = [];
        let currentWordCount = 0;
        
        for (const section of sections) {
            const sectionWords = section.split(' ').length;
            
            if (currentWordCount + sectionWords > SPLITTING_CONFIG.maxWords && currentPart.length > 0) {
                parts.push(currentPart.join('\n'));
                currentPart = [section];
                currentWordCount = sectionWords;
            } else {
                currentPart.push(section);
                currentWordCount += sectionWords;
            }
        }
        
        if (currentPart.length > 0) {
            parts.push(currentPart.join('\n'));
        }
        
        return parts;
    }
    
    return null;
}
```

**Frontmatter Generation:**
```yaml
---
title: "[Part Title Based on Content]"
parent_doc: "[Original Document Name]"
part_number: [Sequential Number]
tags: [extracted, keywords, from, content]
created: [Current Date]
updated: [Current Date]
navigation:
  prev: "[Previous Part]"
  next: "[Next Part]"
---
```

### Step 5: Memory Tool Optimization
**Agent:** `/agent:memory-sync`  
**Actions:**
```bash
# Generate knowledge graph entities from documentation
/sync-memory docs/ --types "md"

# Create relationships between split documents
/agent:memory-sync --create-relations
```

**Memory Entity Structure:**
```javascript
{
    entities: [
        {
            name: "Authentication",
            entityType: "Documentation",
            observations: [
                "Parent document for authentication features",
                "Split into 3 parts for better navigation",
                "Covers login, 2FA, and JWT tokens"
            ]
        }
    ],
    relations: [
        {
            from: "Authentication",
            to: "Authentication Part 1",
            relationType: "has_part"
        },
        {
            from: "Authentication Part 1",
            to: "Authentication Part 2",
            relationType: "followed_by"
        }
    ]
}
```

### Step 6: Validation & Report
**Agent:** Main Claude  
**Final Checks:**
```bash
# Verify no broken links after reorganization
find docs/ -name "*.md" -exec grep -l "\[.*\](.*\.md)" {} \; | xargs -I {} sh -c 'grep -o "\[.*\](.*\.md)" {} | grep -o "(.*\.md)" | tr -d "()" | while read link; do [ -f "docs/$link" ] || echo "Broken: {} -> $link"; done'

# Check all documents have frontmatter
for file in docs/**/*.md; do
    head -1 "$file" | grep -q "^---$" || echo "Missing frontmatter: $file"
done

# Verify Memory Tool sync
/sync-memory --status

# Save documentation audit report
Write /Project_Management/TEMP/docs_audit_report.md
# Include: Files audited, changes made, issues found, compliance status
```

## Success Metrics
- ✅ Zero duplicate documentation files
- ✅ All infrastructure changes have corresponding ADRs
- ✅ 100% of feature docs follow standard template
- ✅ No single document exceeds 1000 words
- ✅ All documents have valid frontmatter
- ✅ Memory Tool successfully indexes all documentation

## Common Issues & Solutions

### Issue: Complex Documents Resist Splitting
**Solution:** Use semantic section boundaries rather than word count alone. Preserve logical groupings even if slightly over limit.

### Issue: Cross-References Break After Reorganization
**Solution:** Implement automatic link updating:
```javascript
// Update all references to split documents
updateReferences(originalPath, newPaths);
```

### Issue: Memory Tool Fails to Index
**Solution:** Ensure frontmatter follows exact YAML format with required fields.

## Slash Command Integration

To execute this recipe, use:
```
/doc-audit
```

Or with specific options:
```
/doc-audit --skip-adr     # Skip ADR enforcement
/doc-audit --dry-run      # Preview changes without applying
/doc-audit --path docs/   # Limit to specific directory
```

## Recipe Variations

### Quick Audit (No Splitting)
```
/doc-audit --audit-only
```

### ADR Enforcement Only
```
/doc-audit --adr-only
```

### Memory Optimization Only
```
/doc-audit --memory-optimize
```

## Notes
- Always backup documentation before running full standardization
- Consider project-specific template requirements
- ADR enforcement may require manual review for complex decisions
- Large document splitting should preserve semantic meaning

---

*Recipe tested with: Claude Code v1.0+ with Memory Tool integration*