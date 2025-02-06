const path = require('path');

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
  mode: 'development' // Switch to 'production' for production builds
};
