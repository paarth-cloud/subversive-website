import type { MouseEvent } from 'react'
import { site } from '../../content/site'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { Wordmark } from '../ui/Wordmark'

export function Footer() {
  const { scrollTo } = useSmoothScroll()
  const year = new Date().getFullYear()
  const go = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault()
    scrollTo(href)
  }

  return (
    <footer data-scene="footer" className="relative z-[2] overflow-hidden border-t border-line bg-void/60 backdrop-blur-sm">
      <div className="container-page grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <Wordmark className="h-7" />
          <p className="mt-5 max-w-sm leading-relaxed text-ink-2">{site.footer.tagline}</p>
          <p className="mt-4 max-w-sm text-sm text-ink-3">{site.footer.brandLine}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <ul className="space-y-3">
            {[...site.nav, site.cta].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="text-ink-2 transition-colors duration-300 hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3 md:col-span-4">
          <p className="text-ink-3">New projects</p>
          <a href={`mailto:${site.email}`} className="block text-lg text-ink transition-colors hover:text-signal-soft">
            {site.email}
          </a>
          <p className="pt-3 text-ink-3">Press</p>
          <a href={`mailto:${site.pressEmail}`} className="block text-ink-2 transition-colors hover:text-ink">
            {site.pressEmail}
          </a>
        </div>
      </div>

      <div aria-hidden className="container-page select-none">
        <p className="translate-y-[18%] text-[21vw] font-semibold leading-[0.8] tracking-[-0.075em] text-white/[0.035]">
          Subversive
        </p>
      </div>

      <div className="relative border-t border-line">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {site.footer.legal}
          </p>
          <a href={site.footer.privacy.href} className="transition-colors hover:text-ink">
            {site.footer.privacy.label}
          </a>
        </div>
      </div>
    </footer>
  )
}
