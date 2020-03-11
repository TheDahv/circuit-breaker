import * as React from 'react'
import * as ReactDOM from 'react-dom'

import { Admin } from './pages/Admin'
import { server as serverConfig } from '../constants'

/**
 * Extends the window object to pick up configuration values written by the
 * endpoint that serves the initial page, writing the boostrap values into a
 * config object directly on the window object.
 */
interface CircuitBreakerWindow extends Window {
  /**
   * The URL prefix for the admin server
   */
  prefix?: string
}

const App = () => {
  const _window: CircuitBreakerWindow = window
  const prefix = _window.prefix || serverConfig.defaults.prefix

  const [dependencies, setDependencies] = React.useState([])
  const [edges, setEdges] = React.useState([])

  React.useEffect(() => {
    fetch(`${prefix}/api/dependencies`)
      .then(resp => resp.json())
      .then(dependencies => setDependencies(dependencies))
  }, [])
  React.useEffect(() => {
    fetch(`${prefix}/api/edges`)
      .then(resp => resp.json())
      .then(edges => setEdges(edges))
  }, [])

  return <Admin dependencies={dependencies} edges={edges} />
}

App.displayName = 'App'

ReactDOM.render(<App />, document.getElementById('app'))
