// webpack.cli.js

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './bin/ambiten_create.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }]
  },
  externals: {
    'fsevents': 'commonjs fsevents'
  },
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.emit.tapAsync('AddShebangPlugin', (compilation, callback) => {
          const content = compilation.assets['index.js'].source();
          compilation.assets['index.js'] = {
            source: () => `#!/usr/bin/env node\n${content}`,
            size: () => content.length + '#!/usr/bin/env node\n'.length,
          };
          callback();
        });
      },
    },
  ],
};