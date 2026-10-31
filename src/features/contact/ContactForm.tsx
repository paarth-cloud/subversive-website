import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CaretDownIcon, CheckIcon, CircleNotchIcon, InfoIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { site } from '../../content/site'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { track } from '../../lib/analytics'
import { EASE_OUT } from '../../lib/motion'
import { cn } from '../../lib/cn'
import { Button } from '../../components/ui/Button'
import { submitLead } from './submitLead'
import {
  emptyLead,
  isFreeEmail,
  MESSAGE_MAX,
  REQUIRED_FIELDS,
  validateField,
  validateLead,
  type FieldErrors,
  type FieldName,
  type LeadFields,
} from './validation'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

const copy = site.contact.form
const bookingUrl = import.meta.env.VITE_BOOKING_URL

const control =
  'w-full rounded-input border bg-white/[0.035] px-4 text-base text-ink outline-none transition-[border-color,background-color,box-shadow] duration-300 ease-ui placeholder:text-ink-3 focus:border-signal-soft focus:bg-white/[0.06] focus:shadow-[0_0_0_4px_rgb(232_25_44/0.16)]'
const controlState = (error?: string) => (error ? 'border-signal-soft/80' : 'border-ink-3/70 hover:border-ink-3')

type FieldProps = {
  id: string
  label: string
  optional?: string
  error?: string
  hint?: string
  valid?: boolean
  children: ReactNode
}

/** Label above, control, then error (or hint) below. Errors are announced and linked. */
function Field({ id, label, optional, error, hint, valid, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.9375rem] text-ink">
        <span>{label}</span>
        {optional && (
          <span className="text-sm text-ink-3">
            <span className="sr-only">, </span>
            {optional}
          </span>
        )}
      </label>
      <div className="relative">
        {children}
        {valid && (
          <CheckIcon
            size={18}
            weight="bold"
            aria-hidden
            className="pointer-events-none absolute right-4 top-[1.0625rem] text-ink-2"
          />
        )}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="flex items-start gap-1.5 text-sm text-signal-soft"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <WarningCircleIcon size={17} className="mt-px shrink-0" aria-hidden />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {!error && hint && (
        <p id={`${id}-hint`} className="flex items-start gap-1.5 text-sm text-ink-2">
          <InfoIcon size={17} className="mt-px shrink-0" aria-hidden />
          {hint}
        </p>
      )}
    </div>
  )
}

export function ContactForm() {
  const [fields, setFields] = useState<LeadFields>(emptyLead)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [announcement, setAnnouncement] = useState('')
  const [demo, setDemo] = useState(false)
  const started = useRef(false)
  const successRef = useRef<HTMLHeadingElement>(null)
  const reduced = usePrefersReducedMotion()
  const uid = useId()
  const fid = (name: FieldName) => `${uid}-${name}`

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  const describedBy = (name: FieldName, hint?: string) =>
    errors[name] ? `${fid(name)}-error` : hint ? `${fid(name)}-hint` : undefined

  const onChange = (event: ChangeEvent<Control>) => {
    const name = event.target.name as FieldName
    const { value } = event.target
    if (!started.current) {
      started.current = true
      track('form_start')
    }
    setFields((prev) => ({ ...prev, [name]: value }))
    // Real-time once a field has been visited, so nobody is scolded mid-word.
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    if (status === 'error') setStatus('idle')
  }

  const onBlur = (event: FocusEvent<Control>) => {
    const name = event.target.name as FieldName
    if (!REQUIRED_FIELDS.includes(name)) return
    if (!event.target.value && !touched[name]) return
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, event.target.value) }))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting') return

    const found = validateLead(fields)
    setErrors(found)
    setTouched({ name: true, email: true, company: true, message: true })
    const firstInvalid = REQUIRED_FIELDS.find((name) => found[name])
    if (firstInvalid) {
      setAnnouncement(`${copy.errors.summary} ${Object.values(found).join(' ')}`)
      document.getElementById(fid(firstInvalid))?.focus()
      track('form_error', { reason: 'validation', field: firstInvalid })
      return
    }

    setStatus('submitting')
    setAnnouncement(copy.sending)
    track('form_submit', { useCase: fields.useCase })
    try {
      const result = await submitLead(fields)
      setDemo(result.demo)
      setStatus('success')
      setAnnouncement(`${copy.success.title} ${copy.success.body}`)
      track('form_success', { useCase: fields.useCase, demo: result.demo })
    } catch {
      setStatus('error')
      setAnnouncement(copy.errors.network)
      track('form_error', { reason: 'network' })
    }
  }

  const reset = () => {
    setFields(emptyLead)
    setErrors({})
    setTouched({})
    setStatus('idle')
    setAnnouncement('')
    started.current = false
  }

  const isValid = (name: FieldName) => Boolean(touched[name] && !errors[name] && fields[name].trim())
  const emailHint = !errors.email && isFreeEmail(fields.email) ? copy.hints.freeEmail : undefined
  const submitting = status === 'submitting'

  return (
    <motion.div layout={!reduced} className="glass overflow-hidden rounded-panel" transition={{ duration: 0.6, ease: EASE_OUT }}>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {status === 'success' ? (
          <motion.div
            key="success"
            className="flex min-h-[34rem] flex-col items-start justify-center p-7 md:p-10"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
          >
            <div className="relative grid size-20 place-items-center">
              <svg viewBox="0 0 80 80" className="absolute inset-0 size-20 -rotate-90" aria-hidden>
                <circle cx="40" cy="40" r="37" fill="none" stroke="rgb(237 236 232 / 0.12)" strokeWidth="2" />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="37"
                  fill="none"
                  stroke="var(--color-signal)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={reduced ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                />
              </svg>
              <motion.span
                initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.55 }}
              >
                <CheckIcon size={30} weight="bold" className="text-ink" aria-hidden />
              </motion.span>
            </div>
            <h3 ref={successRef} tabIndex={-1} className="mt-8 text-title font-medium outline-none">
              {copy.success.title}
            </h3>
            <p className="mt-3 max-w-[26rem] text-lead text-ink-2">{copy.success.body}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              {bookingUrl && (
                <Button href={bookingUrl} target="_blank" rel="noopener noreferrer" trackLocation="success-booking">
                  {copy.success.booking}
                </Button>
              )}
              <Button variant="ghost" icon="none" onClick={reset}>
                {copy.success.reset}
              </Button>
            </div>
            {demo && import.meta.env.DEV && (
              <p className="mt-8 font-mono text-xs text-ink-3">Demo mode: set VITE_LEAD_ENDPOINT to receive leads.</p>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            aria-describedby={`${uid}-privacy`}
            className="grid gap-6 p-7 md:p-10"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id={fid('name')} label={copy.name.label} error={errors.name} valid={isValid('name')}>
                <input
                  id={fid('name')}
                  name="name"
                  type="text"
                  autoComplete={copy.name.autoComplete}
                  required
                  value={fields.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy('name')}
                  className={cn(control, controlState(errors.name), 'h-[3.25rem] pr-11')}
                />
              </Field>
              <Field
                id={fid('email')}
                label={copy.email.label}
                error={errors.email}
                hint={emailHint}
                valid={isValid('email')}
              >
                <input
                  id={fid('email')}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete={copy.email.autoComplete}
                  required
                  value={fields.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={describedBy('email', emailHint)}
                  className={cn(control, controlState(errors.email), 'h-[3.25rem] pr-11')}
                />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id={fid('company')} label={copy.company.label} error={errors.company} valid={isValid('company')}>
                <input
                  id={fid('company')}
                  name="company"
                  type="text"
                  autoComplete={copy.company.autoComplete}
                  required
                  value={fields.company}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(errors.company)}
                  aria-describedby={describedBy('company')}
                  className={cn(control, controlState(errors.company), 'h-[3.25rem] pr-11')}
                />
              </Field>
              <Field id={fid('role')} label={copy.role.label} optional={copy.role.optional}>
                <input
                  id={fid('role')}
                  name="role"
                  type="text"
                  autoComplete={copy.role.autoComplete}
                  value={fields.role}
                  onChange={onChange}
                  className={cn(control, controlState(), 'h-[3.25rem]')}
                />
              </Field>
            </div>

            <Field id={fid('useCase')} label={copy.useCase.label}>
              <select
                id={fid('useCase')}
                name="useCase"
                value={fields.useCase}
                onChange={onChange}
                className={cn(control, controlState(), 'h-[3.25rem] cursor-pointer appearance-none pr-11')}
              >
                {copy.useCase.options.map((option) => (
                  <option key={option} value={option} className="bg-void-2 text-ink">
                    {option}
                  </option>
                ))}
              </select>
              <CaretDownIcon
                size={18}
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-2"
              />
            </Field>

            <Field id={fid('message')} label={copy.message.label} error={errors.message} valid={isValid('message')}>
              <textarea
                id={fid('message')}
                name="message"
                required
                rows={4}
                maxLength={MESSAGE_MAX}
                placeholder={copy.message.placeholder}
                value={fields.message}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={describedBy('message')}
                className={cn(control, controlState(errors.message), 'min-h-32 resize-y py-3.5 pr-11 leading-relaxed')}
              />
              <span aria-hidden className="pointer-events-none absolute bottom-3 right-4 font-mono text-xs text-ink-3">
                {fields.message.length}/{MESSAGE_MAX}
              </span>
            </Field>

            {/* Honeypot: hidden from people and assistive tech. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={fid('website')}>Website</label>
              <input
                id={fid('website')}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={fields.website}
                onChange={onChange}
              />
            </div>

            <AnimatePresence initial={false}>
              {status === 'error' && (
                <motion.p
                  role="alert"
                  className="flex items-start gap-2 rounded-input border border-signal-soft/40 bg-signal/10 px-4 py-3 text-sm text-ink"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <WarningCircleIcon size={18} className="mt-px shrink-0 text-signal-soft" aria-hidden />
                  {copy.errors.network}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-5 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg" disabled={submitting} icon={submitting ? 'none' : 'arrow'} className="sm:order-2">
                {submitting ? (
                  <span className="inline-flex items-center gap-2.5">
                    <CircleNotchIcon size={18} className="animate-spin" aria-hidden />
                    {copy.sending}
                  </span>
                ) : (
                  copy.submit
                )}
              </Button>
              <p id={`${uid}-privacy`} className="max-w-[19rem] text-sm leading-relaxed text-ink-3 sm:order-1">
                {site.contact.privacy}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
