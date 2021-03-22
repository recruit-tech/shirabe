import { Scanner, Plugin } from '@shirabe/plugin'

import type { Page, Reporter, ConsoleMessage } from '@shirabe/plugin'

type ConsoleType =
  | 'log'
  | 'debug'
  | 'info'
  | 'error'
  | 'warning'
  | 'dir'
  | 'dirxml'
  | 'table'
  | 'trace'
  | 'clear'
  | 'startGroup'
  | 'startGroupCollapsed'
  | 'endGroup'
  | 'assert'
  | 'profile'
  | 'profileEnd'
  | 'count'
  | 'timeEnd'

interface ConsoleContent {
  type: ReturnType<ConsoleMessage['type']>
  text: ReturnType<ConsoleMessage['text']>
  location: ReturnType<ConsoleMessage['location']>
}

interface ConsoleOptions {
  watch?: ConsoleType[]
  filter?: (message: ConsoleMessage) => boolean
}

class ConsoleScanner extends Scanner<ConsoleOptions> {
  constructor(
    reporter: Reporter,
    options: ConsoleOptions = {
      watch: ['log', 'debug', 'info', 'error', 'warning'],
      filter: () => true,
    },
  ) {
    super(reporter, options)
  }

  async beforeLoad(page: Page): Promise<void> {
    page.on('console', message => {
      if (this.options?.watch?.includes(message.type() as ConsoleType) !== true)
        return

      if (this.options?.filter?.(message) === false) return

      this.report<ConsoleContent>({
        type: 'console',
        payload: {
          type: message.type(),
          text: message.text(),
          location: message.location(),
        },
      })
    })
  }
}

export class ConsolePlugin extends Plugin<ConsoleOptions> {
  name = 'console-plugin'

  createScanner(reporter: Reporter): Scanner<ConsoleOptions> {
    return new ConsoleScanner(reporter, this.options)
  }
}
