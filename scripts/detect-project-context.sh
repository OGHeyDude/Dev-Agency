#!/bin/bash

# STAD Protocol - Project Context Detection Script
# This script detects the current project context for STAD Protocol operations

echo "=================================="
echo "STAD PROTOCOL - PROJECT CONTEXT"
echo "=================================="
echo ""

# Get current directory
CURRENT_DIR=$(pwd)
PROJECT_NAME=$(basename "$CURRENT_DIR")

# Check if it's a git repository
if git rev-parse --is-inside-work-tree &>/dev/null; then
    IS_GIT_REPO="true"
    GIT_REMOTE=$(git config --get remote.origin.url 2>/dev/null || echo "No remote configured")
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "No branch")
    
    # Extract GitHub project board URL if it's a GitHub repo
    if [[ $GIT_REMOTE == *"github.com"* ]]; then
        # Convert git URL to project board URL
        GITHUB_URL=$(echo "$GIT_REMOTE" | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
        GITHUB_BOARD="${GITHUB_URL}/projects"
    else
        GITHUB_BOARD="Not a GitHub repository"
    fi
else
    IS_GIT_REPO="false"
    GIT_REMOTE="Not a git repository"
    GIT_BRANCH="N/A"
    GITHUB_BOARD="N/A"
fi

echo "### Current Project Information"
echo "- **Project Root:** $CURRENT_DIR"
echo "- **Project Name:** $PROJECT_NAME"
echo "- **Git Repository:** $GIT_REMOTE"
echo "- **Current Branch:** $GIT_BRANCH"
echo "- **GitHub Board:** $GITHUB_BOARD"
echo ""

echo "### Project-Specific Paths"
echo "- **Project Docs:** $CURRENT_DIR/docs/"
echo "- **Project Management:** $CURRENT_DIR/Project_Management/"
echo "- **Project Specs:** $CURRENT_DIR/Project_Management/Specs/"
echo "- **Project Archive:** $CURRENT_DIR/Archive/"

# Check which paths actually exist
echo ""
echo "### Path Verification"
[[ -d "$CURRENT_DIR/docs" ]] && echo "✓ /docs exists" || echo "✗ /docs not found"
[[ -d "$CURRENT_DIR/Project_Management" ]] && echo "✓ /Project_Management exists" || echo "✗ /Project_Management not found"
[[ -d "$CURRENT_DIR/src" ]] && echo "✓ /src exists" || echo "✗ /src not found"
[[ -d "$CURRENT_DIR/tests" ]] && echo "✓ /tests exists" || echo "✗ /tests not found"
[[ -d "$CURRENT_DIR/Archive" ]] && echo "✓ /Archive exists" || echo "✗ /Archive not found"

echo ""
echo "### Dev-Agency Central System"
echo "- **Agents:** /home/hd/Desktop/LAB/Dev-Agency/Agents/"
echo "- **Templates:** /home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/"
echo "- **Standards:** /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/"
echo "- **Recipes:** /home/hd/Desktop/LAB/Dev-Agency/recipes/"

echo ""
echo "=================================="
echo "Context detection complete"
echo "=================================="