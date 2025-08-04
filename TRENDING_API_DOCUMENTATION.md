# Trending Subcategories API Documentation

## Overview
The Trending API provides trending subcategories (Add Banners) for mobile applications with intelligent filtering and sorting based on content richness, recency, and popularity.

## Endpoint
```
GET /api/v1/users/subcategories/trending
```

## Authentication
- **No authentication required** (Public API)
- Suitable for mobile apps and public consumption

## Query Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `category` | string | - | No | Filter by single main category ID |
| `categories` | string | - | No | Filter by multiple main category IDs (comma-separated) |
| `limit` | integer | 20 | No | Number of trending items to return (1-100) |
| `language` | string | 'all' | No | Filter by image language: `english`, `hindi`, `all` |

## Trending Algorithm

The API uses a sophisticated algorithm to calculate trending scores based on:

- **Image Count** (3x weight): Items with more images rank higher
- **Recency** (30-day decay): Newer content gets priority
- **Sort Order** (-0.1x weight): Lower sort order values rank higher

**Formula:**
```
trendingScore = (languageImages × 3) + (30 ÷ (daysSinceCreated + 1)) + (sortOrder × -0.1)
```

## Example Requests

### 1. Get All Trending Subcategories
```bash
GET /api/v1/users/subcategories/trending
```

### 2. Get Trending by Category
```bash
GET /api/v1/users/subcategories/trending?category=60f1b2a3c4d5e6f7g8h9i0j1
```

### 3. Get Hindi Language Trending
```bash
GET /api/v1/users/subcategories/trending?language=hindi&limit=10
```

### 4. Get Category-Specific English Trending
```bash
GET /api/v1/users/subcategories/trending?category=60f1b2a3c4d5e6f7g8h9i0j1&language=english&limit=15
```

### 5. Get Multiple Categories Trending
```bash
GET /api/v1/users/subcategories/trending?categories=60f1b2a3c4d5e6f7g8h9i0j1,60f1b2a3c4d5e6f7g8h9i0j2&limit=10
```

### 6. Get Multiple Categories with Language Filter
```bash
GET /api/v1/users/subcategories/trending?categories=60f1b2a3c4d5e6f7g8h9i0j1,60f1b2a3c4d5e6f7g8h9i0j2&language=hindi&limit=15
```

## Example Response

### Success Response (200 OK)
```json
{
  "status": true,
  "message": "Trending subcategories retrieved successfully",
  "data": {
    "trending": [
      {
        "_id": "60f1b2a3c4d5e6f7g8h9i0j1",
        "title": "Festival Banners",
        "slug": "festival-banners",
        "images": [
          {
            "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1640995200000_festival1.jpg",
            "alt": "Diwali Festival Banner",
            "language": "hindi"
          },
          {
            "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1640995201000_festival2.jpg",
            "alt": "Christmas Festival Banner",
            "language": "english"
          },
          {
            "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1640995202000_festival3.jpg",
            "alt": "New Year Banner",
            "language": "english"
          }
        ],
        "sortOrder": 1,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:22:30.000Z",
        "category": {
          "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
          "title": "Celebrations",
          "slug": "celebrations"
        },
        "trendingScore": 15.2,
        "imageCount": 3
      },
      {
        "_id": "60f1b2a3c4d5e6f7g8h9i0j2",
        "title": "Business Cards",
        "slug": "business-cards",
        "images": [
          {
            "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1640995203000_business1.jpg",
            "alt": "Professional Business Card",
            "language": "english"
          },
          {
            "url": "https://s3.ap-south-1.amazonaws.com/staging.work/subcategories/1640995204000_business2.jpg",
            "alt": "Creative Business Card",
            "language": "english"
          }
        ],
        "sortOrder": 2,
        "createdAt": "2024-01-10T08:15:00.000Z",
        "updatedAt": "2024-01-18T16:45:20.000Z",
        "category": {
          "_id": "60a1b2c3d4e5f6g7h8i9j0k2",
          "title": "Business",
          "slug": "business"
        },
        "trendingScore": 12.8,
        "imageCount": 2
      }
    ],
    "total": 25,
    "filters": {
      "category": ["60a1b2c3d4e5f6g7h8i9j0k1", "60a1b2c3d4e5f6g7h8i9j0k2"],
      "language": "all",
      "limit": 20
    },
    "algorithm": {
      "description": "Trending score based on image count, recency, and sort order",
      "weights": {
        "imageCount": "3x multiplier",
        "recency": "30 days decay",
        "sortOrder": "0.1x negative weight"
      }
    }
  }
}
```

### Error Response (500 Internal Server Error)
```json
{
  "status": false,
  "message": "Failed to fetch trending subcategories",
  "data": {
    "error": "Database connection failed"
  }
}
```

### Empty Response (200 OK)
```json
{
  "status": true,
  "message": "Trending subcategories retrieved successfully",
  "data": {
    "trending": [],
    "total": 0,
    "filters": {
      "category": "60f1b2a3c4d5e6f7g8h9i0j1",
      "language": "hindi",
      "limit": 20
    },
    "algorithm": {
      "description": "Trending score based on image count, recency, and sort order",
      "weights": {
        "imageCount": "3x multiplier",
        "recency": "30 days decay",
        "sortOrder": "0.1x negative weight"
      }
    }
  }
}
```

## Response Fields

### Main Response Object
| Field | Type | Description |
|-------|------|-------------|
| `status` | boolean | Request success status |
| `message` | string | Response message |
| `data` | object | Response data container |

### Data Object
| Field | Type | Description |
|-------|------|-------------|
| `trending` | array | Array of trending subcategory objects |
| `total` | number | Total count of available trending items |
| `filters` | object | Applied filter parameters |
| `algorithm` | object | Algorithm description and weights |

### Trending Item Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique subcategory ID |
| `title` | string | Subcategory title |
| `slug` | string | URL-friendly slug |
| `images` | array | Array of image objects |
| `sortOrder` | number | Display order preference |
| `createdAt` | string | ISO creation timestamp |
| `updatedAt` | string | ISO last update timestamp |
| `category` | object | Parent category information |
| `trendingScore` | number | Calculated trending score |
| `imageCount` | number | Total number of images |

### Image Object
| Field | Type | Description |
|-------|------|-------------|
| `url` | string | S3 image URL |
| `alt` | string | Alt text for accessibility |
| `language` | string | Image language (`english`, `hindi`) |

### Category Object
| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Category ID |
| `title` | string | Category title |
| `slug` | string | Category slug |

## Mobile App Integration

### Android (Kotlin) Example
```kotlin
// API call example
class ApiService {
    private val baseUrl = "https://your-api-domain.com/api/v1"
    
    suspend fun getTrendingSubcategories(
        category: String? = null,
        language: String = "all",
        limit: Int = 20
    ): TrendingResponse {
        val url = buildString {
            append("$baseUrl/users/subcategories/trending")
            append("?limit=$limit&language=$language")
            category?.let { append("&category=$it") }
        }
        
        return httpClient.get(url)
    }
}

// Data classes
data class TrendingResponse(
    val status: Boolean,
    val message: String,
    val data: TrendingData
)

data class TrendingData(
    val trending: List<TrendingItem>,
    val total: Int,
    val filters: FilterInfo
)
```

### iOS (Swift) Example
```swift
// API service
class APIService {
    private let baseURL = "https://your-api-domain.com/api/v1"
    
    func getTrendingSubcategories(
        category: String? = nil,
        language: String = "all",
        limit: Int = 20,
        completion: @escaping (Result<TrendingResponse, Error>) -> Void
    ) {
        var components = URLComponents(string: "\(baseURL)/users/subcategories/trending")!
        components.queryItems = [
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "language", value: language)
        ]
        
        if let category = category {
            components.queryItems?.append(URLQueryItem(name: "category", value: category))
        }
        
        // Make request...
    }
}

// Models
struct TrendingResponse: Codable {
    let status: Bool
    let message: String
    let data: TrendingData
}
```

## Rate Limiting
- No rate limiting currently applied
- Recommended for production: 100 requests per minute per IP

## Caching
- **Recommended**: Cache responses for 5-10 minutes
- **Cache Key**: Include category, language, and limit parameters
- **Invalidation**: Clear cache when new content is added

## Performance Notes
- Typical response time: 50-200ms
- Response size: ~2-10KB depending on image count
- Optimized for mobile bandwidth

## Use Cases
1. **Mobile App Home Screen**: Show trending content
2. **Category Browse**: Filter trending by category
3. **Language Preference**: Show relevant language content
4. **Content Discovery**: Help users find popular items
5. **Analytics**: Track trending patterns

## Version History
- **v1.0** (Jan 2024): Initial trending API release
- **v1.1** (Jan 2024): Added language filtering
- **v1.2** (Jan 2024): Enhanced algorithm weights