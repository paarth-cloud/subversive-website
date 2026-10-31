import { useEffect, useRef, useState, type CSSProperties, type ElementType } from 'react'
import { DUR, STAGGER } from '../../lib/motion'
import { cn } from '../../lib/cn'

type SplitRevealProps = {
  text: string
  as?: ElementType
  className?: string
  /** `load` plays after first paint (hero); `scroll` plays once when it enters view. */
  trigger?: 'load' | 'scroll'
  delay?: number
  duration?: number
  stagger?: number
  /** Words (exact match, punctuation included) to render in the emphasis style. */
  emphasis?: readonly string[]
  emphasisClassName?: string
  /** Sets a closing full stop in signal red, echoing the wordmark. */
  accentStop?: boolean
  id?: string
}

/**
 * Staggered word reveal from per-word masks. The motion itself is a CSS
 * transition (see `.split-word` in globals.css): one class flip, no animation
 * runtime, and reduced motion is handled entirely in CSS. Screen readers get
 * the sentence once from a visually hidden copy; the animated words are hidden.
 */
export function SplitReveal({
  text,
  as: Tag = 'h2',
  className,
  trigger = 'scroll',
  delay = 0,
  duration = DUR.hero,
  stagger = STAGGER.words,
  emphasis = [],
  emphasisClassName = 'text-ink-2',
  accentStop = false,
  id,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)
  const words = text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (trigger === 'load') {
      // Two frames: the hidden state paints first, so the transition runs.
      let inner = 0
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -14% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [trigger])

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      data-shown={shown ? '' : undefined}
      style={{ '--split-duration': `${duration}s` } as CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const isLast = i === words.length - 1
          const stop = accentStop && isLast && word.endsWith('.')
          return (
            <span key={`${word}-${i}`}>
              <span className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-top">
                <span
                  className={cn('split-word', emphasis.includes(word) && emphasisClassName)}
                  style={{ '--d': `${delay + i * stagger}s` } as CSSProperties}
                >
                  {stop ? (
                    <>
                      {word.slice(0, -1)}
                      <span className="text-signal">.</span>
                    </>
                  ) : (
                    word
                  )}
                </span>
              </span>
              {isLast ? null : ' '}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
