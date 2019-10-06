// wtf-sdk src module mapping
const fs = require("fs");

module.exports = {
  preset: "ts-jest",
  globals: {
    NODE_ENV: "test",
    "ts-jest": {
      tsConfig: "./tsconfig.test.json",
      babelConfig: true,
    },
  },
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/scripts/jestReporter.js"],
  verbose: true,
  rootDir: "",
  modulePaths: ["<rootDir>/", "<rootDir>/app"],
  moduleFileExtensions: ["ts", "tsx", "js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/hack_modules/"],
  coverageDirectory: "output/coverage",
  coverageReporters: ["cobertura"],
  testRegex: "__tests__/.*_spec.tsx?$",
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFiles: [
    "<rootDir>/app/__tests__/preload.tsx",
    "<rootDir>/app/__tests__/shim.tsx",
    "jest-localstorage-mock",
    "jest-canvas-mock",
  ],
  automock: false,
};
