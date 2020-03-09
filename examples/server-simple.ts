import * as express from 'express'
import { Dependency } from '../src/dependency'
import { Manager } from '../src/manager'
import { server } from '../src/server'

const dependency: Dependency = {
  name: 'test',
  resolver: () => {
    console.log({ log: 'test dependency check', ts: Date.now() })
    return Promise.resolve(Math.random() < 0.5)
  },
  dependencies: [],
  intervalMs: 5 * 1000
}

const manager = Manager.get()
manager.register(dependency)

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
