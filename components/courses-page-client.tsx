'use client'

import Link from 'next/link'
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { MuiThemeProvider } from '@/components/mui-theme-provider'
import { formatMMK } from '@/lib/format-currency'

interface Category {
  id: string
  name: string
  color: string
}

interface Course {
  id: string
  title: string
  level: string
  category?: string
  thumbnail_url?: string | null
  price_in_cents: number
  enrollment_count: number
  instructor?: { full_name: string | null } | null
  lessons?: { count: number }[]
}

interface CoursesPageClientProps {
  courses: Course[] | null
  categories: Category[] | null
  params: { category?: string; level?: string; q?: string }
  isLoggedIn: boolean
}

const levels = ['beginner', 'intermediate', 'advanced']

const navLinks = [
  { href: '/courses', label: 'Browse Courses' },
  { href: '/about', label: 'About' },
]

export function CoursesPageClient({ courses, categories, params, isLoggedIn }: CoursesPageClientProps) {
  return (
    <MuiThemeProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>

        {/* ── AppBar / Nav ── */}
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ maxWidth: 'lg', mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
            {/* Logo */}
            <Box
              component={Link}
              href="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 } }}
            >
              <Box component="img" src="/vitaltech_logo.png" alt="Vital Tech LearnHub" sx={{ height: 36, width: 36 }} />
              <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'none', sm: 'block' } }}>
                Vital Tech LearnHub
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ display: { xs: 'block', sm: 'none' } }}>
                VT LearnHub
              </Typography>
            </Box>

            {/* Desktop nav */}
            <Stack direction="row" spacing={3} sx={{ flexGrow: 1, ml: 4, display: { xs: 'none', md: 'flex' } }}>
              {navLinks.map(link => (
                <Box
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: link.href === '/courses' ? 700 : 500,
                    color: link.href === '/courses' ? 'primary.main' : 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>

            {/* Auth actions */}
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {isLoggedIn ? (
                <Button variant="contained" component={Link} href="/dashboard" size="small">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button component={Link} href="/auth/login" color="inherit" size="small">
                    Sign in
                  </Button>
                  <Button variant="contained" component={Link} href="/auth/sign-up" size="small">
                    Get Started
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        {/* ── Main Content ── */}
        <Box component="main" sx={{ flex: 1, py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">

            {/* Page header */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                Explore Courses
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Discover DevOps &amp; Cloud courses taught by a working engineer
              </Typography>
            </Box>

            {/* Filters */}
            <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Categories */}
              {categories && categories.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <FilterListIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Category
                    </Typography>
                  </Box>
                  <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                    <Chip
                      component={Link}
                      href="/courses"
                      label="All"
                      clickable
                      variant={!params.category ? 'filled' : 'outlined'}
                      color={!params.category ? 'primary' : 'default'}
                      size="small"
                    />
                    {categories.map(cat => (
                      <Chip
                        key={cat.id}
                        component={Link}
                        href={`/courses?category=${cat.name}`}
                        label={cat.name}
                        clickable
                        variant={params.category === cat.name ? 'filled' : 'outlined'}
                        size="small"
                        sx={params.category === cat.name ? { bgcolor: cat.color, color: 'white', borderColor: cat.color } : {}}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Level filter */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <FilterListIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Level
                  </Typography>
                </Box>
                <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                  <Chip
                    component={Link}
                    href={params.category ? `/courses?category=${params.category}` : '/courses'}
                    label="All Levels"
                    clickable
                    variant={!params.level ? 'filled' : 'outlined'}
                    color={!params.level ? 'primary' : 'default'}
                    size="small"
                  />
                  {levels.map(level => (
                    <Chip
                      key={level}
                      component={Link}
                      href={params.category ? `/courses?category=${params.category}&level=${level}` : `/courses?level=${level}`}
                      label={level.charAt(0).toUpperCase() + level.slice(1)}
                      clickable
                      variant={params.level === level ? 'filled' : 'outlined'}
                      color={params.level === level ? 'primary' : 'default'}
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              {/* Active filter summary */}
              {(params.category || params.level) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">Active filters:</Typography>
                  {params.category && (
                    <Chip label={params.category} size="small" variant="outlined" color="primary" />
                  )}
                  {params.level && (
                    <Chip label={params.level} size="small" variant="outlined" color="primary" sx={{ textTransform: 'capitalize' }} />
                  )}
                  <Button
                    component={Link}
                    href="/courses"
                    size="small"
                    startIcon={<ClearIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                  >
                    Clear all
                  </Button>
                </Box>
              )}
            </Box>

            {/* Course Grid */}
            {courses && courses.length > 0 ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {courses.length} course{courses.length !== 1 ? 's' : ''} found
                </Typography>
                <Grid container spacing={3}>
                  {courses.map(course => (
                    <Grid item xs={12} sm={6} lg={4} key={course.id}>
                      <Card
                        component={Link}
                        href={`/courses/${course.id}`}
                        sx={{
                          height: '100%',
                          textDecoration: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.2s ease',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                          },
                        }}
                      >
                        {/* Thumbnail */}
                        <Box sx={{ aspectRatio: '16/9', bgcolor: '#f1f5f9', overflow: 'hidden' }}>
                          {course.thumbnail_url ? (
                            <Box
                              component="img"
                              src={course.thumbnail_url}
                              alt={course.title}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', '.MuiCard-root:hover &': { transform: 'scale(1.04)' } }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <MenuBookOutlinedIcon sx={{ fontSize: 48, color: '#cbd5e1' }} />
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          {/* Badges */}
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                            <Chip
                              label={course.level}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                bgcolor: 'rgba(37,99,235,0.1)',
                                color: 'primary.main',
                                borderRadius: 1,
                                textTransform: 'capitalize',
                              }}
                            />
                            {course.category && (
                              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                {course.category}
                              </Typography>
                            )}
                          </Stack>

                          {/* Title */}
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {course.title}
                          </Typography>

                          {/* Instructor */}
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                            by {course.instructor?.full_name || 'Instructor'}
                          </Typography>

                          {/* Meta info */}
                          <Stack direction="row" spacing={2.5} sx={{ mb: 3, mt: 'auto' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MenuBookOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {course.lessons?.[0]?.count || 0} lessons
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {course.enrollment_count} students
                              </Typography>
                            </Box>
                          </Stack>

                          {/* Price + CTA */}
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6" fontWeight={800} color="primary.main">
                              {formatMMK(course.price_in_cents)}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              endIcon={<ChevronRightIcon />}
                              tabIndex={-1}
                              sx={{ pointerEvents: 'none' }}
                            >
                              View Course
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            ) : (
              <Card>
                <CardContent sx={{ py: 10, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(37,99,235,0.08)', mb: 3,
                    }}
                  >
                    <MenuBookOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>No courses found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {params.category || params.level
                      ? 'Try adjusting your filters or browse all courses'
                      : 'Check back later for new courses'}
                  </Typography>
                  {(params.category || params.level) && (
                    <Button component={Link} href="/courses" variant="outlined" size="large">
                      View All Courses
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </Container>
        </Box>

        {/* ── Footer ── */}
        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 5 }}>
          <Container maxWidth="lg">
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="img" src="/vitaltech_logo.png" alt="logo" sx={{ width: 32, height: 32 }} />
                <Typography fontWeight={600}>Vital Tech LearnHub</Typography>
              </Box>
              <Stack direction="row" spacing={3}>
                {[
                  { href: '/courses', label: 'Courses' },
                  { href: '/about', label: 'About' },
                  { href: '/auth/login', label: 'Sign In' },
                ].map(link => (
                  <Box
                    key={link.href}
                    component={Link}
                    href={link.href}
                    sx={{ fontSize: '0.875rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    {link.label}
                  </Box>
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Vital Tech Myanmar
              </Typography>
            </Stack>
          </Container>
        </Box>

      </Box>
    </MuiThemeProvider>
  )
}
