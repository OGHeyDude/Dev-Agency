# GitHub Project Board Setup Guide (Manual Process)

**STAD Protocol v4.1**  
**Date:** 08-12-2025  
**Purpose:** Document manual GitHub Project Board creation due to CLI auth limitations  

---

## 🚨 Why Manual Setup?

The GitHub CLI (`gh`) requires additional authentication scopes for project management that are not available by default:

```bash
# This command will fail with auth error:
gh project create "Sprint Name"
# Error: insufficient OAuth scopes (needs 'project' scope)
```

**Solution:** Use GitHub web UI for initial setup, then query via API

---

## 📋 Step-by-Step Setup Process

### Step 1: Navigate to Projects Page

1. Open browser and go to: **https://github.com/OGHeyDude/Dev-Agency/projects**
2. Click the green **"New project"** button
3. Select **"Start from scratch"** (not a template)

### Step 2: Configure Project Board

#### Basic Settings:
- **Project Name:** `Sprint [N]: [Feature Name]`
  - Example: `Sprint 7: STAD Protocol Implementation`
- **Description:** Brief sprint goal
  - Example: `Validate STAD Protocol v4.1 Git-native workflow`
- **Visibility:** Public (for open source) or Private

#### View Selection:
- Choose **"Board"** view (Kanban style)
- Columns will auto-create: Todo, In Progress, Done

### Step 3: Add Custom Fields (Critical for STAD)

Click **"+"** button in field menu and add:

| Field Name | Type | Purpose | Example Value |
|------------|------|---------|---------------|
| **Batch** | Number | Group tickets for parallel execution | 1, 2, 3 |
| **Dependencies** | Text | Track ticket dependencies (DAG) | "STAD-001, STAD-002" |
| **Key Decisions** | Text | Capture architectural choices | "Use PostgreSQL, JWT auth" |
| **Execution Order** | Number | Sequence for execution | 1, 2, 3, 4 |
| **Story Points** | Single Select | Estimate complexity | 1, 2, 3, 5, 8, 13 |
| **Sprint** | Text | Track sprint association | "Sprint 7" |

### Step 4: Link Issues to Project

#### Method 1: From Project Board
1. Click **"+ Add item"** at bottom of a column
2. Type `#` to search for existing issues
3. Select issues to add (e.g., `#1 AGENT-027`)

#### Method 2: From Issue Page
1. Navigate to issue (e.g., Issue #1)
2. In right sidebar, find **"Projects"** section
3. Click gear icon → Select your project

### Step 5: Note Project Number

After creation, note the project number from URL:
```
https://github.com/users/OGHeyDude/projects/[NUMBER]
                                            ↑
                                    This is your project number
```

**Save this number!** You'll need it for CLI queries.

---

## 🔧 CLI Alternatives (What Still Works)

### Query Issues (Without Project Board)
```bash
# List all sprint issues
gh issue list --label "sprint-7"

# View specific issue
gh issue view 1

# Create new issue
gh issue create --title "STAD-004" --label "sprint-7"
```

### Query Project via API (After Manual Creation)
```bash
# Get project details (replace N with your project number)
gh api graphql -f query='
  query {
    user(login: "OGHeyDude") {
      projectV2(number: N) {
        title
        items(first: 20) {
          nodes {
            content {
              ... on Issue {
                title
                state
              }
            }
          }
        }
      }
    }
  }'

# Simpler: Get project ID for updates
gh api /users/OGHeyDude/projects --jq '.[] | select(.name=="Sprint 7") | .id'
```

### Update Project Items (Limited)
```bash
# After getting project and item IDs, you can update fields
# But it's complex - web UI is recommended for updates
```

---

## 📊 Visual Board Management

### Recommended Workflow:

1. **Planning Phase**: Create all tickets as GitHub Issues first
2. **Board Setup**: Add all issues to project via web UI
3. **Execution**: Update status via web UI as work progresses
4. **Queries**: Use CLI/API for read-only operations

### Board Columns Configuration:

```
┌─────────────┬──────────────┬────────────┬──────────────┬────────┐
│   Backlog   │     Todo     │ In Progress│    Review    │  Done  │
├─────────────┼──────────────┼────────────┼──────────────┼────────┤
│ • STAD-005  │ • STAD-003   │ • STAD-002 │ • STAD-001   │ • #1   │
│ • STAD-006  │ • STAD-004   │            │              │        │
│             │              │            │              │        │
└─────────────┴──────────────┴────────────┴──────────────┴────────┘
```

---

## 🔍 Validation Checklist

After setup, verify:

- [ ] Project board created and visible
- [ ] Custom fields added (Batch, Dependencies, etc.)
- [ ] Issues linked to project
- [ ] Project number noted for CLI queries
- [ ] Team members have access (if applicable)
- [ ] Automation rules configured (optional)

---

## 🚀 Usage in STAD Workflow

### During Sprint Planning:
1. Architect Agent generates DAG
2. Manually create project board
3. Add custom field values based on DAG
4. Set Execution Order from dependencies

### During Sprint Execution:
1. Update status via web UI
2. Query progress via CLI
3. Use semantic commits to track work
4. Board provides visual progress

### For Recovery:
1. Project board shows current state
2. Git history shows completed work
3. Combine both for full picture

---

## ⚠️ Known Limitations

| Feature | Web UI | CLI | API |
|---------|--------|-----|-----|
| Create Project | ✅ | ❌ | ⚠️ |
| Add Issues | ✅ | ❌ | ✅ |
| Update Fields | ✅ | ❌ | ✅ |
| Query Data | ✅ | ⚠️ | ✅ |
| Delete Project | ✅ | ❌ | ✅ |

**Legend:** ✅ Works | ❌ Doesn't Work | ⚠️ Limited

---

## 📝 Example: Sprint 7 Setup

```yaml
Project: Sprint 7: STAD Protocol Implementation
Issues:
  - #1 AGENT-027:
      Batch: 1
      Dependencies: none
      Execution Order: 1
      Story Points: 13
      Key Decisions: "Git-native, Semantic commits"
      
Columns:
  Backlog: []
  Todo: []
  In Progress: []
  Review: [#1]
  Done: []
```

---

## 🔗 Resources

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub CLI Project Commands](https://cli.github.com/manual/gh_project)
- [GraphQL API for Projects](https://docs.github.com/en/graphql/reference/objects#projectv2)

---

**Note:** This is a temporary workaround. Future versions of STAD may include automated project setup once GitHub CLI adds necessary scopes or we implement OAuth app.

---

**Next Step:** Run Sprint Retrospective