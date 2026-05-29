/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// eslint.config.mjs
// import js from '@eslint/js'
const js = require('@eslint/js')
// import tseslint from 'typescript-eslint'
const tseslint = require('typescript-eslint')

module.exports = [
  // Monorepo-wide ignores
  {
    ignores: ['**/dist/**', '**/build/**', '**/.next/**', '**/coverage/**'],
  },

  // JS recommended
  js.configs.recommended,

  // TypeScript recommended (flat config)
  ...tseslint.configs.recommended,

  // Common settings/rules
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // For type-aware rules, switch to:
      // ...tseslint.configs.recommendedTypeChecked
      // and set parserOptions.project to your tsconfig paths
      // parserOptions: { project: ['./tsconfig.json', './packages/*/tsconfig.json'] },
    },
  },
    // 👇 keep this LAST so it overrides everything above
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-dynamic-require': 'off',
    },
  },
]
