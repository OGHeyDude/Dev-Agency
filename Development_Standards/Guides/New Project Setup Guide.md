---
title: New Project Setup Sprint - Executable Guide for Claude
description: Step-by-step executable sprint for Claude to set up complete new projects with Dev-Agency integration
type: guide
category: development
tags: [setup, sprint, executable, project-initialization, dev-agency, automation]
created: 2025-08-10
updated: 2025-08-10
version: 2.0
status: stable
---

# New Project Setup Sprint - Executable Guide for Claude

## Sprint Goal
**Set up a complete new project with full Dev-Agency integration, file structure, documentation, MCP tools, and agent system verification.**

## Prerequisites Check
- [ ] Dev-Agency system exists at `/home/hd/Desktop/LAB/Dev-Agency/`
- [ ] Global CLAUDE.md configured with Dev-Agency references
- [ ] Current working directory is the new project root

## Sprint Execution - 6 Phases

**Total Story Points: 13 (Large Sprint)**
**Execution Method: Run each phase sequentially, mark complete before proceeding**

---

### 🎯 PHASE 1: Project Structure Creation (2 Points)
**Status: TODO → IN_PROGRESS**

**Executable Commands:**
```bash
# Create complete project structure
mkdir -p Project_Management/{Specs,Bug_Reports,temp,"Sprint Retrospectives",Archive,Releases}
mkdir -p docs/{features,guides,api,tutorials,integrations,agents,development/{architecture,patterns,testing,deployment}}
mkdir -p src
mkdir -p tests
```

**Verification:**
```bash
# Verify structure creation
ls -la Project_Management/
ls -la docs/
ls -la src/
echo "✅ PHASE 1 COMPLETE - Project structure created"
```

**Mark Status: IN_PROGRESS → CODE_REVIEW**

---

### 🎯 PHASE 2: Core Templates Integration (3 Points)
**Status: CODE_REVIEW → QA_TESTING**

**Executable Commands:**
```bash
# Copy and initialize core templates
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md" "./Project_Management/PROJECT_PLAN.md"
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md" "./Project_Management/Releases/CHANGELOG.md"
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/Release_Notes_Template.md" "./Project_Management/Releases/Release_Notes.md"
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_CLAUDE_TEMPLATE.md" "./CLAUDE.md"
```

**Verification:**
```bash
# Verify template copying
ls -la Project_Management/PROJECT_PLAN.md
ls -la Project_Management/Releases/
ls -la CLAUDE.md
echo "✅ PHASE 2 COMPLETE - Templates copied and ready for customization"
```

**Mark Status: QA_TESTING → DOCUMENTATION**

---

### 🎯 PHASE 3: Project CLAUDE.md Customization (2 Points)
**Status: DOCUMENTATION → READY_FOR_RELEASE**

**Claude Task:** Edit the CLAUDE.md file with project-specific information:

1. **Replace placeholders** in CLAUDE.md:
   - `[PROJECT_NAME]` → Actual project name
   - `[Web Application|CLI Tool|Library|Service]` → Choose appropriate type
   - `[TypeScript|Python|Go|etc.]` → Primary language
   - `[Development|Production]` → Current status

2. **Add project-specific configuration sections**:
   - Development environment requirements
   - Key dependencies and frameworks
   - Build/test/deployment commands

**Verification:**
```bash
# Verify CLAUDE.md customization
head -20 CLAUDE.md
echo "✅ PHASE 3 COMPLETE - CLAUDE.md customized for project"
```

**Mark Status: READY_FOR_RELEASE → DONE**

---

### 🎯 PHASE 4: Documentation Structure & Initial Docs (3 Points)
**Status: TODO → IN_PROGRESS**

**Claude Task:** Create essential documentation files:

1. **README.md (Project Root)**:
```bash
# Create project README.md
cat > README.md << 'EOF'
# [PROJECT_NAME]

[Brief project description]

## Setup
See complete setup instructions in `/docs/development/setup.md`

## Development
This project uses the Dev-Agency centralized system.
- Use `/cmd` to start development sessions
- Follow 5-step process: `/research` → `/plan` → `/build` → `/test` → `/document`

## Quick Start
[Add project-specific quick start commands]

EOF
```

2. **Create key documentation files**:
```bash
# Create essential docs
mkdir -p docs/development
echo "# Setup Guide" > docs/development/setup.md
echo "# Architecture Overview" > docs/development/architecture.md
echo "# API Reference" > docs/api/README.md
echo "# User Guide" > docs/guides/README.md
```

**Verification:**
```bash
ls -la README.md
ls -la docs/development/
ls -la docs/api/
ls -la docs/guides/
echo "✅ PHASE 4 COMPLETE - Documentation structure ready"
```

**Mark Status: IN_PROGRESS → CODE_REVIEW**

---

### 🎯 PHASE 5: MCP Tools Integration & Test Structure (2 Points)
**Status: CODE_REVIEW → QA_TESTING**

**Claude Task:** Set up MCP integration and test framework:

1. **Verify MCP tools availability**:
```bash
# Check MCP tool availability
ls /home/hd/Desktop/LAB/MCP_Tools/ 2>/dev/null && echo "✅ MCP Tools available" || echo "❌ MCP Tools not found"
```

2. **Create test structure**:
```bash
# Create test directories
mkdir -p src/__tests__
mkdir -p tests/{unit,integration,e2e}

# Create test configuration files
echo "# Test Configuration" > tests/README.md
echo "# Testing Strategy" > docs/development/testing.md
```

3. **Git initialization (if needed)**:
```bash
# Initialize git if not already a repo
if [ ! -d .git ]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi
```

**Verification:**
```bash
ls -la src/__tests__/
ls -la tests/
ls -la .git/
echo "✅ PHASE 5 COMPLETE - MCP integration and test structure ready"
```

**Mark Status: QA_TESTING → DOCUMENTATION**

---

### 🎯 PHASE 6: Agent System Verification & Final Setup (1 Point)
**Status: DOCUMENTATION → READY_FOR_RELEASE → DONE**

**Claude Task:** Verify complete Dev-Agency integration:

1. **Test agent system**:
```bash
# Test agent command availability (Claude will verify internally)
echo "Testing agent system integration..."
# Claude should verify these commands work:
# /cmd, /agent:architect, /agent:coder, /agent:tester, etc.
```

2. **Create first project ticket**:
   - Edit `Project_Management/PROJECT_PLAN.md`
   - Add initial project setup completion ticket
   - Set status to DONE
   - Add first development ticket for next work

3. **Final project status**:
```bash
# Display final project structure
echo "=== PROJECT SETUP COMPLETE ==="
echo "📁 Project Structure:"
find . -type d -name ".*" -prune -o -type d -print | head -20
echo ""
echo "📋 Key Files:"
ls -la CLAUDE.md PROJECT_PLAN.md README.md 2>/dev/null
echo ""
echo "✅ PHASE 6 COMPLETE - Project fully operational with Dev-Agency integration"
```

**Final Status: DONE**

## Sprint Execution Instructions for Claude

### How to Execute This Sprint

**When a user requests a new project setup:**

1. **Create TodoWrite with 6 phases** from this guide
2. **Execute phases sequentially** - complete one before starting next
3. **Run all bash commands** using the Bash tool
4. **Verify each phase** with the verification commands
5. **Update TodoWrite status** as you progress through phases
6. **Mark phase complete** only when verification passes

### Sprint Success Criteria

**Project is complete when:**
- [ ] All 6 phases marked DONE in TodoWrite
- [ ] File structure exists and verified
- [ ] Templates copied and customized
- [ ] Documentation structure created
- [ ] MCP tools verified (if available)
- [ ] Agent system tested and working
- [ ] First project ticket created in PROJECT_PLAN.md

### Troubleshooting During Sprint

**If Phase 1 fails (mkdir):**
- Check current directory is project root
- Verify write permissions
- Create directories individually if batch fails

**If Phase 2 fails (template copy):**
- Verify Dev-Agency path exists
- Check template files exist in source
- Use absolute paths in copy commands

**If Phase 5 fails (MCP tools):**
- MCP tools are optional - continue without them
- Focus on core structure completion

**If Phase 6 fails (agent verification):**
- Check global CLAUDE.md has Dev-Agency references
- Test with simple `/cmd` command
- Verify paths in global configuration

---

## Quick Reference for Manual Setup

### Emergency Manual Setup (If Sprint Fails)

```bash
# Core structure
mkdir -p {Project_Management/{Specs,Bug_Reports,temp,"Sprint Retrospectives",Archive,Releases},docs/{features,guides,api,tutorials,integrations,agents,development/{architecture,patterns,testing,deployment}},src,tests}

# Core files
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_PLAN_Template.md" "./Project_Management/PROJECT_PLAN.md"
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/CHANGELOG_Template.md" "./Project_Management/Releases/CHANGELOG.md" 
cp "/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/PROJECT_CLAUDE_TEMPLATE.md" "./CLAUDE.md"

# Essential docs
echo "# [PROJECT_NAME]" > README.md
echo "# Setup Guide" > docs/development/setup.md
```

---

## Expected Output After Sprint Completion

**Project should have this structure:**

```
/[project-root]/
├── CLAUDE.md                 # Customized project CLAUDE.md
├── README.md                 # Project overview and quick start
├── Project_Management/       # Project planning and tracking
│   ├── PROJECT_PLAN.md      # Customized project plan
│   ├── Specs/               # Future ticket specifications
│   ├── Bug_Reports/         # Bug tracking
│   ├── temp/                # Working files
│   ├── Sprint Retrospectives/ # Sprint reviews
│   ├── Archive/             # Archived content
│   └── Releases/
│       ├── CHANGELOG.md     # Version history
│       └── Release_Notes.md # Release notes template
├── docs/                    # Documentation structure
│   ├── features/            # Feature documentation
│   ├── guides/              # User guides
│   ├── api/                 # API reference
│   ├── tutorials/           # Tutorials
│   ├── integrations/        # Integration guides
│   ├── agents/              # Agent documentation
│   └── development/         # Development docs
│       ├── setup.md         # Setup instructions
│       ├── architecture.md  # Architecture overview
│       ├── testing.md       # Test strategy
│       ├── architecture/    # Architecture docs
│       ├── patterns/        # Code patterns
│       ├── testing/         # Testing guides
│       └── deployment/      # Deployment guides
├── src/                     # Source code
│   └── __tests__/          # Test files
├── tests/                   # Additional tests
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── README.md          # Test configuration
└── .git/                   # Git repository (if initialized)
```

## Sprint Commands for Claude

**To execute this sprint when user requests new project setup:**

```bash
# User command that triggers this sprint:
# "Set up a new project" or "Initialize new project with Dev-Agency"

# Claude should:
1. Read this guide: /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/New Project Setup Guide.md
2. Create TodoWrite with 6 phases
3. Execute phases 1-6 sequentially
4. Verify each phase completion
5. Report final status to user
```

**Sprint completion message:**
```
✅ PROJECT SETUP COMPLETE
📁 Structure: Full Dev-Agency integration
📋 Files: Templates copied and customized  
🔧 Tools: MCP integration verified
🤖 Agents: Dev-Agency system operational
📝 Documentation: Complete structure ready
🎯 Next: Ready for first development sprint
```

---

*Executable sprint guide for Claude to set up complete projects with centralized Dev-Agency integration*