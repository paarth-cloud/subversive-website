import { site } from '../../content/site'

export type LeadFields = {
  name: string
  email: string
  company: string
  role: string
  useCase: string
  message: string
  /** Honeypot. Humans never see or fill it. */
  website: string
}

export type FieldName = keyof LeadFields
export type FieldErrors = Partial<Record<FieldName, string>>

export const MESSAGE_MIN = 20
export const MESSAGE_MAX = 1200

export const emptyLead: LeadFields = {
  name: '',
  email: '',
  company: '',
  role: '',
  useCase: site.contact.form.useCase.options[0],
  message: '',
  website: '',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'gmx.com',
  'mail.com',
  'yandex.com',
])

const { errors } = site.contact.form

export function validateField(name: FieldName, value: string): string | undefined {
  const v = value.trim()
  switch (name) {
    case 'name':
      return v.length < 2 ? errors.nameRequired : undefined
    case 'email':
      if (!v) return errors.emailRequired
      return EMAIL.test(v) ? undefined : errors.emailInvalid
    case 'company':
      return v.length < 2 ? errors.companyRequired : undefined
    case 'message':
      if (!v) return errors.messageRequired
      return v.length < MESSAGE_MIN ? errors.messageShort : undefined
    default:
      return undefined
  }
}

export const REQUIRED_FIELDS: FieldName[] = ['name', 'email', 'company', 'message']

export function validateLead(fields: LeadFields): FieldErrors {
  const result: FieldErrors = {}
  for (const name of REQUIRED_FIELDS) {
    const error = validateField(name, fields[name])
    if (error) result[name] = error
  }
  return result
}

/** Soft hint only: we never block a personal address. */
export function isFreeEmail(email: string) {
  const domain = email.trim().toLowerCase().split('@')[1]
  return Boolean(domain && FREE_EMAIL_DOMAINS.has(domain))
}
