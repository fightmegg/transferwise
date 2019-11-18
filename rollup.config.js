import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default [
  {
    input: "index.js",
    external: ["node-fetch", "querystring"],
    output: {
      file: "dist/index.js",
      format: "cjs"
    },
    plugins: [
      resolve(),
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  },
  {
    input: "index.js",
    external: ["node-fetch", "querystring"],
    output: {
      file: "dist/index.esm.js",
      format: "esm"
    },
    plugins: [
      resolve(),
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  }
];
