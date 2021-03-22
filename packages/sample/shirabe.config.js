const { MixedContentPlugin } = require('@shirabe/mixed-content-plugin')
const { CertificatePlugin } = require('@shirabe/certificate-plugin')
const { ConsolePlugin } = require('@shirabe/console-plugin')
const { devices } = require('playwright')

module.exports = {
  urls: [],
  plugins: [
    new MixedContentPlugin(),
    new CertificatePlugin(),
    new ConsolePlugin(),
  ],
  options: {
    browserContextOptions: {
      // ...devices['Pixel 2 XL'],
      // ignoreHTTPSErrors: true,
    },
    reportOptions: {
      verbose: true,
    },
  }
}
