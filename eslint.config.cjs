const { defineConfig, globalIgnores } = require("eslint/config");
const globals = require("globals");
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = defineConfig([
  globalIgnores([
    "**/node_modules/**",
    "**/dist/**",
    "**/coverage/**",
    "**/*.tgz",
    "**/*.tsbuildinfo"
  ]),

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2023
      }
    },
    rules: {
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-extra-semi": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },

  // Type-aware linting only for production source files
  {
    files: ["packages/*/src/**/*.ts"],
    ignores: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/__test__/**",
      "**/__tests__/**"
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./packages/*/tsconfig.json"],
        tsconfigRootDir: __dirname,
        sourceType: "module"
      }
    }
  },

  // Jest tests: no project binding, just Jest globals
  {
    files: [
      "**/*.test.ts",
      "**/*.spec.ts",
      "**/__test__/**/*.ts",
      "**/__tests__/**/*.ts"
    ],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      "no-undef": "off"
    }
  },

  // setupTest.ts files
  {
    files: ["**/setupTest.ts"],
    languageOptions: {
      parser: tseslint.parser,
      globals: {
        ...globals.node,
        ...globals.jest
      }
    }
  },

  // scripts/config files
  {
    files: [
      "**/scripts/**/*.ts",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/*.config.mjs"
    ],
    languageOptions: {
      parser: tseslint.parser,
      sourceType: "script",
      globals: {
        ...globals.node
      }
    }
  }
]);