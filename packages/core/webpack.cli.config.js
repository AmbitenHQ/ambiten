const webpack = require('webpack');
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'production',
	target: 'node',
	entry: './src/cli/ambiten-core-cli.ts',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index-cli.js',
	},
	devtool: 'source-map', // Generate source maps for debugging
	externalsType: 'umd',
	externals: [nodeExternals()],
	resolve: {
		extensions: ['.ts', '.js'],
		byDependency: {
			esm: {
				mainFields: ['browser', 'module', 'main'],
			},
			commonjs2: {
				aliasFields: ['browser', 'module'],
			},
		},
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, 'tsconfig.json'),
			}),
		],
	},
	module: {
		rules: [
			{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
		],
	},
	stats: {
		errorDetails: true
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		// Adds the shebang line for Node.js CLI
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true,
		}),
	],
	node: {
		__dirname: false,
		__filename: false,
	},
};