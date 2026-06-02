const webpack = require('webpack');
const path = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const { VERSION } = require('ts-node');
const ESLintPlugin = require('eslint-webpack-plugin');
const nodeExternals = require('webpack-node-externals');


module.exports = {
	mode: 'production',
	entry: './src/index.ts',
	target: 'node',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
		library: {
			name: 'ambiten-core',
			type: 'umd',
			// umdNamedDefine: true, // Use named UMD definition
		},
		globalObject: 'this',
		clean: false
	},
	externals: [
		nodeExternals(),
		{
			'mongodb': {
				commonjs: 'mongodb',
				commonjs2: 'mongodb',
				amd: 'mongodb',
				root: 'mongodb',
			},
			'@apollo/server': {
				commonjs: '@apollo/server',
				commonjs2: '@apollo/server',
				amd: '@apollo/server',
				root: '@apollo/server',
			},
			graphql: {
				commonjs2: 'graphql',
				amd: 'graphql',
				root: 'graphql',
			},
			'express': {
				commonjs: 'express',
				commonjs2: 'express',
				amd: 'express',
				root: 'express',
			},
			// Prevent bundling node_modules
			buffer: 'commonjs buffer',
			fs: 'commonjs fs',
			path: 'commonjs path',
			os: 'commonjs os',
			http: 'commonjs http',
			https: 'commonjs https',
			net: 'commonjs net',
			dns: 'commonjs dns',
			type: 'commonjs'
		}
	],
	optimization: {
		providedExports: true,
		usedExports: false,
		"sideEffects": false,
		// "mangleExports": "size",
	},
	recordsPath: path.join(__dirname, "records.json"),
	module: {
		rules: [
			{
				test: /\.js$/,
				include: /node_modules\/node-cron/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [['@babel/preset-env', { targets: { node: '16' } }]],
					}
				}
			},
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {
						compilerOptions: {
							rootDir: path.resolve(__dirname, '..')
						},
						transpileOnly: true,
						onlyCompileBundledFiles: true,
					}
				},
				exclude: [/^node_modules/, /^examples\//i],
				// include: path.resolve(__dirname, 'src'),
			},
		]
	},
	resolve: {
		alias: {
			'@gcCron': path.resolve(__dirname, 'src/gc/gcCron.node.ts'),
			// 'ajv': path.resolve(__dirname, '../../node_modules/ajv/dist/ajv.bundle.js')
		},
		extensions: ['.ts', '.tsx', '.js'],
		extensionAlias: {
			'.js': ['.ts', '.js'],
			'.mjs': ['.mts', '.mjs'],
			'.cjs': ['.cts', '.cjs'],
		},
		byDependency: {
			esm: {
				mainFields: ['browser', 'module', 'main'],
			},
			commonjs2: {
				aliasFields: ['browser', 'module'],
			},
		},
		fallback: {
			buffer: require.resolve('buffer'),
			console: require.resolve('console-browserify'),
			crypto: require.resolve("crypto-browserify"),
			path: require.resolve('path-browserify'),
			// util: require.resolve('util/'),
			"async_hooks": false,
			// "child_process": false,
			"fs": false,
			"http2": false,
		},
		plugins: [new TsconfigPathsPlugin()]
	},
	plugins: (() => {
		const p = [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify('production'),
				'process.env.TS_NODE': JSON.stringify(VERSION),
			})
		];
		if (process.env.ENABLE_ESLINT_PLUGIN) {
			p.push(new ESLintPlugin({
				extensions: ['ts'],
				exclude: ['dist', 'build', 'node_modules']
			}));
		}
		return p;
	})(),
	performance: {
		hints: false, // Disable performance hints
		maxEntrypointSize: 512000, // Set max entry point size to 500KB
		maxAssetSize: 512000, // Set max asset size to 500KB
	},
	devtool: 'source-map', // Generate source maps for debugging
	stats: {
		errorDetails: true
	},
	// This helps suppress dynamic require warnings
	context: __dirname,
};
