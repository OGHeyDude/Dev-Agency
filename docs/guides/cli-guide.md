---
title: Enhanced CLI and Interactive Mode Guide
description: Comprehensive guide for using the enhanced CLI with interactive REPL mode
type: guide
category: tools
tags: [cli, repl, interactive, productivity, commands]
created: 2025-08-10
updated: 2025-08-10
---

# Enhanced CLI and Interactive Mode Guide

This guide covers both traditional CLI usage and the powerful new interactive REPL mode for maximum command-line productivity.

## Table of Contents

- [Quick Start](#quick-start)
- [Traditional CLI Commands](#traditional-cli-commands)
- [Interactive REPL Mode](#interactive-repl-mode)
- [Command History and Search](#command-history-and-search)
- [Tab Completion](#tab-completion)
- [Session Management](#session-management)
- [Context-Aware Suggestions](#context-aware-suggestions)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Advanced Features](#advanced-features)
- [Productivity Tips](#productivity-tips)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Traditional CLI Usage
```bash
# Run a single command
dev-agency plan --ticket FEATURE-001

# Check project status
dev-agency status

# Execute a workflow
dev-agency workflow --name sprint-planning
```

### Interactive Mode
```bash
# Start interactive REPL mode
dev-agency interactive

# Or use the shorthand
dev-agency -i
```

## Traditional CLI Commands

### Core Commands

#### Project Management
```bash
# Initialize new project
dev-agency init --name "my-project" --type web-app

# Check project status
dev-agency status

# List available tickets
dev-agency tickets list

# Create new ticket
dev-agency tickets create --title "Add user authentication" --type feature
```

#### Agent Invocation
```bash
# Run architect agent
dev-agency agent architect --context "Design user management system"

# Run coder agent with specific files
dev-agency agent coder --files "src/auth/*.ts" --task "implement JWT validation"

# Run tester agent
dev-agency agent tester --test-type unit --coverage 90
```

#### Workflow Execution
```bash
# Execute sprint planning
dev-agency workflow sprint-planning --sprint 4

# Run full development cycle
dev-agency workflow full-cycle --ticket FEATURE-001

# Execute documentation update
dev-agency workflow doc-update --scope "user-guides"
```

#### Git Integration
```bash
# Smart commit with analysis
dev-agency git commit --analyze

# Create pull request
dev-agency git pr --title "Feature: User authentication" --reviewers "team-lead"

# Branch management
dev-agency git branch --create feature/auth --from develop
```

## Interactive REPL Mode

The interactive REPL (Read-Eval-Print Loop) mode provides a powerful shell-like experience with enhanced features.

### Starting Interactive Mode

```bash
# Start with default settings
dev-agency interactive

# Start with specific project context
dev-agency interactive --project /path/to/project

# Start with debug mode
dev-agency interactive --debug

# Start with specific agent context
dev-agency interactive --agent architect
```

### Basic REPL Usage

Once in interactive mode, you can run commands without the `dev-agency` prefix:

```bash
dev-agency> status
✓ Project: vcs-integration
✓ Current branch: feature/cli-enhancement
✓ Active tickets: 3
✓ Agent context: ready

dev-agency> tickets list
┌──────────────┬─────────────────────────┬──────────┬────────────┐
│ Ticket ID    │ Title                   │ Status   │ Assignee   │
├──────────────┼─────────────────────────┼──────────┼────────────┤
│ FEATURE-001  │ Enhanced CLI            │ IN_PROG  │ architect  │
│ FEATURE-002  │ Interactive REPL        │ TODO     │ coder      │
│ BUG-001      │ Memory leak in parser   │ REVIEW   │ tester     │
└──────────────┴─────────────────────────┴──────────┴────────────┘

dev-agency> agent architect "Design CLI architecture"
🤖 Architect Agent activated...
📋 Analyzing CLI architecture requirements...
✅ Architecture plan generated
```

### Multi-line Commands

For complex commands, use `\` for line continuation:

```bash
dev-agency> agent coder \
    --files "src/cli/*.ts" \
    --task "implement interactive mode" \
    --context "follow SOLID principles"
```

Or use `"""` for multi-line strings:

```bash
dev-agency> agent architect """
Design a scalable CLI architecture that supports:
1. Interactive REPL mode
2. Command history and completion
3. Plugin system for extensions
4. Context-aware suggestions
"""
```

## Command History and Search

### History Navigation
- `↑` (Up Arrow): Previous command
- `↓` (Down Arrow): Next command
- `Ctrl+P`: Previous command (alternative)
- `Ctrl+N`: Next command (alternative)

### Reverse History Search
```bash
# Press Ctrl+R to enter reverse search mode
(reverse-i-search)`agent`: agent architect "design system"

# Keep pressing Ctrl+R to cycle through matches
(reverse-i-search)`agent`: agent coder --files "*.ts"

# Press Enter to execute, Esc to cancel
```

### History Commands
```bash
# Show command history
dev-agency> history

# Show last 20 commands
dev-agency> history 20

# Search history for specific term
dev-agency> history search "agent architect"

# Clear history
dev-agency> history clear
```

### History Expansion
```bash
# Re-run last command
dev-agency> !!

# Re-run command #42 from history
dev-agency> !42

# Re-run last command starting with 'agent'
dev-agency> !agent

# Substitute in last command
dev-agency> ^architect^coder
```

## Tab Completion

### Command Completion
```bash
dev-agency> ag<TAB>
agent

dev-agency> agent <TAB>
architect    coder       documenter  integration
performance  security    tester      memory-sync

dev-agency> agent ar<TAB>
architect

dev-agency> tickets <TAB>
create    list      show      update    close
```

### File and Path Completion
```bash
dev-agency> agent coder --files src/<TAB>
src/auth/     src/cli/      src/core/     src/utils/

dev-agency> workflow --config config/<TAB>
config/dev.json    config/prod.json   config/test.json
```

### Context-Aware Completion
```bash
# After typing ticket ID, suggests relevant actions
dev-agency> ticket FEATURE-001 <TAB>
show      update    close     assign    comment

# Agent suggestions based on current context
dev-agency> agent <TAB>
architect    # (suggested based on planning phase)
coder        # (available)
tester       # (available)
```

### Custom Completions
```bash
# Enable custom completion for your project
dev-agency> completion install

# Add custom completions
dev-agency> completion add --command "deploy" --options "staging production"
```

## Session Management

### Session Operations
```bash
# Save current session
dev-agency> session save my-session

# List saved sessions
dev-agency> session list
┌─────────────────┬─────────────────────┬──────────┐
│ Session Name    │ Created             │ Commands │
├─────────────────┼─────────────────────┼──────────┤
│ my-session      │ 2025-08-10 09:30    │ 15       │
│ sprint-4-work   │ 2025-08-09 14:20    │ 28       │
│ bug-hunt        │ 2025-08-08 16:45    │ 12       │
└─────────────────┴─────────────────────┴──────────┘

# Load a session
dev-agency> session load sprint-4-work

# Replay session commands
dev-agency> session replay my-session

# Export session to script
dev-agency> session export my-session --format bash --output session.sh
```

### Session Context
```bash
# Show current session context
dev-agency> context show
📂 Project: vcs-integration
🌿 Branch: feature/cli-enhancement
🎯 Active Ticket: FEATURE-001
🤖 Agent Context: architect
📝 Session: my-session (15 commands)

# Set session context
dev-agency> context set --ticket FEATURE-002 --agent coder

# Clear context
dev-agency> context clear
```

## Context-Aware Suggestions

### Smart Suggestions
The CLI provides intelligent suggestions based on current context:

```bash
# When in a Git repository
dev-agency> <TAB>
git          # Git operations available
status       # Show project status
agent        # Suggest architect for uncommitted changes

# After running tests
dev-agency> <TAB>
agent tester    # Suggest running tester agent
git commit      # Suggest committing if tests pass
report          # Generate test report

# When documentation is outdated
dev-agency> <TAB>
agent documenter  # Suggest updating docs
workflow doc-update  # Run doc workflow
```

### Project-Aware Features
```bash
# Auto-detect project type and suggest relevant commands
# For Node.js projects:
dev-agency> <TAB>
npm          package      jest         eslint

# For Python projects:
dev-agency> <TAB>
pip          pytest       black        mypy

# For Go projects:
dev-agency> <TAB>
go           dep          golint       gofmt
```

## Keyboard Shortcuts

### Navigation and Editing
- `Ctrl+A`: Move to beginning of line
- `Ctrl+E`: Move to end of line
- `Ctrl+B`: Move backward one character
- `Ctrl+F`: Move forward one character
- `Alt+B`: Move backward one word
- `Alt+F`: Move forward one word

### Text Manipulation
- `Ctrl+K`: Kill (delete) from cursor to end of line
- `Ctrl+U`: Kill from cursor to beginning of line
- `Ctrl+W`: Kill previous word
- `Alt+D`: Kill next word
- `Ctrl+Y`: Yank (paste) killed text
- `Ctrl+T`: Transpose characters
- `Alt+T`: Transpose words

### Special Functions
- `Ctrl+C`: Interrupt current command
- `Ctrl+D`: Exit REPL (on empty line)
- `Ctrl+L`: Clear screen
- `Ctrl+R`: Reverse history search
- `Ctrl+S`: Forward history search
- `Tab`: Command/path completion
- `Alt+?`: Show available completions

### Custom Shortcuts
```bash
# Define custom shortcuts
dev-agency> shortcut define --key "Ctrl+G" --command "git status"
dev-agency> shortcut define --key "Alt+A" --command "agent architect"

# List custom shortcuts
dev-agency> shortcut list

# Remove shortcut
dev-agency> shortcut remove "Ctrl+G"
```

## Advanced Features

### Command Aliasing
```bash
# Create command aliases
dev-agency> alias aa "agent architect"
dev-agency> alias ac "agent coder"
dev-agency> alias tl "tickets list"

# Use aliases
dev-agency> aa "design authentication system"
dev-agency> ac --files "src/auth/*.ts" --task "implement JWT"

# List aliases
dev-agency> alias list

# Remove alias
dev-agency> unalias aa
```

### Environment Variables
```bash
# Set environment variables for session
dev-agency> set PROJECT_NAME="vcs-integration"
dev-agency> set DEFAULT_AGENT="architect"
dev-agency> set DEBUG_MODE=true

# Use environment variables
dev-agency> echo $PROJECT_NAME
dev-agency> agent $DEFAULT_AGENT "analyze current state"

# List environment variables
dev-agency> env

# Unset variable
dev-agency> unset DEBUG_MODE
```

### Piping and Redirection
```bash
# Pipe command output to another command
dev-agency> tickets list | grep "IN_PROGRESS"

# Redirect output to file
dev-agency> status > project-status.txt

# Append output to file
dev-agency> agent architect "system analysis" >> architecture-notes.md

# Use output as input to next command
dev-agency> tickets list --json | jq '.[] | select(.status=="TODO")'
```

### Background Jobs
```bash
# Run command in background
dev-agency> agent performance --analyze-full &
[1] 12345 - performance analysis started

# List background jobs
dev-agency> jobs
[1] Running   agent performance --analyze-full
[2] Done      workflow doc-update

# Bring job to foreground
dev-agency> fg 1

# Kill background job
dev-agency> kill %1
```

### Batch Operations
```bash
# Execute multiple commands
dev-agency> batch {
    git status;
    tickets list;
    agent architect "review current state";
}

# Execute commands from file
dev-agency> batch --file commands.txt

# Conditional execution
dev-agency> git status && git commit -m "update" || echo "Nothing to commit"
```

## Productivity Tips

### 1. Use Aliases for Frequent Commands
```bash
# Set up common aliases
alias s="status"
alias tl="tickets list"
alias aa="agent architect"
alias ac="agent coder"
alias gr="git status"
```

### 2. Leverage Tab Completion
- Always use `Tab` to complete commands and paths
- Use `Tab Tab` to see all available options
- Set up custom completions for project-specific commands

### 3. Master History Search
- Use `Ctrl+R` frequently to find previous commands
- Use `!!` to repeat last command
- Use `!pattern` to find and execute commands by pattern

### 4. Create Session Templates
```bash
# Save frequently used command sequences as sessions
session save "bug-investigation"
session save "feature-development"
session save "release-preparation"
```

### 5. Use Context Awareness
- Let the CLI suggest commands based on your current state
- Set up environment variables for common values
- Use project-specific configurations

### 6. Combine with External Tools
```bash
# Use with jq for JSON processing
tickets list --json | jq '.[] | select(.priority=="high")'

# Use with grep for filtering
agent architect "system review" | grep -E "(warning|error)"

# Use with external editors
agent coder --task "refactor auth" > refactor-plan.md && code refactor-plan.md
```

### 7. Monitor Background Operations
```bash
# Start long-running operations in background
agent performance --full-analysis &

# Check progress
jobs
ps aux | grep "dev-agency"
```

## Troubleshooting

### Common Issues

#### Command Not Found
```bash
# Check if command exists
dev-agency> which agent
/usr/local/bin/dev-agency

# Update PATH if necessary
export PATH=$PATH:/usr/local/bin

# Reinstall if needed
dev-agency update --reinstall
```

#### Tab Completion Not Working
```bash
# Install completion scripts
dev-agency completion install

# Reload shell
source ~/.bashrc

# Check completion status
dev-agency completion status
```

#### History Not Saving
```bash
# Check history file permissions
ls -la ~/.dev-agency/history

# Set proper permissions
chmod 600 ~/.dev-agency/history

# Check history settings
dev-agency config get history.enabled
```

#### Session Restore Fails
```bash
# List available sessions
session list

# Check session file integrity
session validate my-session

# Repair corrupted session
session repair my-session
```

### Performance Issues

#### Slow Command Completion
```bash
# Disable expensive completions
completion config --disable-expensive

# Clear completion cache
completion cache clear

# Update completion database
completion update
```

#### Memory Usage
```bash
# Check memory usage
dev-agency debug memory

# Clear command history
history clear

# Restart with clean state
exit
dev-agency interactive --clean
```

### Debug Mode

#### Enable Debugging
```bash
# Start with debug mode
dev-agency interactive --debug

# Enable debugging in session
dev-agency> debug on

# Set debug level
dev-agency> debug level verbose
```

#### Debug Output
```bash
# Show internal state
debug state

# Show command parsing
debug trace

# Show completion logic
debug completion
```

### Configuration Issues

#### Reset Configuration
```bash
# Reset to defaults
dev-agency config reset

# Backup current config
dev-agency config backup

# Restore from backup
dev-agency config restore backup-2025-08-10
```

#### Configuration Locations
- Global config: `~/.dev-agency/config.json`
- Project config: `.dev-agency/config.json`
- Session config: `~/.dev-agency/sessions/`

### Getting Help

#### Built-in Help
```bash
# General help
dev-agency> help

# Command-specific help
dev-agency> help agent
dev-agency> help workflow

# Show keyboard shortcuts
dev-agency> help shortcuts

# Show examples
dev-agency> help examples
```

#### Online Resources
- Documentation: `/home/hd/Desktop/LAB/Dev-Agency/docs/`
- Issue tracker: Project repository issues
- Community forum: Development team Slack

---

## Summary

The enhanced CLI with interactive REPL mode provides a powerful, productive environment for development workflow management. Key benefits:

- **Interactive REPL**: Shell-like experience with advanced features
- **Smart Completion**: Context-aware suggestions and tab completion
- **Command History**: Powerful search and replay capabilities
- **Session Management**: Save, load, and replay command sequences
- **Background Jobs**: Run long operations without blocking
- **Customization**: Aliases, shortcuts, and environment variables

Master these features to maximize your command-line productivity and streamline your development workflow.