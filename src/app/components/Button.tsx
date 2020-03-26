/**
 * @packageDocumentation
 * @module server/app/components
 */

import * as React from 'react'

/**
 * ButtonProps control the behavior and appearance of the rendered [[Button]]
 */
export interface ButtonProps {
  /**
   * When true, renders a `<button />` node that can submit a form rather than
   * using an input tag.
   *
   * See [Materialize
   * documentation](https://materializecss.com/buttons.html#submit) for more
   * information.
   */
  asSubmit?: boolean
  children: React.ReactNode
  /**
   * When true, sets the disabled visual variant as well as configuring the DOM
   * component as disabled.
   */
  disabled?: boolean
  /**
   * When true, renders a variant with a larger height for buttons that need
   * more attention.
   *
   * See [Materialize
   * documentation](https://materializecss.com/buttons.html#large) for more
   * information.
   */
  large?: boolean
  /**
   * An optional handler to run when a user clicks on the button.
   */
  onClick?: React.MouseEventHandler
  /**
   * When true, renders a smaller variant for denser UI layouts.
   *
   * See [Materialize
   * documentation](https://materializecss.com/buttons.html#small) for more
   * information.
   */
  small?: boolean
}

/**
 * A Button component implementing Materialize CSS
 * [Buttons](https://materializecss.com/buttons.html).
 *
 * It renders a styles `<a />` tag by default. See the `asSubmit` property to
 * change this behavior.
 *
 * Example:
 *
 * ```jsx
 * <Button
 *   large
 *   onClick={(evt) => console.log({ log: 'I was clicked', evt })
 * >
 *   Click Me
 * </Button>
 * ```
 */
export default function Button (props: ButtonProps) {
  const className = [
    'btn waves-effect waves-light',
    coalesceFalsey(props.disabled) ? 'disabled' : '',
    coalesceFalsey(props.large) ? 'btn-large' : '',
    coalesceFalsey(props.small) ? 'btn-small' : ''
  ].join(' ')

  if (coalesceFalsey(props.asSubmit)) {
    return (
      <button
        className={className}
        onClick={props.onClick}
        disabled={props.disabled}
      >
        {props.children}
      </button>
    )
  }

  return (
    <a className={className} onClick={props.onClick}>
      {props.children}
    </a>
  )
}

Button.displayName = 'Button'

function coalesceFalsey (falsey?: boolean): boolean {
  // Note, this exists, but I can't figure out how to get prettier-standard to
  // respect it in the editor
  // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing
  return falsey === undefined || falsey === null ? false : true
}
