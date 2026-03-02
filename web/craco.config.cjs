const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        stream: require.resolve("stream-browserify"),
        zlib: require.resolve("browserify-zlib"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
        fs: false,
      };

      config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      return config;
    },
  },
};