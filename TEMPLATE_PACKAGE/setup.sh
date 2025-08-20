#!/bin/bash

# Dev-Agency Project Setup Script
# Version: 1.0.0
# Based on STAD Protocol v5.1

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Dev-Agency Project Setup - STAD Protocol v5.1     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Dev-Agency exists
if [ ! -d "/home/hd/Desktop/LAB/Dev-Agency" ]; then
    print_error "Dev-Agency not found at /home/hd/Desktop/LAB/Dev-Agency"
    echo "Please ensure Dev-Agency is installed first."
    exit 1
fi

print_status "Dev-Agency system found"

# Create project structure if it doesn't exist
echo -e "\n${BLUE}Creating project structure...${NC}"

# Create directories
mkdir -p Project_Management/{Specs,Bug_Reports,temp,"Sprint Retrospectives",Archive,Releases}
mkdir -p docs/{features,guides,api,development}
mkdir -p src/__tests__

print_status "Project directories created"

# Create PROJECT_PLAN.md if it doesn't exist
if [ ! -f "Project_Management/PROJECT_PLAN.md" ]; then
    cat > Project_Management/PROJECT_PLAN.md << 'EOF'
# Project Plan

**Project:** [Your Project Name]  
**Start Date:** $(date +"%m-%d-%Y")  
**Status:** Planning  
**Sprint:** 0  

---

## Epics

### Epic: Core Functionality
**Status:** PLANNED  
**Target:** Sprint 1-2  

### Epic: User Interface
**Status:** PLANNED  
**Target:** Sprint 2-3  

---

## Backlog

| ID | Title | Status | Points | Epic | Spec |
|----|-------|--------|--------|------|------|
| TASK-001 | Initial setup | BACKLOG | 2 | Core | [ ] |

---

## Sprint History

### Sprint 0 - Planning
**Dates:** Current  
**Goal:** Project setup and planning  
**Status:** IN_PROGRESS  

---

*Updated: $(date +"%m-%d-%Y")*
EOF
    print_status "PROJECT_PLAN.md created"
else
    print_warning "PROJECT_PLAN.md already exists, skipping"
fi

# Setup git if not already initialized
if [ ! -d ".git" ]; then
    echo -e "\n${BLUE}Initializing git repository...${NC}"
    git init
    print_status "Git repository initialized"
    
    # Create .gitignore
    cat > .gitignore << 'EOF'
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Build outputs
dist/
build/
*.egg-info/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
Project_Management/temp/*
!Project_Management/temp/.gitkeep

# Test coverage
coverage/
.coverage
*.lcov
EOF
    print_status ".gitignore created"
else
    print_warning "Git repository already initialized"
fi

# Create environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    print_status ".env file created from template"
    print_warning "Please edit .env with your configuration"
else
    print_warning ".env already exists, skipping"
fi

# Create initial commit tag
if git rev-parse --git-dir > /dev/null 2>&1; then
    if ! git tag | grep -q "project-setup"; then
        git add -A
        git commit -m "Initial project setup with Dev-Agency template" || true
        git tag project-setup
        print_status "Created 'project-setup' git tag"
    fi
fi

# Verify Dev-Agency connection
echo -e "\n${BLUE}Verifying Dev-Agency connection...${NC}"

if [ -f "/home/hd/Desktop/LAB/Dev-Agency/CLAUDE.md" ]; then
    print_status "Dev-Agency CLAUDE.md accessible"
else
    print_error "Cannot access Dev-Agency CLAUDE.md"
fi

if [ -d "/home/hd/Desktop/LAB/Dev-Agency/Agents" ]; then
    AGENT_COUNT=$(ls /home/hd/Desktop/LAB/Dev-Agency/Agents/*.md 2>/dev/null | wc -l)
    print_status "Found $AGENT_COUNT agents available"
else
    print_error "Cannot access Dev-Agency Agents"
fi

# Summary
echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env with your GitHub token and project settings"
echo "2. Customize PROJECT_CLAUDE_TEMPLATE.md with your project details"
echo "3. Run: ${GREEN}claude${NC} and use ${GREEN}/cmd${NC} to start working"
echo ""
echo "Available commands:"
echo "  /cmd              - Initialize session"
echo "  /sprint-plan      - Plan your first sprint"
echo "  /agent:architect  - Design system architecture"
echo "  /agent:coder      - Start implementation"
echo ""
echo -e "${BLUE}Happy coding with STAD Protocol!${NC}"