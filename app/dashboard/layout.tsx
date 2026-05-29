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
        <DashboardSidebar profile={profile as Profile} />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', paddingLeft: 0 }} className="lg:pl-64">
          <DashboardHeader profile={profile as Profile} />
          <main style={{ flex: 1, padding: '24px', paddingBottom: '96px' }} className="lg:pb-6">
            {children}
          </main>
        </div>
        <MobileBottomNav profile={profile as Profile} />
      </div>
    </MuiThemeProvider>
  )
}
