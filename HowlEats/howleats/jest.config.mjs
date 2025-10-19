export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/test/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|webp|avif)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  testMatch: ['<rootDir>/src/tests/**/*.(test|spec).(js|jsx|ts|tsx)'],
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
};
