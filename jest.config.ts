import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/index.ts",
    "!src/types/**/*",
    "!src/**/*.d.ts",
  ],
};

export default createJestConfig(customJestConfig);
