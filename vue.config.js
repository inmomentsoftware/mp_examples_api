const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

module.exports = {
  configureWebpack: {
    optimization: {
      splitChunks: false,
      concatenateModules: true
    },
    plugins: [
      new HtmlWebpackInlineSourcePlugin()
    ]
  },
  chainWebpack: config => {
    config
    // That's "webpack-html-plugin"
      .plugin('html')
      .tap(args => {
        // Add the inline source plugin config to embed js/css to HTML directly.
        args[0].title = 'MeetingPulse Attendee API example'
        args[0].inlineSource = '.(js|css)$'
        return args
      })

    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        Object.assign(options, {
          limit: 10240
        })
      })
  }
}
