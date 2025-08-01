import { execSync } from "child_process";

module.exports = async () => {
  console.log('🚀 Starting Docker containers...');
  execSync("docker compose -f int-test-docker-compose.yml up -d", { stdio: 'inherit' });
  
  // Wait for database to be ready
  console.log('⏳ Waiting for database to be ready...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Push database schema (better for tests)
  console.log('🔧 Pushing database schema...');
  try {
    execSync("npx prisma db push", { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: "postgresql://catalog_db:catalog_db_password@localhost:5432/catalog_test?schema=public"
      }
    });
    console.log('✅ Database schema pushed');
  } catch (error) {
    console.error('❌ Schema push failed:', error);
    throw error;
  }
};
