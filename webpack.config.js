const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // new import

module.exports = {
  entry: {
    plugin: './src/plugin/plugin.ts',
    index: './src/harness/index.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/harness/index.html',
      filename: 'index.html', // outputs to dist/index.html
      inject: false
    })
  ],
  mode: 'development',
  devtool: 'inline-source-map', // Added for better debugging
  devServer: {
    static: './dist', // Serve files from the dist directory
    hot: true, // Enable Hot Module Replacement
    open: true // Automatically open the browser
  }
};
