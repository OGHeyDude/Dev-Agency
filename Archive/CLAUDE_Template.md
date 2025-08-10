# CLAUDE.md - Project Development Instructions

**ABOVE ALL DO NOT ADD WORK THAT WAS NOT ASKED OF YOU. FOLLOW THE USER REQUESTS AND ASK FOR CLARIFICATION!**

You and the User `HD` are a solo team. 
* **We are building enterprise-grade softwares. Your approach must reflect professional development practices. Every line of code should be worthy of a critical production environment serving real users securely.**
* **`HD` (the User) value accuracy and quality over speed. So take your time, and make sure your work is done right and with enterprise best practices in mind**

**IMPORTANT**: This project follows the Development Standards system. You MUST adhere to these processes and templates.

---

## Quick Commands

**Workflow:** `/cmd` → select ticket → `/research` → `/plan` → `/build` → `/test` → `/document`

---

## Reference Shortcuts

### Guides
- `$STANDARDS` = `/home/hd/Desktop/LAB/Development_Standards/Guides/Development Standards Guide.md`
- `$WORKFLOW` = `/home/hd/Desktop/LAB/Development_Standards/Guides/Development Workflow Guide.md`
- `$DOCS_GUIDE` = `/home/hd/Desktop/LAB/Development_Standards/Guides/Documentation Guide.md`
- `$GUIDES_DIR` = `/home/hd/Desktop/LAB/Development_Standards/Guides`

### Templates
- `$PROJECT_PLAN` = `/home/hd/Desktop/LAB/Development_Standards/Templates/PROJECT_PLAN_Template.md`
- `$SPEC` = `/home/hd/Desktop/LAB/Development_Standards/Templates/SPECS_Template.md`
- `$CHANGELOG` = `/home/hd/Desktop/LAB/Development_Standards/Templates/CHANGELOG_Template.md`
- `$HANDOFF` = `/home/hd/Desktop/LAB/Development_Standards/Templates/Handoff report.md`

### Session Management
- `/cmd` - Read CLAUDE.md, initialize session, and greet HD
- `/standards` - Review work standards from `$GUIDES_DIR`

### 5-Step Development Process
1. `/research` - Step 1: Search for existing code, documentation, and examples
2. `/plan` - Step 2: Read `$WORKFLOW` | Define goals and create technical plan in `$SPEC`
3. `/build` - Step 3: Read `$STANDARDS` | Update ticket status | Start implementation 
4. `/test` - Step 4: Read `$STANDARDS` | Run comprehensive tests and validation
5. `/document` - Step 5: Read `$DOCS_GUIDE` | Verify current date using `date +"%m-%d-%Y"` | Update documentation (Spec and/or README.md)

---

## Development Standards Reference

All development work in this project MUST follow the standards defined in:
- **Development Workflow Guide**: `$WORKFLOW`
- **Development Standards Guide**: `$STANDARDS`
- **Documentation Guide**: `$DOCS_GUIDE`

---

## Critical CORE Principles

1. **NEVER skip the 5-step development process**
2. **ALWAYS create/update Spec documents before starting work**
3. **FOLLOW the strict status transitions - no shortcuts**
4. **CHECK PROJECT_PLAN.md before starting ANY work**
5. **UPDATE ticket status in real-time as work progresses**

**CORE Principles!!**
1. Run `date +"%m-%d-%Y"` at the start of any session AND before writing any document
2. **Before making any changes to a file in a folder Always read the Folder README.md**. All documentation need a frontrunner. Follow our `Documentation.md`.
3. ALWAYS make sure you are not writing duplicate code or files AND that you are writing them in the right location (project,folder,PATH).
4. **Do not DELETE or REMOVE files, only Archive them** EVEN If the User request to delete, send the files to the /Archive folder and add an [SUBJECT]_archive_reason_[DATE].md note.
5. Be clear about recommending the USER 'NEEDED' items (features, task etc.) versus 'NICE TO HAVE'. The We don't want to derail or slow down our progress. Recommend only things you think they are NEEDED or ones that 'WILL HELP YOU' (Claude)

---

## Mandatory Process Requirements

### 1. Project Planning Structure
- **Central Source of Truth**: `PROJECT_PLAN.md` in project root
- **All tickets must have**: Unique ID, Status, Story Points (1,2,3,5,8,13), Spec Link
- **Epic tracking**: Use simplified statuses (Planned → In Progress → Done)

### 2. Development Cycle (5-Step Process)
For EVERY ticket/task, you MUST follow these steps:
1. **Research**: Look for existing code, documentation, examples
2. **Plan**: Define goals and create technical plan in Spec document
3. **Build**: Implement clean, well-structured code
4. **Test**: Validate with comprehensive testing
5. **Document**: Update relevant documentation

### 3. Ticket Status Transitions
Follow this STRICT state machine:
- `BACKLOG` → `TODO` → `IN_PROGRESS` → `CODE_REVIEW` → `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE`
- **BLOCKED state**: Can occur from any active state; return to previous state when unblocked
- **Failures**: Return to `IN_PROGRESS` for rework

### 4. Required Templates
Use these templates (see Path Variables section for full paths):
- **`$PROJECT_PLAN`**: For project planning and backlog
- **`$SPEC`**: For EVERY ticket before moving to TODO
- **`$HANDOFF`**: When transferring work
- **`$CHANGELOG`**: For release documentation

### 5. Documentation Requirements
- **Feature Documentation**: Update Spec document throughout development
- **Module Documentation**: Update README.md ONLY if changing public APIs or architecture
- **Changelog**: Update during release process (group READY_FOR_RELEASE tickets)

---

## Project Management Structure

### Required Folder Organization
Every project MUST maintain the following documentation structure:

```
/Project_Management/
├── PROJECT_PLAN.md           # Central source of truth for all tickets
├── /Specs/                   # All ticket specifications
│   ├── TICKET-001_spec.md
│   ├── TICKET-002_spec.md
│   └── ...
├── /Archive/                 # Archived files (never delete, always archive)
│   └── [SUBJECT]_archive_reason_[DATE].md
└── /Releases/                # Release documentation
    └── CHANGELOG.md
```

### Documentation Files Location
- **Feature Documentation**: Lives in `/Project_Management/Specs/` as individual spec files per ticket
- **Module Documentation**: Lives as `README.md` in each module's root directory
- **Project Planning**: Lives in `/Project_Management/PROJECT_PLAN.md`
- **Release Notes**: Lives in `/Project_Management/Releases/CHANGELOG.md`

**Note**: For detailed documentation guidelines, refer to `$DOCS_GUIDE`

---

## Project-Specific Instructions

[Add any project-specific requirements, constraints, or guidelines here]

### Project Context
- **Project Type**: [e.g., Web Application, CLI Tool, Library]
- **Primary Language**: [e.g., TypeScript, Python, Go]
- **Key Dependencies**: [List main frameworks/libraries]

### Development Guidelines
- [Add project-specific coding standards]
- [Add project-specific testing requirements]
- [Add project-specific deployment process]

---

*This CLAUDE.md is based on the Development Standards system. Do not modify the process requirements section.*