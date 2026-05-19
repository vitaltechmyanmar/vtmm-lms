import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'
import { InstructorDashboard } from '@/components/dashboard/instructor-dashboard'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  if (profile.role === 'admin') {
    return <AdminDashboard userId={user.id} />
  }

  if (profile.role === 'instructor') {
    return <InstructorDashboard userId={user.id} />
  }

  return <StudentDashboard userId={user.id} />
}
