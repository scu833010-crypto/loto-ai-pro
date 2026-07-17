// ============================================================
// ESLINT — reglas mínimas pero útiles: variables sin usar, código
// muerto obvio, errores comunes de Node/CommonJS. No es exhaustivo,
// pero atrapa el tipo de error que rompe producción silenciosamente
// (ej. la función "filaAResultado" duplicada que se coló hace poco).
// ============================================================
module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "data.sqlite*"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        exports: "writable",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        fetch: "readonly",
        AbortController: "readonly",
        URLSearchParams: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-func-assign": "error",
      "no-fallthrough": "error",
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["warn", "smart"],
    },
  },
  {
    files: ["test/**/*.test.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",
      },
    },
  },
];
