import { motion } from 'motion/react'
import { site } from '../content/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { EASE_OUT } from '../lib/motion'
import { cn } from '../lib/cn'
import { useSceneStatus } from '../webgl/sceneStore'
import { Button } from '../components/ui/Button'
import { Picture } from '../components/ui/Picture'
import { SplitReveal } from '../components/ui/SplitReveal'
import { StageHud } from '../components/ui/StageHud'

/**
 * The section that decides everything: message match with the ad, one promise,
 * one action. Copy and product sit side by side on desktop and stack on smaller
 * screens; the brain renders on the fixed canvas into the stage reserved here,
 * and until it is ready (or if it never is) the Higgsfield keyframe fills it.
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
    <section id="top" data-scene="hero" aria-labelledby="hero-title" className="relative isolate">
      <div className="container-page grid min-h-[100dvh] content-center items-center gap-x-10 gap-y-14 pb-14 pt-28 lg:min-h-[80dvh] lg:grid-cols-12 lg:pb-12 lg:pt-28">
        <div className="relative mx-auto aspect-square w-[min(100%,42svh)] lg:order-last lg:col-span-5 lg:w-full lg:max-w-[min(100%,68svh)]">
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 transition-opacity duration-[1600ms] ease-out-expo',
              posterVisible ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Picture
              name="hero-square"
              alt=""
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
              className="absolute inset-0"
              imgClassName="object-cover [mask-image:radial-gradient(closest-side,#000_72%,transparent)]"
            />
          </div>
          <StageHud label="Subversive core" glow="warm" />
          <div data-stage="hero" className="absolute inset-[7%]" />
        </div>

        <div className="lg:col-span-7">
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
            className="max-w-[11em] text-hero font-medium"
          />

          <motion.p className="mt-7 max-w-[32rem] text-lead text-ink-2 md:mt-8" {...enter(0.7)}>
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
