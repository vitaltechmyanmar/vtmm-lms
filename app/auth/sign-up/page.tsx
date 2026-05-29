'use client'

import { useState } from 'react'
import NextLink from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { MuiThemeProvider } from '@/components/mui-theme-provider'

export const dynamic = 'force-dynamic'

// ── GitHub icon ───────────────────────────────────────────────────────────────
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

// ── GitHub OAuth button ───────────────────────────────────────────────────────
function GitHubButton() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  async function handleGitHubSignUp() {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  return (
    <Button
      id="github-signup-btn"
      type="button"
      variant="outlined"
      fullWidth
      onClick={handleGitHubSignUp}
      disabled={isLoading}
      startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <GitHubIcon />}
      sx={{
        py: 1.25,
        borderColor: '#d1d5db',
        color: 'text.primary',
        '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' },
      }}
    >
      Continue with GitHub
    </Button>
  )
}

// ── Sign-up page ──────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: 'student',
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    setIsSuccess(true)
    setIsLoading(false)
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <MuiThemeProvider>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #ede9fe 100%)',
            px: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(to right,rgba(100,116,139,.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(100,116,139,.08) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
            },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 460,
              width: '100%',
              p: { xs: 4, sm: 6 },
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(37,99,235,0.1)',
                mb: 3,
              }}
            >
              <MarkEmailReadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>

            <Typography variant="h4" fontWeight={800} gutterBottom>
              Check your email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
              {"We've sent a confirmation link to "}
              <Box component="strong" sx={{ color: 'text.primary' }}>{email}</Box>
              {". Please check your inbox and click the link to verify your account."}
            </Typography>

            <Alert
              severity="info"
              icon={<CheckCircleOutlineIcon />}
              sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}
            >
              After verifying, you can sign in and start your DevOps learning journey.
            </Alert>

            <Button
              component={NextLink}
              href="/auth/login"
              variant="contained"
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Go to Sign In
            </Button>
          </Paper>
        </Box>
      </MuiThemeProvider>
    )
  }

  // ── Sign-up form ──────────────────────────────────────────────────────────
  return (
    <MuiThemeProvider>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #ede9fe 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right,rgba(100,116,139,.08) 1px,transparent 1px),linear-gradient(to bottom,rgba(100,116,139,.08) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Left branding panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '45%',
            px: 8,
            py: 6,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box component={NextLink} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6, textDecoration: 'none' }}>
            <Box component="img" src="/vitaltech_logo.png" alt="Vital Tech LearnHub" sx={{ height: 44, width: 44 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              Vital Tech LearnHub
            </Typography>
          </Box>

          <Typography variant="h3" fontWeight={800} color="text.primary" sx={{ mb: 2, lineHeight: 1.2 }}>
            Start your{' '}
            <Box component="span" sx={{ background: 'linear-gradient(90deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              DevOps
            </Box>
            {' '}journey
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 380 }}>
            Join thousands of engineers learning Linux, Docker, Kubernetes, AWS, and CI/CD from a working DevOps engineer.
          </Typography>

          {[
            { text: 'Free to get started — no credit card required', emoji: '🆓' },
            { text: 'Hands-on labs with real production commands', emoji: '🔧' },
            { text: 'Earn verified certificates of completion', emoji: '🏆' },
            { text: 'Always up-to-date with latest tools', emoji: '⚡' },
          ].map(item => (
            <Box key={item.text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box sx={{ fontSize: '1.25rem', mt: 0.1 }}>{item.emoji}</Box>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>{item.text}</Typography>
            </Box>
          ))}
        </Box>

        {/* Right form panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 4 },
            py: 6,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 440,
              p: { xs: 3, sm: 5 },
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              bgcolor: 'white',
            }}
          >
            {/* Logo (mobile) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
              <Box component="img" src="/vitaltech_logo.png" alt="logo" sx={{ height: 40, width: 40 }} />
              <Typography variant="h6" fontWeight={700}>Vital Tech LearnHub</Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} gutterBottom>
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {'Already have an account? '}
              <Box component={NextLink} href="/auth/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Box>
            </Typography>

            {/* GitHub OAuth */}
            <GitHubButton />

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                or sign up with email
              </Typography>
            </Divider>

            {/* Email / Password form */}
            <Box component="form" onSubmit={handleSignUp} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                id="fullName"
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                disabled={isLoading}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                id="email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min. 6 chars)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                fullWidth
                inputProps={{ minLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(p => !p)} edge="end" tabIndex={-1}>
                        {showPassword
                          ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                          : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                id="signup-submit-btn"
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <PersonAddAltIcon />}
                sx={{ py: 1.5, mt: 0.5 }}
              >
                {isLoading ? 'Creating account…' : 'Create account'}
              </Button>

              <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </MuiThemeProvider>
  )
}
