# Order Service Integration Testing Plan

## Overview
This plan outlines how to implement comprehensive integration tests for the Order Service, focusing on cart and order workflows with real database operations using Vitest and Drizzle ORM.

## Current Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (port 5433) with Drizzle ORM
- **Test Runner**: Vitest
- **Routes**: `/cart` and `/order`
- **Key Features**: Cart management, Order creation, Domain-driven design

## 1. Test Environment Setup

### Database Configuration
Create a separate test database:
```bash
# Add to docker-compose.yml or create test database
createdb order_service_test -p 5433
```

### Environment Variables
Create `.env.test`:
```env
APP_PORT=3002
DATABASE_URL="postgresql://order_db:order_db_password@localhost:5433/order_service_test?schema=public"
NODE_ENV=test
LOG_LEVEL=error
```

### Test Configuration Strategy

Instead of modifying a single config file, create separate configurations for different test types:

#### Test Directory Structure
```
tests/
├── unit/                    # Fast unit tests
├── integration/            # Database integration tests  
├── e2e/                    # End-to-end workflow tests
├── utils/                  # Test utilities and helpers
├── setup.integration.ts    # Integration test setup
├── setup.e2e.ts           # E2E test setup
└── INTEGRATION_TESTING_PLAN.md
```

#### Unit Tests Configuration
Keep existing `vitest.config.ts` for unit tests:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    testTimeout: 5000,
  },
});
```

#### Integration Tests Configuration  
Create `vitest.integration.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['./tests/setup.integration.ts'],
    testTimeout: 10000,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true // Sequential execution for database operations
      }
    }
  },
});
```

#### E2E Tests Configuration
Create `vitest.e2e.config.ts`:
```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/e2e/**/*.test.ts'],
    setupFiles: ['./tests/setup.e2e.ts'],
    testTimeout: 30000, // Longer timeout for full workflows
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
});
```

#### Package.json Scripts
Update your package.json with convenient test commands:
```json
{
  "scripts": {
    "test": "vitest",                                           // Unit tests (default)
    "test:unit": "vitest",                                      // Explicit unit tests
    "test:integration": "vitest --config vitest.integration.config.ts",  // Integration tests
    "test:e2e": "vitest --config vitest.e2e.config.ts",       // End-to-end tests
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:watch": "vitest --watch",                            // Unit tests in watch mode
    "test:integration:watch": "vitest --config vitest.integration.config.ts --watch"
  }
}
```

## 2. Test Infrastructure

### Database Management Utilities
Create `tests/utils/database.ts`:
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { cartTable, cartItemsTable, ordersTable, orderItemsTable } from '../../src/db/schema.js';

export class TestDatabase {
  private pool: Pool;
  private db: any;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    this.db = drizzle(this.pool);
  }

  async setup() {
    // Run migrations
    await migrate(this.db, { migrationsFolder: './drizzle' });
  }

  async cleanup() {
    // Clean all tables in correct order (foreign keys)
    await this.db.delete(cartItemsTable);
    await this.db.delete(cartTable);
    await this.db.delete(orderItemsTable);
    await this.db.delete(ordersTable);
  }

  async teardown() {
    await this.pool.end();
  }

  getDatabase() {
    return this.db;
  }
}
```

### Test Setup Files

#### Integration Test Setup
Create `tests/setup.integration.ts`:
```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { TestDatabase } from './utils/database.js';

const testDb = new TestDatabase();

beforeAll(async () => {
  await testDb.setup();
});

beforeEach(async () => {
  await testDb.cleanup();
});

afterAll(async () => {
  await testDb.teardown();
});

// Make test database available globally
global.testDb = testDb;
```

#### E2E Test Setup  
Create `tests/setup.e2e.ts`:
```typescript
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { TestDatabase } from './utils/database.js';

const testDb = new TestDatabase();

beforeAll(async () => {
  await testDb.setup();
  // Additional E2E setup (test data seeding, external service mocks, etc.)
});

beforeEach(async () => {
  await testDb.cleanup();
  // Reset to known state for E2E tests
});

afterAll(async () => {
  await testDb.teardown();
});

// Make test database available globally
global.testDb = testDb;
```

### HTTP Client Helper
Create `tests/utils/httpClient.ts`:
```typescript
import request from 'supertest';
import app from '../../src/expressApp.js';

export const httpClient = request(app);

export const createTestCart = async (userID: string) => {
  return await httpClient
    .post('/cart')
    .send({ userID })
    .expect(201);
};

export const addItemToCart = async (userID: string, item: any) => {
  return await httpClient
    .post(`/cart/${userID}/items`)
    .send(item)
    .expect(201);
};
```

## 3. Integration Test Categories

### A. Cart API Integration Tests
Create `tests/integration/cart.api.test.ts`:

#### Test Cases:
1. **Cart Creation**
   - POST `/cart` with valid userID
   - Database record creation verification
   - Response format validation

2. **Cart Item Management**
   - Add items to cart
   - Update item quantities
   - Remove items from cart
   - Clear entire cart

3. **Cart Retrieval**
   - GET `/cart/:userID` with items
   - Empty cart handling
   - Non-existent cart (404) handling

4. **Cart Expiration Logic**
   - 24-hour expiration testing
   - Expired cart behavior

### B. Order API Integration Tests  
Create `tests/integration/order.api.test.ts`:

#### Test Cases:
1. **Order Creation from Cart**
   - POST `/order` with valid cart
   - Cart-to-order data transformation
   - Cart clearing after order creation
   - Order status initialization

2. **Order Status Management**
   - Order confirmation (PENDING → CONFIRMED)
   - Order shipping (CONFIRMED → SHIPPED)  
   - Order delivery (SHIPPED → DELIVERED)
   - Order cancellation

3. **Order Retrieval**
   - GET `/order/:orderID`
   - GET `/order/user/:userID` (user's order history)
   - Order with items population

### C. Cross-Entity Workflow Tests
Create `tests/integration/workflows.test.ts`:

#### Test Cases:
1. **Complete Purchase Flow**
   - Create cart → Add items → Create order → Update status
   - End-to-end data consistency
   - Business rule validation

2. **Error Scenarios**
   - Order from empty cart
   - Invalid status transitions
   - Expired cart order attempt
   - Database constraint violations

## 4. Sample Test Implementation

### Example Cart Integration Test:
```typescript
// tests/integration/cart.api.test.ts
import { describe, test, expect } from 'vitest';
import { faker } from '@faker-js/faker';
import { httpClient } from '../utils/httpClient.js';

describe('Cart API Integration Tests', () => {
  describe('POST /cart', () => {
    test('should create cart and store in database', async () => {
      const userID = faker.string.uuid();
      
      const response = await httpClient
        .post('/cart')
        .send({ userID })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userID).toBe(userID);
      expect(response.body.data.cartID).toBeDefined();
      expect(response.body.data.isEmpty).toBe(true);

      // Verify database record
      const dbCart = await global.testDb.getDatabase()
        .select()
        .from(cartTable)
        .where(eq(cartTable.userID, userID));
      
      expect(dbCart).toHaveLength(1);
      expect(dbCart[0].userID).toBe(userID);
    });

    test('should reject invalid userID', async () => {
      await httpClient
        .post('/cart')
        .send({ userID: 'invalid-uuid' })
        .expect(400);
    });
  });

  describe('POST /cart/:userID/items', () => {
    test('should add item to existing cart', async () => {
      const userID = faker.string.uuid();
      
      // Create cart first
      await httpClient.post('/cart').send({ userID });

      const item = {
        productID: faker.string.uuid(),
        quantity: 2,
        price: '19.99'
      };

      const response = await httpClient
        .post(`/cart/${userID}/items`)
        .send(item)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.addedItem.productID).toBe(item.productID);
      expect(response.body.data.cart.itemCount).toBe(1);
      expect(response.body.data.cart.totalPrice).toBe(39.98); // 2 * 19.99
    });
  });
});
```

## 5. Implementation Phases

### Phase 1: Setup (Week 1)
1. Configure test database and environment
2. Set up Vitest configuration
3. Create database management utilities
4. Implement test setup/teardown

### Phase 2: Cart Tests (Week 2)  
1. Implement cart creation tests
2. Add cart item management tests
3. Test cart retrieval and validation
4. Implement error scenario tests

### Phase 3: Order Tests (Week 3)
1. Order creation from cart tests
2. Order status transition tests  
3. Order retrieval tests
4. Order business logic validation

### Phase 4: Workflow Tests (Week 4)
1. End-to-end purchase flow tests
2. Cross-entity consistency tests
3. Performance benchmarking
4. CI/CD integration

## 6. Best Practices

### Test Data Management
- Use faker.js for dynamic test data
- Create test data factories for common entities
- Ensure data cleanup between tests

### Assertion Strategies  
- Test both API responses and database state
- Validate business rules and constraints
- Check error handling and edge cases

### Performance Considerations
- Keep tests focused and fast (<100ms each)
- Use database transactions where possible
- Minimize external dependencies

## 7. CI/CD Integration

### GitHub Actions Setup
```yaml
# .github/workflows/order-service-tests.yml
name: Order Service Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: order_db_password
          POSTGRES_USER: order_db
          POSTGRES_DB: order_service_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run database migrations
        run: npx drizzle-kit push
        env:
          DATABASE_URL: postgresql://order_db:order_db_password@localhost:5433/order_service_test
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://order_db:order_db_password@localhost:5433/order_service_test

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: order_db_password
          POSTGRES_USER: order_db
          POSTGRES_DB: order_service_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run database migrations
        run: npx drizzle-kit push
        env:
          DATABASE_URL: postgresql://order_db:order_db_password@localhost:5433/order_service_test
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://order_db:order_db_password@localhost:5433/order_service_test
```

## 8. Success Metrics
- **Coverage**: 90%+ integration test coverage for API endpoints
- **Performance**: Tests complete in <30 seconds total
- **Reliability**: Zero flaky tests, consistent results
- **Maintainability**: Clear test structure and documentation

## Next Steps
1. Start with Phase 1 setup
2. Implement one test category at a time
3. Gradually expand coverage
4. Monitor test performance and reliability
5. Integrate with existing CI/CD pipeline

This plan provides a foundation for robust integration testing while leveraging your existing Vitest and Drizzle setup.