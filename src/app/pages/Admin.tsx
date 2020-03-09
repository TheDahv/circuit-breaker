import * as React from 'react'

import { Container, Row, Col } from '../components/Grid'

export const Admin = () => (
  <React.Fragment>
    <nav>
      <div className='nav-wrapper'>
        <a className='brand-logo' href='#'>
          Circuit Breaker
        </a>
      </div>
    </nav>
    <Container>
      <Row>
        <Col colSmall={12} colMedium={6}>
          <h1>Column 1</h1>
        </Col>
        <Col colSmall={12} colMedium={6}>
          <h1>Column 2</h1>
        </Col>
      </Row>
    </Container>
  </React.Fragment>
)
