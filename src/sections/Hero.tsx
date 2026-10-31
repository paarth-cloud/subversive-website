import { motion } from 'motion/react'
import { site } from '../content/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { EASE_OUT } from '../lib/motion'
import { cn } from '../lib/cn'
import { useSceneStatus } from '../webgl/sceneStore'
import { Button } from '../components/ui/Button'
import { Picture } from '../components/ui/Picture'
import { SplitReveal } from '../components/ui/SplitReveal'

/**
 * The section that decides everything: message match with the ad, one promise,
 * one action. The WebGL brain renders behind it on a fixed canvas; until it is
 * ready (or if it never is) the Higgsfield keyframe holds the same spot.
 */
export function Hero() {
  const status = useSceneStatus()
  const reduced = usePrefersReducedMotion()
  const posterVisible = status !== 'ready'
  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE_OUT },
        }

  return (
    <section
      id="top"
      data-scene="hero"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100dvh] flex-col md:min-h-[84dvh]"
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-10 overflow-hidden transition-opacity duration-[1600ms] ease-out-expo',
          posterVisible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <Picture
          name="stage-1"
          alt=""
          sizes="100vw"
          priority
          className="absolute inset-0 hidden md:block"
          imgClassName="object-cover object-[80%_50%]"
        />
        <Picture
          name="hero-square"
          alt=""
          sizes="(max-width: 767px) 100vw, 1px"
          priority
          className="absolute inset-x-0 top-14 mx-auto aspect-square w-full max-w-[34rem] md:hidden"
          imgClassName="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-void via-void/30 to-transparent md:bg-linear-to-r md:from-void md:via-void/55 md:to-transparent" />
      </div>

      <div className="container-page flex flex-1 flex-col justify-end pb-14 pt-28 md:justify-center md:pb-20 md:pt-32">
        <div className="max-w-[46rem]">
          <motion.p className="eyebrow mb-7 md:mb-8" {...enter(0.1)}>
            {site.hero.eyebrow}
          </motion.p>

          <SplitReveal
            as="h1"
            id="hero-title"
            text={site.hero.title}
            trigger="load"
            delay={0.2}
            accentStop
            className="max-w-[11.5em] text-hero font-medium"
          />

          <motion.p className="mt-7 max-w-[33rem] text-lead text-ink-2 md:mt-8" {...enter(0.7)}>
            {site.hero.body}
          </motion.p>

          <motion.div className="mt-9 flex flex-wrap items-center gap-3 md:mt-11" {...enter(0.9)}>
            <Button href={site.cta.href} size="lg" magnetic trackLocation="hero">
              {site.cta.label}
            </Button>
            <Button href={site.hero.secondary.href} size="lg" variant="ghost" icon="down" trackLocation="hero-secondary">
              {site.hero.secondary.label}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
