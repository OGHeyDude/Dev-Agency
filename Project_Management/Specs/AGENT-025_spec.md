---
title: AGENT-025 - VS Code Extension for Dev-Agency
description: Native VS Code extension with agent invocation, real-time status, inline code suggestions, and integrated debugging within IDE environment
type: spec
category: developer-experience
tags: [vscode, ide-integration, extension, agent-invocation, real-time-status, inline-suggestions, debugging]
created: 2025-08-10
updated: 2025-08-10
---

# **Spec: VS Code Extension for Dev-Agency**

**Ticket ID:** `AGENT-025`  
**Status:** `BACKLOG`  
**Last Updated:** 2025-08-10  
**Story Points:** 8  
**Epic:** Developer Experience  
**Link to Project Plan:** [PROJECT_PLAN.md](../PROJECT_PLAN.md)

## **1. Problem & Goal**

**Problem:** Developers using the Dev-Agency system must constantly switch between VS Code and external terminals/CLIs to invoke agents, check status, and review agent outputs. This context switching disrupts the development flow, reduces productivity, and makes it difficult to correlate agent suggestions with specific code locations. The current CLI-based workflow requires memorizing commands, lacks visual feedback, and provides no integration with VS Code's debugging and IntelliSense capabilities.

**Goal:** Create a native VS Code extension that brings the complete Dev-Agency system directly into the IDE environment. Enable seamless agent invocation through command palette and context menus, provide real-time agent status in the status bar, offer inline code suggestions from agents, and integrate advanced debugging tools from AGENT-023. Transform the development workflow from CLI-based to IDE-native with rich visual feedback and contextual agent interactions.

## **2. Acceptance Criteria**

* [ ] **Agent Invocation Interface:** Command palette integration with searchable agent commands (`/agent:architect`, `/agent:coder`, etc.) and context menu options for file/selection-specific agent actions
* [ ] **Real-time Status Display:** Persistent status bar widget showing current agent execution status, progress indicators, and clickable status for detailed execution logs
* [ ] **Inline Code Suggestions:** Agent-generated code suggestions displayed as IntelliSense completions, hover tooltips, and inline annotations with accept/reject actions
* [ ] **Integrated Output Panel:** Dedicated VS Code output channel for agent responses with syntax highlighting, collapsible sections, and interactive code snippets
* [ ] **Debug Integration:** Integration with AGENT-023 debugging tools including breakpoint setting in agent workflows, step-through execution, and visual execution flow diagrams within VS Code panels
* [ ] **Context-Aware Operations:** Automatic context detection from current file, selection, or project structure to provide relevant agent suggestions and streamlined invocations
* [ ] **Workspace Integration:** Support for multi-root workspaces with per-workspace agent configurations, project-specific agent preferences, and cross-project agent coordination
* [ ] **Settings and Configuration:** Comprehensive VS Code settings integration for agent preferences, authentication, output formatting, and extension behavior customization
* [ ] **Error Handling and Feedback:** User-friendly error messages, retry mechanisms, and contextual help for failed agent operations with guided troubleshooting
* [ ] **Performance Optimization:** Non-blocking agent execution, background processing for long-running agents, and efficient resource management to maintain IDE responsiveness

## **3. Technical Plan**

**Approach:** Build a TypeScript-based VS Code extension leveraging VS Code Extension API for deep IDE integration. Implement agent communication through the existing Dev-Agency CLI tool as a backend service, with WebSocket or IPC for real-time status updates. Design modular architecture with separate components for UI, agent communication, debug integration, and configuration management.

### **Architecture Overview**

```
VS Code Extension Architecture:

┌─────────────────────────────────────────────┐
│              VS Code Extension              │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Command     │ │  Status Bar & UI        │ │
│  │ Palette     │ │  Components             │ │
│  └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │ IntelliSense│ │  Debug Integration      │ │
│  │ Provider    │ │  (AGENT-023)            │ │
│  └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Output      │ │  Configuration          │ │
│  │ Channel     │ │  Manager                │ │
│  └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────┘
           │ Process Communication
           ▼
┌─────────────────────────────────────────────┐
│            Extension Backend               │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Agent       │ │  Status Monitor         │ │
│  │ Controller  │ │  & WebSocket Server     │ │
│  └─────────────┘ └─────────────────────────┘ │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │ Context     │ │  Debug Visualizer       │ │
│  │ Analyzer    │ │  Integration            │ │
│  └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────┘
           │ CLI Process / HTTP
           ▼
┌─────────────────────────────────────────────┐
│        Existing Dev-Agency System           │
│  ┌─────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ Agent   │ │ Debug     │ │ Performance │  │
│  │ CLI     │ │ Tools     │ │ Monitor     │  │
│  └─────────┘ └───────────┘ └─────────────┘  │
└─────────────────────────────────────────────┘
```

### **System Components**

**1. VS Code Extension Structure**
```
/extensions/vscode-dev-agency/
├── src/
│   ├── extension.ts                      # Main extension entry point
│   ├── commands/
│   │   ├── AgentCommandProvider.ts       # Command palette integration
│   │   ├── ContextMenuProvider.ts        # Right-click context menus
│   │   ├── AgentInvoker.ts              # Agent execution coordinator
│   │   └── CommandRegistry.ts           # Command registration and routing
│   ├── ui/
│   │   ├── StatusBarProvider.ts         # Status bar widget and controls
│   │   ├── OutputChannelProvider.ts     # Dedicated output channel
│   │   ├── WebviewProvider.ts           # Custom panels and debug views
│   │   ├── ProgressIndicator.ts         # Progress tracking and display
│   │   └── NotificationManager.ts       # User notifications and alerts
│   ├── intellisense/
│   │   ├── CompletionProvider.ts        # IntelliSense suggestions from agents
│   │   ├── HoverProvider.ts             # Hover tooltips with agent insights
│   │   ├── CodeActionProvider.ts        # Quick fix actions from agents
│   │   └── InlineAnnotationProvider.ts  # Inline code annotations
│   ├── debug/
│   │   ├── DebugProvider.ts             # Debug adapter protocol integration
│   │   ├── BreakpointManager.ts         # Agent workflow breakpoints
│   │   ├── ExecutionVisualizer.ts       # Flow diagram rendering
│   │   └── TraceViewer.ts               # AGENT-023 integration
│   ├── backend/
│   │   ├── AgentBackend.ts              # Backend service coordinator
│   │   ├── WebSocketServer.ts           # Real-time communication
│   │   ├── CLIManager.ts                # Dev-Agency CLI integration
│   │   ├── ProcessManager.ts            # Agent process lifecycle
│   │   └── StatusMonitor.ts             # Agent execution monitoring
│   ├── context/
│   │   ├── ContextAnalyzer.ts           # File and project context extraction
│   │   ├── WorkspaceManager.ts          # Multi-workspace support
│   │   ├── FileWatcher.ts               # File change detection
│   │   └── ProjectDetector.ts           # Project type and structure analysis
│   ├── config/
│   │   ├── ConfigurationManager.ts      # VS Code settings integration
│   │   ├── AuthenticationProvider.ts    # Secure credential management
│   │   ├── WorkspaceConfig.ts           # Per-workspace preferences
│   │   └── AgentPreferences.ts          # Agent-specific configurations
│   └── utils/
│       ├── Logger.ts                    # Extension logging
│       ├── ErrorHandler.ts              # Error management and recovery
│       ├── TextProcessor.ts             # Code analysis and formatting
│       └── FileSystemUtils.ts           # File operation utilities
├── resources/
│   ├── icons/                           # Extension and status icons
│   ├── webview/                         # Custom webview HTML/CSS/JS
│   └── templates/                       # Code templates and snippets
├── syntaxes/                            # Custom syntax highlighting
├── schemas/                             # JSON schemas for configuration
├── package.json                         # Extension manifest and configuration
├── tsconfig.json                        # TypeScript configuration
├── webpack.config.js                    # Bundling configuration
└── README.md                            # Extension documentation
```

**2. Extension Manifest Configuration**
```json
{
  "name": "dev-agency-vscode",
  "displayName": "Dev-Agency",
  "description": "Native VS Code integration for the Dev-Agency agentic development system",
  "version": "1.0.0",
  "engines": { "vscode": "^1.74.0" },
  "categories": ["AI", "Programming Languages", "Debuggers", "Other"],
  "activationEvents": [
    "onStartupFinished",
    "onCommand:dev-agency.invokeAgent",
    "onLanguage:typescript",
    "onLanguage:javascript",
    "onLanguage:python"
  ],
  "contributes": {
    "commands": [
      {
        "command": "dev-agency.invokeAgent",
        "title": "Invoke Agent",
        "category": "Dev-Agency"
      },
      {
        "command": "dev-agency.showStatus",
        "title": "Show Agent Status",
        "category": "Dev-Agency"
      },
      {
        "command": "dev-agency.openDebugger",
        "title": "Open Agent Debugger",
        "category": "Dev-Agency"
      }
    ],
    "menus": {
      "commandPalette": [
        {
          "command": "dev-agency.invokeAgent",
          "when": "dev-agency.enabled"
        }
      ],
      "editor/context": [
        {
          "command": "dev-agency.invokeAgent",
          "group": "dev-agency",
          "when": "editorHasSelection"
        }
      ]
    },
    "configuration": {
      "title": "Dev-Agency",
      "properties": {
        "dev-agency.agentPath": {
          "type": "string",
          "description": "Path to Dev-Agency CLI tool"
        },
        "dev-agency.enableInlineAnnotations": {
          "type": "boolean",
          "default": true
        }
      }
    }
  }
}
```

**3. Core Features Implementation**

**Agent Invocation System:**
```typescript
interface AgentInvocation {
  agentId: string;
  context: {
    file?: string;
    selection?: vscode.Selection;
    project?: string;
    workspace?: string;
  };
  parameters: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  background?: boolean;
}

interface AgentResponse {
  success: boolean;
  output: string;
  suggestions?: CodeSuggestion[];
  actions?: AgentAction[];
  metadata: {
    executionTime: number;
    tokensUsed: number;
    confidence: number;
  };
}
```

**Real-time Status Integration:**
```typescript
interface StatusBarItem extends vscode.StatusBarItem {
  updateAgentStatus(status: AgentExecutionStatus): void;
  showProgress(progress: ProgressInfo): void;
  displayError(error: AgentError): void;
}

interface AgentExecutionStatus {
  agentId: string;
  status: 'idle' | 'running' | 'success' | 'error';
  progress?: number;
  message?: string;
  startTime: Date;
  estimatedCompletion?: Date;
}
```

**IntelliSense Integration:**
```typescript
export class AgentCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem[]> {
    // Provide agent-generated code suggestions
    const context = await this.analyzeContext(document, position);
    const suggestions = await this.invokeAgent('coder', context);
    return suggestions.map(s => this.createCompletionItem(s));
  }
}
```

**Debug Integration:**
```typescript
interface DebugSession extends vscode.DebugSession {
  agentBreakpoints: AgentBreakpoint[];
  executionTrace: ExecutionStep[];
  visualizer: ExecutionFlowVisualizer;
}

interface AgentBreakpoint {
  agentId: string;
  condition?: string;
  hitCondition?: string;
  logMessage?: string;
}
```

### **Affected Components**

- Integration with existing Dev-Agency CLI tool (`/tools/agent-cli/`)
- Connection to AGENT-023 debugging system (`/tools/debug-visualizer/`)
- Extension of agent invocation patterns (`/Agents/`)
- VS Code Extension Marketplace publication and distribution
- Development environment configuration and setup documentation

### **New Dependencies**

- **@types/vscode** for VS Code API type definitions
- **@vscode/extension-telemetry** for usage analytics and diagnostics
- **vscode-languageserver** for advanced language server protocol features
- **ws** for WebSocket communication with backend services
- **chokidar** for efficient file system watching
- **glob** for file pattern matching and workspace analysis
- **semver** for version compatibility checking
- **node-pty** for terminal integration and process management
- **d3** for execution flow visualization (debug integration)
- **monaco-editor** for embedded code editors in webviews
- **webpack** for extension bundling and optimization

## **4. Feature Boundaries & Impact**

### **Owned Resources** (Safe to Modify)
- [ ] `/extensions/vscode-dev-agency/*` (complete VS Code extension codebase)
- [ ] `/extensions/vscode-dev-agency/src/*` (all extension implementation files)
- [ ] `/extensions/vscode-dev-agency/resources/*` (icons, webviews, templates)
- [ ] `/extensions/vscode-dev-agency/syntaxes/*` (custom syntax highlighting)
- [ ] `/extensions/vscode-dev-agency/schemas/*` (JSON schemas for configuration)
- [ ] `/docs/vscode-extension/*` (extension documentation and guides)

### **Shared Dependencies** (Constraints Apply)
- [ ] `/tools/agent-cli/*` (READ-ONLY - consume CLI tool as subprocess)
- [ ] `/tools/debug-visualizer/*` (INTEGRATE-ONLY - embed debugging components)
- [ ] `/Agents/*.md` (READ-ONLY - reference agent definitions for UI)
- [ ] `/Project_Management/PROJECT_PLAN.md` (READ-ONLY - workspace context analysis)
- [ ] VS Code Extension API (VERSION-CONSTRAINED - maintain backward compatibility)
- [ ] Node.js runtime (EXTEND-ONLY - extension host environment)

### **Impact Radius**
- **Direct impacts:** New VS Code extension with system integration, enhanced developer workflow
- **Indirect impacts:** Increased Dev-Agency CLI usage, potential performance impact on VS Code
- **Required regression tests:** Extension activation, agent invocation, UI responsiveness, debug integration

### **Safe Modification Strategy**
- [ ] Build as standalone extension consuming existing Dev-Agency system via CLI
- [ ] Use VS Code Extension API best practices for performance and compatibility
- [ ] Implement graceful fallbacks when Dev-Agency CLI is unavailable
- [ ] Use extension host isolation to prevent VS Code crashes from agent failures
- [ ] Create comprehensive test suite with mocked VS Code API responses
- [ ] Design for cross-platform compatibility (Windows, macOS, Linux)
- [ ] Implement proper cleanup and resource disposal on extension deactivation

### **Technical Enforcement**
- **Pre-commit hooks:** `extension-tests`, `vscode-api-compatibility`, `bundle-size-check`
- **CI/CD checks:** `extension-packaging`, `marketplace-validation`, `cross-platform-testing`
- **File permissions:** Secure credential storage, proper file system access patterns

## **5. Research & References**

**VS Code Extension Development:**
- VS Code Extension API documentation and best practices
- VS Code Extension Samples repository for implementation patterns
- Language Server Protocol specification for advanced IDE features
- Debug Adapter Protocol for debugging integration
- Webview API for custom UI panels and visualization

**Existing Dev-Agency System Analysis:**
- `/tools/agent-cli/src/cli.ts` - CLI interface patterns and command structure
- `/tools/agent-cli/src/core/AgentManager.ts` - Agent execution and management
- `/Project_Management/Specs/AGENT-023_spec.md` - Debug integration requirements
- `/Project_Management/Specs/AGENT-013_spec.md` - CLI tool architecture and capabilities
- `/feedback/metrics_dashboard.md` - Performance monitoring integration opportunities

**IDE Integration Patterns:**
- GitHub Copilot VS Code extension architecture and user experience
- GitLens extension for advanced Git integration within VS Code
- Python extension for language server integration and debugging
- Thunder Client extension for API testing within VS Code
- Bracket Pair Colorizer for real-time code enhancement

**Technical Resources:**
- VS Code Extension Generator (Yeoman) for project scaffolding
- WebSocket communication patterns for real-time status updates
- VS Code Extension Testing framework for automated testing
- Extension Marketplace publishing guidelines and requirements
- VS Code Extension Host architecture and security model

## **6. Open Questions & Notes**

**Architecture Decisions:**
- **Question:** Should the extension communicate with Dev-Agency via CLI subprocess, HTTP API, or dedicated extension backend service?
- **Question:** How to balance functionality richness with extension startup performance and resource usage?
- **Question:** What level of offline functionality should be supported when Dev-Agency system is unavailable?

**User Experience Design:**
- **Question:** How should agent invocation commands be organized in the command palette for discoverability?
- **Question:** What visual indicators are needed to distinguish agent-generated suggestions from VS Code's native IntelliSense?
- **Question:** How to provide contextual help and guidance for new users unfamiliar with the Dev-Agency system?

**Integration Complexity:**
- **Question:** Should debug integration be a separate extension or integrated into the main Dev-Agency extension?
- **Question:** How to handle version compatibility between the extension and Dev-Agency CLI updates?
- **Question:** What configuration synchronization is needed between VS Code settings and Dev-Agency preferences?

**Performance Considerations:**
- **Question:** How to minimize the performance impact of real-time status monitoring on VS Code responsiveness?
- **Question:** What caching strategies are needed for frequently accessed agent responses and suggestions?
- **Question:** How to handle long-running agent operations without blocking the VS Code UI?

**Security and Privacy:**
- **Question:** How to securely handle authentication credentials for Dev-Agency within VS Code extension?
- **Question:** What data should be collected for telemetry while respecting user privacy preferences?
- **Question:** How to ensure safe execution of agent-generated code suggestions within the IDE environment?

**Cross-Platform Compatibility:**
- **Question:** What platform-specific considerations are needed for Windows, macOS, and Linux support?
- **Question:** How to handle differences in file system paths and process management across platforms?
- **Question:** What testing strategies are needed to ensure consistent behavior across different VS Code versions?

**Implementation Notes:**
- **Development Strategy:** Start with core agent invocation and status display, incrementally add advanced features
- **Testing Approach:** Use VS Code Extension Test Runner with comprehensive mock scenarios
- **Documentation Plan:** Create getting started guide, feature walkthrough, and troubleshooting documentation  
- **Performance Monitoring:** Implement extension telemetry for usage patterns and performance optimization
- **Accessibility Compliance:** Ensure extension meets VS Code accessibility standards for inclusive development
- **Localization Support:** Design for internationalization with string externalization
- **Update Mechanism:** Plan for automatic updates and backward compatibility with older Dev-Agency versions
- **Error Recovery:** Implement robust error handling with user-friendly messages and recovery suggestions
- **Resource Management:** Monitor memory usage and implement proper disposal patterns for long-running operations
- **Cross-Extension Integration:** Consider integration points with other popular VS Code extensions (Git, Python, etc.)

**Feature Prioritization:**
- **Phase 1:** Basic agent invocation, command palette integration, status bar widget
- **Phase 2:** IntelliSense integration, output channel, configuration management
- **Phase 3:** Debug integration (AGENT-023), advanced UI components, performance optimization
- **Phase 4:** Advanced features like workspace management, collaborative debugging, AI-powered suggestions

**Success Metrics:**
- Extension activation time < 2 seconds
- Agent invocation response time < 5 seconds for simple operations
- 95%+ user satisfaction rating in VS Code Marketplace
- Zero VS Code crashes caused by extension
- 90%+ feature discovery rate through intuitive UI design

---

*Epic: Developer Experience | Priority: High | Risk: Medium | Agent Implementation: architect, coder, tester, documenter*