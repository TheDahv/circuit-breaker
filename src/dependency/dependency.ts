/**
 * @packageDocumentation
 * @module dependency
 */

/**
 * A dependency models an external resource that could go down or become
 * unavailable.
 *
 * Each dependency declares how to resolve its health and how often a [[Manager]]
 * should check for health.
 */
export interface Dependency {
  /**
   * name is an identifier for the dependency
   */
  name: string
  /**
   * resolver is an asynchronous function that determines if our dependency is
   * healthy.
   *
   * It will return false if any of its dependencies is also not healthy.
   */
  resolver: () => Promise<boolean>
  /**
   * intervalMs defines how often to check a dependency in milliseconds
   */
  intervalMs: number
  /**
   * dependencies are child-dependencies that this dependency may depend on
   */
  dependencies: Dependency[]
}

/**
 * isHealthy will resolve the health of a dependency or any of its children
 *
 * It checks for cycles to prevent following loops indefinitely. If the caller
 * does not provide a memo function, the function creates its own.
 *
 * @param dep The dependency to check
 * @param memo Used to watch for cycles and cache lookups
 * @returns An indication of whether the dependency is determined to be healthy
 */
export async function isHealthy (
  dep: Dependency,
  memo?: Map<string, boolean>
): Promise<boolean> {
  if (!memo) {
    memo = new Map<string, boolean>()
  }

  // Short-circuit if we've already checked this dependency. This will prevent
  // cycles
  if (memo.has(dep.name)) {
    const check = memo.get(dep.name)
    if (typeof check === 'boolean') {
      return check
    }
  }

  const check = await dep.resolver()
  if (memo) {
    memo.set(dep.name, check)
  }
  if (!check) {
    return false
  }

  // TODO decide between early exits and parallelizing
  for (const child of dep.dependencies) {
    if (!(await isHealthy(child, memo))) {
      return false
    }
  }

  return true
}
