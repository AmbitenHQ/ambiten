/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
// import { createDefaultPreset } from "ts-jest";
const { createDefaultPreset } = require("ts-jest");
const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
	testEnvironment: "node",
	transform: {
		//   "^.+\\.tsx?$": ["babel-jest", { presets: ["@babel/preset-env", "@babel/preset-typescript"] }],
		...tsJestTransformCfg,
	},
	extensionsToTreatAsEsm: ['.ts'],
	moduleFileExtensions: ["ts", "js", "json"],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
};
