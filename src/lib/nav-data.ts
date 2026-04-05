import {
  TrendingUp,
  Search,
  Coins,
  ShoppingCart,
  Route,
  Briefcase,
  Hammer,
  Calculator,
  FlaskConical,
  Wheat,
  Dog,
  Sparkles,
  Swords,
  Skull,
  BarChart3,
  Shield,
  Globe,
  Map,
  Home,
  Mountain,
  Timer,
  Users,
  Users2,
  User,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Market & Economy',
    icon: TrendingUp,
    items: [
      { label: 'Price Checker', href: '/market/prices', icon: Search },
      { label: 'Gold Price', href: '/market/gold', icon: Coins },
      { label: 'Black Market', href: '/market/blackmarket', icon: ShoppingCart },
      { label: 'Trade Routes', href: '/market/routes', icon: Route },
      { label: 'Portfolio', href: '/market/portfolio', icon: Briefcase },
    ],
  },
  {
    label: 'Crafting & Production',
    icon: Hammer,
    items: [
      { label: 'Calculator', href: '/crafting/calculator', icon: Calculator },
      { label: 'Refining', href: '/crafting/refining', icon: FlaskConical },
      { label: 'Farming', href: '/crafting/farming', icon: Wheat },
      { label: 'Breeding', href: '/crafting/breeding', icon: Dog },
      { label: 'Enchanting', href: '/crafting/enchanting', icon: Sparkles },
    ],
  },
  {
    label: 'PvP & Combat',
    icon: Swords,
    items: [
      { label: 'Kill Board', href: '/pvp/killboard', icon: Skull },
      { label: 'Meta Analysis', href: '/pvp/meta', icon: BarChart3 },
      { label: 'Builds', href: '/pvp/builds', icon: Shield },
    ],
  },
  {
    label: 'World & Management',
    icon: Globe,
    items: [
      { label: 'Map', href: '/world/map', icon: Map },
      { label: 'Islands', href: '/world/islands', icon: Home },
      { label: 'Avalon Roads', href: '/world/avalon', icon: Mountain },
      { label: 'Timers', href: '/world/timers', icon: Timer },
    ],
  },
  {
    label: 'Social & Info',
    icon: Users,
    items: [
      { label: 'Guilds', href: '/social/guilds', icon: Users2 },
      { label: 'Players', href: '/social/players', icon: User },
      { label: 'Dev Tracker', href: '/social/devtracker', icon: Megaphone },
    ],
  },
]
