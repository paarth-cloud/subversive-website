import type { ReactNode } from 'react'

/**
 * Infinite horizontal band. The track holds the items twice and slides by half
 * its width. Pauses on hover; under reduced motion it stops and wraps.
 */
export function Marquee({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="group relative flex overflow-hidden mask-fade-x" role="region" aria-label={label}>
      <div className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none">
        <ul className="flex shrink-0 items-center gap-x-14 pr-14 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6">
          {children}
        </ul>
        <ul aria-hidden="true" className="flex shrink-0 items-center gap-x-14 pr-14 motion-reduce:hidden">
          {children}
        </ul>
      </div>
    </div>
  )
}
