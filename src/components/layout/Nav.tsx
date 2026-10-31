import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ListIcon, XIcon } from '@phosphor-icons/react'
import { site } from '../../content/site'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { EASE_OUT } from '../../lib/motion'
import { cn } from '../../lib/cn'
import { Wordmark } from '../ui/Wordmark'
import { Button } from '../ui/Button'

const sectionIds = site.nav.map((item) => item.href.slice(1))

/** Highlights the nav item for the section crossing the middle of the screen. */
function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    const top = document.getElementById('top')
    const clearOnTop = new IntersectionObserver(([entry]) => entry?.isIntersecting && setActive(null), {
      rootMargin: '-45% 0px -50% 0px',
    })
    if (top) clearOnTop.observe(top)
    return () => {
      observer.disconnect()
      clearOnTop.disconnect()
    }
  }, [])
  return active
}

export function Nav() {
  const { scrollY } = useScroll()
  const { scrollTo, setLocked } = useSmoothScroll()
  const reduced = usePrefersReducedMotion()
  const active = useActiveSection()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  // Glass appears after the first scroll; the bar tucks away while reading
  // downward and returns the moment the visitor scrolls up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? 0)
    setScrolled(y > 24)
    if (y < 640) setHidden(false)
    else if (delta > 6) setHidden(true)
    else if (delta < -6) setHidden(false)
  })

  useEffect(() => {
    setLocked(menuOpen)
    if (!menuOpen) return
    firstLinkRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, setLocked])

  const go = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    setMenuOpen(false)
    scrollTo(href)
  }

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-40"
        initial={false}
        animate={{ y: hidden && !menuOpen ? '-120%' : '0%' }}
        transition={{ duration: reduced ? 0 : 0.55, ease: EASE_OUT }}
      >
        <div className="container-page pt-3 md:pt-4">
          <nav
            aria-label="Primary"
            className={cn(
              'flex h-14 items-center justify-between gap-6 rounded-full border pl-5 pr-1.5 transition-[background-color,border-color,box-shadow] duration-500 ease-ui md:h-16 md:pr-2',
              scrolled || menuOpen ? 'glass' : 'border-transparent',
            )}
          >
            <a href="#top" onClick={(e) => go(e, '#top')} className="shrink-0 rounded-full outline-offset-4">
              <Wordmark className="h-5 md:h-[1.375rem]" />
              <span className="sr-only">, back to top</span>
            </a>

            <ul className="hidden items-center gap-1 lg:flex">
              {site.nav.map((item) => {
                const isActive = active === item.href.slice(1)
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={(e) => go(e, item.href)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative block rounded-full px-4 py-2 text-[0.9375rem] transition-colors duration-300',
                        isActive ? 'text-ink' : 'text-ink-2 hover:text-ink',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-1.5">
              <Button href={site.cta.href} icon="none" trackLocation="nav" className="h-10 px-5 max-sm:hidden md:h-11">
                {site.cta.label}
              </Button>
              <button
                ref={toggleRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                className="grid size-11 place-items-center rounded-full border border-line-2 text-ink transition-colors hover:bg-white/[0.06] lg:hidden"
              >
                {menuOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[35] flex flex-col bg-void/95 px-[var(--gutter)] pb-10 pt-28 backdrop-blur-2xl lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: EASE_OUT }}
          >
            <ul className="flex flex-col gap-2">
              {site.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.06 + i * 0.06, ease: EASE_OUT }}
                >
                  <a
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className="block py-2 text-[2.5rem] font-medium leading-tight tracking-[-0.04em] text-ink"
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mt-auto"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.32, ease: EASE_OUT }}
            >
              <Button
                href={site.cta.href}
                size="lg"
                trackLocation="mobile-menu"
                className="w-full"
                onClick={() => setMenuOpen(false)}
              >
                {site.cta.label}
              </Button>
              <a href={`mailto:${site.email}`} className="mt-5 block text-center text-ink-2">
                {site.email}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
