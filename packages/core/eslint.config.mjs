// import { defineConfig, globalIgnores } from "eslint/config";
// import globals from "globals";
// import js from "@eslint/js";
// import tseslint from "typescript-eslint";
// import eslintPluginPlugin from "eslint/config";


// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,ts}"] },
//   {
//     files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: {
//       globals: globals.browser
//     }
//   },
//   { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
//   tseslint.configs.recommended,
//   {
//     files: ["**/*.{js,mjs,cjs,ts}"],
//     plugins: {
//       ["@typescript-eslint"]: tseslint.plugin,
//       ['@typescript-eslint/internal']: {
//         rules: {
//           "no-unused-vars": "off",
//           "@typescript-eslint/no-unused-vars": "off",
//           "@typescript-eslint/no-explicit-any": "off",
//           "no-undef": "off",
//           "@typescript-eslint/no-undef": "off",
//           "no-semicicolon": "off",
//         },
//       },
//       ['eslint-plugin']: eslintPluginPlugin,
//       // ["eslint-plugin-jsdoc"]: require("eslint-plugin-jsdoc"),
//     }
//   },
//   {
//     files: [
//       "**/*.ts",
//       "**/dist/*.ts",
//     ],
//     languageOptions: {
//       parser: tseslint.ESLintParser,
//       parserOptions: {
//         project: "./tsconfig.json",
//         tsconfigRootDir: ".",
//         sourceType: "module",
//       },
//     },
//   },
//   {
//     languageOptions: {
//       globals: {
//         ...globals.node,
//         ...globals.browser,
//         ...globals.es2020,
//         ...globals.es2021,
//         ...globals.es2022,
//         ...globals.es2023,
//       },
//     },
//     rules: {
//       "no-unused-vars": "off",
//       "@typescript-eslint/no-unused-vars": "off",
//       "@typescript-eslint/no-explicit-any": "off",
//       "no-undef": "off",
//       "@typescript-eslint/no-undef": "off",
//       "no-semicicolon": "off",
//       "@typescript-eslint/no-extra-semi": "off",
//     },
//   },
//   globalIgnores([
//     "**/config/*",
//     "**/init-cli/*",
//     "**/scripts/*",
//     "node_modules/*",
//     "dist/**/*",
//     "jest.config.ts",
//     "**/coverage/",
//     "examples/**/*",
//     "**/__test__/**/*",
//     "webpack.node.config.js",
//     "webpack.cli.config.js"
//   ]),
// ]); 