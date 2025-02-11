const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // new import

module.exports = {
  entry: './plugin.tsx',
  output: {
    filename: 'plugin.js',
    path: path.resolve(__dirname)
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
      template: './index_template.html', // uses index.html as the template
      inject: 'head'
    })
  ],
  mode: 'development' // Switch to 'production' for production builds
};
