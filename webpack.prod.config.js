const merge = require("webpack-merge");
const common = require("./webpack.common.config.js");
const webpack = require("webpack");

module.exports = merge(common, {
  mode: "production",
  entry: ["./app/bootstrapServer.js", "./app/server.tsx"],
  output: {
    libraryTarget: "commonjs",
    library: "PanPal",
    filename: "./bundle.js",
  },
  target: "node",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
      "process.env.PROJECT_NAME": JSON.stringify("PanPal"),
      "process.env.CRYPTOBADGE_AUTHORIZATION_KEY": JSON.stringify(
        "sHj+2+1oAzUBCtkzXXJcgRAoEULArgMRrixSMzbj5j8=",
      ),
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
});
