import { useEffect, useRef } from 'react'
import { sceneState } from '../../webgl/sceneStore'
import { cn } from '../../lib/cn'

const RESTING = ['Organic', 'Digitised', 'Neural', 'Superintelligent'] as const
const MOVING = ['Digitising', 'Unfolding', 'Reassembling'] as const

/** The brain's phase from its morph: a resting phase, or the move toward the next one. */
function phaseOf(morph: number) {
  const m = Math.min(3, Math.max(0, morph))
  const nearest = Math.round(m)
  if (Math.abs(m - nearest) < 0.03) return { number: nearest + 1, name: RESTING[nearest]! }
  return { number: Math.floor(m) + 2, name: MOVING[Math.floor(m)]! }
}

type StageHudProps = {
  label: string
  /** A pool of light under the stage: warm while organic, cool once it is light. */
  glow?: 'warm' | 'cool'
  className?: string
}

/**
 * Instrument frame around a brain stage: hairline corner brackets, the stage's
 * name and a live readout of the brain's phase. The readout is written straight
 * into the DOM from the scene state each frame while it is on screen, so it
 * never re-renders React.
 */
export function StageHud({ label, glow, className }: StageHudProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<HTMLSpanElement>(null)
  const percentRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let frame = 0
    let shown = ''
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const { number, name } = phaseOf(sceneState.morph)
      const percent = Math.round((Math.min(3, Math.max(0, sceneState.morph)) / 3) * 100)
      const next = `${number}${name}${percent}`
      if (next === shown) return
      shown = next
      if (phaseRef.current) phaseRef.current.textContent = `Phase 0${number} · ${name}`
      if (percentRef.current) percentRef.current.textContent = `${String(percent).padStart(2, '0')}%`
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame)
      if (entry?.isIntersecting) frame = requestAnimationFrame(tick)
    })
    observer.observe(root)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const corner = 'absolute size-3.5 border-white/25 md:size-4'
  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 select-none font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ink-3 md:text-[0.6875rem]',
        className,
      )}
    >
      {glow && (
        <span
          className={cn(
            'absolute -bottom-[4%] left-1/2 h-[16%] w-[72%] -translate-x-1/2 rounded-[50%] blur-2xl',
            glow === 'warm' ? 'bg-signal/25' : 'bg-cool-blue/25',
          )}
        />
      )}
      <span className="absolute inset-0 bg-[radial-gradient(rgb(255_255_255/0.07)_1px,transparent_1px)] bg-[length:22px_22px] [mask-image:radial-gradient(closest-side,#000_35%,transparent)]" />
      <span className={cn(corner, 'left-0 top-0 border-l border-t')} />
      <span className={cn(corner, 'right-0 top-0 border-r border-t')} />
      <span className={cn(corner, 'bottom-0 left-0 border-b border-l')} />
      <span className={cn(corner, 'bottom-0 right-0 border-b border-r')} />
      <span className="absolute -top-6 left-0 flex items-center gap-2 whitespace-nowrap">
        <span className="size-1.5 animate-ping-soft rounded-full bg-signal" />
        {label}
      </span>
      <span className="absolute -bottom-6 right-0 flex gap-3 whitespace-nowrap">
        <span ref={phaseRef}>Phase 01 · Organic</span>
        <span ref={percentRef} className="tabular-nums text-ink-2">
          00%
        </span>
      </span>
    </div>
  )
}
