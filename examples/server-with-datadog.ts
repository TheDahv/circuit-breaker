import * as express from 'express'

import { Datadog } from '../src/dependency'
import { Manager } from '../src/manager'

const env = process.env
const apiKey = env['DATADOG_API_KEY'] || ''
const appKey = env['DATADOG_APP_KEY'] || ''
const monitorId = env['DATADOG_MONITOR_ID'] || ''

if (!(apiKey && appKey && monitorId)) {
  console.error('set DATADOG_API_KEY, DATADOG_APP_KEY, DATADOG_MONITOR_ID')
  process.exit(1)
}

const monitor = new Datadog(
  'datadog-monitor',
  apiKey,
  appKey,
  monitorId,
  5 * 60 * 1000
)

const m = Manager.get()
m.register(monitor)

const app = express()
app.use(m.middleware())

app.get('/', (req, res) => {
  res.json(
    Array.from(req.circuitBreaker.entries()).reduce(
      (memo, [key, val]) => Object.assign(memo, { [key]: val }),
      {}
    )
  )
})

const port = 3000
app.listen(port, () => console.log(`Listening on ${port}`))
