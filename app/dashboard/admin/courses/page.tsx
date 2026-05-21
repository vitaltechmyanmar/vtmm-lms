import { createClient } from '@/lib/supabase/server'
import { AdminCoursesClient } from '@/components/dashboard/admin-courses-client'

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, email),
      enrollments(count),
      lessons(count)
    `)
    .order('created_at', { ascending: false })

  return <AdminCoursesClient initialCourses={courses || []} />
}
