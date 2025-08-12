---
title: Dev-Agency FAQ
description: Frequently asked questions and answers for Dev-Agency users
type: reference
category: documentation
tags: [faq, help, troubleshooting, getting-started]
created: 2025-08-10
updated: 2025-08-10
---

# Dev-Agency Frequently Asked Questions (FAQ)

## Table of Contents

- [Getting Started](#getting-started)
- [Agent Usage and Selection](#agent-usage-and-selection)
- [Sprint Management](#sprint-management)
- [Tool Installation and Setup](#tool-installation-and-setup)
- [Integration with IDEs and Tools](#integration-with-ides-and-tools)
- [Team Collaboration](#team-collaboration)
- [Performance and Optimization](#performance-and-optimization)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Migration and Upgrades](#migration-and-upgrades)

---

## Getting Started

### Q: What is Dev-Agency?
**A:** Dev-Agency is a centralized agentic development system that provides AI-powered agents, standardized workflows, and templates to enhance software development productivity. It serves as a single source of truth for development standards, documentation, and automation.

### Q: How do I get started with Dev-Agency?
**A:** 
1. Follow the installation guide at `/docs/getting-started/installation.md`
2. Set up your first project using `/docs/getting-started/first-project.md`
3. Learn the basic workflow with `/docs/getting-started/basic-workflow.md`
4. Start with simple commands like `/cmd` and `/research`

### Q: What's the difference between Dev-Agency and other development tools?
**A:** Dev-Agency focuses on:
- **AI-powered agents** for specialized tasks
- **Centralized standards** that work across all projects
- **Sprint-based workflows** with automated tracking
- **Quality-first approach** with enterprise-grade standards
- **Single source of truth** - no duplication across projects

### Q: Do I need to copy Dev-Agency files to my project?
**A:** **No, never copy files!** Dev-Agency works as a centralized system. Your project only needs a minimal `CLAUDE.md` that references the central system at `/home/hd/Desktop/LAB/Dev-Agency/`.

### Q: Can I use Dev-Agency with existing projects?
**A:** Yes! Create a `CLAUDE.md` in your project root using the template at `/home/hd/Desktop/LAB/Dev-Agency/PROJECT_CLAUDE_TEMPLATE.md` and start using Dev-Agency commands immediately.

---

## Agent Usage and Selection

### Q: How do I know which agent to use?
**A:** Follow this decision matrix:
- **System design/architecture**: `/agent:architect`
- **General coding**: `/agent:coder`
- **MCP protocol work**: `/agent:mcp-dev`
- **Testing and QA**: `/agent:tester`
- **Security reviews**: `/agent:security`
- **Performance optimization**: `/agent:performance`
- **Documentation**: `/agent:documenter`
- **Integration work**: `/agent:integration`

### Q: Can I use multiple agents at once?
**A:** Yes! Use them in sequence or parallel:
- **Sequence**: `/agent:architect` → `/agent:coder` → `/agent:tester`
- **Parallel**: `/agent:security` + `/agent:performance` for reviews

### Q: What's the difference between Main Claude and agents?
**A:** 
- **Main Claude**: Orchestrates the workflow, handles complex decisions, manages context
- **Agents**: Specialized for specific tasks, receive focused prompts, return targeted outputs

### Q: How do I invoke an agent?
**A:** Use the slash command format:
```bash
/agent:architect    # For system design
/agent:coder       # For implementation
/agent:tester      # For testing
```

### Q: What if an agent doesn't give me what I need?
**A:** 
1. Check if you're using the right agent for the task
2. Provide more specific context in your request
3. Try combining agents (e.g., `/agent:architect` then `/agent:coder`)
4. Use `/agent-feedback` to report issues for improvement

### Q: Are there pre-made agent combinations?
**A:** Yes! Use `/agent-recipe [name]` to load proven combinations from `/recipes/`. Popular recipes include:
- **Full Feature**: architect → coder → tester → documenter
- **Bug Fix**: tester → coder → security
- **Performance**: performance → coder → tester

---

## Sprint Management

### Q: How do I start a new sprint?
**A:** Use `/sprint-plan` to create a new sprint with:
1. Sprint goals and objectives
2. Ticket selection and prioritization
3. Story point estimation
4. Resource allocation

### Q: How do I execute a sprint?
**A:** Use `/sprint-execute --max-agents 4` to:
1. Process tickets in priority order
2. Use multiple agents efficiently
3. Track progress automatically
4. Generate sprint reports

### Q: What's the ticket workflow in Dev-Agency?
**A:** Follow this state machine:
```
BACKLOG → TODO → IN_PROGRESS → CODE_REVIEW → QA_TESTING → DOCUMENTATION → READY_FOR_RELEASE → DONE
```

### Q: How do I estimate story points?
**A:** Use the Fibonacci sequence (1, 2, 3, 5, 8, 13):
- **1 point**: Simple config changes, documentation updates
- **2 points**: Small features, straightforward fixes
- **3 points**: Medium features requiring some design
- **5 points**: Complex features with multiple components
- **8 points**: Large features requiring significant architecture
- **13 points**: Epic-level work, break into smaller tickets

### Q: Can I track sprint progress?
**A:** Yes! Check:
- `PROJECT_PLAN.md` for real-time ticket status
- `/metrics/` folder for performance data
- Sprint reports generated by `/sprint-execute`

### Q: What if I get blocked on a ticket?
**A:** 
1. Update ticket status to `BLOCKED`
2. Document the blocker in the ticket
3. Create a separate ticket for resolving the blocker
4. Move to other tickets while blocked item is resolved

---

## Tool Installation and Setup

### Q: What are the system requirements?
**A:** 
- **OS**: Linux, macOS, or Windows with WSL2
- **Node.js**: 18+ for MCP tools
- **Python**: 3.8+ for Python agents
- **Git**: For version control integration
- **VS Code**: Recommended for best integration

### Q: How do I install MCP tools?
**A:** Follow the MCP installation guide:
```bash
npm install -g @modelcontextprotocol/cli
# Follow specific tool installation in docs/tools/
```

### Q: Do I need special permissions?
**A:** Some tools require:
- File system access for code analysis
- Network access for integrations
- Git repository access for version control features

### Q: How do I verify my installation?
**A:** Run the installation verification:
```bash
/cmd --version           # Check Dev-Agency version
/agent-status           # Verify agent availability
/tools-check            # Validate tool installations
```

### Q: Can I use Dev-Agency in Docker?
**A:** Yes! Use the provided Docker configuration:
```bash
docker build -t dev-agency .
docker run -v $(pwd):/workspace dev-agency
```

---

## Integration with IDEs and Tools

### Q: How do I integrate with VS Code?
**A:** Follow the VS Code guide at `/docs/guides/vscode-guide.md`:
1. Install recommended extensions
2. Configure workspace settings
3. Set up keyboard shortcuts for common commands
4. Use integrated terminal for Dev-Agency commands

### Q: Can I use Dev-Agency with other editors?
**A:** Yes! Dev-Agency is editor-agnostic. Any editor with terminal integration can use Dev-Agency commands.

### Q: How do I integrate with CI/CD pipelines?
**A:** 
1. Use `/tools/ci-cd/` configurations
2. Add Dev-Agency commands to your pipeline scripts
3. Use `/agent:tester` for automated testing phases
4. Generate reports with `/metrics/` data

### Q: Does Dev-Agency work with GitHub/GitLab?
**A:** Yes! Integration features include:
- Automatic PR creation and management
- Issue linking to Dev-Agency tickets
- Commit message standardization
- Branch naming conventions

### Q: Can I customize the workflow for my team?
**A:** Yes! Create custom:
- Agent definitions in `/Agents/`
- Workflow recipes in `/recipes/`
- Command shortcuts in `/prompts/`
- Team-specific standards in your project's `CLAUDE.md`

---

## Team Collaboration

### Q: How do multiple developers use Dev-Agency?
**A:** Each developer:
1. Has their own Dev-Agency installation
2. References the same central standards
3. Updates shared `PROJECT_PLAN.md`
4. Uses consistent ticket workflows

### Q: How do we handle merge conflicts in PROJECT_PLAN.md?
**A:** 
1. Use ticket IDs for unique identification
2. Communicate ticket assignments in daily standups
3. Update status frequently to avoid conflicts
4. Use `/sync-memory` to keep knowledge graph updated

### Q: Can we share agent configurations?
**A:** Yes! Team configurations can be shared through:
- Custom agent definitions in `/Agents/`
- Shared recipes in `/recipes/`
- Team standards in central Dev-Agency installation

### Q: How do we onboard new team members?
**A:** 
1. Follow `/docs/tutorials/team-collaboration.md`
2. Set up Dev-Agency on their machine
3. Walk through the 5-step development process
4. Start with simple tickets to build familiarity

### Q: Can we track team performance?
**A:** Yes! Use:
- Sprint metrics in `/metrics/`
- Agent performance tracking
- Ticket completion rates
- Code quality measurements

---

## Performance and Optimization

### Q: Why are agent responses slow?
**A:** Common causes:
1. **Large context**: Reduce prompt size, focus on relevant code
2. **Complex requests**: Break into smaller, specific tasks
3. **Network issues**: Check internet connection
4. **Resource limits**: Use fewer parallel agents

### Q: How do I optimize agent performance?
**A:** 
1. **Use specific agents** for targeted tasks
2. **Prepare clean context** - remove irrelevant information
3. **Use parallel agents** for independent tasks
4. **Cache results** - save successful prompts as recipes
5. **Monitor metrics** - track what works best

### Q: Can I run agents in parallel?
**A:** Yes! For independent tasks like:
- Security review + performance analysis
- Multiple component implementations
- Different documentation types

Use: `/sprint-execute --max-agents 4` for controlled parallelization

### Q: How do I reduce token usage?
**A:** 
1. **Be specific** in requests
2. **Use focused agents** instead of general queries
3. **Prepare clean context** - only include relevant code
4. **Reuse successful patterns** with recipes
5. **Break large tasks** into smaller chunks

### Q: What if I run out of API limits?
**A:** 
1. **Use fewer agents** per session
2. **Focus on high-priority tickets** first
3. **Batch similar operations** together
4. **Save successful prompts** to avoid reprocessing

---

## Troubleshooting

### Q: `/cmd` command isn't working
**A:** Check:
1. Are you in the right directory with `CLAUDE.md`?
2. Is the Dev-Agency path correct in your `CLAUDE.md`?
3. Do you have proper file permissions?
4. Try `/cmd --help` for syntax verification

### Q: Agent isn't giving expected results
**A:** 
1. **Check agent selection** - using the right agent for the task?
2. **Provide better context** - include relevant code/specs
3. **Be more specific** in your request
4. **Try different agents** - maybe `/agent:architect` before `/agent:coder`
5. **Use `/agent-feedback`** to report issues

### Q: Ticket status not updating
**A:** 
1. **Check PROJECT_PLAN.md syntax** - proper formatting?
2. **Verify ticket ID** - unique and consistent?
3. **File permissions** - can write to PROJECT_PLAN.md?
4. **Merge conflicts** - resolve any git conflicts

### Q: Memory sync issues
**A:** 
1. Use `/sync-memory --status` to check current state
2. Try `/sync-memory --force` for full resync
3. Check file permissions for knowledge graph
4. Verify network connectivity for remote sync

### Q: Getting "file not found" errors
**A:** 
1. **Use absolute paths** - Dev-Agency requires absolute paths
2. **Check path variables** - verify `$STANDARDS`, `$GUIDES_DIR` etc.
3. **File permissions** - ensure read/write access
4. **Case sensitivity** - check exact file names

### Q: Sprint execution failing
**A:** 
1. **Check ticket format** in PROJECT_PLAN.md
2. **Verify story points** - using Fibonacci sequence?
3. **Agent availability** - all required agents working?
4. **Resource limits** - reduce `--max-agents` if needed

### Q: Performance is very slow
**A:** 
1. **Reduce context size** - focus on relevant code only
2. **Use specific agents** instead of general queries
3. **Check system resources** - CPU/memory usage
4. **Network connectivity** - stable internet connection?

### Q: Documentation not generating
**A:** 
1. **Check template paths** - verify `$SPEC`, `$PROJECT_PLAN` paths
2. **File permissions** - can create/update documentation files?
3. **Agent selection** - use `/agent:documenter` for user docs
4. **Content validation** - ensure source material exists

---

## Best Practices

### Q: What's the recommended daily workflow?
**A:** 
1. **Start**: `/cmd` to initialize session
2. **Plan**: Check PROJECT_PLAN.md for today's tickets
3. **Execute**: Follow 5-step process for each ticket
4. **Review**: Use `/reflect` to validate work
5. **Complete**: Mark tickets DONE with `/done`

### Q: How should I structure my tickets?
**A:** 
- **Clear titles** with action verbs
- **Specific acceptance criteria**
- **Proper story point estimation**
- **Links to related tickets**
- **Technical specifications** in separate Spec documents

### Q: When should I create a new Spec document?
**A:** Create specs for:
- **New features** (always required)
- **Complex bug fixes** with multiple components
- **Architecture changes** that affect multiple modules
- **Performance optimizations** with measurable goals

### Q: How do I handle dependencies between tickets?
**A:** 
1. **Document dependencies** in ticket descriptions
2. **Use blocking relationships** in PROJECT_PLAN.md
3. **Order tickets appropriately** in sprints
4. **Create foundation tickets first**

### Q: What's the best way to estimate story points?
**A:** 
1. **Compare to completed tickets** of similar complexity
2. **Consider unknowns** and research time
3. **Include testing and documentation** time
4. **Use team consensus** for estimation
5. **Track accuracy** and adjust over time

### Q: How often should I update ticket status?
**A:** Update immediately when:
- Starting work (`TODO` → `IN_PROGRESS`)
- Completing code (`IN_PROGRESS` → `CODE_REVIEW`)
- Finishing testing (`CODE_REVIEW` → `QA_TESTING`)
- Completing documentation (`QA_TESTING` → `DOCUMENTATION`)
- Ready for release (`DOCUMENTATION` → `READY_FOR_RELEASE`)

### Q: Should I use multiple agents for one ticket?
**A:** Yes, for comprehensive coverage:
- `/agent:architect` for design
- `/agent:coder` for implementation
- `/agent:tester` for testing
- `/agent:security` for security review
- `/agent:documenter` for documentation

### Q: How do I maintain code quality?
**A:** 
1. **Always use `/agent:architect`** for design decisions
2. **Run `/agent:tester`** for every code change
3. **Use `/agent:security`** for sensitive code
4. **Follow `/standards`** consistently
5. **Review with `/reflect`** before completion

---

## Migration and Upgrades

### Q: How do I migrate from an older version?
**A:** 
1. **Backup current setup** and project files
2. **Review changelog** for breaking changes
3. **Follow migration guide** in `/docs/development/deployment/`
4. **Update project CLAUDE.md** if needed
5. **Test basic functionality** before full migration

### Q: Can I upgrade Dev-Agency without affecting projects?
**A:** Yes! The centralized system design means:
- Projects reference Dev-Agency centrally
- Upgrades apply automatically to all projects
- No need to update individual project files

### Q: What if new version breaks my workflow?
**A:** 
1. **Check compatibility guide** in release notes
2. **Use version-specific features** gradually
3. **Report issues** through proper channels
4. **Rollback if necessary** using backup

### Q: How do I migrate existing documentation?
**A:** 
1. **Use `/doc-audit`** to analyze current docs
2. **Follow standardization recipe** in `/recipes/`
3. **Convert gradually** - one section at a time
4. **Validate with team** before finalizing changes

### Q: Can I customize the migration process?
**A:** Yes! Create custom migration:
- Scripts in `/tools/migration/`
- Agent definitions for specific needs
- Team-specific validation rules
- Gradual rollout procedures

---

## Additional Resources

### Q: Where can I find more help?
**A:** 
- **Documentation**: `/docs/` directory has comprehensive guides
- **Examples**: `/examples/` directory for real-world usage
- **Community**: Check project repository for discussions
- **Support**: Use `/bug-report` for issues

### Q: How do I contribute to Dev-Agency?
**A:** 
1. **Follow development standards** in the project
2. **Create tickets** for new features/improvements
3. **Use agents** for implementation
4. **Submit pull requests** with proper documentation

### Q: Are there video tutorials?
**A:** Check the `/docs/tutorials/` directory for:
- Feature development walkthrough
- Bug fix workflow examples
- Team collaboration guides
- Sprint management tutorials

### Q: Can I get training on Dev-Agency?
**A:** Start with:
1. **Basic workflow tutorial**: `/docs/getting-started/basic-workflow.md`
2. **Hands-on examples**: `/docs/tutorials/`
3. **Team collaboration guide**: `/docs/tutorials/team-collaboration.md`
4. **Advanced patterns**: `/docs/development/patterns/`

---

*This FAQ is maintained by the Dev-Agency team. For additional questions, create an issue in the project repository or use `/agent-feedback` to suggest improvements.*