module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/server/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/client/', '/tests/e2e/'],
  verbose: true
};
