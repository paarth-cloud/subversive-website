import { useRef } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { SparkleIcon } from '@phosphor-icons/react'
import { site } from '../content/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { EASE_OUT } from '../lib/motion'
import { cn } from '../lib/cn'
import { Reveal } from '../components/ui/Reveal'
import { SplitReveal } from '../components/ui/SplitReveal'

/** Where each floating panel sits around the brain on desktop, and how deep. */
const PLACEMENT = [
  { className: 'lg:left-0 lg:top-[3%]', depth: 0.7, float: 0 },
  { className: 'lg:right-0 lg:top-[12%]', depth: 1.15, float: -2.6 },
  { className: 'lg:left-[4%] lg:top-[54%]', depth: 0.95, float: -4.1 },
  { className: 'lg:right-[5%] lg:top-[60%]', depth: 0.55, float: -1.3 },
  { className: 'lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2', depth: 1.3, float: -5.4 },
] as const

/**
 * Built to order. A floating UI system of example agents orbits the brain (now
 * a brain of light) at different depths, then the capability tags cascade in.
 */
export function Capabilities() {
  const { build } = site
  const fieldRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-depth]', fieldRef.current).forEach((el) => {
          const depth = Number(el.dataset.depth)
          gsap.fromTo(
            el,
            { y: 110 * depth },
            {
              y: -110 * depth,
              ease: 'none',
              scrollTrigger: { trigger: fieldRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })
      return () => mm.revert()
    },
    { scope: fieldRef, dependencies: [reduced] },
  )

  return (
    <section id="what-we-build" aria-labelledby="build-title" className="relative z-[2] py-32 md:py-44">
      <div className="container-page">
        <SplitReveal as="h2" id="build-title" text={build.title} className="max-w-[13ch] text-display font-medium" />
        <Reveal>
          <p className="mt-6 max-w-[34rem] text-lead text-ink-2">{build.body}</p>
        </Reveal>

        <div ref={fieldRef} data-scene="build" className="relative mt-16 lg:mt-6 lg:h-[50rem]">
          <ul aria-label={build.examplesLabel} className="grid gap-4 sm:grid-cols-2 lg:block">
            {build.examples.map((example, i) => {
              const place = PLACEMENT[i % PLACEMENT.length]!
              return (
                <li key={example.title} data-depth={place.depth} className={cn('lg:absolute lg:w-[19.5rem]', place.className)}>
                  <Reveal delay={i * 0.06}>
                    <article
                      className="glass rounded-panel p-6 lg:animate-float"
                      style={{ animationDelay: `${place.float}s` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-medium tracking-[-0.02em]">{example.title}</h3>
                        <SparkleIcon size={18} className="mt-1 shrink-0 text-signal-soft" aria-hidden />
                      </div>
                      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{example.body}</p>
                      <p className="mt-5 border-t border-line pt-4 font-mono text-xs text-ink-3">{example.trace}</p>
                    </article>
                  </Reveal>
                </li>
              )
            })}
          </ul>
          <p className="mt-6 text-sm text-ink-3 lg:absolute lg:bottom-2 lg:right-0 lg:mt-0">{build.examplesLabel}</p>
        </div>

        <div data-scene="build-end" className="mt-20 md:mt-28">
          <h3 className="text-[0.9375rem] text-ink-3">{build.capabilitiesLabel}</h3>
          <motion.ul
            className="mt-5 flex flex-wrap gap-2.5"
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ show: { transition: { staggerChildren: 0.055 } } }}
          >
            {build.capabilities.map((capability) => (
              <motion.li
                key={capability}
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.96 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE_OUT } },
                }}
              >
                <span className="inline-flex h-11 items-center rounded-full border border-line-2 bg-white/[0.02] px-5 text-[0.9375rem] text-ink-2 transition-[color,background-color,border-color] duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:text-ink">
                  {capability}
                </span>
              </motion.li>
            ))}
          </motion.ul>
          <Reveal>
            <p className="mt-10 max-w-[40rem] text-lead text-ink-2">{build.stack}</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
