const path = require('path');

const config = {
    entry: path.resolve(__dirname, './js/application.js'),
    output: {
        filename: 'application.js',
        path: path.resolve(__dirname, 'docs')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }
        }]
    },
    plugins: []
};

module.exports = config;
