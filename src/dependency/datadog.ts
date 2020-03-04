import { request, RequestOptions } from 'https'

import { Dependency as Base } from './dependency'

const DATADOG_HOST = 'api.datadoghq.com'

interface DatadogResponse {
  overall_state: string
}

interface Success {
  status: 'success'
  value: DatadogResponse
}
interface Failure {
  status: 'failure'
  error: Error
}

type Result = Success | Failure

const jsonReq = (options: RequestOptions): Promise<Result> => {
  return new Promise((resolve, reject) => {
    const req = request(options, resp => {
      let data = ''
      resp.setEncoding('utf8')
      resp.on('data', (chunk: string) => (data += chunk))
      resp.on('error', (err: Error) =>
        resolve({ status: 'failure', error: err })
      )
      resp.on('end', () => {
        try {
          const out: DatadogResponse = JSON.parse(data)
          resolve({ status: 'success', value: out })
        } catch (err) {
          resolve({ status: 'failure', error: err })
        }
      })
    })
    req.end()
  })
}

export class Dependency implements Base {
  constructor (
    public name: string,
    private apiKey: string,
    private appKey: string,
    public monitorId: string,
    public intervalMs: number
  ) {
    this.dependencies = []
  }

  public dependencies: Dependency[]

  resolver = async (): Promise<boolean> => {
    // TODO implement Datadog lookup via API
    const resp = await jsonReq({
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.apiKey,
        'DD-APPLICATION-KEY': this.appKey
      },
      hostname: DATADOG_HOST,
      port: 443,
      path: `/api/v1/monitor/${this.monitorId}`,
      method: 'GET'
    })

    switch (resp.status) {
      case 'success':
        return resp.value.overall_state === 'OK'
      case 'failure': {
        console.error({
          log: 'unable to process datadog response',
          error: resp.error
        })
        // We don't want to take down services if we experienced an
        // operational error. We'll only report "false" when we *know* there's
        // a problem
        return true
      }
    }
  }
}
