# Bug Report Template

**Bug ID:** BUG-XXX  
**Title:** [Brief, descriptive title]  
**Severity:** [Critical/High/Medium/Low]  
**Status:** BLOCKED  
**Reported By:** [User/Reviewer name]  
**Date:** [Run: date +"%Y-%m-%d %H:%M"]  
**Stage Found:** [Stage 3: Validation / Other]

---

## 📝 Summary

**One-line description:** [What's broken in simple terms]

---

## 🔍 Description

**Detailed breakdown of the issue:**
[Provide comprehensive details about what's wrong, including context about when and where it occurs]

---

## ⚡ Expected vs Actual Behavior

### Expected Behavior
```
[What should happen]
- Step 1 result
- Step 2 result
- Final state
```

### Actual Behavior
```
[What actually happens]
- Step 1 result
- Step 2 result  
- Error/wrong state
```

---

## 🔄 Steps to Reproduce

1. [First step - be specific]
2. [Second step - include exact commands/clicks]
3. [Third step - note any data used]
4. [Step where bug appears]
5. [Observed error/issue]

**Reproduction Rate:** [Always/Sometimes/Rarely] ([X]% of attempts)

---

## 🌍 Environment & Context

**Environment Details:**
- Branch: [feature/branch-name]
- Commit: [SHA]
- Environment: [Staging/Development/Production]
- URL: [If applicable]
- Browser/Client: [If applicable]
- OS: [If applicable]

**Related Context:**
- Feature/Epic: [EPIC-XXX]
- Original Ticket: [STAD-XXX]
- PR: [#XXX]
- Test Results: [Link]

---

## 📊 Impact Assessment

**Affected Components:**
- [ ] Frontend UI
- [ ] Backend API
- [ ] Database
- [ ] Authentication
- [ ] Performance
- [ ] Security
- [ ] Other: [Specify]

**User Impact:**
- Number of users affected: [Estimate]
- Functionality blocked: [List]
- Workaround available: [Yes/No - if yes, describe]

---

## 🔬 Initial Investigation

**Error Messages/Logs:**
```
[Paste relevant error messages, stack traces, or log entries]
```

**Browser Console:**
```
[If frontend issue, paste console errors]
```

**Network Requests:**
```
[If API issue, paste failed requests/responses]
```

---

## 💡 Potential Root Cause

**Initial hypothesis:**
[Based on symptoms, what might be causing this?]

**Related recent changes:**
- [Recent commit that might be related]
- [Configuration change]
- [Dependency update]

---

## 🔧 Suggested Investigation Approach

For Debug Agent:
1. [ ] Use git bisect between [last_known_good] and [first_bad]
2. [ ] Check [specific file/component]
3. [ ] Validate [specific assumption]
4. [ ] Test [specific edge case]

---

## 📎 Attachments

- Screenshots: [Links or describe]
- Videos: [Links if available]
- Test Data: [Sample data that triggers bug]
- Related PRs: [Links]

---

## ✅ Definition of Fixed

The bug will be considered fixed when:
- [ ] Original reproduction steps no longer trigger the issue
- [ ] Regression test added to prevent recurrence
- [ ] Root cause documented
- [ ] All affected test cases pass
- [ ] Performance remains within acceptable bounds

---

## 🏷️ Labels/Tags

- Type: `bug`
- Priority: `[priority]`
- Component: `[affected-component]`
- Sprint: `[current-sprint]`

---

*This bug report is ready for Debug Agent investigation*