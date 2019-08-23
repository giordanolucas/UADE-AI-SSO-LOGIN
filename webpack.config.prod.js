const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

process.env.NODE_ENV = "production";

module.exports = {
  mode: "production",
  target: "web",
  entry: "./src/index",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "bundle.js"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }),
    new webpack.DefinePlugin({
      "process.env.SSO_URL": JSON.stringify(
          "https://uade-sso-users-api.herokuapp.com/api"
      ),
      "process.env.MANAGEMENT_URL": JSON.stringify(
          "https://uade-sso-management-api.herokuapp.com/api"
      )
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      favicon: "src/resources/favicon.ico",
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader", "eslint-loader"]
      },
      {
        test: /(\.css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("cssnano")],
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.(svg|png|jpg|jpeg|gif)$/,
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  }
};
