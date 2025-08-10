---
title: Dev-Agency Project Context
description: Single source of truth for technical and business context used by architect and other agents
type: context
category: project-management
tags: [context, architecture, tech-stack, business, standards]
created: 2025-08-10
updated: 2025-08-10
version: 1.0
status: active
---

# Project Context Document

## Project Overview

**Project:** Dev-Agency - Centralized Agentic Development System  
**Vision:** Build an enterprise-grade agentic development system that leverages Claude Code's architecture to create a powerful, scalable development workflow with specialized AI agents.  
**Status:** Production-ready with complete agent ecosystem

## Tech Stack & Architecture

### Core Technologies
- **Languages:** TypeScript, JavaScript, Python
- **Runtime:** Node.js (primary), Python (utilities)
- **Package Manager:** npm
- **Build System:** TypeScript compiler (tsc)
- **Testing:** Jest (with TypeScript support)

### Architecture Pattern
- **Type:** Modular system with specialized agents
- **Pattern:** Hub-and-Spoke (Main Claude orchestrates all agents)
- **Communication:** No agent-to-agent communication (stateless invocations)
- **Context:** Self-contained prompts for each agent invocation

### Key Dependencies
- **CLI Framework:** Commander.js or similar
- **File System:** Native Node.js fs operations
- **Process Management:** Child process spawning for tool execution
- **Memory Management:** LRU caching for performance
- **Security:** Input validation and path sanitization

### Tools & Utilities
- **Context Optimizer:** Python-based token optimization tool
- **Memory Sync:** Knowledge graph integration utilities
- **Performance Cache:** Intelligent caching system
- **Benchmarking:** Performance measurement tools
- **Dashboard:** HTML/JavaScript monitoring interface

## Business Context

### Product Vision
Create a production-grade development system that:
- Eliminates development guesswork through systematic workflows
- Provides specialized AI agents for different development domains
- Maintains enterprise security and quality standards
- Enables 40-75% improvement in development efficiency

### Key Users
- **Primary:** Software developers using Claude Code
- **Secondary:** Development teams adopting agentic workflows
- **Target:** Enterprise development organizations

### Core Value Propositions
1. **Systematic Workflows:** Proven recipes for common development tasks
2. **Specialized Agents:** Domain experts for architecture, coding, testing, security
3. **Quality First:** Built-in best practices and quality gates
4. **Production Ready:** Enterprise security, performance monitoring, graceful degradation

### Success Metrics
- Agent invocation success rate > 90% ✅
- Context size optimization 30-75% ✅
- Development time savings 40-76% ✅
- Zero agent communication violations ✅

## Development Standards

### Code Quality
- **Philosophy:** "Quality, Efficiency, Security, and Documentation OVER Speed"
- **Anti-Clutter:** Single source of truth, no redundancy
- **Planning First:** Always write specs before implementation
- **Story Points:** Use 1,2,3,5,8,13 scale (NOT time estimates)

### Testing Strategy
- **Framework:** Jest with TypeScript
- **Coverage:** Target >80% code coverage
- **Types:** Unit, integration, performance, security tests
- **TDD:** Test-driven development encouraged

### Security Requirements
- **Input Validation:** All user inputs sanitized
- **Path Safety:** No directory traversal vulnerabilities
- **Secret Management:** No hardcoded secrets or keys
- **Code Injection:** Prevention mechanisms in place

### Performance Standards
- **Memory Usage:** Bounded <200MB per execution
- **Context Cache:** Hit rate >70%
- **Response Time:** <100ms for monitoring systems
- **Optimization:** Context size reduction tools available

## Current Architecture

### Agent System
- **Core Agents:** architect, coder, tester, security, documenter, memory-sync
- **Specialists:** mcp-dev, performance, integration, hooks
- **Utilities:** clutter-detector, predictive-planner
- **Total:** 12+ specialized agents

### Recipe Library
- **Categories:** Sprint Management, Development Workflows, Quality & Optimization
- **Count:** 14 focused recipes (consolidated from 17)
- **Policies:** 2 overarching quality policies
- **Coverage:** API development, TDD, performance, security, refactoring

### Workflow Integration
- **CLAUDE.md:** Central configuration system
- **Templates:** Standardized project templates  
- **Standards:** Comprehensive development guidelines
- **Automation:** Sprint planning and execution recipes

## Technical Constraints

### System Limitations
- **Max Parallel Agents:** 5 agents simultaneously
- **Context Limits:** Token optimization required for large codebases
- **File Access:** Read/write permissions needed for project files
- **Git Integration:** Requires git repository for version control

### Performance Considerations
- **Memory Management:** LRU caching for frequent operations
- **Token Optimization:** Context pruning and prioritization
- **Parallel Execution:** Strategic parallelization for efficiency
- **Resource Monitoring:** System health checks and degradation handling

### Security Boundaries
- **File System:** Restricted to project directories
- **Command Execution:** Sanitized shell command execution
- **Network Access:** Limited to necessary integrations
- **Data Protection:** No sensitive information logging

## Integration Points

### External Tools
- **Version Control:** Git (required)
- **Package Managers:** npm, pip, cargo (as needed)
- **IDE Integration:** VS Code extension (in development)
- **Communication:** Slack/Teams integration (completed)
- **VCS Integration:** GitHub/GitLab agents (in development)

### Claude Code Integration
- **Memory Tool:** Knowledge graph synchronization
- **File Operations:** Read, write, edit capabilities
- **Command Execution:** Bash tool integration
- **Search Capabilities:** Grep, Glob pattern matching

## Development Workflow

### Sprint Process
1. **Preparation:** Systematic ticket selection and spec writing
2. **Execution:** Agent-orchestrated implementation
3. **Quality Gates:** Security, performance, documentation validation
4. **Completion:** Memory sync, commit, and closure

### Quality Assurance
- **Definition of Done:** Comprehensive checklist
- **Code Review:** Automated and manual validation
- **Testing:** Multi-layer testing strategy
- **Security:** Vulnerability scanning and remediation

## Current State

### Last Updated
**Date:** 2025-08-10  
**Updated By:** System initialization  
**Reason:** Initial context document creation

### Sprint Status
**Current Sprint:** Sprint 5 (08-11-2025 – 08-25-2025)  
**Progress:** Phase 1 tickets in progress  
**Focus:** Production-grade features (monitoring, IDE integration, automation)

### Major Components
- ✅ **Agent System:** Complete with 12+ specialized agents
- ✅ **Recipe Library:** 14 consolidated recipes + 2 policies  
- ✅ **CLI Tools:** Functional agent invocation system
- ✅ **Performance Tools:** Context optimization and benchmarking
- 🚧 **Monitoring:** Real-time system health dashboard (in development)
- 🚧 **IDE Integration:** VS Code extension (planned)
- 🚧 **VCS Integration:** GitHub/GitLab agents (in development)

### Known Constraints
- **Resource Intensive:** Parallel agent execution requires modern hardware
- **Context Dependent:** Requires comprehensive project context for optimal performance
- **Git Dependent:** Relies heavily on git repository structure
- **Claude Code Specific:** Designed specifically for Claude Code environment

---

## Maintenance Instructions

### When to Update This Document
- **Architecture Changes:** New agents, major system modifications
- **Tech Stack Changes:** New languages, frameworks, or major dependencies
- **Business Context Evolution:** Updated vision, metrics, or user requirements
- **Major Feature Additions:** New capabilities or integration points
- **Performance/Security Updates:** New standards or constraints

### Responsibility
- **Architect Agent:** Updates when making architectural decisions
- **Sprint Completion:** Review and update during `/done` process
- **Quarterly Review:** Comprehensive context validation

### Integration Points
- **Sprint Preparation:** Read by architect agent during ticket selection
- **Agent Context:** Referenced by all agents needing project understanding  
- **New Team Members:** Primary onboarding document
- **External Integrations:** Context for third-party tool integrations

---

*This document serves as the single source of truth for all Dev-Agency project context. Keep it current to ensure optimal agent performance and decision-making.*