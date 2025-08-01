import { PrismaClient } from '@prisma/client';
import { TestDatabase } from './utils/database.js';

declare global {
  var testDb: TestDatabase;
  var prisma: PrismaClient;
}

export {};