import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { site } from '../content/site'
import { shiftVideo, type MediaName } from '../content/media'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { prefersReducedData } from '../lib/device'
import { cn } from '../lib/cn'
import { useSceneStatus } from '../webgl/sceneStore'
import { Picture } from '../components/ui/Picture'

const STAGES: MediaName[] = ['stage-1', 'stage-2', 'stage-3', 'stage-4']

// The transformation spreads outward from the left hemisphere in every keyframe.
const REVEAL_MASK = 'radial-gradient(circle at 46% 44%, #000 calc(var(--r) - 26%), transparent var(--r))'
const maskStyle = {
  '--r': '-30%',
  WebkitMaskImage: REVEAL_MASK,
  maskImage: REVEAL_MASK,
} as CSSProperties

/** Timeline length in units: four beats, about one unit each. */
const TIMELINE_UNITS = 4
const BEAT_STEP = 1.05
/** Where each beat is fully on screen, in timeline units. */
const beatHeld = (i: number) => i * BEAT_STEP + 0.59
/** Scroll length of the pinned sequence: the section is 420vh, the frame 100vh. */
const PIN_VH = 320
/** The clip plays across this part of the timeline, framed by the first and last beats. */
const VIDEO_FROM = 0.25
const VIDEO_TO = 3.6
const videoProgress = (timelineProgress: number) =>
  Math.min(1, Math.max(0, (timelineProgress * TIMELINE_UNITS - VIDEO_FROM) / (VIDEO_TO - VIDEO_FROM)))

const FRAME_OBJECT_POSITION = 'object-[66%_50%] md:object-[74%_50%]'

/**
 * The belief, felt rather than read. The section pins while the thesis lands
 * one line at a time, and the live WebGL brain behind the page carries the
 * transformation: the camera pushes in and a wireframe scan digitises it, one
 * hemisphere first (see choreography). Without WebGL, the Higgsfield clip of
 * the same transformation is scrubbed here instead, over the four keyframes,
 * which wash over each other and stay the fallback when video is unavailable.
 */
export function Shift() {
  const ref = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const reduced = usePrefersReducedMotion()
  const film = useSceneStatus() === 'fallback'
  const [videoReady, setVideoReady] = useState(false)

  useGSAP(
    () => {
      if (reduced || !ref.current) return
      const q = gsap.utils.selector(ref)
      const beats = q('[data-beat]')
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
      })
      timelineRef.current = tl

      tl.fromTo(q('[data-progress]'), { scaleX: 0 }, { scaleX: 1, duration: TIMELINE_UNITS }, 0)
      if (film) {
        tl.fromTo(q('[data-stack]'), { scale: 1.14 }, { scale: 1, duration: TIMELINE_UNITS }, 0)
        q('[data-stage]')
          .slice(1)
          .forEach((layer, i) => {
            tl.fromTo(layer, { '--r': '-30%' }, { '--r': '150%', duration: 0.95, ease: 'power2.inOut' }, 0.5 + i * BEAT_STEP)
          })
      }
      beats.forEach((beat, i) => {
        const at = i * BEAT_STEP
        tl.fromTo(
          beat,
          { autoAlpha: 0, yPercent: 45, filter: 'blur(12px)' },
          { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.34, ease: 'power3.out' },
          at + 0.04,
        )
        if (i < beats.length - 1) {
          tl.to(beat, { autoAlpha: 0, yPercent: -45, filter: 'blur(12px)', duration: 0.3, ease: 'power3.in' }, at + 0.8)
        }
      })
      tl.set({}, {}, TIMELINE_UNITS)
      return () => {
        timelineRef.current = null
      }
    },
    { scope: ref, dependencies: [reduced, film] },
  )

  // Without WebGL, load the clip about one and a half screens before the section arrives.
  useEffect(() => {
    const section = ref.current
    const video = videoRef.current
    if (reduced || !film || !section || !video || prefersReducedData()) return
    let cancelled = false

    const onLoaded = () => {
      // iOS only decodes frames for seeking after play(); muted inline play is allowed.
      video
        .play()
        .then(() => {
          video.pause()
          if (!cancelled) setVideoReady(true)
        })
        .catch(() => {
          // Blocked (for example Low Power Mode): the keyframes carry the sequence.
        })
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        video.addEventListener('loadeddata', onLoaded, { once: true })
        video.src = window.innerWidth >= shiftVideo.largeFrom ? shiftVideo.large : shiftVideo.small
        video.load()
      },
      { rootMargin: '150% 0px' },
    )
    observer.observe(section)

    return () => {
      cancelled = true
      observer.disconnect()
      video.removeEventListener('loadeddata', onLoaded)
    }
  }, [reduced, film])

  // Follow the scroll: seek toward the smoothed timeline position, one seek at a time.
  useEffect(() => {
    const video = videoRef.current
    if (!videoReady || !video) return
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const tl = timelineRef.current
      if (!tl?.scrollTrigger?.isActive || !video.duration || video.seeking) return
      const target = videoProgress(tl.progress()) * (video.duration - 0.04)
      if (Math.abs(video.currentTime - target) > 0.012) video.currentTime = target
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [videoReady])

  if (reduced) {
    return (
      <section data-scene="shift" aria-label={site.shift.label} className="relative z-[2] py-28 md:py-40">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12">
          <ul className="space-y-5 lg:col-span-5">
            {site.shift.beats.map((beat, i) => (
              <li key={beat} data-scene={`shift-${i + 1}`} className="text-title font-medium">
                {beat}
              </li>
            ))}
          </ul>
          {film && (
            <div className="overflow-hidden rounded-panel lg:col-span-7">
              <Picture name="stage-3" alt={site.shift.label} sizes="(min-width: 1024px) 58vw, 100vw" />
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} data-scene="shift" aria-label={site.shift.label} className="relative z-[2] h-[420vh]">
      <ul className="sr-only">
        {site.shift.beats.map((beat) => (
          <li key={beat}>{beat}</li>
        ))}
      </ul>

      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        {film && (
          <>
            <div data-stack className="absolute inset-0 will-change-transform">
              {/* Keyframes: visible until the clip can seek, then hidden so they stop painting. */}
              <div className={cn('absolute inset-0', videoReady && 'invisible')}>
                {STAGES.map((name, i) => (
                  <div key={name} data-stage className="absolute inset-0" style={i === 0 ? undefined : maskStyle}>
                    <Picture
                      name={name}
                      alt={i === 0 ? site.shift.label : ''}
                      sizes="100vw"
                      className="absolute inset-0"
                      imgClassName={cn('object-cover', FRAME_OBJECT_POSITION)}
                    />
                  </div>
                ))}
              </div>
              <video
                ref={videoRef}
                aria-hidden
                muted
                playsInline
                preload="none"
                disablePictureInPicture
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out-expo',
                  FRAME_OBJECT_POSITION,
                  videoReady ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-void via-void/10 to-void/70" />
            <div aria-hidden className="absolute inset-0 bg-linear-to-r from-void/85 via-void/20 to-transparent" />
          </>
        )}

        <div aria-hidden className="container-page relative flex h-full items-end pb-[16vh] lg:items-center lg:pb-0">
          <div className="relative h-[10.5em] w-full max-w-[13ch] text-display font-medium lg:h-[8em]">
            {site.shift.beats.map((beat, i) => (
              <p
                key={beat}
                data-beat
                className="invisible absolute inset-x-0 bottom-0 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
              >
                {i === site.shift.beats.length - 1 ? (
                  <>
                    {beat.slice(0, -1)}
                    <span className="text-signal">.</span>
                  </>
                ) : (
                  beat
                )}
              </p>
            ))}
          </div>
        </div>

        <div aria-hidden className="container-page absolute inset-x-0 bottom-8">
          <div className="h-px w-full bg-white/10">
            <div data-progress className="h-px w-full origin-left scale-x-0 bg-ink/70" />
          </div>
        </div>
      </div>

      {/* Anchors for the WebGL choreography, which reaches each beat's state as its
          anchor crosses the middle of the screen: exactly while that beat is held. */}
      {site.shift.beats.map((beat, i) => (
        <div
          key={beat}
          data-scene={`shift-${i + 1}`}
          aria-hidden
          className="absolute inset-x-0 h-px"
          style={{ top: `${(beatHeld(i) / TIMELINE_UNITS) * PIN_VH + 50}vh` }}
        />
      ))}
    </section>
  )
}
