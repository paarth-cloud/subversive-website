// Encodes the Higgsfield transformation clip for scroll scrubbing.
//
//   node scripts/encode-scrub-video.mjs [input]
//
// Scrubbing seeks constantly, so every version uses a short keyframe interval
// (a keyframe every 8 frames, a third of a second at 24fps), no B-frames and
// faststart, which keeps seeks cheap in every browser. CRF 27 was picked by
// comparing 1:1 crops of the busiest frame: indistinguishable from CRF 23 at
// about 55 percent of the size. Audio is dropped. Writes public/media/shift-*.mp4.
import { execFileSync } from 'node:child_process'
import { statSync } from 'node:fs'

const input = process.argv[2] ?? 'raw-assets/shift-source.mp4'
const GOP = 8

const VERSIONS = [
  { name: 'shift-1080.mp4', width: 1920, height: 1080, crf: 27 },
  { name: 'shift-720.mp4', width: 1280, height: 720, crf: 28 },
]

for (const v of VERSIONS) {
  const output = `public/media/${v.name}`
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel', 'error',
      '-i', input,
      '-an',
      '-vf', `scale=${v.width}:${v.height}:flags=lanczos,format=yuv420p`,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-tune', 'film',
      '-crf', String(v.crf),
      '-g', String(GOP),
      '-keyint_min', String(GOP),
      '-sc_threshold', '0',
      '-bf', '0',
      '-movflags', '+faststart',
      output,
    ],
    { stdio: 'inherit' },
  )
  console.log(`${output}  ${(statSync(output).size / 1024 / 1024).toFixed(2)} MB`)
}
