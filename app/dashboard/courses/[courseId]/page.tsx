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

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
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
    .eq('instructor_id', user.id)
    .single()

  if (error || !course) {
    notFound()
  }

  // Sort lessons by order_index
  const sortedLessons = course.lessons?.sort((a, b) => a.order_index - b.order_index) || []

  return <CourseEditor course={{ ...course, lessons: sortedLessons }} />
}
