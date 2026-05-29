import { createClient } from '@/lib/supabase/server'
import { getPublishedCoursesWithCounts } from '@/app/actions/db'
import { CoursesPageClient } from '@/components/courses-page-client'

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  const { data: courses } = await getPublishedCoursesWithCounts({
    category: params.category,
    level: params.level,
    q: params.q,
  })

  return (
    <CoursesPageClient
      courses={courses ?? null}
      categories={categories ?? null}
      params={params}
      isLoggedIn={!!user}
    />
  )
}
