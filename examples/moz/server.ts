import * as express from 'express'

import { Dependency } from '../../src/dependency'
import { Manager } from '../../src/manager'

const hbase: Dependency = {
  name: 'hbase',
  resolver: () => {
    // TODO implement
    return Promise.resolve(true)
  },
  dependencies: [],
  intervalMs: 5 * 60 * 1000
}

const silo: Dependency = {
  name: 'silo',
  resolver: () => {
    // TODO implement
    return Promise.resolve(true)
  },
  dependencies: [hbase],
  intervalMs: 5 * 60 * 1000
}

const grepwords: Dependency = {
  name: 'grepwords',
  resolver: () => {
    // TODO implement
    return Promise.resolve(true)
  },
  dependencies: [],
  intervalMs: 60 * 1000
}

const manager = Manager.get()
manager.register(hbase, silo, grepwords)

const app = express()
app.use(manager.middleware())
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
