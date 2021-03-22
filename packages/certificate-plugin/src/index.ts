import { Reporter, Scanner, Plugin } from '@shirabe/plugin'

import type { CDPSessionListener, CDPSession, Protocol } from '@shirabe/plugin'

interface CertificateValidityPeriodPayload
  extends Protocol.Network.SecurityDetails {
  url: string
  dayPeriod: number
}

interface CertificateExpirePayload extends Protocol.Network.SecurityDetails {
  url: string
  daysLeft: number
}

interface CertificateIssuerPayload extends Protocol.Network.SecurityDetails {
  url: string
}

interface CertificateOptions {
  authorities?: string[]
  daysLeft?: number
}

const AFFECTED_BOUNDARY_TIME = new Date(
  '2020-09-01 00:00:00 GMT+0000',
).getTime()

const DAY = 24 * 60 * 60
class CertificateScanner extends Scanner<CertificateOptions> {
  async cdpSession(client: CDPSession): Promise<() => Promise<void>> {
    await client.send('Network.enable')
    const listener: CDPSessionListener<'Network.responseReceived'> = ({
      response,
    }) => {
      if (response.securityDetails === undefined) return
      const { issuer, validFrom, validTo } = response.securityDetails

      // We recommend that certificates be issued with a maximum validity of 397 days.
      // Ref. https://support.apple.com/en-us/HT211025
      if (
        validFrom >= AFFECTED_BOUNDARY_TIME &&
        validTo - validFrom > 397 * DAY
      ) {
        this.report<CertificateValidityPeriodPayload>({
          type: 'certificateValidLimit',
          payload: {
            ...response.securityDetails,
            url: response.url,
            dayPeriod: Math.ceil((validTo - validFrom) / DAY),
          },
        })
      }
      const expiredTime = Math.min(validTo - validFrom, 398 * DAY) + validFrom

      const daysLeft = Math.ceil((expiredTime - Date.now() / 1000) / DAY)
      if (daysLeft <= (this.options?.daysLeft ?? 365)) {
        this.report<CertificateExpirePayload>({
          type: 'certificateExpire',
          payload: {
            ...response.securityDetails,
            url: response.url,
            daysLeft,
          },
        })
      }

      if (this.options?.authorities?.includes(issuer) === true) {
        this.report<CertificateIssuerPayload>({
          type: 'certificateIssuer',
          payload: {
            ...response.securityDetails,
            url: response.url,
          },
        })
      }
    }

    client.on('Network.responseReceived', listener)
    return async () => {
      client.off('Network.responseReceived', listener)
      await client.send('Network.disable')
    }
  }
}

export class CertificatePlugin extends Plugin<CertificateOptions> {
  name = 'certificate-plugin'

  createScanner(reporter: Reporter): Scanner<CertificateOptions> {
    return new CertificateScanner(reporter, this.options)
  }
}
