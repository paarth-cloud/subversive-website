/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** JSON endpoint for contact form leads. Empty runs the form in demo mode. */
  readonly VITE_LEAD_ENDPOINT?: string
  /** Optional scheduling link shown after a successful submission. */
  readonly VITE_BOOKING_URL?: string
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
