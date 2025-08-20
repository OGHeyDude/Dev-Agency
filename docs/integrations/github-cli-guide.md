# GitHub CLI Integration Guide

**Status:** Production Ready  
**Tool:** GitHub CLI (`gh`)  
**Note:** We use GitHub CLI, NOT MCP, for all GitHub operations

---

## Overview

Dev-Agency uses the official GitHub CLI (`gh`) for all GitHub operations. This provides complete access to GitHub's API including repositories, issues, pull requests, and project boards.

**Important:** We do NOT use GitHub MCP server. All GitHub operations are performed through the `gh` command-line tool.

---

## Authentication

### Required Token Scopes
Your GitHub Personal Access Token must have these scopes:
- `repo` - Full control of repositories
- `project` - Access to project boards
- `workflow` - GitHub Actions management
- `read:org` - Organization access

### Setup
1. Create a Personal Access Token at: https://github.com/settings/tokens
2. Add to `.env` file:
   ```bash
   GITHUB_TOKEN="your_token_here"
   GITHUB_OWNER=your_username
   GITHUB_REPO=your_repo_name
   ```
3. Authenticate with: `echo $GITHUB_TOKEN | gh auth login --with-token`

---

## Common Operations

### Repository Management
```bash
# View repository
gh repo view OGHeyDude/Dev-Agency

# List repositories
gh repo list

# Clone repository
gh repo clone OGHeyDude/Dev-Agency
```

### Issue Management
```bash
# List issues
gh issue list --repo OGHeyDude/Dev-Agency

# Create issue
gh issue create --title "Title" --body "Description"

# View issue
gh issue view <number>

# Close issue
gh issue close <number>
```

### Pull Request Management
```bash
# Create PR
gh pr create --title "Title" --body "Description"

# List PRs
gh pr list

# View PR
gh pr view <number>

# Merge PR
gh pr merge --squash
```

### Project Board Management
```bash
# List project boards
gh project list --owner OGHeyDude

# View project board
gh project view <number> --owner OGHeyDude

# Add issue to project
gh project item-add <project-number> --owner OGHeyDude --url <issue-url>
```

### API Access
```bash
# Direct API calls
gh api repos/OGHeyDude/Dev-Agency

# GraphQL queries
gh api graphql -f query='...'

# Get rate limit
gh api rate_limit
```

---

## Sprint Workflow Integration

### Creating Sprint Issues
```bash
# Create STAD ticket
gh issue create \
  --repo OGHeyDude/Dev-Agency \
  --title "STAD-XXX: Feature Name" \
  --body "## Description\n\nTicket description here"
```

### Managing Sprint Board
```bash
# Add to sprint board
gh project item-add 6 \
  --owner OGHeyDude \
  --url https://github.com/OGHeyDude/Dev-Agency/issues/XXX
```

### Creating Pull Requests
```bash
# Create feature PR
gh pr create \
  --title "feat(stad): Implement feature" \
  --body "## Summary\n\nPR description\n\n## Test Plan\n\n- [ ] Tests pass"
```

---

## Troubleshooting

### Token Issues
If you get "missing required scopes" errors:
1. Check current scopes: `gh auth status`
2. Create new token with required scopes
3. Re-authenticate: `echo $NEW_TOKEN | gh auth login --with-token`

### Project Board Access
Project boards require the `project` scope. If you can't access them:
1. Go to: https://github.com/settings/tokens
2. Edit your token to add `project` scope
3. Update `.env` with new token
4. Re-authenticate

---

## Why Not MCP?

We use GitHub CLI instead of MCP because:
1. **Reliability** - Direct GitHub tool, always works
2. **Completeness** - Full API access
3. **Simplicity** - No additional server to maintain
4. **Official** - Maintained by GitHub

The `gh` CLI provides everything we need for Dev-Agency workflows.

---

## Quick Reference

| Task | Command |
|------|---------|
| Check auth | `gh auth status` |
| List repos | `gh repo list` |
| Create issue | `gh issue create` |
| Create PR | `gh pr create` |
| List projects | `gh project list --owner OGHeyDude` |
| API call | `gh api [endpoint]` |

---

*Last updated: 08-17-2025*