# Test Project - Centralized Agent System Demo

## Purpose
This is a demonstration project showing how the centralized Dev-Agency system works.

## Key Points

### ✅ What This Project Has
- `CLAUDE.md` - Minimal configuration referencing Dev-Agency
- `/src/` - Project source code (would contain actual code)
- `/tests/` - Project tests (would contain actual tests)
- `README.md` - This file

### ❌ What This Project DOESN'T Have (And Doesn't Need!)
- No `/Agents/` directory - uses Dev-Agency's agents
- No `/recipes/` directory - uses Dev-Agency's recipes
- No `/prompts/` directory - uses Dev-Agency's prompts
- No `/Development_Standards/` - uses Dev-Agency's standards

## How It Works

When you use an agent command in this project:

```markdown
User: /agent:coder implement user endpoint
```

Claude automatically:
1. Reads the agent definition from `/home/hd/Desktop/LAB/Dev-Agency/Agents/coder.md`
2. Applies it to this project's context
3. Implements the feature here

## Benefits Demonstrated

1. **Clean Project** - Only contains project-specific files
2. **No Duplication** - Zero agent files copied here
3. **Automatic Updates** - When Dev-Agency agents improve, this project benefits immediately
4. **Single Source of Truth** - One place to manage all agents

## To Test

1. Open this project in Claude
2. Try any agent command (e.g., `/agent:architect design user service`)
3. Notice Claude reads from Dev-Agency, not local files
4. Success! Centralized system working

---

*This demonstrates the Dev-Agency centralized approach - edit once, use everywhere!*