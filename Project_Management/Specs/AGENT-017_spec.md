# **Spec: Memory Sync Agent - Intelligent Codebase Knowledge Graph Synchronization**

**Ticket ID:** AGENT-017  
**Status:** TODO  
**Last Updated:** 2025-08-09  
**Link to Project Plan:** `/Project_Management/PROJECT_PLAN.md`  
**Story Points:** 8 (Complex Integration)

> **📋 Spec Size Guidelines:**
> This is a major feature (8 story points) - all sections are mandatory and comprehensive.

## **1. Problem & Goal**

### **Problem:**
- **Manual Knowledge Graph Updates**: Currently, the MCP memory tool requires manual updates when code changes, leading to stale knowledge
- **Loss of Context**: Without automatic synchronization, Claude loses awareness of recent code changes and relationships
- **Inefficient Chunking**: Simple file-based updates miss semantic code structure (functions, classes, relationships)
- **Overwrite Risk**: Bulk updates can overwrite existing observations, losing valuable context
- **No Change Tracking**: No system to detect what actually changed, leading to redundant processing

### **Goal:**
- **Automatic Synchronization**: Create an intelligent agent that maintains the knowledge graph automatically
- **Semantic Understanding**: Parse code into meaningful chunks (classes, functions, modules) with relationships
- **Incremental Updates**: Only process changed files, preserving existing knowledge while adding new
- **Optimal Granularity**: Balance between too many small entities and too few large ones
- **Performance**: Use efficient Claude model (Haiku) for frequent operations

## **2. Acceptance Criteria**

### Core Functionality
* [ ] **Agent Creation**: Memory Sync Agent defined at `/Agents/memory-sync.md` following standard format
* [ ] **Change Detection**: System detects file changes using hash comparison and timestamp tracking
* [ ] **Intelligent Chunking**: Code parsed into semantic units:
  * [ ] Classes with methods and attributes
  * [ ] Functions with parameters and return types
  * [ ] Modules with exports and imports
  * [ ] Configuration files with key structures
* [ ] **Relationship Extraction**: Automatically identifies and creates relations:
  * [ ] Import dependencies
  * [ ] Function calls
  * [ ] Class inheritance
  * [ ] API endpoints to handlers
  * [ ] Database schema relationships

### Integration Requirements
* [ ] **Command Integration**: `/sync-memory` command added to CLAUDE.md
* [ ] **Workflow Integration**: Integrated into `/done` workflow for automatic sync
* [ ] **Batch Processing**: Changes queued and processed in batches to prevent conflicts
* [ ] **State Management**: Maintains sync state in `memory_sync_state.json`
* [ ] **Conflict Resolution**: Handles concurrent updates without data loss

### Performance & Quality
* [ ] **Model Optimization**: Uses Claude 3 Haiku for cost-effective processing
* [ ] **Incremental Updates**: Only processes changed files
* [ ] **Error Recovery**: Graceful handling of parsing errors
* [ ] **Logging**: Comprehensive logs in `/logs/memory_sync/`
* [ ] **Metrics**: Tracks sync performance and success rates

## **3. Technical Plan**

### **Approach:**

#### Phase 1: Architecture Design
1. **Agent Definition Structure**
   - Specialized prompts for code analysis
   - Language-specific parsing strategies
   - Relationship extraction patterns
   - Granularity guidelines

2. **Change Detection System**
   ```python
   # Conceptual structure
   class ChangeDetector:
       - track_file_hashes()
       - detect_changes()
       - queue_for_processing()
       - ignore_patterns (from .gitignore)
   ```

3. **Code Chunking Engine**
   ```python
   # Semantic parsing strategy
   class CodeChunker:
       - parse_python() -> entities
       - parse_typescript() -> entities
       - parse_markdown() -> entities
       - extract_relationships()
   ```

#### Phase 2: Memory Sync Orchestration

**Sync Flow:**
```
1. Detect Changes → 2. Queue Changes → 3. Parse Files → 4. Extract Chunks 
→ 5. Identify Relations → 6. Update Graph → 7. Log Results
```

**Entity Granularity Strategy:**
- **File Level**: For configuration, small utilities
- **Class Level**: For OOP code with methods grouped
- **Function Level**: For functional programming, utilities
- **Module Level**: For large files with multiple exports

**Relationship Types:**
- `imports` - Module dependencies
- `calls` - Function invocations
- `extends` - Class inheritance
- `implements` - Interface implementation
- `uses` - General usage relationship
- `configures` - Configuration relationships
- `defines` - Schema/type definitions

### **Affected Components:**
- `/Agents/` - New memory-sync.md agent
- `/recipes/` - Memory sync recipes
- `/utils/memory_sync/` - Supporting utilities (future)
- `CLAUDE.md` - New command integration
- `WORKFLOW_INTEGRATION.md` - Workflow updates
- MCP Memory Tool - Primary integration point

### **New Dependencies:**
- Python AST parser (built-in) for Python code analysis
- TypeScript parser (if needed) for TS/JS analysis
- File system watcher (inotify/fswatch) for change detection
- SQLite for state management (optional)

### **Database Changes:**
- No database schema changes
- Memory graph will gain new entity types:
  - `Class`, `Function`, `Module`, `Configuration`
- New relation types as listed above

## **4. Research & References**

### MCP Memory Tool Capabilities
- **Create Entities**: `mcp__memory__create_entities` - Batch creation supported
- **Create Relations**: `mcp__memory__create_relations` - Multiple relations per call
- **Add Observations**: `mcp__memory__add_observations` - Incremental additions
- **Search Nodes**: `mcp__memory__search_nodes` - Query existing entities
- **Delete Operations**: Available but should be used sparingly

### Code Parsing Strategies

#### Python Code Analysis
```python
import ast

# Parse Python file into AST
tree = ast.parse(source_code)

# Extract classes
classes = [node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]

# Extract functions
functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]

# Extract imports
imports = [node for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom))]
```

#### TypeScript/JavaScript Analysis
```typescript
// Using TypeScript Compiler API
import * as ts from "typescript";

const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    ts.ScriptTarget.Latest
);

// Visit nodes to extract structure
function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
        // Process class
    } else if (ts.isFunctionDeclaration(node)) {
        // Process function
    }
}
```

### Change Detection Methods

1. **File Hash Comparison**
   ```python
   import hashlib
   
   def get_file_hash(filepath):
       with open(filepath, 'rb') as f:
           return hashlib.md5(f.read()).hexdigest()
   ```

2. **Git Integration** (optional)
   ```bash
   git diff --name-only HEAD~1
   git diff --cached --name-only
   ```

3. **File System Monitoring**
   - Linux: inotify
   - macOS: fswatch
   - Cross-platform: watchdog (Python)

## **5. Implementation Details**

### Memory Sync Agent Prompt Engineering

#### Core Prompt Structure
```
You are a Memory Sync Agent specialized in maintaining a knowledge graph of codebases.

Your responsibilities:
1. Parse code files into semantic chunks
2. Extract meaningful relationships
3. Create granular entities that balance detail with usability
4. Preserve existing knowledge while adding new

For the given file changes:
- Identify the primary entities (classes, functions, modules)
- Extract key observations (purpose, parameters, return types)
- Map relationships (imports, calls, inheritance)
- Maintain consistency with existing graph structure
```

#### Language-Specific Instructions

**Python Files:**
- Group methods within their classes
- Track decorators as observations
- Note type hints and docstrings
- Identify Django/Flask patterns

**TypeScript/JavaScript:**
- Track interfaces and types
- Note React components separately
- Identify API endpoints
- Track state management patterns

**Markdown Files:**
- Extract document structure
- Identify code examples
- Link to related files
- Track configuration documentation

### Chunking Granularity Guidelines

#### Optimal Entity Sizes
- **Too Granular** (Avoid): Every variable, every line
- **Too Coarse** (Avoid): Entire files as single entities
- **Just Right**: Logical units of functionality

#### Decision Matrix
| File Type | Entity Level | Observations |
|-----------|--------------|--------------|
| Small utility (<100 lines) | File | All functions |
| Class file | Class | Methods, attributes |
| Module | Module + Functions | Exports, main functions |
| Config file | File | Key settings |
| Test file | Test Suite | Individual tests |

### State Management Design

```json
{
  "last_sync": "2025-08-09T10:30:00Z",
  "file_hashes": {
    "/path/to/file.py": "abc123...",
    "/path/to/module.ts": "def456..."
  },
  "pending_changes": [
    {
      "file": "/path/to/changed.py",
      "change_type": "modified",
      "detected_at": "2025-08-09T10:35:00Z"
    }
  ],
  "sync_history": [
    {
      "timestamp": "2025-08-09T10:30:00Z",
      "files_processed": 15,
      "entities_created": 45,
      "relations_created": 120,
      "duration_ms": 3500
    }
  ]
}
```

### Incremental Update Algorithm

```python
def incremental_sync(changed_files):
    """
    Process only changed files without affecting unchanged entities
    """
    for file in changed_files:
        # 1. Search for existing entities from this file
        existing = search_entities_by_file(file)
        
        # 2. Parse new structure
        new_entities = parse_file(file)
        
        # 3. Diff and merge
        to_create = new_entities - existing
        to_update = intersect(new_entities, existing)
        to_archive = existing - new_entities
        
        # 4. Apply changes
        if to_create:
            create_entities(to_create)
        if to_update:
            add_observations(to_update)
        if to_archive:
            # Mark as deprecated, don't delete
            add_observation(to_archive, "Archived: No longer in codebase")
```

### Performance Optimization Strategies

1. **Batch Processing**
   - Queue changes for 30-60 seconds
   - Process multiple files in single agent call
   - Limit batch size to 10-20 files

2. **Selective Parsing**
   - Skip binary files
   - Skip node_modules, venv, .git
   - Honor .gitignore patterns
   - Focus on source code files

3. **Caching**
   - Cache parsed AST structures
   - Reuse relationship patterns
   - Store common code patterns

4. **Model Selection**
   - Claude 3 Haiku for routine syncs
   - Claude 3 Sonnet for complex refactoring
   - Main Claude (Opus) for orchestration only

## **6. Integration Points**

### Command Integration
```bash
# Manual sync commands
/sync-memory                    # Sync all changed files
/sync-memory [path]            # Sync specific directory
/sync-memory --types "py,ts"   # Sync specific file types
/sync-memory --force           # Force full resync

# Status commands
/sync-memory --status          # Show sync status
/sync-memory --pending         # Show pending changes
/sync-memory --history         # Show sync history
```

### Workflow Integration

#### In `/done` Workflow
```markdown
5. Documentation Phase
   - Update technical documentation
   - **Automatic: Sync code changes to memory graph**
   - Mark ticket as complete
```

#### In `/build` Workflow
```markdown
3. Build Phase
   - Implement feature
   - **Optional: /sync-memory --preview to see what will change**
   - Continue development
```

### Hook Integration (Future)
```bash
# .claude/hooks/post-build.sh
claude sync-memory --auto

# .claude/hooks/pre-commit.sh
claude sync-memory --verify
```

## **7. Testing Strategy**

### Unit Tests
- [ ] Change detection accuracy
- [ ] File hash calculation
- [ ] Queue management
- [ ] State persistence

### Integration Tests
- [ ] MCP memory tool integration
- [ ] Batch processing
- [ ] Error recovery
- [ ] Concurrent updates

### Performance Tests
- [ ] Large file processing (>1000 lines)
- [ ] Batch size optimization
- [ ] Memory usage with large codebases
- [ ] Token usage per file type

### Test Scenarios
1. **New File Addition**: Verify entities created correctly
2. **File Modification**: Verify incremental updates work
3. **File Deletion**: Verify entities marked as archived
4. **Refactoring**: Verify relationships updated
5. **Concurrent Changes**: Verify no data loss

## **8. Rollout Plan**

### Phase 1: Foundation (Week 1)
- Create agent definition
- Basic change detection
- Simple file-level chunking
- Manual command only

### Phase 2: Intelligence (Week 2)
- Semantic code parsing
- Relationship extraction
- Granular chunking
- Batch processing

### Phase 3: Integration (Week 3)
- Workflow integration
- State management
- Performance optimization
- Error handling

### Phase 4: Automation (Week 4)
- Auto-sync capabilities
- Hook integration
- Metrics and monitoring
- Documentation

## **9. Success Metrics**

### Performance Metrics
- **Sync Speed**: <5 seconds for 10 files
- **Token Usage**: <1000 tokens per file average
- **Success Rate**: >95% successful syncs
- **Memory Overhead**: <100MB for state management

### Quality Metrics
- **Entity Granularity**: 5-15 entities per file average
- **Relationship Density**: 3-10 relations per entity
- **Knowledge Retention**: 100% existing observations preserved
- **Error Rate**: <1% parsing failures

### User Experience Metrics
- **Manual Intervention**: <5% of syncs require manual fixes
- **Knowledge Quality**: Improved Claude responses about codebase
- **Development Speed**: 20% faster development with better context

## **10. Risk Mitigation**

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Token limit exceeded | High | Use Haiku, batch intelligently |
| Parse errors crash sync | High | Graceful error handling, skip bad files |
| Memory graph corruption | Critical | Backup before sync, transaction logs |
| Performance degradation | Medium | Incremental updates, caching |

### Operational Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Sync conflicts | Medium | Queue and batch processing |
| Stale cache | Low | TTL on caches, force refresh option |
| Missing dependencies | Medium | Fallback to simple parsing |

## **11. Open Questions & Notes**

### Questions for Resolution
1. **Q:** Should we integrate with git hooks for automatic syncing?
   - **A:** Start with manual, add auto in Phase 4

2. **Q:** How to handle generated code files?
   - **A:** Skip by default, add `--include-generated` flag

3. **Q:** What about binary files and images?
   - **A:** Skip, but track their existence as observations

4. **Q:** Should we version the knowledge graph?
   - **A:** Consider git-based versioning of state file

### Implementation Notes
- **Priority Files**: Focus on source code first, configs second, docs third
- **Language Support**: Start with Python/TypeScript, add others incrementally
- **Graph Size**: Monitor graph size, implement pruning if needed
- **Permissions**: Ensure read-only access to codebase
- **Debugging**: Add `--debug` flag for verbose output

### Future Enhancements
1. **Real-time Sync**: File system watcher for instant updates
2. **Diff Visualization**: Show what will change before sync
3. **Smart Scheduling**: Learn optimal sync times from usage patterns
4. **Cross-project Sync**: Share knowledge across related projects
5. **AI-powered Relationships**: Use Claude to infer implicit relationships

---

*Spec created: 2025-08-09 | Status: Ready for Review*  
*This is a living document - update as implementation progresses*