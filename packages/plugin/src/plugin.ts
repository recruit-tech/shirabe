import { Scanner } from './scanner'

import type { Reporter } from './reporter'

export abstract class Plugin<Options extends {} = {}> {
  abstract readonly name: string
  readonly options?: Options

  constructor(options?: Options) {
    this.options = options
  }

  abstract createScanner(reporter: Reporter): Scanner
}
