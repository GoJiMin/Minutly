import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'api-service.ts',
    'query-service.ts',
    'stub.ts',
    '<rootDir>/src/shared/component/',
    'Loading\\.(ts|tsx)$',
    'index.ts',
    'Store.ts',
    'type.ts',
    'types.ts',
    '.*[cC]onfig\\.(js|ts|tsx)$',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};

export default createJestConfig(config);
