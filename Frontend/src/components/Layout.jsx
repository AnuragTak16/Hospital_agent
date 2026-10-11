import { NavLink, Outlet } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { useRole } from '@/context/RoleContext'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/doctors', label: 'Doctors' },
  { to: '/availability', label: 'Slots' },
  { to: '/book', label: 'Book' },
  { to: '/patients', label: 'Patients' },
]

export default function Layout() {
  const { role, setRole } = useRole()

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="flex flex-col gap-6 border-r bg-sidebar p-5 text-sidebar-foreground lg:sticky lg:top-0 lg:h-svh">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Stethoscope className="size-5" />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight">CareLine</p>
            <p className="text-sm text-muted-foreground">
              Hospital voice agent desk
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 rounded-xl border bg-background/60 p-3">
          <Label htmlFor="role">Acting as</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Sent as the <code>role</code> header for protected APIs.
          </p>
        </div>
      </aside>

      <main className="bg-[radial-gradient(900px_420px_at_10%_-10%,oklch(0.93_0.04_170),transparent),radial-gradient(700px_380px_at_100%_0%,oklch(0.94_0.03_220),transparent)] px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
        <Separator className="mx-auto mt-10 max-w-5xl opacity-40" />
      </main>
    </div>
  )
}
