import { expect } from 'chai'

import { Dependency } from '../src/dependency'
import { Edge, Manager } from '../src/manager'

describe('Manager', function () {
  describe('get', function () {
    it('should return the same instance every time', function () {
      const ref1 = Manager.get()
      const ref2 = Manager.get()

      expect(ref1).to.eql(ref2)
    })
  })

  describe('register', function () {
    beforeEach(function () {
      this.m = Manager.get()
    })

    afterEach(function () {
      this.m.shutdown()
    })

    it('should return the number of registered dependencies', function () {
      const dep1: Dependency = {
        name: 'dep1',
        intervalMs: 0,
        resolver: () => Promise.resolve(true),
        dependencies: []
      }
      const dep2: Dependency = {
        name: 'dep2',
        intervalMs: 0,
        resolver: () => Promise.resolve(true),
        dependencies: []
      }

      this.m.register(dep1, dep2)
      expect(this.m.size()).to.eql(2)
    })

    it('should not add a dependency twice', function () {
      const dep: Dependency = {
        name: 'dep',
        intervalMs: 0,
        resolver: () => Promise.resolve(true),
        dependencies: []
      }

      this.m.register(dep)
      this.m.register(dep)

      expect(this.m.size()).to.eql(1)
    })
  })

  describe('shutdown', function () {
    it('should clear out dependencies', function () {
      const m = Manager.get()
      m.register({
        name: 'dependency',
        intervalMs: 0,
        resolver: () => Promise.resolve(true),
        dependencies: []
      })

      expect(m.size()).to.eql(1)
      m.shutdown()
      expect(m.size()).to.eql(0)
    })

    it('should create a new manager on next request', function () {
      const m1 = Manager.get()
      m1.shutdown()
      const m2 = Manager.get()
      expect(m1).to.not.equal(m2)
    })
  })

  describe('adjacencyList', function () {
    describe('when there is only one dependency', function () {
      before(function () {
        this.m = Manager.get()
        const d: Dependency = {
          name: 'dependency',
          resolver: () => Promise.resolve(true),
          intervalMs: 0,
          dependencies: []
        }

        this.m.register(d)
        this.actual = this.m.adjacencyList()
      })

      after(function () {
        this.m.shutdown()
      })

      it('should have one entry', function () {
        expect(this.actual.length).equal(1)
      })

      it('should contain a mapping from the root to the test entry', function () {
        const expected: Edge = { source: 'root', target: 'dependency' }
        const actual = this.actual[0]
        expect(actual).to.eql(expected)
      })
    })

    describe('when dependencies have cycles', function () {
      before(function () {
        const red: Dependency = {
          name: 'red',
          resolver: () => Promise.resolve(false),
          dependencies: [],
          intervalMs: 0
        }

        const blue: Dependency = {
          name: 'blue',
          resolver: () => Promise.resolve(false),
          dependencies: [],
          intervalMs: 0
        }

        const green: Dependency = {
          name: 'green',
          resolver: () => Promise.resolve(false),
          dependencies: [],
          intervalMs: 0
        }

        red.dependencies.push(blue)
        blue.dependencies.push(green)
        green.dependencies.push(red)

        this.m = Manager.get()
        this.m.register(red)
        this.m.register(blue)
        this.m.register(green)

        this.actual = this.m.adjacencyList()
      })

      after(function () {
        this.m.shutdown()
      })

      it('should have multiple entries', function () {
        expect(this.actual.length).equal(6)
      })

      it('should contain a mapping from the root to dependencies', function () {
        const edges = this.actual.filter((edge: Edge) => edge.source === 'root')
        expect(edges.length).to.eql(3)
      })

      it('each dependency should map to its dependencies once', function () {
        const edges = this.actual
          .filter((edge: Edge) => edge.source !== 'root')
          .reduce((memo: { [key: string]: Edge[] }, edge: Edge) => {
            const existing: Edge[] = memo[edge.source] || []
            return Object.assign(memo, {
              [edge.source]: existing.concat([edge])
            })
          }, {})

        expect(edges.red.length).to.eql(1)
        expect(edges.green.length).to.eql(1)
        expect(edges.blue.length).to.eql(1)

        expect(edges.red[0].target).to.eql('blue')
        expect(edges.green[0].target).to.eql('red')
        expect(edges.blue[0].target).to.eql('green')
      })
    })
  })
})
