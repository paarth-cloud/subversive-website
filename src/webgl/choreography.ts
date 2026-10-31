import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState, type SceneState } from './sceneStore'
import { fitBox, type Box } from './stage'

type Prop = keyof SceneState
type Key = Partial<SceneState>

type Stop = {
  /** Matches a `data-scene` attribute in the page: where in the scroll the stop sits. */
  scene: string
  /** Where the anchor's top sits (fraction of viewport) when the state is reached. */
  at?: number
  /**
   * The `data-stage` box the brain fills, measured where the stop is reached;
   * it sets x, y and scale. An object names a different stage per breakpoint.
   */
  stage?: string | { desktop?: string; mobile?: string }
  /** Scale on top of the fitted size: above 1 pushes in past the box. */
  zoom?: number
  /** Limits the stop to one layout; elsewhere it is skipped and takes no scroll. */
  only?: 'desktop' | 'mobile'
  desktop: Key
  /** Overrides for screens under 1024px wide. */
  mobile?: Key
}

/** One keyframe of one property; `at` is in scroll pixels. */
type Point = { at: number; value: number; slope: number }
type Track = { prop: Prop; points: Point[] }

const QUARTER_TURN = Math.PI / 2

/**
 * The brain's whole journey, as one continuous shot. Every section reserves an
 * empty stage for it in its own layout, and each stop fits the brain into one,
 * so it can never land on text at any screen size. Every property flows
 * through the stops that set it, so the brain never parks between sections.
 * The morph only moves forward: organic through the problem, digitised while
 * the Shift's beats land, neural layers at Decide, light at Act. The spin makes
 * one full turn and rests on multiples of 90 degrees where people read.
 */
// Two stops on the same stage at different scroll positions make the brain
// ride along with that stage, as if it were part of the section.
const STOPS: Stop[] = [
  { scene: 'hero', stage: 'hero', zoom: 1.12, desktop: { morph: 0, spin: 0, opacity: 1, energy: 1, calm: 0 } },
  // On desktop it recedes as soon as reading starts, so the proof rail can
  // pass beneath it. On phones the stage sits above the copy, so the brain
  // simply leaves with it.
  { scene: 'hero', at: -0.15, only: 'desktop', desktop: { opacity: 0.25, calm: 0.6 } },
  { scene: 'hero', at: -0.62, only: 'desktop', desktop: { opacity: 0.25 } },
  { scene: 'hero', at: -0.45, only: 'mobile', stage: 'hero', zoom: 1.12, desktop: { opacity: 0.25 } },
  // The problem: it steps back onto a smaller stage, dim and congested. On
  // phones it floats up and out of frame while the statement is read.
  {
    scene: 'problem',
    at: 0.05,
    stage: { desktop: 'problem' },
    zoom: 0.9,
    desktop: { morph: 0, spin: 0, opacity: 0.6, energy: 0.35, calm: 1 },
    mobile: { x: 0, y: 1.25, scale: 0.8, opacity: 0 },
  },
  // The Shift wakes it as the section pins: the camera pushes in and a quarter
  // turn follows the wireframe scan across the brain, one hemisphere first. On
  // phones it waits, hidden on its stage, until the problem copy has gone.
  { scene: 'shift', at: 0.3, only: 'mobile', stage: 'shift', zoom: 0.96, desktop: { opacity: 0 } },
  {
    scene: 'shift',
    at: 0,
    stage: 'shift',
    zoom: 0.96,
    desktop: { morph: 0.02, spin: 0, opacity: 0.85, energy: 0.6, calm: 0.6 },
  },
  { scene: 'shift-1', at: 0.5, stage: 'shift', zoom: 1, desktop: { morph: 0.08, opacity: 0.92, energy: 0.75, calm: 0.4 } },
  { scene: 'shift-2', at: 0.5, stage: 'shift', zoom: 1.03, desktop: { morph: 0.3, opacity: 1, energy: 1.1, calm: 0 } },
  { scene: 'shift-3', at: 0.5, stage: 'shift', zoom: 1.05, desktop: { morph: 0.62, energy: 1.35 } },
  {
    scene: 'shift-4',
    at: 0.5,
    stage: 'shift',
    zoom: 1.06,
    desktop: { morph: 0.94, spin: QUARTER_TURN, opacity: 1, energy: 1.5 },
  },
  // How it works: the digitised brain holds its stage beside the chapters,
  // unfolds into neural layers at Decide and reassembles as light at Act.
  { scene: 'how', at: 0.5, stage: 'how', desktop: { morph: 0.98, opacity: 1, energy: 1.3 } },
  { scene: 'listen', at: 0.06, stage: 'how', desktop: { morph: 1.02, energy: 1.4 } },
  { scene: 'decide', at: 0.06, stage: 'how', desktop: { morph: 2, energy: 1.7 } },
  { scene: 'act', at: 0.06, stage: 'how', desktop: { morph: 3, spin: QUARTER_TURN, opacity: 1, energy: 1.5 } },
  // What we build: another quarter turn brings it to the heart of the example
  // panels, and it rides up with them as it dims. On desktop it holds the
  // right side while the intro reads and travels dimmed, as large moving
  // objects should. On phones it leaves upward and rises back in with its stage.
  { scene: 'build', at: 1.6, only: 'mobile', desktop: { y: 1.3, opacity: 0 } },
  { scene: 'build', at: 0.95, only: 'mobile', stage: 'build-mobile', desktop: { opacity: 0 } },
  { scene: 'build', at: 0.5, only: 'mobile', stage: 'build-mobile', desktop: { opacity: 0.6 } },
  { scene: 'build', at: 0.55, only: 'desktop', desktop: { x: 0.5, opacity: 0.12 } },
  { scene: 'build', at: 0.3, only: 'desktop', stage: 'build', desktop: { opacity: 0.4 } },
  {
    scene: 'build',
    at: 0.1,
    stage: { desktop: 'build', mobile: 'build-mobile' },
    desktop: { spin: QUARTER_TURN * 2, opacity: 0.95, energy: 1.3 },
  },
  { scene: 'build', at: -0.25, stage: { desktop: 'build', mobile: 'build-mobile' }, desktop: { opacity: 0.55 } },
  // ...and is gone, out the top and still turning, while the capabilities and process read.
  { scene: 'build-end', at: 0.5, desktop: { y: 1.3, opacity: 0 } },
  // It rises back in with the contact section onto its finale stage, facing
  // you again after one full turn, and leaves with it as the form arrives.
  { scene: 'contact', at: 1.05, stage: 'contact', desktop: { opacity: 0 } },
  {
    scene: 'contact',
    at: 0.12,
    stage: 'contact',
    desktop: { morph: 3, spin: QUARTER_TURN * 4, opacity: 1, energy: 1.2 },
  },
  { scene: 'contact', at: -0.35, stage: 'contact', desktop: { opacity: 0 } },
]

/** A stage's box in viewport pixels at the scroll position `scroll`. */
function measure(el: HTMLElement, scroll: number, view: DOMRect): Box {
  const r = el.getBoundingClientRect()
  // Inside a sticky frame the stage holds still while pinned: use its place in the frame.
  const pin = el.closest<HTMLElement>('[data-pin]')
  const top = pin ? r.top - pin.getBoundingClientRect().top : r.top + window.scrollY - scroll
  return { left: r.left - view.left, top: top - view.top, width: r.width, height: r.height }
}

/**
 * Monotone cubic slopes (Steffen 1990). The curve never overshoots a stop and
 * eases through turning points, and velocity never jumps at a stop. The ends
 * stay flat: the journey starts from rest and settles on the last stop.
 */
function fitSlopes(points: Point[]) {
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1]!
    const b = points[i]!
    const c = points[i + 1]!
    const h0 = b.at - a.at
    const h1 = c.at - b.at
    const d0 = (b.value - a.value) / h0
    const d1 = (c.value - b.value) / h1
    b.slope =
      d0 * d1 > 0
        ? Math.sign(d0) * Math.min(2 * Math.abs(d0), 2 * Math.abs(d1), Math.abs((d0 * h1 + d1 * h0) / (h0 + h1)))
        : 0
  }
}

/** Cubic Hermite between the stops around `x`; with `stepped`, the last stop reached. */
function sample(points: Point[], x: number, stepped: boolean) {
  let a = points[0]!
  if (x <= a.at) return a.value
  for (const b of points) {
    if (x < b.at) {
      if (stepped) return a.value
      const h = b.at - a.at
      const s = (x - a.at) / h
      const s2 = s * s
      const s3 = s2 * s
      return (
        (2 * s3 - 3 * s2 + 1) * a.value +
        (s3 - 2 * s2 + s) * h * a.slope +
        (3 * s2 - 2 * s3) * b.value +
        (s3 - s2) * h * b.slope
      )
    }
    a = b
  }
  return a.value
}

/**
 * Drives `sceneState` from the scroll position. A scrubbed GSAP tween moves a
 * playhead across the page (so the brain trails the scroll with a touch of
 * inertia), and every property is sampled from its curve at that point. The
 * curves and stage boxes are rebuilt on every ScrollTrigger refresh, so layout
 * changes (fonts, resize, images) can never desync the brain from the page.
 */
export function createChoreography({ reducedMotion }: { reducedMotion: boolean }) {
  const playhead = { progress: 0 }
  let tracks: Track[] = []
  let length = 1

  const render = () => {
    const x = playhead.progress * length
    for (const { prop, points } of tracks) sceneState[prop] = sample(points, x, reducedMotion)
  }

  const build = () => {
    const view =
      document.querySelector('[data-brain-viewport]')?.getBoundingClientRect() ??
      new DOMRect(0, 0, window.innerWidth, window.innerHeight)
    const vh = window.innerHeight
    const max = Math.max(1, ScrollTrigger.maxScroll(window))
    const mobile = window.innerWidth < 1024
    const byProp = new Map<Prop, Point[]>()
    let previous = -1

    for (const stop of STOPS) {
      if (stop.only && stop.only !== (mobile ? 'mobile' : 'desktop')) continue
      const el = document.querySelector<HTMLElement>(`[data-scene="${stop.scene}"]`)
      if (!el) continue
      const top = el.getBoundingClientRect().top + window.scrollY
      // Stops stay in page order, at least a pixel apart.
      const at = Math.max(previous + 1, Math.min(max, Math.max(0, top - vh * (stop.at ?? 0.45))))
      previous = at
      const state: Key = mobile ? { ...stop.desktop, ...stop.mobile } : { ...stop.desktop }

      const name = typeof stop.stage === 'string' ? stop.stage : stop.stage?.[mobile ? 'mobile' : 'desktop']
      const stage = name ? document.querySelector<HTMLElement>(`[data-stage="${name}"]`) : null
      if (stage && stage.getBoundingClientRect().width > 0) {
        const fit = fitBox(measure(stage, at, view), view.width, view.height)
        Object.assign(state, { x: fit.x, y: fit.y, scale: fit.scale * (stop.zoom ?? 1) })
      }

      for (const [prop, value] of Object.entries(state) as [Prop, number][]) {
        const points = byProp.get(prop) ?? []
        points.push({ at, value, slope: 0 })
        byProp.set(prop, points)
      }
    }

    tracks = [...byProp].map(([prop, points]) => {
      fitSlopes(points)
      return { prop, points }
    })
    length = max
    render()
  }

  const tween = gsap.to(playhead, { progress: 1, ease: 'none', paused: true, onUpdate: render })
  build()
  // Start where the page is, so a reload mid-page does not replay the journey.
  tween.progress(Math.min(1, window.scrollY / length))

  const trigger = ScrollTrigger.create({
    animation: tween,
    start: 0,
    end: 'max',
    // Enough weight to feel cinematic, tight enough to stay on its stage.
    scrub: reducedMotion ? true : 0.5,
    onRefresh: build,
  })

  return () => {
    trigger.kill()
    tween.kill()
  }
}
