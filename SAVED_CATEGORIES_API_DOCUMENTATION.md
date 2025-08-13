# Saved Categories API Documentation

## Overview
The Saved Categories feature allows admins to create curated collections of subcategories that are then exposed via a mobile API. This enables dynamic content management for mobile apps.

## Admin APIs

### Base URL: `/api/v1/admin/saved-categories`
**Authentication Required:** Bearer token (Admin role)

### 1. Get All Saved Categories
**GET** `/api/v1/admin/saved-categories`

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `search` (string) - Search term for title

**Response:**
```json
{
  "status": true,
  "message": "Saved categories retrieved successfully",
  "data": {
    "savedCategories": [
      {
        "_id": "string",
        "title": "string",
        "description": "string",
        "subcategories": [
          {
            "_id": "string",
            "title": "string",
            "slug": "string",
            "category": {
              "_id": "string",
              "title": "string",
              "slug": "string"
            },
            "images": [
              {
                "url": "string",
                "alt": "string",
                "language": "english|hindi"
              }
            ]
          }
        ],
        "isActive": true,
        "sortOrder": 0,
        "createdBy": {
          "_id": "string",
          "name": "string",
          "email": "string"
        },
        "createdAt": "2025-08-06T05:24:48.562Z",
        "updatedAt": "2025-08-06T05:24:48.562Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get Subcategories for Selection
**GET** `/api/v1/admin/saved-categories/subcategories`

**Query Parameters:**
- `category` (string) - Filter by category ID
- `search` (string) - Search term

**Response:**
```json
{
  "status": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "subcategories": [
      {
        "_id": "string",
        "title": "string",
        "slug": "string",
        "category": {
          "_id": "string",
          "title": "string",
          "slug": "string"
        },
        "images": [
          {
            "url": "string",
            "alt": "string",
            "language": "english|hindi"
          }
        ]
      }
    ]
  }
}
```

### 3. Get Saved Category by ID
**GET** `/api/v1/admin/saved-categories/{id}`

**Response:** Same structure as single item from Get All API

### 4. Create Saved Category
**POST** `/api/v1/admin/saved-categories`

**Request Body:**
```json
{
  "title": "string", // Required
  "description": "string", // Optional
  "subcategories": ["subcategory_id_1", "subcategory_id_2"], // Required, at least 1
  "sortOrder": 0 // Optional, default: 0
}
```

**Response:**
```json
{
  "status": true,
  "message": "Saved category created successfully",
  "data": {
    "savedCategory": {
      // Full saved category object with populated subcategories
    }
  }
}
```

### 5. Update Saved Category
**PUT** `/api/v1/admin/saved-categories/{id}`

**Request Body:**
```json
{
  "title": "string", // Optional
  "description": "string", // Optional
  "subcategories": ["subcategory_id_1"], // Optional
  "sortOrder": 1, // Optional
  "isActive": true // Optional
}
```

### 6. Delete Saved Category
**DELETE** `/api/v1/admin/saved-categories/{id}`

**Response:**
```json
{
  "status": true,
  "message": "Saved category deleted successfully",
  "data": {}
}
```

---

## Mobile/User APIs

### Base URL: `/api/v1/users/saved-categories`
**Authentication:** Not required

### 1. Get Saved Categories (Mobile)
**GET** `/api/v1/users/saved-categories`

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `search` (string) - Search term for title

**Response:**
```json
{
  "status": true,
  "message": "Saved categories retrieved successfully",
  "data": {
    "savedCategories": [
      {
        "_id": "6892e7200c7cf00c488b547e",
        "title": "Featured Collection",
        "description": "A curated collection of popular subcategories",
        "subcategories": [
          {
            "_id": "688fca57d548898c047397a5",
            "title": "Krishna",
            "slug": "krishna",
            "category": {
              "_id": "6887c6919ea7adc8279bf00e",
              "title": "Suvichar",
              "slug": "Suvichar"
            },
            "images": [
              {
                "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1754253907110_k1.png",
                "alt": "k1",
                "language": "english"
              }
            ],
            "sortOrder": 1
          }
        ],
        "sortOrder": 1,
        "createdAt": "2025-08-06T05:24:48.562Z"
      }
    ],
    "totalSavedCategories": 1,
    "limit": 10,
    "page": 1,
    "totalPages": 1,
    "serialNumberStartFrom": 1,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null
  }
}
```

**Pagination Structure:**
- `totalSavedCategories`: Total number of saved categories
- `limit`: Items per page
- `page`: Current page number
- `totalPages`: Total number of pages
- `serialNumberStartFrom`: Starting serial number for current page
- `hasPrevPage`: Boolean indicating if previous page exists
- `hasNextPage`: Boolean indicating if next page exists
- `prevPage`: Previous page number (null if none)
- `nextPage`: Next page number (null if none)

### 2. Get Saved Category by ID (Mobile)
**GET** `/api/v1/users/saved-categories/{id}`

**Response:** Same structure as single item from Get All API

### 3. Get Trending Saved Categories
**GET** `/api/v1/users/saved-categories/trending`

**Query Parameters:**
- `limit` (integer, default: 5) - Number of trending items

**Response:**
```json
{
  "status": true,
  "message": "Trending saved categories retrieved successfully",
  "data": {
    "trendingSavedCategories": [
      {
        // Same structure as regular saved categories
      }
    ],
    "total": 1
  }
}
```

---

## Features

### Admin Panel UI
- **Modern Interface:** Clean, Material-UI based design with cards and chips
- **Multi-selection:** Advanced autocomplete for selecting multiple subcategories
- **Filtering:** Filter subcategories by category during selection
- **Search & Pagination:** Full search and pagination support
- **Real-time Validation:** Form validation with user feedback
- **Status Management:** Toggle active/inactive status
- **Sort Order:** Configurable display order

### Data Filtering
- **Active Only:** Mobile API only returns active saved categories
- **Valid Subcategories:** Automatically filters out deleted/suspended subcategories
- **Populated Data:** Full subcategory and category information included

### Security
- **Admin Authentication:** All admin endpoints require valid admin token
- **Data Validation:** Server-side validation for all inputs
- **Error Handling:** Comprehensive error messages and status codes

---

## Example Usage

### Creating a Saved Category (Admin)
```bash
curl -X POST "http://localhost:4000/api/v1/admin/saved-categories" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend Specials",
    "description": "Popular content for weekends",
    "subcategories": ["subcategory_id_1", "subcategory_id_2"],
    "sortOrder": 5
  }'
```

### Fetching for Mobile App
```bash
curl "http://localhost:4000/api/v1/users/saved-categories?page=1&limit=5"
```

### Getting Trending Collections
```bash
curl "http://localhost:4000/api/v1/users/saved-categories/trending?limit=3"
```

---

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | Bad Request | Invalid input data or missing required fields |
| 401 | Unauthorized | Invalid or missing admin token |
| 404 | Not Found | Saved category or subcategory not found |
| 500 | Server Error | Internal server error |

---

## Notes

1. **Data Consistency:** The mobile API automatically filters out invalid subcategories to ensure data consistency
2. **Performance:** Pagination and indexing ensure good performance even with large datasets
3. **Flexibility:** Admins can create any combination of subcategories across different categories
4. **Real-time Updates:** Changes in admin panel are immediately reflected in mobile API
5. **Multi-language Support:** Supports both English and Hindi content in subcategories