# Mobile App API Documentation

This document provides the API endpoints available for the HealthPeDhyan mobile application.

## Base URL

```
Production: https://your-app.vercel.app
Development: http://localhost:3000
```

## Authentication

The API uses NextAuth.js for session-based authentication. All authenticated requests should include the session cookie.

### Authentication Flow

1. **Sign Up**: Create a new user account
2. **Sign In**: Get session cookie
3. **Subsequent Requests**: Include session cookie automatically

---

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

---

### POST /api/auth/signin

Sign in with email and password (handled by NextAuth).

**Endpoint:** `/api/auth/signin`

**Method:** POST via NextAuth client

Use NextAuth client library for mobile:
```typescript
import { signIn } from 'next-auth/react'

await signIn('credentials', {
  email: 'user@example.com',
  password: 'password123',
  redirect: false
})
```

---

### GET /api/auth/session

Get the current user session.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "expires": "2024-12-31T23:59:59.999Z"
}
```

---

### POST /api/auth/signout

Sign out the current user.

**Response:**
```json
{
  "success": true
}
```

---

### POST /api/auth/request-otp

Request OTP for email verification or password reset.

**Request Body:**
```json
{
  "email": "user@example.com",
  "type": "verification" // or "reset"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

---

### POST /api/auth/verify-email

Verify email with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## Product Endpoints

### GET /api/admin/products

Get all products (paginated).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `category` (optional): Filter by category ID
- `brand` (optional): Filter by brand ID

**Response:**
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "brand": "Brand Name",
      "category": "Category",
      "healthScore": 75,
      "nutriscore": "B",
      "imageUrl": "https://...",
      "barcode": "1234567890",
      "ingredients": ["ingredient1", "ingredient2"],
      "nutritionalInfo": {
        "calories": 200,
        "protein": 10,
        "carbs": 30,
        "fat": 5,
        "fiber": 3,
        "sugar": 10,
        "sodium": 200
      },
      "warnings": ["High in sugar"],
      "certifications": ["organic"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### GET /api/admin/products/:id

Get a specific product by ID.

**Response:**
```json
{
  "id": "product_id",
  "name": "Product Name",
  "brand": "Brand Name",
  "category": "Category",
  "healthScore": 75,
  "nutriscore": "B",
  "imageUrl": "https://...",
  "barcode": "1234567890",
  "ingredients": ["ingredient1", "ingredient2"],
  "nutritionalInfo": {
    "calories": 200,
    "protein": 10,
    "carbs": 30,
    "fat": 5,
    "fiber": 3,
    "sugar": 10,
    "sodium": 200
  },
  "warnings": ["High in sugar"],
  "certifications": ["organic"],
  "allergens": ["milk", "nuts"],
  "description": "Product description",
  "servingSize": "100g",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Label Scanning Endpoints

### POST /api/label-scan

Scan and analyze a product label image.

**Request Body (multipart/form-data):**
```
image: [File/Blob]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "scan_id",
    "extractedText": "Raw OCR text...",
    "analysis": {
      "ingredients": ["ingredient1", "ingredient2"],
      "nutritionalInfo": {
        "calories": 200,
        "protein": 10,
        "carbs": 30
      },
      "warnings": ["High in sugar"],
      "healthScore": 65
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET /api/label-scan/:id

Get a previous label scan result.

**Response:**
```json
{
  "id": "scan_id",
  "userId": "user_id",
  "extractedText": "Raw OCR text...",
  "analysis": {
    "ingredients": ["ingredient1", "ingredient2"],
    "nutritionalInfo": {},
    "warnings": [],
    "healthScore": 65
  },
  "imageUrl": "https://...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Profile Endpoints

### GET /api/profile

Get current user profile.

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "emailVerified": true,
  "preferences": {
    "dietaryRestrictions": ["vegetarian"],
    "allergens": ["nuts", "dairy"],
    "healthGoals": ["weight-loss", "low-sugar"]
  },
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PUT /api/profile

Update user profile.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "preferences": {
    "dietaryRestrictions": ["vegan"],
    "allergens": ["nuts"],
    "healthGoals": ["muscle-gain"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "preferences": {...}
  }
}
```

---

## Bookmarks Endpoints

### GET /api/bookmarks

Get user's bookmarked products.

**Response:**
```json
{
  "bookmarks": [
    {
      "id": "bookmark_id",
      "productId": "product_id",
      "product": {
        "id": "product_id",
        "name": "Product Name",
        "imageUrl": "https://...",
        "healthScore": 75
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/bookmarks

Add a product to bookmarks.

**Request Body:**
```json
{
  "productId": "product_id"
}
```

**Response:**
```json
{
  "success": true,
  "bookmark": {
    "id": "bookmark_id",
    "productId": "product_id",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### DELETE /api/bookmarks/:id

Remove a bookmark.

**Response:**
```json
{
  "success": true,
  "message": "Bookmark removed"
}
```

---

## Articles/Blog Endpoints

### GET /api/admin/articles

Get all published articles.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category

**Response:**
```json
{
  "articles": [
    {
      "id": "article_id",
      "title": "Article Title",
      "slug": "article-title",
      "excerpt": "Short description...",
      "coverImage": "https://...",
      "author": {
        "name": "Author Name",
        "avatar": "https://..."
      },
      "category": "nutrition",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "readTime": 5
    }
  ],
  "pagination": {...}
}
```

---

### GET /api/admin/articles/:id

Get a specific article.

**Response:**
```json
{
  "id": "article_id",
  "title": "Article Title",
  "slug": "article-title",
  "content": "Full article content in markdown...",
  "excerpt": "Short description...",
  "coverImage": "https://...",
  "author": {
    "name": "Author Name",
    "avatar": "https://..."
  },
  "category": "nutrition",
  "tags": ["health", "nutrition"],
  "publishedAt": "2024-01-01T00:00:00.000Z",
  "readTime": 5
}
```

---

## Categories Endpoints

### GET /api/admin/categories

Get all product categories.

**Response:**
```json
{
  "categories": [
    {
      "id": "category_id",
      "name": "Beverages",
      "slug": "beverages",
      "description": "All beverage products",
      "productCount": 150
    }
  ]
}
```

---

## Brands Endpoints

### GET /api/admin/brands

Get all brands.

**Response:**
```json
{
  "brands": [
    {
      "id": "brand_id",
      "name": "Brand Name",
      "slug": "brand-name",
      "logo": "https://...",
      "productCount": 50
    }
  ]
}
```

---

## Contact Endpoint

### POST /api/contact

Submit a contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Support Request",
  "message": "I need help with..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

---

## Telemetry Endpoints

### POST /api/telemetry

Log app usage telemetry (analytics).

**Request Body:**
```json
{
  "event": "product_view",
  "data": {
    "productId": "product_id",
    "source": "search"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

---

### GET /api/telemetry/stats

Get telemetry statistics (admin only).

**Response:**
```json
{
  "totalUsers": 1000,
  "totalScans": 5000,
  "totalProducts": 500,
  "recentActivity": [...]
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

---

## Rate Limiting

API requests may be rate-limited. Check response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## Mobile App Integration Example

### React Native Example

```typescript
// api.ts
const API_BASE_URL = 'https://your-app.vercel.app/api'

export const api = {
  async signIn(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    return response.json()
  },

  async getProducts(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/admin/products?page=${page}&limit=${limit}`,
      { credentials: 'include' }
    )
    return response.json()
  },

  async scanLabel(imageFile: File) {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(`${API_BASE_URL}/label-scan`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    return response.json()
  }
}
```

---

## Testing the API

### Using cURL

```bash
# Sign up
curl -X POST https://your-app.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Get products
curl https://your-app.vercel.app/api/admin/products

# Get session
curl https://your-app.vercel.app/api/auth/session \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Using Postman

1. Import the API collection (create one based on this documentation)
2. Set the base URL as an environment variable
3. Use the session token from sign-in for authenticated requests

---

## WebSocket Support (Future)

Real-time features will be added in future versions:

- Live product updates
- Real-time notifications
- Chat support

---

## API Versioning

Current version: `v1` (default)

Future versions will be accessible via:
```
/api/v2/products
```

---

## Support

For API issues or questions:
- Email: support@healthpedhyan.com
- Documentation: https://your-app.vercel.app/docs
- GitHub Issues: https://github.com/yourrepo/issues
