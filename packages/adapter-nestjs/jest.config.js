/**
 * Generated companion CJS Jest config to avoid ts-node compile issues when running Jest in dev environments.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: "<rootDir>/tsconfig.json"
      }
    ]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    '^@/(.*)$': '<rootDir>/src/$1',
    // Map workspace packages to local source folders so tests can require package imports
    '^@ambiten/(.*)$': '<rootDir>/../$1/src',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/esm/', '/dist/cjs/'],
  // modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 30000,
};