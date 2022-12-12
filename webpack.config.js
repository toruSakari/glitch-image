const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: ['web', 'es5'],
  output: {
    library: {
      name: 'GlitchImage',
      export: 'default',
      type: 'umd',
    },
    path: path.resolve(__dirname, process.env === 'development' ? 'src/sample' : 'dist'),
    filename: 'index.min.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'src/sample'),
    },
    compress: false,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        exclude: /node_module/,
        use: [
          'ts-loader'
        ],
      },
    ],
  },
  resolve: {
    extensions: [
      '.ts', '.js',
    ],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [new ESLintPlugin()],
};
