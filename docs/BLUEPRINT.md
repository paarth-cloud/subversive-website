# Subversive landing page blueprint

Creative direction, conversion design, motion system, copy deck and front-end build plan for the Subversive lead-capture landing page. The code in this repo implements this document. Where the two disagree, update this file first.

**Design read:** a lead-capture landing page for operations and technology leaders, in a cinematic dark-tech language (Apple and Tesla restraint, Lusion-grade WebGL), carried by one real-time isometric voxel brain that becomes a superintelligence as you scroll. The brain is a stylised isometric object, never an anatomical organ.

**Dials:** design variance 8 (asymmetric, editorial, oversized type), motion intensity 8 (cinematic scroll storytelling), visual density 3 (airy, one idea per screen).

---

## 1. Creative direction

### Brand

Subversive builds custom agentic AI to order. No product catalogue and no seat licences: the client brings a decision that is too slow, a workflow that is too manual or a customer experience that has stalled, and Subversive designs, ships and runs the agent system that closes the gap, on top of the tools the client already uses.

- **Promise:** intelligence at the speed of decision.
- **Belief:** the advantage is no longer more data or more tools. It is how fast you act on what you know.
- **Personality:** precise, confident, quietly rebellious. The name is a provocation; the work is engineering. We never shout, we never hype, we show the thing working.
- **Existing assets kept:** signal red `#E8192C` as the single UI accent; the warm gradient (red, amber) and the cool gradient (violet, blue, cyan) from the current identity. They become the story: warm is human, cool is machine.
- **Legal entity:** Vantum Business Solutions LLP. Subversive is its brand. The company is named in the footer copyright and brand line, the contact form's privacy note (it receives the leads), the Organization structured data (`legalName`) and the author meta tag.

### Audience

| Who | What they care about | What they fear |
| --- | --- | --- |
| COO, Head of Operations | Throughput, cost per case, SLA | A project that eats a quarter and changes nothing |
| CTO, Head of Data or AI | Fit with the stack, security, maintainability | Black-box vendors, another platform to babysit |
| Head of CX or Revenue | Response time, conversion, retention | Robotic customer experiences that damage the brand |
| Founder or GM (mid-market) | Speed, competitive edge | Paying for hype |

Arrival state: they clicked an ad that promised faster decisions with AI agents. They are **problem aware** and **solution curious**: they know agents exist, they have seen pilots stall, and they are sceptical of AI agencies. They give the page about three seconds to prove it is serious and ten seconds to show them what to do next.

Words they use for the problem: "too slow", "bottleneck", "manual", "stuck in approvals", "we have the data but nobody acts on it", "pilot purgatory", "it never made it to production".

### International references to outperform

| Reference | What it does well | Where we go further |
| --- | --- | --- |
| Apple product pages (AirPods, Vision Pro) | Scroll-scrubbed cinematic sequences, ruthless copy | We pair the sequence with a live, interactive WebGL object instead of video only |
| Linear | Typographic precision, dark calm | More emotion: the brain transformation gives a narrative arc Linear does not have |
| Lusion, Active Theory, Igloo Inc | Award-grade real-time 3D | We keep the 3D in service of conversion: the CTA is never more than one screen away |
| Sierra, Decagon (agent companies) | Clear agent positioning | We sell the outcome (speed) and the method, not one product |
| Stripe | Gradient craft and polish | Our gradients carry meaning (warm human to cool machine) instead of decoration |

### The first three seconds

The visitor should feel: **"These people operate at a different speed, and they are in control of it."**

- Second 0 to 1: darkness opens on a glowing human brain that is breathing. Calm, not loud.
- Second 1 to 2: the headline sets in line by line. "Intelligence at the speed of decision."
- Second 2 to 3: one clear red button, "Book a build call", and the first proof points visible at the bottom edge of the screen.

### Visual identity

**Theme.** Dark only, by design. The brain glows against the void, and a light mode would erase the core brand expression. `color-scheme: dark` is declared so form controls and scrollbars match.

**Palette.**

| Token | Value | Use |
| --- | --- | --- |
| `void` | `#07080B` | Page background (never pure black) |
| `void-2` | `#0C0E13` | Raised surfaces |
| `ink` | `#EDECE8` | Primary text |
| `ink-2` | `#A6A9B1` | Secondary text |
| `ink-3` | `#8A8E98` | Captions, meta (5.6:1 on void) |
| `line` | `rgba(237,236,232,0.09)` | Hairlines and glass borders |
| `signal` | `#E8192C` | The one UI accent: primary buttons, focus, highlights |
| `signal-soft` | `#FF4A58` | Accent text on dark (AA safe) |
| Human spectrum | `#E8192C` `#FF8A00` `#FF3D88` | 3D and imagery only, early story |
| Machine spectrum | `#6A4BFF` `#2272FF` `#00C2D1` | 3D and imagery only, late story |

**Type.** Geist Variable for display and text, Geist Mono Variable for data and the few technical labels. Display set at weight 500 to 560 with tracking at minus 0.045em and leading 0.95. Emphasis uses Geist italic or the signal colour, never a second family.

**Shape rule.** Interactive elements (buttons, tags, nav) are full pills. Panels and cards use 24px corners. Inputs use 14px corners. Nothing else.

**Material.** Dark glass: 4 percent white fill, 20px backdrop blur, a 1px hairline border and a 1px inner top highlight. A solid fallback is used under `prefers-reduced-transparency`. A fixed, non-interactive film grain sits over everything at very low opacity.

**Imagery.** Four Higgsfield keyframes of the same isometric voxel brain at 3840x2160 (GPT Image 2.5, extra-high quality), registered to one camera (scripts/align-keyframes.mjs), showing the transformation: warm voxels, awakening, wireframe lattice, brain of light with orbital rings. A Higgsfield video generated between the first and last aligned keyframes plays the same transformation, scroll-scrubbed, in the Shift section when WebGL is unavailable, with the keyframes as its own fallback. The keyframes are also the WebGL fallback poster, the process bento imagery and the Open Graph image.

**3D.** A real-time WebGL isometric voxel brain. The Higgsfield image-to-3D GLB (Tripo) defines the silhouette; in the browser it is turned 45 degrees and voxelised onto an axis-aligned grid, with a clean gap between the hemispheres and fold channels carved along noise contours. About 2,500 instanced cubes render under a true isometric orthographic camera with flat illustration shading (bright tops, mid-tone left, dark right). On scroll the brain is digitised by a wireframe scan, unfolds into seven stacked neural layers with a forward pass of light, and reassembles as a brain of light with orbital rings. The whole page is one continuous shot of this one object: a single transformation that only moves forward, and one full turn from the hero to the contact form.

### Page structure and scroll story

| # | Section | Job | Visitor is thinking | Brain state | Layout family |
| --- | --- | --- | --- | --- | --- |
| 1 | Hero | Message match with the ad, one action | "What is this, is it for me?" | Warm voxel brain, built bottom-up, right side | Asymmetric split |
| 2 | Proof rail | Evidence at the fold | "Can they actually ship?" | Warm voxel brain | Stat row |
| 3 | Problem | Name their pain in their words | "That is exactly us" | Dims, synapses slow | Editorial manifesto, scroll-lit words |
| 4 | Shift | The belief, felt not read | "So what changes?" | Wakes as the camera pushes in; a wireframe scan digitises it during a quarter turn | Pinned cinematic over the live brain |
| 5 | How it works | Listen, Decide, Act | "What does an agent actually do?" | Arrives digitised, unfolds into stacked layers, reassembles as light | Sticky scroll story |
| 6 | What we build | Built to order, breadth | "Can they build what we need?" | Brain of light, a quarter turn to centre, panels orbit it | Floating composition and tag cloud |
| 7 | Industries | Relevance | "Do they know my sector?" | Steps aside, dimmed, still turning | Single marquee |
| 8 | Process | The 4S method, low risk | "What happens if we start?" | Fades out, still turning (the bento carries the imagery) | Bento with imagery |
| 9 | FAQ | Kill the last objections | "What about data, cost, timing?" | Hidden | Accordion |
| 10 | Contact | Convert | "Fine, let's talk" | Rises back in with the section, facing you after one full turn, behind the glass form | Split with form |

Two section families never repeat, no more than three eyebrows are used on the page, and there is exactly one marquee.

### Technology

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite 8, React 19, TypeScript 6 | Fast, typed, static output that deploys anywhere |
| Styling | Tailwind CSS 4 with `@theme` tokens | Tokens in one place, utilities in markup |
| Smooth scroll | Lenis | Native scroll with inertia, compatible with sticky and ScrollTrigger |
| Scroll choreography | GSAP 3 and ScrollTrigger | One continuous scrubbed path for the scene, scrubbed timelines for the Shift beats and text |
| UI motion | Motion (formerly Framer Motion) | Springs, presence and layout for nav, buttons, accordion and form |
| 3D | Three.js r187, custom GLSL | One scene, one draw call per layer, full control of performance |
| Assets | Higgsfield (GPT Image 2.5 keyframes, Tripo image-to-3D GLB), glTF Transform with Meshopt | Cinematic imagery, compressed geometry |
| Icons | Phosphor | One family, consistent stroke |

GSAP and Three.js never animate the same element as Motion. GSAP owns scroll, Motion owns interaction.

### Build order

1. Tokens, fonts, global styles, smooth-scroll provider.
2. Content model in one file, so copy can change without touching layout.
3. Static, accessible sections with real copy first, so every section works before any motion is added.
4. Hero and proof rail polished first: this is where conversion is decided.
5. WebGL brain, lazy-loaded behind a poster image, then the scroll choreography.
6. Shift sequence over the live brain, with the Higgsfield clip and keyframes as the no-WebGL fallback.
7. Contact form with validation, error and success states.
8. Motion pass (entries, hovers, press states), then a reduced-motion pass.
9. Performance pass, accessibility pass, SEO and analytics hooks, pre-launch checklist.

---

## 2. Above the fold (conversion design)

**Ad assumption.** The ad promised: custom AI agents that make your business faster, live in weeks. The hero repeats that promise in the first line it shows.

**The one promise.** Speed of decision. Everything above the fold supports it.

**The ten-second action.** Click "Book a build call". The secondary action exists for people who are not ready: "See how it works".

| Element | Copy | Notes |
| --- | --- | --- |
| Eyebrow | Custom agentic AI, built to order | Category in five words, answers "what is this" |
| Headline | Intelligence at the speed of decision. | Brand line, two lines on desktop |
| Subhead | We build custom AI agents on the systems you already run, so slow decisions and manual work happen in seconds. | 20 words: what, where, outcome |
| Primary button | Book a build call | Red pill, magnetic on desktop |
| Secondary button | See how it works | Ghost pill, scrolls to the story |
| Visual | Live WebGL brain, glowing, on the right; poster image until it loads | Never blocks the headline |
| Evidence | Proof rail directly under the hero, visible at the bottom edge of the first screen | 2 years in production, 30-minute prototype, reply in one working day, zero training on your data |

**A/B candidates.** Headline B: "Your slowest decisions, made in seconds." Headline C: "AI agents that act, built on your stack." Button B: "Book a 30-minute build call".

---

## 3. Motion system

**Personality.** Inevitable, precise, calm power. Motion is engineered: eased, never bouncy on content. Small springs only on press feedback.

**Tokens.**

| Token | Value | Use |
| --- | --- | --- |
| `ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)` (GSAP `expo.out`) | Reveals, entries |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` (GSAP `power3.inOut`) | Camera moves, morphs, scroll-to |
| `ease.ui` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hover and state changes |
| `dur.micro` | 0.18s | Press, focus |
| `dur.ui` | 0.32s | Hover, toggles |
| `dur.reveal` | 0.9s | Text and panel reveals (range 0.6 to 1.2s) |
| `dur.hero` | 1.2s | Hero headline lines |
| `stagger.words` | 0.04s | Word reveals |
| `stagger.lines` | 0.09s | Line reveals |

**Motion with meaning.**

| Moment | Motion | What it communicates |
| --- | --- | --- |
| Hero load | Voxels drop into place bottom-up (the brain is built), headline words rise from masks, button fades in last | Arrival, built to order, where to click |
| Problem | Words light up as you read; brain dims and its synapses slow | The cost of waiting |
| Shift | Pinned beats over the live brain: it wakes, the camera pushes in and the wireframe scan sweeps it one hemisphere first during a quarter turn (without WebGL, the Higgsfield clip is scrubbed instead) | The core belief, felt |
| How it works | The digitised brain unfolds into seven stacked layers with a forward pass, then reassembles as a brain of light; it rests in true isometric alignment at each chapter | Listen, decide, act |
| What we build | Floating panels drift at different depths, tags cascade in | Breadth and depth of builds |
| Contact | Brain of light glows through the glass form | Arrival at the decision |
| Cursor | Voxels under the pointer rise, like pressing a tactile grid | The system responds to you |
| Form | Inline validation, button morphs into a confirmation | Feedback and closure |

**One continuous shot.** The brain is the only protagonist from the first frame to the last: no cut to video, no reset, no parking between sections. Each scene property (morph, position, scale, spin, opacity, energy) follows a monotone cubic curve through the stops that name it, so velocity never jumps at a section boundary and nothing overshoots, and a 0.9s scrub gives the object a little weight behind the page. The morph only moves forward (organic, digitised, layers, light). The spin makes one full turn over the page and rests on 90 degree multiples where people stop to read. The brain fades only where dense content needs the stage (process and FAQ), keeps turning while hidden, and rises back in with the contact section.

**Cut list (motion that slows people down).** No scroll hijacking of the hero. No delay before the CTA is clickable. No animated counters (they make you wait to read a number). No parallax on body text. No motion inside the FAQ beyond the open and close. No animation on the form fields except focus and validation.

**Never moves.** Body copy after reveal, nav links, form fields, legal text, the proof numbers, the footer.

**Mobile performance budget.** Initial JavaScript is about 200 KB gzip (React 19, Motion, GSAP and Lenis). Three.js and the scene, about 170 KB gzip, load as a separate chunk after first paint and idle. LCP is the headline text or the preloaded 28 KB AVIF poster, under 2.5s on 4G. The voxel grid is 0.07 units on desktop (about 2,500 cubes) and 0.078 to 0.092 on phones and weak GPUs. Pixel ratio is capped at 1.5 on phones and 1.75 on desktop and steps down automatically if frames run long. No Lenis smoothing on touch (native inertia instead). Rendering stops whenever the canvas is fully faded.

**Reduced motion.** Lenis disabled. Scrubbed timelines become instant state changes. The brain still renders but stops its idle motion and jumps between states. Marquee stops. Text appears without translation.

---

## 4. Copy deck

Awareness on arrival: problem aware, solution curious, sceptical of AI hype. Each section answers the objection that appears at that scroll depth, using only evidence Subversive actually has.

**Evidence inventory (all from Subversive's current materials).** Two years shipping custom agentic systems into production across financial services, healthcare, commerce and operations. A 30-minute first call: half scoping, half a working prototype in the client's stack. A reply within one working day. Inputs are never shared, sold or used for training. Agent systems live in production today. Proprietary R&D in Subversive Labs.

**Evidence to add before launch.** Named case studies with a metric, client logos (with permission), one short quote from a client leader.

| Depth | Objection | Answer |
| --- | --- | --- |
| Hero | "Is this for me?" | Speed of decision, on your stack |
| Proof | "Can they ship?" | Two years in production, prototype on the first call |
| Problem | "Do they get my problem?" | Their words: approvals, queues, reports that wait |
| Shift | "Why agents, why now?" | The advantage is acting fast, not having more data |
| How it works | "What does it actually do?" | Listen, decide, act, with humans in charge |
| What we build | "Will it fit our case?" | Built to order, connects to the stack you run |
| Process | "What if it stalls like the last pilot?" | Sense, Solve, Scale, Sustain, prototype first |
| FAQ | "Data, price, timing, team?" | Straight answers |
| Contact | "What happens when I click?" | 30 minutes with a builder, not a sales rep |

The full copy lives in `src/content/site.ts`, which is the single source of truth for every visible string. No em dashes anywhere.

**Final call to action.** Heading: "Tell us what's too slow." Body: "Thirty minutes with a builder, not a sales rep. Half scoping your problem, half a working prototype in your stack." Button: "Book a build call". Success: "Request received. A builder will email you within one working day with times for your call."

---

## 5. Front-end build plan

### Components

| Component | Repeats | Notes |
| --- | --- | --- |
| `Button` | Nav, hero, contact | Variants primary and ghost, magnetic on fine pointers, press scale 0.97 |
| `SplitReveal` | Every headline | Accessible: real text for screen readers, split spans hidden from them |
| `Reveal` | Paragraphs, panels | Motion `whileInView`, once |
| `GlassPanel` | Floating UI, form, bento | Reduced-transparency fallback |
| `Tag` | Capability cloud, listen chips | Pill, hover glow |
| `Marquee` | Industries | CSS animation, pauses on hover and reduced motion |
| `Accordion` | FAQ | Native `button` plus `aria-expanded`, Motion height |
| `SectionHeading` | Most sections | Optional eyebrow (rationed), split headline, body |
| `BrainCanvas` | Global | Lazy WebGL host with poster fallback |

### Content that changes often

All copy, stats, FAQ items, capability tags, industries and contact details live in `src/content/site.ts`. Lead routing lives in environment variables (`VITE_LEAD_ENDPOINT`, `VITE_BOOKING_URL`).

### Folder structure

```
src/
  content/site.ts          single source of truth for copy
  styles/globals.css       Tailwind import, @theme tokens, base layer
  lib/                     easing tokens, device tiers, analytics, class utils
  hooks/                   reduced motion, media queries
  providers/SmoothScroll   Lenis + GSAP ticker + ScrollTrigger sync
  components/ui/           Button, SplitReveal, Reveal, GlassPanel, Tag, Marquee, Accordion
  components/layout/       Nav, Footer, Grain, Aurora
  sections/                one file per page section
  features/contact/        form, validation, submission
  webgl/                   scene, geometry, shaders, scroll choreography
public/
  models/brain.glb         Meshopt-compressed Higgsfield mesh
  media/                   AVIF and WebP keyframes, OG image
scripts/                   asset optimisation (glTF Transform, ffmpeg)
```

### Breakpoints

Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. Content width capped at 1440px with a fluid gutter of `clamp(20px, 4vw, 64px)`. Every asymmetric layout collapses to one column below 768px. The brain moves from the right side (desktop) to behind the headline at reduced opacity (mobile).

### Image and font loading

- Keyframes exported as AVIF with WebP fallback at 1280 and 2048 widths, `srcset` and `sizes` set, `decoding="async"`.
- Hero poster is preloaded with `fetchpriority="high"` and sits under the canvas until WebGL is ready.
- The Shift clip and keyframes load only when WebGL is unavailable; with WebGL, the live brain carries the section and neither is downloaded.
- The Shift clip (Higgsfield, MiniMax H3 at 2K between the aligned first and last keyframes) is H.264 with a keyframe every 8 frames and no B-frames, so seeking stays cheap: 1080p (5.1 MB) for viewports 900px and wider, 720p (2.5 MB) below. It starts loading one and a half screens ahead, fades in only once frames can be decoded, and is skipped entirely for reduced motion or reduced data. The keyframes are lazy and carry the sequence until it can seek.
- GLB is Meshopt-compressed and fetched only after the WebGL chunk loads.
- Fonts are self-hosted variable WOFF2 (Latin subset first) with `font-display: swap`.

### Accessibility requirements

WCAG 2.2 AA. Skip link to main content. One `h1`. Landmarks for header, main and footer. Visible focus ring (2px signal red with offset). All interactive targets at least 44px. Keyboard access everywhere, including the accordion and form. The canvas is `aria-hidden` and decorative. Split text keeps an accessible label. Form labels are above inputs, errors are linked with `aria-describedby` and announced through a polite live region. Full reduced-motion and reduced-transparency support. Contrast checked for every text style on its real background.

### Pre-launch checklist

- [ ] Copy self-audit, no em dashes, no unsupported numbers
- [ ] Real case studies or logos added, or the proof rail reviewed by the team
- [ ] `VITE_LEAD_ENDPOINT` set and a test lead received in the CRM
- [ ] `VITE_BOOKING_URL` set if a scheduling link exists
- [ ] Privacy policy link points to the live policy, which names Vantum Business Solutions LLP as the company receiving leads
- [ ] Legal entity wording ("Subversive is a brand of Vantum Business Solutions LLP") approved by the team
- [ ] Lighthouse mobile: performance 85+, accessibility 100, best practices 100, SEO 100
- [ ] Core Web Vitals: LCP under 2.5s, INP under 200ms, CLS under 0.1
- [ ] Tested on Safari iOS, Chrome Android, Chrome, Safari and Firefox desktop
- [ ] Reduced motion, reduced transparency and keyboard-only passes
- [ ] WebGL failure path checked (poster image shows, Shift scrubs the Higgsfield clip, page still converts)
- [ ] Open Graph image and meta verified with a link preview tool
- [ ] Analytics: `cta_click` (with location), `form_start`, `form_submit`, `form_success`, `form_error`
- [ ] 404 and redirect from old URLs if this replaces an existing page
