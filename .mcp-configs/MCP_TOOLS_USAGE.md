# MCP Tools Usage Guide for Dev-Agency

## Installation Status ✅

The following MCP tools have been successfully installed and configured:

1. **Memory** - Knowledge graph for persistent memory
2. **Filesystem** - Secure file operations  
3. **Fetch** - Web content fetching and conversion

## Quick Start

### Start Claude Code with MCP Tools
```bash
claude code
```

Once in a Claude Code session, the tools are automatically available.

## Available Tools & Commands

### Memory Tool
Store and retrieve persistent knowledge across sessions:

- **Create entities**: Store information about code, projects, or concepts
- **Create relations**: Link entities together (e.g., "function uses library")
- **Search nodes**: Find stored information by query
- **Read graph**: View the entire knowledge graph

Example usage in Claude Code:
```
"Store this information: The Dev-Agency project uses MCP tools for enhanced development"
"What do you remember about Dev-Agency?"
```

### Filesystem Tool
Secure file operations within the project:

- **read_file**: Read file contents
- **write_file**: Create or overwrite files
- **edit_file**: Replace content in files
- **list_directory**: Browse directories
- **search_files**: Find files by pattern

The tool is configured to work within: `/home/hd/Desktop/LAB/Dev-Agency`

### Fetch Tool
Retrieve and process web content:

- **fetch**: Get content from a URL (converts to markdown by default)
- **fetch_batch**: Fetch multiple URLs concurrently
- **extract_links**: Extract all links from a webpage

Example usage:
```
"Fetch the content from https://example.com"
"Get the latest documentation from [URL]"
```

## Configuration Files

All configurations are stored in project-specific files:

- `.mcp-memory.json` - Memory tool settings
- `.mcp-filesystem.json` - Filesystem access control
- `.mcp-fetch.json` - Fetch tool settings
- `.mcp-configs/project.env` - Environment variables

## Data Storage

MCP tools store data in:
```
.mcp-data/
├── memory/      # Knowledge graph data
├── thinking/    # Sequential thinking chains
└── cache/       # Tool caches
```

## Testing Installation

Run the test script to verify everything is working:
```bash
./.mcp-configs/test-mcp-tools.sh
```

## Viewing Available Tools

Check which MCP tools are available:
```bash
claude mcp list
```

## Troubleshooting

### Tool not connecting
1. Check the tool's dependencies are installed
2. For Python tools, ensure virtual environment is activated
3. For TypeScript tools, ensure they're built (`npm run build`)

### Permission issues
```bash
chmod +x /path/to/server.py  # For Python tools
chmod +x /path/to/dist/index.js  # For TypeScript tools
```

### Reconfigure a tool
```bash
claude mcp remove <tool-name>
claude mcp add <tool-name> <command> <path>
```

## Environment Variables

To use custom settings, source the project environment:
```bash
source .mcp-configs/project.env
```

## Next Steps

1. Start using the tools in Claude Code sessions
2. The memory tool will build a knowledge graph of your project over time
3. Use filesystem tool for safe file operations
4. Use fetch tool to retrieve documentation or web resources

## Tips

- The memory tool persists across sessions - use it to track important project information
- The filesystem tool respects the configured boundaries - it won't access files outside the allowed directories
- The fetch tool can convert web pages to markdown for easier processing

---

*Generated: 08-09-2025*
*Location: /home/hd/Desktop/LAB/Dev-Agency*