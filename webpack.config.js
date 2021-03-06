const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// NODE_ENV will be 'production' on heroku, 'test' in testing env, and if neither it will be 'development'
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load test or development env variables
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env.development' });
}

module.exports = (env, argv) => {
  console.log(env);

  return {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
      path: path.join(__dirname, 'public', 'dist'),
      filename: "bundle.js"
    },
    optimization: {
      minimizer: [new UglifyJsPlugin()]
    },  
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: "html-loader",
              options: { minimize: true }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            env !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: "css-loader", options: {
                sourceMap: true
              }
            }, {
              loader: "sass-loader", options: {
                sourceMap: true
            }
          }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: "./src/index.html",
        filename: "../index.html",
        inject: false
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css"
      }),
      new webpack.DefinePlugin({
        // Define global constants here..
      }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'disable',
        generateStatsFile: false
      }),
      new UglifyJsPlugin({
        test: /\.js(\?.*)?$/i
      })
    ],
    devtool: env === "production" ? 'source-map' : 'inline-source-map',
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      // for all 404 pages send back the html file
      historyApiFallback: true,
      publicPath: '/dist/'
    }
  };
}