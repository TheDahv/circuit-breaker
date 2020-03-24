/**
 * @packageDocumentation
 * @module server/app/components/dependencies
 */

/// <reference path="../../../types/react-cytoscapejs.d.ts"/>

import * as React from 'react'
import * as CytoscapeComponent from 'react-cytoscapejs'

import Button from '../components/Button'
import { Edge } from '../../manager'

export interface GraphProps {
  dependencies: [string, boolean][]
  edges: Edge[]
}

const layoutOptions = {
  animate: true,
  avoidOverlap: true,
  directed: false,
  fit: true,
  name: 'breadthfirst',
  padding: 3,
  roots: '#root'
}

const nodeColor = (name: string, isHealthy: boolean) => {
  return name === 'root' ? 'grey' : isHealthy ? 'green' : 'red'
}

/**
 * DependencyGraph renders a graph of dependencies in the app surfacing the
 * dependeny relationships and health status of each.
 *
 * It uses [Cytoscape](https://js.cytoscape.org/) to build the graph. Since this
 * depends on having access to the "window" object, this can only be used in
 * code targeting the browser.
 *
 * For pages that may be rendered server-side, guard importing with conditions
 * depending on typeof value of the window object at runtime.
 *
 * See `src/app/pages/Admin.tsx` for an example.
 */
export const DependencyGraph = (props: GraphProps) => {
  // Alright, functional components and a stateful library like Cytoscape are
  // weird. Rendering graphs is actually somewhat computationally expensive, so
  // the library under the hood is mutating a single instance. But that's not
  // how our components are looking at them. So we use a ref.
  // If a ref is presence and not null, Cytoscape has run once before. When that
  // is the case, we know that we need to run some imperative code against the
  // ref to update the instance.
  let cyRef = React.useRef<cytoscape.Core>()

  const nodes = props.dependencies.map(([name, isHealthy], index) => ({
    data: {
      id: name,
      label: name,
      isHealthy
    }
  }))
  const edges = props.edges.map((edge: Edge) => ({
    data: {
      source: edge.source,
      target: edge.target,
      label: ''
    }
  }))
  const elements = CytoscapeComponent.normalizeElements({ nodes, edges })

  if (!elements.length) {
    return null
  }

  // Here is where we update a Cytoscape graph after it has already been
  // rendered once before. As far as React is concerned, this functional
  // component has done its thing and moved on, but there is an instance out
  // there in the browser run-time we need to udpate to make any changes.
  if (cyRef.current) {
    let cy: cytoscape.Core = cyRef.current
    cy.batch(() => {
      for (const [name, isHealthy] of props.dependencies) {
        cy.$('#' + name).style('background-color', nodeColor(name, isHealthy))
      }
    })
  }

  return (
    <React.Fragment>
      <Button
        onClick={_evt => {
          if (cyRef.current) {
            const cy: cytoscape.Core = cyRef.current
            cy.layout(layoutOptions).run()
          }
        }}
      >
        Reset Layout
      </Button>
      <CytoscapeComponent
        cy={cy =>
          cy.on('add', 'node', evt => {
            if (!cyRef.current) {
              cyRef.current = cy
            }

            const node = evt.target
            const { isHealthy } = node.data()
            node.style('background-color', nodeColor(node.id, isHealthy))

            cy.layout(layoutOptions).run()
            cy.fit()
          })
        }
        elements={elements}
        style={{
          height: '700px',
          minHeight: '700px',
          width: '100%'
        }}
        stylesheet={[
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              color: '#333333'
            }
          },
          {
            selector: 'edge',
            style: {
              'arrow-scale': 2,
              'curve-style': 'bezier',
              'target-arrow-shape': 'vee'
            }
          }
        ]}
      />
    </React.Fragment>
  )
}

DependencyGraph.displayName = 'DependencyGraph'
