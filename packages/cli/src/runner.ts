import { runChromiumScenes } from './index'
import { createReportCenter } from '@shirabe/plugin'
import path from 'path'

import type { RunnerConfig } from './index'

interface ReportOptions {
  verbose?: boolean
}

type Config = RunnerConfig & { options?: { reportOptions?: ReportOptions } }

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
  const reportCenter = createReportCenter()
  reportCenter.on('report', report => {
    if (config.options.reportOptions?.verbose === true) {
      console.warn(report)
    }
  })
  await runChromiumScenes(reportCenter, config)
  console.log(JSON.stringify(reportCenter.getReports(), undefined, 2))
  process.exit(0)
}

main().catch(console.error)
