import { EventEmitter } from 'events'

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
  on: (event: 'report', listener: (report: Report) => void) => void
}

export function createReportCenter(): ReportCenter {
  const reports: Report[] = []
  const emitter = new EventEmitter()
  return {
    getReports: () => reports,
    createReporter: (plugin, url, browser) => ({
      report: risk => {
        const report: Report = { ...risk, plugin, url, browser }
        emitter.emit('report', report)
        reports.push(report)
      },
    }),
    on: (event, listener) => {
      emitter.on(event, listener)
    },
  }
}
