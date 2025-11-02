# HealthPeDhyan Test Suite

Comprehensive Playwright-based automated testing suite for the HealthPeDhyan application.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Configuration](#configuration)
- [CI/CD Integration](#cicd-integration)

## 🎯 Overview

This test suite uses **Playwright with Python** to provide comprehensive end-to-end testing coverage for:

- ✅ Public-facing pages (Home, Shop, Product Details, Blog)
- ✅ Admin panel functionality (CRUD operations, dashboard)
- ✅ API endpoints
- ✅ User journeys and workflows
- ✅ Mobile responsive design
- ✅ Authentication and security

## 📊 Test Coverage

### Public Pages (`test_public_pages.py`)
- Home page and hero section
- Product catalog and filtering
- Product detail pages
- Blog and article pages
- Label scanner
- Navigation and responsive design

### Admin Panel (`test_admin_panel.py`)
- Admin login and authentication
- Dashboard analytics
- Product management (CRUD)
- Article management (CRUD)
- Telemetry and analytics
- Delete confirmation dialogs
- Form validation

### API Endpoints (`test_api_endpoints.py`)
- Product API
- Telemetry tracking
- Label scanning
- OTP authentication
- API security

### User Journeys (`test_user_journeys.py`)
- Product discovery flow
- Shopping and filtering
- Educational content browsing
- Admin content management
- Mobile user experience
- Performance testing

## 🚀 Setup

### Prerequisites

- Python 3.8+
- Node.js (for running the Next.js app)
- PostgreSQL database (if testing with real data)

### Installation

1. **Create Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   cd tests
   pip install -r requirements.txt
   ```

3. **Install Playwright browsers:**
   ```bash
   playwright install chromium firefox webkit
   ```

4. **Start the application:**
   ```bash
   # In the project root directory
   npm run dev
   ```

   The app should be running at `http://localhost:3000`

### Configuration

1. **Update admin credentials** in `conftest.py`:
   ```python
   @pytest.fixture
   def admin_credentials():
       return {
           "email": "your-admin@email.com",
           "password": "your-admin-password"
       }
   ```

2. **Update base URL** if not using localhost:
   ```python
   @pytest.fixture
   def base_url():
       return "https://your-deployed-app.com"
   ```

## 🧪 Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test Files
```bash
# Public pages only
pytest test_public_pages.py

# Admin panel only
pytest test_admin_panel.py

# API endpoints only
pytest test_api_endpoints.py

# User journeys only
pytest test_user_journeys.py
```

### Run Specific Test Classes
```bash
# Test only home page
pytest test_public_pages.py::TestHomePage

# Test only admin products
pytest test_admin_panel.py::TestAdminProducts
```

### Run Specific Tests
```bash
# Single test
pytest test_public_pages.py::TestHomePage::test_home_page_loads
```

### Run with Different Browsers
```bash
# Chromium (default)
pytest --browser chromium

# Firefox
pytest --browser firefox

# WebKit (Safari)
pytest --browser webkit

# All browsers
pytest --browser chromium --browser firefox --browser webkit
```

### Run in Headed Mode (Watch browser)
```bash
pytest --headed
```

### Run in Slow Motion (for debugging)
```bash
pytest --headed --slowmo 1000
```

### Run with HTML Report
```bash
pytest --html=test-results/report.html --self-contained-html
```

### Run Parallel Tests (faster)
```bash
pytest -n auto  # Use all CPU cores
pytest -n 4     # Use 4 workers
```

### Run with Specific Markers
```bash
# Smoke tests only
pytest -m smoke

# Skip slow tests
pytest -m "not slow"

# API tests only
pytest -m api
```

## 📁 Test Structure

```
tests/
├── conftest.py                 # Pytest fixtures and configuration
├── pytest.ini                  # Pytest settings
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── test_public_pages.py        # Public-facing pages tests
│   ├── TestHomePage
│   ├── TestShopPage
│   ├── TestProductDetailPage
│   ├── TestBlogPages
│   ├── TestStandardsPage
│   ├── TestLabelScanner
│   ├── TestNavigation
│   └── TestResponsiveDesign
│
├── test_admin_panel.py         # Admin panel tests
│   ├── TestAdminLogin
│   ├── TestAdminDashboard
│   ├── TestAdminProducts
│   ├── TestAdminArticles
│   ├── TestAdminTelemetry
│   ├── TestAdminOtherPages
│   └── TestAdminSecurity
│
├── test_api_endpoints.py       # API endpoint tests
│   ├── TestPublicAPIEndpoints
│   ├── TestTelemetryAPI
│   ├── TestLabelScanAPI
│   ├── TestOTPAuthAPI
│   └── TestProductAPIDetailed
│
├── test_user_journeys.py       # End-to-end user flows
│   ├── TestProductDiscoveryJourney
│   ├── TestEducationalContentJourney
│   ├── TestLabelScanJourney
│   ├── TestAdminContentManagementJourney
│   ├── TestMobileUserJourney
│   ├── TestAccessibilityJourney
│   └── TestPerformanceJourney
│
└── screenshots/                # Test failure screenshots
```

## ⚙️ Configuration

### Environment Variables

Create `.env.test` file:
```bash
# Application URL
BASE_URL=http://localhost:3000

# Admin credentials
ADMIN_EMAIL=admin@healthpedhyan.com
ADMIN_PASSWORD=your-password

# Database
DATABASE_URL=postgresql://...

# Test mode
NODE_ENV=test
```

### Pytest Configuration (`pytest.ini`)

Key settings:
- **base_url**: Default application URL
- **headed**: Run in headless mode by default
- **browser**: Default browser (chromium)
- **markers**: Custom test markers
- **testpaths**: Where to find tests

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          npm ci
          pip install -r tests/requirements.txt
          playwright install --with-deps chromium

      - name: Run application
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3000

      - name: Run Playwright tests
        run: |
          cd tests
          pytest --html=report.html

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/test-results/
```

## 🐛 Debugging Tips

### Take Screenshots
Tests automatically take screenshots on failure. Check `screenshots/` folder.

### Use Playwright Inspector
```bash
PWDEBUG=1 pytest test_public_pages.py::test_home_page_loads
```

### Verbose Output
```bash
pytest -vv --tb=long
```

### Stop on First Failure
```bash
pytest -x
```

### Run Last Failed Tests
```bash
pytest --lf
```

### Print Page Content
Add to test:
```python
print(page.content())
```

## 📝 Writing New Tests

### Test Template

```python
def test_my_feature(page: Page, base_url: str):
    """Test description"""
    # Arrange
    page.goto(f"{base_url}/my-page")

    # Act
    page.click("button")

    # Assert
    expect(page.locator("h1")).to_be_visible()
```

### Using Fixtures

```python
def test_admin_feature(logged_in_page: Page, base_url: str):
    """Test with pre-authenticated admin"""
    logged_in_page.goto(f"{base_url}/admin/dashboard")
    # Already logged in!
```

## 📊 Test Reports

After running tests, view the HTML report:
```bash
open test-results/report.html  # macOS
xdg-open test-results/report.html  # Linux
start test-results/report.html  # Windows
```

## 🎯 Best Practices

1. **Keep tests independent** - Each test should work in isolation
2. **Use fixtures** - Reuse setup code via fixtures
3. **Clear test names** - Test name should describe what it tests
4. **Don't test implementation** - Test user-facing behavior
5. **Wait explicitly** - Use Playwright's auto-waiting or explicit waits
6. **Clean up** - Tests shouldn't leave data behind (or use transactions)
7. **Run locally first** - Ensure tests pass locally before CI

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/python/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Best Practices Guide](https://playwright.dev/python/docs/best-practices)

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the test logs in `test-results/`
- Run with `--headed` to see what's happening

---

**Happy Testing! 🚀**
