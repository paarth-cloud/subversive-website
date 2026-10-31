import type { MouseEvent, PointerEvent, ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { ArrowDownIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { useSmoothScroll } from '../../providers/SmoothScroll'
import { track } from '../../lib/analytics'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost'
type Size = 'md' | 'lg'
type IconKind = 'arrow' | 'down' | 'none'

type BaseProps = {
  variant?: Variant
  size?: Size
  icon?: IconKind
  /** Pulls gently toward the cursor on fine pointers. */
  magnetic?: boolean
  /** Analytics: where on the page this button lives. */
  trackLocation?: string
  className?: string
  children: ReactNode
}

type LinkButtonProps = BaseProps & {
  href: string
  target?: string
  rel?: string
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
}

type NativeButtonProps = BaseProps & {
  href?: undefined
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  'aria-describedby'?: string
}

const base =
  'group relative isolate inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] outline-offset-4 transition-[background-color,border-color,color,box-shadow] duration-300 ease-ui disabled:cursor-not-allowed disabled:opacity-60'

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-14 px-7 text-base',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-signal text-white shadow-[0_14px_40px_-14px_rgb(232_25_44/0.75),inset_0_1px_0_rgb(255_255_255/0.22)] hover:bg-signal-hover hover:shadow-[0_18px_50px_-14px_rgb(232_25_44/0.9),inset_0_1px_0_rgb(255_255_255/0.28)]',
  ghost:
    'border border-line-2 bg-white/[0.03] text-ink backdrop-blur-md hover:border-white/30 hover:bg-white/[0.07]',
}

const MAX_PULL = 6
const clamp = (v: number) => Math.max(-MAX_PULL, Math.min(MAX_PULL, v))

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const { variant = 'primary', size = 'md', icon = 'arrow', magnetic = false, trackLocation, className, children } = props
  const { scrollTo } = useSmoothScroll()
  const finePointer = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const pull = magnetic && finePointer && !reduced

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.5 })

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!pull) return
    const r = event.currentTarget.getBoundingClientRect()
    x.set(clamp((event.clientX - (r.left + r.width / 2)) * 0.18))
    y.set(clamp((event.clientY - (r.top + r.height / 2)) * 0.3))
  }
  const onPointerLeave = () => {
    x.set(0)
    y.set(0)
  }

  const content = (
    <>
      {variant === 'primary' && (
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full">
          <span className="absolute inset-y-0 -left-1/2 w-1/3 -translate-x-full -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out-expo group-hover:translate-x-[520%]" />
        </span>
      )}
      <span>{children}</span>
      {icon !== 'none' && (
        <span
          aria-hidden
          className={cn(
            'transition-transform duration-300 ease-ui',
            icon === 'arrow' ? 'group-hover:translate-x-0.5' : 'group-hover:translate-y-0.5',
          )}
        >
          {icon === 'arrow' ? <ArrowRightIcon size={18} /> : <ArrowDownIcon size={18} />}
        </span>
      )}
    </>
  )

  const shared = {
    className: cn(base, sizes[size], variants[variant], className),
    style: pull ? { x: sx, y: sy } : undefined,
    whileTap: reduced ? undefined : { scale: 0.97 },
    transition: { duration: 0.18 },
    onPointerMove,
    onPointerLeave,
  }

  if (props.href !== undefined) {
    const { href, target, rel, onClick } = props
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (trackLocation) track('cta_click', { location: trackLocation, label: String(children) })
      onClick?.(event)
      if (event.defaultPrevented) return
      if (href.startsWith('#')) {
        event.preventDefault()
        scrollTo(href)
      }
    }
    return (
      <motion.a href={href} target={target} rel={rel} onClick={handleClick} {...shared}>
        {content}
      </motion.a>
    )
  }

  const { type = 'button', disabled, onClick } = props
  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-describedby={props['aria-describedby']}
      onClick={(event) => {
        if (trackLocation) track('cta_click', { location: trackLocation, label: String(children) })
        onClick?.(event)
      }}
      {...shared}
    >
      {content}
    </motion.button>
  )
}
