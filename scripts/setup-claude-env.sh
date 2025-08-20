#!/bin/bash

# setup-claude-env.sh - Interactive setup for CLAUDE.env configuration
# This script helps users create a properly configured CLAUDE.env file

set -e

echo "================================================"
echo "       CLAUDE.env Setup Wizard"
echo "================================================"
echo ""
echo "This wizard will help you create a CLAUDE.env file"
echo "for your project with all necessary configurations."
echo ""

# Check if CLAUDE.env already exists
if [ -f "./CLAUDE.env" ]; then
    echo "⚠️  CLAUDE.env already exists in this directory."
    read -p "Do you want to overwrite it? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    # Backup existing file
    cp CLAUDE.env CLAUDE.env.backup
    echo "✅ Backed up existing file to CLAUDE.env.backup"
fi

# Function to get input with default value
get_input() {
    local prompt="$1"
    local default="$2"
    local value
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        value="${value:-$default}"
    else
        read -p "$prompt: " value
    fi
    
    echo "$value"
}

echo ""
echo "=== PROJECT IDENTITY ==="
PROJECT_NAME=$(get_input "Project Name" "$(basename $(pwd))")
echo "Project Type Options: Web App, CLI Tool, Library, Service, API, Mobile App, Desktop App, Other"
PROJECT_TYPE=$(get_input "Project Type" "Web App")
echo "Language Options: TypeScript, Python, Go, Java, Rust, C++, Other"
PRIMARY_LANGUAGE=$(get_input "Primary Language" "TypeScript")
echo "Status Options: Planning, Active Development, Maintenance, Production, Archived"
PROJECT_STATUS=$(get_input "Project Status" "Active Development")

echo ""
echo "=== GIT & GITHUB ==="
# Try to detect git info
GIT_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
GIT_REPO_URL=$(get_input "Git Repository URL" "$GIT_URL")

# Parse GitHub owner and repo from URL if possible
if [[ "$GIT_REPO_URL" =~ github.com[:/]([^/]+)/([^/.]+) ]]; then
    GITHUB_OWNER="${BASH_REMATCH[1]}"
    GITHUB_REPO="${BASH_REMATCH[2]}"
else
    GITHUB_OWNER=""
    GITHUB_REPO=""
fi

GITHUB_OWNER=$(get_input "GitHub Owner/Username" "$GITHUB_OWNER")
GITHUB_REPO=$(get_input "GitHub Repository Name" "$GITHUB_REPO")
GITHUB_PROJECT_BOARD="https://github.com/$GITHUB_OWNER/$GITHUB_REPO/projects/1"
GITHUB_PROJECT_BOARD=$(get_input "GitHub Project Board URL" "$GITHUB_PROJECT_BOARD")
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
CURRENT_BRANCH=$(get_input "Current Branch" "$CURRENT_BRANCH")
ACTIVE_SPRINT=$(get_input "Active Sprint (e.g., Sprint_1)" "Sprint_1")

echo ""
echo "=== DEVELOPMENT COMMANDS ==="
# Detect package manager
if [ -f "package.json" ]; then
    if [ -f "yarn.lock" ]; then
        PKG_MGR="yarn"
    elif [ -f "pnpm-lock.yaml" ]; then
        PKG_MGR="pnpm"
    else
        PKG_MGR="npm"
    fi
elif [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
    PKG_MGR="pip"
elif [ -f "go.mod" ]; then
    PKG_MGR="go"
elif [ -f "Cargo.toml" ]; then
    PKG_MGR="cargo"
else
    PKG_MGR="npm"
fi

PACKAGE_MANAGER=$(get_input "Package Manager" "$PKG_MGR")

# Set default commands based on package manager
case "$PACKAGE_MANAGER" in
    npm|yarn|pnpm)
        INSTALL_CMD="$PACKAGE_MANAGER install"
        TEST_CMD="$PACKAGE_MANAGER test"
        BUILD_CMD="$PACKAGE_MANAGER run build"
        LINT_CMD="$PACKAGE_MANAGER run lint"
        START_CMD="$PACKAGE_MANAGER start"
        DEV_CMD="$PACKAGE_MANAGER run dev"
        ;;
    pip)
        INSTALL_CMD="pip install -r requirements.txt"
        TEST_CMD="pytest"
        BUILD_CMD="python setup.py build"
        LINT_CMD="flake8"
        START_CMD="python main.py"
        DEV_CMD="python main.py --dev"
        ;;
    go)
        INSTALL_CMD="go mod download"
        TEST_CMD="go test ./..."
        BUILD_CMD="go build"
        LINT_CMD="golangci-lint run"
        START_CMD="go run ."
        DEV_CMD="go run . -dev"
        ;;
    cargo)
        INSTALL_CMD="cargo fetch"
        TEST_CMD="cargo test"
        BUILD_CMD="cargo build --release"
        LINT_CMD="cargo clippy"
        START_CMD="cargo run"
        DEV_CMD="cargo run -- --dev"
        ;;
    *)
        INSTALL_CMD="echo 'No install command'"
        TEST_CMD="echo 'No test command'"
        BUILD_CMD="echo 'No build command'"
        LINT_CMD="echo 'No lint command'"
        START_CMD="echo 'No start command'"
        DEV_CMD="echo 'No dev command'"
        ;;
esac

INSTALL_COMMAND=$(get_input "Install Command" "$INSTALL_CMD")
TEST_COMMAND=$(get_input "Test Command" "$TEST_CMD")
BUILD_COMMAND=$(get_input "Build Command" "$BUILD_CMD")
LINT_COMMAND=$(get_input "Lint Command" "$LINT_CMD")
START_COMMAND=$(get_input "Start Command" "$START_CMD")
DEV_COMMAND=$(get_input "Dev Command" "$DEV_CMD")

echo ""
echo "=== STAD PROTOCOL SETTINGS ==="
USE_STAD=$(get_input "Use STAD Protocol? (true/false)" "true")
SPRINT_WEEKS=$(get_input "Sprint Duration (weeks)" "2")
SPRINT_POINTS=$(get_input "Sprint Point Target" "30")
MAX_POINTS=$(get_input "Max Story Points per Ticket" "5")

# Copy template and create CLAUDE.env
cp /home/hd/Desktop/LAB/Dev-Agency/TEMPLATE_PACKAGE/CLAUDE.env.example ./CLAUDE.env

# Replace values in CLAUDE.env
sed -i "s|Your Project Name|$PROJECT_NAME|g" ./CLAUDE.env
sed -i "s|PROJECT_TYPE=\"Web App\"|PROJECT_TYPE=\"$PROJECT_TYPE\"|g" ./CLAUDE.env
sed -i "s|PRIMARY_LANGUAGE=\"TypeScript\"|PRIMARY_LANGUAGE=\"$PRIMARY_LANGUAGE\"|g" ./CLAUDE.env
sed -i "s|PROJECT_STATUS=\"Active Development\"|PROJECT_STATUS=\"$PROJECT_STATUS\"|g" ./CLAUDE.env
sed -i "s|https://github.com/username/repo|$GIT_REPO_URL|g" ./CLAUDE.env
sed -i "s|username/repo/projects/1|$GITHUB_OWNER/$GITHUB_REPO/projects/1|g" ./CLAUDE.env
sed -i "s|GITHUB_OWNER=\"username\"|GITHUB_OWNER=\"$GITHUB_OWNER\"|g" ./CLAUDE.env
sed -i "s|GITHUB_REPO=\"repo-name\"|GITHUB_REPO=\"$GITHUB_REPO\"|g" ./CLAUDE.env
sed -i "s|CURRENT_BRANCH=\"main\"|CURRENT_BRANCH=\"$CURRENT_BRANCH\"|g" ./CLAUDE.env
sed -i "s|ACTIVE_SPRINT=\"Sprint_1\"|ACTIVE_SPRINT=\"$ACTIVE_SPRINT\"|g" ./CLAUDE.env
sed -i "s|PACKAGE_MANAGER=\"npm\"|PACKAGE_MANAGER=\"$PACKAGE_MANAGER\"|g" ./CLAUDE.env
sed -i "s|INSTALL_COMMAND=\"npm install\"|INSTALL_COMMAND=\"$INSTALL_COMMAND\"|g" ./CLAUDE.env
sed -i "s|TEST_COMMAND=\"npm test\"|TEST_COMMAND=\"$TEST_COMMAND\"|g" ./CLAUDE.env
sed -i "s|BUILD_COMMAND=\"npm run build\"|BUILD_COMMAND=\"$BUILD_COMMAND\"|g" ./CLAUDE.env
sed -i "s|LINT_COMMAND=\"npm run lint\"|LINT_COMMAND=\"$LINT_COMMAND\"|g" ./CLAUDE.env
sed -i "s|START_COMMAND=\"npm start\"|START_COMMAND=\"$START_COMMAND\"|g" ./CLAUDE.env
sed -i "s|DEV_COMMAND=\"npm run dev\"|DEV_COMMAND=\"$DEV_COMMAND\"|g" ./CLAUDE.env
sed -i "s|USE_STAD_PROTOCOL=\"true\"|USE_STAD_PROTOCOL=\"$USE_STAD\"|g" ./CLAUDE.env
sed -i "s|SPRINT_DURATION_WEEKS=\"2\"|SPRINT_DURATION_WEEKS=\"$SPRINT_WEEKS\"|g" ./CLAUDE.env
sed -i "s|SPRINT_POINT_TARGET=\"30\"|SPRINT_POINT_TARGET=\"$SPRINT_POINTS\"|g" ./CLAUDE.env
sed -i "s|MAX_STORY_POINTS_PER_TICKET=\"5\"|MAX_STORY_POINTS_PER_TICKET=\"$MAX_POINTS\"|g" ./CLAUDE.env

echo ""
echo "================================================"
echo "✅ CLAUDE.env created successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Review and edit ./CLAUDE.env for any additional settings"
echo "2. Add 'CLAUDE.env' to your .gitignore file"
echo "3. Update ACTIVE_SPRINT as you progress through sprints"
echo ""
echo "Claude will now use these settings when working in your project!"

# Check if .gitignore exists and offer to add CLAUDE.env
if [ -f ".gitignore" ]; then
    if ! grep -q "CLAUDE.env" .gitignore; then
        echo ""
        read -p "Add CLAUDE.env to .gitignore? (Y/n): " ADD_GITIGNORE
        if [[ ! "$ADD_GITIGNORE" =~ ^[Nn]$ ]]; then
            echo -e "\n# Claude environment configuration\nCLAUDE.env\nCLAUDE.env.backup" >> .gitignore
            echo "✅ Added CLAUDE.env to .gitignore"
        fi
    fi
fi