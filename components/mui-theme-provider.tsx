'use client'

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { useMemo } from 'react'

// Matches the site's existing blue primary palette
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',   // blue-600
      light: '#3b82f6',  // blue-500
      dark: '#1d4ed8',   // blue-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',   // violet-600
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: [
      'var(--font-geist-sans)',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, lineHeight: 1.15 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    // Disable CssBaseline's global reset so Tailwind CSS still works on other pages
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'inherit',
          color: 'inherit',
        },
      },
    },
  },
})

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}
