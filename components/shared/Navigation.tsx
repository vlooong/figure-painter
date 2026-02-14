'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/extract', label: 'Extract' },
  { href: '/plot', label: 'Plot' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="text-lg font-semibold">
          Figure Painter
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
