export type UserRole = 'student' | 'instructor' | 'admin'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  instructor_id: string
  category: string | null
  level: CourseLevel
  price_in_cents: number
  is_published: boolean
  what_you_will_learn: string[]
  requirements: string[]
  language: string
  tags: string[]
  created_at: string
  updated_at: string
  instructor?: Profile
  lessons?: Lesson[]
  enrollments_count?: number
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content: string | null
  video_url: string | null
  order_index: number
  duration_minutes: number
  created_at: string
  quiz?: Quiz
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  amount_in_cents: number
  currency: string
  status: PaymentStatus
  created_at: string
  completed_at: string | null
  course?: Course
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  payment_id: string | null
  enrolled_at: string
  completed_at: string | null
  progress_percentage: number
  course?: Course
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  completed: boolean
  completed_at: string | null
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  passing_score: number
  created_at: string
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: string
  order_index: number
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  passed: boolean
  answers: Record<string, string> | null
  attempted_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  issued_at: string
  certificate_number: string
  course?: Course
}

export interface Discussion {
  id: string
  course_id: string
  user_id: string
  title: string
  content: string
  created_at: string
  user?: Profile
  replies?: DiscussionReply[]
  replies_count?: number
}

export interface DiscussionReply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  created_at: string
  user?: Profile
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
  courses_count?: number
}

export interface UserCourseAssignment {
  id: string
  user_id: string
  course_id: string
  assigned_by: string | null
  assigned_at: string
  expires_at: string | null
  notes: string | null
  user?: Profile
  course?: Course
  assigned_by_user?: Profile
}
