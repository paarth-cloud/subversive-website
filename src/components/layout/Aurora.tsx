import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

/**
 * Ambient light behind everything. Warm light (human) leads at the top of the
 * page and cools toward violet and blue (machine) as the story progresses.
 * Outer layers carry scroll parallax (GSAP); inner layers drift slowly (CSS),
 * so the two transforms never fight.
 */
export function Aurora() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      if (reduced) return
      gsap
        .timeline({
          scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1.5 },
        })
        .to('[data-aurora="warm"]', { yPercent: -38, opacity: 0.3, ease: 'none' }, 0)
        .to('[data-aurora="pink"]', { yPercent: -70, ease: 'none' }, 0)
        .fromTo('[data-aurora="cool"]', { opacity: 0, yPercent: 30 }, { opacity: 1, yPercent: -12, ease: 'power1.inOut' }, 0.12)
    },
    { scope: ref, dependencies: [reduced] },
  )

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div data-aurora="warm" className="absolute -right-[20vmax] -top-[26vmax] size-[80vmax]">
        <div className="size-full animate-drift-a rounded-full bg-[radial-gradient(closest-side,rgb(232_25_44/0.26),rgb(255_138_0/0.09)_46%,transparent_72%)]" />
      </div>
      <div data-aurora="pink" className="absolute -left-[24vmax] top-[42vh] size-[62vmax]">
        <div className="size-full animate-drift-b rounded-full bg-[radial-gradient(closest-side,rgb(255_61_136/0.10),transparent_70%)]" />
      </div>
      <div data-aurora="cool" className="absolute left-[8vw] top-[16vh] size-[92vmax] opacity-0 motion-reduce:opacity-60">
        <div className="size-full animate-drift-b rounded-full bg-[radial-gradient(closest-side,rgb(106_75_255/0.19),rgb(34_114_255/0.09)_46%,transparent_72%)]" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_50%_10%,transparent_45%,var(--color-void)_100%)]" />
    </div>
  )
}
