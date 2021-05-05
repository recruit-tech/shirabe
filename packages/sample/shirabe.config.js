const { MixedContentPlugin } = require('@shirabe/mixed-content-plugin')
const { CertificatePlugin } = require('@shirabe/certificate-plugin')
const { ConsolePlugin } = require('@shirabe/console-plugin')
const { devices } = require('playwright')

/** @type {import('@shirabe/cli').RunnerConfig} */
const config = {
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

module.exports = config
