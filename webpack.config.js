var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin')


const JS_LOADER = 	{
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
};

const loaderRules = [
	{
		test: /\.jsx?$/,
		exclude: /node_modules/,
		use: [JS_LOADER],
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
		use: [
			JS_LOADER,
			{
				loader: "pug-loader"
			}
		]
	},
	{
		test: /\.(jpg|png|gif|svg|eot|woff|woff2|ttf)$/,
		use: [ "url-loader" ]
	},
];

const CONFIG = module.exports = {

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
		rules: loaderRules
	},
	devServer: {
		host: '0.0.0.0',
		port: 9000,
		historyApiFallback: true
	}
};

if (process.env.NODE_ENV === 'production') {
	console.warn(process.env.NODE_ENV);

	CONFIG.devtool = 'source-map';

	CONFIG.plugins.push(
		new webpack.optimize.UglifyJsPlugin()
	);
}