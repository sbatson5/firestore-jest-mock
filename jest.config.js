module.exports = {
  preset: 'ts-jest',
  automock: false,
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['**/src/**/*.ts'],
  coverageDirectory: 'coverage/',
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testTimeout: 60 * 1000, // 60 seconds
  testMatch: ['**/{__tests__,src}/**/*.{test,spec}.+(ts|tsx)'],
  testPathIgnorePatterns: ['dist/', 'node_modules/', 'packages/', 'src/'],
};
