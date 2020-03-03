export interface Dependency {
  // name is an identifier for the dependency
  name: string;
  // resolver is an asynchronous function that determines if our dependency is
  // healthy. It will return false if any of its dependencies is also not
  // healthy.
  resolver: () => Promise<boolean>;
  // intervalMs defines how often a dependency should be checked
  intervalMs: number,
  // dependencies are child-dependencies that this dependency may depend on
  dependencies: Dependency[];
}

// isHealthy will resolve the health of a dependency or any of its children
export async function isHealthy (dep: Dependency) : Promise<boolean> {
  if (!(await dep.resolver())) {
    return false;
  }

  // TODO check for cycles
  // TODO decide between early exits and parallelizing
  for (const child of dep.dependencies) {
    if (!(await isHealthy(child))) {
      return false;
    }
  }

  return true;
}
