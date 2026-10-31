// Exports the Higgsfield keyframes as responsive AVIF and WebP files.
//
//   node scripts/align-keyframes.mjs && node scripts/optimize-media.mjs
//
// Reads raw-assets/aligned-stage{1..4}.png and raw-assets/aligned.json (frame
// size and brain box from the alignment step) and writes public/media/.
// Every crop is defined relative to the brain box, so re-rendered keyframes at
// any resolution export correctly. Prints the source size of each output for
// src/content/media.ts.
import { mkdir, readFile } from 'node:fs/promises'
import sharp from 'sharp'

const SRC = 'raw-assets'
const OUT = 'public/media'
await mkdir(OUT, { recursive: true })

const { width: W, height: H, brain } = JSON.parse(await readFile(`${SRC}/aligned.json`, 'utf8'))
const bw = brain.x1 - brain.x0
const bh = brain.y1 - brain.y0
const cx = (brain.x0 + brain.x1) / 2
const cy = (brain.y0 + brain.y1) / 2

const AVIF = { quality: 52, effort: 6, chromaSubsampling: '4:2:0' }
const WEBP = { quality: 76, effort: 6, smartSubsample: true }

/** A crop centred on (x, y) in brain units, clamped to the frame. */
function region(x, y, width, height) {
  const w = Math.min(W, Math.round(width))
  const h = Math.min(H, Math.round(height))
  const left = Math.max(0, Math.min(W - w, Math.round(x - w / 2)))
  const top = Math.max(0, Math.min(H - h, Math.round(y - h / 2)))
  return { left, top, width: w, height: h }
}

const stage = (n) => `${SRC}/aligned-stage${n}.png`
const sizes = {}

async function exportImage(input, name, widths, crop) {
  for (const width of widths) {
    let pipeline = sharp(input)
    if (crop) pipeline = pipeline.extract(crop)
    pipeline = pipeline.resize({ width, withoutEnlargement: true })
    await pipeline.clone().avif(AVIF).toFile(`${OUT}/${name}-${width}.avif`)
    await pipeline.clone().webp(WEBP).toFile(`${OUT}/${name}-${width}.webp`)
  }
  sizes[name] = crop ? { w: crop.width, h: crop.height } : { w: W, h: H }
  console.log(`  ${name}: ${widths.join(', ')}`)
}

console.log('keyframes')
for (const n of [1, 2, 3, 4]) {
  await exportImage(stage(n), `stage-${n}`, [960, 1600, 2400, 3200])
}

console.log('hero poster (mobile, square around the brain)')
await exportImage(stage(1), 'hero-square', [720, 1200], region(cx, cy, bh * 1.18, bh * 1.18))

console.log('process detail crops')
// Sense: the data streams arriving from the left, plus the awakening hemisphere.
await exportImage(stage(2), 'detail-sense', [900, 1400], region(cx - bw * 0.62, cy, bw * 1.7, bh * 0.97))
// Solve: the boundary between wireframe and solid voxels.
await exportImage(stage(3), 'detail-solve', [900, 1400], region(cx + bw * 0.02, cy, bw * 1.16, bh * 0.92))
// Scale: the whole brain of light with its orbital rings.
await exportImage(stage(4), 'detail-scale', [900, 1400], region(cx, cy + bh * 0.04, bw * 1.62, bh * 1.22))
// Sustain: a close-up of the radiant core, wide enough for the full-width cell.
await exportImage(stage(4), 'detail-sustain', [900, 1400], region(cx, cy - bh * 0.05, bw * 0.9, bh * 0.5))

console.log('open graph')
const og = region(W * 0.5, cy, W, W / 1.905)
await sharp(stage(3)).extract(og).resize({ width: 1200, height: 630, fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og-image.jpg')
console.log('  og-image.jpg')

console.log('\nsource sizes for src/content/media.ts')
console.log(JSON.stringify(sizes, null, 2))
