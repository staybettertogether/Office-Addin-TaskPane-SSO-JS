/* eslint-disable no-undef */

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = [
    {
      devtool: "source-map",
      entry: {
        polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
        taskpane: "./src/taskpane/taskpane.js",
        commands: "./src/commands/commands.js",
        fallbackauthdialog: "./src/helpers/fallbackauthdialog.js",
      },
      resolve: {
        extensions: [".html", ".js"],
        fallback: {
          buffer: require.resolve("buffer/"),
          http: require.resolve("stream-http"),
          https: require.resolve("https-browserify"),
          url: require.resolve("url/"),
        },
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"],
              },
            },
          },
          {
            test: /\.html$/,
            exclude: /node_modules/,
            use: "html-loader",
          },
          {
            test: /\.(png|jpg|jpeg|gif|ico)$/,
            type: "asset/resource",
            generator: {
              filename: "assets/[name][ext][query]",
            },
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin({
          filename: "taskpane.html",
          template: "./src/taskpane/taskpane.html",
          chunks: ["polyfill", "taskpane"],
        }),
        new HtmlWebpackPlugin({
          filename: "commands.html",
          template: "./src/commands/commands.html",
          chunks: ["polyfill", "commands"],
        }),
        new HtmlWebpackPlugin({
          filename: "fallbackauthdialog.html",
          template: "./src/helpers/fallbackauthdialog.html",
          chunks: ["polyfill", "fallbackauthdialog"],
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "assets/*",
              to: "assets/[name][ext][query]",
            },
            {
              from: "manifest*.xml",
              to: "[name]" + "[ext]",
              transform(content) {
                if (dev) {
                  return content;
                } else {
                  return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
                }
              },
            },
          ],
        }),
      ],
    },
    {
      devtool: "source-map",
      target: "node",
      entry: {
        middletier: "./src/middle-tier/app.js",
      },
      output: {
        clean: true,
      },
      externals: [nodeExternals()],
      resolve: {
        extensions: [".js"],
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env"],
              },
            },
          },
        ],
      },
      plugins: [
        new CopyWebpackPlugin({
          patterns: [
            {
              from: ".env",
              to: ".",
            },
          ],
        }),
      ],
    },
  ];

  return config;
};
