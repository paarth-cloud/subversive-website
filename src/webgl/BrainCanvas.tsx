import { useEffect, useRef } from 'react'
import { getQualityTier, isFinePointer, prefersReducedMotion, probeWebGL } from '../lib/device'
import { setSceneStatus } from './sceneStore'

type IdleHandle = { cancel: () => void }

function whenIdle(callback: () => void): IdleHandle {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 1200 })
    return { cancel: () => window.cancelIdleCallback(id) }
  }
  const id = window.setTimeout(callback, 300)
  return { cancel: () => window.clearTimeout(id) }
}

/**
 * Fixed, decorative WebGL layer behind the page. Three.js and the scene are
 * loaded after first paint and idle, so the headline (the LCP) never waits on
 * them. If WebGL is missing or fails, the hero keeps its poster image.
 */
export function BrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const probe = probeWebGL()
    if (!probe.supported) {
      setSceneStatus('fallback')
      return
    }

    let disposed = false
    let teardown: (() => void) | undefined
    setSceneStatus('loading')

    const fail = (error: unknown) => {
      console.error('[brain] WebGL scene failed, keeping the poster image.', error)
      if (!disposed) setSceneStatus('fallback')
    }

    const idle = whenIdle(() => {
      import('./mountBrain')
        .then(({ mountBrain }) =>
          mountBrain(canvas, {
            tier: getQualityTier(probe.software),
            reducedMotion: prefersReducedMotion(),
            finePointer: isFinePointer(),
            onContextLost: () => setSceneStatus('fallback'),
          }),
        )
        .then((stop) => {
          if (disposed) {
            stop()
            return
          }
          teardown = stop
          setSceneStatus('ready')
        })
        .catch(fail)
    })

    return () => {
      disposed = true
      idle.cancel()
      teardown?.()
    }
  }, [])

  return (
    <div aria-hidden data-brain-viewport className="pointer-events-none fixed inset-0 z-[1]">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
