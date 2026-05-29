import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import PeopleIcon from '@mui/icons-material/People'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { formatMMK, formatMMKAmount } from '@/lib/format-currency'

interface InstructorDashboardProps {
  userId: string
}

export async function InstructorDashboard({ userId }: InstructorDashboardProps) {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('instructor_id', userId)
    .order('created_at', { ascending: false })

  const courseIds = courses?.map(c => c.id) || []
  let totalStudents = 0
  let totalRevenue = 0

  if (courseIds.length > 0) {
    const { count: studentsCount } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)

    totalStudents = studentsCount || 0

    const { data: payments } = await supabase
      .from('payments')
      .select('amount_in_cents')
      .in('course_id', courseIds)
      .eq('status', 'completed')

    totalRevenue = payments?.reduce((sum, p) => sum + p.amount_in_cents, 0) || 0
  }

  const publishedCourses = courses?.filter(c => c.is_published) || []
  const draftCourses = courses?.filter(c => !c.is_published) || []

  const stats = [
    {
      label: 'Total Courses',
      value: courses?.length || 0,
      sub: `${publishedCourses.length} published · ${draftCourses.length} drafts`,
      icon: MenuBookIcon,
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
    },
    {
      label: 'Total Students',
      value: totalStudents,
      icon: PeopleIcon,
      color: '#16a34a',
      bg: 'rgba(22,163,74,0.08)',
    },
    {
      label: 'Total Revenue',
      value: formatMMKAmount(totalRevenue),
      icon: PaymentsOutlinedIcon,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.08)',
    },
    {
      label: 'Avg. Rating',
      value: '4.8',
      sub: 'Based on reviews',
      icon: TrendingUpIcon,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.08)',
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Instructor Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your courses and track your performance
          </Typography>
        </Box>
        <Link href="/dashboard/courses/new" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<AddCircleOutlineIcon />} size="large">
            Create New Course
          </Button>
        </Link>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5}>
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Grid item xs={6} md={3} key={stat.label}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: stat.bg,
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ fontSize: 22, color: stat.color }} />
                  </Box>
                  <Typography variant="h4" fontWeight={800}>
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

      {/* Course list */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>Your Courses</Typography>
          <Link href="/dashboard/courses" style={{ textDecoration: 'none' }}>
            <Button size="small" endIcon={<ChevronRightIcon />} sx={{ color: 'primary.main', fontWeight: 600 }}>
              View all
            </Button>
          </Link>
        </Box>

        {courses && courses.length > 0 ? (
          <Grid container spacing={2.5}>
            {courses.slice(0, 6).map(course => (
              <Grid item xs={12} sm={6} lg={4} key={course.id}>
                <Card sx={{ height: '100%', overflow: 'hidden' }}>
                  <Box sx={{ aspectRatio: '16/9', bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                    {course.thumbnail_url ? (
                      <Box
                        component="img"
                        src={course.thumbnail_url}
                        alt={course.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <MenuBookIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Chip
                        label={course.is_published ? 'Published' : 'Draft'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: course.is_published ? 'rgba(22,163,74,0.1)' : 'rgba(217,119,6,0.1)',
                          color: course.is_published ? '#16a34a' : '#d97706',
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {course.level}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} noWrap gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ mb: 2 }}>
                      {formatMMK(course.price_in_cents)}
                    </Typography>
                    <Link href={`/dashboard/courses/${course.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <Button variant="outlined" size="small" fullWidth>
                        Manage Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'rgba(37,99,235,0.08)',
                  mb: 3,
                }}
              >
                <MenuBookIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                No courses yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first course and start teaching
              </Typography>
              <Link href="/dashboard/courses/new" style={{ textDecoration: 'none' }}>
                <Button variant="contained" size="large" startIcon={<AddCircleOutlineIcon />}>
                  Create Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}
