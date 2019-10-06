const merge = require("webpack-merge");
const common = require("./webpack.common.config.js");
const webpack = require("webpack");
const optimization = require("./webpack.optimization.config");
const LoadablePlugin = require("@loadable/webpack-plugin");

module.exports = merge(common, optimization, {
  mode: "production",
  entry: {
    bundleBrowser: [
      "babel-polyfill",
      "proto-polyfill",
      "./app/bootstrap.js",
      "./app/app.scss",
      "whatwg-fetch",
      "url-polyfill",
      "intersection-observer",
      "smoothscroll-polyfill",
      "./app/client.tsx",
    ],
    vendor: ["react", "react-dom", "react-intl"],
  },
  output: {
    filename: "./[name].js",
    sourceMapFilename: "[name].js.map",
    chunkFilename: "./[name].[chunkhash].js",
  },
  devtool: "cheap-module-source-map",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.PROJECT_NAME": JSON.stringify("PanPal"),
      "process.env.CRYPTOBADGE_AUTHORIZATION_KEY": JSON.stringify(
        "sHj+2+1oAzUBCtkzXXJcgRAoEULArgMRrixSMzbj5j8=",
      ),
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new LoadablePlugin({
      filename: "vendor.json",
      writeToDisk: true,
    }),
  ],
});
