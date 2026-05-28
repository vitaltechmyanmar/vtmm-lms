'use client'

import NextLink from 'next/link'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
  Chip,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import PeopleIcon from '@mui/icons-material/People'
import PublicIcon from '@mui/icons-material/Public'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import FavoriteIcon from '@mui/icons-material/Favorite'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { MuiThemeProvider } from '@/components/mui-theme-provider'
import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  isLoggedIn: boolean
  coursesCount: number
  usersCount: number
}

// ── Nav ────────────────────────────────────────────────────────────────────────
const navLinks = [
  { href: '/courses', label: 'Browse Courses' },
  { href: '/about', label: 'About' },
]

// ── Mobile Drawer ─────────────────────────────────────────────────────────────
function MobileDrawer({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton
        id="about-mobile-menu-btn"
        onClick={() => setOpen(true)}
        sx={{ display: { md: 'none' }, color: 'text.primary' }}
        aria-label="Open menu"
      >
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {navLinks.map(link => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton component={NextLink} href={link.href}>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {isLoggedIn ? (
              <ListItem disablePadding>
                <ListItemButton component={NextLink} href="/dashboard">
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton component={NextLink} href="/auth/login">
                    <ListItemText primary="Sign in" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={NextLink} href="/auth/sign-up">
                    <ListItemText primary="Get Started" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function AboutPageClient({ isLoggedIn, coursesCount, usersCount }: Props) {
  return (
    <MuiThemeProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>

        {/* ── AppBar / Nav ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ maxWidth: 'lg', mx: 'auto', width: '100%', px: { xs: 2, md: 3 } }}>
            <Box
              component={NextLink}
              href="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 } }}
            >
              <Box component="img" src="/vitaltech_logo.png" alt="Vital Tech LearnHub" sx={{ height: 36, width: 36 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
                Vital Tech LearnHub
              </Typography>
            </Box>

            <Stack direction="row" spacing={3} sx={{ flexGrow: 1, ml: 4, display: { xs: 'none', md: 'flex' } }}>
              {navLinks.map(link => (
                <Typography
                  key={link.href}
                  component={NextLink}
                  href={link.href}
                  variant="body2"
                  fontWeight={link.href === '/about' ? 700 : 500}
                  sx={{
                    textDecoration: 'none',
                    color: link.href === '/about' ? 'primary.main' : 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {isLoggedIn ? (
                <Button variant="contained" component={NextLink} href="/dashboard" size="small">
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button component={NextLink} href="/auth/login" color="inherit" size="small">
                    Sign in
                  </Button>
                  <Button variant="contained" component={NextLink} href="/auth/sign-up" size="small">
                    Get Started
                  </Button>
                </>
              )}
            </Stack>
            <MobileDrawer isLoggedIn={isLoggedIn} />
          </Toolbar>
        </AppBar>

        {/* ── Hero ── */}
        <Box
          component="section"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: { xs: 10, md: 14 },
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 60%, #ede9fe 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right,rgba(100,116,139,.1) 1px,transparent 1px),linear-gradient(to bottom,rgba(100,116,139,.1) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
            <Chip
              label="OUR STORY"
              sx={{ mb: 3, fontWeight: 700, letterSpacing: 1, bgcolor: 'primary.main', color: 'white' }}
            />
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              About{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Vital Tech LearnHub
              </Box>
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, maxWidth: 580, mx: 'auto' }}
            >
              Empowering learners worldwide with high-quality, accessible education.
              We believe everyone deserves the opportunity to learn, grow, and succeed.
            </Typography>
          </Container>
        </Box>

        {/* ── Mission & Vision ── */}
        <Box component="section" sx={{ py: { xs: 10, md: 12 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {[
                {
                  Icon: TrackChangesIcon,
                  title: 'Our Mission',
                  color: '#2563eb',
                  text: 'To democratize education by providing world-class learning experiences that are accessible, engaging, and practical. We strive to bridge the gap between traditional education and real-world skills, empowering individuals to achieve their full potential regardless of their background or location.',
                },
                {
                  Icon: LightbulbIcon,
                  title: 'Our Vision',
                  color: '#7c3aed',
                  text: 'To become the leading platform for transformative learning, where every person has the tools and support they need to master new skills, advance their careers, and make a positive impact in their communities. We envision a world where learning never stops and opportunities are limitless.',
                },
              ].map(item => (
                <Grid item xs={12} md={6} key={item.title}>
                  <Card
                    sx={{
                      height: '100%',
                      border: `2px solid ${item.color}22`,
                      background: `linear-gradient(135deg, ${item.color}08 0%, transparent 100%)`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: `0 12px 40px ${item.color}18`,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 5 }}>
                      <Avatar
                        sx={{ bgcolor: item.color, width: 56, height: 56, mb: 3, borderRadius: 2 }}
                      >
                        <item.Icon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Typography variant="h4" fontWeight={700} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" lineHeight={1.75}>
                        {item.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Core Values ── */}
        <Box
          component="section"
          sx={{
            py: { xs: 10, md: 12 },
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(248,250,252,0.8)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom>Our Core Values</Typography>
              <Typography variant="body1" color="text.secondary">
                These principles guide everything we do at Vital Tech LearnHub
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
              {[
                { Icon: MenuBookIcon, title: 'Excellence', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', desc: 'We maintain the highest standards in course content and delivery' },
                { Icon: PublicIcon, title: 'Accessibility', color: '#0891b2', bg: 'rgba(8,145,178,0.08)', desc: 'Education should be available to everyone, everywhere' },
                { Icon: PeopleIcon, title: 'Community', color: '#7c3aed', bg: 'rgba(124,58,237,0.08)', desc: 'Learning is better together, with peers and mentors' },
                { Icon: FavoriteIcon, title: 'Passion', color: '#e11d48', bg: 'rgba(225,29,72,0.08)', desc: 'We love what we do and it shows in our work' },
              ].map(value => (
                <Grid item xs={12} sm={6} lg={3} key={value.title} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 72,
                      height: 72,
                      borderRadius: 3,
                      bgcolor: value.bg,
                      mb: 2,
                    }}
                  >
                    <value.Icon sx={{ color: value.color, fontSize: 36 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, mx: 'auto' }}>
                    {value.desc}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Impact Stats ── */}
        <Box component="section" sx={{ py: { xs: 10, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom>Our Impact</Typography>
              <Typography variant="body1" color="text.secondary">
                Numbers that reflect our commitment to transforming lives through education
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
              {[
                { value: `${usersCount ?? 0}+`, label: 'Active Learners' },
                { value: `${coursesCount ?? 0}+`, label: 'Courses Available' },
                { value: '50+', label: 'Expert Instructors' },
                { value: '95%', label: 'Satisfaction Rate' },
              ].map(stat => (
                <Grid item xs={6} md={3} key={stat.label} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h2"
                    fontWeight={800}
                    color="primary.main"
                    sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Why Choose Us ── */}
        <Box
          component="section"
          sx={{
            py: { xs: 10, md: 12 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'rgba(248,250,252,0.8)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom>Why Choose Vital Tech LearnHub?</Typography>
              <Typography variant="body1" color="text.secondary">
                We go beyond traditional online learning to deliver exceptional experiences
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {[
                {
                  Icon: WorkspacePremiumIcon,
                  title: 'Industry-Recognized Certificates',
                  color: '#f59e0b',
                  desc: 'Earn certificates that are valued by employers and demonstrate your expertise in your chosen field.',
                },
                {
                  Icon: PeopleIcon,
                  title: 'Expert Instructors',
                  color: '#2563eb',
                  desc: 'Learn from industry professionals with years of real-world experience and passion for teaching.',
                },
                {
                  Icon: LightbulbIcon,
                  title: 'Practical Learning',
                  color: '#16a34a',
                  desc: 'Our courses focus on hands-on projects and real-world applications, not just theory.',
                },
              ].map(item => (
                <Grid item xs={12} md={4} key={item.title}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 32px ${item.color}22`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Avatar
                        sx={{ bgcolor: `${item.color}18`, width: 52, height: 52, mb: 2.5, borderRadius: 2 }}
                      >
                        <item.Icon sx={{ color: item.color, fontSize: 26 }} />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                        {item.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Contact ── */}
        <Box component="section" sx={{ py: { xs: 10, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h2" gutterBottom>Get in Touch</Typography>
              <Typography variant="body1" color="text.secondary">
                Have questions? We&apos;d love to hear from you.
              </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
              {[
                { Icon: EmailIcon, label: 'Email', value: 'support@vitaltechmyanmar.com', color: '#2563eb' },
                { Icon: PhoneIcon, label: 'Phone', value: '+95 9 443 167 419', color: '#16a34a' },
                { Icon: LocationOnIcon, label: 'Address', value: 'Yangon, Myanmar', color: '#e11d48' },
              ].map(contact => (
                <Grid item xs={12} sm={4} key={contact.label}>
                  <Card sx={{ textAlign: 'center', height: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${contact.color}12`,
                          width: 52,
                          height: 52,
                          mx: 'auto',
                          mb: 2,
                          borderRadius: '50%',
                        }}
                      >
                        <contact.Icon sx={{ color: contact.color }} />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {contact.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {contact.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── CTA ── */}
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: 10 },
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight={800} sx={{ color: 'white', mb: 2 }}>
              Ready to Start Your Learning Journey?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5 }}>
              Join thousands of learners and start mastering new skills today.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                id="about-cta-signup-btn"
                variant="contained"
                size="large"
                component={NextLink}
                href="/auth/sign-up"
                endIcon={<ChevronRightIcon />}
                sx={{
                  px: 4,
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                }}
              >
                Get Started Free
              </Button>
              <Button
                id="about-cta-browse-btn"
                variant="outlined"
                size="large"
                component={NextLink}
                href="/courses"
                sx={{
                  px: 4,
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' },
                }}
              >
                Browse Courses
              </Button>
            </Stack>
          </Container>
        </Box>

        {/* ── Footer ── */}
        <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 5 }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="img" src="/vitaltech_logo.png" alt="logo" sx={{ width: 32, height: 32 }} />
                <Typography fontWeight={600}>Vital Tech LearnHub</Typography>
              </Box>
              <Stack direction="row" spacing={3}>
                {[
                  { href: '/courses', label: 'Courses' },
                  { href: '/about', label: 'About' },
                ].map(link => (
                  <Typography
                    key={link.href}
                    component={NextLink}
                    href={link.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Vital Tech LearnHub. All rights reserved.
              </Typography>
            </Stack>
          </Container>
        </Box>

      </Box>
    </MuiThemeProvider>
  )
}
