/**
 * @packageDocumentation
 * @module server/app/components/pages
 */

import * as React from 'react'

import { Container, Row, Col } from '../components/Grid'
import { DependencyCard } from '../components/DependencyCard'

export interface PageProps {
  dependencies?: [string, boolean][]
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
      </Container>
    </React.Fragment>
  )
}

Admin.displayName = 'Admin'
