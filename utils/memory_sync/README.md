# Memory Sync Parsers

Code parsers for the Memory Sync Agent that analyze source files and extract entities and relationships for the knowledge graph.

## TypeScript/JavaScript Parser

### Overview
The `ts_parser.js` parses TypeScript and JavaScript files (including JSX/TSX) to extract:

- **Entities**: Classes, functions, interfaces, types, React components
- **Relationships**: Imports, extends, implements, uses

### Features

#### Entity Types Detected
- **Classes**: TypeScript/JavaScript classes with methods, properties, inheritance
- **Interfaces**: TypeScript interfaces with properties and extension relationships
- **Types**: Type aliases including union types and complex types
- **Functions**: Function declarations and arrow functions with signatures
- **React Components**: Functional and class-based React components with props and hooks analysis

#### Relationship Types
- **imports**: Module import relationships
- **extends**: Class/interface inheritance
- **implements**: Interface implementation

#### Smart Granularity
- **Simple files** (≤5 declarations, ≤2 classes): Coarse-grained single module entity
- **Complex files** (>5 declarations or >2 classes): Fine-grained individual entities

### Usage

#### Command Line
```bash
node ts_parser.js <file_path>
```

#### Programmatic
```javascript
const { TypeScriptParser } = require('./ts_parser.js');

const parser = new TypeScriptParser();
const result = parser.parseFile('/path/to/file.ts');

console.log(result.entities);   // Array of entities
console.log(result.relations);  // Array of relationships
```

#### From Python
```bash
node ts_parser.js <file_path>
```

### Output Format

#### JSON Structure
```json
{
  "entities": [
    {
      "name": "ComponentName",
      "entity_type": "ReactComponent",
      "file_path": "/path/to/file.tsx", 
      "observations": [
        "React functional component",
        "Props: name: string, age?: number",
        "Hooks used: useState, useEffect",
        "Returns: JSX.Element"
      ],
      "line_start": 10,
      "line_end": 25
    }
  ],
  "relations": [
    {
      "from_entity": "ComponentName",
      "to_entity": "UserData", 
      "relation_type": "extends"
    }
  ]
}
```

#### Entity Types
- `ReactComponent`: React functional/class components
- `TypeScriptClass`: Class declarations
- `TypeScriptInterface`: Interface definitions
- `TypeScriptType`: Type aliases
- `TypeScriptFunction`: Function declarations
- `ReactModule`: Simple React files
- `ClassModule`: Simple files with classes
- `TypeDefinition`: Files primarily containing types
- `TypeScriptFile`: Generic TS files
- `JavaScriptFile`: Generic JS files

### Supported File Types
- `.ts` - TypeScript files
- `.tsx` - TypeScript React files
- `.js` - JavaScript files
- `.jsx` - JavaScript React files

### Error Handling
- **File not found**: Returns empty result with error message
- **Syntax errors**: Creates fallback entity with available information
- **Parse failures**: Gracefully creates simple file entity

### Examples

#### React Component Analysis
```typescript
interface Props {
  name: string;
  onUpdate?: (data: any) => void;
}

const UserProfile: React.FC<Props> = ({ name, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);

  return <div>{name}</div>;
};
```

**Output**: ReactComponent entity with props analysis, hooks detection, and JSX return type.

#### Class Analysis
```typescript
class UserService extends BaseService implements Cacheable {
  private cache = new Map();
  
  async getUser(id: number): Promise<User> {
    // Implementation
  }
}
```

**Output**: TypeScriptClass entity with inheritance relationships, method signatures, and property analysis.

### Dependencies
- Node.js 16+
- TypeScript compiler API (`typescript` package)

### Installation
```bash
cd /path/to/memory_sync
npm install
```

### Development
The parser follows the same pattern as `code_parser.py`:
- Entity-based extraction
- Relationship mapping
- Granularity-based processing
- Error-resilient parsing

### Integration
Designed to be called from the Memory Sync Agent's Python code:
```python
import subprocess
import json

result = subprocess.run(['node', 'ts_parser.js', file_path], 
                       capture_output=True, text=True)
data = json.loads(result.stdout)
```