const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // new import

module.exports = {
  entry: './plugin.tsx',
  output: {
    filename: 'plugin.js',
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
      template: './index.html',
      filename: 'index.html', // outputs to dist/index.html
      inject: 'head'
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
