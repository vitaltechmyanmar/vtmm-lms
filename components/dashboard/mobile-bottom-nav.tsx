'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Settings,
  Users,
  BarChart3,
  MessageSquare,
  PlusCircle,
  ShoppingBag,
  FolderTree,
  UserPlus,
} from 'lucide-react'

interface MobileBottomNavProps {
  profile: Profile
}

const studentNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/my-courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/certificates', label: 'Certs', icon: Award },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const instructorNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/courses/new', label: 'Create', icon: PlusCircle },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function MobileBottomNav({ profile }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems =
    profile.role === 'admin'
      ? adminNavItems
      : profile.role === 'instructor'
      ? instructorNavItems
      : studentNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
