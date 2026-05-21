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
  UserCheck,
  FolderTree,
  UserPlus,
} from 'lucide-react'

interface DashboardSidebarProps {
  profile: Profile
}

const studentNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/my-courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
  { href: '/dashboard/purchases', label: 'Purchases', icon: ShoppingBag },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const instructorNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
  { href: '/dashboard/courses/new', label: 'Create Course', icon: PlusCircle },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/courses', label: 'All Courses', icon: BookOpen },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/dashboard/admin/assignments', label: 'Assignments', icon: UserPlus },
  { href: '/dashboard/courses/new', label: 'Create Course', icon: PlusCircle },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/discussions', label: 'Discussions', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navItems =
    profile.role === 'admin'
      ? adminNavItems
      : profile.role === 'instructor'
      ? instructorNavItems
      : studentNavItems

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-9 w-9" />
          <span className="text-xl font-bold">Vital Tech</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{profile.full_name || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
