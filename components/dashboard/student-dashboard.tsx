import { createClient } from '@/lib/supabase/server'
import NextLink from 'next/link'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
  Avatar,
  Chip,
} from '@mui/material'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

interface StudentDashboardProps {
  userId: string
}

export async function StudentDashboard({ userId }: StudentDashboardProps) {
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(
        id,
        title,
        thumbnail_url,
        instructor:profiles!instructor_id(full_name)
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })

  const { count: certificatesCount } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const inProgressCourses = enrollments?.filter(e => !e.completed_at) || []
  const completedCourses = enrollments?.filter(e => e.completed_at) || []

  const stats = [
    { label: 'Enrolled Courses', value: enrollments?.length || 0, icon: MenuBookIcon, color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
    { label: 'In Progress', value: inProgressCourses.length, icon: AccessTimeIcon, color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    { label: 'Completed', value: completedCourses.length, icon: TrendingUpIcon, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    { label: 'Certificates', value: certificatesCount || 0, icon: WorkspacePremiumIcon, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Page header */}
      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Welcome back! 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Continue your learning journey
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5}>
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Grid item xs={6} md={3} key={stat.label}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
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
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="text.primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Continue Learning */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>Continue Learning</Typography>
          <Button
            component={NextLink}
            href="/dashboard/my-courses"
            size="small"
            endIcon={<ChevronRightIcon />}
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            View all
          </Button>
        </Box>

        {inProgressCourses.length > 0 ? (
          <Grid container spacing={2.5}>
            {inProgressCourses.slice(0, 3).map(enrollment => (
              <Grid item xs={12} sm={6} lg={4} key={enrollment.id}>
                <Card sx={{ height: '100%', overflow: 'hidden' }}>
                  {/* Thumbnail */}
                  <Box sx={{ aspectRatio: '16/9', bgcolor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                    {enrollment.course?.thumbnail_url ? (
                      <Box
                        component="img"
                        src={enrollment.course.thumbnail_url}
                        alt={enrollment.course.title}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <MenuBookIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                      </Box>
                    )}
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap gutterBottom>
                      {enrollment.course?.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      by {enrollment.course?.instructor?.full_name || 'Instructor'}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="caption" color="text.secondary">Progress</Typography>
                        <Typography variant="caption" fontWeight={600} color="primary.main">
                          {enrollment.progress_percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress value={enrollment.progress_percentage} variant="determinate" />
                    </Box>

                    <Button
                      component={NextLink}
                      href={`/courses/${enrollment.course?.id}/learn`}
                      variant="contained"
                      size="small"
                      fullWidth
                      endIcon={<ChevronRightIcon />}
                    >
                      Continue
                    </Button>
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
                Start your learning journey by enrolling in a course
              </Typography>
              <Button
                component={NextLink}
                href="/courses"
                variant="contained"
                size="large"
              >
                Browse Courses
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  )
}
