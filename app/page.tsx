import { createClient } from '@/lib/supabase/server'
import { getEnrollmentStats } from '@/app/actions/db'
import { HomePageClient } from '@/components/home-page-client'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const stats = await getEnrollmentStats()

  return (
    <HomePageClient
      isLoggedIn={!!user}
      stats={{
        users: stats.users,
        courses: stats.courses,
        enrollments: stats.enrollments,
      }}
    />
  )
}
