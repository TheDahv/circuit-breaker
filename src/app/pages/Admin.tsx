/**
 * @packageDocumentation
 * @module server/app/components/pages
 */

import * as React from 'react'

import { Container, Row, Col } from '../components/Grid'
import { DependencyCard } from '../components/DependencyCard'
import { Edge } from '../../manager'

export interface PageProps {
  dependencies?: [string, boolean][]
  edges?: Edge[]
}

const renderGraph = (dependencies: [string, boolean][], edges: Edge[]) => {
  // Don't try to render a graph for server-side renders
  if (typeof window === 'undefined') {
    return null
  }

  // Having a require down here might seem odd, but we need to guard for
  // server-side renders in Node since DependencyGraph requires cytoscape, which
  // in turn accesses the window object. This is undefined in Node.js and will
  // prevent the app from starting up
  const { DependencyGraph } = require('../components/DependencyGraph')

  const root = [['root', true]]
  return (
    <Row>
      <Col colSmall={12}>
        <DependencyGraph
          dependencies={root.concat(dependencies) || []}
          edges={edges || []}
        />
      </Col>
    </Row>
  )
}

export const Admin = (props: PageProps) => {
  return (
    <React.Fragment>
      <nav>
        <div className='nav-wrapper'>
          <a className='brand-logo' href='#'>
            Circuit Breaker
          </a>
        </div>
      </nav>
      <Container>
        <Row section>
          {(props.dependencies || []).map(([name, isHealthy]) => (
            <Col key={name} colSmall={4}>
              <DependencyCard name={name} isHealthy={isHealthy} />
            </Col>
          ))}
        </Row>
        {renderGraph(props.dependencies || [], props.edges || [])}
      </Container>
    </React.Fragment>
  )
}

Admin.displayName = 'Admin'
