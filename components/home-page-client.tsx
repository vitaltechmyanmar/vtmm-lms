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
  Chip,
  Stack,
  Divider,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TerminalIcon from '@mui/icons-material/Terminal'
import SecurityIcon from '@mui/icons-material/Security'
import BoltIcon from '@mui/icons-material/Bolt'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import StorageIcon from '@mui/icons-material/Storage'
import CallSplitIcon from '@mui/icons-material/CallSplit'
import CloudIcon from '@mui/icons-material/Cloud'
import WidgetsIcon from '@mui/icons-material/Widgets'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import { MuiThemeProvider } from '@/components/mui-theme-provider'
import { TechStackMarquee } from '@/components/tech-stack-marquee'
import { useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  users: number
  courses: number
  enrollments: number
}

interface Props {
  isLoggedIn: boolean
  stats: Stats
}

// ── Learning path data ────────────────────────────────────────────────────────
const learningPaths = [
  {
    Icon: StorageIcon,
    title: 'Linux & System Admin',
    desc: 'File systems, process management, networking, shell scripting',
    tags: ['Bash', 'systemd', 'cron'],
    color: '#64748b',
    bg: 'rgba(100,116,139,0.08)',
  },
  {
    Icon: WidgetsIcon,
    title: 'Containers & Orchestration',
    desc: 'Docker, Kubernetes, Helm, container security and CI/CD pipelines',
    tags: ['Docker', 'K8s', 'Helm'],
    color: '#2563eb',
    bg: 'rgba(37,99,235,0.08)',
  },
  {
    Icon: CloudIcon,
    title: 'Cloud Infrastructure',
    desc: 'AWS, Terraform, Ansible — provision and manage cloud resources as code',
    tags: ['AWS', 'IaC', 'Terraform'],
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.08)',
  },
  {
    Icon: CallSplitIcon,
    title: 'CI/CD & Automation',
    desc: 'GitHub Actions, Jenkins, GitLab CI — automate builds, tests, and deployments',
    tags: ['GitHub Actions', 'Jenkins', 'GitOps'],
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.08)',
  },
  {
    Icon: SecurityIcon,
    title: 'Security & Hardening',
    desc: 'DevSecOps practices, vulnerability scanning, secrets management',
    tags: ['Vault', 'Trivy', 'RBAC'],
    color: '#dc2626',
    bg: 'rgba(220,38,38,0.08)',
  },
  {
    Icon: MonitorHeartIcon,
    title: 'Monitoring & Observability',
    desc: 'Prometheus, Grafana, ELK Stack — build reliable, observable systems',
    tags: ['Prometheus', 'Grafana', 'ELK'],
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
  },
]

// ── Why section data ──────────────────────────────────────────────────────────
const whyItems = [
  {
    Icon: TerminalIcon,
    title: 'Hands-on Labs',
    desc: 'Every course includes real-world exercises. No theoretical fluff — just commands that work in production.',
  },
  {
    Icon: BoltIcon,
    title: 'Always Up-to-date',
    desc: 'Content is kept current with the latest versions. AWS, K8s, Terraform — what you learn is what you use.',
  },
  {
    Icon: WorkspacePremiumIcon,
    title: 'Certificate of Completion',
    desc: 'Earn a verified certificate for every course you finish to prove your skills to employers.',
  },
]

// ── Nav links ─────────────────────────────────────────────────────────────────
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
        id="mobile-menu-btn"
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
export function HomePageClient({ isLoggedIn, stats }: Props) {
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
            {/* Logo */}
            <Box
              component={NextLink}
              href="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', flexGrow: { xs: 1, md: 0 } }}
            >
              <Box component="img" src="/vitaltech_logo.png" alt="Vital Tech LearnHub" sx={{ height: 36, width: 36 }} />
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.primary' }}
              >
                Vital Tech LearnHub
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ display: { xs: 'block', sm: 'none' }, color: 'text.primary' }}
              >
                VT LearnHub
              </Typography>
            </Box>

            {/* Desktop nav */}
            <Stack
              direction="row"
              spacing={3}
              sx={{ flexGrow: 1, ml: 4, display: { xs: 'none', md: 'flex' } }}
            >
              {navLinks.map(link => (
                <Typography
                  key={link.href}
                  component={NextLink}
                  href={link.href}
                  variant="body2"
                  fontWeight={500}
                  sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>

            {/* Auth buttons */}
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
            py: { xs: 10, md: 16 },
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #ede9fe 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right,rgba(100,116,139,.12) 1px,transparent 1px),linear-gradient(to bottom,rgba(100,116,139,.12) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
            },
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative' }}>
            <Box sx={{ mx: 'auto', maxWidth: 720, textAlign: 'center' }}>
              {/* Badge */}
              <Box
                sx={{
                  mb: 3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: 99,
                  border: '1px solid',
                  borderColor: 'primary.light',
                  bgcolor: 'rgba(37,99,235,0.06)',
                  color: 'primary.dark',
                }}
              >
                <TerminalIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight={600} letterSpacing={0.5}>
                  DevOps &amp; Cloud Engineering Courses
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  mb: 3,
                  fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Master{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  DevOps
                </Box>
                {' '}from the ground up
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 5, fontSize: { xs: '1rem', md: '1.2rem' }, maxWidth: 580, mx: 'auto' }}
              >
                Learn Linux, Docker, Kubernetes, AWS, CI/CD and more — taught by a working
                System &amp; DevOps Engineer. Build real skills for real-world infrastructure.
              </Typography>

              {/* Terminal preview */}
              <Paper
                elevation={8}
                sx={{
                  mx: 'auto',
                  mb: 5,
                  maxWidth: 520,
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#0d1117',
                  textAlign: 'left',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 2, py: 1.25, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
                  <Typography variant="caption" sx={{ ml: 1, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                    devops@vtmm ~
                  </Typography>
                </Box>
                <Box sx={{ p: 2, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  <Typography component="p" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'inherit', fontSize: 'inherit', mb: 0.75 }}>
                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.2)' }}>$</Box> kubectl get pods -n production
                  </Typography>
                  <Typography component="p" sx={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontSize: '0.72rem', mb: 0.5 }}>
                    NAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; READY &nbsp; STATUS &nbsp; RESTARTS
                  </Typography>
                  <Typography component="p" sx={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '0.72rem', mb: 0.25 }}>
                    api-7d4f9b8c4-xk2p9 &nbsp; 1/1 &nbsp;&nbsp;&nbsp; Running &nbsp; 0
                  </Typography>
                  <Typography component="p" sx={{ color: '#4ade80', fontFamily: 'monospace', fontSize: '0.72rem', mb: 0.75 }}>
                    web-6c8d7f9b4-mn3q8 &nbsp; 1/1 &nbsp;&nbsp;&nbsp; Running &nbsp; 0
                  </Typography>
                  <Typography component="p" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit', fontSize: 'inherit' }}>
                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.2)' }}>$</Box>{' '}
                    <Box component="span" sx={{ color: '#4ade80', animation: 'blink 1s step-end infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } } }}>▌</Box>
                  </Typography>
                </Box>
              </Paper>

              {/* CTA buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  id="hero-start-btn"
                  variant="contained"
                  size="large"
                  component={NextLink}
                  href="/auth/sign-up"
                  endIcon={<ChevronRightIcon />}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                >
                  Start Learning Free
                </Button>
                <Button
                  id="hero-browse-btn"
                  variant="outlined"
                  size="large"
                  component={NextLink}
                  href="/courses"
                  startIcon={<MenuBookIcon />}
                  sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
                >
                  Browse Courses
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        {/* ── Tech Stack Marquee ── */}
        <TechStackMarquee />

        {/* ── Stats ── */}
        <Box component="section" sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 6 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="center">
              {[
                { value: stats.users.toLocaleString(), label: 'Registered Members' },
                { value: stats.courses.toLocaleString(), label: 'Courses Available' },
                { value: stats.enrollments.toLocaleString(), label: 'Total Enrollments' },
                { value: '100%', label: 'Practical Content' },
              ].map(stat => (
                <Grid item xs={6} md={3} key={stat.label} sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    color="primary.main"
                    sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Learning Paths ── */}
        <Box component="section" sx={{ py: { xs: 10, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                label="LEARNING PATHS"
                size="small"
                sx={{ mb: 2, fontWeight: 700, letterSpacing: 1, bgcolor: 'primary.main', color: 'white' }}
              />
              <Typography variant="h2" gutterBottom>
                Build real DevOps skills
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
                Structured courses covering every layer of modern infrastructure —
                from the OS up to cloud-native deployments.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {learningPaths.map(path => (
                <Grid item xs={12} sm={6} lg={4} key={path.title}>
                  <Card
                    sx={{
                      height: '100%',
                      border: `1.5px solid ${path.color}22`,
                      background: path.bg,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 32px ${path.color}22`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${path.color}18`,
                          mb: 2,
                        }}
                      >
                        <path.Icon sx={{ color: path.color, fontSize: 26 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {path.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {path.desc}
                      </Typography>
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {path.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', borderColor: `${path.color}44`, color: path.color }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ── Why VT LearnHub ── */}
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
              <Typography variant="h2">Why learn with us?</Typography>
            </Box>
            <Grid container spacing={4}>
              {whyItems.map(item => (
                <Grid item xs={12} md={4} key={item.title}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(37,99,235,0.12)' },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          bgcolor: 'primary.main',
                          mb: 3,
                        }}
                      >
                        <item.Icon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h5" gutterBottom fontWeight={700}>
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

        {/* ── CTA ── */}
        <Box component="section" sx={{ py: { xs: 10, md: 14 } }}>
          <Container maxWidth="md">
            <Paper
              elevation={0}
              sx={{
                p: { xs: 5, md: 8 },
                textAlign: 'center',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, #ffffff 50%, rgba(124,58,237,0.06) 100%)',
              }}
            >
              <Typography variant="h2" gutterBottom>
                Ready to level up?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
                Join engineers learning Linux, containers, CI/CD and cloud infrastructure
                with Vital Tech LearnHub.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  id="cta-create-btn"
                  variant="contained"
                  size="large"
                  component={NextLink}
                  href="/auth/sign-up"
                  endIcon={<ChevronRightIcon />}
                  sx={{ px: 4 }}
                >
                  Create Free Account
                </Button>
                <Button
                  id="cta-explore-btn"
                  variant="outlined"
                  size="large"
                  component={NextLink}
                  href="/courses"
                  sx={{ px: 4 }}
                >
                  Explore Courses
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>

        {/* ── Footer ── */}
        <Box
          component="footer"
          sx={{ borderTop: '1px solid', borderColor: 'divider', py: 5, mt: 'auto' }}
        >
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
                  { href: '/auth/login', label: 'Sign In' },
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
                © {new Date().getFullYear()} Vital Tech Myanmar
              </Typography>
            </Stack>
          </Container>
        </Box>

      </Box>
    </MuiThemeProvider>
  )
}
