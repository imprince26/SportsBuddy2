import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
 rules: {
  // ...js.configs.recommended.rules,
  // ...react.configs.recommended.rules,
  // ...react.configs['jsx-runtime'].rules,
  // ...reactHooks.configs.recommended.rules,

  // // custom overrides
  // 'react/jsx-no-target-blank': 'off',
  // 'react/prop-types': 'off', // ignore missing prop-types
  'no-unused-vars': 'off',   // ignore unused vars
  'no-unused-disable-directives': 'off',
  // 'no-undef': 'off',         // ignore undefined variable checks
  // 'react/no-unescaped-entities': 'off', // allow unescaped entities in JSX
  // 'react-hooks/exhaustive-deps': 'warn', // make hook deps warnings instead of errors

  // 'react-refresh/only-export-components': [
  //   'warn',
  //   { allowConstantExport: true },
  // ],
},

  },
]
