// Prints mesh stats for a GLB: primitives, vertices, triangles, bounds, materials.
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { getBounds } from '@gltf-transform/functions'
import { MeshoptDecoder } from 'meshoptimizer'

const file = process.argv[2]
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
await MeshoptDecoder.ready
const doc = await io.read(file)
const root = doc.getRoot()
let verts = 0, tris = 0
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION'); const idx = prim.getIndices()
  verts += pos.getCount(); tris += (idx ? idx.getCount() : pos.getCount()) / 3
  console.log('primitive attrs:', prim.listSemantics().join(','), 'mode', prim.getMode())
}
const scene = root.getDefaultScene() ?? root.listScenes()[0]
console.log({ meshes: root.listMeshes().length, nodes: root.listNodes().length, materials: root.listMaterials().length, textures: root.listTextures().length, verts, tris: Math.round(tris) })
console.log('bounds', JSON.stringify(getBounds(scene)))
console.log('extensions', root.listExtensionsUsed().map(e => e.extensionName).join(','))
