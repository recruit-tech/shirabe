module.exports = {
  env: {
    browser: false,
    es6: true
  },
  extends: [
    'standard',
    'standard-with-typescript',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    'prettier/prettier': 'error'
  },
  plugins: ['@typescript-eslint', 'prettier']
}
