#!/bin/bash
# STAD Protocol Alignment Validation Script
# Version: 1.0
# Purpose: Comprehensive validation of STAD Protocol documentation alignment
# Based on: STAD Protocol Alignment Validation Plan v1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/home/hd/Desktop/LAB/Dev-Agency"
DOCS_DIR="$BASE_DIR/docs/architecture"
VALIDATION_DIR="$BASE_DIR/scripts/validation"

# Core STAD documents
NORTH_STAR="$DOCS_DIR/STAD_PROTOCOL_NORTH_STAR.md"
PLAYBOOK="$DOCS_DIR/STAD_Agent_Playbook.md"
REGISTRY="$DOCS_DIR/STAD_Agent_Registry.md"
STAD_CLAUDE="$DOCS_DIR/STAD_CLAUDE.md"
FILE_STRUCTURE="$DOCS_DIR/STAD_FILE_STRUCTURE.md"

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Validation results storage
declare -A RESULTS
declare -A FAILURES

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# ==================== Helper Functions ====================

log_header() {
    echo ""
    echo -e "${BOLD}${CYAN}=========================================${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}=========================================${NC}"
}

log_section() {
    echo ""
    echo -e "${BOLD}${BLUE}>>> $1${NC}"
    echo -e "${BLUE}---${NC}"
}

check_pass() {
    local check_id="$1"
    local description="$2"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    RESULTS["$check_id"]="PASS"
    echo -e "${GREEN}✓${NC} [$check_id] $description"
}

check_fail() {
    local check_id="$1"
    local description="$2"
    local details="$3"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    RESULTS["$check_id"]="FAIL"
    FAILURES["$check_id"]="$details"
    echo -e "${RED}✗${NC} [$check_id] $description"
    if [ -n "$details" ]; then
        echo -e "   ${RED}Details: $details${NC}"
    fi
}

check_warn() {
    local check_id="$1"
    local description="$2"
    local details="$3"
    WARNINGS=$((WARNINGS + 1))
    echo -e "${YELLOW}⚠${NC} [$check_id] $description"
    if [ -n "$details" ]; then
        echo -e "   ${YELLOW}Details: $details${NC}"
    fi
}

check_file_exists() {
    local file="$1"
    local name="$2"
    if [ ! -f "$file" ]; then
        echo -e "${RED}ERROR: $name not found at $file${NC}"
        exit 1
    fi
}

# ==================== Phase 1: Foundational Concepts ====================

phase1_foundational_concepts() {
    log_header "PHASE 1: FOUNDATIONAL CONCEPTS AUDIT"
    
    # FC-01: STAD Stages consistency
    log_section "FC-01: STAD Stages Verification"
    
    # Check for Stage 0-4 mentions in each document
    local stage_pattern="Stage [0-4]:|Stage [0-4] \(|Stage [0-4][\s]*→"
    
    # Check North Star
    local ns_stages=$(grep -E "$stage_pattern" "$NORTH_STAR" 2>/dev/null | grep -oE "Stage [0-4]" | sort -u | wc -l)
    # Check Playbook
    local pb_stages=$(grep -E "$stage_pattern" "$PLAYBOOK" 2>/dev/null | grep -oE "Stage [0-4]" | sort -u | wc -l)
    # Check Registry
    local rg_stages=$(grep -E "$stage_pattern" "$REGISTRY" 2>/dev/null | grep -oE "Stage [0-4]" | sort -u | wc -l)
    # Check STAD_CLAUDE
    local sc_stages=$(grep -E "$stage_pattern" "$STAD_CLAUDE" 2>/dev/null | grep -oE "Stage [0-4]" | sort -u | wc -l)
    
    if [ "$ns_stages" -eq 5 ] && [ "$pb_stages" -eq 5 ] && [ "$rg_stages" -eq 5 ] && [ "$sc_stages" -eq 5 ]; then
        check_pass "FC-01" "STAD Stages (0-4) consistently defined across all documents"
    else
        check_fail "FC-01" "STAD Stages inconsistency" "NS:$ns_stages PB:$pb_stages RG:$rg_stages SC:$sc_stages (expected 5 each)"
    fi
    
    # FC-02: Core Philosophy consistency
    log_section "FC-02: Core Philosophy Verification"
    
    # Check for key principles
    local principles=("Archive.*Don't Delete\|Archive, Don't Delete" "Quality.*Speed\|Quality over Speed" "Git-Native\|Git Native")
    local all_consistent=true
    
    for principle in "${principles[@]}"; do
        local ns_has=$(grep -c "$principle" "$NORTH_STAR" 2>/dev/null | tr -d '\n' || echo 0)
        local sc_has=$(grep -c "$principle" "$STAD_CLAUDE" 2>/dev/null | tr -d '\n' || echo 0)
        local pb_has=$(grep -c "$principle" "$PLAYBOOK" 2>/dev/null | tr -d '\n' || echo 0)
        
        if [ "$ns_has" -eq 0 ] || [ "$sc_has" -eq 0 ]; then
            all_consistent=false
            break
        fi
    done
    
    if [ "$all_consistent" = true ]; then
        check_pass "FC-02" "Core philosophy principles consistently present"
    else
        check_fail "FC-02" "Core philosophy inconsistency" "Key principles missing in some documents"
    fi
    
    # FC-03: Agent Roster consistency
    log_section "FC-03: Agent Roster Consistency"
    
    # Core agents that should be in both Playbook and Registry
    local core_agents=("Architect" "Coder" "Tester" "Backend QA" "Documenter" "Retrospective")
    local roster_consistent=true
    
    for agent in "${core_agents[@]}"; do
        local pb_has=$(grep -c "^### .*$agent\|^| \*\*$agent\*\*" "$PLAYBOOK" 2>/dev/null || echo 0)
        local rg_has=$(grep -c "\*\*$agent\*\*\|^| $agent |" "$REGISTRY" 2>/dev/null || echo 0)
        
        if [ "$pb_has" -eq 0 ] || [ "$rg_has" -eq 0 ]; then
            roster_consistent=false
            check_warn "FC-03-$agent" "Agent '$agent' missing" "PB:$pb_has RG:$rg_has"
        fi
    done
    
    if [ "$roster_consistent" = true ]; then
        check_pass "FC-03" "Core agent roster consistent between Playbook and Registry"
    else
        check_fail "FC-03" "Agent roster inconsistency" "Some core agents missing"
    fi
    
    # FC-04: Agent Roles consistency
    log_section "FC-04: Agent Role Definitions"
    
    # Check Architect role consistency
    local arch_pb=$(grep -A2 "Architect.*Stage 1" "$PLAYBOOK" 2>/dev/null | grep -c "specification\|spec" || echo 0)
    local arch_rg=$(grep -A2 "Architect.*Primary" "$REGISTRY" 2>/dev/null | grep -c "spec\|specification" || echo 0)
    
    if [ "$arch_pb" -gt 0 ] && [ "$arch_rg" -gt 0 ]; then
        check_pass "FC-04" "Agent primary responsibilities consistent"
    else
        check_fail "FC-04" "Agent role inconsistency" "Architect role definitions differ"
    fi
}

# ==================== Phase 2: Structural & Path Integrity ====================

phase2_structural_paths() {
    log_header "PHASE 2: STRUCTURAL & PATH INTEGRITY AUDIT"
    
    # Define correct paths from FILE_STRUCTURE
    declare -A CORRECT_PATHS=(
        ["SP-01-handoffs"]="/Project_Management/Sprint_Execution/Sprint_\[N\]/agent_handoffs/"
        ["SP-02-reports"]="/Project_Management/Sprint_Execution/Sprint_\[N\]/work_reports/"
        ["SP-03-specs"]="/Project_Management/Specs/"
        ["SP-04-retros"]="/Project_Management/Sprint_Retrospectives/"
        ["SP-05-archive"]="/Archive/"
        ["SP-06-templates"]="/docs/reference/templates/"
        ["SP-07-agents"]="/Agents/"
    )
    
    # Check each path in relevant documents
    for check_id in "${!CORRECT_PATHS[@]}"; do
        local correct_path="${CORRECT_PATHS[$check_id]}"
        local check_name="${check_id%-*}"
        local path_type="${check_id#*-}"
        
        log_section "$check_name: Checking $path_type paths"
        
        # Check in relevant documents
        local docs_to_check=()
        case "$path_type" in
            "handoffs"|"reports")
                docs_to_check=("$PLAYBOOK" "$REGISTRY" "$STAD_CLAUDE")
                ;;
            "specs"|"retros"|"archive")
                docs_to_check=("$PLAYBOOK" "$STAD_CLAUDE")
                ;;
            "templates")
                docs_to_check=("$PLAYBOOK" "$STAD_CLAUDE" "$FILE_STRUCTURE")
                ;;
            "agents")
                docs_to_check=("$FILE_STRUCTURE")
                ;;
        esac
        
        local all_correct=true
        for doc in "${docs_to_check[@]}"; do
            local doc_name=$(basename "$doc" .md)
            
            # For handoffs and reports, check for old incorrect paths
            if [[ "$path_type" == "handoffs" ]]; then
                local old_path="/Project_Management/Agent_Handoffs/"
                local has_old=$(grep -c "$old_path" "$doc" 2>/dev/null || echo 0)
                if [ "$has_old" -gt 0 ]; then
                    all_correct=false
                    check_warn "$check_name-old" "Old handoff path in $doc_name" "$has_old instances"
                fi
            elif [[ "$path_type" == "reports" ]]; then
                local old_path="/Project_Management/Retrospectives/\[Agent\]"
                local has_old=$(grep -c "$old_path" "$doc" 2>/dev/null || echo 0)
                if [ "$has_old" -gt 0 ]; then
                    all_correct=false
                    check_warn "$check_name-old" "Old report path in $doc_name" "$has_old instances"
                fi
            fi
            
            # Check for correct path
            local has_correct=$(grep -c "${correct_path//\[/\\[}" "$doc" 2>/dev/null || echo 0)
            if [ "$has_correct" -eq 0 ] && [[ "$doc" != *"FILE_STRUCTURE"* ]]; then
                all_correct=false
            fi
        done
        
        if [ "$all_correct" = true ]; then
            check_pass "$check_name" "$path_type paths correctly specified"
        else
            check_fail "$check_name" "$path_type path inconsistency" "Check individual warnings above"
        fi
    done
}

# ==================== Phase 3: Procedural Workflow ====================

phase3_procedural_workflow() {
    log_header "PHASE 3: PROCEDURAL WORKFLOW AUDIT"
    
    # PW-01: Ticket Status Flow
    log_section "PW-01: Ticket Status Flow Verification"
    
    local status_flow="BACKLOG.*TODO.*IN_PROGRESS.*CODE_REVIEW"
    local ns_flow=$(grep -c "$status_flow" "$NORTH_STAR" 2>/dev/null || echo 0)
    local sc_flow=$(grep -c "$status_flow" "$STAD_CLAUDE" 2>/dev/null || echo 0)
    
    if [ "$ns_flow" -gt 0 ] && [ "$sc_flow" -gt 0 ]; then
        check_pass "PW-01" "Ticket status flow consistent"
    else
        check_fail "PW-01" "Ticket status flow inconsistency" "NS:$ns_flow SC:$sc_flow"
    fi
    
    # PW-02: Blocker Handling
    log_section "PW-02: Blocker Handling Process"
    
    local bugs_blockers="Bugs.*Tool Failures.*FIX\|Bug.*Tool.*NO WORKAROUND"
    local decision_blockers="Design.*Decision.*BLOCKED\|Unknown.*Architecture.*escalate"
    
    local has_bug_handling=$(grep -c "$bugs_blockers" "$STAD_CLAUDE" 2>/dev/null | tr -d '\n' || echo 0)
    local has_decision_handling=$(grep -c "$decision_blockers" "$STAD_CLAUDE" 2>/dev/null | tr -d '\n' || echo 0)
    
    if [ "$has_bug_handling" -gt 0 ] && [ "$has_decision_handling" -gt 0 ]; then
        check_pass "PW-02" "Two-type blocker handling consistently defined"
    else
        check_fail "PW-02" "Blocker handling inconsistency" "Bug:$has_bug_handling Decision:$has_decision_handling"
    fi
    
    # PW-03: Ticket Splitting Rule
    log_section "PW-03: Ticket Splitting (>5 points)"
    
    local split_rule=">5.*point.*split\|exceed.*5.*point\|greater than 5"
    local ns_split=$(grep -ci "$split_rule" "$NORTH_STAR" 2>/dev/null | tr -d '\n' || echo 0)
    local pb_split=$(grep -ci "$split_rule" "$PLAYBOOK" 2>/dev/null | tr -d '\n' || echo 0)
    local sc_split=$(grep -ci "$split_rule" "$STAD_CLAUDE" 2>/dev/null | tr -d '\n' || echo 0)
    
    if [ "$ns_split" -gt 0 ] && [ "$pb_split" -gt 0 ] && [ "$sc_split" -gt 0 ]; then
        check_pass "PW-03" "Ticket splitting rule (>5 points) consistent"
    else
        check_fail "PW-03" "Ticket splitting inconsistency" "NS:$ns_split PB:$pb_split SC:$sc_split"
    fi
    
    # PW-04: Semantic Commits
    log_section "PW-04: Semantic Commit Format"
    
    local commit_format="type(scope).*message.*TICKET-ID\|type(scope):.*\[TICKET"
    local has_format_pb=$(grep -c "$commit_format" "$PLAYBOOK" 2>/dev/null || echo 0)
    local has_format_sc=$(grep -c "$commit_format" "$STAD_CLAUDE" 2>/dev/null || echo 0)
    
    if [ "$has_format_pb" -gt 0 ] && [ "$has_format_sc" -gt 0 ]; then
        check_pass "PW-04" "Semantic commit format consistent"
    else
        check_fail "PW-04" "Commit format inconsistency" "PB:$has_format_pb SC:$has_format_sc"
    fi
    
    # PW-05: Definition of Done
    log_section "PW-05: Definition of Done Checklist"
    
    local dod_items=("tests.*pass" "lint.*clean\|linting.*pass" "documentation.*updated" "coverage")
    local dod_consistent=true
    
    for item in "${dod_items[@]}"; do
        local sc_has=$(grep -ci "$item" "$STAD_CLAUDE" 2>/dev/null || echo 0)
        if [ "$sc_has" -eq 0 ]; then
            dod_consistent=false
            check_warn "PW-05-item" "DoD item missing: $item" ""
        fi
    done
    
    if [ "$dod_consistent" = true ]; then
        check_pass "PW-05" "Definition of Done checklist complete"
    else
        check_fail "PW-05" "Definition of Done incomplete" "Missing key items"
    fi
}

# ==================== Phase 4: Tooling & Commands ====================

phase4_tooling_commands() {
    log_header "PHASE 4: TOOLING & COMMAND AUDIT"
    
    # TC-01: Core CLI Tools
    log_section "TC-01: Required CLI Tools"
    
    local core_tools=("gh" "git" "jq")
    local tools_consistent=true
    
    for tool in "${core_tools[@]}"; do
        local pb_has=$(grep -c "\b$tool\b" "$PLAYBOOK" 2>/dev/null || echo 0)
        if [ "$pb_has" -eq 0 ]; then
            tools_consistent=false
            check_warn "TC-01-$tool" "Tool '$tool' not mentioned in Playbook" ""
        fi
    done
    
    if [ "$tools_consistent" = true ]; then
        check_pass "TC-01" "Core CLI tools consistently referenced"
    else
        check_fail "TC-01" "CLI tools inconsistency" "Some tools missing"
    fi
    
    # TC-02: /sprint-plan command
    log_section "TC-02: /sprint-plan Command"
    
    local sp_ns=$(grep -c "/sprint-plan" "$NORTH_STAR" 2>/dev/null || echo 0)
    local sp_sc=$(grep -c "/sprint-plan" "$STAD_CLAUDE" 2>/dev/null || echo 0)
    
    if [ "$sp_ns" -gt 0 ] || [ "$sp_sc" -gt 0 ]; then
        check_pass "TC-02" "/sprint-plan command documented"
    else
        check_fail "TC-02" "/sprint-plan missing" "NS:$sp_ns SC:$sp_sc"
    fi
    
    # TC-03: /sprint-execute command
    log_section "TC-03: /sprint-execute Command"
    
    local se_ns=$(grep -c "/sprint-execute" "$NORTH_STAR" 2>/dev/null || echo 0)
    local se_sc=$(grep -c "/sprint-execute" "$STAD_CLAUDE" 2>/dev/null || echo 0)
    
    if [ "$se_ns" -gt 0 ] || [ "$se_sc" -gt 0 ]; then
        check_pass "TC-03" "/sprint-execute command documented"
    else
        check_fail "TC-03" "/sprint-execute missing" "NS:$se_ns SC:$se_sc"
    fi
    
    # TC-04: Validation Scripts
    log_section "TC-04: Validation Script References"
    
    local val_scripts="validation.*script\|validate.*sh\|check.*sh"
    local has_validation=$(grep -c "$val_scripts" "$FILE_STRUCTURE" 2>/dev/null || echo 0)
    
    if [ "$has_validation" -gt 0 ]; then
        check_pass "TC-04" "Validation scripts referenced"
    else
        check_warn "TC-04" "No validation script references found" ""
    fi
}

# ==================== Report Generation ====================

generate_report() {
    log_header "VALIDATION SUMMARY REPORT"
    
    echo ""
    echo -e "${BOLD}Timestamp:${NC} $TIMESTAMP"
    echo -e "${BOLD}Total Checks:${NC} $TOTAL_CHECKS"
    echo -e "${BOLD}${GREEN}Passed:${NC} $PASSED_CHECKS"
    echo -e "${BOLD}${RED}Failed:${NC} $FAILED_CHECKS"
    echo -e "${BOLD}${YELLOW}Warnings:${NC} $WARNINGS"
    echo ""
    
    # Calculate pass percentage
    if [ "$TOTAL_CHECKS" -gt 0 ]; then
        local pass_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
        echo -e "${BOLD}Pass Rate:${NC} ${pass_rate}%"
        
        if [ "$pass_rate" -eq 100 ]; then
            echo -e "${GREEN}${BOLD}✅ PERFECT ALIGNMENT!${NC} All STAD documents are consistent."
        elif [ "$pass_rate" -ge 90 ]; then
            echo -e "${GREEN}✅ GOOD ALIGNMENT${NC} with minor issues to address."
        elif [ "$pass_rate" -ge 70 ]; then
            echo -e "${YELLOW}⚠ MODERATE ALIGNMENT${NC} - Several issues need attention."
        else
            echo -e "${RED}❌ POOR ALIGNMENT${NC} - Critical issues require immediate fix."
        fi
    fi
    
    # List failures if any
    if [ "$FAILED_CHECKS" -gt 0 ]; then
        echo ""
        echo -e "${BOLD}${RED}Failed Checks:${NC}"
        for check_id in "${!FAILURES[@]}"; do
            echo -e "  ${RED}✗${NC} [$check_id] ${FAILURES[$check_id]}"
        done
    fi
    
    echo ""
    echo -e "${CYAN}Full details available above.${NC}"
}

# ==================== Main Execution ====================

main() {
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${CYAN}║    STAD PROTOCOL ALIGNMENT VALIDATION v1.0    ║${NC}"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}Validating STAD Protocol documentation suite...${NC}"
    echo ""
    
    # Check all documents exist
    check_file_exists "$NORTH_STAR" "STAD Protocol North Star"
    check_file_exists "$PLAYBOOK" "STAD Agent Playbook"
    check_file_exists "$REGISTRY" "STAD Agent Registry"
    check_file_exists "$STAD_CLAUDE" "STAD CLAUDE"
    check_file_exists "$FILE_STRUCTURE" "STAD File Structure"
    
    # Run all phases
    phase1_foundational_concepts
    phase2_structural_paths
    phase3_procedural_workflow
    phase4_tooling_commands
    
    # Generate final report
    generate_report
    
    # Exit with appropriate code
    if [ "$FAILED_CHECKS" -gt 0 ]; then
        exit 1
    else
        exit 0
    fi
}

# Parse command line arguments
VERBOSE=false
PHASE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --phase)
            PHASE="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose     Show detailed output"
            echo "  --phase PHASE     Run specific phase (1-4)"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use -h for help"
            exit 1
            ;;
    esac
done

# Run validation
main