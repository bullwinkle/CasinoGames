var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var loaders = [
	{
		test: /\.jsx?$/,
		exclude: /node_modules/,
		loader: "babel-loader",
		query: {
			presets: [
				"babel-preset-es2015",
				"babel-preset-stage-0"
			],
			plugins: [
				"babel-plugin-transform-decorators-legacy"
			]
		}
	},
	{
		test: /\.css$/,
		use: [
			{ loader: 'style-loader', options: { sourceMap: true } },
			{ loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
			{ loader: 'postcss-loader', options: { sourceMap: true } }
		]
	},
	{
		test: /\.scss?$/,
		use: [
			{ loader: 'style-loader', options: { sourceMap: true } },
			{ loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
			{ loader: 'postcss-loader', options: { sourceMap: true } },
			{ loader: 'sass-loader', options: { sourceMap: true } }
		]
	},
	{
		test: /\.html?$/,
		use: {
			loader: "html-loader",
			options: {
				attrs: ['link:href','img:src']
			}
		}
	},
	{
		test: /\.pug?$/,
		loader: "pug-loader"
	},
	{
		test: /\.(jpg|png|gif|svg|eot|woff|woff2|ttf)$/,
		use: [ "url-loader" ]
	},
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
		extensions: [ '.ts', '.tsx', '.js', '.jsx' ],
		modules: [path.resolve('src'),'node_modules']
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve('src', 'index.html'),
			filename: 'index.html',
			inject: false
		}),
		new webpack.DefinePlugin({
			'process.env': JSON.stringify(process.env)
		}),
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

if (process.env.NODE_ENV === 'production') {
	module.exports.plugins.push(new UglifyJSPlugin());
}
