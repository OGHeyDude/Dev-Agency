---
title: 5-Minute Dev-Agency Success
description: Get your first AI agent working in 5 minutes
type: guide
category: getting-started
tags: [quick-start, onboarding, first-time, agents]
created: 2025-08-09
updated: 2025-08-09
---

# 5-Minute Dev-Agency Success

**Goal**: Get your first AI agent working and producing useful output in 5 minutes.

## What You'll Accomplish
✅ Run your first AI agent  
✅ Get actual code analysis output  
✅ Understand basic agent invocation  
✅ Feel confident in the system  

## Before You Start
- Have Claude Code access to `/home/hd/Desktop/LAB/Dev-Agency/`
- Be in a project directory (any project with code files)

---

## Step 1: Your First Agent Call (2 minutes)

**Copy and paste this exact command:**

```bash
# Navigate to Dev-Agency
cd /home/hd/Desktop/LAB/Dev-Agency

# Read agent definition and invoke the architect
Read Agents/architect.md
```

Then use the Task tool:
```
Task: "Analyze the current project structure and suggest improvements"
Agent: general-purpose
Context: Current directory contents and architecture
```

## Step 2: See Results (1 minute)

**Look for these indicators of success:**
- Agent provides structured analysis of your codebase
- Specific improvement recommendations
- Clear architectural observations
- Actionable next steps

**Success checkpoint**: You should have detailed analysis output about your project structure.

---

## Step 3: Try Agent Selection (2 minutes)

**Now try the security agent:**

```bash
# Read security agent definition
Read Agents/security.md
```

Then:
```
Task: "Review project for common security issues"
Agent: general-purpose  
Context: Current codebase files
```

**Success checkpoint**: You should have security recommendations specific to your code.

---

## ✅ You Did It! 

**You now have:**
- ✅ Two agent analyses of your project
- ✅ Understanding of agent invocation pattern
- ✅ Confidence that the system works
- ✅ Actual, useful output for your project

## What's Next?

### **For More Power**: 
- **Parallel Agents**: See [AGENT_CATALOG.md](AGENT_CATALOG.md) for multi-agent workflows
- **CLI Tool**: Automate agent calls with the Agent CLI
- **Recipes**: Use proven workflows for common tasks

### **For Team Usage**:
- **Integration**: Add to your existing projects
- **Standards**: Follow Dev-Agency development standards
- **Workflows**: Integrate with your sprint process

### **Need Help?**
- **Common Issues**: See [troubleshooting guide](../docs/reference/troubleshooting.md)
- **All Agents**: Complete catalog in [AGENT_CATALOG.md](AGENT_CATALOG.md)
- **Tools**: Full tool documentation in [/docs/tools/](../docs/tools/)

---

**Next Recommended Action**: Try the [Agent CLI tool quick start](../tools/agent-cli/QUICK_START.md) for automated agent orchestration.