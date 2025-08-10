#!/bin/bash

# MCP Tools Test Script for Dev-Agency
# Generated: 08-09-2025

echo "============================================"
echo "Testing MCP Tools Installation"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test if a tool is available
test_tool() {
    local tool_name=$1
    echo -n "Testing $tool_name... "
    
    if claude mcp list 2>/dev/null | grep -q "$tool_name"; then
        echo -e "${GREEN}✓ Available${NC}"
        return 0
    else
        echo -e "${RED}✗ Not found${NC}"
        return 1
    fi
}

# Test core tools
echo "Core MCP Tools:"
echo "---------------"
test_tool "memory"
test_tool "filesystem"
test_tool "fetch"
echo ""

# Test configuration files
echo "Configuration Files:"
echo "-------------------"

test_config() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $name exists${NC}"
    else
        echo -e "${RED}✗ $name missing${NC}"
    fi
}

test_config ".mcp-memory.json" "Memory config"
test_config ".mcp-filesystem.json" "Filesystem config"
test_config ".mcp-fetch.json" "Fetch config"
test_config ".mcp-configs/project.env" "Environment variables"
echo ""

# Test data directories
echo "Data Directories:"
echo "----------------"

test_dir() {
    local dir=$1
    local name=$2
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $name exists${NC}"
    else
        echo -e "${RED}✗ $name missing${NC}"
    fi
}

test_dir ".mcp-data" "Data root"
test_dir ".mcp-data/memory" "Memory data"
test_dir ".mcp-data/thinking" "Thinking data"
test_dir ".mcp-data/cache" "Cache"
echo ""

# Summary
echo "============================================"
echo "Test Summary"
echo "============================================"

# Count available tools
available_count=$(claude mcp list 2>/dev/null | grep -c -E "(memory|filesystem|fetch):")

if [ "$available_count" -eq 3 ]; then
    echo -e "${GREEN}✓ All 3 core tools are properly configured!${NC}"
    echo ""
    echo "You can now use these tools in Claude Code CLI:"
    echo "  - memory: Knowledge graph for persistent memory"
    echo "  - filesystem: Secure file operations"
    echo "  - fetch: Web content fetching and conversion"
    echo ""
    echo "To start using them, run: claude code"
    exit 0
else
    echo -e "${YELLOW}⚠ Only $available_count of 3 tools are configured${NC}"
    echo ""
    echo "To see available tools: claude mcp list"
    echo "To add missing tools, check the setup instructions."
    exit 1
fi