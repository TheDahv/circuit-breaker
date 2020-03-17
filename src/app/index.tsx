import * as React from 'react'
import * as ReactDOM from 'react-dom'

import useInterval from './hooks/useInterval'
import { Admin } from './pages/Admin'
import { server as serverConfig } from '../constants'

/**
 * Extends the window object to pick up configuration values written by the
 * endpoint that serves the initial page, writing the boostrap values into a
 * config object directly on the window object.
 */
declare global {
  interface Window {
    config: {
      prefix?: string
    }
  }
}

const App = () => {
  const prefix = window.config.prefix || serverConfig.defaults.prefix

  const [dependencies, setDependencies] = React.useState([])
  const [edges, setEdges] = React.useState([])

  const fetchData = () => {
    fetch(`${prefix}/api/dependencies`)
      .then(resp => resp.json())
      .then(dependencies => setDependencies(dependencies))

    fetch(`${prefix}/api/edges`)
      .then(resp => resp.json())
      .then(edges => setEdges(edges))
  }

  // Kick off first load, and then set up timer
  React.useEffect(fetchData, [])
  useInterval(fetchData, 5000)

  return <Admin dependencies={dependencies} edges={edges} />
}

App.displayName = 'App'

ReactDOM.render(<App />, document.getElementById('app'))
