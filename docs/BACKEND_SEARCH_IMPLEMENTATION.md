# Backend Search Implementation Plan

## Overview
Implementation plan for adding search functionality to the catalog_service to support the TechHub frontend search requirements as defined in ADR-001, ADR-002, and ADR-003.

## ✅ COMPLETED: Phase 3 - Elasticsearch Integration (2025-01-09)
**Status:** Production Ready

Successfully implemented ADR-003 Progressive Search Architecture Phase 3:
- ✅ Elasticsearch 8.15.0 integration with Docker Compose
- ✅ Singleton ElasticsearchClient with comprehensive CRUD operations  
- ✅ Smart fallback strategy: Elasticsearch → PostgreSQL
- ✅ Real-time data synchronization on create/update/delete
- ✅ Bulk indexing with intelligent initialization
- ✅ Production-ready error handling and logging
- ✅ Full-text search with custom analyzers and field boosting

**Key Features Implemented:**
- Multi-match queries with fuzzy search support
- PostgreSQL as source of truth with Elasticsearch enhancement
- Graceful degradation when Elasticsearch is unavailable
- Persistent Docker volumes for data retention
- Version compatibility (ES client 8.0.0 ↔ ES server 8.15.0)

## Current State Analysis

### Existing catalog_service Structure
```
catalog_service/
├── src/
│   ├── api/
│   │   └── catalog.routes.ts        # Existing product routes
│   ├── services/
│   │   └── catalog.services.ts      # Business logic
│   ├── repository/
│   │   └── catalog.repository.ts    # Data access layer
│   ├── models/
│   │   └── products.model.ts        # Product domain models
│   └── utils/
│       └── requestValidator.ts      # Input validation
├── prisma/
│   └── schema.prisma               # Database schema
└── tests/
    ├── unit/
    └── integration/
```

### Current API Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Implementation Plan

### Phase 1: Basic Search Endpoint

#### 1.1 Add Search Route
**File:** `src/api/catalog.routes.ts`

```typescript
// Add new search endpoint
router.get('/search', searchProductsHandler);
```

**Implementation Steps:**
1. Import search controller function
2. Add route with query parameter validation middleware
3. Ensure proper error handling and response formatting

#### 1.2 Query Parameter Validation
**File:** `src/utils/requestValidator.ts`

**Create validation schema for search parameters:**
- `q` (string, optional): Search query
- `category` (string[], optional): Category filters  
- `minPrice`, `maxPrice` (number, optional): Price range
- `sort` (enum, optional): Sort field validation
- `order` (enum, optional): Sort direction validation
- `page`, `limit` (number, optional): Pagination validation

**Validation Rules:**
- Sanitize search query (prevent injection)
- Validate price range logic (min ≤ max)
- Enforce pagination limits (max 100 items)
- Case-insensitive category matching

#### 1.3 Search Controller
**File:** `src/api/catalog.routes.ts` (handler function)

**Responsibilities:**
1. Parse and validate query parameters
2. Call service layer with validated parameters
3. Format response according to API specification
4. Handle errors and return appropriate HTTP status codes

### Phase 2: Service Layer Implementation

#### 2.1 Search Service
**File:** `src/services/catalog.services.ts`

**New Methods:**
```typescript
interface SearchFilters {
  query?: string;
  categories?: string[];
  priceRange?: { min?: number; max?: number };
  sort?: { field: string; order: 'asc' | 'desc' };
}

interface SearchParams extends SearchFilters {
  page: number;
  limit: number;
}

interface SearchResult {
  products: Product[];
  pagination: PaginationInfo;
  metadata: SearchMetadata;
}

async function searchProducts(params: SearchParams): Promise<SearchResult>
```

**Service Implementation:**
1. Validate business logic rules
2. Call repository layer with transformed parameters
3. Calculate pagination metadata
4. Add performance timing metadata
5. Handle service-level errors

#### 2.2 Repository Layer Updates
**File:** `src/repository/catalog.repository.ts`

**Database Query Implementation:**
1. **Text Search:** Use PostgreSQL full-text search on title + description
2. **Category Filter:** JOIN with category table, case-insensitive matching
3. **Price Filter:** WHERE clause for price range
4. **Sorting:** ORDER BY with dynamic field and direction
5. **Pagination:** LIMIT and OFFSET for results

**Prisma Query Example:**
```typescript
const products = await prisma.product.findMany({
  where: {
    AND: [
      // Text search
      query ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      } : {},
      // Category filter
      categories.length > 0 ? {
        category: {
          name: { in: categories, mode: 'insensitive' }
        }
      } : {},
      // Price range
      priceRange.min ? { price: { gte: priceRange.min } } : {},
      priceRange.max ? { price: { lte: priceRange.max } } : {}
    ]
  },
  include: {
    category: true
  },
  orderBy: {
    [sort.field]: sort.order
  },
  skip: (page - 1) * limit,
  take: limit
});

// Get total count for pagination
const totalCount = await prisma.product.count({ where: /* same conditions */ });
```

### Phase 3: Response Formatting

#### 3.1 API Response Structure
**Implementation in controller:**

```typescript
interface SearchResponse {
  results: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata: {
    query?: string;
    filters: {
      categories?: string[];
      priceRange?: { min?: number; max?: number };
    };
    sort: { field: string; order: string };
    took: string; // Query execution time
  };
}
```

#### 3.2 Error Response Standardization
**Handle different error types:**
- 400 Bad Request: Invalid parameters (minPrice > maxPrice)
- 500 Internal Server Error: Database connection issues
- 422 Unprocessable Entity: Invalid sort field

### Phase 4: Testing Implementation

#### 4.1 Unit Tests
**File:** `src/tests/unit/catalog.service.search.test.ts`

**Test Cases:**
- Parameter validation and sanitization
- Search logic with various filter combinations
- Pagination calculations
- Error handling for invalid inputs
- Performance timing metadata

#### 4.2 Integration Tests  
**File:** `src/tests/integration/catalog.search.api.test.ts`

**Test Scenarios:**
- Full API endpoint testing with real database
- Search query accuracy (text matching)
- Category filtering (case insensitive)
- Price range filtering (boundary conditions)
- Sorting functionality (all supported fields)
- Pagination behavior (edge cases)
- Error response formats

### Phase 5: Performance Optimization

#### 5.1 Database Indexing
**Update Prisma schema:**
```prisma
model Product {
  @@index([title])
  @@index([description])  
  @@index([price])
  @@index([categoryId])
  // Composite indexes for common queries
  @@index([categoryId, price])
}
```

#### 5.2 Query Optimization
- Analyze slow queries with Prisma query insights
- Add appropriate database indexes
- Consider query result caching for popular searches
- Optimize JOIN operations

### Phase 6: Future Elasticsearch Integration

#### 6.1 Preparation Steps
1. Keep search logic abstracted in service layer
2. Create search interface that can be implemented by different providers
3. Add configuration for search provider selection

#### 6.2 Migration Strategy
```typescript
interface SearchProvider {
  search(params: SearchParams): Promise<SearchResult>;
}

class PostgresSearchProvider implements SearchProvider {
  // Current implementation
}

class ElasticsearchProvider implements SearchProvider {
  // Future implementation
}
```

## Implementation Timeline

### Week 1: Core Implementation
- [ ] Add basic search endpoint with parameter validation
- [ ] Implement PostgreSQL-based search in repository layer
- [ ] Add service layer with business logic
- [ ] Create proper response formatting

### Week 2: Testing & Refinement  
- [ ] Write comprehensive unit tests
- [ ] Add integration tests with test database
- [ ] Performance testing and optimization
- [ ] Error handling improvements

### Week 3: Integration & Documentation
- [ ] Frontend integration testing
- [ ] API documentation updates
- [ ] Performance monitoring setup
- [ ] Code review and refinements

## Risk Mitigation

### Performance Risks
- **Risk:** Slow queries on large datasets
- **Mitigation:** Database indexing, pagination limits, query monitoring

### Data Consistency Risks
- **Risk:** Case sensitivity in category matching
- **Mitigation:** Standardize case handling in validation layer

### API Compatibility Risks
- **Risk:** Breaking changes to existing endpoints
- **Mitigation:** New endpoint, no modifications to existing routes

## Success Criteria

1. **Functional Requirements Met:**
   - All ADR-002 parameters supported
   - Accurate search results matching user queries
   - Proper pagination with metadata

2. **Performance Requirements:**
   - Search queries complete within 100ms for typical datasets
   - Support for 1000+ products without performance degradation

3. **Quality Requirements:**
   - 90%+ test coverage for search functionality
   - No breaking changes to existing API
   - Comprehensive error handling

## Dependencies

### Required
- Existing Prisma setup and database connection
- Current product model and database schema
- Express.js routing infrastructure

### Optional (Future)
- Redis for caching popular search results
- Elasticsearch for advanced search capabilities
- Query performance monitoring tools

This implementation plan provides a structured approach to adding search functionality while maintaining code quality and system reliability.