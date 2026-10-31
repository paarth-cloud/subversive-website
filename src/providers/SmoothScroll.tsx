import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { easeInOutCubic } from '../lib/motion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

type ScrollTarget = string | HTMLElement

type SmoothScrollApi = {
  /** Scrolls to an element or `#id`, then moves keyboard focus to it. */
  scrollTo: (target: ScrollTarget, options?: { offset?: number }) => void
  /** Freezes page scroll (mobile menu, dialogs). */
  setLocked: (locked: boolean) => void
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null)

const NAV_OFFSET = -88

function resolve(target: ScrollTarget): HTMLElement | null {
  if (typeof target !== 'string') return target
  const id = target.startsWith('#') ? target.slice(1) : target
  return id ? document.getElementById(id) : document.body
}

function focusWithoutScroll(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/**
 * Lenis drives inertial scrolling on wheel and trackpad; touch keeps native
 * momentum. GSAP's ticker drives Lenis so ScrollTrigger and Lenis share one
 * frame. With reduced motion, Lenis is never created and scrolling is native.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.95,
      autoRaf: false,
    })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    if (import.meta.env.DEV) (window as Window & { __lenis?: Lenis }).__lenis = lenis

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    document.documentElement.classList.add('has-smooth-scroll')

    return () => {
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      lenisRef.current = null
      document.documentElement.classList.remove('has-smooth-scroll')
    }
  }, [reduced])

  // Fonts change line lengths, which moves every trigger: refresh once they land.
  useEffect(() => {
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
    }
  }, [])

  const scrollTo = useCallback<SmoothScrollApi['scrollTo']>(
    (target, options) => {
      const el = resolve(target)
      if (!el) return
      const offset = options?.offset ?? NAV_OFFSET
      const lenis = lenisRef.current
      if (lenis) {
        lenis.scrollTo(el, {
          offset,
          duration: 1.4,
          easing: easeInOutCubic,
          onComplete: () => focusWithoutScroll(el),
        })
        return
      }
      const top = el.getBoundingClientRect().top + window.scrollY + offset
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      focusWithoutScroll(el)
    },
    [reduced],
  )

  const setLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current
    if (locked) lenis?.stop()
    else lenis?.start()
    document.documentElement.style.overflow = locked ? 'hidden' : ''
  }, [])

  const api = useMemo(() => ({ scrollTo, setLocked }), [scrollTo, setLocked])
  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>
}

export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext)
  if (!ctx) throw new Error('useSmoothScroll must be used inside SmoothScrollProvider')
  return ctx
}
