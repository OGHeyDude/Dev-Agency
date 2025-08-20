---
title: Archive Reason Template
description: Template for documenting why files are being archived instead of deleted
type: template
category: management
tags: [stad, archive, documentation, file-management]
created: 2025-08-15
updated: 2025-08-15
---

# Archive Reason - [SUBJECT]_archive_reason_[YYYY-MM-DD]

**Archive Date:** [YYYY-MM-DD]  
**Archived By:** [Name/Agent]  
**Archive ID:** [ARC-YYYY-MM-DD-X]  
**Related Ticket:** [TICKET-ID] (if applicable)  
**Project:** [Project Name]

---

## 📁 Files/Directories Archived

### Primary Items
- **Original Location:** `[/path/to/original/file.ext]`
- **Archive Location:** `[/Archive/path/to/archived/file.ext]`
- **File Type:** [Code/Documentation/Configuration/Asset/Other]
- **Size:** [File size or directory count]

### Additional Items (if applicable)
- **Original Location:** `[/path/to/original/file2.ext]`
- **Archive Location:** `[/Archive/path/to/archived/file2.ext]`
- **File Type:** [Code/Documentation/Configuration/Asset/Other]
- **Size:** [File size or directory count]

---

## 🎯 Reason for Archiving

### Primary Reason
**Category:** [Obsolete/Superseded/Deprecated/Refactored/Consolidated/Testing/Experimental/Other]

**Detailed Explanation:**
[Provide clear explanation of why these files are being archived rather than deleted. Be specific about what changed or what superseded these files.]

### Supporting Factors
- [ ] **Code is no longer used** - Functionality replaced or removed
- [ ] **Feature deprecated** - No longer supported in current version
- [ ] **Refactoring completed** - Code restructured and old version obsolete
- [ ] **Documentation outdated** - Newer documentation replaces this content
- [ ] **Configuration obsolete** - New configuration system implemented
- [ ] **Testing artifacts** - Temporary files from testing or development
- [ ] **Experimental code** - Proof-of-concept or prototype no longer needed
- [ ] **Duplicate content** - Consolidated into other files
- [ ] **Security concern** - Contains sensitive data or vulnerable code
- [ ] **Performance issue** - Replaced with more efficient implementation

---

## 🔗 Related Context

### Associated Tickets
- **Primary Ticket:** [TICKET-ID] - [Title]
- **Related Tickets:** 
  - [TICKET-ID-2] - [Title]
  - [TICKET-ID-3] - [Title]

### Decision Information
- **Decision Made By:** [Name/Role]
- **Decision Date:** [YYYY-MM-DD]
- **Decision Context:** [Sprint/Epic/Refactoring effort/etc.]
- **Stakeholders Involved:** [List of people who contributed to decision]

### Epic/Project Context
- **Epic:** [Epic Name] (if applicable)
- **Sprint:** [Sprint Number] (if applicable)
- **Project Phase:** [Phase/Milestone]
- **Business Justification:** [Why this change was necessary]

---

## 🔄 Migration Information

### Replacement Files/Systems
- **Replaced By:** `[/path/to/new/file.ext]` or [System/Component Name]
- **Migration Date:** [YYYY-MM-DD]
- **Migration Method:** [How functionality was migrated]
- **Data Migration:** [How data was moved if applicable]

### Code/Functionality Mapping
**Old Function/Feature → New Function/Feature:**
- `[oldFunction()]` → `[newFunction()]`
- `[OldComponent]` → `[NewComponent]`
- `[old-feature]` → `[new-feature]`

### Configuration Changes
**Old Settings → New Settings:**
- `[old.config.setting]` → `[new.config.setting]`
- `[OLD_ENV_VAR]` → `[NEW_ENV_VAR]`

---

## 📚 Dependencies & Impact

### Files That Referenced These Items
- `[/path/to/file1.ext]` - [How it was updated]
- `[/path/to/file2.ext]` - [How it was updated]
- `[/path/to/file3.ext]` - [How it was updated]

### Systems That Used These Items
- **[System Name]** - [Impact and resolution]
- **[Service Name]** - [Impact and resolution]
- **[Integration Name]** - [Impact and resolution]

### Breaking Changes
- [ ] **No breaking changes** - Archive is completely safe
- [ ] **Minor breaking changes** - [Description and mitigation]
- [ ] **Major breaking changes** - [Description and comprehensive mitigation]

---

## 🛡️ Preservation Rationale

### Why Archive Instead of Delete
- [ ] **Historical reference** - May need to reference implementation details
- [ ] **Compliance requirement** - Regulatory or audit requirements
- [ ] **Learning resource** - Educational value for team members
- [ ] **Rollback possibility** - Potential need to revert changes
- [ ] **Documentation value** - Contains valuable comments or documentation
- [ ] **Legal requirement** - Must retain for legal/contractual reasons
- [ ] **Debugging aid** - May be needed for troubleshooting legacy issues
- [ ] **Pattern reference** - Contains useful coding patterns or approaches

### Retention Period
**Recommended Retention:** [Duration, e.g., "6 months", "1 year", "indefinite"]  
**Review Date:** [YYYY-MM-DD] - [When to review if still needed]  
**Disposal Criteria:** [Conditions under which it could be permanently deleted]

---

## 🔍 Future Reference Information

### How to Access Archived Content
1. **Location:** Files are stored in `/Archive/[original-path-structure]/`
2. **Documentation:** This file serves as the index and context
3. **Search:** Use `grep -r "search-term" /Archive/` to find specific content
4. **Restoration:** If needed, copy files back to appropriate location

### Key Content Summary
**Important Functions/Classes/Components:**
- `[ImportantFunction()]` - [Brief description of what it did]
- `[ImportantClass]` - [Brief description of its purpose]
- `[ImportantComponent]` - [Brief description of its role]

**Configuration Keys:**
- `[important.config.key]` - [What it controlled]
- `[IMPORTANT_ENV_VAR]` - [What it configured]

**Notable Patterns or Techniques:**
- [Description of any notable implementation patterns]
- [Unique approaches that might be useful in the future]

---

## ✅ Archive Verification

### Pre-Archive Checklist
- [ ] **All references updated** - No remaining references to archived files
- [ ] **Tests still passing** - No test failures caused by archiving
- [ ] **Build successful** - Application builds without archived files
- [ ] **Documentation updated** - References in docs updated appropriately
- [ ] **Team notified** - Relevant team members informed of archiving

### Post-Archive Validation
- [ ] **Files successfully moved** - All items in correct archive location
- [ ] **Original location cleaned** - No remnants left in original location
- [ ] **Access permissions set** - Archive files have appropriate permissions
- [ ] **Archive index updated** - This documentation properly filed
- [ ] **Version control updated** - Git/VCS reflects the archiving changes

---

## 📈 Metrics & Impact

### Code Metrics
- **Lines of Code Archived:** [Number]
- **Files Archived:** [Number]
- **Directories Archived:** [Number]
- **Test Files Archived:** [Number]

### Project Impact
- **Code Complexity Reduction:** [Cyclomatic complexity reduction]
- **Maintenance Burden Reduction:** [Estimated hours saved]
- **Storage Space Freed:** [File size reduction]
- **Build Time Improvement:** [Speed improvement if any]

---

## 📝 Additional Notes

### Special Considerations
[Any special circumstances or considerations for this archive]

### Lessons Learned
[What was learned from this code/documentation that could benefit future work]

### Process Improvements
[Any suggestions for improving the archiving process based on this experience]

### Contact Information
**Primary Contact:** [Name] - [Role] - [Contact info]  
**Secondary Contact:** [Name] - [Role] - [Contact info]  
**Subject Matter Expert:** [Name] - [Role] - [Contact info]

---

## 📚 Related Documentation

**Process Documentation:**
- [Link to archiving procedures]
- [Link to file management standards]

**Project Documentation:**
- [Link to project architecture docs]
- [Link to migration guides]

**Decision Records:**
- [Link to architectural decision records]
- [Link to project decision log]

---

*This archive reason document ensures proper documentation of why files were archived instead of deleted, maintaining historical context and enabling future reference when needed.*