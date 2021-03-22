import { ChromiumBrowser } from 'playwright'
import { Scanner } from '@shirabe/plugin'

import { RunnerOptions } from './scene'

export async function runChromiumScene(
  browser: ChromiumBrowser,
  url: string,
  scanners: Scanner[],
  options?: RunnerOptions,
): Promise<void> {
  const context = await browser.newContext(options?.browserContextOptions)
  const page = await context.newPage()
  const client = await context.newCDPSession(page)

  for (const scanner of scanners) {
    await scanner.beforeLoad(page)
  }

  const unsubscribeFunctions: Array<() => Promise<void>> = []
  for (const scanner of scanners) {
    const unsubscribe = await scanner.cdpSession(client)
    if (unsubscribe !== undefined) {
      unsubscribeFunctions.push(unsubscribe)
    }
  }

  try {
    await page.goto(url, options?.gotoOptions)
  } catch (e) {
    console.error(e)
    await client.detach()
    await page.close()
    return
  }

  await page.waitForLoadState('load')
  for (const scanner of scanners) {
    await scanner.afterLoad(page)
  }

  for (const unsubscribe of unsubscribeFunctions) {
    await unsubscribe()
  }

  await client.detach()
  await page.close()
}
