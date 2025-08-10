---
title: Definition of Done
description: Check list for completing a ticket.
type: guide
category: documentation
tags: [documentation, done, workflow, test, specs, commit]
created: 08-03-2025
updated: 08-03-2025
---

# **Definition of Done**

A ticket is "DONE" when it meets ALL these criteria:

**✅ Completion**
- All tasks from the ticket's Spec document are complete
- All tasks are marked completed in the Spec document 

**✅ Code**
- Feature works as specified in the ticket's Spec document
- All acceptance criteria met
- Code is clean (no debug code, TODOs, or unused files)

**✅ Tests**
- 85% coverage minimum (95% for critical systems: auth, payments, data)
- All tests passing in CI/CD
- No broken existing functionality

**✅ Documentation**
- Use Bash to get current date
- Spec document is complete and current
- Module README updated (ONLY if you changed the API or architecture)
- Add commit notes to the Release_Notes.md

**✅ Ready for Production**
- Code reviewed and approved
- Merged to main branch
- Status updated to DONE in PROJECT_PLAN.md

### **Remember**
- Don't delete files - archive them in `/Archive/` with a reason
- Follow the workflow - no skipping states
- If something fails, go back to IN_PROGRESS and fix it

