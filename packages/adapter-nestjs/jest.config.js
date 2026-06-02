/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require('ts-jest');

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ['**/__test__/**/*.test.ts', '**/__test__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@ambiten/core$': '<rootDir>/../core/src/index.ts',
    '^@ambiten/logger$': '<rootDir>/../logger/src/index.ts',
    '^@ambiten/adapter-types$': '<rootDir>/../adapter-types/src/index.ts'
  }
};