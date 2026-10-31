import { media, srcSet, type MediaName } from '../../content/media'
import { cn } from '../../lib/cn'

type PictureProps = {
  name: MediaName
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  imgClassName?: string
}

/** AVIF first, WebP fallback, intrinsic size set so nothing shifts on load. */
export function Picture({ name, alt, sizes, priority = false, className, imgClassName }: PictureProps) {
  const { widths, w, h } = media[name]
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcSet(name, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, 'webp')} sizes={sizes} />
      <img
        src={`/media/${name}-${widths[0]}.webp`}
        alt={alt}
        width={w}
        height={h}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        className={cn('h-full w-full select-none', imgClassName)}
      />
    </picture>
  )
}
