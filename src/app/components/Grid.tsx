/**
 * # Grid Components
 *
 * A set of components implementing a grid system for building flexible and
 * responsive layouts.
 *
 * Implements [Materialize CSS Grid](https://materializecss.com/grid.html).
 *
 * ## Usage
 *
 * Be sure to look at the Materialize CSS documentation if you are unfamiliar
 * with using CSS grids.
 *
 * Usage for a standard 3-column layout that stacks on mobile devices would look
 * like:
 *
 * ```jsx
 * <Container>
 *   <Grid>
 *     <Col colMedium={3} colSmall={12}>Column 1</Col>
 *     <Col colMedium={3} colSmall={12}>Column 2</Col>
 *     <Col colMedium={3} colSmall={12}>Column 3</Col>
 *   </Grid>
 * </Container>
 * ```
 *
 * @packageDocumentation
 * @module server/app/components/grid
 */

import * as React from 'react'

/**
 * GridProps are common to most components in this module.
 */
export interface GridProps {
  children: React.ReactNode
  /**
   * section is an optional property to add simple top and bottom padding for
   * components containing large blocks of content.
   */
  section?: boolean
}

/**
 * Container supports centering page content. It is set to ~70% of the window
 * width. Typically only necessary to have one Container around all body
 * content.
 *
 * @param props Contains the container's children and properties to configure the
 * container.
 */
export const Container = (props: GridProps) => {
  const className = `container ${props.section ? 'section' : ''}`
  return <div className={className}>{props.children}</div>
}

/**
 * Row lays out horizontally-grouped Col elements along a 12 column grid
 *
 * @param props Contains the Row's Col children
 */
export const Row = (props: GridProps) => {
  const className = `row ${props.section ? 'section' : ''}`
  return <div className={className}>{props.children}</div>
}

/**
 * ColProps configure a Col element in a row. At minimum, the Col needs to
 * define how many columns it spans in small viewports and devices. Column
 * settings at small sizes apply to all unspecified configurations in larger
 * viewports.
 *
 * See [Materialize CSS Grid](https://materializecss.com/grid.html) for other
 * column options.
 */
export interface ColProps extends GridProps {
  /**
   * The number of columns to span for small devices (<= 600px)
   */
  colSmall: number
  /**
   * The number of columns to span for medium devices (> 600px)
   */
  colMedium?: number
  /**
   * The number of columns to span for large devices (> 992px)
   */
  colLarge?: number
  /**
   * The number of columns to span for large desktop devices (> 1200px)
   */
  colXLarge?: number
  /**
   * The number of columns to skip before laying out the column on small
   * devices.
   */
  offsetSmall?: number
  /**
   * The number of columns to skip before laying out the column on medium
   * devices.
   */
  offsetMedium?: number
  /**
   * The number of columns to skip before laying out the column on large
   * devices.
   */
  offsetLarge?: number
  /**
   * Change the order of columns by pushing a column to the right on small
   * devices.
   */
  pushSmall?: number
  /**
   * Change the order of columns by pushing a column to the right on medium
   * devices.
   */
  pushMedium?: number
  /**
   * Change the order of columns by pushing a column to the right on large
   * devices.
   */
  pushLarge?: number
  /**
   * Change the order of columns by pulling a column to the left on small
   * devices.
   */
  pullSmall?: number
  /**
   * Change the order of columns by pulling a column to the left on medium
   * devices.
   */
  pullMedium?: number
  /**
   * Change the order of columns by pulling a column to the left on large
   * devices.
   */
  pullLarge?: number
  /**
   * A class name to use unrelated to grid configuration.
   */
  className?: string
}

/**
 * Col lays out content within a specific column or span of columns within a
 * Row.
 *
 * @param props Configures the Col and its layout on the grid, as well as the
 * children content in the grid.
 */
export const Col = (props: ColProps) => {
  const className = [
    'col',
    's' + props.colSmall.toString(),
    props.colMedium ? 'm' + props.colMedium.toString() : '',
    props.colLarge ? 'l' + props.colLarge.toString() : '',
    props.colXLarge ? 'xl' + props.colXLarge.toString() : '',
    props.offsetSmall ? 'offset-s' + props.offsetSmall.toString() : '',
    props.offsetMedium ? 'offset-m' + props.offsetMedium.toString() : '',
    props.offsetLarge ? 'offset-l' + props.offsetLarge.toString() : '',
    props.pushSmall ? 'push-s' + props.pushSmall.toString() : '',
    props.pushMedium ? 'push-m' + props.pushMedium.toString() : '',
    props.pushLarge ? 'push-l' + props.pushLarge.toString() : '',
    props.pullSmall ? 'pull-s' + props.pullSmall.toString() : '',
    props.pullMedium ? 'pull-m' + props.pullMedium.toString() : '',
    props.pullLarge ? 'pull-l' + props.pullLarge.toString() : '',
    props.className || ''
  ].join(' ')

  return <div className={className}>{props.children}</div>
}

/**
 * Dividers are 1 pixel lines that help break up your content. Just add the
 * divider to a div in between your content.
 */
export const Divider = () => <div className='divider' />
