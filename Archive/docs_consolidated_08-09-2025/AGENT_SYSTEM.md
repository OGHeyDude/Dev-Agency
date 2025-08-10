---
title: Agent System Architecture
description: Complete documentation of the Dev-Agency agent system architecture and operational principles
type: guide
category: architecture
tags: [agents, architecture, hub-spoke, claude-code, system-design]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Agent System Architecture

## Executive Summary

The Dev-Agency Agent System is built on Claude Code's native hub-and-spoke architecture, where specialized agents operate as stateless, on-demand tools orchestrated by the main Claude instance. This document defines the complete system architecture, operational principles, and integration patterns.

## System Architecture

### Hub-and-Spoke Model

```
                    Main Claude (Hub)
                          |
        +-----------------+-----------------+
        |                 |                 |
   /agent:coder    /agent:tester    /agent:security
        |                 |                 |
   [Executes]        [Executes]        [Executes]
        |                 |                 |
   [Reports Back]    [Reports Back]    [Reports Back]
        |                 |                 |
        +-----------------+-----------------+
                          |
                    Main Claude
                    [Processes & Decides Next Action]
```

### Key Architectural Principles

1. **Stateless Agents**: Each agent invocation is completely independent
2. **No Agent Memory**: Agents cannot access previous invocations or conversation history
3. **No Inter-Agent Communication**: Agents cannot communicate with each other
4. **Main Claude as Orchestrator**: Main instance maintains context and coordinates all agents
5. **Pre-Processed Context**: All necessary context must be embedded in agent prompts

## How Claude Code's Agent System Works

### Technical Implementation

When Main Claude invokes an agent using the Task tool:

1. **Agent Launch**: Main Claude prepares a complete, self-contained prompt
2. **Autonomous Execution**: Agent runs independently with only the provided context
3. **Single Response**: Agent completes task and returns one final message
4. **Main Processing**: Main Claude processes results and determines next steps

### Critical Constraints

- **No File Access**: Agents cannot read `$STANDARDS` or other file references
- **No Variable Access**: Agents cannot access environment variables or CLAUDE.md
- **Token Limits**: Agent prompts must fit within model token constraints
- **Single Message**: Agents return only one message (no follow-up possible)

## Agent Categories

### 1. Core Development Agents

These handle the primary development workflow:

- **System Architect** (`/agent:architect`)
  - High-level system design
  - Architecture decisions
  - Technology selection
  
- **Development Agent** (`/agent:coder`)
  - General code implementation
  - Following coding standards
  - Refactoring and optimization

- **QA/Test Agent** (`/agent:tester`)
  - Writing and running tests
  - Debugging and root cause analysis
  - Test coverage analysis

### 2. Specialist Agents

Domain-specific experts for complex tasks:

- **MCP Developer** (`/agent:mcp-dev`)
  - Model Context Protocol implementation
  - MCP server/client development
  - Protocol-specific optimizations

- **Security Agent** (`/agent:security`)
  - Security vulnerability assessment
  - Code security review
  - Compliance checking

- **Performance Agent** (`/agent:performance`)
  - Performance bottleneck analysis
  - Optimization recommendations
  - Benchmarking

### 3. Support Agents

Specialized support functions:

- **Documentation Agent** (`/agent:documenter`)
  - API documentation
  - User guides and tutorials
  - README updates

- **Integration Agent** (`/agent:integration`)
  - System integration planning
  - API design
  - Service coordination

- **Hooks Expert** (`/agent:hooks`)
  - Hook implementation
  - Middleware development
  - Event system design

## Agent Invocation Patterns

### Basic Invocation

```
User: "Implement the user authentication feature"

Main Claude:
1. Analyzes request and existing codebase
2. Prepares architect agent with context
3. Invokes: /agent:architect with spec requirements
4. Processes architecture plan
5. Invokes: /agent:coder with plan + standards
6. Processes implementation
7. Invokes: /agent:tester with code + test patterns
8. Processes test results
```

### Parallel Invocation

```
User: "Review this code for security and performance"

Main Claude:
1. Prepares code context
2. Invokes simultaneously:
   - /agent:security with code + security standards
   - /agent:performance with code + performance metrics
3. Processes both results
4. Synthesizes findings
```

### Sequential Specialization

```
User: "Build MCP server for database integration"

Main Claude:
1. Invokes: /agent:architect for overall design
2. Processes design
3. Invokes: /agent:mcp-dev with MCP-specific requirements
4. Processes MCP implementation
5. Invokes: /agent:integration for service coordination
```

## Context Management Strategy

### The "Scoped Universe" Principle

Each agent receives a complete but focused context:

```
GOOD Context for /agent:coder fixing auth bug:
✅ Complete auth module code
✅ Related test files
✅ Specific coding standards for auth
✅ Bug report and reproduction steps
✅ Example of similar fix

BAD Context:
❌ Entire codebase
❌ Unrelated modules (billing, reporting)
❌ All standards documents
❌ Historical conversation
```

### Context Passing Rules

1. **From Research to Planning**
   - Pass: Discovered patterns, existing code structure
   - Skip: Raw search results, file listings

2. **From Planning to Building**
   - Pass: Technical spec, relevant standards, example code
   - Skip: Alternative approaches considered, research notes

3. **From Building to Testing**
   - Pass: Implemented code, test patterns, success criteria
   - Skip: Implementation details, refactoring history

4. **From Testing to Documentation**
   - Pass: Final code, test results, API signatures
   - Skip: Test implementation details, debug logs

## Integration with Development Workflow

### 5-Step Process Mapping

| Step | Main Claude Role | Agent Usage |
|------|-----------------|-------------|
| 1. Research | Explores codebase, finds patterns | Rarely needed |
| 2. Plan | Creates technical approach | `/agent:architect` for complex designs |
| 3. Build | Orchestrates implementation | `/agent:coder` or specialists |
| 4. Test | Ensures quality | `/agent:tester` + `/agent:security` |
| 5. Document | Finalizes documentation | `/agent:documenter` for user-facing docs |

### Decision Matrix: When to Use Agents

| Scenario | Use Agent? | Which Agent? |
|----------|-----------|--------------|
| Simple variable rename | No | Main Claude handles |
| New REST API endpoint | Yes | `/agent:coder` |
| Complex MCP implementation | Yes | `/agent:mcp-dev` |
| Update inline comments | No | Main Claude handles |
| Write API documentation | Yes | `/agent:documenter` |
| Fix failing test | Maybe | `/agent:tester` if complex |
| Security audit | Always | `/agent:security` |

## Best Practices

### 1. Agent Prompt Preparation

**DO:**
- Include complete, relevant code context
- Embed specific standards and rules
- Provide clear success criteria
- Include examples from codebase

**DON'T:**
- Reference external files (`$STANDARDS`)
- Assume agent has any prior knowledge
- Include unnecessary context
- Exceed token limits

### 2. Result Processing

**DO:**
- Validate agent output before proceeding
- Maintain context between agent calls
- Update TodoWrite with agent results
- Check for partial completions

**DON'T:**
- Assume agent success
- Pass raw agent output to users
- Chain agents without processing
- Ignore error indicators

### 3. Parallel vs Sequential

**Use Parallel When:**
- Tasks are independent (security + performance review)
- Multiple perspectives needed
- Time optimization is important

**Use Sequential When:**
- Output of one feeds another
- Tasks have dependencies
- Context builds progressively

## Error Handling and Recovery

### Common Failure Modes

1. **Token Limit Exceeded**
   - Solution: Reduce context, focus on specific module
   - Prevention: Pre-calculate context size

2. **Agent Confusion**
   - Solution: Clarify prompt, add examples
   - Prevention: Test prompts incrementally

3. **Incomplete Results**
   - Solution: Break task into smaller pieces
   - Prevention: Set clear boundaries

### Recovery Strategies

```
If agent fails:
1. Analyze failure reason
2. Adjust context/prompt
3. Try different agent or approach
4. Fall back to Main Claude
5. Document issue for improvement
```

## Performance Optimization

### Context Optimization

- **Measure**: Calculate tokens before sending
- **Compress**: Remove comments, whitespace in code context
- **Focus**: Include only directly relevant code
- **Cache**: Reuse prepared contexts when possible

### Agent Selection

- **Right-size**: Use specialists only when needed
- **Batch**: Combine related tasks for single agent
- **Parallelize**: Run independent agents simultaneously

## Future Enhancements

### Potential Improvements

1. **Agent Feedback Loop**: Develop patterns for iterative refinement
2. **Context Templates**: Pre-built context structures for common tasks
3. **Agent Metrics**: Track success rates and optimize prompts
4. **Specialized Workflows**: Task-specific agent combinations

### Scaling Considerations

As the system grows:
- Monitor token usage patterns
- Develop context compression strategies
- Create agent prompt libraries
- Build agent selection heuristics

## Conclusion

The Dev-Agency Agent System leverages Claude Code's native architecture to create a powerful, scalable development workflow. By understanding and working within the technical constraints—stateless agents, pre-processed context, hub-and-spoke orchestration—we create a system that amplifies Claude's capabilities while maintaining reliability and consistency.

The key to success is treating agents not as team members but as specialized tools, with Main Claude as the intelligent orchestrator who knows when and how to use each tool effectively.

---

*Last Updated: 2025-08-09 | Version: 1.0*