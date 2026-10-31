// Registers every keyframe to stage 1 so the Shift sequence never jumps.
//
//   node scripts/align-keyframes.mjs [prefix]
//
// Image models drift the framing between edits. This finds the main brain mass
// in each frame (heavily blurred and thresholded, so thin streams and rings
// drop out; blobs merged so both hemispheres count), then translates and
// scales stages 2 to 4 so their brain boxes match stage 1.
//
// Reads raw-assets/<prefix>-stage{1..4}.png (default prefix "hq") and writes
// raw-assets/aligned-stage{1..4}.png plus raw-assets/aligned.json, which records
// the frame size and the reference brain box for scripts/optimize-media.mjs.
import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const prefix = process.argv[2] ?? 'hq'
const FILES = [1, 2, 3, 4].map((n) => `raw-assets/${prefix}-stage${n}.png`)
const PROBE_WIDTH = 336
// Stage 3's exploded wireframe widens its box on the left only, so it aligns
// by its solid right edge; the others align by their centre.
const ANCHOR = ['center', 'center', 'right', 'center']

async function brainBox(file) {
  const { width: fullWidth } = await sharp(file).metadata()
  const { data, info } = await sharp(file)
    .resize({ width: PROBE_WIDTH })
    .greyscale()
    .blur(6)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height } = info
  let max = 0
  for (const v of data) max = Math.max(max, v)
  const on = (i) => data[i] > max * 0.36
  const seen = new Uint8Array(width * height)
  const blobs = []
  for (let start = 0; start < width * height; start++) {
    if (seen[start] || !on(start)) continue
    const stack = [start]
    seen[start] = 1
    let size = 0
    let x0 = width, y0 = height, x1 = 0, y1 = 0
    while (stack.length) {
      const i = stack.pop()
      const x = i % width
      const y = (i - x) / width
      size++
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y)
      for (const j of [i - 1, i + 1, i - width, i + width]) {
        if (j < 0 || j >= width * height || seen[j] || !on(j)) continue
        if (Math.abs((j % width) - x) > 1) continue
        seen[j] = 1
        stack.push(j)
      }
    }
    blobs.push({ size, x0, y0, x1, y1 })
  }
  const largest = Math.max(...blobs.map((b) => b.size))
  const kept = blobs.filter((b) => b.size >= largest * 0.2)
  const k = fullWidth / width
  return {
    x0: Math.min(...kept.map((b) => b.x0)) * k,
    y0: Math.min(...kept.map((b) => b.y0)) * k,
    x1: Math.max(...kept.map((b) => b.x1)) * k,
    y1: Math.max(...kept.map((b) => b.y1)) * k,
  }
}

const { width: W, height: H } = await sharp(FILES[0]).metadata()
const boxes = await Promise.all(FILES.map(brainBox))
const ref = boxes[0]
const refH = ref.y1 - ref.y0
const refCx = (ref.x0 + ref.x1) / 2
const refCy = (ref.y0 + ref.y1) / 2

for (let i = 0; i < FILES.length; i++) {
  const box = boxes[i]
  const { width: srcW, height: srcH } = await sharp(FILES[i]).metadata()
  // Normalise every frame to the reference size first, then fit the brain box.
  const fit = W / srcW
  const s = (refH / ((box.y1 - box.y0) * fit)) * fit
  const cx = (box.x0 + box.x1) / 2
  const cy = (box.y0 + box.y1) / 2
  const scaledW = Math.round(srcW * s)
  const scaledH = Math.round(srcH * s)
  const left = Math.round(ANCHOR[i] === 'right' ? ref.x1 - box.x1 * s : refCx - cx * s)
  const top = Math.round(refCy - cy * s)
  const scaled = await sharp(FILES[i]).resize(scaledW, scaledH).png().toBuffer()
  const cropLeft = Math.max(0, -left)
  const cropTop = Math.max(0, -top)
  const pieceW = Math.min(scaledW - cropLeft, W - Math.max(0, left))
  const pieceH = Math.min(scaledH - cropTop, H - Math.max(0, top))
  // Pad by repeating the frame's own edge pixels: no flat-colour seams.
  await sharp(scaled)
    .extract({ left: cropLeft, top: cropTop, width: pieceW, height: pieceH })
    .extend({
      left: Math.max(0, left),
      top: Math.max(0, top),
      right: W - Math.max(0, left) - pieceW,
      bottom: H - Math.max(0, top) - pieceH,
      extendWith: 'copy',
    })
    .png()
    .toFile(`raw-assets/aligned-stage${i + 1}.png`)
  console.log(`stage ${i + 1}: scale ${s.toFixed(3)}  offset ${left},${top}`)
}

const manifest = {
  width: W,
  height: H,
  brain: { x0: Math.round(ref.x0), y0: Math.round(ref.y0), x1: Math.round(ref.x1), y1: Math.round(ref.y1) },
}
await writeFile('raw-assets/aligned.json', JSON.stringify(manifest, null, 2))
console.log('reference', JSON.stringify(manifest))
