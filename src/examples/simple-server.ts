import * as express from 'express'

import { Dependency } from '../dependency'
import { Manager } from '../manager'

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
