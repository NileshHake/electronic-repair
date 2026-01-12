module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 🚀 BIG SPEED BOOST: Persistent filesystem cache
      webpackConfig.cache = {
        type: "filesystem",
      };

      // ❌ Suppress annoying source map warnings
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules/,
          message: /Failed to parse source map/,
        },
      ];

      return webpackConfig;
    },
  },

  style: {
    sass: {
      loaderOptions: {
        sassOptions: {
          // ⚡ Ignore Bootstrap / dependency sass warnings
          quietDeps: true,
        },
      },
    },
  },

  eslint: {
    enable: true, // keep enabled (or disable for more speed)
    mode: "extends",
    configure: (eslintConfig) => {
      eslintConfig.rules["eqeqeq"] = "off";
      return eslintConfig;
    },
  },
};
