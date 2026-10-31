import { site } from '../content/site'
import { Accordion } from '../components/ui/Accordion'
import { Reveal } from '../components/ui/Reveal'
import { SplitReveal } from '../components/ui/SplitReveal'

/** The last objections, answered straight. */
export function Faq() {
  const { faq } = site
  return (
    <section id="faq" data-scene="faq" aria-labelledby="faq-title" className="relative z-[2] py-32 md:py-44">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SplitReveal as="h2" id="faq-title" text={faq.title} className="max-w-[12ch] text-display font-medium" />
          <Reveal>
            <p className="mt-6 max-w-[24rem] text-lead text-ink-2">
              {faq.body}{' '}
              <a
                href={`mailto:${site.email}`}
                className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-signal-soft"
              >
                {site.email}
              </a>
            </p>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-7" amount={0.15}>
          <Accordion items={faq.items} />
        </Reveal>
      </div>
    </section>
  )
}
