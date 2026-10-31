import {
  BankIcon,
  BuildingsIcon,
  CallBellIcon,
  GraduationCapIcon,
  HeartbeatIcon,
  LightningIcon,
  ShoppingBagOpenIcon,
  TruckIcon,
  type Icon,
} from '@phosphor-icons/react'
import { site, type IndustryIcon } from '../content/site'
import { Marquee } from '../components/ui/Marquee'

const ICONS: Record<IndustryIcon, Icon> = {
  bank: BankIcon,
  heartbeat: HeartbeatIcon,
  shopping: ShoppingBagOpenIcon,
  truck: TruckIcon,
  buildings: BuildingsIcon,
  bell: CallBellIcon,
  graduation: GraduationCapIcon,
  lightning: LightningIcon,
}

/** The page's one marquee: breadth of sectors, no individual attention needed. */
export function Industries() {
  const { industries } = site
  return (
    <section aria-labelledby="industries-title" className="relative z-[2] py-16 md:py-20">
      <div className="container-page mb-8">
        <h2 id="industries-title" className="text-[0.9375rem] text-ink-3">
          {industries.label}
        </h2>
      </div>
      <Marquee label={industries.label}>
        {industries.items.map((item) => {
          const ItemIcon = ICONS[item.icon]
          return (
            <li
              key={item.name}
              className="flex items-center gap-3.5 whitespace-nowrap text-[clamp(1.375rem,2.4vw,2.125rem)] font-medium tracking-[-0.035em] text-ink/85"
            >
              <ItemIcon size={28} weight="light" className="text-ink-3" aria-hidden />
              {item.name}
            </li>
          )
        })}
      </Marquee>
    </section>
  )
}
