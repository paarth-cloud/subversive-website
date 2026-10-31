import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { cn } from '../../lib/cn'

const SECTIONS = [
  { id: 'top', label: 'Intro' },
  { id: 'problem', label: 'Problem' },
  { id: 'shift', label: 'Shift' },
  { id: 'how-it-works', label: 'Loop' },
  { id: 'what-we-build', label: 'Build' },
  { id: 'process', label: 'Process' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
] as const

/**
 * Wayfinding on desktop: a hairline rail in the right gutter that fills with
 * the scroll, one node per section with the current one lit. Labels appear on
 * hover only, so the rail never sits on top of content.
 */
export function ScrollRail() {
  const { scrollTo } = useSmoothScroll()
  const [active, setActive] = useState<string>('top')
  const fillRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: '-50% 0px -50% 0px' },
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    const progress = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.transform = `scaleY(${self.progress})`
      },
    })
    return () => {
      observer.disconnect()
      progress.kill()
    }
  }, [])

  const go = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    scrollTo(`#${id}`)
  }

  return (
    <nav aria-label="Sections" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-6">
      <span aria-hidden className="absolute bottom-1 right-[3px] top-1 w-px bg-white/10">
        <span ref={fillRef} className="block h-full w-px origin-top scale-y-0 bg-linear-to-b from-signal to-cool-violet" />
      </span>
      <ol className="relative flex flex-col gap-[1.15rem]">
        {SECTIONS.map(({ id, label }) => {
          const current = active === id
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(event) => go(event, id)}
                aria-current={current ? 'location' : undefined}
                className="group relative flex items-center justify-end outline-offset-4"
              >
                <span
                  className={cn(
                    'pointer-events-none absolute right-5 whitespace-nowrap font-mono text-[0.625rem] uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100',
                    current ? 'text-ink' : 'text-ink-3',
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    'block size-[7px] rounded-full border transition-[background-color,border-color,box-shadow] duration-300',
                    current
                      ? 'border-signal bg-signal shadow-[0_0_12px_rgb(232_25_44/0.7)]'
                      : 'border-white/25 bg-void group-hover:border-white/60',
                  )}
                />
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
