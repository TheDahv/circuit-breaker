import 'mocha'
import { RequestHandler } from 'express'

import { Dependency, isHealthy } from './dependency'

export interface Edge {
  source: string
  target: string
}
const edgeToString = (edge: Edge): string => {
  return `${edge.source} -> ${edge.target}`
}

export class Manager {
  private static instance?: Manager

  // Prevent creating a manager with "new"
  private constructor () {}

  private dependencies: Set<Dependency>
  private schedules: Map<string, NodeJS.Timeout>
  private statusCache: Map<string, boolean>

  public middleware (): RequestHandler {
    return (req, res, next) => {
      req.circuitBreaker = this.statusCache
      next()
    }
  }

  // clients should call "get" to interact with the manager
  public static get (): Manager {
    if (!Manager.instance) {
      const instance = new Manager()
      instance.dependencies = new Set<Dependency>()
      instance.schedules = new Map<string, NodeJS.Timeout>()
      instance.statusCache = new Map<string, boolean>()

      Manager.instance = instance
    }

    return Manager.instance
  }

  public register (...dependencies: Dependency[]) {
    for (const dependency of dependencies) {
      this.dependencies.add(dependency)

      // Run the first check async so that its entry is added to the statusCache
      // on the first run
      isHealthy(dependency).then(healthy =>
        this.statusCache.set(dependency.name, healthy)
      )

      const scheduleId = setInterval(async () => {
        // TODO memoize lookup to determine circuit-breaker state
        // TODO Check for cycles
        const healthy = await isHealthy(dependency)
        this.statusCache.set(dependency.name, healthy)
      }, dependency.intervalMs)
      this.schedules.set(dependency.name, scheduleId)
    }
  }

  public shutdown () {
    this.schedules.forEach(timerId => clearInterval(timerId))
    this.statusCache.clear()
    this.dependencies.clear()
    Manager.instance = undefined
  }

  public adjacencyList (): Edge[] {
    const graph = new Map<string, Edge>()
    const sources = [
      { name: 'root', dependencies: Array.from(this.dependencies) }
    ]

    while (sources.length) {
      const source = sources.pop()
      if (!source) {
        break
      }

      for (const target of source.dependencies) {
        const edge: Edge = { source: source.name, target: target.name }
        const edgeId = edgeToString(edge)

        // Prevent following cycles
        if (graph.has(edgeId)) {
          continue
        }

        graph.set(edgeId, edge)
        if (target.dependencies.length) {
          sources.push(...target.dependencies)
        }
      }
    }

    return Array.from(graph.values())
  }
}
