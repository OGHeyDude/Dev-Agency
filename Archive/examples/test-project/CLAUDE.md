# Project: Test API Service

**Type**: REST API  
**Primary Language**: TypeScript  
**Status**: Active Development

---

## 🎯 Central Agent System

**All agents, guides, templates, and development standards are centrally managed at:**
`/home/hd/Desktop/LAB/Dev-Agency/`

**DO NOT COPY these files here.** Claude will automatically read from Dev-Agency when needed.

### Available Commands
All agent commands work in this project by reading from Dev-Agency:
- `/agent:architect` - System design
- `/agent:coder` - Implementation 
- `/agent:tester` - Testing
- `/agent:security` - Security review
- `/agent:documenter` - Documentation

---

## 📁 Project Structure

```
/test-project/
├── CLAUDE.md                 # This file (references Dev-Agency)
├── /src/
│   └── api/                 # API endpoints
└── /tests/                   # Test files
```

---

## 🔧 Project-Specific Configuration

### Environment Setup
- Node.js 18+
- TypeScript 5.0+
- Express.js

### Key Dependencies
- express
- jest
- supertest

---

## 📋 Project Context

### Business Requirements
Test API service demonstrating centralized agent system usage.

### Example Usage
When I use `/agent:coder`, Claude will:
1. Read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/coder.md`
2. Apply to this project's context
3. No local agent files needed!

---

*This project uses the centralized Dev-Agency system - no agent files copied here!*