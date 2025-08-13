---
title: VS Code Extension Guide - Dev-Agency
description: Comprehensive guide for using the Dev-Agency VS Code extension with AI-powered agents directly in your IDE
type: guide
category: developer-experience
tags: [vscode, ide-integration, extension, agents, development-workflow]
created: 2025-08-10
updated: 2025-08-10
---

# VS Code Extension Guide - Dev-Agency

Transform your development workflow with the Dev-Agency VS Code extension. This comprehensive guide covers installation, configuration, and advanced usage of AI-powered agents directly within your IDE environment.

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Features](#core-features)
5. [Agent Operations](#agent-operations)
6. [IntelliSense Integration](#intellisense-integration)
7. [Debug Integration](#debug-integration)
8. [Configuration](#configuration)
9. [Workspace Management](#workspace-management)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Troubleshooting](#troubleshooting)
12. [Advanced Usage](#advanced-usage)
13. [Tips and Tricks](#tips-and-tricks)

## Overview

The Dev-Agency VS Code extension brings the complete agentic development system directly into your IDE. No more context switching between VS Code and external terminals - everything you need is integrated seamlessly into your development environment.

### Key Benefits

- **🚀 Seamless Integration**: Agents work directly within VS Code
- **⚡ Real-time Feedback**: Live status updates and progress tracking
- **🧠 Context-Aware**: Intelligent suggestions based on your code
- **🔍 Visual Debugging**: Advanced debugging with execution visualization
- **🌟 Multi-Workspace**: Support for complex project structures

### Architecture Overview

```
┌─────────────────────────────────────────┐
│            VS Code Extension            │
│  ┌─────────────┐ ┌───────────────────┐  │
│  │  Command    │ │   Status Bar &    │  │
│  │  Palette    │ │   UI Components   │  │
│  └─────────────┘ └───────────────────┘  │
│  ┌─────────────┐ ┌───────────────────┐  │
│  │ IntelliSense│ │ Debug Integration │  │
│  │  Provider   │ │   (AGENT-023)     │  │
│  └─────────────┘ └───────────────────┘  │
└─────────────────────────────────────────┘
           │ Process Communication
           ▼
┌─────────────────────────────────────────┐
│         Dev-Agency CLI System           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Agent  │ │  Debug   │ │Performance│ │
│  │   CLI   │ │  Tools   │ │ Monitor  │ │
│  └─────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────┘
```

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions panel
3. Search for "Dev-Agency"
4. Click **Install** on the official Dev-Agency extension
5. Reload VS Code when prompted

![Installation Screenshot: VS Code Extensions panel showing Dev-Agency extension with install button highlighted]

### From VSIX File

If you have a `.vsix` file:

1. Open VS Code
2. Press `Ctrl+Shift+P` to open Command Palette
3. Type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file
5. Reload VS Code

### Development Installation

For contributors or development versions:

```bash
# Clone the repository
git clone https://github.com/dev-agency/vscode-extension
cd vscode-extension

# Install dependencies
npm install

# Build the extension
npm run compile

# Package the extension
npm run package

# Install locally
code --install-extension dev-agency-vscode-1.0.0.vsix
```

## Quick Start

### 1. Initial Configuration

After installation, configure the extension:

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "dev-agency"
3. Set the required paths:

```json
{
  "dev-agency.agentPath": "/home/user/Desktop/LAB/Dev-Agency",
  "dev-agency.cliPath": "/home/user/Desktop/LAB/Dev-Agency/tools/agent-cli/dist/cli.js"
}
```

![Configuration Screenshot: VS Code settings showing Dev-Agency configuration options with paths filled in]

### 2. Verify Installation

Check if the extension is working:

1. Look for the Dev-Agency icon in the status bar: `🤖 Dev-Agency`
2. Open Command Palette (`Ctrl+Shift+P`)
3. Type "Dev-Agency" - you should see available commands
4. Try invoking your first agent with `Ctrl+Alt+A`

### 3. Your First Agent Invocation

Let's invoke the architect agent:

1. Press `Ctrl+Alt+A` (or `Cmd+Alt+A` on Mac)
2. Select **architect** from the agent list
3. Enter a task: "Analyze the project structure"
4. Watch the real-time progress in the status bar
5. Review the results in the Dev-Agency output panel

![First Agent Screenshot: Command palette showing agent selection with architect highlighted and task input field]

## Core Features

### Agent Invocation Interface

The extension provides multiple ways to invoke agents:

#### Command Palette Integration
- Press `Ctrl+Shift+P`
- Type "Dev-Agency: Invoke Agent"
- Browse searchable agent commands
- Quick access to frequently used agents

![Command Palette Screenshot: VS Code command palette showing Dev-Agency commands with descriptions]

#### Context Menu Actions
- Right-click on any file or text selection
- Select "Dev-Agency" from context menu
- Choose appropriate agent for the context
- Automatic context passing to agents

![Context Menu Screenshot: Right-click context menu showing Dev-Agency submenu with agent options]

#### Sidebar Panel
- Access the Dev-Agency panel in the sidebar
- Browse agents organized by category
- View agent descriptions and capabilities
- One-click invocation with context

![Sidebar Panel Screenshot: Dev-Agency sidebar panel showing agent categories and descriptions]

### Real-time Status Display

#### Status Bar Widget

The status bar shows current agent activity:

- **🤖 Dev-Agency** - Ready for tasks
- **🔄 architect (45%)** - Running with progress
- **✅ coder** - Successfully completed
- **❌ tester** - Execution failed (click for details)

![Status Bar Screenshot: VS Code status bar showing different Dev-Agency status states]

#### Progress Tracking

Real-time progress updates include:

- **Execution Stage**: Current operation being performed
- **Progress Percentage**: Visual progress indicator
- **Estimated Completion**: Time remaining estimate
- **Resource Usage**: CPU and memory consumption

#### Execution History

Access recent agent executions:

1. Click the status bar widget
2. View execution history panel
3. Click any execution for detailed logs
4. Monitor performance metrics

### Integrated Output Panel

Dedicated VS Code output channel for agent responses:

- **Syntax Highlighting**: Formatted code and markdown
- **Collapsible Sections**: Organized output structure
- **Interactive Elements**: Clickable links and code snippets
- **Search and Filter**: Find specific information quickly

![Output Panel Screenshot: Dev-Agency output channel showing formatted agent response with syntax highlighting]

## Agent Operations

### Available Agents

#### Core Development Agents

**🏗️ architect**
- System design and architecture analysis
- Project structure recommendations
- Technology stack suggestions
- Best practices guidance

**💻 coder**
- Code implementation and generation
- Refactoring assistance
- Bug fixing and optimization
- Code review and improvements

**🧪 tester**
- Test creation and execution
- Quality assurance analysis
- Test coverage reporting
- Performance testing

**🔒 security**
- Security vulnerability analysis
- Code security review
- Best practices enforcement
- Compliance checking

**📚 documenter**
- Documentation generation
- API documentation creation
- README file maintenance
- Code commenting

#### Specialist Agents

**⚡ performance**
- Performance optimization analysis
- Bottleneck identification
- Resource usage optimization
- Caching strategies

**🔗 integration**
- Service integration development
- API design and implementation
- Third-party service connections
- Microservice architecture

**🎣 hooks**
- Hooks and middleware development
- Event handling systems
- Plugin architecture
- Lifecycle management

**📦 mcp-dev**
- MCP protocol implementation
- Message handling systems
- Protocol compliance validation
- Integration testing

**🧠 memory-sync**
- Context synchronization
- Memory management optimization
- State management solutions
- Data consistency validation

### Agent Invocation Methods

#### Method 1: Quick Invocation (`Ctrl+Alt+A`)

1. Press `Ctrl+Alt+A`
2. Select agent from dropdown
3. Enter task description
4. Press Enter to execute

#### Method 2: Context-Aware Invocation

1. Select code or open file
2. Right-click for context menu
3. Choose "Dev-Agency" → "Invoke Agent"
4. Agent automatically receives context

#### Method 3: Sidebar Invocation

1. Open Dev-Agency sidebar panel
2. Browse agent categories
3. Click agent for details
4. Use "Invoke" button

#### Method 4: Command Palette

1. Press `Ctrl+Shift+P`
2. Type agent name (e.g., "/agent:coder")
3. Select from suggestions
4. Provide task details

### Agent Parameters and Context

#### Automatic Context Detection

The extension automatically provides:

- **Current File**: Active file path and content
- **Text Selection**: Selected code or text
- **Project Structure**: Workspace organization
- **Language Context**: Programming language and framework
- **Git Information**: Branch, commits, and changes

#### Manual Context Specification

You can provide additional context:

```json
{
  "task": "Optimize this function",
  "context": {
    "performance_requirements": "sub-100ms execution",
    "memory_constraints": "minimal allocation",
    "compatibility": "ES2020+"
  }
}
```

### Agent Execution Monitoring

#### Real-time Updates

Monitor agent execution through:

- **Status Bar**: Current operation and progress
- **Output Panel**: Detailed execution logs
- **Notifications**: Important updates and alerts
- **Sidebar**: Execution queue and history

#### Performance Metrics

Track agent performance:

- **Execution Time**: Total time from start to completion
- **Token Usage**: Input and output token consumption
- **Confidence Score**: Agent's confidence in results
- **Resource Usage**: CPU and memory utilization

## IntelliSense Integration

### Code Completions

Agent-generated suggestions appear in IntelliSense:

#### Activation Triggers
- **Typing**: Automatic suggestions as you type
- **Context Switching**: Suggestions when changing files
- **Comment Analysis**: Suggestions based on code comments
- **Pattern Recognition**: Suggestions based on code patterns

#### Suggestion Types
- **Code Completion**: Complete functions, classes, variables
- **Code Generation**: Generate entire code blocks
- **Refactoring**: Improvement suggestions
- **Documentation**: Inline documentation suggestions

![IntelliSense Screenshot: VS Code IntelliSense dropdown showing agent-generated suggestions with confidence indicators]

#### Configuration

Customize IntelliSense behavior:

```json
{
  "dev-agency.enableInlineAnnotations": true,
  "dev-agency.suggestionDelay": 500,
  "dev-agency.maxSuggestions": 10,
  "dev-agency.confidenceThreshold": 0.7
}
```

### Hover Information

Rich hover tooltips provide:

- **Code Explanations**: Detailed explanations of code elements
- **Best Practices**: Recommendations for improvement
- **Documentation Links**: Links to relevant documentation
- **Alternative Approaches**: Suggested alternatives

![Hover Screenshot: Code hover tooltip showing agent-generated explanation with links and suggestions]

### Code Actions

Right-click code for agent-powered quick fixes:

- **"Explain Code"**: Detailed code explanations
- **"Optimize Code"**: Performance improvements
- **"Security Review"**: Security analysis
- **"Generate Tests"**: Automatic test creation
- **"Refactor"**: Code restructuring suggestions

### Smart Suggestions

Context-aware completions based on:

- **Project Dependencies**: Available libraries and frameworks
- **Code Patterns**: Existing code style and patterns
- **File Type**: Language-specific suggestions
- **Framework Context**: React, Vue, Angular, etc. specific suggestions

## Debug Integration

### Visual Debugger

Access advanced debugging through the integrated debugger:

#### Opening the Debugger
- Press `Ctrl+Alt+D`
- Use Command Palette: "Dev-Agency: Open Debugger"
- Click debugger icon in sidebar

#### Debug Interface Features

**Execution Visualization**
- Real-time execution flow diagrams
- Visual representation of agent workflows
- Interactive execution trees
- Performance bottleneck highlighting

![Debug Interface Screenshot: Web-based debug interface showing execution flow diagram with interactive elements]

**Breakpoint Management**
- Set breakpoints in agent workflows
- Conditional breakpoints with custom expressions
- Step-through execution control
- Variable inspection and modification

**Performance Analysis**
- Real-time performance metrics
- Memory usage monitoring
- CPU utilization tracking
- Execution time analysis

### Breakpoint Features

#### Setting Breakpoints

1. Open agent workflow file
2. Click line numbers to set breakpoints
3. Right-click for breakpoint options
4. Configure conditions and actions

#### Breakpoint Types

**Standard Breakpoints**
- Pause execution at specific lines
- Inspect current execution state
- View variable values and context

**Conditional Breakpoints**
- Pause only when conditions are met
- Custom expression evaluation
- Advanced filtering options

**Log Breakpoints**
- Log messages without stopping
- Custom message formatting
- Performance impact minimal

### Execution Traces

#### Step-through Debugging

- **Step Into**: Enter function calls
- **Step Over**: Skip function calls
- **Step Out**: Exit current function
- **Continue**: Resume execution

#### Trace Analysis

- **Execution History**: Complete execution timeline
- **Call Stack**: Function call hierarchy
- **Variable Changes**: Track variable modifications
- **Performance Metrics**: Timing and resource data

### Integration with AGENT-023

The debug integration leverages AGENT-023 capabilities:

- **Advanced Visualizations**: Rich execution diagrams
- **Performance Profiling**: Detailed performance analysis
- **Memory Management**: Memory usage tracking
- **Error Analysis**: Comprehensive error reporting

## Configuration

### Global Settings

Configure the extension globally through VS Code settings:

```json
{
  "dev-agency.agentPath": "/path/to/dev-agency",
  "dev-agency.cliPath": "/path/to/cli",
  "dev-agency.enableInlineAnnotations": true,
  "dev-agency.enableAutoInvocation": false,
  "dev-agency.debugPort": 8081,
  "dev-agency.maxConcurrentAgents": 3,
  "dev-agency.outputFormat": "markdown",
  "dev-agency.logLevel": "info",
  "dev-agency.statusBarPosition": "right",
  "dev-agency.enableNotifications": true,
  "dev-agency.cacheTimeout": 3600,
  "dev-agency.retryAttempts": 3,
  "dev-agency.theme": "auto"
}
```

### Setting Descriptions

#### Core Settings

**`dev-agency.agentPath`**
- Path to the Dev-Agency system directory
- Required for agent discovery and execution
- Example: `/home/user/Desktop/LAB/Dev-Agency`

**`dev-agency.cliPath`**
- Path to the Dev-Agency CLI executable
- Used for agent communication
- Example: `/path/to/dev-agency/tools/agent-cli/dist/cli.js`

**`dev-agency.maxConcurrentAgents`**
- Maximum number of agents running simultaneously
- Default: 3
- Range: 1-10

#### UI Settings

**`dev-agency.statusBarPosition`**
- Position of status bar widget
- Options: "left", "right"
- Default: "right"

**`dev-agency.outputFormat`**
- Format for agent outputs
- Options: "markdown", "plain", "json"
- Default: "markdown"

**`dev-agency.theme`**
- Extension theme preference
- Options: "light", "dark", "auto"
- Default: "auto" (follows VS Code theme)

#### Performance Settings

**`dev-agency.cacheTimeout`**
- Cache timeout in seconds
- Default: 3600 (1 hour)
- Set to 0 to disable caching

**`dev-agency.retryAttempts`**
- Number of retry attempts for failed operations
- Default: 3
- Range: 0-10

### Workspace Settings

Create workspace-specific configurations:

#### `.vscode/dev-agency.json`

```json
{
  "agentPreferences": {
    "architect": {
      "defaultDepth": 3,
      "includeTests": true,
      "analysisStyle": "comprehensive"
    },
    "coder": {
      "codeStyle": "functional",
      "includeComments": true,
      "preferredPatterns": ["async/await", "pure-functions"]
    },
    "tester": {
      "testFramework": "jest",
      "coverageThreshold": 80,
      "includeIntegrationTests": true
    }
  },
  "customAgents": [
    "./custom-agents/my-agent.md",
    "./custom-agents/project-specific-agent.md"
  ],
  "excludePatterns": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".git/**"
  ],
  "contextDepth": 10,
  "autoSaveBeforeExecution": true,
  "confirmDestructiveActions": true,
  "preferredLanguage": "typescript",
  "projectType": "web-application"
}
```

#### Per-Agent Configuration

```json
{
  "agentConfigurations": {
    "security": {
      "scanDepth": "deep",
      "includeThirdParty": true,
      "reportingLevel": "verbose",
      "excludeRules": ["rule-123", "rule-456"]
    },
    "performance": {
      "benchmarkSuite": "standard",
      "memoryProfiling": true,
      "performanceTarget": "production",
      "analysisDepth": "comprehensive"
    }
  }
}
```

### Authentication Configuration

For secure environments:

```json
{
  "dev-agency.authentication": {
    "method": "token",
    "tokenPath": "~/.dev-agency/token",
    "refreshToken": true,
    "timeout": 30
  }
}
```

## Workspace Management

### Multi-Root Workspaces

The extension supports complex workspace structures:

#### Workspace Detection
- Automatic detection of workspace roots
- Support for mono-repositories
- Per-workspace agent configurations
- Cross-workspace agent coordination

#### Configuration Inheritance

```
Multi-Root Workspace/
├── frontend/
│   └── .vscode/dev-agency.json    # Frontend-specific config
├── backend/
│   └── .vscode/dev-agency.json    # Backend-specific config
├── shared/
└── .vscode/
    └── dev-agency.json            # Global workspace config
```

#### Agent Context Scoping

Agents automatically understand workspace context:

- **Current Root**: Which workspace root is active
- **Related Roots**: Dependencies between workspace roots
- **Shared Resources**: Common files and configurations
- **Isolation Boundaries**: Separate concerns appropriately

### Project Type Detection

The extension automatically detects project types:

#### Supported Project Types
- **Web Applications**: React, Vue, Angular, etc.
- **Backend Services**: Node.js, Python, Go, etc.
- **Mobile Applications**: React Native, Flutter, etc.
- **Desktop Applications**: Electron, Tauri, etc.
- **Libraries and SDKs**: Package projects
- **Documentation Sites**: Gatsby, Next.js, etc.

#### Context Adaptation

Based on project type, the extension:

- Suggests relevant agents
- Provides appropriate code completions
- Configures debugging tools
- Optimizes performance settings

### File System Integration

#### File Watching

The extension monitors:
- Source code changes
- Configuration file updates
- Dependency modifications
- Git repository changes

#### Automatic Context Updates

When files change:
- Agent context is updated
- Suggestions are refreshed
- Performance metrics are recalculated
- Documentation is synchronized

## Keyboard Shortcuts

### Default Shortcuts

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Ctrl+Alt+A` | Invoke Agent | Quick agent selection and invocation |
| `Ctrl+Alt+S` | Show Status | Detailed agent status and history |
| `Ctrl+Alt+D` | Open Debugger | Launch debug visualizer |
| `Ctrl+Alt+R` | Refresh Agents | Reload agent definitions |
| `Ctrl+Alt+C` | Clear Cache | Clear extension caches |
| `Ctrl+Alt+L` | Show Logs | Open Dev-Agency output channel |

### Custom Shortcuts

You can customize shortcuts in VS Code settings:

```json
{
  "key": "ctrl+shift+a",
  "command": "dev-agency.invokeAgent",
  "when": "editorTextFocus"
},
{
  "key": "ctrl+shift+d",
  "command": "dev-agency.openDebugger",
  "when": "dev-agency.debuggerAvailable"
}
```

### Context-Sensitive Shortcuts

Some shortcuts work only in specific contexts:

#### In Editor
- `Ctrl+K Ctrl+A`: Explain selected code
- `Ctrl+K Ctrl+O`: Optimize selected code
- `Ctrl+K Ctrl+T`: Generate tests for selection
- `Ctrl+K Ctrl+S`: Security review of selection

#### In Sidebar
- `Enter`: Invoke selected agent
- `Space`: View agent details
- `Ctrl+R`: Refresh agent list
- `Ctrl+F`: Search agents

#### In Debug Mode
- `F5`: Continue execution
- `F10`: Step over
- `F11`: Step into
- `Shift+F11`: Step out
- `Shift+F5`: Stop debugging

## Troubleshooting

### Common Issues

#### Extension Won't Activate

**Symptoms:**
- No Dev-Agency icon in status bar
- Commands not available in palette
- Error messages in console

**Solutions:**
1. **Check VS Code Version**: Ensure VS Code v1.74+
2. **Verify Installation**: Look for errors in Extensions panel
3. **Review Logs**: Open Developer Console (`Help` → `Toggle Developer Tools`)
4. **Reinstall Extension**: Uninstall and reinstall the extension

#### Agents Not Loading

**Symptoms:**
- Agent list is empty
- "No agents found" messages
- Agent invocation fails

**Solutions:**
1. **Verify Agent Path**: Check `dev-agency.agentPath` setting
2. **Check Permissions**: Ensure read access to agent directory
3. **Validate Agent Format**: Confirm agent markdown format is correct
4. **Review File Structure**: Ensure agents are in correct directories

```bash
# Verify agent path structure
ls -la /path/to/dev-agency/Agents/
# Should show: architect.md, coder.md, tester.md, etc.
```

#### CLI Integration Issues

**Symptoms:**
- "CLI not found" errors
- Agent execution timeouts
- Connection failures

**Solutions:**
1. **Verify CLI Path**: Check `dev-agency.cliPath` setting
2. **Test CLI Manually**: Run CLI from terminal
3. **Check Dependencies**: Ensure Node.js and packages are installed
4. **Update CLI**: Ensure CLI version is compatible

```bash
# Test CLI manually
node /path/to/dev-agency/tools/agent-cli/dist/cli.js --version
```

#### Performance Issues

**Symptoms:**
- Slow agent responses
- VS Code freezing
- High CPU/memory usage

**Solutions:**
1. **Reduce Concurrency**: Lower `maxConcurrentAgents` setting
2. **Clear Caches**: Use "Dev-Agency: Clear Cache" command
3. **Monitor Resources**: Check Task Manager/Activity Monitor
4. **Optimize Settings**: Reduce `contextDepth` and cache settings

#### IntelliSense Not Working

**Symptoms:**
- No agent suggestions appear
- Hover information missing
- Code actions unavailable

**Solutions:**
1. **Enable Feature**: Check `enableInlineAnnotations` setting
2. **Restart Extension**: Reload VS Code window
3. **Check File Types**: Verify supported language extensions
4. **Review Confidence Threshold**: Adjust `confidenceThreshold` setting

#### Debug Integration Failures

**Symptoms:**
- Debugger won't open
- Breakpoints not working
- Execution visualization missing

**Solutions:**
1. **Check Debug Port**: Verify `debugPort` setting (default: 8081)
2. **Firewall Settings**: Ensure port is not blocked
3. **AGENT-023 Integration**: Verify debug tools are installed
4. **Browser Compatibility**: Try different browser for debug interface

### Debug Mode

Enable comprehensive logging:

```json
{
  "dev-agency.logLevel": "debug",
  "dev-agency.enableDiagnostics": true,
  "dev-agency.traceRequests": true
}
```

### Log Analysis

View detailed logs:

1. Open Output panel (`View` → `Output`)
2. Select "Dev-Agency" from dropdown
3. Review debug messages and errors
4. Look for specific error patterns

### Performance Diagnostics

#### Extension Performance

Monitor extension performance:

```json
{
  "dev-agency.enablePerformanceMonitoring": true,
  "dev-agency.reportPerformanceMetrics": true
}
```

#### Resource Usage

Check resource consumption:

1. Open Command Palette
2. Run "Developer: Show Running Extensions"
3. Find Dev-Agency extension
4. Review CPU and memory usage

### Getting Help

#### Support Channels

- **GitHub Issues**: [Extension Issues](https://github.com/dev-agency/vscode-extension/issues)
- **Documentation**: [Full Documentation](https://dev-agency.github.io/docs)
- **Community**: [GitHub Discussions](https://github.com/dev-agency/discussions)
- **Examples**: [Example Workflows](https://github.com/dev-agency/examples)

#### Reporting Issues

When reporting issues, include:

1. **VS Code Version**: `Help` → `About`
2. **Extension Version**: Extensions panel
3. **Operating System**: Windows/macOS/Linux
4. **Configuration**: Relevant settings
5. **Error Logs**: From output panel
6. **Reproduction Steps**: Detailed steps to reproduce

## Advanced Usage

### Custom Agents

Create project-specific agents:

#### Agent Definition Format

Create `./custom-agents/my-agent.md`:

```markdown
---
title: My Custom Agent
description: Project-specific functionality
type: agent
category: custom
tags: [project-specific, automation]
---

# My Custom Agent

## Purpose
Handles project-specific automation tasks.

## Capabilities
- Custom build processes
- Project-specific analysis
- Specialized code generation

## Usage
Invoke with project context for specialized tasks.

## Parameters
- `task`: Task description
- `context`: Project-specific context
- `options`: Custom options object
```

#### Agent Registration

Register in workspace settings:

```json
{
  "customAgents": [
    "./custom-agents/my-agent.md",
    "./custom-agents/build-agent.md"
  ]
}
```

### Workflow Automation

#### Agent Chaining

Create sequences of agent operations:

```json
{
  "workflows": {
    "full-stack-feature": [
      {
        "agent": "architect",
        "task": "Design feature architecture"
      },
      {
        "agent": "coder",
        "task": "Implement backend API",
        "dependsOn": ["architect"]
      },
      {
        "agent": "coder",
        "task": "Implement frontend components",
        "dependsOn": ["architect"]
      },
      {
        "agent": "tester",
        "task": "Create comprehensive tests",
        "dependsOn": ["coder"]
      },
      {
        "agent": "documenter",
        "task": "Update documentation",
        "dependsOn": ["coder", "tester"]
      }
    ]
  }
}
```

#### Scheduled Execution

Configure automatic agent execution:

```json
{
  "scheduledTasks": [
    {
      "agent": "security",
      "task": "Security audit",
      "schedule": "daily",
      "time": "02:00"
    },
    {
      "agent": "performance",
      "task": "Performance analysis",
      "schedule": "weekly",
      "day": "monday"
    }
  ]
}
```

### Integration with CI/CD

#### Pipeline Integration

Integrate with build pipelines:

```yaml
# .github/workflows/dev-agency.yml
name: Dev-Agency Integration
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  agent-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Run Security Agent
        run: |
          npx dev-agency-cli invoke security \
            --task "Review code changes" \
            --context "${{ github.event.head_commit.message }}"
      
      - name: Run Performance Agent
        run: |
          npx dev-agency-cli invoke performance \
            --task "Analyze performance impact"
```

### Advanced Configuration

#### Environment Variables

Configure via environment variables:

```bash
# .env
DEV_AGENCY_PATH=/path/to/dev-agency
DEV_AGENCY_CLI_PATH=/path/to/cli
DEV_AGENCY_LOG_LEVEL=debug
DEV_AGENCY_MAX_CONCURRENT=5
DEV_AGENCY_CACHE_TIMEOUT=7200
```

#### Configuration Profiles

Create configuration profiles:

```json
{
  "profiles": {
    "development": {
      "logLevel": "debug",
      "maxConcurrentAgents": 5,
      "enableInlineAnnotations": true
    },
    "production": {
      "logLevel": "info",
      "maxConcurrentAgents": 2,
      "enableInlineAnnotations": false
    },
    "testing": {
      "logLevel": "verbose",
      "maxConcurrentAgents": 10,
      "enableDiagnostics": true
    }
  },
  "activeProfile": "development"
}
```

## Tips and Tricks

### Productivity Tips

#### 1. Use Context Wisely

- **Select Relevant Code**: Highlight specific code sections for focused analysis
- **Use File Context**: Open relevant files before invoking agents
- **Provide Clear Tasks**: Write specific, actionable task descriptions

#### 2. Master Keyboard Shortcuts

- **Quick Invocation**: `Ctrl+Alt+A` for instant agent access
- **Context Actions**: `Ctrl+K Ctrl+A` for selected code explanation
- **Debug Launch**: `Ctrl+Alt+D` for immediate debugging

#### 3. Leverage Agent Specialization

- **architect**: Use for system design and architecture decisions
- **coder**: Use for implementation and code generation
- **tester**: Use for comprehensive testing strategies
- **security**: Use for security reviews and vulnerability analysis
- **performance**: Use for optimization and performance tuning

#### 4. Optimize Settings

- **Cache Configuration**: Set appropriate cache timeouts
- **Concurrency Limits**: Balance performance with resource usage
- **Output Formatting**: Choose formats that match your workflow

#### 5. Monitor Performance

- **Status Bar**: Keep an eye on execution progress
- **Output Panel**: Review detailed execution logs
- **Performance Metrics**: Monitor resource usage

### Workflow Integration

#### Morning Routine

1. **Security Scan**: Start with security agent review
2. **Architecture Review**: Check system architecture with architect
3. **Code Quality**: Review code quality with coder agent
4. **Test Coverage**: Verify test coverage with tester

#### Feature Development

1. **Design Phase**: Use architect agent for feature design
2. **Implementation**: Use coder agent for implementation
3. **Testing**: Use tester agent for test creation
4. **Documentation**: Use documenter agent for documentation
5. **Security Review**: Use security agent for final review

#### Bug Fixing

1. **Analysis**: Use architect agent to understand the issue
2. **Implementation**: Use coder agent to fix the bug
3. **Testing**: Use tester agent to verify the fix
4. **Regression Testing**: Use tester agent for regression tests

### Advanced Techniques

#### Agent Composition

Combine multiple agents for complex tasks:

```json
{
  "compositeTask": {
    "name": "Full Feature Implementation",
    "agents": [
      {
        "agent": "architect",
        "weight": 0.3,
        "task": "System design"
      },
      {
        "agent": "coder",
        "weight": 0.4,
        "task": "Implementation"
      },
      {
        "agent": "tester",
        "weight": 0.2,
        "task": "Testing"
      },
      {
        "agent": "documenter",
        "weight": 0.1,
        "task": "Documentation"
      }
    ]
  }
}
```

#### Context Preprocessing

Enhance context before agent invocation:

```json
{
  "contextEnhancement": {
    "includeGitHistory": true,
    "analyzeDependencies": true,
    "includeTestResults": true,
    "parseComments": true,
    "extractTodos": true
  }
}
```

#### Result Post-processing

Configure result handling:

```json
{
  "resultProcessing": {
    "autoApplySimpleFixes": true,
    "createPullRequests": false,
    "updateDocumentation": true,
    "notifyTeam": false,
    "archiveResults": true
  }
}
```

### Team Collaboration

#### Shared Configurations

Share team configurations via version control:

```bash
# Commit workspace configuration
git add .vscode/dev-agency.json
git commit -m "Add shared Dev-Agency configuration"
```

#### Agent Library

Create team-specific agent library:

```
team-agents/
├── backend-specialist.md
├── frontend-specialist.md
├── devops-agent.md
└── security-specialist.md
```

#### Best Practices

1. **Consistent Naming**: Use consistent naming conventions
2. **Documentation**: Document custom agents and workflows
3. **Version Control**: Keep configurations in version control
4. **Code Reviews**: Include agent outputs in code reviews
5. **Training**: Train team members on extension usage

---

## Conclusion

The Dev-Agency VS Code extension transforms your development workflow by bringing AI-powered agents directly into your IDE. With seamless integration, real-time feedback, and advanced debugging capabilities, you can focus on building great software while agents handle routine tasks and provide intelligent suggestions.

Start with basic agent invocation, gradually explore advanced features like debugging integration and workflow automation, and customize the extension to match your development style. The extension grows with your needs, from simple code suggestions to complex multi-agent workflows.

### Next Steps

1. **Install and Configure**: Set up the extension in your development environment
2. **Explore Agents**: Try different agents to understand their capabilities
3. **Customize Settings**: Tailor the extension to your workflow preferences
4. **Advanced Features**: Experiment with debugging and automation features
5. **Team Adoption**: Share configurations and best practices with your team

### Resources

- **Extension Repository**: [GitHub Repository](https://github.com/dev-agency/vscode-extension)
- **Documentation**: [Complete Documentation](https://dev-agency.github.io/docs)
- **Examples**: [Usage Examples](https://github.com/dev-agency/examples)
- **Community**: [Join Discussions](https://github.com/dev-agency/discussions)

Transform your development experience today with the power of AI agents in VS Code!