import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PlusIcon } from '@phosphor-icons/react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { EASE_OUT } from '../../lib/motion'
import { cn } from '../../lib/cn'

type Item = { q: string; a: string }

export function Accordion({ items, defaultOpen = 0 }: { items: readonly Item[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const reduced = usePrefersReducedMotion()
  const baseId = useId()

  return (
    <div className="divide-y divide-line">
      {items.map((item, i) => {
        const isOpen = open === i
        const buttonId = `${baseId}-q-${i}`
        const panelId = `${baseId}-a-${i}`
        return (
          <div key={item.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex min-h-16 w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium tracking-[-0.02em] text-ink transition-colors duration-300 hover:text-white md:text-xl"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full border border-line-2 text-ink-2 transition-[transform,background-color,color,border-color] duration-300 ease-ui group-hover:border-white/30 group-hover:text-ink',
                    isOpen && 'rotate-45 border-signal/60 bg-signal/10 text-signal-soft',
                  )}
                >
                  <PlusIcon size={18} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? { height: 0, opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[60ch] pb-7 pr-14 text-base leading-relaxed text-ink-2 md:text-[1.0625rem]">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
