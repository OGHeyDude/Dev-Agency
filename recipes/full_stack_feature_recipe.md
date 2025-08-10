---
title: Full Stack Feature Development Recipe
description: Complete feature development from design to deployment with parallel agent execution
type: recipe
category: development
tags: [full-stack, feature-development, parallel-execution, enterprise, quality-first]
created: 2025-08-09
updated: 2025-08-09
---

# Recipe: Full Stack Feature Development

## Overview
A comprehensive recipe for developing complete features from initial design through deployment, leveraging parallel agent execution to maximize efficiency while maintaining enterprise-grade quality standards.

## Philosophy
**"Quality First, Parallel Where Possible"** - Build production-ready features through systematic phases with strategic parallel execution to optimize development velocity without compromising security, testing, or documentation standards.

## Use Case
- New user-facing features requiring frontend and backend components
- API endpoint development with authentication and validation
- Database schema changes with migration scripts
- Features requiring comprehensive testing and security review
- Enterprise features needing complete documentation
- Complex integrations spanning multiple system layers

## Agent Sequence

```mermaid
graph TD
    A[Start: Feature Requirements] --> B[Phase 1: Architecture Design]
    B --> C[/agent:architect]
    C --> D[Architecture Complete]
    
    D --> E[Phase 2: Implementation]
    E --> F[/agent:coder]
    F --> G[Implementation Complete]
    
    G --> H[Phase 3: Quality Assurance - Parallel]
    H --> I[/agent:tester]
    H --> J[/agent:security] 
    H --> K[/agent:performance]
    I --> L[All QA Complete]
    J --> L
    K --> L
    
    L --> M[Phase 4: Documentation & Sync - Parallel]
    M --> N[/agent:documenter]
    M --> O[/agent:memory-sync]
    N --> P[Feature Complete]
    O --> P
    
    style C fill:#e1f5fe
    style F fill:#e8f5e8
    style I fill:#fff3e0
    style J fill:#fce4ec
    style K fill:#f3e5f5
    style N fill:#e0f2f1
    style O fill:#fff8e1
```

## Step-by-Step Process

### Phase 1: Architecture Design (Solo Agent)
**Status**: `BACKLOG` → `TODO` → `IN_PROGRESS`
**Agent**: `/agent:architect`
**Complexity**: Medium

1. **Requirements Analysis**
   - Analyze feature requirements and acceptance criteria
   - Identify system touchpoints and dependencies
   - Define data models and API contracts

2. **System Design**
   - Create database schema design
   - Design API endpoints and request/response formats  
   - Plan frontend component architecture
   - Define security requirements and authentication flow

3. **Technical Specification**
   - Generate comprehensive spec document
   - Include implementation approach and technology choices
   - Define testing strategy and security considerations
   - Create deployment and rollback plans

**Output**: Complete technical specification in `$SPEC` format

### Phase 2: Implementation (Solo Agent)
**Status**: `IN_PROGRESS` → `CODE_REVIEW`
**Agent**: `/agent:coder`
**Complexity**: High (varies by feature scope)

1. **Backend Development**
   - Implement database migrations
   - Create API endpoints with validation
   - Implement business logic and error handling
   - Add logging and monitoring hooks

2. **Frontend Development**
   - Build UI components following design system
   - Implement state management and API integration
   - Add form validation and error handling
   - Ensure responsive design and accessibility

3. **Integration**
   - Connect frontend to backend APIs
   - Implement authentication flows
   - Add loading states and error boundaries
   - Optimize performance and bundle size

**Output**: Complete feature implementation ready for testing

### Phase 3: Quality Assurance (Parallel Agents)
**Status**: `CODE_REVIEW` → `QA_TESTING`
**Complexity**: Medium (parallel execution)

#### `/agent:tester` (Primary QA)
- Create comprehensive test suite (unit, integration, e2e)
- Implement API testing with various scenarios
- Create frontend component tests and user flow tests
- Validate error handling and edge cases
- Run full test suite and generate coverage reports

#### `/agent:security` (Security Review)
- Audit authentication and authorization implementation
- Review input validation and sanitization
- Check for common vulnerabilities (OWASP Top 10)
- Validate secure communication and data handling
- Review access controls and permission systems

#### `/agent:performance` (Performance Analysis)
- Analyze database query performance
- Review API response times and optimization opportunities
- Audit frontend bundle size and loading performance
- Identify potential bottlenecks and scaling concerns
- Generate performance benchmarks and recommendations

**Output**: Comprehensive QA report with all security and performance validations

### Phase 4: Documentation & Memory Sync (Parallel Agents)
**Status**: `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE`
**Complexity**: Medium (parallel execution)

#### `/agent:documenter` (Documentation)
- Update API documentation with new endpoints
- Create user-facing feature documentation
- Update system architecture documentation
- Generate deployment and configuration guides
- Create troubleshooting and FAQ sections

#### `/agent:memory-sync` (Knowledge Graph Update)
- Sync new code components to knowledge graph
- Update relationships between system components
- Document architectural decisions and patterns
- Index new APIs and data models
- Create searchable feature documentation

**Output**: Complete documentation and updated knowledge graph

## Parallel Execution Opportunities

### High-Impact Parallel Phases
1. **Phase 3 (QA)**: Run `/agent:tester`, `/agent:security`, and `/agent:performance` simultaneously
2. **Phase 4 (Final)**: Run `/agent:documenter` and `/agent:memory-sync` in parallel

### Parallel Execution Benefits
- **Phase 3**: Parallel QA reduces sequential overhead
- **Phase 4**: Parallel documentation eliminates waiting
- **Quality Improvement**: Comprehensive validation without compromise

### Sequential Dependencies
- Phase 1 must complete before Phase 2 (architecture drives implementation)
- Phase 2 must complete before Phase 3 (need working code for QA)
- Phase 3 must complete before Phase 4 (need QA results for complete docs)

## Common Context Template

### Universal Context Elements
```markdown
## Project Context
- **Project Type**: [Web Application/API/Mobile App]
- **Tech Stack**: [React/Node.js/PostgreSQL/etc.]
- **Architecture**: [Microservices/Monolith/Serverless]

## Standards Reference
- Development Standards: $STANDARDS
- Documentation Guide: $DOCS_GUIDE  
- Testing Requirements: [Project-specific testing standards]

## Feature Context
- **Feature Name**: [Specific feature being developed]
- **Acceptance Criteria**: [List of requirements]
- **Dependencies**: [Other features/services required]
- **Success Metrics**: [How success is measured]
```

### Agent-Specific Context Additions

#### For `/agent:architect`
```markdown
## Architecture Requirements
- **Scalability Needs**: [Expected load and growth]
- **Integration Points**: [External services/APIs]
- **Security Requirements**: [Authentication/authorization needs]
- **Performance Targets**: [Response times, throughput]
```

#### For `/agent:coder`
```markdown
## Implementation Context
- **Architecture Spec**: [Embed complete spec from Phase 1]
- **Code Standards**: [Project-specific coding guidelines]
- **Existing Patterns**: [Code examples from current codebase]
```

#### For QA Agents (`/agent:tester`, `/agent:security`, `/agent:performance`)
```markdown
## Quality Assurance Context
- **Implementation Details**: [Complete code from Phase 2]
- **Test Requirements**: [Coverage targets, test types needed]
- **Security Policies**: [Organization security requirements]
- **Performance Baselines**: [Current system performance metrics]
```

## Success Criteria

### Phase Completion Checklist

#### Phase 1: Architecture ✅
- [ ] Complete technical specification created
- [ ] Database schema designed and validated
- [ ] API contracts defined with request/response formats
- [ ] Security requirements documented
- [ ] Implementation approach clearly defined
- [ ] Ticket status updated to `TODO`

#### Phase 2: Implementation ✅  
- [ ] All backend endpoints implemented and tested
- [ ] Frontend components built and integrated
- [ ] Authentication flows working correctly
- [ ] Error handling implemented throughout
- [ ] Code follows project standards and patterns
- [ ] Ticket status updated to `CODE_REVIEW`

#### Phase 3: Quality Assurance ✅
- [ ] Comprehensive test suite with >90% coverage
- [ ] All security vulnerabilities addressed
- [ ] Performance meets or exceeds targets
- [ ] API documentation generated and validated
- [ ] Error scenarios tested and handled
- [ ] Ticket status updated to `QA_TESTING`

#### Phase 4: Documentation & Sync ✅
- [ ] User documentation complete and accurate
- [ ] API documentation updated
- [ ] System architecture docs updated
- [ ] Knowledge graph synchronized
- [ ] Deployment guide created
- [ ] Ticket status updated to `READY_FOR_RELEASE`

### Overall Feature Completion ✅
- [ ] Feature meets all acceptance criteria
- [ ] Code review completed and approved
- [ ] All tests passing in CI/CD pipeline
- [ ] Security review completed with no high-risk findings
- [ ] Performance benchmarks meet targets
- [ ] Documentation complete and reviewed
- [ ] Knowledge graph updated with new components
- [ ] Feature ready for production deployment

## Complexity Assessment

### Standard Feature (Medium Complexity)
- **Phase 1 - Architecture**: Medium complexity design
- **Phase 2 - Implementation**: Standard feature development
- **Phase 3 - QA (Parallel)**: Comprehensive validation
- **Phase 4 - Docs (Parallel)**: Complete documentation
- **Story Points**: 5-8 points

### Complex Feature (High Complexity)
- **Phase 1 - Architecture**: High complexity design
- **Phase 2 - Implementation**: Complex feature development  
- **Phase 3 - QA (Parallel)**: Extensive validation required
- **Phase 4 - Docs (Parallel)**: Comprehensive documentation
- **Story Points**: 8-13 points

### Simple Feature (Low Complexity)
- **Phase 1 - Architecture**: Simple design
- **Phase 2 - Implementation**: Basic feature development
- **Phase 3 - QA (Parallel)**: Standard validation
- **Phase 4 - Docs (Parallel)**: Basic documentation
- **Story Points**: 2-3 points

## Common Issues and Solutions

| Issue | Phase | Solution | Prevention |
|-------|-------|----------|------------|
| Unclear requirements | Phase 1 | Engage `/agent:architect` for requirement clarification | Detailed acceptance criteria upfront |
| Architecture complexity | Phase 1 | Break into smaller features, use `/agent:architect` iteratively | Start with MVP, plan incremental complexity |
| Implementation blockers | Phase 2 | Consult original spec, use `/agent:coder` for alternative approaches | Thorough Phase 1 planning |
| Test coverage gaps | Phase 3 | Use `/agent:tester` to identify and fill gaps | Define test strategy in Phase 1 |
| Security vulnerabilities | Phase 3 | Immediate fix with `/agent:security` + `/agent:coder` | Security-first architecture design |
| Performance bottlenecks | Phase 3 | Use `/agent:performance` for optimization strategy | Performance considerations in Phase 1 |
| Documentation debt | Phase 4 | Use `/agent:documenter` for comprehensive docs | Document as you build |
| Knowledge graph sync issues | Phase 4 | Manual sync with `/agent:memory-sync` | Regular incremental syncing |

## Example Invocation

### Example Feature: User Profile Management

```bash
# Phase 1: Architecture Design
/agent:architect

Context: We need to implement a user profile management feature allowing users to view, edit, and manage their account information.

Requirements:
- Users can view their current profile information
- Users can edit name, email, phone, and avatar
- Email changes require verification
- Avatar upload with image validation
- Audit trail for profile changes
- Mobile-responsive design

Tech Stack: React frontend, Node.js/Express backend, PostgreSQL database
Current Architecture: RESTful API with JWT authentication

Please create a comprehensive technical specification including database schema, API endpoints, security considerations, and implementation approach.

# Phase 2: Implementation (after Phase 1 complete)
/agent:coder

Context: Implement the user profile management feature based on the technical specification:

[Embed complete Phase 1 specification here]

Project Standards:
- TypeScript for all code
- Jest for testing
- ESLint/Prettier for code formatting
- RESTful API design patterns

Please implement the complete feature including backend APIs, frontend components, and basic error handling.

# Phase 3: Quality Assurance (run in parallel)
/agent:tester
Context: Create comprehensive test suite for the user profile management feature
[Include implementation details from Phase 2]

/agent:security  
Context: Security review of user profile management feature
[Include implementation details from Phase 2]

/agent:performance
Context: Performance analysis of user profile management feature  
[Include implementation details from Phase 2]

# Phase 4: Documentation & Sync (run in parallel)
/agent:documenter
Context: Create comprehensive documentation for user profile management feature
[Include QA results from Phase 3]

/agent:memory-sync
Context: Sync user profile management feature to knowledge graph
[Include all implementation details]
```

## Recipe Variations

### Variation 1: API-Only Feature
**Use Case**: Backend service or API endpoint development
**Modified Flow**: 
- Skip frontend components in Phase 2
- Focus on API testing in Phase 3
- Emphasize API documentation in Phase 4
**Agents**: `architect → coder → tester + security → documenter + memory-sync`

### Variation 2: Frontend-Only Feature  
**Use Case**: UI component or frontend enhancement
**Modified Flow**:
- Skip backend development in Phase 2
- Focus on component and integration testing
- Emphasize user documentation
**Agents**: `architect → coder → tester + performance → documenter + memory-sync`

### Variation 3: High-Security Feature
**Use Case**: Features handling sensitive data or requiring enhanced security
**Modified Flow**:
- Extended security review in Phase 1
- Security-focused implementation in Phase 2  
- Comprehensive security testing in Phase 3
- Security documentation in Phase 4
**Agents**: `architect + security → coder → tester + security + performance → documenter + memory-sync`

### Variation 4: Performance-Critical Feature
**Use Case**: Features with strict performance requirements
**Modified Flow**:
- Performance considerations in Phase 1 architecture
- Performance-optimized implementation
- Extended performance testing and optimization
**Agents**: `architect + performance → coder → tester + security + performance → documenter + memory-sync`

### Variation 5: Rapid Prototype
**Use Case**: Quick feature validation or MVP development
**Modified Flow**:
- Simplified architecture in Phase 1
- MVP implementation in Phase 2
- Basic testing in Phase 3
- Minimal documentation in Phase 4
**Quality Enhancement**: Parallel execution maintains thoroughness
**Quality Trade-offs**: Reduced test coverage, simplified architecture

---

*This recipe optimizes for enterprise-grade quality while maximizing development velocity through strategic parallel agent execution. Customize phases and agents based on specific feature requirements and organizational standards.*