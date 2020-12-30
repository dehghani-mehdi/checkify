const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const DEBUG = typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV === "development";

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        'jquery.checkify': './js/jquery.checkify.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: DEBUG ? '[name].js' : '[name].min.js',
        publicPath: ""
    },
    resolve: {
        extensions: ['.js']
    },
    devtool: 'source-map',
    mode: DEBUG ? 'development' : 'production',
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
        },
        {
            test: /\.scss$/,
            loaders: DEBUG
                ? ['style-loader', 'css-loader?sourceMap', 'postcss-loader', 'sass-loader?sourceMap']
                : [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader']
        }]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true
            }),
            new OptimizeCssAssetsPlugin()
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].min.css",
            allChunks: true
        })        
    ]
}