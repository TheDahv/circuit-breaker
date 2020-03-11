/**
 * @packageDocumentation
 * @module server/app/components/dependencies
 */

/// <reference path="../../../types/react-cytoscapejs.d.ts"/>

import * as React from 'react'
import * as CytoscapeComponent from 'react-cytoscapejs'

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

  return (
    <CytoscapeComponent
      cy={cy =>
        cy.on('add', 'node', evt => {
          const node = evt.target
          const { isHealthy } = node.data()
          node.style('background-color', isHealthy ? 'green' : 'red')

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
            //'target-arrow-color': '#333333',
            //'target-arrow-fill': 'filled',
            'target-arrow-shape': 'vee'
          }
        }
      ]}
    />
  )
}

DependencyGraph.displayName = 'DependencyGraph'
