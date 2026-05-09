'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  PenLine,
  CalendarDays,
  BarChart3,
  UserCircle,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/log', label: 'Log', icon: PenLine },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: UserCircle },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100 h-16 items-center px-6 justify-between">
        <Logo size="md" />
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
                active ? 'text-violet-600' : 'text-gray-400'
              )}
            >
              <Icon
                size={20}
                className={cn(
                  'transition-transform',
                  active && 'scale-110'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
