@echo off
REM Quick test runner script for HealthPeDhyan Playwright tests (Windows)

echo ==================================
echo HealthPeDhyan Test Suite Runner
echo ==================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -q -r requirements.txt

REM Install Playwright browsers
echo Installing Playwright browsers...
playwright install chromium

REM Create directories
if not exist "test-results\" mkdir test-results
if not exist "screenshots\" mkdir screenshots

REM Check if app is running
echo Checking if application is running...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Application is not running!
    echo Please start the application with: npm run dev
    exit /b 1
)
echo [OK] Application is running at http://localhost:3000

REM Run tests
echo.
echo Running Playwright tests...
echo.

pytest --browser chromium --html=test-results/report.html --self-contained-html -v

if errorlevel 1 (
    echo.
    echo ==================================
    echo [FAILED] Some tests failed
    echo ==================================
    echo.
    echo View report: test-results\report.html
    echo Screenshots: screenshots\
    exit /b 1
) else (
    echo.
    echo ==================================
    echo [SUCCESS] All tests passed!
    echo ==================================
    echo.
    echo View report: test-results\report.html
)
