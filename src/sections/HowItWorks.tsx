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
import { StageHud } from '../components/ui/StageHud'

/**
 * Listen, Decide, Act. The chapters scroll while the brain, digitised during
 * the Shift, holds a pinned stage (beside them on desktop, above them on
 * phones), unfolds into stacked neural layers and reassembles as a brain of
 * light (each chapter is a `data-scene` anchor).
 */
export function HowItWorks() {
  const { how } = site
  const sectionRef = useRef<HTMLElement>(null)
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

  // On phones the brain's stage is a band at the top of the screen: copy fades
  // out as it scrolls up toward it, so the two never share the same pixels.
  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-fade]', sectionRef.current).forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 1 },
            { opacity: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 42%', end: 'top 16%', scrub: true } },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: sectionRef, dependencies: [reduced] },
  )

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="how-title"
      className="relative z-[2] overflow-clip pt-32 md:pt-44"
    >
      {/* The brain's stage, pinned while the chapters scroll: beside them on desktop, above them on
          phones. The section clips it, so it leaves with the last chapter. */}
      <div data-pin className="pointer-events-none sticky top-0 h-0">
        <div className="container-page relative">
          <div className="absolute inset-x-[12%] top-[9svh] h-[25svh] lg:left-[55%] lg:right-[var(--gutter)] lg:top-[13svh] lg:h-[74svh]">
            <StageHud label="Agent loop" />
            <div data-stage="how" className="absolute inset-[5%]" />
          </div>
        </div>
      </div>

      <div className="container-page">
        <div data-scene="how" data-fade className="max-w-3xl lg:max-w-[50%]">
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
                  className="relative flex min-h-[100svh] flex-col justify-end pb-[9svh] pl-9 pt-16 md:pl-14 lg:min-h-[88vh] lg:justify-center lg:py-16"
                >
                  <div data-fade className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        'absolute -left-9 top-[0.45em] size-2.5 -translate-x-1/2 rounded-full border text-[clamp(3.75rem,9vw,8.5rem)] transition-all duration-500 md:-left-14',
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
                    <AgentTrace
                      label={how.traceLabel}
                      lines={step.trace}
                      active={isActive}
                      className="mt-10 hidden max-w-[25rem] md:block"
                    />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
