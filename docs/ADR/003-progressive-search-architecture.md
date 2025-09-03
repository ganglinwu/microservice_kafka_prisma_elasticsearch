# ADR-003: Progressive Search Architecture for E-commerce Microservices

## Status
**✅ COMPLETED** - Phase 3 Implemented Successfully (2025-01-09)

### Implementation Status
- **Phase 1**: ✅ PostgreSQL Full-Text Search Foundation (Completed)
- **Phase 2**: ✅ Redis Caching Layer (Completed)  
- **Phase 3**: ✅ Elasticsearch Advanced Search (Completed)

### Production Deployment
The progressive search architecture has been successfully implemented and is production-ready with:
- Elasticsearch 8.15.0 integration with fallback to PostgreSQL
- Singleton client pattern with comprehensive error handling
- Real-time data synchronization across all layers
- Performance monitoring and structured logging
- Docker Compose orchestration with persistent volumes

## Context
The TechHub e-commerce system currently has basic CRUD operations for products but lacks search functionality. With the recent refactoring from 'name' to 'title' field for consistency, we need to implement a comprehensive search solution that starts simple and evolves to handle enterprise-level requirements.

Current system architecture:
- **Backend**: catalog_service with PostgreSQL database, Prisma ORM
- **Frontend**: React with Zustand state management
- **Product model**: id (UUID), title, description, price, stock
- **Existing ADRs**: 001 (Search API Design), 002 (Search API Parameters)

The search solution must be progressive, starting with PostgreSQL text search and evolving to Elasticsearch for advanced features while maintaining backwards compatibility.

## Decision
We will implement a **three-phase progressive search architecture** that evolves from simple PostgreSQL text search to enterprise-grade Elasticsearch, with Redis caching for performance optimization.

### Phase 1: PostgreSQL Full-Text Search Foundation
- Implement PostgreSQL native text search capabilities
- Add search indexes for title and description fields
- Create basic search endpoint following ADR-001/002 specifications
- Frontend integration with Zustand store

### Phase 2: Redis Caching Layer
- Add Redis for query result caching
- Implement cache invalidation strategies
- Performance monitoring and metrics

### Phase 3: Elasticsearch Advanced Search
- Elasticsearch integration for sophisticated search
- Advanced features: fuzzy matching, relevance scoring, facets
- Maintain PostgreSQL as primary data store

## Consequences

### Benefits
- **Progressive complexity**: Start simple, add features incrementally
- **Risk mitigation**: Each phase is fully functional independently
- **Performance scalability**: Redis caching handles increased load
- **Advanced search capabilities**: Elasticsearch enables enterprise features
- **Backwards compatibility**: Each phase builds upon the previous

### Tradeoffs
- **Infrastructure complexity**: Multiple systems to maintain (PostgreSQL + Redis + Elasticsearch)
- **Data synchronization**: Keeping Elasticsearch in sync with PostgreSQL
- **Development time**: Three phases require more planning and coordination
- **Operational overhead**: Monitoring multiple search backends

## Implementation Phases

### Phase 1: PostgreSQL Text Search (Weeks 1-2)

#### Database Schema Updates
**File**: `/catalog_service/prisma/schema.prisma`
```sql
model Product {
  id          String @id @db.Uuid
  title       String
  description String
  price       Float
  stock       Int
  
  @@map("products")
  // Add full-text search index
  @@index([title, description], type: Gin)
}
```

#### Repository Layer Enhancement
**File**: `/catalog_service/src/repository/catalog.repository.ts`
- Add `searchProducts(query, filters, pagination)` method
- Implement PostgreSQL `tsvector` and `tsquery` for full-text search
- Support basic filtering (price range) and sorting

#### Service Layer Integration
**File**: `/catalog_service/src/services/catalog.services.ts`
- Add `searchProducts()` method with business logic validation
- Implement query sanitization and result formatting
- Add performance logging for search operations

#### API Layer Implementation
**File**: `/catalog_service/src/api/catalog.routes.ts`
- Add `GET /products/search` endpoint
- Parameter validation middleware following ADR-002 specifications
- Error handling with appropriate HTTP status codes

#### Frontend Store Integration
**File**: `/frontend/techub-store/src/stores/searchStore.ts` (new)
- Zustand store for search state management
- Actions: `searchProducts`, `setQuery`, `setFilters`, `setPagination`
- State: `results`, `loading`, `error`, `pagination`, `filters`

#### Tests Required
- **Unit Tests**:
  - `catalog.repository.test.ts`: `searchProducts()` method
  - `catalog.service.test.ts`: search business logic validation
  - `catalog.routes.test.ts`: search endpoint parameter validation
- **Integration Tests**:
  - `catalog.api.test.ts`: end-to-end search functionality
  - Search with various query combinations and edge cases
- **Frontend Tests**:
  - `searchStore.test.ts`: Zustand store actions and state management

### Phase 2: Redis Caching Layer (Weeks 3-4)

#### Redis Integration
**File**: `/catalog_service/src/cache/redis.client.ts` (new)
- Redis client configuration and connection management
- Cache key generation strategy: `search:{hash(query+filters+pagination)}`
- TTL configuration: 5 minutes for search results

#### Cache Service Implementation
**File**: `/catalog_service/src/services/cache.service.ts` (new)
- `getCachedSearchResults(cacheKey)` method
- `setCachedSearchResults(cacheKey, results, ttl)` method
- Cache invalidation on product updates/deletions

#### Enhanced Repository Layer
**File**: `/catalog_service/src/repository/catalog.repository.ts`
- Integrate cache-aside pattern in `searchProducts()` method
- Cache miss: query database, store in Redis
- Cache hit: return cached results with performance metrics

#### Configuration Management
**File**: `/catalog_service/src/config/redis.config.ts` (new)
- Environment-based Redis configuration
- Connection pooling and retry logic
- Development/production environment handling

#### Tests Required
- **Unit Tests**:
  - `cache.service.test.ts`: caching logic and TTL behavior
  - `redis.client.test.ts`: connection and error handling
- **Integration Tests**:
  - Cache hit/miss scenarios in search workflow
  - Cache invalidation on product modifications
- **Performance Tests**:
  - Load testing with and without Redis caching
  - Cache hit ratio monitoring

### Phase 3: Elasticsearch Integration (Weeks 5-7)

#### Elasticsearch Setup
**File**: `/catalog_service/src/search/elasticsearch.client.ts` (new)
- Elasticsearch client configuration and index mapping
- Product index schema with analyzers for title/description
- Bulk indexing for existing products

#### Search Service Abstraction
**File**: `/catalog_service/src/services/search.service.ts` (new)
- Abstract search interface supporting both PostgreSQL and Elasticsearch
- Feature detection: use Elasticsearch when available, fallback to PostgreSQL
- Advanced search features: fuzzy matching, relevance scoring, aggregations

#### Data Synchronization
**File**: `/catalog_service/src/sync/elasticsearch.sync.ts` (new)
- Product event listeners for real-time synchronization
- Batch synchronization for initial data load
- Conflict resolution and error handling

#### Enhanced Search Capabilities
**File**: `/catalog_service/src/repository/catalog.repository.ts`
- Elasticsearch query builders for complex search scenarios
- Support for advanced filters, sorting, and faceted search
- Performance monitoring and query optimization

#### Configuration and Deployment
**File**: `/catalog_service/docker-compose.elasticsearch.yml` (new)
- Elasticsearch container configuration for development
- Index templates and mapping configurations
- Memory and performance tuning

#### Tests Required
- **Unit Tests**:
  - `elasticsearch.client.test.ts`: query building and error handling
  - `search.service.test.ts`: abstraction layer functionality
- **Integration Tests**:
  - End-to-end search with Elasticsearch backend
  - Data synchronization accuracy and performance
  - Fallback behavior when Elasticsearch is unavailable
- **Performance Tests**:
  - Search latency comparison: PostgreSQL vs Elasticsearch
  - Large dataset performance (10k+ products)
  - Concurrent search load testing

## Technical Implementation Details

### Error Handling Strategy
Following existing catalog_service patterns:
- Service layer: throw descriptive errors with context
- API layer: catch and transform to appropriate HTTP status codes
- Logging: structured logging with search query context and performance metrics

### Security Considerations
- Input validation and query sanitization to prevent injection attacks
- Rate limiting for search endpoints to prevent abuse
- Search query logging for audit and optimization purposes

### Performance Monitoring
- Search query performance metrics (latency, throughput)
- Cache hit/miss ratios and Redis performance
- Elasticsearch cluster health and query performance
- Database query performance and index utilization

### Database Migration Strategy
```sql
-- Phase 1 Migration
CREATE INDEX CONCURRENTLY idx_products_search 
ON products USING gin(to_tsvector('english', title || ' ' || description));

-- Performance optimization
CREATE INDEX CONCURRENTLY idx_products_price ON products(price);
```

### API Response Schema Evolution
Phase 1-3 maintain consistent response format from ADR-002:
```json
{
  "results": [...],
  "pagination": { "page": 1, "limit": 30, "total": 156, "totalPages": 6 },
  "metadata": { 
    "query": "search term", 
    "took": "45ms",
    "source": "postgresql|elasticsearch",
    "cacheHit": true
  }
}
```

## Rollback Strategies

### Phase 1 Rollback
- Remove search endpoint and revert to original GET /products
- Drop full-text search indexes if performance issues occur

### Phase 2 Rollback
- Disable Redis caching, direct database queries
- Remove cache service integration

### Phase 3 Rollback
- Fallback to PostgreSQL search backend
- Maintain Elasticsearch for read-only operations until issues resolved

## Success Metrics

### Phase 1 Success Criteria
- Search endpoint responds < 500ms for 95% of queries
- Supports 100+ concurrent search requests
- All ADR-002 parameters implemented and tested

### Phase 2 Success Criteria
- 80%+ cache hit ratio for repeated searches
- 50%+ reduction in database load for search operations
- Cache invalidation < 5 seconds after product updates

### Phase 3 Success Criteria
- Advanced search features: fuzzy matching, relevance scoring
- Search response time < 100ms for 95% of queries
- Support for 1000+ concurrent users with <2% error rate

## Dependencies and Risks

### Dependencies
- PostgreSQL 14+ for full-text search capabilities
- Redis 6+ for advanced caching features
- Elasticsearch 8+ for enterprise search functionality
- Node.js 18+ for async/await and modern JavaScript features

### Risks and Mitigations
- **Data consistency risk**: Elasticsearch sync lag
  - *Mitigation*: Eventual consistency model with PostgreSQL as source of truth
- **Infrastructure complexity**: Multiple search backends
  - *Mitigation*: Gradual rollout with comprehensive monitoring
- **Performance degradation**: Elasticsearch resource usage
  - *Mitigation*: Resource monitoring and query optimization
- **Search downtime**: Elasticsearch cluster failures
  - *Mitigation*: Automatic fallback to PostgreSQL search