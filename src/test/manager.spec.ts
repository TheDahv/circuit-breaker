import { expect } from 'chai'

import { Dependency } from '../dependency'
import { Edge, Manager } from '../manager'

describe('Manager', function () {
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
