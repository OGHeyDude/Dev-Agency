# Dev-Agency Project Template

**Version:** 1.0.0  
**Based on:** STAD Protocol v5.1  
**Created:** 08-16-2025

## 🚀 Quick Start

### 1. Copy Template to Your Project
```bash
cp -r /home/hd/Desktop/LAB/Dev-Agency/TEMPLATE_PACKAGE/* /path/to/your/project/
cd /path/to/your/project/
```

### 2. Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your GitHub token and project settings
```

### 4. Customize PROJECT_CLAUDE.md
Edit `PROJECT_CLAUDE_TEMPLATE.md` with your project details:
- Project name
- Type (Web App, CLI Tool, Library, etc.)
- Primary language
- Status

## 📁 What's Included

### Core Files
- **PROJECT_CLAUDE_TEMPLATE.md** - Minimal project-specific CLAUDE configuration
- **.env.example** - Environment variable template
- **setup.sh** - Automated setup script
- **README.md** - This file

### Project Structure
```
Project_Management/
├── PROJECT_PLAN.md          # Your ticket tracking
├── Specs/                   # Ticket specifications
├── Bug_Reports/             # Bug tracking
├── temp/                    # Temporary files
├── Sprint Retrospectives/   # Sprint reviews
├── Archive/                 # Archived files
└── Releases/               # Release documentation
```

## 🔗 How It Works

### References Dev-Agency (No Copying!)
This template **references** the central Dev-Agency system instead of copying it:
- All agents are read from `/home/hd/Desktop/LAB/Dev-Agency/Agents/`
- All templates from `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/`
- All guides from `/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/`

### Agent Commands Work Automatically
When you use commands like `/agent:architect` or `/agent:coder`, Claude automatically:
1. Reads the agent definition from Dev-Agency
2. Applies it to your project context
3. Executes with your project files

### STAD Protocol Built-In
The template includes:
- 5-stage sprint lifecycle (Stage 0-4)
- Stage gate validations
- Agent handoff templates
- Work report structure

## 🛠️ Customization

### Project-Specific Settings
Only customize what's unique to your project:
- Project name and description
- Tech stack and dependencies
- Business requirements
- Custom workflows (if needed)

### What NOT to Change
Never modify or copy:
- Agent definitions
- Development standards
- STAD Protocol stages
- Core templates

## 📋 Included Templates

All templates are **referenced** from Dev-Agency:
- Spec template
- Bug report template
- Sprint retrospective template
- Handoff report template
- Work report template
- And 22+ more...

## 🔧 Environment Variables

Configure in `.env`:
```bash
# GitHub Configuration
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo

# Project Settings
PROJECT_NAME=Your Project
PROJECT_TYPE=Web App
PRIMARY_LANGUAGE=TypeScript
```

## 🎯 Benefits

### Single Source of Truth
- Updates to Dev-Agency apply to all projects instantly
- No version drift between projects
- Consistent standards across all work

### Minimal Overhead
- Less than 10 files in your project
- No agent copies to maintain
- Focus on YOUR code, not infrastructure

### Enterprise Ready
- STAD Protocol compliance
- Quality gates built-in
- Full documentation coverage
- Audit trail via git

## 📚 Documentation

For detailed documentation, see:
- [STAD Protocol Guide](/home/hd/Desktop/LAB/Dev-Agency/docs/architecture/STAD_PROTOCOL_NORTH_STAR.md)
- [Development Standards](/home/hd/Desktop/LAB/Dev-Agency/docs/guides/standards/)
- [Agent Catalog](/home/hd/Desktop/LAB/Dev-Agency/docs/architecture/STAD_Agent_Registry.md)

## 🆘 Support

For help:
1. Check Dev-Agency documentation
2. Review example projects
3. Run `/agent:debug` for troubleshooting

## 📄 License

This template is part of the Dev-Agency system.
Open source release pending.

---

*Template ready for use in new projects. Remember: Reference, don't copy!*