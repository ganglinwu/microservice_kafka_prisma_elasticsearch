# Catalog Service Integration Testing Plan

## Overview
This plan outlines how to implement comprehensive integration tests for the Catalog Service, focusing on product CRUD operations with real database interactions using Jest and Prisma ORM.

## Current Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (port 5432) with Prisma ORM
- **Test Runner**: Jest
- **Routes**: `/product` endpoints
- **Key Features**: Product management, Prisma validation, Request validation

## 1. Test Environment Setup

### Database Configuration
Create a separate test database:
```bash
# Add to docker-compose.yml or create test database
createdb catalog_service_test -p 5432
```

### Environment Variables
Create `.env.test`:
```env
PORT=3001
DATABASE_URL="postgresql://catalog_db:catalog_db_password@localhost:5432/catalog_service_test?schema=public"
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
Keep existing `jest.config.cjs` for unit tests:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/tests/unit/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  testTimeout: 5000,
  // ES modules support
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};
```

#### Integration Tests Configuration  
Create `jest.integration.config.cjs`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/tests/integration/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.integration.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  testTimeout: 10000,
  maxWorkers: 1, // Sequential execution for database operations
  // ES modules support
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};
```

#### E2E Tests Configuration
Create `jest.e2e.config.cjs`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/tests/e2e/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.e2e.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  testTimeout: 30000, // Longer timeout for full workflows
  maxWorkers: 1,
  // ES modules support
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  }
};
```

#### Package.json Scripts
Update your package.json with convenient test commands:
```json
{
  "scripts": {
    "test": "jest",                                           // Unit tests (default)
    "test:unit": "jest",                                      // Explicit unit tests
    "test:integration": "jest --config jest.integration.config.cjs",  // Integration tests
    "test:e2e": "jest --config jest.e2e.config.cjs",        // End-to-end tests
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:watch": "jest --watch",                            // Unit tests in watch mode
    "test:integration:watch": "jest --config jest.integration.config.cjs --watch"
  }
}
```

## 2. Test Infrastructure

### Database Management Utilities
Create `tests/utils/database.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

export class TestDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async setup() {
    // Run database migrations
    await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Additional setup if needed
  }

  async cleanup() {
    // Clean all tables in correct order
    await this.prisma.product.deleteMany();
    // Add other model cleanups as needed
  }

  async teardown() {
    await this.prisma.$disconnect();
  }

  getPrisma() {
    return this.prisma;
  }

  async resetDatabase() {
    // For more aggressive cleanup if needed
    await this.prisma.$executeRaw`TRUNCATE TABLE "Product" RESTART IDENTITY CASCADE`;
  }
}
```

### Test Setup Files

#### Integration Test Setup
Create `tests/setup.integration.ts`:
```typescript
import { TestDatabase } from './utils/database';

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
global.prisma = testDb.getPrisma();
```

#### E2E Test Setup  
Create `tests/setup.e2e.ts`:
```typescript
import { TestDatabase } from './utils/database';

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
global.prisma = testDb.getPrisma();
```

### HTTP Client Helper
Create `tests/utils/httpClient.ts`:
```typescript
import request from 'supertest';
import app from '../../src/expressApp';

export const httpClient = request(app);

export const createTestProduct = async (productData: any) => {
  return await httpClient
    .post('/product')
    .send(productData)
    .expect(201);
};

export const getProductById = async (productId: string) => {
  return await httpClient
    .get(`/product/${productId}`)
    .expect(200);
};

export const updateProduct = async (productId: string, updateData: any) => {
  return await httpClient
    .patch(`/product/${productId}`)
    .send(updateData)
    .expect(200);
};
```

### Test Data Factory
Create `tests/utils/factories.ts`:
```typescript
import { faker } from '@faker-js/faker';

export const productFactory = {
  build: (overrides: any = {}) => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    stock: faker.number.int({ min: 0, max: 100 }),
    ...overrides,
  }),

  buildMany: (count: number, overrides: any = {}) => {
    return Array.from({ length: count }, () => productFactory.build(overrides));
  },
};
```

## 3. Integration Test Categories

### A. Product CRUD Integration Tests
Create `tests/integration/product.api.test.ts`:

#### Test Cases:
1. **Product Creation**
   - POST `/product` with valid data
   - Database record creation verification
   - Response format validation
   - Validation error handling (missing fields, invalid data)

2. **Product Retrieval**
   - GET `/product/:id` for existing product
   - GET `/products` with pagination/filtering
   - Non-existent product (404) handling
   - Query parameter validation

3. **Product Updates**
   - PATCH `/product/:id` with partial updates
   - Full product updates
   - Validation during updates
   - Optimistic concurrency handling

4. **Product Deletion**
   - DELETE `/product/:id`
   - Soft delete vs hard delete behavior
   - Cascade deletion logic (if applicable)

### B. Database Constraint Tests
Create `tests/integration/database.constraints.test.ts`:

#### Test Cases:
1. **Unique Constraints**
   - Duplicate product name handling
   - SKU uniqueness (if applicable)

2. **Data Validation**
   - Price constraints (non-negative)
   - Stock quantity validation
   - String length limits

3. **Referential Integrity**
   - Foreign key constraints (if applicable)
   - Cascade behaviors

### C. Business Logic Integration Tests
Create `tests/integration/business.logic.test.ts`:

#### Test Cases:
1. **Inventory Management**
   - Stock level updates
   - Out-of-stock scenarios
   - Stock reservation logic

2. **Price Management**
   - Price history tracking (if implemented)
   - Discount application
   - Currency handling

3. **Product Categorization**
   - Category assignment
   - Category-based filtering
   - Hierarchical categories (if applicable)

## 4. Sample Test Implementation

### Example Product CRUD Integration Test:
```typescript
// tests/integration/product.api.test.ts
import { httpClient } from '../utils/httpClient';
import { productFactory } from '../utils/factories';

describe('Product API Integration Tests', () => {
  describe('POST /product', () => {
    test('should create product and store in database', async () => {
      const productData = productFactory.build();

      const response = await httpClient
        .post('/product')
        .send(productData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);

      // Verify database record
      const dbProduct = await global.prisma.product.findUnique({
        where: { id: response.body.id }
      });

      expect(dbProduct).toBeTruthy();
      expect(dbProduct.name).toBe(productData.name);
      expect(dbProduct.description).toBe(productData.description);
    });

    test('should reject invalid product data', async () => {
      const invalidProduct = {
        name: '', // Empty name should fail validation
        price: -10, // Negative price should fail
      };

      const response = await httpClient
        .post('/product')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    test('should handle duplicate product names', async () => {
      const productData = productFactory.build();

      // Create first product
      await httpClient
        .post('/product')
        .send(productData)
        .expect(201);

      // Try to create duplicate
      await httpClient
        .post('/product')
        .send(productData)
        .expect(409); // Conflict
    });
  });

  describe('GET /product/:id', () => {
    test('should retrieve existing product', async () => {
      const productData = productFactory.build();

      // Create product
      const createResponse = await httpClient
        .post('/product')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.id;

      // Retrieve product
      const getResponse = await httpClient
        .get(`/product/${productId}`)
        .expect(200);

      expect(getResponse.body.id).toBe(productId);
      expect(getResponse.body.name).toBe(productData.name);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = 'non-existent-id';

      await httpClient
        .get(`/product/${fakeId}`)
        .expect(404);
    });
  });

  describe('PATCH /product/:id', () => {
    test('should update product partially', async () => {
      const productData = productFactory.build();

      // Create product
      const createResponse = await httpClient
        .post('/product')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.id;
      const updateData = { price: 99.99, stock: 50 };

      // Update product
      const updateResponse = await httpClient
        .patch(`/product/${productId}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.price).toBe(updateData.price);
      expect(updateResponse.body.stock).toBe(updateData.stock);
      expect(updateResponse.body.name).toBe(productData.name); // Unchanged

      // Verify in database
      const dbProduct = await global.prisma.product.findUnique({
        where: { id: productId }
      });

      expect(dbProduct.price).toBe(updateData.price);
      expect(dbProduct.stock).toBe(updateData.stock);
    });
  });

  describe('DELETE /product/:id', () => {
    test('should delete product', async () => {
      const productData = productFactory.build();

      // Create product
      const createResponse = await httpClient
        .post('/product')
        .send(productData)
        .expect(201);

      const productId = createResponse.body.id;

      // Delete product
      await httpClient
        .delete(`/product/${productId}`)
        .expect(200);

      // Verify deletion
      const dbProduct = await global.prisma.product.findUnique({
        where: { id: productId }
      });

      expect(dbProduct).toBeNull();
    });
  });
});
```

## 5. Prisma-Specific Testing Utilities

### Database Seeding for Tests
Create `tests/utils/seeder.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import { productFactory } from './factories';

export class TestSeeder {
  constructor(private prisma: PrismaClient) {}

  async seedProducts(count: number = 5) {
    const products = productFactory.buildMany(count);
    
    const createdProducts = [];
    for (const product of products) {
      const created = await this.prisma.product.create({
        data: product
      });
      createdProducts.push(created);
    }

    return createdProducts;
  }

  async seedSpecificProduct(data: any) {
    return await this.prisma.product.create({
      data: data
    });
  }
}
```

### Prisma Transaction Testing
```typescript
// Example test with transaction rollback
test('should handle transaction rollback on error', async () => {
  const productData = productFactory.build();

  try {
    await global.prisma.$transaction(async (tx) => {
      await tx.product.create({ data: productData });
      
      // Simulate error
      throw new Error('Transaction should rollback');
    });
  } catch (error) {
    // Expected error
  }

  // Verify no product was created
  const products = await global.prisma.product.findMany();
  expect(products).toHaveLength(0);
});
```

## 6. Implementation Phases

### Phase 1: Setup (Week 1)
1. Configure test database with Prisma
2. Set up Jest configuration for ES modules
3. Create database management utilities
4. Implement test setup/teardown with Prisma

### Phase 2: CRUD Tests (Week 2)
1. Implement product creation tests
2. Add product retrieval tests
3. Test product update operations
4. Implement deletion tests

### Phase 3: Validation & Constraints (Week 3)
1. Database constraint testing
2. Input validation testing
3. Business rule validation
4. Error handling scenarios

### Phase 4: Advanced Features (Week 4)
1. Pagination and filtering tests
2. Performance testing
3. Concurrent operation testing
4. CI/CD integration

## 7. Prisma-Specific Considerations

### Schema Validation Testing
```typescript
test('should enforce Prisma schema constraints', async () => {
  const invalidProduct = {
    name: 'A'.repeat(256), // Assuming max length is 255
    price: 'invalid-price', // Should be number
  };

  await expect(
    global.prisma.product.create({
      data: invalidProduct
    })
  ).rejects.toThrow();
});
```

### Migration Testing
```typescript
// Test that migrations work correctly
test('should have correct database schema', async () => {
  const tableInfo = await global.prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'Product'
    ORDER BY ordinal_position;
  `;

  expect(tableInfo).toBeDefined();
  // Verify expected columns exist
});
```

## 8. CI/CD Integration

### GitHub Actions Setup
```yaml
# .github/workflows/catalog-service-tests.yml
name: Catalog Service Tests
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
      - name: Generate Prisma client
        run: npx prisma generate
      - name: Run unit tests
        run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: catalog_db_password
          POSTGRES_USER: catalog_db
          POSTGRES_DB: catalog_service_test
        ports:
          - 5432:5432
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
      - name: Generate Prisma client
        run: npx prisma generate
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://catalog_db:catalog_db_password@localhost:5432/catalog_service_test
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://catalog_db:catalog_db_password@localhost:5432/catalog_service_test

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: catalog_db_password
          POSTGRES_USER: catalog_db
          POSTGRES_DB: catalog_service_test
        ports:
          - 5432:5432
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
      - name: Generate Prisma client
        run: npx prisma generate
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://catalog_db:catalog_db_password@localhost:5432/catalog_service_test
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://catalog_db:catalog_db_password@localhost:5432/catalog_service_test
```

### Package.json Scripts  
The scripts are already included in the configuration section above, but here's a summary:
```json
{
  "scripts": {
    "test": "jest",                                           // Unit tests (default)
    "test:unit": "jest",                                      // Explicit unit tests  
    "test:integration": "jest --config jest.integration.config.cjs",  // Integration tests
    "test:e2e": "jest --config jest.e2e.config.cjs",        // End-to-end tests
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:watch": "jest --watch",                            // Unit tests in watch mode
    "test:integration:watch": "jest --config jest.integration.config.cjs --watch",
    "test:coverage": "jest --coverage"                       // Unit tests with coverage
  }
}
```

## 9. Best Practices

### Prisma Best Practices
- Use `$transaction` for operations that need atomicity
- Test both successful operations and constraint violations
- Verify database state after operations
- Use proper cleanup between tests

### Test Organization
- Group tests by functionality
- Use descriptive test names
- Test both happy path and error scenarios
- Keep tests independent and isolated

### Performance
- Use `maxWorkers: 1` in Jest config for database tests
- Clean up data efficiently between tests
- Consider using database transactions for faster cleanup

## 10. Success Metrics
- **Coverage**: 90%+ integration test coverage for API endpoints
- **Performance**: Tests complete in <45 seconds total
- **Reliability**: Consistent test results across runs
- **Maintainability**: Clear test structure following existing patterns

## Next Steps
1. Start with Phase 1 database setup
2. Implement basic CRUD tests first
3. Add validation and constraint testing
4. Expand to advanced scenarios
5. Integrate with existing CI/CD pipeline

This plan leverages your existing Jest and Prisma setup while providing comprehensive integration testing coverage for the catalog service.