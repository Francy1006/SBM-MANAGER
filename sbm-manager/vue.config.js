const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
    ],
  },
  // DEV LOCAL
  // COMMENT FOR PROD
  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    https: false,
    webSocketServer: 'ws',
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  }
  // DEV LOCAL
}; 
