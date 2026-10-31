import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState, type SceneState } from './sceneStore'

type Prop = keyof SceneState
type Key = Partial<SceneState>

type Stop = {
  /** Matches a `data-scene` attribute in the page. */
  scene: string
  desktop: Key
  /** Overrides for screens under 1024px wide. */
  mobile?: Key
  /** Where the anchor's top sits (fraction of viewport) when the state is reached. */
  at?: number
}

/** One keyframe of one property; `at` is in scroll pixels. */
type Point = { at: number; value: number; slope: number }
type Track = { prop: Prop; points: Point[] }

const QUARTER_TURN = Math.PI / 2

/**
 * The brain's whole journey, as one continuous shot. Every property flows
 * through the stops that name it and skips the rest, so the brain never parks
 * between sections. The morph only moves forward: organic through the problem,
 * digitised while the Shift's beats land, neural layers at Decide, light at Act.
 * The spin makes one full turn over the page and rests on multiples of 90
 * degrees where you read, so the cubes sit in true isometric alignment there.
 */
// Chapter anchors (listen, decide, act) use `at: 0.06`: the state is reached
// when that chapter's copy sits in the middle of the screen. The Shift anchors
// sit where each beat is held (see Shift.tsx).
const STOPS: Stop[] = [
  {
    scene: 'hero',
    desktop: { morph: 0, x: 0.45, y: 0.02, scale: 1, spin: 0, opacity: 1, energy: 1, calm: 0 },
    mobile: { x: 0, y: 0.34, scale: 0.9 },
  },
  // The problem: the brain steps back, dims and congests, and keeps receding
  // while the problem is read.
  {
    scene: 'problem',
    at: 0.5,
    desktop: { morph: 0, x: 0.6, y: 0.06, scale: 0.78, spin: 0, opacity: 0.42, energy: 0.35, calm: 1 },
    mobile: { x: 0, y: 0.12, opacity: 0.25 },
  },
  {
    scene: 'shift',
    at: 0.65,
    desktop: { morph: 0, x: 0.62, y: 0.06, scale: 0.74, spin: 0, opacity: 0.36, energy: 0.3, calm: 1 },
    mobile: { x: 0, y: 0.14, opacity: 0.22 },
  },
  // The Shift wakes it as the section pins: the camera pushes in and a quarter
  // turn follows the wireframe scan across the brain, one hemisphere first.
  {
    scene: 'shift',
    at: 0,
    desktop: { morph: 0.02, x: 0.42, y: 0, scale: 1.04, spin: 0, opacity: 0.85, energy: 0.6, calm: 0.6 },
    mobile: { x: 0, y: 0.22, scale: 1 },
  },
  {
    scene: 'shift-1',
    at: 0.5,
    desktop: { morph: 0.08, x: 0.4, scale: 1.1, opacity: 0.92, energy: 0.75, calm: 0.4 },
    mobile: { x: 0, scale: 1.04 },
  },
  {
    scene: 'shift-2',
    at: 0.5,
    desktop: { morph: 0.3, scale: 1.17, opacity: 1, energy: 1.1, calm: 0 },
    mobile: { scale: 1.09 },
  },
  { scene: 'shift-3', at: 0.5, desktop: { morph: 0.62, scale: 1.23, energy: 1.35 }, mobile: { scale: 1.1 } },
  {
    scene: 'shift-4',
    at: 0.5,
    desktop: { morph: 0.94, x: 0.38, scale: 1.28, spin: QUARTER_TURN, opacity: 1, energy: 1.5 },
    mobile: { x: 0, y: 0.22, scale: 1.12 },
  },
  // How it works: the digitised brain steps aside for the chapters, unfolds
  // into neural layers at Decide and reassembles as light at Act.
  {
    scene: 'how',
    at: 0.5,
    desktop: { morph: 0.98, x: 0.45, y: 0, scale: 1, opacity: 1, energy: 1.3 },
    mobile: { x: 0, y: 0.3, scale: 0.86, opacity: 0.4 },
  },
  { scene: 'listen', at: 0.06, desktop: { morph: 1.02, energy: 1.4 } },
  { scene: 'decide', at: 0.06, desktop: { morph: 2, energy: 1.7 } },
  {
    scene: 'act',
    at: 0.06,
    desktop: { morph: 3, x: 0.45, y: 0, scale: 1, spin: QUARTER_TURN, opacity: 1, energy: 1.5 },
    mobile: { x: 0, y: 0.3, scale: 0.86, opacity: 0.4 },
  },
  // What we build: another quarter turn brings it to centre stage just as the
  // example panels around it fill the screen.
  {
    scene: 'build',
    at: 0.06,
    desktop: { x: 0, y: -0.02, scale: 1.06, spin: QUARTER_TURN * 2, opacity: 0.95, energy: 1.3 },
    mobile: { y: 0.04, scale: 0.88, opacity: 0.42 },
  },
  // Still turning, it steps aside for the capabilities and fades while the
  // process imagery and the FAQ have the stage...
  {
    scene: 'build-end',
    at: 0.5,
    desktop: { x: 0.58, y: 0.08, scale: 0.78, opacity: 0.28 },
    mobile: { x: 0, opacity: 0.12 },
  },
  { scene: 'process', at: 0.65, desktop: { opacity: 0 } },
  // ...and rises back in with the contact section, below the last questions,
  // settling behind the form and facing you again after one full turn.
  { scene: 'contact', at: 0.95, desktop: { y: -1, opacity: 0 }, mobile: { y: -1.05 } },
  {
    scene: 'contact',
    at: 0.45,
    desktop: { morph: 3, x: 0.3, y: 0, scale: 0.9, spin: QUARTER_TURN * 4, opacity: 0.85, energy: 1.2 },
    mobile: { x: 0, y: -0.05, scale: 0.78, opacity: 0.3 },
  },
  { scene: 'footer', at: 1, desktop: { opacity: 0.85 }, mobile: { opacity: 0.3 } },
  { scene: 'footer', at: 0.6, desktop: { opacity: 0 } },
]

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
 * playhead across the page (so the brain trails the scroll with a little
 * inertia), and every property is sampled from its curve at that point. The
 * curves are rebuilt on every ScrollTrigger refresh, so layout changes (fonts,
 * resize, images) can never desync the brain from the copy.
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
    const vh = window.innerHeight
    const max = Math.max(1, ScrollTrigger.maxScroll(window))
    const mobile = window.innerWidth < 1024
    const byProp = new Map<Prop, Point[]>()
    let previous = -1

    for (const stop of STOPS) {
      const el = document.querySelector<HTMLElement>(`[data-scene="${stop.scene}"]`)
      if (!el) continue
      const top = el.getBoundingClientRect().top + window.scrollY
      // Stops stay in page order, at least a pixel apart.
      const at = Math.max(previous + 1, Math.min(max, Math.max(0, top - vh * (stop.at ?? 0.45))))
      previous = at
      const state = mobile ? { ...stop.desktop, ...stop.mobile } : stop.desktop
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
    scrub: reducedMotion ? true : 0.9,
    onRefresh: build,
  })

  return () => {
    trigger.kill()
    tween.kill()
  }
}
