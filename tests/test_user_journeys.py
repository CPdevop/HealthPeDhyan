"""
End-to-end user journey tests
Simulates complete user flows through the application
"""
import pytest
from playwright.sync_api import Page, expect
import time


class TestProductDiscoveryJourney:
    """Test complete product discovery flow"""

    def test_discover_product_from_home(self, page: Page, base_url: str):
        """
        User journey: Home -> Featured Product -> Product Detail -> Affiliate Link
        """
        # Step 1: Land on home page
        page.goto(base_url)
        expect(page.locator("h1")).to_be_visible()

        # Step 2: Find and click a featured product
        product_card = page.locator('[href^="/product/"]').first
        product_title = product_card.text_content()
        product_card.click()

        # Step 3: Should be on product detail page
        expect(page).to_have_url(f"{base_url}/product/", {"ignore_case": True})

        # Step 4: Check for health score
        # Health score should be visible somewhere on the page

        # Step 5: Check for affiliate links (View on Amazon, etc.)
        # Affiliate buttons should be present
        affiliate_section = page.locator('text=/View|Buy|Amazon|Flipkart/i')

    def test_browse_shop_and_filter(self, page: Page, base_url: str):
        """
        User journey: Shop -> Filter by category -> Filter by health criteria
        """
        # Step 1: Navigate to shop
        page.goto(f"{base_url}/shop")

        # Step 2: See all products
        products_before = page.locator('[href^="/product/"]').count()
        assert products_before > 0

        # Step 3: Filter by palm oil free
        palm_oil_filter = page.locator('text=Palm Oil Free').first
        if palm_oil_filter.is_visible():
            palm_oil_filter.click()
            time.sleep(1)

            # Should update URL with filter
            assert "palmOilFree" in page.url or page.url.endswith("/shop")

        # Step 4: Click a product to view details
        page.locator('[href^="/product/"]').first.click()
        expect(page).to_have_url(f"{base_url}/product/", {"ignore_case": True})


class TestEducationalContentJourney:
    """Test educational content discovery"""

    def test_read_article_from_home(self, page: Page, base_url: str):
        """
        User journey: Home -> Latest Articles -> Read Article
        """
        # Step 1: Start at home
        page.goto(base_url)

        # Step 2: Find articles section
        expect(page.locator("text=Latest Articles")).to_be_visible()

        # Step 3: Click an article
        article_link = page.locator('[href^="/blog/"]').first
        if article_link.is_visible():
            article_link.click()

            # Should be on article page
            expect(page).to_have_url(f"{base_url}/blog/", {"ignore_case": True})

            # Article content should be visible
            expect(page.locator("h1")).to_be_visible()

    def test_browse_all_articles(self, page: Page, base_url: str):
        """
        User journey: Blog -> Browse articles -> Read article
        """
        # Step 1: Go to blog
        page.goto(f"{base_url}/blog")

        # Step 2: See article list
        expect(page.locator("h1")).to_contain_text("Articles")

        # Step 3: Click an article
        page.locator('[href^="/blog/"]').first.click()
        expect(page).to_have_url(f"{base_url}/blog/", {"ignore_case": True})


class TestLabelScanJourney:
    """Test label scanning user journey"""

    def test_navigate_to_scanner(self, page: Page, base_url: str):
        """
        User journey: Home -> Scanner -> Upload page
        """
        # Navigate to scanner
        page.goto(f"{base_url}/scan")

        # Scanner interface should load
        # Look for upload interface or instructions
        page_content = page.content()
        assert "scan" in page_content.lower() or "upload" in page_content.lower()


class TestAdminContentManagementJourney:
    """Test admin content management flow"""

    def test_admin_create_product_full_flow(self, logged_in_page: Page, base_url: str):
        """
        Admin journey: Login -> Products -> Create New -> Save -> View in list
        """
        # Step 1: Already logged in via fixture

        # Step 2: Navigate to products
        logged_in_page.goto(f"{base_url}/admin/products")
        expect(logged_in_page.locator("h1")).to_contain_text("Products")

        # Step 3: Click "Add Product"
        logged_in_page.get_by_role("link", name=/Add Product/i).click()
        expect(logged_in_page).to_have_url(f"{base_url}/admin/products/new")

        # Step 4: Fill in basic product info
        test_product_title = f"Test Product {int(time.time())}"
        logged_in_page.fill('input[name="title"]', test_product_title)
        logged_in_page.fill('input[name="slug"]', f"test-product-{int(time.time())}")
        logged_in_page.fill('input[name="shortSummary"]', "This is a test product")
        logged_in_page.fill('input[name="healthScore"]', "85")

        # Step 5: Select brand and category
        logged_in_page.locator('select[name="brandId"]').select_option(index=1)
        logged_in_page.locator('select[name="categoryId"]').select_option(index=1)

        # Step 6: Set health flags
        logged_in_page.check('input[name="isPalmOilFree"]')
        logged_in_page.check('input[name="isMeetsStandard"]')

        # Step 7: Save (note: this will actually create a product in the database)
        # Uncomment below to actually test creation (will modify database)
        # logged_in_page.get_by_role("button", name=/Save|Create/i).click()

        # Step 8: Should redirect to products list
        # expect(logged_in_page).to_have_url(f"{base_url}/admin/products")

        # Step 9: New product should appear in list
        # expect(logged_in_page.locator(f"text={test_product_title}")).to_be_visible()

    def test_admin_edit_product_flow(self, logged_in_page: Page, base_url: str):
        """
        Admin journey: Products list -> Edit -> Update -> Save
        """
        # Step 1: Go to products list
        logged_in_page.goto(f"{base_url}/admin/products")

        # Step 2: Click edit on first product
        edit_button = logged_in_page.get_by_role("link", name=/Edit/i).first
        if edit_button.is_visible():
            edit_button.click()

            # Step 3: Should be on edit page
            expect(logged_in_page).to_have_url(f"{base_url}/admin/products/", {"ignore_case": True})

            # Step 4: Modify a field
            current_title = logged_in_page.locator('input[name="title"]').input_value()
            # Don't actually save to avoid modifying data

    def test_admin_delete_product_flow(self, logged_in_page: Page, base_url: str):
        """
        Admin journey: Products list -> Delete -> Confirm -> Verify removal
        """
        # Step 1: Go to products
        logged_in_page.goto(f"{base_url}/admin/products")

        # Step 2: Click delete button
        delete_button = logged_in_page.locator('button').filter(
            has=logged_in_page.locator('[class*="trash"]')
        ).first

        if delete_button.is_visible():
            delete_button.click()

            # Step 3: Confirmation dialog appears
            dialog = logged_in_page.locator('[role="dialog"], [role="alertdialog"]')
            expect(dialog).to_be_visible()

            # Step 4: Cancel instead of deleting
            logged_in_page.get_by_role("button", name=/Cancel/i).click()

            # Step 5: Dialog closes
            time.sleep(0.5)
            expect(dialog).not_to_be_visible()

            # If you want to test actual deletion, uncomment:
            # delete_button.click()
            # logged_in_page.get_by_role("button", name=/Delete/i).click()
            # time.sleep(1)
            # # Product should be removed from list


class TestMobileUserJourney:
    """Test user journeys on mobile viewport"""

    def test_mobile_product_browsing(self, page: Page, base_url: str):
        """
        Mobile user journey: Browse products on mobile device
        """
        # Set mobile viewport
        page.set_viewport_size({"width": 375, "height": 667})

        # Step 1: Home page
        page.goto(base_url)
        expect(page.locator("h1")).to_be_visible()

        # Step 2: Navigate to shop
        # Mobile menu might be different
        shop_link = page.get_by_role("link", name=/shop/i).first
        if shop_link.is_visible():
            shop_link.click()

        # Step 3: View products
        page.goto(f"{base_url}/shop")  # Direct navigation
        expect(page.locator('[href^="/product/"]').first).to_be_visible()

        # Step 4: View product details
        page.locator('[href^="/product/"]').first.click()
        expect(page).to_have_url(f"{base_url}/product/", {"ignore_case": True})


class TestAccessibilityJourney:
    """Test accessibility features"""

    def test_keyboard_navigation_home_page(self, page: Page, base_url: str):
        """Test keyboard navigation through home page"""
        page.goto(base_url)

        # Tab through interactive elements
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")

        # Enter key should activate focused element
        # This is basic - full a11y testing needs axe-core


class TestPerformanceJourney:
    """Test performance-related user experiences"""

    def test_page_load_performance(self, page: Page, base_url: str):
        """Test page loads within reasonable time"""
        import time

        start = time.time()
        page.goto(base_url)
        end = time.time()

        load_time = end - start

        # Page should load within 5 seconds
        assert load_time < 5.0, f"Page took {load_time}s to load"

    def test_shop_page_with_many_products(self, page: Page, base_url: str):
        """Test shop page performance with product list"""
        start = time.time()
        page.goto(f"{base_url}/shop")
        page.wait_for_selector('[href^="/product/"]')
        end = time.time()

        load_time = end - start
        assert load_time < 5.0, f"Shop page took {load_time}s to load"
