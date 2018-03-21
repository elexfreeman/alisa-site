const NODE_ENV = process.env.NODE_ENV || 'development';

const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');
module.exports = {
    context: __dirname + "/src",
    entry: {
        catalog: './app.js'
        ,product: './product.js'
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        library: '[name]',
    },

    watch: NODE_ENV == 'development',

    watchOptions: {
        aggregateTimeout: 100
    },

    devtool: NODE_ENV == 'development' ? "cheap-inline-module-source-map" : null,

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loaders: ["babel-loader"] },
        ],
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ["css-loader?-minimize", 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css')
        ,new webpack.optimize.CommonsChunkPlugin({
            name: "common"
        }),
        new webpack.ProvidePlugin({
            $: "jquery/dist/jquery.min.js",
            jQuery: "jquery/dist/jquery.min.js",
            "window.jQuery": "jquery/dist/jquery.min.js"
        })
    ]
};