import * as dd from '../../src/dependency'

const siloQueue = new dd.Datadog(
  'silo-queue',
  'f1e1d19c7e8dd71271f77e14c2a0212b',
  '5aaf53240ef3ef9e833a53f12b681e9bedbda2fb',
  '10704399',
  10 * 60 * 1000
)
const run = async () => {
  const resp = await siloQueue.resolver()
  console.log({ resp })
}

run()
