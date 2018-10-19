module.exports = {
  extends: 'eslint:recommended',
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  rules: {
    'no-unused-vars': ['error', { args: "none" }]
  },
  globals: {
  }
};
