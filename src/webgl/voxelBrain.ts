import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { mulberry32, valueNoise3 } from './noise'

/**
 * Everything the GPU needs to animate the isometric brain, one entry per voxel.
 * Stage targets: brain (organic and digitised), layer (stacked neural layers),
 * final (a brain of light with orbital rings and a core).
 */
export type VoxelBrain = {
  count: number
  cell: number
  brain: Float32Array
  layer: Float32Array
  final: Float32Array
  from: Float32Array
  explode: Float32Array
  /** x: sweep delay (front to back), y: random, z: palette pick, w: spark phase. */
  seed: Float32Array
  /** x: ring id (0 none, 1, 2), y: angle, z: radius, w: role (0 brain, 1 ring, 2 core). */
  ring: Float32Array
  /** 1 for surface voxels, lower for fold floors so the channels read as depth. */
  shade: Float32Array
  links: { positions: Float32Array; t: Float32Array; phase: Float32Array }
  usedMesh: boolean
}

type Cell = { ix: number; iy: number; iz: number; nx: number; ny: number; nz: number; floor?: boolean }

/**
 * The mesh is turned 45 degrees before voxelising, so under the isometric
 * camera both hemispheres face the viewer with the gap running vertically,
 * while the cubes themselves stay aligned to the grid (true isometric).
 * The midline (x = 0 in mesh space) becomes the plane x = z.
 */
const FACE_VIEWER = new THREE.Matrix4().makeRotationY(Math.PI / 4)
/** Three diagonals of cells: a clean, readable gap between the hemispheres. */
const onMidline = (c: { ix: number; iz: number }) => Math.abs(c.ix - c.iz) <= 1

const OFFSET = 512
const keyOf = (ix: number, iy: number, iz: number) => ((ix + OFFSET) * 1024 + (iy + OFFSET)) * 1024 + (iz + OFFSET)

const LAYER_HEIGHTS = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]
export const RING_RADII = [1.22, 1.42] as const

/** Copies quantized glTF attributes into plain floats so transforms do not clamp. */
function toFloat32(source: THREE.BufferGeometry) {
  const geometry = new THREE.BufferGeometry()
  for (const name of ['position', 'normal'] as const) {
    const attr = source.getAttribute(name)
    if (!attr) continue
    const array = new Float32Array(attr.count * 3)
    for (let i = 0; i < attr.count; i++) {
      array[i * 3] = attr.getX(i)
      array[i * 3 + 1] = attr.getY(i)
      array[i * 3 + 2] = attr.getZ(i)
    }
    geometry.setAttribute(name, new THREE.BufferAttribute(array, 3))
  }
  if (source.index) geometry.setIndex(source.index.clone())
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
  return geometry
}

async function loadBrainMesh(url: string, timeoutMs: number) {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await Promise.race([
    loader.loadAsync(url),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('brain.glb timed out')), timeoutMs)),
  ])
  gltf.scene.updateMatrixWorld(true)
  let source: THREE.Mesh | undefined
  gltf.scene.traverse((child) => {
    if (!source && (child as THREE.Mesh).isMesh) source = child as THREE.Mesh
  })
  if (!source) throw new Error('brain.glb has no mesh')
  const geometry = toFloat32(source.geometry)
  geometry.applyMatrix4(source.matrixWorld)
  geometry.applyMatrix4(FACE_VIEWER)
  return new THREE.Mesh(geometry)
}

/** Snaps thousands of surface samples onto an axis-aligned grid. */
// setRandomGenerator exists in three's sampler but is missing from @types/three.
type SeededSampler = MeshSurfaceSampler & { setRandomGenerator: (random: () => number) => void }

function voxelizeSurface(mesh: THREE.Mesh, cell: number, samples: number, random: () => number) {
  const sampler = new MeshSurfaceSampler(mesh) as SeededSampler
  sampler.setRandomGenerator(random)
  sampler.build()
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const cells = new Map<number, Cell>()
  for (let i = 0; i < samples; i++) {
    sampler.sample(p, n)
    const ix = Math.round(p.x / cell)
    const iy = Math.round(p.y / cell)
    const iz = Math.round(p.z / cell)
    const k = keyOf(ix, iy, iz)
    const c = cells.get(k)
    if (c) {
      c.nx += n.x
      c.ny += n.y
      c.nz += n.z
    } else cells.set(k, { ix, iy, iz, nx: n.x, ny: n.y, nz: n.z })
  }
  mesh.geometry.dispose()
  return cells
}

/** Fallback when the mesh cannot load: an ellipsoid shell with a flattened base. */
function voxelizeEllipsoid(cell: number) {
  const [a, b, c] = [0.8, 0.9, 1.0]
  const cells = new Map<number, Cell>()
  const range = (r: number) => Math.ceil(r / cell) + 1
  for (let ix = -range(a); ix <= range(a); ix++)
    for (let iy = -range(b); iy <= range(b); iy++)
      for (let iz = -range(c); iz <= range(c); iz++) {
        const [x, y, z] = [ix * cell, iy * cell, iz * cell]
        if (y < -0.62) continue
        // Evaluate the ellipsoid in mesh space (undo the 45 degree turn).
        const mx = (x - z) * Math.SQRT1_2
        const mz = (x + z) * Math.SQRT1_2
        const d = (Math.hypot(mx / a, y / b, mz / c) - 1) * Math.min(a, b, c)
        if (Math.abs(d) > cell * 0.5) continue
        cells.set(keyOf(ix, iy, iz), { ix, iy, iz, nx: x, ny: y / (b * b), nz: z })
      }
  return cells
}

/**
 * Stylises the shell: a clean gap between the hemispheres, and winding fold
 * channels traced along noise contour lines. A carved voxel leaves a channel
 * floor one step inward so the folds read as depth, not holes.
 */
function carve(cells: Map<number, Cell>, cell: number) {
  const out = new Map<number, Cell>()
  for (const c of cells.values()) {
    if (onMidline(c)) continue
    const [x, y, z] = [c.ix * cell, c.iy * cell, c.iz * cell]
    const n = valueNoise3(x * 1.9 + 7.1, y * 1.9 + 1.7, z * 1.9 + 3.3)
    const isFold = Math.abs(n - 0.5) < 0.085 && y > -0.6
    if (!isFold) {
      out.set(keyOf(c.ix, c.iy, c.iz), c)
      continue
    }
    const len = Math.hypot(c.nx, c.ny, c.nz) || 1
    const ix = Math.round(c.ix - c.nx / len)
    const iy = Math.round(c.iy - c.ny / len)
    const iz = Math.round(c.iz - c.nz / len)
    const k = keyOf(ix, iy, iz)
    if (!onMidline({ ix, iz }) && !cells.has(k)) out.set(k, { ix, iy, iz, nx: c.nx, ny: c.ny, nz: c.nz, floor: true })
  }
  return [...out.values()]
}

/** Stacked square layers, like chips in an isometric diagram, with noise-shaped gaps. */
function layerSlots(count: number, cell: number, random: () => number) {
  const step = cell * 1.2
  const perLayer = Math.ceil(count / LAYER_HEIGHTS.length / 0.9)
  const side = Math.ceil(Math.sqrt(perLayer))
  const slots: { x: number; y: number; z: number; layer: number; score: number }[] = []
  LAYER_HEIGHTS.forEach((y, layer) => {
    for (let i = 0; i < side; i++)
      for (let j = 0; j < side; j++) {
        const x = (i - (side - 1) / 2) * step
        const z = (j - (side - 1) / 2) * step
        const score = valueNoise3(x * 2.6 + layer * 3.1, layer * 1.9, z * 2.6) + random() * 0.2
        slots.push({ x, y, z, layer, score })
      }
  })
  slots.sort((p, q) => q.score - p.score)
  return slots.slice(0, count)
}

export async function createVoxelBrain(url: string, cell: number, samples: number): Promise<VoxelBrain> {
  const random = mulberry32(20261031)
  let shell: Map<number, Cell>
  let usedMesh = true
  try {
    shell = voxelizeSurface(await loadBrainMesh(url, 9000), cell, samples, random)
  } catch (error) {
    console.warn('[brain] using procedural fallback:', error)
    shell = voxelizeEllipsoid(cell)
    usedMesh = false
  }

  const voxels = carve(shell, cell)
  const count = voxels.length
  if (import.meta.env.DEV) console.debug(`[brain] ${count} voxels at cell ${cell}`)

  const brain = new Float32Array(count * 3)
  const explode = new Float32Array(count * 3)
  const from = new Float32Array(count * 3)
  const seed = new Float32Array(count * 4)
  const shade = new Float32Array(count)
  // Sweep coordinate: screen left to right under the isometric camera (x - z),
  // so the transformation crosses one hemisphere, then the other.
  const sweep = (i: number) => brain[i * 3]! - brain[i * 3 + 2]!
  voxels.forEach((v, i) => {
    brain[i * 3] = v.ix * cell
    brain[i * 3 + 1] = v.iy * cell
    brain[i * 3 + 2] = v.iz * cell
    shade[i] = v.floor ? 0.34 : 1
    // Explode along the dominant axis of the surface normal: an isometric exploded view.
    const ax = Math.abs(v.nx)
    const ay = Math.abs(v.ny)
    const az = Math.abs(v.nz)
    if (ax >= ay && ax >= az) explode[i * 3] = Math.sign(v.nx) || 1
    else if (ay >= az) explode[i * 3 + 1] = Math.sign(v.ny) || 1
    else explode[i * 3 + 2] = Math.sign(v.nz) || 1
    from[i * 3] = brain[i * 3]!
    from[i * 3 + 1] = brain[i * 3 + 1]! + 2.4 + random() * 1.4
    from[i * 3 + 2] = brain[i * 3 + 2]!
  })
  let sMin = Infinity
  let sMax = -Infinity
  for (let i = 0; i < count; i++) {
    sMin = Math.min(sMin, sweep(i))
    sMax = Math.max(sMax, sweep(i))
  }
  voxels.forEach((_, i) => {
    seed[i * 4] = ((sweep(i) - sMin) / (sMax - sMin || 1)) * 0.85 + random() * 0.15
    seed[i * 4 + 1] = random()
    seed[i * 4 + 2] = random()
    seed[i * 4 + 3] = random()
  })

  // Layer targets: brain slabs map to layers by height, then by angle, so the
  // brain unfolds in an orderly way instead of scrambling.
  const slots = layerSlots(count, cell, random)
  const byHeight = [...voxels.keys()].sort((p, q) => brain[p * 3 + 1]! - brain[q * 3 + 1]!)
  const layer = new Float32Array(count * 3)
  const angleOf = (x: number, z: number) => Math.atan2(z, x)
  let cursor = 0
  LAYER_HEIGHTS.forEach((_, layerIndex) => {
    const layerSlotsSorted = slots
      .filter((s) => s.layer === layerIndex)
      .sort((p, q) => angleOf(p.x, p.z) - angleOf(q.x, q.z))
    const chunk = byHeight
      .slice(cursor, cursor + layerSlotsSorted.length)
      .sort((p, q) => angleOf(brain[p * 3]!, brain[p * 3 + 2]!) - angleOf(brain[q * 3]!, brain[q * 3 + 2]!))
    cursor += layerSlotsSorted.length
    chunk.forEach((voxelIndex, k) => {
      const s = layerSlotsSorted[k]!
      layer[voxelIndex * 3] = s.x
      layer[voxelIndex * 3 + 1] = s.y
      layer[voxelIndex * 3 + 2] = s.z
    })
  })

  // Final targets: most voxels return as a brain of light; some become orbital
  // rings and a dense core.
  const final = new Float32Array(brain)
  const ring = new Float32Array(count * 4)
  const order = [...voxels.keys()].sort(() => random() - 0.5)
  const ringCounts = [Math.round(count * 0.075), Math.round(count * 0.065)]
  const coreCount = Math.round(count * 0.05)
  let o = 0
  ringCounts.forEach((n, r) => {
    for (let k = 0; k < n; k++, o++) {
      const i = order[o]!
      ring[i * 4] = r + 1
      ring[i * 4 + 1] = (k / n) * Math.PI * 2 + random() * 0.04
      ring[i * 4 + 2] = RING_RADII[r]! + (random() - 0.5) * cell * 0.6
      ring[i * 4 + 3] = 1
    }
  })
  for (let k = 0; k < coreCount; k++, o++) {
    const i = order[o]!
    const r = 0.26 * Math.cbrt(random())
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    final[i * 3] = Math.round((r * Math.sin(phi) * Math.cos(theta)) / cell) * cell
    final[i * 3 + 1] = Math.round((r * Math.cos(phi)) / cell) * cell
    final[i * 3 + 2] = Math.round((r * Math.sin(phi) * Math.sin(theta)) / cell) * cell
    ring[i * 4 + 3] = 2
  }

  // Links between adjacent layers carry the "forward pass" pulses.
  const linkPositions: number[] = []
  const linkT: number[] = []
  const linkPhase: number[] = []
  const slotsByLayer = LAYER_HEIGHTS.map((_, l) => slots.filter((s) => s.layer === l))
  for (let l = 0; l < LAYER_HEIGHTS.length - 1; l++) {
    const lower = slotsByLayer[l]!
    const upper = slotsByLayer[l + 1]!
    for (let k = 0; k < 30 && lower.length && upper.length; k++) {
      const a = lower[Math.floor(random() * lower.length)]!
      const b = upper[Math.floor(random() * upper.length)]!
      const phase = random()
      linkPositions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      linkT.push(0, 1)
      linkPhase.push(phase, phase)
    }
  }

  return {
    count,
    cell,
    brain,
    layer,
    final,
    from,
    explode,
    seed,
    ring,
    shade,
    links: {
      positions: new Float32Array(linkPositions),
      t: new Float32Array(linkT),
      phase: new Float32Array(linkPhase),
    },
    usedMesh,
  }
}
