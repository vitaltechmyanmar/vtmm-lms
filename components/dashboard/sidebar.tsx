'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
} from '@mui/material'

// MUI icons
import DashboardIcon from '@mui/icons-material/Dashboard'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import SettingsIcon from '@mui/icons-material/Settings'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'

interface DashboardSidebarProps {
  profile: Profile
}

const studentNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/my-courses', label: 'My Courses', icon: MenuBookIcon },
  { href: '/dashboard/certificates', label: 'Certificates', icon: WorkspacePremiumIcon },
  { href: '/dashboard/purchases', label: 'Purchases', icon: ShoppingBagOutlinedIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

const instructorNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/courses', label: 'My Courses', icon: MenuBookIcon },
  { href: '/dashboard/courses/new', label: 'Create Course', icon: AddCircleOutlineIcon },
  { href: '/dashboard/students', label: 'Students', icon: PeopleIcon },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChartIcon },
  { href: '/dashboard/discussions', label: 'Discussions', icon: ChatBubbleOutlineIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

const adminNavItems = [
  { href: '/dashboard', label: 'Overview', icon: DashboardIcon },
  { href: '/dashboard/admin/users', label: 'Users', icon: PeopleIcon },
  { href: '/dashboard/admin/courses', label: 'All Courses', icon: MenuBookIcon },
  { href: '/dashboard/admin/categories', label: 'Categories', icon: AccountTreeIcon },
  { href: '/dashboard/admin/assignments', label: 'Assignments', icon: PersonAddAltIcon },
  { href: '/dashboard/admin/payments', label: 'Payment Approvals', icon: PaymentsOutlinedIcon },
  { href: '/dashboard/courses/new', label: 'Create Course', icon: AddCircleOutlineIcon },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChartIcon },
  { href: '/dashboard/discussions', label: 'Discussions', icon: ChatBubbleOutlineIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
]

const roleConfig = {
  admin: { label: 'Admin', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  instructor: { label: 'Instructor', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  student: { label: 'Student', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navItems =
    profile.role === 'admin'
      ? adminNavItems
      : profile.role === 'instructor'
      ? instructorNavItems
      : studentNavItems

  const role = roleConfig[profile.role as keyof typeof roleConfig] ?? roleConfig.student
  const initial = (profile.full_name?.charAt(0) || profile.email.charAt(0)).toUpperCase()

  return (
    <Box
      component="aside"
      sx={{
        position: 'fixed',
        inset: '0 auto 0 0',
        zIndex: 50,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        width: 256,
        bgcolor: 'white',
        borderRight: '1px solid #e2e8f0',
        boxShadow: 'none',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          height: 64,
          px: 3,
          borderBottom: '1px solid #e2e8f0',
          flexShrink: 0,
        }}
      >
        <Box
          component={NextLink}
          href="/"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit' }}
        >
          <Box component="img" src="/vitaltech_logo.png" alt="Vital Tech LearnHub" sx={{ height: 36, width: 36 }} />
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Vital Tech
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <List dense disablePadding>
          {navItems.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <ListItemButton
                key={item.href}
                component={NextLink}
                href={item.href}
                selected={isActive}
                sx={{ mb: 0.5, py: 1 }}
              >
                <ListItemIcon>
                  <Icon sx={{ fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* User profile */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1.25,
            borderRadius: 2,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {profile.full_name || 'User'}
            </Typography>
            <Chip
              label={role.label}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: role.bg,
                color: role.color,
                borderRadius: 1,
                mt: 0.25,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
