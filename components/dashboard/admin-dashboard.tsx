import { createClient } from '@/lib/supabase/server'
import NextLink from 'next/link'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Avatar,
  Divider,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BarChartIcon from '@mui/icons-material/BarChart'
import { formatMMKAmount } from '@/lib/format-currency'

interface AdminDashboardProps {
  userId: string
}

export async function AdminDashboard({ userId }: AdminDashboardProps) {
  const supabase = await createClient()

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { data: payments } = await supabase
    .from('payments')
    .select('amount_in_cents')
    .eq('status', 'completed')

  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount_in_cents, 0) || 0

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers || 0,
      icon: PeopleIcon,
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
      href: '/dashboard/admin/users',
    },
    {
      label: 'Total Courses',
      value: totalCourses || 0,
      sub: `${publishedCourses || 0} published`,
      icon: MenuBookIcon,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.08)',
      href: '/dashboard/admin/courses',
    },
    {
      label: 'Total Revenue',
      value: formatMMKAmount(totalRevenue),
      icon: PaymentsOutlinedIcon,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.08)',
      href: '/dashboard/admin/payments',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments || 0,
      icon: PendingActionsIcon,
      color: '#dc2626',
      bg: 'rgba(220,38,38,0.08)',
      href: '/dashboard/admin/payments',
      highlight: (pendingPayments || 0) > 0,
    },
  ]

  const roleConfig: Record<string, { label: string; color: string; bg: string; avatarBg: string }> = {
    admin: { label: 'Admin', color: '#dc2626', bg: 'rgba(220,38,38,0.1)', avatarBg: '#dc2626' },
    instructor: { label: 'Instructor', color: '#2563eb', bg: 'rgba(37,99,235,0.1)', avatarBg: '#2563eb' },
    student: { label: 'Student', color: '#16a34a', bg: 'rgba(22,163,74,0.1)', avatarBg: '#16a34a' },
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Page banner */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, #ffffff 60%, rgba(124,58,237,0.06) 100%)',
          p: { xs: 3, md: 4 },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right,rgba(100,116,139,.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(100,116,139,.06) 1px,transparent 1px)',
            backgroundSize: '32px 32px',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 99,
              bgcolor: 'white',
              border: '1px solid #e2e8f0',
              mb: 2,
            }}
          >
            <BarChartIcon sx={{ fontSize: 14, color: 'primary.main' }} />
            <Typography variant="caption" fontWeight={600} color="primary.main">Admin Portal</Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Platform Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage users, courses, and payments from one place.
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2.5}>
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Grid item xs={6} md={3} key={stat.label}>
              <Card
                component={NextLink}
                href={stat.href}
                sx={{
                  height: '100%',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s',
                  outline: stat.highlight ? `2px solid rgba(220,38,38,0.35)` : 'none',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: stat.bg,
                      }}
                    >
                      <Icon sx={{ fontSize: 22, color: stat.color }} />
                    </Box>
                    <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled', opacity: 0, '.MuiCard-root:hover &': { opacity: 1 }, transition: 'opacity 0.2s' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} display="block">
                    {stat.label}
                  </Typography>
                  {stat.sub && (
                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.25 }}>
                      {stat.sub}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Recent Users */}
      <Card>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#f8fafc',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Recent Users</Typography>
            <Typography variant="caption" color="text.secondary">Latest platform registrations</Typography>
          </Box>
          <Button
            component={NextLink}
            href="/dashboard/admin/users"
            size="small"
            endIcon={<ChevronRightIcon />}
            sx={{ fontWeight: 600 }}
          >
            View all
          </Button>
        </Box>

        <Box>
          {recentUsers?.map((user, idx) => {
            const role = roleConfig[user.role] ?? roleConfig.student
            const initial = (user.full_name?.charAt(0) || user.email.charAt(0)).toUpperCase()
            return (
              <Box key={user.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 3,
                    py: 2,
                    transition: 'background-color 0.15s',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: role.avatarBg,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {initial}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user.full_name || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {user.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    <Chip
                      label={role.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: role.bg,
                        color: role.color,
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
                {idx < (recentUsers.length - 1) && <Divider sx={{ mx: 3 }} />}
              </Box>
            )
          })}
        </Box>
      </Card>
    </Box>
  )
}
