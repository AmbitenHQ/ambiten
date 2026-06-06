const webpack = require('webpack');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { version: VERSION } = require('./package.json');
const ESLintPlugin = require('eslint-webpack-plugin');



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
				exclude: [/^node_modules/, /\.test\.ts$/, /\.spec\.ts$/],
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
			"async_hooks": false,
			"fs": false,
			"http2": false,
		},
		plugins: [
			new TsconfigPathsPlugin({
				configFile: path.resolve(__dirname, 'tsconfig.json'),
			}),
		]
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
