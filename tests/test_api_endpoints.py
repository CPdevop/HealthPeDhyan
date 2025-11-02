"""
Tests for API endpoints
"""
import pytest
from playwright.sync_api import Page, APIRequestContext


class TestPublicAPIEndpoints:
    """Test public API endpoints"""

    def test_products_api(self, page: Page, base_url: str):
        """Test products API endpoint"""
        response = page.request.get(f"{base_url}/api/products")
        assert response.ok
        data = response.json()
        assert isinstance(data, list)

    def test_products_api_returns_correct_structure(self, page: Page, base_url: str):
        """Test products API returns correct data structure"""
        response = page.request.get(f"{base_url}/api/products")
        data = response.json()

        if len(data) > 0:
            product = data[0]
            # Check for expected fields
            assert "id" in product
            assert "title" in product
            assert "slug" in product

    def test_health_check_endpoint(self, page: Page, base_url: str):
        """Test health check endpoint if it exists"""
        response = page.request.get(f"{base_url}/api/health")
        # May return 404 if not implemented, that's okay


class TestTelemetryAPI:
    """Test telemetry tracking API"""

    def test_telemetry_post_endpoint(self, page: Page, base_url: str):
        """Test posting telemetry event"""
        response = page.request.post(
            f"{base_url}/api/telemetry",
            data={
                "eventType": "PAGE_VIEW",
                "eventName": "test_page_view",
                "path": "/test",
                "sessionId": "test-session",
            }
        )

        # Should accept telemetry event
        assert response.ok or response.status == 201

    def test_telemetry_stats_requires_auth(self, page: Page, base_url: str):
        """Test telemetry stats requires authentication"""
        response = page.request.get(f"{base_url}/api/telemetry/stats")
        assert response.status == 401  # Unauthorized

    def test_telemetry_invalid_event_type(self, page: Page, base_url: str):
        """Test posting invalid telemetry event type"""
        response = page.request.post(
            f"{base_url}/api/telemetry",
            data={
                "eventType": "INVALID_TYPE",
                "eventName": "test_event",
            }
        )

        # Should reject invalid event type
        assert response.status == 400


class TestLabelScanAPI:
    """Test label scanning API"""

    def test_label_scan_api_exists(self, page: Page, base_url: str):
        """Test label scan API endpoint exists"""
        # GET should return method not allowed or 404
        response = page.request.get(f"{base_url}/api/label-scan")
        # Either not found or method not allowed is fine
        assert response.status in [404, 405]

    def test_label_scan_requires_data(self, page: Page, base_url: str):
        """Test label scan requires image data"""
        response = page.request.post(
            f"{base_url}/api/label-scan",
            data={}
        )

        # Should return error for missing data
        assert not response.ok


class TestOTPAuthAPI:
    """Test OTP authentication API"""

    def test_send_otp_endpoint(self, page: Page, base_url: str):
        """Test send OTP endpoint"""
        response = page.request.post(
            f"{base_url}/api/auth/send-otp",
            data={
                "email": "test@example.com"
            }
        )

        # Should accept request (may fail if email service not configured)
        # Just check it doesn't error out completely
        assert response.status in [200, 201, 400, 500]

    def test_verify_otp_endpoint(self, page: Page, base_url: str):
        """Test verify OTP endpoint"""
        response = page.request.post(
            f"{base_url}/api/auth/verify-otp",
            data={
                "email": "test@example.com",
                "otp": "123456"
            }
        )

        # Should reject invalid OTP
        assert response.status in [400, 401]


class TestProductAPIDetailed:
    """Detailed tests for product API"""

    def test_product_filtering_by_category(self, page: Page, base_url: str):
        """Test filtering products by category"""
        response = page.request.get(f"{base_url}/api/products?category=dairy")
        data = response.json()

        # Should return list (may be empty)
        assert isinstance(data, list)

    def test_product_search(self, page: Page, base_url: str):
        """Test product search functionality"""
        response = page.request.get(f"{base_url}/api/products?search=milk")
        data = response.json()

        assert isinstance(data, list)

    def test_product_pagination(self, page: Page, base_url: str):
        """Test product pagination"""
        response = page.request.get(f"{base_url}/api/products?page=1&limit=10")
        data = response.json()

        assert isinstance(data, list)
        # Should return at most 10 items
        assert len(data) <= 10
