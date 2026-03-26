import { Bell, CircleHelp, LogOut, User, Settings } from "lucide-react"
import { useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getHeaderTitle } from "@/lib/route-meta"

export function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = getHeaderTitle(location.pathname)

  const initials =
    user?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      <div className="flex items-center gap-0.5">
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" aria-label="Notifications">
          <Bell className="size-[1.15rem]" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" aria-label="Help">
          <CircleHelp className="size-[1.15rem]" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
