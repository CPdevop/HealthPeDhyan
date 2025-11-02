"""
Tests for admin panel functionality
"""
import pytest
from playwright.sync_api import Page, expect
import time


class TestAdminLogin:
    """Test admin login functionality"""

    def test_admin_login_page_loads(self, page: Page, base_url: str):
        """Test admin login page loads"""
        page.goto(f"{base_url}/admin/login")
        expect(page.locator("h1, h2")).to_contain_text("Admin Login", ignore_case=True)

    def test_successful_login(self, page: Page, base_url: str, admin_credentials: dict):
        """Test successful admin login"""
        page.goto(f"{base_url}/admin/login")

        # Fill credentials
        page.fill('input[name="email"]', admin_credentials["email"])
        page.fill('input[name="password"]', admin_credentials["password"])

        # Submit
        page.click('button[type="submit"]')

        # Should redirect to dashboard
        page.wait_for_url(f"{base_url}/admin/dashboard", timeout=5000)
        expect(page).to_have_url(f"{base_url}/admin/dashboard")

    def test_failed_login_with_wrong_credentials(self, page: Page, base_url: str):
        """Test login fails with wrong credentials"""
        page.goto(f"{base_url}/admin/login")

        # Fill wrong credentials
        page.fill('input[name="email"]', "wrong@email.com")
        page.fill('input[name="password"]', "wrongpassword")

        # Submit
        page.click('button[type="submit"]')

        # Should show error or stay on login page
        time.sleep(1)
        # Error handling varies, just check we didn't navigate away improperly
        assert "login" in page.url.lower()


class TestAdminDashboard:
    """Test admin dashboard"""

    def test_dashboard_loads(self, logged_in_page: Page, base_url: str):
        """Test dashboard loads for logged in admin"""
        expect(logged_in_page).to_have_url(f"{base_url}/admin/dashboard")
        expect(logged_in_page.locator("h1")).to_be_visible()

    def test_dashboard_stats_visible(self, logged_in_page: Page):
        """Test dashboard statistics are visible"""
        # Should show some stats cards
        stats = logged_in_page.locator('[class*="Card"], [class*="card"]')
        expect(stats.first).to_be_visible()

    def test_navigation_sidebar(self, logged_in_page: Page):
        """Test admin sidebar navigation"""
        # Check for navigation links
        expect(logged_in_page.locator("text=Products")).to_be_visible()
        expect(logged_in_page.locator("text=Articles")).to_be_visible()
        expect(logged_in_page.locator("text=Telemetry")).to_be_visible()


class TestAdminProducts:
    """Test admin product management"""

    def test_products_list_page(self, logged_in_page: Page, base_url: str):
        """Test products list page loads"""
        logged_in_page.goto(f"{base_url}/admin/products")
        expect(logged_in_page.locator("h1")).to_contain_text("Products")

    def test_add_new_product_button(self, logged_in_page: Page, base_url: str):
        """Test 'Add Product' button navigates correctly"""
        logged_in_page.goto(f"{base_url}/admin/products")

        add_button = logged_in_page.get_by_role("link", name=/Add Product/i)
        expect(add_button).to_be_visible()
        add_button.click()

        expect(logged_in_page).to_have_url(f"{base_url}/admin/products/new")

    def test_edit_product_button(self, logged_in_page: Page, base_url: str):
        """Test edit button on product list"""
        logged_in_page.goto(f"{base_url}/admin/products")

        # Find first edit button
        edit_button = logged_in_page.get_by_role("link", name=/Edit/i).first
        if edit_button.is_visible():
            edit_button.click()

            # Should navigate to edit page
            expect(logged_in_page).to_have_url(f"{base_url}/admin/products/", {"ignore_case": True})

    def test_delete_product_dialog(self, logged_in_page: Page, base_url: str):
        """Test delete product confirmation dialog"""
        logged_in_page.goto(f"{base_url}/admin/products")

        # Find delete button (trash icon)
        delete_button = logged_in_page.locator('button:has-text("")').first  # Trash icon
        if delete_button.is_visible():
            delete_button.click()

            # Confirmation dialog should appear
            dialog = logged_in_page.locator('[role="dialog"], [role="alertdialog"]')
            expect(dialog).to_be_visible()

            # Cancel button should be present
            cancel_button = logged_in_page.get_by_role("button", name=/Cancel/i)
            expect(cancel_button).to_be_visible()
            cancel_button.click()

            # Dialog should close
            time.sleep(0.5)
            expect(dialog).not_to_be_visible()

    def test_create_product_form(self, logged_in_page: Page, base_url: str):
        """Test product creation form"""
        logged_in_page.goto(f"{base_url}/admin/products/new")

        # Check form fields exist
        expect(logged_in_page.locator('input[name="title"]')).to_be_visible()
        expect(logged_in_page.locator('input[name="slug"]')).to_be_visible()
        expect(logged_in_page.locator('select[name="brandId"]')).to_be_visible()
        expect(logged_in_page.locator('select[name="categoryId"]')).to_be_visible()
        expect(logged_in_page.locator('input[name="healthScore"]')).to_be_visible()

    def test_product_form_validation(self, logged_in_page: Page, base_url: str):
        """Test required field validation"""
        logged_in_page.goto(f"{base_url}/admin/products/new")

        # Try to submit empty form
        submit_button = logged_in_page.get_by_role("button", name=/Save|Create/i)
        submit_button.click()

        # Should show validation errors or not submit
        time.sleep(0.5)
        # Still on the same page (didn't navigate away)
        assert "new" in logged_in_page.url


class TestAdminArticles:
    """Test admin article management"""

    def test_articles_list_page(self, logged_in_page: Page, base_url: str):
        """Test articles list page loads"""
        logged_in_page.goto(f"{base_url}/admin/articles")
        expect(logged_in_page.locator("h1")).to_contain_text("Articles")

    def test_new_article_button(self, logged_in_page: Page, base_url: str):
        """Test 'New Article' button"""
        logged_in_page.goto(f"{base_url}/admin/articles")

        new_button = logged_in_page.get_by_role("link", name=/New Article/i)
        expect(new_button).to_be_visible()
        new_button.click()

        expect(logged_in_page).to_have_url(f"{base_url}/admin/articles/new")

    def test_edit_article_button(self, logged_in_page: Page, base_url: str):
        """Test edit button on article list"""
        logged_in_page.goto(f"{base_url}/admin/articles")

        edit_button = logged_in_page.get_by_role("link", name=/Edit/i).first
        if edit_button.is_visible():
            edit_button.click()
            expect(logged_in_page).to_have_url(f"{base_url}/admin/articles/", {"ignore_case": True})

    def test_delete_article_dialog(self, logged_in_page: Page, base_url: str):
        """Test delete article confirmation dialog"""
        logged_in_page.goto(f"{base_url}/admin/articles")

        # Find delete button
        delete_button = logged_in_page.locator('button').filter(has=logged_in_page.locator('[class*="trash"]')).first
        if delete_button.is_visible():
            delete_button.click()

            # Dialog should appear
            dialog = logged_in_page.locator('[role="dialog"], [role="alertdialog"]')
            expect(dialog).to_be_visible()

            cancel = logged_in_page.get_by_role("button", name=/Cancel/i)
            cancel.click()

    def test_create_article_form(self, logged_in_page: Page, base_url: str):
        """Test article creation form"""
        logged_in_page.goto(f"{base_url}/admin/articles/new")

        # Check form fields
        expect(logged_in_page.locator('input[name="title"]')).to_be_visible()
        expect(logged_in_page.locator('input[name="slug"]')).to_be_visible()
        expect(logged_in_page.locator('textarea[name="excerpt"]')).to_be_visible()
        expect(logged_in_page.locator('textarea[name="bodyMarkdown"]')).to_be_visible()


class TestAdminTelemetry:
    """Test admin telemetry/analytics"""

    def test_telemetry_page_loads(self, logged_in_page: Page, base_url: str):
        """Test telemetry page loads"""
        logged_in_page.goto(f"{base_url}/admin/telemetry")
        expect(logged_in_page.locator("h1")).to_contain_text("Telemetry")

    def test_telemetry_stats_display(self, logged_in_page: Page, base_url: str):
        """Test telemetry statistics are displayed"""
        logged_in_page.goto(f"{base_url}/admin/telemetry")

        # Should show stats cards
        expect(logged_in_page.locator("text=Total Events")).to_be_visible()
        expect(logged_in_page.locator("text=Unique Users")).to_be_visible()
        expect(logged_in_page.locator("text=Active Sessions")).to_be_visible()

    def test_telemetry_filters(self, logged_in_page: Page, base_url: str):
        """Test telemetry filter dropdowns"""
        logged_in_page.goto(f"{base_url}/admin/telemetry")

        # Check for filter dropdowns
        time_filter = logged_in_page.locator('select').first
        expect(time_filter).to_be_visible()

        # Change filter
        time_filter.select_option("30")  # Last 30 days
        time.sleep(1)  # Wait for data to load


class TestAdminOtherPages:
    """Test other admin pages"""

    def test_brands_page(self, logged_in_page: Page, base_url: str):
        """Test brands management page"""
        logged_in_page.goto(f"{base_url}/admin/brands")
        expect(logged_in_page.locator("h1")).to_be_visible()

    def test_categories_page(self, logged_in_page: Page, base_url: str):
        """Test categories management page"""
        logged_in_page.goto(f"{base_url}/admin/categories")
        expect(logged_in_page.locator("h1")).to_be_visible()

    def test_badges_page(self, logged_in_page: Page, base_url: str):
        """Test badges management page"""
        logged_in_page.goto(f"{base_url}/admin/badges")
        expect(logged_in_page.locator("h1")).to_be_visible()

    def test_label_scans_page(self, logged_in_page: Page, base_url: str):
        """Test label scans management page"""
        logged_in_page.goto(f"{base_url}/admin/label-scans")
        expect(logged_in_page.locator("h1")).to_be_visible()

    def test_contact_messages_page(self, logged_in_page: Page, base_url: str):
        """Test contact messages page"""
        logged_in_page.goto(f"{base_url}/admin/contact-messages")
        expect(logged_in_page.locator("h1")).to_be_visible()


class TestAdminSecurity:
    """Test admin security features"""

    def test_admin_routes_require_auth(self, page: Page, base_url: str):
        """Test that admin routes redirect to login when not authenticated"""
        # Try to access admin dashboard without logging in
        page.goto(f"{base_url}/admin/dashboard")

        # Should redirect to login
        page.wait_for_url(f"{base_url}/admin/login", timeout=5000)
        expect(page).to_have_url(f"{base_url}/admin/login")

    def test_admin_products_require_auth(self, page: Page, base_url: str):
        """Test products page requires authentication"""
        page.goto(f"{base_url}/admin/products")
        page.wait_for_url(f"{base_url}/admin/login", timeout=5000)
        expect(page).to_have_url(f"{base_url}/admin/login")

    def test_admin_api_routes_require_auth(self, page: Page, base_url: str):
        """Test API routes require authentication"""
        # Try to access telemetry stats API directly
        response = page.request.get(f"{base_url}/api/telemetry/stats")

        # Should return 401 Unauthorized
        assert response.status == 401
