import babel from "rollup-plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "index.js",
  external: ["crypto", "node-fetch", "querystring"],
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
      exports: "default",
    },
    {
      file: "dist/index.esm.js",
      format: "esm",
      exports: "default",
    },
  ],
  plugins: [
    nodeResolve(),
    babel({
      exclude: /node_modules/,
    }),
    terser(),
  ],
};
