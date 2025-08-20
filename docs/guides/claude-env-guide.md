---
title: CLAUDE.env Configuration Guide
description: Complete guide to using CLAUDE.env for project configuration
type: guide
category: configuration
tags: [claude-env, configuration, project-setup, environment-variables]
created: 2025-08-17
updated: 2025-08-17
version: 1.0
status: stable
---

# CLAUDE.env Configuration Guide

## Overview

CLAUDE.env is a dotenv-style configuration file that provides project-specific context to Claude, ensuring accurate and consistent development across all sessions. Instead of running detection commands repeatedly, Claude reads your project configuration from this file.

## Why CLAUDE.env?

### Before (Dynamic Detection)
- Ran git commands every session
- Could fail with parsing errors
- Inconsistent project information
- No place to store project-specific commands
- Sprint tracking was manual

### After (CLAUDE.env)
- ✅ Instant project context loading
- ✅ User-defined accurate values
- ✅ Project-specific commands stored
- ✅ Sprint progress tracking
- ✅ Team and quality settings

## Quick Start

### Option 1: Interactive Setup (Recommended)
```bash
# Run the setup wizard
/home/hd/Desktop/LAB/Dev-Agency/scripts/setup-claude-env.sh
```

### Option 2: Manual Setup
```bash
# Copy template
cp /home/hd/Desktop/LAB/Dev-Agency/TEMPLATE_PACKAGE/CLAUDE.env.example ./CLAUDE.env

# Edit with your project details
nano CLAUDE.env

# Add to .gitignore
echo "CLAUDE.env" >> .gitignore
```

## Configuration Sections

### 1. Project Identity
```bash
PROJECT_NAME="My Awesome App"
PROJECT_TYPE="Web App"  # Web App|CLI Tool|Library|Service|API
PRIMARY_LANGUAGE="TypeScript"
PROJECT_STATUS="Active Development"  # Planning|Active Development|Maintenance|Production
```

### 2. Git & GitHub
```bash
GIT_REPO_URL="https://github.com/username/repo"
GITHUB_PROJECT_BOARD="https://github.com/username/repo/projects/1"
GITHUB_OWNER="username"
GITHUB_REPO="repo-name"
CURRENT_BRANCH="main"
ACTIVE_SPRINT="Sprint_3"  # Update as you progress!
```

### 3. Development Commands
```bash
# Claude will use these exact commands
TEST_COMMAND="npm test"
BUILD_COMMAND="npm run build"
LINT_COMMAND="npm run lint"
START_COMMAND="npm start"
DEV_COMMAND="npm run dev"
```

### 4. STAD Protocol Settings
```bash
USE_STAD_PROTOCOL="true"
SPRINT_DURATION_WEEKS="2"
SPRINT_POINT_TARGET="30"
MAX_STORY_POINTS_PER_TICKET="5"
STAGE2_MAX_AGENTS="5"  # For parallel execution
```

### 5. Quality Requirements
```bash
MIN_TEST_COVERAGE="80"
ENFORCE_LINTING="true"
REQUIRE_CODE_REVIEW="true"
REQUIRE_SECURITY_REVIEW="false"
```

## How Claude Uses CLAUDE.env

### At Session Start
```bash
# Claude checks for CLAUDE.env
if [ -f "./CLAUDE.env" ]; then
    source ./CLAUDE.env
    echo "✅ Loaded: $PROJECT_NAME"
    echo "Sprint: $ACTIVE_SPRINT"
fi
```

### During Development
- **Testing**: Runs `$TEST_COMMAND` exactly as defined
- **Building**: Uses `$BUILD_COMMAND` for builds
- **Sprint Planning**: Respects `$SPRINT_POINT_TARGET`
- **Quality Gates**: Enforces `$MIN_TEST_COVERAGE`

### For Sprint Management
- Reads `$ACTIVE_SPRINT` to know current sprint
- Uses `$SPRINT_DURATION_WEEKS` for planning
- Limits tickets to `$MAX_STORY_POINTS_PER_TICKET`

## Important Variables to Update

### Frequently Updated
- `ACTIVE_SPRINT` - Update when starting new sprint
- `CURRENT_BRANCH` - Update when switching branches
- `PROJECT_STATUS` - Update as project evolves

### Occasionally Updated
- Development commands when toolchain changes
- Quality requirements as project matures
- Team size and velocity targets

## Best Practices

### 1. Security
```bash
# ALWAYS add to .gitignore
echo "CLAUDE.env" >> .gitignore

# Never commit tokens or secrets
# Use separate .env for sensitive data
```

### 2. Sprint Management
```bash
# Update sprint number when starting new sprint
ACTIVE_SPRINT="Sprint_4"  # Was Sprint_3

# Track sprint dates in comments
# Sprint 4: 08-17-2025 to 08-31-2025
```

### 3. Command Accuracy
```bash
# Test commands before adding
npm test  # Works? Then add to CLAUDE.env

# Include all necessary flags
TEST_COMMAND="npm test -- --coverage"
BUILD_COMMAND="npm run build:production"
```

### 4. Project Evolution
```bash
# Update status as project progresses
PROJECT_STATUS="Planning"           # Initial
PROJECT_STATUS="Active Development" # Building
PROJECT_STATUS="Maintenance"        # Stable
PROJECT_STATUS="Production"         # Deployed
```

## Troubleshooting

### CLAUDE.env Not Loading
```bash
# Check file exists
ls -la CLAUDE.env

# Check file permissions
chmod 644 CLAUDE.env

# Test loading manually
source ./CLAUDE.env
echo $PROJECT_NAME
```

### Variables Not Working
```bash
# Check for typos in variable names
grep "PROJECT_NAME" CLAUDE.env

# Ensure no spaces around =
CORRECT: PROJECT_NAME="My App"
WRONG:   PROJECT_NAME = "My App"
```

### Commands Failing
```bash
# Test command manually first
eval "$TEST_COMMAND"

# Check for correct escaping
COMPLEX_COMMAND="npm test -- --watch --coverage"
```

## Migration from Old System

If you have an existing project without CLAUDE.env:

1. **Run Detection Once**
```bash
git config --get remote.origin.url
pwd
git branch --show-current
```

2. **Create CLAUDE.env with Detected Values**
```bash
/home/hd/Desktop/LAB/Dev-Agency/scripts/setup-claude-env.sh
# Enter detected values when prompted
```

3. **Verify Configuration**
```bash
source ./CLAUDE.env
echo "Project: $PROJECT_NAME"
echo "Repository: $GIT_REPO_URL"
```

## Complete Example

Here's a real CLAUDE.env for a TypeScript web app:

```bash
# Project: Task Manager Pro
# Created: 08-17-2025

# === PROJECT IDENTITY ===
PROJECT_NAME="Task Manager Pro"
PROJECT_TYPE="Web App"
PRIMARY_LANGUAGE="TypeScript"
PROJECT_STATUS="Active Development"

# === GIT & GITHUB ===
GIT_REPO_URL="https://github.com/johndoe/task-manager-pro"
GITHUB_PROJECT_BOARD="https://github.com/johndoe/task-manager-pro/projects/1"
GITHUB_OWNER="johndoe"
GITHUB_REPO="task-manager-pro"
CURRENT_BRANCH="feature/user-auth"
ACTIVE_SPRINT="Sprint_2"

# === DEVELOPMENT COMMANDS ===
PACKAGE_MANAGER="npm"
INSTALL_COMMAND="npm ci"
TEST_COMMAND="npm test -- --coverage"
BUILD_COMMAND="npm run build"
LINT_COMMAND="npm run lint:fix"
TYPECHECK_COMMAND="npm run type-check"
START_COMMAND="npm start"
DEV_COMMAND="npm run dev"

# === TEAM & WORKFLOW ===
TEAM_SIZE="1"
SPRINT_DURATION_WEEKS="2"
SPRINT_POINT_TARGET="30"
MAX_STORY_POINTS_PER_TICKET="5"

# === QUALITY REQUIREMENTS ===
MIN_TEST_COVERAGE="85"
ENFORCE_LINTING="true"
REQUIRE_CODE_REVIEW="true"

# === TECHNOLOGY STACK ===
FRONTEND_FRAMEWORK="React"
BACKEND_FRAMEWORK="Express"
DATABASE_TYPE="PostgreSQL"
CLOUD_PROVIDER="AWS"
CI_CD_PLATFORM="GitHub Actions"
```

## Integration with STAD Protocol

CLAUDE.env fully supports STAD Protocol workflows:

### Stage 1: Sprint Preparation
- Uses `$SPRINT_POINT_TARGET` for planning
- Respects `$MAX_STORY_POINTS_PER_TICKET`

### Stage 2: Sprint Execution
- Runs exact commands from env file
- Uses `$STAGE2_MAX_AGENTS` for parallelization

### Stage 3: Validation
- Enforces `$MIN_TEST_COVERAGE`
- Checks `$REQUIRE_CODE_REVIEW` setting

### Stage 4: Retrospective
- Updates `$ACTIVE_SPRINT` for next sprint
- Reviews velocity against targets

## Next Steps

1. Create CLAUDE.env for your project
2. Update `ACTIVE_SPRINT` as you progress
3. Keep commands current with your toolchain
4. Use project-specific settings to guide Claude

---

*CLAUDE.env brings consistency and accuracy to every Claude session in your project.*