import { expect } from 'chai'

import { Dependency, isHealthy } from '../dependency'

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
