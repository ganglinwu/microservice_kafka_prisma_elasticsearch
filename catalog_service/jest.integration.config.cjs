module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/tests/integration/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.integration.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        module: "commonjs",
        target: "es2020"
      }
    }],
  },
  globalSetup: "./tests/utils/jest-global-setup.ts",
  globalTeardown: "./tests/utils/jest-global-teardown.ts",
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!**/*.map"],
  testTimeout: 10000,
  maxWorkers: 1,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
