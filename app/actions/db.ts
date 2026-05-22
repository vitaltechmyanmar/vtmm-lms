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
  // Fix: Map camelCase params to snake_case DB column names
  const dbData = {
    title: courseData.title,
    description: courseData.description,
    instructor_id: courseData.instructorId,
    category: courseData.category,
    level: courseData.level ?? 'beginner',
    price_in_cents: courseData.priceInCents ?? 0,
  }
  const { data, error } = await supabase.from('courses').insert([dbData]).select().single()
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
  // Fix: Map camelCase params to snake_case DB column names
  const dbData = {
    course_id: lessonData.courseId,
    title: lessonData.title,
    content: lessonData.content ?? null,
    video_url: lessonData.videoUrl ?? null,
    order_index: lessonData.orderIndex,
    duration_minutes: lessonData.durationMinutes ?? 0,
  }
  const { data, error } = await supabase.from('lessons').insert([dbData]).select().single()
  return { data, error }
}

export async function createEnrollment(enrollmentData: { userId: string; courseId: string; paymentId?: string }) {
  const supabase = await createClient()
  // Fix: Map camelCase params to snake_case DB column names
  const dbData = {
    user_id: enrollmentData.userId,
    course_id: enrollmentData.courseId,
    payment_id: enrollmentData.paymentId ?? null,
  }
  const { data, error } = await supabase
    .from('enrollments')
    .insert([dbData])
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
  
  // Verify the current user is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }
  
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (currentProfile?.role !== 'admin') {
    return { data: null, error: { message: 'Only administrators can change user roles' } }
  }
  
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
  // Fix: Use correct Supabase count syntax with { count: 'exact', head: true }
  const { count: enrollmentsCount, error: enrollError } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
  const { count: coursesCount, error: courseError } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
  const { count: usersCount, error: userError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  const { count: instructorsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'instructor')

  return {
    enrollments: enrollmentsCount ?? 0,
    courses: coursesCount ?? 0,
    users: usersCount ?? 0,
    instructors: instructorsCount ?? 0,
    error: enrollError || courseError || userError,
  }
}

// Uses SECURITY DEFINER DB function to bypass RLS — safe for public display
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .rpc('get_course_enrollment_count', { course_uuid: courseId })
  if (error) return 0
  return data ?? 0
}

// Returns courses with accurate enrollment count regardless of auth state
export async function getPublishedCoursesWithCounts(filters?: {
  category?: string
  level?: string
  q?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(full_name, avatar_url),
      lessons(count)
    `)
    .eq('is_published', true)

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.level) query = query.eq('level', filters.level)
  if (filters?.q) {
    query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`)
  }

  const { data: courses, error } = await query.order('created_at', { ascending: false })
  if (error || !courses) return { data: [], error }

  // Fetch enrollment counts via security definer function
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      const { data: count } = await supabase
        .rpc('get_course_enrollment_count', { course_uuid: course.id })
      return { ...course, enrollment_count: count ?? 0 }
    })
  )

  return { data: coursesWithCounts, error: null }
}
