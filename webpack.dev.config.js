const merge = require("webpack-merge");
const common = require("./webpack.common.config.js");
const optimization = require("./webpack.optimization.config");
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { UnusedFilesWebpackPlugin } = require("unused-files-webpack-plugin");
const LoadablePlugin = require("@loadable/webpack-plugin");

module.exports = merge(common, optimization, {
  mode: "development",
  entry: {
    main: [
      "./app/app.scss",
      "whatwg-fetch",
      "intersection-observer",
      "./app/client.tsx",
    ],
    vendor: ["react", "react-dom"],
  },
  output: {
    filename: "./dist/bundle.js",
    globalObject: "this",
    path: path.resolve(__dirname, "./"),
  },
  devtool: "cheap-module-source-map",
  node: {
    fs: "empty",
  },
  devServer: {
    allowedHosts: [".lvh.me", "localhost"],
    compress: true,
    historyApiFallback: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("development"),
      "process.env.CRYPTOBADGE_AUTHORIZATION_KEY": JSON.stringify(
        "sHj+2+1oAzUBCtkzXXJcgRAoEULArgMRrixSMzbj5j8=",
      ),
    }),
    new HtmlWebpackPlugin({
      template: "app/index.ejs",
      inject: false,
    }),
    new LoadablePlugin(),
  ],
});
