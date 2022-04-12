const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); //增加导入webpack
module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry:['./src/index.js', ], //在entry字段中添加触发文件配置
    output: {
      publicPath: "/",
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
      sourceMapFilename: "main.js.map",
    },

    // 将 jsx 添加到默认扩展名中，省略 jsx
    resolve: {
       extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx']
    },
    devServer: {
        hot: true, //在devServer中增加hot字段
        contentBase: path.join(__dirname, './src/'),
        publicPath: '/',
        historyApiFallback: true, 
        host: '127.0.0.1',
        port: 3001,
        stats: {
            colors: true
        },

        proxy: {
          '/api': {
            target: 'http://127.0.0.1:8000',
            changeOrigin: true,
            ws:false,
            rewrite: (pathStr)=>pathStr.replace('/api', '/api'),
            timeout:5000,
          },
          '/upload': {
             target: 'http://127.0.0.1:8000',
             changeOrigin: true,
             ws: false,
             rewrite: (pathStr) => pathStr.replace('/api', ''),
             timeout: 5000,
          },
        },
    },
    
    plugins: [
         // plugins中增加下面内容，实例化热加载插件
         new webpack.HotModuleReplacementPlugin(),
       		new htmlWebpackPlugin({
	            template: 'public/index.html',
		          filename: 'index.html',
	            inject: true
	        })
    ],
    module: {
       	rules: [
            {
               test: /\.jsx?$/, // jsx/js文件的正则
               exclude: /node_modules/, // 排除 node_modules 文件夹
               use: {
                   // loader 是 babel
                   loader: 'babel-loader',
                   options: {
                       // babel 转义的配置选项
                       babelrc: false,
                       presets: [
                           // 添加 preset-react
                           require.resolve('@babel/preset-react'),
                           [require.resolve('@babel/preset-env'), {modules: false}]
                       ],
                       cacheDirectory: true
                   }
               }
            },
            { test:/\.css$/,use:['style-loader', 'css-loader']},//配置处理.css文件的第三方loader规则
            { test:/\.less$/,use:['style-loader','css-loader','less-loader']},
            { test:/\.scss$/,use:['style-loader','css-loader','sass-loader']},
            { test:/\.(jpg|png|gif|bmp|jpeg)$/, use:'url-loader?limit=1000&name=[hash:8]-[name].[ext]'},
       ]
    }

};