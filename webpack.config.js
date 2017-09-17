var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var loaders = [
	{
		"test": /\.jsx?$/,
		"exclude": /node_modules/,
		"loader": "babel-loader",
		"query": {
			"presets": [
				"babel-preset-es2015",
				"babel-preset-stage-0"
			],
			"plugins": [
				"babel-plugin-transform-decorators-legacy"
			]
		}
	},
	{
		"test": /\.css?$/,
		"loader": "style-loader!css-loader"
	},
	{
		"test": /\.scss?$/,
		"loader": "style-loader!css-loader!sass-loader"
	},
	{
		"test": /\.pug?$/,
		"loader": "pug-loader"
	}
];

module.exports = {
	devtool: 'eval-source-map',
	entry: path.resolve('src', 'main.js'),
	output: {
		path: path.resolve('dist'),
		filename: 'main.js',
		publicPath: '/'
	},
	resolve: {
		extensions: [ '.ts', '.tsx', '.js', '.jsx' ]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve('src', 'index.html'),
			filename: 'index.html',
			inject: false
		})
	],
	module: {
		loaders: loaders
	},
	devServer: {
		host: '0.0.0.0',
		port: 9000,
		historyApiFallback: true
	}
};
