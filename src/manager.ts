import { RequestHandler } from 'express';

import { Dependency, isHealthy } from './dependency';

export class Manager {
  private static instance: Manager;

  // Prevent creating a manager with "new"
  private constructor () { }

  private dependencies: Set<Dependency>;
  private schedules: Map<string, NodeJS.Timeout>;
  private statusCache: Map<string, boolean>;

  public middleware (): RequestHandler {
    return (req, res, next) => {
      req.circuitBreaker = this.statusCache;
      next();
    };
  }

  // clients should call "get" to interact with the manager
  public static get(): Manager {
    if (!Manager.instance) {
      const instance = new Manager();
      instance.dependencies = new Set<Dependency>();
      instance.schedules = new Map<string, NodeJS.Timeout>();
      instance.statusCache = new Map<string, boolean>();

      Manager.instance = instance;
    }

    return Manager.instance;
  }

  public register(dependency: Dependency) {
    this.dependencies.add(dependency);

    // Run the first check async so that its entry is added to the statusCache
    // on the first run
    isHealthy(dependency).then(healthy => this.statusCache.set(dependency.name, healthy));

    const scheduleId = setInterval(
      async () => {
        // TODO memoize lookup to determine circuit-breaker state
        // TODO Check for cycles
        const healthy = await isHealthy(dependency);
        this.statusCache.set(dependency.name,  healthy);
      },
      dependency.intervalMs
    );
    this.schedules.set(dependency.name, scheduleId);
  }
}
