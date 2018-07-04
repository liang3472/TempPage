const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const SRC_DIR = path.resolve(__dirname, 'src');
const DIST_DIR = path.resolve(__dirname, 'dist');

const isDev = process.env.NODE_ENV === 'development';
const pages = [];
console.log('-------->isDev:'+isDev);

let pluginList = [
  new CleanWebpackPlugin(['dist'], {
    exclude: ['config.js']
  }),
  new HtmlWebpackPlugin({ //根据模板插入css/js等生成最终HTML
    filename: './index.html', //生成的html存放路径，相对于path
    template: `${SRC_DIR}/index.html`, //html模板路径
    inject: 'head', //js插入的位置，true/'head'/'body'/false
    hash: true, //为静态资源生成hash值
    chunks: ['main'],//需要引入的chunk，不配置就会引入所有页面的资源
    minify: { //压缩HTML文件
      removeComments: true, //移除HTML中的注释
      collapseWhitespace: false //删除空白符与换行符
    }
  }),
  new webpack.LoaderOptionsPlugin({
    debug: isDev
  }),
  /*
   new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
   // 当allChunks指定为false时，css loader必须指定怎么处理
   // additional chunk所依赖的css，即指定`ExtractTextPlugin.extract()`
   // 第一个参数`notExtractLoader`，一般是使用style-loader
   // @see https://github.com/webpack/extract-text-webpack-plugin
   allChunks: false
   })
   */
].concat(pages.map(key => new HtmlWebpackPlugin({
  filename: `./${key}.html`,
  template: `${SRC_DIR}/${key}/${key}.html`,
  inject: 'head',
  hash: true,
  chunks: [key],
  minify: {
    removeComments: true,
    collapseWhitespace: false
  }
})));

const entry = {
  main: `${SRC_DIR}/main.js`
};

pages.forEach(key => Object.assign(entry, {
  [key]: `${SRC_DIR}/${key}/${key}.js`
}))

module.exports = {
  entry,

  output: {
    path: DIST_DIR,
    publicPath: './',//'__FAAS_CDN__/',
    filename: 'js/[name].[hash:4].js',
  },

  // debug: isDev,

  plugins: pluginList,

  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
  },

  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2|otf)$/,
        loader: 'url-loader',
        query: { limit: 10000, name: 'img-[sha512:hash:base64:4].[ext]' }
      },
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        query: { cacheDirectory: true },
        include: SRC_DIR,
      },
      {
        test: /\.(css|scss|sass)$/,
        loader: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              parser: 'postcss-scss',
              plugins: (loader) => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('postcss-cssnext')(),
                require('postcss-pxtorem')({
                  rootValue: 75,
                  unitPrecision: 3,
                  propList: ['*'],
                  selectorBlackList: [],
                  replace: true,
                  mediaQuery: false,
                  minPixelValue: 0
                }),
                require('precss')()
              ]
            }
          }
        ]
      },
    ],
  },

  devServer: {
    publicPath: DIST_DIR,
    inline: true,
    open: true,
    stats: {
      cached: false,
      colors: true
    }
  }
};
