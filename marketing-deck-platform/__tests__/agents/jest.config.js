const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: '../../',
})

const customJestConfig = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/python_env/'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../$1',
  },
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.agents.js'],
}

module.exports = createJestConfig(customJestConfig)