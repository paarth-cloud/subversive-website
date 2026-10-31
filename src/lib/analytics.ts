export type AnalyticsEvent = 'cta_click' | 'form_start' | 'form_submit' | 'form_success' | 'form_error'

type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    dataLayer?: unknown[]
    plausible?: (event: string, options?: { props?: Props }) => void
    posthog?: { capture: (event: string, props?: Props) => void }
  }
}

/**
 * Vendor-neutral event hook. Forwards to Google Tag Manager, Plausible or
 * PostHog when one is installed on the page; does nothing otherwise.
 */
export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer?.push({ event, ...props })
  window.plausible?.(event, { props })
  window.posthog?.capture(event, props)
  if (import.meta.env.DEV) console.debug('[track]', event, props)
}
