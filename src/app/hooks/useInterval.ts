/**
 * @packageDocumentation
 * @module server/app/hooks
 */

import { useEffect, useRef } from 'react'

type callbackFn = () => void

/**
 * useInterval is a hook that registers a behavior you'd normally run in
 * useEffect, but on a regular basis.
 *
 * The only difference is you supply a delay in milliseconds to run a given
 * effect. This is useful if you want to subscribe to a series of poll results
 * against an interval to run UI changes.
 *
 * See https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export default function useInterval (callback: callbackFn, delay: number) {
  const savedCallback = useRef<callbackFn>()

  // Remember latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    function tick () {
      if (savedCallback.current) {
        savedCallback.current()
      }
    }

    // Note the original implementation guards on "delay" being null. Typescript
    // won't let a caller use useInterval without supplying a delay
    let id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}
