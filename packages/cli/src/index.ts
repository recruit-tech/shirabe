import { createChromiumSceneRunner } from '@shirabe/core'
import { ReportCenter } from '@shirabe/plugin'

import type { Plugin } from '@shirabe/plugin'
import type { RunnerOptions } from '@shirabe/core'

export interface RunnerConfig {
  urls?: string[]
  plugins?: Plugin[]
  options?: RunnerOptions
}

export async function runChromiumScenes(
  reportCenter: ReportCenter,
  config: RunnerConfig,
): Promise<void> {
  const chromiumSceneRunner = await createChromiumSceneRunner(
    config.plugins ?? [],
    reportCenter,
    config.options,
  )

  console.warn(chromiumSceneRunner.browserInfo)

  for (const url of config.urls ?? []) {
    console.warn(url)
    await chromiumSceneRunner.run(url)
  }
  await chromiumSceneRunner.close()
}
