/**
 * @packageDocumentation
 * @module manager
 */

import { RequestHandler } from 'express'

import { Dependency, isHealthy } from './dependency'

/**
 * # Manager
 *
 * The manager runs the monitoring on registered dependencies and reports their
 * cached state to any clients.
 *
 * It also exposes the middleware for use with Express servers.
 *
 * ## Usage
 *
 * There should only be one manager for any given running system. Anywhere you
 * need to use a manager, call the "get" method:
 *
 * ```
 * const manager = Manager.get();
 * ```
 *
 * This means you can register a [[Dependency]] and access the manager from
 * different parts of your system.
 */
export class Manager {
  private static instance?: Manager

  // Prevent creating a manager with "new"
  private constructor () {}

  // prevents adding duplicate instances of a given dependency
  private dependencies: Set<Dependency>
  private graph: Map<string, Edge>
  // holds Timeout IDs returned from setInterval so we can delete them later on
  // shutdown
  private schedules: Map<string, NodeJS.Timeout>
  // holds the most recently resolved dependency state for fast communication
  // to clients
  private statusCache: Map<string, boolean>

  /**
   * middleware allows clients to integrate Circuit Breaker with an Express app.
   * Dependency state will be exposed on the `circuitBreaker` field of the
   * request object.
   *
   * ```
   * const m = Manager.get()
   * app.use(m.middleware())
   * app.get('/', (req, res) => {
   *   res.json(req.circuitBreaker);
   * })
   * ```
   *
   * @returns A middleware for use in an Express app
   */
  public middleware (): RequestHandler {
    return (req, res, next) => {
      req.circuitBreaker = this.statusCache
      next()
    }
  }

  /**
   * get returns the system-wide instance of the manager.
   *
   * Clients should call this static method rather than trying to create a new
   * Manager with "new".
   *
   * @returns the system-wide Manager instance
   */
  public static get (): Manager {
    if (!Manager.instance) {
      const instance = new Manager()
      instance.dependencies = new Set<Dependency>()
      instance.schedules = new Map<string, NodeJS.Timeout>()
      instance.statusCache = new Map<string, boolean>()
      instance.graph = new Map<string, Edge>()

      Manager.instance = instance
    }

    return Manager.instance
  }

  /**
   * register adds one or more [[Dependency]] instances to the Manager.
   *
   * Duplicate dependencies are automatically detected and won't be registered
   * more than once.
   *
   * A dependency is resolved in the background when it is first added. This
   * also registers a check on the specified interval and its recurrence is
   * managed by the Manager.
   *
   * This process also builds the dependency graph as dependencies are added and
   * their relationships are evaluated
   *
   * @param parent An optional reference to the dependency name that serves as
   * an ancestor to the dependencies to register. If undefined, the parent is
   * 'root'
   */
  public register (parent?: string, ...dependencies: Dependency[]) {
    parent = parent || 'root'

    // Important logic: using this as a FIFO queue to support a BFS walk through
    // all dependency nodes. A parent should process all of its children before
    // descending into grand-children dependencies. This ensures edges are built
    // properly
    const processQueue: { parent: string; dependencies: Dependency[] }[] = []
    processQueue.push({ parent, dependencies })

    while (processQueue.length) {
      const entry = processQueue.shift()
      if (!entry) {
        break
      }

      const { parent, dependencies } = entry
      for (const dependency of dependencies) {
        const edge: Edge = { source: parent, target: dependency.name }
        const edgeId = edgeToString(edge)
        if (!this.graph.has(edgeId)) {
          this.graph.set(edgeId, edge)
        }

        if (this.dependencies.has(dependency)) {
          // Note: we need a check here because Set.add isn't totally idempotent.
          // It will *replace* whatever was in there before, but the pre-existing
          // item will have its callback registered with the setInterval runtime.
          // That would create a memory leak and would also keep the event loop
          // stuck open because there is a callback registered that we can't clear
          continue
        }

        this.dependencies.add(dependency)

        // Run the first check async so that its entry is added to the statusCache
        // on the first run
        isHealthy(dependency).then(healthy =>
          this.statusCache.set(dependency.name, healthy)
        )

        const scheduleId = setInterval(async () => {
          // TODO memoize lookup to determine circuit-breaker state
          const healthy = await isHealthy(dependency)
          this.statusCache.set(dependency.name, healthy)
        }, dependency.intervalMs)
        this.schedules.set(dependency.name, scheduleId)

        // Do a BFS on the child-dependency tree rather than DFS to ensure the
        // correct parent is registered with the dependency
        if (dependency.dependencies.length) {
          processQueue.push({
            parent: dependency.name,
            dependencies: dependency.dependencies
          })
        }
      }
    }
  }

  /**
   * @returns The number of registered dependencies
   */
  public size (): number {
    return this.dependencies.size
  }

  /**
   * shutdown removes all registered dependencies and cancels recurring checks.
   *
   * A subsequent call to `Manager.get` will create a new empty Manager.
   */
  public shutdown () {
    this.schedules.forEach(timerId => clearInterval(timerId))
    this.schedules.clear()
    this.statusCache.clear()
    this.dependencies.clear()
    this.graph.clear()
    Manager.instance = undefined
  }

  public dependencyStatusList () {
    return Array.from(this.statusCache.entries())
  }

  /**
   * adjacencyList returns a representation of the dependency graph as a list of
   * [[Edge]] instances.
   *
   * A graphing library can use the adjacency list to visualize the graph.
   *
   * @returns The relationships among the service and all dependencies.
   */
  public adjacencyList (): Edge[] {
    return Array.from(this.graph.values())
  }
}

/**
 * # Edge
 *
 * Relationships between a service and a dependency -- or a dependency and
 * another dependency -- is represented as a graph edge.
 */
export interface Edge {
  source: string
  target: string
}

/**
 * @returns The directional relationship of two [[Dependency]] nodes in a
 * dependency graph.
 */
const edgeToString = (edge: Edge): string => {
  return `${edge.source} -> ${edge.target}`
}
