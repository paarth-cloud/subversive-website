export type QualityTier = 'high' | 'medium' | 'low'

type NavigatorExtras = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

const media = (query: string) => typeof window !== 'undefined' && window.matchMedia(query).matches

export const prefersReducedMotion = () => media('(prefers-reduced-motion: reduce)')
export const isFinePointer = () => media('(hover: hover) and (pointer: fine)')

export function prefersReducedData(): boolean {
  if (media('(prefers-reduced-data: reduce)')) return true
  const nav = navigator as NavigatorExtras
  return Boolean(nav.connection?.saveData) || nav.connection?.effectiveType === '2g'
}

type GLProbe = { supported: boolean; software: boolean }

/** Checks for WebGL2 and whether the GPU is a software rasteriser. */
export function probeWebGL(): GLProbe {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    if (!gl) return { supported: false, software: false }
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return { supported: true, software: /swiftshader|llvmpipe|software|basic render/i.test(renderer) }
  } catch {
    return { supported: false, software: false }
  }
}

/** Picks particle counts and pixel ratio caps for the WebGL scene. */
export function getQualityTier(software = false): QualityTier {
  if (software || prefersReducedData()) return 'low'
  const nav = navigator as NavigatorExtras
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const touch = media('(pointer: coarse)')
  const small = window.innerWidth < 768
  if (touch || small) return cores >= 6 && memory >= 4 ? 'medium' : 'low'
  if (cores >= 8 && memory >= 8) return 'high'
  return 'medium'
}
