// Webpack uses this to work with directories
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

// This is the main configuration object.
// Here, you write different options and tell Webpack what to do
module.exports = {
  // Path to your entry point. From this file Webpack will begin its work
  entry: "./src/script/index.ts",

  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
  output: {
    path: path.resolve(__dirname, "public/dist"),
    publicPath: "",
    filename: "bundle.js",
  },
  plugins: [new NodePolyfillPlugin()],

  resolve: {
    extensions: [".js", ".ts"],
    fallback: {
      // path: require.resolve("path-browserify"),
      fs: false,
    },
    modules: [path.join(__dirname, "./node_modules")],
  },

  // Default mode for Webpack is production.
  // Depending on mode Webpack will apply different things
  // on the final bundle. For now, we don't need production's JavaScript
  // minifying and other things, so let's set mode to development
  mode: "development",

  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
