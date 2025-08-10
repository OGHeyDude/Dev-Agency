---
title: MCP Server Implementation
description: Complete workflow for implementing a Model Context Protocol server using specialized agents
type: recipe
category: development
tags: [mcp, model-context-protocol, server, integration, tools, claude-desktop]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Recipe: MCP Server Implementation

## Overview
Complete workflow for implementing a Model Context Protocol (MCP) server using specialized agents.

## Use Case
- Creating MCP servers for tool exposure
- Building Claude Desktop integrations
- Exposing databases via MCP
- Creating API wrappers as MCP tools

## Agent Sequence

```mermaid
graph LR
    A[Research] --> B[architect]
    B --> C[mcp-dev]
    C --> D[integration]
    D --> E[tester]
    E --> F[documenter]
```

## Step-by-Step Process

### Step 1: Research Phase
**Agent:** Main Claude  
**Actions:**
```bash
# Check for existing MCP implementations
Grep "Server|@modelcontextprotocol" --type ts
Grep "registerTool|registerResource" --type ts

# Find integration points
Read package.json  # Check for MCP SDK
Glob "**/*mcp*"    # Find MCP-related files

# Understand data sources
Read database configs or API documentation
```

### Step 2: Architecture Design
**Agent:** `/agent:architect`  
**Context Required:**
```markdown
- System to expose via MCP
- Required tools and their purposes
- Resource types needed
- Transport method (stdio/HTTP/WebSocket)
- Claude Desktop integration requirements
- Data flow and security needs
```

**Expected Output:**
- MCP server architecture
- Tool definitions and schemas
- Resource URI patterns
- Integration strategy
- Error handling approach

### Step 3: MCP Implementation
**Agent:** `/agent:mcp-dev`  
**Context Required:**
```markdown
- Architecture design from architect
- MCP SDK version (TypeScript/Python)
- Tool specifications with JSON schemas
- Resource definitions
- Transport configuration
- Example MCP server (if available)
```

**Expected Output:**
- Complete MCP server implementation
- Tool registration with handlers
- Resource handlers
- Transport setup
- Error handling
- Schema validation

### Step 4: System Integration
**Agent:** `/agent:integration`  
**Context Required:**
```markdown
- MCP server implementation
- Target system details (database/API)
- Authentication methods
- Connection configuration
- Rate limiting requirements
- Error recovery strategy
```

**Expected Output:**
- Connection management code
- Authentication integration
- Rate limiting implementation
- Circuit breaker pattern
- Retry logic
- Monitoring hooks

### Step 5: Protocol Testing
**Agent:** `/agent:tester`  
**Context Required:**
```markdown
- Complete MCP implementation
- Tool schemas
- Expected behaviors
- MCP client test setup
- Mock data for testing
```

**Expected Output:**
- Tool registration tests
- Tool execution tests
- Resource access tests
- Error handling tests
- Transport tests
- Integration tests

### Step 6: MCP Documentation
**Agent:** `/agent:documenter`  
**Context Required:**
```markdown
- MCP server implementation
- Tool descriptions and schemas
- Resource patterns
- Setup instructions
- Configuration options
```

**Expected Output:**
- MCP server README
- Tool usage guide
- Claude Desktop setup instructions
- Configuration documentation
- Troubleshooting guide

## Common Context Template

```markdown
## MCP Requirements
- Protocol Version: 1.0
- SDK: TypeScript/Python
- Transport: stdio/HTTP/WebSocket
- Client: Claude Desktop

## Tools to Expose
1. [Tool Name]
   - Purpose: [What it does]
   - Inputs: [Parameters]
   - Output: [Return type]

## Resources to Expose
1. [Resource Pattern]
   - Type: [Data type]
   - Access: [Read/Write]

## Integration Target
- System: [Database/API/Service]
- Authentication: [Method]
- Connection: [Details]
```

## Parallel Execution Opportunities

After MCP implementation (Step 3), run in parallel:
- `/agent:integration` - System connections
- `/agent:tester` - Protocol testing

## Success Criteria
- [ ] MCP server starts successfully
- [ ] All tools registered with schemas
- [ ] Resources accessible via URIs
- [ ] Claude Desktop can connect
- [ ] Error handling robust
- [ ] Tests passing
- [ ] Documentation complete

## Time Estimates
- Research: 20-30 minutes
- Architecture: 25-35 minutes
- MCP Implementation: 60-90 minutes
- Integration: 30-45 minutes
- Testing: 30-40 minutes
- Documentation: 25-35 minutes

**Total: 3-4.5 hours**

## Example MCP Tool Pattern

```typescript
// Tool registration example to include in context
server.registerTool({
  name: 'query_database',
  description: 'Execute SQL queries',
  inputSchema: {
    type: 'object',
    properties: {
      query: { 
        type: 'string',
        description: 'SQL query to execute'
      },
      params: {
        type: 'array',
        items: { type: 'string' },
        description: 'Query parameters'
      }
    },
    required: ['query']
  },
  handler: async (input) => {
    // Implementation
    return { result: data };
  }
});
```

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Schema validation errors | Include complete JSON Schema specs |
| Transport configuration | Provide working transport example |
| Async handling issues | Show proper async/await patterns |
| Claude Desktop connection | Include config file template |

## Testing Strategy

### Local Testing
```bash
# Test MCP server locally
npx @modelcontextprotocol/client stdio ./mcp-server.js

# List tools
{ "method": "tools/list" }

# Execute tool
{ "method": "tools/execute", "params": { "name": "tool_name", "input": {} } }
```

### Claude Desktop Testing
1. Configure in Claude Desktop settings
2. Verify tool availability
3. Test each tool functionality
4. Check error handling

## Recipe Variations

### Database MCP Server
- Focus on SQL query tools
- Include schema exploration resources
- Add transaction support

### API Wrapper MCP
- Map API endpoints to tools
- Handle authentication
- Include rate limiting

### File System MCP
- File operations as tools
- Directory resources
- Permission handling

---

*Recipe Version: 1.0 | Last Updated: 08-09-2025*