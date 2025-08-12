#!/bin/bash
# STAD Protocol v4.1 - Pre-flight Context Analysis Script
# Gathers context before sprint planning to ensure context-aware decisions

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           STAD Sprint Pre-flight Analysis v4.1            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📅 Analysis Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "=== 📊 Recent Activity (Last 10 Commits) ==="
git log --oneline -10 --graph --decorate
echo ""

echo "=== 📁 Modified Areas (Since Last Sprint) ==="
git diff --name-only HEAD~20 HEAD 2>/dev/null | cut -d/ -f1-2 | sort -u | head -10
echo ""

echo "=== 🎯 Key Architectural Decisions ==="
git log --grep="Decision:" --format="  • %s" -5 2>/dev/null || echo "  No recent decisions found"
echo ""

echo "=== ✅ Recently Completed Tickets ==="
git log --grep="AGENT-\|STAD-" --format="  • %s" -10 2>/dev/null || echo "  No recent tickets found"
echo ""

echo "=== 🐛 Recent Bug Fixes (Learn from Past) ==="
git log --grep="fix\|bug\|Fix\|Bug" --format="  • %s" -5 2>/dev/null || echo "  No recent bug fixes found"
echo ""

echo "=== 🔄 Current Branch Status ==="
echo "  Branch: $(git branch --show-current)"
echo "  Ahead/Behind: $(git status -sb | head -1)"
echo "  Uncommitted changes: $(git status --porcelain | wc -l) files"
echo ""

echo "=== 📦 Dependencies Status ==="
if [ -f "package.json" ]; then
    echo "  Node modules: $(ls node_modules 2>/dev/null | wc -l) packages"
    echo "  Last npm install: $(stat -c %y node_modules 2>/dev/null | cut -d' ' -f1 || echo 'Unknown')"
fi
if [ -f "requirements.txt" ]; then
    echo "  Python packages: $(pip list 2>/dev/null | wc -l) packages"
fi
echo ""

echo "=== 💡 Context Summary for Architect Agent ==="
echo "  • Focus areas based on recent changes:"
git diff --name-only HEAD~20 HEAD 2>/dev/null | cut -d/ -f1 | sort | uniq -c | sort -rn | head -3 | while read count dir; do
    echo "    - $dir ($count changes)"
done
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Pre-flight Analysis Complete - Ready for Planning    ║"
echo "╚════════════════════════════════════════════════════════════╝"