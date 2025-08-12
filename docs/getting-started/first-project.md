---
title: Your First Dev-Agency Project
description: Complete hands-on guide to creating and setting up your first Dev-Agency project
type: guide
category: getting-started
tags: [tutorial, first-project, setup, agents, workflow]
created: 2025-08-10
updated: 2025-08-10
---

# Your First Dev-Agency Project

Welcome to Dev-Agency! This hands-on tutorial will walk you through creating your first project using our centralized agentic development system. By the end, you'll have built a simple web API project while learning how to leverage Dev-Agency's powerful agent system.

## What You'll Build

We'll create a **Task Manager API** - a simple REST API that demonstrates:
- Project setup with Dev-Agency
- Agent-enhanced development workflow
- Professional development practices
- Complete documentation

**Expected time:** 30-45 minutes

## Prerequisites

- Dev-Agency installed (see [installation guide](installation.md))
- Basic familiarity with REST APIs
- Text editor of your choice

---

## Part 1: Project Setup

### Step 1: Create Your Project Directory

```bash
mkdir ~/my-first-dev-agency-project
cd ~/my-first-dev-agency-project
```

### Step 2: Initialize the Project Structure

Create the basic Dev-Agency project structure:

```bash
# Create core directories
mkdir -p Project_Management/{Specs,Bug_Reports,Releases,Archive}
mkdir -p src/{routes,models,middleware}
mkdir -p tests
```

### Step 3: Create Your Project CLAUDE.md

Create the project's CLAUDE.md file that connects to the central Dev-Agency system:

```bash
cat > CLAUDE.md << 'EOF'
# Task Manager API Project

**Project:** Task Manager API - RESTful task management service
**Type:** Web API Application  
**Language:** Node.js/Express
**Status:** Active Development

## Central Agent System
All agents, guides, and templates are managed centrally at:
`/home/hd/Desktop/LAB/Dev-Agency/`

## Project-Specific Configuration

### Project Context
- **Project Type**: REST API
- **Primary Language**: JavaScript (Node.js)
- **Key Dependencies**: Express, SQLite, Jest
- **Architecture**: MVC pattern with middleware

### Development Guidelines
- RESTful API design principles
- Comprehensive error handling
- Input validation on all endpoints
- Automated testing for all routes
- API documentation with examples

### Quality Standards
- All endpoints must have tests
- Error responses must be consistent
- Database queries must be parameterized
- All routes must have proper middleware

---

*This project uses the centralized Dev-Agency system. Do not copy Dev-Agency files here - always reference the central location.*
EOF
```

**Expected output**: You now have a project-specific CLAUDE.md that inherits all Dev-Agency capabilities while defining your project's context.

---

## Part 2: Initialize Your First Planning Session

### Step 4: Start Claude and Initialize Session

Open Claude Code in your project directory and run:

```bash
/cmd
```

**Expected response**: Claude will read your CLAUDE.md, acknowledge the Dev-Agency integration, and greet you with project context.

### Step 5: Create Your PROJECT_PLAN.md

Run the planning initialization:

```bash
/standards
```

Then create your project plan:

```bash
cat > Project_Management/PROJECT_PLAN.md << 'EOF'
---
title: Task Manager API - Project Plan
description: Development roadmap for RESTful task management API
type: project-plan
created: 2025-08-10
updated: 2025-08-10
---

# Task Manager API - Project Plan

## Project Overview
**Goal**: Build a production-ready REST API for task management
**Timeline**: 1-2 development sessions
**Story Points Total**: 21 points

## Sprint 1: Core API Foundation (13 points)

### Epic: API Infrastructure
**Status**: PLANNED
**Story Points**: 8

| Ticket ID | Title | Status | Points | Spec |
|-----------|-------|---------|---------|------|
| TASK-001 | Setup Express server with middleware | BACKLOG | 3 | [Spec](Specs/TASK-001_spec.md) |
| TASK-002 | Implement SQLite database setup | BACKLOG | 2 | [Spec](Specs/TASK-002_spec.md) |
| TASK-003 | Create Task model and validation | BACKLOG | 3 | [Spec](Specs/TASK-003_spec.md) |

### Epic: CRUD Operations
**Status**: PLANNED  
**Story Points**: 5

| Ticket ID | Title | Status | Points | Spec |
|-----------|-------|---------|---------|------|
| TASK-004 | POST /tasks - Create new task | BACKLOG | 2 | [Spec](Specs/TASK-004_spec.md) |
| TASK-005 | GET /tasks - List all tasks | BACKLOG | 1 | [Spec](Specs/TASK-005_spec.md) |
| TASK-006 | PUT /tasks/:id - Update task | BACKLOG | 2 | [Spec](Specs/TASK-006_spec.md) |

## Sprint 2: Testing & Documentation (8 points)

### Epic: Quality Assurance
**Status**: PLANNED
**Story Points**: 5

| Ticket ID | Title | Status | Points | Spec |
|-----------|-------|---------|---------|------|
| TASK-007 | Unit tests for all routes | BACKLOG | 3 | [Spec](Specs/TASK-007_spec.md) |
| TASK-008 | Integration tests | BACKLOG | 2 | [Spec](Specs/TASK-008_spec.md) |

### Epic: Documentation
**Status**: PLANNED
**Story Points**: 3

| Ticket ID | Title | Status | Points | Spec |
|-----------|-------|---------|---------|------|
| TASK-009 | API documentation with examples | BACKLOG | 2 | [Spec](Specs/TASK-009_spec.md) |
| TASK-010 | Deployment guide | BACKLOG | 1 | [Spec](Specs/TASK-010_spec.md) |

## Development Status

### Current Sprint: Sprint 1
- **Started**: 2025-08-10
- **Target Completion**: TBD
- **Completed Points**: 0/13
- **Remaining Points**: 13

### Next Actions
1. Start with TASK-001 (Express server setup)
2. Use `/agent:architect` for system design
3. Use `/agent:coder` for implementation
4. Use `/agent:tester` for testing

## Notes
- Following 5-step Dev-Agency process for each ticket
- Using agent-enhanced workflow for quality
- Targeting production-ready code standards
EOF
```

**Expected output**: A complete project plan with tickets organized into sprints, ready for agent-enhanced development.

---

## Part 3: Your First Agent-Enhanced Development Session

### Step 6: Select Your First Ticket

Let's start with TASK-001. In Claude, run:

```bash
/research
```

**What Claude will do:**
- Search for existing Express server patterns
- Look for middleware examples
- Check for similar implementations
- Prepare context for planning

**Expected output**: Research findings about Express server setup, middleware patterns, and best practices.

### Step 7: Create Your First Spec with Architecture Agent

Run the planning phase:

```bash
/plan
```

Then invoke the architect agent:

```bash
/agent:architect
```

**Agent Input Context** (Claude will prepare this automatically):
```
PROJECT: Task Manager API - Express server setup
REQUIREMENTS: 
- Express server with essential middleware
- Error handling middleware
- Request logging
- CORS support
- JSON parsing
- Production-ready structure

STANDARDS: [Dev-Agency standards will be embedded]
EXISTING CODE: [Research findings will be included]
```

**Expected Agent Output**:
```
## System Architecture for Express Server Setup

### 1. Server Structure
```
src/
├── app.js          # Express app configuration
├── server.js       # Server startup
├── middleware/     # Custom middleware
│   ├── errorHandler.js
│   ├── logger.js
│   └── validation.js
└── config/
    └── database.js
```

### 2. Middleware Stack (in order)
1. CORS configuration
2. JSON body parsing
3. Request logging
4. Route handling
5. Error handling (last)

### 3. Implementation Plan
1. Create app.js with Express configuration
2. Setup middleware stack
3. Create custom error handler
4. Setup server.js for startup
5. Add environment configuration

### 4. Key Decisions
- Separate app config from server startup for testability
- Custom error middleware for consistent responses
- Environment-based configuration
- Structured logging for debugging

### 5. Success Criteria
- Server starts without errors
- Middleware stack executes in correct order
- Error handling returns consistent JSON responses
- All requests logged properly
```

**What happens next**: Claude creates a detailed spec file at `Project_Management/Specs/TASK-001_spec.md` using this architecture.

### Step 8: Implement with Coder Agent

Move to implementation phase:

```bash
/build
```

Claude will update the ticket status to `IN_PROGRESS`, then invoke:

```bash
/agent:coder
```

**Expected Agent Output** (abbreviated):
```javascript
// src/app.js - Express application configuration
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware stack
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorHandler);

module.exports = app;
```

```javascript
// src/server.js - Server startup
const app = require('./app');
const config = require('./config');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Task Manager API server running on port ${PORT}`);
});

module.exports = server;
```

### Step 9: Test with Tester Agent

Move to testing phase:

```bash
/test
```

Claude will invoke the tester agent:

```bash
/agent:tester
```

**Expected Agent Output**:
```javascript
// tests/app.test.js - Basic server tests
const request = require('supertest');
const app = require('../src/app');

describe('Express Server', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app)
        .get('/nonexistent')
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
    });
  });
});
```

**Testing Results**: All tests pass, server starts correctly, middleware functions properly.

### Step 10: Document and Complete

Run the documentation phase:

```bash
/document
```

Claude updates the spec with implementation details and runs:

```bash
/done
```

**Expected output**: 
- Ticket TASK-001 marked as `DONE`
- PROJECT_PLAN.md updated with progress
- Release notes prepared
- Implementation validated against spec

---

## Part 4: Understanding Agent Output and Next Steps

### What Just Happened?

You successfully completed your first agent-enhanced development cycle:

1. **Research Phase**: Claude searched for patterns and best practices
2. **Planning Phase**: `/agent:architect` designed the system structure
3. **Implementation Phase**: `/agent:coder` wrote production-ready code
4. **Testing Phase**: `/agent:tester` created comprehensive tests
5. **Documentation Phase**: All documentation updated automatically

### Key Benefits You Experienced

- **Quality**: Each agent specializes in their domain
- **Consistency**: All code follows Dev-Agency standards
- **Completeness**: Nothing gets forgotten (tests, docs, validation)
- **Speed**: Agents handle boilerplate, you focus on decisions

### Your Project Now Has

```
my-first-dev-agency-project/
├── CLAUDE.md                           # Project configuration
├── Project_Management/
│   ├── PROJECT_PLAN.md                 # Updated with progress
│   ├── Specs/
│   │   └── TASK-001_spec.md           # Complete specification
│   └── Releases/
│       └── Release_Notes.md           # Ready for commit
├── src/
│   ├── app.js                         # Express configuration
│   ├── server.js                      # Server startup
│   └── middleware/
│       └── errorHandler.js            # Custom error handling
├── tests/
│   └── app.test.js                    # Comprehensive tests
└── package.json                       # Dependencies
```

### Running Your API

```bash
# Install dependencies
npm install express cors morgan

# Start the server
node src/server.js

# Test it works
curl http://localhost:3000/health
# Expected: {"status":"OK","timestamp":"2025-08-10T..."}
```

---

## Part 5: Continuing Development

### Next Steps

1. **Continue with TASK-002**: Database setup
```bash
# In Claude
/research  # Research SQLite patterns
/plan      # Plan database structure  
/agent:architect  # Design schema
/build     # Implement with /agent:coder
/test      # Validate with /agent:tester
/document  # Update documentation
/done      # Complete the cycle
```

2. **Track Your Progress**: Watch your PROJECT_PLAN.md update automatically

3. **Commit Your Work**: Use the `/commit` command for professional commits

### Advanced Features to Explore

- **Agent Recipes**: Use `/agent-recipe [name]` for proven combinations
- **Performance Optimization**: Add `/agent:performance` for optimization
- **Security Review**: Include `/agent:security` for security audits
- **Integration Testing**: Use `/agent:integration` for complex integrations

### Common Patterns

| Development Task | Recommended Agents |
|------------------|-------------------|
| New Feature | `/agent:architect` → `/agent:coder` → `/agent:tester` |
| Bug Fix | `/agent:tester` → `/agent:coder` → `/agent:tester` |
| Performance Issue | `/agent:performance` → `/agent:coder` |
| Security Audit | `/agent:security` → `/agent:coder` (if fixes needed) |
| Documentation | `/agent:documenter` |

---

## Part 6: Working with Existing Projects

### Integrating Dev-Agency into Existing Projects

If you have an existing project, here's how to add Dev-Agency:

1. **Create CLAUDE.md in your project root**:
```markdown
# Your Existing Project

## Central Agent System
All agents, guides, and templates are managed centrally at:
`/home/hd/Desktop/LAB/Dev-Agency/`

## Project-Specific Configuration
[Add your project's specific context here]
```

2. **Add Project_Management folder**:
```bash
mkdir -p Project_Management/{Specs,Bug_Reports,Releases,Archive}
```

3. **Create PROJECT_PLAN.md** with your existing backlog

4. **Start using agents** for new development

### Migration Example: Adding Authentication to Existing API

```bash
# In Claude, in your existing project
/research  # Find existing auth patterns in codebase
/plan      # Create authentication strategy
/agent:architect  # Design auth system
/agent:security   # Security review of design
/build    # Implement with /agent:coder
/test     # Create tests with /agent:tester
/document # Update API docs
/done     # Complete and commit
```

---

## Troubleshooting Common Issues

### Issue: Agent Not Found
**Problem**: `/agent:architect` returns "not found"
**Solution**: Ensure Claude Code can access `/home/hd/Desktop/LAB/Dev-Agency/Agents/`

### Issue: Context Too Large
**Problem**: Agent receives truncated context
**Solution**: Break down tickets into smaller pieces (3 story points max recommended)

### Issue: Inconsistent Output
**Problem**: Agent output varies significantly
**Solution**: Improve context by including more specific requirements and examples

### Issue: Tests Failing
**Problem**: `/agent:tester` creates failing tests
**Solution**: Run `/agent:tester` again with the error output as additional context

---

## Success Indicators

You'll know you're succeeding with Dev-Agency when:

✅ **Planning becomes effortless** - Agents handle technical design
✅ **Code quality improves** - Agents enforce best practices
✅ **Documentation stays current** - No more outdated docs
✅ **Testing is comprehensive** - Agents create thorough test suites
✅ **Development accelerates** - Less time on boilerplate, more on features
✅ **Knowledge transfers** - Team members can understand any codebase

---

## What's Next?

### Continue Learning
- [Agent Recipes Guide](../recipes/README.md) - Proven agent combinations
- [Advanced Workflows](../workflows/advanced-patterns.md) - Complex development patterns
- [Production Deployment](../production-reliability.md) - Taking projects live

### Join the Community
- Share your first project experience
- Contribute agent improvements
- Help other developers get started

### Build More Projects
Now that you understand the Dev-Agency workflow, try:
- A React frontend to connect to your API
- A CLI tool for managing tasks
- A microservice architecture project

---

## Conclusion

Congratulations! You've completed your first Dev-Agency project and experienced:

- **Agent-enhanced development workflow**
- **Professional project structure**
- **Automated quality assurance**
- **Complete documentation**
- **Production-ready code**

The Task Manager API you built demonstrates how Dev-Agency transforms development from a manual, error-prone process into a systematic, quality-driven workflow.

**Remember**: The key to success with Dev-Agency is following the 5-step process and leveraging agents for their specialized expertise. Each agent makes you better at what they do best, while you focus on the creative and strategic aspects of software development.

**Next action**: Complete the remaining tickets in your PROJECT_PLAN.md using the same agent-enhanced workflow you just learned.

Happy coding! 🚀

---

*This guide is part of the Dev-Agency documentation system. For questions or improvements, see [Contributing Guide](../development/contributing.md).*