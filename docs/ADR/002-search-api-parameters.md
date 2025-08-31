# ADR-002: Search API Query Parameters Design

## Status
Accepted

## Date
2025-08-31

## Context
Following ADR-001's decision to use GET with query parameters, we need to define the exact parameter structure, validation rules, and default behaviors for the product search API.

## Decision
We will implement the following parameter schema with validation and defaults:

## Parameter Specification

### Core Search
- **`q`** (string, optional): Main search query
  - Searches across product title and description
  - Uses Elasticsearch for intelligent matching

### Filtering
- **`category`** (string, repeatable, optional): Filter by category name
  - Case-insensitive matching for better UX
  - Multiple categories: `category=electronics&category=clothing`
  - Matches against category.name field

- **`minPrice`** (number, optional): Minimum price filter
- **`maxPrice`** (number, optional): Maximum price filter

### Sorting
- **`sort`** (string, optional): Sort field
  - Allowed values: `id`, `price`, `name`, `createdAt`
  - Default: `id` (product ID ascending order)

- **`order`** (string, optional): Sort direction
  - Allowed values: `asc`, `desc`
  - Default: `asc`

### Pagination
- **`page`** (number, optional): Page number (1-based)
  - Default: `1`
  - Minimum: `1`

- **`limit`** (number, optional): Results per page
  - Default: `30`
  - Minimum: `1`
  - Maximum: `100` (prevent abuse)

## Validation Rules

### Price Range Validation
- `minPrice` must be ≥ 0
- `maxPrice` must be ≥ 0
- `minPrice` must be ≤ `maxPrice`
- Return 400 Bad Request if `minPrice` > `maxPrice`

### Parameter Validation
- `page` must be positive integer
- `limit` must be positive integer ≤ 100
- `sort` must be one of allowed values
- `order` must be `asc` or `desc`
- Invalid parameters return 400 Bad Request with descriptive error

### Category Handling
- Case-insensitive matching (`Electronics` matches `electronics`)
- Non-existent categories are silently ignored (allows for flexible category changes)
- Empty category parameters are ignored

## Example Requests

### Basic search
```
GET /api/products/search?q=laptop
```

### Complex filtering
```
GET /api/products/search?q=gaming&category=electronics&minPrice=500&maxPrice=2000&sort=price&order=desc&page=2&limit=20
```

### Multiple categories
```
GET /api/products/search?category=electronics&category=clothing&sort=name
```

## Response Schema
```json
{
  "results": [
    {
      "id": 1,
      "title": "Gaming Laptop",
      "description": "High performance laptop",
      "price": 1299.99,
      "images": ["url1", "url2"],
      "category": {
        "id": 2,
        "name": "electronics"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "metadata": {
    "query": "gaming",
    "filters": {
      "categories": ["electronics"],
      "priceRange": { "min": 500, "max": 2000 }
    },
    "sort": { "field": "price", "order": "desc" },
    "took": "45ms"
  }
}
```

## Implementation Considerations

### Backend (catalog_service)
- Implement parameter parsing and validation middleware
- Use Elasticsearch for text search on `title` and `description` fields
- Implement case-insensitive category matching
- Add query performance monitoring

### Frontend Integration  
- Build search form with separate inputs for each parameter
- Handle URL state management for back/forward navigation
- Implement debounced search for real-time queries
- Add pagination controls

## Rationale

### Default Values
- **30 results default:** Balance between performance and user experience
- **ID ascending default:** Predictable, stable sort order when no preference specified
- **Page-based pagination:** Familiar pattern for e-commerce users

### Multiple Categories
- **Repeatable parameters:** More RESTful than comma-separated values
- **OR logic:** User searches for products in electronics OR clothing (more intuitive)

### Case Insensitivity
- **Better UX:** Users shouldn't need to know exact category casing
- **Flexible:** Allows category name changes without breaking existing URLs

## Consequences
- **Positive:** Clear, predictable API with good defaults
- **Positive:** Flexible filtering that grows with product catalog
- **Positive:** URL-based state enables bookmarking and sharing
- **Negative:** Complex parameter validation required
- **Risk:** Performance considerations with large result sets (mitigated by pagination and limits)