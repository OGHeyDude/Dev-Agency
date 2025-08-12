#!/bin/bash
# STAD Protocol v4.1 - Git Worktree Manager
# Manages parallel execution environments for conflict-free development

COMMAND="${1:-help}"
BATCH_NUM="${2:-1}"
FEATURE_BRANCH="${3:-feature/agent-027}"

WORKTREE_BASE="/home/hd/Desktop/LAB"
PROJECT_NAME="Dev-Agency"

case "$COMMAND" in
  setup)
    echo "🌳 Setting up Git Worktrees for parallel execution..."
    
    # Create feature branch if it doesn't exist
    git checkout -b "$FEATURE_BRANCH" 2>/dev/null || git checkout "$FEATURE_BRANCH"
    
    # Create worktrees for parallel batches
    for i in 1 2 3; do
      WORKTREE_PATH="$WORKTREE_BASE/${PROJECT_NAME}-batch-$i"
      if [ ! -d "$WORKTREE_PATH" ]; then
        echo "  Creating worktree: batch-$i"
        git worktree add "$WORKTREE_PATH" "$FEATURE_BRANCH"
      else
        echo "  Worktree batch-$i already exists"
      fi
    done
    
    echo ""
    echo "✅ Worktrees ready for parallel execution:"
    git worktree list
    ;;
    
  work)
    WORKTREE_PATH="$WORKTREE_BASE/${PROJECT_NAME}-batch-$BATCH_NUM"
    echo "📂 Switching to worktree batch-$BATCH_NUM..."
    echo "  Path: $WORKTREE_PATH"
    echo ""
    echo "To work in this batch, run:"
    echo "  cd $WORKTREE_PATH"
    echo ""
    echo "Remember to use semantic commits:"
    echo "  git commit -m \"feat(module): AGENT-027 description | Batch:$BATCH_NUM/3 | Deps:[] | Decision:xxx\""
    ;;
    
  merge)
    echo "🔀 Merging batch-$BATCH_NUM back to main repository..."
    WORKTREE_PATH="$WORKTREE_BASE/${PROJECT_NAME}-batch-$BATCH_NUM"
    
    # Get commits from worktree
    cd "$WORKTREE_PATH"
    COMMITS=$(git log --oneline "$FEATURE_BRANCH" --not master | wc -l)
    
    # Return to main repo and merge
    cd "/home/hd/Desktop/LAB/$PROJECT_NAME"
    git checkout "$FEATURE_BRANCH"
    git merge --no-ff "batch-$BATCH_NUM/$FEATURE_BRANCH" -m "merge: Batch $BATCH_NUM complete ($COMMITS commits)"
    
    # Tag the batch completion
    git tag -a "sprint-7-batch-$BATCH_NUM-complete" -m "Batch $BATCH_NUM completed with $COMMITS commits"
    echo "✅ Batch $BATCH_NUM merged and tagged"
    ;;
    
  clean)
    echo "🧹 Cleaning up worktrees..."
    for i in 1 2 3; do
      WORKTREE_PATH="$WORKTREE_BASE/${PROJECT_NAME}-batch-$i"
      if [ -d "$WORKTREE_PATH" ]; then
        echo "  Removing worktree: batch-$i"
        git worktree remove "$WORKTREE_PATH" --force 2>/dev/null || true
      fi
    done
    git worktree prune
    echo "✅ Worktrees cleaned up"
    ;;
    
  status)
    echo "📊 Worktree Status:"
    git worktree list
    echo ""
    echo "📝 Commits per batch:"
    for i in 1 2 3; do
      WORKTREE_PATH="$WORKTREE_BASE/${PROJECT_NAME}-batch-$i"
      if [ -d "$WORKTREE_PATH" ]; then
        cd "$WORKTREE_PATH"
        COUNT=$(git log --oneline "$FEATURE_BRANCH" --not master 2>/dev/null | wc -l)
        echo "  Batch $i: $COUNT commits"
      fi
    done
    cd "/home/hd/Desktop/LAB/$PROJECT_NAME"
    ;;
    
  *)
    echo "STAD Worktree Manager v4.1"
    echo ""
    echo "Usage: $0 [command] [batch_num] [feature_branch]"
    echo ""
    echo "Commands:"
    echo "  setup           - Create worktrees for parallel execution"
    echo "  work [n]        - Show how to work in batch n"
    echo "  merge [n]       - Merge batch n back to main repo"
    echo "  clean           - Remove all worktrees"
    echo "  status          - Show worktree status"
    echo ""
    echo "Example:"
    echo "  $0 setup                    # Set up worktrees"
    echo "  $0 work 1                   # Work in batch 1"
    echo "  $0 merge 1                  # Merge batch 1"
    echo "  $0 clean                    # Clean up worktrees"
    ;;
esac