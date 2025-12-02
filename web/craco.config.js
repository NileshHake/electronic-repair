module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress all source map warnings from node_modules
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
          // Ignore deprecation warnings in Sass (bootstrap, etc.)
          quietDeps: true,
        },
      },
    },
  },
  eslint: {
    enable: true,
    mode: "extends",
    configure: (eslintConfig) => {
      // Suppress eqeqeq warnings globally (optional)
      eslintConfig.rules["eqeqeq"] = "off";
      return eslintConfig;
    },
  },
};
