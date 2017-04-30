const path = require('path');

const config = {
    entry: path.resolve(__dirname, './src/application.js'),
    output: {
        filename: 'application.js',
        path: path.resolve(__dirname, 'dist')
    }
};

module.exports = config;
