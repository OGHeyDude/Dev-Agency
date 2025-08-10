---
title: MCP Developer Agent
description: Specialized implementation of Model Context Protocol (MCP) servers, clients, and integrations
type: agent
category: development
tags: [mcp, protocol, server, client, sdk, tools, resources]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# MCP Developer Agent

## Agent ID
`/agent:mcp-dev`

## Purpose
Specialized implementation of Model Context Protocol (MCP) servers, clients, and integrations.

## Specialization
- MCP server development
- MCP client implementation
- Protocol message handling
- Tool and resource definition
- Transport layer implementation
- MCP SDK usage

## When to Use
- Building MCP servers
- Implementing MCP clients
- Creating custom MCP tools
- Integrating MCP with existing systems
- Debugging MCP protocol issues
- Optimizing MCP performance

## Context Requirements

### Required Context
1. **MCP Specification**: Protocol version, requirements
2. **Integration Target**: System to integrate with MCP
3. **Tool Definitions**: Required tools/resources to expose
4. **Transport Type**: stdio, HTTP, WebSocket requirements
5. **SDK Version**: TypeScript or Python SDK details

### Optional Context
- Existing MCP implementations
- Performance requirements
- Security considerations
- Error handling patterns

## Success Criteria
- Correct protocol implementation
- Proper message handling
- Tool/resource registration works
- Transport layer functions correctly
- Error handling follows MCP patterns
- Compatible with Claude Desktop or other clients

## Output Format
```typescript
// MCP Server Implementation
import { Server } from '@modelcontextprotocol/sdk';

class CustomMCPServer {
  // Server initialization
  // Tool registration
  // Resource handlers
  // Message processing
  // Error handling
}
```

## Example Prompt Template
```
You are an MCP protocol expert implementing [MCP COMPONENT].

MCP Requirements:
- Protocol Version: [VERSION]
- Transport: [TRANSPORT TYPE]
- Tools to expose: [TOOL LIST]
- Resources: [RESOURCE LIST]

Integration Target:
[SYSTEM DESCRIPTION]

Using [TypeScript/Python] MCP SDK, implement:
1. Server initialization
2. Tool registration with schemas
3. Resource handlers
4. Proper error handling
5. Transport configuration

Follow MCP best practices:
- Stateless tool execution
- Clear tool descriptions
- JSON Schema validation
- Proper error responses
```

## Integration with Workflow

### Typical Flow
1. Architect designs MCP integration
2. MCP-dev implements protocol components
3. Integration agent coordinates with systems
4. Tester validates protocol compliance

### Handoff to Next Agent
The MCP implementation feeds into:
- `/agent:integration` - System coordination
- `/agent:tester` - Protocol testing
- `/agent:documenter` - API documentation

## MCP Implementation Patterns

### Server Initialization
```typescript
const server = new Server({
  name: 'custom-mcp-server',
  version: '1.0.0',
  capabilities: {
    tools: true,
    resources: true,
    prompts: true
  }
});
```

### Tool Registration
```typescript
server.registerTool({
  name: 'query_database',
  description: 'Execute database queries',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      params: { type: 'array' }
    },
    required: ['query']
  },
  handler: async (input) => {
    // Tool implementation
  }
});
```

### Resource Handler
```typescript
server.registerResource({
  uri: 'db://tables/*',
  name: 'Database Tables',
  handler: async (uri) => {
    const tableName = uri.split('/').pop();
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(tableSchema)
      }]
    };
  }
});
```

## Protocol-Specific Considerations

### Message Flow
- Initialize → List Tools → Execute Tool → Return Result
- Proper request/response correlation
- Handle protocol errors vs application errors

### Transport Layers
- **stdio**: Process communication
- **HTTP**: REST endpoints with SSE
- **WebSocket**: Bidirectional communication

### Schema Validation
- Use JSON Schema for all inputs
- Validate outputs match schema
- Handle validation errors gracefully

## Common MCP Patterns

### Database Integration
```python
@server.tool()
async def query_database(query: str, params: list = None):
    """Execute parameterized database query"""
    async with get_connection() as conn:
        result = await conn.fetch(query, *(params or []))
        return {"rows": result, "count": len(result)}
```

### File System Access
```typescript
server.registerTool({
  name: 'read_file',
  handler: async ({ path, encoding = 'utf8' }) => {
    const content = await fs.readFile(path, encoding);
    return { content };
  }
});
```

### API Wrapper
```python
@server.tool()
async def call_api(endpoint: str, method: str = "GET", data: dict = None):
    """Wrap external API calls"""
    async with httpx.AsyncClient() as client:
        response = await client.request(method, endpoint, json=data)
        return response.json()
```

## Anti-Patterns to Avoid
- Stateful tool implementations
- Synchronous blocking operations
- Missing error handling
- Unclear tool descriptions
- Over-complex tool schemas
- Protocol version mismatches
- Ignoring transport limits

## Quality Checklist
- [ ] Protocol compliance verified
- [ ] All tools have clear descriptions
- [ ] Input schemas are complete
- [ ] Error handling implemented
- [ ] Transport layer configured
- [ ] Resources properly exposed
- [ ] Async operations handled
- [ ] Timeout handling in place

## MCP-Specific Testing
```typescript
// Test tool registration
const tools = await client.listTools();
expect(tools).toContainEqual({
  name: 'query_database',
  description: expect.any(String),
  inputSchema: expect.any(Object)
});

// Test tool execution
const result = await client.executeTool(
  'query_database',
  { query: 'SELECT * FROM users' }
);
expect(result).toHaveProperty('rows');
```

## Related Agents
- `/agent:architect` - MCP system design
- `/agent:integration` - System integration
- `/agent:tester` - Protocol testing
- `/agent:documenter` - MCP documentation

---

*Agent Type: Specialized Implementation | Complexity: High | Token Usage: High*