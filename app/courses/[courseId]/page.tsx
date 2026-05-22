import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Users, Play, CheckCircle, Award } from 'lucide-react'
import { CourseEnrollButton } from '@/components/course-enroll-button'

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!instructor_id(id, full_name, avatar_url, bio),
      lessons(id, title, duration_minutes, order_index)
    `)
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (error || !course) {
    notFound()
  }

  // Check if user is enrolled
  let isEnrolled = false
  if (user) {
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
    isEnrolled = !!enrollment
  }

  const sortedLessons = course.lessons?.sort((a, b) => a.order_index - b.order_index) || []
  const totalDuration = sortedLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/vitaltech_logo.png" alt="Vital Tech LearnHub" className="h-9 w-9" />
            <span className="text-xl font-bold">Vital Tech LearnHub</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                  {course.level}
                </span>
                {course.category && (
                  <span className="text-sm text-muted-foreground capitalize">
                    {course.category}
                  </span>
                )}
              </div>
              <h1 className="mb-4 text-balance text-3xl font-bold md:text-4xl">
                {course.title}
              </h1>
              <p className="mb-6 text-pretty text-lg text-muted-foreground">
                {course.description}
              </p>
              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {sortedLessons.length} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {totalDuration} minutes
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Certificate included
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                  {course.instructor?.full_name?.charAt(0) || 'I'}
                </div>
                <div>
                  <p className="font-medium">{course.instructor?.full_name || 'Instructor'}</p>
                  <p className="text-sm text-muted-foreground">Course Instructor</p>
                </div>
              </div>
            </div>

            {/* Sidebar Card */}
            <Card className="h-fit lg:sticky lg:top-24">
              <div className="aspect-video bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="mb-4 text-3xl font-bold">
                  {course.price_in_cents === 0 ? (
                    'Free'
                  ) : (
                    `$${(course.price_in_cents / 100).toFixed(2)}`
                  )}
                </div>
                <CourseEnrollButton
                  courseId={course.id}
                  courseName={course.title}
                  priceInCents={course.price_in_cents}
                  isEnrolled={isEnrolled}
                  isLoggedIn={!!user}
                />
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Access on mobile and desktop</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {sortedLessons.length} lessons • {totalDuration} minutes total
                </p>
              </CardHeader>
              <CardContent>
                {sortedLessons.length > 0 ? (
                  <div className="space-y-2">
                    {sortedLessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 rounded-lg border p-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{lesson.title}</h4>
                          {lesson.duration_minutes > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {lesson.duration_minutes} min
                            </p>
                          )}
                        </div>
                        <Play className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No lessons available yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructor Info */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>About the Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-primary-foreground">
                  {course.instructor?.full_name?.charAt(0) || 'I'}
                </div>
                <div>
                  <h4 className="font-semibold">{course.instructor?.full_name || 'Instructor'}</h4>
                  <p className="text-sm text-muted-foreground">Course Creator</p>
                </div>
              </div>
              {course.instructor?.bio && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {course.instructor.bio}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
