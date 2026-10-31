/**
 * Single source of truth for every visible string on the page.
 * Edit copy here; layout components only read from this file.
 * House rules: no em dashes, no numbers Subversive cannot stand behind.
 */

export type NavItem = { label: string; href: `#${string}` }

export type TraceLine = { event: string; detail: string }

export type Step = {
  id: 'listen' | 'decide' | 'act'
  verb: string
  title: string
  body: string
  trace: readonly TraceLine[]
}

export type ExampleAgent = { title: string; body: string; trace: string }

export type ProcessStep = {
  id: 'sense' | 'solve' | 'scale' | 'sustain'
  verb: string
  body: string
  outcome: string
  image: 'detail-sense' | 'detail-solve' | 'detail-scale' | 'detail-sustain'
}

export type IndustryIcon =
  | 'bank'
  | 'heartbeat'
  | 'shopping'
  | 'truck'
  | 'buildings'
  | 'bell'
  | 'graduation'
  | 'lightning'

export type FaqItem = { q: string; a: string }

export const site = {
  name: 'Subversive',
  /** The legal entity behind the Subversive brand. */
  legalName: 'Vantum Business Solutions LLP',
  email: 'hello@subversive.ai',
  pressEmail: 'press@subversive.ai',

  nav: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'What we build', href: '#what-we-build' },
    { label: 'Process', href: '#process' },
    { label: 'FAQ', href: '#faq' },
  ] satisfies readonly NavItem[],

  /** One label for the one conversion intent, used everywhere. */
  cta: { label: 'Book a build call', href: '#contact' } satisfies NavItem,

  hero: {
    eyebrow: 'Custom agentic AI, built to order',
    title: 'Intelligence at the speed of decision.',
    body: 'We build custom AI agents on the systems you already run, so slow decisions and manual work happen in seconds.',
    secondary: { label: 'See how it works', href: '#how-it-works' } satisfies NavItem,
  },

  proof: [
    { value: '2 years', label: 'shipping agentic systems into production' },
    { value: '30 min', label: 'to see a working prototype in your stack' },
    { value: '1 day', label: 'typical time to hear back from us' },
    { value: 'Zero', label: 'training on your data, ever' },
  ],

  problem: {
    statement: "You don't have a data problem. You have a speed problem.",
    body: 'Approvals sit in inboxes. Tickets sit in queues. Reports wait for Monday. Every hour a decision waits costs you customers, margin and momentum.',
  },

  shift: {
    label: 'A human brain becoming a superintelligent AI, in four stages',
    beats: [
      "The advantage isn't more data.",
      "It isn't more tools.",
      "It's how fast you act on what you know.",
      'Agents close that loop in seconds.',
    ],
  },

  how: {
    eyebrow: 'How it works',
    title: 'Listen. Decide. Act.',
    intro: 'Every agent we ship runs the same loop, tuned to your data, your rules and your edge cases.',
    traceLabel: 'Example agent trace',
    steps: [
      {
        id: 'listen',
        verb: 'Listen',
        title: 'Read every signal at machine scale.',
        body: 'Agents take in what your business already produces: calls, chats, tickets, transactions, documents and sensor data. Nothing new to collect.',
        trace: [
          { event: 'call.transcribed', detail: 'ES-MX, 0:42' },
          { event: 'ticket.parsed', detail: '#48213, refund' },
          { event: 'invoice.matched', detail: 'PO-7713' },
          { event: 'signal.ready', detail: '3 sources merged' },
        ],
      },
      {
        id: 'decide',
        verb: 'Decide',
        title: 'Reason over your rules in real time.',
        body: 'Custom decision agents weigh your data, your policies and your edge cases, then decide or recommend the moment it matters.',
        trace: [
          { event: 'policy.check', detail: 'under limit, pass' },
          { event: 'history.score', detail: 'long-term customer, low risk' },
          { event: 'decision', detail: 'approve, confidence 0.94' },
          { event: 'escalation', detail: 'not needed' },
        ],
      },
      {
        id: 'act',
        verb: 'Act',
        title: 'Close the loop without waiting.',
        body: "Agents don't stop at suggestions. They call your tools, update your systems and finish the job, with people in charge where you want them.",
        trace: [
          { event: 'payments.refund', detail: 'sent' },
          { event: 'crm.update', detail: 'case closed' },
          { event: 'email.send', detail: 'confirmation' },
          { event: 'loop.closed', detail: 'seconds, not days' },
        ],
      },
    ] satisfies readonly Step[],
  },

  build: {
    title: 'Built to order. Never off the shelf.',
    body: "No catalogue and no licence to buy. You bring the decision that's too slow, and we design the agent system that closes the gap.",
    examplesLabel: 'Illustrative examples of agents we build',
    examples: [
      {
        title: 'Approvals agent',
        body: 'Refunds within policy approved in seconds. Edge cases go to a person with the full context attached.',
        trace: 'refund.approve  #48213',
      },
      {
        title: 'Triage agent',
        body: 'Every inbound ticket classified, enriched and routed to the right team before anyone opens it.',
        trace: 'ticket.route  tier_2',
      },
      {
        title: 'Collections agent',
        body: 'Respectful payment conversations that agree realistic plans and write them back to the ledger.',
        trace: 'plan.agree  synced',
      },
      {
        title: 'Leadership brief',
        body: 'A live decision surface that explains what changed this week and what to do about it.',
        trace: "brief.generate  'Q3 churn'",
      },
      {
        title: 'Operations forecaster',
        body: 'Demand and stock signals simulated daily, with re-orders raised before the shortfall.',
        trace: 'reorder.raise  early',
      },
    ] satisfies readonly ExampleAgent[],
    capabilitiesLabel: 'What goes into a build',
    capabilities: [
      'Decision agents',
      'Workflow automation',
      'Voice and chat agents',
      'Document intelligence',
      'Forecasting and simulation',
      'Leadership intelligence',
      'Systems integration',
      'Human-in-the-loop design',
      'Evaluation and monitoring',
    ],
    stack: 'Connects to your CRM, ERP, data warehouse, ticketing, calendar and payment tools. Nothing gets ripped out.',
  },

  industries: {
    label: 'Built for teams in',
    items: [
      { name: 'Financial services', icon: 'bank' },
      { name: 'Healthcare', icon: 'heartbeat' },
      { name: 'Retail and commerce', icon: 'shopping' },
      { name: 'Logistics', icon: 'truck' },
      { name: 'Real estate', icon: 'buildings' },
      { name: 'Hospitality', icon: 'bell' },
      { name: 'Education', icon: 'graduation' },
      { name: 'Energy', icon: 'lightning' },
    ] satisfies readonly { name: string; icon: IndustryIcon }[],
  },

  process: {
    title: 'From first call to production.',
    body: 'One method, four disciplines. They run in sequence, then in sync.',
    steps: [
      {
        id: 'sense',
        verb: 'Sense',
        body: 'We map the signals behind the decision and show you a working prototype in your stack on the first call.',
        outcome: 'Prototype on call one',
        image: 'detail-sense',
      },
      {
        id: 'solve',
        verb: 'Solve',
        body: 'We build the agent on your data, rules and edge cases, then prove it on real cases before anything goes live.',
        outcome: 'Proven on your cases',
        image: 'detail-solve',
      },
      {
        id: 'scale',
        verb: 'Scale',
        body: "What works in one workflow rolls out across teams without breaking what's already running.",
        outcome: 'Team by team',
        image: 'detail-scale',
      },
      {
        id: 'sustain',
        verb: 'Sustain',
        body: 'Every agent is monitored, evaluated and tuned in production, including the models underneath. Nothing is set and forget.',
        outcome: 'Always improving',
        image: 'detail-sustain',
      },
    ] satisfies readonly ProcessStep[],
  },

  faq: {
    title: 'Questions we hear on the first call.',
    body: 'Straight answers. If yours is not here, ask us directly.',
    items: [
      {
        q: 'Do you sell software?',
        a: 'No. We build custom agent systems on top of the tools you already run. You get a working system shaped around your workflow, not a seat licence.',
      },
      {
        q: 'How fast can we have an agent live?',
        a: 'It depends on the workflow and the integrations. You see a working prototype on the first call, and we scope a realistic path to production before you commit to anything.',
      },
      {
        q: 'Will it work with our systems?',
        a: 'Agents connect to your CRM, ERP, data warehouse, ticketing, calendar and payment tools through their APIs. Nothing needs to be ripped out or replaced.',
      },
      {
        q: 'What happens to our data?',
        a: "Everything you share is treated as confidential. We don't share it, sell it or use it to train models.",
      },
      {
        q: 'Do we need an AI team?',
        a: 'No. We design, build and run the system with your team. Your people stay in charge of the decisions that need a human.',
      },
      {
        q: 'How is an engagement priced?',
        a: 'Every build is scoped after the first call, based on the workflow, the integrations and the scale. You get a clear proposal before you commit.',
      },
    ] satisfies readonly FaqItem[],
  },

  contact: {
    eyebrow: 'Book a build call',
    title: "Tell us what's too slow.",
    body: 'Thirty minutes. Half scoping your problem, half a working prototype in your stack.',
    steps: [
      { title: 'Send the brief', body: 'Two minutes. Tell us the decision or workflow that drags.' },
      { title: 'Hear back in a day', body: 'We reply within one working day with times for the call.' },
      { title: 'See it working', body: 'We scope it together and show a prototype in your stack.' },
    ],
    privacy:
      'Your brief goes to Vantum Business Solutions LLP, the company behind Subversive. We never share it, sell it or train on it.',
    form: {
      name: { label: 'Your name', autoComplete: 'name' },
      email: { label: 'Work email', autoComplete: 'email' },
      company: { label: 'Company', autoComplete: 'organization' },
      role: { label: 'Role', optional: 'Optional', autoComplete: 'organization-title' },
      useCase: {
        label: 'What do you want to speed up?',
        options: [
          'A slow decision',
          'A manual workflow',
          'Customer conversations',
          'Leadership reporting',
          'Not sure yet',
        ],
      },
      message: {
        label: "What's too slow today?",
        placeholder: 'For example: refund approvals take three days and need two people to sign off.',
      },
      errors: {
        nameRequired: 'Tell us what to call you.',
        emailRequired: 'We need an email to reply to.',
        emailInvalid: "That email doesn't look right.",
        companyRequired: 'Which company are you with?',
        messageRequired: 'A sentence or two is enough to get started.',
        messageShort: 'Add a little more detail so we can prepare.',
        summary: 'Please fix the highlighted fields.',
        network: `Something went wrong sending your brief. Try again, or email hello@subversive.ai.`,
      },
      hints: {
        freeEmail: 'A work email helps us prepare for your company.',
      },
      submit: 'Book a build call',
      sending: 'Sending your brief',
      success: {
        title: 'Request received.',
        body: 'We will email you within one working day with times for your build call.',
        booking: 'Pick a time now',
        reset: 'Send another brief',
      },
    },
  },

  footer: {
    tagline: 'Agentic intelligence for companies that have to move faster than the systems they were built on.',
    brandLine: 'Subversive is a brand of Vantum Business Solutions LLP.',
    legal: 'Vantum Business Solutions LLP. All rights reserved.',
    privacy: { label: 'Privacy', href: '/privacy' },
  },
} as const
