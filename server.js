require('dotenv').config({ path: '.env.development.local' }); // Load environment variables

const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const edgeConfigRouter = require('./src/api/edgeConfig');


const app = express();
const port = process.env.PORT || 3000;

// 更新 webpack 配置
const webpackConfig = {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client?reload=true', // 添加 reload=true
    './src/index.js'
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.jsx'] // 添加文件扩展名解析
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]
};

const compiler = webpack(webpackConfig);

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 处理环境变量
app.use((req, res, next) => {
  // 替换 URL 中的环境变量
  if (req.url.includes('%PUBLIC_URL%')) {
    req.url = req.url.replace(/%PUBLIC_URL%/g, '');
  }
  next();
});

// Webpack 中间件配置
app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
  writeToDisk: true // 添加这个选项
}));

app.use(webpackHotMiddleware(compiler));

// Add this middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.use('/api', edgeConfigRouter);

// 处理所有路由，返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 