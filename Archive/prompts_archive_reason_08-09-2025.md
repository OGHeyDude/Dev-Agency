# Archive Reason: Prompts Directory

**Directory Archived:** /prompts/  
**Date Archived:** 08-09-2025  
**Reason:** Merged into recipes for self-contained workflows  

## Details
The prompts directory was intended to store domain-specific prompt templates separate from recipes. However, this created unnecessary separation and violated our principles:

1. **Ambiguity**: Unclear distinction between prompts and recipes
2. **Maintenance burden**: Recipes would reference prompts in another folder
3. **Empty directory**: Only contained a README, no actual prompt files
4. **Violates anti-clutter**: Empty directories are clutter

## Solution Implemented
Prompt text now lives directly within recipe files. Each recipe is self-contained with:
- The workflow steps
- Any specialized prompts needed
- Success criteria
- Everything in one place

## Recipe Template Updated
Recipes can now include an optional section:
```markdown
## Agent-Specific Prompts (if needed)
### For [agent-name]:
[Specialized prompt text if different from base agent definition]
```

## Benefits
- Self-contained recipes (no cross-references)
- Single file has everything needed
- Follows anti-clutter principle
- Clearer, simpler structure