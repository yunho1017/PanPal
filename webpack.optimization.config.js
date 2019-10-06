const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  output: {
    chunkFilename: "./[name].[chunkhash].js",
  },
  plugins: [],
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({}),
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
    ],
    splitChunks: {
      chunks: "async",
      minSize: 50000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: "~",
      name: true,
      cacheGroups: {
        commons: {
          name: "vendor",
          chunks: "all",
          enforce: true,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          minSize: 50000,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
