# Dev-Agency Scripts Directory

This directory contains automation scripts for the STAD Protocol and project management.

## 🚀 Dynamic State Detection System

### Overview
The dynamic detection system eliminates manual updates of sprint/phase information in CLAUDE.env files. Instead, it automatically detects the current development state from PROJECT_PLAN.md.

### Core Scripts

## 1. `detect-project-state.sh`
**Purpose:** Dynamically detect current sprint, epic, phase, and ticket from PROJECT_PLAN.md

### Usage
```bash
# Display all current values
./detect-project-state.sh --display

# Get specific value
./detect-project-state.sh --sprint    # Returns: "Sprint 3"
./detect-project-state.sh --epic      # Returns: "EPIC-006"
./detect-project-state.sh --phase     # Returns: "Phase 6"
./detect-project-state.sh --ticket    # Returns: "MCP-041"
./detect-project-state.sh --velocity  # Returns: "13/30"

# Export as environment variables
source ./detect-project-state.sh --export
echo $ACTIVE_SPRINT   # Sprint 3
echo $CURRENT_EPIC    # EPIC-006
echo $CURRENT_PHASE   # Phase 6
echo $CURRENT_TICKET  # MCP-041
```

### Exported Variables
- `ACTIVE_SPRINT` - Current sprint marked as IN_PROGRESS
- `CURRENT_EPIC` - Epic marked as "In Progress"
- `CURRENT_PHASE` - Phase with 🚧 emoji
- `CURRENT_TICKET` - Ticket marked as IN_PROGRESS
- `SPRINT_VELOCITY` - Story points completed/total

### Detection Logic
1. **Primary:** Searches PROJECT_PLAN.md for status markers
2. **Fallback 1:** Checks for 🚧 emoji in sprint/phase titles
3. **Fallback 2:** Lists Sprint_Execution directories
4. **Auto-creates:** Sprint directories if they don't exist

---

## 2. `sprint-transition.sh`
**Purpose:** Automate sprint transitions without manual CLAUDE.env updates

### Usage
```bash
# Show current state
./sprint-transition.sh state

# Complete current sprint
./sprint-transition.sh complete Sprint_3

# Create new sprint
./sprint-transition.sh create Sprint_4 "Implement auth system" "2 weeks" 30

# Transition (complete current + create new)
./sprint-transition.sh transition Sprint_3 Sprint_4 "Implement auth" "2 weeks" 30

# Auto-detect current and transition
./sprint-transition.sh auto Sprint_4 "Implement auth system"

# Update ticket status
./sprint-transition.sh ticket MCP-041 DONE
```

### What It Does
- Updates PROJECT_PLAN.md status markers
- Archives completed sprint directories
- Creates new sprint directories
- Generates retrospective templates
- Updates GitHub Project Board (if gh CLI available)

---

## 3. Other Scripts

### `setup-project-boards.sh`
Sets up GitHub Project boards with STAD Protocol columns and fields.

### `manage-project-boards.sh`
Manages GitHub Project board items and transitions.

### `add-stad-tickets-detailed.sh`
Bulk adds tickets to GitHub Project board with STAD metadata.

### `review-dashboard.sh`
Generates a review dashboard for Stage 3 validation.

### `stad-worktree.sh`
Manages Git worktrees for parallel Stage 2 execution.

### `sprint-preflight.sh`
Pre-flight checks before starting a new sprint.

### `setup-claude-env.sh`
Initial setup script for new projects using STAD Protocol.

### `detect-project-context.sh`
Detects project type and configuration for initial setup.

---

## 🔧 Integration with CLAUDE.md

### In Project CLAUDE.md Files
```bash
# Load static configuration
if [ -f "./CLAUDE.env" ]; then
    source ./CLAUDE.env
fi

# Detect dynamic state
if [ -f "./scripts/detect-project-state.sh" ]; then
    source ./scripts/detect-project-state.sh --export
    echo "✅ Dynamic state loaded:"
    echo "   Sprint: $ACTIVE_SPRINT"
    echo "   Epic: $CURRENT_EPIC"
    echo "   Ticket: $CURRENT_TICKET"
fi
```

### For External Projects (like MCP_Tools)
```bash
# Use Dev-Agency's detection script
DETECT_SCRIPT="/home/hd/Desktop/LAB/Dev-Agency/scripts/detect-project-state.sh"
if [ -f "$DETECT_SCRIPT" ]; then
    source "$DETECT_SCRIPT" --export
fi
```

---

## 🐛 Troubleshooting

### Dynamic Values Not Updating?

1. **Check PROJECT_PLAN.md markers:**
   ```bash
   grep "Status.*IN_PROGRESS" ./Project_Management/PROJECT_PLAN.md
   grep "🚧" ./Project_Management/PROJECT_PLAN.md
   ```

2. **Ensure only ONE sprint is IN_PROGRESS:**
   - Multiple IN_PROGRESS sprints will confuse detection
   - Use `sprint-transition.sh complete` to close old sprints

3. **Test detection directly:**
   ```bash
   ./scripts/detect-project-state.sh --display
   ```

4. **Check fallback directories:**
   ```bash
   ls -la ./Project_Management/Sprint_Execution/
   ```

5. **Verify PROJECT_PLAN.md location:**
   - Should be at `./Project_Management/PROJECT_PLAN.md`
   - Script also checks `./PROJECT_PLAN.md` as fallback

### Common Issues

**Issue:** Sprint shows as "Unknown"
- **Fix:** Ensure PROJECT_PLAN.md exists and has proper status markers

**Issue:** Wrong sprint detected
- **Fix:** Check for multiple IN_PROGRESS markers, clean up old sprints

**Issue:** Directories not created
- **Fix:** Check write permissions in Project_Management/

**Issue:** Variables not exported
- **Fix:** Use `source` command, not just execute: `source ./detect-project-state.sh --export`

---

## 📋 Best Practices

1. **Never manually edit ACTIVE_SPRINT in CLAUDE.env** - It's not there anymore!
2. **Use sprint-transition.sh** for all sprint changes
3. **Keep PROJECT_PLAN.md as single source of truth**
4. **One sprint IN_PROGRESS at a time**
5. **Archive completed sprints** to keep structure clean

---

## 🔄 Workflow Example

```bash
# Start of day - check state
cd /project
./scripts/detect-project-state.sh --display

# Complete a ticket
./scripts/sprint-transition.sh ticket MCP-041 DONE

# Sprint done, transition to next
./scripts/sprint-transition.sh auto Sprint_4 "Build authentication"

# Verify new state
./scripts/detect-project-state.sh --display
```

---

## 📚 Related Documentation

- [STAD Protocol North Star](/docs/architecture/STAD_PROTOCOL_NORTH_STAR.md)
- [Sprint Management Guide](/docs/guides/sprint_management.md)
- [Dev-Agency CLAUDE.md](/CLAUDE.md)

---

*Last Updated: 08-17-2025*
*Version: 1.0*