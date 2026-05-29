'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'

// MUI icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleIcon from '@mui/icons-material/People'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'

interface MobileBottomNavProps {
  profile: Profile
}

const studentNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/my-courses', label: 'Courses', icon: MenuBookIcon },
  { href: '/dashboard/certificates', label: 'Certs', icon: WorkspacePremiumIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

const instructorNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/courses', label: 'Courses', icon: MenuBookIcon },
  { href: '/dashboard/courses/new', label: 'Create', icon: AddCircleOutlineIcon },
  { href: '/dashboard/students', label: 'Students', icon: PeopleIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/admin/users', label: 'Users', icon: PeopleIcon },
  { href: '/dashboard/admin/courses', label: 'Courses', icon: MenuBookIcon },
  { href: '/dashboard/admin/payments', label: 'Payments', icon: PaymentsOutlinedIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

export function MobileBottomNav({ profile }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems =
    profile.role === 'admin'
      ? adminNavItems
      : profile.role === 'instructor'
      ? instructorNavItems
      : studentNavItems

  // Find the active index
  const activeIndex = navItems.findIndex(item =>
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(item.href))
  )

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: { xs: 'block', lg: 'none' },
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <BottomNavigation
        value={activeIndex === -1 ? false : activeIndex}
        showLabels
        sx={{ height: 64 }}
      >
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <BottomNavigationAction
              key={item.href}
              label={item.label}
              icon={<Icon sx={{ fontSize: 22 }} />}
              component={NextLink}
              href={item.href}
              sx={{
                minWidth: 0,
                px: 0.5,
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.65rem',
                  fontWeight: 500,
                },
              }}
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}
