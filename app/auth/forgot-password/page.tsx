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
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import SendIcon from '@mui/icons-material/Send'
import { MuiThemeProvider } from '@/components/mui-theme-provider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setIsLoading(false)
  }

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
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            bgcolor: 'white',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box component={NextLink} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
              <Box component="img" src="/vitaltech_logo.png" alt="logo" sx={{ height: 40, width: 40 }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">Vital Tech LearnHub</Typography>
            </Box>
          </Box>

          {sent ? (
            // ── Success state ───────────────────────────────────────────────
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  bgcolor: 'rgba(37,99,235,0.1)',
                  mb: 3,
                }}
              >
                <MarkEmailReadIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Check your email
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {'We sent a password reset link to '}
                <Box component="strong" sx={{ color: 'text.primary' }}>{email}</Box>
                {'. Check your email and follow the instructions.'}
              </Typography>
              <Alert severity="info" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
                Didn't receive the email? Check your spam folder or try again.
              </Alert>
              <Button
                component={NextLink}
                href="/auth/login"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ArrowBackIcon />}
                sx={{ py: 1.5 }}
              >
                Back to Sign In
              </Button>
            </Box>
          ) : (
            // ── Form state ──────────────────────────────────────────────────
            <>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Reset password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                {"Enter your email and we'll send you a link to reset your password."}
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  endIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? 'Sending…' : 'Send Reset Link'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    component={NextLink}
                    href="/auth/login"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    <ArrowBackIcon sx={{ fontSize: 14 }} />
                    Back to Sign In
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </MuiThemeProvider>
  )
}
