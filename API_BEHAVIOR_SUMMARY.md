# API Behavior Summary

## Subcategories API: Two Distinct Modes

The `/api/v1/users/subcategories` endpoint now operates in two distinct modes based on whether category parameters are provided:

---

## 🎯 **Specific Category Mode**
### When: `category` or `categories` parameter is provided
### Behavior: Returns subcategories from the specified category ONLY
### Personalization: **NONE** - ignores user interests completely

### Examples:
```bash
# Single category
GET /api/v1/users/subcategories?category=6887c6919ea7adc8279bf00e&page=1

# Multiple categories  
GET /api/v1/users/subcategories?categories=id1,id2,id3&page=1
```

### Response:
```json
{
  "data": {
    "data": [...], // Only subcategories from specified category
    "totalSubCategory": 2,
    "personalization": {
      "isPersonalized": false,
      "filterType": "specific_single_category"
    }
  }
}
```

---

## 🧠 **Personalized Mode**
### When: NO category parameters provided OR empty category provided
### Behavior: Applies intelligent personalization based on user authentication and interests

### 1. **User with Interests** (Authenticated + has interests)
```bash
GET /api/v1/users/subcategories?category=&page=1
# Headers: Authorization: Bearer <token>
```
**Result**: Subcategories from user's interest categories only

### 2. **User without Interests** (Authenticated + no interests)
```bash
GET /api/v1/users/subcategories?category=&page=1
# Headers: Authorization: Bearer <token>
```
**Result**: Trending/popular subcategories (fallback)

### 3. **Not Authenticated** (No token)
```bash
GET /api/v1/users/subcategories?category=&page=1
```
**Result**: Trending/popular subcategories (fallback)

### Response Examples:
```json
// Personalized (has interests)
{
  "data": {
    "personalization": {
      "isPersonalized": true,
      "filterType": "user_interests",
      "interestCategories": ["cat1", "cat2"]
    }
  }
}

// Fallback (no interests/not authenticated)
{
  "data": {
    "personalization": {
      "isPersonalized": false,
      "filterType": "trending_fallback",
      "fallbackReason": "not_authenticated"
    }
  }
}
```

---

## 🔄 **Key Differences from Before**

| Scenario | OLD Behavior | NEW Behavior |
|----------|--------------|--------------|
| `?category=123` | ✅ Category filter + personalization override | ✅ Category filter ONLY (no personalization) |
| No category + auth + interests | ❌ All subcategories | ✅ User's interest categories only |
| No category + no auth | ❌ All subcategories | ✅ Trending subcategories |

---

## 📱 **Mobile App Usage**

### Home Screen (Personalized Feed)
```javascript
// No category - gets personalized content
const response = await fetch('/api/v1/users/subcategories', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Category Browse (Specific Content)
```javascript
// With category - gets specific category content
const response = await fetch(`/api/v1/users/subcategories?category=${categoryId}`);
```

---

## ✅ **Live Test Results**

```bash
# Specific category - no personalization
curl "localhost:4000/api/v1/users/subcategories?category=6887c6919ea7adc8279bf00e&limit=1"
# Response: "filterType": "specific_single_category", "totalSubCategory": 2

# No category - personalization mode  
curl "localhost:4000/api/v1/users/subcategories?limit=1"
# Response: "filterType": "trending_fallback", "fallbackReason": "not_authenticated"
```

---

## 🎯 **Summary**

- **Category specified** → Get that category's content (simple, predictable)
- **No category specified** → Get personalized content (smart, adaptive)
- **Always works** → Graceful fallbacks ensure no broken experiences
- **Backward compatible** → Existing category-specific calls work unchanged