---
title: Dev-Agency Installation Guide
description: Complete setup guide for Dev-Agency centralized development system
type: guide
category: getting-started
tags: [installation, setup, prerequisites, configuration]
created: 2025-08-10
updated: 2025-08-10
---

# Dev-Agency Installation Guide

**Complete setup guide for the Dev-Agency centralized agentic development system.**

This guide covers both **quick setup** (5 minutes) and **comprehensive installation** with all tools.

## 📋 System Requirements

### Minimum Requirements
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Claude Code**: Access to Claude Code CLI environment
- **Git**: Version 2.0 or higher
- **Disk Space**: 500MB for core system, 2GB for full setup

### Recommended Requirements
- **RAM**: 8GB+ (for optimal agent performance)
- **CPU**: Multi-core processor (parallel agent execution)
- **Network**: Stable internet connection (for MCP tools)

## 🚀 Quick Setup (5 Minutes)

**Perfect for first-time users who want to start immediately.**

### Step 1: Verify Access
```bash
# Check if Dev-Agency is accessible
ls /home/hd/Desktop/LAB/Dev-Agency/
```

**✅ Success**: You should see directories like `Agents/`, `docs/`, `tools/`, etc.

### Step 2: Test Basic Functionality
```bash
# Navigate to Dev-Agency
cd /home/hd/Desktop/LAB/Dev-Agency

# Try your first agent
Read Agents/architect.md
```

Then invoke using the Task tool:
```
Task: "Analyze the Dev-Agency system architecture"
Agent: general-purpose
Context: Current directory structure and documentation
```

**✅ Success**: You should receive architectural analysis of the Dev-Agency system.

### Step 3: Verification
If you received meaningful output from the architect agent, **you're ready to use Dev-Agency!**

**Next Step**: Try the [5-Minute Success Guide](../../quick-start/5_MINUTE_SUCCESS.md)

---

## 🔧 Full Installation (Complete Setup)

**For users who want all tools and features.**

### Prerequisites Installation

#### Node.js and npm
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from nodejs.org or use package manager
# Ubuntu/Debian:
sudo apt-get update
sudo apt-get install nodejs npm

# macOS:
brew install node

# Windows:
# Download from https://nodejs.org/
```

**Required Version**: Node.js 16.0.0 or higher

#### Python (for Context Optimizer)
```bash
# Check Python installation
python3 --version
pip3 --version

# If not installed:
# Ubuntu/Debian:
sudo apt-get install python3 python3-pip

# macOS:
brew install python3

# Windows:
# Download from https://python.org/
```

**Required Version**: Python 3.8 or higher

#### Git
```bash
# Verify Git installation
git --version

# If not installed:
# Ubuntu/Debian:
sudo apt-get install git

# macOS:
brew install git

# Windows:
# Download from https://git-scm.com/
```

### Core System Setup

#### 1. Verify Dev-Agency Access
```bash
# Navigate to Dev-Agency
cd /home/hd/Desktop/LAB/Dev-Agency

# Verify core structure
ls -la

# Check agent availability
ls Agents/
```

**Expected Output**: You should see agent files like `architect.md`, `coder.md`, `tester.md`, etc.

#### 2. Basic Configuration Test
```bash
# Test agent system
Read CLAUDE.md

# Verify project structure
Read PROJECT_PLAN.md
```

### Tool Installation

#### Agent CLI Tool
```bash
# Navigate to CLI tool directory
cd /home/hd/Desktop/LAB/Dev-Agency/tools/agent-cli/

# Install dependencies
npm install

# Build the tool
npm run build

# Test installation
npm test

# Verify CLI functionality (if build successful)
./dist/cli.js --version
```

**⚠️ Known Issue**: CLI tool currently has TypeScript compilation issues. Use manual agent invocation until fixed.

**Workaround**: Use agents directly via Claude Code Task tool.

#### Context Optimizer Tool
```bash
# Navigate to optimizer directory
cd /home/hd/Desktop/LAB/Dev-Agency/tools/context_optimizer/

# Install Python dependencies
pip3 install -r requirements.txt

# Test installation
python3 cli.py --help

# Verify functionality
python3 test_basic.py
```

**✅ Success**: All tests should pass.

#### Production Health Tools
```bash
# Navigate to production health directory
cd /home/hd/Desktop/LAB/Dev-Agency/src/

# Install dependencies
npm install

# Build the tools
npm run build

# Run tests
npm test

# Start health monitoring (optional)
npm run dev
```

### MCP Tools Configuration

#### Memory Management
```bash
# Verify MCP tool availability
claude mcp list

# Add memory tool if missing
claude mcp add memory node /home/hd/Desktop/LAB/MCP_Tools/memory/dist/index.js

# Add filesystem tool
claude mcp add filesystem node /home/hd/Desktop/LAB/MCP_Tools/filesystem/dist/index.js

# Add fetch tool
claude mcp add fetch python /home/hd/Desktop/LAB/MCP_Tools/fetch/server.py
```

**Note**: MCP tools location may vary. Adjust paths accordingly.

## ✅ Installation Verification

### Basic Functionality Test
```bash
# 1. Test core agent system
cd /home/hd/Desktop/LAB/Dev-Agency
Read Agents/coder.md

# 2. Test Task tool integration
# Use Task tool with:
# Task: "List all available Dev-Agency agents"
# Agent: general-purpose
# Context: Agents directory contents

# 3. Verify agent catalog access
Read quick-start/AGENT_CATALOG.md
```

### Tool Verification
```bash
# Test Context Optimizer
cd tools/context_optimizer/
python3 cli.py --version

# Test CLI tool (if built successfully)
cd ../agent-cli/
npm run test

# Test health monitoring
cd ../../src/
npm run health-check
```

### Integration Test
```bash
# Full integration test using architect agent
# Navigate to any project and run:
cd /your-project-directory/

# Invoke architect with context
# Task: "Analyze this project structure and recommend Dev-Agency integration"
# Agent: general-purpose
# Context: Current project files and structure
```

**✅ Success Criteria**: 
- Architect provides project analysis
- Specific integration recommendations
- Clear next steps

## 🚨 Common Installation Issues

### Permission Issues
```bash
# Fix permission issues
sudo chown -R $USER:$USER /home/hd/Desktop/LAB/Dev-Agency/
chmod -R 755 /home/hd/Desktop/LAB/Dev-Agency/
```

### Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version is too old, update:
# Using Node Version Manager (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Python Dependencies Issues
```bash
# Create virtual environment (recommended)
python3 -m venv dev-agency-env
source dev-agency-env/bin/activate  # Linux/macOS
# dev-agency-env\Scripts\activate  # Windows

# Install dependencies in virtual environment
pip3 install -r tools/context_optimizer/requirements.txt
```

### CLI Build Failures
```bash
# Clear cache and reinstall
cd tools/agent-cli/
rm -rf node_modules/ dist/
npm cache clean --force
npm install
npm run clean
npm run build
```

**Current Status**: CLI tool has known TypeScript compilation issues. Use manual agent invocation as workaround.

### MCP Tools Not Found
```bash
# List available MCP tools
claude mcp list

# If tools are missing, check common locations:
ls /home/hd/Desktop/LAB/MCP_Tools/
ls ~/.config/claude/tools/

# Manual MCP tool registration
claude mcp add [tool-name] [language] [path-to-tool]
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Set Dev-Agency path
export DEV_AGENCY_PATH="/home/hd/Desktop/LAB/Dev-Agency"

# Optional: Set preferred Python version for tools
export PYTHON_BIN="python3"

# Optional: Enable debug logging
export DEBUG_AGENTS=true
```

### Project Integration

#### For New Projects
1. Copy the project template:
   ```bash
   cp /home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/PROJECT_CLAUDE_TEMPLATE.md /your-project/CLAUDE.md
   ```

2. Edit the project CLAUDE.md to reference Dev-Agency:
   ```markdown
   # Central Agent System
   All agents, guides, and templates are managed centrally at:
   `/home/hd/Desktop/LAB/Dev-Agency/`
   ```

#### For Existing Projects
1. Add Dev-Agency reference to existing CLAUDE.md
2. Update development workflow to use Dev-Agency standards
3. Start using agents for code review and development

## 📚 Next Steps

### Immediate Next Actions
1. **Try First Agent**: Follow [5-Minute Success Guide](../../quick-start/5_MINUTE_SUCCESS.md)
2. **Explore Agent Catalog**: Review [available agents](../../quick-start/AGENT_CATALOG.md)
3. **Learn Workflow**: Read [development workflow](../workflows/)

### For Development Teams
1. **Review Architecture**: [System design principles](../architecture/README.md)
2. **Setup Standards**: [Development standards guide](../../docs/guides/standards/Development%20Standards%20Guide.md)
3. **Configure Templates**: Use [project templates](../../docs/reference/templates/)

### For Advanced Users
1. **Tool Development**: Explore [tool development guides](../tools/)
2. **Recipe Creation**: Build [custom agent recipes](../../recipes/)
3. **Performance Optimization**: Setup [monitoring and analytics](../tools/performance.md)

## 🆘 Getting Help

### Quick Support
- **Common Issues**: [Troubleshooting Guide](../reference/troubleshooting.md)
- **Agent Problems**: [Agent Catalog](../../quick-start/AGENT_CATALOG.md) - usage patterns
- **Tool Issues**: Check tool-specific README files in respective directories

### Documentation Resources
- **User Guide**: [Complete user documentation](../USER_GUIDE.md)
- **Architecture**: [System design and principles](../architecture/README.md)
- **Workflows**: [Development processes](../workflows/)
- **Tools**: [Developer tools documentation](../tools/)

### Community and Support
- **Bug Reports**: Use [bug report template](../../docs/reference/templates/Persistent%20Bug%20Report.md)
- **Feature Requests**: Follow [project planning process](../../Project_Management/PROJECT_PLAN.md)
- **Documentation Issues**: Update using [documentation standards](../../docs/guides/standards/Documentation%20Guide.md)

---

**Installation Complete!** 🎉

You now have access to the full Dev-Agency system with AI agents, development tools, and proven workflows. Start with the [5-Minute Success Guide](../../quick-start/5_MINUTE_SUCCESS.md) to see immediate results.