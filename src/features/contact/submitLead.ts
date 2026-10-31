import type { LeadFields } from './validation'

export type SubmitResult = { demo: boolean }

/**
 * Posts a lead as JSON to VITE_LEAD_ENDPOINT (your API route, CRM webhook or
 * form service). Without an endpoint the form runs in demo mode: it validates
 * and plays the success state but sends nothing.
 */
export async function submitLead(fields: LeadFields, signal?: AbortSignal): Promise<SubmitResult> {
  // Bots fill the hidden field; let them think it worked.
  if (fields.website) return { demo: false }

  const payload = {
    name: fields.name.trim(),
    email: fields.email.trim(),
    company: fields.company.trim(),
    role: fields.role.trim(),
    useCase: fields.useCase,
    message: fields.message.trim(),
    source: 'landing-page',
    page: typeof window === 'undefined' ? '' : window.location.href,
    submittedAt: new Date().toISOString(),
  }

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT
  if (!endpoint) {
    await new Promise((resolve) => setTimeout(resolve, 1100))
    return { demo: true }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })
  if (!response.ok) throw new Error(`Lead endpoint responded with ${response.status}`)
  return { demo: false }
}
