import { createChromiumSceneRunner } from '@shirabe/core'
import { createReportCenter } from '@shirabe/plugin'
import path from 'path'

import type { Plugin } from '@shirabe/plugin'
import { RunnerOptions } from '@shirabe/core/dist/scene'

export interface Config {
  urls?: string[]
  plugins?: Plugin[]
  options?: RunnerOptions
}

const DEFAULT_CONFIG: Required<Config> = {
  urls: [],
  plugins: [],
  options: {},
}

function getUserDefinedConfig(): Required<Config> {
  const configPath = require.resolve(path.resolve('shirabe.config.js'))
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config: Config = require(configPath)
  return { ...DEFAULT_CONFIG, ...config }
}

async function main(): Promise<void> {
  const config = getUserDefinedConfig()
  const reportCenter = createReportCenter(config.options.reportOptions)
  const chromiumSceneRunner = await createChromiumSceneRunner(
    config.plugins,
    reportCenter,
    config.options,
  )

  console.warn(chromiumSceneRunner.browserInfo)

  for (const url of config.urls) {
    console.warn(url)
    await chromiumSceneRunner.run(url)
  }
  await chromiumSceneRunner.close()
  console.log(JSON.stringify(reportCenter.getReports(), undefined, 2))
  process.exit(0)
}

main().catch(console.error)
