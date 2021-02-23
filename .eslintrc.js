const path = require('path');

module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules'],
  extends: ['@upstatement', 'plugin:jest/recommended'],
  plugins: ['jest'],
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        'prefer-rest-params': 'off',
        'no-undef': 'off', // TypeScript does this for us
        'no-use-before-define': 'off', // TypeScript does this for us
      },
    },
  ],
};
