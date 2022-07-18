module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue',
  ],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json'
    }
  },
  moduleNameMapper: {
    "@functions/(.*)$": ["<rootDir>/src/functions/$1"],
    "@libs/(.*)$": ["<rootDir>/src/libs/$1"],
    "@services/(.*)$": ["<rootDir>/src/services/$1"],
    "@utils/(.*)$": ["<rootDir>/src/utils/$1"],
    "@models/(.*)$": ["<rootDir>/src/models/$1"],
  },
  automock: false,
  setupFiles: [
    "./src/__mocks__/setupJestMock.ts"
    ]
};