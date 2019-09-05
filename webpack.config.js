const path = require('path');
const HtmlWP = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  devServer: {
    allowedHosts: [
      'host.com',
      'subdomain.host.com',
      'subdomain2.host.com',
      'localhost:8000',
      'www.baidu.com'
    ],
    contentBase: './dist/',
    before: function(app, server) {
      app.get('/some/path', function(req, res) {
        res.json({ custom: 'response' });
      });
    }
  },
  plugins: [
    new HtmlWP({
      template: './index.html',
      filename: 'demo.html'
    })
  ]
};
