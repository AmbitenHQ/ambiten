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
  },

  // Logger is authored as CommonJS JavaScript.
  {
    files: [
      "packages/logger/src/**/*.js",
      "packages/logger/src/**/*.cjs"
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es2023
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off"
    }
  },

  // Logger JavaScript tests use CommonJS and Jest.
  {
    files: [
      "packages/logger/src/**/__test__/**/*.js",
      "packages/logger/src/**/__tests__/**/*.js",
      "packages/logger/src/**/*.test.js",
      "packages/logger/src/**/*.spec.js"
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off",
      "no-undef": "off"
    }
  }
]);