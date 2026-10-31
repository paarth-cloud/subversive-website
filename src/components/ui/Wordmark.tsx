import { cn } from '../../lib/cn'

/**
 * The Subversive logo from the brand artifact: the mirrored wordmark with its
 * red S, recoloured light for the dark page (public/brand holds the original).
 * Callers set the height; the width follows the 488x80 artwork.
 */
export function Wordmark({ className }: { className: string }) {
  return (
    <img
      src="/brand/subversive-logo-light.png"
      alt="Subversive"
      width={488}
      height={80}
      draggable={false}
      className={cn('block w-auto select-none', className)}
    />
  )
}
