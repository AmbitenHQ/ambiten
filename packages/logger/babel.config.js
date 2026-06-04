export default api => {
	const isTest = api.env('test');
	 api.cache.using(() => process.env.NODE_ENV || 'development');
	return {
		presets: [
			['@babel/preset-env', { targets: { node: 'current' } }],
			'@babel/preset-typescript',
		],
		plugins: [
			'@babel/plugin-transform-runtime',
			'@babel/plugin-transform-arrow-functions',
			isTest && '@babel/plugin-transform-modules-commonjs',
		].filter(Boolean),
	}
};