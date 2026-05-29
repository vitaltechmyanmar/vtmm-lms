'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const initial = (profile.full_name?.charAt(0) || profile.email.charAt(0)).toUpperCase()

  async function handleSignOut() {
    setAnchorEl(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
      return
    }
    toast.success('Signed out successfully')
    router.push('/')
    router.refresh()
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 }, minHeight: '64px !important', gap: 1 }}>
        {/* Mobile menu icon (placeholder — sidebar handles its own toggle) */}
        <IconButton
          id="dashboard-mobile-menu-btn"
          size="small"
          sx={{ display: { lg: 'none' }, mr: 1, color: 'text.secondary' }}
          aria-label="Open sidebar"
        >
          <MenuIcon />
        </IconButton>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* User menu trigger */}
        <Box
          id="user-menu-btn"
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.main',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {initial}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2} color="text.primary">
              {profile.full_name || profile.email}
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1} sx={{ textTransform: 'capitalize' }}>
              {profile.role}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon
            sx={{
              fontSize: 16,
              color: 'text.secondary',
              transition: 'transform 0.2s',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
              display: { xs: 'none', sm: 'block' },
            }}
          />
        </Box>

        {/* Dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.25,
                  borderRadius: 1,
                  mx: 0.75,
                  my: 0.25,
                },
              },
            },
          }}
        >
          {/* Header */}
          <Box sx={{ px: 2.5, py: 1.5, pb: 1 }}>
            <Typography variant="body2" fontWeight={700}>{profile.full_name || 'User'}</Typography>
            <Typography variant="caption" color="text.secondary">{profile.email}</Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={() => { setAnchorEl(null); router.push('/dashboard/settings') }}
          >
            <ListItemIcon><PersonOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <Typography variant="body2">Profile Settings</Typography>
          </MenuItem>

          <MenuItem
            onClick={() => { setAnchorEl(null); router.push('/dashboard/settings') }}
          >
            <ListItemIcon><SettingsOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <Typography variant="body2">Preferences</Typography>
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem
            onClick={handleSignOut}
            sx={{ color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }}
          >
            <ListItemIcon><LogoutIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <Typography variant="body2" fontWeight={500}>Sign Out</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
