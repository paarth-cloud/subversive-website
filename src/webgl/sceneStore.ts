import { useSyncExternalStore } from 'react'

/**
 * `idle` before we decide, `loading` while the WebGL chunk and mesh load,
 * `ready` once the brain is on screen, `fallback` when WebGL is unavailable
 * (the hero poster then stays in place).
 */
export type SceneStatus = 'idle' | 'loading' | 'ready' | 'fallback'

let status: SceneStatus = 'idle'
const listeners = new Set<() => void>()

export function setSceneStatus(next: SceneStatus) {
  if (status === next) return
  status = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSceneStatus() {
  return useSyncExternalStore(subscribe, () => status, () => 'idle' as const)
}

/**
 * The scroll-driven state of the brain. GSAP tweens these plain numbers and
 * the render loop reads them every frame, so React never re-renders on scroll.
 */
export type SceneState = {
  /** 0 organic, 1 digitised, 2 neural network, 3 superintelligence. */
  morph: number
  /** Horizontal and vertical offset, as a fraction of the half viewport. */
  x: number
  y: number
  scale: number
  /** Extra yaw in radians, layered on top of the idle rotation. */
  spin: number
  opacity: number
  /** Brightness and speed of the synaptic pulses. */
  energy: number
  /** 0 normal, 1 congested: the brain dims and its signals slow down. */
  calm: number
}

export const sceneState: SceneState = {
  morph: 0,
  x: 0.42,
  y: 0,
  scale: 1,
  spin: 0,
  opacity: 1,
  energy: 1,
  calm: 0,
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as Window & { __scene?: SceneState }).__scene = sceneState
}
