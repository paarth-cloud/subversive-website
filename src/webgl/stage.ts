/**
 * Geometry shared by the scene and the choreography, so the brain can be fitted
 * into any box on the page: the stage each section reserves for it.
 */

/** World units visible above and below the centre of the screen. */
export const HALF_HEIGHT = 2.05
/** On-screen footprint of the brain at scale 1, in world units. */
export const FOOTPRINT = { width: 2.7, height: 2.6 }

/** The brain's scale-1 size for a viewport: as large as fits 86% of its width and 72% of its height. */
export function baseScale(width: number, height: number) {
  const halfW = HALF_HEIGHT * (width / height)
  return Math.min(1, (halfW * 2 * 0.86) / FOOTPRINT.width, (HALF_HEIGHT * 2 * 0.72) / FOOTPRINT.height)
}

export type Box = { left: number; top: number; width: number; height: number }

/** Scene offset and scale that centre the brain in a box of viewport pixels and fit it inside. */
export function fitBox(box: Box, width: number, height: number) {
  const unit = (height / (2 * HALF_HEIGHT)) * baseScale(width, height)
  return {
    x: (box.left + box.width / 2 - width / 2) / (width / 2),
    y: (height / 2 - (box.top + box.height / 2)) / (height / 2),
    scale: Math.min(box.width / (FOOTPRINT.width * unit), box.height / (FOOTPRINT.height * unit)),
  }
}
