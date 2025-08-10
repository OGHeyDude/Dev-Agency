# Dev-Agency VS Code Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=dev-agency.vscode)
[![VS Code](https://img.shields.io/badge/VS%20Code-v1.74+-brightgreen.svg)](https://code.visualstudio.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Native VS Code integration for the Dev-Agency agentic development system. Transform your development workflow with AI-powered agents directly within your IDE.

## Features

### 🤖 **Agent Invocation**
- **Command Palette Integration**: Invoke agents via `Ctrl+Alt+A` or command palette
- **Context Menu Actions**: Right-click files/selections for contextual agent operations  
- **Quick Agent Selection**: Browse and select from available agents with rich descriptions
- **Real-time Progress**: Live progress indicators for running agent executions

### 📊 **Real-time Status Display**
- **Status Bar Widget**: Persistent status indicator showing current agent activity
- **Progress Tracking**: Visual progress bars and completion estimates
- **Execution History**: View recent agent executions with details and outputs
- **Error Notifications**: User-friendly error messages with recovery suggestions

### 💡 **IntelliSense Integration**
- **Code Completions**: Agent-generated suggestions in IntelliSense
- **Hover Information**: Contextual code explanations and insights
- **Code Actions**: Quick fixes and improvements from agents
- **Smart Suggestions**: Context-aware completions based on current code

### 🔍 **Debug Integration**
- **Visual Debugging**: Integrated debugging interface powered by AGENT-023
- **Breakpoint Management**: Set breakpoints in agent workflows
- **Execution Traces**: Step-through agent execution with detailed traces
- **Performance Analysis**: Real-time performance monitoring and bottleneck detection

### 🌟 **Context-Aware Operations**
- **Workspace Analysis**: Automatic project structure and framework detection
- **File Context**: Smart context extraction from current files and selections
- **Multi-workspace Support**: Per-workspace configurations and preferences
- **Intelligent Filtering**: Context-based agent suggestions and actions

### ⚙️ **Advanced Configuration**
- **VS Code Settings**: Full integration with VS Code configuration system
- **Workspace Preferences**: Project-specific agent configurations
- **Custom Agents**: Support for custom agent definitions
- **Performance Tuning**: Configurable concurrency, caching, and resource limits

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Dev-Agency"
4. Click "Install"

### From VSIX File
1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Run `Extensions: Install from VSIX` command
4. Select the downloaded file

### Development Installation
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
```

## Quick Start

### 1. **Configure Dev-Agency Path**
```json
{
  "dev-agency.agentPath": "/path/to/dev-agency",
  "dev-agency.cliPath": "/path/to/dev-agency/tools/agent-cli/dist/cli.js"
}
```

### 2. **Invoke Your First Agent**
- Press `Ctrl+Alt+A` (or `Cmd+Alt+A` on Mac)
- Select an agent from the list
- Enter your task description
- Watch the magic happen!

### 3. **Explore Agent Capabilities**
- Open the Dev-Agency sidebar panel
- Browse available agents by category
- View agent capabilities and requirements
- Check recent execution history

## Usage Guide

### Agent Invocation

#### Via Command Palette
1. Press `Ctrl+Shift+P` to open command palette
2. Type "Dev-Agency: Invoke Agent"
3. Select your desired agent
4. Provide task description and context

#### Via Context Menu  
1. Right-click on file or text selection
2. Choose "Dev-Agency" → "Invoke Agent"
3. Select appropriate agent for the context
4. Agent will automatically use the selected context

#### Via Sidebar
1. Open the Dev-Agency panel in sidebar
2. Browse agents by category
3. Click on agent to see details
4. Use "Invoke" button for quick execution

### Real-time Monitoring

#### Status Bar
- **Idle**: `🤖 Dev-Agency` - Ready for new tasks
- **Running**: `🔄 Agent Name (50%)` - Active execution with progress
- **Success**: `✅ Agent Name` - Successful completion
- **Error**: `❌ Agent Name` - Execution failed

#### Execution Panel
- View active, queued, and recent executions
- Click executions to see details or cancel
- Monitor progress and performance metrics
- Access execution logs and outputs

### IntelliSense Features

#### Code Completions
- Type code naturally - agents provide contextual suggestions
- Agent suggestions appear with confidence indicators
- Apply suggestions with `Tab` or `Enter`
- Multiple suggestion types: completion, replacement, insertion

#### Hover Information
- Hover over code elements for agent insights
- Get explanations, best practices, and alternatives  
- Links to documentation and related resources
- Context-aware analysis based on your project

#### Code Actions
- Right-click code for agent-powered quick fixes
- "Explain Code" - Get detailed code explanations
- "Optimize Code" - Performance improvement suggestions  
- "Security Review" - Security vulnerability analysis
- "Generate Tests" - Automatic test generation

### Debug Integration

#### Visual Debugger
- Access via `Ctrl+Alt+D` or "Dev-Agency: Open Debugger"
- Web-based debugging interface with rich visualizations
- Real-time execution monitoring and analysis
- Integration with AGENT-023 debug visualizer

#### Breakpoints
- Set breakpoints in agent workflows
- Conditional breakpoints with custom expressions
- Step through agent execution line by line
- Inspect variables and execution context

#### Performance Analysis
- Real-time performance metrics
- Bottleneck detection and analysis
- Memory usage and CPU utilization
- Execution time analysis and optimization suggestions

### Configuration

#### Global Settings
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
  "dev-agency.enableNotifications": true
}
```

#### Workspace Settings
Create `.vscode/dev-agency.json` in your workspace:
```json
{
  "agentPreferences": {
    "architect": {
      "defaultDepth": 3,
      "includeTests": true
    },
    "coder": {
      "codeStyle": "functional",
      "includeComments": true
    }
  },
  "customAgents": ["./custom-agents/my-agent.md"],
  "excludePatterns": ["node_modules/**", "dist/**"],
  "contextDepth": 10,
  "autoSaveBeforeExecution": true,
  "confirmDestructiveActions": true
}
```

## Commands

| Command | Keybinding | Description |
|---------|------------|-------------|
| `dev-agency.invokeAgent` | `Ctrl+Alt+A` | Open agent selection and invoke |
| `dev-agency.showStatus` | `Ctrl+Alt+S` | Show detailed agent status |
| `dev-agency.openDebugger` | `Ctrl+Alt+D` | Open debug visualizer |
| `dev-agency.selectAgent` | - | Quick agent selection picker |
| `dev-agency.showOutput` | - | Show Dev-Agency output channel |
| `dev-agency.refreshAgents` | - | Refresh available agents |
| `dev-agency.clearCache` | - | Clear extension caches |

## Available Agents

### Core Development Agents
- **🏗️ architect** - System design and architecture analysis
- **💻 coder** - Code implementation and generation  
- **🧪 tester** - Test creation and quality assurance
- **🔒 security** - Security analysis and vulnerability detection
- **📚 documenter** - Documentation generation and maintenance

### Specialist Agents  
- **⚡ performance** - Performance optimization and analysis
- **🔗 integration** - Service integration and API development
- **🎣 hooks** - Hooks and middleware development
- **📦 mcp-dev** - MCP protocol specialist
- **🧠 memory-sync** - Context synchronization and memory management

### Custom Agents
- Define your own agents in markdown format
- Place in workspace `.vscode/agents/` directory
- Configure via workspace settings
- Full IntelliSense and debugging support

## Troubleshooting

### Common Issues

#### Extension Won't Activate
- **Check VS Code Version**: Ensure VS Code v1.74+
- **Verify Installation**: Check Extensions panel for errors
- **Review Logs**: Open Developer Console (`Help` → `Toggle Developer Tools`)

#### Agents Not Loading
- **Verify Agent Path**: Check `dev-agency.agentPath` setting
- **Check Permissions**: Ensure read access to agent directory
- **Review Agent Format**: Validate agent markdown format

#### CLI Integration Issues  
- **Verify CLI Path**: Check `dev-agency.cliPath` setting
- **Test CLI Manually**: Run CLI from terminal to verify functionality
- **Check Dependencies**: Ensure Node.js and required packages installed

#### Performance Issues
- **Reduce Concurrency**: Lower `maxConcurrentAgents` setting
- **Clear Caches**: Use "Dev-Agency: Clear Cache" command
- **Check Resources**: Monitor CPU and memory usage

### Debug Mode
Enable debug logging:
```json
{
  "dev-agency.logLevel": "debug"
}
```

View debug output:
1. Open Output panel (`View` → `Output`)
2. Select "Dev-Agency" from dropdown
3. Review debug messages and errors

### Support
- **Issues**: [GitHub Issues](https://github.com/dev-agency/vscode-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dev-agency/vscode-extension/discussions)  
- **Documentation**: [Full Documentation](https://dev-agency.github.io/docs)
- **Examples**: [Example Workflows](https://github.com/dev-agency/examples)

## Architecture

### Extension Structure
```
src/
├── extension.ts              # Main extension entry point
├── core/
│   └── AgentManager.ts      # Agent discovery and execution
├── commands/
│   └── CommandProvider.ts   # Command palette integration
├── ui/
│   ├── StatusBarProvider.ts # Status bar widget
│   ├── AgentTreeProvider.ts # Sidebar agent tree
│   └── WebviewProvider.ts   # Custom panels
├── intellisense/
│   └── IntelliSenseProvider.ts # Code completions
├── debug/
│   └── DebugProvider.ts     # Debug integration  
├── context/
│   └── ContextManager.ts    # Workspace analysis
├── config/
│   └── ConfigurationManager.ts # Settings management
└── utils/
    ├── ExtensionLogger.ts   # Logging system
    └── ErrorHandler.ts      # Error management
```

### Communication Flow
```
VS Code Extension ←→ Agent CLI ←→ Dev-Agency System
       ↕                ↕              ↕
   Debug Server ←→ Visualizer ←→ AGENT-023
```

### Performance Features
- **Concurrent Execution**: Multiple agents run in parallel
- **Smart Caching**: Intelligent context and result caching
- **Background Processing**: Non-blocking agent execution  
- **Resource Management**: Memory and CPU usage optimization
- **Incremental Updates**: Efficient UI updates and synchronization

## Contributing

### Development Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run watch

# Launch extension development host
F5 (or Run → Start Debugging)
```

### Building
```bash
# Compile TypeScript
npm run compile

# Bundle for production  
npm run webpack

# Package extension
npm run package

# Lint code
npm run lint

# Run tests
npm test
```

### Guidelines
- Follow [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- Use TypeScript for type safety
- Write comprehensive tests
- Update documentation for new features
- Follow semantic versioning

## Changelog

### v1.0.0 (2025-08-10)
- 🎉 Initial release
- ✨ Agent invocation via command palette and context menus
- 📊 Real-time status display in status bar
- 💡 IntelliSense integration with code suggestions
- 🔍 Debug integration with AGENT-023 visualizer
- 🌟 Context-aware operations and workspace support
- ⚙️ Comprehensive configuration system
- 🎨 Professional UI with VS Code theme integration
- 📚 Complete documentation and examples

## Roadmap

### v1.1.0 - Enhanced Collaboration
- Multi-user agent sessions
- Shared workspace configurations
- Real-time collaboration features
- Team agent libraries

### v1.2.0 - Advanced AI Features  
- Agent learning from user feedback
- Predictive agent suggestions
- Advanced context understanding
- Custom model integration

### v1.3.0 - Workflow Automation
- Agent workflow designer
- Scheduled agent executions
- CI/CD pipeline integration
- Advanced automation triggers

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Developed with ❤️ by the Dev-Agency team.

- **Architecture**: Based on VS Code Extension API best practices
- **Debug Integration**: Powered by AGENT-023 visualization system
- **Agent System**: Integrated with Dev-Agency CLI and agent framework
- **UI Components**: Designed for VS Code theme compatibility

---

**Get started today and transform your development workflow with intelligent agents!**

[📖 Documentation](https://dev-agency.github.io/docs) | [💬 Community](https://github.com/dev-agency/discussions) | [🐛 Issues](https://github.com/dev-agency/vscode-extension/issues) | [⭐ Star on GitHub](https://github.com/dev-agency/vscode-extension)