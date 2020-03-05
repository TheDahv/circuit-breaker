import { RequestOptions } from 'https'
import { expect } from 'chai'

import { Datadog, Dependency, isHealthy } from '../dependency'
import { Result } from '../dependency/datadog'

describe('Dependency', function () {
  describe('isHealthy', function () {
    describe('with no sub-dependencies', function () {
      describe('when resolver returns true', function () {
        it('should return true', async function () {
          const dep = {
            name: 'dep',
            resolver: () => Promise.resolve(true),
            intervalMs: 0,
            dependencies: []
          }

          expect(await isHealthy(dep)).to.be.ok
        })
      })

      describe('when resolver returns false', function () {
        it('should return false', async function () {
          const dep = {
            name: 'dep',
            resolver: () => Promise.resolve(false),
            intervalMs: 0,
            dependencies: []
          }

          expect(await isHealthy(dep)).to.not.be.ok
        })
      })
    })

    describe('with healthy sub-dependencies', function () {
      const subDependency = {
        name: 'sub',
        resolver: () => Promise.resolve(true),
        intervalMs: 0,
        dependencies: []
      }

      describe('with a healthy dependency', function () {
        it('should resolve to true', async function () {
          const dep = {
            name: 'dep',
            resolver: () => Promise.resolve(true),
            intervalMs: 0,
            dependencies: [subDependency]
          }
          expect(await isHealthy(dep)).to.be.ok
        })
      })

      describe('with an unhealthy dependency', function () {
        it('should resolve to false', async function () {
          const dep = {
            name: 'dep',
            resolver: () => Promise.resolve(false),
            intervalMs: 0,
            dependencies: [subDependency]
          }

          expect(await isHealthy(dep)).to.not.be.ok
        })
      })
    })

    describe('with an unhealthy sub-dependency', function () {
      const subDependency = {
        name: 'sub',
        resolver: () => Promise.resolve(false),
        intervalMs: 0,
        dependencies: []
      }

      describe('with a healthy dependency', function () {
        it('should always resolve to unhealthy', async function () {
          const dep = {
            name: 'dep',
            resolver: () => Promise.resolve(true),
            intervalMs: 0,
            dependencies: [subDependency]
          }

          expect(await isHealthy(dep)).to.not.be.ok
        })
      })

      describe('with an unhealthy dependency', function () {
        it('should always resolve to unhealthy', async function () {
          const dep = {
            name: 'dep',
            resolver: () => Promise.resolve(true),
            intervalMs: 0,
            dependencies: [subDependency]
          }

          expect(await isHealthy(dep)).to.not.be.ok
        })
      })
    })

    describe('with dependency cycles', function () {
      it('should resolve and not loop', async function () {
        const red: Dependency = {
          name: 'red',
          resolver: () => Promise.resolve(true),
          dependencies: [],
          intervalMs: 0
        }

        const blue: Dependency = {
          name: 'blue',
          resolver: () => Promise.resolve(true),
          dependencies: [],
          intervalMs: 0
        }

        const green: Dependency = {
          name: 'green',
          resolver: () => Promise.resolve(true),
          dependencies: [],
          intervalMs: 0
        }

        red.dependencies.push(blue)
        blue.dependencies.push(green)
        green.dependencies.push(red)

        expect(await isHealthy(red)).to.be.ok
      })
    })
  })
})

const successFetcher = (_options: RequestOptions): Promise<Result> => {
  return Promise.resolve({
    status: 'success',
    value: {
      overall_state: 'OK'
    }
  })
}
const alertFetcher = (_options: RequestOptions): Promise<Result> => {
  return Promise.resolve({
    status: 'success',
    value: {
      overall_state: 'Alert'
    }
  })
}
const failureFetcher = (_options: RequestOptions): Promise<Result> => {
  return Promise.resolve({
    status: 'failure',
    error: new Error('test error')
  })
}

describe('Datadog Dependency', function () {
  describe('fetchOptions', function () {
    it('should return well-formed request options', function () {
      const dd = new Datadog('datadog', 'api-key', 'app-key', '12345', 0)
      const options = dd.fetchOptions()

      const headers = options.headers
      expect(headers).to.exist
      // Just making typescript happy...
      if (headers) {
        expect(headers['Content-Type']).to.eql('application/json')
        expect(headers['DD-API-KEY']).to.eql('api-key')
        expect(headers['DD-APPLICATION-KEY']).to.eql('app-key')
      }

      expect(options.path).to.eql('/api/v1/monitor/12345')
      expect(options.method).to.eql('GET')
    })
  })

  describe('when Datadog returns expected JSON', function () {
    it('should resolve to true for an OK response', async function () {
      const dd = new Datadog('datadog', '', '', '', 0)
      dd.fetcher = successFetcher
      expect(await dd.resolver()).to.be.ok
    })

    it('should resolve to false for an Alert response', async function () {
      const dd = new Datadog('datadog', '', '', '', 0)
      dd.fetcher = alertFetcher
      expect(await dd.resolver()).to.not.be.ok
    })
  })

  describe('when Datadog is unreachable', function () {
    it('should resolve to true', async function () {
      const dd = new Datadog('datadog', '', '', '', 0)
      dd.fetcher = failureFetcher
      expect(await dd.resolver()).to.be.ok
    })
  })
})
