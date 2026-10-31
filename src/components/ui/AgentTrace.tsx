import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { EASE_OUT } from '../../lib/motion'
import { cn } from '../../lib/cn'
import type { TraceLine } from '../../content/site'

type AgentTraceProps = {
  label: string
  lines: readonly TraceLine[]
  active: boolean
  className?: string
}

/**
 * A live-looking agent log: a real component, not a screenshot. Lines play in
 * sequence while the chapter is active and dim when it is not.
 */
export function AgentTrace({ label, lines, active, className }: AgentTraceProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <div
      className={cn(
        'glass rounded-panel p-5 font-mono text-[0.8125rem] transition-opacity duration-700 ease-ui',
        active ? 'opacity-100' : 'opacity-45',
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2.5 text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">
        <span className="relative flex size-1.5" aria-hidden>
          {active && !reduced && <span className="absolute inset-0 animate-ping-soft rounded-full bg-signal-soft" />}
          <span className={cn('relative size-1.5 rounded-full', active ? 'bg-signal-soft' : 'bg-ink-3')} />
        </span>
        {label}
      </div>
      <ol className="space-y-2.5">
        {lines.map((line, i) => (
          <motion.li
            key={line.event}
            className="flex items-baseline justify-between gap-6"
            initial={false}
            animate={active ? { opacity: 1, x: 0 } : { opacity: 0.35, x: 0 }}
            transition={{ duration: 0.6, delay: active && !reduced ? 0.25 + i * 0.22 : 0, ease: EASE_OUT }}
          >
            <span className="text-ink">{line.event}</span>
            <span className="text-right text-ink-2">{line.detail}</span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
