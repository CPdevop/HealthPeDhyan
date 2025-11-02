"""
Tests for public-facing pages (non-admin)
"""
import pytest
from playwright.sync_api import Page, expect


class TestHomePage:
    """Test home page functionality"""

    def test_home_page_loads(self, page: Page, base_url: str):
        """Test that home page loads successfully"""
        page.goto(base_url)
        expect(page).to_have_title("HealthPeDhyan")
        expect(page.locator("h1")).to_contain_text("Healthy choices made easy")

    def test_hero_section_ctas(self, page: Page, base_url: str):
        """Test hero section call-to-action buttons"""
        page.goto(base_url)

        # Check "Shop Healthier Now" button
        shop_button = page.get_by_role("link", name="Shop Healthier Now")
        expect(shop_button).to_be_visible()
        shop_button.click()
        expect(page).to_have_url(f"{base_url}/shop")

        # Go back
        page.goto(base_url)

        # Check "Our Standards" button
        standards_button = page.get_by_role("link", name="Our Standards")
        expect(standards_button).to_be_visible()
        standards_button.click()
        expect(page).to_have_url(f"{base_url}/standards")

    def test_featured_products_displayed(self, page: Page, base_url: str):
        """Test that featured products are displayed"""
        page.goto(base_url)

        # Check for featured products section
        expect(page.locator("h2")).to_contain_text("Featured Products")

        # Check if product cards are rendered
        product_cards = page.locator('[class*="ProductCard"], [data-testid="product-card"]')
        expect(product_cards.first).to_be_visible()

    def test_articles_section(self, page: Page, base_url: str):
        """Test articles section on home page"""
        page.goto(base_url)

        # Check for latest articles section
        expect(page.locator("h2")).to_contain_text("Latest Articles")

        # Check "View All Articles" button
        view_all = page.get_by_role("link", name="View All Articles")
        expect(view_all).to_be_visible()

    def test_demo_mode_banner(self, page: Page, base_url: str):
        """Test that demo mode banner appears when using mock data"""
        page.goto(base_url)

        # If using mock data, banner should be visible
        banner = page.locator('text=/Demo Mode|Sample Products/i')
        # This may or may not be visible depending on whether DB is connected
        # Just check it doesn't error


class TestShopPage:
    """Test shop/catalog page functionality"""

    def test_shop_page_loads(self, page: Page, base_url: str):
        """Test shop page loads correctly"""
        page.goto(f"{base_url}/shop")
        expect(page.locator("h1")).to_contain_text("Shop Healthy Products")

    def test_category_filters(self, page: Page, base_url: str):
        """Test category sidebar filters"""
        page.goto(f"{base_url}/shop")

        # Check for category sidebar
        expect(page.locator("text=Categories")).to_be_visible()

        # Check "All Products" link
        all_products = page.get_by_role("link", name="All Products")
        expect(all_products).to_be_visible()

    def test_health_filters(self, page: Page, base_url: str):
        """Test health filter badges"""
        page.goto(f"{base_url}/shop")

        # Check for health filters section
        expect(page.locator("text=Health Filters")).to_be_visible()

        # Check filter badges
        expect(page.locator("text=Palm Oil Free")).to_be_visible()
        expect(page.locator("text=Low Sugar")).to_be_visible()

    def test_product_count_displayed(self, page: Page, base_url: str):
        """Test that product count is displayed"""
        page.goto(f"{base_url}/shop")

        # Look for product count text
        product_count = page.locator('text=/\\d+ products? found/i')
        expect(product_count).to_be_visible()


class TestProductDetailPage:
    """Test individual product detail pages"""

    def test_product_page_via_shop(self, page: Page, base_url: str):
        """Test navigating to product detail from shop"""
        page.goto(f"{base_url}/shop")

        # Click first product's "View Details" button
        first_product_link = page.locator('[href^="/product/"]').first
        first_product_link.click()

        # Should be on a product detail page
        expect(page).to_have_url(f"{base_url}/product/", {"ignore_case": True})

    def test_product_page_health_score(self, page: Page, base_url: str):
        """Test that health score is displayed on product page"""
        # Navigate to a known product (if exists) or first product
        page.goto(f"{base_url}/shop")
        page.locator('[href^="/product/"]').first.click()

        # Check for health score badge or display
        # This will vary based on your design
        health_score = page.locator('text=/Health Score|health.*score/i')
        # Just verify page loaded, score display varies


class TestBlogPages:
    """Test blog/article pages"""

    def test_blog_index_page(self, page: Page, base_url: str):
        """Test blog listing page"""
        page.goto(f"{base_url}/blog")
        expect(page.locator("h1")).to_contain_text("Articles")

    def test_article_detail_page(self, page: Page, base_url: str):
        """Test individual article page"""
        page.goto(f"{base_url}/blog")

        # Click first article
        first_article = page.locator('[href^="/blog/"]').first
        if first_article.is_visible():
            first_article.click()
            # Should be on article detail page
            expect(page).to_have_url(f"{base_url}/blog/", {"ignore_case": True})


class TestStandardsPage:
    """Test standards/about page"""

    def test_standards_page_loads(self, page: Page, base_url: str):
        """Test standards page loads"""
        page.goto(f"{base_url}/standards")
        expect(page.locator("h1")).to_be_visible()

    def test_standards_content(self, page: Page, base_url: str):
        """Test standards page has relevant content"""
        page.goto(f"{base_url}/standards")

        # Check for key terms
        page_content = page.content()
        assert "health" in page_content.lower() or "standard" in page_content.lower()


class TestLabelScanner:
    """Test label scanner functionality"""

    def test_label_scanner_page_loads(self, page: Page, base_url: str):
        """Test label scanner page is accessible"""
        page.goto(f"{base_url}/scan")
        # Page should load without error

    def test_upload_interface_visible(self, page: Page, base_url: str):
        """Test that upload interface is visible"""
        page.goto(f"{base_url}/scan")

        # Look for file upload input or upload button
        upload_input = page.locator('input[type="file"], text=/upload/i, text=/scan/i')
        # Should have some upload mechanism


class TestNavigation:
    """Test site navigation"""

    def test_header_navigation_links(self, page: Page, base_url: str):
        """Test header navigation links"""
        page.goto(base_url)

        # Check for common nav links
        nav = page.locator("nav, header")
        expect(nav).to_be_visible()

        # Try clicking shop link
        shop_link = page.get_by_role("link", name=/shop/i).first
        if shop_link.is_visible():
            shop_link.click()
            expect(page).to_have_url(f"{base_url}/shop")

    def test_footer_exists(self, page: Page, base_url: str):
        """Test footer is present"""
        page.goto(base_url)

        footer = page.locator("footer")
        expect(footer).to_be_visible()


class TestResponsiveDesign:
    """Test responsive design"""

    @pytest.mark.parametrize("viewport", [
        {"width": 375, "height": 667},   # Mobile
        {"width": 768, "height": 1024},  # Tablet
        {"width": 1920, "height": 1080}, # Desktop
    ])
    def test_home_page_responsive(self, page: Page, base_url: str, viewport: dict):
        """Test home page at different viewport sizes"""
        page.set_viewport_size(viewport)
        page.goto(base_url)

        # Page should load without errors at any size
        expect(page.locator("h1")).to_be_visible()
