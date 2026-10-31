import * as THREE from 'three'
import { gsap } from 'gsap'
import type { QualityTier } from '../lib/device'
import { sceneState } from './sceneStore'
import { createVoxelBrain, type VoxelBrain } from './voxelBrain'
import { linkFragment, linkVertex, voxelEdgeFragment, voxelSolidFragment, voxelVertex } from './shaders'

type Options = { tier: QualityTier; reducedMotion: boolean; finePointer: boolean; onContextLost: () => void }

const TIER: Record<QualityTier, { cell: number; samples: number; dpr: number; antialias: boolean }> = {
  high: { cell: 0.07, samples: 90_000, dpr: 1.75, antialias: true },
  medium: { cell: 0.078, samples: 70_000, dpr: 1.5, antialias: true },
  low: { cell: 0.092, samples: 45_000, dpr: 1.25, antialias: false },
}

/**
 * Glow on a transparent, premultiplied-alpha canvas. Colour adds up; alpha
 * keeps the maximum, and every glow writes alpha equal to its brightness.
 * Writing alpha 1 would paint dim glows as black pixels over the page, and
 * writing alpha 0 gets the light clamped away by the compositor.
 */
const GLOW_BASE = {
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendDst: THREE.OneFactor,
  blendEquationAlpha: THREE.MaxEquation,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneFactor,
} as const
/** For our shaders, which output premultiplied light: vec4(rgb * a, brightness). */
const GLOW_PREMULTIPLIED = { ...GLOW_BASE, blendSrc: THREE.OneFactor } as const
/** For three's sprite shader, which outputs straight colour plus alpha. */
const GLOW_STRAIGHT = { ...GLOW_BASE, blendSrc: THREE.SrcAlphaFactor } as const

/** World units visible above and below the centre of the screen. */
const HALF_HEIGHT = 2.05
/** On-screen footprint of the brain at scale 1, in world units. */
const FOOTPRINT = { width: 2.7, height: 2.6 }

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function glowTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.08)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * The isometric voxel brain. One orthographic camera at the true isometric
 * angle, ~4k instanced cubes, two draw calls for the cubes plus a few for
 * links and glow. GSAP writes `sceneState` on scroll; this class only reads it.
 */
export class BrainExperience {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 80)
  private readonly group = new THREE.Group()
  private readonly uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uIntro: { value: 0 },
    uEnergy: { value: 1 },
    uCalm: { value: 0 },
    uCell: { value: 0.06 },
    uPointer: { value: new THREE.Vector2(9, 9) },
    uPointerAmt: { value: 0 },
    uAspect: { value: 1 },
    uRing1: { value: new THREE.Matrix3() },
    uRing2: { value: new THREE.Matrix3() },
  }
  private readonly linkUniforms = { uTime: { value: 0 }, uLinks: { value: 0 } }
  private readonly disposables: { dispose: () => void }[] = []
  private readonly intro = { value: 0 }
  private readonly pointerTarget = new THREE.Vector2(9, 9)
  private pointerAmtTarget = 0
  private lastPointerMove = 0
  private halo?: THREE.Sprite
  private core?: THREE.Sprite
  private halfW = 1
  private halfH = HALF_HEIGHT
  private baseScale = 1
  private dpr = 1
  private frameTimes: number[] = []
  private lastFrame = 0
  private lastOpacity = -1
  private disposed = false
  private readonly canvas: HTMLCanvasElement
  private readonly options: Options

  constructor(canvas: HTMLCanvasElement, options: Options) {
    this.canvas = canvas
    this.options = options
    const tier = TIER[options.tier]
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier.antialias,
      alpha: true,
      powerPreference: 'high-performance',
    })
    this.renderer.setClearColor(0x000000, 0)
    this.dpr = Math.min(window.devicePixelRatio || 1, tier.dpr)
    this.renderer.setPixelRatio(this.dpr)

    // True isometric: the camera sits on the (1, 1, 1) diagonal.
    this.camera.position.set(20, 20, 20)
    this.camera.lookAt(0, 0, 0)
    this.scene.add(this.group)

    this.uniforms.uRing1.value.setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.16, 0, 0.05)))
    this.uniforms.uRing2.value.setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.35, 0, 1.02)))

    canvas.addEventListener('webglcontextlost', this.onContextLost)
    this.resize()
  }

  async load() {
    const tier = TIER[this.options.tier]
    const data = await createVoxelBrain('/models/brain.glb', tier.cell, tier.samples)
    if (this.disposed) return
    this.uniforms.uCell.value = data.cell
    this.buildVoxels(data)
    this.buildLinks(data)
    this.buildGlow()
  }

  start() {
    window.addEventListener('resize', this.resize)
    if (this.options.finePointer && !this.options.reducedMotion) {
      window.addEventListener('pointermove', this.onPointerMove, { passive: true })
      document.documentElement.addEventListener('pointerleave', this.onPointerLeave)
    }
    gsap.to(this.intro, {
      value: 1,
      duration: this.options.reducedMotion ? 0 : 2.6,
      delay: this.options.reducedMotion ? 0 : 0.15,
      ease: 'power3.out',
    })
    this.renderer.setAnimationLoop(this.frame)
  }

  dispose() {
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    gsap.killTweensOf(this.intro)
    window.removeEventListener('resize', this.resize)
    window.removeEventListener('pointermove', this.onPointerMove)
    document.documentElement.removeEventListener('pointerleave', this.onPointerLeave)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.disposables.forEach((d) => d.dispose())
    this.renderer.dispose()
  }

  private buildVoxels(data: VoxelBrain) {
    const box = new THREE.BoxGeometry(1, 1, 1)
    const geometry = new THREE.InstancedBufferGeometry()
    geometry.index = box.index
    geometry.setAttribute('position', box.getAttribute('position'))
    geometry.setAttribute('normal', box.getAttribute('normal'))
    geometry.setAttribute('uv', box.getAttribute('uv'))
    const instanced = (array: Float32Array, size: number) => new THREE.InstancedBufferAttribute(array, size)
    geometry.setAttribute('aBrain', instanced(data.brain, 3))
    geometry.setAttribute('aLayer', instanced(data.layer, 3))
    geometry.setAttribute('aFinal', instanced(data.final, 3))
    geometry.setAttribute('aFrom', instanced(data.from, 3))
    geometry.setAttribute('aExplode', instanced(data.explode, 3))
    geometry.setAttribute('aSeed', instanced(data.seed, 4))
    geometry.setAttribute('aRing', instanced(data.ring, 4))
    geometry.setAttribute('aShade', instanced(data.shade, 1))
    geometry.instanceCount = data.count
    // Voxels move far from their rest positions on the GPU, so skip culling.
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10)

    const solid = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: voxelVertex,
      fragmentShader: voxelSolidFragment,
    })
    const edges = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: voxelVertex,
      fragmentShader: voxelEdgeFragment,
      transparent: true,
      ...GLOW_PREMULTIPLIED,
      depthWrite: false,
    })

    const solidMesh = new THREE.Mesh(geometry, solid)
    const edgeMesh = new THREE.Mesh(geometry, edges)
    solidMesh.frustumCulled = false
    edgeMesh.frustumCulled = false
    solidMesh.renderOrder = 1
    edgeMesh.renderOrder = 2
    this.group.add(solidMesh, edgeMesh)
    this.disposables.push(box, geometry, solid, edges)
  }

  private buildLinks(data: VoxelBrain) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(data.links.positions, 3))
    geometry.setAttribute('aT', new THREE.BufferAttribute(data.links.t, 1))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(data.links.phase, 1))
    const material = new THREE.ShaderMaterial({
      uniforms: this.linkUniforms,
      vertexShader: linkVertex,
      fragmentShader: linkFragment,
      transparent: true,
      ...GLOW_PREMULTIPLIED,
      depthWrite: false,
    })
    const lines = new THREE.LineSegments(geometry, material)
    lines.frustumCulled = false
    lines.renderOrder = 3
    this.group.add(lines)
    this.disposables.push(geometry, material)
  }

  private buildGlow() {
    const texture = glowTexture()
    // three.js always draws transparent materials after opaque ones. The halo
    // is flagged opaque (it still blends additively) so it lands behind the cubes.
    const make = (renderOrder: number, transparent: boolean) => {
      const material = new THREE.SpriteMaterial({
        map: texture,
        color: 0xffffff,
        ...GLOW_STRAIGHT,
        depthWrite: false,
        depthTest: false,
        transparent,
        opacity: 0,
      })
      const sprite = new THREE.Sprite(material)
      sprite.renderOrder = renderOrder
      this.disposables.push(material)
      return sprite
    }
    this.halo = make(0, false)
    this.core = make(4, true)
    this.group.add(this.halo, this.core)
    this.disposables.push(texture)
  }

  private readonly frame = (now: number) => {
    const dt = this.lastFrame ? (now - this.lastFrame) / 1000 : 1 / 60
    this.lastFrame = now
    const s = sceneState

    const opacity = Math.min(1, Math.max(0, s.opacity))
    if (Math.abs(opacity - this.lastOpacity) > 0.002) {
      this.canvas.style.opacity = opacity.toFixed(3)
      this.lastOpacity = opacity
    }
    if (opacity < 0.005) return
    this.adaptResolution(dt)

    const time = this.options.reducedMotion ? 14 : now / 1000
    const u = this.uniforms
    u.uTime.value = time
    u.uMorph.value = s.morph
    u.uEnergy.value = s.energy
    u.uCalm.value = s.calm
    u.uIntro.value = this.intro.value

    if (now - this.lastPointerMove > 1800) this.pointerAmtTarget = 0
    u.uPointer.value.lerp(this.pointerTarget, 0.12)
    u.uPointerAmt.value += (this.pointerAmtTarget - u.uPointerAmt.value) * 0.06

    this.setViewOffset(s.x, s.y)
    this.group.scale.setScalar(this.baseScale * s.scale)
    const sway = this.options.reducedMotion ? 0 : Math.sin(time * 0.32) * 0.05
    this.group.rotation.set(0, s.spin + sway, 0)

    const m = s.morph
    this.linkUniforms.uTime.value = time
    this.linkUniforms.uLinks.value = smooth(1.55, 2.0, m) * (1 - smooth(2.3, 2.75, m)) * Math.max(0.35, s.energy / 2)

    if (this.halo && this.core) {
      const cool = smooth(0.2, 1.2, m)
      this.halo.material.color.setRGB(1 - cool * 0.65, 0.32 + cool * 0.2, 0.28 + cool * 0.72)
      this.halo.material.opacity = (0.26 + smooth(2.2, 3, m) * 0.12) * (1 - s.calm * 0.6)
      this.halo.scale.setScalar(3.6 + smooth(2.2, 3, m) * 0.8)
      this.core.material.color.setRGB(0.75, 0.88, 1)
      this.core.material.opacity = smooth(2.4, 3, m) * 0.32
      this.core.scale.setScalar(0.95)
    }

    this.renderer.render(this.scene, this.camera)
  }

  /** Shifts the orthographic frustum so the brain sits left, right, up or down. */
  private setViewOffset(x: number, y: number) {
    const ox = x * this.halfW
    const oy = y * this.halfH
    this.camera.left = -this.halfW - ox
    this.camera.right = this.halfW - ox
    this.camera.top = this.halfH - oy
    this.camera.bottom = -this.halfH - oy
    this.camera.updateProjectionMatrix()
  }

  /** Drops the pixel ratio a step at a time if frames run long. */
  private adaptResolution(dt: number) {
    if (dt > 0.1) return
    this.frameTimes.push(dt)
    if (this.frameTimes.length < 90) return
    const average = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    this.frameTimes.length = 0
    if (average > 1 / 42 && this.dpr > 1) {
      this.dpr = Math.max(1, this.dpr - 0.25)
      this.renderer.setPixelRatio(this.dpr)
      this.resize()
    }
  }

  private readonly resize = () => {
    const width = this.canvas.clientWidth || window.innerWidth
    const height = this.canvas.clientHeight || window.innerHeight
    this.renderer.setSize(width, height, false)
    const aspect = width / height
    this.halfH = HALF_HEIGHT
    this.halfW = HALF_HEIGHT * aspect
    this.baseScale = Math.min(1, (this.halfW * 2 * 0.86) / FOOTPRINT.width, (this.halfH * 2 * 0.72) / FOOTPRINT.height)
    this.uniforms.uAspect.value = aspect
  }

  private readonly onPointerMove = (event: PointerEvent) => {
    this.pointerTarget.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    this.pointerAmtTarget = 1
    this.lastPointerMove = performance.now()
  }

  private readonly onPointerLeave = () => {
    this.pointerAmtTarget = 0
  }

  private readonly onContextLost = (event: Event) => {
    event.preventDefault()
    this.renderer.setAnimationLoop(null)
    this.options.onContextLost()
  }
}
