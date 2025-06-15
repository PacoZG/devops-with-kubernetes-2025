import { defineConfig } from 'eslint/config'
import globals from 'globals'
import prettier from 'eslint-plugin-prettier'
import js from '@eslint/js'

const { FlatCompat } = require('@eslint/eslintrc')

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...jest.environments.globals.globals,
        ...globals.commonjs,
        ...globals.node,
        process: true,
        module: true,
        require: true,
      },

      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    extends: compat.extends('plugin:react/recommended', 'prettier'),

    plugins: {
      react,
      jest,
      prettier,
    },

    rules: {
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'never'],
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],

      'arrow-spacing': [
        'error',
        {
          before: true,
          after: true,
        },
      ],

      'no-console': 0,
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },
])
