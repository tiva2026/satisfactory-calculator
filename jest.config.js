const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!src/data/**/*',
    '!src/examples/**/*',
    '!**/node_modules/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
