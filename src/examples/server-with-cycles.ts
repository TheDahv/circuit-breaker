import * as express from 'express'

import { Dependency } from '../dependency'
import { Manager } from '../manager'

const red: Dependency = {
  name: 'red',
  resolver: () => {
    console.log({ log: 'red dependency check', ts: Date.now() })
    return Promise.resolve(Math.random() < 0.5)
  },
  dependencies: [],
  intervalMs: 5 * 1000
}

const blue: Dependency = {
  name: 'blue',
  resolver: () => {
    console.log({ log: 'blue dependency check', ts: Date.now() })
    // Anything that depends on blue should always fail
    return Promise.resolve(false)
  },
  dependencies: [],
  // Checks more often
  intervalMs: 3 * 1000
}

const green: Dependency = {
  name: 'green',
  resolver: () => {
    console.log({ log: 'green dependency check', ts: Date.now() })
    // Anything that depends on green *might* fail if other dependencies fail
    return Promise.resolve(true)
  },
  dependencies: [],
  // Checks less often
  intervalMs: 7 * 1000
}

red.dependencies.push(blue)
blue.dependencies.push(green)
green.dependencies.push(red)

const manager = Manager.get()
manager.register(red)
manager.register(blue)
manager.register(green)

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
