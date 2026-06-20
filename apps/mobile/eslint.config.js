// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // Generated Orval client — don't lint machine-generated code.
    ignores: ['dist/*', 'src/services/generated/*'],
  },
]);
