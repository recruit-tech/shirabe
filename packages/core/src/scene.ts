import { chromium } from 'playwright'
import { runChromiumScene } from './chromium'

import type { Page, LaunchOptions, BrowserContextOptions } from 'playwright'
import type { Plugin, BrowserInfo, ReportCenter } from '@shirabe/plugin'

export interface SceneRunner {
  run: (url: string) => Promise<void>
  close: () => Promise<void>
  browserInfo: BrowserInfo
}

export interface RunnerOptions {
  launchOptions?: LaunchOptions
  browserContextOptions?: BrowserContextOptions
  gotoOptions?: Parameters<Page['goto']>[1]
}

export async function createChromiumSceneRunner(
  plugins: Plugin[],
  reportCenter: ReportCenter,
  options?: RunnerOptions,
): Promise<SceneRunner> {
  const browser = await chromium.launch(options?.launchOptions)
  const browserInfo: BrowserInfo = {
    name: chromium.name(),
    version: browser.version(),
  }
  return {
    run: async (url: string) => {
      const scanners = plugins.map(plugin =>
        plugin.createScanner(
          reportCenter.createReporter(plugin.name, url, browserInfo),
        ),
      )
      await runChromiumScene(browser, url, scanners, options)
    },
    close: async () => {
      await browser.close()
    },
    browserInfo: browserInfo,
  }
}
