const webpack = require('webpack')
const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = function(options) {
  if (!options) options = {};

  const MODE = (options.production)
    ? "production"
    : "development";

  return {
    mode: MODE,

    entry: {
      main: path.resolve('src/client/index.ts')
    },

    output: {
      path: __dirname + "/dist",
      filename: 'bundle.js'
    },

    devtool: 'cheap-source-map',

    devServer: {
      disableHostCheck: true
    },

    module: {
      rules: [
        { test: /\.ts$/, loader: "ts-loader" },
        { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" }) }
      ]
    },

    plugins: [
      new ExtractTextPlugin("styles.css"),
      new HtmlWebpackPlugin({
        template: path.resolve("src/client", "index.html")
      }),
    ],

    // Disable MAX 250kb entrypoint warnings on console
    performance: { hints: false },

    resolve: {
      extensions: ['.ts', '.js', '.json']
    }

  }
};
