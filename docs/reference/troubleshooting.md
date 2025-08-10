---
title: Dev-Agency Troubleshooting Guide
description: Common issues and solutions for Dev-Agency system
type: reference
category: support
tags: [troubleshooting, support, errors, solutions]
created: 2025-08-09
updated: 2025-08-09
---

# Dev-Agency Troubleshooting Guide

**Quick solutions for common Dev-Agency issues.**

## 🚨 Quick Fixes

### Agent Invocation Issues

**Problem**: Agent not responding or giving unexpected results  
**Solution**: 
1. Check that you're in the Dev-Agency directory: `/home/hd/Desktop/LAB/Dev-Agency/`
2. Verify agent name spelling - use exact names from [Agent Catalog](../../quick-start/AGENT_CATALOG.md)
3. Ensure you have sufficient context in your request

**Problem**: "Agent not found" error  
**Solution**:
1. Check available agents: `ls /home/hd/Desktop/LAB/Dev-Agency/Agents/`
2. Use exact agent names: `/agent:architect`, `/agent:coder`, etc.
3. Verify you're using the Task tool correctly

### CLI Tool Issues

**Problem**: CLI tool build failures  
**Current Status**: ⚠️ CLI tool has known build issues (54+ TypeScript errors)  
**Workaround**: Use manual agent invocation via Claude Code until CLI is fixed  
**Solution**: CLI fixes scheduled for Sprint 3

**Problem**: Missing dependencies  
**Solution**: 
```bash
cd /home/hd/Desktop/LAB/Dev-Agency/tools/agent-cli/
npm install
npm run build
```

### Context Optimization Issues

**Problem**: Context too large for agent  
**Current Status**: ⚠️ Context optimizer partially implemented  
**Workaround**: Manually reduce context by:
1. Focus on specific files rather than entire directory
2. Use smaller code examples in requests
3. Break large tasks into smaller pieces

### File Path Issues

**Problem**: Documentation links not working  
**Common Fixes**:
- Memory sync tool: Use `utils/memory_sync/` not `tools/memory-sync/`
- Ensure you're starting from Dev-Agency root directory
- Check case sensitivity in file names

## 🔧 Common Installation Issues

### MCP Tools Setup

**Problem**: MCP tools not working  
**Solution**:
```bash
# Verify MCP tool installation
claude mcp list

# Add required MCP tools if missing
claude mcp add memory node /home/hd/Desktop/LAB/MCP_Tools/memory/dist/index.js
claude mcp add filesystem node /home/hd/Desktop/LAB/MCP_Tools/filesystem/dist/index.js
claude mcp add fetch python /home/hd/Desktop/LAB/MCP_Tools/fetch/server.py
```

### Permission Issues

**Problem**: Cannot access Dev-Agency files  
**Solution**:
```bash
# Check permissions
ls -la /home/hd/Desktop/LAB/Dev-Agency/

# Fix common permission issues
chmod +x /home/hd/Desktop/LAB/Dev-Agency/tools/agent-cli/dist/cli.js
```

## 📚 Agent-Specific Issues

### `/agent:architect` Problems

**Problem**: Architecture responses too generic  
**Solution**: 
- Provide specific technical requirements
- Include existing system context
- Ask for specific architectural patterns

### `/agent:coder` Problems

**Problem**: Code doesn't match project style  
**Solution**:
- Include examples of existing code
- Specify coding standards and conventions
- Provide project structure context

### `/agent:security` Problems  

**Problem**: Security analysis too shallow  
**Solution**:
- Include specific security requirements
- Mention compliance standards (OWASP, SOC2, etc.)
- Provide actual code for analysis

## 🛠️ Development Issues

### Sprint Planning Problems

**Problem**: Cannot find project planning templates  
**Solution**: Templates located at:
- Project Plan: `Development_Standards/Templates/PROJECT_PLAN_Template.md`
- Specs: `Development_Standards/Templates/SPECS_Template.md`
- Bug Reports: `Development_Standards/Templates/Persistent Bug Report.md`

### Documentation Issues

**Problem**: Documentation out of sync  
**Solution**:
1. Check `updated` date in frontmatter
2. Use memory sync tool: `/agent:memory-sync`
3. Verify against Sprint 2 QA Report for actual system status

### Performance Issues

**Problem**: Slow agent responses  
**Solution**:
1. Reduce context size manually
2. Use more specific requests
3. Break complex tasks into smaller pieces

## ❓ Status Clarifications

### Current Implementation Status

Based on Sprint 2 QA Report, actual system status:

**✅ Working Components**:
- Agent definitions and prompts
- Documentation system
- Project management structure
- Recipe system design

**⚠️ Partially Working**:
- Context optimizer (missing modules)
- Memory sync (operational but needs integration)

**❌ Known Issues**:
- CLI tool (build failures, 54+ TypeScript errors)
- Performance metrics (unvalidated)
- Parallel execution (theoretical until CLI fixed)

### Getting Help

**For immediate issues**:
1. Check this troubleshooting guide first
2. Review [Agent Catalog](../../quick-start/AGENT_CATALOG.md) for agent-specific help
3. Check Sprint 2 QA Report for current system status

**For system improvements**:
- Submit feedback via [feedback forms](../../feedback/)
- Reference known issues in Sprint 3 planning
- Use manual workarounds until automated tools are fixed

**Emergency workarounds**:
- Use manual agent invocation instead of CLI tool
- Reduce context manually instead of using optimizer
- Follow 5-step development process manually

---

**Last Updated**: 08-09-2025  
**Next Review**: After Sprint 3 completion  
**Status Source**: Sprint 2 QA Report and system testing