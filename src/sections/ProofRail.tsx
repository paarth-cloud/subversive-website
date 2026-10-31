import { site } from '../content/site'
import { Reveal } from '../components/ui/Reveal'

/** Evidence at the fold: real facts only, peeking at the bottom of the first screen. */
export function ProofRail() {
  return (
    <section aria-label="Why teams trust Subversive" className="relative z-[2]">
      <div className="container-page">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-8 md:grid-cols-4 md:pt-10">
          {site.proof.map((item, i) => (
            <li key={item.value}>
              <Reveal delay={0.05 + i * 0.07} amount={0.6}>
                <p className="font-mono text-[1.75rem] font-medium tracking-[-0.04em] text-ink md:text-[2.125rem]">
                  {item.value}
                </p>
                <p className="mt-2 max-w-[15rem] text-[0.9375rem] leading-snug text-ink-2">{item.label}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
