# Subversive landing page

Lead-capture landing page for Subversive, the custom agentic AI brand of **Vantum Business Solutions LLP**.

A real-time isometric voxel brain (Three.js + WebGL) carries the whole page as one continuous scroll motion (GSAP ScrollTrigger + Lenis). It is built bottom-up in the hero, digitised by a wireframe scan while the pinned Shift section's thesis lands, unfolds into stacked neural layers and reassembles as a brain of light, making one full turn on the way down. Without WebGL, the Shift section scrubs a Higgsfield clip of the same transformation instead.

The full creative direction, copy deck, motion system and build plan live in [docs/BLUEPRINT.md](docs/BLUEPRINT.md).

## Stack

React 19, TypeScript 6, Vite 8, Tailwind CSS 4, Motion (formerly Framer Motion), GSAP 3 with ScrollTrigger, Lenis, Three.js r187, Phosphor icons, self-hosted Geist fonts.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build on http://localhost:4173 |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint (TypeScript and React hooks rules) |
| `npm run optimize:brain` | Rebuild `public/models/brain.glb` from the raw mesh |
| `npm run align:keyframes` | Register the four keyframes to one brain box |
| `npm run optimize:media` | Rebuild the AVIF and WebP keyframes and crops |
| `npm run encode:video` | Encode the Shift clip for scroll scrubbing |

## Lead capture

Copy `.env.example` to `.env` and set:

| Variable | Purpose |
| --- | --- |
| `VITE_LEAD_ENDPOINT` | Where the form POSTs JSON: your API route, a CRM webhook (HubSpot, Attio, Pipedrive) or a form service. Empty runs the form in demo mode: it validates and shows the success state but sends nothing. |
| `VITE_BOOKING_URL` | Optional scheduling link (Cal.com, Calendly) shown after a successful submission. |
| `VITE_SITE_URL` | Public URL for canonical and Open Graph tags. |

The payload contains `name`, `email`, `company`, `role`, `useCase`, `message`, `source`, `page` and `submittedAt`. A hidden honeypot field silently drops bot submissions.

Analytics events (`cta_click`, `form_start`, `form_submit`, `form_success`, `form_error`) are forwarded to Google Tag Manager, Plausible or PostHog if one is on the page. See `src/lib/analytics.ts`.

## Editing content

Every visible string, including the legal entity name, lives in `src/content/site.ts`. Layout components only read from it. House rules: no em dashes, and no numbers the company cannot stand behind.

## Scroll motion

The brain's journey is one list of stops in `src/webgl/choreography.ts`, each tied to a `data-scene` anchor in the page. Every property (morph, position, scale, spin, opacity, energy) follows a smooth monotone curve through the stops that name it, so the brain never parks between sections and its transformation only moves forward. To change where something happens, move the anchor or the stop's `at` value. The curves rebuild on every layout change.

The brain never sits on text because each section reserves an empty **stage** for it in its own layout: a `data-stage` box, framed by the `StageHud` instrument overlay. A stop that names a stage fits the brain into that box at whatever screen size the visitor has (`src/webgl/stage.ts` does the maths), `zoom` scales it within the box, and stages inside a pinned frame (`data-pin`) are measured where they hold still. Two stops on the same stage make the brain ride along with it, and `only` limits a stop to desktop or mobile. To move the brain somewhere new, move or resize its stage in the section's markup; the choreography follows.

## Project structure

```
src/
  content/       site.ts (all copy), media.ts (image registry)
  styles/        globals.css: Tailwind import, @theme tokens, base layer
  lib/           motion tokens, device tiers, analytics, class utils
  hooks/         media query hooks (reduced motion, desktop, fine pointer)
  providers/     SmoothScroll: Lenis + GSAP ticker + ScrollTrigger sync
  components/    ui primitives and layout (Nav, Footer, Aurora, Grain)
  sections/      one file per page section
  features/      contact form, validation, submission
  webgl/         BrainCanvas (lazy host), BrainExperience (scene),
                 voxelBrain (mesh to voxels), shaders, choreography
public/
  models/        brain.glb (Meshopt-compressed, 93 KB)
  media/         keyframes and crops (AVIF and WebP)
scripts/         asset pipeline (glTF Transform, sharp)
raw-assets/      Higgsfield originals (git-ignored, kept for re-exports)
```

## Assets

All imagery, the scroll video and the brain mesh were generated with Higgsfield:

- `raw-assets/hq-stage{1..4}.png`: GPT Image 2.5 keyframes of the isometric voxel brain, extra-high quality at 3840x2160.
- `raw-assets/shift-source.mp4`: the transformation clip, generated from the aligned first and last keyframes. It plays in the Shift section only when WebGL is unavailable.
- `raw-assets/brain-tripo.glb`: Tripo image-to-3D mesh (from a clay reference render), the source of the voxel brain's silhouette.

To regenerate the web assets, run these in order:

```bash
npm run align:keyframes -- hq
```

```bash
npm run optimize:media
```

```bash
npm run encode:video
```

```bash
npm run optimize:brain
```

Every crop is defined relative to the brain box that the alignment step records in `raw-assets/aligned.json`, so re-rendered keyframes at any resolution export correctly. After re-exporting, copy the printed source sizes into `src/content/media.ts`.

Earlier renders (`stage{1..4}.png`, anatomical; `iso-stage{1..4}.png`, 2K) are kept for reference but are no longer used.

## Deployment

The build is a static site, set up for Cloudflare Pages built from GitHub. It also runs on Vercel, Netlify or any static host.

1. Push this folder to a GitHub repository. `.gitignore` keeps `node_modules`, `dist`, `.env` and `raw-assets` out of it.
2. In the Cloudflare dashboard, go to **Workers & Pages**, create an application, choose **Pages** and connect the GitHub repository.
3. Build settings: build command `npm run build`, build output directory `dist`. `.node-version` pins Node 22 for the build.
4. Add the `VITE_*` variables under the project's environment variables for Production. Vite bakes them in at build time, so redeploy after changing one. Without `VITE_LEAD_ENDPOINT` the form stays in demo mode and leads go nowhere.
5. Deploy. Every push to the production branch (`main`) redeploys the live site; other branches get preview URLs.
6. Custom domain: the project's **Custom domains** tab, then **Set up a domain**.

`public/_headers` caches the content-hashed files in `/assets` for a year, and the media and brain model for a week. Canonical, Open Graph and JSON-LD URLs come from `VITE_SITE_URL` (default `https://aisubversive.com`).

## Behaviour by device

- WebGL loads after first paint and idle. Without WebGL2, or if the scene fails, the hero keeps its poster image, the Shift section scrubs the Higgsfield clip over its keyframes instead, and the page still works.
- Quality tiers (`src/lib/device.ts`) set voxel resolution and pixel ratio. The pixel ratio steps down automatically if frames run long.
- `prefers-reduced-motion`: Lenis is off, scroll morphs jump between states instead of animating, idle motion stops and the marquee is static.
- `prefers-reduced-transparency`: glass panels become solid.
- Touch devices keep native scroll momentum; the cursor interaction is desktop only.
