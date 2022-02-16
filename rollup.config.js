/* eslint-disable @typescript-eslint/no-var-requires */
// rollup.config.js
import babel from "@rollup/plugin-babel"
const { nodeResolve } = require("@rollup/plugin-node-resolve")
const commonjs = require("@rollup/plugin-commonjs")
const replace = require("@rollup/plugin-replace")
const json = require("@rollup/plugin-json")
const { terser } = require("rollup-plugin-terser")
// rollup.config.js
const env = process.env.NODE_ENV
const isProduction = env === "production"

const plugins = [
  // avoids issues with the Node-specific variable `process`.
  replace({
    "process.env.NODE_ENV": JSON.stringify(env),
    preventAssignment: true,
  }),
  nodeResolve({ browser: true }),
  // eslint({
  //   fix: true,
  //   exclude: ["./node_modules/**", "./src/styles/**"],
  // }),
  json(),
  babel({
    exclude: "node_modules/**",
    extensions: [".js", ".ts"],
    babelHelpers: "bundled",
  }),
  commonjs({ extensions: [".js", ".ts", ".json"] }),
]

if (isProduction) {
  plugins.push(terser())
}

module.exports = [
  {
    input: "./lib/index.ts",
    plugins,
    output: {
      file: "./scripts/module.js",
      format: "iife",
      name: "lib",
      sourcemap: true,
    },
  },
]
