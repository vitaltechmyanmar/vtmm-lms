import { createClient } from '@/lib/supabase/server'
import { AboutPageClient } from '@/components/about-page-client'

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <AboutPageClient
      isLoggedIn={!!user}
      coursesCount={coursesCount ?? 0}
      usersCount={usersCount ?? 0}
    />
  )
}
