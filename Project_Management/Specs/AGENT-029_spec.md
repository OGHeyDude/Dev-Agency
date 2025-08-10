# **Spec: Enhanced CLI with interactive mode**

**Ticket ID:** `AGENT-029` **Status:** `DONE` **Last Updated:** 2025-08-10 **Link to Project Plan:** [PROJECT_PLAN.md](../PROJECT_PLAN.md)

> **📋 Spec Size Guidelines:**
> - **For Features (3+ Story Points):** All sections of this template are mandatory.
> - **For Bugs/Small Tasks (1-2 Story Points):** Only these sections are required:
>   - `Problem & Goal` (keep it brief)
>   - `Acceptance Criteria` 
>   - `Technical Plan`
> - **Skip the rest for small tasks** - Don't let process slow you down!

## **1. Problem & Goal**

* **Problem:** The current Dev-Agency CLI operates in single-command mode, requiring users to prefix every command and lose context between operations. This creates friction in daily development workflows where developers need to run multiple related commands, explore available options, and maintain context across operations. Users frequently need to reference documentation for command syntax, leading to inefficient development cycles.

* **Goal:** Transform the Dev-Agency CLI into a modern, interactive development tool with persistent session management, intelligent auto-completion, and command history. Enable developers to work fluidly within the CLI environment, reducing cognitive load and improving productivity through context-aware assistance and seamless command discovery.

## **2. Acceptance Criteria**

* **[ ] Interactive REPL Mode:** CLI launches into an interactive prompt mode with persistent session state and context awareness across commands
* **[ ] Command History:** Full command history with search functionality (Ctrl+R reverse search) that persists across CLI sessions
* **[ ] Intelligent Auto-completion:** Tab completion for all agent commands, parameters, file paths, and ticket IDs with context-sensitive suggestions
* **[ ] Help Integration:** Built-in help system accessible via `help` command or `?` with command-specific usage examples
* **[ ] Session Management:** Ability to save, load, and manage named CLI sessions with different project contexts
* **[ ] Error Recovery:** Graceful error handling with suggestions for command corrections and context-aware help
* **[ ] Backwards Compatibility:** All existing single-command mode functionality remains available for scripting and automation

## **3. Technical Plan**

* **Approach:** Build an interactive CLI shell using a modern REPL library (likely `inquirer` or `blessed` for Node.js or `click` with `prompt_toolkit` for Python). Implement command parsing, completion engines, and session state management while maintaining the existing agent system architecture.

* **Affected Components:**
  - CLI entry point and command router
  - Agent invocation system (extend for interactive mode)
  - Command parser and validation
  - Configuration management system
  - Help and documentation system

* **New Dependencies:**
  - Interactive CLI library (`inquirer.js` or `prompt_toolkit` depending on implementation language)
  - Command history storage (likely file-based with JSON or SQLite)
  - Tab completion engine
  - Configuration persistence library

* **Database Changes:** No database schema changes required. Will add local configuration files for session management and command history storage.

## **4. Feature Boundaries & Impact**

### **Owned Resources** (Safe to Modify)
* **[ ]** `src/cli/interactive/*` (all interactive mode files)
* **[ ]** `src/cli/repl.js|py` (main REPL implementation)
* **[ ]** `src/cli/completion.js|py` (auto-completion engine)
* **[ ]** `src/cli/history.js|py` (command history management)
* **[ ]** `src/cli/session.js|py` (session state management)
* **[ ]** `config/cli-sessions/` (session configuration storage)
* **[ ]** `tests/cli/interactive/*` (interactive mode tests)

### **Shared Dependencies** (Constraints Apply)
* **[ ]** `src/cli/commands.js|py` (EXTEND-ONLY - add interactive wrappers, don't modify existing)
* **[ ]** `src/agents/core.js|py` (READ-ONLY - use existing agent invocation system)
* **[ ]** `src/config/base.js|py` (EXTEND-ONLY - add CLI session config, don't modify core)
* **[ ]** `src/utils/logging.js|py` (READ-ONLY - use existing logging system)

### **Impact Radius**
* **Direct impacts:** CLI user experience, developer productivity, command documentation
* **Indirect impacts:** Agent system logging (more verbose in interactive mode), configuration file structure
* **Required regression tests:** All existing CLI commands, agent invocation workflows, configuration loading

### **Safe Modification Strategy**
* **[ ]** Create separate interactive mode module to avoid disrupting existing CLI
* **[ ]** Use feature flags to enable/disable interactive mode during development
* **[ ]** Implement as decorator pattern around existing command system
* **[ ]** Create CLI-specific configuration namespace
* **[ ]** Use separate test suites for interactive vs batch mode functionality

### **Technical Enforcement**
* **Pre-commit hooks:** `cli-boundary-check`, `command-compatibility-test`
* **CI/CD checks:** `cli-regression-suite`, `interactive-mode-integration`
* **File permissions:** Restrict interactive mode files to CLI development team

## **5. Research & References**

* **Modern CLI Patterns:** [Rich CLI libraries](https://github.com/textualize/rich) for Python, [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) for Node.js
* **REPL Implementation Examples:** 
  - [Node.js REPL documentation](https://nodejs.org/api/repl.html)
  - [Python cmd module](https://docs.python.org/3/library/cmd.html)
  - [Click with prompt_toolkit](https://click.palletsprojects.com/)
* **Auto-completion Patterns:**
  - [Bash completion scripts](https://github.com/scop/bash-completion)
  - [Fish shell completion](https://fishshell.com/docs/current/completions.html)
* **Session Management:** Review existing Dev-Agency configuration patterns in `src/config/`
* **Command History:** Standard CLI history patterns (readline, history expansion)

**Existing Code Analysis:**
* Current CLI entry point at `src/cli/main.js|py`
* Agent system architecture in `src/agents/`
* Configuration management in `src/config/`
* Command parsing logic in `src/cli/parser.js|py`

## **6. Open Questions & Notes**

* **Question:** Should we implement this in the same language as the current CLI or consider a more CLI-friendly language like Python with rich terminal libraries?
* **Question:** What's the preferred command history format - simple text file, JSON structure, or embedded SQLite for searchability?
* **Question:** Should session state include current project context, or should that be managed separately?
* **Question:** How should auto-completion handle agent-specific parameters that might be dynamic?
* **Note:** Consider implementing progressive enhancement - start with basic REPL, then add history, then auto-completion
* **Note:** Ensure interactive mode gracefully degrades when running in non-TTY environments (scripts, CI/CD)
* **Note:** Plan for keyboard shortcuts beyond standard readline (Ctrl+C, Ctrl+D) - maybe Ctrl+H for help, Ctrl+S for session save
* **Note:** Consider integration with existing agent metrics system for tracking interactive vs batch usage patterns