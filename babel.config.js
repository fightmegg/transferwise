const path = require("path");

const env = process.env.BABEL_ENV || process.env.NODE_ENV || "development";
const isEnvDevelopment = env === "development";
const isEnvProduction = env === "production";
const target = process.env.RUN_TARGET || "node"; // either browser or server

const envNodePreset = [
  require.resolve("@babel/preset-env"),
  {
    useBuiltIns: "usage",
    corejs: "3",
    targets: { node: "current" }
  }
];

module.exports = function(api, opts) {
  api.cache(true);
  console.log("Building for:", env, target);

  return {
    presets: [envNodePreset].filter(Boolean)
  };
};
