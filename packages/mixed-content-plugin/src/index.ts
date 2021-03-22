import { Scanner, Plugin } from '@shirabe/plugin'

import type {
  CDPSessionListener,
  Page,
  CDPSession,
  Protocol,
  Reporter,
} from '@shirabe/plugin'

interface MixedContentMatcher {
  selector: string
  description: string
}

const matchers: MixedContentMatcher[] = [
  { description: 'non secure image', selector: 'img[src^="http://"]' },
  { description: 'non secure audio', selector: 'audio[src^="http://"]' },
  { description: 'non secure link', selector: 'link[href^="http://"]' },
  { description: 'non secure script', selector: 'script[src^="http://"]' },
  { description: 'non secure iframe', selector: 'iframe[src^="http://"]' },
  { description: 'non secure form', selector: 'form[action^="http://"]' },
  { description: 'non secure source', selector: 'source[src^="http://"]' },
]

interface DOMMixedContent {
  node: string
  description: string
}

interface NetworkMixedContent {
  url: string
}

interface AuditMixedContent extends Protocol.Audits.MixedContentIssueDetails {}

interface MixedContentOptions {
  disable?: {
    network?: boolean
    dom?: boolean
    audits?: boolean
  }
}

class MixedContentScanner extends Scanner<MixedContentOptions> {
  async beforeLoad(page: Page): Promise<void> {
    if (this.options?.disable?.network === true) return

    page.on('request', request => {
      const url = request.url()
      try {
        const { protocol } = new URL(url)
        if (protocol !== 'http:') return
      } catch {
        return
      }
      this.report<NetworkMixedContent>({
        type: 'network',
        payload: {
          url,
        },
      })
    })
  }

  async afterLoad(page: Page): Promise<void> {
    if (this.options?.disable?.dom === true) return

    for (const matcher of matchers) {
      const nodes = await page.$$eval(matcher.selector, elements => {
        return elements.map(element => element.outerHTML)
      })
      for (const node of nodes) {
        this.report<DOMMixedContent>({
          type: 'dom',
          payload: {
            node,
            description: matcher.description,
          },
        })
      }
    }
  }

  async cdpSession(client: CDPSession): Promise<() => Promise<void>> {
    if (this.options?.disable?.audits === true) return async () => {}

    await client.send('Audits.enable')
    const listener: CDPSessionListener<'Audits.issueAdded'> = ({ issue }) => {
      if (issue.code !== 'MixedContentIssue') return
      const details = issue.details?.mixedContentIssueDetails
      if (details === undefined) return
      this.report<AuditMixedContent>({
        type: 'audit',
        payload: details,
      })
    }
    client.on('Audits.issueAdded', listener)
    return async () => {
      client.off('Audits.issueAdded', listener)
      await client.send('Audits.disable')
    }
  }
}

export class MixedContentPlugin extends Plugin<MixedContentOptions> {
  name = 'mixed-content-plugin'

  createScanner(reporter: Reporter): Scanner<MixedContentOptions> {
    return new MixedContentScanner(reporter, this.options)
  }
}
