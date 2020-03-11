/**
 * @packageDocumentation
 * @module server/app/components/dependencies
 */

import * as React from 'react'

/**
 * IconProps control the behavior of [[DependencyCardIcon]]
 */
export interface IconProps {
  /**
   * The health status of the [[Dependency]]. True if healthy.
   */
  isHealthy: boolean
}

/**
 * DependencyCardIcon shows a visual representation of a [[Dependency]] health
 * status.
 */
export const DependencyCardIcon = (props: IconProps) => {
  const colorClass = props.isHealthy ? 'green-text' : 'red-text'
  return (
    <i className={`large material-icons ${colorClass}`} aria-hidden='true'>
      {props.isHealthy ? 'done' : 'error_outline'}
    </i>
  )
}

DependencyCardIcon.displayName = 'DependencyCardIcon'
