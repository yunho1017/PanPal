module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: "commonjs",
        targets: {
          ie: "10"
        }
      }
    ],
    "@babel/preset-react"
  ],
  plugins: [
    "@loadable/babel-plugin",
    "@babel/plugin-syntax-dynamic-import",
    [
      "@babel/plugin-transform-runtime",
      {
        regenerator: true
      }
    ]
  ],
  env: {
    test: {
      plugins: ["transform-es2015-modules-commonjs", "dynamic-import-node"]
    }
  }
};
