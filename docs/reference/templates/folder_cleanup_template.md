# Universal Folder Cleanup Template
**Version:** 1.1  
**Purpose:** Systematic folder review process using 4 documentation agents with reference tracking  
**Created:** 08-19-2025  
**Updated:** 08-19-2025  
**Status:** Active

---

## Template Usage Instructions
```bash
# To use this template for any folder:
/folder-cleanup [target_folder_path]
```

---

## Phase 1: Analysis (4 Agents in Parallel)

### Agent Task Distribution Formula
**Total Files = N**
- If N ≤ 20: Use 1 agent
- If N ≤ 40: Use 2 agents  
- If N ≤ 80: Use 3 agents
- If N > 80: Use 4 agents

### Agent 1: Structure & References Analyst
**Scope:** Top 25% of files by importance
**Analysis Criteria:**
1. Is this file referenced by other files? (List all references WITH line numbers)
   - Use: `Grep -n "filename" /path/to/search`
   - Record: `/path/to/file.md:line_number`
2. Does this file reference other files? (List all outgoing references)
   - Check imports, links, includes
   - Record exact paths referenced
3. Is this a "single source of truth" file?
4. When was it last modified?
5. Does it follow naming conventions?

### Agent 2: Content & Duplication Analyst  
**Scope:** Next 25% of files
**Analysis Criteria:**
1. File purpose and current content
2. Similar files in project (potential duplicates)
3. Content overlap with other files (%)
4. Should content be split or merged?
5. Is content up-to-date with current practices?

### Agent 3: Location & Organization Analyst
**Scope:** Next 25% of files
**Analysis Criteria:**
1. Is file in correct folder per STAD Protocol?
2. Suggested location if incorrect
3. Related files that should be co-located
4. Folder structure compliance
5. Missing expected files in this location

### Agent 4: Status & Lifecycle Analyst
**Scope:** Final 25% of files
**Analysis Criteria:**
1. File lifecycle stage (active/complete/obsolete)
2. Associated sprint/epic/ticket
3. Completion status if applicable
4. Archive candidacy assessment
5. Dependencies that would break if removed

---

## Phase 2: Consolidation Report Format

### For EACH File/Folder:
```markdown
═══════════════════════════════════════════════════════════
FILE: [relative/path/to/file.md]
═══════════════════════════════════════════════════════════

📊 CURRENT STATUS:
- Size: [XX KB]
- Created: [YYYY-MM-DD]
- Last Modified: [YYYY-MM-DD]
- Description: [One-line description of file purpose, max 100 chars]

📍 REFERENCE TRACKING:
**REFERENCED BY:** (Incoming references)
- `/path/to/file1.md:123` - [context of reference]
- `/path/to/file2.md:456` - [context of reference]
- [Or "❌ No incoming references found"]

**REFERENCES TO:** (Outgoing references)
- Links to: `/path/to/other/file.md`
- Imports: `../module/component.ts`
- Includes: `templates/header.md`
- [Or "❌ No outgoing references"]

**UPDATE REQUIRED IF MOVED:**
```bash
# Commands to update all references:
sed -i 's|old/path/file.md|new/path/file.md|g' /path/to/file1.md
sed -i 's|old/path/file.md|new/path/file.md|g' /path/to/file2.md
```
- Total files to update: [N]
- Risk level: [LOW/MEDIUM/HIGH]

💎 VALUE ASSESSMENT:
- External References: [N] files (outside current folder)
- Days Since Update: [N] days
- Implementation Status: [Implemented/Proposed/Obsolete]
- Actual Value: [HIGH/MEDIUM/LOW/NONE]
- Evidence: [Specific proof of use or "No usage found"]

🔍 ANALYSIS:
- Purpose: [What this file does]
- Similar Files: [List any duplicates or overlaps]
- STAD Alignment: [✅ Aligned | ⚠️ Needs Update | ❌ Not Aligned]

📍 LOCATION ASSESSMENT:
- Current Location Correct: [YES/NO]
- If NO, Suggested Location: [/new/path/]
- Reason: [Why move]

🎯 RECOMMENDATION: [KEEP | ARCHIVE | CONSOLIDATE | RELOCATE | DELETE]

📝 REASONING:
[Detailed explanation of recommendation]

⚠️ IMPACT ANALYSIS:
- Files affected if moved: [N]
- Broken references if deleted: [N]
- Dependencies at risk: [List critical dependencies]

💡 CONSOLIDATION OPPORTUNITY:
[If applicable, how to merge with other files]

═══════════════════════════════════════════════════════════
USER DECISION: [ ] APPROVE  [ ] MODIFY  [ ] SKIP
USER NOTES: _______________________________________________
═══════════════════════════════════════════════════════════
```

---

## Phase 3: User Review Checkpoint

### Summary Statistics
```markdown
📊 FOLDER ANALYSIS SUMMARY: [/folder/path]
├── Total Files Analyzed: [N]
├── Total Folders: [N]
├── Total Size: [XX MB]
└── Last Activity: [YYYY-MM-DD]

🎯 RECOMMENDATIONS SUMMARY:
├── KEEP: [N files] ([X]% of total)
├── ARCHIVE: [N files] ([X]% of total)
├── CONSOLIDATE: [N files] ([X]% of total)
├── RELOCATE: [N files] ([X]% of total)
└── DELETE: [N files] ([X]% of total)

⚠️ HIGH PRIORITY ITEMS:
1. [Critical decisions needing immediate attention]
2. [Files with broken references]
3. [Duplicate content requiring consolidation]

📁 FOLDER STRUCTURE ISSUES:
- Missing Required Folders: [List]
- Empty Folders: [List]
- Incorrectly Named: [List]
```

### Decision Priority Matrix
```markdown
🔴 CRITICAL (Review First):
- Files with external dependencies
- Single sources of truth
- Active sprint/epic files

🟡 IMPORTANT (Review Second):
- Duplicate content
- Mislocated files
- Outdated documentation

🟢 STANDARD (Review Last):
- Archive candidates
- Empty folders
- Completed artifacts
```

---

## Phase 4: Execution Plan (After User Approval)

### Pre-Execution Checklist
- [ ] User has reviewed all recommendations
- [ ] Backup created of entire folder
- [ ] Archive folder prepared with date stamp
- [ ] Reason files prepared for archives

### Execution Order
1. **Create Archives First** (safest)
   - Move to `/Archive/[YYYY-MM-DD]/[original_path]/`
   - Create `archive_reason_[date].md`

2. **Relocate Files** (medium risk)
   - Move to approved new locations
   - Update any hardcoded references

3. **Consolidate Content** (highest risk)
   - Merge approved consolidations
   - Maintain attribution and history

4. **Clean Empty Folders** (lowest risk)
   - Remove only after confirmation

### Post-Execution Validation
- [ ] All references still work
- [ ] No broken links
- [ ] Folder structure matches STAD Protocol
- [ ] Audit trail documented

---

## Usage Example

### Step 1: Analyze Target Folder
```bash
# Analyze the Project_Management folder
/folder-cleanup /Project_Management
```

### Step 2: Review Generated Report
The system will generate a detailed report for each file with recommendations. Review each item and mark your decision:
- APPROVE - Accept the recommendation
- MODIFY - Change the recommendation
- SKIP - Leave file as-is

### Step 3: Execute Approved Changes
```bash
# Execute only approved changes
/execute-cleanup --approved-only
```

### Step 4: Validate Changes
```bash
# Verify all references still work
/validate-cleanup
```

---

## Template Variables
- `[target_folder]` - Folder being analyzed
- `[agent_count]` - Number of agents to use (1-4)
- `[stad_protocol]` - Version of STAD being followed
- `[archive_path]` - Where archives will be stored

---

## Agent Context Template

When invoking agents for folder cleanup, use this context:

```markdown
## Folder Cleanup Analysis Task

### Target Folder
Path: [folder_path]
Total Files: [count]
Your Assignment: Files [start_index] to [end_index]

### Analysis Requirements
For each file in your assignment:

1. **Reference Analysis**
   - Find all files that reference this file
   - Find all files this file references
   - Use Grep tool for comprehensive search

2. **Content Analysis**
   - Get creation date (from file system or frontmatter)
   - Get last modified date (from file system)
   - Write ONE-LINE description (max 100 chars, no fluff)
   - Identify if it's a template, spec, report, etc.
   - Note completion status

3. **Duplication Check**
   - Search for similar file names
   - Check for content overlap
   - Identify consolidation opportunities

4. **Location Validation**
   - Verify file is in correct folder per STAD Protocol
   - Suggest better location if needed

5. **Lifecycle Status**
   - Active/In-Use/Complete/Obsolete
   - Associated sprint or epic
   - Archive candidacy

### Output Format
For each file, provide structured analysis following the template format.
Include specific evidence for recommendations.

**CRITICAL: File descriptions must be:**
- ONE line only (no multi-line explanations)
- Maximum 100 characters
- No jargon or buzzwords
- Just state what it does (e.g., "Template for feedback collection" not "Comprehensive framework for gathering user feedback insights")
```

---

## Notes

- This template ensures systematic review with full user control
- No destructive actions without explicit user approval
- All changes are reversible through archived backups
- Maintains complete audit trail for compliance

---

*Template designed for STAD Protocol compliance and enterprise-grade project management*