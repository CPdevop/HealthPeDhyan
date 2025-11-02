#!/bin/bash
# Quick test runner script for HealthPeDhyan Playwright tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}HealthPeDhyan Test Suite Runner${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -q -r requirements.txt

# Check if Playwright browsers are installed
if ! playwright --version &> /dev/null; then
    echo -e "${YELLOW}Installing Playwright browsers...${NC}"
    playwright install chromium
fi

# Create directories
mkdir -p test-results screenshots

# Check if app is running
echo -e "${YELLOW}Checking if application is running...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ Application is running at http://localhost:3000${NC}"
else
    echo -e "${RED}✗ Application is not running!${NC}"
    echo -e "${YELLOW}Please start the application with: npm run dev${NC}"
    exit 1
fi

# Parse command line arguments
TEST_FILE=""
BROWSER="chromium"
HEADED=""
MARKERS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --file)
            TEST_FILE="$2"
            shift 2
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        --headed)
            HEADED="--headed"
            shift
            ;;
        --smoke)
            MARKERS="-m smoke"
            shift
            ;;
        --admin)
            MARKERS="-m admin"
            shift
            ;;
        --api)
            MARKERS="-m api"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run tests
echo ""
echo -e "${GREEN}Running Playwright tests...${NC}"
echo "Browser: $BROWSER"
echo "Test file: ${TEST_FILE:-All tests}"
echo ""

pytest $TEST_FILE \
    --browser $BROWSER \
    $HEADED \
    $MARKERS \
    --html=test-results/report.html \
    --self-contained-html \
    -v

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}==================================${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}==================================${NC}"
    echo ""
    echo -e "View report: ${YELLOW}test-results/report.html${NC}"
else
    echo ""
    echo -e "${RED}==================================${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}==================================${NC}"
    echo ""
    echo -e "View report: ${YELLOW}test-results/report.html${NC}"
    echo -e "Screenshots: ${YELLOW}screenshots/${NC}"
    exit 1
fi
