const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        catalog: path.join(__dirname, 'src', 'app.js')
    },
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js',
    },
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
    ]
};