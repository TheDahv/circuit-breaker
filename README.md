# Circuit Breaker

Automated monitoring and response for service dependencies, especially for
services built with Node.js and Express.

(Also, an excuse for me to learn Typescript)

## Disclaimer

This is not recommended for production use. I wanted an interesting reason to
learn Typescript and this was an idea that has been in my head for a while based
on things I wish I had for systems I manage.

With some work and more testing, this could be a real project that I'd recommend
trying. I'll remove this dislaimer at that time.

## Motivation

Your service probably depends on other resources to function. When one of them
is suffering an outage or degradation, your service needs to behave in a
resilient and responsible way that protects resources.

For example, you may need to pause recurring jobs if a dependency is
unavailable. Consumers may need to stop queue consumption if every message
depending on a resource will fail.

Your engineering team needs to understand:

- how to know when a dependency fails
- what parts of the system depended on that resource
- what to pause or change in the service until dependencies are healthy
- what and where to message to a customer to indicate service issues
- when and how to revert that change when the dependencies recover

Circuit Breaker allows engineering teams to declare dependencies, monitor them,
and write systems that can automatically respond to changes in dependency
health.

If you already have monitors and runbooks to respond to errors, Circuit Breaker
can let you implement your runbooks in code so your system can do them
instead.

No more scrambling to find documentation. No more trying to remember what
features depend on a degraded service. No more forgetting to turn a cron back on
when the service recovers.

## How it Works

Engineers can model service dependencies in code. Circuit Breaker needs to know:

- name: the name of the dependency
- resolver: how to check the health of a dependency and resolve it to "true" or
  "false" to indicate health
- interval: how often to check a dependency
- dependencies: any sub-dependencies that would also impact the health of this
  dependency

A manager registers these dependencies and monitors their health on the
specified interval. The health for each dependency is cached and made available
to the system. When a dependency becomes unavailable, Circuit Breaker will
continue to monitor the dependency so the system knows when the outage is
resolved.

Engineering teams can use that state to automatically respond to dependency
issues:

- return a specific status code from an API endpoint when a dependency is down
- pause work queues when a dependency is down, and automatically resume when
  they come up
- suspend crons or other job recurrence managers and automatically resume them
  when they come up
- render a warning UI or a maintenance notification to users so your system can
  start communicating to users before your customer service team is even aware
  there is a problem

**NOTE** it is up to the maintainers of the system to implement the automated
response. Circuit Breaker just provides the dependency graph state.

There are times where you may not want an automated response if it would be
better to fail and force a human to get involved. In cases where the team
*knows* it wants something to happen automatically and not wait for a human,
Circuit Breaker can help.

Run `yarn run docs` to generate code documentation in the `docs` directory on
your computer.

### Datadog Integration

[Datadog](https://www.datadoghq.com/) is a fantastic service for monitoring
cloud infrastructure. One common approach to turning metrics into insights about
health are its
[Monitor](https://docs.datadoghq.com/monitors/monitor_types/#create) feature.

This pattern is common enough that Circuit Breaker includes an integration.
Given credentials to talk to the Datadog API and a Monitor ID, developers can
model a dependency by watching a Datadog monitor.

### Express Integration

Circuit Breaker is designed with Node.js servers written with Express in mind.
It exposes a middleware that injects the dependency health cache into the
`req.circuitBreaker` object.

For example:

```
const manager = Manager.get();
manager.register(dependency1, dependency2);

const app = express();
app.use(manager.middleware());

app.get('/', (req, res, next) => {
  if (!(req.circuitBreaker.dependency1 || req.circuitBreaker.dependency2)) {
    return res.status(500).json({ message: 'try again later!' });
  }
});
```

See the `examples` folder for some examples you can run yourself.

## Alternatives

I'm definitely not the first person to think about this. Here are some other
systems to look at if you're interested in commercial or larger solutions:

- [Azure Application
  Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/asp-net-dependencies)
  to automatically discover and monitor dependencies from the .NET ecosystem
- [Dynatrace](https://www.dynatrace.com/platform/application-topology-discovery/smartscape/)
  to monitor traffic through your network and find dependencies

## Planned Work

- Dependency graph modeling with [Cytoscape.js](https://js.cytoscape.org/)
- Admin panel
  - a UI to render the dependency graph
  - manual muting and resolution of dependencies
- HTTP API server
  - allow services that don't use Express to leverage Circuit Breaker for the
    dependency graph resolution and monitoring
- Implement other common Dependency patterns
  - model a dependency as a database connection and a SQL query
- Support more states than "Healthy" and "Not Healthy"
  - track backoffs for rate-limited dependencies
  - model degradations or warnings for systems to respond to
