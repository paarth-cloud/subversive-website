/**
 * Higgsfield-generated keyframes and crops, exported by scripts/optimize-media.mjs.
 * `w` and `h` are the source dimensions, used for aspect ratio (no layout shift).
 */
export const media = {
  'stage-1': { widths: [960, 1600, 2400, 3200], w: 3840, h: 2160 },
  'stage-2': { widths: [960, 1600, 2400, 3200], w: 3840, h: 2160 },
  'stage-3': { widths: [960, 1600, 2400, 3200], w: 3840, h: 2160 },
  'stage-4': { widths: [960, 1600, 2400, 3200], w: 3840, h: 2160 },
  'hero-square': { widths: [720, 1200], w: 1955, h: 1955 },
  'detail-sense': { widths: [900, 1400], w: 2720, h: 1607 },
  'detail-solve': { widths: [900, 1400], w: 1856, h: 1524 },
  'detail-scale': { widths: [900, 1400], w: 2592, h: 2022 },
  'detail-sustain': { widths: [900, 1400], w: 1440, h: 829 },
} as const

/** Scroll-scrubbed transformation clip (scripts/encode-scrub-video.mjs). */
export const shiftVideo = {
  large: '/media/shift-1080.mp4',
  small: '/media/shift-720.mp4',
  /** Viewports at least this wide get the 1080p version. */
  largeFrom: 900,
} as const

export type MediaName = keyof typeof media

export const srcSet = (name: MediaName, format: 'avif' | 'webp') =>
  media[name].widths.map((w) => `/media/${name}-${w}.${format} ${w}w`).join(', ')
