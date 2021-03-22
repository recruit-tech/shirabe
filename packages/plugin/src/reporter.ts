export interface Risk<Payload = any> {
  type: string
  pluginName?: string
  payload: Payload
}

export interface BrowserInfo {
  readonly name: string
  readonly version: string
}

export interface Report extends Risk<any> {
  readonly browser: BrowserInfo
  readonly plugin: string
  readonly url: string
}

export interface ReportOptions {
  verbose?: boolean
}

export interface Reporter {
  report: <Payload = any>(risk: Risk<Payload>) => void
}

export interface ReportCenter {
  getReports: () => Report[]
  createReporter: (
    plugin: string,
    url: string,
    browser: BrowserInfo,
  ) => Reporter
}

export function createReportCenter(options?: ReportOptions): ReportCenter {
  const reports: Report[] = []
  return {
    getReports: () => reports,
    createReporter: (plugin, url, browser) => ({
      report: risk => {
        const report: Report = { ...risk, plugin, url, browser }
        if (options?.verbose ?? false) {
          console.warn(report)
        }
        reports.push(report)
      },
    }),
  }
}
