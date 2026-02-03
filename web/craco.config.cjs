const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins.push(
        new webpack.ContextReplacementPlugin(/sass\/sass.dart.js/, './empty.js')
      );
      return webpackConfig;
    },
  },
};
