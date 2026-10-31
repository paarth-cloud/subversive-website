import { motion } from 'motion/react'
import { CheckIcon } from '@phosphor-icons/react'
import { site, type ProcessStep } from '../content/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { EASE_OUT } from '../lib/motion'
import { cn } from '../lib/cn'
import { Picture } from '../components/ui/Picture'
import { Reveal } from '../components/ui/Reveal'
import { SplitReveal } from '../components/ui/SplitReveal'

/** Bento rhythm: one tall cell beside two stacked, then one wide cell. */
const LAYOUT: Record<ProcessStep['id'], { cell: string; sizes: string }> = {
  sense: { cell: 'min-h-[27rem] lg:col-span-7 lg:row-span-2 lg:min-h-[44rem]', sizes: '(min-width: 1024px) 58vw, 100vw' },
  solve: { cell: 'min-h-[24rem] lg:col-span-5', sizes: '(min-width: 1024px) 42vw, 100vw' },
  scale: { cell: 'min-h-[24rem] lg:col-span-5', sizes: '(min-width: 1024px) 42vw, 100vw' },
  sustain: { cell: 'min-h-[24rem] lg:col-span-12 lg:min-h-[21rem]', sizes: '100vw' },
}

/** The 4S method, told with crops of the same Higgsfield transformation. */
export function Process() {
  const { process } = site
  const reduced = usePrefersReducedMotion()

  return (
    <section id="process" data-scene="process" aria-labelledby="process-title" className="relative z-[2] py-32 md:py-44">
      <div className="container-page">
        <SplitReveal as="h2" id="process-title" text={process.title} className="max-w-[15ch] text-display font-medium" />
        <Reveal>
          <p className="mt-6 max-w-[30rem] text-lead text-ink-2">{process.body}</p>
        </Reveal>

        <ol className="mt-16 grid gap-4 lg:grid-cols-12">
          {process.steps.map((step, i) => {
            const wide = step.id === 'sustain'
            return (
              <motion.li
                key={step.id}
                className={cn(
                  'group relative isolate flex overflow-hidden rounded-panel border border-line bg-void-2 transition-colors duration-500 hover:border-line-2',
                  LAYOUT[step.id].cell,
                )}
                initial={reduced ? false : { opacity: 0, y: 44 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.05, delay: i * 0.08, ease: EASE_OUT }}
              >
                <Picture
                  name={step.image}
                  alt=""
                  sizes={LAYOUT[step.id].sizes}
                  className="absolute inset-0 -z-10"
                  imgClassName="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.045]"
                />
                <div
                  aria-hidden
                  className={cn(
                    'absolute inset-0 -z-10',
                    wide
                      ? 'bg-linear-to-t from-void via-void/80 to-void/20 lg:bg-linear-to-r lg:from-void lg:via-void/80 lg:to-void/0'
                      : 'bg-linear-to-t from-void via-void/75 to-void/0',
                  )}
                />
                <div className={cn('mt-auto w-full p-7 md:p-9', wide && 'lg:my-auto lg:max-w-[36rem]')}>
                  <h3 className="text-title font-medium">{step.verb}</h3>
                  <p className="mt-3 max-w-[32rem] leading-relaxed text-ink-2 md:text-[1.0625rem]">{step.body}</p>
                  <p className="mt-6 inline-flex items-center gap-2 font-mono text-[0.8125rem] text-ink">
                    <CheckIcon size={15} weight="bold" className="text-signal-soft" aria-hidden />
                    {step.outcome}
                  </p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
