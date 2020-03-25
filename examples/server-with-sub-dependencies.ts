import * as express from 'express'
import { Dependency } from '../src/dependency'
import { Manager } from '../src/manager'
import { server } from '../src/server'

const featureA: Dependency = {
  name: 'feature-a',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
const featureASub1: Dependency = {
  name: 'feature-a-sub-1',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
const featureASub2: Dependency = {
  name: 'feature-a-sub-2',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
const featureASub3: Dependency = {
  name: 'feature-a-sub-3',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
featureA.dependencies.push(featureASub1, featureASub2, featureASub3)

const featureB: Dependency = {
  name: 'feature-b',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
const featureBSub1: Dependency = {
  name: 'feature-b-sub-1',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
const featureBSub2: Dependency = {
  name: 'feature-b-sub-2',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
const featureBSub3: Dependency = {
  name: 'feature-b-sub-3',
  intervalMs: 0,
  resolver: () => Promise.resolve(true),
  dependencies: []
}
featureB.dependencies.push(featureBSub1, featureBSub2, featureBSub3)

const manager = Manager.get()
manager.register(undefined, featureA, featureB)

const app = express()
app.use(manager.middleware())

app.get('/circuit-breaker/dependencies', (req, res) => {
  res.json(manager.adjacencyList())
})

const adminPrefix = '/admin/circuit-breaker'
app.use(adminPrefix, server(manager, adminPrefix))

app.get('/', (req, res, next) => {
  res.json(
    Array.from(req.circuitBreaker.entries()).reduce(
      (memo, [key, val]) => Object.assign(memo, { [key]: val }),
      {}
    )
  )
})

const port = 3000
app.listen(port, () => console.log(`Listening on ${port}`))
