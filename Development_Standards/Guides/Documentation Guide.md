---
title: Documentation Guide
description: Approach to creating useful, maintainable documentation for features and modules
type: guide
category: documentation
tags: [documentation, feature-docs, module-docs, readme, specs]
created: 08-03-2025
updated: 08-03-2025
---

# Documentation Guide

> This guide explains our approach to documentation. Our philosophy is to create useful, easy-to-maintain documentation that helps developers build and use our systems effectively. We prioritize clarity and utility over rigid, exhaustive rules.

## Related Guides & Templates
- **Development Workflow Guide**: See `Development Workflow Guide.md` for the complete development process
- **Development Standards**: See `Development Standards Guide.md` for quality requirements
- **Spec Template**: Located at `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/SPECS_Template.md`
- **All Templates**: Available in `/home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Templates/`

---

## Project Management File Structure

Every project MUST maintain the following documentation structure:

```
/Project_Management/
├── PROJECT_PLAN.md           # Central source of truth for all tickets
├── /Specs/                   # All ticket specifications
│   ├── TICKET-001_spec.md   # Individual spec per ticket
│   ├── TICKET-002_spec.md
│   └── ...
├── /Archive/                 # Archived files (never delete, always archive)
│   ├── [SUBJECT]_archive_reason_[DATE].md
│   └── /Archived_Specs/     # Archived specifications
└── /Releases/                # Release documentation
    ├── CHANGELOG.md         # Main changelog
    └── /v1.0.0/            # Version-specific release notes
        └── release_notes.md

/docs/                        # Public-facing and reference documentation
├── README.md                 # Project overview and getting started
├── /guides/                  # How-to guides and tutorials
│   ├── getting_started.md   # Initial setup guide
│   ├── deployment_guide.md  # How to deploy
│   ├── api_guide.md         # API usage examples
│   └── troubleshooting.md   # Common issues and solutions
├── /architecture/            # System design documentation
│   ├── overview.md          # High-level architecture
│   ├── /diagrams/           # Architecture diagrams
│   └── decisions/           # Architecture Decision Records (ADRs)
│       └── ADR-001-[topic].md
├── /api/                     # API reference documentation
│   ├── endpoints.md         # REST API endpoints
│   └── /schemas/            # API schemas and models
├── /examples/                # Example code and use cases
│   ├── basic_usage.md       # Simple examples
│   └── /advanced/           # Complex scenarios
└── /User_Research/           # Reference materials uploaded by HD for Claude
    ├── /requirements/        # Business requirements and specs
    ├── /examples/           # Example implementations or references
    ├── /standards/          # Industry standards or best practices
    └── README.md            # Index of research materials
```

### Documentation Categories

| Category | Location | Purpose | Example |
|----------|----------|---------|---------|
| Project Planning | `/Project_Management/` | Internal project tracking | Tickets, specs, releases |
| Public Docs | `/docs/` | User-facing documentation | Guides, API docs, examples |
| Module Docs | `[module]/README.md` | Module-specific reference | `/system/cortex/README.md` |
| Development Standards | `/Development_Standards/` | Team processes and templates | This guide |
| User Research | `/docs/User_Research/` | Reference materials for development | Requirements, examples, standards |

### /docs Folder Organization

The `/docs` folder is for documentation that users or other developers need to understand and use your project:

1. **Guides** (`/docs/guides/`): Step-by-step instructions for common tasks
   - Getting started
   - Deployment procedures
   - Integration tutorials
   - Troubleshooting guides

2. **Architecture** (`/docs/architecture/`): System design and decisions
   - High-level system overview
   - Component interactions
   - Architecture Decision Records (ADRs)
   - Design diagrams

3. **API Reference** (`/docs/api/`): Technical API documentation
   - Endpoint documentation
   - Request/response schemas
   - Authentication details
   - Rate limits and constraints

4. **Examples** (`/docs/examples/`): Working code samples
   - Basic usage patterns
   - Advanced implementations
   - Integration examples
   - Best practices demonstrations

5. **User Research** (`/docs/User_Research/`): Reference materials uploaded by HD
   - Business requirements and specifications
   - Example implementations or competitor references
   - Industry standards and best practices documents
   - Research materials to guide development decisions
   - **Note**: Include a README.md index listing all research materials

### When to Use Each Location

- **Use `/Project_Management/Specs/`** for:
  - Feature planning and implementation details
  - Internal technical decisions
  - Work-in-progress documentation

- **Use `/docs/`** for:
  - Stable, user-facing documentation
  - API references and guides
  - Architecture overviews
  - Getting started guides

- **Use module `README.md`** for:
  - Module-specific API documentation
  - Internal module usage
  - Development setup for that module

- **Use `/docs/User_Research/`** for:
  - Materials uploaded by HD to guide development
  - Business requirements and specifications
  - Example implementations for reference
  - Industry standards and best practices
  - Any research that helps Claude understand project context

### File Naming Conventions
- **Spec Files**: `TICKET-[ID]_spec.md` (e.g., `TICKET-001_spec.md`)
- **Archive Notes**: `[SUBJECT]_archive_reason_[DATE].md` (e.g., `auth_module_archive_reason_08-03-2025.md`)
- **Module READMEs**: Always `README.md` in the module's root directory
- **Dates**: Always use `MM-DD-YYYY` format (run `date +"%m-%d-%Y"` to get current date)

### Location Reference
| Documentation Type | Location | Example |
|-------------------|----------|---------|
| Project Planning | `/Project_Management/PROJECT_PLAN.md` | Central ticket tracking |
| Feature Documentation | `/Project_Management/Specs/TICKET-XXX_spec.md` | Individual ticket specs |
| Module Documentation | `[module_root]/README.md` | `/system/cortex/README.md` |
| Release Documentation | `/Project_Management/Releases/CHANGELOG.md` | Version history |
| Archived Files | `/Project_Management/Archive/` | Removed or deprecated files |

---

## Our Documentation Model

We recognize two distinct types of documentation, each with its own purpose and process:

1.  **Feature Documentation (The "Why" and "How" of a Change):** This is the most common type of documentation. It is tied directly to a specific ticket (a new feature, bug fix, or improvement) and lives within that ticket's **Spec Document**.

2.  **Module Documentation (The "What" and "How-To" of a System):** This is higher-level documentation for major, stable components of our system (e.g., the `cortex` agent factory, the `axon` data connector). It serves as a reference manual for developers who need to use or understand that system.

---

## 1. Feature Documentation Workflow

This is part of our standard development cycle and requires no extra files.

* **Where it lives:** Inside the **Spec Template** (`/home/hd/Desktop/LAB/Development_Standards/Templates/SPECS_Template.md`) for each ticket.
* **File naming:** `TICKET-[ID]_spec.md` in `/Project_Management/Specs/`
* **What it contains:** The problem, goals, acceptance criteria, technical plan, and research notes related to that specific piece of work.
* **When it's updated:** Continuously, as you work on the ticket. It is a living document that captures the journey of the feature.

**By following our Development Workflow Guide and filling out the Spec for each ticket, you are already creating excellent feature-level documentation.**

### Archiving Feature Documentation
When a feature is deprecated or removed:
1. Move the spec file to `/Project_Management/Archive/Archived_Specs/`
2. Create an archive reason file: `[feature_name]_archive_reason_[MM-DD-YYYY].md`
3. Never delete documentation - always archive with a reason

---

## 2. Module Documentation Workflow

This documentation is for core systems and is updated less frequently. It should only be created for major, stable modules where a reference guide would provide significant value to other developers.

* **Where it lives:** A single `README.md` file in the root directory of the module (e.g., `/system/cortex/README.md`).
* **When to create/update:**
    * When a new major module is created.
    * When a significant change is made to a module's core API, configuration, or architecture.

### Module README.md Template

Use this template for module-level documentation. It is designed to be clear, practical, and answer a developer's questions in a logical order.

```markdown
# [Module Name]

> **Last Updated:** YYYY-MM-DD
> **Primary Owner(s):** [Name(s)]

## Purpose

(A one-paragraph summary of what this module is responsible for. What is its primary function within the system?)

---

## Quick Start

(Provide a complete, copy-pasteable code block for the module's most common use case. Include any necessary setup or configuration here.)

**Example:**
```javascript
// 1. Import the factory
import { Cortex } from './cortex';

// 2. Set required environment variables or configuration
// process.env.CORTEX_API_KEY = 'your-api-key';

// 3. Create and run an agent
const agent = Cortex.createAgent({ type: 'data-analyzer' });
agent.run()
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

## API Reference

(A more detailed breakdown of the public classes, functions, and their parameters. Focus on the "what," not the "how.")

### Cortex.createAgent(config)

* Creates a new agent instance. 
* **config** (object): The agent configuration.
  * **type** (string): Required. The type of agent to create (e.g., 'data-analyzer').
  * **timeout** (number): Optional. The request timeout in milliseconds. Defaults to 5000.

### agent.run()

* Executes the agent's primary task.
* **Returns:** Promise<any> - A promise that resolves with the agent's result.

## Development Guide

(Explain how another developer can contribute to this module.)

* **Setup:** npm install  
* **Run Tests:** npm test
* **Key Files:**  
  * src/factory.js: Contains the main createAgent logic
```

---

## Documentation Maintenance

### Before Any Changes
1. Run `date +"%m-%d-%Y"` to get the current date
2. Read the folder's `README.md` if it exists
3. Check `/Project_Management/PROJECT_PLAN.md` for related tickets

### During Development
1. Update the ticket's spec document continuously
2. Keep the spec as a living document throughout development
3. Update module README.md ONLY if changing public APIs or architecture

### Archiving Process
1. **Never delete files** - always move to `/Project_Management/Archive/`
2. Create an archive reason file with format: `[SUBJECT]_archive_reason_[MM-DD-YYYY].md`
3. Include in the archive reason:
   - Why the file/feature was archived
   - Date of archival
   - Related ticket ID if applicable
   - Any migration notes for users

---

## Best Practices

1. **Keep documentation close to code** - Module docs live with the module
2. **Use templates consistently** - Don't reinvent documentation formats
3. **Update as you go** - Don't wait until the end to document
4. **Archive, don't delete** - Maintain historical context
5. **Date everything** - Use `MM-DD-YYYY` format consistently

---

*This guide is part of the Development Standards system. For the complete development workflow, see the Development Workflow Guide.*
