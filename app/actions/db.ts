'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function getCourses(filters?: { isPublished?: boolean; instructorId?: string }) {
  const supabase = await createClient()
  let query = supabase.from('courses').select('*')

  if (filters?.isPublished !== undefined) {
    query = query.eq('is_published', filters.isPublished)
  }
  if (filters?.instructorId) {
    query = query.eq('instructor_id', filters.instructorId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  return { data, error }
}

export async function getCourseDetail(courseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      lessons (
        id,
        title,
        video_url,
        content,
        order_index,
        duration_minutes,
        quizzes (
          id,
          title,
          passing_score
        )
      )
    `)
    .eq('id', courseId)
    .single()
  return { data, error }
}

export async function getStudentEnrollments(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (
        id,
        title,
        thumbnail_url,
        description
      )
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false })
  return { data, error }
}

export async function getInstructorCourses(instructorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      _count:enrollments(count)
    `)
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createCourse(courseData: {
  title: string
  description: string
  instructorId: string
  category?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  priceInCents?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('courses').insert([courseData]).select().single()
  return { data, error }
}

export async function updateCourse(courseId: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single()
  return { data, error }
}

export async function createLesson(lessonData: {
  courseId: string
  title: string
  content?: string
  videoUrl?: string
  orderIndex: number
  durationMinutes?: number
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('lessons').insert([lessonData]).select().single()
  return { data, error }
}

export async function createEnrollment(enrollmentData: { userId: string; courseId: string; paymentId?: string }) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .insert([enrollmentData])
    .select()
    .single()
  return { data, error }
}

export async function markLessonComplete(userId: string, lessonId: string, courseId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert([{ user_id: userId, lesson_id: lessonId, course_id: courseId, completed: true, completed_at: new Date() }])
    .select()
    .single()
  return { data, error }
}

export async function getAllUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return { data, error }
}

export async function updateUserRole(userId: string, role: 'student' | 'instructor' | 'admin') {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function getEnrollmentStats() {
  const supabase = await createClient()
  const { data: enrollments, error: enrollError } = await supabase.from('enrollments').select('count')
  const { data: courses, error: courseError } = await supabase.from('courses').select('count')
  const { data: users, error: userError } = await supabase.from('profiles').select('count')

  return {
    enrollments: enrollments?.[0]?.count || 0,
    courses: courses?.[0]?.count || 0,
    users: users?.[0]?.count || 0,
    error: enrollError || courseError || userError,
  }
}
