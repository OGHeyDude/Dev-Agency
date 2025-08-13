---
title: Hooks Expert Agent
description: Design and implementation of hooks, middleware, plugins, and event-driven architectures for extensible systems
type: agent
category: development
tags: [hooks, middleware, plugins, events, extensibility, lifecycle]
created: 2025-08-09
updated: 2025-08-09
version: 1.0
status: stable
---

# Hooks Expert Agent

## Agent ID
`/agent:hooks`

## Purpose
Design and implementation of hooks, middleware, plugins, and event-driven architectures for extensible systems.

## Specialization
- Hook system design
- Middleware implementation
- Plugin architecture
- Event emitters/listeners
- Lifecycle management
- Dependency injection
- AOP (Aspect-Oriented Programming)

## When to Use
- Building extensible systems
- Implementing middleware chains
- Creating plugin architectures
- Adding lifecycle hooks
- Event system implementation
- Cross-cutting concerns (logging, auth)

## Context Requirements

### Required Context
1. **System Architecture**: Where hooks integrate
2. **Hook Points**: Where extensibility is needed
3. **Event Flow**: Order of operations
4. **Data Context**: What data hooks receive/modify
5. **Use Cases**: What extensions are expected

### Optional Context
- Existing hook patterns
- Performance constraints
- Security requirements
- Plugin examples

## Success Criteria
- Hooks execute in correct order
- Data flows properly through chain
- Error handling doesn't break flow
- Performance impact minimal
- Easy to extend
- Well-documented hook points

## Output Format
```javascript
// Hook System Implementation
class HookSystem {
  // Registration
  register(hookName, handler, priority)
  
  // Execution
  async execute(hookName, context)
  
  // Management
  remove(hookName, handler)
  
  // Error handling
  onError(handler)
}

// Example Usage
hooks.register('beforeSave', validateData, 10);
hooks.register('afterSave', sendNotification, 20);
```

## Example Prompt Template
```
You are a hooks/middleware expert implementing [SYSTEM TYPE].

Requirements:
- Hook Points: [WHERE HOOKS NEEDED]
- Data Flow: [WHAT DATA PASSES THROUGH]
- Modifications Allowed: [WHAT CAN BE CHANGED]
- Ordering: [PRIORITY/SEQUENCE NEEDS]

Existing System:
[CURRENT ARCHITECTURE]

Implement:
1. Hook registration system
2. Execution pipeline
3. Priority/ordering management
4. Error handling
5. Context passing
6. Async support

Include examples of:
- Common hook implementations
- Middleware chain setup
- Plugin registration
```

## Integration with Workflow

### Typical Flow
1. Architect identifies extension points
2. Hooks expert designs system
3. Implements hook infrastructure
4. Coder uses hooks in features
5. Documenter creates plugin guides

### Handoff to Next Agent
Hook systems enable:
- `/agent:coder` - Using hooks in code
- `/agent:tester` - Testing hook chains
- `/agent:documenter` - Plugin documentation
- `/agent:security` - Security hooks

## Hook System Patterns

### Event-Driven Hooks
```javascript
class EventHooks {
  constructor() {
    this.hooks = new Map();
  }

  // Register hook with priority
  register(event, handler, priority = 10) {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    
    this.hooks.get(event).push({
      handler,
      priority,
      id: Symbol()
    });
    
    // Sort by priority
    this.hooks.get(event).sort((a, b) => a.priority - b.priority);
    
    return handler;
  }

  // Execute hooks in sequence
  async execute(event, context = {}) {
    const handlers = this.hooks.get(event) || [];
    let result = context;
    
    for (const { handler } of handlers) {
      try {
        const hookResult = await handler(result);
        // Allow hooks to modify context
        if (hookResult !== undefined) {
          result = hookResult;
        }
      } catch (error) {
        // Don't let one hook break the chain
        await this.handleError(error, event, handler);
      }
    }
    
    return result;
  }

  // Parallel execution for independent hooks
  async executeParallel(event, context = {}) {
    const handlers = this.hooks.get(event) || [];
    
    await Promise.all(
      handlers.map(({ handler }) => 
        handler(context).catch(error => 
          this.handleError(error, event, handler)
        )
      )
    );
  }
}
```

### Middleware Chain Pattern
```typescript
type Middleware<T = any> = (
  context: T,
  next: () => Promise<void>
) => Promise<void>;

class MiddlewareChain<T> {
  private middlewares: Middleware<T>[] = [];

  use(middleware: Middleware<T>): void {
    this.middlewares.push(middleware);
  }

  async execute(context: T): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return;
      
      const middleware = this.middlewares[index++];
      await middleware(context, next);
    };

    await next();
  }
}

// Usage
const chain = new MiddlewareChain<RequestContext>();

chain.use(async (ctx, next) => {
  console.log('Before');
  await next();
  console.log('After');
});

chain.use(async (ctx, next) => {
  ctx.user = await authenticate(ctx.token);
  await next();
});
```

### Plugin System
```python
class PluginSystem:
    def __init__(self):
        self.plugins = {}
        self.hooks = defaultdict(list)
    
    def register_plugin(self, plugin):
        """Register a plugin with its hooks"""
        plugin_id = plugin.name
        self.plugins[plugin_id] = plugin
        
        # Register all plugin hooks
        for hook_name, handler in plugin.get_hooks().items():
            self.hooks[hook_name].append({
                'plugin': plugin_id,
                'handler': handler,
                'priority': getattr(handler, 'priority', 10)
            })
        
        # Sort by priority
        for hook_list in self.hooks.values():
            hook_list.sort(key=lambda x: x['priority'])
        
        # Initialize plugin
        plugin.initialize(self)
    
    async def call_hook(self, hook_name, *args, **kwargs):
        """Call all handlers for a hook"""
        results = []
        
        for hook in self.hooks.get(hook_name, []):
            try:
                result = await hook['handler'](*args, **kwargs)
                results.append(result)
                
                # Allow hooks to stop propagation
                if result is StopPropagation:
                    break
                    
            except Exception as e:
                await self.handle_hook_error(hook, e)
        
        return results
    
    def filter_hook(self, hook_name, value):
        """Allow hooks to modify a value"""
        for hook in self.hooks.get(hook_name, []):
            try:
                value = hook['handler'](value)
            except Exception as e:
                self.handle_hook_error(hook, e)
        
        return value
```

### Observability Hook System (Claude Code Integration)
```python
#!/usr/bin/env python3
import json
import sys
import requests
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional

class ObservabilityHook:
    """Base class for Claude Code observability hooks"""
    
    def __init__(self, server_url: str = "http://localhost:4000"):
        self.server_url = server_url
        self.session_id = None
        self.batch = []
        self.batch_size = 10
        self.batch_timeout = 0.5
        
    def process_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process raw event data into observability format"""
        # Extract common fields
        processed = {
            'source_app': 'claude_code',
            'session_id': event_data.get('session_id'),
            'hook_event_type': event_data.get('event_type'),
            'timestamp': int(datetime.now().timestamp() * 1000),
            'payload': json.dumps(event_data)
        }
        
        # Extract tool-specific data
        if 'tool' in event_data:
            processed.update({
                'tool_name': event_data['tool'].get('name'),
                'tool_input': json.dumps(event_data['tool'].get('params')),
                'tool_duration_ms': event_data.get('duration_ms')
            })
        
        # Extract agent context
        if 'agent' in event_data:
            processed.update({
                'agent_type': event_data['agent'].get('type'),
                'agent_version': event_data['agent'].get('version'),
                'agent_id': event_data['agent'].get('id'),
                'parent_agent_id': event_data['agent'].get('parent_id')
            })
        
        # Extract task management
        if 'task' in event_data:
            processed.update({
                'task_id': event_data['task'].get('id'),
                'task_title': event_data['task'].get('title'),
                'task_status': event_data['task'].get('status'),
                'task_priority': event_data['task'].get('priority')
            })
        
        # Extract performance metrics
        if 'metrics' in event_data:
            processed.update({
                'cpu_usage': event_data['metrics'].get('cpu'),
                'memory_usage': event_data['metrics'].get('memory'),
                'token_consumption': event_data['metrics'].get('tokens'),
                'response_time_ms': event_data['metrics'].get('response_time')
            })
        
        return processed
    
    def send_event(self, event: Dict[str, Any], immediate: bool = False):
        """Send event to observability server"""
        if immediate:
            self._flush_batch([event])
        else:
            self.batch.append(event)
            if len(self.batch) >= self.batch_size:
                self._flush_batch()
    
    def _flush_batch(self, events: Optional[list] = None):
        """Flush batched events to server"""
        events_to_send = events or self.batch
        if not events_to_send:
            return
            
        try:
            for event in events_to_send:
                response = requests.post(
                    f"{self.server_url}/events",
                    json=event,
                    headers={'Content-Type': 'application/json'},
                    timeout=2
                )
                response.raise_for_status()
            
            if not events:
                self.batch.clear()
                
        except Exception as e:
            print(f"Failed to send events: {e}", file=sys.stderr)
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Flush remaining events on exit"""
        self._flush_batch()


class ClaudeCodeHooks:
    """Claude Code specific hook implementations"""
    
    @staticmethod
    def pre_tool_use_hook(stdin_data: str) -> str:
        """Hook for pre-tool-use events"""
        try:
            data = json.loads(stdin_data)
            
            with ObservabilityHook() as hook:
                event = hook.process_event({
                    'event_type': 'pre_tool_use',
                    'session_id': data.get('sessionId'),
                    'tool': {
                        'name': data.get('toolName'),
                        'params': data.get('params')
                    },
                    'agent': {
                        'type': data.get('agentType'),
                        'id': data.get('agentId')
                    }
                })
                
                # Add custom fields for tool analysis
                event['tool_category'] = ClaudeCodeHooks._categorize_tool(
                    data.get('toolName')
                )
                
                hook.send_event(event, immediate=True)
                
        except Exception as e:
            print(f"Hook error: {e}", file=sys.stderr)
        
        return stdin_data
    
    @staticmethod
    def post_tool_use_hook(stdin_data: str) -> str:
        """Hook for post-tool-use events"""
        try:
            data = json.loads(stdin_data)
            
            with ObservabilityHook() as hook:
                event = hook.process_event({
                    'event_type': 'post_tool_use',
                    'session_id': data.get('sessionId'),
                    'tool': {
                        'name': data.get('toolName'),
                        'params': data.get('params'),
                        'output': data.get('output'),
                        'error': data.get('error')
                    },
                    'metrics': {
                        'response_time': data.get('duration_ms'),
                        'tokens': data.get('tokens_used')
                    }
                })
                
                # Determine success/failure
                event['tool_success'] = data.get('error') is None
                event['tool_output'] = json.dumps(data.get('output', ''))[:1000]
                
                hook.send_event(event, immediate=True)
                
        except Exception as e:
            print(f"Hook error: {e}", file=sys.stderr)
        
        return stdin_data
    
    @staticmethod
    def _categorize_tool(tool_name: str) -> str:
        """Categorize tools for analysis"""
        categories = {
            'read': ['Read', 'Grep', 'Glob', 'LS'],
            'write': ['Write', 'Edit', 'MultiEdit'],
            'execute': ['Bash', 'Task'],
            'web': ['WebFetch', 'WebSearch'],
            'memory': ['mcp__memory', 'TodoWrite'],
            'filesystem': ['mcp__filesystem']
        }
        
        for category, tools in categories.items():
            if any(tool in tool_name for tool in tools):
                return category
        
        return 'other'


# Main hook entry point
if __name__ == "__main__":
    hook_type = sys.argv[1] if len(sys.argv) > 1 else 'unknown'
    stdin_data = sys.stdin.read()
    
    if hook_type == 'pre_tool_use':
        result = ClaudeCodeHooks.pre_tool_use_hook(stdin_data)
    elif hook_type == 'post_tool_use':
        result = ClaudeCodeHooks.post_tool_use_hook(stdin_data)
    else:
        result = stdin_data
    
    print(result)
```

### Lifecycle Hooks
```javascript
class LifecycleHooks {
  constructor() {
    this.hooks = {
      beforeCreate: [],
      created: [],
      beforeMount: [],
      mounted: [],
      beforeUpdate: [],
      updated: [],
      beforeDestroy: [],
      destroyed: []
    };
  }

  registerLifecycle(phase, handler) {
    if (!this.hooks[phase]) {
      throw new Error(`Unknown lifecycle phase: ${phase}`);
    }
    
    this.hooks[phase].push(handler);
    
    return () => {
      const index = this.hooks[phase].indexOf(handler);
      if (index > -1) {
        this.hooks[phase].splice(index, 1);
      }
    };
  }

  async triggerLifecycle(phase, context) {
    const handlers = this.hooks[phase] || [];
    
    for (const handler of handlers) {
      await handler.call(context, context);
    }
  }
}

// Component using lifecycle
class Component {
  constructor(hooks) {
    this.hooks = hooks;
  }

  async create() {
    await this.hooks.triggerLifecycle('beforeCreate', this);
    // Create logic
    await this.hooks.triggerLifecycle('created', this);
  }
}
```

### Dependency Injection Hooks
```typescript
interface HookContext {
  container: DIContainer;
  target: any;
  property?: string;
  args?: any[];
}

class DIHooks {
  private hooks = new Map<string, Function[]>();

  // Register injection hook
  onInject(token: string, hook: Function): void {
    if (!this.hooks.has(token)) {
      this.hooks.set(token, []);
    }
    this.hooks.get(token)!.push(hook);
  }

  // Trigger hooks during injection
  async processInjection(
    token: string,
    instance: any,
    context: HookContext
  ): Promise<any> {
    const tokenHooks = this.hooks.get(token) || [];
    
    let processed = instance;
    for (const hook of tokenHooks) {
      processed = await hook(processed, context) || processed;
    }
    
    return processed;
  }
}

// Usage
diHooks.onInject('Logger', (logger, context) => {
  // Wrap logger with additional functionality
  return new LoggerWrapper(logger, context.target.constructor.name);
});
```

## Advanced Hook Patterns

### Aspect-Oriented Programming
```javascript
function createAspect(target, aspects) {
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof obj[prop] !== 'function') {
        return obj[prop];
      }
      
      return async function(...args) {
        // Before aspects
        if (aspects.before) {
          await aspects.before(prop, args);
        }
        
        try {
          // Original method
          const result = await obj[prop].apply(obj, args);
          
          // After aspects
          if (aspects.after) {
            return await aspects.after(prop, result) || result;
          }
          
          return result;
        } catch (error) {
          // Error aspects
          if (aspects.error) {
            await aspects.error(prop, error);
          }
          throw error;
        }
      };
    }
  });
}
```

### Hook Composition
```typescript
class HookComposer {
  static compose(...hooks: Function[]) {
    return async (context: any) => {
      return hooks.reduce(
        async (promise, hook) => {
          const result = await promise;
          return hook(result || context);
        },
        Promise.resolve(context)
      );
    };
  }

  static parallel(...hooks: Function[]) {
    return async (context: any) => {
      const results = await Promise.all(
        hooks.map(hook => hook(context))
      );
      return Object.assign({}, ...results);
    };
  }

  static conditional(condition: Function, hook: Function) {
    return async (context: any) => {
      if (await condition(context)) {
        return hook(context);
      }
      return context;
    };
  }
}
```

## Anti-Patterns to Avoid
- Hooks with side effects on global state
- Synchronous blocking in async hooks
- Missing error boundaries
- Circular hook dependencies
- Undocumented hook contracts
- Breaking changes to hook signatures
- Performance-heavy hooks without caching

## Quality Checklist
- [ ] Hook registration is simple
- [ ] Execution order is predictable
- [ ] Error handling doesn't break chain
- [ ] Async/sync hooks both supported
- [ ] Context passing is clear
- [ ] Hooks are testable
- [ ] Performance impact measured
- [ ] Documentation complete

## Hook Types
- **Filter**: Modify data
- **Action**: Perform side effects
- **Lifecycle**: Component phases
- **Validation**: Check constraints
- **Transform**: Data conversion
- **Guard**: Access control

## Related Agents
- `/agent:architect` - System design
- `/agent:coder` - Hook usage
- `/agent:tester` - Hook testing
- `/agent:documenter` - Plugin docs
- `/agent:performance` - Hook optimization

---

*Agent Type: Architecture & Extensibility | Complexity: High | Token Usage: Medium*