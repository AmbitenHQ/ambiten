/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const webpack = require('webpack');
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { VERSION } = require('ts-node');


module.exports = {
	mode: 'production',
	entry: './src/index.ts',
	target: 'node',
	// devtool: 'source-map',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
		library: {
			name: 'ambiten-logger',
			type: 'umd',
		},
		globalObject: 'this',
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: "webpack-remove-debug", // remove "debug" package
			},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /^node_modules/
			},
		],
	},
	resolve: {
		extensions: ['.js', '.ts'],
		byDependency: {
			esm: {
				mainFields: ['browser', 'module', 'main'],
			},
			commonjs2: {
				aliasFields: ['browser', 'module'],
			},
		},
		fallback: {
			buffer: require.resolve('buffer/'),
			path: require.resolve('path-browserify'),
			util: false,
			"async_hooks": false,
			"url": false,
			"fs": false,
			"https": false,
			"crypto": false,
			"timers": false,
			"stream": false,
			"zlib": false,
			"http": false,
			http2: false,
			"assert": false,
			"tty": false,
			"vm": false,
			"os": false,
		},
		plugins: [new TsconfigPathsPlugin()],
	},
	optimization: {
		providedExports: true,
		usedExports: false,
		"sideEffects": false,
		"mangleExports": "size",
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
			'process.env.TS_NODE': JSON.stringify(VERSION),
		}),
		new webpack.ProvidePlugin({
			window: path.resolve(__dirname, 'shim/window.js')
		})
	],
	context: __dirname,
}