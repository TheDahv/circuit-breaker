/**
 * @packageDocumentation
 * @module server/app/components/dependencies
 */

import * as React from 'react'

import { DependencyCardIcon as Icon } from './DependencyStatusIcon'

/**
 * CardProps control the behavior of [[DependencyCard]]
 */
export interface CardProps {
  /**
   * The name of the [[Dependency]]
   */
  name: string
  /**
   * The health status of the [[Dependency]]. True if healthy.
   */
  isHealthy: boolean
}

/**
 * DependencyCard shows the current status of a [[Dependency]] in the system.
 */
export const DependencyCard = (props: CardProps) => (
  <div className='card center-align'>
    <div className='card-image'>
      <Icon isHealthy={props.isHealthy} />
    </div>
    <div className='card-content'>
      <h2 className='center-align'>{props.name}</h2>
      <p>{props.isHealthy ? 'is healthy' : 'is not healthy'}</p>
    </div>
  </div>
)

DependencyCard.displayName = 'DependencyCard'
