/**
 * @packageDocumentation
 * @module server/backend
 */

import { join } from 'path'

import * as Express from 'express'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

import { Admin } from '../templates/Admin'
import { Manager } from './manager'
import { server as serverConfig } from './constants'

/**
 * # Server
 *
 * server allows an Express app to host an admin UI alongside its own web app.
 * It returns an Express Router so the client can configure the route prefix as
 * well as any middlewares and authentication responsibilities that should run
 * before it.
 *
 * It presents information from the current Manager running in the service and
 * updates regularly to help users get an up-to-date view into the system.
 *
 * ## Usage
 *
 * The server returns a router that can be mounted on the app at a configured
 * prefix:
 *
 * ```js
 * const m = Manager.get();
 * const app = express();
 *
 * const circuitBreakerAdminPrefix = '/admin/circuit-breaker';
 * app.use(circuitBreakerAdminPrefix, server(manager, '/admin/circuit-breaker'))
 * app.get('/', (req, res, next) => {
 *   res.json({ hello: 'world' });
 * });
 * ```
 *
 * The prefix determines the mount point of the server in your API. It defaults
 * to `/admin/circuit-breaker`.
 *
 * It is the repsonsibility of your web app to protect access to the Circuit
 * Breaker server. This can be controlled with more middlewares:
 *
 * ```js
 * app.use(
 *  circuitBreakerPrefix,
 *  [ redirectIfNotAdmin, server(manager) ]
 * )
 * ```
 *
 * @param manager The [[Manager]] instance with [[Dependency]] instance
 * registered
 * @param prefix Optional prefix to configure where the server web app looks for
 * assets. Defaults to `/admin/circuit-breaker`.
 */
export const server = (manager: Manager, prefix?: string): Express.Router => {
  const server = Express.Router()

  server.get('/', (req, res, next) => {
    const dependencies = manager.dependencyStatusList()
    const edges = manager.adjacencyList()

    ReactDOMServer.renderToNodeStream(
      React.createElement(Admin, {
        prefix: prefix || serverConfig.defaults.prefix,
        dependencies: dependencies,
        edges: edges
      })
    ).pipe(res)
  })

  server.get('/api/dependencies', (req, res) => {
    res.json(manager.dependencyStatusList())
  })

  server.get('/api/edges', (req, res) => {
    res.json(manager.adjacencyList())
  })

  server.use('/vendor', serveJsFolder('../../node_modules'))
  server.use('/js', serveJsFolder('../'))

  return server
}

function serveJsFolder (path: string) {
  return Express.static(join(__dirname, path))
}
