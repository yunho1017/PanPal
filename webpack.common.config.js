const webpack = require("webpack");
const HappyPack = require("happypack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const sassVars = require(__dirname + "/app/styleVariables.json");
const sass = require("node-sass");
const sassUtils = require("node-sass-utils")(sass);
const path = require("path");

const convertStringToSassDimension = function(result) {
  // Only attempt to convert strings
  if (typeof result !== "string") {
    return result;
  }
  const cssUnits = [
    "rem",
    "em",
    "vh",
    "vw",
    "vmin",
    "vmax",
    "ex",
    "%",
    "px",
    "cm",
    "mm",
    "in",
    "pt",
    "pc",
    "ch",
  ];
  const parts = result.match(/[a-zA-Z]+|[0-9]+/g);
  const value = parts[0];
  const unit = parts[parts.length - 1];
  if (cssUnits.indexOf(unit) !== -1) {
    result = new sassUtils.SassDimension(parseInt(value, 10), unit);
  }
  return result;
};

const babelLoaderNodeModules = ["react-intl", "xmlbuilder"];

module.exports = {
  resolve: {
    modules: ["node_modules"],
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    symlinks: false,
    alias: {
      webworkify: "webworkify-webpack-dropin",
      react: require.resolve("react"),
    },
    plugins: [new TsconfigPathsPlugin()],
  },
  externals: {
    "react/lib/ExecutionEnvironment": true,
    "react/lib/ReactContext": true,
    "react/addons": true,
  },
  module: {
    rules: [
      {
        test: /\.worker\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "worker-loader",
            options: {
              inline: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: new RegExp(
          `node_modules/(?!(${babelLoaderNodeModules.join("|")})/).*`,
        ),
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.tsx?$/,
        exclude: new RegExp(
          `node_modules/(?!(${babelLoaderNodeModules.join("|")})/).*`,
        ),
        use: "happypack/loader?id=ts-build",
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              minimize: true,
              localIdentName: "[name]__[local]__[hash:base64:3]",
            },
          },
        ],
      },
      {
        test: /common\/icons\/.*?\.svg$/,
        use: [
          {
            loader: "svg-sprite-loader",
            options: {
              classPrefix: false,
              idPrefix: true,
            },
          },
          { loader: "image-webpack-loader" },
        ],
      },
      {
        test: /\.html$/,
        use: ["raw-loader"],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    new HappyPack({
      id: "ts-build",
      threads: require("os").cpus().length - 1,
      loaders: [
        {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
        {
          loader: "ts-loader",
          options: {
            happyPackMode: true,
            transpileOnly: true,
          },
        },
      ],
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(
      /react-intl[\\\/]locale-data$/,
      /^\.\/(en|ko)$/,
    ),
  ],
};
