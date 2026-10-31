import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { site } from '../content/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { Reveal } from '../components/ui/Reveal'
import { StageHud } from '../components/ui/StageHud'

const ACCENT_WORDS = new Set(['speed', 'problem.'])

/**
 * Names the pain in the visitor's own words. The statement lights up word by
 * word as it is read, and the brain beside it, on a smaller stage, dims and
 * slows (see choreography).
 */
export function Problem() {
  const ref = useRef<HTMLHeadingElement>(null)
  const reduced = usePrefersReducedMotion()
  const words = site.problem.statement.split(' ')
  // Accent only the second sentence's "speed problem."
  const accentFrom = words.lastIndexOf('speed')

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      gsap.fromTo(
        ref.current.querySelectorAll('[data-lit]'),
        { opacity: 0.14 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top 78%', end: 'bottom 42%', scrub: true },
        },
      )
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <section id="problem" data-scene="problem" aria-labelledby="problem-title" className="relative z-[2] py-32 md:py-48">
      <div className="container-page grid items-center gap-x-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 id="problem-title" ref={ref} className="max-w-[16ch] text-manifesto font-medium">
            {words.map((word, i) => (
              <span key={`${word}-${i}`}>
                <span
                  data-lit
                  className={i >= accentFrom && ACCENT_WORDS.has(word) ? 'text-signal-soft' : undefined}
                >
                  {word}
                </span>
                {i < words.length - 1 ? ' ' : null}
              </span>
            ))}
          </h2>
          <Reveal className="mt-12 max-w-[34rem] md:mt-14">
            <p className="text-lead text-ink-2">{site.problem.body}</p>
          </Reveal>
        </div>
        <div className="relative hidden aspect-square w-full lg:col-span-4 lg:col-start-9 lg:block">
          <StageHud label="Signal · congested" />
          <div data-stage="problem" className="absolute inset-[9%]" />
        </div>
      </div>
    </section>
  )
}
