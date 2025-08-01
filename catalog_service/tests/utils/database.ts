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
    // Wait for database connection and run migrations
    try {
      // Test connection
      await this.prisma.$connect();
      
      // Create extension if needed
      await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
      
      console.log('✅ Database setup completed');
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
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
