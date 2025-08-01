import { config } from 'dotenv';
import { TestDatabase } from './utils/database';

// Load test environment variables with override
config({ path: '.env.test', override: true });

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
(global as any).testDb = testDb;
(global as any).prisma = testDb.getPrisma();
