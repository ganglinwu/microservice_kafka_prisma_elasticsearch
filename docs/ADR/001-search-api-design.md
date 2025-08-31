# ADR-001: Search API Design for Product Catalog

## Status
Accepted

## Date
2025-08-31

## Context
We need to implement search functionality for the TechHub e-commerce frontend that integrates with our existing catalog_service backend. The search should support text queries, filtering, sorting, and pagination.

## Decision
We will implement a **GET-based search API with query parameters and pagination**.

**API Design:**
- **Method:** GET (follows REST conventions for data retrieval)
- **Endpoint:** `/api/products/search`
- **Parameters:** Query parameters for all search criteria
- **Response:** JSON with results array, pagination metadata, and search metrics

## Rationale

### GET vs POST
**Chose GET because:**
- Follows REST conventions (retrieving data, not modifying)
- Enables browser back/forward navigation (better UX)
- Allows URL bookmarking and sharing
- Supports search engine indexing if needed
- Standard pattern for search APIs

**Rejected POST because:**
- While cleaner for complex filters, it breaks browser navigation
- Users lose search context when using back button
- Not semantically correct for read-only operations

### Query Parameters vs Request Body
**Chose Query Parameters because:**
- Required for GET requests
- Enables URL-based state management
- Better browser integration
- Standard for search APIs (Google, Amazon, etc.)

**Trade-offs accepted:**
- URL length limitations (manageable for typical searches)
- Less elegant than JSON body
- URL encoding required for special characters

### Pagination vs Full Results
**Chose Pagination because:**
- Scalable to large product catalogs (10k+ products)
- Better performance (reduced memory usage)
- Integrates well with planned Elasticsearch implementation
- Standard e-commerce pattern

## Implementation Plan
1. Add search endpoint to catalog_service
2. Implement Elasticsearch integration (future)
3. Update frontend to consume paginated search results
4. Add search state management to React app

## Example API Usage
```
GET /api/products/search?q=laptop&category=electronics&sort=price_asc&page=1&limit=20

Response:
{
  "results": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  },
  "metadata": {
    "query": "laptop",
    "took": "45ms"
  }
}
```

## Consequences
- **Positive:** Standard REST pattern, better UX, scalable
- **Negative:** Query param complexity, URL encoding considerations
- **Risk:** URL length limits for very complex filters (mitigated by reasonable filter options)