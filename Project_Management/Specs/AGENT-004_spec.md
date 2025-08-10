---
title: AGENT-004 - Domain-specific Prompt Libraries
description: Comprehensive prompt library system for different agent types and development domains
type: spec
category: prompt-engineering
tags: [prompts, libraries, templates, domains, agents]
created: 2025-08-10
updated: 2025-08-10
status: todo
---

# **Spec: Domain-specific Prompt Libraries**

**Ticket ID:** `AGENT-004`  
**Status:** `DONE`  
**Last Updated:** 2025-08-10  
**Story Points:** 5  
**Link to Project Plan:** [PROJECT_PLAN.md](../PROJECT_PLAN.md)

---

## **1. Problem & Goal**

**Problem:** Dev-Agency agents currently rely on generic prompts that lack domain-specific context, leading to suboptimal performance across different technology stacks, project types, and development scenarios. Agents miss crucial domain knowledge, best practices, and context-specific patterns that would improve their effectiveness and output quality.

**Goal:** Build a comprehensive domain-specific prompt library system that provides specialized prompt templates, context patterns, and knowledge bases for different development domains (frontend, backend, mobile, DevOps, etc.), enabling agents to deliver higher quality, more contextually appropriate solutions.

## **2. Acceptance Criteria**

- [ ] Domain-specific prompt templates for each agent type (architect, coder, tester, security, documenter)
- [ ] Technology stack-specific prompt variations (React, Node.js, Python, Go, TypeScript, etc.)
- [ ] Project type-specific prompts (web apps, APIs, CLI tools, microservices, mobile apps)
- [ ] Best practices integration in domain prompts (coding standards, security guidelines, performance patterns)
- [ ] Dynamic prompt composition system that combines base agent prompts with domain-specific enhancements
- [ ] Prompt validation and quality assurance framework
- [ ] Usage analytics and prompt effectiveness tracking
- [ ] Easy prompt customization and extension system
- [ ] Integration with existing agent invocation system
- [ ] Comprehensive documentation and usage examples

## **3. Technical Plan**

**Approach:** Build a modular prompt library system with hierarchical prompt composition, domain-specific knowledge integration, and dynamic prompt generation capabilities. Implement as an extensible system that integrates seamlessly with the existing agent architecture.

### **Core Architecture**

1. **Prompt Library Structure**
   ```
   /prompts/
   ├── domains/
   │   ├── frontend/
   │   │   ├── react/
   │   │   ├── vue/
   │   │   └── angular/
   │   ├── backend/
   │   │   ├── nodejs/
   │   │   ├── python/
   │   │   └── go/
   │   ├── mobile/
   │   │   ├── react-native/
   │   │   └── flutter/
   │   ├── devops/
   │   │   ├── docker/
   │   │   ├── kubernetes/
   │   │   └── ci-cd/
   │   └── security/
   ├── agents/
   │   ├── architect/
   │   ├── coder/
   │   ├── tester/
   │   └── security/
   ├── contexts/
   │   ├── web-app/
   │   ├── api/
   │   ├── cli-tool/
   │   └── microservice/
   └── patterns/
       ├── best-practices/
       ├── anti-patterns/
       └── common-scenarios/
   ```

2. **Prompt Composition System**
   - Base agent prompts from existing `/Agents/` directory
   - Domain-specific enhancements from `/prompts/domains/`
   - Context-specific patterns from `/prompts/contexts/`
   - Dynamic merging based on task context

3. **Prompt Template Engine**
   - Variable substitution and templating
   - Conditional content inclusion
   - Multi-language support for code examples
   - Context-aware prompt generation

### **Domain Coverage**

**Technology Domains:**
- **Frontend**: React, Vue, Angular, TypeScript, CSS, HTML
- **Backend**: Node.js, Python, Go, Java, PHP, Rust
- **Database**: SQL, NoSQL, migrations, optimization
- **Mobile**: React Native, Flutter, Swift, Kotlin
- **DevOps**: Docker, Kubernetes, AWS, Azure, GCP
- **Security**: Authentication, authorization, encryption, auditing

**Project Types:**
- **Web Applications**: SPA, SSR, PWA patterns
- **APIs**: REST, GraphQL, microservices, documentation
- **CLI Tools**: Command parsing, user interaction, packaging
- **Libraries**: Public APIs, documentation, testing patterns
- **Microservices**: Service design, communication, deployment

**Development Contexts:**
- **Architecture Patterns**: MVC, MVVM, Clean Architecture, Hexagonal
- **Testing Strategies**: Unit, integration, e2e, TDD, BDD
- **Performance Considerations**: Optimization, caching, scaling
- **Security Requirements**: OWASP compliance, data protection

### **Affected Components**

- Agent invocation system (CLI tool and direct calls)
- Agent prompt processing in `AgentManager.ts`
- Configuration management system
- Performance tracking and analytics
- Documentation system

### **New Dependencies**

- YAML/JSON parsing for prompt templates
- Template engine (Handlebars or similar)
- Dynamic prompt composition library
- Prompt validation framework

## **4. Feature Boundaries & Impact**

### **Owned Resources** (Safe to Modify)
- [ ] `/prompts/domains/*` (complete domain prompt library)
- [ ] `/prompts/agents/*` (agent-specific prompt enhancements)
- [ ] `/prompts/contexts/*` (context-specific patterns)
- [ ] `/prompts/patterns/*` (best practices and patterns)
- [ ] `tools/agent-cli/src/core/PromptManager.ts` (new component)
- [ ] `tools/agent-cli/src/core/DomainDetector.ts` (new component)
- [ ] `prompts/README.md` (prompt system documentation)

### **Shared Dependencies** (Constraints Apply)
- [ ] `tools/agent-cli/src/core/AgentManager.ts` (EXTEND-ONLY - add prompt enhancement)
- [ ] `/Agents/*.md` (READ-ONLY - base agent definitions preserved)
- [ ] `tools/agent-cli/src/core/ConfigManager.ts` (EXTEND-ONLY - add prompt config)
- [ ] `feedback/performance_tracker.md` (EXTEND-ONLY - add prompt metrics)

### **Impact Radius**
- **Direct impacts:** All agent invocations will have enhanced domain-specific context
- **Indirect impacts:** Agent output quality improvement, execution time changes
- **Required regression tests:** All existing agent functionality, prompt validation

### **Safe Modification Strategy**
- [ ] Create isolated prompt library structure
- [ ] Implement optional prompt enhancement (backward compatible)
- [ ] Use feature flags for gradual rollout
- [ ] Preserve existing agent prompt structures
- [ ] Add domain detection as enhancement, not replacement

### **Technical Enforcement**
- **Pre-commit hooks:** `prompt-validation`, `domain-consistency-check`
- **CI/CD checks:** `prompt-composition-tests`, `agent-compatibility`
- **File permissions:** Domain prompt libraries read-only after validation

## **5. Research & References**

- Review existing agent definitions in `/Agents/` directory
- Analyze successful agent invocations from feedback system
- Study technology-specific best practices and coding standards
- Research prompt engineering techniques for domain specialization
- Examine existing prompt template systems and libraries
- Review agent performance metrics to identify improvement opportunities

**Key References:**
- OpenAI Prompt Engineering Guide for domain-specific contexts
- GitHub Copilot domain-specific prompting strategies
- Domain-Driven Design principles for prompt organization
- Existing successful recipes in `/recipes/` for pattern analysis

## **6. Open Questions & Notes**

**Technical Questions:**
- **Question:** Should prompts be loaded dynamically or cached at startup for performance?
- **Question:** How to handle conflicts when multiple domains apply (e.g., React + Node.js + Docker)?
- **Question:** What's the optimal prompt length for domain-specific enhancements without hitting token limits?

**Domain Coverage Questions:**
- **Question:** Which technology stacks should be prioritized for initial implementation?
- **Question:** How to maintain consistency across similar domains (React vs Vue patterns)?
- **Question:** Should we include anti-patterns and common mistakes in domain prompts?

**Integration Questions:**
- **Question:** How to integrate with the existing context optimizer (AGENT-010) for token management?
- **Question:** Should domain detection be automatic based on project files or user-specified?
- **Question:** How to handle custom domain extensions and user-contributed prompts?

**Quality Assurance:**
- **Question:** What metrics will validate prompt effectiveness improvements?
- **Question:** How to ensure domain prompts don't conflict with agent-specific requirements?
- **Question:** What validation process for new domain additions?

**Implementation Notes:**
- Consider hierarchical prompt inheritance (base → domain → context → agent)
- Implement prompt versioning to track changes and improvements
- Plan for internationalization of domain-specific examples
- Design for extensibility - easy addition of new domains and patterns
- Integrate with performance tracking to measure prompt effectiveness
- Consider caching strategy for frequently used prompt compositions

---

*Epic: Prompt Engineering | Priority: High | Risk: Medium | Agent Implementation: architect, coder, documenter*