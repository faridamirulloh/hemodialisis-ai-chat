import js from '@eslint/js';
import json from '@eslint/json';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    ...json.configs.recommended,
  },
  {
    ignores: ['build/**', '.react-router/**', 'public/build/**', '.cache/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...prettierConfig.rules,

      'prettier/prettier': [
        'warn',
        {
          arrowParens: 'always',
          bracketSameLine: true,
          bracketSpacing: true,
          endOfLine: 'auto',
          printWidth: 120,
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: 'all',
          useTabs: false,
        },
      ],

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-dom',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // react rules
      'react/no-array-index-key': ['warn'],
      'react/no-unknown-property': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': ['error'],
      'react/jsx-uses-react': ['error'],
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],

      // eslint rules
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': ['error', { before: false, after: true }],
      'eol-last': ['error', 'always'],
      'keyword-spacing': 'error',
      'key-spacing': ['error'],
      'no-debugger': 'warn',
      'no-duplicate-imports': 'error',
      'no-multi-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-shadow': ['error'],
      'no-trailing-spaces': ['error'],
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-useless-concat': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
