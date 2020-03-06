/**
 * @packageDocumentation
 * @module dependency/datadog
 */

import { request, RequestOptions } from 'https'

import { Dependency as Base } from './dependency'

const DATADOG_HOST = 'api.datadoghq.com'

/**
 * # Datadog Dependency
 *
 * [Datadog Monitors](https://docs.datadoghq.com/monitors/monitor_types/) are a
 * fantastic way to monitor a resource, specify thresholds that determine
 * health, and report in an automated way.
 *
 * If you already use Datadog, this is an easy way to build a dependency against
 * an existing Monitor.
 *
 * ## Usage
 *
 * Make sure you already have a Datadog Monitor set up. You will need to
 * configure
 * [credentials](https://docs.datadoghq.com/api/?lang=bash#authentication) to
 * interact with the API.
 *
 * Then find the ID of the monitor you want to use as a
 * dependency. It will be in the Properties section of the Datadog Monitor
 * dashboard labeled as the "ID" field.
 *
 * Once you have all that, create a Datadog Dependency and the class will do the
 * rest for you.
 */
export class Dependency implements Base {
  /**
   * @param name The identifier for the dependency in your dependency graph
   * @param apiKey The authentication key used to communicate with the Datadog
   * API
   * @param appKey The key that identifies your integration with Datadog
   * @param monitorId The ID for the Monitor we will watch to determine health
   * @param intervalMs How often to check the Datadog Monitor in milliseconds
   */
  constructor (
    public name: string,
    private apiKey: string,
    private appKey: string,
    public monitorId: string,
    public intervalMs: number
  ) {
    this.dependencies = []
  }

  /**
   * fetcher determines how we obtain information from a monitor.
   *
   * This is only useful in the event that you want to override the default
   * [[DatadogFetcher]], such as when writing tests
   */
  public fetcher?: DatadogFetcher

  /**
   * Allows Datadog to implement the [[Dependency]] interface. Not really
   * relevant here.
   */
  public dependencies: Dependency[]

  /**
   * See https://docs.datadoghq.com/api/?lang=bash#get-a-monitor-s-details
   *
   * @returns request configuration to talk to Datadog based on the instance
   * properties
   */
  public fetchOptions (): RequestOptions {
    return {
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': this.apiKey,
        'DD-APPLICATION-KEY': this.appKey
      },
      hostname: DATADOG_HOST,
      port: 443,
      path: `/api/v1/monitor/${this.monitorId}`,
      method: 'GET'
    }
  }

  /**
   * Automates the commmunication with Datadog to fetch a monitor's details and
   * parse its response to determine health.
   *
   * **NOTE** if the dependency cannot communicate with Datadog, it falls back
   * to a false positive. Issues with Datadog will not cause a service to change.
   *
   * You * *should* watch for logs and otherwise monitor your communication with
   * Datadog independently of Circuit Breaker.
   *
   * @returns A healthy status if the `overall_state` value of the response is
   * "OK"
   */
  resolver = async (): Promise<boolean> => {
    const fetch = this.fetcher || HttpFetcher
    const resp = await fetch(this.fetchOptions())

    // Note, available responses are OK, Alert, Warn, No Data
    // TODO Decide whether to default to False Positive on No Data
    switch (resp.status) {
      case 'success':
        return resp.value.overall_state === 'OK'
      case 'failure': {
        // TODO replace with injectable logger
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

/**
 * DatadogResponse describes the fields of interest from the Datadog API
 * response when calling the Monitor Details endpoint.
 *
 * We are only interested in the `overall_state` field to determine health.
 */
interface DatadogResponse {
  overall_state: string
}

/**
 * Success models a successful communication with the Datadog API and its parsed
 * response.
 */
interface Success {
  status: 'success'
  value: DatadogResponse
}
/**
 * Failure indicates an issue communicating with the Datadog API and the details
 * of that failure.
 */
interface Failure {
  status: 'failure'
  error: Error
}

/**
 * Result models a common failure when working with an operation that might
 * fail.
 *
 * Consuming code that deals with a Result is forced to handle both cases to
 * successfully compile.
 */
export type Result = Success | Failure

/**
 * Describes a function that knows how to fetch a Datadog Monitor Details
 * response.
 *
 * This is useful in situations where you want to supply your own DatadogFetcher
 * to override the behavior of the default [[HttpFetcher]]
 */
interface DatadogFetcher {
  (options: RequestOptions): Promise<Result>
}

/**
 * The default [[DatadogFetcher]] implementation that makes an authenticated
 * request to the Datadog API.
 *
 * It is responsible for parsing the JSON response and converting it into a
 * value useful for determining health.
 */
const HttpFetcher = (options: RequestOptions): Promise<Result> => {
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
