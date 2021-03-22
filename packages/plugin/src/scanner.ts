import { CDPSession, Page } from 'playwright'
import { Reporter, Risk } from './reporter'

export abstract class Scanner<Options extends {} = {}> {
  reporter: Reporter
  options?: Options

  constructor(reporter: Reporter, options?: Options) {
    this.reporter = reporter
    this.options = options
  }

  report<Payload = any>(risk: Risk<Payload>): void {
    this.reporter.report(risk)
  }

  async beforeLoad(_: Page): Promise<void> {}
  async afterLoad(_: Page): Promise<void> {}

  async cdpSession(_: CDPSession): Promise<() => Promise<void>> {
    return async () => {}
  }
}
