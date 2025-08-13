#!/bin/bash
# Manage GitHub Project Boards for STAD Protocol
# Requires GH_TOKEN with project scope

set -e

# Load token from .env if exists
if [ -f ".env" ]; then
    export $(cat .env | xargs)
fi

# Project IDs
PATTERNS_BOARD_ID="PVT_kwHOB9xtSs4BAW--"
AGENTS_BOARD_ID="PVT_kwHOB9xtSs4BAXMC"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          STAD Project Boards Management Tool              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to list board items
list_board_items() {
    local board_id=$1
    local board_name=$2
    
    echo -e "${GREEN}=== $board_name ===${NC}"
    
    gh api graphql -f query="
    {
      node(id: \"$board_id\") {
        ... on ProjectV2 {
          items(first: 20) {
            nodes {
              id
              fieldValues(first: 10) {
                nodes {
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldNumberValue {
                    number
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                  }
                }
              }
              content {
                ... on DraftIssue {
                  title
                  body
                }
                ... on Issue {
                  title
                  number
                  state
                }
                ... on PullRequest {
                  title
                  number
                  state
                }
              }
            }
          }
        }
      }
    }" | jq -r '.data.node.items.nodes[] | "\(.content.title // "Untitled")"' 2>/dev/null || echo "No items found"
    echo ""
}

# Function to add a new item
add_item() {
    local board_id=$1
    local title=$2
    local body=$3
    
    echo "Adding: $title"
    
    gh api graphql -f query="
    mutation {
      addProjectV2DraftIssue(input: {
        projectId: \"$board_id\"
        title: \"$title\"
        body: \"$body\"
      }) {
        projectItem {
          id
        }
      }
    }" > /dev/null 2>&1 && echo -e "${GREEN}✓ Added successfully${NC}" || echo -e "${YELLOW}✗ Failed to add${NC}"
}

# Function to query board statistics
show_board_stats() {
    local board_id=$1
    local board_name=$2
    
    echo -e "${GREEN}=== $board_name Statistics ===${NC}"
    
    local stats=$(gh api graphql -f query="
    {
      node(id: \"$board_id\") {
        ... on ProjectV2 {
          items {
            totalCount
          }
          fields(first: 20) {
            totalCount
          }
        }
      }
    }" 2>/dev/null)
    
    echo "$stats" | jq -r '"Total Items: \(.data.node.items.totalCount)\nTotal Fields: \(.data.node.fields.totalCount)"' 2>/dev/null || echo "Could not fetch stats"
    echo ""
}

# Main menu
case "${1:-menu}" in
    list)
        echo "Fetching board items..."
        echo ""
        list_board_items "$PATTERNS_BOARD_ID" "STAD Agentic Patterns"
        list_board_items "$AGENTS_BOARD_ID" "STAD Agents"
        ;;
        
    stats)
        echo "Fetching board statistics..."
        echo ""
        show_board_stats "$PATTERNS_BOARD_ID" "STAD Agentic Patterns"
        show_board_stats "$AGENTS_BOARD_ID" "STAD Agents"
        ;;
        
    add-pattern)
        shift
        title="${1:-New Pattern}"
        body="${2:-Pattern description}"
        add_item "$PATTERNS_BOARD_ID" "$title" "$body"
        ;;
        
    add-agent)
        shift
        title="${1:-New Agent Task}"
        body="${2:-Agent task description}"
        add_item "$AGENTS_BOARD_ID" "$title" "$body"
        ;;
        
    urls)
        echo -e "${GREEN}Project Board URLs:${NC}"
        echo "STAD Agentic Patterns: https://github.com/users/OGHeyDude/projects/5"
        echo "STAD Agents: https://github.com/users/OGHeyDude/projects/6"
        echo ""
        echo "Open these in your browser to:"
        echo "- Configure columns and fields"
        echo "- Update item statuses"
        echo "- Set up automation rules"
        ;;
        
    menu|help|*)
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  list         - List all items in both boards"
        echo "  stats        - Show board statistics"
        echo "  add-pattern  - Add item to Patterns board"
        echo "                 Usage: $0 add-pattern \"Title\" \"Description\""
        echo "  add-agent    - Add item to Agents board"
        echo "                 Usage: $0 add-agent \"Title\" \"Description\""
        echo "  urls         - Show board URLs for web access"
        echo "  help         - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 list"
        echo "  $0 stats"
        echo "  $0 add-pattern \"New Pattern\" \"Description of the pattern\""
        echo "  $0 add-agent \"Enhance Agent X\" \"Add new capability\""
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    Operation Complete                     ║"
echo "╚════════════════════════════════════════════════════════════╝"