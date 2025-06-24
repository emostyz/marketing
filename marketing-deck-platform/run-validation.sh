#!/bin/bash

# AEDRIN Platform Validation Runner
# This script provides easy access to all validation tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️ $1${NC}" ;;
        "info") echo -e "${BLUE}🔍 $1${NC}" ;;
        *) echo -e "$1" ;;
    esac
}

# Function to check if Next.js is running
check_server() {
    print_status "Checking if AEDRIN server is running..." "info"
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "Server is running on http://localhost:3000" "success"
        return 0
    else
        print_status "Server is not running on http://localhost:3000" "error"
        print_status "Please start the server with: npm run dev" "warning"
        return 1
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking test dependencies..." "info"
    
    if ! command -v node &> /dev/null; then
        print_status "Node.js is not installed" "error"
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        print_status "package.json not found. Run from project root directory." "error"
        exit 1
    fi
    
    if [ ! -f "demo_1000_row_dataset.csv" ]; then
        print_status "Demo dataset file not found" "error"
        exit 1
    fi
    
    print_status "All dependencies are available" "success"
}

# Function to run a specific test
run_test() {
    local test_name="$1"
    local test_file="$2"
    local description="$3"
    
    echo ""
    print_status "========================================" "info"
    print_status "Running: $test_name" "info"
    print_status "Description: $description" "info"
    print_status "========================================" "info"
    echo ""
    
    if [ -f "$test_file" ]; then
        if node "$test_file"; then
            print_status "$test_name completed successfully" "success"
            return 0
        else
            print_status "$test_name failed" "error"
            return 1
        fi
    else
        print_status "Test file not found: $test_file" "error"
        return 1
    fi
}

# Function to display usage
show_usage() {
    echo ""
    echo "🚀 AEDRIN Platform Validation Test Runner"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  all                Run all validation tests (recommended)"
    echo "  health             Quick health check"
    echo "  data               Test real data processing"
    echo "  e2e                End-to-end user flow test"
    echo "  master             Complete master validation suite"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all             # Run complete validation"
    echo "  $0 data            # Test data processing only"
    echo "  $0 health          # Quick system check"
    echo ""
}

# Function to run health check
run_health_check() {
    print_status "Running quick health check..." "info"
    
    check_dependencies
    check_server
    
    # Basic file checks
    if [ -f "demo_1000_row_dataset.csv" ]; then
        local file_size=$(wc -l < demo_1000_row_dataset.csv)
        print_status "Demo data file: $file_size lines" "success"
    fi
    
    if [ -f "comprehensive-e2e-validation-agent.js" ]; then
        print_status "E2E validation agent: Ready" "success"
    fi
    
    if [ -f "real-data-processing-test.js" ]; then
        print_status "Real data processing test: Ready" "success"
    fi
    
    print_status "Health check completed" "success"
}

# Main execution
main() {
    case "${1:-help}" in
        "all")
            print_status "🚀 Starting complete AEDRIN platform validation..." "info"
            check_dependencies
            check_server || exit 1
            
            echo ""
            print_status "This will run all validation tests including:" "info"
            print_status "• Real data processing validation" "info"
            print_status "• End-to-end user flow testing" "info"
            print_status "• System performance benchmarks" "info"
            print_status "• Export quality validation" "info"
            echo ""
            
            read -p "Continue? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                run_test "Master Validation Suite" "master-validation-suite.js" "Complete platform validation"
            else
                print_status "Validation cancelled by user" "warning"
            fi
            ;;
            
        "health")
            run_health_check
            ;;
            
        "data")
            check_dependencies
            check_server || exit 1
            run_test "Real Data Processing Test" "real-data-processing-test.js" "Validates data upload, processing, and AI analysis with real CSV data"
            ;;
            
        "e2e")
            check_dependencies
            check_server || exit 1
            run_test "E2E Validation Agent" "comprehensive-e2e-validation-agent.js" "Complete end-to-end user journey validation"
            ;;
            
        "master")
            check_dependencies
            check_server || exit 1
            run_test "Master Validation Suite" "master-validation-suite.js" "Comprehensive platform validation with business readiness assessment"
            ;;
            
        "help"|*)
            show_usage
            ;;
    esac
}

# Check if script is being run from correct directory
if [ ! -f "package.json" ] || [ ! -f "demo_1000_row_dataset.csv" ]; then
    print_status "Please run this script from the AEDRIN project root directory" "error"
    print_status "Make sure you're in the directory containing package.json and demo_1000_row_dataset.csv" "warning"
    exit 1
fi

# Execute main function with all arguments
main "$@"