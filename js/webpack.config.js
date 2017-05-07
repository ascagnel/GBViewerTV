const path = require('path');
const dist = process.env.DIST === 'true';
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

console.log(`Building in ${dist ? '': 'non-'}production mode...`);

const config = {
    entry: path.resolve(__dirname, './src/application.js'),
    output: {
        filename: 'application.js',
        path: path.resolve(__dirname, 'dist')
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

if (dist) {
    config.plugins.push(new UglifyJSPlugin({
        compress: true
    }));
}

module.exports = config;
