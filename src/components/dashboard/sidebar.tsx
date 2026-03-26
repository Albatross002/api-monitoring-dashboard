import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Layers,
  ScrollText,
  BarChart3,
  CreditCard,
  Settings,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  prefix?: boolean
}[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, prefix: false },
  { to: "/apis", label: "My APIs", icon: Layers, prefix: true },
  { to: "/logs", label: "Logs", icon: ScrollText },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const { pathname } = useLocation()

  function linkActive(to: string, prefix?: boolean) {
    if (to === "/") return pathname === "/" || pathname === ""
    if (prefix) return pathname === to || pathname.startsWith(`${to}/`)
    return pathname === to
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-sidebar-border bg-sidebar text-sidebar-foreground md:border-r">
      <Link
        to="/"
        className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4 transition-opacity hover:opacity-95"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Play className="size-4 fill-current stroke-[1.5]" aria-hidden />
        </span>
        <span className="text-lg font-semibold tracking-tight">PulseAPI</span>
      </Link>
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map(({ to, label, icon: Icon, prefix }) => {
          const active = linkActive(to, prefix)
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
