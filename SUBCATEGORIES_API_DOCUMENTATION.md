# Subcategories API Documentation

## Overview
The Subcategories API provides comprehensive access to subcategory data with enhanced pagination, filtering, and search capabilities for mobile applications.

## Base Endpoint
```
/api/v1/users/subcategories
```

## Authentication
- **No authentication required** (Public API)
- Suitable for mobile apps and public consumption

## Available Endpoints

### 1. Get All Subcategories
```
GET /api/v1/users/subcategories
```

### 2. Search Subcategories
```
GET /api/v1/users/subcategories/search
```

### 3. Get Trending Subcategories
```
GET /api/v1/users/subcategories/trending
```

### 4. Get Subcategories by Category
```
GET /api/v1/users/subcategories/by-category/{categoryId}
```

### 5. Get Single Subcategory
```
GET /api/v1/users/subcategories/{id}
```

## Query Parameters

### Main Subcategories Endpoint (`/`)

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `category` | string | - | No | Filter by single main category ID |
| `categories` | string | - | No | Filter by multiple main category IDs (comma-separated) |
| `page` | integer | 1 | No | Page number for pagination |
| `limit` | integer | 20 | No | Number of items per page (1-100) |

### Search Endpoint (`/search`)

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `q` | string | - | **Yes** | Search query (minimum 2 characters) |
| `category` | string | - | No | Filter by single main category ID |
| `categories` | string | - | No | Filter by multiple main category IDs (comma-separated) |
| `limit` | integer | 10 | No | Number of results to return |

### Trending Endpoint (`/trending`)

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `category` | string | - | No | Filter by single main category ID |
| `categories` | string | - | No | Filter by multiple main category IDs (comma-separated) |
| `limit` | integer | 20 | No | Number of trending items to return |
| `language` | string | 'all' | No | Filter by image language: `english`, `hindi`, `all` |

## Example Requests

### 1. Get All Subcategories with Pagination
```bash
GET /api/v1/users/subcategories?page=1&limit=10
```

### 2. Filter by Single Category
```bash
GET /api/v1/users/subcategories?category=6887c6919ea7adc8279bf00e&page=2&limit=5
```

### 3. Filter by Multiple Categories
```bash
GET /api/v1/users/subcategories?categories=6887c6919ea7adc8279bf00e,6887c6b49ea7adc8279bf01d&page=1&limit=10
```

### 4. Search with Category Filter
```bash
GET /api/v1/users/subcategories/search?q=banner&category=6887c6919ea7adc8279bf00e&limit=5
```

### 5. Get Trending by Language
```bash
GET /api/v1/users/subcategories/trending?language=hindi&limit=15
```

## Response Structure

### Success Response (200 OK)

```json
{
  "status": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "data": [
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
          },
          {
            "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1754253907700_k2.jpeg",
            "alt": "k2",
            "language": "english"
          }
        ],
        "sortOrder": 1,
        "createdAt": "2025-08-03T20:45:11.763Z",
        "updatedAt": "2025-08-03T20:45:11.763Z"
      }
    ],
    "totalSubCategory": 25,
    "limit": 10,
    "page": 1,
    "totalPages": 3,
    "serialNumberStartFrom": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

### Enhanced Pagination Fields

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of subcategory objects |
| `totalSubCategory` | number | Total count of all subcategories matching the filter |
| `limit` | number | Number of items per page |
| `page` | number | Current page number |
| `totalPages` | number | Total number of pages |
| `serialNumberStartFrom` | number | Starting serial number for current page items |
| `hasPrevPage` | boolean | Whether there is a previous page |
| `hasNextPage` | boolean | Whether there is a next page |
| `prevPage` | number/null | Previous page number (null if no previous page) |
| `nextPage` | number/null | Next page number (null if no next page) |

### Subcategory Object Structure

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique subcategory ID |
| `title` | string | Subcategory title |
| `slug` | string | URL-friendly slug |
| `category` | object | Parent category information |
| `images` | array | Array of image objects |
| `sortOrder` | number | Display order preference |
| `createdAt` | string | ISO creation timestamp |
| `updatedAt` | string | ISO last update timestamp |

### Image Object Structure

| Field | Type | Description |
|-------|------|-------------|
| `url` | string | S3 image URL |
| `alt` | string | Alt text for accessibility |
| `language` | string | Image language (`english`, `hindi`) |

### Category Object Structure

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Category ID |
| `title` | string | Category title |
| `slug` | string | Category slug |

## Error Responses

### 400 Bad Request (Search)
```json
{
  "status": false,
  "message": "Search query must be at least 2 characters long",
  "data": {}
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Subcategory not found or inactive",
  "data": {}
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "message": "Failed to fetch subcategories",
  "data": {
    "error": "Database connection failed"
  }
}
```

## Pagination Examples

### Page 1 (First Page)
```json
{
  "totalSubCategory": 25,
  "limit": 10,
  "page": 1,
  "totalPages": 3,
  "serialNumberStartFrom": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

### Page 2 (Middle Page)
```json
{
  "totalSubCategory": 25,
  "limit": 10,
  "page": 2,
  "totalPages": 3,
  "serialNumberStartFrom": 11,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevPage": 1,
  "nextPage": 3
}
```

### Page 3 (Last Page)
```json
{
  "totalSubCategory": 25,
  "limit": 10,
  "page": 3,
  "totalPages": 3,
  "serialNumberStartFrom": 21,
  "hasPrevPage": true,
  "hasNextPage": false,
  "prevPage": 2,
  "nextPage": null
}
```

## Mobile App Integration

### Android (Kotlin) Example
```kotlin
data class SubcategoryResponse(
    val status: Boolean,
    val message: String,
    val data: SubcategoryData
)

data class SubcategoryData(
    val data: List<Subcategory>,
    val totalSubCategory: Int,
    val limit: Int,
    val page: Int,
    val totalPages: Int,
    val serialNumberStartFrom: Int,
    val hasPrevPage: Boolean,
    val hasNextPage: Boolean,
    val prevPage: Int?,
    val nextPage: Int?
)

data class Subcategory(
    val _id: String,
    val title: String,
    val slug: String,
    val category: Category,
    val images: List<Image>,
    val sortOrder: Int,
    val createdAt: String,
    val updatedAt: String
)

// Usage
class SubcategoryRepository {
    suspend fun getSubcategories(
        category: String? = null,
        categories: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): SubcategoryResponse {
        val url = buildString {
            append("$baseUrl/users/subcategories")
            append("?page=$page&limit=$limit")
            category?.let { append("&category=$it") }
            categories?.let { append("&categories=$it") }
        }
        return apiService.get(url)
    }
}
```

### iOS (Swift) Example
```swift
struct SubcategoryResponse: Codable {
    let status: Bool
    let message: String
    let data: SubcategoryData
}

struct SubcategoryData: Codable {
    let data: [Subcategory]
    let totalSubCategory: Int
    let limit: Int
    let page: Int
    let totalPages: Int
    let serialNumberStartFrom: Int
    let hasPrevPage: Bool
    let hasNextPage: Bool
    let prevPage: Int?
    let nextPage: Int?
}

// Usage
class SubcategoryService {
    func getSubcategories(
        category: String? = nil,
        categories: String? = nil,
        page: Int = 1,
        limit: Int = 20,
        completion: @escaping (Result<SubcategoryResponse, Error>) -> Void
    ) {
        var components = URLComponents(string: "\(baseURL)/users/subcategories")!
        components.queryItems = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        
        if let category = category {
            components.queryItems?.append(URLQueryItem(name: "category", value: category))
        }
        
        if let categories = categories {
            components.queryItems?.append(URLQueryItem(name: "categories", value: categories))
        }
        
        // Make request...
    }
}
```

## Best Practices

### 1. Pagination Strategy
- Use reasonable page sizes (10-50 items per page)
- Implement infinite scrolling for better UX
- Cache previous pages for faster navigation

### 2. Category Filtering
- Use single `category` for simple filters
- Use `categories` for multi-select scenarios
- Combine with pagination for large datasets

### 3. Performance Optimization
- Cache responses for 5-10 minutes
- Use appropriate limits based on network conditions
- Prefetch next page for smoother scrolling

### 4. Error Handling
- Handle network errors gracefully
- Show appropriate loading states
- Provide retry mechanisms

## Rate Limiting
- No rate limiting currently applied
- Recommended for production: 100 requests per minute per IP

## Version History
- **v1.0** (Jan 2024): Basic subcategories API
- **v1.1** (Jan 2024): Added multiple categories support
- **v1.2** (Jan 2024): Enhanced pagination structure
- **v1.3** (Jan 2024): Added trending and search endpoints