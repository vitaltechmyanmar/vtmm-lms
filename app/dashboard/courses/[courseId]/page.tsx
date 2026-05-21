import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CourseEditor } from '@/components/dashboard/course-editor'

interface CourseEditPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'instructor' && profile.role !== 'admin')) {
    redirect('/dashboard')
  }

  // Admins can edit any course; instructors only their own
  let query = supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, email),
      lessons(
        id,
        title,
        content,
        video_url,
        order_index,
        duration_minutes,
        created_at
      )
    `)
    .eq('id', courseId)

  if (profile.role !== 'admin') {
    query = query.eq('instructor_id', user.id)
  }

  const { data: course, error } = await query.single()

  if (error || !course) {
    notFound()
  }

  const sortedLessons = course.lessons?.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index) || []

  return <CourseEditor course={{ ...course, lessons: sortedLessons }} isAdmin={profile.role === 'admin'} />
}
