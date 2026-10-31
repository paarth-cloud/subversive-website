// Turns the raw Higgsfield (Tripo) brain GLB into a small, web-ready asset.
//
//   node scripts/optimize-brain.mjs [input] [output] [targetTriangles]
//
// Steps: drop UVs and materials we never use, weld, simplify with meshoptimizer,
// centre and normalise so the longest side is 2 units, then quantize and
// Meshopt-compress. Three.js decodes it with MeshoptDecoder.
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions'
import {
  center,
  dedup,
  flatten,
  getBounds,
  join,
  meshopt,
  prune,
  quantize,
  simplify,
  weld,
} from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer'

const input = process.argv[2] ?? 'raw-assets/brain-tripo.glb'
const output = process.argv[3] ?? 'public/models/brain.glb'
const targetTriangles = Number(process.argv[4] ?? 20000)

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready])

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder })

const doc = await io.read(input)
const root = doc.getRoot()

const countTriangles = () =>
  root
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0)

// The scene only needs geometry: strip UVs, colours and materials.
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    for (const semantic of prim.listSemantics()) {
      if (semantic !== 'POSITION' && semantic !== 'NORMAL') prim.setAttribute(semantic, null)
    }
    prim.setMaterial(null)
  }
}
for (const material of root.listMaterials()) material.dispose()

const before = countTriangles()
await doc.transform(flatten(), join(), weld(), dedup())

// The simplifier keeps the source's smooth normals. (gltf-transform's normals()
// would unweld into flat normals, tripling the vertex count.)
const ratio = Math.min(1, targetTriangles / countTriangles())
await doc.transform(
  simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.002, lockBorder: false }),
  weld(),
  center({ pivot: 'center' }),
)

// Normalise: longest dimension becomes 2 units (so the brain fits a radius of ~1).
const scene = root.getDefaultScene() ?? root.listScenes()[0]
const { min, max } = getBounds(scene)
const longest = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2])
const s = 2 / longest
for (const node of root.listNodes()) {
  if (!node.getMesh()) continue
  const [x, y, z] = node.getScale()
  node.setScale([x * s, y * s, z * s])
}

await doc.transform(
  prune(),
  quantize({ quantizePosition: 14, quantizeNormal: 10 }),
  meshopt({ encoder: MeshoptEncoder, level: 'high' }),
)
doc.createExtension(EXTMeshoptCompression).setRequired(true)

await io.write(output, doc)
const after = countTriangles()
const b = getBounds(scene)
console.log(`triangles: ${before} -> ${after}`)
console.log(`bounds: min ${b.min.map((v) => v.toFixed(3))} max ${b.max.map((v) => v.toFixed(3))}`)
console.log(`written: ${output}`)
