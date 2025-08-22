/* ESLint configuration for TypeScript (client + server) */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    sourceType: "module",
    ecmaVersion: "latest",
  },
  env: {
    node: true,
    browser: true,
    es2023: true,
  },
  plugins: ["@typescript-eslint", "import", "security"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:security/recommended",
    "prettier",
  ],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "no-console": "warn",
    "import/order": [
      "warn",
      {
        "alphabetize": { order: "asc", caseInsensitive: true },
        "newlines-between": "always",
        "groups": [
          ["builtin", "external"],
          ["internal", "parent", "sibling", "index"],
          ["type"],
        ],
      },
    ],
    // Loosen a few TS rules for pragmatism in this phase
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "client/dist/",
    "server/public/",
    "**/*.config.*",
  ],
};
