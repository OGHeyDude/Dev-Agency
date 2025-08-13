---
title: Basic Development Workflow
description: Comprehensive guide to the 5-step development process used in Dev-Agency
type: guide
category: workflow
tags: [workflow, process, development, agents, best-practices]
created: 2025-08-10
updated: 2025-08-10
---

# Basic Development Workflow

This guide explains the foundational 5-step development workflow used across all Dev-Agency projects. This methodology ensures quality, consistency, and thorough documentation while leveraging AI agents for enhanced productivity.

## 🎯 Core Philosophy

**"Quality, Efficiency, Security, and Documentation OVER Speed"**

The Dev-Agency workflow prioritizes:
- **Enterprise-grade quality** worthy of production environments
- **Thorough planning** before implementation
- **Comprehensive testing** and validation
- **Complete documentation** as part of deliverables
- **Continuous tracking** and improvement

## 📋 The 5-Step Process Overview

```
┌─────────────┐    ┌──────────┐    ┌───────┐    ┌──────┐    ┌───────────┐
│ 1. Research │ -> │ 2. Plan  │ -> │ 3.    │ -> │ 4.   │ -> │ 5.        │
│   /research │    │  /plan   │    │ Build │    │ Test │    │ Document  │
│             │    │          │    │/build │    │/test │    │/document  │
└─────────────┘    └──────────┘    └───────┘    └──────┘    └───────────┘
```

### Status Flow
```
BACKLOG -> TODO -> IN_PROGRESS -> CODE_REVIEW -> QA_TESTING -> DOCUMENTATION -> READY_FOR_RELEASE -> DONE
```

## Step 1: Research (`/research`)

### Purpose
Discover existing implementations, understand context, and prevent duplicate work.

### Process
1. **Search Existing Code**
   ```bash
   # Search for related functions
   Grep "similar_functionality" --type js
   
   # Check for existing patterns
   Glob "**/*component*" 
   
   # Review related documentation
   Read /path/to/related/docs.md
   ```

2. **Analyze Architecture**
   - Understand current system structure
   - Identify integration points
   - Map dependencies and constraints

3. **Document Findings**
   - Record what exists vs. what's needed
   - Note reusable components
   - Identify potential conflicts

### Agent Enhancement
- **Optional**: `/agent:architect` for complex system questions
- **When to use**: Multi-service integrations, architectural decisions

### Outputs
- Research summary
- Existing code inventory
- Technical constraints identified
- Foundation for planning phase

### Example: Bug Fix Research
```markdown
## Research Findings
- Bug exists in authentication service
- Similar issue fixed in PR #123 (user registration)
- Current auth flow: Login -> JWT -> Validation
- Affected components: AuthService, UserController
- Related tests: auth.test.js (needs updating)
```

## Step 2: Plan (`/plan`)

### Purpose
Create detailed technical specifications before implementation begins.

### Process
1. **Read Standards**
   ```bash
   Read /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development\ Workflow\ Guide.md
   ```

2. **Define Goals**
   - Clear acceptance criteria
   - Success metrics
   - Risk assessment

3. **Create Specification**
   - Use SPECS template
   - Include technical approach
   - Plan testing strategy

4. **Update Ticket Status**
   - `BACKLOG` → `TODO`
   - Add story points (1,2,3,5,8,13)
   - Link to spec document

### Agent Enhancement
- **Required**: `/agent:architect` for system design
- **Complex tasks**: Always use architect agent
- **Output**: Technical specification with detailed implementation plan

### Outputs
- Complete SPECS document
- Updated PROJECT_PLAN.md
- Implementation roadmap
- Risk mitigation plan

### Example: Feature Planning
```markdown
## Technical Specification: User Dashboard Widget

### Goals
- Add customizable widget system to user dashboard
- Support drag-and-drop widget arrangement
- Persist user preferences

### Technical Approach
- Frontend: React components with react-beautiful-dnd
- Backend: New API endpoints for widget preferences
- Database: New table user_dashboard_config

### Implementation Steps
1. Create Widget base component
2. Implement drag-and-drop container
3. Add preference persistence API
4. Create widget configuration UI
5. Add unit and integration tests

### Story Points: 8
```

## Step 3: Build (`/build`)

### Purpose
Implement clean, well-structured code following enterprise standards.

### Process
1. **Read Standards**
   ```bash
   Read /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development\ Standards\ Guide.md
   ```

2. **Update Status**
   - `TODO` → `IN_PROGRESS`
   - Update ticket progress in real-time

3. **Implement Features**
   - Follow coding standards
   - Write clean, maintainable code
   - Include error handling
   - Add logging where appropriate

4. **Code Review Prep**
   - Self-review implementation
   - Check against spec requirements
   - `IN_PROGRESS` → `CODE_REVIEW`

### Agent Enhancement
Select appropriate specialist agent:
- **`/agent:coder`** - Standard feature implementation
- **`/agent:mcp-dev`** - MCP protocol implementations
- **`/agent:hooks`** - Middleware and plugin development
- **`/agent:integration`** - Service integrations
- **`/agent:security`** - Security-critical components

### Outputs
- Complete feature implementation
- Clean, documented code
- Updated progress tracking
- Ready for testing phase

### Example: Implementation Workflow
```markdown
## Build Progress: Authentication Fix

### Implementation Steps ✓
1. ✅ Update AuthService validation logic
2. ✅ Add input sanitization
3. ✅ Update error messaging
4. ✅ Add security headers
5. 🔄 Update integration tests (in progress)

### Code Quality Checklist
- ✅ Follows coding standards
- ✅ Error handling implemented
- ✅ Logging added
- ✅ Security reviewed
- ⏳ Tests updated
```

## Step 4: Test (`/test`)

### Purpose
Ensure code quality through comprehensive testing and validation.

### Process
1. **Read Standards**
   ```bash
   Read /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Development\ Standards\ Guide.md
   ```

2. **Execute Test Suite**
   ```bash
   # Run existing tests
   npm test
   
   # Check coverage
   npm run test:coverage
   
   # Run integration tests
   npm run test:integration
   ```

3. **Create New Tests**
   - Unit tests for new functions
   - Integration tests for API endpoints
   - End-to-end tests for user workflows

4. **Manual Testing**
   - Test edge cases
   - Verify error handling
   - Check performance under load

5. **Update Status**
   - `CODE_REVIEW` → `QA_TESTING`
   - Document test results

### Agent Enhancement
- **Required**: `/agent:tester` for test creation and execution
- **Optional Specialists**:
  - `/agent:security` - Security vulnerability testing
  - `/agent:performance` - Performance and load testing

### Outputs
- All tests passing
- New test coverage for features
- Performance benchmarks
- Security validation complete

### Example: Testing Checklist
```markdown
## Testing Results: Dashboard Widget

### Test Coverage
- ✅ Unit Tests: 95% coverage
- ✅ Integration Tests: API endpoints tested
- ✅ E2E Tests: User workflow validated
- ✅ Security Tests: Input validation verified
- ✅ Performance Tests: <200ms response time

### Manual Testing
- ✅ Drag and drop functionality
- ✅ Mobile responsiveness
- ✅ Error state handling
- ✅ Data persistence
```

## Step 5: Document (`/document`)

### Purpose
Create comprehensive documentation for maintainability and user adoption.

### Process
1. **Read Documentation Guide**
   ```bash
   Read /home/hd/Desktop/LAB/Dev-Agency/Development_Standards/Guides/Documentation\ Guide.md
   ```

2. **Get Current Date**
   ```bash
   date +"%m-%d-%Y"
   ```

3. **Update Technical Documentation**
   - Update SPECS document with final implementation
   - Document any deviations from plan
   - Add troubleshooting notes

4. **Update User Documentation**
   - Update README.md if public APIs changed
   - Add usage examples
   - Update configuration guides

5. **Update Status**
   - `QA_TESTING` → `DOCUMENTATION` → `READY_FOR_RELEASE` → `DONE`

### Agent Enhancement
- **Optional**: `/agent:documenter` for user-facing documentation
- **When to use**: Complex features, public APIs, integration guides

### Outputs
- Updated SPECS document
- Current README.md (if needed)
- Complete feature documentation
- Ready for release

### Example: Documentation Update
```markdown
## Documentation Completed: Dashboard Widget

### Technical Documentation
- ✅ SPECS updated with final implementation
- ✅ API documentation added
- ✅ Component props documented
- ✅ Database schema documented

### User Documentation  
- ✅ README.md updated with widget configuration
- ✅ Usage examples added
- ✅ Troubleshooting section added
- ✅ Migration guide created
```

## 🔄 Complete Workflow Examples

### Example 1: Bug Fix Workflow

```markdown
## Bug: Authentication timeout not handled

### 1. Research (/research)
- Searched existing auth code: `Grep "timeout" --type js`
- Found related issue in session management
- Identified affected components: AuthService, SessionManager

### 2. Plan (/plan) + /agent:architect
- Created TICKET-123_spec.md
- Planned timeout handling strategy
- Added graceful degradation approach
- Status: BACKLOG → TODO (Story Points: 3)

### 3. Build (/build) + /agent:coder
- Implemented timeout detection
- Added automatic token refresh
- Created fallback authentication
- Status: TODO → IN_PROGRESS → CODE_REVIEW

### 4. Test (/test) + /agent:tester
- Added timeout simulation tests
- Verified token refresh logic
- Tested edge cases and error states
- Status: CODE_REVIEW → QA_TESTING

### 5. Document (/document)
- Updated SPECS with final solution
- Added timeout configuration to README
- Documented troubleshooting steps
- Status: QA_TESTING → DOCUMENTATION → DONE
```

### Example 2: Feature Development Workflow

```markdown
## Feature: User Profile Export

### 1. Research (/research)
- Found existing export functionality in reports module
- Identified reusable CSV generation utility
- Mapped user data structure and privacy requirements

### 2. Plan (/plan) + /agent:architect
- Designed export API with multiple formats
- Planned data filtering and anonymization
- Created comprehensive SPECS document
- Status: BACKLOG → TODO (Story Points: 8)

### 3. Build (/build) + /agent:coder
- Implemented export service
- Added format handlers (CSV, JSON, PDF)
- Created privacy-aware data filtering
- Status: TODO → IN_PROGRESS → CODE_REVIEW

### 4. Test (/test) + /agent:tester + /agent:security
- Unit tested all export formats
- Security tested data filtering
- Performance tested large datasets
- Status: CODE_REVIEW → QA_TESTING

### 5. Document (/document) + /agent:documenter
- Updated API documentation
- Created user guide for export feature
- Added admin configuration guide
- Status: QA_TESTING → READY_FOR_RELEASE → DONE
```

### Example 3: Emergency Fix Workflow

```markdown
## Critical: Production database connection pool exhaustion

### 1. Research (/research) - FAST TRACK
- Quickly identified connection leak in UserService
- Found similar fix in AuditService from last month
- Located production monitoring logs

### 2. Plan (/plan) - MINIMAL SPEC
- Created hotfix specification
- Planned connection pool management
- Identified rollback strategy
- Status: BACKLOG → TODO (Story Points: 2)

### 3. Build (/build) + /agent:coder - FOCUSED
- Fixed connection leak
- Added connection pool monitoring
- Implemented automatic cleanup
- Status: TODO → IN_PROGRESS → CODE_REVIEW

### 4. Test (/test) + /agent:tester - CRITICAL PATH
- Tested connection lifecycle
- Verified pool exhaustion fix
- Simulated high-load scenarios
- Status: CODE_REVIEW → QA_TESTING

### 5. Document (/document) - ESSENTIAL ONLY
- Updated SPECS with hotfix details
- Added monitoring alert configuration
- Documented prevention measures
- Status: QA_TESTING → READY_FOR_RELEASE → DONE
```

## 🎯 Workflow Patterns

### Standard Pattern (Most Common)
```
/research → /plan + /agent:architect → /build + /agent:coder → /test + /agent:tester → /document
```

### Security-Critical Pattern
```
/research → /plan + /agent:architect → /build + /agent:security → /test + /agent:tester + /agent:security → /document
```

### Performance-Critical Pattern
```
/research → /plan + /agent:architect → /build + /agent:performance → /test + /agent:tester + /agent:performance → /document
```

### Complex Integration Pattern
```
/research → /plan + /agent:architect + /agent:integration → /build + /agent:integration → /test + /agent:tester → /document + /agent:documenter
```

## ✅ Best Practices

### DO
- **Always follow the 5-step process** - No shortcuts
- **Update status in real-time** - Keep PROJECT_PLAN current
- **Use appropriate agents** - Match agent to task complexity
- **Document as you go** - Don't defer documentation
- **Search before creating** - Prevent duplicate work
- **Plan thoroughly** - Better planning = better outcomes

### DON'T
- **Skip research phase** - Always understand existing code
- **Start coding without specs** - Planning prevents problems
- **Ignore testing** - Quality is non-negotiable
- **Defer documentation** - Document while fresh in mind
- **Create without checking** - Search first, create second
- **Rush the process** - Quality over speed always

## ⚠️ Common Anti-Patterns

### 1. The "Quick Fix" Trap
```markdown
❌ BAD: "This is just a small change, I'll skip planning"
✅ GOOD: Even small changes follow the 5-step process
```

### 2. The "Documentation Later" Trap
```markdown
❌ BAD: "I'll document this after the next feature"
✅ GOOD: Documentation is part of DONE definition
```

### 3. The "It Works on My Machine" Trap
```markdown
❌ BAD: Manual testing only in development
✅ GOOD: Comprehensive test suite including edge cases
```

### 4. The "Copy-Paste Solution" Trap
```markdown
❌ BAD: Copying code without understanding context
✅ GOOD: Research existing patterns and adapt properly
```

## 🚨 Quality Gates

Before advancing to next step, ensure:

### Research → Plan
- [ ] Existing code surveyed
- [ ] Dependencies mapped
- [ ] Constraints identified
- [ ] No duplicate implementations

### Plan → Build  
- [ ] SPECS document complete
- [ ] Acceptance criteria clear
- [ ] Technical approach validated
- [ ] Story points assigned

### Build → Test
- [ ] Implementation matches spec
- [ ] Code follows standards
- [ ] Error handling included
- [ ] Self-review completed

### Test → Document
- [ ] All tests passing
- [ ] Coverage requirements met
- [ ] Manual testing complete
- [ ] Performance validated

### Document → Done
- [ ] SPECS updated
- [ ] README current (if needed)
- [ ] Release notes prepared
- [ ] Definition of Done met

## 🔧 Tools and Commands

### Session Management
```bash
/cmd           # Initialize session
/research      # Start research phase
/plan          # Begin planning with standards
/build         # Start implementation
/test          # Execute testing phase
/document      # Complete documentation
/done          # Finish and mark complete
```

### Agent Commands
```bash
/agent:architect     # System design and architecture
/agent:coder        # General implementation
/agent:tester       # QA and testing
/agent:security     # Security review
/agent:performance  # Performance optimization
/agent:documenter   # User documentation
/agent:mcp-dev      # MCP implementations
/agent:integration  # Service integration
/agent:hooks        # Middleware development
```

### Status Commands
```bash
/reflect           # Review progress and quality
/agent-status      # Check agent performance
/agent-metrics     # View productivity data
/agent-feedback    # Record improvement notes
```

## 📊 Success Metrics

Track these metrics to improve workflow effectiveness:

### Process Metrics
- **Time per step** - Identify bottlenecks
- **Defect rate** - Measure quality improvements
- **Documentation coverage** - Ensure completeness
- **Agent effectiveness** - Optimize AI usage

### Quality Metrics
- **Code review findings** - Track improvement trends
- **Test coverage** - Maintain quality standards
- **Production issues** - Validate process effectiveness
- **Technical debt** - Monitor accumulation

### Productivity Metrics
- **Story points completed** - Track velocity
- **Cycle time** - Measure efficiency
- **Agent utilization** - Optimize AI assistance
- **Developer satisfaction** - Process improvement feedback

## 🎓 Learning Path

### Beginner (First Week)
1. Read this workflow guide completely
2. Practice with simple bug fixes
3. Use standard agents (/agent:coder, /agent:tester)
4. Focus on following all 5 steps

### Intermediate (First Month)
1. Handle feature development workflows
2. Use specialized agents (/agent:architect, /agent:security)
3. Optimize agent combinations for different tasks
4. Start recognizing workflow patterns

### Advanced (Ongoing)
1. Design custom workflow patterns
2. Mentor others on workflow adoption
3. Contribute to workflow improvements
4. Lead complex multi-team initiatives

## 📚 Additional Resources

- [Development Standards Guide](../standards/development-standards-guide.md)
- [Agent System Documentation](../agents/agent-system.md)
- [Project Planning Templates](../templates/project-plan-template.md)
- [Quality Assurance Guide](../guides/quality-assurance.md)
- [Documentation Standards](../standards/documentation-guide.md)

---

*This workflow guide is part of the Dev-Agency central system. For updates and improvements, contribute to the central repository at `/home/hd/Desktop/LAB/Dev-Agency/`.*