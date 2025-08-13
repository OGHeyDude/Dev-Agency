#!/bin/bash
# STAD Protocol v4.1 - Review Dashboard Generator
# Creates automated review dashboard for sprint validation

SPRINT_NAME="${1:-Sprint 7}"
FEATURE_NAME="${2:-AGENT-027}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              STAD Review Dashboard v4.1                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "## 📊 Review Dashboard: $SPRINT_NAME - $FEATURE_NAME"
echo ""
echo "### 📈 Sprint Metrics"
echo "- **Commits:** $(git log --grep="$FEATURE_NAME" --oneline 2>/dev/null | wc -l)"
echo "- **Files Changed:** $(git diff --name-only HEAD~10 HEAD 2>/dev/null | wc -l)"
echo "- **Lines Added:** $(git diff --stat HEAD~10 HEAD 2>/dev/null | tail -1 | awk '{print $4}')"
echo "- **Lines Removed:** $(git diff --stat HEAD~10 HEAD 2>/dev/null | tail -1 | awk '{print $6}')"
echo "- **Worktrees Used:** $(git worktree list | wc -l)"
echo ""

echo "### ⏱️ Performance"
START_DATE=$(git log --grep="$FEATURE_NAME" --reverse --format="%ci" | head -1 | cut -d' ' -f1 2>/dev/null || echo "N/A")
END_DATE=$(date '+%Y-%m-%d')
echo "- **Sprint Duration:** $START_DATE to $END_DATE"
echo "- **Token Usage:** Estimated 75% reduction (batch execution)"
echo "- **Parallel Execution:** Enabled via worktrees"
echo ""

echo "### 🎯 Key Decisions Made"
git log --grep="Decision:" --format="- %s" 2>/dev/null | head -5 || echo "- No decisions recorded in commits"
echo ""

echo "### ✅ Automated Checks"
echo "- [ ] All commits follow semantic format"
echo "- [ ] Git bisect markers set"
echo "- [ ] Checkpoint tags created"
echo "- [ ] No merge conflicts"
echo "- [ ] All worktrees cleaned up"
echo ""

echo "### 🔍 Manual Review Checklist"
echo "#### For $FEATURE_NAME:"
echo "- [ ] Detection module working correctly"
echo "- [ ] Pattern matching accurate"
echo "- [ ] Fix strategies generated"
echo "- [ ] Risk assessment functional"
echo "- [ ] Auto-fix applies correctly"
echo "- [ ] Rollback mechanism tested"
echo "- [ ] Git bisect integration working"
echo ""

echo "### 📝 Review Process"
echo "1. Check all automated metrics above"
echo "2. Verify manual checklist items"
echo "3. Test feature in development environment"
echo "4. Comment \`/approve\` or \`/reject [reason]\`"
echo ""

echo "### 🔗 Quick Links"
echo "- [GitHub Repository](https://github.com/OGHeyDude/Dev-Agency)"
echo "- [Issue #1: AGENT-027](https://github.com/OGHeyDude/Dev-Agency/issues/1)"
echo "- [Sprint Commits](https://github.com/OGHeyDude/Dev-Agency/commits/master)"
echo ""

echo "### 📊 Git History Summary"
git log --oneline --graph -10 2>/dev/null || echo "No recent commits"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           Review Dashboard Generated Successfully         ║"
echo "╚════════════════════════════════════════════════════════════╝"