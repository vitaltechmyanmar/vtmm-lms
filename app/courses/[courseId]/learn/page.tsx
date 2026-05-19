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
      instructor:profiles!instructor_id(full_name),
      lessons(*)
    `)
    .eq('id', courseId)
    .single()

  if (error || !course) {
    notFound()
  }

  // Get lesson progress
  const { data: lessonProgress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', courseId)

  const sortedLessons = course.lessons?.sort((a, b) => a.order_index - b.order_index) || []

  return (
    <CourseLearningView
      course={{ ...course, lessons: sortedLessons }}
      enrollment={enrollment}
      lessonProgress={lessonProgress || []}
      userId={user.id}
    />
  )
}
