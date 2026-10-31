import { EnvelopeSimpleIcon, PaperPlaneTiltIcon, SparkleIcon, type Icon } from '@phosphor-icons/react'
import { site } from '../content/site'
import { ContactForm } from '../features/contact/ContactForm'
import { Reveal } from '../components/ui/Reveal'
import { SplitReveal } from '../components/ui/SplitReveal'

const STEP_ICONS: Icon[] = [PaperPlaneTiltIcon, EnvelopeSimpleIcon, SparkleIcon]

/** The final call to action. The brain is a superintelligent core behind the form. */
export function Contact() {
  const { contact } = site
  return (
    <section id="contact" data-scene="contact" aria-labelledby="contact-title" className="relative z-[2] py-32 md:py-44">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow">{contact.eyebrow}</p>
          <SplitReveal
            as="h2"
            id="contact-title"
            text={contact.title}
            accentStop
            className="mt-6 max-w-[11ch] text-display font-medium"
          />
          <Reveal>
            <p className="mt-6 max-w-[28rem] text-lead text-ink-2">{contact.body}</p>
          </Reveal>

          <ol className="mt-12 space-y-7">
            {contact.steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i] ?? SparkleIcon
              return (
                <li key={step.title}>
                  <Reveal delay={0.1 + i * 0.08} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-2 bg-white/[0.03] text-ink">
                      <StepIcon size={19} aria-hidden />
                    </span>
                    <span>
                      <span className="block font-medium tracking-[-0.01em] text-ink">{step.title}</span>
                      <span className="mt-1 block text-ink-2">{step.body}</span>
                    </span>
                  </Reveal>
                </li>
              )
            })}
          </ol>

          <Reveal delay={0.2}>
            <p className="mt-12 text-ink-2">
              Prefer email?{' '}
              <a
                href={`mailto:${site.email}`}
                className="text-ink underline decoration-line-2 underline-offset-4 transition-colors hover:decoration-signal-soft"
              >
                {site.email}
              </a>
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal amount={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
