import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'
import { MuiThemeProvider } from '@/components/mui-theme-provider'
import type { Profile } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <MuiThemeProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Fixed 256px sidebar (desktop only) */}
        <DashboardSidebar profile={profile as Profile} />

        {/* Main content area — offset by sidebar width on lg screens */}
        <div style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minWidth: 0,
          // On desktop: offset by sidebar (256px). On mobile: full width.
        }}>
          <style>{`
            @media (min-width: 1024px) {
              .dashboard-content { padding-left: 256px; }
            }
          `}</style>
          <div className="dashboard-content" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <DashboardHeader profile={profile as Profile} />
            <main style={{
              flex: 1,
              padding: '24px',
              paddingBottom: '88px',
            }}>
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <MobileBottomNav profile={profile as Profile} />
      </div>
    </MuiThemeProvider>
  )
}
