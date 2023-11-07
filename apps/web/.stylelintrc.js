module.exports = {
  extends: ['stylelint-config-recommended-vue/scss'],
  plugins: ['stylelint-order', 'stylelint-scss'],
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json'],
  rules: {
    'string-quotes': 'single',
    'no-empty-source': null,
    'no-invalid-double-slash-comments': null,
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'screen'],
      },
    ],
  },
}
