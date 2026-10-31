/**
 * Motion tokens shared by Motion (UI) and GSAP (scroll). Durations stay in the
 * 0.6s to 1.2s band for reveals; micro-interactions are faster on purpose.
 */
type Bezier = [number, number, number, number]

/** Reveals and entries. GSAP equivalent: expo.out */
export const EASE_OUT: Bezier = [0.16, 1, 0.3, 1]
/** Camera moves, morphs, scroll-to. GSAP equivalent: power3.inOut */
export const EASE_CINE: Bezier = [0.65, 0, 0.35, 1]
/** Hover and state changes. */
export const EASE_UI: Bezier = [0.22, 1, 0.36, 1]

export const DUR = {
  micro: 0.18,
  ui: 0.32,
  reveal: 0.9,
  hero: 1.2,
} as const

export const STAGGER = {
  words: 0.045,
  lines: 0.09,
  items: 0.07,
} as const

export const GSAP_EASE = {
  out: 'expo.out',
  cine: 'power3.inOut',
  ui: 'power2.out',
} as const

/** Used by Lenis for programmatic scrolls (nav links, CTAs). */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
