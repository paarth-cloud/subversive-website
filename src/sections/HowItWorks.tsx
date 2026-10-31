import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { site } from '../content/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { cn } from '../lib/cn'
import { AgentTrace } from '../components/ui/AgentTrace'
import { Reveal } from '../components/ui/Reveal'
import { SplitReveal } from '../components/ui/SplitReveal'

/**
 * Listen, Decide, Act. The chapters scroll on the left while the fixed WebGL
 * brain on the right, digitised during the Shift, unfolds into stacked neural
 * layers and reassembles as a brain of light (each chapter is a `data-scene`
 * anchor).
 */
export function HowItWorks() {
  const { how } = site
  const listRef = useRef<HTMLOListElement>(null)
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const chapters = gsap.utils.toArray<HTMLElement>('[data-chapter]', listRef.current)
      chapters.forEach((chapter, i) =>
        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 62%',
          end: 'bottom 38%',
          onToggle: (self) => self.isActive && setActive(i),
        }),
      )
      if (!reduced) {
        gsap.fromTo(
          '[data-rail-fill]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: listRef.current, start: 'top 55%', end: 'bottom 55%', scrub: true },
          },
        )
      }
    },
    { scope: listRef, dependencies: [reduced] },
  )

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative z-[2] pt-32 md:pt-44">
      <div className="container-page">
        <div data-scene="how" className="max-w-3xl">
          <p className="eyebrow">{how.eyebrow}</p>
          <SplitReveal as="h2" id="how-title" text={how.title} className="mt-6 text-display font-medium" />
          <Reveal>
            <p className="mt-6 max-w-[36rem] text-lead text-ink-2">{how.intro}</p>
          </Reveal>
        </div>

        <div className="mt-10 grid lg:mt-16 lg:grid-cols-12">
          <ol ref={listRef} className="relative lg:col-span-6 xl:col-span-5">
            <span aria-hidden className="absolute bottom-[12vh] left-0 top-[12vh] w-px bg-line">
              <span data-rail-fill className="block h-full w-px origin-top bg-linear-to-b from-signal via-signal-soft to-cool-violet" />
            </span>

            {how.steps.map((step, i) => {
              const isActive = active === i
              return (
                <li
                  key={step.id}
                  data-chapter
                  data-scene={step.id}
                  className="relative flex min-h-[88vh] flex-col justify-center py-16 pl-9 md:pl-14"
                >
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-0 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-500',
                      isActive
                        ? 'scale-125 border-signal bg-signal shadow-[0_0_22px_rgb(232_25_44/0.8)]'
                        : 'border-line-2 bg-void',
                    )}
                  />
                  <h3>
                    <span
                      className={cn(
                        'block text-[clamp(3.75rem,9vw,8.5rem)] font-medium leading-[0.88] tracking-[-0.065em] transition-colors duration-700 ease-ui',
                        isActive ? 'text-ink' : 'text-ink/20',
                      )}
                    >
                      {step.verb}
                    </span>
                    <span className="mt-6 block text-title font-medium">{step.title}</span>
                  </h3>
                  <p className="mt-4 max-w-[30rem] text-lead text-ink-2">{step.body}</p>
                  <AgentTrace label={how.traceLabel} lines={step.trace} active={isActive} className="mt-10 max-w-[25rem]" />
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
