# Personalized Subcategories API Documentation

## Overview
The Personalized Subcategories API provides intelligent content recommendation based on user interests, with fallback to trending/popular content for non-authenticated users or users without interests.

## Base Endpoint
```
GET /api/v1/users/subcategories
```

## Authentication
- **Optional Authentication** - Works for both authenticated and non-authenticated users
- **Header**: `Authorization: Bearer <jwt_token>` (optional)
- **Behavior**:
  - **With valid token + interests**: Returns personalized subcategories
  - **With valid token + no interests**: Returns trending subcategories
  - **No token or invalid token**: Returns trending subcategories

## API Modes

The API operates in two distinct modes based on the presence of category parameters:

### **Specific Category Mode** (category/categories provided)
- **Behavior**: Returns subcategories from the specified category only
- **No personalization applied** - ignores user interests
- **Use case**: When user browses a specific category
- **Response**: `"filterType": "specific_single_category"` or `"specific_multiple_categories"`

### **Personalized Mode** (no category specified)
When no category is specified, the API applies intelligent personalization:

#### 1. **User Has Interests** (Personalized Response)
- Filters subcategories by user's selected interest categories
- Returns content matching user preferences
- Response includes `"isPersonalized": true`

#### 2. **User Has No Interests** (Trending Fallback)
- Returns trending/popular subcategories based on:
  - Image count (2x weight)
  - Recency (7-day decay)
  - Sort order (-0.1x weight)
- Response includes `"fallbackReason": "no_interests"`

#### 3. **Not Authenticated** (Trending Fallback)
- Same trending algorithm as above
- Response includes `"fallbackReason": "not_authenticated"`

## Query Parameters

| Parameter | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `category` | string | - | No | **Specific Category Mode**: Get subcategories from this category only |
| `categories` | string | - | No | **Specific Category Mode**: Get subcategories from these categories (comma-separated) |
| `page` | integer | 1 | No | Page number for pagination |
| `limit` | integer | 20 | No | Number of items per page (1-100) |

## Example Requests

### **Personalized Mode** (No category specified OR empty category)

#### 1. **Personalized Request (Authenticated User with Interests)**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "http://localhost:4000/api/v1/users/subcategories?category=&limit=10"
```
**Result**: Returns subcategories from user's interest categories

#### 2. **Trending Fallback (No Authentication)**
```bash
curl "http://localhost:4000/api/v1/users/subcategories?category=&limit=10"
```
**Result**: Returns trending/popular subcategories

#### 3. **Alternative Format (No category parameter)**
```bash
curl "http://localhost:4000/api/v1/users/subcategories?limit=10"
```
**Result**: Same as empty category - returns trending/popular subcategories

### **Specific Category Mode** (Category specified)

#### 4. **Single Category Browse**
```bash
curl "http://localhost:4000/api/v1/users/subcategories?category=6887c6919ea7adc8279bf00e&page=1&limit=5"
```
**Result**: Returns subcategories from "Suvichar" category only (no personalization)

#### 5. **Multiple Categories Browse**
```bash
curl "http://localhost:4000/api/v1/users/subcategories?categories=id1,id2,id3&limit=5"
```
**Result**: Returns subcategories from specified categories only (no personalization)

## Response Structure

### Personalized Response (User with Interests)
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
            "url": "https://s3.amazonaws.com/bucket/image.jpg",
            "alt": "Krishna image",
            "language": "english"
          }
        ],
        "sortOrder": 1,
        "createdAt": "2025-08-03T20:45:11.763Z",
        "updatedAt": "2025-08-03T20:45:11.763Z"
      }
    ],
    "totalSubCategory": 15,
    "limit": 10,
    "page": 1,
    "totalPages": 2,
    "serialNumberStartFrom": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2,
    "personalization": {
      "isPersonalized": true,
      "filterType": "user_interests",
      "interestCategories": [
        "6887c6919ea7adc8279bf00e",
        "6887c6b49ea7adc8279bf01d"
      ]
    }
  }
}
```

### Trending Fallback Response (No Authentication)
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
        "images": [...],
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
    "nextPage": 2,
    "personalization": {
      "isPersonalized": false,
      "filterType": "trending_fallback",
      "fallbackReason": "not_authenticated"
    }
  }
}
```

### Specific Category Response
```json
{
  "status": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "data": [...],
    "totalSubCategory": 2,
    "limit": 10,
    "page": 1,
    "totalPages": 1,
    "serialNumberStartFrom": 1,
    "hasPrevPage": false,
    "hasNextPage": false,
    "prevPage": null,
    "nextPage": null,
    "personalization": {
      "isPersonalized": false,
      "fallbackType": "default",
      "filterType": "specific_single_category"
    }
  }
}
```

## Personalization Fields

### Personalization Object
| Field | Type | Description |
|-------|------|-------------|
| `isPersonalized` | boolean | Whether results are personalized for the user |
| `filterType` | string | Type of filtering applied |
| `interestCategories` | array | User's interest category IDs (only if personalized) |
| `fallbackReason` | string | Why fallback was used (if not personalized) |
| `fallbackType` | string | Type of fallback used |

### Filter Types
- `"user_interests"` - Personalized based on user interests (Personalized Mode)
- `"trending_fallback"` - Trending algorithm used as fallback (Personalized Mode)
- `"specific_single_category"` - Single category requested (Specific Category Mode)
- `"specific_multiple_categories"` - Multiple categories requested (Specific Category Mode)

### Fallback Reasons
- `"not_authenticated"` - No authentication token provided
- `"no_interests"` - User authenticated but has no interests selected

## Mobile App Integration

### Android (Kotlin) Example
```kotlin
data class PersonalizedSubcategoriesRequest(
    val page: Int = 1,
    val limit: Int = 20,
    val category: String? = null,
    val categories: String? = null
)

data class PersonalizationInfo(
    val isPersonalized: Boolean,
    val filterType: String,
    val interestCategories: List<String>? = null,
    val fallbackReason: String? = null
)

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
    val nextPage: Int?,
    val personalization: PersonalizationInfo
)

class SubcategoryRepository {
    suspend fun getPersonalizedSubcategories(
        token: String? = null,
        request: PersonalizedSubcategoriesRequest
    ): SubcategoryResponse {
        val headers = mutableMapOf<String, String>()
        token?.let { headers["Authorization"] = "Bearer $it" }
        
        val url = buildUrl(request)
        return apiService.get(url, headers)
    }
    
    private fun buildUrl(request: PersonalizedSubcategoriesRequest): String {
        return buildString {
            append("$baseUrl/users/subcategories")
            append("?page=${request.page}&limit=${request.limit}")
            request.category?.let { append("&category=$it") }
            request.categories?.let { append("&categories=$it") }
        }
    }
}
```

### iOS (Swift) Example
```swift
struct PersonalizationInfo: Codable {
    let isPersonalized: Bool
    let filterType: String
    let interestCategories: [String]?
    let fallbackReason: String?
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
    let personalization: PersonalizationInfo
}

struct SubcategoryResponse: Codable {
    let status: Bool
    let message: String
    let data: SubcategoryData
}

class SubcategoryService {
    func getPersonalizedSubcategories(
        token: String? = nil,
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
        
        var request = URLRequest(url: components.url!)
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        // Make request...
    }
}
```

## Use Cases

### 1. **Home Screen Feed**
```javascript
// Show personalized content for logged-in users - using empty category
const response = await getSubcategories(userToken, { category: '', limit: 20 });
if (response.data.personalization.isPersonalized) {
    showPersonalizedFeed(response.data.data);
} else {
    showTrendingFeed(response.data.data);
}
```

### 2. **Category Browse**
```javascript
// Override personalization with specific category
const response = await getSubcategories(userToken, { 
    category: selectedCategoryId,
    limit: 15 
});
// Always shows content from selected category
```

### 3. **Interest-Based Recommendations**
```javascript
// Check if user has interests for recommendation setup
const response = await getSubcategories(userToken, { limit: 5 });
if (!response.data.personalization.isPersonalized && userToken) {
    showInterestSelectionPrompt();
}
```

### 4. **Offline-First Architecture**
```javascript
// Cache personalized and trending content separately
const personalizedResponse = await getSubcategories(userToken);
const trendingResponse = await getSubcategories(); // No token

cachePersonalizedContent(personalizedResponse.data.data);
cacheTrendingContent(trendingResponse.data.data);
```

## Performance Considerations

### 1. **Caching Strategy**
- **Personalized content**: Cache for 10-15 minutes
- **Trending content**: Cache for 30-60 minutes
- **Category-filtered content**: Cache for 60 minutes

### 2. **Database Optimization**
- Interests are indexed for fast lookups
- Trending algorithm uses efficient aggregation pipeline
- Category filters use indexed queries

### 3. **Response Times**
- **Personalized queries**: 100-300ms
- **Trending queries**: 150-400ms
- **Category-filtered queries**: 50-200ms

## Error Handling

### Invalid Token
- API continues without authentication
- Returns trending results
- No error thrown

### Database Errors
```json
{
  "status": false,
  "message": "Failed to fetch subcategories",
  "data": {
    "error": "Database connection failed"
  }
}
```

### Empty Results
```json
{
  "status": true,
  "message": "Subcategories retrieved successfully",
  "data": {
    "data": [],
    "totalSubCategory": 0,
    "personalization": {
      "isPersonalized": true,
      "filterType": "user_interests",
      "interestCategories": ["6887c6919ea7adc8279bf00e"]
    }
  }
}
```

## Testing Scenarios

### 1. **Test Without Authentication (No Category)**
```bash
curl "http://localhost:4000/api/v1/users/subcategories?limit=3"
# Expected: trending_fallback, not_authenticated
```

### 2. **Test Without Authentication (Empty Category)**
```bash
curl "http://localhost:4000/api/v1/users/subcategories?category=&limit=3"
# Expected: trending_fallback, not_authenticated (same as above)
```

### 3. **Test With Invalid Token**
```bash
curl -H "Authorization: Bearer invalid_token" \
     "http://localhost:4000/api/v1/users/subcategories?category=&limit=3"
# Expected: trending_fallback, not_authenticated (token ignored)
```

### 4. **Test Specific Category**
```bash
curl -H "Authorization: Bearer valid_token" \
     "http://localhost:4000/api/v1/users/subcategories?category=123&limit=3"
# Expected: specific_single_category (no personalization)
```

## Version History
- **v1.0** (Jan 2024): Basic subcategories API
- **v1.1** (Jan 2024): Added multiple categories support
- **v1.2** (Jan 2024): Enhanced pagination structure
- **v1.3** (Jan 2024): Added trending and search endpoints
- **v2.0** (Jan 2024): Added personalization based on user interests
- **v2.1** (Jan 2024): **Added empty category support for personalized mode**