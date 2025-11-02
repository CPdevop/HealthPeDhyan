"""
Pytest configuration and fixtures for Playwright tests
"""
import pytest
from playwright.sync_api import Page, Browser, BrowserContext


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configure browser context with custom settings"""
    return {
        **browser_context_args,
        "viewport": {"width": 1920, "height": 1080},
        "ignore_https_errors": True,
    }


@pytest.fixture
def base_url():
    """Base URL for the application"""
    return "http://localhost:3000"


@pytest.fixture
def admin_credentials():
    """Admin login credentials"""
    return {
        "email": "admin@healthpedhyan.com",
        "password": "admin123"  # Change this to your actual admin password
    }


@pytest.fixture
def logged_in_page(page: Page, base_url: str, admin_credentials: dict):
    """Returns a page with admin already logged in"""
    # Navigate to admin login
    page.goto(f"{base_url}/admin/login")

    # Fill in credentials
    page.fill('input[name="email"]', admin_credentials["email"])
    page.fill('input[name="password"]', admin_credentials["password"])

    # Submit form
    page.click('button[type="submit"]')

    # Wait for navigation to admin dashboard
    page.wait_for_url(f"{base_url}/admin/dashboard")

    return page


def take_screenshot(page: Page, name: str):
    """Helper to take screenshots for debugging"""
    page.screenshot(path=f"tests/screenshots/{name}.png")
