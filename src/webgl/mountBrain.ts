import type { QualityTier } from '../lib/device'
import { BrainExperience } from './BrainExperience'
import { createChoreography } from './choreography'

type MountOptions = {
  tier: QualityTier
  reducedMotion: boolean
  finePointer: boolean
  onContextLost: () => void
}

/** Entry point of the lazily loaded WebGL chunk (three.js lives behind this import). */
export async function mountBrain(canvas: HTMLCanvasElement, options: MountOptions) {
  const experience = new BrainExperience(canvas, options)
  try {
    await experience.load()
  } catch (error) {
    experience.dispose()
    throw error
  }
  const stopChoreography = createChoreography({ reducedMotion: options.reducedMotion })
  experience.start()
  return () => {
    stopChoreography()
    experience.dispose()
  }
}
