/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(ttf|otf|png|jpg|jpeg|gif)$': '<rootDir>/jest/fileMock.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // pnpm hoists deps under node_modules/.pnpm/<pkg>@<ver>/... — the negative
  // lookahead is anchored at the mangled package folder name so RN/Expo ESM
  // packages get transformed by Babel.
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(@react-native|react-native|@react-navigation|expo|@expo|@gorhom|nativewind|react-native-css-interop|react-native-svg|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|@testing-library))',
  ],
};
