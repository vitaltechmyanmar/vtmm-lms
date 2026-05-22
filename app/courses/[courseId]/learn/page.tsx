import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CourseLearningView } from '@/components/course-learning-view'

interface CourseLearnPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseLearnPage({ params }: CourseLearnPageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single()

  if (!enrollment) {
    redirect(`/courses/${courseId}`)
  }

  // Get course with lessons
  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(full_name, avatar_url),
      lessons(*)
    `)
    .eq('id', courseId)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get completed lessons
  const { data: completions } = await supabase
    .from('lesson_completions')
    .select('lesson_id, completed_at')
    .eq('user_id', user.id)
    .eq('course_id', courseId)

  const sortedLessons = course.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || []
  const completedLessonIds = (completions || []).map((c: any) => c.lesson_id)

  return (
    <CourseLearningView
      course={{ ...course, lessons: sortedLessons }}
      enrollment={enrollment}
      completedLessonIds={completedLessonIds}
      userId={user.id}
    />
  )
}
